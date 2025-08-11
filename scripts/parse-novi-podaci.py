#!/usr/bin/env python3
import os
import json
import re
from bs4 import BeautifulSoup
from pathlib import Path

class NoviPodaciParser:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.input_file = self.base_dir / 'pool-robot-podaci' / 'novi-podaci.html'
        self.output_dir = self.base_dir / 'extracted-data'
        self.output_dir.mkdir(exist_ok=True)
        
    def parse_html(self):
        """Parse the HTML file and extract all sections"""
        print(f"📖 Reading {self.input_file}...")
        
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"✓ File read successfully ({len(content) / 1024:.2f} KB)")
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract different sections
            self.extract_intro_section(soup)
            self.extract_table_section(soup)
            self.extract_product_reviews(soup)
            self.extract_product_list(soup)
            
        except Exception as e:
            print(f"❌ Error parsing HTML: {e}")
            return False
        
        return True
    
    def extract_intro_section(self, soup):
        """Extract introduction and awards section"""
        print("\n🎯 Extracting introduction and awards...")
        
        intro_data = {
            'title': '',
            'subtitle': '',
            'description': '',
            'awards': [],
            'extractedAt': str(Path.ctime(self.input_file))
        }
        
        # Find main title
        h1 = soup.find('h1')
        if h1:
            intro_data['title'] = h1.get_text(strip=True)
            print(f"✓ Found title: {intro_data['title'][:50]}...")
        
        # Find subtitle/description
        subtitle = soup.find('p', class_='subtitle') or soup.find('p', class_='lead')
        if subtitle:
            intro_data['subtitle'] = subtitle.get_text(strip=True)
        
        # Find awards/badges
        awards_section = soup.find_all(['div', 'section'], class_=re.compile('award|badge'))
        for award in awards_section:
            award_text = award.get_text(strip=True)
            if award_text:
                intro_data['awards'].append(award_text)
        
        # Save intro data
        with open(self.output_dir / 'intro-awards.json', 'w', encoding='utf-8') as f:
            json.dump(intro_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Saved intro section with {len(intro_data['awards'])} awards")
    
    def extract_table_section(self, soup):
        """Extract comparison table data"""
        print("\n📊 Extracting comparison table...")
        
        table_data = {
            'headers': [],
            'rows': [],
            'extractedAt': str(Path.ctime(self.input_file))
        }
        
        # Find comparison table
        table = soup.find('table') or soup.find('div', class_=re.compile('comparison|table'))
        
        if table:
            # Extract headers
            headers = table.find_all('th')
            table_data['headers'] = [h.get_text(strip=True) for h in headers]
            
            # Extract rows
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if cells:
                    row_data = [cell.get_text(strip=True) for cell in cells]
                    # Also extract links
                    links = [cell.find('a')['href'] if cell.find('a') else None for cell in cells]
                    table_data['rows'].append({
                        'data': row_data,
                        'links': links
                    })
        
        # Save table data
        with open(self.output_dir / 'comparison-table.json', 'w', encoding='utf-8') as f:
            json.dump(table_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Saved comparison table with {len(table_data['rows'])} rows")
    
    def extract_product_reviews(self, soup):
        """Extract individual product reviews"""
        print("\n📝 Extracting individual reviews...")
        
        reviews_dir = self.output_dir / 'reviews'
        reviews_dir.mkdir(exist_ok=True)
        
        # Find all product sections
        products = soup.find_all(['article', 'section', 'div'], class_=re.compile('product|review'))
        
        if not products:
            # Try alternative patterns
            products = soup.find_all('div', id=re.compile('product'))
        
        product_count = 0
        for idx, product in enumerate(products):
            # Extract product name
            name_elem = product.find(['h2', 'h3', 'h4'])
            if not name_elem:
                continue
                
            product_name = name_elem.get_text(strip=True)
            
            # Skip if it's not a real product name
            if len(product_name) < 3 or 'product' not in product.get('class', []):
                continue
            
            product_data = {
                'name': product_name,
                'index': idx + 1,
                'content': str(product),
                'data': {}
            }
            
            # Extract structured data
            # Rating
            rating_elem = product.find(class_=re.compile('rating|score'))
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                if rating_match:
                    product_data['data']['rating'] = float(rating_match.group(1))
            
            # Price
            price_elem = product.find(class_=re.compile('price'))
            if price_elem:
                product_data['data']['price'] = price_elem.get_text(strip=True)
            
            # Features
            features = product.find_all(['li', 'p'], class_=re.compile('feature'))
            if features:
                product_data['data']['features'] = [f.get_text(strip=True) for f in features]
            
            # Links
            links = product.find_all('a', href=True)
            product_data['data']['links'] = []
            for link in links:
                href = link['href']
                text = link.get_text(strip=True)
                if 'amazon' in href or 'amzn' in href:
                    product_data['data']['amazonLink'] = href
                product_data['data']['links'].append({
                    'text': text,
                    'href': href
                })
            
            # Save individual review
            filename = re.sub(r'[^a-z0-9-]', '', product_name.lower().replace(' ', '-')) + '.json'
            with open(reviews_dir / filename, 'w', encoding='utf-8') as f:
                json.dump(product_data, f, indent=2, ensure_ascii=False)
            
            product_count += 1
            print(f"  ✓ {product_name}")
        
        print(f"\n✓ Saved {product_count} product reviews")
        return product_count
    
    def extract_product_list(self, soup):
        """Extract list of all products mentioned"""
        print("\n📋 Extracting complete product list...")
        
        products = set()
        
        # Find all product names
        # Method 1: Look for specific product name patterns
        name_patterns = [
            r'(BeatBot|Dolphin|Aiper|AIPER|Polaris|Aquabot|Hayward|Pentair|Zodiac|Seagull)[\s\w\-\+\.]+',
            r'[A-Z][\w\s\-\+\.]{3,30}(?:Pro|Plus|Elite|CC|E10|S1|X4|iQ|Sigma)'
        ]
        
        text_content = soup.get_text()
        for pattern in name_patterns:
            matches = re.findall(pattern, text_content)
            products.update(matches)
        
        # Method 2: Look in structured elements
        product_headers = soup.find_all(['h2', 'h3', 'h4'], class_=re.compile('product'))
        for header in product_headers:
            products.add(header.get_text(strip=True))
        
        # Clean and filter products
        cleaned_products = []
        for product in products:
            product = product.strip()
            # Filter out generic terms
            if len(product) > 5 and not any(skip in product.lower() for skip in ['click', 'price', 'review', 'best']):
                cleaned_products.append(product)
        
        # Remove duplicates and sort
        cleaned_products = sorted(list(set(cleaned_products)))
        
        # Save product list
        product_list_data = {
            'products': cleaned_products,
            'count': len(cleaned_products),
            'source': 'novi-podaci.html',
            'extractedAt': str(Path.ctime(self.input_file))
        }
        
        with open(self.output_dir / 'product-list.json', 'w', encoding='utf-8') as f:
            json.dump(product_list_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Found {len(cleaned_products)} unique products")
        for product in cleaned_products[:10]:  # Show first 10
            print(f"  - {product}")
        if len(cleaned_products) > 10:
            print(f"  ... and {len(cleaned_products) - 10} more")
        
        return cleaned_products
    
    def create_extraction_summary(self):
        """Create a summary of all extracted data"""
        print("\n📊 Creating extraction summary...")
        
        summary = {
            'extractionDate': str(Path.ctime(self.input_file)),
            'sourceFile': str(self.input_file),
            'outputDirectory': str(self.output_dir),
            'sections': {},
            'files': []
        }
        
        # List all created files
        for file in self.output_dir.glob('**/*.json'):
            relative_path = file.relative_to(self.output_dir)
            summary['files'].append(str(relative_path))
            
            # Add section info
            if file.name == 'intro-awards.json':
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    summary['sections']['intro'] = {
                        'title': data.get('title', ''),
                        'awardsCount': len(data.get('awards', []))
                    }
            elif file.name == 'comparison-table.json':
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    summary['sections']['table'] = {
                        'headers': len(data.get('headers', [])),
                        'rows': len(data.get('rows', []))
                    }
            elif file.name == 'product-list.json':
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    summary['sections']['products'] = {
                        'count': data.get('count', 0),
                        'products': data.get('products', [])
                    }
        
        # Count review files
        review_files = list((self.output_dir / 'reviews').glob('*.json'))
        summary['sections']['reviews'] = {
            'count': len(review_files),
            'files': [f.name for f in review_files]
        }
        
        # Save summary
        with open(self.output_dir / 'extraction-summary.json', 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        print("✓ Created extraction summary")
        
    def run(self):
        """Run the complete extraction process"""
        print("🚀 Starting novi-podaci parser...\n")
        
        if not self.input_file.exists():
            print(f"❌ Input file not found: {self.input_file}")
            return False
        
        success = self.parse_html()
        
        if success:
            self.create_extraction_summary()
            print(f"\n✅ Extraction complete!")
            print(f"📁 Output directory: {self.output_dir}")
            print("\nNext steps:")
            print("1. Review extracted data in extracted-data/")
            print("2. Run reconciliation script to remove products not in novi-podaci")
            print("3. Implement each section step by step")
        else:
            print("\n❌ Extraction failed!")
        
        return success


if __name__ == "__main__":
    parser = NoviPodaciParser()
    parser.run()