# Image Workflow - FactBench VerdIQ

## Quick Reference

### Path Conversion (WSL Windows → Linux)
```
WINDOWS:  \\wsl$\Ubuntu\home\titan\projects\FactBenchV2\RADNI_FOLDER\SLIKE\derila\Screenshot_162.png
LINUX:    /home/titan/projects/FactBenchV2/RADNI_FOLDER/SLIKE/derila/Screenshot_162.png
```

**Rule**: Replace `\\wsl$\Ubuntu` with nothing, then convert `\` to `/`

---

## Folder Structure

### Source Images (Working Folder)
```
RADNI_FOLDER/SLIKE/
├── derila/              # Derila Ergo pillow images
├── cloudalign/          # CloudAlign pillow images
├── pool-cleaners/       # Pool cleaner images
└── {product-name}/      # Other product images
```

### Production Images (Web Deployed)
```
assets/images/
├── pillows/
│   ├── derila-ergo/          # Derila Ergo production images
│   │   ├── Screenshot_159.png
│   │   ├── Screenshot_160.png
│   │   └── ...
│   ├── cloudalign-mellow-pillow/
│   └── derila-ergo-hero.png  # Hero images at category level
├── pool-cleaners/
├── bidet-attachments/
├── mattresses/
├── hand-trucks/
└── pressure-washers/
```

---

## Image Deployment Workflow

### Step 1: Place Source Images
Put raw images in working folder:
```bash
# Example for new product
mkdir -p RADNI_FOLDER/SLIKE/{product-name}/
# Copy/download images there
```

### Step 2: Copy to Production Folder
```bash
# Create production folder if needed
mkdir -p assets/images/{category}/{product-slug}/

# Copy images
cp RADNI_FOLDER/SLIKE/{source}/*.{png,jpg} assets/images/{category}/{product-slug}/
```

### Step 3: Reference in HTML
Use **full GitHub Pages URL**:
```html
<img src="https://factbench.github.io/VerdIQ/assets/images/pillows/derila-ergo/Screenshot_162.png" alt="Description">
```

### Step 4: Deploy
```bash
git add assets/images/
git commit -m "Add: {product} images"
git push origin main
```

---

## Category Mapping

| Product Type | Source Folder | Production Folder |
|--------------|---------------|-------------------|
| Pillows | `SLIKE/derila/`, `SLIKE/cloudalign/` | `assets/images/pillows/` |
| Pool Cleaners | `SLIKE/pool-cleaners/` | `assets/images/pool-cleaners/` |
| Bidets | `SLIKE/bidets/` | `assets/images/bidet-attachments/` |
| Mattresses | `SLIKE/mattresses/` | `assets/images/mattresses/` |
| Hand Trucks | `SLIKE/hand-trucks/` | `assets/images/hand-trucks/` |
| Pressure Washers | `SLIKE/pressure-washers/` | `assets/images/pressure-washers/` |

---

## Helper Script Usage

### Deploy Images for a Product
```bash
./scripts/deploy-images.sh {source-folder} {category} {product-slug}

# Examples:
./scripts/deploy-images.sh derila pillows derila-ergo
./scripts/deploy-images.sh cloudalign pillows cloudalign-mellow-pillow
```

---

## HTML Reference Formats

### Full URL (Recommended)
```html
src="https://factbench.github.io/VerdIQ/assets/images/{category}/{product}/{filename}"
```

### Relative Path (From Review Page)
```html
src="../../assets/images/{category}/{product}/{filename}"
```

---

## Common Mistakes to Avoid

### 1. Using Windows Paths in HTML
```html
<!-- WRONG - Windows path won't work -->
<img src="\\wsl$\Ubuntu\home\titan\projects\FactBenchV2\RADNI_FOLDER\SLIKE\derila\image.png">

<!-- CORRECT - Web URL -->
<img src="https://factbench.github.io/VerdIQ/assets/images/pillows/derila-ergo/image.png">
```

### 2. Referencing RADNI_FOLDER
```html
<!-- WRONG - RADNI_FOLDER is not deployed -->
<img src="/RADNI_FOLDER/SLIKE/derila/image.png">

<!-- CORRECT - Use assets/ folder -->
<img src="https://factbench.github.io/VerdIQ/assets/images/pillows/derila-ergo/image.png">
```

### 3. Forgetting to Copy Images
```bash
# WRONG - Images only in working folder
ls RADNI_FOLDER/SLIKE/derila/  # Has images
ls assets/images/pillows/derila-ergo/  # Empty!

# CORRECT - Images copied to production
cp RADNI_FOLDER/SLIKE/derila/*.png assets/images/pillows/derila-ergo/
```

### 4. Wrong Relative Paths
```html
<!-- WRONG - Missing directory levels -->
<img src="../assets/images/...">

<!-- CORRECT - From reviews/{product}/index.html -->
<img src="../../assets/images/...">
```

---

## Troubleshooting

### Image Not Loading (404 Error)

1. **Check if image exists in production folder**:
   ```bash
   ls assets/images/{category}/{product}/
   ```

2. **Verify HTML path matches file location**:
   ```bash
   # Extract image paths from HTML
   grep -o 'src="[^"]*"' reviews/{product}/index.html | head -5
   ```

3. **Check if pushed to GitHub**:
   ```bash
   git status
   # If images show as untracked, add and push them
   ```

### Path Conversion Quick Reference

| Windows Path Component | Linux Equivalent |
|------------------------|------------------|
| `\\wsl$\Ubuntu` | (remove) |
| `\` | `/` |
| `C:\Users\...` | Not accessible from WSL |

**Example Conversion**:
```
\\wsl$\Ubuntu\home\titan\projects\FactBenchV2\RADNI_FOLDER\SLIKE\derila\Screenshot_162.png
                ↓ (conversion)
/home/titan/projects/FactBenchV2/RADNI_FOLDER/SLIKE/derila/Screenshot_162.png
```

---

## Verification Commands

### Check Production Images
```bash
# List all images for a product
ls -la assets/images/{category}/{product}/

# Count images
ls assets/images/{category}/{product}/ | wc -l
```

### Compare Source vs Production
```bash
# Show what's in source but not in production
diff <(ls RADNI_FOLDER/SLIKE/{source}/) <(ls assets/images/{category}/{product}/)
```

### Find Missing Images in HTML
```bash
# Extract all image references from HTML
grep -oP 'src="[^"]*\.(png|jpg|jpeg|gif|webp)"' reviews/{product}/index.html | sort -u
```

---

## Quick Cheat Sheet

```bash
# 1. Convert Windows path to Linux
#    \\wsl$\Ubuntu\home\titan\... → /home/titan/...

# 2. Copy images to production
cp RADNI_FOLDER/SLIKE/{source}/*.{png,jpg} assets/images/{category}/{product}/

# 3. Use in HTML
# https://factbench.github.io/VerdIQ/assets/images/{category}/{product}/{filename}

# 4. Deploy
git add assets/images/ && git commit -m "Add images" && git push
```

---

## Image Validation (CRITICAL)

### Pre-Commit Validation
**ALWAYS run before committing images:**
```bash
./scripts/validate-images.sh
```

This script checks:
- File headers match extensions (prevents fake images)
- No HTML error pages saved as images
- No empty files
- Correct format detection

### Common Problems Detected

| Error Type | Cause | Solution |
|------------|-------|----------|
| HTML content | 403 Forbidden saved as .png | Re-download image properly |
| Extension mismatch | JPEG saved as .png | Rename to correct extension |
| Empty file | Download failed | Re-download image |

### Root Cause of Recurring Issues

**Problem Pattern**: Images downloaded from protected URLs return error pages that get saved as image files.

**Prevention**:
1. Always verify image opens in viewer before copying
2. Run `file <image.png>` to check actual content type
3. Run validation script before every commit

### Image Manifest System

Each product folder should have a `MANIFEST.json`:
```json
{
  "product": "derila-ergo",
  "category": "pillows",
  "images": {
    "hero": { "file": "../derila-ergo-hero.png" },
    "main": [...]
  },
  "htmlReferences": [...]
}
```

---

**Last Updated**: 2025-12-01
**Maintained By**: Claude Code Sessions
