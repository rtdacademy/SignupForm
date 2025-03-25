import { getDatabase, ref, set } from 'firebase/database';

/**
 * Creates an initial normalized schedule for a student who doesn't have an LMSStudentID yet
 * @param {string} studentKey - Sanitized student email key
 * @param {string} courseId - The course ID
 * @param {object} courseData - The full course data
 * @param {object} studentCourseData - The student's course data
 * @returns {object} The initial normalized schedule
 */
export const createInitialNormalizedSchedule = (studentKey, courseId, courseData, studentCourseData) => {
  if (!courseData?.units || !studentCourseData?.ScheduleJSON?.units) {
    console.error("Missing required course data for initial schedule");
    return null;
  }

  const courseUnits = courseData.units;
  
  // Remove Schedule Information unit
  const scheduleUnits = studentCourseData.ScheduleJSON.units.filter(
    unit => unit.name !== 'Schedule Information'
  );

  if (!scheduleUnits.length) {
    console.warn('No active units found after filtering');
    return null;
  }

  // Create a global index counter
  let globalIndex = 0;
  const allItems = [];

  // Process each unit and its items
  const normalizedUnits = courseUnits.map((courseUnit, unitIndex) => {
    // Find matching schedule unit if it exists
    const scheduleUnit = scheduleUnits.find(u => u.sequence === courseUnit.sequence);

    // Process items in this unit
    const processedItems = courseUnit.items.map(courseItem => {
      // Find matching schedule item
      const scheduleItem = scheduleUnit?.items?.find(i => i.title === courseItem.title);

      // Create the base item with schedule information
      const baseItem = {
        ...courseItem,
        globalIndex: globalIndex++,
        unitIndex,
        unitName: courseUnit.name,
        date: scheduleItem?.date, // Add scheduled date
        weight: courseItem.weight !== undefined
          ? courseItem.weight
          : (courseData.weights ? courseData.weights[courseItem.type] : 1)
      };

      // If this item has LTI enabled, add placeholder info for future assessment data
      if (courseItem.lti?.enabled && courseItem.lti?.deep_link_id) {
        // Initial state - not completed yet
        baseItem.assessment_id = null;
        baseItem.course_id = courseId;
        // We don't add assessmentData to indicate it's not completed
      }

      // Add to all items collection
      allItems.push(baseItem);
      return baseItem;
    });

    return {
      ...courseUnit,
      items: processedItems.filter(Boolean),
    };
  });

  // Create initial schedule adherence metrics
  const scheduleAdherence = {
    currentScheduledIndex: 0,
    currentCompletedIndex: -1, // Nothing completed yet
    lessonsOffset: -1, // Behind by 1 since nothing is completed
    hasInconsistentProgress: false,
    lastCompletedDate: null,
    isOnSchedule: false,
    isAhead: false,
    isBehind: true,
    currentScheduledItem: allItems[0] || null,
    currentCompletedItem: null,
    status: courseData.Status?.Value || 'Default'
  };

  // Calculate initial marks (all zeros since nothing is completed)
  const initialMarks = {
    overall: {
      withZeros: 0,
      omitMissing: 0
    },
    byCategory: {
      lesson: {
        withZeros: 0,
        omitMissing: 0,
        weightAchieved: 0,
        weightPossible: calculateCategoryWeight(allItems, 'lesson'),
        completed: 0,
        total: countItemsByCategory(allItems, 'lesson'),
        items: []
      },
      assignment: {
        withZeros: 0,
        omitMissing: 0,
        weightAchieved: 0,
        weightPossible: calculateCategoryWeight(allItems, 'assignment'),
        completed: 0,
        total: countItemsByCategory(allItems, 'assignment'),
        items: []
      },
      exam: {
        withZeros: 0,
        omitMissing: 0,
        weightAchieved: 0,
        weightPossible: calculateCategoryWeight(allItems, 'exam'),
        completed: 0,
        total: countItemsByCategory(allItems, 'exam'),
        items: []
      }
    }
  };

  const finalResult = {
    units: normalizedUnits,
    scheduleAdherence,
    totalItems: allItems.length,
    weights: courseData.weights,
    marks: initialMarks,
    lastUpdated: Date.now(),
    isInitialSchedule: true // Flag to indicate this is an initial client-generated schedule
  };

  // Save this initial schedule to the database
  saveInitialSchedule(studentKey, courseId, finalResult);

  return finalResult;
};

/**
 * Counts the number of items of a specific category
 */
function countItemsByCategory(items, category) {
  return items.filter(item => item.type === category).length;
}

/**
 * Calculates the total weight for a category
 */
function calculateCategoryWeight(items, category) {
  return items
    .filter(item => item.type === category)
    .reduce((sum, item) => sum + (item.weight || 0), 0);
}

/**
 * Saves the initial schedule to Firebase
 */
async function saveInitialSchedule(studentKey, courseId, schedule) {
  if (!studentKey || !courseId || !schedule) return;

  try {
    const db = getDatabase();
    const normalizedScheduleRef = ref(
      db, 
      `students/${studentKey}/courses/${courseId}/normalizedSchedule`
    );
    
    // Store the timestamp for the sync
    const syncTimestampRef = ref(
      db,
      `studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`
    );
    
    const timestamp = Date.now();
    
    // Set both values in one transaction
    const updates = {};
    updates[`students/${studentKey}/courses/${courseId}/normalizedSchedule`] = schedule;
    updates[`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`] = timestamp;
    
    await set(ref(db), updates);
    
    console.log(`Initial schedule saved for student ${studentKey}, course ${courseId}`);
    
  } catch (error) {
    console.error('Error saving initial schedule:', error);
  }
}