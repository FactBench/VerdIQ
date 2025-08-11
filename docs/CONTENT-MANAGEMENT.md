# Content Management Guide

This guide explains how to manage and update content in the FactBench project.

## 📋 Table of Contents

- [Understanding the Content Structure](#understanding-the-content-structure)
- [Adding New Products](#adding-new-products)
- [Updating Existing Products](#updating-existing-products)
- [Extracting Content from External Sources](#extracting-content-from-external-sources)
- [Managing Images](#managing-images)
- [Creating New Categories](#creating-new-categories)
- [Content Guidelines](#content-guidelines)

## 📊 Understanding the Content Structure

### Product Data Schema

All product data is stored in `/src/data/products.json`:

```json
{
  "products": [
    {
      "id": "unique-product-identifier",
      "name": "Product Name",
      "badge": "Best OF THE BEST",
      "rating": 5.0,
      "userRatings": "17,000+",
      "tagline": "Short compelling description",
      "features": {
        "pros": ["Pro 1", "Pro 2", "Pro 3"],
        "cons": ["Con 1", "Con 2"]
      },
      "specifications": {
        "Pool Size": "Up to 50ft",
        "Cleaning Time": "90-150 min",
        "Filter Type": "Fine mesh",
        "Warranty": "2 years"
      },
      "description": "Detailed product description...",
      "affiliateLink": "https://affiliate-link.com",
      "imageUrl": "/assets/images/products/product-image.jpg",
      "price": "$599",
      "priceNote": "Check for latest pricing"
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (URL-friendly) |
| `name` | string | Yes | Product display name |
| `badge` | string | No | Award/recognition badge |
| `rating` | number | Yes | Rating out of 5.0 |
| `userRatings` | string | Yes | Number of user ratings |
| `tagline` | string | Yes | Short marketing description |
| `features` | object | Yes | Pros and cons lists |
| `specifications` | object | Yes | Key product specs |
| `description` | string | No | Detailed description |
| `affiliateLink` | string | Yes | Purchase link |
| `imageUrl` | string | Yes | Product image path |
| `price` | string | No | Current price |
| `priceNote` | string | No | Pricing disclaimer |

## ➕ Adding New Products

### Step 1: Prepare Product Data

1. Research the product thoroughly
2. Gather verified user ratings
3. Identify key pros and cons
4. Note important specifications
5. Find high-quality product image

### Step 2: Create Product Entry

Add to `/src/data/products.json`:

```json
{
  "id": "new-product-id",
  "name": "New Product Name",
  "badge": "Editor's Choice",
  "rating": 4.5,
  "userRatings": "5,000+",
  "tagline": "Revolutionary cleaning technology for modern pools",
  "features": {
    "pros": [
      "Advanced navigation system",
      "Energy efficient",
      "Easy maintenance"
    ],
    "cons": [
      "Higher price point",
      "Requires Wi-Fi setup"
    ]
  },
  "specifications": {
    "Pool Size": "Up to 40ft",
    "Cleaning Time": "120 min",
    "Filter Type": "Dual-layer",
    "Warranty": "3 years"
  },
  "affiliateLink": "https://example.com/affiliate",
  "imageUrl": "/assets/images/products/new-product.jpg"
}
```

### Step 3: Add Product Image

1. Download product image
2. Optimize image (recommended: 800x600px, WebP format)
3. Save to `/src/assets/images/products/`
4. Update `imageUrl` in JSON

### Step 4: Build and Preview

```bash
npm run build
npm run preview
```

## 🔄 Updating Existing Products

### Quick Updates

For minor changes (price, ratings, etc.):

1. Edit `/src/data/products.json`
2. Find the product by ID
3. Update the relevant fields
4. Build and deploy

### Major Updates

For significant changes:

1. Re-run extraction script if updating from source
2. Verify all information is current
3. Update images if needed
4. Test thoroughly before deploying

## 🔍 Extracting Content from External Sources

### Using the Extraction Script

The project includes a Python script to extract product data:

```bash
# Extract from zoopy.com
python scripts/extract-full-zoopy-data.py

# This will:
# 1. Fetch product pages
# 2. Parse HTML content
# 3. Extract structured data
# 4. Generate products.json
# 5. Download product images
```

### Customizing Extraction

Edit `scripts/extract-full-zoopy-data.py`:

```python
# Add new source URL
source_urls = [
    "https://example.com/products",
    "https://another-source.com/reviews"
]

# Modify extraction logic
def extract_product_data(html):
    soup = BeautifulSoup(html, 'html.parser')
    # Custom extraction logic
    return product_data
```

### Creating New Extraction Scripts

For new sources, create a new script:

```python
#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json

def extract_from_new_source(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    products = []
    # Your extraction logic here
    
    return products

# Save to JSON
with open('src/data/products.json', 'w') as f:
    json.dump({"products": products}, f, indent=2)
```

## 🖼️ Managing Images

### Image Requirements

- **Format**: WebP preferred, JPG/PNG fallback
- **Dimensions**: 800x600px recommended
- **File size**: < 200KB optimal
- **Naming**: Use product ID (e.g., `beatbot-aquasense-pro.webp`)

### Downloading Images

Use the image download script:

```bash
node scripts/download-images.js
```

### Manual Image Addition

1. Download image from manufacturer/retailer
2. Optimize using tools:
   ```bash
   # Using imagemin
   npx imagemin input.jpg > output.jpg
   
   # Using sharp (if installed)
   node scripts/optimize-images.js
   ```
3. Save to `/src/assets/images/products/`

### Missing Images

The build script creates placeholder SVGs for missing images:

```javascript
// Automatic placeholder generation
if (!fs.existsSync(imagePath)) {
    createPlaceholderImage(imagePath);
}
```

## 📁 Creating New Categories

### Step 1: Create Category Data

Create new JSON file: `/src/data/robotic-vacuums.json`

```json
{
  "category": "Robotic Vacuums",
  "description": "Smart cleaning for modern homes",
  "products": [
    // Product entries
  ]
}
```

### Step 2: Create Page Template

Copy and modify existing template:

```bash
cp src/pages/best-robotic-pool-cleaners.html \
   src/pages/best-robotic-vacuums.html
```

Update template variables:
- Page title
- Meta descriptions
- Hero content
- Category-specific content

### Step 3: Update Build Script

Edit `scripts/build.js`:

```javascript
const categories = [
    'robotic-pool-cleaners',
    'robotic-vacuums' // Add new category
];
```

### Step 4: Add Navigation

Update navigation in templates to include new category.

## 📝 Content Guidelines

### Writing Style

1. **Be Factual**: Only verifiable information
2. **Be Concise**: Clear, scannable content
3. **Be Helpful**: Focus on user benefits
4. **Be Honest**: Include both pros and cons

### SEO Best Practices

1. **Titles**: Include product name and category
2. **Descriptions**: 150-160 characters
3. **Headings**: Use semantic HTML (h1, h2, h3)
4. **Alt Text**: Describe images accurately

### Badge Guidelines

Use badges consistently:

- **Best OF THE BEST**: Top overall choice
- **Editor's Choice**: Excellent value/features
- **Budget Pick**: Best value for money
- **Premium Choice**: High-end option
- **New Release**: Recently launched

### Rating Guidelines

- **5.0**: Exceptional, few or no cons
- **4.5-4.9**: Excellent, minor drawbacks
- **4.0-4.4**: Very good, some limitations
- **3.5-3.9**: Good, notable trade-offs
- **Below 3.5**: Consider if worth including

## 🔄 Content Update Workflow

### Regular Updates (Monthly)

1. Check for price changes
2. Update user rating counts
3. Verify affiliate links work
4. Check for new models

### Seasonal Updates

1. Add holiday pricing notes
2. Update availability information
3. Include seasonal promotions
4. Review competitor changes

### Annual Review

1. Full content audit
2. Re-evaluate product rankings
3. Update all specifications
4. Refresh product images

## 🛠️ Troubleshooting

### Common Issues

#### Products Not Displaying
- Check JSON syntax (use JSON validator)
- Verify product ID is unique
- Ensure image paths are correct

#### Images Not Loading
- Check file exists in `/src/assets/images/products/`
- Verify path in JSON matches filename
- Ensure image was copied during build

#### Build Errors
- Validate JSON syntax
- Check for missing required fields
- Ensure no duplicate IDs

### Validation Script

Create a validation script:

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/products.json'));

// Validate each product
data.products.forEach((product, index) => {
    if (!product.id) {
        console.error(`Product ${index} missing ID`);
    }
    if (!product.name) {
        console.error(`Product ${product.id} missing name`);
    }
    // Add more validations
});
```

## 📈 Analytics Integration

Track content performance:

1. **Click Tracking**: Monitor affiliate link clicks
2. **Engagement**: Time on page per product
3. **Conversions**: Track purchase completions
4. **User Feedback**: Collect ratings/reviews

---

*Remember: Quality content drives user trust and conversions. Always verify information and keep content fresh!*