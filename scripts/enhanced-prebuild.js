// scripts/enhanced-prebuild.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildManager {
  constructor(options = {}) {
    this.isSandbox = options.isSandbox;
    this.isSecondSite = options.isSecondSite;
    this.memorySize = options.memorySize || 4096;
    this.maxRetries = options.maxRetries || 3;
    this.currentRetry = 0;
  }

  async prepare() {
    try {
      this.cleanDirectories();
      this.copyFiles();
      return true;
    } catch (error) {
      console.error('Preparation failed:', error);
      return false;
    }
  }

  cleanDirectories() {
    // Clean build directory
    if (fs.existsSync('build')) {
      fs.rmSync('build', { recursive: true });
    }

    // Clean second-site directory if needed
    if (this.isSecondSite && fs.existsSync('public-second')) {
      fs.rmSync('public-second', { recursive: true });
    }

    // Clean cache
    if (fs.existsSync('node_modules/.cache')) {
      fs.rmSync('node_modules/.cache', { recursive: true });
    }

    // Ensure directories exist
    fs.mkdirSync('build', { recursive: true });
    if (this.isSecondSite) {
      fs.mkdirSync('public-second', { recursive: true });
    }
  }

  copyFiles() {
    const indexSource = path.join(
      'assets',
      'templates',
      this.isSecondSite ? 'index.second.html' : 'index.main.html'
    );

    const faviconSource = path.join(
      'assets',
      'favicons',
      this.isSecondSite ? 'edbotz-favicon.svg' : 'Logo.svg'
    );

    if (!fs.existsSync(indexSource) || !fs.existsSync(faviconSource)) {
      throw new Error('Required source files missing');
    }

    fs.copyFileSync(indexSource, 'public/index.html');
    fs.copyFileSync(faviconSource, `public/${path.basename(faviconSource)}`);
  }

  async executeBuild() {
    try {
      const envFile = this.isSecondSite 
        ? `.env.development${this.isSandbox ? '.second' : '.production.second'}`
        : `.env.${this.isSandbox ? 'development' : 'production'}`;

      const buildCommand = `cross-env NODE_OPTIONS=--max-old-space-size=${this.memorySize} GENERATE_SOURCEMAP=false env-cmd -f ${envFile} react-scripts build`;
      
      console.log(`\nAttempting build (${this.currentRetry + 1}/${this.maxRetries}):`);
      console.log(`Memory: ${this.memorySize}MB`);
      console.log(`Environment: ${envFile}`);

      execSync(buildCommand, { stdio: 'inherit' });

      if (this.isSecondSite) {
        execSync('cp -r build/* public-second/', { stdio: 'inherit' });
      }

      return true;
    } catch (error) {
      console.error(`Build attempt ${this.currentRetry + 1} failed:`, error.message);
      
      if (this.currentRetry < this.maxRetries - 1) {
        this.currentRetry++;
        this.memorySize = Math.min(this.memorySize + 2048, 8192); // Increase memory, max 8GB
        return this.executeBuild();
      }
      
      return false;
    }
  }
}
