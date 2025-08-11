const fs = require('fs');
const path = require('path');

// Load product data
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/pool-cleaners-complete.json'), 'utf8'));
const reviewTemplate = fs.readFileSync(path.join(__dirname, '../src/templates/product-review.html'), 'utf8');

// Helper function to create slug from product name
function createSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Helper function to get badge class
function getBadgeClass(badge) {
    const badgeClasses = {
        'Best OF THE BEST': 'badge-gold-gradient animate-shimmer',
        'Best Overall': 'badge-primary',
        'Best Cordless': 'badge-accent',
        'Budget Pick': 'badge-success',
        'Best for Above-Ground Pools': 'badge-info',
        'Top Smart Features': 'badge-warning',
        'Best for Large Pools': 'badge-primary',
        'Best AI Navigation': 'badge-accent',
        'Best Premium Cordless': 'badge-gold',
        'Best Surface Skimmer': 'badge-info',
        'Best Filtration Versatility': 'badge-warning',
        'Proven Cleaning Powerhouse': 'badge-success'
    };
    return badgeClasses[badge] || 'badge-primary';
}

// Get price range description
function getPriceRange(price) {
    const priceRanges = {
        '$': 'Under $500',
        '$$': '$500 - $999',
        '$$$': '$1000 - $1999',
        '$$$$': '$2000+'
    };
    return priceRanges[price] || '';
}

// Generate review content for each product
function generateReviewContent(product) {
    // Add default review content if not present
    const reviewContent = {
        considerations: product.considerations || [
            'Consider your pool size and type before purchasing',
            'Check warranty terms and local service availability',
            'Factor in ongoing maintenance costs',
            'Ensure compatibility with your pool setup'
        ],
        cleaningPerformance: product.cleaningPerformance || 
            `The ${product.name} delivers ${product.badge.toLowerCase() === 'best of the best' ? 'exceptional' : 'solid'} cleaning performance across various pool surfaces. ${product.whatWeLike[0]} The advanced filtration system effectively captures both fine particles and larger debris, ensuring your pool stays crystal clear.`,
        navigationCoverage: product.navigationCoverage || 
            `Equipped with ${product.keyFeatures[0]}, this cleaner provides comprehensive pool coverage. ${product.keyFeatures[1]} The intelligent navigation system ensures no spots are missed, while the efficient cleaning pattern reduces overall cleaning time.`,
        easeOfUse: product.easeOfUse || 
            `Setting up the ${product.name} is straightforward, with clear instructions and minimal assembly required. ${product.keyFeatures[2]} The intuitive controls and smart features make daily operation effortless, perfect for pool owners who value convenience.`,
        valueForMoney: product.valueForMoney || 
            `At ${getPriceRange(product.price)}, the ${product.name} offers ${product.rating >= 4.7 ? 'excellent' : 'good'} value for money. With ${product.userRatings} satisfied users, it has proven to be a reliable investment that delivers consistent results and reduces long-term pool maintenance costs.`,
        specifications: product.specifications || {
            'Pool Type': 'In-ground and above-ground',
            'Pool Size': 'Up to 50 feet',
            'Cleaning Cycle': '2-3 hours',
            'Cable Length': '60 feet',
            'Filter Type': 'Top-load cartridge',
            'Warranty': '2 years',
            'Weight': '18.75 lbs',
            'Connectivity': product.name.includes('Wi-Fi') ? 'Wi-Fi enabled' : 'Not applicable'
        }
    };
    
    return reviewContent;
}

// Get related products (3 products from same price range or similar features)
function getRelatedProducts(currentProduct, allProducts) {
    return allProducts
        .filter(p => p.id !== currentProduct.id)
        .filter(p => p.price === currentProduct.price || Math.abs(p.position - currentProduct.position) <= 2)
        .slice(0, 3)
        .map(p => ({
            name: p.name,
            slug: createSlug(p.name),
            rating: p.rating,
            price: getPriceRange(p.price)
        }));
}

// Simple template engine
function renderTemplate(template, data) {
    let rendered = template;
    
    // Replace simple variables
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, data[key] || '');
    });
    
    // Handle if statements
    rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, key, content) => {
        return data[key] ? content : '';
    });
    
    // Handle each loops
    rendered = rendered.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, key, content) => {
        if (!data[key] || !Array.isArray(data[key])) return '';
        return data[key].map(item => {
            if (typeof item === 'object') {
                let itemContent = content;
                Object.keys(item).forEach(itemKey => {
                    itemContent = itemContent.replace(new RegExp(`{{${itemKey}}}`, 'g'), item[itemKey]);
                });
                return itemContent;
            } else {
                return content.replace(/{{this}}/g, item);
            }
        }).join('');
    });
    
    // Handle repeat helper for star ratings
    rendered = rendered.replace(/{{#repeat\s+([^}]+)}}([\s\S]*?){{\/repeat}}/g, (match, countExpr, content) => {
        let count;
        if (countExpr.includes('(') && countExpr.includes(')')) {
            // Handle expressions like (5-rating)
            const expr = countExpr.replace(/rating/g, data.rating || 0);
            try {
                count = eval(expr);
            } catch (e) {
                count = 0;
            }
        } else if (data[countExpr] !== undefined) {
            count = data[countExpr];
        } else {
            count = parseInt(countExpr) || 0;
        }
        return content.repeat(Math.max(0, Math.floor(count)));
    });
    
    // Handle object iterations for specifications
    rendered = rendered.replace(/{{#each\s+specifications}}([\s\S]*?){{\/each}}/g, (match, content) => {
        if (!data.specifications || typeof data.specifications !== 'object') return '';
        return Object.entries(data.specifications).map(([key, value]) => {
            return content
                .replace(/{{@key}}/g, key)
                .replace(/{{this}}/g, value);
        }).join('');
    });
    
    return rendered;
}

// Create reviews directory
const reviewsDir = path.join(__dirname, '../src/pages/reviews');
if (!fs.existsSync(reviewsDir)) {
    fs.mkdirSync(reviewsDir, { recursive: true });
}

// Generate review page for each product
productsData.products.forEach(product => {
    const slug = createSlug(product.name);
    const reviewContent = generateReviewContent(product);
    const relatedProducts = getRelatedProducts(product, productsData.products);
    
    const pageData = {
        ...product,
        productName: product.name,
        productSlug: slug,
        productImage: product.image,
        badgeClass: getBadgeClass(product.badge),
        priceRange: getPriceRange(product.price),
        lastUpdated: productsData.page.lastUpdated,
        ...reviewContent,
        relatedProducts
    };
    
    const renderedPage = renderTemplate(reviewTemplate, pageData);
    
    // Write the review page
    const reviewPath = path.join(reviewsDir, `${slug}.html`);
    fs.writeFileSync(reviewPath, renderedPage);
    console.log(`✅ Generated review page: ${slug}.html`);
});

console.log(`\n✨ Successfully generated ${productsData.products.length} review pages!`);

// Update the build script to include review pages
const buildScriptPath = path.join(__dirname, 'build.js');
if (fs.existsSync(buildScriptPath)) {
    console.log('\n📝 Note: Remember to update build.js to copy review pages to dist/');
}