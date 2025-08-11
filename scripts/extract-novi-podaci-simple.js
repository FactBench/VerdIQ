#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple extraction script that processes the HTML file in chunks
class SimpleNoviPodaciExtractor {
    constructor() {
        this.inputFile = path.join(__dirname, '..', 'pool-robot-podaci', 'novi-podaci.html');
        this.outputDir = path.join(__dirname, '..', 'extracted-data');
        this.products = [];
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    extractProducts() {
        console.log('📖 Reading novi-podaci.html...');
        
        try {
            const content = fs.readFileSync(this.inputFile, 'utf8');
            console.log(`✓ File read successfully (${(content.length / 1024).toFixed(2)} KB)`);
            
            // Extract product names using simple patterns
            const productPatterns = [
                // Look for numbered items with product names
                /<h[234][^>]*>(\d+\.?\s*)?([^<]+)<\/h[234]>/gi,
                // Look for product links
                /<a[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/a>/gi,
                // Look for specific product name patterns
                />(BeatBot[^<]+)</gi,
                />(Dolphin[^<]+)</gi,
                />(AIPER[^<]+)</gi,
                />(Polaris[^<]+)</gi,
                />(Aquabot[^<]+)</gi,
                />(Hayward[^<]+)</gi,
                />(Pentair[^<]+)</gi,
                />(Zodiac[^<]+)</gi,
                />(Seagull[^<]+)</gi
            ];
            
            const foundProducts = new Set();
            
            // Extract products using each pattern
            productPatterns.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    let productName = match[2] || match[1]; // Handle different capture groups
                    if (productName) {
                        productName = productName.trim();
                        // Clean up the name
                        productName = productName.replace(/^\d+\.?\s*/, ''); // Remove numbering
                        productName = productName.replace(/<[^>]*>/g, ''); // Remove any HTML
                        productName = productName.replace(/&amp;/g, '&');
                        productName = productName.replace(/&nbsp;/g, ' ');
                        
                        // Filter out non-product names
                        if (productName.length > 5 && 
                            !productName.toLowerCase().includes('click') &&
                            !productName.toLowerCase().includes('review') &&
                            !productName.toLowerCase().includes('best') &&
                            !productName.toLowerCase().includes('top') &&
                            !productName.includes('...') &&
                            !productName.toLowerCase().includes('read more')) {
                            foundProducts.add(productName);
                        }
                    }
                }
            });
            
            // Look for Amazon links with product context
            const amazonLinkPattern = /<a[^>]*href="(https:\/\/amzn\.to\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
            const amazonMatches = content.matchAll(amazonLinkPattern);
            const amazonLinks = [];
            
            for (const match of amazonMatches) {
                amazonLinks.push({
                    url: match[1],
                    text: match[2].trim()
                });
            }
            
            // Convert to array and clean up
            this.products = Array.from(foundProducts).sort();
            
            console.log(`\n✓ Found ${this.products.length} potential products`);
            console.log(`✓ Found ${amazonLinks.length} Amazon links`);
            
            // Save results
            this.saveExtractedData(amazonLinks);
            
        } catch (error) {
            console.error('❌ Error extracting products:', error.message);
        }
    }

    saveExtractedData(amazonLinks) {
        this.ensureOutputDir();
        
        // Save product list
        const productData = {
            products: this.products,
            count: this.products.length,
            extractedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'product-list-simple.json'),
            JSON.stringify(productData, null, 2)
        );
        
        console.log('\n📋 Products found:');
        this.products.forEach((product, idx) => {
            console.log(`  ${idx + 1}. ${product}`);
        });
        
        // Save Amazon links
        const linksData = {
            links: amazonLinks,
            count: amazonLinks.length,
            extractedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'amazon-links.json'),
            JSON.stringify(linksData, null, 2)
        );
        
        // Extract sections by searching for specific markers
        this.extractSections();
    }

    extractSections() {
        console.log('\n🔍 Extracting sections...');
        
        const content = fs.readFileSync(this.inputFile, 'utf8');
        
        // Extract title section
        const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (titleMatch) {
            const titleData = {
                title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
                extractedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(
                path.join(this.outputDir, 'page-title.json'),
                JSON.stringify(titleData, null, 2)
            );
            
            console.log(`✓ Found page title: ${titleData.title.substring(0, 50)}...`);
        }
        
        // Look for comparison table section
        const tableSection = content.match(/<section[^>]*id="[^"]*comparison[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
        if (tableSection) {
            fs.writeFileSync(
                path.join(this.outputDir, 'comparison-section.html'),
                tableSection[1]
            );
            console.log('✓ Found comparison section');
        }
        
        // Create extraction summary
        const summary = {
            extractionDate: new Date().toISOString(),
            productsFound: this.products.length,
            sectionsExtracted: {
                title: !!titleMatch,
                comparisonTable: !!tableSection
            }
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'extraction-summary-simple.json'),
            JSON.stringify(summary, null, 2)
        );
        
        console.log('\n✅ Extraction complete!');
        console.log(`📁 Output directory: ${this.outputDir}`);
    }
}

// Run the extractor
const extractor = new SimpleNoviPodaciExtractor();
extractor.extractProducts();