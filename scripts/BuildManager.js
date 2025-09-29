const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class BuildManager {
  constructor(options = {}) {
    this.isSandbox = options.isSandbox;
    this.isSecondSite = options.isSecondSite;
    this.isRTDConnect = options.isRTDConnect;
    this.isRTDWebsite = options.isRTDWebsite;
    this.memorySize = options.memorySize || 8192; // Default to 8GB for this large project
    this.maxRetries = options.maxRetries || 3;
    this.currentRetry = 0;
    this.cleanOnly = options.cleanOnly || false;
    this.isStart = options.isStart || false;
    this.memoryMonitorInterval = null;
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
    
    // Clean rtd-connect directory if needed
    if (this.isRTDConnect && fs.existsSync('public-rtdconnect')) {
      fs.rmSync('public-rtdconnect', { recursive: true });
    }

    // Clean rtd-website directory if needed
    if (this.isRTDWebsite && fs.existsSync('public-website')) {
      fs.rmSync('public-website', { recursive: true });
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
    if (this.isRTDConnect) {
      fs.mkdirSync('public-rtdconnect', { recursive: true });
    }
    if (this.isRTDWebsite) {
      fs.mkdirSync('public-website', { recursive: true });
    }
  }

  copyFiles() {
    let indexSource, faviconSource;

    if (this.isRTDWebsite) {
      indexSource = path.join('assets', 'templates', 'index.website.html');
      faviconSource = path.join('assets', 'favicons', 'Logo.svg');
    } else if (this.isRTDConnect) {
      indexSource = path.join('assets', 'templates', 'index.rtdconnect.html');
      faviconSource = path.join('public', 'connectImages', 'Connect.png');
    } else if (this.isSecondSite) {
      indexSource = path.join('assets', 'templates', 'index.second.html');
      faviconSource = path.join('assets', 'favicons', 'edbotz-favicon.svg');
    } else {
      indexSource = path.join('assets', 'templates', 'index.main.html');
      faviconSource = path.join('assets', 'favicons', 'Logo.svg');
    }

    if (!fs.existsSync(indexSource) || !fs.existsSync(faviconSource)) {
      throw new Error('Required source files missing');
    }

    fs.copyFileSync(indexSource, 'public/index.html');
    fs.copyFileSync(faviconSource, `public/${path.basename(faviconSource)}`);

    console.log('Successfully prepared environment:', {
      env: this.isSandbox ? 'sandbox' : 'production',
      site: this.isRTDWebsite ? 'website' : (this.isRTDConnect ? 'rtdconnect' : (this.isSecondSite ? 'second' : 'main')),
      indexSource,
      faviconSource,
      directories: {
        public: 'created/verified',
        publicSecond: this.isSecondSite ? 'created/verified' : 'n/a',
        publicRTDConnect: this.isRTDConnect ? 'created/verified' : 'n/a',
        publicWebsite: this.isRTDWebsite ? 'created/verified' : 'n/a',
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
    
    // Copy static assets from public folder to ensure images are available
    console.log('Copying static assets from public folder...');
    this.copyPublicAssets('public-second');
    
    console.log('Files copied successfully to public-second directory');
  }

  copyBuildToPublicRTDConnect() {
    console.log('Copying build files to public-rtdconnect directory...');

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

    copyRecursive('build', 'public-rtdconnect');

    // Copy static assets from public folder to ensure images are available
    console.log('Copying static assets from public folder...');
    this.copyPublicAssets('public-rtdconnect');

    console.log('Files copied successfully to public-rtdconnect directory');
  }

  copyBuildToPublicWebsite() {
    console.log('Copying build files to public-website directory...');

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

    copyRecursive('build', 'public-website');

    // Copy static assets from public folder to ensure images are available
    console.log('Copying static assets from public folder...');
    this.copyPublicAssets('public-website');

    console.log('Files copied successfully to public-website directory');
  }

  copyPublicAssets(targetDir) {
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // Skip index.html as it's already handled by the build process
        if (entry.name === 'index.html') {
          continue;
        }
        
        if (entry.isDirectory()) {
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    if (fs.existsSync('public')) {
      copyRecursive('public', targetDir);
    }
  }

  formatMemoryUsage(bytes) {
    const mb = (bytes / 1024 / 1024).toFixed(1);
    return `${mb}MB`;
  }

  startMemoryMonitoring() {
    if (!this.isStart) return;

    console.log('\n🧠 Memory Monitor Started - Updates every 5 seconds');
    console.log('💡 Press Ctrl+M to get instant memory report');
    console.log('──────────────────────────────────────────────────');
    
    let lastMemory = 0;
    let peakMemory = 0;

    // Set up keyboard listener for instant memory report
    this.setupKeyboardListener();
    
    this.memoryMonitorInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const currentMemory = memUsage.heapUsed;
      const totalMemory = memUsage.heapTotal;
      
      if (currentMemory > peakMemory) {
        peakMemory = currentMemory;
      }
      
      const memoryChange = currentMemory - lastMemory;
      const changeIndicator = memoryChange > 0 ? '↗️' : memoryChange < 0 ? '↘️' : '➡️';
      const changeAmount = Math.abs(memoryChange);
      
      // Only log if significant change (>1MB) or every 30 seconds
      const significantChange = Math.abs(memoryChange) > 1024 * 1024;
      const timeForRegularUpdate = Date.now() % 30000 < 5000;
      
      if (significantChange || timeForRegularUpdate) {
        //console.log(`📊 Memory: ${this.formatMemoryUsage(currentMemory)}/${this.formatMemoryUsage(totalMemory)} | Peak: ${this.formatMemoryUsage(peakMemory)} | ${changeIndicator} ${this.formatMemoryUsage(changeAmount)} | Limit: ${this.memorySize}MB`);
      }
      
      // Warning if memory usage gets high
      const memoryPercentage = (currentMemory / (this.memorySize * 1024 * 1024)) * 100;
      if (memoryPercentage > 80) {
        console.log(`⚠️  WARNING: Memory usage at ${memoryPercentage.toFixed(1)}% of allocated limit!`);
      }
      
      lastMemory = currentMemory;
    }, 5000);

    // Also monitor external React process if possible
    this.monitorReactProcess();
  }

  monitorReactProcess() {
    // Simplified React process monitoring - less frequent
    try {
      const { exec } = require('child_process');
      setInterval(() => {
        exec('ps aux | grep "react-scripts start" | grep -v grep | head -1', (error, stdout) => {
          if (!error && stdout.trim()) {
            const parts = stdout.trim().split(/\s+/);
            if (parts.length >= 6) {
              const memPercent = parts[3];
              const rss = parts[5]; // Resident set size
              const rssMB = Math.round(parseInt(rss) / 1024);
              if (rssMB > 100) { // Only log if using significant memory
                console.log(`🔧 React Process: ${memPercent}% CPU | RSS: ${rssMB}MB`);
              }
            }
          }
        });
      }, 15000); // Every 15 seconds, less frequent
    } catch (error) {
      // Silently fail if we can't monitor external process
    }
  }

  setupKeyboardListener() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      process.stdin.on('data', (key) => {
        // Ctrl+M (or just 'm')
        if (key === '\r' || key.toLowerCase() === 'm') {
          this.logInstantMemoryReport();
        }
        // Ctrl+C to exit
        if (key === '\u0003') {
          this.stopMemoryMonitoring();
          process.exit();
        }
      });
    }
  }

  logInstantMemoryReport() {
    const memUsage = process.memoryUsage();
    console.log('\n📋 INSTANT MEMORY REPORT');
    console.log('┌─────────────────────────────────────┐');
    console.log(`│ Heap Used:      ${this.formatMemoryUsage(memUsage.heapUsed).padEnd(15)} │`);
    console.log(`│ Heap Total:     ${this.formatMemoryUsage(memUsage.heapTotal).padEnd(15)} │`);
    console.log(`│ External:       ${this.formatMemoryUsage(memUsage.external).padEnd(15)} │`);
    console.log(`│ RSS:            ${this.formatMemoryUsage(memUsage.rss).padEnd(15)} │`);
    console.log(`│ Memory Limit:   ${this.memorySize}MB`.padEnd(37) + '│');
    console.log('└─────────────────────────────────────┘');
    
    // Show percentage of limit
    const usagePercent = (memUsage.heapUsed / (this.memorySize * 1024 * 1024)) * 100;
    if (usagePercent > 70) {
      console.log(`⚠️  Memory usage: ${usagePercent.toFixed(1)}% of limit`);
    } else {
      console.log(`✅ Memory usage: ${usagePercent.toFixed(1)}% of limit`);
    }
    console.log('');
  }

  stopMemoryMonitoring() {
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
      console.log('\n🧠 Memory Monitor Stopped');
      console.log('──────────────────────────────────────────────────');
    }
    
    // Reset stdin if we set it to raw mode
    if (process.stdin.isTTY && process.stdin.isRaw) {
      process.stdin.setRawMode(false);
    }
  }

  async execute() {
    if (this.cleanOnly) {
      return true;
    }

    try {
      let envFile;
      if (this.isRTDWebsite) {
        envFile = `.env.${this.isSandbox ? 'development' : 'production'}.website`;
      } else if (this.isRTDConnect) {
        envFile = `.env.${this.isSandbox ? 'development' : 'production'}.rtdconnect`;
      } else if (this.isSecondSite) {
        envFile = `.env.${this.isSandbox ? 'development' : 'production'}.second`;
      } else {
        envFile = `.env.${this.isSandbox ? 'development' : 'production'}`;
      }

      const nodeOptions = `--max-old-space-size=${this.memorySize}`;
      const command = this.isStart
        ? `cross-env NODE_OPTIONS="${nodeOptions}" env-cmd -f ${envFile} react-scripts start`
        : `cross-env NODE_OPTIONS="${nodeOptions}" GENERATE_SOURCEMAP=false env-cmd -f ${envFile} react-scripts build`;
      
      if (!this.isStart) {
        console.log(`\nExecuting build (Attempt ${this.currentRetry + 1}/${this.maxRetries}):`);
        console.log(`Memory allocated: ${this.memorySize}MB`);
      } else {
        console.log(`\nStarting development server with ${this.memorySize}MB memory limit`);
        console.log(`Environment: ${envFile}`);
        this.startMemoryMonitoring();
      }

      if (this.isStart) {
        // For start mode, use spawn to allow monitoring
        const child = spawn('npx', ['cross-env', `NODE_OPTIONS=${nodeOptions}`, 'env-cmd', '-f', envFile, 'react-scripts', 'start'], {
          stdio: 'inherit',
          shell: true
        });

        // Handle process exit
        child.on('exit', (code) => {
          this.stopMemoryMonitoring();
          if (code !== 0) {
            console.error(`\nDevelopment server exited with code ${code}`);
          }
        });

        // Handle process errors
        child.on('error', (error) => {
          this.stopMemoryMonitoring();
          throw error;
        });

        // Keep the process running
        return new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            if (code === 0) {
              resolve(true);
            } else {
              reject(new Error(`Process exited with code ${code}`));
            }
          });
        });
      } else {
        execSync(command, { stdio: 'inherit' });
      }

      if (!this.isStart) {
        if (this.isSecondSite) {
          this.copyBuildToPublicSecond();
        } else if (this.isRTDConnect) {
          this.copyBuildToPublicRTDConnect();
        } else if (this.isRTDWebsite) {
          this.copyBuildToPublicWebsite();
        }
      }

      return true;
    } catch (error) {
      // Development server errors (start mode)
      if (this.isStart) {
        this.stopMemoryMonitoring();
        console.error('Development server crashed:', error.message);
        console.log('Development server exited. Please restart manually.');
        return false;
      }

      // Build errors (build mode)
      console.error(`Build attempt ${this.currentRetry + 1} failed:`, error.message);
      
      if (this.currentRetry < this.maxRetries - 1) {
        this.currentRetry++;
        // Only increase memory if we're not already at max
        const newMemory = Math.min(this.memorySize + 1024, 8192); // Cap at 8GB
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