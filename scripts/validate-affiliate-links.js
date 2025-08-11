#!/usr/bin/env node

/**
 * Amazon Affiliate Link Validator
 * Validates all Amazon links in the project for proper tracking and compliance
 * 
 * Usage: node scripts/validate-affiliate-links.js
 */

const fs = require('fs');
const path = require('path');
const { 
    isValidAmazonUrl, 
    extractProductId,
    TRACKING_ID 
} = require('./amazon-affiliate-converter');

// Files to validate
const FILES_TO_VALIDATE = [
    'dist/best-robotic-pool-cleaners/index.html',
    'dist/reviews/aiper-scuba-s1-cordless/index.html',
    'dist/reviews/aiper-scuba-x1-cordless/index.html',
    'dist/reviews/aiper-seagull-pro/index.html',
    'dist/reviews/aquabot-x4/index.html',
    'dist/reviews/beatbot-aquasense-2-pro/index.html',
    'dist/reviews/beatbot-aquasense-2-ultra/index.html',
    'dist/reviews/dolphin-e10/index.html',
    'dist/reviews/dolphin-nautilus-cc-plus-wi-fi/index.html',
    'dist/reviews/dolphin-premier/index.html',
    'dist/reviews/dolphin-sigma/index.html',
    'dist/reviews/hayward-aquavac-650/index.html',
    'dist/reviews/pentair-prowler-930/index.html',
    'dist/reviews/polaris-9550-sport-robotic/index.html',
    'dist/reviews/polaris-pcx-868-iq/index.html',
    'dist/reviews/polaris-vrx-iq/index.html',
    'dist/reviews/zodiac-mx8-elite/index.html'
];

/**
 * Extract URLs from content
 * @param {string} content - Content to search
 * @returns {Array<string>} - Found URLs
 */
function extractUrls(content) {
    const urlPatterns = [
        /https?:\/\/(?:www\.)?amazon\.[a-z.]+\/[^\s"'<>]*/gi,
        /https?:\/\/amzn\.to\/[^\s"'<>]*/gi
    ];
    
    let urls = [];
    urlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            urls = urls.concat(matches);
        }
    });
    
    return [...new Set(urls)];
}

/**
 * Validate a single Amazon URL
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result
 */
function validateUrl(url) {
    const result = {
        url: url,
        isValid: false,
        hasTracking: false,
        hasCorrectTracking: false,
        hasDuplicateTags: false,
        productId: null,
        issues: []
    };
    
    // Check if it's a valid Amazon URL
    if (!isValidAmazonUrl(url)) {
        result.issues.push('Not a valid Amazon URL');
        return result;
    }
    
    result.isValid = true;
    result.productId = extractProductId(url);
    
    try {
        const urlObj = new URL(url);
        const tags = [];
        
        // Check all parameters for tag
        for (const [key, value] of urlObj.searchParams) {
            if (key === 'tag' || key === 'AssociateTag') {
                tags.push(value);
            }
        }
        
        // Check for tracking
        if (tags.length === 0) {
            result.issues.push('Missing affiliate tracking tag');
        } else {
            result.hasTracking = true;
            
            // Check for correct tracking ID
            if (tags.includes(TRACKING_ID)) {
                result.hasCorrectTracking = true;
            } else {
                result.issues.push(`Wrong tracking ID: found ${tags.join(', ')}, expected ${TRACKING_ID}`);
            }
            
            // Check for duplicate tags (policy violation)
            if (tags.length > 1) {
                result.hasDuplicateTags = true;
                result.issues.push(`Multiple tracking tags found: ${tags.join(', ')} - Amazon policy violation!`);
            }
        }
        
        // Check for URL shorteners (policy compliance)
        if (urlObj.hostname.includes('amzn.to')) {
            result.issues.push('Using Amazon short URL - consider using full URL for transparency');
        }
        
        // Check for missing product ID
        if (!result.productId) {
            result.issues.push('Could not extract product ID (ASIN) from URL');
        }
        
    } catch (error) {
        result.issues.push(`Error parsing URL: ${error.message}`);
    }
    
    return result;
}

/**
 * Validate a file for Amazon links
 * @param {string} filePath - File to validate
 * @returns {Object} - Validation results
 */
function validateFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        return {
            file: filePath,
            exists: false,
            error: 'File not found'
        };
    }
    
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const urls = extractUrls(content);
        const amazonUrls = urls.filter(url => isValidAmazonUrl(url));
        
        const validationResults = amazonUrls.map(url => validateUrl(url));
        
        return {
            file: filePath,
            exists: true,
            totalUrls: amazonUrls.length,
            validUrls: validationResults.filter(r => r.isValid).length,
            withTracking: validationResults.filter(r => r.hasTracking).length,
            withCorrectTracking: validationResults.filter(r => r.hasCorrectTracking).length,
            withIssues: validationResults.filter(r => r.issues.length > 0).length,
            results: validationResults
        };
    } catch (error) {
        return {
            file: filePath,
            exists: true,
            error: error.message
        };
    }
}

/**
 * Run full validation
 */
function runValidation() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Amazon Affiliate Link Validator');
    console.log(`  Expected Tracking ID: ${TRACKING_ID}`);
    console.log('═══════════════════════════════════════════════════════');
    
    const allResults = [];
    let totalUrls = 0;
    let totalValid = 0;
    let totalWithTracking = 0;
    let totalWithCorrectTracking = 0;
    let totalIssues = 0;
    const allProductIds = new Set();
    const issues = [];
    
    FILES_TO_VALIDATE.forEach(file => {
        const result = validateFile(file);
        allResults.push(result);
        
        if (result.exists && !result.error) {
            totalUrls += result.totalUrls;
            totalValid += result.validUrls;
            totalWithTracking += result.withTracking;
            totalWithCorrectTracking += result.withCorrectTracking;
            totalIssues += result.withIssues;
            
            // Collect product IDs
            result.results.forEach(r => {
                if (r.productId) {
                    allProductIds.add(r.productId);
                }
            });
            
            // Report file status
            console.log(`\n📄 ${path.basename(file)}`);
            if (result.totalUrls === 0) {
                console.log('   No Amazon URLs found');
            } else if (result.withIssues === 0) {
                console.log(`   ✅ All ${result.totalUrls} URLs valid with correct tracking`);
            } else {
                console.log(`   ⚠️ ${result.withIssues} of ${result.totalUrls} URLs have issues`);
                
                // Show issues
                result.results.forEach(r => {
                    if (r.issues.length > 0) {
                        console.log(`      - ${r.productId || 'Unknown'}: ${r.issues.join(', ')}`);
                        issues.push({
                            file: file,
                            url: r.url,
                            productId: r.productId,
                            issues: r.issues
                        });
                    }
                });
            }
        } else if (!result.exists) {
            console.log(`\n📄 ${path.basename(file)}`);
            console.log('   ⚠️ File not found (not built yet?)');
        }
    });
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Validation Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Files checked: ${allResults.length}`);
    console.log(`  Files found: ${allResults.filter(r => r.exists).length}`);
    console.log(`  Total Amazon URLs: ${totalUrls}`);
    console.log(`  Valid URLs: ${totalValid}`);
    console.log(`  With tracking: ${totalWithTracking}`);
    console.log(`  With correct tracking: ${totalWithCorrectTracking}`);
    console.log(`  URLs with issues: ${totalIssues}`);
    console.log(`  Unique products: ${allProductIds.size}`);
    
    // Compliance check
    console.log('\n  Compliance Status:');
    const hasDuplicateTags = issues.some(i => 
        i.issues.some(issue => issue.includes('Multiple tracking tags'))
    );
    const hasMissingTags = totalUrls > totalWithTracking;
    const hasWrongTags = totalWithTracking > totalWithCorrectTracking;
    
    if (!hasDuplicateTags && !hasMissingTags && !hasWrongTags) {
        console.log('  ✅ All links compliant with Amazon policies');
    } else {
        if (hasDuplicateTags) {
            console.log('  ❌ CRITICAL: Multiple tracking tags detected (policy violation)');
        }
        if (hasMissingTags) {
            console.log('  ⚠️ Some links missing tracking tags');
        }
        if (hasWrongTags) {
            console.log('  ⚠️ Some links have incorrect tracking ID');
        }
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'affiliate-validation-report.json');
    const report = {
        timestamp: new Date().toISOString(),
        expectedTrackingId: TRACKING_ID,
        summary: {
            filesChecked: allResults.length,
            filesFound: allResults.filter(r => r.exists).length,
            totalUrls: totalUrls,
            validUrls: totalValid,
            withTracking: totalWithTracking,
            withCorrectTracking: totalWithCorrectTracking,
            withIssues: totalIssues,
            uniqueProducts: allProductIds.size
        },
        compliance: {
            hasDuplicateTags: hasDuplicateTags,
            hasMissingTags: hasMissingTags,
            hasWrongTags: hasWrongTags,
            isCompliant: !hasDuplicateTags && !hasMissingTags && !hasWrongTags
        },
        productIds: [...allProductIds],
        issues: issues,
        details: allResults
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n  📊 Detailed report saved to: affiliate-validation-report.json`);
    
    // Return status
    if (report.compliance.isCompliant) {
        console.log('\n✅ Validation passed! All Amazon links are properly configured.');
        process.exit(0);
    } else {
        console.log('\n❌ Validation failed! Please fix the issues above.');
        process.exit(1);
    }
}

// Run validation if called directly
if (require.main === module) {
    runValidation();
}

module.exports = {
    validateUrl,
    validateFile,
    runValidation,
    extractUrls
};