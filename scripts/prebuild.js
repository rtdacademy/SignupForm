// scripts/prebuild.js
const fs = require('fs');
const path = require('path');

function copyFiles(isSandbox, isSecondSite) {
  try {
    // Clean build directories
    if (fs.existsSync('build')) {
      fs.rmSync('build', { recursive: true });
    }
    
    // For second site, ensure public-second exists
    if (isSecondSite) {
      if (fs.existsSync('public-second')) {
        fs.rmSync('public-second', { recursive: true });
      }
      fs.mkdirSync('public-second', { recursive: true });
    }

    // Clean cache
    if (fs.existsSync('node_modules/.cache')) {
      fs.rmSync('node_modules/.cache', { recursive: true });
    }

    // Ensure public directory exists
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }

    // Copy appropriate index file
    const indexSource = path.join(
      'assets', 
      'templates', 
      isSecondSite ? 'index.second.html' : 'index.main.html'
    );
    
    const faviconSource = path.join(
      'assets', 
      'favicons',
      isSecondSite ? 'edbotz-favicon.svg' : 'Logo.svg'
    );

    // Verify source files exist
    if (!fs.existsSync(indexSource)) {
      throw new Error(`Index template not found: ${indexSource}`);
    }
    
    if (!fs.existsSync(faviconSource)) {
      throw new Error(`Favicon not found: ${faviconSource}`);
    }

    // Copy files
    fs.copyFileSync(indexSource, 'public/index.html');
    fs.copyFileSync(faviconSource, `public/${path.basename(faviconSource)}`);

    console.log('Successfully prepared build environment:', {
      env: isSandbox ? 'sandbox' : 'production',
      site: isSecondSite ? 'second' : 'main',
      indexSource,
      faviconSource,
      directories: {
        public: 'created/verified',
        publicSecond: isSecondSite ? 'created/verified' : 'n/a',
        build: 'cleaned'
      }
    });

    return true;
  } catch (error) {
    console.error('Prebuild failed:', error);
    process.exit(1);
  }
}

// Get environment variables
const isSandbox = process.argv.includes('--sandbox');
const isSecondSite = process.argv.includes('--second-site');

// Execute
copyFiles(isSandbox, isSecondSite);