# FactBench VerdIQ - Review Links Operational Procedures

**Created**: 2025-11-20
**Purpose**: Prevent broken review page links and template placeholder issues

---

## 🚨 Critical Issues Identified

### Issue 1: Template Placeholder Left in Production (2025-11-20)

**Problem**: `{{FULL_REVIEW_URL}}` placeholder found in BeatBot AquaSense 2 Pro product card
**Impact**: "READ REVIEW" button linked to non-existent page
**Root Cause**: Template variable never replaced during content generation

**Symptoms**:
- User reported: "Ni jedan link nakon sto si ti updejtovo str nevodi na review str"
- Clicking "READ REVIEW" led to 404 errors
- URL showed as `href="{{FULL_REVIEW_URL}}"` in HTML source

**Resolution**:
```bash
sed -i 's|{{FULL_REVIEW_URL}}|https://factbench.github.io/VerdIQ/reviews/beatbot-aquasense-2-pro/|g' index.html
```

---

## ✅ Pre-Deployment Validation Checklist

### 1. Template Placeholder Check
```bash
# Run BEFORE every commit to pool cleaners page
cd best-robotic-pool-cleaners
grep -n '{{.*}}' index.html
```

**Expected**: No output (no placeholders)
**If found**: Replace with actual values before committing

### 2. Review Link Validation
```bash
# Extract all review page links
grep -o 'href="https://factbench.github.io/VerdIQ/reviews/[^"]*"' index.html | sort -u

# Compare with actual directories
ls -1 ../reviews/
```

**Expected**: Every href link matches an actual directory

### 3. Review Page Accessibility Check
```bash
# Test all review URLs return 200 OK
for url in $(grep -o 'https://factbench.github.io/VerdIQ/reviews/[^/"]*/' index.html | sort -u); do
  echo -n "$url: "
  curl -s -o /dev/null -w "%{http_code}" "$url"
  echo ""
done
```

**Expected**: All URLs return `200`

### 4. ASIN Validation
```bash
# Check Amazon ASINs are present and valid (format: B0[A-Z0-9]{8})
grep -o 'amazon.com/dp/B0[A-Z0-9]\{8\}' index.html | sort -u
```

**Expected**: All ASINs match format `B0XXXXXXXX` (10 chars total)

---

## 🔧 Standard Operating Procedures

### SOP-001: Updating Amazon Affiliate Links

**Frequency**: As needed when Amazon updates product pages

**Steps**:
1. Identify products to update (WYBOT C2, AIPER Scuba X1, etc.)
2. Get new ASIN from Amazon product page URL
3. Run pre-deployment validation checklist (above)
4. Use `sed` to replace old ASIN with new ASIN:
   ```bash
   sed -i 's|OLD_ASIN|NEW_ASIN|g' index.html
   ```
5. Re-run validation checklist
6. Commit with descriptive message
7. Push to GitHub
8. Wait 2-3 minutes for GitHub Pages rebuild
9. Verify changes on live site

**Validation**: Test actual Amazon links open correct products

### SOP-002: Fixing Review Page Path Mismatches

**Frequency**: When directory names change or new products added

**Steps**:
1. Create comparison script:
   ```bash
   # Extract linked paths
   grep -o "reviews/[^/\"]*" index.html | sed 's|reviews/||' | sort -u > /tmp/linked.txt

   # Get actual directories
   ls -1 ../reviews/ > /tmp/actual.txt

   # Compare
   comm -23 /tmp/linked.txt /tmp/actual.txt  # Links with no directory
   comm -13 /tmp/linked.txt /tmp/actual.txt  # Directories with no link
   ```

2. Fix mismatched paths:
   ```bash
   sed -i 's|reviews/OLD-PATH|reviews/CORRECT-PATH|g' index.html
   ```

3. Verify all paths match
4. Commit and deploy

**Validation**: All review links return 200 OK on live site

### SOP-003: Adding New Product Reviews

**Frequency**: When new pool cleaner reviews are published

**Steps**:
1. Create review directory: `reviews/product-name-slug/`
2. Add review content (index.html)
3. Update main page with product card
4. **CRITICAL**: Replace ALL template placeholders with actual values:
   - `{{FULL_REVIEW_URL}}` → `https://factbench.github.io/VerdIQ/reviews/product-slug/`
   - `{{AMAZON_ASIN}}` → Actual ASIN code
   - `{{PRODUCT_NAME}}` → Actual product name
5. Run full validation checklist
6. Commit and deploy
7. Verify on live site

**Validation**: New product card fully functional with working links

---

## 🐛 Common Issues & Quick Fixes

### Issue: "href=\"undefined\"" in links
**Cause**: JavaScript variable not defined or path resolution failed
**Fix**: Check JavaScript that builds href attributes, ensure all variables defined

### Issue: Links work locally but not on live site
**Cause**: Relative vs absolute URL issue
**Fix**: Use full URLs: `https://factbench.github.io/VerdIQ/reviews/...`

### Issue: GitHub Pages not updating after push
**Cause**: GitHub Pages build delay or failure
**Fix**:
1. Wait 2-3 minutes for rebuild
2. Check GitHub Actions for build status
3. Hard refresh browser (Ctrl+F5)
4. Clear GitHub Pages cache

### Issue: sed replacement breaks minified HTML
**Cause**: Regex pattern too broad or special characters
**Fix**: Use literal string replacement with `|` delimiter:
```bash
sed -i 's|EXACT_OLD_STRING|EXACT_NEW_STRING|g' file.html
```

---

## 📊 Validation Scripts

### Full Pre-Commit Validation
```bash
#!/bin/bash
# Save as: scripts/validate-pool-cleaners.sh

cd best-robotic-pool-cleaners

echo "=== 1. Checking for template placeholders ==="
PLACEHOLDERS=$(grep -c '{{.*}}' index.html)
if [ $PLACEHOLDERS -gt 0 ]; then
  echo "❌ FAIL: Found $PLACEHOLDERS template placeholders!"
  grep -n '{{.*}}' index.html
  exit 1
else
  echo "✅ PASS: No template placeholders"
fi

echo ""
echo "=== 2. Validating review page paths ==="
grep -o "reviews/[^/\"]*" index.html | sed 's|reviews/||' | sort -u > /tmp/linked.txt
ls -1 ../reviews/ > /tmp/actual.txt

MISMATCHED=$(comm -23 /tmp/linked.txt /tmp/actual.txt | wc -l)
if [ $MISMATCHED -gt 0 ]; then
  echo "❌ FAIL: Found $MISMATCHED mismatched paths!"
  comm -23 /tmp/linked.txt /tmp/actual.txt
  exit 1
else
  echo "✅ PASS: All review paths match directories"
fi

echo ""
echo "=== 3. Validating Amazon ASINs ==="
ASINS=$(grep -o 'amazon.com/dp/B0[A-Z0-9]\{8\}' index.html | wc -l)
if [ $ASINS -eq 0 ]; then
  echo "❌ FAIL: No valid Amazon ASINs found!"
  exit 1
else
  echo "✅ PASS: Found $ASINS valid Amazon ASINs"
fi

echo ""
echo "=== All validations passed! ==="
exit 0
```

### Live Site Verification
```bash
#!/bin/bash
# Save as: scripts/verify-live-site.sh

echo "=== Testing live review page URLs ==="

REVIEW_URLS=$(curl -s "https://factbench.github.io/VerdIQ/best-robotic-pool-cleaners/" | \
  grep -o 'https://factbench.github.io/VerdIQ/reviews/[^/"]*/' | sort -u)

TOTAL=0
WORKING=0
BROKEN=0

for url in $REVIEW_URLS; do
  TOTAL=$((TOTAL + 1))
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  PRODUCT=$(echo $url | sed 's|https://factbench.github.io/VerdIQ/reviews/||' | sed 's|/||')

  if [ "$STATUS" == "200" ]; then
    echo "✅ $PRODUCT: $STATUS"
    WORKING=$((WORKING + 1))
  else
    echo "❌ $PRODUCT: $STATUS"
    BROKEN=$((BROKEN + 1))
  fi
done

echo ""
echo "=== Summary ==="
echo "Total: $TOTAL"
echo "Working: $WORKING"
echo "Broken: $BROKEN"

if [ $BROKEN -gt 0 ]; then
  exit 1
fi
```

---

## 🔄 Git Workflow for Pool Cleaners Page

### Standard Update Flow
```bash
# 1. Start in project root
cd /home/titan/projects/FactBenchV2

# 2. Create feature branch
git checkout -b fix/update-pool-cleaners-links

# 3. Make changes
cd best-robotic-pool-cleaners
# ... edit index.html ...

# 4. Run validation
cd ..
bash scripts/validate-pool-cleaners.sh

# 5. Commit if validation passes
git add best-robotic-pool-cleaners/index.html
git commit -m "Fix: Update pool cleaner review links"

# 6. Push to GitHub
git push origin fix/update-pool-cleaners-links

# 7. Verify live site (wait 2-3 min)
bash scripts/verify-live-site.sh
```

---

## 📝 Documentation Standards

### Commit Message Format
```
Type: Brief description (max 50 chars)

**Problem**: [What issue was being addressed]
**Root Cause**: [Why the issue occurred]
**Solution**: [How the issue was fixed]
**Verification**: [How the fix was tested]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Issue Types
- `Fix:` - Bug fixes
- `Update:` - Content or data updates
- `Feature:` - New functionality
- `Refactor:` - Code restructuring
- `Docs:` - Documentation changes

---

## 🎯 Key Takeaways

1. **Always validate before committing** - Run validation scripts
2. **Never leave template placeholders** - Search for `{{.*}}` before deploy
3. **Test review links on live site** - Don't trust local testing alone
4. **Use full URLs** - Absolute paths prevent resolution issues
5. **Document all changes** - Clear commit messages help future debugging

---

**Last Updated**: 2025-11-20
**Next Review**: When new product added or major template changes
