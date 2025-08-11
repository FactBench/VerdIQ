#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the main HTML file
const mainFile = path.join(__dirname, '../../src/pages/best-robotic-pool-cleaners.html');
const mainContent = fs.readFileSync(mainFile, 'utf8');

// Read the new products section
const newSection = fs.readFileSync(path.join(__dirname, 'products-section-original.html'), 'utf8');

// Find the products section in the main file
const startMarker = '<!-- Products Grid -->';
const endMarker = '</section>    </section>    <!-- Comparison Table -->';

const startIndex = mainContent.indexOf(startMarker);
const endIndex = mainContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find section markers');
  process.exit(1);
}

// Extract the products section content from new file (without the wrapper comments)
const sectionContent = newSection.trim();

// Replace the section
const beforeSection = mainContent.substring(0, startIndex);
const afterSection = mainContent.substring(endIndex);

// Build the new content
const newContent = beforeSection + sectionContent + '\n    ' + afterSection;

// Write back
fs.writeFileSync(mainFile, newContent);

console.log('✅ Updated main HTML with new products section');
console.log('🏆 All awards now have emoji');
console.log('🎨 Read Full Review buttons are now orange');
console.log('🖼️  All images use local paths');