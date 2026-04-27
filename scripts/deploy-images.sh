#!/bin/bash
# ===================================================
# FactBench VerdIQ - Image Deployment Script
# ===================================================
# Copies images from RADNI_FOLDER/SLIKE to assets/images
# Usage: ./scripts/deploy-images.sh <source> <category> <product>
# Example: ./scripts/deploy-images.sh derila pillows derila-ergo
# ===================================================

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Source and destination base paths
SOURCE_BASE="$PROJECT_DIR/RADNI_FOLDER/SLIKE"
DEST_BASE="$PROJECT_DIR/assets/images"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - Image Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check arguments
if [ $# -lt 3 ]; then
    echo -e "${YELLOW}Usage:${NC} $0 <source-folder> <category> <product-slug>"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 derila pillows derila-ergo"
    echo "  $0 cloudalign pillows cloudalign-mellow-pillow"
    echo "  $0 pool-cleaners pool-cleaners dolphin-premier"
    echo ""
    echo -e "${YELLOW}Available source folders:${NC}"
    ls -1 "$SOURCE_BASE" 2>/dev/null || echo "  (none found)"
    echo ""
    echo -e "${YELLOW}Available categories:${NC}"
    ls -1d "$DEST_BASE"/*/ 2>/dev/null | xargs -n1 basename || echo "  (none found)"
    exit 1
fi

SOURCE_FOLDER="$1"
CATEGORY="$2"
PRODUCT_SLUG="$3"

SOURCE_PATH="$SOURCE_BASE/$SOURCE_FOLDER"
DEST_PATH="$DEST_BASE/$CATEGORY/$PRODUCT_SLUG"

# Validate source exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo -e "${RED}ERROR:${NC} Source folder not found: $SOURCE_PATH"
    echo ""
    echo -e "${YELLOW}Available source folders:${NC}"
    ls -1 "$SOURCE_BASE" 2>/dev/null
    exit 1
fi

# Create destination if needed
if [ ! -d "$DEST_PATH" ]; then
    echo -e "${YELLOW}Creating destination folder:${NC} $DEST_PATH"
    mkdir -p "$DEST_PATH"
fi

echo -e "${GREEN}Source:${NC} $SOURCE_PATH"
echo -e "${GREEN}Destination:${NC} $DEST_PATH"
echo ""

# Count source images
SOURCE_COUNT=$(find "$SOURCE_PATH" -maxdepth 1 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) | wc -l)
echo -e "${YELLOW}Found $SOURCE_COUNT images in source${NC}"
echo ""

# Copy images (exclude Zone.Identifier files from Windows)
echo -e "${GREEN}Copying images...${NC}"
COPIED=0
for img in "$SOURCE_PATH"/*.{png,jpg,jpeg,gif,webp} 2>/dev/null; do
    if [ -f "$img" ] && [[ ! "$img" == *":Zone.Identifier" ]]; then
        filename=$(basename "$img")
        if [ -f "$DEST_PATH/$filename" ]; then
            # Check if files are different
            if ! cmp -s "$img" "$DEST_PATH/$filename"; then
                cp "$img" "$DEST_PATH/"
                echo -e "  ${YELLOW}Updated:${NC} $filename"
                ((COPIED++))
            else
                echo -e "  ${BLUE}Skipped (identical):${NC} $filename"
            fi
        else
            cp "$img" "$DEST_PATH/"
            echo -e "  ${GREEN}Copied:${NC} $filename"
            ((COPIED++))
        fi
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  Images copied/updated: $COPIED"
echo "  Destination: $DEST_PATH"
echo ""

# Show destination contents
echo -e "${YELLOW}Destination folder contents:${NC}"
ls -la "$DEST_PATH"
echo ""

# Show HTML reference format
echo -e "${YELLOW}HTML Reference Format:${NC}"
echo "  https://factbench.github.io/VerdIQ/assets/images/$CATEGORY/$PRODUCT_SLUG/{filename}"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update HTML to reference new images"
echo "  2. git add assets/images/"
echo "  3. git commit -m \"Add: $PRODUCT_SLUG images\""
echo "  4. git push origin main"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
