#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 60000; // 1 minute in milliseconds

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function extractFunctionsFromIndex() {
  const indexPath = path.join(__dirname, 'functions', 'index.js');
  
  try {
    const content = await fs.readFile(indexPath, 'utf-8');
    const functionNames = [];
    
    // Match exports.functionName = ... patterns
    const exportMatches = content.matchAll(/exports\.(\w+)\s*=/g);
    
    for (const match of exportMatches) {
      functionNames.push(match[1]);
    }
    
    return [...new Set(functionNames)]; // Remove duplicates
  } catch (error) {
    console.error(`${colors.red}Error reading index.js:${colors.reset}`, error.message);
    return [];
  }
}

async function getAllFunctions() {
  console.log(`${colors.cyan}🔍 Discovering all functions...${colors.reset}`);
  
  // First, try to extract from index.js
  const indexFunctions = await extractFunctionsFromIndex();
  
  if (indexFunctions.length > 0) {
    console.log(`${colors.green}✅ Found ${indexFunctions.length} functions from index.js${colors.reset}`);
    return indexFunctions;
  }
  
  // Fallback to dry-run method
  try {
    const { stdout } = await execPromise('firebase deploy --only functions --dry-run 2>&1');
    
    // Extract function names from the output
    const functionNames = [];
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      // Look for patterns like "creating Node.js 20 (2nd Gen) function functionName(us-central1)..."
      // or "updating Node.js 20 (2nd Gen) function functionName(us-central1)..."
      const match = line.match(/(?:creating|updating)\s+Node\.js\s+\d+\s+\([^)]+\)\s+function\s+(\w+)\(/);
      if (match) {
        functionNames.push(match[1]);
      }
    }
    
    // Remove duplicates
    return [...new Set(functionNames)];
  } catch (error) {
    console.error(`${colors.red}Error discovering functions:${colors.reset}`, error.message);
    console.log(`${colors.yellow}No functions could be discovered automatically.${colors.reset}`);
    return [];
  }
}

async function deployBatch(functions, batchNumber, totalBatches) {
  const functionList = functions.map(f => `functions:${f}`).join(',');
  
  console.log(`\n${colors.bright}${colors.blue}📦 Deploying batch ${batchNumber}/${totalBatches}${colors.reset}`);
  console.log(`${colors.cyan}Functions in this batch: ${functions.length}${colors.reset}`);
  console.log(`${colors.yellow}Functions: ${functions.slice(0, 5).join(', ')}${functions.length > 5 ? '...' : ''}${colors.reset}`);
  
  // Show a progress indicator
  const progressInterval = setInterval(() => {
    process.stdout.write(`${colors.blue}.${colors.reset}`);
  }, 2000);
  
  try {
    const startTime = Date.now();
    console.log(`${colors.cyan}🚀 Starting deployment...${colors.reset}`);
    
    // Use spawn for real-time output
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const firebaseProcess = spawn('npx', ['firebase', 'deploy', '--only', functionList], {
        stdio: 'pipe'
      });
      
      let stdout = '';
      let stderr = '';
      
      firebaseProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        // Show some output to indicate progress
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.includes('creating') || line.includes('updating') || line.includes('function')) {
            process.stdout.write(`${colors.green}.${colors.reset}`);
          }
        });
      });
      
      firebaseProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      firebaseProcess.on('close', (code) => {
        clearInterval(progressInterval);
        process.stdout.write('\n'); // New line after progress dots
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (code === 0) {
          console.log(`${colors.green}✅ Batch ${batchNumber} deployed successfully in ${duration}s${colors.reset}`);
          
          // Check for any warnings in stderr
          if (stderr) {
            console.log(`${colors.yellow}⚠️  Warnings:${colors.reset}`);
            console.log(stderr);
          }
          
          resolve({ success: true, duration });
        } else {
          console.error(`${colors.red}❌ Error deploying batch ${batchNumber}:${colors.reset}`);
          console.error(stderr || stdout);
          resolve({ success: false, error: stderr || stdout });
        }
      });
      
      firebaseProcess.on('error', (error) => {
        clearInterval(progressInterval);
        process.stdout.write('\n');
        console.error(`${colors.red}❌ Failed to start Firebase CLI:${colors.reset}`);
        console.error(error.message);
        resolve({ success: false, error: error.message });
      });
    });
    
  } catch (error) {
    clearInterval(progressInterval);
    process.stdout.write('\n');
    console.error(`${colors.red}❌ Error deploying batch ${batchNumber}:${colors.reset}`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const filterPattern = args.find(arg => arg.startsWith('--filter='))?.split('=')[1];
  const showHelp = args.includes('--help') || args.includes('-h');
  
  if (showHelp) {
    console.log(`
${colors.bright}Firebase Functions Batch Deployment Tool${colors.reset}

Usage: node deploy-functions-batch.js [options]

Options:
  --filter=PATTERN    Deploy only functions matching the pattern
                      Example: --filter=course2 (deploys only course2 functions)
                      Example: --filter=course4_06 (deploys only course4_06 functions)
  --help, -h          Show this help message

Examples:
  node deploy-functions-batch.js                    # Deploy all functions
  node deploy-functions-batch.js --filter=course2   # Deploy only course2 functions
  node deploy-functions-batch.js --filter=stripe    # Deploy only stripe-related functions
`);
    return;
  }
  
  console.log(`${colors.bright}${colors.cyan}🚀 Firebase Functions Batch Deployment Tool${colors.reset}`);
  console.log(`${colors.yellow}Batch size: ${BATCH_SIZE} functions${colors.reset}`);
  console.log(`${colors.yellow}Delay between batches: ${DELAY_BETWEEN_BATCHES / 1000} seconds${colors.reset}\n`);
  
  // Get all functions
  let allFunctions = await getAllFunctions();
  
  if (allFunctions.length === 0) {
    console.log(`${colors.red}No functions found to deploy.${colors.reset}`);
    console.log(`${colors.yellow}Please check that you have functions to deploy.${colors.reset}`);
    return;
  }
  
  // Apply filter if provided
  if (filterPattern) {
    console.log(`${colors.cyan}🔍 Filtering functions with pattern: ${filterPattern}${colors.reset}`);
    allFunctions = allFunctions.filter(fn => fn.includes(filterPattern));
    
    if (allFunctions.length === 0) {
      console.log(`${colors.red}No functions match the filter: ${filterPattern}${colors.reset}`);
      return;
    }
  }
  
  console.log(`${colors.green}✅ Found ${allFunctions.length} functions to deploy${colors.reset}`);
  
  // Create batches
  const batches = [];
  for (let i = 0; i < allFunctions.length; i += BATCH_SIZE) {
    batches.push(allFunctions.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`${colors.cyan}📊 Created ${batches.length} batches${colors.reset}\n`);
  
  // Show preview of functions to be deployed
  console.log(`${colors.cyan}Preview of functions to deploy:${colors.reset}`);
  const preview = allFunctions.slice(0, 10);
  preview.forEach(fn => console.log(`  - ${fn}`));
  if (allFunctions.length > 10) {
    console.log(`  ... and ${allFunctions.length - 10} more`);
  }
  console.log('');
  
  // Deploy batches
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < batches.length; i++) {
    const result = await deployBatch(batches[i], i + 1, batches.length);
    results.push(result);
    
    // Wait between batches (except for the last one)
    if (i < batches.length - 1) {
      console.log(`\n${colors.yellow}⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...${colors.reset}`);
      
      // Show countdown
      for (let j = DELAY_BETWEEN_BATCHES / 1000; j > 0; j--) {
        process.stdout.write(`\r${colors.yellow}⏳ Next batch in ${j} seconds...${colors.reset}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear the line
    }
  }
  
  // Summary
  const totalDuration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const successfulBatches = results.filter(r => r.success).length;
  const failedBatches = results.filter(r => !r.success).length;
  
  console.log(`\n${colors.bright}${colors.cyan}📈 Deployment Summary${colors.reset}`);
  console.log(`${colors.green}✅ Successful batches: ${successfulBatches}/${batches.length}${colors.reset}`);
  if (failedBatches > 0) {
    console.log(`${colors.red}❌ Failed batches: ${failedBatches}${colors.reset}`);
  }
  console.log(`${colors.blue}⏱️  Total duration: ${totalDuration} minutes${colors.reset}`);
  console.log(`${colors.cyan}📦 Total functions deployed: ${allFunctions.length}${colors.reset}`);
  
  // Show failed batches details
  if (failedBatches > 0) {
    console.log(`\n${colors.red}Failed batch details:${colors.reset}`);
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`${colors.red}Batch ${index + 1}: ${result.error}${colors.reset}`);
      }
    });
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});