#!/usr/bin/env node

/**
 * Firebase Course Generator Script with Rollback Support
 * 
 * This script automatically generates the complete file structure for a new course
 * based on a JSON configuration file, with full rollback capabilities.
 * 
 * Usage: 
 *   Generate: node generate-course-with-rollback.js generate <config-file.json>
 *   Rollback: node generate-course-with-rollback.js rollback <courseId>
 *   Clean:    node generate-course-with-rollback.js clean <courseId>
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n${'='.repeat(msg.length)}`),
  action: (msg) => console.log(`${colors.magenta}►${colors.reset} ${msg}`)
};

// Paths configuration
const PATHS = {
  backupDir: path.join(process.cwd(), 'course-generator', 'backups'),
  configDir: path.join(process.cwd(), 'course-generator', 'configs'),
  manifestDir: path.join(process.cwd(), 'course-generator', 'manifests'),
  frontendBase: path.join(process.cwd(), 'src', 'FirebaseCourses', 'courses'),
  backendBase: path.join(process.cwd(), 'functions', 'courses')
};

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Initialize all required directories
function initializeDirectories() {
  Object.values(PATHS).forEach(dirPath => {
    ensureDirectoryExists(dirPath);
  });
}

// Create a backup of existing files
function backupExistingFiles(courseId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(PATHS.backupDir, `course-${courseId}-${timestamp}`);
  
  const frontendPath = path.join(PATHS.frontendBase, courseId);
  const backendPath = path.join(PATHS.backendBase, courseId);
  
  const filesToBackup = [];
  
  // Check frontend files
  if (fs.existsSync(frontendPath)) {
    log.warning(`Frontend files exist for course ${courseId}, creating backup...`);
    const frontendBackup = path.join(backupPath, 'frontend', courseId);
    ensureDirectoryExists(path.dirname(frontendBackup));
    copyDirectory(frontendPath, frontendBackup);
    filesToBackup.push({ original: frontendPath, backup: frontendBackup });
  }
  
  // Check backend files
  if (fs.existsSync(backendPath)) {
    log.warning(`Backend files exist for course ${courseId}, creating backup...`);
    const backendBackup = path.join(backupPath, 'backend', courseId);
    ensureDirectoryExists(path.dirname(backendBackup));
    copyDirectory(backendPath, backendBackup);
    filesToBackup.push({ original: backendPath, backup: backendBackup });
  }
  
  if (filesToBackup.length > 0) {
    // Save backup manifest
    const manifest = {
      courseId,
      timestamp,
      backupPath,
      files: filesToBackup
    };
    
    const manifestPath = path.join(PATHS.manifestDir, `backup-${courseId}-${timestamp}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    log.success(`Backup created at: ${backupPath}`);
    log.info(`Manifest saved at: ${manifestPath}`);
    
    return manifest;
  }
  
  return null;
}

// Copy directory recursively
function copyDirectory(src, dest) {
  ensureDirectoryExists(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Remove directory recursively
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        removeDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

// Save generation manifest
function saveGenerationManifest(courseId, config, generatedFiles) {
  const manifest = {
    courseId,
    generatedAt: new Date().toISOString(),
    configFile: config,
    files: generatedFiles,
    version: '1.0.0'
  };
  
  const manifestPath = path.join(PATHS.manifestDir, `course-${courseId}-manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log.success(`Generation manifest saved: ${manifestPath}`);
  
  return manifestPath;
}

// Load generation manifest
function loadGenerationManifest(courseId) {
  const manifestPath = path.join(PATHS.manifestDir, `course-${courseId}-manifest.json`);
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`No manifest found for course ${courseId}`);
  }
  
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

// Write file with tracking
function writeFileWithTracking(filePath, content, fileList) {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  fileList.push(filePath);
  log.success(`Created: ${path.relative(process.cwd(), filePath)}`);
}

// Convert item ID to folder name
function itemIdToFolderName(itemId) {
  const parts = itemId.split('_');
  if (parts.length >= 4) {
    return `${parts[0]}-${parts.slice(3).join('-')}`;
  }
  return itemId.replace(/_/g, '-');
}

// Get theme for type
function getThemeForType(type) {
  const themes = {
    lesson: 'purple',
    assignment: 'blue',
    lab: 'green',
    exam: 'red',
    quiz: 'amber'
  };
  return themes[type] || 'purple';
}

// [Include all the generation functions from the original script]
// generateCourseIndex, generateContentRegistry, generateLessonComponent, 
// generateAssessmentMapping, generateAssessmentConfig
// (These remain the same as in the original script)

// Generate the main course index.js file
function generateCourseIndex(config) {
  return `import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import contentRegistry from './content';
import { 
  getLessonAccessibility, 
  getHighestAccessibleLesson,
  shouldBypassAccessControl 
} from '../../utils/lessonAccess';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lab: 'bg-green-100 text-green-800 border-green-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  quiz: 'bg-amber-100 text-amber-800 border-amber-200',
  info: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * Wrapper component that tracks lesson access when content is displayed
 */
const LessonContentWrapper = ({ 
  activeItem, 
  ContentComponent, 
  course,
  courseId, 
  isStaffView, 
  devMode, 
  onItemSelect, 
  setInternalActiveItemId, 
  findNextLesson,
  gradebookItems = {},
  courseStructure,
  // AI-related props
  onPrepopulateMessage,
  createAskAIButton,
  createAskAIButtonFromElement,
  AIAccordion,
  onAIAccordionContent
}) => {
  useEffect(() => {
    if (activeItem?.itemId && !shouldBypassAccessControl(isStaffView, devMode)) {
      const courseWithGradebook = {
        Gradebook: {
          items: gradebookItems
        },
        courseDetails: {
          'course-config': {
            progressionRequirements: {
              enabled: ${config.progressionRequirements?.enabled || false}
            }
          }
        }
      };
      
      const accessibility = getLessonAccessibility({ courseStructure }, courseWithGradebook);
      const accessInfo = accessibility[activeItem.itemId];
      
      if (!accessInfo) {
        console.warn('⚠️ No access info found for lesson:', activeItem.itemId);
        return;
      }
      
      if (!accessInfo.accessible) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLesson = urlParams.get('lesson');
        
        if (urlLesson === activeItem.itemId) {
          return;
        }
        
        const highestAccessible = getHighestAccessibleLesson({ courseStructure }, courseWithGradebook);
        if (highestAccessible && highestAccessible !== activeItem.itemId) {
          if (onItemSelect) {
            onItemSelect(highestAccessible);
          } else {
            setInternalActiveItemId(highestAccessible);
          }
          return;
        }
      }
    }
  }, [activeItem?.itemId, activeItem?.title, activeItem?.type, activeItem?.unitId, activeItem?.unitName, isStaffView, devMode, onItemSelect, setInternalActiveItemId, gradebookItems, courseStructure]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Item header */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-2">
          <Badge className={\`\${typeColors[activeItem.type] || 'bg-gray-100 text-gray-800'} text-sm\`}>
            {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">{activeItem.title}</h1>
        </div>
        {activeItem.description && (
          <p className="text-gray-600">{activeItem.description}</p>
        )}
        {activeItem.estimatedTime && (
          <p className="text-sm text-blue-600 mt-2">
            Estimated time: {activeItem.estimatedTime} minutes
          </p>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ContentComponent 
          course={course}
          courseId={courseId}
          itemId={activeItem.itemId}
          activeItem={activeItem}
          isStaffView={isStaffView}
          devMode={devMode}
          onNavigateToLesson={(lessonItemId) => {
            if (onItemSelect) {
              onItemSelect(lessonItemId);
            } else {
              setInternalActiveItemId(lessonItemId);
            }
          }}
          onNavigateToNext={() => {
            const nextLessonId = findNextLesson(activeItem?.itemId);
            if (nextLessonId) {
              if (onItemSelect) {
                onItemSelect(nextLessonId);
              } else {
                setInternalActiveItemId(nextLessonId);
              }
            }
          }}
          // AI-related props
          onPrepopulateMessage={onPrepopulateMessage}
          createAskAIButton={createAskAIButton}
          createAskAIButtonFromElement={createAskAIButtonFromElement}
          AIAccordion={AIAccordion}
          onAIAccordionContent={onAIAccordionContent}
        />
      </div>
    </div>
  );
};

/**
 * Main Course Component for Course ${config.courseId}
 * ${config.title}
 * 
 * This component uses a convention-based structure where:
 * - Content is organized in numbered folders
 * - Cloud functions follow the pattern: COURSEID_FOLDERNAME_FUNCTIONTYPE
 * - Configuration is loaded from Firebase database
 */
const Course${config.courseId} = ({
  course,
  activeItemId: externalActiveItemId,
  onItemSelect,
  isStaffView = false,
  devMode = false,
  gradebookItems = {},
  // AI-related props
  onPrepopulateMessage,
  createAskAIButton,
  createAskAIButtonFromElement,
  AIAccordion,
  onAIAccordionContent,
  // Next lesson navigation props
  currentLessonCompleted = false,
  nextLessonInfo = null,
  courseProgress = 0
}) => {
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course?.CourseID || '${config.courseId}';
  
  // Get course structure from course object (database-driven)
  const structure = course?.courseDetails?.['course-config']?.courseStructure?.units || 
                   course?.courseStructure?.units || 
                   course?.Gradebook?.courseStructure?.units || 
                   [];

  // Use external or internal active item ID
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  // Set default active item
  useEffect(() => {
    if (!activeItemId && externalActiveItemId === undefined && structure && structure.length > 0) {
      const firstUnit = structure[0];
      if (firstUnit.items && firstUnit.items.length > 0) {
        const firstItemId = firstUnit.items[0].itemId;
        setInternalActiveItemId(firstItemId);
        if (onItemSelect) {
          onItemSelect(firstItemId);
        }
      }
    }
  }, [activeItemId, externalActiveItemId, internalActiveItemId, structure, onItemSelect]);

  // Find active item in structure
  const activeItem = React.useMemo(() => {
    if (!activeItemId || !structure) {
      return null;
    }

    for (const unit of structure) {
      for (const item of unit.items) {
        if (item.itemId === activeItemId) {
          return { ...item, unitId: unit.unitId, unitName: unit.name };
        }
      }
    }
    return null;
  }, [activeItemId, structure]);

  // Helper function to find the next lesson
  const findNextLesson = React.useCallback((currentItemId) => {
    if (!structure || !currentItemId) return null;

    let foundCurrent = false;
    for (const unit of structure) {
      for (const item of unit.items) {
        if (foundCurrent) {
          return item.itemId;
        }
        if (item.itemId === currentItemId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  }, [structure]);

  // Render content based on active item
  const renderContent = () => {
    if (!activeItem) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700">
            Select a lesson to begin
          </h2>
          <p className="text-gray-500 mt-2">
            Choose from the navigation menu on the left
          </p>
        </div>
      );
    }

    const contentPath = activeItem.contentPath || activeItem.itemId;
    const ContentComponent = contentRegistry[contentPath];

    if (!ContentComponent) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-red-600">Content Not Found</h2>
          <p className="text-gray-500 mt-2">
            No content component found for path: {contentPath}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Expected component at: src/FirebaseCourses/courses/${config.courseId}/content/{contentPath}/index.js
          </p>
        </div>
      );
    }

    const courseId = course?.CourseID || '${config.courseId}';

    return (
      <LessonContentWrapper 
        activeItem={activeItem}
        ContentComponent={ContentComponent}
        course={course}
        courseId={courseId}
        isStaffView={isStaffView}
        devMode={devMode}
        onItemSelect={onItemSelect}
        setInternalActiveItemId={setInternalActiveItemId}
        findNextLesson={findNextLesson}
        gradebookItems={gradebookItems}
        courseStructure={{ courseStructure: { units: structure } }}
        // AI-related props
        onPrepopulateMessage={onPrepopulateMessage}
        createAskAIButton={createAskAIButton}
        createAskAIButtonFromElement={createAskAIButtonFromElement}
        AIAccordion={AIAccordion}
        onAIAccordionContent={onAIAccordionContent}
      />
    );
  };

  return renderContent();
};

export default Course${config.courseId};
`;
}

// Generate content registry index.js
function generateContentRegistry(config) {
  const imports = [];
  const registry = [];

  config.courseStructure.units.forEach(unit => {
    unit.items.forEach(item => {
      const folderName = itemIdToFolderName(item.itemId);
      // Ensure component name starts with a letter (JavaScript requirement)
      const rawName = item.itemId.replace(/-/g, '').replace(/_/g, '');
      const componentName = rawName.match(/^\d/) ? `Lesson${rawName}` : rawName;
      
      imports.push(`import ${componentName} from './${folderName}';`);
      registry.push(`  '${item.itemId}': ${componentName},`);
    });
  });

  return `// Content imports
${imports.join('\n')}

// Content registry using itemId as keys - matching database exactly
const contentRegistry = {
${registry.join('\n')}
};

export default contentRegistry;
`;
}

// Generate lesson component
function generateLessonComponent(item, courseId) {
  const componentName = item.title.replace(/[^a-zA-Z0-9]/g, '');
  
  return `import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

/**
 * ${item.title}
 * Type: ${item.type}
 * Estimated Time: ${item.estimatedTime || 30} minutes
 */
const ${componentName} = ({ 
  course, 
  courseId, 
  itemId, 
  activeItem, 
  onNavigateToLesson, 
  onNavigateToNext, 
  onAIAccordionContent 
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [questionsCompleted, setQuestionsCompleted] = useState({});

  // Check if all questions are completed
  const allQuestionsCompleted = ${item.questions ? 
    `Object.keys(questionsCompleted).length === ${item.questions.length} && 
    Object.values(questionsCompleted).every(completed => completed === true)` : 
    'true'};

  const handleQuestionComplete = (questionId) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              ${item.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
              [Add a brief description of this ${item.type}]
            </p>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base md:text-lg">
                🎯 <strong>Learning Objective:</strong> [Add the main learning objective here]
              </p>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveSection('overview')}
                className={\`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 \${
                  activeSection === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('content')}
                className={\`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 \${
                  activeSection === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Main Content
              </button>
              ${item.questions && item.questions.length > 0 ? `
              <button
                onClick={() => setActiveSection('assessment')}
                className={\`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 \${
                  activeSection === 'assessment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                Knowledge Check
              </button>` : ''}
            </nav>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">📚 ${item.type === 'lesson' ? 'Lesson' : item.type.charAt(0).toUpperCase() + item.type.slice(1)} Overview</h2>
                <p className="text-gray-700 mb-4">
                  [Add an overview of what this ${item.type} covers]
                </p>
                
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">Key Topics:</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Topic 1]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Topic 2]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Topic 3]
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">Learning Outcomes:</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Outcome 1]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Outcome 2]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Outcome 3]
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Main Content Section */}
          {activeSection === 'content' && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">📖 Main Content</h2>
                
                {/* Add your main content here */}
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    [Add the main content for this ${item.type}. You can include:]
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li>Text explanations</li>
                    <li>Images and diagrams</li>
                    <li>Videos</li>
                    <li>Interactive elements</li>
                    <li>Examples and practice problems</li>
                  </ul>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      💡 Key Concept
                    </h3>
                    <p className="text-gray-700">
                      [Highlight important concepts or tips here]
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          ${item.questions && item.questions.length > 0 ? `
          {/* Knowledge Check Section */}
          {activeSection === 'assessment' && (
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                  Test your understanding of the key concepts from this ${item.type}.
                </p>
              </div>

              <SlideshowKnowledgeCheck
                courseId={courseId}
                lessonPath="${itemIdToFolderName(item.itemId)}"
                course={course}
                questions={[
                  ${item.questions.map((q, index) => `{
                    type: 'multiple-choice',
                    questionId: '${q.questionId}',
                    title: '${q.title || `Question ${index + 1}`}'
                  }`).join(',\n                  ')}
                ]}
                onComplete={(score, results) => {
                  console.log(\`Knowledge Check completed with \${score}%\`);
                  const allCorrect = Object.values(results).every(result => result === 'correct');
                  if (allCorrect || score >= 80) {
                    ${item.questions.map(q => `handleQuestionComplete('${q.questionId}');`).join('\n                    ')}
                  }
                }}
                theme="${getThemeForType(item.type)}"
              />
            </section>
          )}` : ''}

          {/* Completion Section */}
          {allQuestionsCompleted && (
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Complete! 🎉
              </h2>
              
              <div className="text-center mb-6">
                <p className="text-lg mb-4">
                  Great job completing this ${item.type}!
                </p>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
                  <p className="text-base">
                    You're ready to move on to the next ${item.type === 'lesson' ? 'lesson' : 'section'}.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => onNavigateToNext()}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Continue to Next ${item.type === 'lesson' ? 'Lesson' : 'Section'} →
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

// Generate assessment mapping file
function generateAssessmentMapping(config) {
  const mappings = [];

  config.courseStructure.units.forEach(unit => {
    unit.items.forEach(item => {
      if (item.questions && item.questions.length > 0) {
        const folderName = itemIdToFolderName(item.itemId);
        const comment = `  // ${item.type === 'lesson' ? 'Lesson' : item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${item.itemId.split('_')[0]}: ${item.title}`;
        
        mappings.push(comment);
        item.questions.forEach(question => {
          mappings.push(`  '${question.questionId}': '${folderName}/assessments',`);
        });
        mappings.push('');
      }
    });
  });

  return `/**
 * Assessment Mapping for Course ${config.courseId} (${config.title})
 * 
 * This file maps assessment IDs to their corresponding file paths.
 * Used by the universal assessment function to dynamically load assessment configurations.
 * 
 * Format: 'assessmentId': 'relative/path/to/assessments'
 * Note: Paths are relative to the /functions/courses/${config.courseId}/ directory
 */

module.exports = {
${mappings.join('\n')}
};
`;
}

// Generate assessment configuration file
function generateAssessmentConfig(item, courseId) {
  if (!item.questions || item.questions.length === 0) {
    return null;
  }

  const activityType = item.type;
  const theme = getThemeForType(item.type);

  return `/**
 * Assessment Functions for ${item.title}
 * Course: ${courseId} 
 * Content: ${itemIdToFolderName(item.itemId)}
 * 
 * This module provides assessments for this ${item.type}
 * using the shared assessment system.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = '${activityType}';

// Default settings for this activity type
const activityDefaults = {
  theme: '${theme}',
  maxAttempts: ${activityType === 'exam' ? 1 : 3},
  pointsValue: 1
};

${item.questions.map((question, index) => `
// Question pool ${index + 1}: ${question.title || 'Question ' + (index + 1)}
const questionPool${index + 1} = [
  {
    questionText: "[Add question text here]",
    options: [
      { 
        id: 'a', 
        text: '[Option A text]', 
        feedback: '[Feedback for option A]' 
      },
      { 
        id: 'b', 
        text: '[Option B text]', 
        feedback: '[Feedback for option B]' 
      },
      { 
        id: 'c', 
        text: '[Option C text]', 
        feedback: '[Feedback for option C]' 
      },
      { 
        id: 'd', 
        text: '[Option D text]', 
        feedback: '[Feedback for option D]' 
      }
    ],
    correctOptionId: 'a', // Change to correct option
    explanation: '[Detailed explanation of the correct answer]',
    difficulty: 'intermediate',
    tags: ['topic1', 'topic2']
  },
  // Add more questions to this pool as needed
];`).join('\n')}

/**
 * Assessment Configurations for Universal Assessment Function
 */
const assessmentConfigs = {
${item.questions.map((question, index) => `  '${question.questionId}': {
    type: 'multiple-choice',
    questions: questionPool${index + 1},
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: ${activityType === 'exam' ? 1 : (activityType === 'lesson' ? 999 : 3)},
    pointsValue: ${question.points || 1},
    showFeedback: true,
    enableHints: ${activityType !== 'exam'},
    enableAIChat: ${activityType !== 'exam'},
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: '${question.subject || 'General'}',
    gradeLevel: '${question.gradeLevel || 'Multi-Grade'}',
    topic: '${question.title || 'General Topic'}',
    learningObjectives: [
      '[Learning objective 1]',
      '[Learning objective 2]',
      '[Learning objective 3]'
    ]
  },`).join('\n')}
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};
`;
}

// Main generation function
function generateCourse(configPath) {
  log.header('Course Generation with Rollback Support');
  
  // Initialize directories
  initializeDirectories();
  
  // Read and parse configuration
  let config;
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
    log.success(`Loaded configuration from ${configPath}`);
  } catch (error) {
    log.error(`Failed to load configuration: ${error.message}`);
    process.exit(1);
  }
  
  // Validate required fields
  if (!config.courseId) {
    log.error('Missing required field: courseId');
    process.exit(1);
  }
  if (!config.courseStructure || !config.courseStructure.units) {
    log.error('Missing required field: courseStructure.units');
    process.exit(1);
  }
  
  const courseId = config.courseId;
  const generatedFiles = [];
  
  log.header(`Generating Course ${courseId}: ${config.title || 'Untitled Course'}`);
  
  // Check for existing files and create backup if needed
  const backup = backupExistingFiles(courseId);
  if (backup) {
    log.info('Existing files backed up. You can rollback using:');
    log.action(`node ${path.basename(process.argv[1])} rollback ${courseId}`);
  }
  
  // Generate frontend structure
  log.info('Creating frontend structure...');
  
  const frontendBase = path.join(PATHS.frontendBase, courseId);
  const contentDir = path.join(frontendBase, 'content');
  
  // Create main course index
  writeFileWithTracking(
    path.join(frontendBase, 'index.js'),
    generateCourseIndex(config),
    generatedFiles
  );
  
  // Create content registry
  writeFileWithTracking(
    path.join(contentDir, 'index.js'),
    generateContentRegistry(config),
    generatedFiles
  );
  
  // Create lesson components
  config.courseStructure.units.forEach(unit => {
    unit.items.forEach(item => {
      const folderName = itemIdToFolderName(item.itemId);
      const lessonDir = path.join(contentDir, folderName);
      
      writeFileWithTracking(
        path.join(lessonDir, 'index.js'),
        generateLessonComponent(item, courseId),
        generatedFiles
      );
    });
  });
  
  // Generate backend structure
  log.info('Creating backend structure...');
  
  const backendBase = path.join(PATHS.backendBase, courseId);
  
  // Create assessment mapping
  writeFileWithTracking(
    path.join(backendBase, 'assessment-mapping.js'),
    generateAssessmentMapping(config),
    generatedFiles
  );
  
  // Create assessment configurations
  config.courseStructure.units.forEach(unit => {
    unit.items.forEach(item => {
      if (item.questions && item.questions.length > 0) {
        const folderName = itemIdToFolderName(item.itemId);
        const assessmentConfig = generateAssessmentConfig(item, courseId);
        
        if (assessmentConfig) {
          writeFileWithTracking(
            path.join(backendBase, folderName, 'assessments.js'),
            assessmentConfig,
            generatedFiles
          );
        }
      }
    });
  });
  
  // No need to save a duplicate config - use the original config file directly
  
  // Save generation manifest
  const manifestPath = saveGenerationManifest(courseId, configPath, generatedFiles);
  
  // Summary
  log.header('Generation Complete!');
  log.success(`✅ Course ${courseId} has been generated successfully`);
  log.info('\nNext steps:');
  log.info('1. Review and customize the generated lesson components');
  log.info('2. Add actual question content to assessment files');
  log.info('3. Import the course in FirebaseCourseWrapperImproved.js:');
  log.info(`   const Course${courseId} = React.lazy(() => import('./courses/${courseId}'));`);
  log.info(`4. (Optional) Upload configuration to Firebase when ready:`);
  log.info(`   firebase database:set /courses/${courseId}/course-config ${configPath}`);
  log.info('5. Test the course with a student account');
  log.info('\nNote: The script does NOT modify your database. All changes are local only.');
  
  // Stats
  const totalLessons = config.courseStructure.units.reduce(
    (sum, unit) => sum + unit.items.length, 0
  );
  const totalQuestions = config.courseStructure.units.reduce(
    (sum, unit) => sum + unit.items.reduce(
      (itemSum, item) => itemSum + (item.questions ? item.questions.length : 0), 0
    ), 0
  );
  
  log.info(`\n📊 Course Statistics:`);
  log.info(`   Units: ${config.courseStructure.units.length}`);
  log.info(`   Items: ${totalLessons}`);
  log.info(`   Questions: ${totalQuestions}`);
  log.info(`   Files Generated: ${generatedFiles.length}`);
  
  if (backup) {
    log.warning('\n⚠️  Previous files were backed up');
    log.info('To restore previous version:');
    log.action(`node ${path.basename(process.argv[1])} rollback ${courseId}`);
  }
}

// Rollback function
function rollbackCourse(courseId) {
  log.header(`Rolling Back Course ${courseId}`);
  
  try {
    // Load the generation manifest
    const manifest = loadGenerationManifest(courseId);
    
    log.info(`Found manifest from ${manifest.generatedAt}`);
    log.info(`Will remove ${manifest.files.length} files`);
    
    // Remove generated files
    let removedCount = 0;
    manifest.files.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        removedCount++;
        log.action(`Removed: ${path.relative(process.cwd(), filePath)}`);
      }
    });
    
    // Clean up empty directories
    const directories = new Set();
    manifest.files.forEach(filePath => {
      let dir = path.dirname(filePath);
      while (dir !== process.cwd() && dir !== path.dirname(dir)) {
        directories.add(dir);
        dir = path.dirname(dir);
      }
    });
    
    Array.from(directories).sort((a, b) => b.length - a.length).forEach(dir => {
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        log.action(`Removed empty directory: ${path.relative(process.cwd(), dir)}`);
      }
    });
    
    // Check for backups to restore
    const backupManifests = fs.readdirSync(PATHS.manifestDir)
      .filter(f => f.startsWith(`backup-${courseId}-`))
      .sort()
      .reverse();
    
    if (backupManifests.length > 0) {
      log.info('\n📦 Available backups:');
      backupManifests.forEach((manifest, index) => {
        const timestamp = manifest.replace(`backup-${courseId}-`, '').replace('.json', '');
        log.info(`   ${index + 1}. ${timestamp}`);
      });
      
      log.info('\nTo restore a backup, use:');
      log.action(`node ${path.basename(process.argv[1])} restore ${courseId} <backup-timestamp>`);
    }
    
    log.success(`\n✅ Rollback complete! Removed ${removedCount} files`);
    
  } catch (error) {
    log.error(`Rollback failed: ${error.message}`);
    process.exit(1);
  }
}

// Clean function (removes all traces)
function cleanCourse(courseId) {
  log.header(`Cleaning Course ${courseId}`);
  
  const frontendPath = path.join(PATHS.frontendBase, courseId);
  const backendPath = path.join(PATHS.backendBase, courseId);
  
  log.warning('This will permanently remove:');
  log.warning(`  - Frontend: ${frontendPath}`);
  log.warning(`  - Backend: ${backendPath}`);
  log.warning(`  - All backups and manifests`);
  
  // Note: In production, you might want to add a confirmation prompt here
  
  if (fs.existsSync(frontendPath)) {
    removeDirectory(frontendPath);
    log.success(`Removed frontend files`);
  }
  
  if (fs.existsSync(backendPath)) {
    removeDirectory(backendPath);
    log.success(`Removed backend files`);
  }
  
  // Remove manifests
  const manifests = fs.readdirSync(PATHS.manifestDir)
    .filter(f => f.includes(`-${courseId}-`) || f === `course-${courseId}-manifest.json`);
  
  manifests.forEach(manifest => {
    fs.unlinkSync(path.join(PATHS.manifestDir, manifest));
    log.action(`Removed manifest: ${manifest}`);
  });
  
  // Remove backups
  const backups = fs.readdirSync(PATHS.backupDir)
    .filter(f => f.startsWith(`course-${courseId}-`));
  
  backups.forEach(backup => {
    removeDirectory(path.join(PATHS.backupDir, backup));
    log.action(`Removed backup: ${backup}`);
  });
  
  log.success(`\n✅ Course ${courseId} completely removed`);
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    log.error('Usage:');
    log.info('  Generate: node generate-course-with-rollback.js generate <config-file.json>');
    log.info('  Rollback: node generate-course-with-rollback.js rollback <courseId>');
    log.info('  Clean:    node generate-course-with-rollback.js clean <courseId>');
    process.exit(1);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'generate':
      if (args.length < 2) {
        log.error('Please provide a configuration file');
        process.exit(1);
      }
      const configFile = args[1];
      if (!fs.existsSync(configFile)) {
        log.error(`Configuration file not found: ${configFile}`);
        process.exit(1);
      }
      generateCourse(configFile);
      break;
      
    case 'rollback':
      if (args.length < 2) {
        log.error('Please provide a course ID');
        process.exit(1);
      }
      rollbackCourse(args[1]);
      break;
      
    case 'clean':
      if (args.length < 2) {
        log.error('Please provide a course ID');
        process.exit(1);
      }
      cleanCourse(args[1]);
      break;
      
    default:
      log.error(`Unknown command: ${command}`);
      log.info('Available commands: generate, rollback, clean');
      process.exit(1);
  }
}

// Run the CLI
main();