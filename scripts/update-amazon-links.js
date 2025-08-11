#!/usr/bin/env node

/**
 * Update Amazon Links Script
 * Processes all Amazon URLs in the project and adds affiliate tracking
 * 
 * Usage: node scripts/update-amazon-links.js
 */

const fs = require('fs');
const path = require('path');
const { 
    convertSingleUrl, 
    isValidAmazonUrl, 
    extractProductId,
    TRACKING_ID 
} = require('./amazon-affiliate-converter');

// Files to process
const FILES_TO_PROCESS = [
    'src/data/products.json',
    'src/pages/best-robotic-pool-cleaners.html',
    // Add review pages
    'src/pages/reviews/aiper-scuba-s1-cordless.html',
    'src/pages/reviews/aiper-scuba-x1-cordless.html',
    'src/pages/reviews/aiper-seagull-pro.html',
    'src/pages/reviews/aquabot-x4.html',
    'src/pages/reviews/beatbot-aquasense-2-pro.html',
    'src/pages/reviews/beatbot-aquasense-2-ultra.html',
    'src/pages/reviews/dolphin-e10.html',
    'src/pages/reviews/dolphin-nautilus-cc-plus-wi-fi.html',
    'src/pages/reviews/dolphin-premier.html',
    'src/pages/reviews/dolphin-sigma.html',
    'src/pages/reviews/hayward-aquavac-650.html',
    'src/pages/reviews/pentair-prowler-930.html',
    'src/pages/reviews/polaris-9550-sport-robotic.html',
    'src/pages/reviews/polaris-pcx-868-iq.html',
    'src/pages/reviews/polaris-vrx-iq.html',
    'src/pages/reviews/zodiac-mx8-elite.html'
];

/**
 * Extract URLs from text content
 * @param {string} content - Text content to search
 * @returns {Array<string>} - Array of found URLs
 */
function extractUrlsFromContent(content) {
    // Match various URL patterns
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
    
    // Remove duplicates
    return [...new Set(urls)];
}

/**
 * Process a JSON file and update Amazon links
 * @param {string} filePath - Path to JSON file
 * @returns {Object} - Processing results
 */
function processJsonFile(filePath) {
    console.log(`\nProcessing JSON: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found: ${filePath}`);
        return { file: filePath, found: 0, updated: 0, error: 'File not found' };
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const urls = extractUrlsFromContent(content);
        const amazonUrls = urls.filter(url => isValidAmazonUrl(url));
        
        let updatedCount = 0;
        
        amazonUrls.forEach(originalUrl => {
            const convertedUrl = convertSingleUrl(originalUrl);
            if (originalUrl !== convertedUrl) {
                // Replace all occurrences
                content = content.replace(
                    new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    convertedUrl
                );
                updatedCount++;
                console.log(`  ✓ Updated: ${extractProductId(originalUrl)} → includes tag=${TRACKING_ID}`);
            } else if (convertedUrl.includes(`tag=${TRACKING_ID}`)) {
                console.log(`  - Already has tracking: ${extractProductId(originalUrl)}`);
            }
        });
        
        if (updatedCount > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Saved ${updatedCount} updates to ${path.basename(filePath)}`);
        }
        
        return {
            file: filePath,
            found: amazonUrls.length,
            updated: updatedCount,
            urls: amazonUrls.map(url => ({
                original: url,
                converted: convertSingleUrl(url),
                productId: extractProductId(url)
            }))
        };
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
        return { file: filePath, found: 0, updated: 0, error: error.message };
    }
}

/**
 * Process an HTML file and update Amazon links
 * @param {string} filePath - Path to HTML file
 * @returns {Object} - Processing results
 */
function processHtmlFile(filePath) {
    console.log(`\nProcessing HTML: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found: ${filePath}`);
        return { file: filePath, found: 0, updated: 0, error: 'File not found' };
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const urls = extractUrlsFromContent(content);
        const amazonUrls = urls.filter(url => isValidAmazonUrl(url));
        
        let updatedCount = 0;
        
        amazonUrls.forEach(originalUrl => {
            const convertedUrl = convertSingleUrl(originalUrl);
            if (originalUrl !== convertedUrl) {
                // Replace all occurrences
                content = content.replace(
                    new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    convertedUrl
                );
                updatedCount++;
                console.log(`  ✓ Updated: ${extractProductId(originalUrl)} → includes tag=${TRACKING_ID}`);
            } else if (convertedUrl.includes(`tag=${TRACKING_ID}`)) {
                console.log(`  - Already has tracking: ${extractProductId(originalUrl)}`);
            }
        });
        
        if (updatedCount > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Saved ${updatedCount} updates to ${path.basename(filePath)}`);
        }
        
        return {
            file: filePath,
            found: amazonUrls.length,
            updated: updatedCount,
            urls: amazonUrls.map(url => ({
                original: url,
                converted: convertSingleUrl(url),
                productId: extractProductId(url)
            }))
        };
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
        return { file: filePath, found: 0, updated: 0, error: error.message };
    }
}

/**
 * Process all files in the project
 */
function processAllFiles() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Amazon Affiliate Link Updater');
    console.log(`  Tracking ID: ${TRACKING_ID}`);
    console.log('═══════════════════════════════════════════════════════');
    
    const results = [];
    let totalFound = 0;
    let totalUpdated = 0;
    
    FILES_TO_PROCESS.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        let result;
        
        if (file.endsWith('.json')) {
            result = processJsonFile(filePath);
        } else if (file.endsWith('.html')) {
            result = processHtmlFile(filePath);
        } else {
            console.log(`  ⚠ Skipping unsupported file type: ${file}`);
            return;
        }
        
        results.push(result);
        totalFound += result.found;
        totalUpdated += result.updated;
    });
    
    // Generate report
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Summary Report');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Files processed: ${results.length}`);
    console.log(`  Amazon URLs found: ${totalFound}`);
    console.log(`  URLs updated: ${totalUpdated}`);
    console.log(`  URLs already with tracking: ${totalFound - totalUpdated}`);
    
    // List all unique product IDs found
    const allProductIds = new Set();
    results.forEach(result => {
        if (result.urls) {
            result.urls.forEach(url => {
                if (url.productId) {
                    allProductIds.add(url.productId);
                }
            });
        }
    });
    
    if (allProductIds.size > 0) {
        console.log('\n  Product IDs found:');
        [...allProductIds].forEach(id => {
            console.log(`    - ${id}`);
        });
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'amazon-links-report.json');
    const report = {
        timestamp: new Date().toISOString(),
        trackingId: TRACKING_ID,
        summary: {
            filesProcessed: results.length,
            totalFound: totalFound,
            totalUpdated: totalUpdated,
            alreadyTracked: totalFound - totalUpdated
        },
        productIds: [...allProductIds],
        details: results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n  📄 Detailed report saved to: amazon-links-report.json`);
    
    if (totalUpdated > 0) {
        console.log('\n  ✅ All Amazon links have been updated with tracking ID!');
        console.log('  🔄 Remember to rebuild and deploy the site.');
    } else {
        console.log('\n  ℹ️ No updates needed - all links already have tracking.');
    }
}

// Run the script
if (require.main === module) {
    processAllFiles();
}

module.exports = {
    processJsonFile,
    processHtmlFile,
    processAllFiles,
    extractUrlsFromContent
};