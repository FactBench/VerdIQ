#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the products data
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products-data.json'), 'utf8'));

// Generate HTML for each product
function generateProductHTML(product) {
  const hasOfficialLink = product.officialWebsiteLink !== null;
  
  return `
          <!-- Product ${product.position}: ${product.name} -->
          <div class="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow" id="product-${product.position}">
            <!-- Award Badge -->
            <div class="flex justify-center mb-4">
              <span class="inline-block px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${
                product.position === 1 ? 'from-yellow-400 to-yellow-600' :
                product.position === 2 ? 'from-blue-400 to-blue-600' :
                product.position === 3 ? 'from-green-400 to-green-600' :
                'from-gray-600 to-gray-700'
              } animate-pulse">
                ${product.award}
              </span>
            </div>

            <!-- Product Image -->
            <div class="mb-4 text-center">
              <img src="${product.imageUrl}" alt="${product.name}" class="inline-block max-h-48 rounded-lg" loading="lazy">
              <p class="text-gray-400 italic text-sm mt-2">${product.tagline}</p>
            </div>

            <!-- Product Info -->
            <div class="mb-4">
              <h3 class="text-xl font-bold text-white mb-2">${product.position}. ${product.name}</h3>
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center">
                  <span class="text-yellow-400">★</span>
                  <span class="text-white ml-1">${product.starRating}</span>
                </div>
                <span class="text-gray-400">${product.userRatings} ratings</span>
              </div>
            </div>

            <!-- What We Like -->
            <div class="mb-4">
              <h4 class="font-semibold text-white mb-2">What We Like:</h4>
              <ul class="space-y-1 text-gray-300 text-sm">
                ${product.whatWeLike.map(item => `<li class="flex items-start">
                  <span class="text-green-400 mr-2">✓</span>
                  <span>${item}</span>
                </li>`).join('\n                ')}
              </ul>
            </div>

            <!-- Key Features -->
            <div class="mb-6">
              <h4 class="font-semibold text-white mb-2">Key Features:</h4>
              <ul class="space-y-1 text-gray-300 text-sm">
                ${product.keyFeatures.map(feature => `<li class="flex items-start">
                  <span class="text-blue-400 mr-2">•</span>
                  <span>${feature}</span>
                </li>`).join('\n                ')}
              </ul>
            </div>

            <!-- CTA Buttons -->
            <div class="flex gap-3">
              <a href="${product.amazonLink}" target="_blank" rel="noopener noreferrer" 
                 class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors">
                Check Price
              </a>
              ${hasOfficialLink ? `
              <a href="${product.officialWebsiteLink}" target="_blank" rel="noopener noreferrer" 
                 class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors">
                Official Site
              </a>` : ''}
            </div>
          </div>`;
}

// Generate full products section HTML
function generateFullHTML() {
  const productsHTML = productsData.products.map(product => generateProductHTML(product)).join('\n\n');
  
  return `
      <!-- Top 10 Products Section -->
      <section id="top-10-products" class="py-12 bg-gray-900">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-display font-bold text-center text-white mb-8">
            Meet Our 2025 Champions, Pool Cleaning Robots That Truly Deliver
          </h2>
          
          <!-- Product Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
${productsHTML}
          </div>
        </div>
      </section>`;
}

// Save the generated HTML
const outputPath = path.join(__dirname, 'products-section.html');
fs.writeFileSync(outputPath, generateFullHTML());

console.log(`✅ Generated HTML saved to: ${outputPath}`);
console.log(`📝 This file contains the complete product section HTML`);
console.log(`🔧 You can now use the MultiEdit tool to replace the old product section`);