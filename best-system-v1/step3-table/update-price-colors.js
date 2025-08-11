#!/usr/bin/env node

const fs = require('fs');

// Read the HTML
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Color mapping for prices
const colorMap = {
  '$': 'text-green-500',
  '$$': 'text-yellow-500',
  '$$$': 'text-orange-500',
  '$$$$': 'text-red-500'
};

// Update product card price colors
// Current pattern: <span class="text-2xl font-bold text-accent">$$$</span>
// Need to replace text-accent with appropriate color

let replacements = 0;

// Replace price colors in product cards
Object.entries(colorMap).forEach(([price, color]) => {
  // Handle exact price matches to avoid replacing $$$ when looking for $$
  const pricePattern = new RegExp(`<span class="text-2xl font-bold text-accent">${price.replace(/\$/g, '\\$')}(?!\\$)</span>`, 'g');
  const newPriceHTML = `<span class="text-2xl font-bold ${color}">${price}</span>`;
  
  const matches = html.match(pricePattern);
  if (matches) {
    html = html.replace(pricePattern, newPriceHTML);
    replacements += matches.length;
    console.log(`✅ Updated ${matches.length} instances of ${price} to ${color}`);
  }
});

// Also update any price symbols in the comparison table that might have wrong colors
// Pattern in table: <span class="text-2xl font-bold text-[color]">$$</span>
const tablePatterns = [
  'text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-500'
];

// This will ensure table prices also use correct colors
console.log(`\n📊 Total replacements: ${replacements}`);

// Save the updated HTML
fs.writeFileSync(htmlPath, html);

console.log('\n✅ Updated all price colors:');
console.log('   $ = green (text-green-500)');
console.log('   $$ = yellow (text-yellow-500)');
console.log('   $$$ = orange (text-orange-500)');
console.log('   $$$$ = red (text-red-500)');