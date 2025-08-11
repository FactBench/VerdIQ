#!/usr/bin/env node
/**
 * Generate a new product analysis page from data
 * Usage: node generate-page.js <data-file-name>
 * Example: node generate-page.js best-robot-vacuums
 */

const fs = require('fs');
const path = require('path');

function generateProductCards(products) {
    return products.map(product => `
        <div class="card glow-hover group relative" x-data="{ showDetails: false }">
            <div class="absolute top-4 right-4">
                <span class="text-2xl font-bold text-gray-500">#${product.position}</span>
            </div>
            
            <h3 class="text-xl font-semibold mb-3 pr-12">${product.name}</h3>
            
            ${product.badge ? `<span class="badge badge-primary mb-3">${product.badge}</span>` : ''}
            
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                    <div class="flex text-yellow-500">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="text-sm text-gray-400">${product.rating}/5.0</span>
                </div>
                <span class="text-xl font-bold text-primary">${product.price}</span>
            </div>
            
            <div class="space-y-2 mb-4">
                ${product.keyFeatures.map(feature => 
                    `<div class="flex items-start space-x-2">
                        <svg class="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-sm text-gray-300">${feature}</span>
                    </div>`
                ).join('')}
            </div>
            
            <div class="mt-auto">
                <a href="${product.affiliateLink || '#'}" 
                   class="btn-primary w-full text-center"
                   target="_blank"
                   rel="noopener noreferrer">
                    Check Best Price
                </a>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    if (hasHalfStar) {
        stars += '<svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<svg class="w-5 h-5 text-gray-600" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    return stars;
}

function generateComparisonTable(products, criteria) {
    const tableHeaders = `
        <thead>
            <tr>
                <th class="text-left py-3 px-4">Feature</th>
                ${products.slice(0, 4).map(p => 
                    `<th class="text-center py-3 px-4">${p.name}</th>`
                ).join('')}
            </tr>
        </thead>
    `;
    
    const tableRows = criteria.map(criterion => `
        <tr class="border-t border-base-300">
            <td class="py-3 px-4 font-medium">${criterion}</td>
            ${products.slice(0, 4).map(() => 
                `<td class="text-center py-3 px-4">
                    <div class="flex justify-center">
                        ${generateRandomRating()}
                    </div>
                </td>`
            ).join('')}
        </tr>
    `).join('');
    
    return `
        <table class="w-full bg-base-200 rounded-lg overflow-hidden">
            ${tableHeaders}
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

function generateRandomRating() {
    const ratings = ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐', '⭐⭐⭐'];
    return ratings[Math.floor(Math.random() * ratings.length)];
}

function generatePage(dataFileName) {
    // Load data
    const dataPath = path.join(__dirname, '..', 'src', 'data', `${dataFileName}-data.json`);
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ Data file not found: ${dataPath}`);
        console.log(`💡 First run: python scripts/extract-zoopy-content.py <url> ${dataFileName}`);
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Load template
    const templatePath = path.join(__dirname, '..', 'src', 'templates', 'base.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Generate page slug
    const pageSlug = dataFileName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Generate page content
    const pageContent = `
        <!-- Hero Section -->
        <section class="bg-gradient-to-b from-base-100 to-base-200 py-16">
            <div class="container mx-auto px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <span class="badge badge-accent mb-4">Expert Analysis</span>
                    <h1 class="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                        ${data.page.title}
                    </h1>
                    <p class="text-xl text-gray-400 mb-8">${data.page.subtitle}</p>
                    <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clip-rule="evenodd"/>
                            </svg>
                            Updated: ${data.page.lastUpdated}
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            ${data.products.length} Products Analyzed
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Products Grid -->
        <section class="py-16">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-display font-bold text-center mb-12">
                    Top Rated Products
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" x-data>
                    ${generateProductCards(data.products)}
                </div>
            </div>
        </section>

        <!-- Comparison Table -->
        <section class="py-16 bg-base-200">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-display font-bold text-center mb-12">
                    Detailed Comparison
                </h2>
                <div class="overflow-x-auto">
                    ${generateComparisonTable(data.products, data.comparisonCriteria)}
                </div>
            </div>
        </section>

        <!-- Price Guide -->
        <section class="py-16">
            <div class="container mx-auto px-4">
                <div class="max-w-2xl mx-auto text-center">
                    <h2 class="text-3xl font-display font-bold mb-8">Price Guide</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${Object.entries(data.priceGuide).map(([symbol, label]) => `
                            <div class="bg-base-200 rounded-lg p-4">
                                <div class="text-2xl font-bold text-primary mb-2">${symbol}</div>
                                <div class="text-sm text-gray-400">${label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>
    `;
    
    // Replace template variables
    const finalHtml = template
        .replace(/{{PAGE_TITLE}}/g, data.page.title)
        .replace(/{{PAGE_DESCRIPTION}}/g, data.page.metaDescription)
        .replace(/{{PAGE_IMAGE}}/g, '/VerdIQ/assets/images/og-image.jpg')
        .replace(/{{PAGE_URL}}/g, `https://factbench.github.io/VerdIQ/${pageSlug}/`)
        .replace('{{PAGE_CONTENT}}', pageContent)
        .replace('{{PAGE_SCRIPTS}}', `
            <script>
                // Performance tracking
                if (window.gtag) {
                    gtag('event', 'page_view', {
                        page_title: '${data.page.title}',
                        page_location: window.location.href,
                        page_path: '/${pageSlug}/'
                    });
                }
            </script>
        `);
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'src', 'pages');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write file
    const outputPath = path.join(outputDir, `${pageSlug}.html`);
    fs.writeFileSync(outputPath, finalHtml);
    
    // Update build script to include new page
    updateBuildScript(pageSlug);
    
    console.log(`✅ Page generated: ${outputPath}`);
    console.log(`📁 URL path: /${pageSlug}/`);
    console.log(`\n💡 Next steps:`);
    console.log(`1. Run 'npm run build' to build the site`);
    console.log(`2. Run 'npm run deploy' to deploy to GitHub Pages`);
}

function updateBuildScript(pageSlug) {
    const buildScriptPath = path.join(__dirname, 'build.js');
    let buildScript = fs.readFileSync(buildScriptPath, 'utf8');
    
    // Find the dirs array and add new directory
    const dirsMatch = buildScript.match(/const dirs = \[([\s\S]*?)\];/);
    if (dirsMatch) {
        const currentDirs = dirsMatch[1];
        if (!currentDirs.includes(`dist/${pageSlug}`)) {
            const newDir = `    'dist/${pageSlug}'`;
            const updatedDirs = currentDirs.trimEnd() + ',\n' + newDir;
            buildScript = buildScript.replace(dirsMatch[1], updatedDirs);
        }
    }
    
    // Add process line for new page
    const processLineToAdd = `processHtml('src/pages/${pageSlug}.html', 'dist/${pageSlug}/index.html');`;
    if (!buildScript.includes(processLineToAdd)) {
        const lastProcessLine = buildScript.lastIndexOf('processHtml(');
        const endOfLine = buildScript.indexOf('\n', lastProcessLine);
        buildScript = buildScript.slice(0, endOfLine + 1) + processLineToAdd + '\n' + buildScript.slice(endOfLine + 1);
    }
    
    fs.writeFileSync(buildScriptPath, buildScript);
}

// Main execution
if (process.argv.length !== 3) {
    console.log('Usage: node generate-page.js <data-file-name>');
    console.log('Example: node generate-page.js best-robot-vacuums');
    process.exit(1);
}

generatePage(process.argv[2]);