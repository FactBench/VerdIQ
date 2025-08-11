#!/usr/bin/env python3
import json
import os
import requests
from urllib.parse import urlparse

# Read product data
with open('/home/titan/FactBench/src/data/pool-cleaners-complete.json', 'r') as f:
    data = json.load(f)

# Create images directory
images_dir = '/home/titan/FactBench/src/assets/images/products'
os.makedirs(images_dir, exist_ok=True)

# Download each product image
for product in data['products']:
    if 'imageUrl' in product:
        image_url = product['imageUrl']
        image_name = product['image']
        image_path = os.path.join(images_dir, image_name)
        
        print(f"Downloading {product['name']} image...")
        
        try:
            # Download image
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(image_url, headers=headers, stream=True)
            response.raise_for_status()
            
            # Save image
            with open(image_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✅ Saved: {image_name}")
            
        except Exception as e:
            print(f"❌ Error downloading {image_name}: {e}")
            # Create placeholder note
            with open(image_path + '.txt', 'w') as f:
                f.write(f"Image URL: {image_url}\n")
                f.write(f"Error: {e}\n")

print("\n✅ Image download process completed!")
print(f"📁 Images saved to: {images_dir}")