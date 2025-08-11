#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate manifest for golden data
class ManifestGenerator {
    constructor() {
        this.goldenDataPath = path.join(__dirname, '..', 'golden-data');
        this.productsPath = path.join(this.goldenDataPath, 'products');
    }

    generateHash(data) {
        const normalized = JSON.stringify(data, null, 2);
        return crypto.createHash('sha256').update(normalized).digest('hex');
    }

    createManifest() {
        console.log('🔨 Generating manifest for golden data...\n');

        // Ensure golden-data directory exists
        if (!fs.existsSync(this.goldenDataPath)) {
            fs.mkdirSync(this.goldenDataPath, { recursive: true });
        }
        if (!fs.existsSync(this.productsPath)) {
            fs.mkdirSync(this.productsPath, { recursive: true });
        }

        const manifest = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            chunks: {}
        };

        // Read all chunk files
        const chunkFiles = fs.readdirSync(this.productsPath)
            .filter(f => f.startsWith('chunk-') && f.endsWith('.json'))
            .sort();

        chunkFiles.forEach(file => {
            const chunkPath = path.join(this.productsPath, file);
            const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
            const chunkId = file.replace('.json', '');

            manifest.chunks[chunkId] = {
                file: file,
                hash: this.generateHash(chunkData),
                productCount: chunkData.length,
                products: chunkData.map(p => ({
                    id: p.id,
                    name: p.name,
                    badge: p.badge
                }))
            };

            console.log(`✓ Processed ${chunkId}: ${chunkData.length} products`);
        });

        // Save manifest
        const manifestPath = path.join(this.goldenDataPath, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        console.log(`\n✅ Manifest generated successfully!`);
        console.log(`📁 Location: ${manifestPath}`);
        console.log(`📊 Total chunks: ${Object.keys(manifest.chunks).length}`);
        
        return manifest;
    }

    // Split current data into chunks for golden data
    splitDataIntoChunks(dataPath, chunkSize = 5) {
        console.log('📦 Splitting data into chunks...\n');

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const products = data.products;

        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize);
            const chunkNumber = Math.floor(i / chunkSize) + 1;
            const chunkId = `chunk-${String(chunkNumber).padStart(3, '0')}`;
            const chunkPath = path.join(this.productsPath, `${chunkId}.json`);

            fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
            console.log(`✓ Created ${chunkId}.json with ${chunk.length} products`);
        }
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const generator = new ManifestGenerator();

if (args.includes('--split')) {
    // First split the data into chunks
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
    generator.splitDataIntoChunks(dataPath);
}

// Generate manifest
generator.createManifest();