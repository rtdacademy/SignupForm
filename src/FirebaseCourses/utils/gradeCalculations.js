/**
 * Grade Calculation Utilities
 * 
 * Shared functions for calculating grades and progress across Firebase courses.
 * These functions provide reliable grade calculations using the authoritative 
 * data sources: itemStructure, course.Grades.assessments, and course.ExamSessions
 */

import { sanitizeEmail } from '../../utils/sanitizeEmail';

/**
 * Validate that required grade data structures exist
 * @param {Object} course - The course object containing gradebook and grades
 * @returns {Object} - Validation result with valid flag and missing data info
 */
export const validateGradeDataStructures = (course) => {
  const missing = [];
  
  if (!course?.Gradebook?.courseConfig?.gradebook?.itemStructure) {
    missing.push('course.Gradebook.courseConfig.gradebook.itemStructure');
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Get actual grade for a specific question
 * @param {string} questionId - The question ID to get grade for
 * @param {Object} course - The course object containing grades
 * @returns {number} - The actual grade for the question
 */
export const getQuestionGrade = (questionId, course) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    console.warn('Grade data structures missing:', validation.missing);
    return 0;
  }
  
  // Handle case where assessments don't exist yet (new student)
  if (!course?.Grades?.assessments) {
    return 0;
  }
  
  return course.Grades.assessments[questionId] || 0;
};

/**
 * Calculate score for a specific lesson using correct data sources
 * Supports both individual question scoring and session-based scoring
 * @param {string} lessonId - The lesson ID (with hyphens or underscores)
 * @param {Object} course - The course object containing gradebook config and grades
 * @param {string} studentEmail - Student email for session-based scoring (optional)
 * @returns {Object} - Lesson score information including validity
 */
export const calculateLessonScore = (lessonId, course, studentEmail = null) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    console.warn(`Cannot calculate lesson score for ${lessonId} - missing data:`, validation.missing);
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false,
      source: 'unknown'
    };
  }

  const itemStructure = course.Gradebook.courseConfig.gradebook.itemStructure;
  
  // Use lessonId directly (should already be in underscore format)
  let lessonConfig = itemStructure[lessonId];
  
  // Handle ID mapping issues - try to find the correct itemStructure key
  if (!lessonConfig) {
    // Try common transformations for assignment IDs
    if (lessonId.match(/^\d+l\d+_\d+$/)) {
      // Convert "12l5_7" -> "assignment_l5_7"
      const match = lessonId.match(/^\d+l(\d+)_(\d+)$/);
      if (match) {
        const possibleKey = `assignment_l${match[1]}_${match[2]}`;
        if (itemStructure[possibleKey]) {
          console.warn(`ID mismatch: mapping ${lessonId} -> ${possibleKey}`);
          lessonConfig = itemStructure[possibleKey];
        }
      }
    }
  }
  
  if (!lessonConfig) {
    console.warn(`No lesson config found for: ${lessonId}. Available items:`, Object.keys(itemStructure || {}));
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false,
      source: 'unknown'
    };
  }

  // Check if this assessment should use session-based scoring
  if (studentEmail && shouldUseSessionBasedScoring(lessonId, course)) {
    // Check if sessions actually exist
    if (hasSessionBasedScoring(lessonId, course, studentEmail)) {
      return calculateSessionBasedScore(lessonId, course, studentEmail);
    } else {
      // Should use sessions but none exist - return 0 score
      return {
        score: 0,
        total: 0,
        percentage: 0,
        attempted: 0,
        totalQuestions: 0,
        valid: true,
        source: 'session',
        strategy: getSessionScoringStrategy(lessonId, course),
        sessionsCount: 0
      };
    }
  }

  // Fall back to individual question scoring for lessons
  
  if (!lessonConfig.questions) {
    console.warn(`No questions found for lesson: ${lessonId}`);
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false,
      source: 'individual'
    };
  }

  // Handle case where assessments don't exist yet (new student)
  const grades = course.Grades?.assessments || {};
  const submissions = course.Assessments || {};
  let totalScore = 0;
  let totalPossible = 0;
  let attemptedQuestions = 0;
  const totalQuestions = lessonConfig.questions.length;

  lessonConfig.questions.forEach(question => {
    const questionId = question.questionId;
    const maxPoints = question.points || 1;
    const actualGrade = grades[questionId] || 0;
    
    totalPossible += maxPoints;
    
    // Check if student has attempted this question
    let hasAttempted = false;
    
    // First check if there's a grade (even if 0)
    if (grades.hasOwnProperty(questionId)) {
      hasAttempted = true;
      totalScore += actualGrade;
    } 
    // For labs, also check if there's a submission without a grade
    else if (submissions[questionId]) {
      hasAttempted = true;
      // No grade yet, but submission exists - score remains 0 for now
    }
    
    if (hasAttempted) {
      attemptedQuestions += 1;
    }
  });

  const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

  return {
    score: totalScore,
    total: totalPossible,
    percentage,
    attempted: attemptedQuestions,
    totalQuestions,
    valid: true,
    source: 'individual'
  };
};

/**
 * Calculate scores by category (lesson, assignment, exam, lab)
 * @param {Object} course - The course object containing gradebook config and grades
 * @param {string} studentEmail - Student email for session-based scoring (optional)
 * @param {Array} allCourseItems - All course items from course structure (optional, for accurate totals)
 * @returns {Object} - Category scores with totals and percentages
 */
export const calculateCategoryScores = (course, studentEmail = null, allCourseItems = []) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    return {};
  }

  const itemStructure = course.Gradebook.courseConfig.gradebook.itemStructure;
  const categories = {};

  // First, process items that exist in itemStructure (these have grades/attempts)
  Object.entries(itemStructure).forEach(([itemId, itemConfig]) => {
    const itemType = itemConfig.type;
    if (!categories[itemType]) {
      categories[itemType] = {
        score: 0,
        total: 0,
        attemptedScore: 0,
        attemptedTotal: 0,
        attemptedCount: 0,
        completedCount: 0,
        totalCount: 0,
        items: []
      };
    }

    const lessonScore = calculateLessonScore(itemId, course, studentEmail);
    if (lessonScore.valid) {
      categories[itemType].score += lessonScore.score;
      categories[itemType].total += lessonScore.total;
      
      // Only count items with actual points as existing items
      // Items with total: 0 are placeholders and should be treated as missing
      if (lessonScore.total > 0) {
        categories[itemType].totalCount += 1;
      }
      
      // Track attempted work separately
      const hasBeenAttempted = lessonScore.attempted > 0 || 
                               (lessonScore.source === 'session' && lessonScore.sessionsCount > 0);
      
      if (hasBeenAttempted) {
        categories[itemType].attemptedScore += lessonScore.score;
        categories[itemType].attemptedTotal += lessonScore.total;
        categories[itemType].attemptedCount += 1;
      }
      
      // Track completed work separately - different logic for different item types
      let isCompleted = false;
      
      if (itemType === 'lesson') {
        // For lessons, use proper completion requirements (score thresholds, etc.)
        isCompleted = checkLessonCompletion(itemId, course, studentEmail);
      } else {
        // For session-based items (assignments, exams, quizzes), consider completed if session was completed
        if (lessonScore.source === 'session') {
          isCompleted = lessonScore.sessionsCount > 0 && lessonScore.completedSessionsCount > 0;
        } else {
          // For individual question-based non-lesson items, use hasBeenAttempted
          isCompleted = hasBeenAttempted;
        }
      }
      
      if (isCompleted) {
        categories[itemType].completedCount += 1;
      }
      
      categories[itemType].items.push({
        itemId,
        hasBeenAttempted,
        isCompleted,
        ...lessonScore
      });
    }
  });

  // Second, account for items in allCourseItems that don't exist in itemStructure
  if (allCourseItems.length > 0) {
    // Count items by category from allCourseItems
    const categoryItemCounts = {};
    allCourseItems.forEach(courseItem => {
      const categoryType = courseItem.type || 'lesson';
      categoryItemCounts[categoryType] = (categoryItemCounts[categoryType] || 0) + 1;
    });


    // For each category, adjust totals to account for missing items
    Object.entries(categoryItemCounts).forEach(([categoryType, totalItemsInCategory]) => {
      if (!categories[categoryType]) {
        categories[categoryType] = {
          score: 0,
          total: 0,
          attemptedScore: 0,
          attemptedTotal: 0,
          attemptedCount: 0,
          completedCount: 0,
          totalCount: 0,
          items: []
        };
      }

      const currentItemCount = categories[categoryType].totalCount;
      
      if (totalItemsInCategory > currentItemCount) {
        // We have more items in the course structure than in the gradebook
        // Add zeros for the missing items
        const missingItems = totalItemsInCategory - currentItemCount;
        
        // Estimate points per item based on existing items
        const averagePointsPerItem = currentItemCount > 0 ? 
          categories[categoryType].total / currentItemCount : 1;
        
        // Add zero scores for missing items
        const missingTotalPoints = missingItems * averagePointsPerItem;
        categories[categoryType].total += missingTotalPoints;
        categories[categoryType].totalCount = totalItemsInCategory;
      }
    });
  }

  // Calculate percentages for each category
  Object.values(categories).forEach(category => {
    // Overall percentage (includes 0s for unstarted work)
    category.percentage = category.total > 0 ? (category.score / category.total) * 100 : 0;
    
    // Performance percentage (only attempted work)
    category.attemptedPercentage = category.attemptedTotal > 0 
      ? (category.attemptedScore / category.attemptedTotal) * 100 
      : null; // null indicates no work attempted
    
    // Completion percentage (items actually completed vs total items)
    category.completionPercentage = category.totalCount > 0
      ? (category.completedCount / category.totalCount) * 100
      : 0;
      
    // Attempted percentage (items started vs total items) 
    category.attemptedItemsPercentage = category.totalCount > 0
      ? (category.attemptedCount / category.totalCount) * 100
      : 0;
  });

  return categories;
};

/**
 * Flatten course structure units to get all course items
 * @param {Object} course - The course object containing gradebook or courseStructure
 * @returns {Array} - Flattened array of all course items
 */
export const getAllCourseItems = (course) => {
  const items = [];
  
  // Get course structure from the most reliable source
  let unitsList = [];
  
  // First priority: check gradebook courseConfig courseStructure (database-driven from backend config)
  if (course.Gradebook?.courseConfig?.courseStructure?.units) {
    unitsList = course.Gradebook.courseConfig.courseStructure.units;
  }
  // Second priority: check gradebook courseStructure (legacy database path)
  else if (course.Gradebook?.courseStructure?.units) {
    unitsList = course.Gradebook.courseStructure.units;
  }
  // Third priority: check direct courseStructure path (legacy JSON file approach)
  else if (course.courseStructure?.structure) {
    unitsList = course.courseStructure.structure;
  }
  else if (course.courseStructure?.units) {
    unitsList = course.courseStructure.units;
  }
  
  unitsList.forEach(unit => {
    if (unit.items && Array.isArray(unit.items)) {
      items.push(...unit.items);
    }
  });
  
  return items;
};

/**
 * Check if lesson meets completion requirements using reliable data
 * @param {string} lessonId - The lesson ID
 * @param {Object} course - The course object
 * @param {string} studentEmail - Student email for session-based scoring
 * @returns {boolean} - Whether lesson meets completion requirements
 */
export const checkLessonCompletion = (lessonId, course, studentEmail = null) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    return false;
  }
  
  // Check for manual completion status first (overrides score-based completion)
  const gradebook = course?.Gradebook;
  const courseStructureItem = gradebook?.courseStructureItems?.[lessonId];
  const gradebookItem = gradebook?.items?.[lessonId];
  
  // If manually graded or explicitly marked as completed, consider it complete
  if (courseStructureItem?.completed || 
      gradebookItem?.status === 'completed' || 
      gradebookItem?.status === 'manually_graded') {
    return true;
  }
  
  const progressionRequirements = course.courseDetails?.progressionRequirements || {};
  const lessonScore = calculateLessonScore(lessonId, course, studentEmail);
  
  if (!lessonScore.valid) {
    return false;
  }
  
  // Get completion requirements for this lesson using new structure
  const itemStructure = course.Gradebook?.courseConfig?.gradebook?.itemStructure;
  const itemConfig = itemStructure?.[lessonId];
  const itemType = itemConfig?.type || 'lesson';
  
  const lessonOverride = progressionRequirements.lessonOverrides?.[lessonId];
  const defaultCriteria = progressionRequirements.defaultCriteria?.[itemType] || {};
  
  const minimumPercentage = lessonOverride?.minimumPercentage ?? defaultCriteria.minimumPercentage ?? 50;
  const requireAllQuestions = lessonOverride?.requireAllQuestions ?? defaultCriteria.requireAllQuestions ?? false;
  
  const completionRate = lessonScore.totalQuestions > 0 ? (lessonScore.attempted / lessonScore.totalQuestions) * 100 : 0;
  const averageScore = lessonScore.percentage;
  
  let isCompleted = false;
  if (requireAllQuestions) {
    // Must attempt all questions AND meet minimum score
    isCompleted = completionRate >= 100 && averageScore >= minimumPercentage;
  } else {
    // Only need to meet minimum score (allows partial completion)
    isCompleted = averageScore >= minimumPercentage;
  }
  
  return isCompleted;
};

/**
 * SESSION-BASED SCORING FUNCTIONS
 * Functions for handling exam sessions and multiple attempts
 */

/**
 * Find all completed exam sessions for a specific assessment and student
 * @param {string} assessmentId - The assessment ID (e.g., "assignment_l1_3")
 * @param {Object} course - The course object containing ExamSessions
 * @param {string} studentEmail - Student email address
 * @returns {Array} - Array of completed session objects
 */
export const findAssessmentSessions = (assessmentId, course, studentEmail) => {
  if (!course.ExamSessions || !studentEmail) {
    return [];
  }
  
  const sanitizedEmail = sanitizeEmail(studentEmail);
  const sessions = [];
  
  Object.entries(course.ExamSessions).forEach(([sessionId, sessionData]) => {
    // Check if session matches criteria:
    // 1. Same examItemId (assessment)
    // 2. Any status (completed, in_progress, exited)
    // 3. Session key contains sanitized email
    if (sessionData.examItemId === assessmentId && 
        sessionId.includes(sanitizedEmail)) {
      // Calculate progress within the session based on responses
      const totalQuestions = sessionData.questions?.length || 0;
      const answeredQuestions = Object.keys(sessionData.responses || {}).length;
      const sessionProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      
      // Add progress info to session data
      sessions.push({
        ...sessionData,
        sessionId: sessionId,
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions,
        sessionProgress: sessionProgress
      });
    }
  });
  
  // Sort by last updated time (newest first)
  sessions.sort((a, b) => (b.lastUpdated || b.completedAt || 0) - (a.lastUpdated || a.completedAt || 0));
  
  return sessions;
};

/**
 * Get session scoring strategy for an assessment
 * @param {string} assessmentId - The assessment ID
 * @param {Object} course - The course object containing gradebook config
 * @returns {string} - Scoring strategy: "takeHighest", "latest", or "average"
 */
export const getSessionScoringStrategy = (assessmentId, course) => {
  const itemStructure = course.Gradebook?.courseConfig?.gradebook?.itemStructure;
  
  if (!itemStructure || !itemStructure[assessmentId]) {
    return 'takeHighest'; // Default fallback
  }
  
  return itemStructure[assessmentId].assessmentSettings?.sessionScoring || 'takeHighest';
};

/**
 * Apply scoring strategy to select which session to use
 * @param {Array} sessions - Array of completed session objects
 * @param {string} strategy - Scoring strategy: "takeHighest", "latest", or "average"
 * @returns {Object} - Selected session data or calculated average
 */
export const aggregateSessionScores = (sessions, strategy) => {
  if (sessions.length === 0) {
    return null;
  }
  
  if (sessions.length === 1) {
    return sessions[0];
  }
  
  switch (strategy) {
    case 'takeHighest':
      return sessions.reduce((best, current) => 
        current.finalResults.percentage > best.finalResults.percentage ? current : best
      );
      
    case 'latest':
      return sessions.reduce((latest, current) => 
        current.completedAt > latest.completedAt ? current : latest
      );
      
    case 'average':
      // Calculate average and return a synthetic session object
      const totalPercentage = sessions.reduce((sum, session) => sum + session.finalResults.percentage, 0);
      const totalScore = sessions.reduce((sum, session) => sum + session.finalResults.score, 0);
      const avgPercentage = totalPercentage / sessions.length;
      const avgScore = totalScore / sessions.length;
      
      // Return a synthetic session with averaged results
      return {
        ...sessions[0], // Use first session as template
        finalResults: {
          ...sessions[0].finalResults,
          percentage: avgPercentage,
          score: avgScore
        },
        attemptNumber: `avg-of-${sessions.length}`,
        completedAt: Math.max(...sessions.map(s => s.completedAt))
      };
      
    default:
      // Default to takeHighest
      return sessions.reduce((best, current) => 
        current.finalResults.percentage > best.finalResults.percentage ? current : best
      );
  }
};

/**
 * Check if an assessment SHOULD use session-based scoring (based on type/config)
 * @param {string} assessmentId - The assessment ID
 * @param {Object} course - The course object
 * @returns {boolean} - True if this assessment should use session-based scoring
 */
export const shouldUseSessionBasedScoring = (assessmentId, course) => {
  const itemStructure = course.Gradebook?.courseConfig?.gradebook?.itemStructure;
  
  if (!itemStructure || !itemStructure[assessmentId]) {
    return false;
  }
  
  const itemConfig = itemStructure[assessmentId];
  
  // Check if explicitly configured for session scoring
  if (itemConfig.assessmentSettings?.sessionScoring) {
    return true;
  }
  
  // Check item type - assignments, exams, quizzes should use sessions
  const itemType = itemConfig.type;
  return itemType === 'assignment' || itemType === 'exam' || itemType === 'quiz';
};

/**
 * Check if an assessment has session-based scoring (completed exam sessions exist)
 * @param {string} assessmentId - The assessment ID
 * @param {Object} course - The course object
 * @param {string} studentEmail - Student email address
 * @returns {boolean} - True if sessions exist for this assessment
 */
export const hasSessionBasedScoring = (assessmentId, course, studentEmail) => {
  const sessions = findAssessmentSessions(assessmentId, course, studentEmail);
  return sessions.length > 0;
};

/**
 * Calculate score using session-based data
 * @param {string} assessmentId - The assessment ID
 * @param {Object} course - The course object
 * @param {string} studentEmail - Student email address
 * @returns {Object} - Score information from session data
 */
export const calculateSessionBasedScore = (assessmentId, course, studentEmail) => {
  const sessions = findAssessmentSessions(assessmentId, course, studentEmail);
  
  if (sessions.length === 0) {
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false,
      source: 'session'
    };
  }
  
  const strategy = getSessionScoringStrategy(assessmentId, course);
  
  // Check for teacher-created manual grade sessions first
  const teacherManualSessions = sessions.filter(session => 
    session.isTeacherCreated && 
    session.useAsManualGrade && 
    session.status === 'completed' && 
    session.finalResults
  );
  
  // If there's a teacher-created manual grade session, use it
  if (teacherManualSessions.length > 0) {
    const teacherSession = teacherManualSessions[0]; // Use the first (most recent) teacher session
    return {
      score: teacherSession.finalResults.score,
      total: teacherSession.finalResults.maxScore,
      percentage: teacherSession.finalResults.percentage,
      attempted: sessions.filter(s => !s.isTeacherCreated).length, // Only count student attempts
      totalQuestions: teacherSession.finalResults.totalQuestions,
      valid: true,
      source: 'session',
      strategy: 'teacher_manual',
      sessionsCount: sessions.length, // Include teacher session in count so UI knows sessions exist
      completedSessionsCount: sessions.filter(s => s.status === 'completed').length,
      sessionStatus: 'completed',
      sessionProgress: 100,
      isTeacherGraded: true,
      studentSessionsCount: sessions.filter(s => !s.isTeacherCreated).length // Separate count for student sessions
    };
  }
  
  // Filter completed sessions for normal scoring strategy (exclude teacher sessions)
  const studentSessions = sessions.filter(session => !session.isTeacherCreated);
  const completedSessions = studentSessions.filter(session => session.status === 'completed' && session.finalResults);
  
  if (completedSessions.length === 0) {
    // No completed student sessions, but sessions exist - return progress info
    const latestStudentSession = studentSessions[0]; // Most recent student session
    if (latestStudentSession) {
      return {
        score: 0,
        total: latestStudentSession.totalQuestions || 0,
        percentage: 0,
        attempted: latestStudentSession.answeredQuestions || 0,
        totalQuestions: latestStudentSession.totalQuestions || 0,
        valid: true,
        source: 'session',
        strategy: strategy,
        sessionsCount: sessions.length,
        sessionStatus: latestStudentSession.status,
        sessionProgress: latestStudentSession.sessionProgress || 0,
        studentSessionsCount: studentSessions.length
      };
    } else {
      // Only teacher sessions exist, but none are completed - return zero
      return {
        score: 0,
        total: 0,
        percentage: 0,
        attempted: 0,
        totalQuestions: 0,
        valid: true,
        source: 'session',
        strategy: strategy,
        sessionsCount: sessions.length, // Include teacher sessions in count
        sessionStatus: 'not_started',
        sessionProgress: 0,
        studentSessionsCount: 0
      };
    }
  }
  
  // Use completed sessions for scoring
  const selectedSession = aggregateSessionScores(completedSessions, strategy);
  
  return {
    score: selectedSession.finalResults.score,
    total: selectedSession.finalResults.maxScore,
    percentage: selectedSession.finalResults.percentage,
    attempted: studentSessions.length, // Total number of student attempts (including incomplete)
    totalQuestions: selectedSession.finalResults.totalQuestions,
    valid: true,
    source: 'session',
    strategy: strategy,
    sessionsCount: sessions.length, // Total sessions including teacher sessions
    completedSessionsCount: completedSessions.length + teacherManualSessions.length,
    sessionStatus: studentSessions[0]?.status || 'not_started', // Status of most recent student session
    sessionProgress: studentSessions[0]?.sessionProgress || 0,
    studentSessionsCount: studentSessions.length // Separate count for student sessions
  };
};