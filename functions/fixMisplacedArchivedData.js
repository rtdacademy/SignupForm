// functions/fixMisplacedArchivedData.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: fixMisplacedArchivedData
 * 
 * Fixes data that was incorrectly restored to previousCourse folder
 * instead of the root course level
 */
const fixMisplacedArchivedData = onCall({
  concurrency: 50,
  memory: '1GiB',
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000", "http://localhost:3001"]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const { studentEmail, courseId } = request.data;
  
  if (!studentEmail || !courseId) {
    throw new HttpsError('invalid-argument', 'Student email and course ID are required.');
  }

  const db = admin.database();
  
  // Sanitize the email for use as a database key
  const studentKey = sanitizeEmail(studentEmail);
  const coursePath = `/students/${studentKey}/courses/${courseId}`;
  
  console.log(`Checking for misplaced data at ${coursePath}/previousCourse`);
  
  try {
    // Check if there's data in previousCourse folder
    const previousCourseSnapshot = await db.ref(`${coursePath}/previousCourse`).once('value');
    const previousCourseData = previousCourseSnapshot.val();
    
    if (!previousCourseData) {
      return {
        success: false,
        message: 'No previousCourse data found to fix.',
        coursePath: coursePath
      };
    }
    
    // Check what's at the root level
    const rootSnapshot = await db.ref(coursePath).once('value');
    const rootData = rootSnapshot.val();
    
    // Check if root only has previousCourse (and maybe hasPreviousEnrollment)
    const rootKeys = rootData ? Object.keys(rootData) : [];
    const hasOnlyPreviousCourse = rootKeys.every(key => 
      key === 'previousCourse' || key === 'hasPreviousEnrollment'
    );
    
    if (!hasOnlyPreviousCourse && rootKeys.length > 2) {
      return {
        success: false,
        message: 'Root level has actual course data. Manual intervention may be needed.',
        rootKeys: rootKeys,
        coursePath: coursePath
      };
    }
    
    // Find the most recent timestamp in previousCourse
    const timestamps = Object.keys(previousCourseData).filter(key => !isNaN(key));
    
    if (timestamps.length === 0) {
      return {
        success: false,
        message: 'No timestamped data found in previousCourse folder.',
        coursePath: coursePath
      };
    }
    
    // Sort timestamps to get the most recent
    timestamps.sort((a, b) => parseInt(b) - parseInt(a));
    const mostRecentTimestamp = timestamps[0];
    
    console.log(`Found ${timestamps.length} archived enrollment(s). Most recent: ${mostRecentTimestamp}`);
    
    // Get the data from the most recent enrollment
    const dataToMove = previousCourseData[mostRecentTimestamp];
    
    if (!dataToMove) {
      return {
        success: false,
        message: `No data found at previousCourse/${mostRecentTimestamp}`,
        coursePath: coursePath
      };
    }
    
    // Remove the archivedMetadata that was added during incorrect restoration
    if (dataToMove.archivedMetadata) {
      console.log('Removing archivedMetadata from data before moving to root');
      delete dataToMove.archivedMetadata;
    }
    
    // Ensure ActiveFutureArchived is set correctly
    if (!dataToMove.ActiveFutureArchived) {
      dataToMove.ActiveFutureArchived = { Value: 'Active' };
    } else {
      dataToMove.ActiveFutureArchived.Value = 'Active';
    }
    
    // Move the data to root level
    console.log(`Moving data from previousCourse/${mostRecentTimestamp} to root level`);
    
    // Set the complete data at root level
    await db.ref(coursePath).set(dataToMove);
    
    // Verify the move was successful
    const verifySnapshot = await db.ref(coursePath).once('value');
    const verifiedData = verifySnapshot.val();
    
    if (!verifiedData || Object.keys(verifiedData).length === 0) {
      throw new Error('Failed to move data to root level');
    }
    
    // Update the studentCourseSummary to reflect the fix
    const summaryKey = `${studentKey}_${courseId}`;
    await db.ref(`studentCourseSummaries/${summaryKey}`).update({
      fixApplied: {
        fixedAt: admin.database.ServerValue?.TIMESTAMP || Date.now(),
        fixedBy: request.auth.uid,
        fixedByEmail: request.auth.token.email,
        movedFrom: `previousCourse/${mostRecentTimestamp}`,
        issue: 'Data was incorrectly restored to previousCourse folder'
      },
      ActiveFutureArchived_Value: 'Active'
    });
    
    console.log(`Successfully fixed misplaced data for ${summaryKey}`);
    
    return {
      success: true,
      message: `Successfully moved data from previousCourse/${mostRecentTimestamp} to root level.`,
      coursePath: coursePath,
      dataRestored: true,
      timestampsFound: timestamps.length,
      restoredFromTimestamp: mostRecentTimestamp
    };
    
  } catch (error) {
    console.error('Error fixing misplaced data:', error);
    
    // Log the error
    await db.ref('errorLogs/fixMisplacedData').push({
      studentEmail,
      courseId,
      coursePath,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      triggeredBy: request.auth.uid
    });
    
    throw new HttpsError('internal', 'Failed to fix misplaced data. ' + error.message);
  }
});

module.exports = fixMisplacedArchivedData;