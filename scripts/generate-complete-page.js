#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load complete data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pool-cleaners-complete.json'), 'utf8'));

// Generate badge HTML based on badge text
function getBadgeClass(badge) {
    const badgeMap = {
        'Best OF THE BEST': 'badge-best',
        'Best Overall': 'badge-value', 
        'Best Value': 'badge-value',
        'Best Cordless': 'badge-primary',
        'Budget Pick': 'badge-success',
        'Smart Features': 'badge-primary',
        'Large Pools': 'badge-warning',
        'Variable Speed': 'badge-primary',
        'Premium Choice': 'badge-best',
        'Cordless Value': 'badge-value',
        'Suction Power': 'badge-warning',
        'All-Terrain': 'badge-warning'
    };
    return badgeMap[badge] || 'badge-primary';
}

// Generate stars HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    if (hasHalfStar) {
        stars += '<svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/><path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<svg class="w-5 h-5 text-gray-600" viewBox="0 0 20 20"><path fill="none" stroke="currentColor" stroke-width="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    return stars;
}

// Check if image exists, otherwise use placeholder
function getImagePath(imageName) {
    const imagePath = path.join(__dirname, '../src/assets/images/products', imageName);
    if (fs.existsSync(imagePath)) {
        return `/VerdIQ/assets/images/products/${imageName}`;
    }
    // Return a placeholder gradient
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e293b"/><stop offset="100%" style="stop-color:#334155"/></linearGradient></defs><rect width="400" height="300" fill="url(#grad)"/><text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="20">Product Image</text></svg>`);
}

// Generate product cards
function generateProductCards() {
    return data.products.map(product => `
        <div class="card glow-hover group relative overflow-hidden" x-data="{ showDetails: false }">
            <!-- Position Number -->
            <div class="absolute top-4 right-4 text-3xl font-bold text-gray-600/50 z-10">
                #${product.position}
            </div>
            
            <!-- Badge -->
            <span class="badge ${getBadgeClass(product.badge)} mb-4 relative z-10">
                ${product.badge}
            </span>
            
            <!-- Product Image -->
            <div class="relative h-48 -mx-6 -mt-2 mb-4 overflow-hidden">
                <img src="${getImagePath(product.image)}" 
                     alt="${product.name}" 
                     class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent"></div>
            </div>
            
            <!-- Product Info -->
            <h3 class="text-xl font-bold mb-2">${product.name}</h3>
            
            <p class="text-sm text-gray-400 mb-4 italic">"${product.tagline}"</p>
            
            <!-- Rating -->
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                    <div class="flex">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="text-sm text-gray-400">${product.rating}/5.0</span>
                </div>
                <div class="text-right">
                    <span class="text-2xl font-bold text-accent">${product.price}</span>
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
                    </div>
                `).join('')}
            </div>
            
            <!-- Expandable Details -->
            <div x-show="showDetails" 
                 x-transition:enter="transition ease-out duration-300"
                 x-transition:enter-start="opacity-0 transform scale-95"
                 x-transition:enter-end="opacity-100 transform scale-100"
                 class="mt-4 pt-4 border-t border-base-300">
                <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">What We Like:</h4>
                <ul class="space-y-1">
                    ${product.whatWeLike.map(like => `
                        <li class="text-sm text-gray-300 flex items-start">
                            <span class="text-success mr-2">+</span>
                            ${like}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <!-- Actions -->
            <div class="mt-6 flex gap-3">
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
    `).join('');
}

// Generate comparison table
function generateComparisonTable() {
    const topProducts = data.products.slice(0, 4);
    
    return `
        <div class="overflow-x-auto">
            <table class="w-full bg-base-200 rounded-lg overflow-hidden">
                <thead class="bg-base-300">
                    <tr>
                        <th class="text-left py-4 px-6 font-semibold">Feature</th>
                        ${topProducts.map(p => `
                            <th class="text-center py-4 px-6">
                                <div class="font-semibold">${p.name}</div>
                                <div class="text-xs text-gray-400 mt-1">${p.price}</div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-t border-base-300">
                        <td class="py-4 px-6 font-medium">Rating</td>
                        ${topProducts.map(p => `
                            <td class="text-center py-4 px-6">
                                <div class="flex justify-center items-center space-x-1">
                                    ${generateStars(p.rating)}
                                </div>
                                <div class="text-sm text-gray-400 mt-1">${p.rating}/5.0</div>
                            </td>
                        `).join('')}
                    </tr>
                    <tr class="border-t border-base-300 bg-base-100/50">
                        <td class="py-4 px-6 font-medium">User Reviews</td>
                        ${topProducts.map(p => `
                            <td class="text-center py-4 px-6">
                                <span class="text-accent font-semibold">${p.userRatings}</span>
                            </td>
                        `).join('')}
                    </tr>
                    <tr class="border-t border-base-300">
                        <td class="py-4 px-6 font-medium">Best For</td>
                        ${topProducts.map(p => `
                            <td class="text-center py-4 px-6 text-sm">
                                <span class="badge ${getBadgeClass(p.badge)}">${p.badge}</span>
                            </td>
                        `).join('')}
                    </tr>
                    <tr class="border-t border-base-300 bg-base-100/50">
                        <td class="py-4 px-6 font-medium">Key Feature</td>
                        ${topProducts.map(p => `
                            <td class="text-center py-4 px-6 text-sm text-gray-300">
                                ${p.keyFeatures[0]}
                            </td>
                        `).join('')}
                    </tr>
                    <tr class="border-t border-base-300">
                        <td class="py-4 px-6 font-medium">Action</td>
                        ${topProducts.map(p => `
                            <td class="text-center py-4 px-6">
                                <a href="${p.amazonLink}" 
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   class="btn-primary inline-block">
                                    Check Price
                                </a>
                            </td>
                        `).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Load template
const template = fs.readFileSync(path.join(__dirname, '../src/templates/base.html'), 'utf8');

// Generate page content
const pageContent = `
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50"></div>
        
        <div class="container mx-auto px-4 py-16 lg:py-24 relative z-10">
            <div class="max-w-5xl mx-auto text-center">
                <!-- Expert Badge -->
                <div class="inline-flex items-center space-x-2 mb-6">
                    <div class="h-px w-16 bg-gradient-to-r from-transparent to-primary"></div>
                    <span class="badge badge-primary">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Expert Analysis
                    </span>
                    <div class="h-px w-16 bg-gradient-to-l from-transparent to-primary"></div>
                </div>
                
                <!-- Main Headline -->
                <h1 class="text-4xl md:text-6xl font-display font-bold mb-6 animate-fade-in">
                    <span class="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                        ${data.page.title}
                    </span>
                </h1>
                
                <!-- Subheadline -->
                <p class="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
                    ${data.page.subtitle}
                </p>
                
                <!-- Stats -->
                <div class="flex flex-wrap justify-center gap-8 mb-8">
                    <div class="flex items-center space-x-2">
                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span class="text-lg"><strong class="text-primary">${data.page.stats.productsAnalyzed}</strong> Products Analyzed</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-lg"><strong class="text-accent">${data.page.stats.testingHours}</strong> Hours of Testing</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-lg"><strong class="text-success">${data.page.stats.reviewType}</strong></span>
                    </div>
                </div>
                
                <!-- CTAs -->
                <div class="flex flex-wrap justify-center gap-4">
                    <a href="#top-picks" class="btn-primary">
                        View Top Picks
                        <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </a>
                    <a href="#comparison" class="btn-secondary">
                        Compare All
                        <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </a>
                </div>
                
                <!-- Last Updated -->
                <p class="text-sm text-gray-500 mt-8">
                    <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Last updated: <time>${data.page.lastUpdated}</time>
                </p>
            </div>
        </div>
    </section>

    <!-- Price Guide -->
    <section class="bg-base-200 py-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-wrap items-center justify-center gap-8">
                <span class="text-gray-400 font-semibold">Price Guide:</span>
                ${Object.entries(data.priceGuide).map(([symbol, range]) => `
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl font-bold text-primary">${symbol}</span>
                        <span class="text-gray-400">${range}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Products Grid -->
    <section id="top-picks" class="py-16">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
                Our Top Picks
            </h2>
            <p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">
                ${data.page.description}
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" x-data>
                ${generateProductCards()}
            </div>
        </div>
    </section>

    <!-- Performance Chart -->
    <section class="py-16 bg-base-200">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-12">
                Performance Analysis
            </h2>
            <div class="max-w-4xl mx-auto bg-base-100 rounded-xl p-8">
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
    </section>

    <!-- Comparison Table -->
    <section id="comparison" class="py-16">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-12">
                Feature Comparison
            </h2>
            ${generateComparisonTable()}
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-primary/20 to-accent/20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-display font-bold mb-4">
                Ready to Transform Your Pool Maintenance?
            </h2>
            <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Choose your perfect robotic pool cleaner and enjoy crystal-clear water without the hassle.
            </p>
            <a href="#top-picks" class="btn-primary text-lg px-8 py-4">
                Find Your Pool Cleaner
                <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
            </a>
        </div>
    </section>
`;

// Page scripts
const pageScripts = `
    <script>
        // Performance Chart
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Cleaning Power', 'Navigation', 'Features', 'Efficiency', 'Value', 'Durability'],
                datasets: [
                    {
                        label: '${data.products[0].name}',
                        data: [95, 98, 95, 92, 85, 96],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 8
                    },
                    {
                        label: '${data.products[1].name}',
                        data: [92, 90, 88, 95, 96, 94],
                        borderColor: '#0ea5e9',
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        pointBackgroundColor: '#0ea5e9',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 8
                    },
                    {
                        label: '${data.products[2].name}',
                        data: [88, 85, 82, 90, 92, 88],
                        borderColor: '#14b8a6',
                        backgroundColor: 'rgba(20, 184, 166, 0.2)',
                        pointBackgroundColor: '#14b8a6',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e5e7eb',
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#9ca3af',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: '#374151'
                        },
                        pointLabels: {
                            color: '#e5e7eb',
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    </script>
`;

// Replace template variables
const finalHtml = template
    .replace(/{{PAGE_TITLE}}/g, `${data.page.title} - Expert Analysis`)
    .replace(/{{PAGE_DESCRIPTION}}/g, data.page.description)
    .replace(/{{PAGE_IMAGE}}/g, '/VerdIQ/assets/images/pool-cleaners-og.jpg')
    .replace(/{{PAGE_URL}}/g, 'https://factbench.github.io/VerdIQ/best-robotic-pool-cleaners/')
    .replace('{{PAGE_CONTENT}}', pageContent)
    .replace('{{PAGE_SCRIPTS}}', pageScripts);

// Write file
fs.writeFileSync(path.join(__dirname, '../src/pages/best-robotic-pool-cleaners.html'), finalHtml);

console.log('✅ Page generated successfully!');
console.log('📄 Updated: src/pages/best-robotic-pool-cleaners.html');