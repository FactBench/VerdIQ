# 🚀 FactBench Quick Start Guide

## Deploy in 3 Steps

### 1️⃣ First-Time Setup (One Time Only)
```bash
cd /home/titan/FactBench
git init
git add .
git commit -m "Initial FactBench setup"
git remote add origin https://github.com/FactBench/VerdIQ.git
git push -u origin main
```

Then enable GitHub Pages:
- Go to: https://github.com/FactBench/VerdIQ/settings/pages
- Source: "GitHub Actions"
- Save

### 2️⃣ Deploy Changes (Anytime)
```bash
npm run deploy
```

### 3️⃣ Add New Pages
```bash
# Extract from zoopy.com
python3 scripts/extract-zoopy-content.py https://zoopy.com/best-air-fryers best-air-fryers

# Generate page
node scripts/generate-page.js best-air-fryers

# Deploy
npm run deploy
```

## 📊 Monitoring
- **Live site:** https://factbench.github.io/VerdIQ/
- **Deploy status:** https://github.com/FactBench/VerdIQ/actions

## 🛠️ All Commands
```bash
npm run build      # Build site locally
npm run deploy     # Deploy to GitHub Pages
npm run preview    # Preview locally (http://localhost:3000)
npm run dev        # Development mode
```

That's it! No more manual file uploads. 🎉