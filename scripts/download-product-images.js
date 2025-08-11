#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read products data
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../best-system-v1/step2-top10list/products-data.json'), 'utf8'));

// Create products directory if it doesn't exist
const imagesDir = path.join(__dirname, '../src/assets/images/products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(imagesDir, filename));
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

// Function to get filename from URL
function getFilename(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Download all images
async function downloadAllImages() {
  console.log('🖼️  Downloading product images...\n');
  
  for (const product of productsData.products) {
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      const filename = getFilename(product.imageUrl);
      const localPath = path.join(imagesDir, filename);
      
      // Skip if already exists
      if (fs.existsSync(localPath)) {
        console.log(`✓ Already exists: ${filename}`);
        continue;
      }
      
      try {
        console.log(`⏬ Downloading: ${filename}...`);
        await downloadImage(product.imageUrl, filename);
        console.log(`✓ Downloaded: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to download ${filename}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ Image download complete!');
  console.log('📁 Images saved to:', imagesDir);
}

// Run the download
downloadAllImages().catch(console.error);