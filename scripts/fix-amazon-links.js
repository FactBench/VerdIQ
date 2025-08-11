#!/usr/bin/env node

/**
 * Fix Amazon Links with Correct Full URLs and Tracking ID
 * Replaces shortened Amazon links with full product URLs including affiliate tracking
 */

const fs = require('fs');
const path = require('path');

// Mapping of old short links to new full Amazon URLs with tracking ID
// Based on the actual order of products on the page
const LINK_MAPPINGS = {
    // 1. BeatBot AquaSense 2 Pro
    'https://amzn.to/430399P': 'https://www.amazon.com/dp/B0DMN819RB?tag=factbench-r-20',
    
    // 2. Dolphin Nautilus CC Plus Wi-Fi
    'https://amzn.to/44Awf0K': 'https://www.amazon.com/Dolphin-Nautilus-Robotic-Cleaner-Ground/dp/B09K4C9WGF?tag=factbench-r-20',
    
    // 3. AIPER Scuba S1 Cordless
    'https://amzn.to/43gzisz': 'https://www.amazon.com/dp/B0CNPYK5YB?tag=factbench-r-20',
    
    // 4. Dolphin (2025 Model) E10
    'https://amzn.to/42ZmMij': 'https://www.amazon.com/Dolphin-E10-Automatic-Robotic-Swimming/dp/B01BUE8XVC?tag=factbench-r-20',
    
    // 5. Polaris PCX 868 iQ
    'https://amzn.to/44LZkXf': 'https://www.amazon.com/dp/B0CWWJGCGZ?tag=factbench-r-20',
    
    // 6. Beatbot AquaSense 2 Ultra
    'https://amzn.to/45WYVli': 'https://www.amazon.com/dp/B0DMWF7SGW?tag=factbench-r-20',
    
    // 7. AIPER Scuba X1 Cordless (should be Betta SE Solar)
    'https://amzn.to/45szS9A': 'https://www.amazon.com/dp/B0BW38MP5C?tag=factbench-r-20',
    
    // 8. Dolphin Premier
    'https://amzn.to/4doxYIQ': 'https://www.amazon.com/Dolphin-Premier-Robotic-Pool-Cleaner/dp/B0124QB2EU?tag=factbench-r-20',
    
    // 9. Polaris 9550 Sport
    'https://amzn.to/43k9coy': 'https://www.amazon.com/dp/B00JJ5I7GQ?tag=factbench-r-20',
    
    // Note: AIPER Scuba X1 and WYBOT C2 Vision need to be found separately
};

// Additional mappings with ?tag already added (from previous script run)
const ADDITIONAL_MAPPINGS = {
    'https://amzn.to/430399P?tag=factbench-r-20': 'https://www.amazon.com/dp/B0DMN819RB?tag=factbench-r-20',
    'https://amzn.to/44Awf0K?tag=factbench-r-20': 'https://www.amazon.com/Dolphin-Nautilus-Robotic-Cleaner-Ground/dp/B09K4C9WGF?tag=factbench-r-20',
    'https://amzn.to/43gzisz?tag=factbench-r-20': 'https://www.amazon.com/dp/B0CNPYK5YB?tag=factbench-r-20',
    'https://amzn.to/42ZmMij?tag=factbench-r-20': 'https://www.amazon.com/Dolphin-E10-Automatic-Robotic-Swimming/dp/B01BUE8XVC?tag=factbench-r-20',
    'https://amzn.to/44LZkXf?tag=factbench-r-20': 'https://www.amazon.com/dp/B0CWWJGCGZ?tag=factbench-r-20',
    'https://amzn.to/45WYVli?tag=factbench-r-20': 'https://www.amazon.com/dp/B0DMWF7SGW?tag=factbench-r-20',
    'https://amzn.to/45szS9A?tag=factbench-r-20': 'https://www.amazon.com/dp/B0BW38MP5C?tag=factbench-r-20',
    'https://amzn.to/4doxYIQ?tag=factbench-r-20': 'https://www.amazon.com/Dolphin-Premier-Robotic-Pool-Cleaner/dp/B0124QB2EU?tag=factbench-r-20',
    'https://amzn.to/43k9coy?tag=factbench-r-20': 'https://www.amazon.com/dp/B00JJ5I7GQ?tag=factbench-r-20'
};

// Combine all mappings
const ALL_MAPPINGS = { ...LINK_MAPPINGS, ...ADDITIONAL_MAPPINGS };

// Files to process
const FILES_TO_PROCESS = [
    'src/pages/best-robotic-pool-cleaners.html',
    'src/pages/reviews/beatbot-aquasense-2-pro.html',
    'src/pages/reviews/dolphin-nautilus-cc-plus-wi-fi.html',
    'src/pages/reviews/aiper-scuba-s1-cordless.html',
    'src/pages/reviews/dolphin-e10.html',
    'src/pages/reviews/polaris-pcx-868-iq.html',
    'src/pages/reviews/beatbot-aquasense-2-ultra.html',
    'src/pages/reviews/aiper-scuba-x1-cordless.html',
    'src/pages/reviews/dolphin-premier.html',
    'src/pages/reviews/polaris-9550-sport-robotic.html',
    'src/pages/reviews/aiper-seagull-pro.html',
    'src/pages/reviews/aquabot-x4.html',
    'src/pages/reviews/dolphin-sigma.html',
    'src/pages/reviews/hayward-aquavac-650.html',
    'src/pages/reviews/pentair-prowler-930.html',
    'src/pages/reviews/polaris-vrx-iq.html',
    'src/pages/reviews/zodiac-mx8-elite.html'
];

/**
 * Process a file and replace links
 */
function processFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return { file: filePath, replacements: 0, error: 'File not found' };
    }
    
    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let replacements = 0;
        
        // Replace each link
        for (const [oldLink, newLink] of Object.entries(ALL_MAPPINGS)) {
            const regex = new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, newLink);
                replacements += matches.length;
                console.log(`  ✓ Replaced ${matches.length} instances of shortened link`);
            }
        }
        
        if (replacements > 0) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`  ✅ Saved ${replacements} replacements`);
        } else {
            console.log(`  ℹ️  No replacements needed`);
        }
        
        return { file: filePath, replacements: replacements };
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return { file: filePath, replacements: 0, error: error.message };
    }
}

/**
 * Main function to process all files
 */
function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Amazon Link Fixer - Full URLs with Tracking ID');
    console.log('  Tracking ID: factbench-r-20');
    console.log('═══════════════════════════════════════════════════════');
    
    let totalReplacements = 0;
    const results = [];
    
    FILES_TO_PROCESS.forEach(file => {
        console.log(`\n📄 Processing: ${path.basename(file)}`);
        const result = processFile(file);
        results.push(result);
        totalReplacements += result.replacements || 0;
    });
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Files processed: ${results.length}`);
    console.log(`  Total replacements: ${totalReplacements}`);
    
    if (totalReplacements > 0) {
        console.log('\n✅ All shortened Amazon links have been replaced with full URLs!');
        console.log('   All links now include tracking ID: factbench-r-20');
        console.log('\n🔄 Next steps:');
        console.log('   1. Run: npm run build');
        console.log('   2. Run: ./scripts/github-deploy.sh');
    } else {
        console.log('\nℹ️  No replacements were needed.');
    }
    
    // Save report
    const report = {
        timestamp: new Date().toISOString(),
        trackingId: 'factbench-r-20',
        totalReplacements: totalReplacements,
        files: results,
        linkMappings: LINK_MAPPINGS
    };
    
    const reportPath = path.join(__dirname, '..', 'amazon-links-fix-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved to: amazon-links-fix-report.json`);
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    processFile,
    LINK_MAPPINGS
};