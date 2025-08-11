# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the FactBench project.

## 🎯 Project Overview

FactBench is a static site generator for creating data-driven product review pages. Currently features robotic pool cleaners with plans to expand to other categories. The site is deployed on GitHub Pages at https://factbench.github.io/VerdIQ/

## Important Working Instructions

When working in this repository:
1. **ALWAYS create a detailed plan using TodoWrite tool before starting any work**
2. **Wait for user confirmation of the plan before proceeding with implementation**
3. **User prefers to run Claude Code with `--auto-approve` flag to avoid confirming each step**

## Tool Usage Efficiency

For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.

This means:
- When searching for different patterns or files, run multiple Grep/Glob operations in parallel
- When reading multiple files, batch Read operations together
- When running independent bash commands, execute them concurrently
- When making edits to different files, group MultiEdit operations

Example: Instead of running searches one by one, batch them in a single response for optimal performance.

## Specialized Agents for Automated Tasks

**IMPORTANT**: To maximize efficiency and save tokens, specialized agents will automatically handle specific tasks. These agents are pre-configured experts that work faster and more consistently than manual implementation.

## 🔑 Key Principles

1. **Performance First** - Every decision should prioritize page load speed
2. **Data Accuracy** - All product information must be factual and verifiable
3. **User Experience** - Clean, intuitive interface with smooth interactions
4. **SEO Friendly** - Proper meta tags, structured data, and semantic HTML

## 📁 Important Files & Locations

### Core Files
- `/src/data/products.json` - Main product database
- `/src/pages/best-robotic-pool-cleaners.html` - Product page template
- `/src/assets/css/input.css` - TailwindCSS styles and custom classes
- `/tailwind.config.js` - Theme configuration (colors, fonts, etc.)

### Build Scripts
- `/scripts/build.js` - Main build script that generates the static site
- `/scripts/extract-full-zoopy-data.py` - Extracts product data from zoopy.com
- `/scripts/download-images.js` - Downloads product images from URLs
- `/scripts/generate-complete-page.js` - Generates HTML from product data
- `/scripts/github-deploy.sh` - Automated deployment to GitHub Pages

### Generated Files (in `/dist/`)
- `/dist/index.html` - Homepage
- `/dist/best-robotic-pool-cleaners/index.html` - Product review page
- `/dist/assets/` - CSS, images, and other assets

## 🎨 Design System

### Colors
```javascript
// Red CTAs (user specifically requested these)
'cta-primary': '#ef4444',
'cta-hover': '#dc2626',

// Badge colors with gradients
'badge-gold': '#fbbf24',
'badge-silver': '#9ca3af', 
'badge-bronze': '#f59e0b',
```

### UI Elements
- **CTA Buttons**: Always red (#ef4444) with "Check Price" text
- **Badges**: Gradient backgrounds with animations (Best OF THE BEST, Editor's Choice, etc.)
- **Product Cards**: Dark background with hover effects and expandable details
- **Charts**: Chart.js visualizations for product comparisons

## 🤖 Multi-Agent System

### Available Claude Code Agents
The project includes 7 specialized agents in `.claude/agents/`:

1. **factbench-extractor** - Orchestrates the complete extraction pipeline
2. **image-downloader-organizer** - Downloads and organizes product images
3. **text-extractor** - Extracts text content from web pages
4. **table-extractor** - Extracts and parses comparison tables
5. **review-extractor** - Extracts user reviews and ratings
6. **validation-agent** - Validates data completeness and quality
7. **deployment-agent** - Handles automated deployment to GitHub Pages

### Using the Agents
To use any agent, tell Claude:
```
"Use the [agent-name] agent to [task]"
```

Example:
```
"Use factbench-extractor to extract all data from https://zoopy.com/best-robotic-pool-cleaners"
```

### Python Agent Architecture
The agents are built on a base class (`agents/base_agent.py`) and can be run:
- Individually for specific tasks
- Together via the orchestrator (`agents/run_all_agents.py`)
- Through Claude Code agents for seamless integration

## 🔧 Common Tasks

### Full Data Extraction Pipeline
Use the factbench-extractor agent:
```
"Use factbench-extractor to extract all data from [URL]"
```

Or run Python pipeline directly:
```bash
python agents/run_all_agents.py https://zoopy.com/best-robotic-pool-cleaners
```

### Individual Extraction Tasks
- **Quick text preview**: "Use text-extractor agent"
- **Table check**: "Use table-extractor agent"
- **Review analysis**: "Use review-extractor agent"
- **Validation**: "Use validation-agent"
- **Deployment**: "Use deployment-agent"

### Generate Individual Review Pages
After updating product data:
```bash
node scripts/generate-review-pages.js
```
This creates detailed review pages for each product in `src/pages/reviews/`

### Adding a New Product
1. Update `/src/data/products.json` with product details
2. Download product image: `node scripts/download-images.js`
3. Rebuild site: `npm run build`
4. Deploy: `./scripts/github-deploy.sh`

### Extracting Content from zoopy.com
```bash
# Extract all product data
python scripts/extract-full-zoopy-data.py

# This creates a complete JSON file with:
# - Product names, badges, ratings
# - User rating counts (1,000+, 17,000+, etc.)
# - Features, pros/cons
# - Affiliate links
```

### Building the Site
```bash
# Development build with watch mode
npm run dev

# Production build (includes review pages)
npm run build

# Preview production build
npm run preview
```

**Note**: The build process now automatically:
- Processes all pages in `src/pages/`
- Generates review pages from `src/pages/reviews/`
- Creates proper directory structure in `dist/`
- Handles nested page routing

### Deployment
```bash
# Automated deployment (requires GITHUB_TOKEN)
./scripts/github-deploy.sh

# This script:
# 1. Builds the site
# 2. Clones the VerdIQ repository
# 3. Cleans old files
# 4. Copies new dist files
# 5. Commits with detailed message
# 6. Pushes to GitHub
```

## ⚠️ Important Notes

### Image Handling
- Product images should be in `/src/assets/images/products/`
- Use descriptive filenames: `BeatBot_AquaSense_2_PRO.jpg`
- If images are missing, the build script creates placeholder SVGs
- WebP optimization is optional (requires sharp module)

### Content Updates
- Always preserve user rating counts (17,000+, 1,000+, etc.)
- Keep all badges and awards from source
- Maintain affiliate links exactly as provided
- Include 90%+ of content from zoopy source

### Performance Considerations
- Minimize JavaScript usage (Alpine.js only where needed)
- Optimize images before adding to repository
- Use TailwindCSS utilities instead of custom CSS
- Lazy load images below the fold

### GitHub Token Security
- Never commit tokens to the repository
- Use environment variables for sensitive data
- Tokens should have minimal required permissions

## 🚀 Deployment Checklist

Before deploying:
- [ ] All product images are present
- [ ] Build completes without errors
- [ ] CTAs say "Check Price" not "View Deal"
- [ ] Badges are displaying correctly
- [ ] Mobile responsive design works
- [ ] No console errors in browser

## 🐛 Common Issues & Solutions

### Missing Images
- Check if image URLs in products.json are correct
- Run `node scripts/download-images.js` to fetch missing images
- Placeholder SVGs will be created for 404 images

### Build Errors
- Ensure Node.js 18+ is installed
- Run `npm install` to update dependencies
- Check for syntax errors in data files

### Deployment Failures
- Verify GitHub token has correct permissions
- Ensure repository exists and is accessible
- Check GitHub Actions for deployment status

## 📊 Analytics & Tracking

Currently no analytics implemented. When adding:
- Use privacy-respecting solutions
- Implement cookie consent if required
- Track key metrics: page views, CTR on products, time on page

## 🔄 Future Enhancements

Planned improvements:
- Additional product categories
- Advanced filtering and sorting
- User reviews integration
- Comparison tool enhancements
- Multi-language support

## 🔄 Recent Updates

### August 1, 2025 - Version 1.1.1 (Price Fix Update)
1. **Fixed Price Guide Format**: Corrected wrong price guide display to show proper $, $$, $$$, $$$$ progression
2. **Updated ALL Product Prices**: Fixed incorrect prices across entire site to match correct data
3. **Comparison Table Fixes**: 
   - Fixed anchor link from #comparison-table to #comparison
   - Updated all prices in comparison table to match correct values
4. **Created Fix Scripts**:
   - `final-fix-price-guide.js` - Fixes price guide format
   - `fix-all-prices.js` - Comprehensive price correction script
5. **Deployed All Fixes**: Site now shows correct prices everywhere

### July 31, 2025 - Version 1.1.0 Changes:
1. **Multi-Agent System**: Created Python-based agents for data extraction
2. **Claude Code Agents**: Added 7 specialized agents for different tasks
3. **Individual Review Pages**: Generated detailed review pages for all 11 products
4. **Price Guide Relocation**: Moved from top section to comparison table
5. **Performance Section Removal**: Removed empty chart section
6. **Data Update**: Fixed product names and user ratings from zoopy
7. **Build Enhancement**: Updated build.js to handle review pages

### Current Status:
- All 11 products have individual review pages
- Data extraction achieved 82% quality score
- Site successfully deployed to GitHub Pages
- All "Read Full Review" links functional
- All prices are now correct and consistent across the site

## 💡 Tips for AI Assistants

1. **Always use TodoWrite** to track complex tasks
2. **Test locally** before deploying
3. **Preserve existing design decisions** (red CTAs, dark theme)
4. **Reference this file** when unsure about project conventions
5. **Check the live site** to verify deployments
6. **Use agents** for extraction tasks rather than manual work
7. **Run validation** after any data extraction

---

Last updated: 2025-08-01
Project version: 1.1.1