#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Ensure dist directories exist
const dirs = [
    'dist',
    'dist/assets',
    'dist/assets/css',
    'dist/assets/js',
    'dist/assets/images',
    'dist/assets/images/products',
    'dist/best-robotic-pool-cleaners'
];

dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Copy static assets
const copyFile = (src, dest) => {
    const srcPath = path.join(__dirname, '..', src);
    const destPath = path.join(__dirname, '..', dest);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied ${src} → ${dest}`);
    }
};

// Optimize and copy images
console.log('\n🖼️  Processing images...');
const { execSync } = require('child_process');
try {
    execSync('node scripts/optimize-images.js', { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️  Image optimization skipped (install sharp for WebP support)');
    // Fallback: just copy images
    copyFile('src/assets/images/logo.svg', 'dist/assets/images/logo.svg');
    copyFile('src/assets/images/favicon.svg', 'dist/assets/images/favicon.svg');
}

// Copy favicon files
copyFile('dist/favicon.ico', 'dist/favicon.ico');
copyFile('src/assets/images/favicon.svg', 'dist/favicon.svg');

// Copy product images
const productsDir = path.join(__dirname, '../src/assets/images/products');
if (fs.existsSync(productsDir)) {
    const productImages = fs.readdirSync(productsDir).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    productImages.forEach(image => {
        copyFile(`src/assets/images/products/${image}`, `dist/assets/images/products/${image}`);
    });
}

// Copy hero image
if (fs.existsSync(path.join(__dirname, '../src/assets/images/pool-robot-cleaning.jpg'))) {
    copyFile('src/assets/images/pool-robot-cleaning.jpg', 'dist/assets/images/pool-robot-cleaning.jpg');
}

// Process HTML files
const processHtml = (src, dest) => {
    const srcPath = path.join(__dirname, '..', src);
    const destPath = path.join(__dirname, '..', dest);
    
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    let html = fs.readFileSync(srcPath, 'utf8');
    
    // Remove comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    // Minify whitespace (basic)
    html = html.replace(/\s+/g, ' ');
    html = html.replace(/>\s+</g, '><');
    
    fs.writeFileSync(destPath, html);
    console.log(`✓ Processed ${src} → ${dest}`);
};

// Build landing page
processHtml('src/pages/best-robotic-pool-cleaners.html', 'dist/best-robotic-pool-cleaners/index.html');

// Build review pages
const reviewsDir = path.join(__dirname, '..', 'src', 'pages', 'reviews');
if (fs.existsSync(reviewsDir)) {
    // Create reviews directory in dist
    const distReviewsDir = path.join(__dirname, '..', 'dist', 'reviews');
    if (!fs.existsSync(distReviewsDir)) {
        fs.mkdirSync(distReviewsDir, { recursive: true });
    }
    
    const reviewFiles = fs.readdirSync(reviewsDir).filter(file => file.endsWith('.html'));
    reviewFiles.forEach(file => {
        const reviewName = path.basename(file, '.html');
        processHtml(`src/pages/reviews/${file}`, `dist/reviews/${reviewName}/index.html`);
    });
    console.log(`✓ Processed ${reviewFiles.length} review pages`);
}

// Create robots.txt
const robotsTxt = `User-agent: *
Disallow: /

# FactBench - Expert Analysis Platform
# This site is not indexed by search engines`;

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'robots.txt'), robotsTxt);
console.log('✓ Created robots.txt');

// Copy manifest.json
const manifestSrc = path.join(__dirname, '../src/manifest.json');
const manifestDest = path.join(__dirname, '..', 'dist', 'manifest.json');
if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest);
    console.log('✓ Copied manifest.json');
}

// Create simple homepage redirect
const homepageHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FactBench - Your Personal Truth Detector</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="/VerdIQ/assets/css/style.css">
    <link rel="icon" type="image/svg+xml" href="/VerdIQ/favicon.svg">
    <link rel="apple-touch-icon" href="/VerdIQ/apple-touch-icon.svg">
    <meta name="theme-color" content="#0ea5e9">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-CXPNJ0FEG7"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-CXPNJ0FEG7');
    </script>
</head>
<body class="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
    <div class="container mx-auto px-4 py-12 max-w-5xl">
        <!-- Logo and Hero Section -->
        <div class="text-center mb-16">
            <img src="/VerdIQ/assets/images/logo.svg" alt="FactBench" class="h-24 w-24 mx-auto mb-6">
            <h1 class="text-5xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Welcome to FactBench: Your Personal Truth Detector
            </h1>
            
            <!-- CTA Section moved here -->
            <p class="text-gray-400 mb-4 text-lg mt-8">Explore our latest in-depth analysis:</p>
            <a href="/VerdIQ/best-robotic-pool-cleaners/" class="inline-block bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg mb-12">
                View Latest Product Analysis →
            </a>
            
            <p class="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Think of us as the fact-checking platform that actually cuts through the noise. In a world drowning in information, we're your lifeline to what's real. Our team combines AI-powered analysis with genuine human expertise to verify claims quickly and accurately. Whether you're checking a viral story, investigating a suspicious claim, or researching data trends, we help you find the truth every single time.
            </p>
        </div>

        <!-- How We're Different Section -->
        <div class="bg-base-300 rounded-xl p-10 mb-12 border border-gray-800">
            <h2 class="text-3xl font-bold text-primary mb-6">How We're Different</h2>
            <p class="text-gray-300 leading-relaxed text-lg">
                FactBench isn't just another fact-checking site. We built something unique by merging advanced detection algorithms with investigative journalism fundamentals. Speed without sacrificing accuracy. Our researchers trace sources, analyze patterns, and provide clear verdicts in real-time. While others make you wait hours or days, we deliver verified information instantly. We know you need answers now, not tomorrow. That's exactly what we built.
            </p>
        </div>

        <!-- Why Trust FactBench Section -->
        <div class="bg-gradient-to-r from-base-300 to-base-200 rounded-xl p-10 mb-12 border border-gray-800">
            <h2 class="text-3xl font-bold text-accent mb-6">Why Trust FactBench?</h2>
            <p class="text-gray-300 leading-relaxed text-lg">
                We do the deep investigative work so you don't have to. Every claim gets the same rigorous treatment through our proprietary verification pipeline. Breaking news, viral posts, statistical claims: we handle them all with the same precision. We show our work, cite our sources, and explain our reasoning in plain English because transparency isn't optional, it's essential. Thousands of users already rely on us to navigate the information battlefield. We built FactBench because we got tired of watching misinformation spread faster than truth. Now we're fixing that problem, one fact at a time.
            </p>
        </div>

    </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index.html'), homepageHtml);
console.log('✓ Created homepage');

console.log('\n✅ Build completed successfully!');
console.log('📁 Output directory: dist/');
console.log('🚀 Ready for deployment to GitHub Pages');