#!/usr/bin/env node

const fs = require('fs');

// Read the HTML file
const htmlPath = '/home/titan/FactBench/src/pages/best-robotic-pool-cleaners.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// Find the old comparison table section that starts with:
// <!-- Comparison Table -->
// <section id="comparison" class="py-16">
// and ends with the closing </section>

// Use a more specific pattern to find the old table
const oldTableStart = html.indexOf('<!-- Comparison Table -->\n    <section id="comparison"');
if (oldTableStart !== -1) {
  // Find the corresponding closing </section> tag
  let depth = 0;
  let pos = oldTableStart;
  let foundStart = false;
  
  while (pos < html.length) {
    if (html.substring(pos, pos + 8) === '<section') {
      if (!foundStart) foundStart = true;
      depth++;
    } else if (html.substring(pos, pos + 10) === '</section>') {
      depth--;
      if (depth === 0 && foundStart) {
        // Found the closing tag
        const oldTableEnd = pos + 10;
        
        // Remove the old table section
        html = html.substring(0, oldTableStart) + html.substring(oldTableEnd);
        console.log('✅ Removed old comparison table section');
        console.log(`   Removed from position ${oldTableStart} to ${oldTableEnd}`);
        break;
      }
    }
    pos++;
  }
} else {
  console.log('⚠️  Could not find old comparison table section');
}

// Save the cleaned HTML
fs.writeFileSync(htmlPath, html);
console.log('✅ Saved cleaned HTML');