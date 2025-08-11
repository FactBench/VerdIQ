#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

class ContentIntegrator {
    constructor() {
        this.approvedPath = path.join(__dirname, '..', 'staging', 'approved');
        this.dataPath = path.join(__dirname, '..', 'src', 'data');
        this.goldenDataPath = path.join(__dirname, '..', 'golden-data');
        this.backupPath = path.join(__dirname, '..', 'golden-data', 'backups');
        this.integratedItems = [];
        this.errors = [];
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    generateHash(data) {
        const normalized = JSON.stringify(data, null, 2);
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }

    createBackup() {
        this.log('\n📦 Creating backup of current data...', 'blue');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(this.backupPath, timestamp);
        
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
        
        fs.mkdirSync(backupDir);
        
        // Backup current production data
        const productData = path.join(this.dataPath, 'pool-cleaners-data.json');
        if (fs.existsSync(productData)) {
            fs.copyFileSync(
                productData,
                path.join(backupDir, 'pool-cleaners-data.json')
            );
        }
        
        // Backup golden data
        const goldenFiles = fs.readdirSync(path.join(this.goldenDataPath, 'products'))
            .filter(f => f.endsWith('.json'));
            
        goldenFiles.forEach(file => {
            fs.copyFileSync(
                path.join(this.goldenDataPath, 'products', file),
                path.join(backupDir, file)
            );
        });
        
        this.log(`✓ Backup created: ${backupDir}`, 'green');
        return backupDir;
    }

    detectContentType(data) {
        if (data.products || (Array.isArray(data) && data[0]?.rating)) {
            return 'products';
        } else if (data.review || data.verdict) {
            return 'review';
        } else if (data.comparison) {
            return 'comparison';
        }
        return 'unknown';
    }

    integrateProducts(newProducts, existingData) {
        this.log('\n🔄 Integrating product data...', 'blue');
        
        const productsToAdd = Array.isArray(newProducts) ? newProducts : newProducts.products;
        let addedCount = 0;
        let updatedCount = 0;
        
        productsToAdd.forEach(newProduct => {
            const existingIndex = existingData.products.findIndex(
                p => p.id === newProduct.id
            );
            
            if (existingIndex >= 0) {
                // Update existing product
                existingData.products[existingIndex] = {
                    ...existingData.products[existingIndex],
                    ...newProduct,
                    lastUpdated: new Date().toISOString()
                };
                updatedCount++;
                this.log(`  ↻ Updated: ${newProduct.name}`, 'cyan');
            } else {
                // Add new product
                existingData.products.push({
                    ...newProduct,
                    position: existingData.products.length + 1,
                    addedDate: new Date().toISOString()
                });
                addedCount++;
                this.log(`  + Added: ${newProduct.name}`, 'green');
            }
        });
        
        this.log(`\n✓ Integration complete: ${addedCount} added, ${updatedCount} updated`, 'green');
        return existingData;
    }

    updateGoldenData(data) {
        this.log('\n🔐 Updating golden data...', 'blue');
        
        // Regenerate chunks
        const chunkSize = 5;
        const products = data.products;
        
        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize);
            const chunkNumber = Math.floor(i / chunkSize) + 1;
            const chunkId = `chunk-${String(chunkNumber).padStart(3, '0')}`;
            const chunkPath = path.join(this.goldenDataPath, 'products', `${chunkId}.json`);
            
            fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
            this.log(`  ✓ Updated ${chunkId}`, 'green');
        }
        
        // Update manifest
        const manifest = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            lastIntegration: new Date().toISOString(),
            chunks: {}
        };
        
        const chunkFiles = fs.readdirSync(path.join(this.goldenDataPath, 'products'))
            .filter(f => f.startsWith('chunk-') && f.endsWith('.json'))
            .sort();
            
        chunkFiles.forEach(file => {
            const chunkData = JSON.parse(
                fs.readFileSync(path.join(this.goldenDataPath, 'products', file), 'utf8')
            );
            const chunkId = file.replace('.json', '');
            
            manifest.chunks[chunkId] = {
                file: file,
                hash: this.generateHash(chunkData),
                productCount: chunkData.length,
                products: chunkData.map(p => ({
                    id: p.id,
                    name: p.name,
                    badge: p.badge
                }))
            };
        });
        
        fs.writeFileSync(
            path.join(this.goldenDataPath, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        this.log('✓ Golden data updated', 'green');
    }

    async integrate() {
        this.log('🚀 Starting Content Integration', 'blue');
        this.log('=' .repeat(50), 'blue');
        
        // Check for approved content
        if (!fs.existsSync(this.approvedPath)) {
            this.log('\n❌ No approved content directory found', 'red');
            return false;
        }
        
        const approvedFiles = fs.readdirSync(this.approvedPath)
            .filter(f => f.endsWith('.json') && !f.includes('-validation'));
            
        if (approvedFiles.length === 0) {
            this.log('\n📭 No approved content to integrate', 'yellow');
            return true;
        }
        
        this.log(`\n📋 Found ${approvedFiles.length} approved files to integrate`, 'blue');
        
        // Create backup
        const backupDir = this.createBackup();
        
        try {
            // Load current production data
            const productDataPath = path.join(this.dataPath, 'pool-cleaners-data.json');
            let currentData = JSON.parse(fs.readFileSync(productDataPath, 'utf8'));
            
            // Process each approved file
            approvedFiles.forEach(file => {
                this.log(`\n📄 Processing: ${file}`, 'blue');
                
                const filePath = path.join(this.approvedPath, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const contentType = this.detectContentType(content);
                
                switch (contentType) {
                    case 'products':
                        currentData = this.integrateProducts(content, currentData);
                        break;
                    case 'review':
                        this.log('  ⚠️  Review integration not yet implemented', 'yellow');
                        break;
                    case 'comparison':
                        this.log('  ⚠️  Comparison integration not yet implemented', 'yellow');
                        break;
                    default:
                        this.log('  ❌ Unknown content type', 'red');
                }
                
                this.integratedItems.push(file);
            });
            
            // Save updated data
            fs.writeFileSync(productDataPath, JSON.stringify(currentData, null, 2));
            this.log('\n✓ Production data updated', 'green');
            
            // Update golden data
            this.updateGoldenData(currentData);
            
            // Run validation
            this.log('\n🔍 Running post-integration validation...', 'blue');
            const { execSync } = require('child_process');
            
            try {
                execSync('node scripts/validate-data.js', { stdio: 'inherit' });
                this.log('✓ Validation passed', 'green');
            } catch (error) {
                this.log('❌ Validation failed - rolling back', 'red');
                throw new Error('Post-integration validation failed');
            }
            
            // Archive integrated files
            const archivePath = path.join(this.approvedPath, '..', 'integrated');
            if (!fs.existsSync(archivePath)) {
                fs.mkdirSync(archivePath);
            }
            
            this.integratedItems.forEach(file => {
                fs.renameSync(
                    path.join(this.approvedPath, file),
                    path.join(archivePath, `${new Date().toISOString().split('T')[0]}-${file}`)
                );
            });
            
            // Summary
            this.log('\n' + '=' .repeat(50), 'blue');
            this.log('✅ INTEGRATION COMPLETE', 'green');
            this.log(`\n📊 Summary:`, 'blue');
            this.log(`  • Files integrated: ${this.integratedItems.length}`, 'green');
            this.log(`  • Backup created: ${backupDir}`, 'green');
            this.log(`  • Golden data updated`, 'green');
            this.log(`  • Validation passed`, 'green');
            
            this.log('\n🚀 Next steps:', 'blue');
            this.log('  1. Review the changes: git diff', 'yellow');
            this.log('  2. Run pre-deployment check: node scripts/pre-deploy-verify.js', 'yellow');
            this.log('  3. Deploy if satisfied: ./scripts/github-deploy.sh', 'yellow');
            
            return true;
            
        } catch (error) {
            this.log(`\n❌ ERROR during integration: ${error.message}`, 'red');
            this.log('🔄 Rolling back changes...', 'yellow');
            
            // Restore from backup
            const productDataPath = path.join(this.dataPath, 'pool-cleaners-data.json');
            const backupFile = path.join(backupDir, 'pool-cleaners-data.json');
            
            if (fs.existsSync(backupFile)) {
                fs.copyFileSync(backupFile, productDataPath);
                this.log('✓ Changes rolled back', 'green');
            }
            
            return false;
        }
    }
}

// Run integration
const integrator = new ContentIntegrator();
integrator.integrate().then(success => {
    process.exit(success ? 0 : 1);
});