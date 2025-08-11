#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CORRECT Price Guide HTML with colored symbols
const CORRECT_PRICE_GUIDE = `<p class="text-center text-gray-400 mb-4"><strong>Price Guide:</strong> <span class="text-green-500 font-bold">$</span> = Under $500 | <span class="text-yellow-500 font-bold">$$</span> = $500 - $999 | <span class="text-orange-500 font-bold">$$$</span> = $1000 - $1999 | <span class="text-red-500 font-bold">$$$$</span> = $2000+</p>`;

// Read the main HTML
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace ALL price guides with the correct colored version
const priceGuidePattern = /<p[^>]*><strong>Price Guide:<\/strong>[^<]+<\/p>/g;

let replacements = 0;
html = html.replace(priceGuidePattern, () => {
  replacements++;
  return CORRECT_PRICE_GUIDE;
});

console.log(`✅ Replaced ${replacements} price guides with CORRECT colored format`);

// Save the updated HTML
fs.writeFileSync(htmlPath, html);

// Now update the horizontal table HTML to include the colored price guide
const tableHTML = fs.readFileSync(path.join(__dirname, 'horizontal-table-section.html'), 'utf8');
const updatedTableHTML = tableHTML.replace(priceGuidePattern, CORRECT_PRICE_GUIDE);
fs.writeFileSync(path.join(__dirname, 'horizontal-table-section.html'), updatedTableHTML);

console.log('\n✅ Fixed Price Guide:');
console.log('   Format: $ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+');
console.log('   Colors: $ (green) | $$ (yellow) | $$$ (orange) | $$$$ (red)');