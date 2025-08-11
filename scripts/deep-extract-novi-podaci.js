#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Deep extraction to find all 11 products
class DeepNoviPodaciExtractor {
    constructor() {
        this.inputFile = path.join(__dirname, '..', 'pool-robot-podaci', 'novi-podaci.html');
        this.outputDir = path.join(__dirname, '..', 'extracted-data');
    }

    extractAllProducts() {
        console.log('🔍 Deep extraction of novi-podaci.html...\n');
        
        const content = fs.readFileSync(this.inputFile, 'utf8');
        
        // Strategy 1: Find numbered product sections (1. Product, 2. Product, etc.)
        console.log('📋 Looking for numbered products...');
        const numberedPattern = /(\d{1,2})\.\s*([A-Z][^<\n]{5,100}?)(?=<|$)/gm;
        const numberedMatches = [...content.matchAll(numberedPattern)];
        
        const numberedProducts = [];
        numberedMatches.forEach(match => {
            const num = parseInt(match[1]);
            const name = match[2].trim();
            
            // Filter out non-product matches
            if (num >= 1 && num <= 11 && 
                !name.toLowerCase().includes('step') &&
                !name.toLowerCase().includes('feature') &&
                !name.toLowerCase().includes('benefit') &&
                name.length > 10) {
                numberedProducts.push({
                    number: num,
                    name: name.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
                });
            }
        });
        
        console.log(`Found ${numberedProducts.length} numbered items`);
        
        // Strategy 2: Find products by their badges (Best OF THE BEST, Best Overall, etc.)
        console.log('\n🏆 Looking for products with badges...');
        const badgePatterns = [
            /Best OF THE BEST[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Best Overall[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Best Cordless[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Budget Pick[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Smart Features[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Large Pools[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Variable Speed[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Best Value[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Premium Pick[^<]*?([A-Z][^<]{5,100}?)</gi,
            /Editor'?s Choice[^<]*?([A-Z][^<]{5,100}?)</gi
        ];
        
        const badgedProducts = [];
        badgePatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    const name = match[1].trim();
                    if (name.length > 5 && !name.includes('>')) {
                        badgedProducts.push(name);
                    }
                }
            }
        });
        
        console.log(`Found ${badgedProducts.length} products with badges`);
        
        // Strategy 3: Find product sections by structure
        console.log('\n📦 Looking for product sections by structure...');
        
        // Look for patterns like "The [Product Name]" followed by features
        const theProductPattern = /The\s+([A-Z][A-Za-z0-9\s\-\+\.]+?)(?:\s+offers|\s+features|\s+is|\s+provides|\s+delivers)/gm;
        const theProductMatches = [...content.matchAll(theProductPattern)];
        
        const structuredProducts = [];
        theProductMatches.forEach(match => {
            const name = match[1].trim();
            if (name.length > 10 && name.length < 50) {
                structuredProducts.push(name);
            }
        });
        
        console.log(`Found ${structuredProducts.length} products in structured sections`);
        
        // Combine all findings and deduplicate
        const allProducts = new Set();
        
        // Add from Amazon links (most reliable)
        const amazonLinks = JSON.parse(
            fs.readFileSync(path.join(this.outputDir, 'amazon-links.json'), 'utf8')
        );
        amazonLinks.links.forEach(link => {
            allProducts.add(link.text.replace(/^The\s+/, '').trim());
        });
        
        // Add numbered products
        numberedProducts.forEach(p => allProducts.add(p.name));
        
        // Add badged products
        badgedProducts.forEach(p => allProducts.add(p));
        
        // Add structured products
        structuredProducts.forEach(p => allProducts.add(p));
        
        // Clean and filter final list
        const finalProducts = Array.from(allProducts)
            .filter(name => {
                // Basic filters
                return name.length > 10 && 
                       name.length < 60 &&
                       !name.toLowerCase().includes('click') &&
                       !name.toLowerCase().includes('feature') &&
                       !name.toLowerCase().includes('benefit') &&
                       !name.includes('...') &&
                       (name.includes('Bot') || 
                        name.includes('Dolphin') || 
                        name.includes('AIPER') || 
                        name.includes('Polaris') ||
                        name.includes('Aqua') ||
                        name.includes('Hayward') ||
                        name.includes('Pentair') ||
                        name.includes('Zodiac') ||
                        name.includes('Seagull') ||
                        name.includes('Prowler') ||
                        name.includes('Pool') ||
                        name.includes('Robotic'));
            })
            .map(name => name.replace(/\s+/g, ' ').trim());
        
        // Remove duplicates with fuzzy matching
        const uniqueProducts = [];
        finalProducts.forEach(product => {
            const normalized = product.toLowerCase().replace(/[^\w\s]/g, '');
            const exists = uniqueProducts.some(p => {
                const pNorm = p.toLowerCase().replace(/[^\w\s]/g, '');
                return pNorm === normalized || 
                       pNorm.includes(normalized) || 
                       normalized.includes(pNorm);
            });
            
            if (!exists) {
                uniqueProducts.push(product);
            }
        });
        
        // Sort and display results
        console.log('\n✅ Final extracted products:');
        uniqueProducts.sort().forEach((product, idx) => {
            console.log(`  ${idx + 1}. ${product}`);
        });
        
        console.log(`\n📊 Total unique products found: ${uniqueProducts.length}`);
        
        // Save comprehensive extraction
        const extractionData = {
            totalFound: uniqueProducts.length,
            products: uniqueProducts,
            sources: {
                amazonLinks: amazonLinks.links.length,
                numberedProducts: numberedProducts.length,
                badgedProducts: badgedProducts.length,
                structuredProducts: structuredProducts.length
            },
            extractedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'deep-extraction-results.json'),
            JSON.stringify(extractionData, null, 2)
        );
        
        console.log(`\n📄 Results saved to: ${path.join(this.outputDir, 'deep-extraction-results.json')}`);
        
        // Additional search for missing products
        if (uniqueProducts.length < 11) {
            console.log(`\n⚠️  Warning: Found only ${uniqueProducts.length} products, but title mentions 11`);
            console.log('Searching for additional products...');
            
            // Look for specific patterns that might indicate the missing products
            this.searchForMissingProducts(content, uniqueProducts);
        }
    }

    searchForMissingProducts(content, foundProducts) {
        console.log('\n🔎 Searching for potentially missing products...');
        
        // Known product patterns that might be missing
        const additionalPatterns = [
            /Hayward\s+[A-Za-z0-9\s\-]+/g,
            /Pentair\s+[A-Za-z0-9\s\-]+/g,
            /Zodiac\s+[A-Za-z0-9\s\-]+/g,
            /Aquabot\s+[A-Za-z0-9\s\-]+/g,
            /Seagull\s+[A-Za-z0-9\s\-]+/g,
            /VRX\s+[A-Za-z0-9\s\-\+]+/g,
            /Sigma[A-Za-z0-9\s\-]*(?:Robotic)?/g
        ];
        
        const potentialProducts = new Set();
        
        additionalPatterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                const product = match[0].trim();
                if (product.length > 10 && product.length < 50) {
                    potentialProducts.add(product);
                }
            }
        });
        
        console.log(`Found ${potentialProducts.size} potential additional products`);
        
        // Filter out already found products
        const newProducts = Array.from(potentialProducts).filter(p => {
            const pNorm = p.toLowerCase().replace(/[^\w\s]/g, '');
            return !foundProducts.some(f => {
                const fNorm = f.toLowerCase().replace(/[^\w\s]/g, '');
                return fNorm.includes(pNorm) || pNorm.includes(fNorm);
            });
        });
        
        if (newProducts.length > 0) {
            console.log('\n🆕 Additional products that might be missing:');
            newProducts.forEach(p => console.log(`  - ${p}`));
        }
    }
}

// Run deep extraction
const extractor = new DeepNoviPodaciExtractor();
extractor.extractAllProducts();