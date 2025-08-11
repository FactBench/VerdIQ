# STEP 1 - INTRO SECTION INSTRUCTIONS

## Overview
Step 1 establishes the foundation for any product review page by setting up the intro section and basic page template.

## Data Sources

### Before Starting Step 1
**IMPORTANT**: Always ask the master for data sources before beginning any work.

### Required Information
1. **Data folder location** - Where to find source data
2. **Data format** - HTML, JSON, or other format
3. **Specific elements** - Which title/subtitle to use if multiple exist

### Preferred Data Formats

#### 1. HTML file (Best option ⭐)
- Complete webpage saved as .html or .txt
- Contains all elements in original structure
- Easiest to search with Grep
- Example: `str-best-robot-all data.txt`

#### 2. JSON file (Good for structured data)
- Pre-extracted data in JSON format
- Good when data is already processed
- Example: `pool-cleaners-complete.json`

#### 3. Multiple files
- Sometimes data is split across files
- Master will specify which files to use

### Data Request Template
```
Before starting Step 1, I need:
- Location of source data folder
- Which file(s) contain the intro section data
- Preferred format for extraction (if multiple formats available)
- Any specific instructions for this page
```

## What Step 1 Includes

### 1. Title (H1)
- Main page headline
- Should be concise and SEO-friendly
- Example: "11 Best Robotic Pool Cleaners 2025"

### 2. Subtitle (H2)
- Supporting headline that elaborates on the main title
- Should highlight the value proposition
- Example: "Stop Wasting Time & Money on Pool Care - Our Experts Found Your Perfect Solution"

### 3. Last Updated Date
- Shows content freshness
- Format: "Last updated: [Month] [Year]" or "Last updated: [Day] [Month] [Year]"
- Example: "Last updated: 1st August 2025"

### 4. Disclaimer
- Commission disclosure for transparency
- Should be in the same line as the date
- Format: "[Date] • When you buy through our links, we may earn a commission. [Learn more link]"
- The "Learn more" link can point to future About/Disclosure page

### 5. Basic Page Template
- HTML structure ready for additional content
- Proper SEO meta tags
- Navigation and footer
- Dark theme styling
- Responsive design

## Implementation Steps

### Step 1.0 - Request Data Sources
1. Ask master for data location and format
2. Verify access to all required files
3. Confirm which elements to extract

### Step 1.1 - Data Preparation
1. Extract title, subtitle, and other intro data from source
2. Store in structured JSON format in `step1-intro/intro-data.json`

### Step 1.2 - HTML Updates
1. Update page title tag
2. Update H1 and H2 elements
3. Update last updated date to current date
4. Add disclaimer in the same line as date

### Step 1.3 - Build & Deploy
1. Run `npm run build`
2. Test locally with `npm run preview`
3. Deploy with `./scripts/github-deploy.sh`

## File Structure
```
best-system-v1/
└── step1-intro/
    ├── intro-data.json          # Extracted data
    ├── STEP1-INSTRUCTIONS.md    # This file
    └── report.md                # Implementation report
```

## Key Files to Modify
- `/src/pages/[page-name].html` - Main HTML file
- Update build scripts if needed

## Important Notes

### What NOT to Include in Step 1
- Hero images
- Long intro paragraphs
- Product data
- Comparison tables
- Any complex content

### Keep It Simple
Step 1 is just the basic intro elements. This creates a clean foundation for subsequent steps to build upon.

### Date Format
Always update to the current date when implementing, not the date from source data.

## Example Implementation

```html
<!-- Title -->
<h1 class="text-4xl md:text-6xl font-display font-bold mb-6">
    <span class="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
        11 Best Robotic Pool Cleaners 2025
    </span>
</h1>

<!-- Subtitle -->
<p class="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
    Stop Wasting Time & Money on Pool Care - Our Experts Found Your Perfect Solution
</p>

<!-- Date & Disclaimer -->
<p class="text-sm text-gray-500 mt-8">
    <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    Last updated: <time>1st August 2025</time> • When you buy through our links, we may earn a commission. <a href="#" class="text-primary hover:text-primary-focus underline">Learn more</a>
</p>
```

## Success Criteria
- ✅ Clean, professional intro section
- ✅ Current date displayed
- ✅ Commission disclaimer visible
- ✅ Page ready for additional content in future steps
- ✅ Successfully deployed to live site

## Data Extraction Tips

### For HTML Files
```bash
# Search for title/heading
grep -i "h1\|title" filename.html

# Search for specific text
grep -A 5 -B 5 "specific text" filename.html
```

### For JSON Files
- Use Read tool to view structure
- Extract relevant fields directly

---

Last updated: 1st August 2025
Version: 1.1