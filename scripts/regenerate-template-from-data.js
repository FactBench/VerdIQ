#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read product data
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Read current template to preserve structure
const templatePath = path.join(__dirname, '..', 'src', 'pages', 'best-robotic-pool-cleaners.html');
let template = fs.readFileSync(templatePath, 'utf8');

console.log('🔄 Regenerating product sections from data...\n');

// Extract the product grid section
const gridStart = template.indexOf('<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"');
const gridEnd = template.indexOf('</div>', template.indexOf('</div>', template.indexOf('</div>', gridStart + 1) + 1) + 1) + 6;

if (gridStart === -1 || gridEnd === -1) {
    console.error('❌ Could not find product grid section');
    process.exit(1);
}

// Generate product cards for all 11 products
const productCards = data.products.map((product, index) => {
    const position = index + 1;
    const badge = product.badge || '';
    const badgeClass = badge.includes('BEST') ? 'badge-best' : 'badge-value';
    
    // Default image if none exists
    const imageSrc = `/VerdIQ/assets/images/products/${product.id}.jpg`;
    
    return `            <div class="card glow-hover group relative overflow-hidden" x-data="{ showDetails: false }">
                <div class="absolute top-4 right-4 text-3xl font-bold text-amber-500/80 z-10">
                    #${position}
                </div>
                ${badge ? `<span class="badge ${badgeClass} mb-4 relative z-10">
                    ${badge}
                </span>` : ''}
                <div class="relative h-48 -mx-6 -mt-2 mb-4 overflow-hidden">
                    <img src="${imageSrc}" 
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
                            ${Array(5).fill().map((_, i) => {
                                if (i < Math.floor(product.rating)) {
                                    return '<svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                                } else if (i === Math.floor(product.rating) && product.rating % 1 !== 0) {
                                    return '<svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/><path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                                } else {
                                    return '<svg class="w-5 h-5 fill-current text-yellow-400 opacity-20" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                                }
                            }).join('')}
                        </div>
                        <span class="text-sm text-gray-400">${product.rating}/5.0</span>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-bold text-accent">${product.priceRange}</span>
                        <div class="text-xs text-gray-500">User Ratings: ${product.userRatings}</div>
                    </div>
                </div>
                
                <!-- Key Features -->
                <div class="space-y-2 mb-4">
                    <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Key Features:</h4>
                    ${product.keyFeatures.slice(0, 3).map(feature => `
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
                        ${product.whatWeLike.map(item => `
                        <li class="text-sm text-gray-300 flex items-start">
                            <span class="text-success mr-2">+</span>
                            ${item}
                        </li>`).join('')}
                    </ul>
                </div>
                
                <!-- Action Buttons -->
                <div class="mt-6 space-y-3">
                    <a href="/VerdIQ/reviews/${product.id}/" 
                       class="block w-full bg-base-300 hover:bg-primary/20 text-white py-3 px-4 rounded-lg transition-all duration-200 text-center">
                        Read Full Review →
                    </a>
                    <div class="flex gap-3">
                        <button @click="showDetails = !showDetails" 
                                class="flex-1 bg-base-300 hover:bg-primary/20 text-white py-2 px-4 rounded-lg transition-all duration-200">
                            <span x-text="showDetails ? 'Less Details' : 'View Details'"></span>
                        </button>
                        <a href="${product.amazonLink}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="flex-1 btn-primary text-center">
                            Check Price
                        </a>
                    </div>
                </div>
            </div>`;
}).join('\n\n');

// Replace the grid content
const newGridSection = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" x-data>
${productCards}
        </div>`;

// Replace in template
const beforeGrid = template.substring(0, gridStart);
const afterGrid = template.substring(gridEnd);
template = beforeGrid + newGridSection + afterGrid;

// Update the comparison table section too
console.log('✓ Updated product grid with all 11 products');

// Find and update comparison table
const tableBodyStart = template.indexOf('<tbody>');
const tableBodyEnd = template.indexOf('</tbody>') + 8;

if (tableBodyStart !== -1 && tableBodyEnd !== -1) {
    const tableRows = data.products.map((product, index) => `
                    <tr class="hover:bg-base-300/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center space-x-2">
                                <span class="text-2xl font-bold text-amber-500">#${index + 1}</span>
                                <div>
                                    <div class="font-semibold">${product.name}</div>
                                    ${product.badge ? `<span class="badge badge-sm ${product.badge.includes('BEST') ? 'badge-best' : 'badge-value'}">${product.badge}</span>` : ''}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <div class="flex justify-center">
                                ${Array(5).fill().map((_, i) => 
                                    `<svg class="w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'} fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>`
                                ).join('')}
                            </div>
                            <span class="text-xs text-gray-400">${product.userRatings} reviews</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="text-lg font-semibold">${product.priceRange}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="text-sm">${product.poolSize || 'Up to 50ft'}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="${product.connectivity?.includes('Wi-Fi') ? 'text-success' : 'text-gray-500'}">
                                ${product.connectivity?.includes('Wi-Fi') ? '✓' : '-'}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <a href="${product.amazonLink}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="btn-primary-sm">
                                Check Price
                            </a>
                        </td>
                    </tr>`).join('');
    
    const newTableBody = `<tbody>${tableRows}
                </tbody>`;
    
    template = template.substring(0, tableBodyStart) + newTableBody + template.substring(tableBodyEnd);
    console.log('✓ Updated comparison table with all 11 products');
}

// Write updated template
fs.writeFileSync(templatePath, template);

console.log('\n✅ Template regenerated with all products from data');
console.log(`Total products: ${data.products.length}`);
console.log('\nNow rebuild: npm run build');