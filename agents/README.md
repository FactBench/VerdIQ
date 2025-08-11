# FactBench Multi-Agent System

A comprehensive multi-agent system for extracting, validating, and deploying product review data.

## 🤖 Agents Overview

### 1. **ImageExtractorAgent**
- **Purpose**: Downloads all product images including galleries and high-res versions
- **Features**:
  - Handles lazy-loaded images
  - Downloads multiple resolutions (srcset)
  - Extracts alt text and captions
  - Creates organized folder structure
  - Generates image manifest

### 2. **TextExtractorAgent**
- **Purpose**: Extracts all text content including descriptions and specifications
- **Features**:
  - Extracts product descriptions
  - Captures features (pros/cons)
  - Gets page metadata
  - Preserves content structure
  - Handles dynamic content

### 3. **TableExtractorAgent**
- **Purpose**: Extracts all table data including comparisons and specifications
- **Features**:
  - Finds all HTML tables
  - Handles div-based tables
  - Extracts comparison matrices
  - Exports to CSV/JSON
  - Preserves cell formatting

### 4. **ReviewExtractorAgent**
- **Purpose**: Extracts product reviews and links to original reviews
- **Features**:
  - Extracts inline reviews
  - Follows review links
  - Captures ratings and dates
  - Links to source reviews
  - Calculates review statistics

### 5. **ValidationAgent**
- **Purpose**: Validates completeness and quality of extracted data
- **Features**:
  - Checks data completeness
  - Cross-validates sources
  - Calculates quality score
  - Generates recommendations
  - Creates action checklist

### 6. **DeploymentAgent**
- **Purpose**: Builds and deploys the site with validated data
- **Features**:
  - Pre-deployment checks
  - Data integration
  - Site building
  - GitHub deployment
  - Post-deployment validation

## 🚀 Quick Start

### Run All Agents

```bash
# Extract from zoopy.com and deploy
python agents/run_all_agents.py https://zoopy.com/best-robotic-pool-cleaners

# Extract and validate only (skip deployment)
python agents/run_all_agents.py https://zoopy.com/best-robotic-pool-cleaners --skip-deployment
```

### Run Individual Agents

```python
from agents import ImageExtractorAgent

# Run image extraction
agent = ImageExtractorAgent()
results = agent.run("https://zoopy.com/best-robotic-pool-cleaners")
```

## 📁 Output Structure

```
extraction-workspace/
├── images/
│   ├── products/          # Product images by ID
│   │   ├── beatbot-aquasense-2-pro/
│   │   │   ├── main.jpg
│   │   │   └── gallery-*.jpg
│   │   └── [other-products]/
│   └── image_manifest.json
├── text/
│   ├── complete_text_content.json
│   ├── product_descriptions.json
│   └── product_features.json
├── tables/
│   ├── all_tables_data.json
│   ├── main_comparison_table.csv
│   └── consolidated_specifications.json
├── reviews/
│   ├── all_reviews_data.json
│   ├── review_summary.json
│   └── reviews_[product-id].json
└── validation/
    ├── validation_report_*.json
    ├── validation_summary.json
    └── action_checklist.json
```

## 🔧 Installation

1. Install Python dependencies:
```bash
pip install playwright beautifulsoup4 pandas requests
playwright install chromium
```

2. Install Node.js dependencies (for deployment):
```bash
npm install
```

## 📊 Validation Criteria

The ValidationAgent checks for:

- **Images**: Every product must have at least 1 image
- **Text**: Products need descriptions > 100 characters
- **Tables**: Complete comparison table required
- **Reviews**: At least 50% of products need reviews

Quality score must be ≥ 60% for deployment.

## 🚨 Error Handling

All agents include:
- Automatic retry for failed downloads
- Progress saving for resumability
- Detailed error logging
- Graceful failure handling

## 📝 Logs

Each agent creates timestamped logs in `extraction-workspace/logs/`:
- `ImageExtractorAgent_YYYYMMDD_HHMMSS.log`
- `TextExtractorAgent_YYYYMMDD_HHMMSS.log`
- etc.

## 🔄 Workflow

1. **Extraction Phase** (Parallel)
   - ImageExtractorAgent
   - TextExtractorAgent  
   - TableExtractorAgent
   - ReviewExtractorAgent

2. **Validation Phase**
   - ValidationAgent analyzes all data
   - Generates quality report
   - Creates recommendations

3. **Deployment Phase**
   - DeploymentAgent integrates data
   - Builds static site
   - Deploys to GitHub Pages

## ⚙️ Configuration

Agents use these environment variables:
- `GITHUB_TOKEN`: For deployment (required)
- `WORKSPACE_DIR`: Custom workspace location (optional)

## 🐛 Troubleshooting

### "No module named playwright"
```bash
pip install playwright
playwright install chromium
```

### "GitHub token not found"
```bash
export GITHUB_TOKEN="your_github_token"
```

### "Build failed"
Check Node.js dependencies:
```bash
npm install
npm run build
```

## 📈 Performance

- Parallel extraction: ~2-5 minutes
- Validation: ~30 seconds
- Build & deployment: ~2 minutes
- **Total time**: ~5-8 minutes

## 🤝 Contributing

To add a new agent:

1. Extend `BaseAgent` class
2. Implement `extract()` method
3. Implement `validate_results()` method
4. Add to orchestrator pipeline

---

*Built for the FactBench project - Making product research transparent and data-driven*