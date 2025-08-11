#!/usr/bin/env python3
"""
Simplified FactBench extraction script using only built-in Python libraries
Extract content from zoopy.com pages for FactBench
Usage: python simple_extract.py <zoopy_url> <output_name>
"""

import sys
import json
import re
import urllib.request
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

class ZoopyHTMLParser(HTMLParser):
    """Custom HTML parser for extracting data from zoopy.com pages"""
    
    def __init__(self):
        super().__init__()
        self.products = []
        self.current_product = {}
        self.current_tag = None
        self.current_data = ""
        self.in_product_section = False
        self.images = []
        self.tables = []
        self.reviews = []
        self.text_content = []
        
    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attrs_dict = dict(attrs)
        
        # Check for product sections
        if tag in ['div', 'section', 'article']:
            class_val = attrs_dict.get('class', '')
            if any(keyword in class_val.lower() for keyword in ['product', 'item', 'review', 'robot', 'cleaner']):
                self.in_product_section = True
                self.current_product = {
                    "name": "",
                    "rating": 0.0,
                    "price": "$",
                    "position": len(self.products) + 1,
                    "badge": "",
                    "keyFeatures": [],
                    "description": "",
                    "affiliateLink": "",
                    "image": ""
                }
        
        # Extract images
        if tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt', '')
            if src and any(keyword in alt.lower() for keyword in ['robot', 'pool', 'cleaner', 'product']):
                self.images.append({
                    "src": src,
                    "alt": alt,
                    "title": attrs_dict.get('title', '')
                })
                if self.in_product_section and not self.current_product.get('image'):
                    self.current_product['image'] = src
        
        # Extract links
        if tag == 'a' and self.in_product_section:
            href = attrs_dict.get('href', '')
            if 'amazon.com' in href or 'affiliate' in href or 'buy' in href.lower():
                self.current_product['affiliateLink'] = href
    
    def handle_data(self, data):
        self.current_data = data.strip()
        
        if self.in_product_section and self.current_data:
            # Extract product names (usually in headings)
            if self.current_tag in ['h1', 'h2', 'h3', 'h4'] and not self.current_product['name']:
                if any(keyword in self.current_data.lower() for keyword in ['robot', 'pool', 'cleaner', 'vacuum']):
                    self.current_product['name'] = self.current_data
            
            # Extract ratings
            rating_match = re.search(r'(\d+\.?\d*)\s*(?:out of|/)\s*5', self.current_data)
            if rating_match and not self.current_product['rating']:
                self.current_product['rating'] = float(rating_match.group(1))
            
            # Extract prices
            price_match = re.search(r'\$[\d,]+(?:\.\d{2})?', self.current_data)
            if price_match and self.current_product['price'] == '$':
                self.current_product['price'] = price_match.group(0)
            
            # Extract badges/awards
            if any(badge in self.current_data.lower() for badge in ['best', 'editor', 'choice', 'award', 'winner']):
                if not self.current_product['badge']:
                    self.current_product['badge'] = self.current_data
            
            # Collect all text for description
            if len(self.current_data) > 20:  # Only longer text snippets
                self.text_content.append(self.current_data)
    
    def handle_endtag(self, tag):
        if tag in ['div', 'section', 'article'] and self.in_product_section:
            if self.current_product.get('name'):  # Only add if we found a product name
                if not self.current_product['description'] and len(self.text_content) > 0:
                    # Use the last few text snippets as description
                    self.current_product['description'] = ' '.join(self.text_content[-3:])
                self.products.append(self.current_product.copy())
            self.in_product_section = False
            self.text_content = []
        
        self.current_tag = None

def extract_zoopy_data(url):
    """Extract data from zoopy.com URL"""
    print(f"Fetching data from: {url}")
    
    # Set up request with user agent
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    try:
        with urllib.request.urlopen(req) as response:
            html_content = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return None
    
    # Parse HTML
    parser = ZoopyHTMLParser()
    parser.feed(html_content)
    
    # Extract page title
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', html_content, re.IGNORECASE)
    page_title = title_match.group(1) if title_match else "Product Analysis"
    
    # Create structured data
    data = {
        "pageTitle": page_title.strip(),
        "products": parser.products[:11],  # Limit to 11 products as requested
        "images": parser.images,
        "extractionStats": {
            "totalProducts": len(parser.products),
            "totalImages": len(parser.images),
            "extractionDate": "2025-07-31",
            "sourceUrl": url
        }
    }
    
    return data

def save_extraction_data(data, output_name):
    """Save extracted data to workspace"""
    workspace_dir = Path("extraction-workspace")
    
    # Create directories
    (workspace_dir / "images").mkdir(parents=True, exist_ok=True)
    (workspace_dir / "text").mkdir(parents=True, exist_ok=True)
    (workspace_dir / "tables").mkdir(parents=True, exist_ok=True)
    (workspace_dir / "reviews").mkdir(parents=True, exist_ok=True)
    (workspace_dir / "validation").mkdir(parents=True, exist_ok=True)
    
    # Save main data
    output_file = workspace_dir / "text" / f"{output_name}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Save images data
    images_file = workspace_dir / "images" / f"{output_name}_images.json"
    with open(images_file, 'w', encoding='utf-8') as f:
        json.dump({"images": data["images"]}, f, indent=2)
    
    # Create validation report
    validation_report = {
        "url": data["extractionStats"]["sourceUrl"],
        "extraction_date": data["extractionStats"]["extractionDate"],
        "quality_score": calculate_quality_score(data),
        "products_found": len(data["products"]),
        "images_found": len(data["images"]),
        "missing_data": identify_missing_data(data)
    }
    
    validation_file = workspace_dir / "validation" / f"{output_name}_validation.json"
    with open(validation_file, 'w', encoding='utf-8') as f:
        json.dump(validation_report, f, indent=2)
    
    return output_file, validation_file

def calculate_quality_score(data):
    """Calculate quality score based on extracted data"""
    score = 0.0
    max_score = 100.0
    
    # Products score (40 points)
    products_found = len(data["products"])
    if products_found >= 10:
        score += 40
    else:
        score += (products_found / 10.0) * 40
    
    # Images score (25 points)
    images_found = len(data["images"])
    if images_found >= 11:
        score += 25
    else:
        score += (images_found / 11.0) * 25
    
    # Product details score (35 points)
    products_with_details = sum(1 for p in data["products"] 
                              if p.get("name") and p.get("rating") > 0 and p.get("price") != "$")
    if products_with_details > 0:
        score += (products_with_details / len(data["products"])) * 35
    
    return round(score, 1)

def identify_missing_data(data):
    """Identify what data is missing"""
    missing = []
    
    if len(data["products"]) < 11:
        missing.append(f"Only {len(data['products'])} products found (expected 11)")
    
    if len(data["images"]) < 11:
        missing.append(f"Only {len(data['images'])} images found (expected 11)")
    
    products_without_names = sum(1 for p in data["products"] if not p.get("name"))
    if products_without_names > 0:
        missing.append(f"{products_without_names} products missing names")
    
    products_without_ratings = sum(1 for p in data["products"] if p.get("rating") == 0)
    if products_without_ratings > 0:
        missing.append(f"{products_without_ratings} products missing ratings")
    
    return missing

def main():
    if len(sys.argv) != 3:
        print("Usage: python simple_extract.py <zoopy_url> <output_name>")
        print("Example: python simple_extract.py https://zoopy.com/best-robotic-pool-cleaners robotic-pool-cleaners")
        sys.exit(1)
    
    url = sys.argv[1]
    output_name = sys.argv[2]
    
    print(f"Starting FactBench extraction from: {url}")
    print("="*60)
    
    # Extract data
    data = extract_zoopy_data(url)
    if not data:
        print("Failed to extract data")
        sys.exit(1)
    
    # Save data
    output_file, validation_file = save_extraction_data(data, output_name)
    
    print(f"\n✅ Extraction completed!")
    print(f"📊 Products extracted: {len(data['products'])}")
    print(f"🖼️  Images found: {len(data['images'])}")
    print(f"📁 Data saved to: {output_file}")
    print(f"🔍 Validation report: {validation_file}")
    print("="*60)

if __name__ == "__main__":
    main()