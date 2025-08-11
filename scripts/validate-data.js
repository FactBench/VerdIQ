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
    reset: '\x1b[0m'
};

class DataValidator {
    constructor() {
        this.goldenDataPath = path.join(__dirname, '..', 'golden-data');
        this.manifestPath = path.join(this.goldenDataPath, 'manifest.json');
        this.currentDataPath = path.join(__dirname, '..', 'src', 'data');
        this.errors = [];
        this.warnings = [];
    }

    // Generate SHA-256 hash for data
    generateHash(data) {
        const normalized = JSON.stringify(data, null, 2);
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }

    // Load manifest with golden data hashes
    loadManifest() {
        try {
            return JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
        } catch (error) {
            this.errors.push(`Cannot load manifest: ${error.message}`);
            return null;
        }
    }

    // Validate required fields exist
    validateRequiredFields(product, index) {
        const requiredFields = [
            'id', 'name', 'badge', 'rating', 'userRatings', 
            'price', 'tagline', 'keyFeatures', 'whatWeLike'
        ];

        requiredFields.forEach(field => {
            if (!product[field]) {
                this.errors.push(`Product ${index + 1}: Missing required field '${field}'`);
            }
        });

        // Validate affiliate links
        if (!product.amazonLink || !product.amazonLink.startsWith('https://amzn.to/')) {
            this.errors.push(`Product ${index + 1}: Invalid Amazon link`);
        }
    }

    // Validate data types and ranges
    validateDataTypes(product, index) {
        // Rating should be between 0 and 5
        if (product.rating < 0 || product.rating > 5) {
            this.errors.push(`Product ${index + 1}: Rating ${product.rating} out of range (0-5)`);
        }

        // Price should match pattern
        if (!product.price.match(/^[$]{1,4}$/)) {
            this.errors.push(`Product ${index + 1}: Invalid price format '${product.price}'`);
        }

        // User ratings should be a valid format
        if (!product.userRatings.match(/^[\d,]+\+?$/)) {
            this.warnings.push(`Product ${index + 1}: Unusual user ratings format '${product.userRatings}'`);
        }
    }

    // Compare current data with golden data
    compareWithGolden(currentData, goldenHash, dataType) {
        const currentHash = this.generateHash(currentData);
        
        if (currentHash !== goldenHash) {
            this.errors.push(`${dataType} data has been modified! Expected hash: ${goldenHash.substring(0, 8)}..., Got: ${currentHash.substring(0, 8)}...`);
            return false;
        }
        
        return true;
    }

    // Main validation function
    async validate() {
        console.log(`${colors.blue}🔍 Starting Data Validation...${colors.reset}\n`);

        // Load manifest
        const manifest = this.loadManifest();
        if (!manifest) {
            console.log(`${colors.red}❌ Failed to load manifest. Cannot proceed with validation.${colors.reset}`);
            return false;
        }

        // Load current product data
        let currentData;
        try {
            currentData = JSON.parse(
                fs.readFileSync(path.join(this.currentDataPath, 'pool-cleaners-data.json'), 'utf8')
            );
        } catch (error) {
            this.errors.push(`Cannot load current data: ${error.message}`);
            console.log(`${colors.red}❌ Failed to load current data.${colors.reset}`);
            return false;
        }

        // Validate each product
        console.log(`${colors.blue}Validating ${currentData.products.length} products...${colors.reset}`);
        
        currentData.products.forEach((product, index) => {
            this.validateRequiredFields(product, index);
            this.validateDataTypes(product, index);
        });

        // Compare chunks with golden data
        const chunkSize = 5;
        for (let i = 0; i < currentData.products.length; i += chunkSize) {
            const chunk = currentData.products.slice(i, i + chunkSize);
            const chunkId = `chunk-${String(Math.floor(i / chunkSize) + 1).padStart(3, '0')}`;
            
            if (manifest.chunks && manifest.chunks[chunkId]) {
                const isValid = this.compareWithGolden(chunk, manifest.chunks[chunkId].hash, chunkId);
                if (isValid) {
                    console.log(`${colors.green}✓ ${chunkId} validated successfully${colors.reset}`);
                }
            } else {
                this.warnings.push(`No golden data hash found for ${chunkId}`);
            }
        }

        // Report results
        console.log('\n' + '='.repeat(50) + '\n');
        
        if (this.errors.length === 0) {
            console.log(`${colors.green}✅ All validations passed!${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ Validation failed with ${this.errors.length} errors:${colors.reset}`);
            this.errors.forEach(error => console.log(`   ${colors.red}- ${error}${colors.reset}`));
        }

        if (this.warnings.length > 0) {
            console.log(`\n${colors.yellow}⚠️  ${this.warnings.length} warnings:${colors.reset}`);
            this.warnings.forEach(warning => console.log(`   ${colors.yellow}- ${warning}${colors.reset}`));
        }

        // Write validation report
        const report = {
            timestamp: new Date().toISOString(),
            passed: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                totalProducts: currentData.products.length,
                errorsFound: this.errors.length,
                warningsFound: this.warnings.length
            }
        };

        fs.writeFileSync(
            path.join(__dirname, '..', 'validation-report.json'),
            JSON.stringify(report, null, 2)
        );

        return this.errors.length === 0;
    }
}

// Run validation
const validator = new DataValidator();
validator.validate().then(isValid => {
    process.exit(isValid ? 0 : 1);
});