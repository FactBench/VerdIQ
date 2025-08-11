#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read table data
const tableData = JSON.parse(fs.readFileSync(path.join(__dirname, 'table-data.json'), 'utf8'));

// Helper function to generate star rating
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star text-yellow-400"></i>';
  }
  
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
  }
  
  // Fill remaining with empty stars
  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    starsHTML += '<i class="far fa-star text-gray-600"></i>';
  }
  
  return starsHTML;
}

// Generate price guide HTML
function generatePriceGuide() {
  return `
    <div class="price-guide-section bg-base-200 p-6 rounded-lg mb-8 border border-base-300">
      <h3 class="text-lg font-bold mb-3 text-accent">Price Guide:</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-green-500">$</span>
          <span class="text-sm text-gray-400">Under $500</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-yellow-500">$$</span>
          <span class="text-sm text-gray-400">$500 - $999</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-orange-500">$$$</span>
          <span class="text-sm text-gray-400">$1000 - $1999</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-red-500">$$$$</span>
          <span class="text-sm text-gray-400">$2000+</span>
        </div>
      </div>
    </div>`;
}

// Generate desktop table HTML
function generateDesktopTable() {
  let tableHTML = `
    <!-- Desktop Table (hidden on mobile) -->
    <div class="hidden lg:block overflow-x-auto">
      <table class="w-full comparison-table">
        <thead>
          <tr class="bg-base-300 border-b border-base-200">
            <th class="text-left p-4 sticky left-0 bg-base-300 z-10">Product</th>
            <th class="text-center p-4">Our Rating</th>
            <th class="text-center p-4">Award Category</th>
            <th class="text-center p-4">Ideal Pool Type(s)</th>
            <th class="text-center p-4">Cleaning Focus</th>
            <th class="text-center p-4">Filter System</th>
            <th class="text-center p-4">Cordless / Max Runtime</th>
            <th class="text-center p-4">Key Navigation Tech</th>
            <th class="text-center p-4">Waterline Cleaning</th>
            <th class="text-center p-4">Key Standout</th>
            <th class="text-center p-4">Price Guide</th>
            <th class="text-center p-4">View Full Review</th>
          </tr>
        </thead>
        <tbody>`;
  
  tableData.products.forEach((product, index) => {
    const rowClass = index % 2 === 0 ? 'bg-base-200' : 'bg-base-100';
    const priceColorClass = {
      '$': 'text-green-500',
      '$$': 'text-yellow-500',
      '$$$': 'text-orange-500',
      '$$$$': 'text-red-500'
    }[product.priceGuide];
    
    tableHTML += `
          <tr class="${rowClass} hover:bg-base-300 transition-colors">
            <td class="p-4 font-semibold sticky left-0 ${rowClass}">${product.name}</td>
            <td class="p-4 text-center">
              <div class="flex items-center justify-center space-x-1">
                ${generateStarRating(product.rating)}
              </div>
              <span class="text-sm text-gray-400">(${product.rating}/5.0)</span>
            </td>
            <td class="p-4 text-center">
              <span class="inline-block bg-accent text-black px-2 py-1 rounded-full text-xs font-bold">${product.awardNumber}</span>
              <div class="text-sm mt-1">${product.awardCategory}</div>
            </td>
            <td class="p-4 text-center text-sm">${product.idealPoolTypes}</td>
            <td class="p-4 text-center font-mono text-sm">${product.cleaningFocus}</td>
            <td class="p-4 text-center text-sm">${product.filterSystem}</td>
            <td class="p-4 text-center text-sm">
              ${product.cordless ? `<span class="text-green-400">Yes</span> / ${product.maxRuntime}` : '<span class="text-gray-500">No</span>'}
            </td>
            <td class="p-4 text-center text-sm">${product.navigationTech}</td>
            <td class="p-4 text-center text-sm">
              ${product.waterlineCleaning === 'Dedicated Feature' 
                ? '<span class="text-green-400 font-semibold">Dedicated Feature</span>'
                : product.waterlineCleaning === 'Yes' 
                  ? '<span class="text-green-400">Yes</span>'
                  : product.waterlineCleaning === 'Partial'
                    ? '<span class="text-yellow-400">Partial</span>'
                    : '<span class="text-gray-500">No</span>'}
            </td>
            <td class="p-4 text-center text-sm font-semibold">${product.keyStandout}</td>
            <td class="p-4 text-center">
              <span class="text-2xl font-bold ${priceColorClass}">${product.priceGuide}</span>
            </td>
            <td class="p-4 text-center">
              <a href="${product.reviewLink}" class="btn btn-sm btn-primary">Read Review</a>
            </td>
          </tr>`;
  });
  
  tableHTML += `
        </tbody>
      </table>
    </div>`;
  
  return tableHTML;
}

// Generate mobile cards HTML
function generateMobileCards() {
  let cardsHTML = `
    <!-- Mobile Cards (visible on mobile) -->
    <div class="lg:hidden space-y-4">`;
  
  tableData.products.forEach((product) => {
    const priceColorClass = {
      '$': 'text-green-500',
      '$$': 'text-yellow-500',
      '$$$': 'text-orange-500',
      '$$$$': 'text-red-500'
    }[product.priceGuide];
    
    cardsHTML += `
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <div class="flex justify-between items-start mb-4">
            <h3 class="card-title">${product.name}</h3>
            <span class="text-2xl font-bold ${priceColorClass}">${product.priceGuide}</span>
          </div>
          
          <div class="badge badge-accent badge-lg mb-3">${product.awardNumber}. ${product.awardCategory}</div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Rating:</span>
              <div class="flex items-center space-x-1">
                ${generateStarRating(product.rating)}
                <span class="ml-1">${product.rating}/5.0</span>
              </div>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-400">Pool Type:</span>
              <span>${product.idealPoolTypes}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-400">Cleaning:</span>
              <span class="font-mono">${product.cleaningFocus}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-400">Cordless:</span>
              <span>${product.cordless ? `Yes (${product.maxRuntime})` : 'No'}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-400">Waterline:</span>
              <span>${product.waterlineCleaning}</span>
            </div>
            
            <div class="mt-3 p-3 bg-base-300 rounded-lg">
              <div class="text-xs text-gray-400 mb-1">Key Standout:</div>
              <div class="font-semibold">${product.keyStandout}</div>
            </div>
          </div>
          
          <div class="card-actions justify-end mt-4">
            <a href="${product.reviewLink}" class="btn btn-primary btn-sm">Read Full Review</a>
          </div>
        </div>
      </div>`;
  });
  
  cardsHTML += `
    </div>`;
  
  return cardsHTML;
}

// Generate abbreviations legend
function generateAbbreviations() {
  return `
    <div class="mt-6 text-sm text-gray-400">
      <p class="font-semibold mb-2">Cleaning Focus Abbreviations:</p>
      <div class="flex flex-wrap gap-4">
        <span><strong>F</strong> = Floor</span>
        <span><strong>W</strong> = Walls</span>
        <span><strong>WL</strong> = Waterline</span>
        <span><strong>S</strong> = Surface</span>
      </div>
    </div>`;
}

// Generate complete comparison section
function generateComparisonSection() {
  return `
<!-- Comparison Table Section -->
<section id="comparison-table" class="py-16 bg-base-100">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
      Let's Cut to the Chase and Compare 2025's Top Pool Robots Side-by-Side
    </h2>
    <p class="text-center text-gray-400 mb-8 max-w-4xl mx-auto">
      Overwhelmed by options? This quick comparison table highlights the key differences between our top-rated robotic pool cleaners for 2025. Use it to easily identify which models best suit your pool, needs, and budget, then dive into our full reviews for more detail.
    </p>
    
    ${generatePriceGuide()}
    
    ${generateDesktopTable()}
    ${generateMobileCards()}
    ${generateAbbreviations()}
  </div>
</section>

<style>
  .comparison-table th {
    white-space: nowrap;
    font-weight: 600;
    color: #0ea5e9;
  }
  
  .comparison-table td {
    vertical-align: middle;
  }
  
  .comparison-table tr:hover {
    transform: translateX(2px);
  }
  
  @media (max-width: 1024px) {
    .comparison-table {
      font-size: 0.875rem;
    }
  }
</style>`;
}

// Save the generated HTML
const outputPath = path.join(__dirname, 'comparison-table-section.html');
fs.writeFileSync(outputPath, generateComparisonSection());

console.log('✅ Generated comparison table HTML saved to:', outputPath);
console.log('📊 Table includes:');
console.log('   - Price guide section');
console.log('   - Responsive desktop table');
console.log('   - Mobile card view');
console.log('   - Abbreviations legend');
console.log('🔧 Ready to integrate into main page');