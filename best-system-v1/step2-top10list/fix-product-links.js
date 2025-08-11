const fs = require('fs');
const path = require('path');

// Read the correct product structure (with names and features)
const correctProducts = JSON.parse(fs.readFileSync('correct-products-data.json', 'utf8'));

// Read the source with correct Amazon links
const sourceData = JSON.parse(fs.readFileSync('../../src/data/pool-cleaners-data.json', 'utf8'));

// Create mapping of product names to Amazon links from source
const linkMapping = {};
sourceData.products.forEach(product => {
  linkMapping[product.name] = product.amazonLink;
});

// Map the correct Amazon links to our products
const updatedProducts = correctProducts.products.map(product => {
  // Direct name match
  if (linkMapping[product.name]) {
    product.amazonLink = linkMapping[product.name];
  } 
  // Special cases where names don't match exactly
  else if (product.name === "Polaris PCX 868 iQ Smart Robotic" && linkMapping["Polaris PCX 868 iQ"]) {
    product.amazonLink = linkMapping["Polaris PCX 868 iQ"];
  }
  else if (product.name === "Polaris 9550 Sport Robotic" && linkMapping["Polaris 9550 Sport Robotic"]) {
    product.amazonLink = linkMapping["Polaris 9550 Sport Robotic"];
  }
  else if (product.name === "WYBOT C2 Vision AI Camera Cordless") {
    // This product doesn't exist in source, keeping # placeholder
    console.log(`No match found for: ${product.name}`);
  }
  else if (product.name === "Betta SE Solar Powered Pool Skimmer") {
    // This product doesn't exist in source, keeping # placeholder
    console.log(`No match found for: ${product.name}`);
  }
  
  return product;
});

// Manually add the remaining products that weren't in the source data
// Based on the extracted-data/amazon-links.json file
const manualLinks = {
  "Dolphin E10 (2025 Model)": "https://amzn.to/42ZmMij",
  "Polaris PCX 868 iQ Smart Robotic": "https://amzn.to/44LZkXf", 
  "BeatBot AquaSense 2 Ultra": "https://amzn.to/45WYVli",
  "AIPER Scuba X1 Cordless": "https://amzn.to/4mhNZnN",
  "Dolphin Premier": "https://amzn.to/4doxYIQ",
  "Polaris 9550 Sport Robotic": "https://amzn.to/43k9coy"
};

// Apply manual links
updatedProducts.forEach(product => {
  if (manualLinks[product.name] && product.amazonLink === "#") {
    product.amazonLink = manualLinks[product.name];
  }
});

// Products 7 and 11 (WYBOT C2 Vision and Betta SE Solar) don't have Amazon links in our data
// These will remain as # placeholders

// Save the updated products data
const finalData = {
  products: updatedProducts
};

fs.writeFileSync('products-data-fixed.json', JSON.stringify(finalData, null, 2));

console.log('\nUpdated products with correct Amazon links:');
updatedProducts.forEach(product => {
  console.log(`${product.position}. ${product.name}: ${product.amazonLink}`);
});

console.log('\nProducts without Amazon links (keeping # placeholder):');
updatedProducts.forEach(product => {
  if (product.amazonLink === "#") {
    console.log(`- ${product.name}`);
  }
});