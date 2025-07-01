#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function checkDeploymentStatus() {
  console.log(`${colors.cyan}🔍 Checking Firebase deployment status...${colors.reset}`);
  
  try {
    // Check if Firebase CLI is running
    const { stdout: psOutput } = await execPromise('ps aux | grep "firebase deploy" | grep -v grep');
    
    if (psOutput.trim()) {
      console.log(`${colors.green}✅ Firebase deployment is currently running${colors.reset}`);
      console.log(`${colors.yellow}Process details:${colors.reset}`);
      console.log(psOutput);
    } else {
      console.log(`${colors.red}❌ No Firebase deployment processes found${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ No Firebase deployment processes found${colors.reset}`);
  }
  
  // Check Firebase status
  try {
    console.log(`\n${colors.cyan}🔍 Checking Firebase project status...${colors.reset}`);
    const { stdout } = await execPromise('firebase projects:list');
    console.log(stdout);
  } catch (error) {
    console.error(`${colors.red}Error checking Firebase status:${colors.reset}`, error.message);
  }
  
  // Show current time for reference
  console.log(`\n${colors.blue}Current time: ${new Date().toLocaleTimeString()}${colors.reset}`);
  console.log(`${colors.yellow}Note: Large function deployments can take 3-10 minutes per batch${colors.reset}`);
}

checkDeploymentStatus().catch(console.error);