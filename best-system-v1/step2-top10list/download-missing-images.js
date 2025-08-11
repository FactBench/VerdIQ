const https = require('https');
const fs = require('fs');
const path = require('path');

// Image URLs found from smart search
const imagesToDownload = [
  { product: 'Dolphin E10', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/dolphin-e10.jpg', filename: 'dolphin-e10.jpg' },
  { product: 'Polaris PCX 868 iQ', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/Polaris-PCX-868-iQ.jpg', filename: 'polaris-pcx-868-iq.jpg' },
  { product: 'BeatBot AquaSense 2 Ultra', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/BeatBot-AquaSense-2-Ultra.jpg', filename: 'beatbot-aquasense-2-ultra.jpg' },
  { product: 'WYBOT C2 Vision', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/WYBOT-C2-Vision-AI-Camera-Cordless.jpg', filename: 'wybot-c2-vision.jpg' },
  { product: 'AIPER Scuba X1', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/AIPER-Scuba-X1-Cordless-Robotic-Pool-Cleaner.jpg', filename: 'aiper-scuba-x1.jpg' },
  { product: 'Dolphin Premier', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/Dolphin-Premier.jpg', filename: 'dolphin-premier.jpg' },
  { product: 'Polaris 9550 Sport', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/Polaris-9550-Sport-Robotic.jpg', filename: 'polaris-9550-sport.jpg' },
  { product: 'Betta SE Solar', url: 'https://www.zoopy.com/wp-content/uploads/2025/05/Betta-SE-Solar-Powered-Pool-Skimmer.jpg', filename: 'betta-se-solar.jpg' }
];

const targetDir = '/home/titan/FactBench/src/assets/images/products';

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to download image
function downloadImage(imageData) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(targetDir, imageData.filename);
    const file = fs.createWriteStream(filePath);

    https.get(imageData.url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          console.log(`✅ ${imageData.product}: Downloaded ${imageData.filename} (${Math.round(stats.size / 1024)}KB)`);
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(filePath);
        console.log(`❌ ${imageData.product}: Failed to download (Status: ${response.statusCode})`);
        resolve(); // Continue with other downloads
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.log(`❌ ${imageData.product}: Error downloading - ${err.message}`);
      resolve(); // Continue with other downloads
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('🚀 Starting download of missing product images...\n');
  
  for (const imageData of imagesToDownload) {
    await downloadImage(imageData);
  }
  
  console.log('\n✅ Download process complete!');
  
  // Verify final status
  console.log('\n📊 Final Status:');
  imagesToDownload.forEach(img => {
    const filePath = path.join(targetDir, img.filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 1000) { // More than 1KB means it's a real image
        console.log(`✅ ${img.product}: ${img.filename} (${Math.round(stats.size / 1024)}KB)`);
      } else {
        console.log(`⚠️  ${img.product}: ${img.filename} (Only ${stats.size} bytes - might be placeholder)`);
      }
    } else {
      console.log(`❌ ${img.product}: Missing`);
    }
  });
}

downloadAllImages();