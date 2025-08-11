const fs = require('fs');

// Read current products data
const products = JSON.parse(fs.readFileSync('products-data.json', 'utf8'));

// New awards and price symbols mapping
const updates = [
  { position: 1, award: "Best OF THE BEST", price: "$$$$" },
  { position: 2, award: "Best Overall", price: "$$" },
  { position: 3, award: "Best Cordless", price: "$$" },
  { position: 4, award: "Best Above-Ground", price: "$" },
  { position: 5, award: "Top Smart-Features", price: "$$$" },
  { position: 6, award: "Best Large-Pools", price: "$$$$" },
  { position: 7, award: "Best AI-Navigation", price: "$$$" },
  { position: 8, award: "Premium Cordless", price: "$$$" },
  { position: 9, award: "Best Filtration", price: "$$$$" },
  { position: 10, award: "Proven Powerhouse", price: "$$$" },
  { position: 11, award: "Best Surface-Skimmer", price: "$" }
];

// Update products with new awards and prices
products.products.forEach(product => {
  const update = updates.find(u => u.position === product.position);
  if (update) {
    product.award = update.award;
    product.price = update.price;
    console.log(`✅ Updated ${product.name}:`);
    console.log(`   Award: ${product.award}`);
    console.log(`   Price: ${product.price}`);
  }
});

// Save updated data
fs.writeFileSync('products-data.json', JSON.stringify(products, null, 2));

console.log('\n📊 All products updated with new awards and price symbols!');