#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Template for manual data entry
const productsTemplate = {
  "products": [
    {
      "position": 1,
      "name": "Product Name Here",
      "award": "Best OF THE BEST",
      "tagline": "Enter compelling product tagline here",
      "amazonLink": "https://amzn.to/xxxxx",
      "imageUrl": "https://zoopy.com/wp-content/uploads/2025/05/product-image.jpg",
      "price": "$$",
      "userRatings": "1,000+",
      "starRating": 5.0,
      "whatWeLike": [
        "Benefit 1",
        "Benefit 2",
        "Benefit 3",
        "Benefit 4",
        "Benefit 5"
      ],
      "keyFeatures": [
        "Technical specification 1",
        "Technical specification 2",
        "Technical specification 3",
        "Technical specification 4",
        "Technical specification 5"
      ]
    }
    // Add products 2-11 here
  ]
};

// Award suggestions based on product characteristics
const awardSuggestions = [
  "Best OF THE BEST",
  "Best Overall",
  "Best Cordless",
  "Best Above-Ground",
  "Top Smart-Features",
  "Best Large-Pools",
  "Best AI-Navigation",
  "Premium Cordless",
  "Best Filtration",
  "Proven Powerhouse",
  "Best Surface-Skimmer"
];

// Price guide
const priceGuide = {
  "$": "Under $300",
  "$$": "$300-$700",
  "$$$": "$700-$1,200",
  "$$$$": "Over $1,200"
};

// Create the initial template file
const outputPath = path.join(__dirname, 'products-data-template.json');
fs.writeFileSync(outputPath, JSON.stringify(productsTemplate, null, 2));

console.log('📝 Created products data template at:', outputPath);
console.log('\n📋 Instructions:');
console.log('1. Fill in all 11 products in the template');
console.log('2. Use these award suggestions:', awardSuggestions.join(', '));
console.log('3. Price symbols:', Object.entries(priceGuide).map(([k,v]) => `${k} = ${v}`).join(', '));
console.log('4. Ensure all Amazon/Levanta links are correct');
console.log('5. Save as products-data.json when complete');