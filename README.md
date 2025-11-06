# FactBench VerdIQ™

**Reader-supported product review website with affiliate monetization**

🌐 **Live**: https://factbench.github.io/VerdIQ/
📊 **Repo**: https://github.com/FactBench/VerdIQ
🎯 **Focus**: Product reviews with Amazon Associates affiliate links

---

## 🚀 Quick Start

```bash
# Navigate to project
cd ~/projects/FactBenchV2

# Start local server
./scripts/serve.sh
# → http://localhost:8000

# Create new review
./scripts/create-review.sh pool-cleaners new-product-name

# Deploy to GitHub Pages
git add .
git commit -m "Add: New product review"
./scripts/deploy.sh
```

---

## 📁 Project Structure

```
FactBenchV2/
├── .env                    # Credentials (GITIGNORED)
├── .gitignore              # Security rules
├── index.html              # Homepage
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
│
├── scripts/                # Automation
│   ├── create-review.sh    # Generate review pages
│   ├── deploy.sh           # Deploy to GitHub Pages
│   ├── serve.sh            # Local dev server
│   ├── optimize-images.sh  # Image compression
│   └── test-env.sh         # Environment validation
│
├── templates/              # HTML templates
│   └── review-page-template.html
│
├── docs/                   # Documentation
│   ├── seo-checklist.md
│   ├── content-guidelines.md
│   ├── analytics-setup.md
│   └── token-rotation.md
│
├── best-*/                 # Category pages
│   ├── pool-cleaners/
│   ├── bidet-attachments/
│   └── analog-to-digital-service/
│
└── assets/                 # Static resources
    ├── css/
    ├── js/
    └── images/
```

---

## 🛠️ Common Tasks

### Create New Review Page
```bash
./scripts/create-review.sh <category> <product-slug>

# Example:
./scripts/create-review.sh pool-cleaners dolphin-premium
```

### Edit Existing Content
```bash
# Edit HTML directly
nano best-pool-cleaners/dolphin-premium.html

# Update sitemap lastmod date
nano sitemap.xml
```

### Preview Locally
```bash
./scripts/serve.sh
# Open: http://localhost:8000
```

### Deploy Changes
```bash
git add .
git commit -m "Update: Product prices"
./scripts/deploy.sh
# Live in ~1-2 minutes
```

---

## 🔧 Configuration

### Environment Variables (.env)
```bash
# GitHub
GITHUB_TOKEN=your_token_here
GITHUB_REPO=FactBench/VerdIQ

# Analytics
GA4_MEASUREMENT_ID=G-CXPNJ0FEG7
GA4_API_SECRET=your_secret

# Site
SITE_URL=https://factbench.github.io/VerdIQ/
LOCAL_PORT=8000
```

**Security**: Never commit `.env` to Git!

---

## 📊 Integrations

- ✅ **Google Analytics 4**: G-CXPNJ0FEG7
- ✅ **Google Search Console**: Verified
- ✅ **Bing Webmaster**: Verified
- ✅ **wecantrack**: Affiliate tracking enabled

---

## 📚 Documentation

- [SEO Checklist](docs/seo-checklist.md) - Optimization guidelines
- [Content Guidelines](docs/content-guidelines.md) - Writing standards
- [Analytics Setup](docs/analytics-setup.md) - Tracking configuration
- [Token Rotation](docs/token-rotation.md) - Security maintenance
- [Quick Start](QUICK-START.md) - 5-minute guide
- [Workflow](WORKFLOW.md) - Detailed workflows

---

## 🤖 SuperClaude Integration

Ask Claude for help with:
```
"Create review page for [PRODUCT] in [CATEGORY]"
"Optimize SEO for [PAGE]"
"Analyze content quality of [FILE]"
"Update sitemap with new pages"
```

---

## 🔒 Security

- ✅ `.env` file gitignored (credentials protected)
- ✅ Token rotation every 90 days
- ✅ Minimal GitHub token permissions
- ⚠️ Never share tokens in chat/email

**Token Rotation**: See [docs/token-rotation.md](docs/token-rotation.md)

---

## 📈 Performance Targets

- Page Load: < 3 seconds
- Core Web Vitals: Pass all metrics
- Mobile Score: > 90
- SEO Score: > 90

---

## 🐛 Troubleshooting

### Git Push Fails
```bash
git pull origin main
git push origin main
```

### Local Server Won't Start
```bash
# Check port availability
lsof -i :8000

# Use different port
LOCAL_PORT=8001 ./scripts/serve.sh
```

### Changes Not Live
- Wait 2-3 minutes for GitHub Pages rebuild
- Clear browser cache (Ctrl+Shift+R)
- Check: https://github.com/FactBench/VerdIQ/actions

### Analytics Not Working
```bash
# Verify GA4 script in HTML
grep -r "G-CXPNJ0FEG7" *.html

# Check .env
./test-env.sh
```

---

## 📞 Getting Help

- **SuperClaude**: Ask for step-by-step guidance
- **Documentation**: Check `docs/` directory
- **GitHub Issues**: Report problems
- **Quick Reference**: See `QUICK-START.md`

---

**Last Updated**: 2024-11-06
**Version**: 2.0 (Post-Recovery Setup)

---

💡 **Tip**: Use `./scripts/create-review.sh` to quickly generate new review pages from templates!
