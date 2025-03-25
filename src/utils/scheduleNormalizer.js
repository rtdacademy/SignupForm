import pako from 'pako';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { STATUS_OPTIONS } from '../config/DropdownOptions';

// Store active listeners to prevent memory leaks
const activeListeners = new Map();


const calculateCourseMarks = (normalizedUnits, weights) => {
  // Initialize marks structure
  const marks = {
    overall: {
      withZeros: 0,
      omitMissing: 0
    },
    byCategory: {
      lesson: {
        withZeros: 0,
        omitMissing: 0,
        weightAchieved: 0,
        weightPossible: 0,
        completed: 0,
        total: 0,
        items: []
      },
      assignment: {
        withZeros: 0,
        omitMissing: 0,
        weightAchieved: 0,
        weightPossible: 0,
        completed: 0,
        total: 0,
        items: []
      },
      exam: {
        withZeros: 0,
        omitMissing: 0,
        weightAchieved: 0,
        weightPossible: 0,
        completed: 0,
        total: 0,
        items: []
      }
    }
  };

  // First pass: Collect all items and their weights by category
  normalizedUnits.forEach(unit => {
    unit.items.forEach(item => {
      const category = item.type;
      const categoryStats = marks.byCategory[category];
      
      // Track total items per category
      categoryStats.total++;
      
      // Get item completion info
      const isCompleted = item.assessmentData != null;
      const score = isCompleted ? item.assessmentData.scorePercent / 100 : 0;
      const weight = item.weight || 0; // Ensure weight is never undefined

      // Store item data
      categoryStats.items.push({
        isCompleted,
        score,
        weight
      });

      // Track category totals
      categoryStats.weightPossible += weight;
      
      if (isCompleted) {
        categoryStats.completed++;
        categoryStats.weightAchieved += (score * weight);
      }
    });
  });

  // Calculate category marks
  Object.keys(marks.byCategory).forEach(category => {
    const stats = marks.byCategory[category];
    
    // Calculate withZeros - handle division by zero
    stats.withZeros = stats.weightPossible > 0 
      ? (stats.weightAchieved / stats.weightPossible) * 100 
      : 0;

    // Calculate omitMissing - handle zero completed items
    if (stats.completed > 0) {
      const completedItemsWeight = stats.items
        .filter(item => item.isCompleted)
        .reduce((sum, item) => sum + (item.weight || 0), 0);

      // Only calculate if we have valid weights
      if (completedItemsWeight > 0) {
        const weightedSum = stats.items
          .filter(item => item.isCompleted)
          .reduce((sum, item) => {
            const adjustedWeight = (item.weight || 0) / completedItemsWeight;
            return sum + (item.score * adjustedWeight);
          }, 0);

        stats.omitMissing = weightedSum * 100;
      } else {
        stats.omitMissing = 0;
      }
    } else {
      stats.omitMissing = 0;
    }
  });

  // Calculate overall marks
  let totalWeightAchieved = 0;
  let totalWeightPossible = 0;
  let overallCompletedItems = [];
  
  // Collect all completed items across categories, handling zero weights
  Object.entries(weights || {}).forEach(([category, categoryWeight]) => {
    const categoryStats = marks.byCategory[category];
    // Skip categories with zero weight
    if (categoryWeight <= 0) return;
    
    categoryStats.items.forEach(item => {
      if (item.isCompleted) {
        overallCompletedItems.push({
          ...item,
          categoryWeight
        });
      }
      
      // For withZeros calculation
      totalWeightAchieved += (item.isCompleted ? item.score * (item.weight || 0) : 0) * categoryWeight;
      totalWeightPossible += (item.weight || 0) * categoryWeight;
    });
  });

  // Calculate withZeros - handle division by zero
  marks.overall.withZeros = totalWeightPossible > 0 
    ? (totalWeightAchieved / totalWeightPossible) * 100 
    : 0;

  // Calculate omitMissing - handle zero completed items
  if (overallCompletedItems.length > 0) {
    const totalCompletedWeight = overallCompletedItems.reduce((sum, item) => 
      sum + ((item.weight || 0) * (item.categoryWeight || 0)), 0);

    if (totalCompletedWeight > 0) {
      const weightedSum = overallCompletedItems.reduce((sum, item) => {
        const adjustedWeight = ((item.weight || 0) * (item.categoryWeight || 0)) / totalCompletedWeight;
        return sum + (item.score * adjustedWeight);
      }, 0);

      marks.overall.omitMissing = weightedSum * 100;
    } else {
      marks.overall.omitMissing = 0;
    }
  } else {
    marks.overall.omitMissing = 0;
  }

  // Final safety check to ensure no NaN values
  Object.keys(marks.overall).forEach(key => {
    if (isNaN(marks.overall[key])) {
      marks.overall[key] = 0;
    }
  });

  Object.keys(marks.byCategory).forEach(category => {
    Object.keys(marks.byCategory[category]).forEach(key => {
      if (typeof marks.byCategory[category][key] === 'number' && isNaN(marks.byCategory[category][key])) {
        marks.byCategory[category][key] = 0;
      }
    });
  });

  return marks;
};

export default calculateCourseMarks;


/**
 * Decompresses base64 encoded data
 */
const decompressData = async (base64String) => {
  if (!base64String) return null;

  try {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const decompressed = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
};

/**
 * Fetches LTI deep link information
 */
const fetchLtiDeepLinkInfo = async (deep_link_id) => {
  console.group(`Fetching LTI Info for ${deep_link_id}`);
  if (!deep_link_id) {
    console.warn('No deep_link_id provided');
    console.groupEnd();
    return null;
  }

  const db = getDatabase();
  const deepLinkRef = ref(db, `lti/deep_links/${deep_link_id}`);

  try {
    const snapshot = await get(deepLinkRef);
    console.log('LTI Info snapshot exists:', snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('LTI Info data:', data);
      console.groupEnd();
      return {
        url: data.url,
        assessment_id: data.assessment_id,
        course_id: data.course_id,
        scoreMaximum: data.lineItem?.scoreMaximum,
      };
    }
  } catch (error) {
    console.error(`Error fetching LTI info:`, error);
  }
  console.groupEnd();
  return null;
};

/**
 * Fetches assessment grades
 */
const fetchAssessmentGrades = async (assessment_id, LMSStudentID) => {
  console.group(`Fetching Assessment Grades`);
  console.log('Parameters:', { assessment_id, LMSStudentID });
  
  if (!assessment_id || !LMSStudentID) {
    console.warn('Missing required parameters');
    console.groupEnd();
    return null;
  }

  const db = getDatabase();
  const gradesRef = ref(db, `imathas_grades/${assessment_id}_${LMSStudentID}`);
  console.log('Grades path:', `imathas_grades/${assessment_id}_${LMSStudentID}`);

  try {
    const snapshot = await get(gradesRef);
    console.log('Grades snapshot exists:', snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Grade data:', data);
      console.groupEnd();
      return data;
    }
  } catch (error) {
    console.error(`Error fetching grades:`, error);
  }
  console.groupEnd();
  return null;
};

/**
 * Processes assessment data with grades and LTI info
 */
const processAssessmentData = async (assessmentGrades, ltiInfo, baseItem) => {
  if (!assessmentGrades || !ltiInfo) return null;

  const scoreMaximum = parseFloat(ltiInfo.scoreMaximum);
  const score = parseFloat(assessmentGrades.score);
  const scorePercent = scoreMaximum > 0 ? ((score / scoreMaximum) * 100).toFixed(1) : 0;

  if (assessmentGrades.scoreddata) {
    assessmentGrades.scoreddata = await decompressData(assessmentGrades.scoreddata);
  }

  return {
    ...baseItem,
    url: ltiInfo.url,
    assessment_id: ltiInfo.assessment_id,
    course_id: ltiInfo.course_id,
    scoreMaximum: ltiInfo.scoreMaximum,
    assessmentData: {
      ...assessmentGrades,
      scoreMaximum,
      scorePercent: parseFloat(scorePercent),
      score,
      status: assessmentGrades.status,
      startTime: assessmentGrades.startTime,
      timeOnTask: assessmentGrades.timeOnTask,
      lastChange: assessmentGrades.lastChange,
      
      version: assessmentGrades.version,
    },
  };
};

/**
 * Calculates schedule adherence metrics
 */
const calculateScheduleAdherence = (allItems) => {
  const today = new Date();
  let currentScheduledIndex = -1;
  let currentCompletedIndex = -1;
  let hasInconsistentProgress = false;
  let lastCompletedDate = null;

  for (let i = 0; i < allItems.length; i++) {
    const itemDate = new Date(allItems[i].date);
    if (itemDate > today) {
      currentScheduledIndex = Math.max(0, i - 1);
      break;
    }
  }

  if (currentScheduledIndex === -1) {
    currentScheduledIndex = allItems.length - 1;
  }

  let previouslyCompleted = true;
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const isCompleted = !!item.assessmentData;

    if (isCompleted) {
      currentCompletedIndex = i;
      lastCompletedDate = new Date(item.assessmentData.lastChange * 1000);

      if (!previouslyCompleted) {
        hasInconsistentProgress = true;
      }
    } else {
      previouslyCompleted = false;
    }
  }

  const lessonsOffset = currentCompletedIndex - currentScheduledIndex;

  return {
    currentScheduledIndex,
    currentCompletedIndex,
    lessonsOffset,
    hasInconsistentProgress,
    lastCompletedDate,
    isOnSchedule: lessonsOffset === 0,
    isAhead: lessonsOffset > 0,
    isBehind: lessonsOffset < 0,
    currentScheduledItem: allItems[currentScheduledIndex],
    currentCompletedItem: allItems[currentCompletedIndex],
  };
};


/**
 * Validates the schedule structure against course units
 */
export const validateScheduleStructure = (normalizedSchedule, courseUnits) => {
  if (!normalizedSchedule || !courseUnits) {
    return {
      isValid: false,
      reason: 'Missing required data',
      details: 'Normalized schedule or course units is null or undefined',
    };
  }

  if (normalizedSchedule.units.length !== courseUnits.length) {
    return {
      isValid: false,
      reason: 'Unit count mismatch',
      details: `Schedule has ${normalizedSchedule.units.length} units, course has ${courseUnits.length} units`,
    };
  }

  // Create a map of course unit items by name for easier comparison
  const courseUnitMap = new Map();
  courseUnits.forEach(unit => {
    courseUnitMap.set(unit.name, unit);
  });

  // Compare each unit with its corresponding course unit
  for (const scheduleUnit of normalizedSchedule.units) {
    const courseUnit = courseUnitMap.get(scheduleUnit.name);
    
    if (!courseUnit) {
      return {
        isValid: false,
        reason: 'Missing unit data',
        details: `Course is missing unit: ${scheduleUnit.name}`,
      };
    }

    // Compare items count
    if (scheduleUnit.items.length !== courseUnit.items.length) {
      return {
        isValid: false,
        reason: 'Item count mismatch',
        details: `Unit "${courseUnit.name}" has ${courseUnit.items.length} items in course but ${scheduleUnit.items.length} items in schedule`,
      };
    }

    // Verify item titles match
    for (let i = 0; i < scheduleUnit.items.length; i++) {
      if (scheduleUnit.items[i].title !== courseUnit.items[i].title) {
        return {
          isValid: false,
          reason: 'Item mismatch',
          details: `Item mismatch in unit "${courseUnit.name}": "${scheduleUnit.items[i].title}" vs "${courseUnit.items[i].title}"`,
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Main schedule normalization function
 */
export const normalizeScheduleData = async (
  scheduleUnits,
  courseData,
  LMSStudentID,
  studentEmailKey,
  courseId,
  onUpdate,
  globalWeights
) => {
  const courseUnits = courseData.units;
  console.group('Schedule Normalization');
  console.log('Input scheduleUnits:', scheduleUnits);

  if (!scheduleUnits || !courseUnits || !LMSStudentID) {
    console.warn('Missing required parameters for schedule normalization');
    console.groupEnd();
    return null;
  }

  // Remove Schedule Information unit and get first real unit
  const activeUnits = scheduleUnits.filter(unit => unit.name !== 'Schedule Information');
  if (!activeUnits.length) {
    console.warn('No active units found after filtering');
    console.groupEnd();
    return null;
  }

  // Get current position in course
  const currentUnitSequence = activeUnits[0].sequence;
  const currentItemSequence = activeUnits[0].items[0].sequence;
  
  let globalIndex = 0;
  const allItems = [];

  const result = await Promise.all(
    courseUnits.map(async (courseUnit, unitIndex) => {
      // Find matching schedule unit if it exists
      const scheduleUnit = activeUnits.find(u => u.sequence === courseUnit.sequence);

      // Process items based on unit status
      const processedItems = await Promise.all(
        courseUnit.items.map(async (courseItem, itemIndex) => {
          console.group(`Processing Item: ${courseItem.title}`);
          
          // Find matching schedule item
          const scheduleItem = scheduleUnit?.items?.find(i => i.title === courseItem.title);
          console.log('Found schedule item:', scheduleItem);

          // Initialize base item from course data with schedule information
          const baseItem = {
            ...courseItem,
            globalIndex: globalIndex++,
            unitIndex,
            unitName: courseUnit.name,
            date: scheduleItem?.date, // Add scheduled date
            weight: courseItem.weight !== undefined
              ? courseItem.weight
              : (globalWeights ? globalWeights[courseItem.type] : 1)
          };

          // If this item has LTI enabled, process its data
          if (courseItem.lti?.enabled && courseItem.lti?.deep_link_id) {
            const ltiInfo = await fetchLtiDeepLinkInfo(courseItem.lti.deep_link_id);

            if (ltiInfo) {
              const initialGrades = await fetchAssessmentGrades(
                ltiInfo.assessment_id,
                LMSStudentID
              );

              if (initialGrades) {
                const processedItem = await processAssessmentData(
                  initialGrades,
                  ltiInfo,
                  baseItem // Now includes schedule date
                );

                if (processedItem) {
                  allItems.push(processedItem);
                  if (onUpdate) {
                    onUpdate(unitIndex, itemIndex, processedItem);
                  }
                  console.groupEnd();
                  return processedItem;
                }
              }
            }
          }

          // Add to all items and return
          console.log('Returning base item with date:', baseItem.date);
          allItems.push(baseItem);
          console.groupEnd();
          return baseItem;
        })
      );

      return {
        ...courseUnit,
        items: processedItems.filter(Boolean),
      };
    })
  );

  const filteredResult = result.filter(Boolean);

  // Calculate schedule adherence across all items
  const scheduleAdherence = calculateScheduleAdherence(allItems);

  // Get status and alert level from courseData
  const currentStatus = courseData.Status?.Value || 'Default';
  const statusOption = STATUS_OPTIONS.find(option => option.value === currentStatus);
  const alertLevel = statusOption?.alertLevel || 'yellow';

  // Add status and alert level to schedule adherence
  scheduleAdherence.status = currentStatus;
  scheduleAdherence.alertLevel = alertLevel;

  const finalResult = {
    units: filteredResult,
    scheduleAdherence,
    totalItems: allItems.length,
    weights: courseData.weights,
    marks: calculateCourseMarks(filteredResult, courseData.weights)
  };

  console.groupEnd();
  return finalResult;
};

/**
 * Main function to fetch and normalize schedule data
 *
 * @param {string} studentEmailKey
 * @param {string} courseId
 * @param {string} LMSStudentID
 * @param {function} onUpdate - Called each time an individual item is updated (e.g. new grades)
 * @param {function} onTopLevelDataUpdate - (NEW) Called after processSchedule() returns new data,
 *   allowing you to immediately set React state in your ModernCourseViewer if desired.
 */
export const getScheduleData = (
  studentEmailKey,
  courseId,
  LMSStudentID,
  onUpdate,
  onTopLevelDataUpdate // <-- optional second callback
) => {
  const db = getDatabase();

  // Define database references
  const courseRef = ref(db, `courses/${courseId}`);
  const studentCourseRef = ref(db, `students/${studentEmailKey}/courses/${courseId}`);

  let courseData = null;
  let studentCourseData = null;
  let normalizedData = null;
  let gradeListeners = new Map();
  let isProcessing = false;

  /**
   * Runs the normalization logic whenever we have valid courseData + studentCourseData.
   */
  const processSchedule = async () => {
    if (isProcessing) return null;
    // We need both: courseData.units (the course structure) AND
    //               studentCourseData.ScheduleJSON.units (the student's scheduled items)
    if (!courseData?.units || !studentCourseData?.ScheduleJSON?.units) return null;

    try {
      isProcessing = true;

      // If we haven't set up grade listeners yet, do so now
      if (courseData.units && gradeListeners.size === 0) {
        const setupPromises = [];
        courseData.units.forEach((unit) => {
          unit.items?.forEach((item) => {
            if (item.lti?.enabled && item.lti?.deep_link_id) {
              setupPromises.push(setupGradeListener(item.lti.deep_link_id, LMSStudentID));
            }
          });
        });
        await Promise.all(setupPromises);
      }

      // Actually run the normalization
      const normalized = await normalizeScheduleData(
        studentCourseData.ScheduleJSON.units,  // scheduleUnits
        courseData,                              // full courseData
        LMSStudentID,
        studentEmailKey,
        courseId,
        onUpdate,
        courseData.weights                       // globalWeights parameter
      );

      if (normalized) {
        normalizedData = normalized;
        console.group('📊 Schedule Normalizer Data');
        console.log('Raw Course Data:', courseData);
        console.log('Raw Student Course Data:', studentCourseData);
        console.log('Normalized Schedule:', normalized);
        console.groupEnd();
      }

      return normalized;
    } catch (error) {
      console.error('Error processing schedule:', error);
      return null;
    } finally {
      isProcessing = false;
    }
  };

  /**
   * Sets up a listener on the final grades in Realtime DB for each LTI item
   */
  const setupGradeListener = async (deep_link_id, LMSStudentID) => {
    if (!deep_link_id || !LMSStudentID || gradeListeners.has(deep_link_id)) return;

    try {
      const ltiInfo = await fetchLtiDeepLinkInfo(deep_link_id);
      if (!ltiInfo?.assessment_id) return;

      const gradeRef = ref(db, `imathas_grades/${ltiInfo.assessment_id}_${LMSStudentID}`);
      const unsubscribe = onValue(gradeRef, async (snapshot) => {
        const gradeData = snapshot.val();
        if (!gradeData) return;

        // If we already have normalizedData, update the specific item
        if (normalizedData?.units) {
          // Update each matching item
          for (let unitIndex = 0; unitIndex < normalizedData.units.length; unitIndex++) {
            const unit = normalizedData.units[unitIndex];
            for (let itemIndex = 0; itemIndex < unit.items.length; itemIndex++) {
              const item = unit.items[itemIndex];
              if (item.lti?.deep_link_id === deep_link_id) {
                const processedItem = await processAssessmentData(gradeData, ltiInfo, item);
                if (processedItem && onUpdate) {
                  // Let ModernCourseViewer patch it in
                  onUpdate(unitIndex, itemIndex, processedItem);
                }
              }
            }
          }
        }
      });

      gradeListeners.set(deep_link_id, unsubscribe);
    } catch (error) {
      console.error('Error setting up grade listener:', error);
    }
  };

  // -- MAIN LISTENERS on course + student/course data --
  const courseUnsubscribe = onValue(courseRef, async (snapshot) => {
    courseData = snapshot.val();
    const newNorm = await processSchedule();
    // If we got new data, let the top-level know
    if (newNorm && onTopLevelDataUpdate) {
      onTopLevelDataUpdate(newNorm, courseData, studentCourseData);
    }
  });

  const studentCourseUnsubscribe = onValue(studentCourseRef, async (snapshot) => {
    studentCourseData = snapshot.val();
    const newNorm = await processSchedule();
    // If we got new data, let the top-level know
    if (newNorm && onTopLevelDataUpdate) {
      onTopLevelDataUpdate(newNorm, courseData, studentCourseData);
    }
  });

  return {
    /**
     * Call this when you unmount to avoid memory leaks
     */
    cleanup: () => {
      courseUnsubscribe();
      studentCourseUnsubscribe();
      gradeListeners.forEach((unsubscribe) => unsubscribe());
      gradeListeners.clear();
    },

    /**
     * Returns the latest in-memory courseData from the watchers
     */
    courseData: () => courseData,

    /**
     * Returns the latest in-memory studentCourseData from the watchers
     */
    studentCourseData: () => studentCourseData,

    /**
     * Returns the most recently computed normalizedSchedule
     */
    normalizedSchedule: () => normalizedData,
  };
};

/**
 * Cleanup function to remove any stored active listeners
 */
export const cleanup = () => {
  activeListeners.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      console.error('Error cleaning up listener:', error);
    }
  });
  activeListeners.clear();
};


