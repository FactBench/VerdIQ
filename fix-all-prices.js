#!/usr/bin/env node

const fs = require('fs');

// Correct prices from user
const correctPrices = {
  "BeatBot AquaSense 2 Pro": "$$$$",
  "Dolphin Nautilus CC Plus Wi-Fi": "$$", 
  "AIPER Scuba S1 Cordless": "$$",
  "Dolphin E10 (2025 Model)": "$",
  "Polaris PCX 868 iQ Smart Robotic": "$$$",
  "BeatBot AquaSense 2 Ultra": "$$$$",
  "WYBOT C2 Vision AI Camera Cordless": "$$",
  "AIPER Scuba X1 Cordless": "$$$",
  "Dolphin Premier": "$$$",
  "Polaris 9550 Sport Robotic": "$$$",
  "Betta SE Solar Powered Pool Skimmer": "$"
};

// Color mapping
const priceColors = {
  "$": "green",
  "$$": "yellow", 
  "$$$": "orange",
  "$$$$": "red"
};

const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('🔍 Finding and fixing all product prices...\n');

// First, let's find all products and their current prices
Object.entries(correctPrices).forEach(([productName, correctPrice]) => {
  const color = priceColors[correctPrice];
  console.log(`\n📦 ${productName} should be ${correctPrice} (${color})`);
  
  // Find product in main listing
  const productRegex = new RegExp(`(<h3[^>]*>${productName}</h3>[\\s\\S]*?<span class="text-2xl font-bold text-(\\w+)-500">)(\\$+)(</span>)`, 'g');
  
  let matches = 0;
  html = html.replace(productRegex, (match, before, currentColor, currentPrice, after) => {
    if (currentPrice !== correctPrice || currentColor !== color) {
      matches++;
      console.log(`  ✅ Fixed main listing: ${currentPrice} (${currentColor}) → ${correctPrice} (${color})`);
      return `${before.replace(`text-${currentColor}-500`, `text-${color}-500`)}${correctPrice}${after}`;
    }
    return match;
  });
  
  if (matches === 0) {
    console.log(`  ⚠️  Product not found in main listing or already correct`);
  }
});

// Now fix the comparison table
console.log('\n\n📊 Fixing comparison table prices...');

// The order in comparison table based on the headers
const tableOrder = [
  "BeatBot AquaSense 2 Pro",
  "Dolphin Nautilus CC Plus Wi-Fi", 
  "AIPER Scuba S1 Cordless",
  "Dolphin E10 (2025 Model)",
  "Polaris PCX 868 iQ Smart Robotic",
  "BeatBot AquaSense 2 Ultra",
  "WYBOT C2 Vision AI Camera Cordless",
  "AIPER Scuba X1 Cordless",
  "Dolphin Premier",
  "Polaris 9550 Sport Robotic"
];

// Find the price row in the table
const priceRowRegex = /(<td class="p-4 font-semibold sticky left-0 bg-base-100 border-r-2 border-base-100">Price Guide<\/td>)([\s\S]*?)(<\/tr>)/;
const priceRowMatch = html.match(priceRowRegex);

if (priceRowMatch) {
  let priceRow = priceRowMatch[2];
  let newPriceRow = priceRow;
  
  // Extract all price cells
  const priceCells = priceRow.match(/<td class="p-4 text-center text-sm border-r border-base-100  "><span class="text-2xl font-bold text-(\w+)-500">(\$+)<\/span><\/td>/g);
  
  if (priceCells && priceCells.length === tableOrder.length) {
    priceCells.forEach((cell, index) => {
      const productName = tableOrder[index];
      const correctPrice = correctPrices[productName];
      const correctColor = priceColors[correctPrice];
      
      const cellMatch = cell.match(/text-(\w+)-500">(\$+)</);
      if (cellMatch) {
        const [, currentColor, currentPrice] = cellMatch;
        
        if (currentPrice !== correctPrice || currentColor !== correctColor) {
          console.log(`  ✅ Fixed ${productName}: ${currentPrice} (${currentColor}) → ${correctPrice} (${correctColor})`);
          const newCell = cell.replace(`text-${currentColor}-500">${currentPrice}`, `text-${correctColor}-500">${correctPrice}`);
          newPriceRow = newPriceRow.replace(cell, newCell);
        }
      }
    });
    
    html = html.replace(priceRowMatch[0], priceRowMatch[1] + newPriceRow + priceRowMatch[3]);
  }
}

// Fix quick view cards
console.log('\n\n🎯 Fixing quick view cards...');

Object.entries(correctPrices).forEach(([productName, correctPrice]) => {
  const color = priceColors[correctPrice];
  
  // Quick view cards have a simpler structure
  const cardRegex = new RegExp(`(<h3 class="card-title">${productName}</h3>\\s*<span class="text-2xl font-bold text-(\\w+)-500">)(\\$+)(</span>)`, 'g');
  
  html = html.replace(cardRegex, (match, before, currentColor, currentPrice, after) => {
    if (currentPrice !== correctPrice || currentColor !== color) {
      console.log(`  ✅ Fixed quick view for ${productName}: ${currentPrice} → ${correctPrice}`);
      return `${before.replace(`text-${currentColor}-500`, `text-${color}-500`)}${correctPrice}${after}`;
    }
    return match;
  });
});

// Save the updated HTML
fs.writeFileSync(htmlPath, html);

console.log('\n\n✅ All prices have been updated!');
console.log('📄 Updated file:', htmlPath);