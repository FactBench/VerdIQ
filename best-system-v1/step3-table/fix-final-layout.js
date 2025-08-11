#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the current HTML
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// IMPORTANT: Create instructions for what NOT to change
const DONT_CHANGE_INSTRUCTIONS = `
/*************************************************************
 * IMPORTANT: DO NOT MODIFY THE FOLLOWING SECTIONS:
 * 
 * 1. HERO SECTION (lines 1-160 approx)
 *    - Contains the main title and intro
 *    
 * 2. PRODUCTS GRID SECTION (lines 164-1375 approx)  
 *    - This is from Step 2 - contains all 11 product cards
 *    - Starts with: <!-- Products Grid -->
 *    - Ends with: </section> (after Betta SE Solar product)
 *    - DO NOT add price guide here!
 *    - DO NOT modify the structure!
 *    
 * 3. ONLY MODIFY:
 *    - The comparison table section
 *    - Add price guide ONLY before the comparison table
 *    
 *************************************************************/
`;

console.log(DONT_CHANGE_INSTRUCTIONS);

// Find where the comparison table section is
const tableStart = html.indexOf('<!-- Comparison Table Section -->');
if (tableStart === -1) {
  console.log('⚠️  No comparison table section found - need to add it');
  
  // Find the end of products section to insert after it
  const productsEnd = html.lastIndexOf('</section>');
  if (productsEnd !== -1) {
    // Read the horizontal table HTML
    const tableHTML = fs.readFileSync(path.join(__dirname, 'horizontal-table-section.html'), 'utf8');
    
    // Insert after products section
    html = html.substring(0, productsEnd + 10) + '\n\n' + tableHTML + '\n' + html.substring(productsEnd + 10);
    console.log('✅ Added comparison table section after products');
  }
} else {
  console.log('✅ Comparison table section exists at position:', tableStart);
  // The table already exists, it should have the price guide with it
}

// Save the fixed HTML
fs.writeFileSync(htmlPath, html);

// Also save these instructions
fs.writeFileSync(path.join(__dirname, 'DO-NOT-CHANGE-INSTRUCTIONS.txt'), DONT_CHANGE_INSTRUCTIONS);

console.log('\n✅ Layout fixed!');
console.log('📝 Instructions saved to: DO-NOT-CHANGE-INSTRUCTIONS.txt');
console.log('\n⚠️  REMEMBER:');
console.log('- Products section (Step 2) should NOT be modified');
console.log('- Price guide goes ONLY with the comparison table');
console.log('- Comparison table comes AFTER products section');