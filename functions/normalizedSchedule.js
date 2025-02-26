const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const { updateStudentAutoStatus } = require('./autoStatus');
const fetch = require('node-fetch'); // Make sure this is included in your package.json

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
 */
const generateNormalizedSchedule = functions.https.onCall(async (data, context) => {
  // Extract required parameters
  const { studentKey, courseId, forceUpdate = false } = data;
  
  if (!studentKey || !courseId) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Missing required parameters: studentKey and courseId are required'
    );
  }
  
  console.log(`Starting normalized schedule generation for student: ${studentKey}, course: ${courseId}`);
  
  try {
    // Set up database references
    const db = admin.database();
    const studentCourseRef = db.ref(`students/${studentKey}/courses/${courseId}`);
    const courseRef = db.ref(`courses/${courseId}`);
    const normalizedScheduleRef = db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`);
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
    
    // Fetch student course data and course data in parallel
    const [studentCourseSnapshot, courseSnapshot] = await Promise.all([
      studentCourseRef.once('value'),
      courseRef.once('value')
    ]);
    
    if (!studentCourseSnapshot.exists()) {
      throw new functions.https.HttpsError(
        'not-found',
        `No course data found for student at students/${studentKey}/courses/${courseId}`
      );
    }
    
    if (!courseSnapshot.exists()) {
      throw new functions.https.HttpsError(
        'not-found',
        `No course data found at courses/${courseId}`
      );
    }
    
    const studentCourseData = studentCourseSnapshot.val();
    const courseData = courseSnapshot.val();
    
    // Check for LMSStudentID and fetch it if missing
    let lmsStudentID = studentCourseData.LMSStudentID;
    
    if (!lmsStudentID) {
      console.log(`No LMSStudentID found for student ${studentKey} in course ${courseId}, attempting to fetch it`);
      
      // Get student email from studentCourseSummaries
      const summaryRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}`);
      const summarySnapshot = await summaryRef.once('value');
      
      if (!summarySnapshot.exists() || !summarySnapshot.val().StudentEmail) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Cannot fetch LMSStudentID: Student email not found in summary'
        );
      }
      
      const studentEmail = summarySnapshot.val().StudentEmail;
      
      try {
        // Try to fetch LMSStudentID from edge system
        lmsStudentID = await fetchLMSStudentID(studentEmail, courseId);
        console.log(`Successfully fetched LMSStudentID: ${lmsStudentID}`);
      } catch (error) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Failed to fetch LMSStudentID: ${error.message}`
        );
      }
    }
    
    // Ensure course and schedule data exists
    if (!courseData.units) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Course data is missing units array'
      );
    }
    
    if (!studentCourseData.ScheduleJSON?.units) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Student course data is missing ScheduleJSON.units array'
      );
    }
    
    // Generate normalized schedule
    const normalizedSchedule = await normalizeScheduleData(
      studentCourseData.ScheduleJSON.units,
      courseData,
      lmsStudentID,
      studentKey,
      courseId,
      courseData.weights
    );
    
    if (!normalizedSchedule) {
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate normalized schedule'
      );
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
      console.warn(`Auto-status update failed, but continuing: ${error.message}`);
    }
    
    console.log(`Successfully generated normalized schedule for student: ${studentKey}, course: ${courseId}`);
    
    return {
      success: true,
      timestamp: timestamp,
      itemCount: safeNormalized.totalItems
    };
  } catch (error) {
    console.error('Error generating normalized schedule:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud function triggered when a grade is created or updated in the imathas_grades node
 */
const onGradeUpdateTriggerNormalizedSchedule = functions.database
  .ref('/imathas_grades/{gradeKey}')
  .onWrite(async (change, context) => {
    const gradeKey = context.params.gradeKey;
    
    // Skip if data was deleted
    if (!change.after.exists()) {
      console.log(`Grade data was deleted for ${gradeKey}, no action needed`);
      return null;
    }
    
    const gradeData = change.after.val();
    
    console.log(`Processing grade update: ${gradeKey}`);
    
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
      
      console.log(`Course ${courseId} has ltiLinksComplete, proceeding with schedule generation`);
      
      // Step 3: Find the student using LMSStudentID and courseId
      const studentInfo = await findStudentForCourse(gradeData.userId, courseId);
      
      if (!studentInfo) {
        console.error(`No student found for userId: ${gradeData.userId} in course: ${courseId}`);
        return null;
      }
      
      const { studentKey, studentEmail } = studentInfo;
      console.log(`Found student: ${studentEmail} (${studentKey}) for course: ${courseId}`);
      
      // Step 4: Generate the normalized schedule
      // We can reuse the core schedule generation logic by calling the internal function directly
      await generateNormalizedScheduleInternal(studentKey, courseId, gradeData.userId);
      
      console.log(`Successfully completed normalized schedule generation for ${studentKey} in ${courseId}`);
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
 * Cloud function triggered when a student gets assigned an LMSStudentID
 */
const onLMSStudentIDAssignedTriggerSchedule = functions.database
  .ref('/students/{studentKey}/courses/{courseId}/LMSStudentID')
  .onWrite(async (change, context) => {
    const { studentKey, courseId } = context.params;
    const newLMSStudentID = change.after.val();
    const previousLMSStudentID = change.before.val();
    
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
      // Check if this course has ltiLinksComplete set to true
      const ltiLinksComplete = await checkLtiLinksComplete(courseId);
      
      if (!ltiLinksComplete) {
        console.log(`Skipping normalized schedule generation - course ${courseId} does not have ltiLinksComplete`);
        return null;
      }
      
      // Check if the student already has a schedule (might be an initial client-side one)
      const normalizedScheduleRef = db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`);
      const normalizedScheduleSnapshot = await normalizedScheduleRef.once('value');
      
      const hasSchedule = normalizedScheduleSnapshot.exists();
      console.log(`Student ${hasSchedule ? 'already has' : 'does not have'} a normalized schedule`);
      
      // Generate or regenerate the normalized schedule now that we have an LMSStudentID
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
 * Internal implementation of schedule generation used by both cloud functions
 */
async function generateNormalizedScheduleInternal(studentKey, courseId, providedLMSStudentID = null) {
  console.log(`Starting normalized schedule generation for student: ${studentKey}, course: ${courseId}`);
  
  // Set up database references
  const db = admin.database();
  const studentCourseRef = db.ref(`students/${studentKey}/courses/${courseId}`);
  const courseRef = db.ref(`courses/${courseId}`);
  const normalizedScheduleRef = db.ref(`students/${studentKey}/courses/${courseId}/normalizedSchedule`);
  const syncTimestampRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}/lastNormalizedSchedSync`);
  
  // Fetch student course data and course data in parallel
  const [studentCourseSnapshot, courseSnapshot] = await Promise.all([
    studentCourseRef.once('value'),
    courseRef.once('value')
  ]);
  
  if (!studentCourseSnapshot.exists()) {
    console.error(`No course data found for student at students/${studentKey}/courses/${courseId}`);
    return null;
  }
  
  if (!courseSnapshot.exists()) {
    console.error(`No course data found at courses/${courseId}`);
    return null;
  }
  
  const studentCourseData = studentCourseSnapshot.val();
  const courseData = courseSnapshot.val();
  
  // Check for LMSStudentID and use provided one or fetch if missing
  let lmsStudentID = providedLMSStudentID || studentCourseData.LMSStudentID;
  
  if (!lmsStudentID) {
    console.log(`No LMSStudentID found for student ${studentKey} in course ${courseId}, attempting to fetch it`);
    
    // Get student email from studentCourseSummaries
    const summaryRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}`);
    const summarySnapshot = await summaryRef.once('value');
    
    if (!summarySnapshot.exists() || !summarySnapshot.val().StudentEmail) {
      console.error('Cannot fetch LMSStudentID: Student email not found in summary');
      return null;
    }
    
    const studentEmail = summarySnapshot.val().StudentEmail;
    
    try {
      // Try to fetch LMSStudentID from edge system
      lmsStudentID = await fetchLMSStudentID(studentEmail, courseId);
      console.log(`Successfully fetched LMSStudentID: ${lmsStudentID}`);
    } catch (error) {
      console.error(`Failed to fetch LMSStudentID: ${error.message}`);
      return null;
    }
  }
  
  // Ensure course and schedule data exists
  if (!courseData.units) {
    console.error('Course data is missing units array');
    return null;
  }
  
  if (!studentCourseData.ScheduleJSON?.units) {
    console.error('Student course data is missing ScheduleJSON.units array');
    return null;
  }
  
  // Generate normalized schedule
  const normalizedSchedule = await normalizeScheduleData(
    studentCourseData.ScheduleJSON.units,
    courseData,
    lmsStudentID,
    studentKey,
    courseId,
    courseData.weights
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
    itemCount: safeNormalized.totalItems
  };
}

/**
 * Checks if ltiLinksComplete is true for a course
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
 * Finds the courseId associated with an assessment
 */
async function findCourseIdFromAssessment(assessmentId) {
  const db = admin.database();
  
  try {
    // Convert assessmentId to string to ensure type matching
    const assessmentIdStr = String(assessmentId);
    
    // First try with string value
    let snapshot = await db.ref('lti/deep_links')
      .orderByChild('assessment_id')
      .equalTo(assessmentIdStr)
      .once('value');
    
    let deepLinks = snapshot.val();
    
    // If no results, try with numeric value
    if (!deepLinks) {
      const assessmentIdNum = Number(assessmentId);
      if (!isNaN(assessmentIdNum)) {
        snapshot = await db.ref('lti/deep_links')
          .orderByChild('assessment_id')
          .equalTo(assessmentIdNum)
          .once('value');
        deepLinks = snapshot.val();
      }
    }
    
    if (!deepLinks) {
      console.log(`No matching deep link found for assessment ID: ${assessmentId} (tried both string and number types)`);
      return null;
    }
    
    // Get the first matching deep link
    const deepLinkKey = Object.keys(deepLinks)[0];
    const courseId = deepLinks[deepLinkKey].course_id;
    
    console.log(`Found course ID: ${courseId} for assessment ID: ${assessmentId}`);
    return courseId;
    
  } catch (error) {
    console.error(`Error finding courseId for assessment ${assessmentId}:`, error);
    throw error;
  }
}

/**
 * Finds the student for a given LMSStudentID and courseId
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
    
    // Try with string LMSStudentID first
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
 * Main schedule normalization function with batch data fetching
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
  console.log('Starting schedule normalization');

  if (!scheduleUnits || !courseUnits || !LMSStudentID) {
    console.warn('Missing required parameters for schedule normalization');
    return null;
  }

  // Remove Schedule Information unit and get first real unit
  const activeUnits = scheduleUnits.filter(unit => unit.name !== 'Schedule Information');
  if (!activeUnits.length) {
    console.warn('No active units found after filtering');
    return null;
  }
  
  // Step 1: Collect all LTI deep_link_ids across all course items
  const ltiDeepLinkIds = [];
  courseUnits.forEach(unit => {
    unit.items.forEach(item => {
      if (item.lti?.enabled && item.lti?.deep_link_id) {
        ltiDeepLinkIds.push(item.lti.deep_link_id);
      }
    });
  });
  
  console.log(`Found ${ltiDeepLinkIds.length} LTI deep links to fetch`);
  
  // Step 2: Batch fetch all LTI deep link info at once
  const ltiInfoMap = await batchFetchLtiInfo(ltiDeepLinkIds);
  
  // Step 3: Extract assessment IDs from LTI info to batch fetch grades
  const assessmentIds = [];
  Object.values(ltiInfoMap).forEach(ltiInfo => {
    if (ltiInfo && ltiInfo.assessment_id) {
      assessmentIds.push(ltiInfo.assessment_id);
    }
  });
  
  console.log(`Found ${assessmentIds.length} assessment IDs to fetch grades for`);
  
  // Step 4: Batch fetch all assessment grades at once
  const gradesMap = await batchFetchAssessmentGrades(assessmentIds, LMSStudentID);
  
  // Now proceed with processing using our pre-fetched data
  let globalIndex = 0;
  const allItems = [];

  const result = await Promise.all(
    courseUnits.map(async (courseUnit, unitIndex) => {
      // Find matching schedule unit if it exists
      const scheduleUnit = activeUnits.find(u => u.sequence === courseUnit.sequence);

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

        // If this item has LTI enabled, retrieve its pre-fetched data
        if (courseItem.lti?.enabled && courseItem.lti?.deep_link_id) {
          const ltiInfo = ltiInfoMap[courseItem.lti.deep_link_id];

          if (ltiInfo && ltiInfo.assessment_id) {
            const gradeKey = `${ltiInfo.assessment_id}_${LMSStudentID}`;
            const assessmentGrades = gradesMap[gradeKey];

            if (assessmentGrades) {
              const processedItem = processAssessmentData(
                assessmentGrades,
                ltiInfo,
                baseItem
              );

              if (processedItem) {
                allItems.push(processedItem);
                return processedItem;
              }
            }
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

  // Try to update auto-status based on schedule adherence
  try {
    const db = admin.database();
    await updateStudentAutoStatus(db, studentEmailKey, courseId, scheduleAdherence);
    console.log(`Auto-status check completed for student: ${studentEmailKey}, course: ${courseId}`);
  } catch (error) {
    console.warn(`Auto-status update failed, but continuing with schedule normalization: ${error.message}`);
  }

  return finalResult;
}

/**
 * Batch fetch LTI deep link info for multiple deep_link_ids
 * @returns {Object} Map of deep_link_id to LTI info
 */
async function batchFetchLtiInfo(deepLinkIds) {
  if (!deepLinkIds || deepLinkIds.length === 0) {
    return {};
  }
 
  const db = admin.database();
  const resultMap = {};
  
  try {
    // Fetch all deep link info in one go
    const snapshot = await db.ref('lti/deep_links').once('value');
    const allDeepLinks = snapshot.val() || {};
    
    // Filter to just the ones we need
    deepLinkIds.forEach(id => {
      if (allDeepLinks[id]) {
        const data = allDeepLinks[id];
        resultMap[id] = {
          url: data.url,
          assessment_id: data.assessment_id,
          course_id: data.course_id,
          scoreMaximum: data.lineItem?.scoreMaximum,
        };
      }
    });
    
    console.log(`Successfully fetched ${Object.keys(resultMap).length}/${deepLinkIds.length} LTI deep links`);
  } catch (error) {
    console.error('Error batch fetching LTI info:', error);
  }
  
  return resultMap;
 }
 
 /**
 * Batch fetch assessment grades for multiple assessment IDs
 * @returns {Object} Map of assessment_id_LMSStudentID to grades
 */
 async function batchFetchAssessmentGrades(assessmentIds, LMSStudentID) {
  if (!assessmentIds || assessmentIds.length === 0 || !LMSStudentID) {
    return {};
  }
 
  const db = admin.database();
  const resultMap = {};
  
  try {
    // We could do one giant fetch of all grades, but that might be too much data
    // Instead, let's create a set of keys to fetch specifically
    const gradeKeys = assessmentIds.map(id => `${id}_${LMSStudentID}`);
    
    // Use a multi-path query to get exactly what we need in one go
    const promises = gradeKeys.map(key => 
      db.ref(`imathas_grades/${key}`).once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
            resultMap[key] = snapshot.val();
          }
        })
    );
    
    await Promise.all(promises);
    console.log(`Successfully fetched ${Object.keys(resultMap).length}/${assessmentIds.length} assessment grades`);
  } catch (error) {
    console.error('Error batch fetching assessment grades:', error);
  }
  
  return resultMap;
 }
 
 /**
 * Processes assessment data with grades and LTI info
 */
 function processAssessmentData(assessmentGrades, ltiInfo, baseItem) {
  if (!assessmentGrades || !ltiInfo) return null;
 
  const scoreMaximum = parseFloat(ltiInfo.scoreMaximum);
  const score = parseFloat(assessmentGrades.score);
  const scorePercent = scoreMaximum > 0 ? ((score / scoreMaximum) * 100).toFixed(1) : 0;
 
  // Skip decompressing scoreddata as it's not needed for normalization
 
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
 }
 
 /**
 * Calculates schedule adherence metrics
 */
 function calculateScheduleAdherence(allItems) {
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
 
 // Export all functions
 module.exports = {
  generateNormalizedSchedule,
  onGradeUpdateTriggerNormalizedSchedule,
  onLMSStudentIDAssignedTriggerSchedule
 };