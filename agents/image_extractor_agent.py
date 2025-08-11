#!/usr/bin/env python3
"""
Image Extractor Agent for FactBench
Downloads all product images including galleries, thumbnails, and high-res versions
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse
import re

from playwright.async_api import async_playwright
from base_agent import BaseAgent


class ImageExtractorAgent(BaseAgent):
    """Agent responsible for extracting all product images"""
    
    def __init__(self):
        super().__init__("ImageExtractorAgent")
        self.images_dir = self.workspace_dir / "images" / "products"
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.manifest = {
            "extraction_date": self.timestamp,
            "products": {},
            "total_images": 0,
            "missing_images": []
        }
    
    async def extract_with_playwright(self, source_url: str) -> Dict[str, Any]:
        """Extract images using Playwright for dynamic content"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Navigate to page
                self.logger.info(f"Navigating to {source_url}")
                await page.goto(source_url, wait_until="networkidle")
                
                # Wait for content to load
                await page.wait_for_timeout(3000)
                
                # Scroll to load lazy images
                await self.scroll_page(page)
                
                # Extract all image data
                images_data = await self.extract_all_images(page)
                
                # Process each product
                for product_data in images_data:
                    await self.process_product_images(product_data)
                
                return self.manifest
                
            finally:
                await browser.close()
    
    async def scroll_page(self, page):
        """Scroll page to trigger lazy loading"""
        self.logger.info("Scrolling page to load all images")
        
        # Get page height
        height = await page.evaluate("document.body.scrollHeight")
        viewport_height = page.viewport_size["height"]
        
        # Scroll in chunks
        current_position = 0
        while current_position < height:
            await page.evaluate(f"window.scrollTo(0, {current_position})")
            await page.wait_for_timeout(500)  # Wait for images to load
            current_position += viewport_height
            
        # Scroll back to top
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1000)
    
    async def extract_all_images(self, page) -> List[Dict]:
        """Extract all image information from the page"""
        self.logger.info("Extracting image data from page")
        
        # JavaScript to extract comprehensive image data
        images_data = await page.evaluate("""
            () => {
                const products = [];
                
                // Find all product containers
                const productElements = document.querySelectorAll('[data-product-id], .product-card, .product-item, article[id*="product"]');
                
                productElements.forEach(element => {
                    const productId = element.getAttribute('data-product-id') || 
                                    element.getAttribute('id') || 
                                    element.querySelector('h2, h3')?.textContent?.toLowerCase().replace(/\\s+/g, '-');
                    
                    if (!productId) return;
                    
                    const images = [];
                    
                    // Find all images within product
                    const imgElements = element.querySelectorAll('img');
                    imgElements.forEach(img => {
                        // Get all possible image sources
                        const sources = {
                            src: img.src,
                            srcset: img.srcset,
                            dataSrc: img.getAttribute('data-src'),
                            dataSrcset: img.getAttribute('data-srcset'),
                            dataLazy: img.getAttribute('data-lazy'),
                            dataOriginal: img.getAttribute('data-original')
                        };
                        
                        // Extract high-res versions from srcset
                        const srcsetImages = [];
                        if (sources.srcset) {
                            const srcsetParts = sources.srcset.split(',');
                            srcsetParts.forEach(part => {
                                const [url, descriptor] = part.trim().split(' ');
                                srcsetImages.push({
                                    url: url,
                                    descriptor: descriptor || '1x'
                                });
                            });
                        }
                        
                        images.push({
                            alt: img.alt || '',
                            title: img.title || '',
                            sources: sources,
                            srcsetImages: srcsetImages,
                            width: img.naturalWidth || img.width,
                            height: img.naturalHeight || img.height,
                            isGallery: img.closest('.gallery, .carousel, .slider') !== null,
                            isThumbnail: img.classList.contains('thumbnail') || img.width < 150
                        });
                    });
                    
                    // Also check for background images
                    const bgElements = element.querySelectorAll('[style*="background-image"]');
                    bgElements.forEach(el => {
                        const style = el.getAttribute('style');
                        const match = style.match(/url\\(['\"]?([^'\"\\)]+)['\"]?\\)/);
                        if (match) {
                            images.push({
                                url: match[1],
                                isBackground: true,
                                element: el.className
                            });
                        }
                    });
                    
                    products.push({
                        productId: productId,
                        productName: element.querySelector('h2, h3, .product-name')?.textContent?.trim(),
                        images: images
                    });
                });
                
                return products;
            }
        """)
        
        return images_data
    
    async def process_product_images(self, product_data: Dict):
        """Process and download images for a single product"""
        product_id = self.sanitize_filename(product_data['productId'])
        product_dir = self.images_dir / product_id
        product_dir.mkdir(exist_ok=True)
        
        self.logger.info(f"Processing images for product: {product_id}")
        
        product_manifest = {
            "product_name": product_data.get('productName', ''),
            "images": [],
            "total_count": 0,
            "downloaded_count": 0
        }
        
        # Process each image
        for idx, img_data in enumerate(product_data.get('images', [])):
            # Determine best URL to download
            best_url = self.get_best_image_url(img_data)
            
            if not best_url:
                self.logger.warning(f"No valid URL found for image {idx} of {product_id}")
                continue
            
            # Generate filename
            if idx == 0:
                filename = "main.jpg"
            elif img_data.get('isThumbnail'):
                filename = f"thumbnail-{idx}.jpg"
            elif img_data.get('isGallery'):
                filename = f"gallery-{idx}.jpg"
            else:
                filename = f"image-{idx}.jpg"
            
            output_path = product_dir / filename
            
            # Download image
            success = await self.download_image_async(best_url, output_path)
            
            if success:
                product_manifest["downloaded_count"] += 1
                product_manifest["images"].append({
                    "filename": filename,
                    "url": best_url,
                    "alt": img_data.get('alt', ''),
                    "type": self.determine_image_type(img_data),
                    "dimensions": {
                        "width": img_data.get('width'),
                        "height": img_data.get('height')
                    }
                })
            else:
                self.manifest["missing_images"].append({
                    "product_id": product_id,
                    "url": best_url,
                    "error": "Download failed"
                })
            
            product_manifest["total_count"] += 1
            self.update_metrics(success)
        
        # Download high-res versions if available
        await self.download_srcset_images(product_data, product_dir, product_manifest)
        
        # Save product manifest
        self.manifest["products"][product_id] = product_manifest
        self.manifest["total_images"] += product_manifest["downloaded_count"]
        
        self.logger.info(f"Downloaded {product_manifest['downloaded_count']}/{product_manifest['total_count']} images for {product_id}")
    
    def get_best_image_url(self, img_data: Dict) -> Optional[str]:
        """Determine the best quality image URL to download"""
        # Priority order for image sources
        sources = img_data.get('sources', {})
        
        # Check srcset for high-res versions
        if img_data.get('srcsetImages'):
            # Sort by descriptor to get highest resolution
            sorted_srcset = sorted(
                img_data['srcsetImages'], 
                key=lambda x: float(x['descriptor'].rstrip('x')),
                reverse=True
            )
            if sorted_srcset:
                return sorted_srcset[0]['url']
        
        # Check various data attributes
        for attr in ['dataOriginal', 'dataSrc', 'src', 'dataLazy']:
            if sources.get(attr):
                return sources[attr]
        
        # Check background images
        if img_data.get('isBackground') and img_data.get('url'):
            return img_data['url']
        
        return None
    
    async def download_srcset_images(self, product_data: Dict, product_dir: Path, manifest: Dict):
        """Download high-resolution versions from srcset"""
        for img_data in product_data.get('images', []):
            srcset_images = img_data.get('srcsetImages', [])
            
            # Download 2x and 3x versions if available
            for srcset_img in srcset_images:
                descriptor = srcset_img.get('descriptor', '1x')
                if descriptor in ['2x', '3x']:
                    url = srcset_img.get('url')
                    if url:
                        filename = f"high-res-{descriptor}-{len(manifest['images'])}.jpg"
                        output_path = product_dir / filename
                        
                        success = await self.download_image_async(url, output_path)
                        if success:
                            manifest["images"].append({
                                "filename": filename,
                                "url": url,
                                "type": f"high-res-{descriptor}",
                                "resolution": descriptor
                            })
                            manifest["downloaded_count"] += 1
    
    async def download_image_async(self, url: str, output_path: Path) -> bool:
        """Download image with async support"""
        try:
            # Use synchronous download for now (can be made async with aiohttp)
            return self.download_file(url, output_path)
        except Exception as e:
            self.logger.error(f"Failed to download {url}: {str(e)}")
            return False
    
    def determine_image_type(self, img_data: Dict) -> str:
        """Determine the type of image"""
        if img_data.get('isThumbnail'):
            return "thumbnail"
        elif img_data.get('isGallery'):
            return "gallery"
        elif img_data.get('isBackground'):
            return "background"
        else:
            return "main"
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for filesystem"""
        # Remove invalid characters
        filename = re.sub(r'[<>:"/\\|?*]', '-', filename)
        # Remove extra spaces and dots
        filename = re.sub(r'\s+', '-', filename)
        filename = re.sub(r'\.+', '.', filename)
        # Limit length
        return filename[:100]
    
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main extraction method"""
        # Run async extraction
        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self.extract_with_playwright(source_url))
        
        # Save manifest
        self.save_json(self.manifest, "image_manifest.json", "images")
        
        return results
    
    def validate_results(self) -> Dict[str, Any]:
        """Validate extracted images"""
        validation = {
            "total_products": len(self.manifest["products"]),
            "total_images": self.manifest["total_images"],
            "missing_images": len(self.manifest["missing_images"]),
            "products_without_images": [],
            "products_with_single_image": [],
            "validation_passed": True
        }
        
        # Check each product
        for product_id, product_data in self.manifest["products"].items():
            if product_data["downloaded_count"] == 0:
                validation["products_without_images"].append(product_id)
                validation["validation_passed"] = False
            elif product_data["downloaded_count"] == 1:
                validation["products_with_single_image"].append(product_id)
        
        # Log validation results
        self.logger.info(f"Validation Results:")
        self.logger.info(f"  - Total products: {validation['total_products']}")
        self.logger.info(f"  - Total images: {validation['total_images']}")
        self.logger.info(f"  - Missing images: {validation['missing_images']}")
        self.logger.info(f"  - Products without images: {len(validation['products_without_images'])}")
        
        # Save validation report
        self.save_json(validation, f"image_validation_{self.timestamp}.json", "validation")
        
        return validation


if __name__ == "__main__":
    # Test the agent
    agent = ImageExtractorAgent()
    
    # Replace with actual source URL
    source_url = "https://zoopy.com/best-robotic-pool-cleaners"
    
    results = agent.run(source_url)
    print(json.dumps(results, indent=2))