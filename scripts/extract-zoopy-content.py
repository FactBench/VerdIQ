#!/usr/bin/env python3
"""
Extract content from zoopy.com pages for FactBench
Usage: python extract-zoopy-content.py <zoopy_url> <output_name>
Example: python extract-zoopy-content.py https://zoopy.com/best-robot-vacuums best-robot-vacuums
"""

import sys
import json
import re
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

def extract_product_data(html_content, url):
    """Extract product data from zoopy.com page"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract page metadata
    title = soup.find('h1').get_text(strip=True) if soup.find('h1') else "Product Analysis"
    meta_desc = soup.find('meta', {'name': 'description'})
    description = meta_desc.get('content', '') if meta_desc else ""
    
    # Extract products
    products = []
    product_sections = soup.find_all(['div', 'section'], class_=re.compile(r'product|item|review'))
    
    for idx, section in enumerate(product_sections[:10], 1):  # Limit to 10 products
        product = {
            "name": "",
            "rating": 0.0,
            "price": "$",
            "position": idx,
            "badge": "",
            "keyFeatures": [],
            "description": "",
            "affiliateLink": ""
        }
        
        # Extract product name
        name_elem = section.find(['h2', 'h3', 'h4'])
        if name_elem:
            product['name'] = name_elem.get_text(strip=True)
        
        # Extract rating
        rating_elem = section.find(text=re.compile(r'\d+\.?\d*/5'))
        if rating_elem:
            rating_match = re.search(r'(\d+\.?\d*)/5', rating_elem)
            if rating_match:
                product['rating'] = float(rating_match.group(1))
        
        # Extract price indicators
        price_elem = section.find(text=re.compile(r'\$+|price|cost', re.I))
        if price_elem:
            dollar_signs = len(re.findall(r'\$', str(price_elem)))
            if dollar_signs > 0:
                product['price'] = '$' * min(dollar_signs, 4)
        
        # Extract features
        feature_list = section.find(['ul', 'ol'])
        if feature_list:
            features = [li.get_text(strip=True) for li in feature_list.find_all('li')[:4]]
            product['keyFeatures'] = features
        
        # Extract description
        desc_elem = section.find(['p', 'div'], class_=re.compile(r'desc|summary|review'))
        if desc_elem:
            product['description'] = desc_elem.get_text(strip=True)[:200] + "..."
        
        # Extract affiliate link
        link_elem = section.find('a', href=re.compile(r'amazon|affiliate|amzn'))
        if link_elem:
            product['affiliateLink'] = link_elem.get('href', '')
        
        # Add badge for top products
        if idx == 1:
            product['badge'] = "Editor's Choice"
        elif idx == 2:
            product['badge'] = "Best Value"
        elif product['rating'] >= 4.8:
            product['badge'] = "Top Rated"
        
        if product['name']:  # Only add if we found a name
            products.append(product)
    
    # Extract comparison criteria
    criteria_section = soup.find(text=re.compile(r'compare|criteria|factors', re.I))
    comparison_criteria = []
    if criteria_section:
        parent = criteria_section.find_parent(['div', 'section'])
        if parent:
            criteria_list = parent.find(['ul', 'ol'])
            if criteria_list:
                comparison_criteria = [li.get_text(strip=True) for li in criteria_list.find_all('li')[:8]]
    
    if not comparison_criteria:
        # Default criteria
        comparison_criteria = [
            "Performance & Efficiency",
            "Build Quality",
            "Ease of Use",
            "Features & Technology",
            "Value for Money",
            "Customer Support",
            "Warranty Coverage",
            "User Reviews"
        ]
    
    return {
        "page": {
            "title": title,
            "subtitle": "Expert Analysis & Testing Results",
            "lastUpdated": "January 2025",
            "author": "FactBench Experts",
            "metaDescription": description or f"Expert analysis of {title.lower()}. Rigorous testing, data-driven comparisons, and unbiased recommendations.",
            "sourceUrl": url
        },
        "products": products,
        "comparisonCriteria": comparison_criteria,
        "priceGuide": {
            "$": "Budget",
            "$$": "Mid-Range",
            "$$$": "Premium",
            "$$$$": "Luxury"
        }
    }

def fetch_zoopy_content(url):
    """Fetch content from zoopy.com"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    if len(sys.argv) != 3:
        print("Usage: python extract-zoopy-content.py <zoopy_url> <output_name>")
        print("Example: python extract-zoopy-content.py https://zoopy.com/best-robot-vacuums best-robot-vacuums")
        sys.exit(1)
    
    url = sys.argv[1]
    output_name = sys.argv[2]
    
    print(f"📥 Fetching content from {url}...")
    html_content = fetch_zoopy_content(url)
    
    if not html_content:
        print("❌ Failed to fetch content")
        sys.exit(1)
    
    print("🔍 Extracting product data...")
    data = extract_product_data(html_content, url)
    
    # Save as JSON
    output_path = f"src/data/{output_name}-data.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Data extracted to {output_path}")
    print(f"📊 Found {len(data['products'])} products")
    
    # Show summary
    print("\n📋 Summary:")
    print(f"Title: {data['page']['title']}")
    print(f"Products: {len(data['products'])}")
    for product in data['products'][:3]:
        print(f"  - {product['name']} ({product['rating']}/5.0)")
    
    print(f"\n💡 Next step: Run 'npm run generate-page {output_name}' to create the page")

if __name__ == "__main__":
    # Check if required libraries are installed
    try:
        import requests
        import bs4
    except ImportError:
        print("📦 Installing required Python packages...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"])
        print("✅ Packages installed. Please run the script again.")
        sys.exit(0)
    
    main()