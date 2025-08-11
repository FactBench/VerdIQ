#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the new horizontal table HTML
const tableHTML = fs.readFileSync(path.join(__dirname, 'horizontal-table-section.html'), 'utf8');

// Read the main HTML file
const mainHTMLPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let mainHTML = fs.readFileSync(mainHTMLPath, 'utf8');

// First, add inline price guide after the intro text if not already there
const introPattern = /<p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">\s*Stop Wasting Time[^<]*for a Sparkling Pool\.\s*<\/p>/s;
const introMatch = mainHTML.match(introPattern);

if (introMatch && !mainHTML.includes('Price Guide:</strong>')) {
  // Add inline price guide after the intro
  const inlinePriceGuide = '\n            <p class="text-center text-gray-400 mb-4"><strong>Price Guide:</strong> $ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+</p>';
  const insertPos = introMatch.index + introMatch[0].length;
  mainHTML = mainHTML.substring(0, insertPos) + inlinePriceGuide + mainHTML.substring(insertPos);
  console.log('✅ Added inline price guide after intro text');
}

// Now find and replace the existing comparison table section
const existingTablePattern = /<!-- Comparison Table Section -->[\s\S]*?<\/section>\s*(?=<style>[\s\S]*?<\/style>\s*<\/section>|$)/;
const existingMatch = mainHTML.match(existingTablePattern);

if (existingMatch) {
  // Replace the existing table with the new horizontal one
  mainHTML = mainHTML.replace(existingMatch[0], tableHTML);
  console.log('✅ Replaced existing comparison table with horizontal version');
} else {
  // If no existing table found, insert after products section
  const productsEndPattern = /<\/section>\s*(?=<\/section>|<!-- FAQ|$)/;
  const matches = [...mainHTML.matchAll(productsEndPattern)];
  
  if (matches.length > 0) {
    // Insert after the first major section (likely products)
    const match = matches[0];
    const insertPosition = match.index + match[0].length;
    mainHTML = mainHTML.substring(0, insertPosition) + '\n\n' + tableHTML + '\n' + mainHTML.substring(insertPosition);
    console.log('✅ Inserted horizontal comparison table');
  }
}

// Save the updated HTML
fs.writeFileSync(mainHTMLPath, mainHTML);

// Also save a backup
const backupPath = path.join(__dirname, 'best-robotic-pool-cleaners-horizontal.html');
fs.writeFileSync(backupPath, mainHTML);

console.log('\n📊 Integration complete!');
console.log('✅ Inline price guide format applied');
console.log('✅ Horizontal comparison table integrated');
console.log('📄 Updated:', mainHTMLPath);
console.log('📄 Backup saved:', backupPath);
console.log('\n🎯 Table is now horizontal with:');
console.log('   - Products as columns');
console.log('   - Attributes as rows');
console.log('   - Sticky first column');
console.log('   - Inline price guide');