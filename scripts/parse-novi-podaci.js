#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Parse the large HTML file and extract structured data
class NoviPodaciParser {
    constructor() {
        this.inputFile = path.join(__dirname, '..', 'pool-robot-podaci', 'novi-podaci.html');
        this.outputDir = path.join(__dirname, '..', 'extracted-data');
        this.sections = {
            intro: '',
            awards: '',
            table: '',
            reviews: []
        };
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    parseHTML() {
        console.log('📖 Reading novi-podaci.html...');
        
        try {
            // Read the file in chunks due to size
            const content = fs.readFileSync(this.inputFile, 'utf8');
            console.log(`✓ File read successfully (${(content.length / 1024).toFixed(2)} KB)`);
            
            // Extract main content area
            const mainContentMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
            if (!mainContentMatch) {
                throw new Error('Could not find main content area');
            }
            
            const mainContent = mainContentMatch[1];
            
            // Extract sections
            this.extractIntroSection(mainContent);
            this.extractTableSection(mainContent);
            this.extractReviews(mainContent);
            
            return true;
        } catch (error) {
            console.error('❌ Error parsing HTML:', error.message);
            return false;
        }
    }

    extractIntroSection(content) {
        console.log('\n🎯 Extracting introduction and awards...');
        
        // Look for the intro section pattern
        const introMatch = content.match(/<section[^>]*class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
        if (introMatch) {
            this.sections.intro = introMatch[1];
            console.log('✓ Found introduction section');
        }
        
        // Look for awards/badges section
        const awardsMatch = content.match(/<div[^>]*class="[^"]*awards[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (awardsMatch) {
            this.sections.awards = awardsMatch[1];
            console.log('✓ Found awards section');
        }
    }

    extractTableSection(content) {
        console.log('\n📊 Extracting comparison table...');
        
        // Look for the comparison table
        const tableMatch = content.match(/<section[^>]*class="[^"]*comparison[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
        if (tableMatch) {
            this.sections.table = tableMatch[1];
            console.log('✓ Found comparison table');
        }
    }

    extractReviews(content) {
        console.log('\n📝 Extracting individual reviews...');
        
        // Look for individual product reviews
        const reviewPattern = /<article[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
        const reviews = content.match(reviewPattern);
        
        if (reviews) {
            reviews.forEach((review, index) => {
                // Extract product name from review
                const nameMatch = review.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i);
                const name = nameMatch ? nameMatch[1].trim() : `Product ${index + 1}`;
                
                this.sections.reviews.push({
                    name: name,
                    content: review,
                    index: index + 1
                });
            });
            
            console.log(`✓ Found ${this.sections.reviews.length} product reviews`);
        }
    }

    saveExtractedData() {
        console.log('\n💾 Saving extracted data...');
        
        this.ensureOutputDir();
        
        // Save intro and awards
        if (this.sections.intro || this.sections.awards) {
            const introContent = {
                intro: this.sections.intro,
                awards: this.sections.awards,
                extractedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(
                path.join(this.outputDir, 'intro-awards.json'),
                JSON.stringify(introContent, null, 2)
            );
            console.log('✓ Saved intro-awards.json');
        }
        
        // Save table
        if (this.sections.table) {
            const tableContent = {
                table: this.sections.table,
                extractedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(
                path.join(this.outputDir, 'comparison-table.json'),
                JSON.stringify(tableContent, null, 2)
            );
            console.log('✓ Saved comparison-table.json');
        }
        
        // Save individual reviews
        const reviewsDir = path.join(this.outputDir, 'reviews');
        if (!fs.existsSync(reviewsDir)) {
            fs.mkdirSync(reviewsDir);
        }
        
        this.sections.reviews.forEach(review => {
            const fileName = review.name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '') + '.json';
            
            const reviewContent = {
                name: review.name,
                content: review.content,
                index: review.index,
                extractedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(
                path.join(reviewsDir, fileName),
                JSON.stringify(reviewContent, null, 2)
            );
        });
        
        console.log(`✓ Saved ${this.sections.reviews.length} individual review files`);
        
        // Save summary
        const summary = {
            totalSections: 3,
            totalReviews: this.sections.reviews.length,
            files: {
                intro: 'intro-awards.json',
                table: 'comparison-table.json',
                reviews: this.sections.reviews.map(r => 
                    r.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.json'
                )
            },
            extractedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'extraction-summary.json'),
            JSON.stringify(summary, null, 2)
        );
        console.log('✓ Saved extraction-summary.json');
    }

    extractProductList() {
        console.log('\n📋 Extracting product list from novi-podaci...');
        
        const productNames = [];
        
        // Extract from reviews
        this.sections.reviews.forEach(review => {
            productNames.push(review.name);
        });
        
        // Save product list
        const productList = {
            products: productNames,
            count: productNames.length,
            source: 'novi-podaci.html',
            extractedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(this.outputDir, 'product-list.json'),
            JSON.stringify(productList, null, 2)
        );
        
        console.log(`✓ Found ${productNames.length} products in novi-podaci`);
        console.log('Products:', productNames);
        
        return productNames;
    }

    async run() {
        console.log('🚀 Starting novi-podaci parser...\n');
        
        const success = this.parseHTML();
        
        if (success) {
            this.saveExtractedData();
            this.extractProductList();
            
            console.log('\n✅ Parsing complete!');
            console.log(`📁 Output directory: ${this.outputDir}`);
            console.log('\nNext steps:');
            console.log('1. Review extracted data in extracted-data/');
            console.log('2. Run data reconciliation to remove products not in novi-podaci');
            console.log('3. Implement sections step by step');
        } else {
            console.log('\n❌ Parsing failed!');
        }
    }
}

// Alternative approach using streaming for very large files
class StreamingParser {
    constructor() {
        this.inputFile = path.join(__dirname, '..', 'pool-robot-podaci', 'novi-podaci.html');
        this.outputDir = path.join(__dirname, '..', 'extracted-data');
    }

    async parseStream() {
        console.log('📖 Using streaming parser for large file...');
        
        const stream = fs.createReadStream(this.inputFile, { encoding: 'utf8' });
        let buffer = '';
        let inProduct = false;
        let productCount = 0;
        
        stream.on('data', (chunk) => {
            buffer += chunk;
            
            // Process complete tags
            let tagStart = buffer.indexOf('<');
            while (tagStart !== -1) {
                let tagEnd = buffer.indexOf('>', tagStart);
                if (tagEnd === -1) break; // Incomplete tag
                
                const tag = buffer.substring(tagStart, tagEnd + 1);
                
                // Detect product sections
                if (tag.includes('class="product') || tag.includes('data-product')) {
                    inProduct = true;
                    productCount++;
                }
                
                // Move past this tag
                buffer = buffer.substring(tagEnd + 1);
                tagStart = buffer.indexOf('<');
            }
        });
        
        stream.on('end', () => {
            console.log(`✓ Stream parsing complete. Found ${productCount} product sections`);
        });
    }
}

// Run the parser
const parser = new NoviPodaciParser();
parser.run();