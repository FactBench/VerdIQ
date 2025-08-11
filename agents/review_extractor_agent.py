#!/usr/bin/env python3
"""
Review Extractor Agent for FactBench
Extracts all product reviews, ratings, and links to original reviews
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

from playwright.async_api import async_playwright
from base_agent import BaseAgent


class ReviewExtractorAgent(BaseAgent):
    """Agent responsible for extracting product reviews and ratings"""
    
    def __init__(self):
        super().__init__("ReviewExtractorAgent")
        self.reviews_dir = self.workspace_dir / "reviews"
        self.reviews_dir.mkdir(exist_ok=True)
        self.reviews_data = {
            "extraction_date": self.timestamp,
            "products": {},
            "total_reviews": 0,
            "review_sources": [],
            "external_review_links": []
        }
    
    async def extract_with_playwright(self, source_url: str) -> Dict[str, Any]:
        """Extract reviews using Playwright"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Navigate to page
                self.logger.info(f"Navigating to {source_url}")
                await page.goto(source_url, wait_until="networkidle")
                await page.wait_for_timeout(3000)
                
                # Extract inline reviews
                inline_reviews = await self.extract_inline_reviews(page)
                
                # Extract review links
                review_links = await self.extract_review_links(page)
                
                # Follow review links to get detailed reviews
                for link_data in review_links[:5]:  # Limit to prevent too many requests
                    try:
                        detailed_reviews = await self.extract_external_reviews(page, link_data)
                        self.merge_reviews(inline_reviews, detailed_reviews)
                    except Exception as e:
                        self.logger.error(f"Failed to extract from {link_data['url']}: {str(e)}")
                
                # Process all reviews
                self.process_all_reviews(inline_reviews)
                
                return self.reviews_data
                
            finally:
                await browser.close()
    
    async def extract_inline_reviews(self, page) -> Dict[str, Any]:
        """Extract reviews embedded in the page"""
        self.logger.info("Extracting inline reviews")
        
        reviews = await page.evaluate("""
            () => {
                const productReviews = {};
                
                // Find all product sections
                const productSections = document.querySelectorAll(
                    '[data-product-id], .product-card, .product-review, ' +
                    'article[id*="product"], section[class*="product"]'
                );
                
                productSections.forEach(section => {
                    const productId = section.getAttribute('data-product-id') || 
                                    section.getAttribute('id') || 
                                    section.querySelector('h2, h3')?.textContent?.toLowerCase().replace(/\\s+/g, '-');
                    
                    if (!productId) return;
                    
                    const reviews = {
                        productId: productId,
                        productName: section.querySelector('h2, h3, .product-name')?.textContent?.trim() || '',
                        overallRating: '',
                        totalReviews: '',
                        ratingBreakdown: {},
                        reviews: [],
                        expertReview: null,
                        userReviews: []
                    };
                    
                    // Extract overall rating
                    const ratingElement = section.querySelector('.rating, .stars, [class*="rating"]');
                    if (ratingElement) {
                        reviews.overallRating = ratingElement.textContent.trim();
                        
                        // Try to extract numeric rating
                        const ratingMatch = reviews.overallRating.match(/([0-9.]+)\\s*(?:out of|\\/)\\s*([0-9.]+)/);
                        if (ratingMatch) {
                            reviews.numericRating = parseFloat(ratingMatch[1]);
                            reviews.maxRating = parseFloat(ratingMatch[2]);
                        } else {
                            const simpleRating = reviews.overallRating.match(/[0-9.]+/);
                            if (simpleRating) {
                                reviews.numericRating = parseFloat(simpleRating[0]);
                            }
                        }
                    }
                    
                    // Extract total reviews count
                    const reviewCountElement = section.querySelector('[class*="review-count"], [class*="rating-count"]');
                    if (reviewCountElement) {
                        reviews.totalReviews = reviewCountElement.textContent.trim();
                    } else {
                        // Try to find in text
                        const countMatch = section.textContent.match(/(\\d{1,3}(?:,\\d{3})*)\\+?\\s*(?:reviews?|ratings?)/i);
                        if (countMatch) {
                            reviews.totalReviews = countMatch[1] + "+";
                        }
                    }
                    
                    // Extract expert review content
                    const expertReview = section.querySelector('.expert-review, .editorial-review, .our-review');
                    if (expertReview) {
                        reviews.expertReview = {
                            content: expertReview.textContent.trim(),
                            pros: [],
                            cons: [],
                            verdict: ''
                        };
                        
                        // Extract pros
                        const prosSection = expertReview.querySelector('.pros, [class*="pros"], [class*="advantages"]');
                        if (prosSection) {
                            prosSection.querySelectorAll('li, .item').forEach(item => {
                                reviews.expertReview.pros.push(item.textContent.trim());
                            });
                        }
                        
                        // Extract cons
                        const consSection = expertReview.querySelector('.cons, [class*="cons"], [class*="disadvantages"]');
                        if (consSection) {
                            consSection.querySelectorAll('li, .item').forEach(item => {
                                reviews.expertReview.cons.push(item.textContent.trim());
                            });
                        }
                        
                        // Extract verdict
                        const verdict = expertReview.querySelector('.verdict, .conclusion, [class*="verdict"]');
                        if (verdict) {
                            reviews.expertReview.verdict = verdict.textContent.trim();
                        }
                    }
                    
                    // Extract user reviews if present
                    const userReviewsSection = section.querySelector('.user-reviews, .customer-reviews, [class*="reviews"]');
                    if (userReviewsSection) {
                        const reviewElements = userReviewsSection.querySelectorAll('.review, .review-item, [class*="review-card"]');
                        
                        reviewElements.forEach(reviewEl => {
                            const userReview = {
                                rating: reviewEl.querySelector('.rating, .stars')?.textContent?.trim() || '',
                                author: reviewEl.querySelector('.author, .reviewer, [class*="name"]')?.textContent?.trim() || '',
                                date: reviewEl.querySelector('.date, time, [class*="date"]')?.textContent?.trim() || '',
                                title: reviewEl.querySelector('.title, h4, h5')?.textContent?.trim() || '',
                                content: reviewEl.querySelector('.content, .text, p')?.textContent?.trim() || '',
                                verified: reviewEl.querySelector('.verified, [class*="verified"]') !== null,
                                helpful: reviewEl.querySelector('.helpful, [class*="helpful"]')?.textContent?.trim() || ''
                            };
                            
                            if (userReview.content || userReview.title) {
                                reviews.userReviews.push(userReview);
                            }
                        });
                    }
                    
                    // Extract review summary or highlights
                    const highlights = section.querySelectorAll('.review-highlight, .key-point, [class*="highlight"]');
                    reviews.highlights = Array.from(highlights).map(h => h.textContent.trim());
                    
                    // Extract "What customers say" section
                    const customerSays = section.querySelector('[class*="customer-say"], [class*="user-feedback"]');
                    if (customerSays) {
                        reviews.customerFeedback = customerSays.textContent.trim();
                    }
                    
                    productReviews[productId] = reviews;
                });
                
                return productReviews;
            }
        """)
        
        return reviews
    
    async def extract_review_links(self, page) -> List[Dict]:
        """Extract links to external review pages"""
        self.logger.info("Extracting review links")
        
        review_links = await page.evaluate("""
            () => {
                const links = [];
                
                // Find all review-related links
                const reviewLinkSelectors = [
                    'a[href*="review"]',
                    'a[href*="rating"]',
                    'a:has-text("Read Review")',
                    'a:has-text("See Reviews")',
                    'a:has-text("Customer Reviews")',
                    'a:has-text("Read More")',
                    '.review-link',
                    '[class*="review-link"]'
                ];
                
                const foundLinks = new Set();
                
                reviewLinkSelectors.forEach(selector => {
                    try {
                        document.querySelectorAll(selector).forEach(link => {
                            const href = link.href;
                            if (href && !foundLinks.has(href)) {
                                foundLinks.add(href);
                                
                                // Try to associate with product
                                const productSection = link.closest('[data-product-id], .product-card, article[id*="product"]');
                                let productId = '';
                                if (productSection) {
                                    productId = productSection.getAttribute('data-product-id') || 
                                               productSection.getAttribute('id') || '';
                                }
                                
                                links.push({
                                    url: href,
                                    text: link.textContent.trim(),
                                    productId: productId,
                                    isExternal: !href.includes(window.location.hostname)
                                });
                            }
                        });
                    } catch (e) {
                        console.error('Error with selector:', selector, e);
                    }
                });
                
                // Also look for review platform links (Amazon, etc.)
                const platformLinks = document.querySelectorAll('a[href*="amazon.com"], a[href*="walmart.com"]');
                platformLinks.forEach(link => {
                    if (!foundLinks.has(link.href)) {
                        links.push({
                            url: link.href,
                            text: link.textContent.trim(),
                            platform: 'external',
                            isExternal: true
                        });
                    }
                });
                
                return links;
            }
        """)
        
        self.reviews_data["external_review_links"] = review_links
        return review_links
    
    async def extract_external_reviews(self, page, link_data: Dict) -> Dict[str, Any]:
        """Extract reviews from external review page"""
        if not link_data.get('isExternal', True):
            try:
                self.logger.info(f"Following review link: {link_data['url']}")
                
                # Create new page for external link
                new_page = await page.context.new_page()
                await new_page.goto(link_data['url'], wait_until="networkidle", timeout=30000)
                await new_page.wait_for_timeout(2000)
                
                # Extract reviews from external page
                external_reviews = await new_page.evaluate("""
                    () => {
                        const reviews = {
                            url: window.location.href,
                            title: document.title,
                            reviews: []
                        };
                        
                        // Common review selectors
                        const reviewSelectors = [
                            '.review',
                            '[class*="review-card"]',
                            '[class*="customer-review"]',
                            '.comment',
                            'article[class*="review"]'
                        ];
                        
                        reviewSelectors.forEach(selector => {
                            document.querySelectorAll(selector).forEach(review => {
                                const reviewData = {
                                    rating: review.querySelector('.rating, .stars, [class*="star"]')?.textContent?.trim() || '',
                                    author: review.querySelector('.author, .reviewer, [class*="name"]')?.textContent?.trim() || '',
                                    date: review.querySelector('.date, time')?.textContent?.trim() || '',
                                    title: review.querySelector('h3, h4, .title')?.textContent?.trim() || '',
                                    content: review.querySelector('.content, .text, .body, p')?.textContent?.trim() || '',
                                    verified: review.textContent.includes('Verified') || review.querySelector('.verified') !== null
                                };
                                
                                if (reviewData.content) {
                                    reviews.reviews.push(reviewData);
                                }
                            });
                        });
                        
                        return reviews;
                    }
                """)
                
                await new_page.close()
                return external_reviews
                
            except Exception as e:
                self.logger.error(f"Failed to extract external reviews: {str(e)}")
                return {}
        
        return {}
    
    def merge_reviews(self, inline_reviews: Dict, external_reviews: Dict):
        """Merge external reviews with inline reviews"""
        if not external_reviews or not external_reviews.get('reviews'):
            return
        
        # Try to match with products
        for product_id, product_reviews in inline_reviews.items():
            # Simple matching - could be improved
            product_name_lower = product_reviews['productName'].lower()
            
            for review in external_reviews['reviews']:
                # Check if review mentions product
                if product_name_lower in review.get('content', '').lower():
                    product_reviews['userReviews'].append({
                        **review,
                        'source': external_reviews['url']
                    })
    
    def process_all_reviews(self, reviews_by_product: Dict):
        """Process and structure all reviews"""
        for product_id, reviews in reviews_by_product.items():
            self.logger.info(f"Processing reviews for product: {product_id}")
            
            # Clean up product ID
            clean_id = re.sub(r'[^a-z0-9-]', '-', product_id.lower())
            
            # Structure product reviews
            product_review_data = {
                "product_id": clean_id,
                "product_name": reviews['productName'],
                "summary": {
                    "overall_rating": reviews.get('numericRating', 0),
                    "total_reviews": reviews['totalReviews'],
                    "rating_text": reviews['overallRating']
                },
                "expert_review": reviews['expertReview'],
                "user_reviews": reviews['userReviews'],
                "highlights": reviews.get('highlights', []),
                "review_links": []
            }
            
            # Add review links for this product
            for link in self.reviews_data["external_review_links"]:
                if link.get('productId') == product_id:
                    product_review_data["review_links"].append({
                        "url": link['url'],
                        "text": link['text'],
                        "type": "external" if link.get('isExternal') else "internal"
                    })
            
            # Calculate review statistics
            if reviews['userReviews']:
                product_review_data["statistics"] = self.calculate_review_stats(reviews['userReviews'])
            
            # Save product reviews
            self.reviews_data["products"][clean_id] = product_review_data
            self.reviews_data["total_reviews"] += len(reviews['userReviews'])
            
            # Save individual product review file
            self.save_json(
                product_review_data, 
                f"reviews_{clean_id}.json", 
                "reviews"
            )
            
            self.update_metrics(True)
    
    def calculate_review_stats(self, user_reviews: List[Dict]) -> Dict:
        """Calculate review statistics"""
        stats = {
            "total_count": len(user_reviews),
            "average_rating": 0,
            "rating_distribution": {
                "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
            },
            "verified_count": 0,
            "review_dates": []
        }
        
        total_rating = 0
        rating_count = 0
        
        for review in user_reviews:
            # Count verified reviews
            if review.get('verified'):
                stats['verified_count'] += 1
            
            # Extract numeric rating
            rating_text = review.get('rating', '')
            rating_match = re.search(r'([0-9.]+)', rating_text)
            if rating_match:
                rating = float(rating_match.group(1))
                total_rating += rating
                rating_count += 1
                
                # Update distribution
                rating_key = str(int(rating))
                if rating_key in stats['rating_distribution']:
                    stats['rating_distribution'][rating_key] += 1
            
            # Collect dates
            if review.get('date'):
                stats['review_dates'].append(review['date'])
        
        # Calculate average
        if rating_count > 0:
            stats['average_rating'] = round(total_rating / rating_count, 2)
        
        return stats
    
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main extraction method"""
        # Run async extraction
        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self.extract_with_playwright(source_url))
        
        # Save complete reviews data
        self.save_json(self.reviews_data, "all_reviews_data.json", "reviews")
        
        # Create review summary
        self.create_review_summary()
        
        # Create review links catalog
        self.create_links_catalog()
        
        return results
    
    def create_review_summary(self):
        """Create a summary of all reviews"""
        summary = {
            "extraction_date": self.timestamp,
            "total_products_with_reviews": len(self.reviews_data["products"]),
            "total_reviews_extracted": self.reviews_data["total_reviews"],
            "products": []
        }
        
        for product_id, product_data in self.reviews_data["products"].items():
            summary["products"].append({
                "id": product_id,
                "name": product_data["product_name"],
                "rating": product_data["summary"]["overall_rating"],
                "total_reviews": product_data["summary"]["total_reviews"],
                "has_expert_review": product_data["expert_review"] is not None,
                "user_review_count": len(product_data["user_reviews"]),
                "review_links_count": len(product_data["review_links"])
            })
        
        self.save_json(summary, "review_summary.json", "reviews")
    
    def create_links_catalog(self):
        """Create a catalog of all review links"""
        links_catalog = {
            "internal_links": [],
            "external_links": [],
            "by_product": {}
        }
        
        for link in self.reviews_data["external_review_links"]:
            if link.get('isExternal'):
                links_catalog["external_links"].append(link)
            else:
                links_catalog["internal_links"].append(link)
            
            # Organize by product
            product_id = link.get('productId', 'unknown')
            if product_id not in links_catalog["by_product"]:
                links_catalog["by_product"][product_id] = []
            links_catalog["by_product"][product_id].append(link)
        
        self.save_json(links_catalog, "review_links_catalog.json", "reviews")
    
    def validate_results(self) -> Dict[str, Any]:
        """Validate extracted reviews"""
        validation = {
            "total_products": len(self.reviews_data["products"]),
            "products_with_reviews": 0,
            "products_without_reviews": [],
            "products_without_ratings": [],
            "total_user_reviews": self.reviews_data["total_reviews"],
            "total_review_links": len(self.reviews_data["external_review_links"]),
            "validation_passed": True
        }
        
        # Check each product
        for product_id, product_data in self.reviews_data["products"].items():
            has_reviews = len(product_data["user_reviews"]) > 0 or product_data["expert_review"] is not None
            
            if has_reviews:
                validation["products_with_reviews"] += 1
            else:
                validation["products_without_reviews"].append(product_id)
                validation["validation_passed"] = False
            
            # Check for ratings
            if not product_data["summary"]["overall_rating"]:
                validation["products_without_ratings"].append(product_id)
        
        # Calculate coverage
        if validation["total_products"] > 0:
            validation["review_coverage"] = (
                validation["products_with_reviews"] / validation["total_products"]
            ) * 100
        
        # Check minimum requirements
        if validation["products_with_reviews"] < 5:
            validation["validation_passed"] = False
            validation["error"] = "Less than 5 products have reviews"
        
        # Log validation results
        self.logger.info(f"Review Validation Results:")
        self.logger.info(f"  - Total products: {validation['total_products']}")
        self.logger.info(f"  - Products with reviews: {validation['products_with_reviews']}")
        self.logger.info(f"  - Total user reviews: {validation['total_user_reviews']}")
        self.logger.info(f"  - Review coverage: {validation.get('review_coverage', 0):.1f}%")
        
        # Save validation report
        self.save_json(validation, f"review_validation_{self.timestamp}.json", "validation")
        
        return validation


if __name__ == "__main__":
    # Test the agent
    agent = ReviewExtractorAgent()
    
    # Replace with actual source URL
    source_url = "https://zoopy.com/best-robotic-pool-cleaners"
    
    results = agent.run(source_url)
    print(json.dumps(results, indent=2))