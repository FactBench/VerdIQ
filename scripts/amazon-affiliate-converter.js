#!/usr/bin/env node

/**
 * Amazon Affiliate Link Converter
 * Converts Amazon product URLs to include affiliate tracking ID
 * 
 * Usage:
 * const { convertSingleUrl, convertMultipleUrls } = require('./amazon-affiliate-converter');
 */

const TRACKING_ID = 'factbench-r-20';

/**
 * Validates if a URL is an Amazon product URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid Amazon URL
 */
function isValidAmazonUrl(url) {
    try {
        const urlObj = new URL(url);
        const amazonDomains = [
            'amazon.com',
            'amazon.co.uk',
            'amazon.ca',
            'amazon.de',
            'amazon.fr',
            'amazon.it',
            'amazon.es',
            'amazon.co.jp',
            'amazon.in',
            'amazon.com.au',
            'amazon.com.br',
            'amazon.com.mx',
            'amzn.to' // Short URLs
        ];
        
        return amazonDomains.some(domain => 
            urlObj.hostname.includes(domain)
        );
    } catch (e) {
        return false;
    }
}

/**
 * Converts a single Amazon URL to include affiliate tracking
 * @param {string} url - The Amazon product URL
 * @param {string} trackingId - The affiliate tracking ID (optional)
 * @returns {string} - The URL with affiliate tracking
 */
function convertSingleUrl(url, trackingId = TRACKING_ID) {
    if (!url) {
        throw new Error('URL is required');
    }
    
    if (!isValidAmazonUrl(url)) {
        console.warn(`Warning: ${url} does not appear to be a valid Amazon URL`);
        return url;
    }
    
    try {
        const urlObj = new URL(url);
        
        // Check if tag already exists
        if (urlObj.searchParams.has('tag')) {
            // Replace existing tag
            urlObj.searchParams.set('tag', trackingId);
        } else {
            // Add new tag
            urlObj.searchParams.append('tag', trackingId);
        }
        
        return urlObj.toString();
    } catch (e) {
        console.error(`Error processing URL: ${url}`, e.message);
        return url;
    }
}

/**
 * Converts multiple Amazon URLs to include affiliate tracking
 * @param {Array<string>} urls - Array of Amazon product URLs
 * @param {string} trackingId - The affiliate tracking ID (optional)
 * @returns {Array<Object>} - Array of objects with original and converted URLs
 */
function convertMultipleUrls(urls, trackingId = TRACKING_ID) {
    if (!Array.isArray(urls)) {
        throw new Error('URLs must be an array');
    }
    
    return urls.map(url => {
        const converted = convertSingleUrl(url, trackingId);
        return {
            original: url,
            converted: converted,
            hasTracking: converted.includes(`tag=${trackingId}`),
            isValid: isValidAmazonUrl(url)
        };
    });
}

/**
 * Extracts product ID (ASIN) from Amazon URL
 * @param {string} url - The Amazon product URL
 * @returns {string|null} - The product ID or null if not found
 */
function extractProductId(url) {
    if (!isValidAmazonUrl(url)) {
        return null;
    }
    
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        // Match patterns like /dp/B0DMN819RB or /gp/product/B0DMN819RB
        const dpMatch = path.match(/\/dp\/([A-Z0-9]{10})/);
        if (dpMatch) return dpMatch[1];
        
        const gpMatch = path.match(/\/gp\/product\/([A-Z0-9]{10})/);
        if (gpMatch) return gpMatch[1];
        
        // Match pattern in query string
        const asinParam = urlObj.searchParams.get('ASIN');
        if (asinParam) return asinParam;
        
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Creates a clean Amazon affiliate URL from product ID
 * @param {string} productId - The Amazon product ID (ASIN)
 * @param {string} domain - The Amazon domain (default: amazon.com)
 * @param {string} trackingId - The affiliate tracking ID (optional)
 * @returns {string} - Clean affiliate URL
 */
function createCleanAffiliateUrl(productId, domain = 'amazon.com', trackingId = TRACKING_ID) {
    if (!productId || !productId.match(/^[A-Z0-9]{10}$/)) {
        throw new Error('Invalid product ID');
    }
    
    return `https://www.${domain}/dp/${productId}?tag=${trackingId}`;
}

/**
 * Analyzes a list of URLs and provides statistics
 * @param {Array<string>} urls - Array of URLs to analyze
 * @returns {Object} - Statistics about the URLs
 */
function analyzeUrls(urls) {
    const results = convertMultipleUrls(urls);
    
    return {
        total: urls.length,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => !r.isValid).length,
        alreadyHasTracking: results.filter(r => r.original.includes('tag=')).length,
        converted: results.filter(r => r.hasTracking).length,
        productIds: results
            .map(r => extractProductId(r.original))
            .filter(id => id !== null),
        results: results
    };
}

// Command-line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Amazon Affiliate Link Converter');
        console.log('================================');
        console.log(`Current Tracking ID: ${TRACKING_ID}`);
        console.log('\nUsage:');
        console.log('  node amazon-affiliate-converter.js <url>');
        console.log('  node amazon-affiliate-converter.js --batch <url1> <url2> ...');
        console.log('  node amazon-affiliate-converter.js --analyze <url1> <url2> ...');
        console.log('\nExamples:');
        console.log('  node amazon-affiliate-converter.js https://www.amazon.com/dp/B0DMN819RB');
        console.log('  node amazon-affiliate-converter.js --batch url1.txt url2.txt');
        process.exit(0);
    }
    
    if (args[0] === '--batch') {
        const urls = args.slice(1);
        const results = convertMultipleUrls(urls);
        console.log('\nConverted URLs:');
        console.log('===============');
        results.forEach(r => {
            console.log(`✓ ${r.converted}`);
            if (!r.isValid) {
                console.log(`  ⚠ Warning: May not be a valid Amazon URL`);
            }
        });
    } else if (args[0] === '--analyze') {
        const urls = args.slice(1);
        const analysis = analyzeUrls(urls);
        console.log('\nURL Analysis:');
        console.log('=============');
        console.log(`Total URLs: ${analysis.total}`);
        console.log(`Valid Amazon URLs: ${analysis.valid}`);
        console.log(`Invalid URLs: ${analysis.invalid}`);
        console.log(`Already have tracking: ${analysis.alreadyHasTracking}`);
        console.log(`Successfully converted: ${analysis.converted}`);
        console.log(`\nProduct IDs found: ${analysis.productIds.join(', ')}`);
    } else {
        // Single URL conversion
        const converted = convertSingleUrl(args[0]);
        console.log(`\nOriginal: ${args[0]}`);
        console.log(`Converted: ${converted}`);
        
        const productId = extractProductId(args[0]);
        if (productId) {
            console.log(`Product ID: ${productId}`);
            console.log(`Clean URL: ${createCleanAffiliateUrl(productId)}`);
        }
    }
}

// Export functions for use in other scripts
module.exports = {
    convertSingleUrl,
    convertMultipleUrls,
    isValidAmazonUrl,
    extractProductId,
    createCleanAffiliateUrl,
    analyzeUrls,
    TRACKING_ID
};