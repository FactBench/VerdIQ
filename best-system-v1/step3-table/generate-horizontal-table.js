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
  
  return starsHTML;
}

// Generate inline price guide
function generateInlinePriceGuide() {
  return `<p class="text-center text-gray-400 mb-4"><strong>Price Guide:</strong> $ = Under $500 | $$ = $500 - $999 | $$$ = $1000 - $1999 | $$$$ = $2000+</p>`;
}

// Generate horizontal desktop table
function generateHorizontalTable() {
  let tableHTML = `
    <!-- Desktop Table (hidden on mobile) -->
    <div class="hidden lg:block overflow-x-auto">
      <table class="w-full comparison-table">
        <thead>
          <tr class="bg-base-300 border-b border-base-200">
            <th class="text-left p-4 sticky left-0 bg-base-300 z-10 min-w-[200px]">Product</th>`;
  
  // Add product name headers
  tableData.products.forEach(product => {
    tableHTML += `
            <th class="text-center p-4 min-w-[180px] font-semibold">${product.name}</th>`;
  });
  
  tableHTML += `
          </tr>
        </thead>
        <tbody>`;
  
  // Our Rating row
  tableHTML += `
          <tr class="bg-base-200">
            <td class="p-4 font-semibold sticky left-0 bg-base-200">Our Rating</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center">
              <div class="flex items-center justify-center space-x-1">
                ${generateStarRating(product.rating)}
              </div>
              <span class="text-sm text-gray-400">(${product.rating}/5.0)</span>
            </td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Award Category row
  tableHTML += `
          <tr class="bg-base-100">
            <td class="p-4 font-semibold sticky left-0 bg-base-100">Award Category</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center">
              <span class="inline-block bg-accent text-black px-2 py-1 rounded-full text-xs font-bold">${product.awardNumber}</span>
              <div class="text-sm mt-1">${product.awardCategory}</div>
            </td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Ideal Pool Type(s) row
  tableHTML += `
          <tr class="bg-base-200">
            <td class="p-4 font-semibold sticky left-0 bg-base-200">Ideal Pool Type(s)</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center text-sm">${product.idealPoolTypes}</td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Cleaning Focus row
  tableHTML += `
          <tr class="bg-base-100">
            <td class="p-4 font-semibold sticky left-0 bg-base-100">Cleaning Focus</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center font-mono text-sm">${product.cleaningFocus}</td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Filter System row
  tableHTML += `
          <tr class="bg-base-200">
            <td class="p-4 font-semibold sticky left-0 bg-base-200">Filter System</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center text-sm">${product.filterSystem}</td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Cordless / Max Runtime row
  tableHTML += `
          <tr class="bg-base-100">
            <td class="p-4 font-semibold sticky left-0 bg-base-100">Cordless / Max Runtime</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center text-sm">
              ${product.cordless ? `<span class="text-green-400">Yes</span> / ${product.maxRuntime}` : '<span class="text-gray-500">No</span>'}
            </td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Key Navigation Tech row
  tableHTML += `
          <tr class="bg-base-200">
            <td class="p-4 font-semibold sticky left-0 bg-base-200">Key Navigation Tech</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center text-sm">${product.navigationTech}</td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Waterline Cleaning row
  tableHTML += `
          <tr class="bg-base-100">
            <td class="p-4 font-semibold sticky left-0 bg-base-100">Waterline Cleaning</td>`;
  tableData.products.forEach(product => {
    const waterlineHTML = product.waterlineCleaning === 'Dedicated Feature' 
      ? '<span class="text-green-400 font-semibold">Dedicated Feature</span>'
      : product.waterlineCleaning === 'Yes' 
        ? '<span class="text-green-400">Yes</span>'
        : product.waterlineCleaning === 'Partial'
          ? '<span class="text-yellow-400">Partial</span>'
          : '<span class="text-gray-500">No</span>';
    tableHTML += `
            <td class="p-4 text-center text-sm">${waterlineHTML}</td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Key Standout row
  tableHTML += `
          <tr class="bg-base-200">
            <td class="p-4 font-semibold sticky left-0 bg-base-200">Key Standout</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center text-sm font-semibold">${product.keyStandout}</td>`;
  });
  tableHTML += `
          </tr>`;
  
  // Price Guide row
  tableHTML += `
          <tr class="bg-base-100">
            <td class="p-4 font-semibold sticky left-0 bg-base-100">Price Guide</td>`;
  tableData.products.forEach(product => {
    const priceColorClass = {
      '$': 'text-green-500',
      '$$': 'text-yellow-500',
      '$$$': 'text-orange-500',
      '$$$$': 'text-red-500'
    }[product.priceGuide];
    tableHTML += `
            <td class="p-4 text-center">
              <span class="text-2xl font-bold ${priceColorClass}">${product.priceGuide}</span>
            </td>`;
  });
  tableHTML += `
          </tr>`;
  
  // View Full Review row
  tableHTML += `
          <tr class="bg-base-200">
            <td class="p-4 font-semibold sticky left-0 bg-base-200">View Full Review</td>`;
  tableData.products.forEach(product => {
    tableHTML += `
            <td class="p-4 text-center">
              <a href="${product.reviewLink}" class="btn btn-sm btn-primary">Read Review</a>
            </td>`;
  });
  tableHTML += `
          </tr>`;
  
  tableHTML += `
        </tbody>
      </table>
    </div>`;
  
  return tableHTML;
}

// Mobile cards remain the same
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
    <p class="text-center text-gray-400 mb-4 max-w-4xl mx-auto">
      Overwhelmed by options? This quick comparison table highlights the key differences between our top-rated robotic pool cleaners for 2025. Use it to easily identify which models best suit your pool, needs, and budget, then dive into our full reviews for more detail.
    </p>
    
    ${generateInlinePriceGuide()}
    
    ${generateHorizontalTable()}
    ${generateMobileCards()}
    ${generateAbbreviations()}
  </div>
</section>

<style>
  .comparison-table {
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .comparison-table th {
    white-space: nowrap;
    font-weight: 600;
    color: #0ea5e9;
  }
  
  .comparison-table td {
    vertical-align: middle;
    border-right: 1px solid rgba(255,255,255,0.1);
  }
  
  .comparison-table td:last-child {
    border-right: none;
  }
  
  .comparison-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  
  .comparison-table tbody tr:last-child {
    border-bottom: none;
  }
  
  /* Sticky first column */
  .comparison-table td:first-child,
  .comparison-table th:first-child {
    position: sticky;
    left: 0;
    z-index: 10;
    border-right: 2px solid rgba(255,255,255,0.2);
  }
  
  @media (max-width: 1024px) {
    .comparison-table {
      font-size: 0.875rem;
    }
  }
</style>`;
}

// Save the generated HTML
const outputPath = path.join(__dirname, 'horizontal-table-section.html');
fs.writeFileSync(outputPath, generateComparisonSection());

console.log('✅ Generated horizontal comparison table HTML saved to:', outputPath);
console.log('📊 Table features:');
console.log('   - Horizontal/transposed layout (products as columns)');
console.log('   - Inline price guide text');
console.log('   - Sticky first column for scrolling');
console.log('   - Mobile card view');
console.log('🔧 Ready to integrate into main page');