#!/bin/bash
# ===================================================
# FactBench VerdIQ - Image Validation Script
# ===================================================
# Validates that image files are actually valid images
# Prevents corrupted/fake images from being committed
# Usage: ./scripts/validate-images.sh [path]
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

# Default to assets/images if no path provided
SEARCH_PATH="${1:-$PROJECT_DIR/assets/images}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - Image Validation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Scanning:${NC} $SEARCH_PATH"
echo ""

ERRORS=0
WARNINGS=0
VALID=0
TOTAL=0

# File signature mappings
# PNG: 89 50 4E 47 0D 0A 1A 0A
# JPEG: FF D8 FF
# GIF: 47 49 46 38
# WebP: 52 49 46 46 (RIFF) followed by WEBP

validate_image() {
    local file="$1"
    local extension="${file##*.}"
    extension=$(echo "$extension" | tr '[:upper:]' '[:lower:]')

    # Get file header (first 12 bytes in hex)
    local header=$(xxd -p -l 12 "$file" 2>/dev/null | tr '[:lower:]' '[:upper:]')

    if [ -z "$header" ]; then
        echo -e "  ${RED}ERROR:${NC} Cannot read file: $file"
        return 1
    fi

    local valid=0
    local detected_type=""

    # Check PNG signature: 89504E470D0A1A0A
    if [[ "$header" == 89504E47* ]]; then
        detected_type="PNG"
        if [[ "$extension" == "png" ]]; then
            valid=1
        fi
    fi

    # Check JPEG signature: FFD8FF
    if [[ "$header" == FFD8FF* ]]; then
        detected_type="JPEG"
        if [[ "$extension" == "jpg" || "$extension" == "jpeg" ]]; then
            valid=1
        fi
    fi

    # Check GIF signature: 474946383961 (GIF89a) or 474946383761 (GIF87a)
    if [[ "$header" == 474946383* ]]; then
        detected_type="GIF"
        if [[ "$extension" == "gif" ]]; then
            valid=1
        fi
    fi

    # Check WebP signature: RIFF....WEBP
    if [[ "$header" == 52494646* ]]; then
        local webp_check=$(xxd -p -l 12 "$file" 2>/dev/null | tr '[:lower:]' '[:upper:]')
        if [[ "$webp_check" == *57454250* ]]; then
            detected_type="WebP"
            if [[ "$extension" == "webp" ]]; then
                valid=1
            fi
        fi
    fi

    # Check for HTML/text content (common error - saved error pages)
    if [[ "$header" == 3C21* ]] || [[ "$header" == 3C68746D6C* ]] || [[ "$header" == 3C48544D4C* ]]; then
        detected_type="HTML (ERROR!)"
        valid=0
    fi

    # Check for empty file
    if [ ! -s "$file" ]; then
        detected_type="EMPTY FILE"
        valid=0
    fi

    if [ $valid -eq 1 ]; then
        return 0
    elif [ -n "$detected_type" ]; then
        echo -e "  ${RED}ERROR:${NC} $(basename "$file")"
        echo -e "         Extension: .$extension | Actual content: $detected_type"
        echo -e "         Path: $file"
        return 1
    else
        echo -e "  ${YELLOW}WARNING:${NC} $(basename "$file") - Unknown format"
        echo -e "           Header: $header"
        return 2
    fi
}

# Find all image files
while IFS= read -r -d '' file; do
    ((TOTAL++))
    result=$(validate_image "$file")
    status=$?

    if [ $status -eq 0 ]; then
        ((VALID++))
    elif [ $status -eq 1 ]; then
        ((ERRORS++))
        echo "$result"
    else
        ((WARNINGS++))
        echo "$result"
    fi
done < <(find "$SEARCH_PATH" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -print0 2>/dev/null)

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo "  Total images scanned: $TOTAL"
echo -e "  ${GREEN}Valid:${NC} $VALID"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Errors:${NC} $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}VALIDATION FAILED${NC}"
    echo "Fix the errors above before committing."
    echo ""
    echo -e "${YELLOW}Common Issues:${NC}"
    echo "  - HTML content: File is an error page saved as image"
    echo "  - Extension mismatch: Rename file to match actual format"
    echo "  - Empty file: Replace with actual image"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}VALIDATION PASSED WITH WARNINGS${NC}"
    exit 0
else
    echo -e "${GREEN}VALIDATION PASSED${NC}"
    exit 0
fi
