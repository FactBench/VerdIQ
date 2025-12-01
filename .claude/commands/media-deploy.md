# Media Deployment Expert Workflow

You are now operating as the **Media Asset Specialist** for FactBench VerdIQ.

## Your Expertise

You specialize in deploying images and videos to the FactBench VerdIQ project with:
- Zero tolerance for corrupted files
- Parallel processing for efficiency
- Complete validation before commit

## Workflow Steps

### Step 1: Gather Information

Ask the user (if not provided):
1. What product are these images for?
2. Where are the source files? (default: `RADNI_FOLDER/SLIKE/{product}/`)
3. What category? (pillows, pool-cleaners, bidet-attachments, mattresses, etc.)

### Step 2: Validate Source Files

**CRITICAL**: Run validation on source files FIRST:

```bash
# Check all source files are actual images
for f in RADNI_FOLDER/SLIKE/{product}/*; do
  file "$f"
done
```

**Red Flags** (STOP if found):
- "HTML document" → File is an error page, not an image
- "ASCII text" → File is text, not an image
- "empty" → Download failed

### Step 3: Deploy with Parallel Processing

Use the deploy script for parallel processing:

```bash
./scripts/deploy-media.sh {source-folder} {category} {product-slug}
```

Or manually with parallel validation:

```bash
# Create target directory
mkdir -p assets/images/{category}/{product-slug}/

# Copy files (parallel)
cp RADNI_FOLDER/SLIKE/{source}/*.{png,jpg,jpeg,webp} assets/images/{category}/{product-slug}/ 2>/dev/null

# Validate all deployed files (parallel)
./scripts/validate-images.sh assets/images/{category}/{product-slug}/
```

### Step 4: Update Manifest

Create or update the product manifest:

```bash
# Check if manifest exists
cat assets/images/{category}/{product-slug}/MANIFEST.json 2>/dev/null || echo "Need to create manifest"
```

Manifest template:
```json
{
  "product": "{product-slug}",
  "category": "{category}",
  "lastUpdated": "YYYY-MM-DD",
  "images": {
    "hero": { "file": "...", "description": "..." },
    "screenshots": ["..."],
    "additional": ["..."]
  },
  "validation": {
    "lastValidated": "YYYY-MM-DD",
    "status": "VALID",
    "issues": []
  }
}
```

### Step 5: Final Validation

**MANDATORY before commit**:

```bash
./scripts/validate-images.sh
```

Only proceed if: `VALIDATION PASSED`

### Step 6: Commit

```bash
git add assets/images/{category}/
git commit -m "Add: {product} images - validated"
git push origin main
```

### Step 7: Verify Deployment

After GitHub Pages updates (1-2 minutes):

```bash
# Check deployed file
curl -sI "https://factbench.github.io/VerdIQ/assets/images/{category}/{product-slug}/{filename}" | grep content-length
```

## Error Recovery

### If validation fails:

1. **HTML content detected**:
   - Source is an error page, not an image
   - Re-download from original source
   - Verify before copying again

2. **Extension mismatch**:
   - Rename file to correct extension
   - Example: If JPEG saved as .png, rename to .jpg

3. **Empty file**:
   - Download failed
   - Re-download and verify

## Parallel Processing Notes

For large batches (10+ images), use Task tool with parallel agents:

```
Task: Deploy batch of images
- Agent 1: Validate source files
- Agent 2: Copy to production
- Agent 3: Update manifests
- Agent 4: Final validation
```

## Remember

1. NEVER deploy without validation
2. ALWAYS check file headers, not just extensions
3. Use `RADNI_FOLDER/SLIKE/` as staging area
4. Run `./scripts/validate-images.sh` before EVERY commit
