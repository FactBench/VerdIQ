# FactBench VerdIQ - Project Rules

## CRITICAL: Media Asset Handling

**This project has recurring image corruption issues. These rules are MANDATORY.**

### Before ANY Image/Video Operation

1. **NEVER download directly to `assets/`** - Use `RADNI_FOLDER/SLIKE/` first
2. **ALWAYS verify file integrity** before copying to assets:
   ```bash
   file /path/to/image.png  # Must show "PNG image data", not "HTML document"
   ```
3. **ALWAYS run validation** before committing:
   ```bash
   ./scripts/validate-images.sh
   ```

### Root Cause of Recurring Problems

Images downloaded from protected URLs often return error pages (403 Forbidden, 404 Not Found) that get saved as .png/.jpg files. These look like images by extension but contain HTML.

**Detection**: File shows "HTML document" or "ASCII text" instead of image format
**Prevention**: Always verify with `file` command before deploying

### Media Deployment Workflow

Use the slash command for full expert workflow:
```
/media-deploy
```

Or manually:
1. Place source images in `RADNI_FOLDER/SLIKE/{product}/`
2. Verify each file: `file RADNI_FOLDER/SLIKE/{product}/*.{png,jpg}`
3. Run: `./scripts/deploy-media.sh {source} {category} {product-slug}`
4. Validate: `./scripts/validate-images.sh`
5. Update manifest if needed
6. Commit with descriptive message

### Path Reference

| Type | Path |
|------|------|
| Source (working) | `RADNI_FOLDER/SLIKE/{product}/` |
| Production | `assets/images/{category}/{product-slug}/` |
| Hero images | `assets/images/{category}/{product-slug}-hero.{ext}` |
| HTML reference | `https://factbench.github.io/VerdIQ/assets/images/...` |

### Image Validation Script

```bash
# Pre-commit validation (MANDATORY)
./scripts/validate-images.sh

# Check specific directory
./scripts/validate-images.sh assets/images/pillows/

# Check single file
file assets/images/pillows/derila-ergo-hero.png
```

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| HTML saved as image | `file` shows "HTML document" | Re-download properly, verify before copying |
| Extension mismatch | JPEG saved as .png | Rename to correct extension |
| Empty file | 0 bytes | Re-download |
| Wrong path in HTML | 404 on site | Check assets/ path matches HTML src |

### Quick Verification Commands

```bash
# Check all images are valid
./scripts/validate-images.sh

# Verify specific image
file assets/images/pillows/derila-ergo-hero.png
xxd -l 16 assets/images/pillows/derila-ergo-hero.png  # Check magic bytes

# PNG should start with: 8950 4e47 (89 PNG)
# JPEG should start with: ffd8 ff
```

## Git Workflow for Media

```bash
# Before committing ANY image changes:
./scripts/validate-images.sh

# If validation fails, DO NOT COMMIT
# Fix issues first, then re-validate
```

## Documentation References

- Full workflow: `docs/IMAGE-WORKFLOW.md`
- Validation details: `scripts/validate-images.sh`
- Product manifests: `assets/images/{category}/{product}/MANIFEST.json`
