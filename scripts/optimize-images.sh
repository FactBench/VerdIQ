#!/bin/bash
# ===================================================
# FactBench VerdIQ - Image Optimization
# ===================================================
# Optimizes images for web performance
# Requires: imagemagick (sudo apt install imagemagick)
# ===================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - Image Optimization${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: imagemagick not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  ${GREEN}sudo apt update && sudo apt install imagemagick${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ imagemagick found${NC}"
echo ""

# Configuration
MAX_WIDTH=1920
QUALITY=85
IMAGE_DIR="assets/images"

if [ ! -d "$IMAGE_DIR" ]; then
    echo -e "${YELLOW}⚠️  Directory $IMAGE_DIR not found${NC}"
    echo "Creating directory..."
    mkdir -p "$IMAGE_DIR"
fi

# Count images
TOTAL_IMAGES=$(find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) 2>/dev/null | wc -l)

if [ "$TOTAL_IMAGES" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No images found in $IMAGE_DIR${NC}"
    echo ""
    echo "Add images to:"
    echo "  $IMAGE_DIR/"
    echo ""
    echo "Supported formats: JPG, JPEG, PNG"
    exit 0
fi

echo -e "${BLUE}📸 Found $TOTAL_IMAGES images${NC}"
echo -e "${YELLOW}Settings:${NC}"
echo "  • Max width: ${MAX_WIDTH}px"
echo "  • Quality: ${QUALITY}%"
echo "  • Directory: $IMAGE_DIR"
echo ""

read -p "$(echo -e ${YELLOW}Optimize these images? [y/N]: ${NC})" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Optimization cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔧 Optimizing images...${NC}"
echo ""

# Create backup directory
BACKUP_DIR="${IMAGE_DIR}/backups-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}💾 Backup directory: $BACKUP_DIR${NC}"
echo ""

COUNTER=0
find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read img; do
    COUNTER=$((COUNTER + 1))
    FILENAME=$(basename "$img")

    # Get original size
    ORIG_SIZE=$(du -h "$img" | cut -f1)

    # Backup original
    cp "$img" "$BACKUP_DIR/"

    # Optimize
    echo -ne "${YELLOW}[$COUNTER/$TOTAL_IMAGES]${NC} $FILENAME ($ORIG_SIZE) ... "

    convert "$img" \
        -resize "${MAX_WIDTH}x${MAX_WIDTH}>" \
        -quality $QUALITY \
        -strip \
        "$img"

    # Get new size
    NEW_SIZE=$(du -h "$img" | cut -f1)

    echo -e "${GREEN}✅ $NEW_SIZE${NC}"
done

echo ""
echo -e "${GREEN}✅ Optimization complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Summary:${NC}"
echo "  • Images processed: $TOTAL_IMAGES"
echo "  • Backup location: $BACKUP_DIR"
echo "  • Settings: ${MAX_WIDTH}px max, ${QUALITY}% quality"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "  1. Check optimized images in browser"
echo "  2. If satisfied: Delete backup (rm -r $BACKUP_DIR)"
echo "  3. If issues: Restore from backup (cp $BACKUP_DIR/* $IMAGE_DIR/)"
echo ""
