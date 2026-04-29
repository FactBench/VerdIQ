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

## Audit-output integrity rules (post INC-2026-04-28-AUDIT-FALSE-POSITIVE)

These rules exist because on 2026-04-28 the auditor hallucinated 3 ASIN findings (Polaris 9550, Betta SE, Wave 80 — all CRITICAL FAIL_TITLE_MISMATCH). Manual verification + independent re-scrape confirmed all 3 ASINs were correct, in stock, at the expected price. Root cause: agent likely confused "Compare with similar items" carousel preview (where alternative products like VRXIQ+ surface at different prices) with the main product title, and the report only contained the agent's *interpretation* — never the raw scrape field — so the hallucination was invisible during review.

If a future audit produces another false-positive MISMATCH, the next step is replacing a correct ASIN with a wrong one — direct production damage, the exact opposite of what the audit is for.

### Rule 1 — Mandatory raw citation (FAIL/WARN findings)

For every ASIN classified as `FAIL_TITLE_MISMATCH`, `FAIL_404`, `WARN_OOS`, or `WARN_RENEWED`, the audit report MUST include the raw scrape fields verbatim, in a fenced code block, immediately under the finding line. No paraphrasing, no truncation past the first 200 chars of `product_title`. Required fields:

```
ASIN: <asin>
product_title (raw): "<exact string from scrape JSON>"
brand (raw): "<exact string>"
current_price_usd (raw): <number or null>
is_available (raw): <true|false>
is_renewed_or_refurbished (raw): <true|false>
error_message_if_any (raw): "<exact string or null>"
scrape_url: <url>
scrape_proxy: <stealth|other>
scrape_maxAge: <number>
```

If the agent cannot produce these raw fields (e.g. malformed JSON, scrape failed), the classification MUST be `SCRAPE_FAILED` — not FAIL/WARN — and the failure mode must be cited.

**Why:** Without raw citation, no reviewer (Sanel or future Claude) can independently judge whether the agent's interpretation is correct. The 2026-04-28 false positives would have been caught at review time if the report had cited the actual `product_title` field, since the raw value was almost certainly the correct product name.

### Rule 2 — Mandatory secondary verification (FAIL_TITLE_MISMATCH, WARN_OOS)

For every `FAIL_TITLE_MISMATCH` and every `WARN_OOS`, before writing the finding to the report, the agent MUST run a second independent scrape of the same ASIN under a different fingerprint. Acceptable second-scrape variants (pick one):

- `mobile: true` (mobile UA, different render path)
- `proxy: "stealth"` second pass with `actions: [{ type: "wait", milliseconds: 3000 }]` to defeat cache-edge artefacts
- Direct `curl -A "<mobile UA>" -sL https://www.amazon.com/dp/<ASIN>` and grep `<title>` from the raw HTML

Decision matrix after the secondary scrape:

| Primary | Secondary | Outcome |
|---|---|---|
| FAIL_TITLE_MISMATCH | matches expected brand/product | Downgrade to `INCONCLUSIVE` — do NOT write CRITICAL. Note both results in report. |
| FAIL_TITLE_MISMATCH | also mismatches | Confirmed FAIL — write to report with BOTH raw citations. |
| WARN_OOS | available=true | Downgrade to `OK` (cache artefact, mention in budget notes). |
| WARN_OOS | also unavailable | Confirmed WARN_OOS — write with both citations. |

Secondary verification cost: ~3-5 extra credits per FAIL/WARN. Add this to Phase 0 budget block.

**Why:** A single Firecrawl scrape can return cache artefacts, anti-bot stub pages, or mis-extracted carousel data. INC-2026-04-28 produced 3 false-positive MISMATCH findings from single-source scrapes. Second-source rule is the cheapest possible insurance against that class of bug.

### Rule 3 — Brand hard-guard (overrides FAIL_TITLE_MISMATCH)

If the Amazon page's HTML `<title>` element OR the raw `product_title` field contains the **expected brand name** for the review (case-insensitive substring match), the agent **MUST NOT** classify as `FAIL_TITLE_MISMATCH`. This is an absolute override, not a heuristic.

Brand mapping (per current category, derive from review slug):

- `polaris-*` → expected brand: `Polaris`
- `aiper-*` → expected brand: `Aiper` or `AIPER`
- `dolphin-*` → expected brand: `Dolphin` or `Maytronics`
- `wybot-*` → expected brand: `WYBOT` or `Wybot`
- `beatbot-*` → expected brand: `Beatbot` or `BEATBOT`
- `betta-*` → expected brand: `Betta`

If brand match → product is the correct family. The hard-guard catches cases where the model name string differs in punctuation/year/SKU but the underlying product is correct (`Polaris 9550 Sport` vs `Polaris VRXIQ+` is the *only* class of legitimate FAIL inside the brand — but that requires explicit model-number mismatch, NOT just title-substring mismatch). When the hard-guard fires, downgrade to `WARN_BRAND_OK_MODEL_DRIFT` if there's still suspicion, but never CRITICAL.

For bidet / analog-to-digital categories without a fixed brand mapping, derive expected brand from the listing card's displayed name (first capitalized word) before scrape, store it in the working set, and apply the same guard.

**Why:** INC-2026-04-28 — Polaris 9550 review, scrape returned a page whose title contained "Polaris" (the correct brand), yet agent flagged FAIL_TITLE_MISMATCH because some unrelated text in the page matched a different SKU. Brand hard-guard would have blocked the false positive immediately.

### Rule 4 — OOS double-check (Phase 1)

`WARN_OOS` is proclaimed only when **both** conditions hold:

1. The page does NOT contain "Add to Cart" / "Buy Now" buttons or `is_available=true` in the JSON extraction.
2. The page does NOT contain "Other sellers on Amazon" / "Available from these sellers" — these often indicate the main listing is paused but third-party stock exists, which is functionally equivalent to OK for affiliate revenue.

If only condition 1 holds (no Add to Cart) but third-party sellers are listed, classify as `WARN_BUYBOX_LOST` (less severe, no replacement-ASIN search needed).

### Rule 5 — `<template>`-aware placeholder classification (Phase 3)

A `{{...}}` token is NOT automatically a production leak. HTML5 `<template>` elements contain inert content — the markup inside is parsed but never rendered, never executed, never indexed by Google. JavaScript can `cloneNode` template content into the live DOM at runtime; only the cloned, populated copies are user-visible. Placeholders inside an unused `<template>` are dead scaffolding, not exposure.

**Required two-step classification:**

1. **Locate every `<template>...</template>` span** in the document. Compute opening offset and closing offset for each.
2. **For each `{{...}}` match, check enclosure.** If the match offset is inside any template span → `PLACEHOLDER_LEAK_INERT` (−2, advisory). If outside all templates → `PLACEHOLDER_LEAK_VISIBLE` (−20, severe production exposure).

**The audit report MUST cite both offsets** (the placeholder's and the enclosing template's, or "outside all templates"). Without these citations the finding is unreviewable.

**Why:** INC-2026-04-29-AUDIT-TEMPLATE-MISCLASSIFICATION — the 2026-04-29-1022 audit applied a −60 SEO penalty for `{{PRODUCT_NAME}}`, `{{CHECK_PRICE_URL}}`, `{{FULL_REVIEW_URL}}` claimed as "rendered text in the final HTML, not inside a `<template>` block." Independent verification proved all three were inside `<template id="product-card-template">` (pool offsets 142705..144937, bidet 195657..199130). The −60 penalty was unjustified; true SEO score was understated by ~60 points. This is the same shape of failure as INC-2026-04-28-AUDIT-FALSE-POSITIVE: insufficient classification rigor producing inflated severity. The fix is structural: template stripping must be offset-based, not regex-substitution-based, because regex with single-line minified HTML cannot reliably locate matched closing tags.

## Non-goals

- **Do not fix anything.** Read-only.
- **Do not modify content, images, or commits.** Pure observability.
- **Do not run pre-deploy.** This skill is for live state. Pre-deploy validation belongs in `validate-pool-cleaners.sh` and `validate-images.sh`.

## Tool dependencies

- `mcp__firecrawl-mcp__firecrawl_scrape` (for rendered Amazon page parsing — set `proxy: "stealth"`)
- `Bash` (curl, grep)
- `Glob` / `Read` (for local file inspection)
- Optional: `mcp__perplexity__search` for ASIN replacement suggestions when product 404s
