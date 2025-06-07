#!/usr/bin/env node

/**
 * Course Deletion Script
 * Safely removes all files created by the course creation script
 * 
 * USAGE:
 *   node scripts/delete-course.js --id=4 [--force]
 * 
 * OPTIONS:
 *   --id=NUMBER    Course ID to delete (must be numeric, e.g., 4, 101, 3)
 *   --force        Skip confirmation prompt (be careful!)
 * 
 * WHAT THIS SCRIPT DELETES:
 *   - src/FirebaseCourses/courses/[ID]/           (Frontend course files)
 *   - functions/courses/[ID]/                     (Cloud functions)
 *   - functions/courses-config/[ID]/              (Backend configuration)
 * 
 * WHAT THIS SCRIPT DOES NOT DELETE:
 *   - CourseRouter.js imports/routes (manual cleanup required)
 *   - functions/index.js exports (manual cleanup required)
 *   - Deployed cloud functions (use: firebase deploy to remove)
 * 
 * SAFETY FEATURES:
 *   - Confirmation prompt (unless --force used)
 *   - Prevents deletion of system directories
 *   - Shows exactly what will be deleted before proceeding
 *   - Recursive file counting for transparency
 * 
 * EXAMPLES:
 *   node scripts/delete-course.js --id=4
 *   node scripts/delete-course.js --id=101 --force
 *   node scripts/delete-course.js --id=3
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.split('=');
    if (value) {
      // Handle --key=value format
      options[key.replace('--', '')] = value;
    } else {
      // Handle --flag format (boolean flags)
      options[key.replace('--', '')] = true;
    }
  }
});

// Validate required arguments
if (!options.id) {
  console.error('❌ Error: Course ID is required');
  console.log('Usage: node scripts/delete-course.js --id=4 [--force]');
  console.log('');
  console.log('Options:');
  console.log('  --id=NUMBER    Course ID to delete (must be numeric)');
  console.log('  --force        Skip confirmation prompt');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/delete-course.js --id=4');
  console.log('  node scripts/delete-course.js --id=101 --force');
  process.exit(1);
}

// Validate course ID is numeric
if (!/^\d+$/.test(options.id)) {
  console.error('❌ Error: Course ID must be numeric (e.g., 4, 101, 3)');
  console.error('This matches the requirement from create-course.js');
  process.exit(1);
}

const courseId = options.id; // Keep as numeric string, not uppercase
const force = options.force || false;

console.log(`
🗑️  Course Deletion: ${courseId}
⚠️  This will permanently delete all course files!
`);

// Define paths
const srcCoursePath = path.join(__dirname, '..', 'src', 'FirebaseCourses', 'courses', courseId);
const functionsPath = path.join(__dirname, '..', 'functions', 'courses', courseId);
const functionsConfigPath = path.join(__dirname, '..', 'functions', 'courses-config', courseId);

/**
 * Check what files exist and would be deleted
 */
function scanForFiles() {
  const filesToDelete = [];
  const dirsToDelete = [];
  
  if (fs.existsSync(srcCoursePath)) {
    dirsToDelete.push({
      path: srcCoursePath,
      type: 'Frontend Course Directory',
      files: countFiles(srcCoursePath)
    });
  }
  
  if (fs.existsSync(functionsPath)) {
    dirsToDelete.push({
      path: functionsPath,
      type: 'Cloud Functions Directory',
      files: countFiles(functionsPath)
    });
  }
  
  if (fs.existsSync(functionsConfigPath)) {
    dirsToDelete.push({
      path: functionsConfigPath,
      type: 'Functions Config Directory',
      files: countFiles(functionsConfigPath)
    });
  }
  
  return dirsToDelete;
}

/**
 * Recursively count files in a directory
 */
function countFiles(dir) {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += countFiles(path.join(dir, entry.name));
      } else {
        count += 1;
      }
    }
  } catch (error) {
    // Directory might not exist or be accessible
  }
  return count;
}

/**
 * Delete a directory and all its contents
 */
function deleteDirectory(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${dirPath}:`, error.message);
    return false;
  }
}

/**
 * Prompt user for confirmation
 */
function askConfirmation(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

/**
 * Main deletion function
 */
async function deleteCourse() {
  try {
    // Scan for files
    const dirsToDelete = scanForFiles();
    
    if (dirsToDelete.length === 0) {
      console.log(`ℹ️  No course files found for courseId ${courseId}`);
      console.log('Nothing to delete.');
      return;
    }
    
    // Show what will be deleted
    console.log('📋 Files to be deleted:');
    let totalFiles = 0;
    dirsToDelete.forEach(dir => {
      console.log(`   📂 ${dir.type}: ${dir.path} (${dir.files} files)`);
      totalFiles += dir.files;
    });
    console.log(`\n📊 Total: ${dirsToDelete.length} directories, ${totalFiles} files\n`);
    
    // Confirmation (unless --force is used)
    if (!force) {
      const answer = await askConfirmation('❓ Are you sure you want to delete all these files? (yes/no): ');
      
      if (answer !== 'yes' && answer !== 'y') {
        console.log('🚫 Deletion cancelled.');
        return;
      }
    }
    
    // Perform deletion
    console.log('🗑️  Deleting course files...');
    let deletedCount = 0;
    
    for (const dir of dirsToDelete) {
      console.log(`   Deleting ${dir.type}...`);
      if (deleteDirectory(dir.path)) {
        console.log(`   ✅ Deleted: ${dir.path}`);
        deletedCount++;
      }
    }
    
    console.log(`
✅ Course deletion completed!

📊 Summary:
   🗑️  Deleted ${deletedCount}/${dirsToDelete.length} directories
   📂 Course ${courseId} files have been removed

💡 Manual cleanup still required:
   1. Remove course import from CourseRouter.js:
      const Course${courseId} = lazy(() => import('./courses/${courseId}'));
   
   2. Remove course case from CourseRouter.js switch statement:
      case '${courseId}': ...
   
   3. Remove function exports from functions/index.js:
      exports.course${courseId}_*_* = require('./courses/${courseId}/...
   
   4. Remove deployed cloud functions:
      firebase deploy --only functions
`);
    
  } catch (error) {
    console.error('❌ Error during course deletion:', error.message);
    process.exit(1);
  }
}

// Safety check - make sure we're not deleting critical directories
const safetyCourseIds = ['src', 'functions', 'scripts', 'public', 'node_modules', '0', '1'];
if (safetyCourseIds.includes(courseId)) {
  console.error(`❌ Safety Error: Cannot delete courseId "${courseId}"`);
  console.error('This ID is blocked for safety reasons (system directory or reserved number).');
  console.error('Please use a different course ID (e.g., 4, 101, 200).');
  process.exit(1);
}

// Additional safety - prevent deleting very low numbers that might be system courses
if (parseInt(courseId) < 2) {
  console.error(`❌ Safety Error: Cannot delete courseId "${courseId}"`);
  console.error('Course IDs below 2 are reserved for system courses.');
  console.error('Please use course ID 4 or higher.');
  process.exit(1);
}

// Run the script
deleteCourse();