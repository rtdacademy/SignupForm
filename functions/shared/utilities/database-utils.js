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
    score,  // Add score for direct score updates
    metadata,  // Add metadata for direct score updates
    interactionData,  // Add interactionData for direct score updates
    verificationToken,  // Add verificationToken for direct score updates
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
    examSessionId,
    score,  // Include score for direct score updates
    metadata,  // Include metadata for direct score updates
    interactionData,  // Include interactionData for direct score updates
    verificationToken  // Include verificationToken for direct score updates
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
        // Just initialize basic structure - recalculateFullGradebook will populate everything else
        items: {},
        categories: {},
        overall: {
          percentage: 0
        },
        metadata: {
          lastCalculated: null,
          calculationVersion: '1.0'
        }
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

/**
 * Recalculate entire gradebook for a student in a course
 * This replaces complex client-side calculations with server-side pre-calculation
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} triggeringSessionId - Optional: Session ID that triggered this recalculation
 */
async function recalculateFullGradebook(studentKey, courseId, triggeringSessionId = null) {
  try {
    console.log(`🔄 Starting full gradebook recalculation for ${studentKey}/${courseId}`);
    
    const db = admin.database();
    const basePath = `students/${studentKey}/courses/${courseId}`;
    
    // Get course configuration
    const courseConfig = await getCourseConfig(courseId);
    if (!courseConfig) {
      console.warn(`No course config found for ${courseId}, skipping calculation`);
      return;
    }
    
    // Transform courseStructure into gradebook itemStructure format
    let itemStructure = {};
    const defaultWeights = { 
      lesson: 0, 
      assignment: 0, 
      exam: 0, 
      project: 0, 
      lab: 0, 
      quiz: 0,
      info: 0,        // Informational content with no weight
      review: 0,      // Review content, can be weighted
      practice: 0,    // Practice exercises with no weight  
      assessment: 0   // Non-session based assessments
    };
    
    // Priority: courseConfig.weights > gradebook.weights > defaultWeights
    let weights = courseConfig.weights || courseConfig.gradebook?.weights || defaultWeights;
    
    // Log warning if using default weights (indicates configuration issue)
    if (!courseConfig.weights && !courseConfig.gradebook?.weights) {
      console.warn(`⚠️ No weights found in course config for course ${courseId}, using zero weights. Gradebook will show 0% for all categories.`);
    }
    
    if (courseConfig.gradebook?.itemStructure) {
      // Use existing gradebook structure if available
      itemStructure = courseConfig.gradebook.itemStructure;
    } else if (courseConfig.courseStructure?.units) {
      // Transform courseStructure to gradebook format
      console.log(`🔄 Transforming courseStructure to gradebook format for course ${courseId}`);
      
      for (const unit of courseConfig.courseStructure.units) {
        for (const item of unit.items || []) {
          itemStructure[item.itemId] = {
            title: item.title,
            type: item.type,
            contentPath: item.contentPath,
            questions: item.questions || []
          };
        }
      }
      
      console.log(`✅ Transformed ${Object.keys(itemStructure).length} items from courseStructure`);
    } else {
      console.warn(`No gradebook structure or courseStructure found for ${courseId}, skipping calculation`);
      return;
    }
    
    const courseWeights = weights;
    
    // Calculate total possible points per category from course config
    const categoryMaxPoints = {};
    Object.entries(itemStructure).forEach(([itemId, itemConfig]) => {
      const { type, questions } = itemConfig;
      
      // Skip omitted items when calculating max points (we'll read omittedItems later)
      // For now, include all items - we'll adjust later when we have the omitted items data
      
      if (!categoryMaxPoints[type]) {
        categoryMaxPoints[type] = 0;
      }
      
      if (questions && Array.isArray(questions)) {
        // Sum up points from individual questions
        const itemMaxPoints = questions.reduce((sum, question) => sum + (question.points || 1), 0);
        categoryMaxPoints[type] += itemMaxPoints;
      }
    });
    
    // Get all student assessment data
    // Add small delay to ensure any concurrent writes are completed
    if (triggeringSessionId) {
      console.log(`⏱️ Adding small delay to ensure session ${triggeringSessionId} data is fully committed`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const [gradesSnapshot, sessionsSnapshot, omittedSnapshot] = await Promise.all([
      db.ref(`${basePath}/Grades/assessments`).once('value'),
      db.ref(`${basePath}/ExamSessions`).once('value'),
      db.ref(`${basePath}/Gradebook/omittedItems`).once('value')
    ]);
    
    const grades = gradesSnapshot.val() || {};
    const sessions = sessionsSnapshot.val() || {};
    const omittedItems = omittedSnapshot.val() || {};
    
    // Adjust category max points by removing points from omitted items
    Object.entries(omittedItems).forEach(([itemId, omitData]) => {
      const itemConfig = itemStructure[itemId];
      if (itemConfig && itemConfig.questions && Array.isArray(itemConfig.questions)) {
        const itemMaxPoints = itemConfig.questions.reduce((sum, question) => sum + (question.points || 1), 0);
        categoryMaxPoints[itemConfig.type] = Math.max(0, categoryMaxPoints[itemConfig.type] - itemMaxPoints);
        console.log(`📉 Reduced ${itemConfig.type} category max points by ${itemMaxPoints} due to omitted item: ${itemId}`);
      }
    });
    
    // If we have a triggering session, re-fetch it specifically to ensure we have the latest data
    if (triggeringSessionId && sessions[triggeringSessionId]) {
      console.log(`🔄 Re-fetching triggering session ${triggeringSessionId} to ensure latest data`);
      const triggerSessionSnapshot = await db.ref(`${basePath}/ExamSessions/${triggeringSessionId}`).once('value');
      if (triggerSessionSnapshot.exists()) {
        sessions[triggeringSessionId] = triggerSessionSnapshot.val();
        console.log(`✅ Updated session data for ${triggeringSessionId}:`, {
          score: sessions[triggeringSessionId]?.finalResults?.score,
          percentage: sessions[triggeringSessionId]?.finalResults?.percentage,
          isTeacherCreated: sessions[triggeringSessionId]?.isTeacherCreated
        });
      }
    }
    
    // Calculate scores for each item
    const itemScores = {};
    const categoryTotals = {};
    
    // Process each item in the course structure
    for (const [itemId, itemConfig] of Object.entries(itemStructure)) {
      const { type, questions } = itemConfig;
      
      const isOmitted = omittedItems[itemId];
      if (isOmitted) {
        console.log(`📝 Processing omitted item (will exclude from totals): ${itemId}`);
      }
      
      // Initialize category if not exists
      if (!categoryTotals[type]) {
        categoryTotals[type] = {
          score: 0,
          total: 0,
          percentage: 0,
          itemCount: 0,
          completedCount: 0,
          attemptedScore: 0,
          attemptedTotal: 0,
          // For averaging per item
          itemPercentages: [],
          attemptedItemPercentages: []
        };
      }
      
      let itemScore = { score: 0, total: 0, percentage: 0, attempted: 0, completed: false };
      
      // Check if this item should use session-based scoring
      // Note: New types (info, review, practice, assessment) are NOT session-based
      const shouldUseSession = type === 'assignment' || type === 'exam' || type === 'quiz';
      
      if (shouldUseSession) {
        // Find sessions for this item
        // Note: Teacher-created sessions don't include studentKey in sessionId, 
        // but they're stored under the student's path, so all sessions here belong to this student
        const itemSessions = Object.entries(sessions).filter(([sessionId, sessionData]) => 
          sessionData.examItemId === itemId
        );
        
        if (itemSessions.length > 0) {
          // Use session-based scoring
          const completedSessions = itemSessions
            .map(([sessionId, sessionData]) => ({ ...sessionData, sessionId })) // Include sessionId in session data
            .filter(session => session.status === 'completed' && session.finalResults);
          
          if (completedSessions.length > 0) {
            // First check for teacher-created manual grade sessions (highest priority)
            const teacherManualSessions = completedSessions.filter(session => 
              session.isTeacherCreated && 
              session.useAsManualGrade && 
              session.status === 'completed' && 
              session.finalResults
            );
            
            let selectedSession;
            let strategy;
            
            if (teacherManualSessions.length > 0) {
              // Use teacher-created session (highest priority)
              selectedSession = teacherManualSessions[0]; // Use first teacher session
              strategy = 'teacher_manual';
              console.log(`📝 Using teacher manual grade for ${itemId}: ${selectedSession.finalResults.score}/${selectedSession.finalResults.maxScore}`);
            } else {
              // No teacher session - hardcode to 'takeHighest' for student sessions
              selectedSession = completedSessions.reduce((best, current) => 
                current.finalResults.percentage > best.finalResults.percentage ? current : best
              );
              strategy = 'takeHighest';
              console.log(`🏆 Using highest student session for ${itemId}: ${selectedSession.finalResults.score}/${selectedSession.finalResults.maxScore} (${selectedSession.finalResults.percentage}%)`);
            }
            
            itemScore = {
              score: selectedSession.finalResults.score,
              total: selectedSession.finalResults.maxScore,
              percentage: selectedSession.finalResults.percentage,
              attempted: completedSessions.filter(s => !s.isTeacherCreated).length, // Only count student attempts
              completed: true,
              source: 'session',
              strategy: strategy,
              sessionId: selectedSession.sessionId, // Include the session ID used
              examItemId: selectedSession.examItemId, // Include the exam item ID
              totalQuestions: selectedSession.finalResults.totalQuestions
            };
          }
        }
      } else if (questions) {
        // Check for manual teacher override first
        const existingItemData = await db.ref(`${basePath}/Gradebook/items/${itemId}`).once('value');
        const itemData = existingItemData.val();
        
        if (itemData && itemData.isManualOverride === true) {
          // Use manual override score
          console.log(`📝 Using manual override for ${itemId}: ${itemData.manualScore}/${itemData.manualTotal}`);
          
          itemScore = {
            score: itemData.manualScore || 0,
            total: itemData.manualTotal || 0,
            percentage: itemData.manualTotal > 0 ? (itemData.manualScore / itemData.manualTotal) * 100 : 0,
            attempted: itemData.manualTotal || 0, // Consider fully attempted if manually set
            source: 'individual',
            strategy: 'teacher_manual',
            isManualOverride: true,
            originalScore: itemData.originalScore,
            originalTotal: itemData.originalTotal,
            totalQuestions: questions?.length || 0
          };
        } else {
          // Use individual question scoring (original logic)
          let totalScore = 0;
          let totalPossible = 0;
          let attemptedQuestions = 0;
          
          questions.forEach(question => {
            const questionId = question.questionId;
            const maxPoints = question.points || 1;
            const actualGrade = grades[questionId] || 0;
            
            totalPossible += maxPoints;
            totalScore += actualGrade;
            
            if (grades.hasOwnProperty(questionId)) {
              attemptedQuestions++;
            }
          });
          
          const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
          
          itemScore = {
            score: totalScore,
            total: totalPossible,
            percentage,
            attempted: attemptedQuestions,
            source: 'individual',
            totalQuestions: questions.length
          };
        }
      }
      
      // Store item score (always store, even if omitted)
      itemScores[itemId] = {
        ...itemScore,
        isOmitted: isOmitted || false  // Add omitted flag to item score
      };
      
      // Add to category totals (but skip omitted items)
      if (!isOmitted && itemScore.total > 0) { // Only count non-omitted items with actual points
        categoryTotals[type].score += itemScore.score;
        categoryTotals[type].total += itemScore.total;
        categoryTotals[type].itemCount++;
        
        // Track item percentage for averaging
        categoryTotals[type].itemPercentages.push(itemScore.percentage);
        
        // Track attempted work separately (for current performance calculation)
        // Match client-side logic: attempted > 0 OR (session-based item that was attempted)
        const hasBeenAttempted = itemScore.attempted > 0 || 
                                 (itemScore.source === 'session' && itemScore.total > 0);
        
        if (hasBeenAttempted) {
          categoryTotals[type].attemptedScore += itemScore.score;
          categoryTotals[type].attemptedTotal += itemScore.total;
          // Track attempted item percentage for averaging
          categoryTotals[type].attemptedItemPercentages.push(itemScore.percentage);
        }
        
        // Only count session-based items as completed (they have definitive completion)
        if (itemScore.completed) {
          categoryTotals[type].completedCount++;
        }
      } else if (isOmitted) {
        console.log(`⏭️ Excluded omitted item from category totals: ${itemId} (but preserved item data)`);
      }
    }
    
    // Calculate category percentages using item averaging
    Object.values(categoryTotals).forEach(category => {
      // Use average of item percentages instead of sum of all points
      if (category.itemPercentages.length > 0) {
        const sum = category.itemPercentages.reduce((acc, p) => acc + p, 0);
        category.percentage = sum / category.itemPercentages.length;
      } else {
        category.percentage = 0;
      }
      
      // Also keep the old calculation for backwards compatibility (but not used in grade calculation)
      category.percentageByPoints = category.total > 0 ? (category.score / category.total) * 100 : 0;
    });
    
    // Calculate progression based on completion requirements
    let progressionData = {
      itemsCompleted: 0,
      totalItems: 0,
      progression: 0,
      itemsStatus: {} // Track which items are completed for debugging
    };
    
    // Get progression requirements if they exist
    const progressionRequirements = courseConfig.progressionRequirements || {};
    const progressionEnabled = progressionRequirements.enabled !== false; // Default to true if not specified
    
    if (progressionEnabled) {
      const defaultCriteria = progressionRequirements.defaultCriteria || {
        lesson: {
          minimumPercentage: 0,
          requireAllQuestions: true
        },
        minimumPercentage: 0,
        requireAllQuestions: true
      };
      
      const lessonOverrides = progressionRequirements.lessonOverrides || {};
      const visibility = progressionRequirements.visibility || {};
      
      // Count progression for each item
      Object.entries(itemStructure).forEach(([itemId, itemConfig]) => {
        const { type } = itemConfig;
        const itemScore = itemScores[itemId];
        
        // Skip items that are always visible (don't count toward progression)
        if (visibility[itemId] === 'always') {
          console.log(`⏭️ Skipping always-visible item from progression: ${itemId}`);
          return;
        }
        
        // Skip omitted items
        if (itemScore && itemScore.isOmitted) {
          console.log(`⏭️ Skipping omitted item from progression: ${itemId}`);
          return;
        }
        
        // Count this as a progressable item
        progressionData.totalItems++;
        
        // Determine completion criteria for this item
        let criteria;
        
        // Check for specific lesson override
        if (lessonOverrides[itemId]) {
          criteria = lessonOverrides[itemId];
        } 
        // Check for type-specific default criteria
        else if (defaultCriteria[type]) {
          criteria = defaultCriteria[type];
        } 
        // Use general default criteria
        else {
          criteria = {
            minimumPercentage: defaultCriteria.minimumPercentage || 0,
            requireAllQuestions: defaultCriteria.requireAllQuestions !== false
          };
        }
        
        // Check if item meets progression requirements
        let isCompleted = false;
        
        if (itemScore) {
          const meetsPercentageRequirement = itemScore.percentage >= (criteria.minimumPercentage || 0);
          
          let meetsAttemptRequirement = true;
          if (criteria.requireAllQuestions) {
            // For session-based items (exams, assignments, quizzes), completion means the session exists
            if (itemScore.source === 'session') {
              meetsAttemptRequirement = itemScore.completed === true;
            } 
            // For individual question items (lessons), check if all questions are attempted
            else {
              meetsAttemptRequirement = itemScore.attempted >= itemScore.totalQuestions;
            }
          }
          
          isCompleted = meetsPercentageRequirement && meetsAttemptRequirement;
          
          if (isCompleted) {
            progressionData.itemsCompleted++;
            progressionData.itemsStatus[itemId] = 'completed';
            console.log(`✅ Item completed for progression: ${itemId} (${itemScore.percentage.toFixed(1)}%, ${itemScore.attempted}/${itemScore.totalQuestions} attempted)`);
          } else {
            progressionData.itemsStatus[itemId] = `incomplete (${itemScore.percentage.toFixed(1)}%, ${itemScore.attempted}/${itemScore.totalQuestions} attempted, needs ${criteria.minimumPercentage}% and ${criteria.requireAllQuestions ? 'all' : 'any'} questions)`;
          }
        } else {
          progressionData.itemsStatus[itemId] = 'not_started';
        }
      });
      
      // Calculate progression percentage
      progressionData.progression = progressionData.totalItems > 0 
        ? (progressionData.itemsCompleted / progressionData.totalItems) * 100 
        : 0;
      
      console.log(`📊 Progression: ${progressionData.itemsCompleted}/${progressionData.totalItems} items completed (${progressionData.progression.toFixed(1)}%)`);
    } else {
      console.log('⏭️ Progression tracking disabled for this course');
    }
    
    // Calculate two types of weighted grades
    let currentPerformanceWeighted = 0;  // Based on attempted work only
    let projectedFinalWeighted = 0;      // If remaining work scores 0%
    let totalWeightUsed = 0;
    let attemptedWeightUsed = 0;
    
    Object.entries(categoryTotals).forEach(([type, category]) => {
      const weight = courseWeights[type] || 0;
      
      // Only include categories with weight > 0
      if (weight > 0) {
        totalWeightUsed += weight;
        
        // 1. Projected Final Grade (using average of item percentages)
        // Use the category percentage which is now the average of item percentages
        projectedFinalWeighted += category.percentage * weight;
        
        // 2. Current Performance Grade (only on attempted work)
        if (category.attemptedItemPercentages.length > 0) {
          attemptedWeightUsed += weight;
          // Calculate average of attempted item percentages
          const attemptedSum = category.attemptedItemPercentages.reduce((acc, p) => acc + p, 0);
          const attemptedCategoryPercentage = attemptedSum / category.attemptedItemPercentages.length;
          currentPerformanceWeighted += attemptedCategoryPercentage * weight;
        }
      }
    });
    
    // Normalize the grades
    const projectedFinalGrade = totalWeightUsed > 0 ? projectedFinalWeighted / totalWeightUsed : 0;
    const currentPerformanceGrade = attemptedWeightUsed > 0 ? currentPerformanceWeighted / attemptedWeightUsed : 0;
    
    // Determine if course is completed
    let courseCompleted = false;
    
    // For course 4, check if the last lesson is completed
    if (courseId === '4') {
      const lastLessonId = '10_physics_30_exams_rewrites_student_support';
      courseCompleted = progressionData.itemsStatus[lastLessonId] === 'completed';
    } else {
      // For other courses, use 100% progression as completion criteria
      courseCompleted = progressionData.progression >= 100;
    }
    
    // Log course completion status change
    if (courseCompleted) {
      console.log(`🎓 Course ${courseId} marked as COMPLETED for student ${studentKey}`);
    }
    
    // Save pre-calculated results to database
    const gradebookData = {
      items: itemScores,
      categories: categoryTotals,
      overall: {
        currentPerformance: currentPerformanceGrade,
        projectedFinal: projectedFinalGrade,
        percentage: projectedFinalGrade, // Default to projected for compatibility
        totalWeightUsed: totalWeightUsed,
        attemptedWeightUsed: attemptedWeightUsed,
        isWeighted: true,
        // Add progression data
        progression: progressionData.progression,
        itemsCompleted: progressionData.itemsCompleted,
        totalItems: progressionData.totalItems,
        courseCompleted: courseCompleted // NEW: Add course completion flag
      },
      metadata: {
        lastCalculated: getServerTimestamp(),
        calculationVersion: '1.2', // Bumped version for course completion feature
        progressionEnabled: progressionEnabled
      }
    };
    
    await db.ref(`${basePath}/Gradebook`).update(gradebookData);
    
    console.log(`✅ Gradebook recalculation completed for ${studentKey}/${courseId}: Current=${currentPerformanceGrade.toFixed(1)}%, Projected=${projectedFinalGrade.toFixed(1)}%, Progression=${progressionData.progression.toFixed(1)}%`);
    
  } catch (error) {
    console.error('Error in recalculateFullGradebook:', error);
    throw error;
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
  recalculateFullGradebook,
  getCategoryWeight // Deprecated but kept for backward compatibility
};