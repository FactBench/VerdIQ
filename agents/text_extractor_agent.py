#!/usr/bin/env python3
"""
Text Extractor Agent for FactBench
Extracts all text content including descriptions, features, and specifications
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from bs4 import BeautifulSoup
import re

from playwright.async_api import async_playwright
from base_agent import BaseAgent


class TextExtractorAgent(BaseAgent):
    """Agent responsible for extracting all text content"""
    
    def __init__(self):
        super().__init__("TextExtractorAgent")
        self.text_dir = self.workspace_dir / "text"
        self.text_dir.mkdir(exist_ok=True)
        self.content = {
            "extraction_date": self.timestamp,
            "page_metadata": {},
            "products": {},
            "sections": {},
            "raw_content": ""
        }
    
    async def extract_with_playwright(self, source_url: str) -> Dict[str, Any]:
        """Extract text content using Playwright"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Navigate to page
                self.logger.info(f"Navigating to {source_url}")
                await page.goto(source_url, wait_until="networkidle")
                await page.wait_for_timeout(3000)
                
                # Extract page metadata
                self.content["page_metadata"] = await self.extract_page_metadata(page)
                
                # Extract structured content
                self.content["sections"] = await self.extract_page_sections(page)
                
                # Extract product-specific content
                self.content["products"] = await self.extract_product_content(page)
                
                # Get raw page content for backup
                self.content["raw_content"] = await page.content()
                
                return self.content
                
            finally:
                await browser.close()
    
    async def extract_page_metadata(self, page) -> Dict[str, Any]:
        """Extract page metadata"""
        self.logger.info("Extracting page metadata")
        
        metadata = await page.evaluate("""
            () => {
                return {
                    title: document.title,
                    description: document.querySelector('meta[name="description"]')?.content || '',
                    keywords: document.querySelector('meta[name="keywords"]')?.content || '',
                    ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
                    ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
                    h1: document.querySelector('h1')?.textContent?.trim() || '',
                    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
                    breadcrumbs: Array.from(document.querySelectorAll('.breadcrumb, [itemtype*="BreadcrumbList"] [itemprop="name"]'))
                        .map(el => el.textContent.trim()),
                    lastUpdated: document.querySelector('[class*="updated"], [class*="modified"], time')?.textContent || ''
                };
            }
        """)
        
        return metadata
    
    async def extract_page_sections(self, page) -> Dict[str, Any]:
        """Extract main content sections"""
        self.logger.info("Extracting page sections")
        
        sections = await page.evaluate("""
            () => {
                const sections = {};
                
                // Extract hero/intro section
                const hero = document.querySelector('.hero, .intro, [class*="banner"], header + section');
                if (hero) {
                    sections.hero = {
                        heading: hero.querySelector('h1, h2')?.textContent?.trim() || '',
                        subheading: hero.querySelector('h2, h3, p')?.textContent?.trim() || '',
                        content: hero.textContent.trim()
                    };
                }
                
                // Extract introduction
                const intro = document.querySelector('.introduction, .intro-text, #introduction');
                if (intro) {
                    sections.introduction = intro.textContent.trim();
                }
                
                // Extract methodology section
                const methodology = document.querySelector('[class*="methodology"], [id*="methodology"], [class*="how-we-test"]');
                if (methodology) {
                    sections.methodology = methodology.textContent.trim();
                }
                
                // Extract FAQ section
                const faq = document.querySelector('.faq, #faq, [class*="questions"]');
                if (faq) {
                    const faqs = [];
                    faq.querySelectorAll('[class*="question"], dt').forEach(q => {
                        const answer = q.nextElementSibling;
                        if (answer) {
                            faqs.push({
                                question: q.textContent.trim(),
                                answer: answer.textContent.trim()
                            });
                        }
                    });
                    sections.faq = faqs;
                }
                
                // Extract buying guide
                const guide = document.querySelector('[class*="buying-guide"], [class*="guide"], #guide');
                if (guide) {
                    sections.buyingGuide = guide.textContent.trim();
                }
                
                // Extract conclusion
                const conclusion = document.querySelector('.conclusion, #conclusion, [class*="final-thoughts"]');
                if (conclusion) {
                    sections.conclusion = conclusion.textContent.trim();
                }
                
                return sections;
            }
        """)
        
        return sections
    
    async def extract_product_content(self, page) -> Dict[str, Any]:
        """Extract detailed content for each product"""
        self.logger.info("Extracting product content")
        
        products = await page.evaluate("""
            () => {
                const products = {};
                
                // Find all product sections
                const productElements = document.querySelectorAll(
                    '[data-product-id], .product-card, .product-review, ' +
                    'article[id*="product"], section[class*="product"], ' +
                    '[class*="cleaner-review"]'
                );
                
                productElements.forEach((element, index) => {
                    // Extract product ID
                    const productId = element.getAttribute('data-product-id') || 
                                    element.getAttribute('id') || 
                                    element.querySelector('h2, h3')?.textContent?.toLowerCase().replace(/\\s+/g, '-') ||
                                    `product-${index}`;
                    
                    // Extract all text content
                    const productData = {
                        id: productId,
                        name: element.querySelector('h2, h3, .product-name')?.textContent?.trim() || '',
                        badge: element.querySelector('.badge, .award, [class*="badge"]')?.textContent?.trim() || '',
                        rating: element.querySelector('[class*="rating"], .stars')?.textContent?.trim() || '',
                        price: element.querySelector('.price, [class*="price"]')?.textContent?.trim() || '',
                        
                        // Main description
                        description: (() => {
                            const desc = element.querySelector('.description, .content, p');
                            return desc ? desc.textContent.trim() : '';
                        })(),
                        
                        // Tagline or summary
                        tagline: element.querySelector('.tagline, .summary, .subtitle')?.textContent?.trim() || '',
                        
                        // Features and specifications
                        features: {
                            pros: [],
                            cons: [],
                            highlights: []
                        },
                        
                        specifications: {},
                        
                        // Full text content
                        fullContent: element.textContent.trim(),
                        
                        // Structured data
                        structuredData: {}
                    };
                    
                    // Extract pros
                    const prosContainer = element.querySelector('.pros, [class*="pros"], [class*="advantages"]');
                    if (prosContainer) {
                        prosContainer.querySelectorAll('li, .item').forEach(item => {
                            productData.features.pros.push(item.textContent.trim());
                        });
                    }
                    
                    // Extract cons
                    const consContainer = element.querySelector('.cons, [class*="cons"], [class*="disadvantages"]');
                    if (consContainer) {
                        consContainer.querySelectorAll('li, .item').forEach(item => {
                            productData.features.cons.push(item.textContent.trim());
                        });
                    }
                    
                    // Extract highlights
                    element.querySelectorAll('.highlight, .feature, [class*="feature-item"]').forEach(item => {
                        productData.features.highlights.push(item.textContent.trim());
                    });
                    
                    // Extract specifications
                    const specTable = element.querySelector('table, .specs, [class*="specification"]');
                    if (specTable) {
                        specTable.querySelectorAll('tr, .spec-item').forEach(row => {
                            const cells = row.querySelectorAll('td, .spec-name, .spec-value');
                            if (cells.length >= 2) {
                                const key = cells[0].textContent.trim();
                                const value = cells[1].textContent.trim();
                                productData.specifications[key] = value;
                            }
                        });
                    }
                    
                    // Extract "What We Like" sections
                    const likeSection = element.querySelector('[class*="what-we-like"], [class*="why-we-like"]');
                    if (likeSection) {
                        productData.whatWeLike = likeSection.textContent.trim();
                    }
                    
                    // Extract detailed review content
                    const reviewContent = element.querySelector('.review-content, .detailed-review, .full-review');
                    if (reviewContent) {
                        productData.detailedReview = reviewContent.textContent.trim();
                    }
                    
                    // Check for structured data
                    const jsonLd = element.querySelector('script[type="application/ld+json"]');
                    if (jsonLd) {
                        try {
                            productData.structuredData = JSON.parse(jsonLd.textContent);
                        } catch (e) {
                            console.error('Failed to parse structured data:', e);
                        }
                    }
                    
                    products[productId] = productData;
                    
                    // Update metrics
                    this.updateMetrics(true);
                });
                
                return products;
            }
        """)
        
        # Post-process products
        for product_id, product_data in products.items():
            # Clean up empty fields
            if not product_data['features']['pros']:
                del product_data['features']['pros']
            if not product_data['features']['cons']:
                del product_data['features']['cons']
            if not product_data['specifications']:
                del product_data['specifications']
            
            # Extract additional details from full content if needed
            self.extract_additional_details(product_data)
        
        return products
    
    def extract_additional_details(self, product_data: Dict):
        """Extract additional details from full content using regex"""
        full_content = product_data.get('fullContent', '')
        
        # Extract user ratings count
        ratings_match = re.search(r'(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\+?\s*(?:user\s*)?(?:ratings?|reviews?)', 
                                 full_content, re.IGNORECASE)
        if ratings_match:
            product_data['userRatings'] = ratings_match.group(1) + "+"
        
        # Extract price if not already found
        if not product_data.get('price'):
            price_match = re.search(r'\$\d+(?:,\d{3})*(?:\.\d{2})?', full_content)
            if price_match:
                product_data['price'] = price_match.group(0)
        
        # Extract warranty information
        warranty_match = re.search(r'(\d+)\s*(?:year|yr)s?\s*warranty', full_content, re.IGNORECASE)
        if warranty_match:
            product_data['warranty'] = warranty_match.group(0)
        
        # Extract pool size compatibility
        pool_size_match = re.search(r'(?:up\s*to\s*)?(\d+)\s*(?:ft|feet|foot)', full_content, re.IGNORECASE)
        if pool_size_match:
            product_data['poolSizeCompatibility'] = f"Up to {pool_size_match.group(1)}ft"
    
    def save_structured_content(self):
        """Save content in multiple formats for easy access"""
        # Save complete content
        self.save_json(self.content, "complete_text_content.json", "text")
        
        # Save product descriptions separately
        product_descriptions = {}
        for product_id, product_data in self.content["products"].items():
            product_descriptions[product_id] = {
                "name": product_data.get("name", ""),
                "tagline": product_data.get("tagline", ""),
                "description": product_data.get("description", ""),
                "badge": product_data.get("badge", ""),
                "whatWeLike": product_data.get("whatWeLike", "")
            }
        self.save_json(product_descriptions, "product_descriptions.json", "text")
        
        # Save features separately
        product_features = {}
        for product_id, product_data in self.content["products"].items():
            if "features" in product_data:
                product_features[product_id] = product_data["features"]
        self.save_json(product_features, "product_features.json", "text")
        
        # Save page content
        self.save_json(self.content["sections"], "page_sections.json", "text")
        
        # Save raw HTML as backup
        raw_html_path = self.text_dir / "raw_page_content.html"
        with open(raw_html_path, 'w', encoding='utf-8') as f:
            f.write(self.content["raw_content"])
    
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main extraction method"""
        # Run async extraction
        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self.extract_with_playwright(source_url))
        
        # Save all content formats
        self.save_structured_content()
        
        return results
    
    def validate_results(self) -> Dict[str, Any]:
        """Validate extracted text content"""
        validation = {
            "total_products": len(self.content["products"]),
            "products_without_description": [],
            "products_without_features": [],
            "products_without_name": [],
            "average_description_length": 0,
            "validation_passed": True
        }
        
        total_desc_length = 0
        
        # Validate each product
        for product_id, product_data in self.content["products"].items():
            # Check for missing name
            if not product_data.get("name"):
                validation["products_without_name"].append(product_id)
                validation["validation_passed"] = False
            
            # Check for missing description
            desc = product_data.get("description", "")
            if len(desc) < 50:  # Too short
                validation["products_without_description"].append(product_id)
                validation["validation_passed"] = False
            else:
                total_desc_length += len(desc)
            
            # Check for missing features
            features = product_data.get("features", {})
            if not features.get("pros") and not features.get("highlights"):
                validation["products_without_features"].append(product_id)
        
        # Calculate average description length
        if validation["total_products"] > 0:
            validation["average_description_length"] = total_desc_length / validation["total_products"]
        
        # Check page sections
        validation["page_sections_found"] = list(self.content["sections"].keys())
        validation["has_methodology"] = "methodology" in self.content["sections"]
        validation["has_faq"] = "faq" in self.content["sections"]
        
        # Log validation results
        self.logger.info(f"Text Validation Results:")
        self.logger.info(f"  - Total products: {validation['total_products']}")
        self.logger.info(f"  - Products without description: {len(validation['products_without_description'])}")
        self.logger.info(f"  - Products without features: {len(validation['products_without_features'])}")
        self.logger.info(f"  - Average description length: {validation['average_description_length']:.0f} chars")
        
        # Save validation report
        self.save_json(validation, f"text_validation_{self.timestamp}.json", "validation")
        
        return validation


if __name__ == "__main__":
    # Test the agent
    agent = TextExtractorAgent()
    
    # Replace with actual source URL
    source_url = "https://zoopy.com/best-robotic-pool-cleaners"
    
    results = agent.run(source_url)
    print(json.dumps(results, indent=2))