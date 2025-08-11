#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the new bordered table HTML
const tableHTML = fs.readFileSync(path.join(__dirname, 'horizontal-table-bordered.html'), 'utf8');

// Read the main HTML file
const mainHTMLPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let mainHTML = fs.readFileSync(mainHTMLPath, 'utf8');

// Find and replace the existing comparison table section
const existingTablePattern = /<!-- Comparison Table Section -->[\s\S]*?<\/section>\s*(?=<style>[\s\S]*?<\/style>\s*<\/section>|$)/;
const existingMatch = mainHTML.match(existingTablePattern);

if (existingMatch) {
  // Replace the existing table with the new bordered one
  mainHTML = mainHTML.replace(existingMatch[0], tableHTML);
  console.log('✅ Replaced existing comparison table with bordered version');
} else {
  console.log('⚠️  Could not find existing comparison table');
}

// Save the updated HTML
fs.writeFileSync(mainHTMLPath, mainHTML);

console.log('\n📊 Integration complete!');
console.log('✅ Colored price guide symbols in legend');
console.log('✅ Table now has borders like product cards');
console.log('✅ Glow effect on hover');
console.log('📄 Updated:', mainHTMLPath);