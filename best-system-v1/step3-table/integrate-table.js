#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the generated table HTML
const tableHTML = fs.readFileSync(path.join(__dirname, 'comparison-table-section.html'), 'utf8');

// Read the main HTML file
const mainHTMLPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let mainHTML = fs.readFileSync(mainHTMLPath, 'utf8');

// Extract just the price guide from the table HTML
const priceGuideMatch = tableHTML.match(/<div class="price-guide-section[^>]*>[\s\S]*?<\/div>\s*<\/div>/);
const priceGuideHTML = priceGuideMatch ? priceGuideMatch[0] : '';

// First, add the price guide after the intro text
// Find the text that ends with "for a Sparkling Pool."
const introTextPattern = /Stop Wasting Time and Money on Pool Upkeep!.*?for a Sparkling Pool\./s;
const introMatch = mainHTML.match(introTextPattern);

if (introMatch) {
  const insertPosition = introMatch.index + introMatch[0].length;
  const beforeIntro = mainHTML.substring(0, insertPosition);
  const afterIntro = mainHTML.substring(insertPosition);
  
  // Insert price guide after the intro text
  mainHTML = beforeIntro + '\n            </p>\n            \n            ' + priceGuideHTML + '\n            <p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">' + afterIntro;
  
  console.log('✅ Price guide inserted after intro text');
} else {
  console.log('⚠️  Could not find intro text pattern');
}

// Now insert the full comparison table section
// Find a good insertion point - after the products grid section
const productsEndPattern = /<\/section>\s*<!--\s*(?:End Products Grid|Products Grid End)/;
const productsEndMatch = mainHTML.match(productsEndPattern);

if (productsEndMatch) {
  const insertPosition = productsEndMatch.index + productsEndMatch[0].length;
  mainHTML = mainHTML.substring(0, insertPosition) + '\n\n' + tableHTML + '\n' + mainHTML.substring(insertPosition);
  console.log('✅ Comparison table section inserted');
} else {
  // Alternative: Look for the closing of the products section
  const altPattern = /<\/section>\s*(?=<section|<footer|$)/;
  const matches = [...mainHTML.matchAll(altPattern)];
  
  if (matches.length > 0) {
    // Insert after the first major section (likely products)
    const match = matches[0];
    const insertPosition = match.index + match[0].length;
    mainHTML = mainHTML.substring(0, insertPosition) + '\n\n' + tableHTML + '\n' + mainHTML.substring(insertPosition);
    console.log('✅ Comparison table section inserted (alternative method)');
  } else {
    console.log('❌ Could not find suitable insertion point for table');
  }
}

// Save the updated HTML
fs.writeFileSync(mainHTMLPath, mainHTML);

console.log('\n📊 Integration complete!');
console.log('✅ Price guide added after intro text');
console.log('✅ Full comparison table section added');
console.log('📄 Updated:', mainHTMLPath);
console.log('\n🎯 Next steps:');
console.log('1. Build the site: npm run build');
console.log('2. Preview locally to test responsive design');
console.log('3. Deploy to GitHub Pages');