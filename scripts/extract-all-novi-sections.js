#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Extract all sections from novi-podaci.html as requested
class CompleteNoviExtractor {
    constructor() {
        this.inputFile = path.join(__dirname, '..', 'pool-robot-podaci', 'novi-podaci.html');
        this.outputDir = path.join(__dirname, '..', 'novi-podaci-sections');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        // Create subdirectories
        const subdirs = ['intro-awards', 'comparison-table', 'product-reviews', 'images-links'];
        subdirs.forEach(dir => {
            const dirPath = path.join(this.outputDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
        });
    }

    extractAll() {
        console.log('📚 Extracting all sections from novi-podaci.html\n');
        
        const content = fs.readFileSync(this.inputFile, 'utf8');
        console.log(`✓ File loaded (${(content.length / 1024).toFixed(2)} KB)\n`);
        
        // 1. Extract intro and awards
        this.extractIntroAndAwards(content);
        
        // 2. Extract comparison table
        this.extractComparisonTable(content);
        
        // 3. Extract individual product reviews
        this.extractProductReviews(content);
        
        // 4. Extract images and links
        this.extractImagesAndLinks(content);
        
        // 5. Create summary
        this.createExtractionSummary();
    }

    extractIntroAndAwards(content) {
        console.log('📝 Extracting introduction and awards...');
        
        const introData = {
            title: '',
            subtitle: '',
            lastUpdated: '',
            awards: [],
            badges: [],
            extractedAt: new Date().toISOString()
        };
        
        // Extract main title
        const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (titleMatch) {
            introData.title = titleMatch[1]
                .replace(/&amp;/g, '&')
                .replace(/&nbsp;/g, ' ')
                .replace(/<br\s*\/?>/gi, ' ')
                .trim();
        }
        
        // Extract subtitle
        const subtitleMatch = content.match(/<h2[^>]*class="[^"]*headline[^"]*"[^>]*>([^<]+)<\/h2>/i);
        if (subtitleMatch) {
            introData.subtitle = subtitleMatch[1]
                .replace(/&amp;/g, '&')
                .replace(/&nbsp;/g, ' ')
                .replace(/<br\s*\/?>/gi, ' ')
                .trim();
        }
        
        // Extract last updated date
        const dateMatch = content.match(/Last Updated[^<]*?(\d+\w*\s+\w+\s+\d{4})/i);
        if (dateMatch) {
            introData.lastUpdated = dateMatch[1];
        }
        
        // Extract section titles and descriptions
        const sectionPattern = /<h[23][^>]*>([^<]+)<\/h[23]>\s*<[^>]*>([^<]+)</gi;
        const sections = [];
        let sectionMatch;
        while ((sectionMatch = sectionPattern.exec(content)) !== null) {
            const title = sectionMatch[1].trim();
            const description = sectionMatch[2].trim();
            
            if (title.length > 10 && description.length > 20 && 
                !title.includes('...') && !description.includes('...')) {
                sections.push({ title, description });
            }
        }
        
        introData.sections = sections.slice(0, 5); // Keep first 5 sections
        
        // Save intro data
        fs.writeFileSync(
            path.join(this.outputDir, 'intro-awards', 'intro-data.json'),
            JSON.stringify(introData, null, 2)
        );
        
        console.log(`✓ Extracted title: ${introData.title.substring(0, 50)}...`);
        console.log(`✓ Extracted ${introData.sections.length} section descriptions`);
    }

    extractComparisonTable(content) {
        console.log('\n📊 Extracting comparison table...');
        
        const tableData = {
            products: [],
            criteria: [],
            priceGuide: {},
            extractedAt: new Date().toISOString()
        };
        
        // Look for comparison section
        const comparisonMatch = content.match(/<section[^>]*id="[^"]*comparison[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
        
        if (comparisonMatch) {
            const tableSection = comparisonMatch[1];
            
            // Extract table headers (criteria)
            const headerMatch = tableSection.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
            if (headerMatch) {
                const headers = headerMatch[1].match(/<th[^>]*>([^<]+)<\/th>/gi);
                if (headers) {
                    tableData.criteria = headers
                        .map(h => h.replace(/<[^>]*>/g, '').trim())
                        .filter(h => h.length > 0 && h !== 'Product');
                }
            }
            
            // Extract table rows (products)
            const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            const rows = tableSection.matchAll(rowPattern);
            
            for (const row of rows) {
                const cells = row[1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
                if (cells && cells.length > 0) {
                    const productData = {
                        name: '',
                        data: []
                    };
                    
                    cells.forEach((cell, idx) => {
                        const cellContent = cell.replace(/<[^>]*>/g, '').trim();
                        if (idx === 0) {
                            productData.name = cellContent;
                        } else {
                            productData.data.push(cellContent);
                        }
                    });
                    
                    if (productData.name && productData.data.length > 0) {
                        tableData.products.push(productData);
                    }
                }
            }
            
            // Save table section HTML for reference
            fs.writeFileSync(
                path.join(this.outputDir, 'comparison-table', 'table-section.html'),
                tableSection
            );
        }
        
        // Extract price guide
        const pricePattern = /(\$+)\s*[:\-=]\s*([^<\n]+)/gi;
        const priceMatches = content.matchAll(pricePattern);
        for (const match of priceMatches) {
            const priceLevel = match[1];
            const priceRange = match[2].trim();
            if (priceRange.includes('$') || priceRange.includes('Under') || priceRange.includes('+')) {
                tableData.priceGuide[priceLevel] = priceRange;
            }
        }
        
        // Save comparison data
        fs.writeFileSync(
            path.join(this.outputDir, 'comparison-table', 'comparison-data.json'),
            JSON.stringify(tableData, null, 2)
        );
        
        console.log(`✓ Extracted ${tableData.products.length} products in comparison table`);
        console.log(`✓ Extracted ${tableData.criteria.length} comparison criteria`);
    }

    extractProductReviews(content) {
        console.log('\n📝 Extracting individual product reviews...');
        
        const products = [];
        const currentData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json'), 'utf8')
        );
        
        // For each product in our reconciled data, find its review section
        currentData.products.forEach((product, index) => {
            console.log(`  Searching for: ${product.name}`);
            
            const reviewData = {
                id: product.id,
                name: product.name,
                position: index + 1,
                amazonLink: product.amazonLink,
                content: '',
                features: [],
                pros: [],
                cons: [],
                extractedAt: new Date().toISOString()
            };
            
            // Create multiple search patterns for each product
            const searchPatterns = [
                new RegExp(`${index + 1}\\.\\s*${product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,5000}?(?=\\d+\\.|$)`, 'i'),
                new RegExp(`${product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,5000}?(?=\\d+\\.|$)`, 'i')
            ];
            
            let productSection = null;
            for (const pattern of searchPatterns) {
                const match = content.match(pattern);
                if (match) {
                    productSection = match[0];
                    break;
                }
            }
            
            if (productSection) {
                reviewData.content = productSection.substring(0, 2000) + '...'; // Store first 2000 chars
                
                // Extract features (look for bullet points or key features)
                const featurePattern = /(?:Key Features?|Features?)[:\s]*([^<]+(?:<[^>]*>[^<]+)*)/i;
                const featureMatch = productSection.match(featurePattern);
                if (featureMatch) {
                    const features = featureMatch[1].split(/[•·▪]/);
                    reviewData.features = features
                        .map(f => f.replace(/<[^>]*>/g, '').trim())
                        .filter(f => f.length > 10);
                }
                
                // Extract pros (What We Like)
                const prosPattern = /(?:What We Like|Pros?)[:\s]*([^<]+(?:<[^>]*>[^<]+)*)/i;
                const prosMatch = productSection.match(prosPattern);
                if (prosMatch) {
                    const pros = prosMatch[1].split(/[•·▪]/);
                    reviewData.pros = pros
                        .map(p => p.replace(/<[^>]*>/g, '').trim())
                        .filter(p => p.length > 10);
                }
                
                // Extract cons (What We Don't Like)
                const consPattern = /(?:What We Don'?t Like|Cons?)[:\s]*([^<]+(?:<[^>]*>[^<]+)*)/i;
                const consMatch = productSection.match(consPattern);
                if (consMatch) {
                    const cons = consMatch[1].split(/[•·▪]/);
                    reviewData.cons = cons
                        .map(c => c.replace(/<[^>]*>/g, '').trim())
                        .filter(c => c.length > 10);
                }
                
                console.log(`    ✓ Found review content (${reviewData.content.length} chars)`);
            } else {
                console.log(`    ⚠️  No detailed review found`);
            }
            
            // Save individual review
            fs.writeFileSync(
                path.join(this.outputDir, 'product-reviews', `${product.id}.json`),
                JSON.stringify(reviewData, null, 2)
            );
            
            products.push(reviewData);
        });
        
        console.log(`\n✓ Extracted ${products.filter(p => p.content).length} product reviews`);
    }

    extractImagesAndLinks(content) {
        console.log('\n🖼️  Extracting images and links...');
        
        const assets = {
            images: [],
            amazonLinks: [],
            officialLinks: [],
            videoLinks: [],
            extractedAt: new Date().toISOString()
        };
        
        // Extract all images
        const imgPattern = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi;
        const imgMatches = content.matchAll(imgPattern);
        for (const match of imgMatches) {
            assets.images.push({
                src: match[1],
                alt: match[2] || 'No alt text'
            });
        }
        
        // Extract Amazon links
        const amazonPattern = /<a[^>]*href="(https:\/\/amzn\.to\/[^"]+)"[^>]*>([^<]*)</gi;
        const amazonMatches = content.matchAll(amazonPattern);
        for (const match of amazonMatches) {
            assets.amazonLinks.push({
                url: match[1],
                text: match[2].trim()
            });
        }
        
        // Extract official/manufacturer links
        const officialPattern = /<a[^>]*href="(https:\/\/[^"]*(?:beatbot|dolphin|aiper|polaris|aquabot|hayward|pentair|zodiac)[^"]*)"[^>]*>/gi;
        const officialMatches = content.matchAll(officialPattern);
        for (const match of officialMatches) {
            if (!match[1].includes('amzn.to')) {
                assets.officialLinks.push(match[1]);
            }
        }
        
        // Extract YouTube videos
        const videoPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/gi;
        const videoMatches = content.matchAll(videoPattern);
        for (const match of videoMatches) {
            assets.videoLinks.push({
                id: match[1],
                url: `https://youtube.com/watch?v=${match[1]}`
            });
        }
        
        // Save assets data
        fs.writeFileSync(
            path.join(this.outputDir, 'images-links', 'assets.json'),
            JSON.stringify(assets, null, 2)
        );
        
        console.log(`✓ Found ${assets.images.length} images`);
        console.log(`✓ Found ${assets.amazonLinks.length} Amazon links`);
        console.log(`✓ Found ${assets.officialLinks.length} official links`);
        console.log(`✓ Found ${assets.videoLinks.length} video links`);
    }

    createExtractionSummary() {
        console.log('\n📊 Creating extraction summary...');
        
        const summary = {
            extractionDate: new Date().toISOString(),
            sourceFile: 'novi-podaci.html',
            sections: {
                introAwards: fs.existsSync(path.join(this.outputDir, 'intro-awards', 'intro-data.json')),
                comparisonTable: fs.existsSync(path.join(this.outputDir, 'comparison-table', 'comparison-data.json')),
                productReviews: fs.readdirSync(path.join(this.outputDir, 'product-reviews')).length,
                assets: fs.existsSync(path.join(this.outputDir, 'images-links', 'assets.json'))
            },
            files: []
        };
        
        // List all created files
        const walkDir = (dir, fileList = []) => {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    walkDir(filePath, fileList);
                } else {
                    fileList.push(filePath.replace(this.outputDir + '/', ''));
                }
            });
            return fileList;
        };
        
        summary.files = walkDir(this.outputDir);
        
        fs.writeFileSync(
            path.join(this.outputDir, 'extraction-summary.json'),
            JSON.stringify(summary, null, 2)
        );
        
        console.log('\n✅ Complete extraction finished!');
        console.log(`📁 Output directory: ${this.outputDir}`);
        console.log(`📄 Total files created: ${summary.files.length}`);
        
        console.log('\n📋 Next steps:');
        console.log('1. Review extracted sections in novi-podaci-sections/');
        console.log('2. Implement each section on the website');
        console.log('3. Verify all data matches novi-podaci');
        console.log('4. Deploy to GitHub Pages');
    }
}

// Run complete extraction
const extractor = new CompleteNoviExtractor();
extractor.extractAll();