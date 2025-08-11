#!/bin/bash

# This script replaces the current section with the original template design

# Files
HTML_FILE="/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html"
NEW_SECTION="/home/titan/FactBench/best-system-v1/step2-top10list/products-section-original.html"
TEMP_FILE="/tmp/updated-page-original.html"

# Find where the products section starts and ends
START_LINE=$(grep -n "<!-- Products Grid -->" "$HTML_FILE" | cut -d: -f1)
END_LINE=$(grep -n "<!-- Comparison Table -->" "$HTML_FILE" | cut -d: -f1)

# Extract everything before the products section
head -n $((START_LINE - 1)) "$HTML_FILE" > "$TEMP_FILE"

# Add the new section (already includes section tags)
cat "$NEW_SECTION" >> "$TEMP_FILE"

# Add everything after the products section
tail -n +$END_LINE "$HTML_FILE" >> "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$HTML_FILE"

echo "✅ Product section replaced with original template design!"
echo "📝 Section from line $START_LINE to $((END_LINE - 1)) replaced"
echo "🎨 Original card design with glow-hover effects restored"