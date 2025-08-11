const fs = require('fs');

// Read current products data
const products = JSON.parse(fs.readFileSync('products-data.json', 'utf8'));

// Update the missing links
products.products.forEach(product => {
  // WYBOT C2 Vision - use Levanta link
  if (product.name === "WYBOT C2 Vision AI Camera Cordless" && product.amazonLink === "#") {
    product.amazonLink = "https://lvnta.com/lv_ILlWjOeeWqMN1DftfW";
    console.log(`✅ Updated ${product.name} with Levanta link`);
  }
  
  // Betta SE Solar - use Levanta link
  if (product.name === "Betta SE Solar Powered Pool Skimmer" && product.amazonLink === "#") {
    product.amazonLink = "https://lvnta.com/lv_I70QBlQMd7o0ZVj05H";
    console.log(`✅ Updated ${product.name} with Levanta link`);
  }
  
  // Also verify AIPER Scuba X1 has the correct link
  if (product.name === "AIPER Scuba X1 Cordless") {
    // The list shows https://amzn.to/45szS9A but we have https://amzn.to/4mhNZnN
    // Let's update to match the list
    product.amazonLink = "https://amzn.to/45szS9A";
    console.log(`✅ Updated ${product.name} with correct Amazon link`);
  }
});

// Save updated data
fs.writeFileSync('products-data.json', JSON.stringify(products, null, 2));

console.log('\n📋 Final link status for all 11 products:');
products.products.forEach(product => {
  const linkType = product.amazonLink.includes('amzn.to') ? 'Amazon' : 
                   product.amazonLink.includes('lvnta.com') ? 'Levanta' : 
                   product.amazonLink === '#' ? 'NO LINK' : 'Other';
  console.log(`${product.position}. ${product.name}: ${product.amazonLink} (${linkType})`);
});