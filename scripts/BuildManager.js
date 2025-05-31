const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildManager {
  constructor(options = {}) {
    this.isSandbox = options.isSandbox;
    this.isSecondSite = options.isSecondSite;
    this.memorySize = options.memorySize || 2048; // Default to 2GB
    this.maxRetries = options.maxRetries || 3;
    this.currentRetry = 0;
    this.cleanOnly = options.cleanOnly || false;
    this.isStart = options.isStart || false;
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
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }
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

    console.log('Successfully prepared environment:', {
      env: this.isSandbox ? 'sandbox' : 'production',
      site: this.isSecondSite ? 'second' : 'main',
      indexSource,
      faviconSource,
      directories: {
        public: 'created/verified',
        publicSecond: this.isSecondSite ? 'created/verified' : 'n/a',
        build: 'cleaned'
      }
    });
  }

  copyBuildToPublicSecond() {
    console.log('Copying build files to public-second directory...');
    
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyRecursive('build', 'public-second');
    console.log('Files copied successfully to public-second directory');
  }

  async execute() {
    if (this.cleanOnly) {
      return true;
    }

    try {
      const envFile = this.isSecondSite 
        ? `.env.${this.isSandbox ? 'development' : 'production'}.second`
        : `.env.${this.isSandbox ? 'development' : 'production'}`;

      const command = this.isStart
        ? `cross-env NODE_OPTIONS=--max-old-space-size=${this.memorySize} env-cmd -f ${envFile} react-scripts start`
        : `cross-env NODE_OPTIONS=--max-old-space-size=${this.memorySize} GENERATE_SOURCEMAP=false env-cmd -f ${envFile} react-scripts build`;
      
      if (!this.isStart) {
        console.log(`\nExecuting build (Attempt ${this.currentRetry + 1}/${this.maxRetries}):`);
        console.log(`Memory allocated: ${this.memorySize}MB`);
      }
      console.log(`Environment: ${envFile}`);

      execSync(command, { stdio: 'inherit' });

      if (!this.isStart && this.isSecondSite) {
        this.copyBuildToPublicSecond();
      }

      return true;
    } catch (error) {
      // Development server errors (start mode)
      if (this.isStart) {
        console.error('Development server crashed:', error.message);
        console.log('Development server exited. Please restart manually.');
        return false;
      }

      // Build errors (build mode)
      console.error(`Build attempt ${this.currentRetry + 1} failed:`, error.message);
      
      if (this.currentRetry < this.maxRetries - 1) {
        this.currentRetry++;
        // Only increase memory if we're not already at max
        const newMemory = Math.min(this.memorySize + 512, 4096); // Cap at 4GB
        if (newMemory > this.memorySize) {
          this.memorySize = newMemory;
          console.log(`Increasing memory to ${this.memorySize}MB for next attempt...`);
        }
        return this.execute();
      }
      
      return false;
    }
  }
}

module.exports = BuildManager;