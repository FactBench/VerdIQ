#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CORRECT Price Guide text
const CORRECT_PRICE_GUIDE = '<p class="text-center text-gray-400 mb-4"><strong>Price Guide:</strong> $ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+</p>';

// Read the main HTML
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Step 1: Add Price Guide to products section (Step 2) - after the intro paragraph
const productsIntroPattern = /<p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">\s*Stop Wasting Time[^<]*for a Sparkling Pool\.\s*<\/p>/s;
const productsIntroMatch = html.match(productsIntroPattern);

if (productsIntroMatch) {
  // Check if price guide already exists after this paragraph
  const afterIntroPos = productsIntroMatch.index + productsIntroMatch[0].length;
  const nextContent = html.substring(afterIntroPos, afterIntroPos + 200);
  
  if (!nextContent.includes('Price Guide:')) {
    // Add the price guide after the intro
    html = html.substring(0, afterIntroPos) + '\n            ' + CORRECT_PRICE_GUIDE + html.substring(afterIntroPos);
    console.log('✅ Added Price Guide to products section (Step 2)');
  } else {
    console.log('ℹ️  Price Guide already exists in products section');
  }
}

// Step 2: Fix any incorrect price guides in the document
// Replace any wrong price guide formats
const wrongPriceGuidePatterns = [
  /<p[^>]*><strong>Price Guide:<\/strong>\s*\$\s*=\s*Under[^<]+<\/p>/g,
  /Price Guide:\s*\$\s*=\s*Under \$500\s*\|\s*\$\s*=\s*\$500[^<]+/g
];

wrongPriceGuidePatterns.forEach(pattern => {
  if (html.match(pattern)) {
    html = html.replace(pattern, CORRECT_PRICE_GUIDE);
    console.log('✅ Fixed incorrect price guide format');
  }
});

// Step 3: Update colors for price symbols
// Define color classes
const priceColors = {
  '$': 'text-green-500',
  '$$': 'text-yellow-500', 
  '$$$': 'text-orange-500',
  '$$$$': 'text-red-500'
};

// Save the updated HTML
fs.writeFileSync(htmlPath, html);

console.log('\n✅ Fixed all issues:');
console.log('1. Added correct Price Guide to products section');
console.log('2. Fixed price guide format: $ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+');
console.log('\n📝 Next: Need to update product cards and table with correct prices and colors');