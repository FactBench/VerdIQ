#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load the correct product data
const productData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json'), 'utf8'));

// Update main page
const mainPagePath = path.join(__dirname, '..', 'src', 'pages', 'best-robotic-pool-cleaners.html');
let mainPageContent = fs.readFileSync(mainPagePath, 'utf8');

// 1. Add Read Reviews button to header
mainPageContent = mainPageContent.replace(
    `                    <a href="#comparison" class="btn-secondary">
                        Compare All
                        <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </a>
                </div>`,
    `                    <a href="#comparison" class="btn-secondary">
                        Compare All
                        <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </a>
                    <a href="#reviews" class="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40">
                        Read Reviews
                        <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </a>
                </div>`
);

// 2. Fix position number visibility
mainPageContent = mainPageContent.replace(/text-gray-600\/50/g, 'text-amber-500/80');

// 3. Update section titles
mainPageContent = mainPageContent.replace(
    `            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
                Our Top Picks
            </h2>`,
    `            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
                ${productData.page.sections.topPicks.title}
            </h2>`
);

// 4. Update comparison section
mainPageContent = mainPageContent.replace(
    `            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-12">
                Feature Comparison
            </h2>`,
    `            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
                ${productData.page.sections.comparison.title}
            </h2>
            <p class="text-center text-gray-400 mb-12 max-w-4xl mx-auto">
                ${productData.page.sections.comparison.description}
            </p>`
);

// 5. Add Reviews Section before comparison
const reviewsSection = `
    <!-- Reviews Section -->
    <section id="reviews" class="py-16 bg-base-200/50">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-4">
                In-Depth Reviews of Every Pool Cleaner
            </h2>
            <p class="text-center text-gray-400 mb-12 max-w-3xl mx-auto">
                Dive deep into our comprehensive reviews. Each cleaner has been thoroughly tested in real pool conditions.
                <a href="#top-picks" class="text-amber-500 hover:text-amber-400 font-semibold ml-2">
                    Browse our detailed reviews below ↓
                </a>
            </p>
            <div class="text-center">
                <p class="text-lg text-gray-300">
                    Each product in our top picks includes a <span class="text-amber-500 font-semibold">"Read Full Review"</span> button 
                    that takes you to an in-depth analysis with:
                </p>
                <div class="flex flex-wrap justify-center gap-4 mt-6">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Real-world testing results</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>Detailed pros & cons</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>User feedback analysis</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

// Insert reviews section before comparison
mainPageContent = mainPageContent.replace(
    '    <!-- Comparison Table -->',
    reviewsSection + '\n    <!-- Comparison Table -->'
);

// Write updated main page
fs.writeFileSync(mainPagePath, mainPageContent);

console.log('✅ Main page updated with:');
console.log('   - Yellow "Read Reviews" button');
console.log('   - Fixed position number visibility');
console.log('   - Original section titles');
console.log('   - Reviews section added');

// Now update all review pages
const reviewsDir = path.join(__dirname, '..', 'src', 'pages', 'reviews');
const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.html'));

reviewFiles.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Get product ID from filename
    const productId = file.replace('.html', '');
    const product = productData.products.find(p => p.id === productId);
    
    if (product) {
        // Fix CTA button text
        content = content.replace(/Check Price on Amazon/g, 'Check Price');
        
        // Fix badge
        const badgeMap = {
            'badge-best': 'Best OF THE BEST',
            'badge-value': 'Best Overall',
            'badge-cordless': 'Best Cordless',
            'badge-budget': 'Budget Pick',
            'badge-smart': 'Smart Features',
            'badge-large': 'Large Pools',
            'badge-variable': 'Variable Speed',
            'badge-small': 'Best for Small Pools',
            'badge-premium': 'Premium Build',
            'badge-suction': 'Suction Side King',
            'badge-pro': 'Pro Grade'
        };
        
        // Update badge
        content = content.replace(
            /<span class="badge badge-[\w-]+ animate-shimmer">[\s\S]*?<\/span>/,
            `<span class="badge badge-${getBadgeClass(product.badge)} animate-shimmer">${product.badge}</span>`
        );
        
        // Update affiliate links
        if (product.officialLink) {
            content = content.replace(
                /href="https:\/\/beatbot\.pxf\.io\/c\/\d+\/\d+\/\d+"/g,
                `href="${product.officialLink}"`
            );
        }
        
        // Update Amazon link
        content = content.replace(
            /href="https:\/\/amzn\.to\/\w+"/g,
            `href="${product.amazonLink}"`
        );
        
        // Update tagline
        content = content.replace(
            /<p class="text-xl text-gray-400 mb-6 italic">.*?<\/p>/,
            `<p class="text-xl text-gray-400 mb-6 italic">${product.tagline}</p>`
        );
        
        // Update user ratings
        content = content.replace(
            /<span class="text-gray-400">[\d,]+\+ User Ratings<\/span>/,
            `<span class="text-gray-400">${product.userRatings} User Ratings</span>`
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated review page: ${file}`);
    }
});

// Helper function to get badge class
function getBadgeClass(badge) {
    const badgeClassMap = {
        'Best OF THE BEST': 'badge-gold-gradient',
        'Best Overall': 'badge-silver-gradient',
        'Best Cordless': 'badge-bronze-gradient',
        'Budget Pick': 'badge-value',
        'Smart Features': 'badge-smart',
        'Large Pools': 'badge-large',
        'Variable Speed': 'badge-variable',
        'Best for Small Pools': 'badge-small',
        'Premium Build': 'badge-premium',
        'Suction Side King': 'badge-suction',
        'Pro Grade': 'badge-pro'
    };
    return badgeClassMap[badge] || 'badge-primary';
}

console.log('\n✅ All updates completed!');