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
# Review pages live at reviews/<slug>/index.html, which is what the site links
# to and what sitemap.xml lists. The category argument only drives the
# breadcrumb and the "see all" link inside the page.
REVIEW_DIR="reviews/${PRODUCT_NAME}"
FILE_PATH="${REVIEW_DIR}/index.html"
REVIEW_URL="https://factbench.github.io/VerdIQ/reviews/${PRODUCT_NAME}/"

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

# The category argument is a short name; the listing page it belongs to has its
# own directory, and the two do not always match (pool-cleaners lives at
# best-robotic-pool-cleaners). Resolve it here rather than guessing "best-$1".
case "$CATEGORY" in
    pool-cleaners)      CATEGORY_DIR="best-robotic-pool-cleaners";    CATEGORY_TITLE="Pool Cleaners" ;;
    bidet-attachments)  CATEGORY_DIR="best-bidet-attachments";        CATEGORY_TITLE="Bidet Attachments" ;;
    analog-to-digital)  CATEGORY_DIR="best-analog-to-digital-service"; CATEGORY_TITLE="Analog to Digital" ;;
    *)                  CATEGORY_DIR="best-${CATEGORY}"
                        CATEGORY_TITLE=$(echo "$CATEGORY" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g') ;;
esac

# A review for a product with no listing page (an "orphan" review) points its
# breadcrumb at "#", the same as reviews/derila-ergo. Linking at a directory
# that does not exist would ship a 404 in the breadcrumb.
if [ -d "${CATEGORY_DIR}" ]; then
    CATEGORY_HREF="https://factbench.github.io/VerdIQ/${CATEGORY_DIR}/"
else
    CATEGORY_HREF="#"
    echo -e "${YELLOW}⚠️  No listing page at ./${CATEGORY_DIR} - breadcrumb will link to \"#\".${NC}"
    echo -e "${YELLOW}   That matches the other orphan reviews. Point it somewhere real if a"
    echo -e "   listing page exists under a different name.${NC}"
    echo ""
fi

TODAY=$(date +%Y-%m-%d)
TODAY_PRETTY=$(date +"%B %d, %Y")
YEAR=$(date +%Y)

# Perform replacements
# Order matters: [CATEGORY NAME] must be substituted before [CATEGORY],
# otherwise the shorter marker eats the front of the longer one.
sed -i "s|\[CATEGORY HREF\]|${CATEGORY_HREF}|g" "${FILE_PATH}"
sed -i "s|\[CATEGORY NAME\]|${CATEGORY_TITLE}|g" "${FILE_PATH}"
sed -i "s|\[PRODUCT NAME\]|${PRODUCT_TITLE}|g" "${FILE_PATH}"
sed -i "s|\[PRODUCT-SLUG\]|${PRODUCT_NAME}|g" "${FILE_PATH}"
sed -i "s|\[CATEGORY\]|${CATEGORY}|g" "${FILE_PATH}"
sed -i "s|\[YYYY-MM-DD\]|${TODAY}|g" "${FILE_PATH}"
sed -i "s|\[Month Day, Year\]|${TODAY_PRETTY}|g" "${FILE_PATH}"
sed -i "s|\[YYYY\]|${YEAR}|g" "${FILE_PATH}"

echo -e "${GREEN}✅ Review page created successfully!${NC}"
echo ""

# How much is still left to write by hand
REMAINING=$(grep -o '\[[A-Z][^]]\{2,120\}\]' "${FILE_PATH}" | sort -u | wc -l | tr -d ' ')
echo -e "${YELLOW}⚠️  ${REMAINING} placeholder(s) still need your content:${NC}"
grep -o '\[[A-Z][^]]\{2,120\}\]' "${FILE_PATH}" | sort -u | sed 's/^/   /'
echo ""
echo -e "${YELLOW}   The page must not go live with any of these left in it -${NC}"
echo -e "${YELLOW}   they render literally in Google results and social shares.${NC}"
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
echo "     <loc>${REVIEW_URL}</loc>"
echo "     <lastmod>${TODAY}</lastmod>"
echo "     <changefreq>monthly</changefreq>"
echo "     <priority>0.8</priority>"
echo "   </url>"
echo ""
echo "3️⃣  Check nothing is left unfilled, then preview locally:"
echo "   ${GREEN}grep -o '\\[[A-Z][^]]*\\]' ${FILE_PATH}${NC}   # must print nothing"
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
