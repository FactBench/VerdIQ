# Changelog

All notable changes to the FactBench project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-31

### 🚀 Major Update - Multi-Agent System & Individual Product Reviews

### ✨ Added
- **Multi-Agent Data Extraction System**
  - Created Python-based multi-agent architecture
  - ImageExtractorAgent for downloading product images
  - TextExtractorAgent for content extraction
  - TableExtractorAgent for comparison data
  - ReviewExtractorAgent for user reviews
  - ValidationAgent for data quality checks
  - DeploymentAgent for automated deployment
  - Orchestrator script to coordinate all agents

- **Claude Code Agent Integration**
  - Created 7 specialized Claude Code agents in `.claude/agents/`
  - factbench-extractor agent for orchestrating Python agents
  - Individual agents for each extraction task
  - Integration with Task tool for seamless execution

- **Individual Product Review Pages**
  - Generated 11 detailed review pages (one per product)
  - Comprehensive review template with sections:
    - Quick Summary (What We Like / Consider Before Buying)
    - Key Features
    - Detailed Expert Review
    - Technical Specifications
    - Related Products
  - Automatic slug generation from product names
  - Breadcrumb navigation
  - SEO-optimized structure

- **Enhanced Data Extraction**
  - Updated all 11 products with correct zoopy.com data
  - Fixed product names (e.g., Polaris PCX 868 iQ)
  - Accurate user rating counts (1,000+, 17,000+, etc.)
  - Complete badge preservation from source

### 🔄 Changed
- **Price Guide Location**
  - Moved from top section to comparison table section
  - Now displayed as a card below the comparison table
  - Better visual hierarchy and user experience

- **Product Cards Enhancement**
  - Added "Read Full Review →" buttons to all products
  - Links connect to individual review pages
  - Improved action button layout (stacked design)

- **Build Process Updates**
  - Enhanced `build.js` to process review pages
  - Automatic directory creation for nested pages
  - Support for multiple page types

### ❌ Removed
- **Performance Analysis Section**
  - Removed empty performance chart section
  - Removed Chart.js radar chart code
  - Cleaner page without placeholder content

### 🐛 Fixed
- Directory creation issues in build process
- Product data inconsistencies
- Missing product images handling
- Review page template rendering

### 📊 Data Quality
- Extraction success rate: 82/100
- All 11 products properly mapped
- Complete user rating data preserved
- Affiliate links maintained

## [1.0.0] - 2025-07-31

### 🎉 Initial Release

FactBench launches with comprehensive robotic pool cleaner reviews featuring data from 17,000+ verified users.

### ✨ Added
- **Core Features**
  - Static site generator built with Node.js
  - Dark theme design with vibrant accent colors
  - Responsive layout for all devices
  - JSON-based content management system

- **Product Review Page**
  - 11 robotic pool cleaners with detailed analysis
  - Interactive comparison charts using Chart.js
  - Expandable product cards with Alpine.js
  - Performance metrics visualization
  - User ratings and review counts
  - Award badges (Best OF THE BEST, Editor's Choice, etc.)

- **Design System**
  - Red CTA buttons (#ef4444) as specifically requested
  - Gradient badges with animations
  - Custom SVG icons and graphics
  - TailwindCSS with custom theme configuration

- **Build System**
  - Automated build process with `npm run build`
  - TailwindCSS compilation and minification
  - Image optimization with WebP support
  - HTML generation from templates

- **Content Extraction**
  - Python script to extract data from zoopy.com
  - Automatic product image downloading
  - JSON data generation with complete product info
  - 90%+ content preservation from source

- **Deployment**
  - GitHub Pages hosting setup
  - Automated deployment script
  - Clean deployment process (removes old files)
  - Detailed commit messages

### 🛠️ Technical Stack
- **Frontend**: TailwindCSS, Alpine.js, Chart.js
- **Build**: Node.js, Custom build scripts
- **Deployment**: GitHub Pages
- **Content**: Python (BeautifulSoup) for extraction

### 📊 Product Data Includes
- BeatBot AquaSense 2 Pro (Best OF THE BEST)
- AIPER Scuba S1 2024
- Dolphin Nautilus CC Plus
- And 8 more top-rated pool cleaners

### 🔧 Configuration
- Red CTA buttons with "Check Price" text
- Dark theme optimized for readability
- Mobile-first responsive design
- SEO-friendly URL structure

### 📝 Documentation
- Comprehensive README.md
- CLAUDE.md for AI assistant guidance
- CONTRIBUTING.md for contributors
- This CHANGELOG.md

### 🚀 Deployment Details
- Live at: https://factbench.github.io/VerdIQ/
- Automated deployment via GitHub Actions
- ~5 minute deployment time

---

## Future Releases

### [Planned] Version 1.1.0
- [ ] Additional product categories
- [ ] Advanced filtering options
- [ ] User review integration
- [ ] Performance improvements

### [Planned] Version 1.2.0
- [ ] Multi-language support
- [ ] Enhanced comparison tools
- [ ] API for product data
- [ ] A/B testing framework

---

## Migration Notes

### From Manual Updates to v1.0.0
1. Update `package.json` dependencies
2. Run `npm install`
3. Update product data format to match new schema
4. Rebuild with `npm run build`
5. Deploy using new automated script

---

*For more information on the project, see the [README](README.md).*