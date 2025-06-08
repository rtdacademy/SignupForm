/**
 * Shared Database Utilities
 * Standard database operations and utilities used across all assessment types
 */

const admin = require('firebase-admin');
const { sanitizeEmail } = require('../../utils');

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
    isStaff
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
      unitId: lessonInfo.unitId || existing.unitId,
    };
    
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
 * @param {string} itemId - Item ID (assessment ID)
 * @param {number} score - Score earned
 * @param {Object} itemConfig - Item configuration from course structure
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function updateGradebookItem(studentKey, courseId, itemId, score, itemConfig, isStaff = false) {
  try {
    const itemPath = GRADEBOOK_PATHS.gradebookItem(studentKey, courseId, itemId, isStaff);
    const itemRef = admin.database().ref(itemPath);
    
    // Get existing data
    const snapshot = await itemRef.once('value');
    const existing = snapshot.val() || {};
    
    // Find the course structure item this assessment belongs to
    const courseStructureItem = await findCourseStructureItem(courseId, itemId);
    const courseStructureItemId = courseStructureItem?.itemId || itemConfig.courseStructureItemId || 'unknown';
    
    const itemData = {
      title: itemConfig.title || existing.title || itemId,
      type: itemConfig.type || existing.type || courseStructureItem?.type || 'lesson',
      unitId: itemConfig.unitId || existing.unitId || courseStructureItem?.unitId || 'unknown',
      courseStructureItemId: courseStructureItemId, // NEW: Link to course structure
      score: score,
      maxScore: itemConfig.pointsValue || itemConfig.maxScore || score,
      weight: itemConfig.weight || existing.weight || 0,
      attempts: (existing.attempts || 0) + 1,
      lastAttempt: getServerTimestamp(),
      status: 'completed',
      // Enhanced tracking
      timeSpent: itemConfig.timeSpent || existing.timeSpent || 0,
      required: courseStructureItem?.required !== false,
      estimatedTime: courseStructureItem?.estimatedTime || 0
    };
    
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
    
    Object.values(categories).forEach(category => {
      totalEarned += category.earned;
      totalPossible += category.possible;
    });
    
    // Create summary
    const summary = {
      totalPoints: Math.round(totalEarned * 10) / 10,
      possiblePoints: totalPossible,
      percentage: Math.round(overallPercentage * 10) / 10,
      isPassing: overallPercentage >= passingGrade,
      passingGrade: passingGrade,
      lastUpdated: getServerTimestamp(),
      status: 'active',
      weightedScore: Math.round(totalWeightedScore * 10) / 10,
      totalWeight: totalWeight,
    };
    
    // Save summary
    const summaryPath = GRADEBOOK_PATHS.gradebookSummary(studentKey, courseId, isStaff);
    const summaryRef = admin.database().ref(summaryPath);
    await summaryRef.set(summary);
    
    console.log(`📈 Updated gradebook summary: ${overallPercentage.toFixed(1)}% (${summary.isPassing ? 'Passing' : 'Not Passing'})`);
    return summary;
    
  } catch (error) {
    console.error('Error updating gradebook summary:', error);
    throw error;
  }
}

/**
 * Get course configuration (cached)
 */
const courseConfigCache = {};
async function getCourseConfig(courseId) {
  if (courseConfigCache[courseId]) {
    return courseConfigCache[courseId];
  }
  
  try {
    // Load from secure config
    const config = require(`../../courses-config/${courseId}/course-config.json`);
    courseConfigCache[courseId] = config;
    return config;
  } catch (error) {
    console.warn(`Course config not found for ${courseId}, using defaults`);
    return getDefaultCourseConfig();
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
 * Initialize gradebook structure for a new student
 * @param {string} studentKey - Sanitized student email
 * @param {string} courseId - Course ID
 * @param {boolean} isStaff - Whether this is a staff member
 */
async function initializeGradebook(studentKey, courseId, isStaff = false) {
  try {
    const basePath = isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook` 
                              : `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(basePath);
    
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
      courseStructureItems: {}, // NEW: Course structure item summaries
      progress: {
        lessons: {}
      },
      timeTracking: {} // NEW: Time tracking
    });
    
    console.log(`🎓 Initialized gradebook for ${studentKey} in course ${courseId}`);
    
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
    // Try to load from frontend course structure first
    const frontendPath = `../../../src/FirebaseCourses/courses/${courseId}/course-structure.json`;
    try {
      const courseStructure = require(frontendPath);
      return courseStructure.courseStructure || courseStructure;
    } catch (frontendError) {
      console.log(`Frontend course structure not found for ${courseId}, trying backend...`);
    }
    
    // Try backend course structure
    const backendPath = `../../courses/${courseId}/structure.json`;
    const courseStructure = require(backendPath);
    return courseStructure.courseStructure || courseStructure;
    
  } catch (error) {
    console.warn(`Course structure not found for course ${courseId}:`, error.message);
    return {
      units: []
    };
  }
}

/**
 * Find a course structure item by assessment ID
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
    
    // Filter assessments that belong to this course structure item
    const relatedAssessments = Object.entries(items).filter(([assessmentId, item]) => 
      item.courseStructureItemId === courseStructureItemId
    );
    
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
        acc[id] = {
          score: item.score,
          maxScore: item.maxScore,
          percentage: item.percentage,
          timestamp: item.timestamp,
          timeSpent: item.timeSpent
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
  updateCourseStructureItemSummary,
  trackTimeSpent,
};