#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Create review pages for new products
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const reviewsDir = path.join(__dirname, '..', 'src', 'pages', 'reviews');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('📝 Creating missing review pages...\n');

const reviewTemplate = (product) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} Review - FactBench</title>
    <meta name="description" content="Expert review of ${product.name} - ${product.tagline}">
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <div class="min-h-screen bg-base-100 text-gray-100">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-base-100/90 backdrop-blur-lg border-b border-base-300">
            <div class="max-w-6xl mx-auto px-4 py-4">
                <nav class="flex justify-between items-center">
                    <a href="/VerdIQ/" class="text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        FactBench
                    </a>
                    <a href="/VerdIQ/best-robotic-pool-cleaners/" class="text-gray-400 hover:text-primary transition-colors">
                        ← Back to List
                    </a>
                </nav>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-4xl mx-auto px-4 py-8">
            <article class="space-y-8">
                <!-- Product Header -->
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-display font-bold mb-4">
                        ${product.name}
                    </h1>
                    <p class="text-xl text-gray-400 mb-6">${product.tagline}</p>
                    
                    <!-- Rating and Badge -->
                    <div class="flex justify-center items-center gap-4 mb-8">
                        <div class="flex items-center gap-2">
                            <div class="flex text-yellow-400">
                                ${Array(5).fill().map((_, i) => 
                                    `<svg class="w-6 h-6 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-current opacity-20'}" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>`
                                ).join('')}
                            </div>
                            <span class="text-lg font-semibold">${product.rating}</span>
                            <span class="text-gray-400">(${product.userRatings} reviews)</span>
                        </div>
                        ${product.badge ? `<span class="badge badge-best">${product.badge}</span>` : ''}
                    </div>
                </div>

                <!-- Key Features -->
                ${product.keyFeatures && product.keyFeatures.length > 0 ? `
                <section class="card">
                    <h2 class="text-2xl font-display font-bold mb-4">Key Features</h2>
                    <ul class="space-y-2">
                        ${product.keyFeatures.map(feature => 
                            `<li class="flex items-start gap-3">
                                <svg class="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>${feature}</span>
                            </li>`
                        ).join('')}
                    </ul>
                </section>
                ` : ''}

                <!-- What We Like -->
                ${product.whatWeLike && product.whatWeLike.length > 0 ? `
                <section class="card">
                    <h2 class="text-2xl font-display font-bold mb-4">What We Like</h2>
                    <ul class="space-y-2">
                        ${product.whatWeLike.map(item => 
                            `<li class="flex items-start gap-3">
                                <svg class="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>${item}</span>
                            </li>`
                        ).join('')}
                    </ul>
                </section>
                ` : ''}

                <!-- CTA Section -->
                <div class="text-center py-8">
                    <a href="${product.amazonLink}" 
                       target="_blank" 
                       rel="nofollow noopener"
                       class="btn-primary inline-block">
                        Check Price on Amazon
                    </a>
                </div>
            </article>
        </main>
    </div>
</body>
</html>`;

// Create review pages for all products
let createdCount = 0;
data.products.forEach(product => {
    const fileName = `${product.id}.html`;
    const filePath = path.join(reviewsDir, fileName);
    
    // Always create/update to ensure consistency
    fs.writeFileSync(filePath, reviewTemplate(product));
    console.log(`✓ Created/Updated: ${fileName}`);
    createdCount++;
});

console.log(`\n✅ Created/Updated ${createdCount} review pages`);
console.log('\nNow rebuild the site: npm run build');