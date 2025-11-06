#!/bin/bash
# ===================================================
# FactBench VerdIQ - Deploy to GitHub Pages
# ===================================================
# Safely deploys changes to GitHub Pages
# ===================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if in correct directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: Not in FactBenchV2 directory!${NC}"
    echo "Please run: cd ~/projects/FactBenchV2"
    exit 1
fi

# Check for uncommitted changes
echo -e "${BLUE}🔍 Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected!${NC}"
    echo ""
    git status --short
    echo ""
    echo -e "${YELLOW}You must commit your changes before deploying:${NC}"
    echo ""
    echo "  ${GREEN}git add .${NC}"
    echo "  ${GREEN}git commit -m \"Your commit message\"${NC}"
    echo "  ${GREEN}./scripts/deploy.sh${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ No uncommitted changes${NC}"
echo ""

# Pull latest changes
echo -e "${BLUE}📡 Pulling latest changes from GitHub...${NC}"
if git pull origin main; then
    echo -e "${GREEN}✅ Successfully pulled latest changes${NC}"
else
    echo -e "${RED}❌ Error pulling changes!${NC}"
    echo ""
    echo "Possible issues:"
    echo "  - Network connection problem"
    echo "  - Merge conflicts"
    echo "  - Authentication issues"
    echo ""
    echo "Try:"
    echo "  git status"
    echo "  git pull origin main --rebase"
    exit 1
fi
echo ""

# Show what will be pushed
echo -e "${BLUE}📦 Changes to be deployed:${NC}"
git log origin/main..HEAD --oneline --no-decorate
echo ""

# Confirm deployment
read -p "$(echo -e ${YELLOW}Deploy these changes to GitHub Pages? [y/N]: ${NC})" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Deployment cancelled${NC}"
    exit 0
fi

# Push to GitHub
echo ""
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Push failed!${NC}"
    echo ""
    echo "Possible issues:"
    echo "  - Authentication problem (check token)"
    echo "  - Network connection"
    echo "  - Repository permissions"
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Successful!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⏱️  Your changes will be live in ~1-2 minutes${NC}"
echo ""
echo -e "${GREEN}🌐 Live Site:${NC}"
echo "   https://factbench.github.io/VerdIQ/"
echo ""
echo -e "${BLUE}📊 Monitor Deployment:${NC}"
echo "   https://github.com/FactBench/VerdIQ/actions"
echo ""
echo -e "${YELLOW}💡 Tip:${NC} Clear browser cache if changes don't appear immediately"
echo "   (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)"
echo ""
