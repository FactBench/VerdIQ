# Step 2 - Top 10 List Implementation Instructions

## Overview
Step 2 involves extracting and implementing the complete top-10 list of robotic pool cleaners from zoopy.com data, including all 11 products with their awards, descriptions, features, and affiliate links.

## Data Source Requirements
Before starting Step 2, ensure you have:
- **Source file**: `/home/titan/FactBench/pool-robot-podaci/str-best-robot-all data.txt`
- **Section identifier**: Look for `<section id="top-10" class=" ct-section" >`
- **Product count**: 11 products total (despite being called "top 10")

## Extracted Data Structure

### Product Information Captured:
1. **Position**: 1-11
2. **Award Badge**: (e.g., "Best OF THE BEST", "Best Overall", etc.)
3. **Product Name**: Full product name
4. **Tagline**: Italicized marketing description
5. **User Ratings**: Count (e.g., "1,000+", "17,000+")
6. **Star Rating**: Numeric rating (4.0, 4.5, or 5.0)
7. **What We Like**: 5 bullet points per product
8. **Key Features**: 5 technical features per product
9. **Amazon Link**: Affiliate link for purchasing
10. **Official Website Link**: When available (only BeatBot has one)
11. **Image URL**: Product image from zoopy.com

### All 11 Products:
1. BeatBot AquaSense 2 Pro - "Best OF THE BEST"
2. Dolphin Nautilus CC Plus Wi-Fi - "Best Overall"
3. AIPER Scuba S1 Cordless - "Best Cordless"
4. WYBOT C1 - "Best Budget"
5. Dolphin Escape - "Best Advanced"
6. Polaris 965IQ Sport - "Best Performance"
7. Ofuzzi Cyber 1200 Pro - "Best Navigation"
8. Dolphin Sigma - "Best Wall Climber"
9. Pentair Kreepy Krauly Warrior SE - "Best for Large Pools"
10. PAXCESS HJ2052 - "Best Above Ground"
11. Polaris P825 - "Value Pick"

## Implementation Steps

### 1. Data Extraction
- Extract data from zoopy HTML structure
- Parse each product's complete information
- Save as structured JSON in `products-data.json`

### 2. HTML Structure Update
Replace the current product grid with new structure:

```html
<section id="top-10-products" class="py-12">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-3xl font-display font-bold text-center mb-8">
      Meet Our 2025 Champions, Pool Cleaning Robots That Truly Deliver
    </h2>
    
    <!-- Product cards here -->
    <div class="space-y-8">
      <!-- Each product as a card with all information -->
    </div>
  </div>
</section>
```

### 3. Product Card Template
Each product should include:
- Award badge (styled with gradient background)
- Product image
- Tagline (italic text below image)
- Name and ratings
- What we like section
- Key features section
- CTA buttons (Amazon + Official site if available)

### 4. Styling Requirements
- Award badges: Use gradient backgrounds with animations
- Product cards: Dark theme with hover effects
- CTA buttons: Red (#ef4444) as per project requirements
- Responsive design for mobile/tablet/desktop

## File Locations
- **Data file**: `/home/titan/FactBench/best-system-v1/step2-top10list/products-data.json`
- **Instructions**: `/home/titan/FactBench/best-system-v1/step2-top10list/STEP2-INSTRUCTIONS.md`
- **Target HTML**: `/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html`

## Testing Checklist
- [ ] All 11 products display correctly
- [ ] Award badges are properly styled
- [ ] Taglines appear below product images
- [ ] Star ratings display correctly
- [ ] "What we like" lists are complete
- [ ] "Key features" lists are complete
- [ ] All affiliate links work
- [ ] Mobile responsive design works
- [ ] Dark theme is consistent

## Deployment
1. Update the HTML file with new top-10 section
2. Run build process: `npm run build`
3. Test locally: `npm run preview`
4. Deploy: `./scripts/github-deploy.sh`
5. Verify on live site: https://factbench.github.io/VerdIQ/best-robotic-pool-cleaners/

## Notes
- The original zoopy page calls it "top 10" but actually has 11 products
- Only BeatBot has an official website link
- User ratings vary significantly (825+ to 17,000+)
- All products use Amazon affiliate links