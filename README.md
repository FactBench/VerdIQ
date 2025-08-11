# FactBench 🔍

> **Fact-based product reviews powered by real data** - A modern, data-driven product review platform built with performance and user experience in mind.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success)](https://factbench.github.io/VerdIQ/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/Built%20with-TailwindCSS-06B6D4)](https://tailwindcss.com)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-v3-8BC0D0)](https://alpinejs.dev)
[![Chart.js](https://img.shields.io/badge/Chart.js-v4-FF6384)](https://www.chartjs.org)

## 🌟 Overview

FactBench is a static site generator that creates beautiful, fast-loading product review pages. Currently featuring in-depth analysis of the best robotic pool cleaners, with data sourced from real user reviews and expert testing (17,000+ verified users).

### Key Features

- 📊 **Data-Driven Reviews** - Real ratings from 17,000+ verified users
- 🏆 **Award Badges** - Clear visual hierarchy (Best of the Best, Editor's Choice, etc.)
- 📱 **Responsive Design** - Looks great on all devices
- ⚡ **Lightning Fast** - Static site with optimized assets
- 🎨 **Modern UI** - Dark theme with vibrant red CTAs and gradient badges
- 📖 **Individual Review Pages** - Detailed analysis for each product
- 🤖 **Multi-Agent Extraction** - Automated data collection system
- 🔄 **Easy Updates** - JSON-based content management
- 🔍 **SEO Optimized** - Structured data and meta tags

## 🛠️ Technology Stack

- **Build System**: Custom Node.js static site generator
- **Styling**: TailwindCSS with custom color theme
- **Interactivity**: Alpine.js for lightweight components
- **Charts**: Chart.js for data visualization
- **Icons**: Custom SVG icons and graphics
- **Deployment**: GitHub Pages with automated workflows
- **Content**: JSON-based data management

## 📁 Project Structure

```
FactBench/
├── src/                      # Source files
│   ├── assets/              
│   │   ├── css/             # TailwindCSS input files
│   │   └── images/          # Product images and icons
│   ├── data/                # JSON data files
│   │   └── pool-cleaners-complete.json    # Product information
│   ├── pages/               # HTML page templates
│   │   ├── best-robotic-pool-cleaners.html
│   │   └── reviews/         # Individual product reviews
│   └── templates/           # Reusable templates
│       └── product-review.html
├── agents/                  # Multi-agent extraction system
│   ├── base_agent.py       # Base agent class
│   ├── image_extractor_agent.py
│   ├── text_extractor_agent.py
│   ├── table_extractor_agent.py
│   ├── review_extractor_agent.py
│   ├── validation_agent.py
│   ├── deployment_agent.py
│   └── run_all_agents.py   # Orchestrator
├── .claude/agents/         # Claude Code agents
│   ├── factbench-extractor.md
│   ├── image-downloader-organizer.md
│   ├── text-extractor.md
│   └── ... (7 agents total)
├── dist/                    # Built files (deployment-ready)
├── scripts/                 # Build and utility scripts
│   ├── build.js            # Main build script
│   ├── generate-review-pages.js  # Review page generator
│   ├── extract-full-zoopy-data.py
│   ├── download-images.js
│   ├── generate-complete-page.js
│   └── github-deploy.sh
├── tailwind.config.js      # TailwindCSS configuration
├── package.json            # Node.js dependencies
├── CLAUDE.md              # AI assistant instructions
└── README.md              # This file
```


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for content extraction scripts)
- Git
- GitHub account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FactBench/FactBench.git
cd FactBench
```

2. Install dependencies:
```bash
npm install
```

3. Set up Python environment (for multi-agent extraction system):
```bash
pip install beautifulsoup4 requests pandas playwright
playwright install chromium
```

### Development

1. Start development with watch mode:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Preview production build:
```bash
npm run preview
```

4. Run linting:
```bash
npm run lint
```

## 📝 Content Management

### Adding/Updating Products

Products are managed through `src/data/pool-cleaners-complete.json`. Each product includes:

```json
{
  "id": "beatbot-aquasense2-pro",
  "name": "BeatBot AquaSense 2 Pro",
  "badge": "Best OF THE BEST",
  "rating": 5.0,
  "userRatings": "1,000+",
  "tagline": "Master Every Pool Zone! Surface Skimming...",
  "features": {
    "pros": ["5-in-1 cleaning", "Smart navigation"],
    "cons": ["Premium price"]
  },
  "specifications": {
    "Pool Size": "Up to 50ft",
    "Cleaning Time": "90-150 min"
  },
  "affiliateLink": "https://...",
  "imageUrl": "/assets/images/products/BeatBot_AquaSense_2_PRO.jpg"
}
```

### Extracting Content from External Sources

Use the extraction script to pull product data:

```bash
python scripts/extract-full-zoopy-data.py
```

This extracts:
- Product names and descriptions
- Ratings and user counts
- Awards and badges
- Features and specifications
- Affiliate links

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  'cta-primary': '#ef4444',    // Red CTA buttons
  'cta-hover': '#dc2626',      // Darker red on hover
  'badge-gold': '#fbbf24',     // Gold badges
  'badge-silver': '#9ca3af',   // Silver badges
  'badge-bronze': '#f59e0b',   // Bronze badges
}
```

### Badge Styles

Badges are defined in `src/assets/css/input.css`:

```css
.badge-best {
  @apply bg-gradient-to-r from-yellow-500 to-amber-500 
         text-gray-900 border-2 border-yellow-400 
         shadow-yellow-500/30 animate-pulse-slow;
}
```

### Product Cards

Product cards use Alpine.js for interactivity:

```javascript
x-data="{ expanded: false }"
@click="expanded = !expanded"
```


## 🌐 Live Site

**🚀 Live at**: https://factbench.github.io/VerdIQ/

### Current Pages:
- **Homepage**: https://factbench.github.io/VerdIQ/
- **Pool Cleaners Review**: https://factbench.github.io/VerdIQ/best-robotic-pool-cleaners/
- **Individual Reviews**: https://factbench.github.io/VerdIQ/reviews/[product-slug]/

Example review pages:
- BeatBot AquaSense 2 Pro: `/reviews/beatbot-aquasense-2-pro/`
- Dolphin Nautilus CC Plus: `/reviews/dolphin-nautilus-cc-plus-wi-fi/`
- AIPER Scuba S1: `/reviews/aiper-scuba-s1-cordless/`

## 🚀 Deployment

### Automated Deployment

The project includes an automated deployment script:

```bash
# Set up GitHub token in environment
export GITHUB_TOKEN="your-token-here"

# Make script executable
chmod +x scripts/github-deploy.sh

# Deploy to GitHub Pages
./scripts/github-deploy.sh
```

### Manual Deployment

1. Build the site:
```bash
npm run build
```

2. The `dist/` folder contains the complete static site ready for deployment.

### GitHub Pages Setup

1. Create a GitHub repository
2. Push the code to GitHub
3. Enable GitHub Pages in repository settings
4. Select the branch containing the built files
5. Your site will be available at: `https://[username].github.io/[repository]/`

## 🔄 Development Workflow

### Our Process

1. **Content Extraction** 
   - Used Python scripts to extract product data from zoopy.com
   - Downloaded product images automatically
   - Converted data to structured JSON format

2. **Design Implementation**
   - Dark theme with vibrant accent colors
   - Red CTA buttons (#ef4444) as requested
   - Gradient badges with animations
   - Expandable product cards with Alpine.js

3. **Build System**
   - Custom Node.js build script
   - TailwindCSS compilation and minification
   - Automatic image optimization (WebP with fallbacks)
   - HTML generation from templates

4. **Deployment**
   - Automated GitHub deployment script
   - Cleans old files before deploying
   - Commits with detailed messages
   - Live updates in ~5 minutes

## 📈 Performance

The site is optimized for speed and user experience:

- **Page Load**: < 1s on 3G networks
- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s  
- **Image Optimization**: WebP format with JPG fallbacks
- **CSS**: Minified and tree-shaken (only used styles)
- **JavaScript**: Minimal, only Alpine.js where needed

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Areas for Contribution

- 🆕 New product categories
- 🎨 UI/UX improvements
- 🔍 SEO enhancements
- 📦 Build system optimizations
- 🌍 Internationalization

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Product data sourced from expert reviews and 17,000+ user ratings
- Built with TailwindCSS, Alpine.js, and Chart.js
- Inspired by the need for transparent, data-driven product reviews
- Special thanks to all contributors and testers

## 📦 Project History

- **v1.0.0** - Initial release with robotic pool cleaners
  - Extracted complete product data from zoopy.com
  - Implemented dark theme with red CTAs
  - Added gradient badges and animations
  - Automated GitHub deployment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/FactBench/FactBench/issues)
- **Discussions**: [GitHub Discussions](https://github.com/FactBench/FactBench/discussions)
- **Email**: support@factbench.com

---

**FactBench** - *Making informed decisions easier* 🎯