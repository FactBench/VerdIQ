#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Final reconciliation based on deep extraction results
class FinalReconciliation {
    constructor() {
        this.currentDataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
        this.extractedDataPath = path.join(__dirname, '..', 'extracted-data');
        this.outputPath = path.join(__dirname, '..', 'final-reconciled-data');
    }

    async reconcile() {
        console.log('🎯 Final Reconciliation with novi-podaci\n');
        
        // Create output directory
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }
        
        // Load current data
        const currentData = JSON.parse(fs.readFileSync(this.currentDataPath, 'utf8'));
        console.log(`📊 Current site has ${currentData.products.length} products`);
        
        // Load extracted products from novi-podaci
        const deepExtraction = JSON.parse(
            fs.readFileSync(path.join(this.extractedDataPath, 'deep-extraction-results.json'), 'utf8')
        );
        const amazonLinks = JSON.parse(
            fs.readFileSync(path.join(this.extractedDataPath, 'amazon-links.json'), 'utf8')
        );
        
        console.log(`📊 novi-podaci has ${deepExtraction.totalFound} products\n`);
        
        // Create mapping of products from novi-podaci
        const noviProductsMap = new Map();
        
        // First, add all products with Amazon links (most reliable)
        amazonLinks.links.forEach(link => {
            const cleanName = link.text.replace(/^The\s+/, '').trim();
            noviProductsMap.set(cleanName, {
                name: cleanName,
                amazonLink: link.url,
                source: 'amazon-link'
            });
        });
        
        // Map the problematic entries to likely products
        const productMappings = {
            'Best for Above-Ground Pools': 'AIPER Seagull Pro',
            'Best for Large Pools': 'Aquabot X4'
        };
        
        // Process deep extraction results
        deepExtraction.products.forEach(productName => {
            // Check if this needs mapping
            const mappedName = productMappings[productName] || productName;
            
            if (!noviProductsMap.has(mappedName)) {
                noviProductsMap.set(mappedName, {
                    name: mappedName,
                    amazonLink: null, // Will need to find from current data
                    source: 'deep-extraction'
                });
            }
        });
        
        console.log('📋 Products from novi-podaci:');
        Array.from(noviProductsMap.keys()).sort().forEach((name, idx) => {
            const product = noviProductsMap.get(name);
            console.log(`  ${idx + 1}. ${name} ${product.amazonLink ? '✓' : '(no Amazon link)'}`);
        });
        
        // Now reconcile with current data
        console.log('\n🔄 Reconciliation process:\n');
        
        const finalProducts = [];
        const toRemove = [];
        
        // Check each current product
        currentData.products.forEach(currentProduct => {
            const normalizedCurrent = currentProduct.name.toLowerCase().replace(/[^\w\s]/g, '');
            
            // Find matching product in novi-podaci
            let matchFound = false;
            for (const [noviName, noviProduct] of noviProductsMap) {
                const normalizedNovi = noviName.toLowerCase().replace(/[^\w\s]/g, '');
                
                if (normalizedCurrent === normalizedNovi || 
                    normalizedCurrent.includes(normalizedNovi) || 
                    normalizedNovi.includes(normalizedCurrent)) {
                    
                    // Found a match
                    matchFound = true;
                    
                    // Update with novi-podaci data if available
                    const updatedProduct = {
                        ...currentProduct,
                        name: noviName, // Use novi-podaci name
                        amazonLink: noviProduct.amazonLink || currentProduct.amazonLink
                    };
                    
                    if (noviProduct.amazonLink && noviProduct.amazonLink !== currentProduct.amazonLink) {
                        console.log(`↻ Updated Amazon link for ${noviName}`);
                    }
                    
                    finalProducts.push(updatedProduct);
                    noviProductsMap.delete(noviName); // Mark as processed
                    break;
                }
            }
            
            if (!matchFound) {
                console.log(`❌ Removing: ${currentProduct.name} (not in novi-podaci)`);
                toRemove.push(currentProduct);
            }
        });
        
        // Add any remaining products from novi-podaci
        for (const [name, product] of noviProductsMap) {
            console.log(`➕ Adding: ${name} (new from novi-podaci)`);
            
            // Try to find data from removed products (in case of name mismatch)
            let productData = null;
            
            // Check if any removed product might be this one
            const possibleMatch = toRemove.find(removed => {
                return removed.badge && 
                       ((removed.badge.includes('Large') && name.includes('Aquabot')) ||
                        (removed.badge.includes('Above') && name.includes('Seagull')));
            });
            
            if (possibleMatch) {
                console.log(`  → Using data from removed product: ${possibleMatch.name}`);
                productData = {
                    ...possibleMatch,
                    name: name,
                    amazonLink: product.amazonLink || possibleMatch.amazonLink
                };
            } else {
                // Create minimal product entry
                productData = {
                    id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
                    name: name,
                    rating: 0,
                    userRatings: '0',
                    price: '$',
                    position: finalProducts.length + 1,
                    badge: 'New',
                    tagline: 'Product details coming soon',
                    keyFeatures: [],
                    whatWeLike: [],
                    amazonLink: product.amazonLink || '#'
                };
            }
            
            finalProducts.push(productData);
        }
        
        // Sort products by position
        finalProducts.sort((a, b) => (a.position || 999) - (b.position || 999));
        
        // Renumber positions
        finalProducts.forEach((product, idx) => {
            product.position = idx + 1;
        });
        
        console.log('\n📊 Final Summary:');
        console.log(`  • Products kept: ${currentData.products.length - toRemove.length}`);
        console.log(`  • Products removed: ${toRemove.length}`);
        console.log(`  • Products added: ${finalProducts.length - (currentData.products.length - toRemove.length)}`);
        console.log(`  • Total products: ${finalProducts.length}`);
        
        if (finalProducts.length !== 11) {
            console.log(`\n⚠️  WARNING: Expected 11 products but have ${finalProducts.length}`);
        }
        
        // Create final data structure
        const finalData = {
            ...currentData,
            products: finalProducts,
            lastUpdated: new Date().toISOString(),
            dataSource: 'novi-podaci.html'
        };
        
        // Save final reconciled data
        fs.writeFileSync(
            path.join(this.outputPath, 'pool-cleaners-data-reconciled.json'),
            JSON.stringify(finalData, null, 2)
        );
        
        console.log(`\n✅ Final reconciliation complete!`);
        console.log(`📄 Reconciled data saved to: ${path.join(this.outputPath, 'pool-cleaners-data-reconciled.json')}`);
        
        // Create implementation script
        this.createImplementationScript();
    }

    createImplementationScript() {
        const script = `#!/usr/bin/env node
// Script to apply the final reconciliation to the website

const fs = require('fs');
const path = require('path');

console.log('🚀 Applying reconciliation to website...\\n');

// Backup current data
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const backupPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.backup.json');

const currentData = fs.readFileSync(dataPath, 'utf8');
fs.writeFileSync(backupPath, currentData);
console.log('✓ Created backup: pool-cleaners-data.backup.json');

// Copy reconciled data
const reconciledPath = path.join(__dirname, '..', 'final-reconciled-data', 'pool-cleaners-data-reconciled.json');
const reconciledData = fs.readFileSync(reconciledPath, 'utf8');
fs.writeFileSync(dataPath, reconciledData);
console.log('✓ Applied reconciled data');

console.log('\\n✅ Reconciliation applied successfully!');
console.log('\\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Review the changes locally');
console.log('3. Run: node scripts/pre-deploy-verify.js');
console.log('4. Deploy: ./scripts/github-deploy.sh');
`;

        fs.writeFileSync(
            path.join(this.outputPath, 'apply-final-reconciliation.js'),
            script
        );
        
        console.log(`\n📄 Implementation script saved to: ${path.join(this.outputPath, 'apply-final-reconciliation.js')}`);
        console.log('\nTo apply changes, run:');
        console.log(`  node ${path.join(this.outputPath, 'apply-final-reconciliation.js')}`);
    }
}

// Run final reconciliation
const reconciler = new FinalReconciliation();
reconciler.reconcile();