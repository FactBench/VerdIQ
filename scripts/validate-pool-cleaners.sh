#!/bin/bash
# FactBench VerdIQ - Pool Cleaners Page Validation
# Run before every commit to pool cleaners page

set -e

cd best-robotic-pool-cleaners

echo "==================================="
echo "🔍 Pool Cleaners Page Validation"
echo "==================================="
echo ""

# Test 1: Critical Review Link Placeholders
echo "=== 1. Checking for critical review link placeholders ==="
# Check for FULL_REVIEW_URL placeholder (critical bug)
REVIEW_PLACEHOLDERS=$(grep -c '{{FULL_REVIEW_URL}}' index.html || true)
if [ $REVIEW_PLACEHOLDERS -gt 0 ]; then
  echo "❌ FAIL: Found $REVIEW_PLACEHOLDERS {{FULL_REVIEW_URL}} placeholders!"
  echo ""
  echo "Placeholders found:"
  grep -n '{{FULL_REVIEW_URL}}' index.html || true
  echo ""
  echo "ACTION REQUIRED: Replace {{FULL_REVIEW_URL}} with actual review page URLs"
  exit 1
else
  echo "✅ PASS: No {{FULL_REVIEW_URL}} placeholders found"
fi

# Check for undefined hrefs (another critical bug)
UNDEFINED_LINKS=$(grep -c 'href="undefined"' index.html || true)
if [ $UNDEFINED_LINKS -gt 0 ]; then
  echo "❌ FAIL: Found $UNDEFINED_LINKS undefined href links!"
  echo ""
  echo "ACTION REQUIRED: Replace href=\"undefined\" with actual review URLs"
  exit 1
else
  echo "✅ PASS: No undefined href links found"
fi

echo ""

# Test 2: Review Page Paths
echo "=== 2. Validating review page paths ==="
grep -o "reviews/[^/\"]*" index.html | sed 's|reviews/||' | sort -u > /tmp/linked.txt
ls -1 ../reviews/ > /tmp/actual.txt

MISMATCHED=$(comm -23 /tmp/linked.txt /tmp/actual.txt | wc -l)
if [ $MISMATCHED -gt 0 ]; then
  echo "❌ FAIL: Found $MISMATCHED mismatched review paths!"
  echo ""
  echo "Links in HTML but no matching directory:"
  comm -23 /tmp/linked.txt /tmp/actual.txt
  echo ""
  echo "ACTION REQUIRED: Update review links to match actual directory names"
  exit 1
else
  echo "✅ PASS: All $(wc -l < /tmp/linked.txt) review paths match directories"
fi

echo ""

# Test 3: Amazon ASINs
echo "=== 3. Validating Amazon ASINs ==="
ASINS=$(grep -o 'amazon.com/dp/B0[A-Z0-9]\{8\}' index.html | wc -l)
if [ $ASINS -eq 0 ]; then
  echo "❌ FAIL: No valid Amazon ASINs found!"
  echo ""
  echo "ACTION REQUIRED: Ensure Amazon product links have valid ASINs (B0XXXXXXXX format)"
  exit 1
else
  echo "✅ PASS: Found $ASINS valid Amazon ASINs"
  echo ""
  echo "ASINs in use:"
  grep -o 'amazon.com/dp/B0[A-Z0-9]\{8\}' index.html | sed 's|amazon.com/dp/||' | sort -u | head -10
fi

echo ""

# Test 4: Tracking Tags
echo "=== 4. Validating Amazon tracking tags ==="
TAGGED_LINKS=$(grep -c '?tag=factbench-r-20' index.html || true)
if [ $TAGGED_LINKS -eq 0 ]; then
  echo "⚠️  WARNING: No Amazon links with tracking tag found"
  echo ""
  echo "ACTION RECOMMENDED: Add ?tag=factbench-r-20 to Amazon product links"
else
  echo "✅ PASS: Found $TAGGED_LINKS links with tracking tag"
fi

echo ""
echo "==================================="
echo "✅ All critical validations passed!"
echo "==================================="
echo ""
echo "Safe to commit and push changes."
exit 0
