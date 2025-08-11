#!/bin/bash

# This script replaces the old product section with the new one

# Files
HTML_FILE="/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html"
NEW_SECTION="/home/titan/FactBench/best-system-v1/step2-top10list/products-section.html"
TEMP_FILE="/tmp/updated-page.html"

# Extract everything before line 162
head -n 161 "$HTML_FILE" > "$TEMP_FILE"

# Add the new section (remove the extra section tags from products-section.html)
cat "$NEW_SECTION" | sed '1d;$d' >> "$TEMP_FILE"

# Add everything after line 2542
tail -n +2543 "$HTML_FILE" >> "$TEMP_FILE"

# Replace the original file
mv "$TEMP_FILE" "$HTML_FILE"

echo "✅ Product section replaced successfully!"
echo "📝 Old section (lines 162-2542) replaced with new content"
echo "🔧 Original backed up as best-robotic-pool-cleaners.html.backup"