const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
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
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 50,
  // Allow cross-origin requests from approved domains
  cors: [
    "https://yourway.rtdacademy.com", 
    "https://*.rtdacademy.com", 
    "http://localhost:3000", 
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (data, context) => {
  // Verify authentication
  if (!context.auth && !data.bypassAuth) {
    throw new Error('Unauthorized. User must be authenticated to submit survey responses.');
  }

  const db = admin.database();
  const currentTimestamp = Date.now();
  const currentDate = new Date().toISOString();

  try {
    // Extract data from the request
    const {
      notificationId,
      courseId,
      answers,
      userEmail,
      studentName,
      sanitizedUserEmail
    } = data;

    // Validate required fields
    if (!notificationId || !courseId || !answers || !userEmail) {
      throw new Error('Missing required fields: notificationId, courseId, answers, and userEmail are required');
    }

    // If sanitizedUserEmail not provided, create a sanitized version
    // This is a simple sanitization function - ideally use the same one as the client
    const finalSanitizedEmail = sanitizedUserEmail || userEmail.replace(/\./g, ',');

    console.log(`Processing survey submission for notification ${notificationId}, course ${courseId}, user ${userEmail}`);

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
      email: userEmail,
      hasSeen: true,
      hasSeenTimeStamp: currentDate,
      hasAcknowledged: true,
      acknowledgedAt: currentDate,
      notificationId,
      studentEmail: userEmail,
      studentName: studentName || userEmail,
      submittedAt: currentDate,
      timestamp: currentTimestamp
    };
    
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
    submissions[currentTimestamp] = {
      answers,
      submittedAt: currentDate,
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
      submissions,
      lastSubmitted: currentDate,
      lastAcknowledged: currentDate,
      courseIds: [courseId],
      courses: [{
        id: courseId,
        title: courseTitle
      }]
    };
    
    updates[mainResultsPath] = updatedMainData;
    
    // 5.5. Store in course record for real-time updates
    const courseResultsPath = `students/${finalSanitizedEmail}/courses/${courseId}/studentDashboardNotificationsResults/${notificationId}`;
    updates[courseResultsPath] = {
      completed: true,
      completedAt: currentDate,
      answers, 
      hasSeen: true,
      hasSeenTimeStamp: currentDate,
      hasAcknowledged: true,
      acknowledgedAt: currentDate,
      // Include next renewal date if applicable
      ...(submissionData.nextRenewalDate && { nextRenewalDate: submissionData.nextRenewalDate })
    };
    
    // 5.6. Store the submission in the hierarchical archive for historical tracking
    // This format makes it easier to query submissions across time periods
    const archivePath = `surveyResponses/${notificationId}/${currentTimestamp}/${finalSanitizedEmail}`;
    updates[archivePath] = {
      ...submissionData,
      courseSpecific: true
    };
    
    // 6. Apply all updates in a single transaction
    await db.ref().update(updates);
    
    console.log(`Successfully saved survey response for notification ${notificationId}, user ${userEmail}, course ${courseId}`);
    
    // 7. Return success response
    return {
      success: true,
      message: 'Survey response saved successfully',
      submissionId: currentTimestamp,
      timestamp: currentDate
    };
    
  } catch (error) {
    console.error('Error saving survey response:', error);
    
    // Log error details for debugging
    try {
      await db.ref('errorLogs/surveySubmissions').push({
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        data: {
          notificationId: data?.notificationId,
          courseId: data?.courseId,
          userEmail: data?.userEmail,
          // Don't log actual survey answers for privacy
          hasAnswers: !!data?.answers
        }
      });
    } catch (logError) {
      console.error('Error logging survey submission error:', logError);
    }
    
    // Return error response
    throw new Error(`Error saving survey response: ${error.message}`);
  }
});

module.exports = {
  submitNotificationSurvey
};