const fs = require('fs');

// Read current products data
const products = JSON.parse(fs.readFileSync('products-data.json', 'utf8'));

// Update all image URLs to use local paths
products.products.forEach(product => {
  // Extract filename from URL if it's an external URL
  if (product.imageUrl.startsWith('http')) {
    const filename = product.imageUrl.split('/').pop();
    product.imageUrl = `/VerdIQ/assets/images/products/${filename}`;
  }
  // Keep local paths as is
});

// Special case - we need to check if polaris-pcx-868-iq.jpg exists or if it's polaris-vrx-iq.jpg
const polarisProduct = products.products.find(p => p.name.includes("Polaris PCX 868"));
if (polarisProduct) {
  // Use polaris-vrx-iq.jpg since that's what we have
  polarisProduct.imageUrl = "/VerdIQ/assets/images/products/polaris-vrx-iq.jpg";
}

// Save updated data
fs.writeFileSync('products-data.json', JSON.stringify(products, null, 2));

console.log('Updated all image paths to local:');
products.products.forEach(product => {
  console.log(`${product.position}. ${product.name}: ${product.imageUrl}`);
});