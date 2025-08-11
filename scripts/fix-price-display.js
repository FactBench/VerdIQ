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
    
    // Fix price display in related products
    productData.products.forEach(product => {
        // Find and replace single $ with actual price
        const regex = new RegExp(`<p class="text-sm text-gray-400">\\$</p>`, 'g');
        content = content.replace(regex, `<p class="text-sm text-gray-400">${product.price}</p>`);
    });
    
    // Get current product
    const productId = file.replace('.html', '');
    const currentProduct = productData.products.find(p => p.id === productId);
    
    if (currentProduct) {
        // Fix main price display
        content = content.replace(
            /<span class="text-3xl font-bold text-primary">\$\$<\/span>/,
            `<span class="text-3xl font-bold text-primary">${currentProduct.price}</span>`
        );
        
        // Add the actual dollar amount
        const priceMap = {
            '$': 'Under $500',
            '$$': '$500 - $999',
            '$$$': '$1000 - $1999',
            '$$$$': '$2000+'
        };
        
        content = content.replace(
            `<span class="text-3xl font-bold text-primary">${currentProduct.price}</span>
                                <span class="text-gray-400 ml-2">$2000+</span>`,
            `<span class="text-3xl font-bold text-primary">${currentProduct.price}</span>
                                <span class="text-gray-400 ml-2">${priceMap[currentProduct.price]}</span>`
        );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed price display for: ${file}`);
});

console.log('\n✅ All price displays fixed!');