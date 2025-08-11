#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const IMAGE_SIZES = {
  thumbnail: { width: 150, suffix: '-thumb' },
  small: { width: 400, suffix: '-sm' },
  medium: { width: 800, suffix: '-md' },
  large: { width: 1200, suffix: '-lg' }
};

async function optimizeImage(inputPath, outputDir) {
  const ext = path.extname(inputPath).toLowerCase();
  const basename = path.basename(inputPath, ext);
  
  if (!SUPPORTED_FORMATS.includes(ext)) {
    console.log(`⏭️  Skipping ${inputPath} (unsupported format)`);
    return;
  }

  console.log(`🖼️  Optimizing ${path.basename(inputPath)}...`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Create WebP version at original size
    await image
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, `${basename}.webp`));
    
    // Create optimized JPEG fallback
    if (ext === '.png' && !metadata.hasAlpha) {
      await image
        .jpeg({ quality: 85, progressive: true })
        .toFile(path.join(outputDir, `${basename}.jpg`));
    } else if (ext !== '.png') {
      await image
        .jpeg({ quality: 85, progressive: true })
        .toFile(path.join(outputDir, `${basename}.jpg`));
    }

    // Create responsive sizes
    for (const [sizeName, config] of Object.entries(IMAGE_SIZES)) {
      if (metadata.width > config.width) {
        // WebP version
        await image
          .resize(config.width)
          .webp({ quality: 80 })
          .toFile(path.join(outputDir, `${basename}${config.suffix}.webp`));
        
        // JPEG fallback
        await image
          .resize(config.width)
          .jpeg({ quality: 80, progressive: true })
          .toFile(path.join(outputDir, `${basename}${config.suffix}.jpg`));
      }
    }
    
    console.log(`✅ Optimized ${basename} (WebP + JPEG fallbacks)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(inputDir, outputDir) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const stat = fs.statSync(inputPath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      const subOutputDir = path.join(outputDir, file);
      await processDirectory(inputPath, subOutputDir);
    } else {
      await optimizeImage(inputPath, outputDir);
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting image optimization...\n');
  
  const srcImagesDir = path.join(__dirname, '..', 'src', 'assets', 'images');
  const distImagesDir = path.join(__dirname, '..', 'dist', 'assets', 'images');
  
  if (!fs.existsSync(srcImagesDir)) {
    console.log('❌ Source images directory not found');
    return;
  }
  
  await processDirectory(srcImagesDir, distImagesDir);
  
  // Copy SVG files directly (no optimization needed)
  const svgFiles = fs.readdirSync(srcImagesDir).filter(f => f.endsWith('.svg'));
  svgFiles.forEach(file => {
    fs.copyFileSync(
      path.join(srcImagesDir, file),
      path.join(distImagesDir, file)
    );
    console.log(`📋 Copied ${file}`);
  });
  
  console.log('\n✅ Image optimization complete!');
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  main().catch(console.error);
} catch (e) {
  console.log('📦 Installing sharp for image optimization...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
  console.log('✅ Sharp installed. Please run the build again.');
}