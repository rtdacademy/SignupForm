#!/usr/bin/env node

/**
 * Course Generation Script - Convention-Based Structure
 * Creates a new course from the template with customized values
 * 
 * Usage: npm run create-course -- --id=COM2000 --title="Advanced E-Learning"
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key && value) {
    options[key.replace('--', '')] = value;
  }
});

// Validate required arguments
if (!options.id) {
  console.error('❌ Error: Course ID is required');
  console.log('Usage: npm run create-course -- --id=COURSE_ID --title="Course Title"');
  console.log('Optional: --credits=1 --grade=10');
  process.exit(1);
}

// Set defaults
const courseId = options.id.toUpperCase();
const courseTitle = options.title || `${courseId} Course`;
const credits = options.credits || '1';
const grade = options.grade || '10';

console.log(`
🚀 Creating new course: ${courseId}
📚 Title: ${courseTitle}
💳 Credits: ${credits}
📊 Grade Level: ${grade}
`);

// Define paths
const templatePath = path.join(__dirname, '..', 'courses', 'templates', 'course-template');
const srcCoursePath = path.join(__dirname, '..', 'src', 'FirebaseCourses', 'courses', courseId);
const functionsPath = path.join(__dirname, '..', 'functions', 'courses', courseId);
const functionsConfigPath = path.join(__dirname, '..', 'functions', 'courses-config', courseId);

// Check if course already exists

if (fs.existsSync(srcCoursePath)) {
  console.error(`❌ Error: Course ${courseId} already exists at ${srcCoursePath}`);
  process.exit(1);
}

if (fs.existsSync(functionsPath)) {
  console.error(`❌ Error: Course ${courseId} cloud functions already exist at ${functionsPath}`);
  process.exit(1);
}

if (fs.existsSync(functionsConfigPath)) {
  console.error(`❌ Error: Course ${courseId} config already exists at ${functionsConfigPath}`);
  process.exit(1);
}

/**
 * Recursively copy directory with template replacements
 */
function copyDirectory(src, dest, replacements = {}, excludeDirs = []) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip excluded directories
    if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, replacements, excludeDirs);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Apply all replacements
      Object.entries(replacements).forEach(([placeholder, value]) => {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      });
      
      fs.writeFileSync(destPath, content);
    }
  }
}

/**
 * Update file/folder names that contain placeholders
 */
function renameTemplateFiles(dir, placeholder, replacement) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);
    
    if (entry.name.includes(placeholder)) {
      const newName = entry.name.replace(new RegExp(placeholder, 'g'), replacement);
      const newPath = path.join(dir, newName);
      fs.renameSync(oldPath, newPath);
      
      // If it's a directory, process its contents with the new path
      if (entry.isDirectory()) {
        renameTemplateFiles(newPath, placeholder, replacement);
      }
    } else if (entry.isDirectory()) {
      // Process subdirectories even if their name doesn't need changing
      renameTemplateFiles(oldPath, placeholder, replacement);
    }
  }
}

/**
 * Generate the list of cloud functions based on course structure
 */
function generateFunctionExports(courseId) {
  const exports = [];
  
  // Create a valid function prefix (course + courseId for numeric IDs)
  const functionPrefix = /^\d/.test(courseId) ? `course${courseId}` : courseId;
  
  // Note: Shared AI question functions are now in global courses/shared/ directory
  // and should be added to functions/index.js manually as they're shared across courses
  
  // Add lesson-specific functions based on what exists in the template
  const templateFunctionsPath = path.join(templatePath, 'functions', 'TEMPLATE_ID');
  const folders = fs.readdirSync(templateFunctionsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'shared')
    .sort();
  
  folders.forEach(folder => {
    const folderPath = path.join(templateFunctionsPath, folder.name);
    const files = fs.readdirSync(folderPath);
    
    if (files.length > 0) {
      // This folder has functions
      const safeFolderName = folder.name.replace(/-/g, '_');
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const baseName = file.replace('.js', '');
          if (baseName === 'assessments') {
            // Multiple functions in assessments file
            exports.push(`exports.${functionPrefix}_${safeFolderName}_multipleChoice = require('./courses/${courseId}/${folder.name}/assessments').${functionPrefix}_${safeFolderName}_multipleChoice;`);
            exports.push(`exports.${functionPrefix}_${safeFolderName}_aiQuestion = require('./courses/${courseId}/${folder.name}/assessments').${functionPrefix}_${safeFolderName}_aiQuestion;`);
          } else if (baseName !== 'fallback-questions') {
            // Single function file (skip data files like fallback-questions)
            const safeBaseName = baseName.replace(/-/g, '_');
            exports.push(`exports.${functionPrefix}_${safeFolderName}_${safeBaseName} = require('./courses/${courseId}/${folder.name}/${baseName}').${functionPrefix}_${safeFolderName}_${safeBaseName};`);
          }
        }
      });
    }
  });
  
  return exports.join('\n');
}

/**
 * Update functions/index.js to include the new course functions
 */
function updateFunctionsIndex(courseId) {
  const functionsIndexPath = path.join(__dirname, '..', 'functions', 'index.js');
  
  if (!fs.existsSync(functionsIndexPath)) {
    console.warn('⚠️  functions/index.js not found, skipping automatic update');
    return;
  }
  
  const functionPrefix = /^\d/.test(courseId) ? `course${courseId}` : courseId;
  let indexContent = fs.readFileSync(functionsIndexPath, 'utf8');
  
  // Check if course functions are already exported (check for any course function)
  if (indexContent.includes(`${functionPrefix}_02_core_concepts`)) {
    console.log('📝 Course functions already exist in functions/index.js');
    return;
  }
  
  // Generate the function exports for this course
  const functionExports = generateFunctionExports(courseId);
  
  // Add a comment and the exports at the end of the file
  const newExports = `
// ${courseId} Course Functions
${functionExports}`;
  
  // Append to the end of the file
  indexContent += newExports;
  
  fs.writeFileSync(functionsIndexPath, indexContent);
  console.log('✅ Updated functions/index.js with course functions');
}

/**
 * Update CourseRouter.js to include the new course
 */
function updateCourseRouter(courseId, componentName) {
  const routerPath = path.join(__dirname, '..', 'src', 'FirebaseCourses', 'CourseRouter.js');
  
  if (!fs.existsSync(routerPath)) {
    console.warn('⚠️  CourseRouter.js not found, skipping automatic update');
    return;
  }
  
  let routerContent = fs.readFileSync(routerPath, 'utf8');
  
  // Check if course is already imported
  if (routerContent.includes(`const ${componentName} = lazy`)) {
    console.log('📝 Course already exists in CourseRouter.js');
    return;
  }
  
  // Add import statement after the last course import
  const importPattern = /(const Course\w+ = lazy\([^)]+\);)/g;
  const importMatches = [...routerContent.matchAll(importPattern)];
  
  if (importMatches.length > 0) {
    // Get the last Course import
    const lastImport = importMatches[importMatches.length - 1];
    const newImport = `const ${componentName} = lazy(() => import('./courses/${courseId}'));`;
    routerContent = routerContent.replace(
      lastImport[0],
      `${lastImport[0]}\n${newImport}`
    );
  } else {
    // Try to find any existing course import (Course2, Course100, etc.)
    const anyImportPattern = /(const Course\w+ = lazy\([^)]+\);)/;
    const anyMatch = routerContent.match(anyImportPattern);
    if (anyMatch) {
      const newImport = `const ${componentName} = lazy(() => import('./courses/${courseId}'));`;
      routerContent = routerContent.replace(
        anyMatch[0],
        `${anyMatch[0]}\n${newImport}`
      );
    } else {
      // Add after COM1255Course import as fallback
      const fallbackPattern = /(const COM1255Course = lazy\([^)]+\);)/;
      const fallbackMatch = routerContent.match(fallbackPattern);
      if (fallbackMatch) {
        const newImport = `const ${componentName} = lazy(() => import('./courses/${courseId}'));`;
        routerContent = routerContent.replace(
          fallbackMatch[0],
          `${fallbackMatch[0]}\n${newImport}`
        );
      } else {
        console.warn('⚠️  Could not find location to add import. Please add manually:');
        console.warn(`const ${componentName} = lazy(() => import('./courses/${courseId}'));`);
        return; // Exit early if we can't add the import
      }
    }
  }
  
  // Add case statement before default case
  const defaultCasePattern = /(      default:\s*return <TemplateCourse course={course} \/>;\s*})/;
  const defaultMatch = routerContent.match(defaultCasePattern);
  
  if (defaultMatch) {
    const newCase = `      case ${courseId}: // ${componentName.replace('Course', '')}
      case '${courseId}':
        // Import course structure JSON directly for Firebase courses
        const courseStructureData${courseId} = require('./courses/${courseId}/course-structure.json');
        const courseWithStructure${courseId} = {
          ...course,
          courseStructure: {
            title: "${courseTitle}",
            structure: courseStructureData${courseId}.courseStructure?.units || []
          }
        };
        return (
          <Suspense fallback={<LoadingCourse />}>
            <${componentName}
              course={courseWithStructure${courseId}}
              activeItemId={currentItemId}
              onItemSelect={handleItemSelect}
              isStaffView={isStaffView}
              devMode={devMode}
            />
          </Suspense>
        );
      `;
    
    routerContent = routerContent.replace(defaultMatch[0], `${newCase}${defaultMatch[0]}`);
  }
  
  fs.writeFileSync(routerPath, routerContent);
  console.log('✅ Updated CourseRouter.js with new course');
}

/**
 * Create course-specific directories and copy files
 */
function createCourse() {
  try {
    // Template replacements
    const functionPrefix = /^\d/.test(courseId) ? `course${courseId}` : courseId;
    const componentName = `Course${courseId}`;
    const replacements = {
      // Order matters! More specific patterns first
      'TEMPLATE_ID_': functionPrefix + '_', // For function names (handles numeric IDs)
      'CourseTEMPLATE_ID': componentName,   // For component names
      'TEMPLATE_ID': courseId,              // For general course ID references
      'Template Course Title': courseTitle,
      'TEMPLATE_DATE': new Date().toISOString().split('T')[0],
      'template_': courseId.toLowerCase() + '_'
    };
    
    // Step 1: Create frontend course directory in src
    console.log('📁 Creating frontend course components...');
    fs.mkdirSync(srcCoursePath, { recursive: true });
    
    // Copy main index.js
    let indexContent = fs.readFileSync(path.join(templatePath, 'index.js'), 'utf8');
    Object.entries(replacements).forEach(([placeholder, value]) => {
      indexContent = indexContent.replace(new RegExp(placeholder, 'g'), value);
    });
    fs.writeFileSync(path.join(srcCoursePath, 'index.js'), indexContent);
    
    // Only copy course-structure.json to frontend (navigation only)
    const structureFile = path.join(templatePath, 'course-structure.json');
    const destStructureFile = path.join(srcCoursePath, 'course-structure.json');
    let structureContent = fs.readFileSync(structureFile, 'utf8');
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
      structureContent = structureContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    fs.writeFileSync(destStructureFile, structureContent);
    
    // Create a display-only config for frontend (safe settings only)
    const templateConfigContent = fs.readFileSync(path.join(templatePath, 'course-config.json'), 'utf8');
    const fullConfig = JSON.parse(templateConfigContent.replace(/TEMPLATE_ID/g, courseId));
    
    // Extract only safe display settings
    const displayConfig = {
      courseId: fullConfig.courseId,
      title: courseTitle,
      fullTitle: `${courseId} - ${courseTitle}`,
      description: fullConfig.description,
      grade: grade,
      prerequisites: fullConfig.prerequisites || [],
      instructors: fullConfig.instructors || [],
      duration: fullConfig.duration,
      theme: fullConfig.theme,
      displaySettings: {
        showProgressBar: true,
        showGrades: true,
        enableTextToSpeech: true
      },
      metadata: {
        version: fullConfig.metadata.version,
        status: fullConfig.metadata.status
      }
    };
    
    fs.writeFileSync(
      path.join(srcCoursePath, 'course-display.json'), 
      JSON.stringify(displayConfig, null, 2)
    );
    
    // Copy content directory
    const contentSrc = path.join(templatePath, 'content');
    const contentDest = path.join(srcCoursePath, 'content');
    copyDirectory(contentSrc, contentDest, replacements);
    
    // Step 2: Copy cloud functions (exclude shared directory - using global shared)
    console.log('📁 Creating cloud functions...');
    const functionsSrc = path.join(templatePath, 'functions', 'TEMPLATE_ID');
    copyDirectory(functionsSrc, functionsPath, replacements, ['shared']);
    
    // Step 2b: Copy course config to functions directory for cloud function access
    console.log('📁 Copying course config for cloud functions...');
    fs.mkdirSync(functionsConfigPath, { recursive: true });
    
    // Copy course-config.json to functions directory
    const configSrc = path.join(templatePath, 'course-config.json');
    const configDest = path.join(functionsConfigPath, 'course-config.json');
    let configContent = fs.readFileSync(configSrc, 'utf8');
    Object.entries(replacements).forEach(([placeholder, value]) => {
      configContent = configContent.replace(new RegExp(placeholder, 'g'), value);
    });
    fs.writeFileSync(configDest, configContent);
    
    // Step 3: Rename template files/folders
    console.log('📝 Renaming template files...');
    renameTemplateFiles(functionsPath, 'TEMPLATE_ID', courseId);
    
    // Step 4: Update course configuration
    console.log('⚙️  Finalizing course configuration...');
    
    // Update backend course-config.json only
    const configPaths = [
      path.join(functionsConfigPath, 'course-config.json')
    ];
    
    configPaths.forEach(configPath => {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        config.courseId = courseId;
        config.title = courseTitle;
        config.fullTitle = `${courseId} - ${courseTitle}`;
        config.credits = parseInt(credits);
        config.grade = grade;
        config.metadata.createdDate = new Date().toISOString();
        config.metadata.lastModified = new Date().toISOString();
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }
    });
    
    // Step 5: Update CourseRouter.js automatically
    console.log('📝 Updating CourseRouter.js...');
    updateCourseRouter(courseId, componentName);
    
    // Step 6: Update functions/index.js automatically
    console.log('📝 Updating functions/index.js...');
    updateFunctionsIndex(courseId);
    
    // Step 7: Generate helpful output
    const functionExports = generateFunctionExports(courseId);
    
    // Fix export naming if courseId starts with a number
    const exportSteps = functionExports.split('\n').map(line => {
      if (/^exports\.\d/.test(line)) {
        // Replace exports.2_ with exports.course2_
        return line.replace(/exports\.(\d+)_/, 'exports.course$1_');
      }
      return line;
    }).join('\n');
    const importStatement = `const ${componentName} = lazy(() => import('./courses/${courseId}'));`;
    const routerCase = `      case '${courseId}':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <${componentName}
              course={course}
              activeItemId={currentItemId}
              onItemSelect={handleItemSelect}
              isStaffView={isStaffView}
              devMode={devMode}
            />
          </Suspense>
        );`;
    
    console.log(`
✅ Course ${courseId} created successfully!

📂 Course files created at:
   Frontend: ${srcCoursePath}
   Functions: ${functionsPath}
   Config: ${functionsConfigPath}

🔧 Automatic setup completed:
   ✅ CourseRouter.js updated
   ✅ functions/index.js updated

📝 Note: Shared AI functions are in functions/courses/shared/ 
   Add them manually to functions/index.js if needed:
   exports.shared_aiQuestion = require('./courses/shared/aiQuestions').shared_aiQuestion;
   
🔗 Import statement automatically added to CourseRouter.js

🚀 Ready to use! Next steps:

1. Deploy functions:
   firebase deploy --only functions:${functionPrefix}_*

2. Start development:
   npm start

📖 See the template README for detailed instructions.

💡 Tips:
   - Content folders are numbered for easy ordering
   - Cloud functions follow the naming convention
   - Shared functions are in functions/courses/shared/ for reuse
   - Start simple, add complexity as needed
   - Check each folder's README for guidance
`);
    
  } catch (error) {
    console.error('❌ Error creating course:', error.message);
    
    // Cleanup on error
    if (fs.existsSync(srcCoursePath)) {
      fs.rmSync(srcCoursePath, { recursive: true, force: true });
    }
    if (fs.existsSync(functionsPath)) {
      fs.rmSync(functionsPath, { recursive: true, force: true });
    }
    if (fs.existsSync(functionsConfigPath)) {
      fs.rmSync(functionsConfigPath, { recursive: true, force: true });
    }
    
    // Note: We don't automatically revert CourseRouter.js changes on error
    // as they may be intentional or the error may not be related
    console.log('⚠️  Note: CourseRouter.js changes were not reverted. Please check manually if needed.');
    
    process.exit(1);
  }
}

// Run the script
createCourse();