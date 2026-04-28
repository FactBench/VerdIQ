# factbench-audit reference data

This file is loaded by the `@factbench-auditor` agent during Phase 0. It contains per-category metadata: which review slugs belong to which listing, what redirect stubs should exist, what image folders are expected, and what affiliate tag is canonical.

## Site config

- **Live URL**: `https://factbench.github.io/VerdIQ/`
- **Repo**: `FactBench/VerdIQ` on GitHub Pages
- **Hosting**: GitHub Pages (no server-side 301 redirect support; meta-refresh + canonical only)
- **Affiliate tag**: `factbench-r-20` (Amazon US Associates)

## Categories

### best-robotic-pool-cleaners

- **Listing path**: `best-robotic-pool-cleaners/index.html`
- **Live URL**: `https://factbench.github.io/VerdIQ/best-robotic-pool-cleaners/`
- **Image folder**: `assets/images/best-robot-pools/` (note folder name lacks `-cleaners` suffix — historical, do not "fix")
- **Review slugs (current)**:
  - `aiper-scuba-s1`
  - `aiper-scuba-x1-pro-max` (replaces former `aiper-scuba-x1-cordless`)
  - `beatbot-aquasense-2-pro`
  - `beatbot-aquasense-2-ultra`
  - `betta-se-solar-powered-pool-skimmer`
  - `dolphin-e10`
  - `dolphin-nautilus-cc-plus-wi-fi`
  - `dolphin-wave-80` (replaces former `dolphin-premier`)
  - `polaris-9550-sport-robotic`
  - `polaris-pcx-868-iq-smart-robotic`
  - `wybot-c2-vision-ai-camera-cordless`
- **Redirect stubs (must be meta-refresh + canonical, noindex)**:
  - `reviews/aiper-scuba-x1-cordless/index.html` → redirects to `aiper-scuba-x1-pro-max`
  - `reviews/dolphin-premier/index.html` → redirects to `dolphin-wave-80`

### best-bidet-attachments

- **Listing path**: `best-bidet-attachments/index.html`
- **Live URL**: `https://factbench.github.io/VerdIQ/best-bidet-attachments/`
- **Review slugs**: discover dynamically by scraping listing href attrs

### best-analog-to-digital-service

- **Listing path**: `best-analog-to-digital-service/index.html`
- **Live URL**: `https://factbench.github.io/VerdIQ/best-analog-to-digital-service/`
- **Review slugs**: discover dynamically by scraping listing href attrs

## Audit thresholds

| Check | Warning | Failure |
|---|---|---|
| Amazon ASIN renders product | renewed/refurbished | "Page Not Found" or `is_available=false` after 7 days |
| Page HTTP status | 3xx redirect | 4xx / 5xx |
| Title length | >65 chars | >70 chars |
| Meta description length | >170 chars | >200 chars |
| Missing canonical | warning | failure |
| Missing og:title/og:image | warning | failure |
| Sitemap lastmod older than 90 days | warning | — |
| Redirect stub missing meta-refresh | failure | — |
| Image extension mismatches actual format | warning | failure (HTML 403 saved as image) |

## Common patterns the auditor must catch

- **Broken Amazon ASIN**: HTTP returns 200, but rendered title contains "Page Not Found" or "Sorry! We couldn't find that page". Always parse rendered content, never trust HTTP status alone for Amazon URLs.
- **Renewed/Refurbished snuck into headline category**: title contains "(Renewed)" or "Refurbished" — flag as warning, since marketing copy presents it as new.
- **Listing card slug mismatch**: card text says "Aiper Scuba X1" but href points to `aiper-scuba-x1-cordless` (old slug). Compare displayed name to slug semantically.
- **Image extension lie**: file `*.png` whose magic bytes are `ffd8 ff` (JPEG) — not always a deploy-blocker, but fix opportunity.
- **Stale sitemap lastmod**: review page's `lastmod` predates the file's last-modified date in the live HTML.
- **Affiliate tag missing**: any `amazon.com/dp/<ASIN>` link without `?tag=factbench-r-20` is a revenue leak.

## Non-goals

- **Do not fix anything.** Read-only.
- **Do not modify content, images, or commits.** Pure observability.
- **Do not run pre-deploy.** This skill is for live state. Pre-deploy validation belongs in `validate-pool-cleaners.sh` and `validate-images.sh`.

## Tool dependencies

- `mcp__firecrawl-mcp__firecrawl_scrape` (for rendered Amazon page parsing — set `proxy: "stealth"`)
- `Bash` (curl, grep)
- `Glob` / `Read` (for local file inspection)
- Optional: `mcp__perplexity__search` for ASIN replacement suggestions when product 404s
