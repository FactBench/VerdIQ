# ⚡ FactBench VerdIQ - Quick Start

**5-Minute Setup Guide**

---

## 🚀 You're Already Set Up!

✅ Repository cloned to: `~/projects/FactBenchV2`
✅ Credentials configured in `.env` (secure)
✅ Git ready for push/pull operations
✅ All security measures in place

---

## 📝 Daily Workflow (3 Commands)

### 1. Start Working
```bash
cd ~/projects/FactBenchV2
```

### 2. Preview Locally
```bash
python3 -m http.server 8000
# Open browser: http://localhost:8000
# Press Ctrl+C to stop
```

### 3. Publish Changes
```bash
git add .
git commit -m "Your change description"
git push origin main
# Live in 1-2 minutes at: https://factbench.github.io/VerdIQ/
```

---

## 🎨 Create New Review Page (with SuperClaude)

Just ask me:
```
"Create a review page for [PRODUCT NAME] in [CATEGORY]"
```

I'll:
- Generate SEO-optimized HTML
- Add to sitemap.xml
- Provide affiliate link placeholders
- Give you the commit message

---

## 🔧 Useful Commands

### Test Environment
```bash
cd ~/projects/FactBenchV2
./test-env.sh
```

### Check What Changed
```bash
git status
git diff
```

### See Recent Commits
```bash
git log --oneline -10
```

### Pull Latest Changes
```bash
git pull origin main
```

---

## 📞 Quick Help

### SuperClaude Commands
- `"Create review for [product]"` - Generate new page
- `"Optimize SEO for [page]"` - Improve metadata
- `"Update sitemap"` - Regenerate sitemap.xml
- `"Analyze content"` - Content quality review

### Common Issues
- **Token not working**: See `docs/token-rotation.md`
- **Git conflicts**: Run `git pull origin main` first
- **Changes not live**: Wait 2 minutes, clear browser cache

---

## 🔒 Security Reminder

✅ `.env` file is gitignored (never committed)
⏰ Rotate token by: 2025-02-04 (90 days)
📖 Rotation guide: `docs/token-rotation.md` (30 seconds)

---

## ⏭️ Next: Phase 2

Ready for automation scripts and templates?
```
/sc:implement "implementiraj fazu 2" --seq
```

This adds:
- `create-review.sh` - Generate review pages from template
- `deploy.sh` - One-command deployment
- HTML templates - Speed up content creation
- SEO & content guides

**Time**: 20 minutes

---

**Questions?** Just ask! I'm here to help. 🚀
