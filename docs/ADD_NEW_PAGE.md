# 🚀 How to Add a New Landing Page

This guide shows you how to quickly add a new product review page to FactBench.

## Quick Steps

### 1. Extract Content from Source

```bash
# Option A: From a URL
python scripts/extract-content.py --url "https://example.com/product-page"

# Option B: From local HTML file
python scripts/extract-content.py --file "source.html"
```

### 2. Create New Page Directory

```bash
mkdir -p dist/your-new-page-name
```

### 3. Copy Template

```bash
cp src/pages/best-robotic-pool-cleaners.html src/pages/your-new-page.html
```

### 4. Update Content

Edit `src/pages/your-new-page.html`:

- Change title and meta description
- Update hero section text
- Replace product data
- Modify chart data
- Update comparison table

### 5. Build

```bash
npm run build
```

## URL Structure

Your page will be available at:
```
https://factbench.github.io/VerdIQ/your-new-page-name/
```

## Checklist

- [ ] Page title updated
- [ ] Meta description changed
- [ ] Hero section customized
- [ ] Product data replaced
- [ ] Chart data updated
- [ ] Comparison table modified
- [ ] Images optimized
- [ ] Affiliate links added
- [ ] Build successful
- [ ] Tested locally

## Tips

1. **Keep URLs short**: `best-robot-vacuums` not `the-ultimate-guide-to-best-robot-vacuums-2025`
2. **Use product data JSON**: Store in `src/data/` for easy updates
3. **Optimize images**: Use WebP format when possible
4. **Test locally**: Open `dist/your-page/index.html` in browser
5. **Check mobile**: Ensure responsive design works

## Common Issues

### Build fails
- Check Node.js version (16+)
- Run `npm install` again
- Verify file paths are correct

### Page not showing
- Ensure directory has `/index.html`
- Check for typos in URLs
- Clear browser cache

### Styling broken
- Run `npm run build-css`
- Check TailwindCSS classes
- Verify CSS file is linked

---

Need help? Check the main README or open an issue!