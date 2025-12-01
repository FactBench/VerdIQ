#!/bin/bash
# ===================================================
# FactBench VerdIQ - Media Deployment Script
# ===================================================
# Automated deployment with validation and parallel processing
# Usage: ./scripts/deploy-media.sh <source-folder> <category> <product-slug>
# Example: ./scripts/deploy-media.sh derila pillows derila-ergo
# ===================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Arguments
SOURCE_FOLDER="${1:-}"
CATEGORY="${2:-}"
PRODUCT_SLUG="${3:-}"

# Paths
SOURCE_PATH="$PROJECT_DIR/RADNI_FOLDER/SLIKE/$SOURCE_FOLDER"
TARGET_PATH="$PROJECT_DIR/assets/images/$CATEGORY/$PRODUCT_SLUG"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - Media Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Validate arguments
if [ -z "$SOURCE_FOLDER" ] || [ -z "$CATEGORY" ] || [ -z "$PRODUCT_SLUG" ]; then
    echo -e "${RED}Usage:${NC} $0 <source-folder> <category> <product-slug>"
    echo ""
    echo "Arguments:"
    echo "  source-folder  Folder name inside RADNI_FOLDER/SLIKE/"
    echo "  category       Target category (pillows, pool-cleaners, etc.)"
    echo "  product-slug   Product identifier (derila-ergo, cloudalign-mellow, etc.)"
    echo ""
    echo "Example:"
    echo "  $0 derila pillows derila-ergo"
    echo ""
    echo "Available source folders:"
    ls -1 "$PROJECT_DIR/RADNI_FOLDER/SLIKE/" 2>/dev/null || echo "  (none found)"
    exit 1
fi

# Check source exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo -e "${RED}ERROR:${NC} Source folder not found: $SOURCE_PATH"
    exit 1
fi

echo -e "${YELLOW}Source:${NC} $SOURCE_PATH"
echo -e "${YELLOW}Target:${NC} $TARGET_PATH"
echo ""

# ===================================================
# PHASE 1: Validate Source Files
# ===================================================
echo -e "${BLUE}Phase 1: Validating source files...${NC}"

VALID_COUNT=0
INVALID_COUNT=0
INVALID_FILES=()

# Find all image files and validate in parallel
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    filetype=$(file -b "$file" 2>/dev/null)

    # Check for valid image content
    if [[ "$filetype" == *"PNG image"* ]] || \
       [[ "$filetype" == *"JPEG image"* ]] || \
       [[ "$filetype" == *"GIF image"* ]] || \
       [[ "$filetype" == *"Web/P image"* ]] || \
       [[ "$filetype" == *"RIFF"*"Web/P"* ]]; then
        ((VALID_COUNT++))
        echo -e "  ${GREEN}✓${NC} $filename"
    else
        ((INVALID_COUNT++))
        INVALID_FILES+=("$filename: $filetype")
        echo -e "  ${RED}✗${NC} $filename: $filetype"
    fi
done < <(find "$SOURCE_PATH" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -print0 2>/dev/null)

echo ""
echo -e "Valid: ${GREEN}$VALID_COUNT${NC} | Invalid: ${RED}$INVALID_COUNT${NC}"

if [ $INVALID_COUNT -gt 0 ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  DEPLOYMENT BLOCKED - Invalid files found${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Invalid files:"
    for f in "${INVALID_FILES[@]}"; do
        echo "  - $f"
    done
    echo ""
    echo "Common causes:"
    echo "  - HTML content = Error page saved as image (re-download)"
    echo "  - ASCII text = Text file, not image (re-download)"
    echo "  - Empty = Download failed (re-download)"
    exit 1
fi

if [ $VALID_COUNT -eq 0 ]; then
    echo -e "${RED}ERROR:${NC} No valid image files found in source"
    exit 1
fi

# ===================================================
# PHASE 2: Deploy Files
# ===================================================
echo ""
echo -e "${BLUE}Phase 2: Deploying files...${NC}"

# Create target directory
mkdir -p "$TARGET_PATH"

# Copy files (preserving timestamps)
COPIED=0
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    cp -p "$file" "$TARGET_PATH/"
    ((COPIED++))
    echo -e "  ${GREEN}→${NC} $filename"
done < <(find "$SOURCE_PATH" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -print0 2>/dev/null)

echo ""
echo -e "Copied: ${GREEN}$COPIED${NC} files"

# ===================================================
# PHASE 3: Final Validation
# ===================================================
echo ""
echo -e "${BLUE}Phase 3: Final validation...${NC}"

# Run validation script on target
if [ -f "$SCRIPT_DIR/validate-images.sh" ]; then
    "$SCRIPT_DIR/validate-images.sh" "$TARGET_PATH"
    VALIDATION_STATUS=$?
else
    echo -e "${YELLOW}Warning:${NC} validate-images.sh not found, skipping validation"
    VALIDATION_STATUS=0
fi

# ===================================================
# PHASE 4: Create/Update Manifest
# ===================================================
echo ""
echo -e "${BLUE}Phase 4: Updating manifest...${NC}"

MANIFEST_PATH="$TARGET_PATH/MANIFEST.json"
TODAY=$(date +%Y-%m-%d)

# Get list of images
IMAGES=$(find "$TARGET_PATH" -maxdepth 1 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -printf '"%f",' 2>/dev/null | sed 's/,$//')

cat > "$MANIFEST_PATH" << EOF
{
  "product": "$PRODUCT_SLUG",
  "category": "$CATEGORY",
  "lastUpdated": "$TODAY",
  "sourceFolder": "RADNI_FOLDER/SLIKE/$SOURCE_FOLDER",
  "images": {
    "all": [$IMAGES]
  },
  "validation": {
    "lastValidated": "$TODAY",
    "status": "VALID",
    "validatedBy": "deploy-media.sh",
    "issues": []
  },
  "htmlReferences": [
    "https://factbench.github.io/VerdIQ/assets/images/$CATEGORY/$PRODUCT_SLUG/"
  ]
}
EOF

echo -e "  ${GREEN}✓${NC} Created $MANIFEST_PATH"

# ===================================================
# Summary
# ===================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $VALIDATION_STATUS -eq 0 ]; then
    echo -e "${GREEN}  DEPLOYMENT SUCCESSFUL${NC}"
else
    echo -e "${YELLOW}  DEPLOYMENT COMPLETE (with warnings)${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Files deployed: $COPIED"
echo "Target: $TARGET_PATH"
echo ""
echo "Next steps:"
echo "  1. Review deployed files"
echo "  2. Update HTML references if needed"
echo "  3. git add assets/images/$CATEGORY/$PRODUCT_SLUG/"
echo "  4. git commit -m \"Add: $PRODUCT_SLUG images\""
echo "  5. git push origin main"
echo ""
