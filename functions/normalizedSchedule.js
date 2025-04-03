// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { onValueWritten } = require('firebase-functions/v2/database');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { setGlobalOptions } = require('firebase-functions/v2');



// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const { updateStudentAutoStatus } = require('./autoStatus');
const fetch = require('node-fetch');

// Set global options for all 2nd gen functions
setGlobalOptions({
  region: 'us-central1', // Update this to your preferred region
  maxInstances: 10
});

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}



/**
 * Utility function to log events to the database
 */
async function logEvent(eventType, data, isSuccess = true) {
  try {
    const db = admin.database();
    const logRef = db.ref('logs/events').push();
    
    await logRef.set({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      eventType,
      isSuccess,
      ...data
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

/**
 * Fetch LMSStudentID from edge system
 */
async function fetchLMSStudentID(studentEmail, courseId) {
  console.log(`Attempting to fetch LMSStudentID for ${studentEmail} in course ${courseId}`);
  
  try {
    // Send request to edge system
    const response = await fetch('https://edge.rtdacademy.com/return_data_to_yourway.php', {
      method: 'POST',
      body: JSON.stringify({ email: studentEmail }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid response from Edge system');
    }

    console.log('Parsed result:', result);

    if (!result.success) {
      console.log('Edge system returned error:', result.message);
      throw new Error(result.message || 'Failed to fetch LMS ID');
    }

    const db = admin.database();
    const sanitizedEmail = sanitizeEmail(studentEmail);
    
    const updates = {};
    updates[`students/${sanitizedEmail}/courses/${courseId}/LMSStudentID`] = result.user.id;
    
    const summaryRef = db.ref(`studentCourseSummaries/${sanitizedEmail}_${courseId}`);
    const summarySnapshot = await summaryRef.once('value');
    const currentToggle = summarySnapshot.exists() ? summarySnapshot.val().toggle : false;
    
    updates[`studentCourseSummaries/${sanitizedEmail}_${courseId}/toggle`] = !currentToggle;

    await db.ref().update(updates);
    
    await logEvent('LMS Student ID Fetch', {
      email: studentEmail,
      courseId: courseId,
      status: 'success',
      lmsId: result.user.id
    });

    console.log(`Successfully fetched and saved LMSStudentID ${result.user.id} for ${studentEmail}`);
    return result.user.id;

  } catch (error) {
    await logEvent('LMS Student ID Fetch Error', {
      email: studentEmail,
      courseId: courseId,
      error: error.message
    }, false);
    
    console.error(`Failed to fetch LMSStudentID for ${studentEmail}:`, error);
    throw error;
  }
}

/**
 * Cloud function to generate a normalized schedule for a student/course (HTTP callable)
 * 2nd gen version
 */
const generateNormalizedScheduleV2 = onCall({
  concurrency: 50,
  memory: '1GiB', 
  timeoutSeconds: 300,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"] 
}, async (data) => {
  // Extract required parameters

const { studentKey, courseId, forceUpdate = false } = data.data;
  
  if (!studentKey || !courseId) {
    throw new Error('Missing required parameters: studentKey and courseId are required');
  }
  
  console.log(`Starting normalized schedule generation for student: ${studentKey}, course: ${courseId}`);
  
  try {
    // Set up database references
    const db = admin.database();
    const syncTimestampRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`);
    
    // Check if we should skip processing (if not forcing update and recently updated)
    if (!forceUpdate) {
      const syncSnapshot = await syncTimestampRef.once('value');
      const lastSyncTime = syncSnapshot.val();
      
      if (lastSyncTime) {
        const timeSinceSync = Date.now() - lastSyncTime;
        if (timeSinceSync < 3600000) { // Less than 1 hour old
          console.log(`Skipping normalized schedule generation - last sync was ${timeSinceSync}ms ago`);
          return { 
            success: true, 
            message: 'Using cached schedule', 
            timestamp: lastSyncTime 
          };
        }
      }
    }
    
    return await generateNormalizedScheduleInternal(studentKey, courseId, null, forceUpdate);
  } catch (error) {
    console.error('Error generating normalized schedule:', error);
    throw new Error(error.message);
  }
});

/**
 * Performs a lightweight update to just schedule adherence without fetching all data
 */
async function updateScheduleAdherenceOnly(db, studentKey, courseId, existingSchedule) {
  const today = new Date();
  
  try {
    // Get all items with dates for recalculation
    const allItems = [];
    existingSchedule.units.forEach(unit => {
      unit.items.forEach(item => {
        if (item.date) {
          allItems.push({...item});
        }
      });
    });
    
    // Skip if no dated items
    if (allItems.length === 0) return null;
    
    // Sort items by date
    allItems.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Recalculate current scheduled index based on today's date
    let newScheduledIndex = -1;
    for (let i = 0; i < allItems.length; i++) {
      if (!allItems[i].date) continue;
      
      const itemDate = new Date(allItems[i].date);
      if (itemDate > today) {
        newScheduledIndex = Math.max(0, i - 1);
        break;
      }
    }
    
    if (newScheduledIndex === -1) {
      newScheduledIndex = allItems.length - 1;
    }
    
    // Get current completed index (should be unchanged since this is just date-based)
    const currentCompletedIndex = existingSchedule.scheduleAdherence.currentCompletedIndex;
    
    // Calculate new lessons offset
    const newLessonsOffset = currentCompletedIndex - newScheduledIndex;
    
    // Skip if nothing changed
    if (newScheduledIndex === existingSchedule.scheduleAdherence.currentScheduledIndex &&
        newLessonsOffset === existingSchedule.scheduleAdherence.lessonsOffset) {
      console.log('Schedule adherence unchanged, no update needed');
      return existingSchedule;
    }
    
    // Create a deep copy of the existing schedule
    const updatedSchedule = JSON.parse(JSON.stringify(existingSchedule));
    
    // Update only the changed adherence values
    updatedSchedule.scheduleAdherence = {
      ...updatedSchedule.scheduleAdherence,
      currentScheduledIndex: newScheduledIndex,
      lessonsOffset: newLessonsOffset,
      isOnSchedule: newLessonsOffset === 0,
      isAhead: newLessonsOffset > 0,
      isBehind: newLessonsOffset < 0,
      currentScheduledItem: allItems[newScheduledIndex],
    };
    
    // Recalculate marks using already loaded data
    updatedSchedule.marks = calculateCourseMarks(updatedSchedule.units, updatedSchedule.weights);
    
    // Update timestamp
    updatedSchedule.lastUpdated = Date.now();
    
    // Write updates to database
    const updates = {};
    updates[`students/${studentKey}/courses/${courseId}/normalizedSchedule/scheduleAdherence`] = updatedSchedule.scheduleAdherence;
    updates[`students/${studentKey}/courses/${courseId}/normalizedSchedule/marks`] = updatedSchedule.marks;
    updates[`students/${studentKey}/courses/${courseId}/normalizedSchedule/lastUpdated`] = updatedSchedule.lastUpdated;
    updates[`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`] = updatedSchedule.lastUpdated;
    
    await db.ref().update(updates);
    
    // Check and update auto-status
    try {
      await updateStudentAutoStatus(db, studentKey, courseId, updatedSchedule.scheduleAdherence);
      console.log(`Auto-status check completed for student: ${studentKey}, course: ${courseId}`);
    } catch (error) {
      console.warn(`Auto-status update failed, but continuing: ${error.message}`);
    }
    
    console.log(`Successfully updated schedule adherence for student: ${studentKey}, course: ${courseId}`);
    return updatedSchedule;
  } catch (error) {
    console.error('Error in lightweight schedule adherence update:', error);
    return null;
  }
}

/**
 * Internal implementation of schedule generation with optimized data fetching
 */
async function generateNormalizedScheduleInternal(studentKey, courseId, providedLMSStudentID = null, forceUpdate = false) {
  console.log(`Starting normalized schedule generation for student: ${studentKey}, course: ${courseId}`);
  
  // Set up database reference
  const db = admin.database();
  
  // Check if we can do a lightweight update
  if (!forceUpdate) {
    const syncTimestampRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`);
    const syncTimestampSnapshot = await syncTimestampRef.once('value');
    const lastSyncTime = syncTimestampSnapshot.val();
    
    if (lastSyncTime && (Date.now() - lastSyncTime < 3600000)) { // Less than 1 hour
      console.log(`Recent sync detected: ${Date.now() - lastSyncTime}ms ago. Checking for lightweight update.`);
      
      // Get existing normalized schedule
      const normalizedScheduleRef = db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`);
      const normalizedScheduleSnapshot = await normalizedScheduleRef.once('value');
      
      if (normalizedScheduleSnapshot.exists()) {
        // Perform lightweight adherence update only
        const updatedSchedule = await updateScheduleAdherenceOnly(
          db, studentKey, courseId, normalizedScheduleSnapshot.val()
        );
        
        if (updatedSchedule) {
          console.log(`Completed lightweight adherence update for ${studentKey} in ${courseId}`);
          return {
            success: true,
            timestamp: updatedSchedule.lastUpdated,
            itemCount: updatedSchedule.totalItems,
            updateType: 'lightweight'
          };
        }
      }
    }
  }
  
  // If we're here, we need to do a full update
  console.log(`Performing full schedule update for ${studentKey} in ${courseId}`);
  
  // Only fetch the specific data we need in parallel - this is key to optimization
  const [
    scheduleJsonSnapshot,
    courseUnitsSnapshot,
    courseWeightsSnapshot,
    lmsStudentIDSnapshot,
    courseStatusSnapshot,
    ltiLinksCompleteSnapshot
  ] = await Promise.all([
    db.ref(`students/${studentKey}/courses/${courseId}/ScheduleJSON/units`).once('value'),
    db.ref(`courses/${courseId}/units`).once('value'),
    db.ref(`courses/${courseId}/weights`).once('value'),
    providedLMSStudentID ? null : db.ref(`students/${studentKey}/courses/${courseId}/LMSStudentID`).once('value'),
    db.ref(`courses/${courseId}/Status/Value`).once('value'),
    db.ref(`courses/${courseId}/ltiLinksComplete`).once('value')
  ]);
  
  // Check for missing required data
  if (!scheduleJsonSnapshot.exists()) {
    console.error(`No ScheduleJSON data found for student at students/${studentKey}/courses/${courseId}/ScheduleJSON/units`);
    return null;
  }
  
  if (!courseUnitsSnapshot.exists()) {
    console.error(`No units found for course at courses/${courseId}/units`);
    return null;
  }
  
  const scheduleUnits = scheduleJsonSnapshot.val();
  const courseUnits = courseUnitsSnapshot.val();
  const courseWeights = courseWeightsSnapshot.val();
  const courseStatus = courseStatusSnapshot.val() || 'Default';
  const ltiLinksComplete = ltiLinksCompleteSnapshot.val() === true;
  
  // Check for LMSStudentID and use provided one or fetch if missing
  let lmsStudentID = providedLMSStudentID;
  
  if (!lmsStudentID && lmsStudentIDSnapshot && lmsStudentIDSnapshot.exists()) {
    lmsStudentID = lmsStudentIDSnapshot.val();
  }
  
  if (!lmsStudentID) {
    console.log(`No LMSStudentID found for student ${studentKey} in course ${courseId}, attempting to fetch it`);
    
    // Get student email from studentCourseSummaries
    const summaryRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}/StudentEmail`);
    const summarySnapshot = await summaryRef.once('value');
    
    if (!summarySnapshot.exists()) {
      console.error('Cannot fetch LMSStudentID: Student email not found in summary');
      return null;
    }
    
    const studentEmail = summarySnapshot.val();
    
    try {
      // Try to fetch LMSStudentID from edge system
      lmsStudentID = await fetchLMSStudentID(studentEmail, courseId);
      console.log(`Successfully fetched LMSStudentID: ${lmsStudentID}`);
    } catch (error) {
      console.error(`Failed to fetch LMSStudentID: ${error.message}`);
      return null;
    }
  }
  
  // Generate normalized schedule
  const normalizedSchedule = await normalizeScheduleData(
    scheduleUnits,
    { units: courseUnits, weights: courseWeights, Status: { Value: courseStatus } },
    lmsStudentID,
    studentKey,
    courseId,
    courseWeights
  );
  
  if (!normalizedSchedule) {
    console.error('Failed to generate normalized schedule');
    return null;
  }
  
  // Remove undefined values (Firebase doesn't allow undefined)
  const safeNormalized = removeUndefined(normalizedSchedule);
  
  // Add timestamp
  const timestamp = Date.now();
  safeNormalized.lastUpdated = timestamp;
  
  // Write updates in a batch
  const updates = {};
  updates[`students/${studentKey}/courses/${courseId}/normalizedSchedule`] = safeNormalized;
  updates[`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`] = timestamp;
  
  await db.ref().update(updates);
  
  // Check and update auto-status
  try {
    await updateStudentAutoStatus(db, studentKey, courseId, safeNormalized.scheduleAdherence);
    console.log(`Auto-status check completed for student: ${studentKey}, course: ${courseId}`);
  } catch (error) {
    console.warn(`Auto-status update failed after schedule generation: ${error.message}`);
  }
  
  console.log(`Successfully generated normalized schedule for student: ${studentKey}, course: ${courseId}`);
  
  return {
    success: true,
    timestamp: timestamp,
    itemCount: safeNormalized.totalItems,
    updateType: 'full'
  };
}

/**
 * Main schedule normalization function with optimized data fetching
 */
async function normalizeScheduleData(
  scheduleUnits,
  courseData,
  LMSStudentID,
  studentEmailKey,
  courseId,
  globalWeights
) {
  const courseUnits = courseData.units;
  console.log('Starting schedule normalization with optimized data fetching');

  if (!scheduleUnits || !courseUnits || !LMSStudentID) {
    console.warn('Missing required parameters for schedule normalization');
    return null;
  }

  // Remove Schedule Information unit and get first real unit
  const activeUnits = Array.isArray(scheduleUnits) ? 
    scheduleUnits.filter(unit => unit.name !== 'Schedule Information') : 
    [];
    
  if (!activeUnits.length) {
    console.warn('No active units found after filtering');
    return null;
  }
  
  // Step 1: Collect assessment IDs and LTI deep link IDs efficiently
  const assessmentIdsToFetch = new Set();
  const ltiDeepLinkIdsToFetch = new Set();
  
  courseUnits.forEach(unit => {
    if (!unit.items) return;
    
    unit.items.forEach(item => {
      // If the item has an assessment_id directly, add it to fetch list
      if (item.assessment_id) {
        assessmentIdsToFetch.add(String(item.assessment_id));
      }
      
      // If the item has an LTI deep link, add it to fetch list
      if (item.lti?.deep_link_id) {
        ltiDeepLinkIdsToFetch.add(item.lti.deep_link_id);
      }
    });
  });
  
  console.log(`Found ${ltiDeepLinkIdsToFetch.size} unique LTI deep links to fetch`);
  console.log(`Found ${assessmentIdsToFetch.size} direct assessment IDs to fetch`);
  
  // Step 2: Batch fetch LTI info for all deep links at once
  const ltiInfoMap = await batchFetchLtiInfo(Array.from(ltiDeepLinkIdsToFetch));
  
  // Step 3: Extract assessment IDs from LTI info and add to our fetch list
  Object.values(ltiInfoMap).forEach(ltiInfo => {
    if (ltiInfo && ltiInfo.assessment_id) {
      assessmentIdsToFetch.add(String(ltiInfo.assessment_id));
    }
  });
  
  console.log(`Total assessment IDs to fetch grades for: ${assessmentIdsToFetch.size}`);
  
  // Step 4: Batch fetch grades for all assessment IDs at once
  const gradesMap = await batchFetchAssessmentGrades(
    Array.from(assessmentIdsToFetch), 
    LMSStudentID
  );
  
  // Process the units and items with our pre-fetched data
  let globalIndex = 0;
  const allItems = [];

  const result = await Promise.all(
    courseUnits.map(async (courseUnit, unitIndex) => {
      // Find matching schedule unit if it exists
      const scheduleUnit = activeUnits.find(u => u.sequence === courseUnit.sequence);
      
      if (!courseUnit.items) {
        console.warn(`Unit ${courseUnit.name || unitIndex} has no items array`);
        return {
          ...courseUnit,
          items: []
        };
      }

      // Process all items in this unit
      const processedItems = courseUnit.items.map(courseItem => {
        // Find matching schedule item
        const scheduleItem = scheduleUnit?.items?.find(i => i.title === courseItem.title);

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

        // Process assessment data if available
        let assessmentId = null;
        
        // Try to get assessment ID from LTI info first
        if (courseItem.lti?.deep_link_id) {
          const ltiInfo = ltiInfoMap[courseItem.lti.deep_link_id];
          
          if (ltiInfo && ltiInfo.assessment_id) {
            assessmentId = ltiInfo.assessment_id;
            
            // Add LTI info to the item
            baseItem.url = ltiInfo.url;
            baseItem.course_id = ltiInfo.course_id;
            baseItem.scoreMaximum = ltiInfo.scoreMaximum;
          }
        }
        
        // If no assessment ID from LTI, try direct assessment ID
        if (!assessmentId && courseItem.assessment_id) {
          assessmentId = courseItem.assessment_id;
        }
        
        // If we have an assessment ID, try to get grades
        if (assessmentId) {
          baseItem.assessment_id = assessmentId;
          
          const gradeKey = `${assessmentId}_${LMSStudentID}`;
          const assessmentGrades = gradesMap[gradeKey];

          if (assessmentGrades) {
            // Process grades
            const scoreMaximum = parseFloat(baseItem.scoreMaximum || 100);
            const score = parseFloat(assessmentGrades.score);
            const scorePercent = scoreMaximum > 0 ? ((score / scoreMaximum) * 100).toFixed(1) : 0;
            
            baseItem.assessmentData = {
              ...assessmentGrades,
              scoreMaximum,
              scorePercent: parseFloat(scorePercent),
              score,
              status: assessmentGrades.status,
              startTime: assessmentGrades.startTime,
              timeOnTask: assessmentGrades.timeOnTask,
              lastChange: assessmentGrades.lastChange,
              version: assessmentGrades.version,
            };
          }
        }

        // Add to all items and return
        allItems.push(baseItem);
        return baseItem;
      });

      return {
        ...courseUnit,
        items: processedItems.filter(Boolean),
      };
    })
  );

  const filteredResult = result.filter(Boolean);

  // Calculate schedule adherence across all items
  const scheduleAdherence = calculateScheduleAdherence(allItems);

  // Simplified status handling - just use the status from courseData
  const currentStatus = courseData.Status?.Value || 'Default';
  
  // Add status to schedule adherence
  scheduleAdherence.status = currentStatus;

  const finalResult = {
    units: filteredResult,
    scheduleAdherence,
    totalItems: allItems.length,
    weights: courseData.weights,
    marks: calculateCourseMarks(filteredResult, courseData.weights)
  };

  return finalResult;
}

/**
 * Optimized batch fetch for LTI deep link info
 */
async function batchFetchLtiInfo(deepLinkIds) {
  if (!deepLinkIds || deepLinkIds.length === 0) {
    return {};
  }
 
  const db = admin.database();
  const resultMap = {};
  
  try {
    // Use a chunking approach to avoid Firebase URL limits
    const CHUNK_SIZE = 25;
    const chunks = [];
    
    for (let i = 0; i < deepLinkIds.length; i += CHUNK_SIZE) {
      chunks.push(deepLinkIds.slice(i, i + CHUNK_SIZE));
    }
    
    // Process chunks in parallel
    await Promise.all(chunks.map(async (chunk) => {
      const promises = chunk.map(id => 
        db.ref(`lti/deep_links/${id}`).once('value')
          .then(snapshot => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              resultMap[id] = {
                url: data.url,
                assessment_id: data.assessment_id,
                course_id: data.course_id,
                scoreMaximum: data.lineItem?.scoreMaximum,
              };
            }
          })
      );
      
      await Promise.all(promises);
    }));
    
    console.log(`Successfully fetched ${Object.keys(resultMap).length}/${deepLinkIds.length} LTI deep links`);
  } catch (error) {
    console.error('Error batch fetching LTI info:', error);
  }
  
  return resultMap;
}

/**
 * Optimized batch fetch for assessment grades
 */
async function batchFetchAssessmentGrades(assessmentIds, LMSStudentID) {
  if (!assessmentIds || assessmentIds.length === 0 || !LMSStudentID) {
    return {};
  }

  const db = admin.database();
  const resultMap = {};
  
  try {
    // Use chunking to avoid Firebase URL limits
    const CHUNK_SIZE = 25;
    const chunks = [];
    
    for (let i = 0; i < assessmentIds.length; i += CHUNK_SIZE) {
      chunks.push(assessmentIds.slice(i, i + CHUNK_SIZE));
    }
    
    // Process chunks in parallel
    await Promise.all(chunks.map(async (chunk) => {
      // Create grade keys for this chunk
      const gradeKeys = chunk.map(id => `${id}_${LMSStudentID}`);
      
      // Fetch each assessment grade individually but in parallel
      const promises = gradeKeys.map(key => 
        db.ref(`imathas_grades/${key}`).once('value')
          .then(snapshot => {
            if (snapshot.exists()) {
              resultMap[key] = snapshot.val();
            }
          })
      );
      
      await Promise.all(promises);
    }));
    
    console.log(`Successfully fetched ${Object.keys(resultMap).length}/${assessmentIds.length} assessment grades`);
  } catch (error) {
    console.error('Error in batch fetching assessment grades:', error);
  }
  
  return resultMap;
}

/**
 * Calculates schedule adherence metrics with improved handling for out-of-sequence 
 * completion and zero-scored assignments
 */
function calculateScheduleAdherence(allItems) {
  const today = new Date();
  let currentScheduledIndex = -1;
  let currentCompletedIndex = -1;
  let hasInconsistentProgress = false;
  let lastCompletedDate = null;

  // Step 1: Find scheduled position (where should they be based on date)
  for (let i = 0; i < allItems.length; i++) {
    // Check if item has a valid date
    if (!allItems[i].date) continue;
    
    try {
      const itemDate = new Date(allItems[i].date);
      // Verify we have a valid date object
      if (isNaN(itemDate.getTime())) continue;
      
      if (itemDate > today) {
        currentScheduledIndex = Math.max(0, i - 1);
        break;
      }
    } catch (e) {
      console.warn(`Invalid date format for item at index ${i}`);
      continue;
    }
  }

  // If no future-dated items were found, student should be at the end
  if (currentScheduledIndex === -1) {
    currentScheduledIndex = allItems.length - 1;
  }

  // Step 2: Find furthest meaningful completion (excluding zero scores)
  // Track completed items for visualization
  const completedItems = [];
  
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    
    // Check if the item has assessment data AND meaningful completion
    // Consider an item completed only if it has a non-zero score
    const hasAssessmentData = !!item.assessmentData;
    const score = hasAssessmentData ? parseFloat(item.assessmentData.scorePercent || 0) : 0;
    const isCompleted = hasAssessmentData && score > 0;
    
    if (isCompleted) {
      // Update the furthest completed index
      currentCompletedIndex = Math.max(currentCompletedIndex, i);
      
      // Track this completed item
      completedItems.push({
        index: i,
        title: item.title || `Item ${i}`,
        score: score,
        date: item.assessmentData.lastChange 
          ? new Date(item.assessmentData.lastChange * 1000) 
          : null
      });
      
      // Track the latest completion date
      if (item.assessmentData.lastChange) {
        const completionDate = new Date(item.assessmentData.lastChange * 1000);
        if (!lastCompletedDate || completionDate > lastCompletedDate) {
          lastCompletedDate = completionDate;
        }
      }
    }
  }

  // If no items with meaningful scores were found, set to -1 for easy detection
  if (currentCompletedIndex === -1) {
    console.log("No meaningfully completed items found (items with scores > 0)");
  }

  // Step 3: Detect non-sequential completion by checking for gaps
  // Sort completed items by index to see if there are gaps between them
  completedItems.sort((a, b) => a.index - b.index);
  
  if (completedItems.length > 1) {
    for (let i = 1; i < completedItems.length; i++) {
      // Check if there's a gap larger than 1 between consecutive completed items
      if (completedItems[i].index - completedItems[i-1].index > 1) {
        hasInconsistentProgress = true;
        break;
      }
    }
    
    // Also check if there are uncompleted items before the first completed item
    if (completedItems[0].index > 0) {
      hasInconsistentProgress = true;
    }
  }

  // Step 4: Calculate the lessons offset
  // If no items were completed, default to maximum behind state
  const lessonsOffset = currentCompletedIndex === -1 
    ? -currentScheduledIndex // Most behind possible
    : currentCompletedIndex - currentScheduledIndex;

  // Step 5: Prepare the full adherence object
  return {
    currentScheduledIndex,
    currentCompletedIndex,
    lessonsOffset,
    hasInconsistentProgress,
    lastCompletedDate,
    isOnSchedule: lessonsOffset === 0,
    isAhead: lessonsOffset > 0,
    isBehind: lessonsOffset < 0,
    currentScheduledItem: allItems[currentScheduledIndex] || null,
    currentCompletedItem: currentCompletedIndex >= 0 ? allItems[currentCompletedIndex] : null,
  };
}

/**
 * Calculates course marks based on normalized units
 */
function calculateCourseMarks(normalizedUnits, weights) {
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
    if (!unit.items) return;
    
    unit.items.forEach(item => {
      const category = item.type;
      // Skip if category doesn't exist in our structure
      if (!marks.byCategory[category]) return;
      
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
    // Skip if category doesn't exist in our structure
    if (!marks.byCategory[category]) return;
    
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
}

/**
 * Helper function to recursively remove any fields whose value is `undefined`
 * Firebase does not allow `undefined` values
 */
function removeUndefined(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        newObj[key] = removeUndefined(value);
      }
    }
    return newObj;
  }
  return obj;
}

/**
 * Cloud function triggered when a grade is created or updated in the imathas_grades node
 * 2nd gen version
 */
const onGradeUpdateTriggerNormalizedScheduleV2 = onValueWritten({
  // Configure the trigger with relevant options
  ref: '/imathas_grades/{gradeKey}',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 50
}, async (event) => {
  // Get data and key from event
  const gradeKey = event.params.gradeKey;
  const afterData = event.data.after.val();
  const beforeExists = event.data.before.exists();

  // Skip if data was deleted
  if (!afterData) {
    console.log(`Grade data was deleted for ${gradeKey}, no action needed`);
    return null;
  }
  
  console.log(`Processing grade update: ${gradeKey}`);
  
  // Check for required data fields
  const gradeData = afterData;
  if (!gradeData || !gradeData.assessmentId || !gradeData.userId) {
    console.error('Missing required grade data (assessmentId or userId)');
    return null;
  }
  
  const db = admin.database();
  
  try {
    // Step 1: Find the courseId using the assessmentId
    const courseId = await findCourseIdFromAssessment(gradeData.assessmentId);
    
    if (!courseId) {
      console.error(`No course found for assessment ID: ${gradeData.assessmentId}`);
      return null;
    }
    
    console.log(`Found course: ${courseId} for assessment: ${gradeData.assessmentId}`);
    
    // Step 2: Check if ltiLinksComplete is true for this course
    const ltiLinksComplete = await checkLtiLinksComplete(courseId);
    
    if (!ltiLinksComplete) {
      console.log(`Skipping normalized schedule generation - course ${courseId} does not have ltiLinksComplete`);
      return null;
    }
    
    console.log(`Course ${courseId} has ltiLinksComplete, proceeding with schedule update`);
    
    // Step 3: Find the student using LMSStudentID and courseId
    const studentInfo = await findStudentForCourse(gradeData.userId, courseId);
    
    if (!studentInfo) {
      console.error(`No student found for userId: ${gradeData.userId} in course: ${courseId}`);
      return null;
    }
    
    const { studentKey, studentEmail } = studentInfo;
    console.log(`Found student: ${studentEmail} (${studentKey}) for course: ${courseId}`);
    
    // Step 4: Check if normalized schedule already exists
    const normalizedScheduleRef = db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`);
    const normalizedScheduleSnapshot = await normalizedScheduleRef.once('value');
    
    if (normalizedScheduleSnapshot.exists()) {
      console.log(`Normalized schedule exists, performing lightweight update`);
      
      // Use lightweight update when schedule already exists
      await updateNormalizedScheduleForGradeChange(
        db,
        studentKey,
        courseId,
        gradeData.assessmentId,
        gradeData,
        normalizedScheduleSnapshot.val()
      );
    } else {
      console.log(`No normalized schedule found, performing full generation`);
      
      // Fall back to full generation if no schedule exists
      await generateNormalizedScheduleInternal(studentKey, courseId, gradeData.userId);
    }
    
    console.log(`Successfully completed schedule update for ${studentKey} in ${courseId}`);
    return null;
  } catch (error) {
    console.error('Error processing grade:', error);
    
    // Log error to database for tracking
    await db.ref('errorLogs/onGradeUpdateTriggerNormalizedSchedule').push({
      gradeKey,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    
    throw error;
  }
});

/**
 * Lightweight update for normalized schedule when a grade changes
 * Only updates the specific assessment and recalculates completion metrics
 */
async function updateNormalizedScheduleForGradeChange(
  db,
  studentKey,
  courseId,
  assessmentId,
  gradeData,
  existingSchedule
) {
  console.log(`Starting lightweight update for assessment ${assessmentId}`);
  
  try {
    // Get the LTI data for this assessment - optimized query
    const ltiSnapshot = await db.ref('lti/deep_links')
      .orderByChild('assessment_id')
      .equalTo(assessmentId)
      .limitToFirst(1)
      .once('value');
    
    let ltiInfo = null;
    if (ltiSnapshot.exists()) {
      ltiSnapshot.forEach(childSnapshot => {
        ltiInfo = childSnapshot.val();
        return true; // Break the forEach loop after finding first match
      });
    } else {
      // Try with numeric assessment ID if string search failed
      const assessmentIdNum = Number(assessmentId);
      if (!isNaN(assessmentIdNum)) {
        const ltiNumSnapshot = await db.ref('lti/deep_links')
          .orderByChild('assessment_id')
          .equalTo(assessmentIdNum)
          .limitToFirst(1)
          .once('value');
        
        if (ltiNumSnapshot.exists()) {
          ltiNumSnapshot.forEach(childSnapshot => {
            ltiInfo = childSnapshot.val();
            return true; // Break the forEach loop
          });
        }
      }
    }
    
    if (!ltiInfo) {
      console.log(`Could not find LTI info for assessment ${assessmentId}, falling back to full generation`);
      return await generateNormalizedScheduleInternal(studentKey, courseId, gradeData.userId);
    }
    
    // Create a deep copy of the existing schedule to modify
    const updatedSchedule = JSON.parse(JSON.stringify(existingSchedule));
    
    // Find the item in the normalized schedule that corresponds to this assessment
    let targetItem = null;
    let targetUnit = null;
    let targetItemIndex = -1;
    
    // Find the assessment in the units
    for (let i = 0; i < updatedSchedule.units.length; i++) {
      const unit = updatedSchedule.units[i];
      if (!unit.items) continue;
      
      for (let j = 0; j < unit.items.length; j++) {
        const item = unit.items[j];
        if (item.lti?.deep_link_id === ltiInfo.id || 
            (item.assessment_id && (item.assessment_id == assessmentId))) {
          targetItem = item;
          targetUnit = unit;
          targetItemIndex = j;
          break;
        }
      }
      if (targetItem) break;
    }
    
    if (!targetItem) {
      console.log(`Could not find item for assessment ${assessmentId} in normalized schedule, falling back to full generation`);
      return await generateNormalizedScheduleInternal(studentKey, courseId, gradeData.userId);
    }
    
    console.log(`Found target item in unit ${targetUnit.name}, updating assessment data`);
    
    // Ensure target item has a type property which is critical for marks calculation
    if (!targetItem.type) {
      console.warn(`Item missing required 'type' property for marks calculation, attempting to identify type`);
      
      // Try to determine the type from other properties or set a default
      if (targetItem.title?.toLowerCase().includes('exam') || 
          targetItem.title?.toLowerCase().includes('test') || 
          targetItem.title?.toLowerCase().includes('quiz')) {
        targetItem.type = 'exam';
      } else if (targetItem.title?.toLowerCase().includes('assignment') || 
                targetItem.title?.toLowerCase().includes('project')) {
        targetItem.type = 'assignment';
      } else {
        targetItem.type = 'lesson'; // Default type
      }
      
      console.log(`Set item type to: ${targetItem.type}`);
    }
    
    // Process assessment data for this item
    const scoreMaximum = parseFloat(ltiInfo.scoreMaximum) || 100;
    const score = parseFloat(gradeData.score);
    const scorePercent = scoreMaximum > 0 ? ((score / scoreMaximum) * 100).toFixed(1) : 0;
    
    // Log the old score if it exists for comparison
    if (targetItem.assessmentData) {
      console.log(`Previous score: ${targetItem.assessmentData.scorePercent}%, New score: ${scorePercent}%`);
    } else {
      console.log(`New assessment completion with score: ${scorePercent}%`);
    }
    
    // Update assessment data
    targetItem.assessmentData = {
      ...gradeData,
      scoreMaximum,
      scorePercent: parseFloat(scorePercent),
      score,
      status: gradeData.status,
      startTime: gradeData.startTime,
      timeOnTask: gradeData.timeOnTask,
      lastChange: gradeData.lastChange,
      version: gradeData.version,
    };
    
    // Add other properties that might be missing
    targetItem.url = ltiInfo.url;
    targetItem.assessment_id = assessmentId;
    targetItem.course_id = courseId;
    targetItem.scoreMaximum = scoreMaximum;
    
    // Now we need to recalculate schedule adherence and course marks
    // Get all items with dates for recalculation
    const allItems = [];
    updatedSchedule.units.forEach(unit => {
      if (!unit.items) return;
      unit.items.forEach(item => {
        allItems.push(item);
      });
    });
    
    // Calculate new schedule adherence
    updatedSchedule.scheduleAdherence = calculateScheduleAdherence(allItems);
    
    // Recalculate course marks
    updatedSchedule.marks = calculateCourseMarks(updatedSchedule.units, updatedSchedule.weights);
    
    // Update timestamp
    updatedSchedule.lastUpdated = Date.now();
    
    // Write updates to the database
    await db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`).set(updatedSchedule);
    
    // Update last sync timestamp in summary
    await db.ref(`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`).set(updatedSchedule.lastUpdated);
    
    // Check and update auto-status
    try {
      await updateStudentAutoStatus(db, studentKey, courseId, updatedSchedule.scheduleAdherence);
      console.log(`Auto-status check completed for student: ${studentKey}, course: ${courseId}`);
    } catch (error) {
      console.warn(`Auto-status update failed, but continuing: ${error.message}`);
    }
    
    console.log(`Successfully updated normalized schedule for assessment ${assessmentId}`);
    return true;
  } catch (error) {
    console.error(`Error in lightweight update for assessment ${assessmentId}:`, error);
    
    // If lightweight update fails, fall back to full generation
    console.log('Falling back to full schedule generation');
    return await generateNormalizedScheduleInternal(studentKey, courseId, gradeData.userId);
  }
}

/**
 * Cloud function triggered when a student gets assigned an LMSStudentID
 * 2nd gen version
 */
const onLMSStudentIDAssignedTriggerScheduleV2 = onValueWritten({
  // Configure the trigger with relevant options
  ref: '/students/{studentKey}/courses/{courseId}/LMSStudentID',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 50
}, async (event) => {
  // Get data and key from event
  const { studentKey, courseId } = event.params;
  const newLMSStudentID = event.data.after.val();
  const previousLMSStudentID = event.data.before.exists() ? event.data.before.val() : null;
  
  // Skip if the LMSStudentID was deleted or is unchanged
  if (!newLMSStudentID) {
    console.log(`LMSStudentID was removed for student ${studentKey} in course ${courseId}`);
    return null;
  }
  
  // If this is an update to an existing LMSStudentID (not a new assignment), we can skip
  if (previousLMSStudentID && previousLMSStudentID === newLMSStudentID) {
    console.log(`LMSStudentID unchanged for student ${studentKey} in course ${courseId}`);
    return null;
  }
  
  console.log(`New LMSStudentID ${newLMSStudentID} assigned to student ${studentKey} in course ${courseId}`);
  
  const db = admin.database();
  
  try {
    // Check if this course has ltiLinksComplete set to true (lightweight check)
    const ltiLinksCompleteSnapshot = await db.ref(`courses/${courseId}/ltiLinksComplete`).once('value');
    const ltiLinksComplete = ltiLinksCompleteSnapshot.val() === true;
    
    if (!ltiLinksComplete) {
      console.log(`Skipping normalized schedule generation - course ${courseId} does not have ltiLinksComplete`);
      return null;
    }
    
    // Generate the normalized schedule now that we have an LMSStudentID
    await generateNormalizedScheduleInternal(studentKey, courseId, newLMSStudentID);
    
    console.log(`Successfully generated normalized schedule for student ${studentKey} in course ${courseId} after LMSStudentID assignment`);
    return null;
  } catch (error) {
    console.error('Error handling LMSStudentID assignment:', error);
    
    // Log error to database for tracking
    await db.ref('errorLogs/onLMSStudentIDAssignedTriggerSchedule').push({
      studentKey,
      courseId,
      lmsStudentId: newLMSStudentID,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    
    throw error;
  }
});

/**
 * Checks if ltiLinksComplete is true for a course - optimized to fetch only what's needed
 */
async function checkLtiLinksComplete(courseId) {
  const db = admin.database();
  
  try {
    const snapshot = await db.ref(`courses/${courseId}/ltiLinksComplete`).once('value');
    return snapshot.val() === true;
  } catch (error) {
    console.error(`Error checking ltiLinksComplete for course ${courseId}:`, error);
    return false;
  }
}

/**
 * Optimized function to find the courseId associated with an assessment
 */
async function findCourseIdFromAssessment(assessmentId) {
  const db = admin.database();
  
  try {
    // Convert assessmentId to string to ensure type matching
    const assessmentIdStr = String(assessmentId);
    
    // Use indexed query with limit to improve performance
    let snapshot = await db.ref('lti/deep_links')
      .orderByChild('assessment_id')
      .equalTo(assessmentIdStr)
      .limitToFirst(1)  // Only need one result
      .once('value');
    
    if (snapshot.exists()) {
      let courseId = null;
      snapshot.forEach(childSnapshot => {
        courseId = childSnapshot.val().course_id;
        return true; // Break the forEach loop after first match
      });
      
      if (courseId) {
        console.log(`Found course ID: ${courseId} for assessment ID: ${assessmentId}`);
        return courseId;
      }
    }
    
    // Try with numeric value if string search failed
    const assessmentIdNum = Number(assessmentId);
    if (!isNaN(assessmentIdNum)) {
      snapshot = await db.ref('lti/deep_links')
        .orderByChild('assessment_id')
        .equalTo(assessmentIdNum)
        .limitToFirst(1)
        .once('value');
      
      if (snapshot.exists()) {
        let courseId = null;
        snapshot.forEach(childSnapshot => {
          courseId = childSnapshot.val().course_id;
          return true; // Break the forEach loop
        });
        
        if (courseId) {
          console.log(`Found course ID: ${courseId} for numeric assessment ID: ${assessmentId}`);
          return courseId;
        }
      }
    }
    
    console.log(`No matching deep link found for assessment ID: ${assessmentId}`);
    return null;
    
  } catch (error) {
    console.error(`Error finding courseId for assessment ${assessmentId}:`, error);
    throw error;
  }
}

/**
 * Optimized function to find the student for a given LMSStudentID and courseId
 */
async function findStudentForCourse(lmsStudentId, courseId) {
  const db = admin.database();
  
  try {
    // Convert to string and number types for comparison
    const lmsStudentIdStr = String(lmsStudentId);
    const lmsStudentIdNum = Number(lmsStudentId);
    const courseIdStr = String(courseId);
    const courseIdNum = Number(courseId);
    
    console.log(`Looking for student with LMSStudentID: ${lmsStudentIdStr} in course: ${courseIdStr}`);
    
    // Use optimized query with orderBy and equalTo
    let snapshot = await db.ref('studentCourseSummaries')
      .orderByChild('LMSStudentID')
      .equalTo(lmsStudentIdStr)
      .once('value');
    
    let summaries = snapshot.val();
    
    // If no results, try with numeric LMSStudentID
    if (!summaries && !isNaN(lmsStudentIdNum)) {
      console.log(`Trying numeric LMSStudentID: ${lmsStudentIdNum}`);
      snapshot = await db.ref('studentCourseSummaries')
        .orderByChild('LMSStudentID')
        .equalTo(lmsStudentIdNum)
        .once('value');
      summaries = snapshot.val();
    }
    
    if (!summaries) {
      console.log(`No student summaries found with LMSStudentID: ${lmsStudentId} (tried both string and number types)`);
      return null;
    }
    
    // Find the summary that matches the courseId (try both string and number types)
    let matchingStudentKey = null;
    let studentEmail = null;
    
    Object.entries(summaries).forEach(([key, summary]) => {
      // Check course ID with both string and number comparison
      if (summary.CourseID === courseIdStr || summary.CourseID === courseIdNum) {
        matchingStudentKey = summary.StudentEmail ? sanitizeEmail(summary.StudentEmail) : null;
        studentEmail = summary.StudentEmail;
        console.log(`Found matching student: ${studentEmail} for course: ${courseId}`);
      }
    });
    
    if (!matchingStudentKey) {
      console.log(`Found summaries but no match for course ID: ${courseId}. Available courses:`, 
        Object.values(summaries).map(s => s.CourseID));
      return null;
    }
    
    return {
      studentKey: matchingStudentKey,
      studentEmail
    };
    
  } catch (error) {
    console.error(`Error finding student for LMSStudentID ${lmsStudentId} and course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Cloud function scheduled to run daily to update all students' schedule adherence metrics
 * 2nd gen version
 */
const updateDailyScheduleAdherenceV2 = onSchedule({
  schedule: '45 5 * * *', // Run at 5:45 AM every day
  timeZone: 'America/Edmonton', // Adjust to your timezone
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 1 // Only one instance should run at a time to avoid conflicts
}, async (context) => {
  const db = admin.database();
  const today = new Date();
  console.log(`Starting daily schedule adherence update: ${today.toISOString()}`);
  
  try {
    // Get only active student course summaries
    console.log('Fetching only active students...');
    const summariesRef = db.ref('studentCourseSummaries')
      .orderByChild('ActiveFutureArchived_Value')
      .equalTo('Active');
    
    const summariesSnapshot = await summariesRef.once('value');
    const summaries = summariesSnapshot.val() || {};
    
    console.log(`Found ${Object.keys(summaries).length} active student courses to process`);
    
    let processedCount = 0;
    let updatedCount = 0;
    
    // Process each active student course summary
    for (const [key, summary] of Object.entries(summaries)) {
      // Skip if necessary data is missing
      if (!summary.StudentEmail || !summary.CourseID) continue;
      
      const [studentKey, courseId] = key.split('_');
      if (!studentKey || !courseId) continue;
      
      // Use updateScheduleAdherenceOnly for an optimized update
      try {
        // Get existing normalized schedule
        const normalizedScheduleRef = db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`);
        const normalizedScheduleSnapshot = await normalizedScheduleRef.once('value');
        
        if (!normalizedScheduleSnapshot.exists()) continue;
        
        const normalizedSchedule = normalizedScheduleSnapshot.val();
        if (!normalizedSchedule || !normalizedSchedule.units || !normalizedSchedule.scheduleAdherence) continue;
        
        const updatedSchedule = await updateScheduleAdherenceOnly(
          db, 
          studentKey, 
          courseId, 
          normalizedSchedule
        );
        
        if (updatedSchedule) {
          updatedCount++;
        }
        
        processedCount++;
        
        // Log progress occasionally
        if (processedCount % 100 === 0) {
          console.log(`Processed ${processedCount} active student courses so far...`);
        }
      } catch (error) {
        console.error(`Error updating schedule for ${studentKey} in ${courseId}:`, error);
        // Continue with next student
      }
    }
    
    // Log event for tracking
    await logEvent('Daily Schedule Update', {
      processedCount,
      updatedCount,
      date: today.toISOString(),
      activeStudentsOnly: true
    });
    
    console.log(`Daily schedule update complete. Processed: ${processedCount}, Updated: ${updatedCount}`);
    
    return {
      success: true,
      processed: processedCount,
      updated: updatedCount
    };
  } catch (error) {
    console.error('Error in daily schedule update:', error);
    
    // Log error to database
    await db.ref('errorLogs/updateDailyScheduleAdherence').push({
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    
    throw error;
  }
});

/**
 * Cloud function to update normalized schedules for a batch of students in parallel
 * 2nd gen version with support for up to 3000 students
 */
const batchUpdateNormalizedSchedulesV2 = onCall({
  memory: '2GiB',
  timeoutSeconds: 540, // 9 minutes should be enough for 3000 students
  concurrency: 500,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  // Extract parameters from request.data
  const { students, forceUpdate = false } = request.data;
  
  if (!students || !Array.isArray(students) || students.length === 0) {
    throw new Error('You must provide an array of students');
  }
  
  // Increase max students to 3000 to match batchSyncStudentDataV2
  if (students.length > 3000) {
    throw new Error('Maximum 3000 students can be processed in a single batch. Please reduce the selection and try again.');
  }
  
  console.log(`Starting complete schedule update for ${students.length} students`);
  const db = admin.database();
  
  // Create batch ID for tracking
  const batchId = db.ref('scheduleBatches').push().key;
  const batchRef = db.ref(`scheduleBatches/${batchId}`);
  
  // Initialize batch status
  await batchRef.set({
    status: 'processing',
    total: students.length,
    completed: 0,
    successful: 0,
    failed: 0,
    startTime: Date.now(),
    studentsTotal: students.length,
    students: students.map(s => ({
      studentKey: s.studentKey,
      courseId: s.courseId,
      status: 'pending'
    }))
  });
  
  // Process students in chunks to avoid overloading the system
  // Main chunking - break into 500-student chunks for backend processing
  const MAIN_CHUNK_SIZE = 500; 
  const mainChunks = [];
  
  for (let i = 0; i < students.length; i += MAIN_CHUNK_SIZE) {
    mainChunks.push(students.slice(i, i + MAIN_CHUNK_SIZE));
  }
  
  let totalSuccessful = 0;
  let totalFailed = 0;
  const finalResults = {
    successful: [],
    failed: []
  };
  
  // Process main chunks sequentially
  for (let mainChunkIndex = 0; mainChunkIndex < mainChunks.length; mainChunkIndex++) {
    const mainChunk = mainChunks[mainChunkIndex];
    console.log(`Processing main chunk ${mainChunkIndex + 1}/${mainChunks.length} (${mainChunk.length} students)`);
    
    // Update batch status for this main chunk
    await batchRef.update({
      currentMainChunk: mainChunkIndex + 1,
      totalMainChunks: mainChunks.length,
      mainChunkSize: mainChunk.length
    });
    
    // Sub-chunking - break each 500-student chunk into smaller 25-student chunks for parallel processing
    const SUB_CHUNK_SIZE = 25;
    const subChunks = [];
    
    for (let i = 0; i < mainChunk.length; i += SUB_CHUNK_SIZE) {
      subChunks.push(mainChunk.slice(i, i + SUB_CHUNK_SIZE));
    }
    
    // Process sub-chunks sequentially to reduce database load
    for (let subChunkIndex = 0; subChunkIndex < subChunks.length; subChunkIndex++) {
      const subChunk = subChunks[subChunkIndex];
      const globalChunkIndex = `${mainChunkIndex+1}.${subChunkIndex+1}`;
      console.log(`Processing sub-chunk ${globalChunkIndex} (${subChunk.length} students)`);
      
      // Process students in this sub-chunk in parallel
      const results = await Promise.allSettled(
        subChunk.map(async (student, index) => {
          // Calculate the global student index across all chunks
          const globalIndex = (mainChunkIndex * MAIN_CHUNK_SIZE) + 
                             (subChunkIndex * SUB_CHUNK_SIZE) + index;
          
          try {
            // Get student and course info
            const { studentKey, courseId } = student;
            
            if (!studentKey || !courseId) {
              throw new Error('Missing studentKey or courseId');
            }
            
            // Update student status in batch
            await batchRef.child('students').child(globalIndex).update({
              status: 'processing'
            });
            
            // Call internal function to generate schedule
            const result = await generateNormalizedScheduleInternal(studentKey, courseId, null, forceUpdate);
            
            if (!result) {
              throw new Error('Failed to generate schedule');
            }
            
            // Update status in batch
            await batchRef.child('students').child(globalIndex).update({
              status: 'completed',
              timestamp: Date.now()
            });
            
            // Update batch counts using transactions
            await batchRef.child('completed').transaction(current => (current || 0) + 1);
            await batchRef.child('successful').transaction(current => (current || 0) + 1);
            
            return {
              studentKey,
              courseId,
              success: true,
              timestamp: result.timestamp
            };
          } catch (error) {
            console.error(`Error updating schedule for student: ${error.message}`);
            
            // Update status in batch
            await batchRef.child('students').child(globalIndex).update({
              status: 'error',
              error: error.message
            });
            
            // Update batch counts using transactions
            await batchRef.child('completed').transaction(current => (current || 0) + 1);
            await batchRef.child('failed').transaction(current => (current || 0) + 1);
            
            return {
              studentKey: student.studentKey,
              courseId: student.courseId,
              success: false,
              error: error.message
            };
          }
        })
      );
      
      // Process results from this sub-chunk
      results.forEach((result, index) => {
        const globalIndex = (mainChunkIndex * MAIN_CHUNK_SIZE) + 
                           (subChunkIndex * SUB_CHUNK_SIZE) + index;
        
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value.success) {
            totalSuccessful++;
            finalResults.successful.push(value);
          } else {
            totalFailed++;
            finalResults.failed.push(value);
          }
        } else {
          totalFailed++;
          finalResults.failed.push({
            studentKey: subChunk[index].studentKey,
            courseId: subChunk[index].courseId,
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
      // Update progress info for this sub-chunk
      await batchRef.update({
        currentSubChunk: subChunkIndex + 1,
        totalSubChunks: subChunks.length,
        subChunkSize: subChunk.length,
        progress: Math.round((totalSuccessful + totalFailed) / students.length * 100)
      });
      
      console.log(`Completed sub-chunk ${globalChunkIndex}: ${results.length} students processed`);
    }
    
    // Checkpoint after each main chunk
    console.log(`Completed main chunk ${mainChunkIndex + 1}/${mainChunks.length}`);
    console.log(`Progress: ${totalSuccessful} successful, ${totalFailed} failed`);
  }
  
  // Update final batch status
  await batchRef.update({
    status: 'completed',
    endTime: Date.now(),
    totalSuccessful,
    totalFailed,
    progress: 100
  });
  
  console.log(`Batch schedule update completed: ${totalSuccessful} successful, ${totalFailed} failed`);
  
  // Return batch ID and summary
  return {
    batchId,
    total: students.length,
    successful: totalSuccessful,
    failed: totalFailed,
    results: finalResults
  };
});

// Export all functions
exports.generateNormalizedScheduleV2 = generateNormalizedScheduleV2;
exports.onGradeUpdateTriggerNormalizedScheduleV2 = onGradeUpdateTriggerNormalizedScheduleV2;
exports.onLMSStudentIDAssignedTriggerScheduleV2 = onLMSStudentIDAssignedTriggerScheduleV2;
exports.updateDailyScheduleAdherenceV2 = updateDailyScheduleAdherenceV2;
exports.batchUpdateNormalizedSchedulesV2 = batchUpdateNormalizedSchedulesV2;