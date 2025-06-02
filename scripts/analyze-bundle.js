const fs = require('fs');
const path = require('path');

console.log('📦 Bundle Size Analysis');
console.log('======================');

// Analyze package.json dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Heavy dependencies that might cause memory issues
const heavyPackages = [
  '@codemirror',
  '@uiw/react-codemirror',
  'firebase',
  'react-scripts',
  '@radix-ui',
  'framer-motion',
  'recharts',
  'react-big-calendar',
  'mermaid'
];

console.log('🔍 Potential memory-heavy dependencies found:');
let heavyCount = 0;
Object.keys(deps).forEach(dep => {
  const isHeavy = heavyPackages.some(heavy => dep.includes(heavy));
  if (isHeavy) {
    console.log(`  📦 ${dep}: ${deps[dep]}`);
    heavyCount++;
  }
});

console.log(`\n📊 Total dependencies: ${Object.keys(deps).length}`);
console.log(`⚠️  Potentially heavy dependencies: ${heavyCount}`);

// Check for common memory leak patterns in source files
console.log('\n🔍 Scanning for potential memory leak patterns...');

function scanForLeaks(dir) {
  const issues = [];
  
  function scanFile(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for common memory leak patterns
        if (line.includes('setInterval') && !line.includes('clearInterval')) {
          issues.push(`${filePath}:${index + 1} - setInterval without clearInterval`);
        }
        if (line.includes('addEventListener') && !line.includes('removeEventListener')) {
          issues.push(`${filePath}:${index + 1} - addEventListener without cleanup`);
        }
        if (line.includes('useEffect') && !line.includes('return')) {
          // This is a basic check - not perfect but catches obvious cases
          const nextFewLines = lines.slice(index, index + 10).join(' ');
          if (!nextFewLines.includes('return') && (nextFewLines.includes('setInterval') || nextFewLines.includes('addEventListener'))) {
            issues.push(`${filePath}:${index + 1} - useEffect missing cleanup`);
          }
        }
      });
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
        walkDir(filePath);
      } else if (stat.isFile()) {
        scanFile(filePath);
      }
    });
  }
  
  walkDir(dir);
  return issues;
}

const leakPatterns = scanForLeaks('src');
if (leakPatterns.length > 0) {
  console.log('⚠️  Potential memory leak patterns found:');
  leakPatterns.slice(0, 10).forEach(issue => {
    console.log(`  🚨 ${issue}`);
  });
  if (leakPatterns.length > 10) {
    console.log(`  ... and ${leakPatterns.length - 10} more`);
  }
} else {
  console.log('✅ No obvious memory leak patterns detected');
}

console.log('\n💡 Recommendations:');
console.log('  1. Consider lazy loading heavy components');
console.log('  2. Use React.memo for expensive components');
console.log('  3. Implement proper cleanup in useEffect hooks');
console.log('  4. Consider code splitting for large dependencies');
console.log('  5. Monitor bundle size with webpack-bundle-analyzer');