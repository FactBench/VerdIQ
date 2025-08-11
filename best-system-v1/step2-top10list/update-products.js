#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read current products data
const currentData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products-data.json'), 'utf8'));

// Update with correct awards and links
const updates = [
  {
    position: 1,
    award: "🏆 Best OF THE BEST",
    amazonLink: "https://amzn.to/430399P",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2025/05/BeatBot_AquaSense_2_PRO.jpg"
  },
  {
    position: 2,
    award: "🏆 Best Overall",
    amazonLink: "https://amzn.to/44Awf0K",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2025/04/dolphin-nautilus-cc-plus.jpg"
  },
  {
    position: 3,
    award: "🏆 Best Cordless",
    amazonLink: "https://amzn.to/43gzisz",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/2024AIPERScubaS1Cordless.jpg"
  },
  {
    position: 4,
    name: "Dolphin E10 (2025 Model)",
    award: "🏆 Best for Above-Ground Pools",
    amazonLink: "https://amzn.to/4fKR8Tz",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/dolphin-e10.jpg"
  },
  {
    position: 5,
    name: "Polaris PCX 868 iQ Smart Robotic",
    award: "🏆 Top Smart Features",
    amazonLink: "https://amzn.to/4dpEpxZ",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/polaris-vrx-iq.jpg"
  },
  {
    position: 6,
    name: "BeatBot AquaSense 2 Ultra",
    award: "🏆 Best for Large Pools",
    amazonLink: "https://amzn.to/4dXrKLm",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2025/05/BeatBot_AquaSense_2_Ultra.jpg"
  },
  {
    position: 7,
    name: "WYBOT C2 Vision AI Camera Cordless",
    award: "🏆 Best AI Navigation",
    amazonLink: "https://amzn.to/3ADtPLR",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/wybot-c2-vision.jpg"
  },
  {
    position: 8,
    name: "AIPER Scuba X1 Cordless Robotic Pool Cleaner",
    award: "🏆 Best Premium Cordless",
    amazonLink: "https://amzn.to/3CqxZM9",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/aiper-scuba-x1.jpg"
  },
  {
    position: 9,
    name: "Betta SE Solar Powered Pool Skimmer",
    award: "🏆 Best Surface Skimmer",
    amazonLink: "https://amzn.to/46Gq8VM",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/betta-se-solar.jpg"
  },
  {
    position: 10,
    name: "Dolphin Premier",
    award: "🏆 Best Filtration Versatility",
    amazonLink: "https://amzn.to/3YdKLmN",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/dolphin-premier.jpg"
  },
  {
    position: 11,
    name: "Polaris 9550 Sport Robotic",
    award: "🏆 Proven Cleaning Powerhouse",
    amazonLink: "https://amzn.to/4fECH8x",
    imageUrl: "https://www.zoopy.com/wp-content/uploads/2024/07/polaris-9550-sport.jpg"
  }
];

// Apply updates
updates.forEach(update => {
  const product = currentData.products.find(p => p.position === update.position);
  if (product) {
    if (update.award) product.award = update.award;
    if (update.amazonLink) product.amazonLink = update.amazonLink;
    if (update.imageUrl) product.imageUrl = update.imageUrl;
    if (update.name) product.name = update.name;
  }
});

// Save updated data
fs.writeFileSync(path.join(__dirname, 'products-data.json'), JSON.stringify(currentData, null, 2));

console.log('✅ Updated all products with correct awards and Amazon links');
console.log('📝 Ready to download images and regenerate HTML');