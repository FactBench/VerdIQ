#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

class AIContentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.suspiciousPatterns = [
            // Placeholder patterns
            /lorem\s+ipsum/i,
            /test\s+product/i,
            /example\s+data/i,
            /placeholder/i,
            /\[insert.*?\]/i,
            /xxx+/i,
            /todo/i,
            
            // AI hallucination patterns
            /as\s+an?\s+ai/i,
            /i\s+cannot/i,
            /i\s+don't\s+have\s+access/i,
            /fictional/i,
            /hypothetical/i,
            
            // Unrealistic data
            /rating"?\s*:\s*[6-9]\d*\.?\d*/,  // Ratings above 5
            /price"?\s*:\s*0/,                 // Free products
            /userRatings"?\s*:\s*"?[0-9]{7,}/, // Millions of ratings
        ];
        
        this.requiredFields = {
            product: ['id', 'name', 'rating', 'userRatings', 'price', 'tagline', 'badge'],
            review: ['productId', 'title', 'content', 'pros', 'cons', 'verdict']
        };
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    detectContentType(data) {
        if (data.products || (Array.isArray(data) && data[0]?.rating)) {
            return 'product';
        } else if (data.review || data.verdict) {
            return 'review';
        }
        return 'unknown';
    }

    validateStructure(data, type) {
        const fields = this.requiredFields[type] || [];
        const items = type === 'product' ? (data.products || [data]) : [data];
        
        items.forEach((item, index) => {
            fields.forEach(field => {
                if (!item[field]) {
                    this.errors.push(`Item ${index + 1}: Missing required field '${field}'`);
                }
            });
        });
    }

    checkSuspiciousPatterns(content) {
        const jsonString = JSON.stringify(content, null, 2);
        
        this.suspiciousPatterns.forEach(pattern => {
            if (pattern.test(jsonString)) {
                this.errors.push(`Suspicious pattern detected: ${pattern}`);
            }
        });
    }

    validateRatings(data) {
        const items = data.products || [data];
        
        items.forEach((item, index) => {
            if (item.rating) {
                const rating = parseFloat(item.rating);
                if (isNaN(rating) || rating < 0 || rating > 5) {
                    this.errors.push(`Item ${index + 1}: Invalid rating ${item.rating} (must be 0-5)`);
                }
            }
            
            if (item.userRatings) {
                // Check for unrealistic user counts
                const ratingStr = item.userRatings.toString();
                const number = parseInt(ratingStr.replace(/[^0-9]/g, ''));
                
                if (number > 1000000) {
                    this.warnings.push(`Item ${index + 1}: Unusually high user ratings count (${item.userRatings})`);
                }
            }
        });
    }

    validateLinks(data) {
        const items = data.products || [data];
        
        items.forEach((item, index) => {
            if (item.amazonLink) {
                if (!item.amazonLink.startsWith('https://amzn.to/')) {
                    this.errors.push(`Item ${index + 1}: Invalid Amazon link format`);
                }
                
                // Check for placeholder links
                if (item.amazonLink.includes('XXX') || item.amazonLink.includes('placeholder')) {
                    this.errors.push(`Item ${index + 1}: Placeholder Amazon link detected`);
                }
            }
        });
    }

    compareWithGoldenData(data) {
        try {
            const goldenPath = path.join(__dirname, '..', 'golden-data', 'products');
            if (!fs.existsSync(goldenPath)) {
                this.warnings.push('No golden data found for comparison');
                return;
            }
            
            // Simple check: ensure new products don't duplicate existing ones
            const goldenFiles = fs.readdirSync(goldenPath)
                .filter(f => f.endsWith('.json'));
                
            const goldenProducts = [];
            goldenFiles.forEach(file => {
                const content = JSON.parse(fs.readFileSync(path.join(goldenPath, file), 'utf8'));
                goldenProducts.push(...content);
            });
            
            const items = data.products || [data];
            items.forEach(item => {
                const duplicate = goldenProducts.find(g => 
                    g.name === item.name || g.id === item.id
                );
                
                if (duplicate) {
                    this.warnings.push(`Product "${item.name}" already exists in golden data`);
                }
            });
        } catch (error) {
            this.warnings.push(`Could not compare with golden data: ${error.message}`);
        }
    }

    async validate(filePath) {
        this.log(`\n🤖 Validating AI-Generated Content`, 'blue');
        this.log(`📄 File: ${filePath}`, 'blue');
        this.log('=' .repeat(50), 'blue');
        
        try {
            // Read and parse file
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const type = this.detectContentType(content);
            
            this.log(`\n📊 Detected content type: ${type}`, 'blue');
            
            // Run validations
            this.log('\n🔍 Running validations...', 'blue');
            
            this.validateStructure(content, type);
            this.checkSuspiciousPatterns(content);
            
            if (type === 'product') {
                this.validateRatings(content);
                this.validateLinks(content);
                this.compareWithGoldenData(content);
            }
            
            // Report results
            this.log('\n' + '=' .repeat(50), 'blue');
            
            if (this.errors.length === 0) {
                this.log('✅ VALIDATION PASSED', 'green');
                this.log('\nContent appears safe for review.', 'green');
                this.log(`Move to pending-review with:`, 'green');
                this.log(`  mv ${filePath} staging/pending-review/`, 'yellow');
            } else {
                this.log(`❌ VALIDATION FAILED - ${this.errors.length} ERRORS`, 'red');
                this.errors.forEach(error => {
                    this.log(`  • ${error}`, 'red');
                });
                this.log('\nFix these issues before proceeding.', 'red');
            }
            
            if (this.warnings.length > 0) {
                this.log(`\n⚠️  ${this.warnings.length} WARNINGS:`, 'yellow');
                this.warnings.forEach(warning => {
                    this.log(`  • ${warning}`, 'yellow');
                });
            }
            
            // Save validation report
            const report = {
                timestamp: new Date().toISOString(),
                file: filePath,
                contentType: type,
                passed: this.errors.length === 0,
                errors: this.errors,
                warnings: this.warnings
            };
            
            const reportPath = filePath.replace('.json', '-validation.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            this.log(`\n📋 Validation report saved: ${reportPath}`, 'blue');
            
            return this.errors.length === 0;
            
        } catch (error) {
            this.log(`\n❌ ERROR: ${error.message}`, 'red');
            return false;
        }
    }
}

// Check command line arguments
if (process.argv.length < 3) {
    console.log('Usage: node validate-ai-content.js <file-path>');
    console.log('Example: node validate-ai-content.js staging/ai-generated/products/new-cleaner.json');
    process.exit(1);
}

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
    console.log(`Error: File not found: ${filePath}`);
    process.exit(1);
}

// Run validation
const validator = new AIContentValidator();
validator.validate(filePath).then(passed => {
    process.exit(passed ? 0 : 1);
});