#!/usr/bin/env node

/**
 * Platform-aware script runner
 * Automatically selects Windows or Linux commands based on PLATFORM environment variable
 */

const { spawn } = require('child_process');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const platform = process.env.PLATFORM || 'linux';
const isWindows = platform === 'windows' || process.platform === 'win32';

// Get the script name from command line arguments
const scriptName = process.argv[2];
if (!scriptName) {
  console.error('Usage: node platform-runner.js <script-name>');
  process.exit(1);
}

// Add Windows suffix if needed
const actualScript = isWindows && !scriptName.endsWith(':win') ? `${scriptName}:win` : scriptName;

console.log(`Running script: ${actualScript} (detected platform: ${isWindows ? 'windows' : 'linux'})`);

// Run the npm script
const npmProcess = spawn('npm', ['run', actualScript], {
  stdio: 'inherit',
  shell: true
});

npmProcess.on('close', (code) => {
  process.exit(code);
});

npmProcess.on('error', (error) => {
  console.error('Error running script:', error);
  process.exit(1);
});
