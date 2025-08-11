#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Script to reconcile current site data with novi-podaci
class DataReconciler {
    constructor() {
        this.currentDataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
        this.extractedDataPath = path.join(__dirname, '..', 'extracted-data');
        this.outputPath = path.join(__dirname, '..', 'reconciled-data');
    }

    loadCurrentData() {
        console.log('📖 Loading current site data...');
        const data = JSON.parse(fs.readFileSync(this.currentDataPath, 'utf8'));
        console.log(`✓ Found ${data.products.length} products on current site`);
        return data;
    }

    loadNoviPodaciProducts() {
        console.log('\n📖 Loading novi-podaci products...');
        const amazonLinks = JSON.parse(
            fs.readFileSync(path.join(this.extractedDataPath, 'amazon-links.json'), 'utf8')
        );
        
        // Extract clean product names from Amazon links
        const products = amazonLinks.links.map(link => ({
            name: link.text.replace(/^The\s+/, '').trim(),
            amazonLink: link.url,
            source: 'novi-podaci'
        }));
        
        console.log(`✓ Found ${products.length} products in novi-podaci with Amazon links`);
        
        return products;
    }

    reconcile() {
        const currentData = this.loadCurrentData();
        const noviProducts = this.loadNoviPodaciProducts();
        
        console.log('\n🔍 Reconciling data...\n');
        
        // Create name mapping for fuzzy matching
        const normalizeProductName = (name) => {
            return name.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };
        
        // Find products to keep, update, and remove
        const toKeep = [];
        const toRemove = [];
        const toAdd = [];
        
        // Check each current product
        currentData.products.forEach(currentProduct => {
            const normalized = normalizeProductName(currentProduct.name);
            const match = noviProducts.find(np => 
                normalizeProductName(np.name).includes(normalized) ||
                normalized.includes(normalizeProductName(np.name))
            );
            
            if (match) {
                // Update Amazon link if different
                if (currentProduct.amazonLink !== match.amazonLink) {
                    console.log(`↻ Updating: ${currentProduct.name}`);
                    console.log(`  Old link: ${currentProduct.amazonLink}`);
                    console.log(`  New link: ${match.amazonLink}`);
                    currentProduct.amazonLink = match.amazonLink;
                }
                toKeep.push(currentProduct);
            } else {
                console.log(`❌ To remove: ${currentProduct.name} (not in novi-podaci)`);
                toRemove.push(currentProduct);
            }
        });
        
        // Find new products to add
        noviProducts.forEach(noviProduct => {
            const normalized = normalizeProductName(noviProduct.name);
            const exists = toKeep.find(p => 
                normalizeProductName(p.name).includes(normalized) ||
                normalized.includes(normalizeProductName(p.name))
            );
            
            if (!exists) {
                console.log(`➕ To add: ${noviProduct.name}`);
                toAdd.push(noviProduct);
            }
        });
        
        // Summary
        console.log('\n📊 Reconciliation Summary:');
        console.log(`  • Products to keep: ${toKeep.length}`);
        console.log(`  • Products to remove: ${toRemove.length}`);
        console.log(`  • Products to add: ${toAdd.length}`);
        console.log(`  • Total after reconciliation: ${toKeep.length + toAdd.length}`);
        
        // List products being removed
        if (toRemove.length > 0) {
            console.log('\n🗑️  Products to be removed:');
            toRemove.forEach(p => console.log(`  - ${p.name}`));
        }
        
        // List products being added
        if (toAdd.length > 0) {
            console.log('\n✨ Products to be added:');
            toAdd.forEach(p => console.log(`  - ${p.name}`));
        }
        
        // Create reconciled data
        const reconciledData = {
            ...currentData,
            products: toKeep,
            reconciliation: {
                timestamp: new Date().toISOString(),
                removed: toRemove.map(p => p.name),
                added: toAdd.map(p => p.name),
                kept: toKeep.map(p => p.name)
            }
        };
        
        // Save reconciliation report
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(this.outputPath, 'reconciliation-report.json'),
            JSON.stringify(reconciledData, null, 2)
        );
        
        console.log(`\n✅ Reconciliation complete!`);
        console.log(`📄 Report saved to: ${path.join(this.outputPath, 'reconciliation-report.json')}`);
        
        return reconciledData;
    }

    generateUpdateScript() {
        console.log('\n🔧 Generating update script...');
        
        const script = `#!/usr/bin/env node
// Auto-generated script to update site based on reconciliation

const fs = require('fs');
const path = require('path');

const reconciliationReport = ${JSON.stringify(require(path.join(this.outputPath, 'reconciliation-report.json')), null, 2)};

// Update the main data file
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Remove products not in novi-podaci
currentData.products = currentData.products.filter(p => 
    !reconciliationReport.reconciliation.removed.includes(p.name)
);

// TODO: Add new products from novi-podaci
// This requires extracting full product data from novi-podaci.html

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));

console.log('✅ Site data updated based on reconciliation');
`;

        fs.writeFileSync(
            path.join(this.outputPath, 'apply-reconciliation.js'),
            script
        );
        
        console.log(`📄 Update script saved to: ${path.join(this.outputPath, 'apply-reconciliation.js')}`);
    }
}

// Run reconciliation
const reconciler = new DataReconciler();
reconciler.reconcile();
reconciler.generateUpdateScript();