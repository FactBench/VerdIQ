#!/usr/bin/env node

/**
 * Demo: Amazon Affiliate Link Converter
 * Shows how to convert a list of Amazon URLs to affiliate links
 */

const { 
    convertSingleUrl, 
    convertMultipleUrls,
    createCleanAffiliateUrl,
    TRACKING_ID 
} = require('./amazon-affiliate-converter');

console.log('═══════════════════════════════════════════════════════');
console.log('  Amazon Affiliate Link Converter Demo');
console.log(`  Your Tracking ID: ${TRACKING_ID}`);
console.log('═══════════════════════════════════════════════════════');

// Example 1: Convert single URL (your example)
console.log('\n📌 Example 1: Converting your URL');
console.log('─────────────────────────────────────');
const yourUrl = 'https://www.amazon.com/dp/B0DMN819RB';
const converted = convertSingleUrl(yourUrl);
console.log(`Original: ${yourUrl}`);
console.log(`Converted: ${converted}`);

// Example 2: Convert multiple URLs
console.log('\n📌 Example 2: Converting multiple URLs');
console.log('─────────────────────────────────────');
const productUrls = [
    'https://www.amazon.com/dp/B0DMN819RB',
    'https://www.amazon.com/gp/product/B07XQS8JV6',
    'https://www.amazon.com/dp/B08N5WRWNW?ref=something',
    'https://amzn.to/3abc123'  // Short URL example
];

const results = convertMultipleUrls(productUrls);
results.forEach(result => {
    console.log(`\n✓ ${result.converted}`);
    if (!result.isValid) {
        console.log('  ⚠ May not be a valid Amazon URL');
    }
});

// Example 3: Create clean affiliate URLs from product IDs
console.log('\n📌 Example 3: Creating clean URLs from product IDs');
console.log('─────────────────────────────────────');
const productIds = ['B0DMN819RB', 'B07XQS8JV6', 'B08N5WRWNW'];
productIds.forEach(id => {
    const cleanUrl = createCleanAffiliateUrl(id);
    console.log(`${id} → ${cleanUrl}`);
});

// Example 4: How to use in your code
console.log('\n📌 Example 4: Usage in your code');
console.log('─────────────────────────────────────');
console.log(`
// Import the converter
const { convertSingleUrl } = require('./scripts/amazon-affiliate-converter');

// Convert any Amazon URL
const affiliateUrl = convertSingleUrl('https://www.amazon.com/dp/YOUR_PRODUCT_ID');

// Use in HTML
const html = \`<a href="\${affiliateUrl}" target="_blank">Check Price on Amazon</a>\`;
`);

console.log('\n✅ All URLs now include your tracking ID: ' + TRACKING_ID);
console.log('\n💡 Tips:');
console.log('  • Run "node scripts/update-amazon-links.js" to update all links in the project');
console.log('  • Run "node scripts/validate-affiliate-links.js" to validate all links');
console.log('  • Always rebuild and deploy after updating links');