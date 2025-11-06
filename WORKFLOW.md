# Development Workflow Guide

Complete workflow for FactBench VerdIQ development with SuperClaude.

---

## 🎯 Common Workflows

### 1. Create New Review Page

**With SuperClaude** (Recommended):
```
User: "Create review page for Dolphin Nautilus CC pool cleaner"

Claude will:
1. Generate SEO-optimized content
2. Create HTML with proper structure
3. Add to sitemap.xml
4. Provide commit message
```

**Manual Process**:
```bash
# 1. Generate from template
./scripts/create-review.sh pool-cleaners dolphin-nautilus-cc

# 2. Edit content
nano best-pool-cleaners/dolphin-nautilus-cc.html

# 3. Update sitemap
nano sitemap.xml
# Add new URL with today's date

# 4. Preview
./scripts/serve.sh
# Visit: http://localhost:8000/best-pool-cleaners/dolphin-nautilus-cc.html

# 5. Deploy
git add .
git commit -m "Add: Dolphin Nautilus CC review"
./scripts/deploy.sh
```

---

### 2. Update Existing Content

```bash
# 1. Edit HTML
nano best-pool-cleaners/product-name.html

# 2. Update lastmod in sitemap.xml
nano sitemap.xml
# Change date to today

# 3. Preview changes
./scripts/serve.sh

# 4. Deploy
git add .
git commit -m "Update: Product pricing and availability"
./scripts/deploy.sh
```

---

### 3. Optimize SEO

**With SuperClaude**:
```
User: "Optimize SEO for best-pool-cleaners/product.html"

Claude will:
1. Analyze current metadata
2. Suggest improved title & description
3. Check keyword density
4. Verify heading structure
5. Review internal linking
```

**Manual Checklist**:
See [docs/seo-checklist.md](docs/seo-checklist.md)

---

### 4. Add Product Comparison

**With SuperClaude**:
```
User: "Create comparison table for top 5 pool cleaners"

Claude generates:
- Responsive HTML table
- Feature comparisons
- Pros/cons for each
- Affiliate links
- Mobile-friendly design
```

---

### 5. Bulk Content Updates

**With SuperClaude**:
```
User: "Update all review pages with new affiliate disclosure text"

Claude will:
1. Search all review files
2. Identify disclosure sections
3. Update with new text
4. Commit all changes
```

---

## 🔄 Standard Development Cycle

```
1. PLAN
   └─ Determine content/changes needed

2. CREATE/EDIT
   ├─ Use templates for new pages
   ├─ Follow content guidelines
   └─ Maintain SEO best practices

3. PREVIEW
   ├─ ./scripts/serve.sh
   └─ Test: http://localhost:8000

4. VALIDATE
   ├─ Check SEO metadata
   ├─ Verify all links work
   ├─ Test mobile responsiveness
   └─ Validate HTML (optional)

5. COMMIT
   ├─ git add .
   ├─ git commit -m "Clear message"
   └─ git push origin main

6. DEPLOY
   └─ ./scripts/deploy.sh

7. VERIFY
   ├─ Wait 1-2 minutes
   ├─ Check live site
   └─ Test analytics tracking
```

---

## 🎨 SuperClaude Content Prompts

### Product Research
```
"Research [PRODUCT NAME] including:
- Key features and specs
- Price range and availability
- User reviews and ratings
- Competitor comparisons
- Pros and cons
Format for review page."
```

### SEO Optimization
```
"Analyze [PAGE URL] for SEO:
- Optimized title (50-60 chars)
- Meta description (150-160 chars)
- Primary keywords
- Heading structure
- Internal linking suggestions"
```

### Content Enhancement
```
"Improve introduction for [PRODUCT PAGE]:
- Make it engaging
- Include primary keyword
- Address user search intent
- Add value proposition
- Keep 2-3 paragraphs"
```

### Comparison Content
```
"Create comparison: [PRODUCT A] vs [PRODUCT B]
- Feature-by-feature table
- Performance differences
- Price analysis
- Use case recommendations
- Include affiliate links"
```

---

## 📊 Analytics & Monitoring

### Weekly Tasks
- [ ] Review GA4 traffic reports
- [ ] Check wecantrack affiliate performance
- [ ] Monitor Search Console for issues
- [ ] Review top performing pages
- [ ] Identify content for improvement

### Monthly Tasks
- [ ] Full SEO audit (use checklist)
- [ ] Update old content (6+ months)
- [ ] Analyze conversion rates
- [ ] Check for broken links
- [ ] Review and update sitemap

### Quarterly Tasks
- [ ] Competitor analysis
- [ ] Content gap analysis
- [ ] Technical performance review
- [ ] Affiliate link verification
- [ ] Strategy review

---

## 🛡️ Security Best Practices

### Credentials Management
```bash
# Always use .env
# Never commit .env to Git
# Rotate tokens every 90 days
# Use minimal required permissions

# Check for exposed secrets
git diff --cached | grep -i "token\|secret\|password\|api"
```

### Safe Git Practices
```bash
# Verify before committing
git status
git diff

# Descriptive messages
git commit -m "Add: [feature]"
git commit -m "Update: [what changed]"
git commit -m "Fix: [issue resolved]"

# Pull before push
git pull origin main
git push origin main
```

---

## 🐛 Troubleshooting

### Git Push Fails
```bash
# Pull first
git pull origin main

# Resolve conflicts if any
git mergetool

# Push again
git push origin main
```

### Changes Not Live
```bash
# Check GitHub Actions
# Visit: https://github.com/FactBench/VerdIQ/actions

# Force refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Wait 2-3 minutes for deployment
```

### Analytics Not Working
```bash
# Verify GA4 script
grep -r "G-CXPNJ0FEG7" *.html

# Check .env
cat .env | grep GA4

# Test in incognito mode
```

### Broken Affiliate Links
```bash
# Find all affiliate links
grep -r "amazon.com" best-*/

# Check wecantrack dashboard
# Update links as needed
```

---

## 📞 Getting Help

### SuperClaude Commands
- `"Analyze [file/page]"` - Review content/code
- `"Optimize [aspect]"` - Improve SEO, performance
- `"Create [content-type]"` - Generate new content
- `"Troubleshoot [issue]"` - Debug problems
- `"Explain [concept]"` - Learn about features

### Resources
- [SEO Checklist](docs/seo-checklist.md)
- [Content Guidelines](docs/content-guidelines.md)
- [Analytics Guide](docs/analytics-setup.md)
- [Token Rotation](docs/token-rotation.md)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

**Remember**: SuperClaude is your assistant - ask for help with any workflow task!

**Last Updated**: 2024-11-06
