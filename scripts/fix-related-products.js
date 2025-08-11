#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load product data
const productData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json'), 'utf8'));

// Update each review page
const reviewsDir = path.join(__dirname, '..', 'src', 'pages', 'reviews');
const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.html'));

reviewFiles.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Get current product ID
    const productId = file.replace('.html', '');
    const currentProduct = productData.products.find(p => p.id === productId);
    
    if (currentProduct) {
        // Get 3 related products (exclude current)
        const relatedProducts = productData.products
            .filter(p => p.id !== productId)
            .slice(0, 3);
        
        // Build new related products HTML
        let relatedHTML = '';
        relatedProducts.forEach(product => {
            const stars = '★'.repeat(Math.round(product.rating));
            relatedHTML += `
                    <a href="/VerdIQ/reviews/${product.id}/" class="bg-base-200 rounded-lg p-6 hover:bg-base-300 transition-colors">
                        <h3 class="font-semibold mb-2">${product.name}</h3>
                        <div class="flex items-center mb-2">
                            <div class="flex text-yellow-400 text-sm">
                                ${stars}
                            </div>
                            <span class="ml-2 text-sm text-gray-400">${product.rating}/5</span>
                        </div>
                        <p class="text-sm text-gray-400">${product.price}</p>
                    </a>`;
        });
        
        // Replace the entire related products section
        content = content.replace(
            /<div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
            `<div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">${relatedHTML}
                </div>
            </div>
        </section>`
        );
        
        // Also fix the price display in the hero section
        content = content.replace(
            /<span class="text-3xl font-bold text-primary">\$\$<\/span>/,
            `<span class="text-3xl font-bold text-primary">${currentProduct.price}</span>`
        );
        
        // Fix user ratings format
        content = content.replace(
            /<span class="font-semibold">[\d,]+\+<\/span> user ratings/,
            `<span class="font-semibold">${currentProduct.userRatings}</span> User Ratings`
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed related products for: ${file}`);
    }
});

console.log('\n✅ All related products sections fixed!');