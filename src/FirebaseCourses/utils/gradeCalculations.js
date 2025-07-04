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
  if (!course?.Gradebook?.courseConfig?.weights) {
    missing.push('course.Gradebook.courseConfig.weights');
  }
  if (!course?.Grades?.assessments) {
    missing.push('course.Grades.assessments');
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
    console.warn('Cannot calculate lesson score - missing data:', validation.missing);
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
  
  // Convert lesson ID format: "01-physics-20-review" -> "01_physics_20_review"
  const normalizedLessonId = lessonId.replace(/-/g, '_');
  const lessonConfig = itemStructure[normalizedLessonId];
  
  if (!lessonConfig) {
    console.warn(`No lesson config found for: ${normalizedLessonId}`);
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

  // Check if this assessment has session-based scoring
  if (studentEmail && hasSessionBasedScoring(normalizedLessonId, course, studentEmail)) {
    console.log(`🎯 Using session-based scoring for ${normalizedLessonId}`);
    return calculateSessionBasedScore(normalizedLessonId, course, studentEmail);
  }

  // Fall back to individual question scoring
  console.log(`📝 Using individual question scoring for ${normalizedLessonId}`);
  
  if (!lessonConfig.questions) {
    console.warn(`No questions found for lesson: ${normalizedLessonId}`);
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

  const grades = course.Grades.assessments;
  let totalScore = 0;
  let totalPossible = 0;
  let attemptedQuestions = 0;
  const totalQuestions = lessonConfig.questions.length;

  lessonConfig.questions.forEach(question => {
    const questionId = question.questionId;
    const maxPoints = question.points || 1;
    const actualGrade = grades[questionId] || 0;
    
    totalPossible += maxPoints;
    
    // If grade exists (even if 0), student has attempted
    if (grades.hasOwnProperty(questionId)) {
      attemptedQuestions += 1;
      totalScore += actualGrade;
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
 * @returns {Object} - Category scores with totals and percentages
 */
export const calculateCategoryScores = (course, studentEmail = null) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    return {};
  }

  const itemStructure = course.Gradebook.courseConfig.gradebook.itemStructure;
  const categories = {};

  Object.entries(itemStructure).forEach(([itemId, itemConfig]) => {
    const itemType = itemConfig.type;
    if (!categories[itemType]) {
      categories[itemType] = {
        score: 0,
        total: 0,
        attemptedScore: 0,
        attemptedTotal: 0,
        attemptedCount: 0,
        totalCount: 0,
        items: []
      };
    }

    const lessonScore = calculateLessonScore(itemId, course, studentEmail);
    if (lessonScore.valid) {
      categories[itemType].score += lessonScore.score;
      categories[itemType].total += lessonScore.total;
      categories[itemType].totalCount += 1;
      
      // Track attempted work separately
      const hasBeenAttempted = lessonScore.attempted > 0 || 
                               (lessonScore.source === 'session' && lessonScore.sessionsCount > 0);
      
      if (hasBeenAttempted) {
        categories[itemType].attemptedScore += lessonScore.score;
        categories[itemType].attemptedTotal += lessonScore.total;
        categories[itemType].attemptedCount += 1;
      }
      
      categories[itemType].items.push({
        itemId,
        hasBeenAttempted,
        ...lessonScore
      });
    }
  });

  // Calculate percentages for each category
  Object.values(categories).forEach(category => {
    // Overall percentage (includes 0s for unstarted work)
    category.percentage = category.total > 0 ? (category.score / category.total) * 100 : 0;
    
    // Performance percentage (only attempted work)
    category.attemptedPercentage = category.attemptedTotal > 0 
      ? (category.attemptedScore / category.attemptedTotal) * 100 
      : null; // null indicates no work attempted
    
    // Completion percentage
    category.completionPercentage = category.totalCount > 0
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
  
  const progressionRequirements = course.Gradebook.courseConfig.progressionRequirements || {};
  const lessonScore = calculateLessonScore(lessonId, course, studentEmail);
  
  if (!lessonScore.valid) {
    return false;
  }
  
  // Get completion requirements for this lesson
  const normalizedLessonId = lessonId.replace(/-/g, '_');
  const requirements = progressionRequirements.lessonOverrides?.[normalizedLessonId] || 
                      progressionRequirements.lessonOverrides?.[lessonId] ||
                      progressionRequirements.defaultCriteria || {};
  
  const minimumPercentage = requirements.minimumPercentage || 50;
  const requireAllQuestions = requirements.requireAllQuestions !== false;
  
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
    // 2. Completed status
    // 3. Session key contains sanitized email
    if (sessionData.examItemId === assessmentId && 
        sessionData.status === 'completed' &&
        sessionId.includes(sanitizedEmail) &&
        sessionData.finalResults) {
      sessions.push(sessionData);
    }
  });
  
  // Sort by completion time (newest first)
  sessions.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  
  return sessions;
};

/**
 * Get session scoring strategy for an assessment
 * @param {string} assessmentId - The assessment ID
 * @param {Object} course - The course object containing gradebook config
 * @returns {string} - Scoring strategy: "takeHighest", "latest", or "average"
 */
export const getSessionScoringStrategy = (assessmentId, course) => {
  const normalizedAssessmentId = assessmentId.replace(/-/g, '_');
  const itemStructure = course.Gradebook?.courseConfig?.gradebook?.itemStructure;
  
  if (!itemStructure || !itemStructure[normalizedAssessmentId]) {
    return 'takeHighest'; // Default fallback
  }
  
  return itemStructure[normalizedAssessmentId].assessmentSettings?.sessionScoring || 'takeHighest';
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
  const selectedSession = aggregateSessionScores(sessions, strategy);
  
  return {
    score: selectedSession.finalResults.score,
    total: selectedSession.finalResults.maxScore,
    percentage: selectedSession.finalResults.percentage,
    attempted: sessions.length, // Number of attempts made
    totalQuestions: selectedSession.finalResults.totalQuestions,
    valid: true,
    source: 'session',
    strategy: strategy,
    sessionsCount: sessions.length
  };
};