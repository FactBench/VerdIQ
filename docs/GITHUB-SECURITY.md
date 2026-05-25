# GitHub Security Baseline — FactBench Ekosistem

> **Status:** ✅ Aktivno na sva 3 repoa | **Zadnji update:** 2026-05-25
> **Sestrinski dokument:** [token-rotation.md](token-rotation.md)

Ovaj dokument bilježi sigurnosni setup primijenjen na sve aktivne FactBench GitHub repoe, plus recept za primjenu na nove repoe.

---

## 📊 Šta je urađeno (po repou)

| Repo | Visibility | gitleaks | Branch protection | Storage fix | Napomena |
|------|-----------|----------|-------------------|-------------|----------|
| `titan-network` | private | ✅ | ✅ | ✅ retention 7→3 | Backup job ozdravio |
| `sonrank-site` | private | ✅ | ✅ | ✅ retention 30→7 | QA fail = odvojen (data issue) |
| `VerdIQ` (FactBenchV2) | **public** | ✅ | ✅ | n/a | Najvažniji (public!) |

**Plan:** GitHub **Pro** na FactBench nalogu ($4/mo). FactBench je **User account**, ne Organization — zato Pro, ne Team.

---

## 🔒 Sigurnosni baseline (svaki repo)

### 1. gitleaks secret scanning
- Workflow: `.github/workflows/secret-scan.yml`
- Action: `gitleaks/gitleaks-action@v2.3.9` (pinned)
- Triggeri: `pull_request` + `push` na main
- Skenira **samo PR diff / push range** (ne cijelu historiju) — stari poznati leakovi ne blokiraju nove PR-ove
- `GITLEAKS_LICENSE` **NE treba** (User-owned repoi)

### 2. Branch protection na `main`
- ✅ Required status check: `gitleaks`
- ✅ Strict (branch mora biti up-to-date)
- ✅ Block force-push
- ✅ Block deletion
- ✅ Required conversation resolution
- ❌ **NE** required reviews — solo dev ne može odobriti vlastiti PR (blokada)
- ❌ **NE** enforce_admins — admin bypass ostaje za hitne slučajeve

---

## 🔑 Pravila za secrets (NAUČENO)

1. **NIKAD hardkodirati API ključ u kod.** Koristi env var ili `.secrets/` (gitignored).
   - Pattern (vidi `titan-network/pipeline/geniuslink.py`):
     ```python
     def _load_credentials():
         if os.environ.get("MY_KEY"):
             return os.environ["MY_KEY"]
         if SECRETS_FILE.exists():
             ...
         sys.exit(1)
     ```
2. **NIKAD PAT u `.git/config` remote URL-u.** Koristi Git Credential Manager:
   ```bash
   git remote set-url origin https://github.com/FactBench/REPO.git   # čist, bez tokena
   git config --global credential.helper manager                     # GCM (Windows)
   # token se sačuva šifrovano pri prvom push-u
   ```
3. **PAT scope:** treba `repo` + `workflow` (bez `workflow` ne možeš push-ati workflow fajlove).
4. **Rotacija:** vidi [token-rotation.md](token-rotation.md) — svakih 90 dana.

---

## 🆕 RECEPT: dodaj baseline na novi repo

```bash
# 1. Historical scan PRVO (vidi ima li već leaka)
gitleaks detect --source=. --report-path=leaks.json --no-banner
#    true positive → rotiraj ključ na izvoru PRIJE enforcement-a
#    public repo → hitnije (botovi skeniraju javni GitHub)

# 2. Dodaj workflow (kopiraj iz bilo kojeg postojećeg repoa)
mkdir -p .github/workflows
cp <postojeci>/.github/workflows/secret-scan.yml .github/workflows/
git add .github/workflows/secret-scan.yml
git commit -m "ci: add gitleaks secret scanning"
git push   # treba PAT sa 'workflow' scope!

# 3. Mergeaj PR, sačekaj da gitleaks prođe na main jednom

# 4. Branch protection (gh CLI)
gh api -X PUT repos/FactBench/REPO/branches/main/protection --input protection.json
```

`protection.json`:
```json
{
  "required_status_checks": { "strict": true, "contexts": ["gitleaks"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

---

## ⚠️ Otvoreni / svjesno prihvaćeni rizici

| Stavka | Status | Napomena |
|--------|--------|----------|
| Geniuslink ključ u git historiji (titan, sonrank) | Prihvaćen rizik | Privatni repoi, samo Sanel imao pristup. Izbačen iz koda. RE-OTVORI ako repo postane public ili se doda saradnik. |
| Cloudflare token u historiji (sonrank) | Prihvaćen rizik | Već KV binding u kodu, samo historija. |
| FactBenchV2 PAT scope | Provjeriti | Stari PAT nema `workflow` scope — workflow push je išao preko `gh` CLI tokena. Pri rotaciji dodaj `workflow`. |

---

## 💸 Trošak

GitHub Pro $4/mo + gitleaks $0 (open source) = **$4/mo (~$48/god)**.

---

## 🔗 Reference

- Branch protection postavljen: 2026-05-22 (titan, sonrank), 2026-05-25 (VerdIQ)
- gitleaks lokalni binary za scan: `gitleaks_8.30.1_windows_x64`
- Account fakat: `titansltd` i `FactBench` su **User nalozi** (ne Organizations). Aktivni repoi pod FactBench.
