---
name: factbench-audit
description: Run a post-deploy audit of FactBench VerdIQ — checks live Amazon links resolve to real products (not 404 page-not-found), template placeholders haven't leaked, all review pages return 200, sitemap is fresh, redirect stubs work, and SEO meta tags are complete. Use when you've just pushed changes to GitHub Pages and want confidence everything is live and correct. Returns a tight scorecard + top action items, writes full report to ANALIZE/.
---

# /factbench-audit — Post-Deploy Live Site Auditor

Thin UI layer. Parses args, validates, delegates to `@factbench-auditor` agent which runs a 6-phase workflow in isolated context and returns a summary.

## Why this exists

The `verify-live-site.sh` script tests HTTP status codes only — it returned 200 OK for Amazon ASINs that, when actually opened, showed "Page Not Found." This skill catches that class of bug: it parses **rendered Amazon product pages** (title + availability + renewed flag) instead of just HTTP status. It also checks that meta-refresh redirect stubs actually contain the redirect, that listing categories haven't drifted, and that newly-pushed review pages have all expected SEO scaffolding.

## Usage

```
/factbench-audit [--scope=all|amazon|seo|redirects|images] [--category=best-robotic-pool-cleaners|best-bidet-attachments|best-analog-to-digital-service|all]
```

- `--scope` — optional, default `all`. Pick one phase or run everything.
- `--category` — optional, default `all`. Limit checks to a specific listing category.

## Examples

```
/factbench-audit
/factbench-audit --scope=amazon
/factbench-audit --category=best-robotic-pool-cleaners
/factbench-audit --scope=redirects
```

## What it does

1. **Validate** — current branch is `main` (or warn). Confirm git tree is clean (warn if dirty).
2. **Delegate** — invoke `@factbench-auditor` agent via the Agent tool with `subagent_type: "factbench-auditor"` and a self-contained prompt including: scope, category, today's date, and the full path to `.claude/skills/factbench-audit/reference.md`.
3. **Surface result** — the agent returns a ~30-line summary (weighted score out of 100 + top 5 action items + report path). Relay this to the user verbatim. Do NOT re-read the full report from `ANALIZE/` unless the user asks.

## Scoring (agent computes this)

| Dimension | Weight |
|---|---|
| Amazon link integrity | 35 |
| SEO + meta | 25 |
| Redirect stubs | 15 |
| Image references | 15 |
| Sitemap freshness | 10 |

Grades: 90+ = A, 80-89 = B, 70-79 = C, <70 = D (action required).

## Behavior rules

- Do NOT run phases yourself. The skill is a dispatcher, not an executor.
- Do NOT read `reference.md` in the main context — it's for the agent. Pass the path.
- If the user invoked this without an explicit deploy having just happened, warn but continue (audit may catch state drift).
- Reports go to `ANALIZE/factbench-audit-<YYYY-MM-DD-HHMM>.md` (gitignored). Append timestamp so multiple audits per day don't overwrite.

## Not in scope

- Fixing issues — audit is read-only. Fixes are a separate session.
- Deploys, commits, or any write — the agent is read-only except for `ANALIZE/`.
- Generating or modifying content — that's a separate workflow.

## When to invoke proactively

- Right after the user runs `git push origin main`.
- After replacing Amazon affiliate ASINs.
- Before the user shares the live URL externally.
- When the user asks "is everything OK on live?" — that's the trigger.
