# FactBench VerdIQ - Project Rules

## ENVIRONMENT — Windows (od 27.04.2026)

Projekat je prebačen iz WSL Ubuntu (`~/projects/FactBenchV2`) na Windows (`F:\Projects\FactBenchV2`).

- **Bash skripte** (`scripts/*.sh`) — pokretati kroz **Git Bash**, NE PowerShell ni CMD.
- **`serve.sh`** koristi Python (`python -m http.server 8000`) — provjeri `python --version` u Git Bash.
- **Putanje** — koristi forward slash `/` u skriptama (Git Bash razumije), backslash `\` samo u native Windows alatima.
- **Linije** — pazi na CRLF vs LF kad editujеš `.sh` fajlove preko Windows editora (Git autoCRLF treba false za sh).

## TOKEN ROTATION — KRITIČNO 🔴

`.env` GitHub PAT datiran 2024-11-06, planirana rotacija 04.02.2025 — **propušteno 15+ mjeseci**. Po ARHIVI TitanAI (25.02.2026) token je tada regeneriran ali `.env` ovdje možda nije update-an.

**Prije bilo kakvog `git push` ili `deploy.sh`:**
1. Provjeri da li token u `.env` radi: `git ls-remote origin` (ako traži lozinku ili 401 — token je expired).
2. Ako expired → user mora regenerirati na GitHub Settings → Developer → PAT (scope: `repo`, `workflow`).
3. Update `.env`, NIKAD ne commit-uj `.env` (već u `.gitignore`).

## VEZA SA TitanAI EKOSISTEMOM

FactBenchV2 je dio Sanelovog projektnog ekosistema. Glavni HQ je **TitanAI** (`F:\Projects\titanai`).

- **TICKLER:** Tamo se vodi tracker za FactBench taskove (`PLAN.md`).
- **CORE DATA:** Sve lične info i odnosi su u `F:\Projects\titanai\CORE DATA.md`.
- **Cross-project workflow:** Kad obavi posao u FactBench, update tracker u TitanAI.
- **Sister projekti:** MasterReddit (`F:\Projects\MasterReddit`), TitanRedditLoop, RedditOps, RedditAsistent, titan-site, titan-network.

---

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
