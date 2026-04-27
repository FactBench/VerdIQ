#!/bin/bash
# FactBench VerdIQ - Live Site Verification
# Test all review page URLs on production site

set -e

echo "======================================="
echo "🌐 Live Site Review Links Verification"
echo "======================================="
echo ""

SITE_URL="https://factbench.github.io/VerdIQ/best-robotic-pool-cleaners/"

echo "Fetching live page: $SITE_URL"
PAGE_CONTENT=$(curl -s "$SITE_URL")

if [ -z "$PAGE_CONTENT" ]; then
  echo "❌ FAIL: Could not fetch live page"
  exit 1
fi

echo "✅ Page fetched successfully"
echo ""

# Check for template placeholders on live site
# Strip <template>...</template> blocks first — placeholders inside HTML5
# <template> tags are legitimate (used by JS for client-side rendering) and
# not visible to end users, so they should not trigger an alarm.
echo "=== 1. Checking for template placeholders on live site ==="
VISIBLE_CONTENT=$(echo "$PAGE_CONTENT" | python -c "import sys,re; print(re.sub(r'<template[^>]*>.*?</template>','',sys.stdin.read(),flags=re.DOTALL))")
PLACEHOLDERS=$(echo "$VISIBLE_CONTENT" | grep -c '{{.*}}' || true)
if [ $PLACEHOLDERS -gt 0 ]; then
  echo "❌ FAIL: Found $PLACEHOLDERS template placeholders on LIVE SITE (outside <template> blocks)!"
  echo ""
  echo "Placeholders found:"
  echo "$VISIBLE_CONTENT" | grep -o '{{[^}]*}}' | head -5
  echo ""
  echo "⚠️  CRITICAL: Template variables exposed in production!"
  exit 1
else
  echo "✅ PASS: No template placeholders visible on live site"
fi

echo ""

# Extract and test all review URLs
echo "=== 2. Testing all review page URLs ==="

REVIEW_URLS=$(echo "$PAGE_CONTENT" | grep -o 'https://factbench.github.io/VerdIQ/reviews/[^/"]*/' | sort -u)

if [ -z "$REVIEW_URLS" ]; then
  echo "❌ FAIL: No review URLs found on page"
  exit 1
fi

TOTAL=0
WORKING=0
BROKEN=0

while IFS= read -r url; do
  if [ -z "$url" ]; then
    continue
  fi

  TOTAL=$((TOTAL + 1))
  PRODUCT=$(echo "$url" | sed 's|https://factbench.github.io/VerdIQ/reviews/||' | sed 's|/||')

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$STATUS" == "200" ]; then
    echo "✅ $PRODUCT: HTTP $STATUS"
    WORKING=$((WORKING + 1))
  else
    echo "❌ $PRODUCT: HTTP $STATUS"
    BROKEN=$((BROKEN + 1))
  fi
done <<< "$REVIEW_URLS"

echo ""
echo "=== 3. Testing Amazon affiliate links ==="

# Test a few Amazon links (don't test all to avoid rate limiting)
AMAZON_LINKS=$(echo "$PAGE_CONTENT" | grep -o 'https://www.amazon.com/dp/B0[A-Z0-9]\{8\}?tag=factbench-r-20' | head -3)

if [ -z "$AMAZON_LINKS" ]; then
  echo "⚠️  WARNING: No Amazon affiliate links found with tracking tag"
else
  echo "Testing sample Amazon links..."
  AMAZON_OK=0
  AMAZON_TESTED=0

  while IFS= read -r url; do
    if [ -z "$url" ]; then
      continue
    fi

    AMAZON_TESTED=$((AMAZON_TESTED + 1))
    ASIN=$(echo "$url" | grep -o 'B0[A-Z0-9]\{8\}')

    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$STATUS" == "200" ] || [ "$STATUS" == "301" ] || [ "$STATUS" == "302" ]; then
      echo "✅ Amazon ASIN $ASIN: HTTP $STATUS"
      AMAZON_OK=$((AMAZON_OK + 1))
    else
      echo "❌ Amazon ASIN $ASIN: HTTP $STATUS"
    fi
  done <<< "$AMAZON_LINKS"

  if [ $AMAZON_OK -eq $AMAZON_TESTED ]; then
    echo "✅ PASS: All tested Amazon links accessible"
  fi
fi

echo ""
echo "======================================="
echo "📊 Summary"
echo "======================================="
echo "Review Pages Tested: $TOTAL"
echo "Working (200 OK): $WORKING"
echo "Broken: $BROKEN"
echo ""

if [ $BROKEN -gt 0 ]; then
  echo "❌ FAIL: $BROKEN review page(s) are broken!"
  echo ""
  echo "ACTION REQUIRED: Fix broken review page links"
  exit 1
fi

if [ $TOTAL -eq 0 ]; then
  echo "❌ FAIL: No review pages found to test!"
  exit 1
fi

echo "✅ SUCCESS: All $TOTAL review pages are accessible!"
echo ""
echo "Live site is healthy ✨"
exit 0
