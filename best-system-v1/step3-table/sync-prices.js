#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read both data files
const productsData = JSON.parse(fs.readFileSync('/home/titan/FactBench/best-system-v1/step2-top10list/products-data.json', 'utf8'));
const tableData = JSON.parse(fs.readFileSync(path.join(__dirname, 'table-data.json'), 'utf8'));

console.log('Comparing prices between products and table:\n');

let mismatches = 0;

// Compare prices
productsData.products.forEach((product, index) => {
  const tableProduct = tableData.products.find(p => p.name === product.name);
  
  if (tableProduct) {
    if (product.price !== tableProduct.priceGuide) {
      console.log(`❌ Mismatch for ${product.name}:`);
      console.log(`   Products: ${product.price}`);
      console.log(`   Table: ${tableProduct.priceGuide}`);
      
      // Fix the table data to match products data
      tableProduct.priceGuide = product.price;
      mismatches++;
    } else {
      console.log(`✅ ${product.name}: ${product.price} (matches)`);
    }
  } else {
    console.log(`⚠️  ${product.name} not found in table data`);
  }
});

if (mismatches > 0) {
  // Save the corrected table data
  fs.writeFileSync(path.join(__dirname, 'table-data.json'), JSON.stringify(tableData, null, 2));
  console.log(`\n✅ Fixed ${mismatches} price mismatches in table data`);
  
  // Regenerate the table HTML
  console.log('\n📊 Regenerating table with correct prices...');
  require('./generate-horizontal-table.js');
} else {
  console.log('\n✅ All prices match correctly!');
}

// Show final price distribution
console.log('\n📊 Price Distribution:');
const priceCounts = {};
productsData.products.forEach(p => {
  priceCounts[p.price] = (priceCounts[p.price] || 0) + 1;
});
Object.entries(priceCounts).forEach(([price, count]) => {
  const color = {
    '$': '🟢',
    '$$': '🟡',
    '$$$': '🟠',
    '$$$$': '🔴'
  }[price];
  console.log(`${color} ${price}: ${count} products`);
});