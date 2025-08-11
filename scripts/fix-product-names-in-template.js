#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read product data
const dataPath = path.join(__dirname, '..', 'src', 'data', 'pool-cleaners-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Read template
const templatePath = path.join(__dirname, '..', 'src', 'pages', 'best-robotic-pool-cleaners.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Product name mappings (old -> new)
const nameMappings = {
    'Dolphin E10': 'Dolphin E10 (2025 Model)',
    'Polaris PCX 868 iQ': 'Polaris PCX 868 iQ',
    'BeatBot AquaSense 2 Ultra': 'BeatBot AquaSense 2 Ultra',
    'AIPER Scuba X1 Cordless': 'AIPER Scuba X1 Cordless',
    'Dolphin Premier': 'Dolphin Premier',
    'Polaris 9550 Sport Robotic': 'Polaris 9550 Sport Robotic'
};

console.log('🔧 Fixing product names in template...\n');

// Fix each product name
Object.entries(nameMappings).forEach(([oldName, newName]) => {
    // Fix h3 tags
    const h3Pattern = new RegExp(`(<h3[^>]*>)${oldName}(</h3>)`, 'g');
    const h3Replacement = `$1${newName}$2`;
    const h3Matches = template.match(h3Pattern);
    if (h3Matches) {
        template = template.replace(h3Pattern, h3Replacement);
        console.log(`✓ Fixed h3: ${oldName} → ${newName}`);
    }
    
    // Fix alt attributes
    const altPattern = new RegExp(`(alt=")${oldName}(")`,'g');
    const altReplacement = `$1${newName}$2`;
    const altMatches = template.match(altPattern);
    if (altMatches) {
        template = template.replace(altPattern, altReplacement);
        console.log(`✓ Fixed alt: ${oldName} → ${newName}`);
    }
    
    // Fix table entries
    const tablePattern = new RegExp(`(<div[^>]*class="font-semibold"[^>]*>)${oldName}(</div>)`, 'g');
    const tableReplacement = `$1${newName}$2`;
    const tableMatches = template.match(tablePattern);
    if (tableMatches) {
        template = template.replace(tablePattern, tableReplacement);
        console.log(`✓ Fixed table: ${oldName} → ${newName}`);
    }
});

// Write updated template
fs.writeFileSync(templatePath, template);

console.log('\n✅ Product names fixed in template');
console.log('\nNow rebuild: npm run build');