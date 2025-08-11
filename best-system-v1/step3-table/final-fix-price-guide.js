#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the main HTML file
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// The WRONG pattern that's appearing in the HTML (with single $ for both Under $500 and $500-$999)
const wrongPattern1 = /<span class="text-green-500 font-bold">\$<\/span> = Under \$500 \| <span class="text-yellow-500 font-bold">\$<\/span> = \$500 - \$999 \| <span class="text-orange-500 font-bold">\$\$<\/span> = \$1000 - \$1999 \| <span class="text-red-500 font-bold">\$\$<\/span> = \$2000\+/g;

// Another possible wrong pattern
const wrongPattern2 = /\$ = Under \$500 \| \$ = \$500 - \$999 \| \$\$ = \$1000 - \$1999 \| \$\$ = \$2000\+/g;

// The CORRECT format
const correctHTML = '<span class="text-green-500 font-bold">$</span> = Under $500 | <span class="text-yellow-500 font-bold">$$</span> = $500 - $999 | <span class="text-orange-500 font-bold">$$$</span> = $1000 - $1999 | <span class="text-red-500 font-bold">$$$$</span> = $2000+';

// Replace wrong patterns
let replacements = 0;

// Check and replace first pattern
if (html.match(wrongPattern1)) {
  html = html.replace(wrongPattern1, correctHTML);
  replacements++;
  console.log('✅ Fixed wrong colored price guide pattern');
}

// Check and replace second pattern
if (html.match(wrongPattern2)) {
  html = html.replace(wrongPattern2, '$ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+');
  replacements++;
  console.log('✅ Fixed wrong plain text price guide pattern');
}

// Also check for any remaining wrong patterns in the price guide
const priceGuidePattern = /<strong>Price Guide:<\/strong>[^<]+/g;
const matches = html.match(priceGuidePattern);
if (matches) {
  matches.forEach(match => {
    if (!match.includes('$$$')) {
      console.log('⚠️  Found wrong price guide:', match.substring(0, 100) + '...');
    }
  });
}

// Save the corrected HTML
fs.writeFileSync(htmlPath, html);

console.log(`\n📊 Made ${replacements} corrections`);
console.log('\n✅ CORRECT Price Guide format:');
console.log('   $ = Under $500');
console.log('   $$ = $500 - $999');
console.log('   $$$ = $1000 - $1999');
console.log('   $$$$ = $2000+');

// Also fix the table generation files
const tableFiles = [
  'horizontal-table-section.html',
  'horizontal-table-bordered.html'
];

tableFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the wrong patterns in these files too
    content = content.replace(wrongPattern1, correctHTML);
    content = content.replace(wrongPattern2, '$ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  }
});