#!/usr/bin/env node

/**
 * Course Generation Script - Structure-First Approach Only
 * Creates a new course from existing course-structure.json
 * 
 * USAGE:
 *   node scripts/create-course.js --id=4 --title="Course Title" [--grade=10] [--credits=1]
 * 
 * PREREQUISITES:
 *   1. Create directory: src/FirebaseCourses/courses/4
 *   2. Create course-structure.json in that directory (see example below)
 *   3. Run this script to generate all supporting files
 * 
 * EXAMPLE course-structure.json:
 * {
 *   "courseStructure": {
 *     "units": [
 *       {
 *         "unitId": "unit_1_intro",
 *         "title": "Unit 1: Introduction", 
 *         "description": "Getting started with the basics",
 *         "order": 1,
 *         "items": [
 *           {
 *             "itemId": "lesson_welcome",
 *             "type": "lesson",
 *             "title": "Welcome",
 *             "description": "Course introduction and overview",
 *             "contentPath": "01-welcome",
 *             "hasCloudFunctions": false,
 *             "order": 1,
 *             "estimatedTime": 30,
 *             "required": true
 *           },
 *           {
 *             "itemId": "lesson_basics",
 *             "type": "lesson", 
 *             "title": "Basic Concepts",
 *             "description": "Fundamental concepts and principles",
 *             "contentPath": "02-basics",
 *             "hasCloudFunctions": true,
 *             "order": 2,
 *             "estimatedTime": 45,
 *             "required": true,
 *             "assessments": [
 *               {
 *                 "assessmentId": "basics_practice",
 *                 "type": "ai_multiple_choice",
 *                 "title": "Understanding Check",
 *                 "cloudFunctionName": "course4_02_basics_aiQuestion",
 *                 "required": true
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   "navigation": {
 *     "allowSkipAhead": false,
 *     "requireCompletion": true,
 *     "showProgress": true
 *   },
 *   "settings": {
 *     "enableDiscussions": false,
 *     "allowPeerReview": false,
 *     "trackTime": true,
 *     "autoSave": true
 *   }
 * }
 * 
 * ITEM TYPES:
 *   - "lesson": Standard lesson content
 *   - "assignment": Graded assignment  
 *   - "exam": Formal examination
 * 
 * CLOUD FUNCTIONS:
 *   - Set hasCloudFunctions: true for items that need AI assessments
 *   - Assessment files will be created but empty (implement separately)
 *   - Use createAIMultipleChoice pattern from existing courses
 * 
 * WHAT THIS SCRIPT GENERATES:
 *   - React components for each content item
 *   - Empty assessment.js files (where hasCloudFunctions: true)
 *   - Course configuration files (frontend + backend)
 *   - Content registry and routing system
 * 
 * AFTER RUNNING SCRIPT:
 *   1. Add course import to CourseRouter.js
 *   2. Add course case to CourseRouter.js switch statement
 *   3. Implement assessment functions using createAIMultipleChoice
 *   4. Add function exports to functions/index.js
 *   5. Deploy: firebase deploy --only functions:course4_*
 * 
 * EXAMPLES:
 *   node scripts/create-course.js --id=4 --title="Math Basics"
 *   node scripts/create-course.js --id=101 --title="Advanced Physics" --grade=12 --credits=5
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
  console.log('Usage: node scripts/create-course.js --id=4 --title="Course Title"');
  console.log('Optional: --credits=1 --grade=10');
  console.log('');
  console.log('Prerequisites:');
  console.log('  1. Create directory: src/FirebaseCourses/courses/[ID]');
  console.log('  2. Create course-structure.json in that directory');
  console.log('  3. Run this script to generate supporting files');
  process.exit(1);
}

// Validate course ID is numeric
if (!/^\d+$/.test(options.id)) {
  console.error('❌ Error: Course ID must be numeric (e.g., 4, 101, 3)');
  process.exit(1);
}

// Set defaults
const courseId = options.id;
const courseTitle = options.title || `Course ${courseId}`;
const credits = options.credits || '1';
const grade = options.grade || '10';

// Define paths
const srcCoursePath = path.join(__dirname, '..', 'src', 'FirebaseCourses', 'courses', courseId);
const functionsPath = path.join(__dirname, '..', 'functions', 'courses', courseId);
const functionsConfigPath = path.join(__dirname, '..', 'functions', 'courses-config', courseId);
const courseStructurePath = path.join(srcCoursePath, 'course-structure.json');

console.log(`
🚀 Course Creation Preview
📚 Course ID: ${courseId}
📖 Title: ${courseTitle}
💳 Credits: ${credits}
📊 Grade Level: ${grade}
📋 Mode: Structure-First
`);

// Check directory exists
if (!fs.existsSync(srcCoursePath)) {
  console.error(`❌ Error: Course directory does not exist`);
  console.error(`Expected: ${srcCoursePath}`);
  console.log('');
  console.log('💡 Please create the directory first:');
  console.log(`   mkdir -p ${srcCoursePath}`);
  console.log('');
  console.log('Then create course-structure.json in that directory and run this script again.');
  process.exit(1);
}

// Check if course-structure.json exists
if (!fs.existsSync(courseStructurePath)) {
  console.error(`❌ Error: course-structure.json not found`);
  console.error(`Expected: ${courseStructurePath}`);
  console.log('');
  console.log('💡 Please create course-structure.json first:');
  console.log(`   # Create ${courseStructurePath} with your course structure`);
  console.log('   # See the script header for a complete example');
  process.exit(1);
}

// Check if course functions already exist
if (fs.existsSync(functionsPath)) {
  console.error(`❌ Error: Course ${courseId} cloud functions already exist at ${functionsPath}`);
  console.error('This course appears to have been created already.');
  console.log('');
  console.log('💡 To recreate the course:');
  console.log(`   1. Delete existing files: node scripts/delete-course.js --id=${courseId}`);
  console.log(`   2. Run this script again`);
  process.exit(1);
}

if (fs.existsSync(functionsConfigPath)) {
  console.error(`❌ Error: Course ${courseId} config already exists at ${functionsConfigPath}`);
  console.error('This course appears to have been created already.');
  console.log('');
  console.log('💡 To recreate the course:');
  console.log(`   1. Delete existing files: node scripts/delete-course.js --id=${courseId}`);
  console.log(`   2. Run this script again`);
  process.exit(1);
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
 * Preview course structure and get confirmation
 */
async function previewAndConfirm(courseStructurePath, courseId, courseTitle, credits, grade) {
  try {
    // Read and parse course structure
    const structureContent = fs.readFileSync(courseStructurePath, 'utf8');
    const courseStructure = JSON.parse(structureContent);
    
    if (!courseStructure.courseStructure || !courseStructure.courseStructure.units) {
      console.error('❌ Error: Invalid course structure format');
      console.error('Expected courseStructure.units array in the JSON file');
      process.exit(1);
    }
    
    // Analyze the structure
    const units = courseStructure.courseStructure.units;
    let totalItems = 0;
    let itemsWithFunctions = 0;
    let totalAssessments = 0;
    const itemTypes = { lesson: 0, assignment: 0, exam: 0, other: 0 };
    
    units.forEach(unit => {
      unit.items.forEach(item => {
        totalItems++;
        if (item.hasCloudFunctions) {
          itemsWithFunctions++;
        }
        if (item.assessments && item.assessments.length > 0) {
          totalAssessments += item.assessments.length;
        }
        if (itemTypes[item.type] !== undefined) {
          itemTypes[item.type]++;
        } else {
          itemTypes.other++;
        }
      });
    });
    
    // Display preview
    console.log('📋 Course Structure Preview:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📚 Course: ${courseTitle} (ID: ${courseId})`);
    console.log(`📊 Grade: ${grade} | Credits: ${credits}`);
    console.log(`📁 Units: ${units.length}`);
    console.log(`📄 Total Items: ${totalItems}`);
    console.log(`🔧 Items with Cloud Functions: ${itemsWithFunctions}`);
    console.log(`📝 Total Assessments: ${totalAssessments}`);
    console.log('');
    
    console.log('📊 Item Types:');
    if (itemTypes.lesson > 0) console.log(`   📖 Lessons: ${itemTypes.lesson}`);
    if (itemTypes.assignment > 0) console.log(`   📋 Assignments: ${itemTypes.assignment}`);
    if (itemTypes.exam > 0) console.log(`   🎯 Exams: ${itemTypes.exam}`);
    if (itemTypes.other > 0) console.log(`   ❓ Other: ${itemTypes.other}`);
    console.log('');
    
    // Show unit breakdown
    console.log('📚 Units Breakdown:');
    units.forEach((unit, index) => {
      console.log(`   ${index + 1}. ${unit.title}`);
      console.log(`      📝 ${unit.items.length} items`);
      unit.items.forEach(item => {
        const funcIcon = item.hasCloudFunctions ? '🔧' : '📄';
        const assessmentCount = item.assessments ? item.assessments.length : 0;
        const assessmentInfo = assessmentCount > 0 ? ` (${assessmentCount} assessments)` : '';
        console.log(`         ${funcIcon} ${item.title}${assessmentInfo}`);
      });
      console.log('');
    });
    
    // Show what will be created
    console.log('🔧 What will be created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 Frontend Files:');
    console.log(`   src/FirebaseCourses/courses/${courseId}/index.js`);
    console.log(`   src/FirebaseCourses/courses/${courseId}/course-display.json`);
    console.log(`   src/FirebaseCourses/courses/${courseId}/content/index.js`);
    
    units.forEach(unit => {
      unit.items.forEach(item => {
        console.log(`   src/FirebaseCourses/courses/${courseId}/content/${item.contentPath}/index.js`);
      });
    });
    
    console.log('');
    console.log('⚡ Cloud Functions:');
    console.log(`   functions/courses-config/${courseId}/course-config.json`);
    
    let functionsCreated = 0;
    units.forEach(unit => {
      unit.items.forEach(item => {
        if (item.hasCloudFunctions) {
          functionsCreated++;
          console.log(`   functions/courses/${courseId}/${item.contentPath}/assessments.js`);
        }
      });
    });
    
    if (functionsCreated === 0) {
      console.log('   (No cloud functions - no items have hasCloudFunctions: true)');
    }
    
    console.log('');
    console.log('📋 Manual Steps Required After Creation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Add course import to CourseRouter.js:');
    console.log(`   const Course${courseId} = lazy(() => import('./courses/${courseId}'));`);
    console.log('');
    console.log('2. Add course case to CourseRouter.js switch statement:');
    console.log(`   case '${courseId}': ...`);
    console.log('');
    if (itemsWithFunctions > 0) {
      console.log('3. Implement assessment functions using createAIMultipleChoice pattern');
      console.log('4. Add function exports to functions/index.js');
      console.log(`5. Deploy: firebase deploy --only functions:course${courseId}_*`);
    } else {
      console.log('3. No cloud functions to implement (no items have assessments)');
    }
    console.log('');
    
    // Get confirmation
    const answer = await askConfirmation('❓ Do you want to create this course? (yes/no): ');
    
    if (answer !== 'yes' && answer !== 'y') {
      console.log('🚫 Course creation cancelled.');
      process.exit(0);
    }
    
    console.log('✅ Confirmed! Creating course...');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error reading or parsing course-structure.json:', error.message);
    console.error('Please check that the file exists and contains valid JSON.');
    process.exit(1);
  }
}

/**
 * Generate content file from course structure based on item type
 */
function generateContentFile(courseId, item) {
  const functionPrefix = `course${courseId}`;
  
  const templates = {
    lesson: `import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const ${item.title.replace(/[^a-zA-Z0-9]/g, '')} = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">${item.title}</h1>
        <p className="text-gray-600 mb-6">${item.description}</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      ${item.hasCloudFunctions ? `
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="${item.contentPath.replace(/-/g, '_')}_practice"
        cloudFunctionName="${functionPrefix}_${item.contentPath.replace(/-/g, '_')}_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />` : ''}
    </div>
  );
};

export default ${item.title.replace(/[^a-zA-Z0-9]/g, '')};`,
    
    assignment: `import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const ${item.title.replace(/[^a-zA-Z0-9]/g, '')} = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">${item.title}</h1>
        <p className="text-gray-600 mb-6">${item.description}</p>
        ${item.estimatedTime ? `<p className="text-sm text-blue-600">Estimated Time: ${item.estimatedTime} minutes</p>` : ''}
      </section>

      {/* Assignment Instructions */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
        <p>Assignment instructions go here...</p>
      </section>

      ${item.hasCloudFunctions ? `
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="${item.contentPath.replace(/-/g, '_')}_assessment"
        cloudFunctionName="${functionPrefix}_${item.contentPath.replace(/-/g, '_')}_aiQuestion"
        title="${item.title}"
        theme="green"
      />` : ''}
    </div>
  );
};

export default ${item.title.replace(/[^a-zA-Z0-9]/g, '')};`,
    
    exam: `import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const ${item.title.replace(/[^a-zA-Z0-9]/g, '')} = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">${item.title}</h1>
        <p className="text-gray-600 mb-6">${item.description}</p>
        ${item.estimatedTime ? `<p className="text-sm text-red-600 font-semibold">Time Limit: ${item.estimatedTime} minutes</p>` : ''}
      </section>

      {/* Exam Instructions */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
        <p>Exam instructions and rules go here...</p>
      </section>

      ${item.hasCloudFunctions ? `
      {/* Exam Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="${item.contentPath.replace(/-/g, '_')}_exam"
        cloudFunctionName="${functionPrefix}_${item.contentPath.replace(/-/g, '_')}_aiQuestion"
        title="${item.title}"
        theme="red"
      />` : ''}
    </div>
  );
};

export default ${item.title.replace(/[^a-zA-Z0-9]/g, '')};`
  };

  return templates[item.type] || templates.lesson;
}

/**
 * Generate empty assessment function file
 */
function generateAssessmentFile(courseId, item) {
  return `// Assessment functions for ${item.title}
// TODO: Implement assessment functions for this lesson
`;
}

/**
 * Generate course from existing course-structure.json
 */
async function createFromStructure() {
  try {
    // Show preview and get confirmation
    await previewAndConfirm(courseStructurePath, courseId, courseTitle, credits, grade);
    
    console.log('📝 Reading course structure...');
    
    // Read course structure
    const structureContent = fs.readFileSync(courseStructurePath, 'utf8');
    const courseStructure = JSON.parse(structureContent);
    
    if (!courseStructure.courseStructure || !courseStructure.courseStructure.units) {
      throw new Error('Invalid course structure format. Expected courseStructure.units array.');
    }
    
    const functionPrefix = `course${courseId}`;
    const componentName = `Course${courseId}`;
    
    // Create directories
    console.log('📁 Creating directories...');
    fs.mkdirSync(functionsPath, { recursive: true });
    fs.mkdirSync(functionsConfigPath, { recursive: true });
    
    // Create main course index.js
    console.log('📄 Creating main course component...');
    const mainIndexContent = `import React from 'react';
import FirebaseCourseWrapper from '../FirebaseCourseWrapperImproved';
import { generateCourseContent } from './content';

const ${componentName} = ({ course, activeItemId, onItemSelect, isStaffView, devMode }) => {
  return (
    <FirebaseCourseWrapper
      course={course}
      activeItemId={activeItemId}
      onItemSelect={onItemSelect}
      isStaffView={isStaffView}
      devMode={devMode}
      generateContent={generateCourseContent}
    />
  );
};

export default ${componentName};`;
    
    fs.writeFileSync(path.join(srcCoursePath, 'index.js'), mainIndexContent);
    
    // Create content directory and index
    const contentDir = path.join(srcCoursePath, 'content');
    fs.mkdirSync(contentDir, { recursive: true });
    
    // Generate content files for each item
    console.log('📋 Generating content files...');
    const contentImports = [];
    const contentExports = [];
    const functionsToGenerate = [];
    
    courseStructure.courseStructure.units.forEach(unit => {
      unit.items.forEach(item => {
        // Create content directory
        const itemContentDir = path.join(contentDir, item.contentPath);
        fs.mkdirSync(itemContentDir, { recursive: true });
        
        // Generate content file
        const contentFile = generateContentFile(courseId, item);
        fs.writeFileSync(path.join(itemContentDir, 'index.js'), contentFile);
        
        // Add to content registry
        const componentName = item.title.replace(/[^a-zA-Z0-9]/g, '');
        contentImports.push(`import ${componentName} from './${item.contentPath}';`);
        contentExports.push(`  '${item.contentPath}': ${componentName},`);
        
        // Generate cloud functions if needed
        if (item.hasCloudFunctions) {
          const functionDir = path.join(functionsPath, item.contentPath);
          fs.mkdirSync(functionDir, { recursive: true });
          
          const assessmentFile = generateAssessmentFile(courseId, item);
          fs.writeFileSync(path.join(functionDir, 'assessments.js'), assessmentFile);
          
          // Add to functions list
          const safePath = item.contentPath.replace(/-/g, '_');
          functionsToGenerate.push({
            path: item.contentPath,
            safePath: safePath,
            functionName: `${functionPrefix}_${safePath}_aiQuestion`,
            longAnswerFunction: item.type === 'assignment' || item.type === 'exam' ? `${functionPrefix}_${safePath}_aiLongAnswer` : null
          });
        }
      });
    });
    
    // Create content index file
    const contentIndexContent = `${contentImports.join('\n')}

const contentComponents = {
${contentExports.join('\n')}
};

export const generateCourseContent = (contentPath, props) => {
  const Component = contentComponents[contentPath];
  if (!Component) {
    return <div>Content not found for path: {contentPath}</div>;
  }
  return <Component {...props} />;
};

export default contentComponents;`;
    
    fs.writeFileSync(path.join(contentDir, 'index.js'), contentIndexContent);
    
    // Create course configuration files
    console.log('🔧 Creating configuration files...');
    
    // Create course-display.json (safe for frontend)
    const displayConfig = {
      courseId: courseId,
      title: courseTitle,
      fullTitle: `${courseId} - ${courseTitle}`,
      description: `Generated course: ${courseTitle}`,
      grade: grade,
      prerequisites: [],
      instructors: [],
      duration: '1 semester',
      theme: {
        primaryColor: 'blue',
        secondaryColor: 'indigo'
      },
      displaySettings: {
        showProgressBar: true,
        showGrades: true,
        enableTextToSpeech: true
      },
      metadata: {
        version: '1.0.0',
        status: 'development',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(
      path.join(srcCoursePath, 'course-display.json'),
      JSON.stringify(displayConfig, null, 2)
    );
    
    // Create course-config.json (backend only)
    const fullConfig = {
      ...displayConfig,
      credits: parseInt(credits),
      contentFolder: 'content',
      functionsFolder: `functions/${courseId}`,
      weights: {
        lesson: 0.15,
        assignment: 0.35,
        lab: 0.2,
        exam: 0.3
      },
      globalSettings: {
        allowLateSubmissions: true,
        latePenaltyPerDay: 0.1,
        maxLateDays: 7,
        showProgressBar: true,
        showGrades: true,
        enableAIQuestions: true,
        enableTextToSpeech: true,
        enableCollaboration: false,
        requireSequentialProgress: false
      },
      activityTypes: {
        lesson: {
          displayName: 'Lesson',
          maxAttempts: 999,
          attemptPenalty: 0,
          pointValue: 5,
          theme: 'purple',
          showDetailedFeedback: true,
          enableHints: true,
          allowDifficultySelection: false,
          defaultDifficulty: 'intermediate',
          aiSettings: {
            temperature: 0.7,
            maxTokens: 1000,
            topP: 0.9
          },
          longAnswer: {
            totalPoints: 5,
            rubricCriteria: 3,
            wordLimits: { min: 50, max: 200 },
            showRubric: true,
            showWordCount: true
          }
        },
        assignment: {
          displayName: 'Assignment',
          maxAttempts: 3,
          attemptPenalty: 0.2,
          pointValue: 10,
          theme: 'blue',
          showDetailedFeedback: true,
          enableHints: true,
          allowDifficultySelection: true,
          defaultDifficulty: 'beginner',
          freeRegenerationOnDifficultyChange: true,
          aiSettings: {
            temperature: 0.7,
            maxTokens: 1200,
            topP: 0.9
          },
          longAnswer: {
            totalPoints: 10,
            rubricCriteria: 4,
            wordLimits: { min: 50, max: 300 },
            showRubric: true,
            showWordCount: true
          }
        },
        lab: {
          displayName: 'Lab',
          maxAttempts: 3,
          attemptPenalty: 0.2,
          pointValue: 15,
          theme: 'green',
          showDetailedFeedback: true,
          enableHints: true,
          allowDifficultySelection: false,
          defaultDifficulty: 'intermediate',
          aiSettings: {
            temperature: 0.6,
            maxTokens: 1200,
            topP: 0.8
          },
          longAnswer: {
            totalPoints: 15,
            rubricCriteria: 5,
            wordLimits: { min: 50, max: 400 },
            showRubric: true,
            showWordCount: true
          }
        },
        exam: {
          displayName: 'Exam',
          maxAttempts: 1,
          attemptPenalty: 0,
          pointValue: 25,
          theme: 'red',
          showDetailedFeedback: false,
          enableHints: false,
          allowDifficultySelection: false,
          defaultDifficulty: 'advanced',
          aiSettings: {
            temperature: 0.5,
            maxTokens: 1500,
            topP: 0.8
          },
          longAnswer: {
            totalPoints: 5,
            rubricCriteria: 5,
            wordLimits: { min: 50, max: 300 },
            showRubric: false,
            showWordCount: true
          }
        }
      },
      themes: {
        lesson: {
          primaryColor: 'purple',
          secondaryColor: 'indigo',
          accent: '#8b5cf6',
          background: '#f5f3ff',
          border: '#ddd6fe'
        },
        assignment: {
          primaryColor: 'blue',
          secondaryColor: 'sky',
          accent: '#3b82f6',
          background: '#f0f9ff',
          border: '#bfdbfe'
        },
        lab: {
          primaryColor: 'green',
          secondaryColor: 'emerald',
          accent: '#10b981',
          background: '#ecfdf5',
          border: '#a7f3d0'
        },
        exam: {
          primaryColor: 'red',
          secondaryColor: 'rose',
          accent: '#ef4444',
          background: '#fef2f2',
          border: '#fecaca'
        },
        default: {
          primaryColor: 'purple',
          secondaryColor: 'blue',
          accent: '#8b5cf6',
          background: '#f5f3ff',
          border: '#ddd6fe'
        },
        customCSS: ''
      },
      notifications: {
        enableEmailNotifications: true,
        enableInAppNotifications: true,
        notifyOnGrade: true,
        notifyOnFeedback: true,
        notifyOnAnnouncement: true
      }
    };
    
    fs.writeFileSync(
      path.join(functionsConfigPath, 'course-config.json'),
      JSON.stringify(fullConfig, null, 2)
    );
    
    console.log(`
✅ Course ${courseId} created successfully!

📂 Files created:
   Frontend: ${srcCoursePath}
   Functions: ${functionsPath} (${functionsToGenerate.length} empty assessment files)
   Config: ${functionsConfigPath}

🔧 Generated:
   ✅ ${contentImports.length} content components with React templates
   ✅ ${functionsToGenerate.length} empty assessment.js files  
   ✅ Course configuration files (display & backend)
   ✅ Content registry and routing

📋 Next steps:
1. Add course to CourseRouter.js:
   - Import: const Course${courseId} = lazy(() => import('./courses/${courseId}'));
   - Add case for courseId '${courseId}' in switch statement

2. Implement assessment functions in:
   functions/courses/${courseId}/*/assessments.js

3. Add function exports to functions/index.js when ready:
   exports.${functionPrefix}_*_aiQuestion = require('./courses/${courseId}/...

4. Deploy cloud functions:
   firebase deploy --only functions:${functionPrefix}_*

💡 Tips:
   - Content files have basic React templates - customize as needed
   - Assessment files are empty - implement using createAIMultipleChoice pattern
   - All files follow established patterns from existing courses
   - Check course-display.json for frontend-safe settings
   - Backend config in functions/courses-config/${courseId}/course-config.json
`);
    
  } catch (error) {
    console.error('❌ Error creating course from structure:', error.message);
    
    // Cleanup on error (but preserve the original course-structure.json)
    if (fs.existsSync(functionsPath)) {
      fs.rmSync(functionsPath, { recursive: true, force: true });
    }
    if (fs.existsSync(functionsConfigPath)) {
      fs.rmSync(functionsConfigPath, { recursive: true, force: true });
    }
    
    const contentDir = path.join(srcCoursePath, 'content');
    if (fs.existsSync(contentDir)) {
      fs.rmSync(contentDir, { recursive: true, force: true });
    }
    
    // Remove generated files but keep course-structure.json
    const filesToRemove = ['index.js', 'course-display.json'];
    filesToRemove.forEach(file => {
      const filePath = path.join(srcCoursePath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    process.exit(1);
  }
}

// Run the script - Structure-First Only
(async () => {
  await createFromStructure();
})().catch(error => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});