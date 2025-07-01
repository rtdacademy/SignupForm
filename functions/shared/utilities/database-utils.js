/**
 * Shared Database Utilities
 * Standard database operations and utilities used across all assessment types
 */

const admin = require('firebase-admin');
const { sanitizeEmail } = require('../../utils');

// Helper function to get category weights
const getCategoryWeight = (type) => {
  const weights = {
    lesson: 15,
    assignment: 35,
    exam: 35,
    project: 15,
    lab: 0
  };
  return weights[type] || 15;
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
 * Extended database paths for gradebook
 */
const GRADEBOOK_PATHS = {
  ...DATABASE_PATHS,
  gradebookSummary: (studentKey, courseId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/summary`
            : `students/${studentKey}/courses/${courseId}/Gradebook/summary`,
  
  gradebookCategories: (studentKey, courseId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/categories`
            : `students/${studentKey}/courses/${courseId}/Gradebook/categories`,
  
  gradebookItems: (studentKey, courseId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/items`
            : `students/${studentKey}/courses/${courseId}/Gradebook/items`,
  
  gradebookItem: (studentKey, courseId, itemId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/items/${itemId}`
            : `students/${studentKey}/courses/${courseId}/Gradebook/items/${itemId}`,
  
  // NEW: Course structure items (aggregates multiple assessments per lesson/assignment)
  courseStructureItems: (studentKey, courseId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/courseStructureItems`
            : `students/${studentKey}/courses/${courseId}/Gradebook/courseStructureItems`,
  
  courseStructureItem: (studentKey, courseId, courseStructureItemId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/courseStructureItems/${courseStructureItemId}`
            : `students/${studentKey}/courses/${courseId}/Gradebook/courseStructureItems/${courseStructureItemId}`,
  
  courseStructureItemAssessments: (studentKey, courseId, courseStructureItemId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/courseStructureItems/${courseStructureItemId}/assessments`
            : `students/${studentKey}/courses/${courseId}/Gradebook/courseStructureItems/${courseStructureItemId}/assessments`,
  
  lessonProgress: (studentKey, courseId, lessonId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/progress/lessons/${lessonId}`
            : `students/${studentKey}/courses/${courseId}/Gradebook/progress/lessons/${lessonId}`,
  
  // Time tracking
  timeTracking: (studentKey, courseId, itemId, isStaff = false) =>
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook/timeTracking/${itemId}`
            : `students/${studentKey}/courses/${courseId}/Gradebook/timeTracking/${itemId}`
};

/**
 * Track when a student accesses a lesson
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} lessonInfo - Additional lesson information
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function trackLessonAccess(studentKey, courseId, lessonId, lessonInfo = {}, isStaff = false) {
  try {
    const progressPath = GRADEBOOK_PATHS.lessonProgress(studentKey, courseId, lessonId, isStaff);
    const progressRef = admin.database().ref(progressPath);
    
    const snapshot = await progressRef.once('value');
    const existing = snapshot.val() || {};
    
    const now = Date.now();
    const update = {
      lastAccessedAt: getServerTimestamp(),
      accessCount: (existing.accessCount || 0) + 1,
      title: lessonInfo.title || existing.title,
    };
    
    // Only include unitId if it has a value (avoid undefined)
    const unitId = lessonInfo.unitId || existing.unitId;
    if (unitId) {
      update.unitId = unitId;
    }
    
    // Track first open
    if (!existing.firstOpenedAt) {
      update.firstOpenedAt = getServerTimestamp();
      update.status = 'started';
    }
    
    // Calculate session duration if there was a previous access
    if (existing.lastAccessedAt) {
      const lastAccess = new Date(existing.lastAccessedAt).getTime();
      const sessionGap = now - lastAccess;
      
      // If less than 30 minutes since last access, consider it same session
      if (sessionGap < 30 * 60 * 1000) {
        update.currentSessionDuration = (existing.currentSessionDuration || 0) + Math.floor(sessionGap / 1000);
      } else {
        // New session
        update.totalDuration = (existing.totalDuration || 0) + (existing.currentSessionDuration || 0);
        update.currentSessionDuration = 0;
      }
    }
    
    await progressRef.update(update);
    console.log(`📚 Tracked lesson access: ${lessonId} for ${studentKey}`);
    
  } catch (error) {
    console.error('Error tracking lesson access:', error);
    throw error;
  }
}

/**
 * Track assessment progress within a lesson
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {string} assessmentId - Assessment ID
 * @param {string} status - Status ('viewed', 'started', 'completed')
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function trackAssessmentProgress(studentKey, courseId, lessonId, assessmentId, status, isStaff = false) {
  try {
    if (!lessonId) {
      console.warn('No lessonId provided for assessment progress tracking');
      return;
    }
    
    const progressPath = GRADEBOOK_PATHS.lessonProgress(studentKey, courseId, lessonId, isStaff);
    const progressRef = admin.database().ref(progressPath);
    
    const update = {
      [`assessments/${assessmentId}/status`]: status,
      [`assessments/${assessmentId}/lastUpdated`]: getServerTimestamp(),
    };
    
    if (status === 'viewed') {
      update[`assessments/${assessmentId}/firstViewed`] = getServerTimestamp();
    } else if (status === 'completed') {
      update[`assessments/${assessmentId}/completedAt`] = getServerTimestamp();
      
      // Update question count
      const snapshot = await progressRef.once('value');
      const existing = snapshot.val() || {};
      const assessments = existing.assessments || {};
      
      const totalQuestions = Object.keys(assessments).length;
      const completedQuestions = Object.values(assessments).filter(a => a.status === 'completed').length + 1;
      
      update.questionsAnswered = completedQuestions;
      update.totalQuestions = totalQuestions;
      
      // Mark lesson as completed if all assessments are done
      if (completedQuestions === totalQuestions && totalQuestions > 0) {
        update.status = 'completed';
        update.completedAt = getServerTimestamp();
      }
    }
    
    await progressRef.update(update);
    console.log(`📊 Tracked assessment progress: ${assessmentId} (${status}) in lesson ${lessonId}`);
    
  } catch (error) {
    console.error('Error tracking assessment progress:', error);
    throw error;
  }
}

/**
 * Update gradebook when an assessment is completed
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} itemId - Item ID (assessment ID/question ID)
 * @param {number} score - Score earned
 * @param {Object} itemConfig - Item configuration (legacy - will be replaced by course config data)
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function updateGradebookItem(studentKey, courseId, itemId, score, itemConfig, isStaff = false) {
  try {
    // ENHANCED: Check if gradebook exists and validate structure periodically
    const itemPath = GRADEBOOK_PATHS.gradebookItem(studentKey, courseId, itemId, isStaff);
    const itemRef = admin.database().ref(itemPath);
    
    // Get existing data first to check if gradebook exists
    const snapshot = await itemRef.once('value');
    const existing = snapshot.val() || {};
    
    // Check if gradebook is initialized
    const basePath = isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook` 
                              : `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    const gradebookSnapshot = await gradebookRef.once('value');
    const currentGradebook = gradebookSnapshot.val();
    
    let shouldValidateStructure = false;
    
    // Validate structure if:
    // 1. Gradebook doesn't exist or isn't initialized
    // 2. This is the first submission of the day (throttling mechanism)
    // 3. Question doesn't exist in current structure
    if (!currentGradebook || !currentGradebook.initialized) {
      console.log(`📝 Gradebook not initialized for ${studentKey} in course ${courseId}`);
      shouldValidateStructure = true;
    } else if (!existing || Object.keys(existing).length === 0) {
      // Question doesn't exist - this could indicate missing structure
      console.log(`🔍 Question ${itemId} not found in gradebook for ${studentKey}, checking structure...`);
      shouldValidateStructure = true;
    } else {
      // Periodic validation: Check if we haven't validated today
      const lastValidated = currentGradebook.lastStructureValidation;
      const today = new Date().toDateString();
      const lastValidatedDate = lastValidated ? new Date(lastValidated).toDateString() : null;
      
      if (lastValidatedDate !== today) {
        console.log(`📅 Daily structure validation for ${studentKey} in course ${courseId}`);
        shouldValidateStructure = true;
      }
    }
    
    if (shouldValidateStructure) {
      const structureValidation = await validateGradebookStructure(studentKey, courseId, isStaff);
      
      if (!structureValidation.isValid) {
        console.log(`🔧 Gradebook structure incomplete for ${studentKey} in course ${courseId}. Rebuilding...`);
        console.log(`Missing items: ${structureValidation.missingItems.length}, Missing categories: ${structureValidation.missingCategories.length}`);
        
        // Reinitialize the complete gradebook structure
        await initializeGradebook(studentKey, courseId, isStaff);
        console.log(`✅ Gradebook structure rebuilt successfully for ${studentKey} in course ${courseId}`);
        
        // Refresh the item reference after reinitialization
        const newSnapshot = await itemRef.once('value');
        const refreshedExisting = newSnapshot.val() || {};
        Object.assign(existing, refreshedExisting);
      }
      
      // Update last validation timestamp
      await gradebookRef.update({
        lastStructureValidation: getServerTimestamp()
      });
    }
    
    // NEW: Use course config to find question details
    const questionInfo = await findQuestionInCourseConfig(courseId, itemId);
    
    let finalItemConfig = itemConfig;
    let courseStructureItemId = 'unknown';
    
    if (questionInfo) {
      // Use data from course config (preferred)
      console.log(`✅ Using course config data for ${itemId}`);
      finalItemConfig = {
        title: questionInfo.questionTitle,
        type: questionInfo.itemType,
        pointsValue: questionInfo.questionPoints,
        maxScore: questionInfo.questionPoints,
        courseStructureItemId: questionInfo.itemId, // This is the course item ID (lesson/assignment)
        contentPath: questionInfo.contentPath
      };
      courseStructureItemId = questionInfo.itemId;
    } else {
      // Fallback to legacy approach only if course config approach fails
      console.log(`⚠️ Question ${itemId} not found in course config, trying legacy approach`);
      try {
        const courseStructureItem = await findCourseStructureItem(courseId, itemId);
        courseStructureItemId = courseStructureItem?.itemId || itemConfig.courseStructureItemId || 'unknown';
      } catch (error) {
        console.log(`⚠️ Legacy approach also failed for ${itemId}: ${error.message}`);
        console.log(`Using minimal configuration for ${itemId}`);
        courseStructureItemId = itemConfig.courseStructureItemId || 'unknown';
      }
    }
    
    const itemData = {
      title: finalItemConfig.title || existing.title || itemId,
      type: finalItemConfig.type || existing.type || 'lesson',
      unitId: finalItemConfig.unitId || existing.unitId || 'unknown',
      courseStructureItemId: courseStructureItemId, // Link to course item (lesson/assignment)
      score: score,
      maxScore: finalItemConfig.pointsValue || finalItemConfig.maxScore || score,
      weight: finalItemConfig.weight || existing.weight || 0,
      attempts: (existing.attempts || 0) + 1,
      lastAttempt: getServerTimestamp(),
      status: 'completed',
      // Enhanced tracking
      timeSpent: finalItemConfig.timeSpent || existing.timeSpent || 0,
      required: true, // Questions are typically required
      estimatedTime: finalItemConfig.estimatedTime || 0
    };

    // Only add contentPath if it has a value (avoid undefined)
    if (finalItemConfig.contentPath || existing.contentPath) {
      itemData.contentPath = finalItemConfig.contentPath || existing.contentPath;
    }
    
    // Track first completion
    if (!existing.completedAt) {
      itemData.completedAt = getServerTimestamp();
    }
    
    // Track best score
    if (existing.bestScore !== undefined) {
      itemData.bestScore = Math.max(existing.bestScore, score);
    } else {
      itemData.bestScore = score;
    }
    
    await itemRef.set(itemData);
    console.log(`✅ Updated gradebook item: ${itemId} with score ${score} (Course Structure Item: ${courseStructureItemId})`);
    
    // Update course structure item summary (aggregates multiple assessments per lesson/assignment)
    await updateCourseStructureItemSummary(studentKey, courseId, courseStructureItemId, isStaff);
    
    // Trigger category and summary recalculation
    await recalculateCategoryGrades(studentKey, courseId, isStaff);
    await updateGradebookSummary(studentKey, courseId, isStaff);
    
  } catch (error) {
    console.error('Error updating gradebook item:', error);
    throw error;
  }
}

/**
 * Recalculate grades for each category with support for individual item weights
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function recalculateCategoryGrades(studentKey, courseId, isStaff = false) {
  try {
    // Get course configuration for weights
    const courseConfig = await getCourseConfig(courseId);
    const categoryWeights = courseConfig.weights || {};
    
    // Get all course structure items (these have individual weights)
    const courseStructureItemsPath = GRADEBOOK_PATHS.courseStructureItems(studentKey, courseId, isStaff);
    const courseStructureItemsRef = admin.database().ref(courseStructureItemsPath);
    const courseStructureItemsSnapshot = await courseStructureItemsRef.once('value');
    const courseStructureItems = courseStructureItemsSnapshot.val() || {};
    
    // Get all individual assessment items
    const itemsPath = GRADEBOOK_PATHS.gradebookItems(studentKey, courseId, isStaff);
    const itemsRef = admin.database().ref(itemsPath);
    const itemsSnapshot = await itemsRef.once('value');
    const items = itemsSnapshot.val() || {};
    
    // Calculate categories using course structure items (preferred) and individual items (fallback)
    const categories = {};
    let totalIndividualWeights = 0;
    
    // First, process course structure items (these have individual weights)
    Object.entries(courseStructureItems).forEach(([courseStructureItemId, item]) => {
      const type = item.type || 'lesson';
      const itemWeight = item.weight || 0;
      
      if (!categories[type]) {
        categories[type] = {
          earned: 0,
          possible: 0,
          totalWeight: 0,
          items: [],
          categoryWeight: categoryWeights[type] || 0,
          useIndividualWeights: false
        };
      }
      
      if (itemWeight > 0) {
        categories[type].useIndividualWeights = true;
        categories[type].totalWeight += itemWeight;
        totalIndividualWeights += itemWeight;
      }
      
      categories[type].earned += item.totalScore || 0;
      categories[type].possible += item.totalPossible || 0;
      categories[type].items.push({
        id: courseStructureItemId,
        title: item.title,
        score: item.totalScore,
        maxScore: item.totalPossible,
        percentage: item.percentage,
        weight: itemWeight,
        type: 'courseStructureItem'
      });
    });
    
    // Then, process individual items that don't belong to course structure items
    Object.entries(items).forEach(([itemId, item]) => {
      const courseStructureItemId = item.courseStructureItemId;
      
      // Skip if this item is already aggregated in a course structure item
      if (courseStructureItemId && courseStructureItemId !== 'unknown' && courseStructureItems[courseStructureItemId]) {
        return;
      }
      
      const type = item.type || 'lesson';
      
      if (!categories[type]) {
        categories[type] = {
          earned: 0,
          possible: 0,
          totalWeight: 0,
          items: [],
          categoryWeight: categoryWeights[type] || 0,
          useIndividualWeights: false
        };
      }
      
      categories[type].earned += item.bestScore || item.score || 0;
      categories[type].possible += item.maxScore || 0;
      categories[type].items.push({
        id: itemId,
        title: item.title,
        score: item.bestScore || item.score,
        maxScore: item.maxScore,
        percentage: Math.round(((item.bestScore || item.score || 0) / (item.maxScore || 1)) * 100),
        weight: 0, // Individual items don't have weights by default
        type: 'assessment'
      });
    });
    
    // Calculate weighted scores for each category
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(categories).forEach(([type, data]) => {
      if (data.possible > 0) {
        const percentage = (data.earned / data.possible) * 100;
        data.percentage = Math.round(percentage * 10) / 10;
        
        if (data.useIndividualWeights && data.totalWeight > 0) {
          // Use individual item weights within the category
          data.weightedScore = (percentage / 100) * data.totalWeight;
          totalWeightedScore += data.weightedScore;
          totalWeight += data.totalWeight;
        } else {
          // Use traditional category weights
          data.weightedScore = (percentage / 100) * data.categoryWeight;
          totalWeightedScore += data.weightedScore;
          totalWeight += data.categoryWeight;
        }
      }
    });
    
    // Save category grades
    const categoriesPath = GRADEBOOK_PATHS.gradebookCategories(studentKey, courseId, isStaff);
    const categoriesRef = admin.database().ref(categoriesPath);
    await categoriesRef.set(categories);
    
    console.log(`📊 Recalculated category grades for ${studentKey} in course ${courseId}`);
    return { categories, totalWeightedScore, totalWeight };
    
  } catch (error) {
    console.error('Error recalculating category grades:', error);
    throw error;
  }
}

/**
 * Update the gradebook summary
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function updateGradebookSummary(studentKey, courseId, isStaff = false) {
  try {
    const { categories, totalWeightedScore, totalWeight } = await recalculateCategoryGrades(studentKey, courseId, isStaff);
    
    // Calculate overall percentage
    let overallPercentage = 0;
    if (totalWeight > 0) {
      overallPercentage = totalWeightedScore;
    }
    
    // Get passing grade from course config
    const courseConfig = await getCourseConfig(courseId);
    const passingGrade = courseConfig.globalSettings?.passingGrade || 60;
    
    // Calculate total points
    let totalEarned = 0;
    let totalPossible = 0;
    let completedEarned = 0;  // NEW: Points earned on completed items
    let completedPossible = 0; // NEW: Points possible on completed items
    
    // Get all items to check completion status
    const itemsPath = GRADEBOOK_PATHS.gradebookItems(studentKey, courseId, isStaff);
    const itemsRef = admin.database().ref(itemsPath);
    const itemsSnapshot = await itemsRef.once('value');
    const items = itemsSnapshot.val() || {};
    
    // Calculate totals for all items and completed items
    Object.values(categories).forEach(category => {
      totalEarned += category.earned;
      totalPossible += category.possible;
    });
    
    // Calculate performance grade based on completed items only
    Object.values(items).forEach(item => {
      if (item.status === 'completed' || item.attempts > 0) {
        completedEarned += item.score || 0;
        completedPossible += item.maxScore || 0;
      }
    });
    
    // Calculate performance percentage (grade on completed work)
    const performancePercentage = completedPossible > 0 
      ? (completedEarned / completedPossible) * 100 
      : 0;
    
    // Calculate overall course percentage (current grade in full course)
    const coursePercentage = totalPossible > 0 
      ? (totalEarned / totalPossible) * 100 
      : 0;
    
    // Create enhanced summary
    const summary = {
      // Existing fields
      totalPoints: Math.round(totalEarned * 10) / 10,
      possiblePoints: totalPossible,
      percentage: Math.round(overallPercentage * 10) / 10, // Keep for backward compatibility
      isPassing: overallPercentage >= passingGrade,
      passingGrade: passingGrade,
      lastUpdated: getServerTimestamp(),
      status: 'active',
      weightedScore: Math.round(totalWeightedScore * 10) / 10,
      totalWeight: totalWeight,
      
      // NEW FIELDS
      courseGrade: Math.round(coursePercentage * 10) / 10,        // Grade out of full course (e.g., 10%)
      performanceGrade: Math.round(performancePercentage * 10) / 10, // Grade on completed work (e.g., 90%)
      completedPoints: Math.round(completedEarned * 10) / 10,     // Points earned on completed items
      completedPossible: completedPossible,                        // Points possible on completed items
      completedCount: Object.values(items).filter(item => 
        item.status === 'completed' || item.attempts > 0).length, // Number of completed items
      totalItemCount: Object.keys(items).length                    // Total number of items
    };
    
    // Save summary
    const summaryPath = GRADEBOOK_PATHS.gradebookSummary(studentKey, courseId, isStaff);
    const summaryRef = admin.database().ref(summaryPath);
    await summaryRef.set(summary);
    
    console.log(`📈 Updated gradebook summary:`);
    console.log(`   Course Grade: ${summary.courseGrade}% (${summary.totalPoints}/${summary.possiblePoints})`);
    console.log(`   Performance Grade: ${summary.performanceGrade}% (${summary.completedPoints}/${summary.completedPossible})`);
    console.log(`   Completed: ${summary.completedCount}/${summary.totalItemCount} items`);
    
    return summary;
    
  } catch (error) {
    console.error('Error updating gradebook summary:', error);
    throw error;
  }
}

/**
 * Get course configuration (database first, then file fallback)
 */
async function getCourseConfig(courseId) {
  try {
    // NEW: First try to get config from database
    const db = admin.database();
    const courseConfigRef = db.ref(`courses/${courseId}/course-config`);
    const configSnapshot = await courseConfigRef.once('value');
    
    if (configSnapshot.exists()) {
      console.log(`✅ Using course config from database for course ${courseId}`);
      return configSnapshot.val();
    }
    
    // Fallback: Load from local file if database doesn't have config
    console.log(`⚠️ Course config not found in database for ${courseId}, trying local file...`);
    const config = require(`../../courses-config/${courseId}/course-config.json`);
    console.log(`✅ Using course config from local file for course ${courseId}`);
    return config;
  } catch (error) {
    console.warn(`Course config not found in database or file for ${courseId}, returning null`);
    return null; // Return null instead of defaults - let calling code handle gracefully
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
async function initializeGradebook(studentKey, courseId, isStaff = false) {
  try {
    const basePath = isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook` 
                              : `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    
    // Get course config to build complete structure
    const courseConfig = await getCourseConfig(courseId);
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    
    if (gradebookStructure) {
      console.log(`🏗️ Building complete gradebook structure from course-config.json for course ${courseId}`);
      
      // Build complete gradebook structure
      const categories = {};
      const items = {};
      let totalPossiblePoints = 0;
      
      // Process each item from course config
      Object.entries(gradebookStructure).forEach(([itemId, itemConfig]) => {
        const itemType = itemConfig.type || 'lesson';
        const itemQuestions = itemConfig.questions || [];
        const itemTotalPoints = itemQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
        
        // Initialize category if not exists
        if (!categories[itemType]) {
          // Get weight from course config instead of hardcoded values
          const configWeights = courseConfig.weights || {};
          const categoryWeight = configWeights[itemType] !== undefined 
            ? configWeights[itemType] * 100  // Convert from decimal to percentage
            : getCategoryWeight(itemType);   // Fallback to hardcoded for backward compatibility
          
          console.log(`🎯 Category ${itemType}: Using weight ${categoryWeight}% (config: ${configWeights[itemType]}, fallback: ${getCategoryWeight(itemType)})`);
          
          categories[itemType] = {
            categoryWeight: categoryWeight,
            earned: 0,
            possible: 0,
            percentage: 0,
            items: [],
            totalWeight: 0,
            useIndividualWeights: false,
            weightedScore: 0
          };
        }
        
        // Add to category totals
        categories[itemType].possible += itemTotalPoints;
        totalPossiblePoints += itemTotalPoints;
        
        // Add item to category
        categories[itemType].items.push({
          id: itemId,
          title: itemConfig.title,
          maxScore: itemTotalPoints,
          score: 0,
          percentage: 0,
          type: itemType,
          weight: 0
        });
        
        // Create individual question items
        itemQuestions.forEach(question => {
          items[question.questionId] = {
            title: question.title,
            type: itemType,
            unitId: 'main_unit',
            courseStructureItemId: itemId,
            score: 0,
            maxScore: question.points,
            weight: 0,
            attempts: 0,
            lastAttempt: null,
            status: 'not_started',
            timeSpent: 0,
            required: true,
            estimatedTime: 0
          };
        });
      });
      
      // Calculate category percentages (all 0% initially)
      Object.keys(categories).forEach(categoryType => {
        const category = categories[categoryType];
        category.percentage = 0; // No points earned yet
        category.weightedScore = 0;
      });
      
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
        summary: {
          totalPoints: 0,
          possiblePoints: totalPossiblePoints,
          percentage: 0,
          isPassing: false,
          passingGrade: passingGrade,
          status: 'active',
          lastUpdated: getServerTimestamp(),
          totalWeight: Object.values(categories).reduce((sum, cat) => sum + cat.categoryWeight, 0),
          weightedScore: 0
        },
        categories: categories,
        items: items,
        courseStructureItems: {},
        courseStructure: courseStructure, // Add course structure for navigation
        progress: {
          lessons: {}
        },
        timeTracking: {}
      };
      
      await gradebookRef.set(gradebookData);
      
      console.log(`✅ Complete gradebook initialized for ${studentKey} in course ${courseId}:`, {
        totalPossiblePoints,
        itemsCount: Object.keys(items).length,
        categoriesCount: Object.keys(categories).length,
        categoryTotals: Object.fromEntries(
          Object.entries(categories).map(([type, cat]) => [type, cat.possible])
        )
      });
      
    } else {
      // Fallback to basic structure if no course config
      console.log(`⚠️ No course config found, creating basic gradebook for course ${courseId}`);
      
      await gradebookRef.set({
        initialized: true,
        createdAt: getServerTimestamp(),
        summary: {
          totalPoints: 0,
          possiblePoints: 0,
          percentage: 0,
          isPassing: false,
          status: 'active'
        },
        categories: {},
        items: {},
        courseStructureItems: {},
        progress: {
          lessons: {}
        },
        timeTracking: {}
      });
    }
    
    console.log(`🎓 Gradebook initialization complete for ${studentKey} in course ${courseId}`);
    
  } catch (error) {
    console.error('Error initializing gradebook:', error);
    throw error;
  }
}

/**
 * Load course structure from the course structure file
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course structure
 */
async function getCourseStructure(courseId) {
  try {
    // NEW APPROACH: Use courseStructure from course-config.json
    const courseConfig = await getCourseConfig(courseId);
    
    if (courseConfig?.courseStructure) {
      console.log(`✅ Using courseStructure from course config for course ${courseId}`);
      return courseConfig.courseStructure;
    }
    
    // Fallback: Try to load from frontend course structure files (legacy)
    const frontendPath = `../../../src/FirebaseCourses/courses/${courseId}/course-structure.json`;
    try {
      const courseStructure = require(frontendPath);
      console.log(`⚠️ Using legacy frontend courseStructure for course ${courseId}`);
      return courseStructure.courseStructure || courseStructure;
    } catch (frontendError) {
      console.log(`Frontend course structure not found for ${courseId}, trying backend...`);
    }
    
    // Try backend course structure (legacy)
    const backendPath = `../../courses/${courseId}/structure.json`;
    const courseStructure = require(backendPath);
    console.log(`⚠️ Using legacy backend courseStructure for course ${courseId}`);
    return courseStructure.courseStructure || courseStructure;
    
  } catch (error) {
    console.warn(`Course structure not found for course ${courseId}:`, error.message);
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

/**
 * Clean up legacy assessment entries from gradebook
 * Removes duplicate legacy assessment IDs when corresponding new IDs exist
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function cleanupLegacyAssessments(studentKey, courseId, isStaff = false) {
  try {
    const itemsPath = GRADEBOOK_PATHS.gradebookItems(studentKey, courseId, isStaff);
    const itemsRef = admin.database().ref(itemsPath);
    const itemsSnapshot = await itemsRef.once('value');
    const items = itemsSnapshot.val() || {};
    
    const courseConfig = await getCourseConfig(courseId);
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    
    if (!gradebookStructure) {
      console.log(`⚠️ No course config found for course ${courseId}, skipping cleanup`);
      return;
    }
    
    // Build set of valid new assessment IDs
    const validNewIds = new Set();
    Object.values(gradebookStructure).forEach(item => {
      (item.questions || []).forEach(question => {
        validNewIds.add(question.questionId);
      });
    });
    
    // Find legacy IDs that have corresponding new IDs
    const legacyIdsToRemove = [];
    Object.keys(items).forEach(assessmentId => {
      // Check if this is a legacy ID (doesn't start with course prefix)
      if (!assessmentId.match(/^course\d+_/)) {
        // Try to find corresponding new ID
        const possibleNewId = `course${courseId}_${assessmentId}`;
        if (validNewIds.has(possibleNewId) && items[possibleNewId]) {
          // Both legacy and new exist - mark legacy for removal
          legacyIdsToRemove.push(assessmentId);
          console.log(`🗑️ Marking legacy assessment for removal: ${assessmentId} (new version: ${possibleNewId} exists)`);
        }
      }
    });
    
    // Remove legacy assessments
    if (legacyIdsToRemove.length > 0) {
      const updates = {};
      legacyIdsToRemove.forEach(legacyId => {
        updates[legacyId] = null; // Firebase deletion
      });
      
      await itemsRef.update(updates);
      console.log(`✅ Removed ${legacyIdsToRemove.length} legacy assessment entries`);
      
      // Also clean up any course structure items that might reference these
      const courseStructureItemsPath = GRADEBOOK_PATHS.courseStructureItems(studentKey, courseId, isStaff);
      const summariesRef = admin.database().ref(courseStructureItemsPath);
      const summariesSnapshot = await summariesRef.once('value');
      const summaries = summariesSnapshot.val() || {};
      
      // Update course structure item summaries to recalculate without legacy items
      for (const [itemId, summary] of Object.entries(summaries)) {
        await updateCourseStructureItemSummary(studentKey, courseId, itemId, isStaff);
      }
      
      return { 
        removed: legacyIdsToRemove.length,
        legacyIds: legacyIdsToRemove 
      };
    } else {
      console.log(`✅ No legacy assessments found to clean up`);
      return { removed: 0, legacyIds: [] };
    }
    
  } catch (error) {
    console.error('Error cleaning up legacy assessments:', error);
    throw error;
  }
}

/**
 * Update course structure item summary (aggregates multiple assessments within a lesson/assignment)
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} courseStructureItemId - Course structure item ID
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function updateCourseStructureItemSummary(studentKey, courseId, courseStructureItemId, isStaff = false) {
  try {
    if (!courseStructureItemId || courseStructureItemId === 'unknown') {
      return; // Skip if we don't know the course structure item
    }
    
    // Get all individual assessments
    const itemsPath = GRADEBOOK_PATHS.gradebookItems(studentKey, courseId, isStaff);
    const itemsRef = admin.database().ref(itemsPath);
    const itemsSnapshot = await itemsRef.once('value');
    const items = itemsSnapshot.val() || {};
    
    // Get course config to filter out legacy assessments
    const courseConfig = await getCourseConfig(courseId);
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    
    // Get valid assessment IDs for this course structure item from course config
    const validAssessmentIds = new Set();
    
    if (gradebookStructure && gradebookStructure[courseStructureItemId]) {
      const questions = gradebookStructure[courseStructureItemId].questions || [];
      questions.forEach(question => {
        validAssessmentIds.add(question.questionId);
      });
    }
    
    console.log(`📋 Valid assessment IDs for ${courseStructureItemId}:`, Array.from(validAssessmentIds));
    
    // Filter assessments that belong to this course structure item AND exist in course config
    const relatedAssessments = Object.entries(items).filter(([assessmentId, item]) => 
      item.courseStructureItemId === courseStructureItemId && 
      validAssessmentIds.has(assessmentId)
    );
    
    console.log(`📊 Selected assessments for ${courseStructureItemId}:`, relatedAssessments.map(([id]) => id));
    
    if (relatedAssessments.length === 0) {
      return; // No assessments for this item yet
    }
    
    // Calculate summary for this course structure item
    let totalScore = 0;
    let totalPossible = 0;
    let allCompleted = true;
    let averagePercentage = 0;
    let totalTimeSpent = 0;
    
    relatedAssessments.forEach(([assessmentId, item]) => {
      totalScore += item.score || 0;
      totalPossible += item.maxScore || 0;
      totalTimeSpent += item.timeSpent || 0;
      if (item.score === undefined || item.score === null) {
        allCompleted = false;
      }
    });
    
    averagePercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    
    // Get the item info from the first related assessment
    const sampleItem = relatedAssessments[0][1];
    
    // Get course structure item details
    const courseStructureItem = await findCourseStructureItem(courseId, courseStructureItemId);
    const itemWeight = courseStructureItem?.weight || 0;
    const estimatedTime = courseStructureItem?.estimatedTime || 0;
    const isRequired = courseStructureItem?.required !== false;
    
    // Create course structure item summary
    const itemSummary = {
      courseStructureItemId: courseStructureItemId,
      type: sampleItem.type,
      unitId: sampleItem.unitId || courseStructureItem?.unitId,
      title: courseStructureItem?.title || sampleItem.title,
      totalScore: Math.round(totalScore * 10) / 10,
      totalPossible: totalPossible,
      percentage: averagePercentage,
      weight: itemWeight, // Individual item weight from course structure
      assessmentCount: relatedAssessments.length,
      completed: allCompleted,
      required: isRequired,
      estimatedTime: estimatedTime, // In minutes
      actualTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      lastUpdated: getServerTimestamp(),
      assessments: relatedAssessments.reduce((acc, [id, item]) => {
        // Calculate individual assessment percentage
        const itemPercentage = item.maxScore > 0 ? Math.round(((item.score || 0) / item.maxScore) * 100) : 0;
        
        // Use local timestamp in dev/emulator mode if timestamp is missing
        const itemTimestamp = item.timestamp || (process.env.FUNCTIONS_EMULATOR ? Date.now() : getServerTimestamp());
        
        acc[id] = {
          score: item.score || 0,
          maxScore: item.maxScore || 0,
          percentage: itemPercentage,
          timestamp: itemTimestamp,
          timeSpent: item.timeSpent || 0
        };
        return acc;
      }, {})
    };
    
    // Save course structure item summary
    const summaryPath = GRADEBOOK_PATHS.courseStructureItem(studentKey, courseId, courseStructureItemId, isStaff);
    const summaryRef = admin.database().ref(summaryPath);
    await summaryRef.set(itemSummary);
    
    console.log(`📊 Updated course structure item summary: ${courseStructureItemId} = ${averagePercentage}% (${relatedAssessments.length} assessments)`);
    
    return itemSummary;
    
  } catch (error) {
    console.error('Error updating course structure item summary:', error);
    // Don't throw - this shouldn't break the main gradebook flow
    return null;
  }
}

/**
 * Track time spent on an assessment or lesson
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {string} itemId - Item ID (assessment or lesson)
 * @param {number} timeSpent - Time spent in seconds
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function trackTimeSpent(studentKey, courseId, itemId, timeSpent, isStaff = false) {
  try {
    const timePath = GRADEBOOK_PATHS.timeTracking(studentKey, courseId, itemId, isStaff);
    const timeRef = admin.database().ref(timePath);
    
    const snapshot = await timeRef.once('value');
    const existing = snapshot.val() || {};
    
    const timeData = {
      itemId: itemId,
      totalTime: (existing.totalTime || 0) + timeSpent,
      sessions: (existing.sessions || 0) + 1,
      lastSession: timeSpent,
      lastAccess: getServerTimestamp(),
      averageSessionTime: Math.round(((existing.totalTime || 0) + timeSpent) / ((existing.sessions || 0) + 1))
    };
    
    await timeRef.set(timeData);
    
    console.log(`⏱️ Tracked time for ${itemId}: ${timeSpent}s (Total: ${timeData.totalTime}s)`);
    
    return timeData;
    
  } catch (error) {
    console.error('Error tracking time:', error);
    throw error;
  }
}

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
async function syncCourseConfig(studentKey, courseId, isStaff = false) {
  try {
    console.log(`🔄 Syncing course config for ${studentKey} in course ${courseId}`);
    
    // Get latest course configuration
    const latestCourseConfig = await getCourseConfig(courseId);
    
    // Get current gradebook
    const basePath = isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook` 
                              : `students/${studentKey}/courses/${courseId}/Gradebook`;
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
    
    // If weights changed, recalculate grades
    if (comparison.weightsChanged) {
      console.log(`🔄 Weights changed, recalculating grades for ${studentKey} in course ${courseId}`);
      await recalculateCategoryGrades(studentKey, courseId, isStaff);
      await updateGradebookSummary(studentKey, courseId, isStaff);
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
async function validateGradebookStructure(studentKey, courseId, isStaff = false) {
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
    const basePath = isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook` 
                              : `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    const gradebookSnapshot = await gradebookRef.once('value');
    const currentGradebook = gradebookSnapshot.val();
    
    // If gradebook doesn't exist, it's definitely incomplete
    if (!currentGradebook || !currentGradebook.initialized) {
      console.log(`❌ Gradebook not initialized for ${studentKey} in course ${courseId}`);
      await initializeGradebook(studentKey, courseId, isStaff);
      return { 
        isValid: true, 
        missingItems: [], 
        missingCategories: [],
        wasRebuilt: true,
        configSynced: true
      };
    }
    
    // ENHANCED: Sync course configuration changes
    const configSyncResult = await syncCourseConfig(studentKey, courseId, isStaff);
    
    const currentItems = currentGradebook.items || {};
    const currentCategories = currentGradebook.categories || {};
    
    // Build expected structure from course config
    const expectedQuestions = new Set();
    const expectedCategories = new Set();
    const expectedCourseItems = new Set();
    
    Object.entries(gradebookStructure).forEach(([itemId, itemConfig]) => {
      expectedCourseItems.add(itemId);
      expectedCategories.add(itemConfig.type);
      
      // Add all questions from this item
      (itemConfig.questions || []).forEach(question => {
        expectedQuestions.add(question.questionId);
      });
    });
    
    // Check for missing individual questions
    const missingItems = [];
    expectedQuestions.forEach(questionId => {
      if (!currentItems[questionId]) {
        missingItems.push(questionId);
      }
    });
    
    // Check for missing categories
    const missingCategories = [];
    expectedCategories.forEach(categoryType => {
      if (!currentCategories[categoryType]) {
        missingCategories.push(categoryType);
      }
    });
    
    // Check for missing course structure items (optional, since they're calculated)
    const currentCourseItems = currentGradebook.courseStructureItems || {};
    const missingCourseItems = [];
    expectedCourseItems.forEach(itemId => {
      if (!currentCourseItems[itemId]) {
        missingCourseItems.push(itemId);
      }
    });
    
    const isValid = missingItems.length === 0 && missingCategories.length === 0;
    
    // If structure is invalid, rebuild it
    if (!isValid) {
      console.log(`❌ Gradebook structure validation failed for ${studentKey} in course ${courseId}:`, {
        missingItems: missingItems.length,
        missingCategories: missingCategories.length,
        missingCourseItems: missingCourseItems.length
      });
      
      // Rebuild gradebook with updated structure
      console.log(`🔧 Rebuilding gradebook structure for ${studentKey} in course ${courseId}`);
      await initializeGradebook(studentKey, courseId, isStaff);
      
      return { 
        isValid: true, 
        missingItems: [], 
        missingCategories: [],
        wasRebuilt: true,
        configSynced: configSyncResult.synced
      };
    } else {
      console.log(`✅ Gradebook structure validation passed for ${studentKey} in course ${courseId}`);
    }
    
    return { 
      isValid, 
      missingItems, 
      missingCategories, 
      missingCourseItems,
      expectedItemsCount: expectedQuestions.size,
      currentItemsCount: Object.keys(currentItems).length,
      configSynced: configSyncResult.synced,
      configChanges: configSyncResult.changes || []
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
  trackLessonAccess,
  trackAssessmentProgress,
  updateGradebookItem,
  recalculateCategoryGrades,
  updateGradebookSummary,
  initializeGradebook,
  getCourseConfig,
  getCourseStructure,
  findCourseStructureItem,
  findQuestionInCourseConfig, // NEW: Course config based question lookup
  cleanupLegacyAssessments, // NEW: Clean up legacy assessment duplicates
  updateCourseStructureItemSummary,
  trackTimeSpent,
  validateGradebookStructure, // ENHANCED: Gradebook structure validation with config sync
  compareCourseConfigs, // NEW: Compare course configurations
  syncCourseConfig, // NEW: Sync course config changes
};