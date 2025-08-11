#!/bin/bash
set -e

echo "🚀 Starting GitHub deployment..."

# Configuration
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_OWNER="FactBench"
REPO_NAME="VerdIQ"
BRANCH="main"

# Build the site first
echo "📦 Building site..."
npm run build

# Create temporary directory for deployment
TEMP_DIR=$(mktemp -d)
echo "📁 Using temp directory: $TEMP_DIR"

# Clone the repository
echo "📥 Cloning repository..."
git clone https://${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git $TEMP_DIR

cd $TEMP_DIR

# Configure git
git config user.email "deploy@factbench.com"
git config user.name "FactBench Deploy Bot"

# Remove all old files except .git
echo "🧹 Cleaning old files..."
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

# Copy new files from dist
echo "📋 Copying new files..."
cp -r /home/titan/FactBench/dist/* .

# Add all files
git add -A

# Check if there are changes
if git diff --staged --quiet; then
    echo "✅ No changes to deploy"
    exit 0
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "🚀 Deploy FactBench - $(date '+%Y-%m-%d %H:%M:%S')

Updates:
- Added all product images from zoopy.com
- Complete product data with user ratings
- All badges and awards (Best OF THE BEST, etc.)
- Red CTA buttons as requested
- Enhanced badges with rich colors
- Full product descriptions and reviews
- Changed 'View Deal' to 'Check Price'
- 90%+ content from zoopy source

Generated with Claude Code"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Cleanup
cd /
rm -rf $TEMP_DIR

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site will be live in ~5 minutes at:"
echo "   https://factbench.github.io/VerdIQ/"
echo ""
echo "📊 Check deployment status at:"
echo "   https://github.com/FactBench/VerdIQ/actions"