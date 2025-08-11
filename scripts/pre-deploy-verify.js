#!/usr/bin/env node
const { execSync } = require('child_process');
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

class PreDeploymentVerifier {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.buildPath = path.join(__dirname, '..', 'dist');
        this.srcPath = path.join(__dirname, '..', 'src');
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    // Step 1: Run data validation
    validateData() {
        this.log('\n📊 Step 1/5: Validating data integrity...', 'blue');
        
        try {
            execSync('node scripts/validate-data.js', { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            this.log('✓ Data validation passed', 'green');
            return true;
        } catch (error) {
            this.errors.push('Data validation failed - check validation-report.json');
            return false;
        }
    }

    // Step 2: Run build process
    runBuild() {
        this.log('\n🔨 Step 2/5: Building site...', 'blue');
        
        try {
            execSync('npm run build', { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            this.log('✓ Build completed successfully', 'green');
            return true;
        } catch (error) {
            this.errors.push('Build process failed');
            return false;
        }
    }

    // Step 3: Verify built files exist
    verifyBuildOutput() {
        this.log('\n📁 Step 3/5: Verifying build output...', 'blue');
        
        const requiredFiles = [
            'index.html',
            'best-robotic-pool-cleaners/index.html',
            'assets/css/style.css',
            'manifest.json'
        ];

        let allFilesExist = true;
        requiredFiles.forEach(file => {
            const filePath = path.join(this.buildPath, file);
            if (!fs.existsSync(filePath)) {
                this.errors.push(`Missing required file: ${file}`);
                allFilesExist = false;
            } else {
                this.log(`✓ Found: ${file}`, 'green');
            }
        });

        return allFilesExist;
    }

    // Step 4: Check for data consistency in HTML
    checkDataConsistency() {
        this.log('\n🔍 Step 4/5: Checking data consistency in HTML...', 'blue');
        
        try {
            // Load product data
            const productData = JSON.parse(
                fs.readFileSync(path.join(this.srcPath, 'data', 'pool-cleaners-data.json'), 'utf8')
            );

            // Read main HTML file
            const htmlPath = path.join(this.buildPath, 'best-robotic-pool-cleaners', 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');

            // Check each product exists in HTML
            let allProductsFound = true;
            productData.products.forEach(product => {
                if (!htmlContent.includes(product.name)) {
                    this.errors.push(`Product "${product.name}" not found in HTML`);
                    allProductsFound = false;
                }
                
                // Check Amazon links
                if (!htmlContent.includes(product.amazonLink)) {
                    this.warnings.push(`Amazon link for "${product.name}" not found in HTML`);
                }
            });

            // Check for fake data patterns
            const suspiciousPatterns = [
                /lorem ipsum/i,
                /test product/i,
                /example\s+data/i,
                /placeholder/i,
                /\[insert.*?\]/i
            ];

            suspiciousPatterns.forEach(pattern => {
                if (pattern.test(htmlContent)) {
                    this.errors.push(`Suspicious pattern found: ${pattern}`);
                    allProductsFound = false;
                }
            });

            if (allProductsFound) {
                this.log('✓ All products found in HTML', 'green');
            }

            return allProductsFound;
        } catch (error) {
            this.errors.push(`Error checking data consistency: ${error.message}`);
            return false;
        }
    }

    // Step 5: Generate deployment report
    generateReport() {
        this.log('\n📋 Step 5/5: Generating deployment report...', 'blue');
        
        const report = {
            timestamp: new Date().toISOString(),
            canDeploy: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            checklist: {
                dataValidation: this.errors.filter(e => e.includes('validation')).length === 0,
                buildSuccess: this.errors.filter(e => e.includes('build')).length === 0,
                filesPresent: this.errors.filter(e => e.includes('Missing')).length === 0,
                dataConsistent: this.errors.filter(e => e.includes('Product')).length === 0
            }
        };

        const reportPath = path.join(__dirname, '..', 'pre-deploy-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    // Main verification process
    async verify() {
        this.log('🚀 Starting Pre-Deployment Verification', 'blue');
        this.log('=' .repeat(50), 'blue');

        // Run all checks
        const dataValid = this.validateData();
        if (!dataValid) {
            this.log('\n❌ Stopping: Data validation failed', 'red');
            return false;
        }

        const buildSuccess = this.runBuild();
        if (!buildSuccess) {
            this.log('\n❌ Stopping: Build failed', 'red');
            return false;
        }

        const filesExist = this.verifyBuildOutput();
        const dataConsistent = this.checkDataConsistency();

        // Generate report
        const report = this.generateReport();

        // Display summary
        this.log('\n' + '=' .repeat(50), 'blue');
        this.log('📊 VERIFICATION SUMMARY', 'blue');
        this.log('=' .repeat(50), 'blue');

        if (report.canDeploy) {
            this.log('\n✅ ALL CHECKS PASSED - SAFE TO DEPLOY!', 'green');
            this.log('\nRun deployment with:', 'green');
            this.log('  ./scripts/github-deploy.sh', 'yellow');
        } else {
            this.log(`\n❌ DEPLOYMENT BLOCKED - ${this.errors.length} ERRORS FOUND:`, 'red');
            this.errors.forEach(error => {
                this.log(`  • ${error}`, 'red');
            });
        }

        if (this.warnings.length > 0) {
            this.log(`\n⚠️  ${this.warnings.length} WARNINGS:`, 'yellow');
            this.warnings.forEach(warning => {
                this.log(`  • ${warning}`, 'yellow');
            });
        }

        this.log('\n📄 Full report saved to: pre-deploy-report.json', 'blue');

        return report.canDeploy;
    }
}

// Run verification
const verifier = new PreDeploymentVerifier();
verifier.verify().then(canDeploy => {
    process.exit(canDeploy ? 0 : 1);
});