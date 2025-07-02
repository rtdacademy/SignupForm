#!/usr/bin/env node
/**
 * Prepare Shared Modules Script
 * 
 * This script copies the shared modules from functions/shared to each course directory
 * before deployment. This ensures each Firebase codebase is self-contained and can
 * deploy independently without external dependencies.
 */

const fs = require('fs');
const path = require('path');

// Define source and target directories
const SOURCE_SHARED_DIR = path.join(__dirname, '..', 'functions', 'shared');
const SOURCE_COURSES_CONFIG_DIR = path.join(__dirname, '..', 'functions', 'courses-config');
const COURSE_DIRS = [
  path.join(__dirname, '..', 'functions', 'courses', '2a'),
  path.join(__dirname, '..', 'functions', 'courses', '2a2'),
  path.join(__dirname, '..', 'functions', 'courses', '2b'),
  path.join(__dirname, '..', 'functions', 'courses', '2c'),
  path.join(__dirname, '..', 'functions', 'courses', '3'),
  path.join(__dirname, '..', 'functions', 'courses', '4')
];

/**
 * Recursively copy directory contents
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDirectory(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory contents
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Remove existing directory
 * @param {string} dir - Path to directory to remove
 */
function removeDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`   ✓ Removed existing directory: ${dir}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Preparing shared modules and courses-config for course deployments...\n');

  // Check if source directories exist
  if (!fs.existsSync(SOURCE_SHARED_DIR)) {
    console.error(`❌ Source shared directory not found: ${SOURCE_SHARED_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(SOURCE_COURSES_CONFIG_DIR)) {
    console.error(`❌ Source courses-config directory not found: ${SOURCE_COURSES_CONFIG_DIR}`);
    process.exit(1);
  }

  console.log(`📂 Sources:`);
  console.log(`   - Shared: ${SOURCE_SHARED_DIR}`);
  console.log(`   - Courses-config: ${SOURCE_COURSES_CONFIG_DIR}`);
  console.log(`📋 Target courses: ${COURSE_DIRS.length} directories\n`);

  // Process each course directory
  for (const courseDir of COURSE_DIRS) {
    const courseName = path.basename(path.dirname(courseDir)) + '-' + path.basename(courseDir);
    const targetSharedDir = path.join(courseDir, 'shared');
    const targetCoursesConfigDir = path.join(courseDir, 'courses-config');
    
    console.log(`📦 Processing course-${path.basename(courseDir)}:`);
    
    // Check if course directory exists
    if (!fs.existsSync(courseDir)) {
      console.log(`   ⚠️  Course directory not found: ${courseDir}`);
      console.log(`   ⏭️  Skipping...\n`);
      continue;
    }

    try {
      // Remove existing directories
      removeDirectory(targetSharedDir);
      removeDirectory(targetCoursesConfigDir);
      
      // Copy shared modules
      copyDirectory(SOURCE_SHARED_DIR, targetSharedDir);
      console.log(`   ✅ Copied shared modules to: ${targetSharedDir}`);
      
      // Copy courses-config
      copyDirectory(SOURCE_COURSES_CONFIG_DIR, targetCoursesConfigDir);
      console.log(`   ✅ Copied courses-config to: ${targetCoursesConfigDir}`);
      
      // Verify the copies were successful
      const sharedItems = fs.readdirSync(targetSharedDir);
      const configItems = fs.readdirSync(targetCoursesConfigDir);
      console.log(`   📊 Copied ${sharedItems.length} shared items, ${configItems.length} config items`);
      
    } catch (error) {
      console.error(`   ❌ Error processing course-${path.basename(courseDir)}: ${error.message}`);
      process.exit(1);
    }
    
    console.log(); // Empty line for readability
  }

  console.log('✅ All shared modules and courses-config prepared successfully!');
  console.log('💡 Each course directory now has its own copy of shared modules and courses-config.');
  console.log('🚀 Ready for independent deployment.\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { copyDirectory, removeDirectory };