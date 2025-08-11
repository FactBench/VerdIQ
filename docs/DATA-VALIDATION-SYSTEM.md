# Data Validation System for FactBench

This document explains the comprehensive data validation system implemented to prevent fake or invented data from appearing on the FactBench website.

## 🎯 Overview

The system consists of multiple layers of protection:

1. **Golden Data** - Verified source data stored separately
2. **Chunk Processing** - Large datasets split into manageable pieces
3. **Validation Pipeline** - Multi-step verification process
4. **Staging Area** - Safe environment for AI-generated content
5. **Pre-deployment Checks** - Final verification before going live

## 📁 Directory Structure

```
FactBench/
├── golden-data/              # Verified source data
│   ├── manifest.json        # Hash registry of all golden data
│   ├── products/            # Product data chunks
│   │   ├── chunk-001.json   # 5 products per chunk
│   │   ├── chunk-002.json
│   │   └── chunk-003.json
│   └── backups/             # Timestamped backups
├── staging/                 # AI content staging area
│   ├── ai-generated/        # Raw AI output
│   ├── pending-review/      # Awaiting human review
│   ├── approved/            # Ready for integration
│   └── integrated/          # Archive of integrated content
└── scripts/                 # Validation scripts
    ├── validate-data.js
    ├── generate-manifest.js
    ├── validate-ai-content.js
    ├── pre-deploy-verify.js
    └── integrate-approved-content.js
```

## 🔐 Golden Data System

### Purpose
Golden data represents the verified, trusted source of truth for all product information. Any changes to production data must be validated against this golden standard.

### Creating Golden Data
```bash
# Generate golden data chunks from verified source
node scripts/generate-manifest.js --split

# This creates:
# - Chunks of 5 products each in golden-data/products/
# - manifest.json with SHA-256 hashes of each chunk
```

### Manifest Structure
```json
{
  "version": "1.0.0",
  "generated": "2025-07-31T14:30:02.311Z",
  "chunks": {
    "chunk-001": {
      "file": "chunk-001.json",
      "hash": "f877ccfd58d8b149...",
      "productCount": 5,
      "products": [...]
    }
  }
}
```

## 🔍 Validation Scripts

### 1. validate-data.js
Validates current production data against golden data.

**Features:**
- Checks required fields (name, rating, price, etc.)
- Validates data types and ranges
- Compares SHA-256 hashes with golden data
- Detects suspicious patterns

**Usage:**
```bash
node scripts/validate-data.js
```

**Output:**
- ✅ All validations passed
- ❌ Validation failed with errors
- ⚠️ Warnings for non-critical issues
- validation-report.json with details

### 2. validate-ai-content.js
Specifically designed to validate AI-generated content.

**Checks for:**
- Placeholder text (lorem ipsum, etc.)
- AI hallucination patterns
- Unrealistic data (ratings > 5, etc.)
- Missing required fields
- Invalid affiliate links

**Usage:**
```bash
node scripts/validate-ai-content.js staging/ai-generated/products/new-product.json
```

### 3. pre-deploy-verify.js
Comprehensive pre-deployment verification.

**Steps:**
1. Run data validation
2. Build the site
3. Verify build output
4. Check data consistency in HTML
5. Generate deployment report

**Usage:**
```bash
node scripts/pre-deploy-verify.js
```

## 📦 Chunk Processing

### Why Chunks?
- Manageable file sizes for review
- Easier diff tracking in git
- Parallel processing capability
- Granular validation

### Chunk Size
Default: 5 products per chunk
- Small enough for manual review
- Large enough to be efficient
- Configurable in generate-manifest.js

## 🤖 AI Content Workflow

### 1. Generation
AI generates content → Save to `staging/ai-generated/`

### 2. Validation
```bash
node scripts/validate-ai-content.js staging/ai-generated/products/new.json
```

### 3. Review
If validation passes → Move to `staging/pending-review/`

### 4. Approval
After human review → Move to `staging/approved/`

### 5. Integration
```bash
node scripts/integrate-approved-content.js
```

## 🚀 Pre-Deployment Checklist

The pre-deploy-verify.js script ensures:

- [ ] Data validation passes
- [ ] Build completes without errors
- [ ] All required files exist
- [ ] Product data appears in HTML
- [ ] No suspicious patterns detected
- [ ] Amazon links are present

## 🛡️ Safety Features

### 1. Hash Verification
Every chunk of golden data has a SHA-256 hash. Any modification is immediately detected.

### 2. Pattern Detection
Suspicious patterns trigger validation failures:
- Placeholder text
- Test data
- AI artifacts
- Unrealistic values

### 3. Rollback Capability
```bash
# Emergency rollback
git revert HEAD
./scripts/github-deploy.sh
```

### 4. Backup System
- Automatic backups before integration
- Timestamped backup directories
- Full restoration capability

## 📊 Example Validation Report

```json
{
  "timestamp": "2025-07-31T15:00:00.000Z",
  "passed": true,
  "errors": [],
  "warnings": [],
  "summary": {
    "totalProducts": 11,
    "errorsFound": 0,
    "warningsFound": 0
  }
}
```

## 🔄 Integration Process

The integrate-approved-content.js script:

1. Creates backup of current data
2. Integrates approved content
3. Updates production data
4. Regenerates golden data
5. Runs validation
6. Archives integrated files

## ⚠️ Common Issues

### "Product not found in HTML"
- Ensure build process includes all products
- Check product ID consistency
- Verify template processing

### "Hash mismatch"
- Data has been modified
- Run diff to see changes
- Update golden data if changes are intentional

### "Suspicious pattern detected"
- Review flagged content
- Remove placeholder text
- Ensure data is realistic

## 🚨 Emergency Procedures

### If fake data appears on live site:

1. **Immediate Action**
   ```bash
   git revert HEAD
   ./scripts/github-deploy.sh
   ```

2. **Investigation**
   - Check validation reports
   - Review staging area
   - Identify bypass point

3. **Prevention**
   - Update validation rules
   - Add new pattern detection
   - Review approval process

## 📈 Best Practices

1. **Always validate before deployment**
   ```bash
   node scripts/pre-deploy-verify.js
   ```

2. **Use staging for all AI content**
   - Never bypass staging area
   - Always run AI validation
   - Require human review

3. **Keep golden data updated**
   - Update after verified changes
   - Maintain backup history
   - Document changes

4. **Monitor validation reports**
   - Check for patterns in warnings
   - Update rules based on findings
   - Track validation metrics

## 🔧 Configuration

### Adjusting chunk size:
Edit `scripts/generate-manifest.js`:
```javascript
splitDataIntoChunks(dataPath, chunkSize = 5)  // Change 5 to desired size
```

### Adding validation patterns:
Edit `scripts/validate-ai-content.js`:
```javascript
this.suspiciousPatterns = [
    // Add new patterns here
    /your-pattern-here/i
];
```

### Modifying required fields:
Edit validation scripts to update field requirements.

---

This system ensures that only verified, validated data makes it to the production website, preventing any fake or AI-hallucinated content from being published.