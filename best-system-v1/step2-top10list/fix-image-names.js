const https = require('https');
const fs = require('fs');
const path = require('path');

// Images that need to be re-downloaded with correct names
const imagesToFix = [
  { 
    product: 'Polaris PCX 868 iQ', 
    url: 'https://www.zoopy.com/wp-content/uploads/2025/05/Polaris_PCX_868_iQs.jpg',
    currentFile: 'polaris-pcx-868-iq.jpg',
    correctFile: 'polaris-pcx-868-iqs.jpg'
  },
  { 
    product: 'BeatBot AquaSense 2 Ultra', 
    url: 'https://www.zoopy.com/wp-content/uploads/2025/05/BeaBot_AquaSense_2_Ultra.jpg',
    currentFile: 'beatbot-aquasense-2-ultra.jpg', 
    correctFile: 'beatbot-aquasense-2-ultra.jpg' // Keep same name but re-download from correct URL
  }
];

const targetDir = '/home/titan/FactBench/src/assets/images/products';

// Function to download image
function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(targetDir, imageData.correctFile);
    const file = fs.createWriteStream(filePath);

    https.get(imageData.url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          console.log(`✅ ${imageData.product}: Downloaded ${imageData.correctFile} (${Math.round(stats.size / 1024)}KB)`);
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(filePath);
        console.log(`❌ ${imageData.product}: Failed to download (Status: ${response.statusCode})`);
        resolve();
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.log(`❌ ${imageData.product}: Error downloading - ${err.message}`);
      resolve();
    });
  });
}

// Main function
async function fixImages() {
  console.log('🔧 Fixing image issues...\n');
  
  // Download correct images
  for (const imageData of imagesToFix) {
    await downloadImage(imageData);
  }
  
  // Update products-data.json with correct image paths
  const productsPath = '/home/titan/FactBench/best-system-v1/step2-top10list/products-data.json';
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  
  products.products.forEach(product => {
    if (product.name === "Polaris PCX 868 iQ Smart Robotic") {
      product.imageUrl = "/VerdIQ/assets/images/products/polaris-pcx-868-iqs.jpg";
      console.log(`\n✅ Updated ${product.name} image URL`);
    }
  });
  
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  
  console.log('\n📊 Final check - all images should be correct now:');
  const imageFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.jpg'));
  imageFiles.forEach(file => {
    const stats = fs.statSync(path.join(targetDir, file));
    const size = Math.round(stats.size / 1024);
    const status = size > 10 ? '✅' : '⚠️';
    console.log(`${status} ${file}: ${size}KB`);
  });
}

fixImages();