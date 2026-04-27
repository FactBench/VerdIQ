#!/bin/bash
# ===================================================
# FactBench VerdIQ - Create New Review Page
# ===================================================
# Usage: ./scripts/create-review.sh <category> <product-name>
# Example: ./scripts/create-review.sh pool-cleaners dolphin-nautilus-cc
# ===================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing arguments${NC}"
    echo ""
    echo "Usage: $0 <category> <product-name>"
    echo ""
    echo "Examples:"
    echo "  $0 pool-cleaners dolphin-nautilus-cc"
    echo "  $0 bidet-attachments alpha-jx-bidet"
    echo "  $0 analog-to-digital legacybox-service"
    echo ""
    echo "Available categories:"
    echo "  - pool-cleaners"
    echo "  - bidet-attachments"
    echo "  - analog-to-digital"
    echo "  - [create new category]"
    exit 1
fi

CATEGORY=$1
PRODUCT_NAME=$2
REVIEW_DIR="best-${CATEGORY}"
FILE_PATH="${REVIEW_DIR}/${PRODUCT_NAME}.html"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - New Review Generator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Category:      ${GREEN}${CATEGORY}${NC}"
echo -e "Product:       ${GREEN}${PRODUCT_NAME}${NC}"
echo -e "File:          ${GREEN}${FILE_PATH}${NC}"
echo ""

# Create directory if not exists
if [ ! -d "${REVIEW_DIR}" ]; then
    echo -e "${YELLOW}⚠️  Directory ${REVIEW_DIR} doesn't exist. Creating...${NC}"
    mkdir -p "${REVIEW_DIR}"
    echo -e "${GREEN}✅ Directory created${NC}"
fi

# Check if file already exists
if [ -f "${FILE_PATH}" ]; then
    echo -e "${RED}❌ Error: ${FILE_PATH} already exists!${NC}"
    echo ""
    echo "Options:"
    echo "  1. Use a different product name"
    echo "  2. Delete existing file: rm ${FILE_PATH}"
    echo "  3. Edit existing file: nano ${FILE_PATH}"
    exit 1
fi

# Check if template exists
if [ ! -f "templates/review-page-template.html" ]; then
    echo -e "${RED}❌ Error: Template not found!${NC}"
    echo "Expected: templates/review-page-template.html"
    exit 1
fi

# Copy template
echo -e "${BLUE}📄 Creating review page from template...${NC}"
cp templates/review-page-template.html "${FILE_PATH}"

# Replace placeholders in the file
PRODUCT_TITLE=$(echo "$PRODUCT_NAME" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')
CATEGORY_TITLE=$(echo "$CATEGORY" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')
TODAY=$(date +%Y-%m-%d)
TODAY_PRETTY=$(date +"%B %d, %Y")

# Perform replacements
sed -i "s|\[PRODUCT NAME\]|${PRODUCT_TITLE}|g" "${FILE_PATH}"
sed -i "s|\[PRODUCT-SLUG\]|${PRODUCT_NAME}|g" "${FILE_PATH}"
sed -i "s|\[CATEGORY\]|${CATEGORY}|g" "${FILE_PATH}"
sed -i "s|\[YYYY-MM-DD\]|${TODAY}|g" "${FILE_PATH}"
sed -i "s|\[Month Day, Year\]|${TODAY_PRETTY}|g" "${FILE_PATH}"

echo -e "${GREEN}✅ Review page created successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1️⃣  Edit the review content:"
echo "   ${GREEN}nano ${FILE_PATH}${NC}"
echo ""
echo "2️⃣  Update sitemap.xml:"
echo "   ${GREEN}nano sitemap.xml${NC}"
echo "   Add:"
echo "   <url>"
echo "     <loc>https://factbench.github.io/VerdIQ/${FILE_PATH}</loc>"
echo "     <lastmod>${TODAY}</lastmod>"
echo "     <changefreq>monthly</changefreq>"
echo "     <priority>0.8</priority>"
echo "   </url>"
echo ""
echo "3️⃣  Preview locally:"
echo "   ${GREEN}./scripts/serve.sh${NC}"
echo "   Open: http://localhost:8000/${FILE_PATH}"
echo ""
echo "4️⃣  Commit and deploy:"
echo "   ${GREEN}git add .${NC}"
echo "   ${GREEN}git commit -m \"Add: ${PRODUCT_TITLE} review (${CATEGORY})\"${NC}"
echo "   ${GREEN}./scripts/deploy.sh${NC}"
echo ""
echo -e "${GREEN}🚀 Review page ready for editing!${NC}"
echo ""
