#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the generated table HTML
const tableHTML = fs.readFileSync(path.join(__dirname, 'comparison-table-section.html'), 'utf8');

// Read the main HTML file
const mainHTMLPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let mainHTML = fs.readFileSync(mainHTMLPath, 'utf8');

// Extract just the price guide HTML
const priceGuideHTML = `
    <div class="price-guide-section bg-base-200 p-6 rounded-lg mb-8 border border-base-300 max-w-3xl mx-auto">
      <h3 class="text-lg font-bold mb-3 text-accent">Price Guide:</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-green-500">$</span>
          <span class="text-sm text-gray-400">Under $500</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-yellow-500">$$</span>
          <span class="text-sm text-gray-400">$500 - $999</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-orange-500">$$$</span>
          <span class="text-sm text-gray-400">$1000 - $1999</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-red-500">$$$$</span>
          <span class="text-sm text-gray-400">$2000+</span>
        </div>
      </div>
    </div>`;

// Step 1: Insert price guide after the intro paragraph
// Find the paragraph that contains "for a Sparkling Pool."
const introPattern = /<p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">\s*Stop Wasting Time[^<]*for a Sparkling Pool\.\s*<\/p>/s;
const introMatch = mainHTML.match(introPattern);

if (introMatch) {
  // Replace the paragraph with itself plus the price guide
  const newContent = introMatch[0] + '\n            ' + priceGuideHTML;
  mainHTML = mainHTML.replace(introMatch[0], newContent);
  console.log('✅ Price guide inserted after intro text');
} else {
  console.log('⚠️  Could not find intro paragraph');
}

// Step 2: Find where to insert the comparison table
// Look for the end of the products grid section (after all product cards)
const lastProductPattern = /<\/div>\s*<\/div>\s*<\/section>\s*(?=<!--|\s*<)/;
let insertPosition = -1;

// Find all section closing tags
const sectionMatches = [...mainHTML.matchAll(/<\/section>/g)];

// The products section should be the second section (after hero)
if (sectionMatches.length >= 2) {
  insertPosition = sectionMatches[1].index + sectionMatches[1][0].length;
  
  // Insert the comparison table
  mainHTML = mainHTML.substring(0, insertPosition) + '\n\n' + tableHTML + '\n' + mainHTML.substring(insertPosition);
  console.log('✅ Comparison table section inserted after products grid');
} else {
  console.log('❌ Could not find suitable position for comparison table');
}

// Save the updated HTML
fs.writeFileSync(mainHTMLPath, mainHTML);

// Also save a backup
const backupPath = path.join(__dirname, 'best-robotic-pool-cleaners-with-table.html');
fs.writeFileSync(backupPath, mainHTML);

console.log('\n📊 Integration complete!');
console.log('✅ Price guide added after intro text');
console.log('✅ Full comparison table section added after products');
console.log('📄 Updated:', mainHTMLPath);
console.log('📄 Backup saved:', backupPath);
console.log('\n🎯 Next steps:');
console.log('1. Build the site: npm run build');
console.log('2. Preview locally: npm run preview');
console.log('3. Deploy: ./scripts/github-deploy.sh');