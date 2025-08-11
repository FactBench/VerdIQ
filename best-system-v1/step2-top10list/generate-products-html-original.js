#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the products data
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products-data.json'), 'utf8'));

// Helper function to generate star rating HTML
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
  }
  
  // Half star if needed
  if (hasHalfStar) {
    starsHTML += '<svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/><path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
  }
  
  return starsHTML;
}

// Helper function to get badge class
function getBadgeClass(position) {
  if (position === 1) return 'badge-best';
  return 'badge-value';
}

// Helper function to generate review page URL
function getReviewUrl(productName) {
  const slug = productName.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
  return `/VerdIQ/reviews/${slug}/`;
}

// Generate HTML for each product
function generateProductHTML(product) {
  const badgeClass = getBadgeClass(product.position);
  const reviewUrl = getReviewUrl(product.name);
  
  // Take only first 3 key features and first 5 what we like items
  const keyFeatures = product.keyFeatures.slice(0, 3);
  const whatWeLike = product.whatWeLike.slice(0, 5);
  
  return `
            <div class="card glow-hover group relative overflow-hidden" x-data="{ showDetails: false }">
                <div class="absolute top-4 right-4 text-4xl font-bold text-amber-500 z-10">
                    #${product.position}
                </div>
                <span class="badge ${badgeClass} mb-4 relative z-10">
                    ${product.award}
                </span>
                <div class="relative h-48 -mx-6 -mt-2 mb-4 overflow-hidden">
                    <img src="${product.imageUrl.startsWith('http') ? '/VerdIQ/assets/images/products/' + product.imageUrl.split('/').pop() : product.imageUrl}" 
                         alt="${product.name}" 
                         class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent"></div>
                </div>
                <h3 class="text-xl font-bold mb-2">${product.name}</h3>
                <p class="text-sm text-gray-400 mb-4 italic">"${product.tagline}"</p>
                
                <!-- Rating and Price -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <div class="flex">
                            ${generateStarRating(product.starRating)}
                        </div>
                        <span class="text-sm text-gray-400">${product.starRating}/5.0</span>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-bold text-accent">${product.price || 'N/A'}</span>
                        <div class="text-xs text-gray-500">User Ratings: ${product.userRatings}</div>
                    </div>
                </div>
                
                <!-- Key Features -->
                <div class="space-y-2 mb-4">
                    <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Key Features:</h4>
                    ${keyFeatures.map(feature => `
                    <div class="flex items-start space-x-2">
                        <svg class="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-sm text-gray-300">${feature}</span>
                    </div>`).join('')}
                </div>
                
                <!-- Expandable Details -->
                <div x-show="showDetails" 
                     x-transition:enter="transition ease-out duration-300"
                     x-transition:enter-start="opacity-0 transform scale-95"
                     x-transition:enter-end="opacity-100 transform scale-100"
                     class="mt-4 pt-4 border-t border-base-300">
                    <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">What We Like:</h4>
                    <ul class="space-y-1">
                        ${whatWeLike.map(item => `
                        <li class="text-sm text-gray-300 flex items-start">
                            <span class="text-success mr-2">+</span>
                            ${item}
                        </li>`).join('')}
                    </ul>
                </div>
                
                <!-- Action Buttons -->
                <div class="mt-6 space-y-3">
                    <div class="flex gap-3">
                        <button @click="showDetails = !showDetails" 
                                class="flex-1 bg-primary hover:bg-primary-focus text-white py-3 px-4 rounded-lg transition-all duration-200 font-semibold">
                            <span x-text="showDetails ? 'Less Details' : 'View Details'"></span>
                        </button>
                        <a href="${product.amazonLink}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="flex-1 btn-primary text-center py-3">
                            Check Price
                        </a>
                    </div>
                    <a href="${reviewUrl}" 
                       class="block w-full bg-amber-500 hover:bg-amber-600 text-gray-900 py-2.5 px-4 rounded-lg transition-all duration-200 text-center text-sm font-semibold">
                        Read Full Review →
                    </a>
                </div>
            </div>`;
}

// Generate full products section HTML
function generateFullHTML() {
  const productsHTML = productsData.products.map(product => generateProductHTML(product)).join('\n');
  
  return `
    <!-- Products Grid -->
    <section id="top-picks" class="py-16">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
                Meet Our 2025 Champions, Pool Cleaning Robots That Truly Deliver
            </h2>
            <p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">
                Stop Wasting Time and Money on Pool Upkeep! Our Experts Rigorously Tested 2025's Top 10 Robotic Cleaners to Find Your Perfect, Hands-Free Solution for a Sparkling Pool.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" x-data>
${productsHTML}
            </div>
        </div>
    </section>`;
}

// Save the generated HTML
const outputPath = path.join(__dirname, 'products-section-original.html');
fs.writeFileSync(outputPath, generateFullHTML());

console.log(`✅ Generated HTML with original template saved to: ${outputPath}`);
console.log(`📝 This file contains the complete product section HTML with the proper design`);
console.log(`🔧 Ready to replace the current section`);