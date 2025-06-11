const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

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
 * Cloud Function: submitNotificationSurvey
 * 
 * Handles saving survey responses for student dashboard notifications
 * This function receives survey responses from students and saves them
 * to the appropriate locations in the database with admin privileges.
 * 
 * This solves permission issues where students may not have write access
 * to certain parts of the database structure.
 */
const submitNotificationSurvey = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 50,
  // Don't enforce app check in emulator mode
  enforceAppCheck: false,
  // Allow cross-origin requests from approved domains
  cors: [
    "https://yourway.rtdacademy.com", 
    "https://*.rtdacademy.com", 
    "http://localhost:3000", 
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request, context) => {
  // Access the data field from the request object
  // Check the structure of the request object and safely extract data
  let data;
  
  if (typeof request === 'object' && request !== null) {
    if (request.data) {
      // V2 structure: {data: {our fields}}
      data = request.data;
    } else {
      // Direct structure: {our fields}
      data = request;
    }
  } else {
    // Default to an empty object if request is not an object
    data = {};
  }
  
  // Always log the raw input data to help debug issues
  console.log('⚠️ FUNCTION RAW DATA:', {
    operation: data?.operation || 'submit_survey',
    notificationId: data?.notificationId || 'missing',
    courseId: data?.courseId || 'missing',
    courseIds: data?.courseIds || 'missing',
    userEmail: data?.userEmail ? '(Email provided)' : 'MISSING',
    hasAnswers: !!data?.answers,
    answerCount: data?.answers ? Object.keys(data.answers).length : 0,
    requestType: typeof request
  });
  
  // Log additional info
  console.log('Request structure:', {
    hasDataField: request && typeof request === 'object' && 'data' in request,
    topLevelKeys: request && typeof request === 'object' ? Object.keys(request) : []
  });
  
  // Check if we're running in the emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  
  // Only log simple authentication status - avoid stringifying the entire context
  const authStatus = context?.auth ? "Authenticated" : "Not authenticated";
  console.log(`⚠️ FUNCTION CONTEXT: ${authStatus}, isEmulator: ${isEmulator}`);
  
  // Log authentication details if available
  if (context?.auth) {
    console.log(`⚠️ AUTH UID: ${context.auth.uid || 'none'}`);
    console.log(`⚠️ AUTH EMAIL: ${context.auth.token?.email || 'none'}`);
  }
  
  // If running in emulator without auth, log a warning
  if (isEmulator && !context.auth) {
    console.log('⚠️ WARNING: Running in emulator mode with authentication bypassed');
  }

  const db = admin.database();
  const currentTimestamp = Date.now();
  const currentDate = new Date().toISOString();

  try {
    // Determine operation type
    const operation = data?.operation || 'submit_survey';
    
    // Create a safe copy of data to log - avoid circular references
    console.log("Data received by function:", {
      operation: operation,
      hasNotificationId: !!data?.notificationId,
      hasCourseId: !!data?.courseId,
      hasCourseIds: !!data?.courseIds,
      hasAnswers: !!data?.answers,
      hasUserEmail: !!data?.userEmail,
      hasStudentName: !!data?.studentName,
      dataType: typeof data
    });
    
    // Extract common data from the request
    let notificationId = data?.notificationId;
    let courseId = data?.courseId;
    let courseIds = data?.courseIds;
    let answers = data?.answers;
    let userEmail = data?.userEmail;
    let studentName = data?.studentName;
    
    // Route to appropriate handler based on operation
    switch (operation) {
      case 'mark_seen':
        return await handleMarkSeen({
          notificationId,
          courseIds,
          userEmail,
          db,
          currentTimestamp,
          currentDate
        });
        
      case 'acknowledge':
        return await handleAcknowledge({
          notificationId,
          courseIds,
          userEmail,
          db,
          currentTimestamp,
          currentDate
        });
        
      case 'submit_survey':
      default:
        // Continue with existing survey submission logic
        break;
    }
    
    console.log("Extracted data types:", {
      notificationIdType: typeof notificationId,
      courseIdType: typeof courseId,
      answersType: typeof answers,
      userEmailType: typeof userEmail,
      studentNameType: typeof studentName
    });
    
    // Validate all required fields
    if (!notificationId) {
      throw new Error('Missing required field: notificationId is required');
    }
    
    if (!courseId) {
      throw new Error('Missing required field: courseId is required');
    }
    
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      throw new Error('Missing required field: answers must be a non-empty object');
    }
    
    if (!userEmail) {
      throw new Error('Missing required field: userEmail is required');
    }
    
    // Use the utility function to properly sanitize the email
    const finalUserEmail = userEmail;
    const finalSanitizedEmail = sanitizeEmail(userEmail);
    
    // Log data for debugging
    console.log(`Processing survey submission for notification ${notificationId}, course ${courseId}, user ${finalUserEmail}`);
    console.log('Answers provided:', Object.keys(answers).length);

    // 0. Fetch notification details to check type and configuration
    const notificationRef = db.ref(`studentDashboardNotifications/${notificationId}`);
    const notificationSnapshot = await notificationRef.once('value');
    
    if (!notificationSnapshot.exists()) {
      throw new Error(`Notification ${notificationId} not found`);
    }
    
    const notification = notificationSnapshot.val();
    
    // 1. Fetch course details to include in submission
    let courseTitle = `Course ${courseId}`;
    try {
      const courseRef = db.ref(`courses/${courseId}`);
      const courseSnapshot = await courseRef.once('value');
      if (courseSnapshot.exists()) {
        courseTitle = courseSnapshot.val().Title || courseTitle;
      }
    } catch (error) {
      console.warn(`Could not fetch course title for ${courseId}:`, error.message);
      // Continue with default course title
    }
    
    // 2. Prepare the submission data
    const submissionData = {
      answers,
      courseId,
      courseName: courseTitle,
      completed: true,
      completedAt: currentDate,
      email: finalUserEmail,
      hasSeen: true,
      hasSeenTimeStamp: currentDate,
      hasAcknowledged: true,
      acknowledgedAt: currentDate,
      notificationId,
      studentEmail: finalUserEmail,
      studentName: studentName || finalUserEmail,
      submittedAt: currentDate,
      timestamp: currentTimestamp
    };
    
    // Log individual fields for debugging
    console.log('Submission data preparing:');
    console.log('- CourseId:', courseId);
    console.log('- CourseName:', courseTitle);
    console.log('- NotificationId:', notificationId);
    console.log('- Email:', finalUserEmail);
    console.log('- SanitizedEmail:', finalSanitizedEmail);
    console.log('- Timestamp:', currentDate);
    console.log('- Has answers object:', !!answers);
    
    // 3. Determine display frequency for renewal configuration
    let displayFrequency = 'one-time';
    if (notification.displayConfig && notification.displayConfig.frequency) {
      displayFrequency = notification.displayConfig.frequency;
    } else if (notification.type === 'weekly-survey') {
      displayFrequency = 'weekly';
    } else if (notification.renewalConfig) {
      if (notification.renewalConfig.method === 'day') {
        displayFrequency = 'weekly';
      } else if (notification.renewalConfig.method === 'custom') {
        displayFrequency = 'custom';
      }
    }
    
    submissionData.displayFrequency = displayFrequency;
    
    // 4. Calculate next renewal date for recurring notifications
    if (displayFrequency === 'weekly') {
      // Get the target day of week (default to Monday if not specified)
      const dayOfWeek = 
        (notification.displayConfig && notification.displayConfig.dayOfWeek) || 
        (notification.renewalConfig && notification.renewalConfig.dayOfWeek) || 
        'monday';
        
      // Convert day name to day number (0-6, where 0 is Sunday)
      const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
        'thursday': 4, 'friday': 5, 'saturday': 6
      };
      const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1;
        
      // Start with today's date
      let nextRenewalDate = new Date();
        
      // Add days until we reach the target day of the week
      while (nextRenewalDate.getDay() !== targetDayNum) {
        nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
      }
        
      // If today is already the target day, add 7 days to get to next week
      if (nextRenewalDate.getDay() === new Date().getDay()) {
        nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
      }
        
      // Store the next renewal date
      submissionData.nextRenewalDate = nextRenewalDate.toISOString();
      console.log(`Set next renewal date to ${submissionData.nextRenewalDate} for ${dayOfWeek}`);
    }
    
    // 5. Build database updates - using a single simplified structure
    const updates = {};
    
    // 5.1. Store the latest submission data in the main path
    const mainResultsPath = `studentDashboardNotificationsResults/${notificationId}/${finalSanitizedEmail}`;
    
    // 5.2. First get any existing data to preserve history
    const existingDataSnapshot = await db.ref(mainResultsPath).once('value');
    const existingData = existingDataSnapshot.exists() ? existingDataSnapshot.val() : {};
    
    // 5.3. Prepare submissions history
    let submissions = existingData.submissions || {};
    
    // Make sure answers is an object and not undefined
    const safeAnswers = typeof answers === 'object' && answers !== null ? 
      JSON.parse(JSON.stringify(answers)) : // Deep clone to avoid circular references
      { 'placeholder': 'No answers provided' };
    
    // Create a detailed submission entry with course information
    submissions[currentTimestamp] = {
      answers: safeAnswers,
      submittedAt: currentDate,
      courseId: courseId, // Add the specific courseId for this submission
      courseIds: [courseId],
      courses: [{
        id: courseId,
        title: courseTitle
      }],
      hasAcknowledged: true,
      acknowledgedAt: currentDate
    };
    
    // 5.4. Create updated record with submission history
    const updatedMainData = {
      ...existingData,
      ...submissionData,
      // Replace answers with safeAnswers
      answers: safeAnswers,
      submissions,
      lastSubmitted: currentDate,
      lastAcknowledged: currentDate,
      courseId: courseId, // Add single courseId field
      courseIds: [courseId],
      courses: [{
        id: courseId,
        title: courseTitle
      }],
      // Include a lastCourseId field for easy reference
      lastCourseId: courseId
    };
    
    updates[mainResultsPath] = updatedMainData;
    
    // 5.5. Store in course record for real-time updates
    const courseResultsPath = `students/${finalSanitizedEmail}/courses/${courseId}/studentDashboardNotificationsResults/${notificationId}`;
    updates[courseResultsPath] = {
      completed: true,
      completedAt: currentDate,
      answers: safeAnswers,
      hasSeen: true,
      hasSeenTimeStamp: currentDate,
      hasAcknowledged: true,
      acknowledgedAt: currentDate,
      // Include the courseId directly in the course record for consistency
      courseId: courseId,
      submittedForCourse: courseId,
      courseTitle: courseTitle,
      // Include next renewal date if applicable
      ...(submissionData.nextRenewalDate && { nextRenewalDate: submissionData.nextRenewalDate })
    };
    
    // 5.6. Store the submission in the hierarchical archive for historical tracking
    // This format makes it easier to query submissions across time periods
    const archivePath = `surveyResponses/${notificationId}/${currentTimestamp}/${finalSanitizedEmail}`;
    
    // Create a sanitized copy of submissionData without circular references
    const archiveData = {
      notificationId,
      courseId,
      courseName: courseTitle,
      answers: safeAnswers,
      email: finalUserEmail,
      studentEmail: finalUserEmail,
      studentName: submissionData.studentName || finalUserEmail,
      submittedAt: currentDate,
      timestamp: currentTimestamp,
      completed: true,
      completedAt: currentDate,
      courseSpecific: true,
      // Include more detailed course information for easier querying
      course: {
        id: courseId,
        title: courseTitle
      },
      // Additional course-related fields for consistency
      submittedForCourse: courseId,
      courseTitle: courseTitle
    };
    
    updates[archivePath] = archiveData;
    
    // Log update paths for debugging
    console.log('Database updates will be applied to these paths:');
    Object.keys(updates).forEach(path => {
      console.log(`- ${path}`);
    });
    
    // 6. Apply all updates using individual writes (more secure than root-level update)
    console.log(`Applying ${Object.keys(updates).length} database updates...`);
    for (const [path, data] of Object.entries(updates)) {
      try {
        await db.ref(path).set(data);
        console.log(`✓ Successfully updated: ${path}`);
      } catch (writeError) {
        console.error(`✗ Failed to update ${path}:`, writeError.message);
        throw new Error(`Failed to update ${path}: ${writeError.message}`);
      }
    }
    
    console.log(`Successfully saved survey response for notification ${notificationId}, user ${finalUserEmail}, course ${courseId}`);
    
    // 7. Return success response
    return {
      success: true,
      message: 'Survey response saved successfully',
      submissionId: currentTimestamp,
      timestamp: currentDate
    };
    
  } catch (error) {
    console.error('Error saving survey response:', error);
    
    // Log error details to database
    try {
      const errorRef = db.ref('errorLogs/surveySubmissions');
      await errorRef.push({
        error: error.message || 'Unknown error',
        timestamp: getServerTimestamp(),
        notificationId: data?.notificationId || 'none',
        courseId: data?.courseId || 'none',
        // Don't log user email for privacy
        hasUserEmail: !!data?.userEmail
      });
    } catch (logError) {
      console.error('Error logging survey submission error:', logError);
    }
    
    // Return error response
    throw new Error(`Error saving survey response: ${error.message}`);
  }
});

// Helper function to handle marking notifications as seen
async function handleMarkSeen({ notificationId, courseIds, userEmail, db, currentTimestamp, currentDate }) {
  console.log(`Processing mark_seen operation for notification ${notificationId}, user ${userEmail}`);
  
  // Validate required fields
  if (!notificationId) {
    throw new Error('Missing required field: notificationId is required');
  }
  if (!userEmail) {
    throw new Error('Missing required field: userEmail is required');
  }
  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    throw new Error('Missing required field: courseIds must be a non-empty array');
  }

  const { sanitizeEmail } = require('./utils');
  const finalSanitizedEmail = sanitizeEmail(userEmail);
  
  const updates = {};
  
  // Update main notification results
  const mainResultsPath = `studentDashboardNotificationsResults/${notificationId}/${finalSanitizedEmail}`;
  const existingDataRef = db.ref(mainResultsPath);
  const existingDataSnapshot = await existingDataRef.once('value');
  const existingData = existingDataSnapshot.exists() ? existingDataSnapshot.val() : {};
  
  updates[mainResultsPath] = {
    ...existingData,
    hasSeen: true,
    hasSeenTimeStamp: currentDate,
    timestamp: currentTimestamp
  };
  
  // Update each course-specific path
  for (const courseId of courseIds) {
    const courseResultsPath = `students/${finalSanitizedEmail}/courses/${courseId}/studentDashboardNotificationsResults/${notificationId}`;
    const courseDataRef = db.ref(courseResultsPath);
    const courseDataSnapshot = await courseDataRef.once('value');
    const courseData = courseDataSnapshot.exists() ? courseDataSnapshot.val() : {};
    
    updates[courseResultsPath] = {
      ...courseData,
      hasSeen: true,
      hasSeenTimeStamp: currentDate,
      courseId: courseId,
      submittedForCourse: courseId,
      timestamp: currentTimestamp
    };
  }
  
  // Apply all updates
  console.log(`Applying ${Object.keys(updates).length} mark_seen updates...`);
  for (const [path, data] of Object.entries(updates)) {
    try {
      await db.ref(path).set(data);
      console.log(`✓ Successfully marked seen: ${path}`);
    } catch (writeError) {
      console.error(`✗ Failed to mark seen ${path}:`, writeError.message);
      throw new Error(`Failed to mark seen ${path}: ${writeError.message}`);
    }
  }
  
  console.log(`Successfully marked notification ${notificationId} as seen for user ${userEmail}`);
  
  return {
    success: true,
    message: 'Notification marked as seen successfully',
    timestamp: currentDate
  };
}

// Helper function to handle acknowledging notifications
async function handleAcknowledge({ notificationId, courseIds, userEmail, db, currentTimestamp, currentDate }) {
  console.log(`Processing acknowledge operation for notification ${notificationId}, user ${userEmail}`);
  
  // Validate required fields
  if (!notificationId) {
    throw new Error('Missing required field: notificationId is required');
  }
  if (!userEmail) {
    throw new Error('Missing required field: userEmail is required');
  }
  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    throw new Error('Missing required field: courseIds must be a non-empty array');
  }

  const { sanitizeEmail } = require('./utils');
  const finalSanitizedEmail = sanitizeEmail(userEmail);
  
  const updates = {};
  
  // Update main notification results
  const mainResultsPath = `studentDashboardNotificationsResults/${notificationId}/${finalSanitizedEmail}`;
  const existingDataRef = db.ref(mainResultsPath);
  const existingDataSnapshot = await existingDataRef.once('value');
  const existingData = existingDataSnapshot.exists() ? existingDataSnapshot.val() : {};
  
  updates[mainResultsPath] = {
    ...existingData,
    hasSeen: true,
    hasSeenTimeStamp: currentDate,
    hasAcknowledged: true,
    acknowledgedAt: currentDate,
    timestamp: currentTimestamp
  };
  
  // Update each course-specific path
  for (const courseId of courseIds) {
    const courseResultsPath = `students/${finalSanitizedEmail}/courses/${courseId}/studentDashboardNotificationsResults/${notificationId}`;
    const courseDataRef = db.ref(courseResultsPath);
    const courseDataSnapshot = await courseDataRef.once('value');
    const courseData = courseDataSnapshot.exists() ? courseDataSnapshot.val() : {};
    
    updates[courseResultsPath] = {
      ...courseData,
      hasSeen: true,
      hasSeenTimeStamp: currentDate,
      hasAcknowledged: true,
      acknowledgedAt: currentDate,
      courseId: courseId,
      submittedForCourse: courseId,
      timestamp: currentTimestamp
    };
  }
  
  // Apply all updates
  console.log(`Applying ${Object.keys(updates).length} acknowledge updates...`);
  for (const [path, data] of Object.entries(updates)) {
    try {
      await db.ref(path).set(data);
      console.log(`✓ Successfully acknowledged: ${path}`);
    } catch (writeError) {
      console.error(`✗ Failed to acknowledge ${path}:`, writeError.message);
      throw new Error(`Failed to acknowledge ${path}: ${writeError.message}`);
    }
  }
  
  console.log(`Successfully acknowledged notification ${notificationId} for user ${userEmail}`);
  
  return {
    success: true,
    message: 'Notification acknowledged successfully',
    timestamp: currentDate
  };
}

module.exports = {
  submitNotificationSurvey
};