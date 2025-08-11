#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read products data
const productsData = JSON.parse(fs.readFileSync('products-data.json', 'utf8'));

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(imagesDir, filename));
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(path.join(imagesDir, filename));
        resolve({ filename, size: stats.size });
      });
    }).on('error', (err) => {
      fs.unlink(path.join(imagesDir, filename), () => {});
      reject(err);
    });
  });
}

// Function to create filename from product name
function createFilename(productName) {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.jpg';
}

// Main download function
async function downloadAllImages() {
  console.log('🖼️  Starting image downloads...\n');
  
  const results = [];
  
  for (const product of productsData.products) {
    const filename = createFilename(product.name);
    
    try {
      console.log(`📥 Downloading: ${product.name}`);
      console.log(`   URL: ${product.imageUrl}`);
      
      const result = await downloadImage(product.imageUrl, filename);
      console.log(`   ✅ Success: ${filename} (${(result.size / 1024).toFixed(1)}KB)`);
      
      results.push({
        product: product.name,
        filename: filename,
        size: result.size,
        status: 'success'
      });
      
      // Update product data with local path
      product.localImagePath = `/images/${filename}`;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      results.push({
        product: product.name,
        filename: filename,
        status: 'failed',
        error: error.message
      });
    }
    
    console.log('');
  }
  
  // Save updated products data with local image paths
  fs.writeFileSync('products-data.json', JSON.stringify(productsData, null, 2));
  
  // Generate download report
  const report = {
    timestamp: new Date().toISOString(),
    total: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    results: results
  };
  
  fs.writeFileSync('image-download-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📊 Download Summary:');
  console.log(`✅ Successful: ${report.successful}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`📁 Images saved to: ${imagesDir}`);
  console.log(`📄 Report saved to: image-download-report.json`);
}

// Run the download
downloadAllImages().catch(console.error);