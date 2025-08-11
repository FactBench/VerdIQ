# FactBench Deployment Guide

This guide covers all deployment options for the FactBench project, with a focus on GitHub Pages deployment.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Build](#local-build)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Alternative Hosting Options](#alternative-hosting-options)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## ✅ Prerequisites

Before deploying, ensure you have:

1. **Node.js 18+** installed
2. **Git** configured with GitHub access
3. **GitHub account** with repository access
4. **Build dependencies** installed (`npm install`)

## 🏗️ Local Build

Always build and test locally before deploying:

```bash
# 1. Clean previous build
rm -rf dist/

# 2. Install/update dependencies
npm install

# 3. Build the site
npm run build

# 4. Preview the build
npm run preview
# Visit http://localhost:3000
```

### Build Verification Checklist
- [ ] No build errors in console
- [ ] All pages load correctly
- [ ] Images display properly
- [ ] CTAs are clickable
- [ ] Charts render correctly
- [ ] Mobile responsive design works

## 🚀 GitHub Pages Deployment

### Method 1: Automated Deployment Script (Recommended)

The project includes an automated deployment script that handles everything:

```bash
# 1. Set up GitHub token (one-time setup)
export GITHUB_TOKEN="ghp_your_token_here"

# 2. Make script executable
chmod +x scripts/github-deploy.sh

# 3. Run deployment
./scripts/github-deploy.sh
```

#### What the script does:
1. Builds the site (`npm run build`)
2. Clones your GitHub repository
3. Removes old files (clean deployment)
4. Copies new files from `dist/`
5. Commits with descriptive message
6. Pushes to GitHub
7. GitHub Pages automatically deploys

### Method 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Build the site
npm run build

# 2. Create a new branch for GitHub Pages
git checkout -b gh-pages

# 3. Copy dist contents to root (GitHub Pages requirement)
cp -r dist/* .

# 4. Add and commit
git add -A
git commit -m "Deploy to GitHub Pages"

# 5. Push to GitHub
git push origin gh-pages

# 6. Return to main branch
git checkout main
```

### Method 3: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build site
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🔧 GitHub Repository Setup

### Initial Setup

1. **Create Repository**
   ```bash
   # If not already created
   gh repo create FactBench/VerdIQ --public
   ```

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (or `main` with `/dist` folder)
   - Save

3. **Configure Custom Domain (Optional)**
   - Add custom domain in Settings → Pages
   - Create `CNAME` file in `dist/` with your domain
   - Update DNS records

### Repository Settings

```yaml
# Recommended settings
Settings:
  Pages:
    Source: gh-pages branch
    Folder: / (root)
    Enforce HTTPS: ✓
  
  General:
    Features:
      Issues: ✓
      Projects: ✓
      Wiki: ✗ (use docs/ instead)
```

## 🌐 Alternative Hosting Options

### Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build site
npm run build

# 3. Deploy
netlify deploy --dir=dist --prod
```

### Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel dist
```

### AWS S3 + CloudFront

```bash
# 1. Build site
npm run build

# 2. Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# 3. Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Traditional Web Hosting

Simply upload the contents of `dist/` to your web server's public directory via:
- FTP/SFTP
- cPanel File Manager
- SSH/rsync

## 🔍 Post-Deployment Verification

### Immediate Checks

1. **Visit your site**
   ```
   https://factbench.github.io/VerdIQ/
   ```

2. **Check deployment status**
   ```
   https://github.com/FactBench/VerdIQ/actions
   ```

3. **Verify all pages**
   - Homepage loads
   - Product pages work
   - Images display
   - Links function

### Performance Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# PageSpeed Insights
https://pagespeed.web.dev/report?url=https://factbench.github.io/VerdIQ/
```

## 🐛 Troubleshooting

### Common Issues

#### 404 Error on GitHub Pages
```bash
# Solution: Ensure index.html exists in root
# Check the build output structure
ls -la dist/
```

#### Images Not Loading
```bash
# Check image paths are relative
# Bad: /assets/images/logo.png
# Good: assets/images/logo.png
```

#### CSS Not Applied
```bash
# Ensure style.css is in correct location
ls -la dist/assets/css/
# Check paths in HTML files
```

#### Deployment Script Fails
```bash
# Check GitHub token permissions
# Token needs: repo, workflow permissions

# Test git access
git ls-remote https://github.com/FactBench/VerdIQ.git
```

### Debug Commands

```bash
# Check build output
tree dist/ -L 2

# Verify GitHub Pages status
curl -I https://factbench.github.io/VerdIQ/

# Check for mixed content issues
# Open browser console on deployed site
```

## 📊 Best Practices

### 1. Pre-Deployment Checklist
- [ ] Run `npm run lint`
- [ ] Test all pages locally
- [ ] Check responsive design
- [ ] Verify no broken links
- [ ] Confirm images optimized
- [ ] Review meta tags/SEO

### 2. Deployment Frequency
- Deploy after significant changes
- Batch small updates together
- Avoid deploying during high traffic
- Test thoroughly before deploying

### 3. Version Control
```bash
# Tag releases
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Use semantic versioning
# MAJOR.MINOR.PATCH
```

### 4. Rollback Strategy
```bash
# If deployment causes issues
git checkout previous-commit-hash
npm run build
./scripts/github-deploy.sh
```

### 5. Monitoring
- Set up uptime monitoring
- Check Google Search Console
- Monitor 404 errors
- Track page load times

## 🔐 Security Considerations

### GitHub Token Management
```bash
# Never commit tokens!
# Use environment variables
export GITHUB_TOKEN="your-token"

# Or use GitHub Secrets for Actions
# Settings → Secrets → Actions
```

### Content Security
- Review all external scripts
- Use SRI for CDN resources
- Enable HTTPS only
- Set security headers

## 📝 Deployment Documentation

Always document deployments:

```markdown
## Deployment Log

### 2025-07-31 - v1.0.0
- Initial deployment
- Added 11 pool cleaner reviews
- Implemented red CTAs
- Fixed image paths
- Deployed by: @username
```

---

## 🚨 Emergency Procedures

### Site is Down
1. Check GitHub Pages status: https://www.githubstatus.com/
2. Verify repository settings
3. Check recent commits for issues
4. Rollback if necessary

### Broken Deployment
```bash
# Quick fix
git revert HEAD
npm run build
./scripts/github-deploy.sh
```

### Lost Access
1. Ensure multiple maintainers have access
2. Keep backup of deployment scripts
3. Document all credentials securely

---

*Remember: Always test locally before deploying to production!*