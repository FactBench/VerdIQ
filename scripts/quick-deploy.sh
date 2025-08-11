#!/bin/bash

# Quick deploy script for FactBench
# This script builds and deploys the site to GitHub Pages

set -e  # Exit on error

echo "🚀 Starting FactBench deployment..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from FactBench root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the site
echo "🔨 Building site..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial FactBench commit"
    echo ""
    echo "⚠️  Please add your GitHub remote:"
    echo "git remote add origin https://github.com/FactBench/VerdIQ.git"
    echo ""
    echo "Then run this script again to deploy."
    exit 0
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "❌ No git remote found. Please add it:"
    echo "git remote add origin https://github.com/FactBench/VerdIQ.git"
    exit 1
fi

# Add and commit changes
echo "📝 Committing changes..."
git add .
git status --porcelain
if [ -n "$(git status --porcelain)" ]; then
    git commit -m "Update FactBench site - $(date '+%Y-%m-%d %H:%M:%S')" || true
else
    echo "✅ No changes to commit"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment complete!"
echo "=================================="
echo "🌐 Your site will be live in ~5 minutes at:"
echo "   https://factbench.github.io/VerdIQ/"
echo ""
echo "💡 Tip: Check deployment status at:"
echo "   https://github.com/FactBench/VerdIQ/actions"