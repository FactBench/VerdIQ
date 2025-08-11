#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// Read products data
const productsData = JSON.parse(fs.readFileSync('products-data.json', 'utf8'));

// Validation rules
const requiredFields = [
  'position', 'name', 'award', 'tagline', 'amazonLink', 
  'imageUrl', 'price', 'userRatings', 'starRating', 
  'whatWeLike', 'keyFeatures'
];

const validPrices = ['$', '$$', '$$$', '$$$$'];
const validStarRatings = [3.0, 3.5, 4.0, 4.5, 5.0];

// Validation results
const errors = [];
const warnings = [];
const successes = [];

// Check if URL is accessible
function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    https.get(urlObj, (res) => {
      resolve({ 
        accessible: res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302,
        statusCode: res.statusCode 
      });
    }).on('error', () => {
      resolve({ accessible: false, statusCode: null });
    });
  });
}

// Validate each product
async function validateProducts() {
  console.log('🔍 Validating products data...\n');
  
  // Check for duplicate positions
  const positions = productsData.products.map(p => p.position);
  const uniquePositions = [...new Set(positions)];
  if (positions.length !== uniquePositions.length) {
    errors.push('❌ Duplicate positions found');
  }
  
  // Validate each product
  for (const product of productsData.products) {
    console.log(`📋 Validating: ${product.name}`);
    
    // Check required fields
    for (const field of requiredFields) {
      if (!product[field]) {
        errors.push(`❌ Product #${product.position}: Missing ${field}`);
      }
    }
    
    // Validate position (1-11)
    if (product.position < 1 || product.position > 11) {
      errors.push(`❌ Product #${product.position}: Invalid position (must be 1-11)`);
    }
    
    // Validate price symbol
    if (!validPrices.includes(product.price)) {
      errors.push(`❌ Product #${product.position}: Invalid price symbol "${product.price}" (use: ${validPrices.join(', ')})`);
    }
    
    // Validate star rating
    if (!validStarRatings.includes(product.starRating)) {
      warnings.push(`⚠️  Product #${product.position}: Unusual star rating ${product.starRating}`);
    }
    
    // Validate arrays
    if (!Array.isArray(product.whatWeLike) || product.whatWeLike.length !== 5) {
      errors.push(`❌ Product #${product.position}: whatWeLike must have exactly 5 items`);
    }
    
    if (!Array.isArray(product.keyFeatures) || product.keyFeatures.length !== 5) {
      errors.push(`❌ Product #${product.position}: keyFeatures must have exactly 5 items`);
    }
    
    // Validate affiliate link format
    if (product.amazonLink) {
      if (!product.amazonLink.includes('amzn.to') && !product.amazonLink.includes('lvnta.com')) {
        errors.push(`❌ Product #${product.position}: Invalid affiliate link format`);
      }
      
      // Check if link is accessible
      const linkCheck = await checkUrl(product.amazonLink);
      if (!linkCheck.accessible) {
        warnings.push(`⚠️  Product #${product.position}: Affiliate link returned ${linkCheck.statusCode || 'error'}`);
      } else {
        successes.push(`✅ Product #${product.position}: Affiliate link verified`);
      }
    }
    
    // Validate image URL
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      const imageCheck = await checkUrl(product.imageUrl);
      if (!imageCheck.accessible) {
        warnings.push(`⚠️  Product #${product.position}: Image URL returned ${imageCheck.statusCode || 'error'}`);
      } else {
        successes.push(`✅ Product #${product.position}: Image URL verified`);
      }
    }
    
    // Check tagline length
    if (product.tagline && product.tagline.length > 150) {
      warnings.push(`⚠️  Product #${product.position}: Tagline is very long (${product.tagline.length} chars)`);
    }
    
    console.log('');
  }
  
  // Generate validation report
  console.log('\n📊 Validation Summary:');
  console.log('='.repeat(50));
  
  if (errors.length === 0) {
    console.log('✅ No errors found!');
  } else {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (successes.length > 0) {
    console.log(`\n✅ Successes (${successes.length}):`);
    successes.forEach(success => console.log(`   ${success}`));
  }
  
  // Save validation report
  const report = {
    timestamp: new Date().toISOString(),
    totalProducts: productsData.products.length,
    errors: errors,
    warnings: warnings,
    successes: successes,
    valid: errors.length === 0
  };
  
  fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Full report saved to: validation-report.json');
  
  // Return exit code based on errors
  process.exit(errors.length > 0 ? 1 : 0);
}

// Run validation
validateProducts().catch(console.error);