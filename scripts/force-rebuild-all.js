#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Force rebuilding with all current products...\n');

// Clean dist directory
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('✓ Cleaned dist directory');
}

// Clean any cached data
const cacheFiles = [
    path.join(__dirname, '..', 'validation-report.json'),
    path.join(__dirname, '..', 'pre-deploy-report.json')
];

cacheFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✓ Removed ${path.basename(file)}`);
    }
});

// Update build script to ensure all products are included
const buildScriptPath = path.join(__dirname, 'build.js');
const buildScript = fs.readFileSync(buildScriptPath, 'utf8');

// Make sure the build script uses current data
if (!buildScript.includes('// Force use current data')) {
    const updatedBuildScript = buildScript.replace(
        'const data = JSON.parse(fs.readFileSync(dataPath, \'utf8\'));',
        `// Force use current data
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(\`Building with \${data.products.length} products...\`);`
    );
    fs.writeFileSync(buildScriptPath, updatedBuildScript);
    console.log('✓ Updated build script');
}

// Run the build
console.log('\n🚀 Running build...\n');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

// Verify all products are in the HTML
console.log('\n🔍 Verifying all products are in HTML...\n');
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const htmlPath = path.join(distDir, 'best-robotic-pool-cleaners', 'index.html');

if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    let allFound = true;
    
    data.products.forEach(product => {
        if (!html.includes(product.name)) {
            console.log(`❌ Missing: ${product.name}`);
            allFound = false;
        } else {
            console.log(`✓ Found: ${product.name}`);
        }
    });
    
    if (allFound) {
        console.log('\n✅ All products found in HTML!');
        console.log('\nNow run: node scripts/pre-deploy-verify.js');
    } else {
        console.log('\n❌ Some products are missing from HTML');
        console.log('Check the build script and templates');
    }
} else {
    console.error('❌ HTML file not found!');
}