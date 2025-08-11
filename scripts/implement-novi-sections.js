#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Implement all sections from novi-podaci step by step
class NoviSectionsImplementer {
    constructor() {
        this.sectionsDir = path.join(__dirname, '..', 'novi-podaci-sections');
        this.dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
        this.implementationLog = [];
    }

    async implement() {
        console.log('🚀 Implementing novi-podaci sections step by step\n');
        
        // Step 1: Update intro and page metadata
        await this.updateIntroSection();
        
        // Step 2: Update comparison table data
        await this.updateComparisonTable();
        
        // Step 3: Update product details from reviews
        await this.updateProductDetails();
        
        // Step 4: Update assets (images and links)
        await this.updateAssets();
        
        // Step 5: Save all changes
        await this.saveChanges();
        
        // Show implementation summary
        this.showSummary();
    }

    async updateIntroSection() {
        console.log('📝 Step 1/5: Updating introduction and page metadata...');
        
        const introPath = path.join(this.sectionsDir, 'intro-awards', 'intro-data.json');
        if (!fs.existsSync(introPath)) {
            console.log('  ⚠️  No intro data found, skipping...');
            return;
        }
        
        const introData = JSON.parse(fs.readFileSync(introPath, 'utf8'));
        const currentData = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        
        // Update page metadata
        if (introData.title && introData.title !== 'An error occurred.') {
            currentData.page.title = introData.title;
            this.implementationLog.push('✓ Updated page title');
        }
        
        if (introData.subtitle) {
            currentData.page.subtitle = introData.subtitle;
            this.implementationLog.push('✓ Updated page subtitle');
        }
        
        if (introData.lastUpdated) {
            currentData.page.lastUpdated = introData.lastUpdated;
            this.implementationLog.push('✓ Updated last updated date');
        }
        
        // Update section descriptions if available
        if (introData.sections && introData.sections.length > 0) {
            introData.sections.forEach(section => {
                if (section.title.includes('Champions') || section.title.includes('2025')) {
                    currentData.page.sections.topPicks.title = section.title;
                    currentData.page.sections.topPicks.description = section.description;
                    this.implementationLog.push('✓ Updated top picks section');
                } else if (section.title.includes('Compare') || section.title.includes('Side-by-Side')) {
                    currentData.page.sections.comparison.title = section.title;
                    currentData.page.sections.comparison.description = section.description;
                    this.implementationLog.push('✓ Updated comparison section');
                }
            });
        }
        
        // Save temporary progress
        this.currentData = currentData;
        console.log(`  ${this.implementationLog.length} intro updates applied`);
    }

    async updateComparisonTable() {
        console.log('\n📊 Step 2/5: Updating comparison table data...');
        
        const tablePath = path.join(this.sectionsDir, 'comparison-table', 'comparison-data.json');
        if (!fs.existsSync(tablePath)) {
            console.log('  ⚠️  No comparison data found, skipping...');
            return;
        }
        
        const tableData = JSON.parse(fs.readFileSync(tablePath, 'utf8'));
        let updateCount = 0;
        
        // Update price guide if available
        if (tableData.priceGuide && Object.keys(tableData.priceGuide).length > 0) {
            this.currentData.priceGuide = tableData.priceGuide;
            this.implementationLog.push('✓ Updated price guide');
            updateCount++;
        }
        
        // Update comparison criteria if available
        if (tableData.criteria && tableData.criteria.length > 0) {
            this.currentData.comparisonCriteria = tableData.criteria;
            this.implementationLog.push('✓ Updated comparison criteria');
            updateCount++;
        }
        
        console.log(`  ${updateCount} comparison table updates applied`);
    }

    async updateProductDetails() {
        console.log('\n📝 Step 3/5: Updating product details from reviews...');
        
        const reviewsDir = path.join(this.sectionsDir, 'product-reviews');
        if (!fs.existsSync(reviewsDir)) {
            console.log('  ⚠️  No reviews directory found, skipping...');
            return;
        }
        
        const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.json'));
        let updateCount = 0;
        
        reviewFiles.forEach(file => {
            const reviewData = JSON.parse(fs.readFileSync(path.join(reviewsDir, file), 'utf8'));
            
            // Find matching product in current data
            const productIndex = this.currentData.products.findIndex(p => p.id === reviewData.id);
            if (productIndex >= 0) {
                const product = this.currentData.products[productIndex];
                
                // Update features if found
                if (reviewData.features && reviewData.features.length > 0) {
                    product.keyFeatures = reviewData.features.slice(0, 5); // Keep top 5
                    updateCount++;
                }
                
                // Update pros as whatWeLike
                if (reviewData.pros && reviewData.pros.length > 0) {
                    product.whatWeLike = reviewData.pros.slice(0, 5); // Keep top 5
                    updateCount++;
                }
                
                // Add cons if available (new field)
                if (reviewData.cons && reviewData.cons.length > 0) {
                    product.whatWeDontLike = reviewData.cons.slice(0, 3); // Keep top 3
                    updateCount++;
                }
                
                console.log(`  ✓ Updated ${reviewData.name}`);
            }
        });
        
        console.log(`  ${updateCount} product detail updates applied`);
    }

    async updateAssets() {
        console.log('\n🖼️  Step 4/5: Updating assets (images and links)...');
        
        const assetsPath = path.join(this.sectionsDir, 'images-links', 'assets.json');
        if (!fs.existsSync(assetsPath)) {
            console.log('  ⚠️  No assets data found, skipping...');
            return;
        }
        
        const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
        let updateCount = 0;
        
        // Update Amazon links where missing
        assets.amazonLinks.forEach(link => {
            const productName = link.text.replace(/^The\s+/, '').trim();
            const product = this.currentData.products.find(p => 
                p.name.toLowerCase() === productName.toLowerCase()
            );
            
            if (product && (!product.amazonLink || product.amazonLink === '#')) {
                product.amazonLink = link.url;
                this.implementationLog.push(`✓ Added Amazon link for ${product.name}`);
                updateCount++;
            }
        });
        
        // Store official links for future use
        if (assets.officialLinks && assets.officialLinks.length > 0) {
            this.currentData.officialLinks = assets.officialLinks;
            this.implementationLog.push('✓ Stored official manufacturer links');
            updateCount++;
        }
        
        console.log(`  ${updateCount} asset updates applied`);
    }

    async saveChanges() {
        console.log('\n💾 Step 5/5: Saving all changes...');
        
        // Update metadata
        this.currentData.lastUpdated = new Date().toISOString();
        this.currentData.dataSource = 'novi-podaci.html (fully integrated)';
        
        // Save the updated data
        fs.writeFileSync(this.dataPath, JSON.stringify(this.currentData, null, 2));
        
        console.log('  ✓ All changes saved to pool-cleaners-data.json');
    }

    showSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('✅ IMPLEMENTATION COMPLETE');
        console.log('='.repeat(60));
        
        console.log('\n📋 Implementation Log:');
        this.implementationLog.forEach(log => console.log(`  ${log}`));
        
        console.log(`\n📊 Total updates applied: ${this.implementationLog.length}`);
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Run: npm run build');
        console.log('2. Preview changes locally');
        console.log('3. Run: node scripts/pre-deploy-verify.js');
        console.log('4. Deploy: ./scripts/github-deploy.sh');
        
        // Create verification checklist
        const checklist = {
            implementationDate: new Date().toISOString(),
            updatesApplied: this.implementationLog.length,
            sections: {
                intro: this.implementationLog.filter(l => l.includes('title') || l.includes('section')).length > 0,
                comparison: this.implementationLog.filter(l => l.includes('comparison') || l.includes('price')).length > 0,
                products: this.implementationLog.filter(l => l.includes('Updated') && !l.includes('page')).length > 0,
                assets: this.implementationLog.filter(l => l.includes('Amazon') || l.includes('official')).length > 0
            },
            log: this.implementationLog
        };
        
        fs.writeFileSync(
            path.join(__dirname, '..', 'implementation-checklist.json'),
            JSON.stringify(checklist, null, 2)
        );
        
        console.log('\n📄 Implementation checklist saved to: implementation-checklist.json');
    }
}

// Run implementation
const implementer = new NoviSectionsImplementer();
implementer.implement();