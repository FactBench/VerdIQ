# 🚀 FactBench Deployment Setup Guide

This guide will help you set up automated deployment for FactBench, eliminating the need for manual file uploads through Chrome.

## 📋 Prerequisites

- Git installed on your system
- Node.js 18+ installed
- GitHub account with access to FactBench/VerdIQ repository

## 🎯 Two Deployment Options

### Option 1: Fully Automated (GitHub Actions) - RECOMMENDED ✨

Once set up, every `git push` automatically deploys your site. No manual steps needed!

#### First-Time Setup:

1. **Initialize Git in your FactBench directory:**
   ```bash
   cd /home/titan/FactBench
   git init
   ```

2. **Add your files to Git:**
   ```bash
   git add .
   git commit -m "Initial FactBench commit with automated deployment"
   ```

3. **Connect to your GitHub repository:**
   ```bash
   git remote add origin https://github.com/FactBench/VerdIQ.git
   ```

4. **Push your code:**
   ```bash
   git push -u origin main
   ```

5. **Enable GitHub Pages in your repository:**
   - Go to https://github.com/FactBench/VerdIQ/settings/pages
   - Source: Select "GitHub Actions"
   - Save

#### Future Deployments:
After any changes, just run:
```bash
git add .
git commit -m "Update site content"
git push
```

The site will automatically build and deploy in ~5 minutes!

### Option 2: Quick Local Deploy (One Command)

Use this if you prefer to control when deployments happen.

#### First-Time Setup:
Same steps 1-3 as Option 1, then:

#### Deploy Command:
```bash
npm run deploy
```

This command will:
- Build your site
- Commit changes
- Push to GitHub
- Deploy automatically via GitHub Actions

## 🛠️ Available Commands

```bash
# Build the site locally
npm run build

# Deploy to GitHub Pages
npm run deploy

# Preview site locally before deploying
npm run preview

# Development mode (watches for changes)
npm run dev
```

## 📊 Monitoring Deployments

- **Check deployment status:** https://github.com/FactBench/VerdIQ/actions
- **View live site:** https://factbench.github.io/VerdIQ/

## 🔧 Troubleshooting

### "Permission denied" error
```bash
chmod +x scripts/quick-deploy.sh
```

### "Remote origin already exists" error
```bash
git remote set-url origin https://github.com/FactBench/VerdIQ.git
```

### Site not updating after push
1. Check Actions tab: https://github.com/FactBench/VerdIQ/actions
2. Ensure GitHub Pages source is set to "GitHub Actions"
3. Clear browser cache

### Build errors
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎉 You're All Set!

Your deployment is now automated. No more manual file uploads!

- **Option 1 (Recommended):** Just `git push` and wait 5 minutes
- **Option 2:** Run `npm run deploy` when ready

Happy deploying! 🚀