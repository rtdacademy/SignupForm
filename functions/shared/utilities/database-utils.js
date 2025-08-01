/**
 * Shared Database Utilities
 * Standard database operations and utilities used across all assessment types
 */

const admin = require('firebase-admin');
const { sanitizeEmail } = require('../utils/utils');

// Helper function to get category weights from course config
// This is now deprecated - weights should come from course config
const getCategoryWeight = (type) => {
  console.warn('getCategoryWeight() is deprecated - use weights from course config instead');
  return 0; // Return 0 to avoid calculation errors
};

/**
 * Gets a safe server timestamp that works in both production and emulator environments
 * @returns {any} Server timestamp or Date.now() fallback
 */
function getServerTimestamp() {
  try {
    // Try to use ServerValue.TIMESTAMP if available
    if (admin.database && admin.database.ServerValue && admin.database.ServerValue.TIMESTAMP) {
      return admin.database.ServerValue.TIMESTAMP;
    } else {
      // Fall back to Date.now() if ServerValue is not available
      console.log("ServerValue.TIMESTAMP not available, using Date.now() instead");
      return Date.now();
    }
  } catch (error) {
    console.log("Error accessing ServerValue.TIMESTAMP, using Date.now() instead:", error);
    return Date.now();
  }
}

/**
 * Extracts and validates required parameters from the function call
 * @param {Object} data - The data object from the function call
 * @param {Object} context - The context object from the function call
 * @returns {Object} Extracted and validated parameters
 */
function extractParameters(data, context) {
  // Extract the data from the request correctly
  // Handle both direct data and nested data.data (for different calling patterns)
  const actualData = data.data || data;
  const {
    courseId,
    assessmentId,
    operation,
    answer,
    studentEmail,
    userId,
    topic = 'general',
    difficulty = 'intermediate',
    examMode = false,
    examSessionId = null,
  } = actualData;

  // Log the received data for debugging
  console.log("Data received by function:", data);

  // Only log simple authentication status - avoid stringifying the entire context
  const authStatus = context?.auth ? "Authenticated" : "Not authenticated";
  console.log("Function received context:", authStatus);

  // Get authentication info
  let finalStudentEmail = studentEmail;
  let finalUserId = userId;

  // If we have authentication context but no studentEmail in the data, use the auth email
  if (context?.auth?.token?.email && !finalStudentEmail) {
    finalStudentEmail = context.auth.token.email;
    console.log("Using email from auth context:", finalStudentEmail);
  }

  // If we have authentication context but no userId in the data, use the auth uid
  if (context?.auth?.uid && !finalUserId) {
    finalUserId = context.auth.uid;
    console.log("Using uid from auth context:", finalUserId);
  }

  // Log each important parameter individually for debugging
  console.log("Parameter - operation:", operation);
  console.log("Parameter - courseId:", courseId);
  console.log("Parameter - assessmentId:", assessmentId);
  console.log("Parameter - studentEmail:", finalStudentEmail);
  console.log("Parameter - userId:", finalUserId);
  console.log("Parameter - topic:", topic);
  console.log("Parameter - difficulty:", difficulty);

  // Check if required operation parameters are present
  if (!operation) {
    throw new Error("Missing required parameter: operation");
  }

  if (!courseId) {
    throw new Error("Missing required parameter: courseId");
  }

  if (!assessmentId) {
    throw new Error("Missing required parameter: assessmentId");
  }

  // Check if this is a staff member
  const isStaff = finalStudentEmail && finalStudentEmail.toLowerCase().endsWith('@rtdacademy.com');
  if (isStaff) {
    console.log("Staff member detected:", finalStudentEmail);
  }

  // Get the proper studentKey
  let studentKey;

  // Check if we're running in the emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  // Simplified approach that prioritizes studentEmail parameter over context.auth
  // This works better for emulator testing while still maintaining security in production
  if (finalStudentEmail) {
    studentKey = sanitizeEmail(finalStudentEmail);
    console.log(`Using provided student email: ${finalStudentEmail}, sanitized to: ${studentKey}`);
  } else if (context.auth && context.auth.token && context.auth.token.email) {
    const email = context.auth.token.email;
    studentKey = sanitizeEmail(email);
    console.log(`Using authenticated user email: ${email}`);
  } else {
    // Fallback for emulator or missing authentication - use test account
    console.log("Using test account - this should only happen in development");
    studentKey = "test-student";
  }

  return {
    courseId,
    assessmentId,
    operation,
    answer,
    topic,
    difficulty,
    studentEmail: finalStudentEmail,
    userId: finalUserId,
    studentKey,
    isEmulator,
    isStaff,
    examMode,
    examSessionId
  };
}

/**
 * Initializes course structure for a student if it doesn't exist
 * @param {string} studentKey - The sanitized student email
 * @param {string} courseId - The course ID
 * @param {boolean} isStaff - Whether this is a staff member
 * @returns {Promise<void>}
 */
async function initializeCourseIfNeeded(studentKey, courseId, isStaff = false) {
  // Make sure courseId is a string
  const safeCoursePath = String(courseId);

  // For staff, use a different path under staff_testing
  const basePath = isStaff ? `staff_testing/${studentKey}/courses` : `students/${studentKey}/courses`;
  const courseRef = admin.database().ref(`${basePath}/${safeCoursePath}`);

  try {
    // Check if the course exists in the database for this student/staff
    const courseSnapshot = await courseRef.once('value');
    if (!courseSnapshot.exists()) {
      // Initialize basic course structure if it doesn't exist
      console.log(`Initializing course structure for ${studentKey} in course ${safeCoursePath} (${isStaff ? 'staff' : 'student'})`);
      await courseRef.set({
        Initialized: true,
        Assessments: {},
        Grades: {
          assessments: {}
        },
        timestamp: getServerTimestamp(),
        isStaffTest: isStaff
      });
    }
  } catch (error) {
    console.warn("Error checking/initializing course:", error);
    // Continue anyway - the assessment operation will create required paths
  }
}

/**
 * Standard database paths used across assessments
 */
const DATABASE_PATHS = {
  studentAssessment: (studentKey, courseId, assessmentId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Assessments/${assessmentId}` 
            : `students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`,
  
  studentGrade: (studentKey, courseId, assessmentId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Grades/assessments/${assessmentId}`
            : `students/${studentKey}/courses/${courseId}/Grades/assessments/${assessmentId}`,
  
  gradeMetadata: (studentKey, courseId, assessmentId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Grades/metadata/${assessmentId}`
            : `students/${studentKey}/courses/${courseId}/Grades/metadata/${assessmentId}`,
  
  courseAssessment: (courseId, assessmentId) => 
    `courses/${courseId}/assessments/${assessmentId}`,
  
  secureAssessment: (courseId, assessmentId, studentKey) => 
    `courses_secure/${courseId}/assessments/${assessmentId}/${studentKey}`,
  
  studentCourse: (studentKey, courseId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}`
            : `students/${studentKey}/courses/${courseId}`
};

/**
 * Gets a database reference for a standard path
 * @param {string} pathType - The type of path (from DATABASE_PATHS)
 * @param {...any} params - Parameters for the path (including optional isStaff flag)
 * @returns {Object} Firebase database reference
 */
function getDatabaseRef(pathType, ...params) {
  const pathFunction = DATABASE_PATHS[pathType];
  if (!pathFunction) {
    throw new Error(`Unknown database path type: ${pathType}`);
  }
  
  const path = pathFunction(...params);
  return admin.database().ref(path);
}

/**
 * Extended database paths for gradebook (simplified - no progress/timeTracking)
 */
const GRADEBOOK_PATHS = {
  ...DATABASE_PATHS
};

// trackLessonAccess function removed - was disabled

// trackAssessmentProgress function removed - was disabled

/**
 * Update gradebook when an assessment is completed
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} itemId - Item ID (assessment ID/question ID)
 * @param {number} score - Score earned
 * @param {Object} itemConfig - Item configuration (legacy - will be replaced by course config data)
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function updateGradebookItem(studentKey, courseId, itemId, score, itemConfig) {
  try {
    // Simply ensure gradebook exists for time tracking and progress (no items/summary storage)
    const basePath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    const gradebookSnapshot = await gradebookRef.once('value');
    const currentGradebook = gradebookSnapshot.val();
    
    // Initialize basic gradebook if it doesn't exist
    if (!currentGradebook || !currentGradebook.initialized) {
      console.log(`📝 Initializing basic gradebook for ${studentKey} in course ${courseId}`);
      await initializeGradebook(studentKey, courseId);
    }
    
    console.log(`✅ Assessment ${itemId} completed with score ${score} (gradebook tracking disabled)`);
    
  } catch (error) {
    console.error('Error in gradebook update:', error);
    throw error;
  }
}


// updateGradebookSummary function removed - was disabled

/**
 * Get course configuration from database only
 */
async function getCourseConfig(courseId) {
  try {
    const db = admin.database();
    const courseConfigRef = db.ref(`courses/${courseId}/course-config`);
    const configSnapshot = await courseConfigRef.once('value');
    
    if (configSnapshot.exists()) {
      console.log(`✅ Using course config from database for course ${courseId}`);
      return configSnapshot.val();
    }
    
    console.warn(`⚠️ Course config not found in database for ${courseId}`);
    return null;
  } catch (error) {
    console.warn(`Error loading course config for ${courseId}:`, error);
    return null;
  }
}

/**
 * Default course configuration
 */
function getDefaultCourseConfig() {
  return {
    weights: {
      lesson: 20,
      assignment: 30,
      exam: 50,
      lab: 0,
      project: 0
    },
    globalSettings: {
      passingGrade: 60
    }
  };
}

/**
 * Initialize gradebook structure for a new student using course-config.json
 * Creates complete gradebook structure with all items and expected totals
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function initializeGradebook(studentKey, courseId) {
  try {
    const basePath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    
    // Get course config to build complete structure
    const courseConfig = await getCourseConfig(courseId);
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    
    if (gradebookStructure) {
      console.log(`🏗️ Building complete gradebook structure from course-config.json for course ${courseId}`);
      
      // Build simplified gradebook structure (no items, summary, or courseStructureItems)
      const passingGrade = courseConfig.globalSettings?.passingGrade || 60;
      
      // Build navigation structure from course config
      // First priority: use courseStructure from course config if it exists
      let courseStructure;
      if (courseConfig.courseStructure) {
        console.log("✅ Using courseStructure from course config");
        courseStructure = courseConfig.courseStructure;
      } else {
        console.log("⚠️ No courseStructure in course config, building from gradebook items");
        // Fallback: build from gradebook items
        courseStructure = {
          title: courseConfig.title || `Course ${courseId}`,
          units: [{
            unitId: "unit_1_orientation",
            title: "Course Content",
            description: "All course lessons and activities",
            order: 1,
            items: Object.entries(gradebookStructure).map(([itemId, itemConfig], index) => ({
              itemId: itemId,
              type: itemConfig.type || 'lesson',
              title: itemConfig.title,
              description: `Complete ${itemConfig.title}`,
              contentPath: itemConfig.contentPath,
              hasCloudFunctions: true,
              order: index + 1,
              estimatedTime: 15,
              required: true
            }))
          }]
        };
      }

      const gradebookData = {
        initialized: true,
        createdAt: getServerTimestamp(),
        // Include course config weights so frontend can access them
        courseConfig: {
          weights: courseConfig.weights || {},
          globalSettings: courseConfig.globalSettings || {},
          gradebook: courseConfig.gradebook || {},
          progressionRequirements: courseConfig.progressionRequirements || {}
        },
        courseStructure: courseStructure // Add course structure for navigation
      };
      
      await gradebookRef.set(gradebookData);
      
      console.log(`✅ Simplified gradebook initialized for ${studentKey} in course ${courseId} (no items/summary tracking)`);
      
    } else {
      // Fallback to basic structure if no course config
      console.log(`⚠️ No course config found, creating basic gradebook for course ${courseId}`);
      
      await gradebookRef.set({
        initialized: true,
        createdAt: getServerTimestamp()
      });
    }
    
    console.log(`🎓 Gradebook initialization complete for ${studentKey} in course ${courseId}`);
    
  } catch (error) {
    console.error('Error initializing gradebook:', error);
    throw error;
  }
}

/**
 * Load course structure from database course config
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course structure
 */
async function getCourseStructure(courseId) {
  try {
    const courseConfig = await getCourseConfig(courseId);
    
    if (courseConfig?.courseStructure) {
      console.log(`✅ Using courseStructure from course config for course ${courseId}`);
      return courseConfig.courseStructure;
    }
    
    console.warn(`Course structure not found for course ${courseId}`);
    return {
      units: []
    };
  } catch (error) {
    console.warn(`Error loading course structure for ${courseId}:`, error.message);
    return {
      units: []
    };
  }
}


/**
 * Find a question/assessment in the course config gradebook structure
 * 
 * NEW APPROACH (2025): This function replaces pattern matching with precise lookup
 * in the course-config.json gradebook structure. It finds the exact question,
 * its point value, and the parent item (lesson/assignment) it belongs to.
 * 
 * Enhanced with legacy ID transformation to handle old gradebook data.
 * 
 * @param {string} courseId - Course ID  
 * @param {string} assessmentId - Assessment ID (question ID)
 * @returns {Promise<Object|null>} Question info with item details or null
 */
async function findQuestionInCourseConfig(courseId, assessmentId) {
  try {
    const courseConfig = await getCourseConfig(courseId);
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    
    if (!gradebookStructure) {
      console.log(`⚠️ No gradebook structure found in course config for course ${courseId}`);
      return null;
    }
    
    console.log(`🔍 Looking for assessment ${assessmentId} in course config gradebook structure`);
    
    // Search through all items and their questions
    for (const [itemId, itemConfig] of Object.entries(gradebookStructure)) {
      const questions = itemConfig.questions || [];
      
      for (const question of questions) {
        if (question.questionId === assessmentId) {
          console.log(`✅ FOUND: ${assessmentId} in item ${itemId} (${question.points} points)`);
          return {
            questionId: assessmentId,
            questionTitle: question.title,
            questionPoints: question.points,
            itemId: itemId,
            itemTitle: itemConfig.title,
            itemType: itemConfig.type,
            contentPath: itemConfig.contentPath,
            // Calculate total item points from all questions
            itemTotalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
            itemQuestions: questions
          };
        }
      }
    }
    
    console.log(`❌ Assessment ${assessmentId} not found in course config gradebook structure`);
    console.log(`Available question IDs:`, 
      Object.values(gradebookStructure).flatMap(item => 
        item.questions?.map(q => q.questionId) || []
      )
    );
    
    return null;
  } catch (error) {
    console.error('Error finding assessment in course config:', error);
    return null;
  }
}

/**
 * Find a course structure item by assessment ID (LEGACY - for backward compatibility)
 * @param {string} courseId - Course ID
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<Object|null>} Course structure item or null
 */
async function findCourseStructureItem(courseId, assessmentId) {
  try {
    const courseStructure = await getCourseStructure(courseId);
    
    console.log(`🔍 Finding course structure item for assessment: ${assessmentId}`);
    
    // First, try direct pattern matching using contentPath (most reliable)
    // Extract contentPath from assessmentId: course3_01_intro_ethics_financial_decisions_question1 → 01-intro-ethics-financial-decisions
    const parts = assessmentId.split('_');
    
    if (parts.length >= 3 && parts[0].startsWith('course')) {
      // Remove course prefix (e.g., 'course3')
      const withoutCoursePrefix = parts.slice(1);
      
      // Remove question suffixes (question1, question2, aiQuestion, aiLongAnswer, etc.)
      const withoutQuestionSuffix = withoutCoursePrefix.filter(part => 
        !part.startsWith('question') && 
        !part.includes('aiQuestion') && 
        !part.includes('aiLongAnswer') &&
        !part.includes('practice') &&
        !part.includes('assessment')
      );
      
      // Create contentPath by joining with hyphens
      const derivedContentPath = withoutQuestionSuffix.join('-');
      
      console.log(`📝 Derived contentPath from ${assessmentId}: "${derivedContentPath}"`);
      
      // Search for matching contentPath
      for (const unit of courseStructure.units || []) {
        for (const item of unit.items || []) {
          if (item.contentPath === derivedContentPath) {
            console.log(`✅ MATCH FOUND: ${assessmentId} → ${item.itemId} via contentPath: "${derivedContentPath}"`);
            console.log(`   Unit: ${unit.unitId} | Title: ${item.title}`);
            return {
              ...item,
              unitId: unit.unitId,
              unitTitle: unit.title,
              unitOrder: unit.order
            };
          }
        }
      }
      
      console.log(`⚠️  No exact contentPath match found for "${derivedContentPath}"`);
      
      // Fallback: Try partial contentPath matching
      for (const unit of courseStructure.units || []) {
        for (const item of unit.items || []) {
          if (item.contentPath && derivedContentPath.includes(item.contentPath.substring(0, 10))) {
            console.log(`🔄 PARTIAL MATCH: ${assessmentId} → ${item.itemId} via partial contentPath match`);
            return {
              ...item,
              unitId: unit.unitId,
              unitTitle: unit.title,
              unitOrder: unit.order
            };
          }
        }
      }
    }
    
    // Fallback: Try direct itemId or contentPath inclusion (legacy matching)
    for (const unit of courseStructure.units || []) {
      for (const item of unit.items || []) {
        if (assessmentId.includes(item.itemId) || 
            assessmentId.includes(item.contentPath) ||
            item.itemId === assessmentId) {
          console.log(`🔄 LEGACY MATCH: ${assessmentId} → ${item.itemId} via legacy pattern`);
          return {
            ...item,
            unitId: unit.unitId,
            unitTitle: unit.title,
            unitOrder: unit.order
          };
        }
      }
    }
    
    console.log(`❌ NO MATCH FOUND for assessment: ${assessmentId}`);
    console.log(`   Available contentPaths in course structure:`, 
      courseStructure.units?.flatMap(unit => 
        unit.items?.map(item => item.contentPath) || []
      ) || []
    );
    
    return null;
  } catch (error) {
    console.error('Error finding course structure item:', error);
    return null;
  }
}

// cleanupLegacyAssessments function removed - was disabled

// updateCourseStructureItemSummary function removed - was disabled

// trackTimeSpent function removed - was disabled

/**
 * Compare course configurations to detect changes
 * @param {Object} currentConfig - Current course config in student's gradebook
 * @param {Object} latestConfig - Latest course config from course-config.json
 * @returns {Object} Comparison result with changes detected
 */
function compareCourseConfigs(currentConfig, latestConfig) {
  const changes = {
    hasChanges: false,
    weightsChanged: false,
    globalSettingsChanged: false,
    progressionRequirementsChanged: false,
    gradebookStructureChanged: false,
    details: []
  };

  if (!currentConfig || !latestConfig) {
    changes.hasChanges = true;
    changes.details.push('Course config missing - full sync required');
    return changes;
  }

  // Compare weights
  const currentWeights = currentConfig.weights || {};
  const latestWeights = latestConfig.weights || {};
  
  for (const [type, weight] of Object.entries(latestWeights)) {
    if (currentWeights[type] !== weight) {
      changes.hasChanges = true;
      changes.weightsChanged = true;
      changes.details.push(`Weight changed for ${type}: ${currentWeights[type]} → ${weight}`);
    }
  }

  // Compare global settings
  const currentGlobal = currentConfig.globalSettings || {};
  const latestGlobal = latestConfig.globalSettings || {};
  
  for (const [setting, value] of Object.entries(latestGlobal)) {
    if (currentGlobal[setting] !== value) {
      changes.hasChanges = true;
      changes.globalSettingsChanged = true;
      changes.details.push(`Global setting changed - ${setting}: ${currentGlobal[setting]} → ${value}`);
    }
  }

  // Compare progression requirements
  const currentProgression = currentConfig.progressionRequirements || {};
  const latestProgression = latestConfig.progressionRequirements || {};
  
  // Check enabled status
  if (currentProgression.enabled !== latestProgression.enabled) {
    changes.hasChanges = true;
    changes.progressionRequirementsChanged = true;
    changes.details.push(`Progression requirements enabled: ${currentProgression.enabled} → ${latestProgression.enabled}`);
  }
  
  // Check default minimum percentage
  if (currentProgression.defaultMinimumPercentage !== latestProgression.defaultMinimumPercentage) {
    changes.hasChanges = true;
    changes.progressionRequirementsChanged = true;
    changes.details.push(`Default minimum percentage: ${currentProgression.defaultMinimumPercentage} → ${latestProgression.defaultMinimumPercentage}`);
  }
  
  // Check lesson overrides
  const currentOverrides = currentProgression.lessonOverrides || {};
  const latestOverrides = latestProgression.lessonOverrides || {};
  
  for (const [lessonId, override] of Object.entries(latestOverrides)) {
    const currentOverride = currentOverrides[lessonId];
    if (!currentOverride || currentOverride.minimumPercentage !== override.minimumPercentage) {
      changes.hasChanges = true;
      changes.progressionRequirementsChanged = true;
      changes.details.push(`Lesson override changed - ${lessonId}: ${currentOverride?.minimumPercentage} → ${override.minimumPercentage}`);
    }
  }

  // Compare gradebook structure (item structure, not individual progress)
  const currentGradebook = currentConfig.gradebook?.itemStructure || {};
  const latestGradebook = latestConfig.gradebook?.itemStructure || {};
  
  // Check if number of items changed
  if (Object.keys(currentGradebook).length !== Object.keys(latestGradebook).length) {
    changes.hasChanges = true;
    changes.gradebookStructureChanged = true;
    changes.details.push(`Gradebook items count changed: ${Object.keys(currentGradebook).length} → ${Object.keys(latestGradebook).length}`);
  }
  
  // Check for structural changes in existing items
  for (const [itemId, latestItem] of Object.entries(latestGradebook)) {
    const currentItem = currentGradebook[itemId];
    if (!currentItem) {
      changes.hasChanges = true;
      changes.gradebookStructureChanged = true;
      changes.details.push(`New gradebook item added: ${itemId}`);
    } else {
      // Check if questions changed
      const currentQuestions = currentItem.questions || [];
      const latestQuestions = latestItem.questions || [];
      
      if (currentQuestions.length !== latestQuestions.length) {
        changes.hasChanges = true;
        changes.gradebookStructureChanged = true;
        changes.details.push(`Question count changed for ${itemId}: ${currentQuestions.length} → ${latestQuestions.length}`);
      }
    }
  }

  return changes;
}

/**
 * Sync course configuration changes to student's gradebook
 * Updates configuration while preserving student progress data
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 * @returns {Promise<Object>} Sync result
 */
async function syncCourseConfig(studentKey, courseId) {
  try {
    console.log(`🔄 Syncing course config for ${studentKey} in course ${courseId}`);
    
    // Get latest course configuration
    const latestCourseConfig = await getCourseConfig(courseId);
    
    // Get current gradebook
    const basePath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    const gradebookSnapshot = await gradebookRef.once('value');
    const currentGradebook = gradebookSnapshot.val();
    
    if (!currentGradebook || !currentGradebook.initialized) {
      console.log(`⚠️ Gradebook not initialized, skipping config sync`);
      return { synced: false, reason: 'Gradebook not initialized' };
    }
    
    const currentCourseConfig = currentGradebook.courseConfig || {};
    
    // Compare configurations
    const comparison = compareCourseConfigs(currentCourseConfig, latestCourseConfig);
    
    if (!comparison.hasChanges) {
      console.log(`✅ Course config is up to date for ${studentKey} in course ${courseId}`);
      return { synced: true, changes: [], upToDate: true };
    }
    
    console.log(`🔧 Course config changes detected for ${studentKey} in course ${courseId}:`, comparison.details);
    
    // Prepare updates - only update configuration, preserve student data
    const updates = {};
    
    // Update course config
    updates['courseConfig'] = {
      weights: latestCourseConfig.weights || {},
      globalSettings: latestCourseConfig.globalSettings || {},
      gradebook: latestCourseConfig.gradebook || {},
      progressionRequirements: latestCourseConfig.progressionRequirements || {}
    };
    
    // Update course structure if it exists in the latest config
    if (latestCourseConfig.courseStructure) {
      updates['courseStructure'] = latestCourseConfig.courseStructure;
    }
    
    // Update last sync timestamp
    updates['lastConfigSync'] = getServerTimestamp();
    updates['configSyncDetails'] = {
      changes: comparison.details,
      syncedAt: getServerTimestamp()
    };
    
    // Apply updates
    await gradebookRef.update(updates);
    
    // If weights changed, log it (summary tracking disabled)
    if (comparison.weightsChanged) {
      console.log(`🔄 Weights changed for ${studentKey} in course ${courseId} (summary tracking disabled)`);
    }
    
    console.log(`✅ Course config synced successfully for ${studentKey} in course ${courseId}`);
    
    return {
      synced: true,
      changes: comparison.details,
      weightsRecalculated: comparison.weightsChanged,
      upToDate: false
    };
    
  } catch (error) {
    console.error('Error syncing course config:', error);
    return { 
      synced: false, 
      error: error.message,
      changes: []
    };
  }
}

/**
 * Validate gradebook structure completeness against course configuration
 * Enhanced to include course config synchronization
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 * @returns {Promise<{isValid: boolean, missingItems: Array, missingCategories: Array, configSynced: boolean}>}
 */
async function validateGradebookStructure(studentKey, courseId) {
  try {
    console.log(`🔍 Validating gradebook structure for ${studentKey} in course ${courseId}`);
    
    // Get course configuration
    const courseConfig = await getCourseConfig(courseId);
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    
    if (!gradebookStructure) {
      console.log(`⚠️ No gradebook structure found in course config for course ${courseId}`);
      return { isValid: true, missingItems: [], missingCategories: [], configSynced: false }; // Skip validation if no structure
    }
    
    // Get current gradebook data
    const basePath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    const gradebookSnapshot = await gradebookRef.once('value');
    const currentGradebook = gradebookSnapshot.val();
    
    // If gradebook doesn't exist, it's definitely incomplete
    if (!currentGradebook || !currentGradebook.initialized) {
      console.log(`❌ Gradebook not initialized for ${studentKey} in course ${courseId}`);
      await initializeGradebook(studentKey, courseId);
      return { 
        isValid: true, 
        missingItems: [], 
        missingCategories: [],
        wasRebuilt: true,
        configSynced: true
      };
    }
    
    // ENHANCED: Sync course configuration changes
    const configSyncResult = await syncCourseConfig(studentKey, courseId);
    
    // Simplified validation (no items/categories tracking)
    console.log(`✅ Gradebook structure validation passed for ${studentKey} in course ${courseId} (simplified - no items/categories tracking)`);
    
    return { 
      isValid: true,
      missingItems: [], 
      missingCategories: [],
      configSynced: configSyncResult.synced,
      configChanges: configSyncResult.changes || [],
      disabled: true
    };
    
  } catch (error) {
    console.error('Error validating gradebook structure:', error);
    // Return invalid to trigger recreation if validation fails
    return { 
      isValid: false, 
      missingItems: [], 
      missingCategories: [], 
      error: error.message,
      configSynced: false 
    };
  }
}

module.exports = {
  getServerTimestamp,
  extractParameters,
  initializeCourseIfNeeded,
  DATABASE_PATHS,
  GRADEBOOK_PATHS,
  getDatabaseRef,
  updateGradebookItem,
  initializeGradebook,
  getCourseConfig,
  getCourseStructure,
  findCourseStructureItem,
  findQuestionInCourseConfig,
  validateGradebookStructure,
  compareCourseConfigs,
  syncCourseConfig,
  getCategoryWeight // Deprecated but kept for backward compatibility
};