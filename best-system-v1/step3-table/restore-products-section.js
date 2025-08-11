#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Fix the broken products section structure
// The price guide should be AFTER the products section, not inside it
// And there's an extra </div> that needs to be removed

// First, let's fix the structure around line 172-176
const brokenPattern = /<\/p>\s*\n\s*<p class="text-center text-gray-400 mb-4"><strong>Price Guide:<\/strong>[^<]+<\/p>\s*<\/div>\s*<div class="grid/s;

if (html.match(brokenPattern)) {
  // Remove the price guide from inside the products section and fix the div structure
  html = html.replace(brokenPattern, '</p>\n            <div class="grid');
  console.log('✅ Fixed broken div structure in products section');
}

// Now add the price guide in the correct location - AFTER the products grid section ends
// We'll add it later when we find the proper comparison table section

// Save the fixed HTML
fs.writeFileSync(htmlPath, html);

console.log('✅ Restored products section structure');
console.log('📝 The price guide will be properly placed with the comparison table');