#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the current HTML
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Remove the duplicate comparison table (the old one starting around line 2264)
// Find and remove from "<!-- Comparison Table -->" to the end of that section
const duplicateTablePattern = /<section id="comparison"[^>]*>[\s\S]*?<\/table>\s*<\/div>\s*<\/div>\s*<\/section>/;
const match = html.match(duplicateTablePattern);
if (match) {
  html = html.replace(match[0], '');
  console.log('✅ Removed duplicate comparison table');
} else {
  console.log('⚠️  Could not find duplicate table pattern');
}

// 2. Fix the Price Guide format - make it inline text instead of a box
const priceGuideBoxPattern = /<div class="price-guide-section[^>]*>[\s\S]*?<\/div>\s*<\/div>/g;
const inlinePriceGuide = '<p class="text-center text-gray-400 mb-4"><strong>Price Guide:</strong> $ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+</p>';

// Replace all price guide boxes with inline text
let replacements = 0;
html = html.replace(priceGuideBoxPattern, () => {
  replacements++;
  return inlinePriceGuide;
});
console.log(`✅ Replaced ${replacements} price guide boxes with inline text`);

// Save the cleaned HTML
fs.writeFileSync(htmlPath, html);
console.log('✅ Saved cleaned HTML');

// Now regenerate the comparison table with horizontal layout
console.log('\n📊 Regenerating comparison table with horizontal layout...');