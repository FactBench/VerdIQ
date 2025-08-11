const fs = require('fs');
const path = require('path');

console.log('🔍 Smart Search for Missing Images and Amazon Links\n');

// Products we need data for
const missingImageProducts = [
  'Dolphin E10',
  'Polaris PCX 868 iQ',
  'BeatBot AquaSense 2 Ultra',
  'WYBOT C2 Vision',
  'AIPER Scuba X1',
  'Dolphin Premier',
  'Polaris 9550 Sport',
  'Betta SE Solar'
];

const missingLinkProducts = [
  'WYBOT C2 Vision',
  'Betta SE Solar'
];

// Function to search text files for patterns
function searchInFile(filePath, searchTerms) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {};
    
    searchTerms.forEach(term => {
      // Create flexible search patterns
      const patterns = [
        // For images - look for URLs with product name
        new RegExp(`https?://[^"'\\s]*(?:${term.toLowerCase().replace(/\s+/g, '[\\s-]*')})[^"'\\s]*\\.(?:jpg|jpeg|png|webp)`, 'gi'),
        // For Amazon links near product name
        new RegExp(`${term}[^}]*?https?://amzn\\.to/[a-zA-Z0-9]+`, 'gi'),
        // Amazon links that might be before product name
        new RegExp(`https?://amzn\\.to/[a-zA-Z0-9]+[^}]*?${term}`, 'gi'),
        // Image URLs in various formats
        new RegExp(`"imageUrl"\\s*:\\s*"([^"]*${term.toLowerCase().replace(/\s+/g, '[\\s-_]*')}[^"]*\\.(?:jpg|jpeg|png))"`, 'gi'),
        // Look for product blocks
        new RegExp(`${term}[\\s\\S]{0,500}?(?:https?://[^"'\\s]+\\.(?:jpg|jpeg|png|webp)|amzn\\.to/[a-zA-Z0-9]+)`, 'gi')
      ];
      
      const matches = [];
      patterns.forEach(pattern => {
        const found = content.match(pattern);
        if (found) {
          matches.push(...found);
        }
      });
      
      if (matches.length > 0) {
        results[term] = matches;
      }
    });
    
    return results;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return {};
  }
}

// Search in multiple data files
const dataFiles = [
  '/home/titan/FactBench/pool-robot-podaci/str-best-robot-all data.txt',
  '/home/titan/FactBench/pool-robot-podaci/JSON SVI PODACI KOMPLET STR.txt',
  '/home/titan/FactBench/pool-robot-podaci/novi-podaci.html'
];

console.log('📂 Searching for missing images...\n');
const imageResults = {};

dataFiles.forEach(file => {
  console.log(`Checking: ${path.basename(file)}`);
  const results = searchInFile(file, missingImageProducts);
  
  Object.keys(results).forEach(product => {
    if (!imageResults[product]) {
      imageResults[product] = [];
    }
    imageResults[product].push(...results[product]);
  });
});

console.log('\n📷 Image Search Results:');
console.log('=' .repeat(50));

missingImageProducts.forEach(product => {
  console.log(`\n${product}:`);
  if (imageResults[product]) {
    // Extract unique image URLs
    const imageUrls = [];
    imageResults[product].forEach(match => {
      const urlMatch = match.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
      if (urlMatch) {
        imageUrls.push(...urlMatch);
      }
    });
    
    const uniqueUrls = [...new Set(imageUrls)];
    if (uniqueUrls.length > 0) {
      console.log('  ✅ Found image URLs:');
      uniqueUrls.forEach(url => console.log(`     ${url}`));
    } else {
      console.log('  ❌ No clear image URLs found');
    }
  } else {
    console.log('  ❌ No matches found');
  }
});

console.log('\n\n🔗 Amazon Link Search Results:');
console.log('=' .repeat(50));

const linkResults = {};
dataFiles.forEach(file => {
  const results = searchInFile(file, missingLinkProducts);
  
  Object.keys(results).forEach(product => {
    if (!linkResults[product]) {
      linkResults[product] = [];
    }
    linkResults[product].push(...results[product]);
  });
});

missingLinkProducts.forEach(product => {
  console.log(`\n${product}:`);
  if (linkResults[product]) {
    // Extract Amazon links
    const amazonLinks = [];
    linkResults[product].forEach(match => {
      const linkMatch = match.match(/https?:\/\/amzn\.to\/[a-zA-Z0-9]+/gi);
      if (linkMatch) {
        amazonLinks.push(...linkMatch);
      }
    });
    
    const uniqueLinks = [...new Set(amazonLinks)];
    if (uniqueLinks.length > 0) {
      console.log('  ✅ Found Amazon links:');
      uniqueLinks.forEach(link => console.log(`     ${link}`));
    } else {
      console.log('  ❌ No Amazon links found');
    }
  } else {
    console.log('  ❌ No matches found');
  }
});

// Also search for any image URLs we might have missed
console.log('\n\n🔍 Additional Image URL Search (all .jpg/.png files):');
console.log('=' .repeat(50));

dataFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const allImageUrls = content.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || [];
    
    if (allImageUrls.length > 0) {
      console.log(`\n${path.basename(file)}: Found ${allImageUrls.length} image URLs`);
      
      // Filter for our products
      const relevantUrls = allImageUrls.filter(url => {
        const urlLower = url.toLowerCase();
        return missingImageProducts.some(product => {
          const productPattern = product.toLowerCase().replace(/\s+/g, '[\\s-_]*');
          return new RegExp(productPattern).test(urlLower);
        });
      });
      
      if (relevantUrls.length > 0) {
        console.log('  Relevant URLs for our products:');
        [...new Set(relevantUrls)].forEach(url => console.log(`    - ${url}`));
      }
    }
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
});

console.log('\n✅ Search complete!');