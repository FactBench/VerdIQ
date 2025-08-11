#!/bin/bash

# Quick deployment script for Step 2 implementation
# This script automates the entire workflow

set -e  # Exit on error

echo "🚀 Starting Step 2 Quick Deploy..."
echo "=================================="

# Step 1: Validate products data
echo -e "\n📋 Step 1: Validating products data..."
if node validate-products-data.js; then
    echo "✅ Validation passed!"
else
    echo "❌ Validation failed! Please fix errors before continuing."
    exit 1
fi

# Step 2: Download images (if needed)
echo -e "\n🖼️  Step 2: Checking images..."
if [ ! -d "images" ] || [ -z "$(ls -A images 2>/dev/null)" ]; then
    echo "Downloading product images..."
    node download-product-images.js
else
    echo "✅ Images directory already exists"
fi

# Step 3: Generate HTML
echo -e "\n🔨 Step 3: Generating products HTML..."
node generate-products-html-original.js
echo "✅ HTML generated"

# Step 4: Update main page
echo -e "\n📝 Step 4: Updating main page..."
bash replace-with-original.sh
echo "✅ Main page updated"

# Step 5: Build site
echo -e "\n🏗️  Step 5: Building site..."
cd /home/titan/FactBench
npm run build
cd -
echo "✅ Site built"

# Step 6: Deploy to GitHub Pages
echo -e "\n🌐 Step 6: Deploying to GitHub Pages..."
cd /home/titan/FactBench
./scripts/github-deploy.sh
cd -

echo -e "\n✨ Deployment complete!"
echo "🌐 Your site will be live in ~5 minutes at:"
echo "   https://factbench.github.io/VerdIQ/"
echo ""
echo "📊 Check deployment status at:"
echo "   https://github.com/FactBench/VerdIQ/actions"