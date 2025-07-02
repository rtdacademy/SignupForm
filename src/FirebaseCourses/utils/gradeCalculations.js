/**
 * Grade Calculation Utilities
 * 
 * Shared functions for calculating grades and progress across Firebase courses.
 * These functions provide reliable grade calculations using the authoritative 
 * data sources: itemStructure and course.Grades.assessments
 */

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
 * @param {string} lessonId - The lesson ID (with hyphens or underscores)
 * @param {Object} course - The course object containing gradebook config and grades
 * @returns {Object} - Lesson score information including validity
 */
export const calculateLessonScore = (lessonId, course) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    console.warn('Cannot calculate lesson score - missing data:', validation.missing);
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false
    };
  }

  const itemStructure = course.Gradebook.courseConfig.gradebook.itemStructure;
  const grades = course.Grades.assessments;
  
  // Convert lesson ID format: "01-physics-20-review" -> "01_physics_20_review"
  const normalizedLessonId = lessonId.replace(/-/g, '_');
  const lessonConfig = itemStructure[normalizedLessonId];
  
  if (!lessonConfig || !lessonConfig.questions) {
    console.warn(`No lesson config found for: ${normalizedLessonId}`);
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false
    };
  }

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
    valid: true
  };
};

/**
 * Calculate scores by category (lesson, assignment, exam, lab)
 * @param {Object} course - The course object containing gradebook config and grades
 * @returns {Object} - Category scores with totals and percentages
 */
export const calculateCategoryScores = (course) => {
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
        items: []
      };
    }

    const lessonScore = calculateLessonScore(itemId, course);
    if (lessonScore.valid) {
      categories[itemType].score += lessonScore.score;
      categories[itemType].total += lessonScore.total;
      categories[itemType].items.push({
        itemId,
        ...lessonScore
      });
    }
  });

  // Calculate percentages for each category
  Object.values(categories).forEach(category => {
    category.percentage = category.total > 0 ? (category.score / category.total) * 100 : 0;
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
 * @returns {boolean} - Whether lesson meets completion requirements
 */
export const checkLessonCompletion = (lessonId, course) => {
  const validation = validateGradeDataStructures(course);
  if (!validation.valid) {
    return false;
  }
  
  const progressionRequirements = course.Gradebook.courseConfig.progressionRequirements || {};
  const lessonScore = calculateLessonScore(lessonId, course);
  
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