# Quick Start - Next Session

## 🎯 Where We Left Off

**Status**: All review link fixes deployed to GitHub, waiting for live verification

**What Was Fixed**:
- 1 template placeholder (`{{FULL_REVIEW_URL}}`)
- 22 undefined hrefs in comparison table
- Total: 23 broken review links → All fixed ✅

**What Was Created**:
- Operational procedures documentation
- Pre-commit validation script
- Live site verification script

---

## ⚡ First Actions Next Session

### 1. Verify Live Deployment (2-3 min wait needed)
```bash
cd /home/titan/projects/FactBenchV2
bash scripts/verify-live-site.sh
```

**Expected Output**:
```
✅ BeatBot AquaSense 2 Pro: HTTP 200
✅ Dolphin Nautilus CC Plus Wi-Fi: HTTP 200
✅ AIPER Scuba S1 Cordless: HTTP 200
... (all 11 products should return 200)
```

### 2. If All Links Work
- ✅ Task complete!
- Update user: "All review links verified working on live site"
- Ready for next FactBench task

### 3. If Any Links Fail
- Check GitHub Actions for build errors
- Verify GitHub Pages deployment settings
- Re-run local validation: `bash scripts/validate-pool-cleaners.sh`
- Investigate specific failing URLs

---

## 📋 Project Context

### User Profile
- **Language**: Serbian + English technical terms
- **Expectations**: Investigate → Solve → Document
- **Quality Standards**: Prevention systems, not just fixes

### FactBench VerdIQ Structure
```
FactBenchV2/
├── best-robotic-pool-cleaners/
│   └── index.html (main comparison page)
├── reviews/
│   ├── beatbot-aquasense-2-pro/
│   ├── dolphin-nautilus-cc-plus-wi-fi/
│   ├── aiper-scuba-s1/
│   └── ... (11 total products)
├── scripts/
│   ├── validate-pool-cleaners.sh (pre-commit)
│   └── verify-live-site.sh (post-deploy)
└── OPERATIONAL_PROCEDURES_REVIEW_LINKS.md
```

### Key Files
- **Main Page**: `best-robotic-pool-cleaners/index.html`
- **Review Pages**: `reviews/{product-slug}/index.html`
- **Documentation**: `OPERATIONAL_PROCEDURES_REVIEW_LINKS.md`

---

## 🔧 Validation Commands

### Before Any Commit
```bash
cd /home/titan/projects/FactBenchV2
bash scripts/validate-pool-cleaners.sh
```

### After GitHub Deploy
```bash
bash scripts/verify-live-site.sh
```

### Manual Checks
```bash
# Check for template placeholders
cd best-robotic-pool-cleaners
grep '{{FULL_REVIEW_URL}}' index.html
grep 'href="undefined"' index.html

# Both should return nothing
```

---

## 🚨 Known Issues to Watch

### Template Placeholder Types
**LEGITIMATE** (don't remove):
- `{{PRODUCT_NAME}}`, `{{RANK}}`, `{{IMAGE_URL}}`, `{{PRICE}}`

**BUGS** (must fix):
- `{{FULL_REVIEW_URL}}` → Replace with actual URL
- `href="undefined"` → Replace with actual URL

### Common Problems
1. **GitHub Pages Cache**: Hard refresh (Ctrl+F5) if changes not visible
2. **Build Delays**: Wait 2-3 minutes after push for rebuild
3. **Minified HTML**: Use Python for context extraction, not grep

### Image Path Issues (WSL)
**Problem**: User provides Windows WSL path like `\\wsl$\Ubuntu\home\titan\...`
**Solution**: Convert to Linux path `/home/titan/...` and use image workflow

**Quick Reference**:
```bash
# Convert: \\wsl$\Ubuntu\home\titan\... → /home/titan/...

# Deploy images from working folder to production
./scripts/deploy-images.sh {source} {category} {product}
# Example: ./scripts/deploy-images.sh derila pillows derila-ergo

# Full documentation: docs/IMAGE-WORKFLOW.md
```

**Image Folders**:
- Working: `RADNI_FOLDER/SLIKE/{product}/`
- Production: `assets/images/{category}/{product}/`

---

## 📞 User Communication

### User Prefers
- Clear status updates
- Root cause explanations
- Prevention systems
- Documentation of solutions

### User Dislikes
- Patches without investigation
- Missing documentation
- No validation/verification
- Unclear next steps

---

## 🎯 Session Goals Template

For any new FactBench task:
1. **ISTRAZI** (Investigate): Understand root cause
2. **RIJESI** (Solve): Fix the issue completely
3. **DOKUMENTUJ** (Document): Create prevention systems

Always include:
- Validation scripts
- Operational procedures
- Live site verification

---

**Last Updated**: 2025-12-01
**Next Session**: Image workflow documented, ready for new tasks
