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
const targetCoursePath = path.join(__dirname, '..', 'courses', courseId);
const srcCoursePath = path.join(__dirname, '..', 'src', 'FirebaseCourses', 'courses', courseId);
const functionsPath = path.join(__dirname, '..', 'functions', 'courses', courseId);
const functionsConfigPath = path.join(__dirname, '..', 'functions', 'courses-config', courseId);

// Check if course already exists
if (fs.existsSync(targetCoursePath)) {
  console.error(`❌ Error: Course ${courseId} already exists at ${targetCoursePath}`);
  process.exit(1);
}

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
function copyDirectory(src, dest, replacements = {}) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, replacements);
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
  
  // Always include shared AI question function
  exports.push(`exports.${functionPrefix}_shared_aiQuestion = require('./courses/${courseId}/shared/aiQuestions').${functionPrefix}_shared_aiQuestion;`);
  
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
          } else {
            // Single function file
            exports.push(`exports.${functionPrefix}_${safeFolderName}_${baseName} = require('./courses/${courseId}/${folder.name}/${baseName}').${functionPrefix}_${safeFolderName}_${baseName};`);
          }
        }
      });
    }
  });
  
  return exports.join('\n');
}

/**
 * Create course-specific directories and copy files
 */
function createCourse() {
  try {
    // Template replacements
    const functionPrefix = /^\d/.test(courseId) ? `course${courseId}` : courseId;
    const replacements = {
      'TEMPLATE_ID': courseId,
      'Template Course Title': courseTitle,
      'TEMPLATE_DATE': new Date().toISOString().split('T')[0],
      'template_': courseId.toLowerCase() + '_'
    };
    
    // Add function-specific replacements
    replacements[`CourseTEMPLATE_ID`] = `Course${courseId}`;
    
    // Function name replacements need to handle the numeric prefix
    Object.keys(replacements).forEach(key => {
      if (key.includes('TEMPLATE_ID')) {
        const newKey = key.replace('TEMPLATE_ID', functionPrefix);
        replacements[newKey] = replacements[key].replace(courseId, functionPrefix);
      }
    });
    
    // Step 1: Copy course configuration to courses directory
    console.log('📁 Creating course configuration...');
    fs.mkdirSync(targetCoursePath, { recursive: true });
    
    // Copy config files
    ['course-config.json', 'course-structure.json', 'README.md'].forEach(file => {
      const srcFile = path.join(templatePath, file);
      const destFile = path.join(targetCoursePath, file);
      let content = fs.readFileSync(srcFile, 'utf8');
      
      Object.entries(replacements).forEach(([placeholder, value]) => {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      });
      
      fs.writeFileSync(destFile, content);
    });
    
    // Step 2: Create frontend course directory in src
    console.log('📁 Creating frontend course components...');
    fs.mkdirSync(srcCoursePath, { recursive: true });
    
    // Copy main index.js
    let indexContent = fs.readFileSync(path.join(templatePath, 'index.js'), 'utf8');
    Object.entries(replacements).forEach(([placeholder, value]) => {
      indexContent = indexContent.replace(new RegExp(placeholder, 'g'), value);
    });
    fs.writeFileSync(path.join(srcCoursePath, 'index.js'), indexContent);
    
    // Copy course config files to frontend location
    ['course-config.json', 'course-structure.json'].forEach(file => {
      const srcFile = path.join(templatePath, file);
      const destFile = path.join(srcCoursePath, file);
      let content = fs.readFileSync(srcFile, 'utf8');
      
      Object.entries(replacements).forEach(([placeholder, value]) => {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      });
      
      fs.writeFileSync(destFile, content);
    });
    
    // Copy content directory
    const contentSrc = path.join(templatePath, 'content');
    const contentDest = path.join(srcCoursePath, 'content');
    copyDirectory(contentSrc, contentDest, replacements);
    
    // Step 3: Copy cloud functions
    console.log('📁 Creating cloud functions...');
    const functionsSrc = path.join(templatePath, 'functions', 'TEMPLATE_ID');
    copyDirectory(functionsSrc, functionsPath, replacements);
    
    // Step 3b: Copy course config to functions directory for cloud function access
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
    
    // Step 4: Rename template files/folders
    console.log('📝 Renaming template files...');
    renameTemplateFiles(functionsPath, 'TEMPLATE_ID', courseId);
    
    // Step 5: Update course configuration
    console.log('⚙️  Finalizing course configuration...');
    
    // Update all copies of course-config.json
    const configPaths = [
      path.join(targetCoursePath, 'course-config.json'),
      path.join(srcCoursePath, 'course-config.json'),
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
    
    // Step 6: Generate helpful output
    const functionExports = generateFunctionExports(courseId);
    
    // Fix export naming if courseId starts with a number
    const exportSteps = functionExports.split('\n').map(line => {
      if (/^exports\.\d/.test(line)) {
        // Replace exports.2_ with exports.course2_
        return line.replace(/exports\.(\d+)_/, 'exports.course$1_');
      }
      return line;
    }).join('\n');
    const componentName = `Course${courseId}`;
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
   Config: ${targetCoursePath}
   Frontend: ${srcCoursePath}
   Functions: ${functionsPath}

🔧 Next steps:

1. Add to src/FirebaseCourses/CourseRouter.js:
   
   Import at the top:
   ${importStatement}
   
   Add to switch statement:
${routerCase}

2. Add to functions/index.js:
   
${exportSteps}

3. Deploy functions:
   firebase deploy --only functions:${functionPrefix}_*

4. Start development:
   npm start

📖 See ${targetCoursePath}/README.md for detailed instructions.

💡 Tips:
   - Content folders are numbered for easy ordering
   - Cloud functions follow the naming convention
   - Start simple, add complexity as needed
   - Check each folder's README for guidance
`);
    
  } catch (error) {
    console.error('❌ Error creating course:', error.message);
    
    // Cleanup on error
    if (fs.existsSync(targetCoursePath)) {
      fs.rmSync(targetCoursePath, { recursive: true, force: true });
    }
    if (fs.existsSync(srcCoursePath)) {
      fs.rmSync(srcCoursePath, { recursive: true, force: true });
    }
    if (fs.existsSync(functionsPath)) {
      fs.rmSync(functionsPath, { recursive: true, force: true });
    }
    
    process.exit(1);
  }
}

// Run the script
createCourse();