#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// SVG favicon content
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- Background -->
  <rect width="32" height="32" rx="6" fill="#0f172a"/>
  
  <!-- Border -->
  <rect width="32" height="32" rx="6" fill="none" stroke="#0ea5e9" stroke-width="1.5"/>
  
  <!-- Magnifying glass for analysis -->
  <g transform="translate(8, 8)">
    <!-- Glass circle -->
    <circle cx="7" cy="7" r="5" fill="none" stroke="#0ea5e9" stroke-width="1.5"/>
    <!-- Glass handle -->
    <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
    
    <!-- Chart bars inside glass -->
    <rect x="4.5" y="6" width="1" height="3" fill="#14b8a6"/>
    <rect x="6.5" y="4.5" width="1" height="4.5" fill="#06b6d4"/>
    <rect x="8.5" y="5.5" width="1" height="3.5" fill="#14b8a6"/>
  </g>
  
  <!-- Checkmark -->
  <circle cx="22" cy="22" r="4" fill="#22c55e" opacity="0.2"/>
  <path d="M 19.5 22 L 21 23.5 L 24.5 20" stroke="#22c55e" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Create different sizes by modifying viewBox
const sizes = [16, 32, 48, 64, 128, 192, 512];

const distDir = path.join(__dirname, '..', 'dist');

// Save SVG favicon
fs.writeFileSync(path.join(distDir, 'favicon.svg'), faviconSVG);
console.log('✓ Created favicon.svg');

// Create sized versions
sizes.forEach(size => {
    const sizedSVG = faviconSVG.replace('width="32" height="32"', `width="${size}" height="${size}"`);
    const filename = `favicon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(distDir, filename), sizedSVG);
    console.log(`✓ Created ${filename}`);
});

// Create apple-touch-icon
const appleTouchIcon = faviconSVG
    .replace('width="32" height="32"', 'width="180" height="180"')
    .replace('viewBox="0 0 32 32"', 'viewBox="0 0 32 32" style="background: #0f172a"');
fs.writeFileSync(path.join(distDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('✓ Created apple-touch-icon.svg');

// Create manifest.json for PWA
const manifest = {
    "name": "FactBench",
    "short_name": "FactBench",
    "description": "Expert Product Analysis Platform",
    "theme_color": "#0ea5e9",
    "background_color": "#0f172a",
    "display": "standalone",
    "icons": [
        {
            "src": "/VerdIQ/favicon-192x192.svg",
            "sizes": "192x192",
            "type": "image/svg+xml"
        },
        {
            "src": "/VerdIQ/favicon-512x512.svg",
            "sizes": "512x512",
            "type": "image/svg+xml"
        }
    ]
};

fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ Created manifest.json');

console.log('\n✅ All favicon files generated successfully!');