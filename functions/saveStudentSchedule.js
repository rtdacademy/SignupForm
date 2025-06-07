// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function: saveStudentSchedule
 * Allows students to save their YourWay schedules securely
 */
const saveStudentSchedule = onCall({
  memory: '512MiB',
  timeoutSeconds: 120,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { scheduleData, courseId, isScheduleUpdate = false, note } = data.data;
  const uid = data.auth.uid;
  const userEmail = data.auth.token.email;
  const studentEmailKey = sanitizeEmail(userEmail);

  if (!scheduleData || !courseId) {
    throw new HttpsError('invalid-argument', 'Missing required schedule data or course ID');
  }

  const db = admin.database();
  
  try {
    // Verify student exists and owns this course enrollment
    const studentCourseRef = db.ref(`students/${studentEmailKey}/courses/${courseId}`);
    const studentCourseSnapshot = await studentCourseRef.once('value');
    
    if (!studentCourseSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student course enrollment not found');
    }
    
    const courseData = studentCourseSnapshot.val();
    
    // Verify this is the correct student by checking email and UID
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const profile = profileSnapshot.val();
    if (profile.StudentEmail !== userEmail || profile.uid !== uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }

    // Validate schedule data structure
    if (!scheduleData.startDate || !scheduleData.endDate || !scheduleData.units) {
      throw new HttpsError('invalid-argument', 'Invalid schedule data structure');
    }

    // Check remaining schedules for new schedules (not updates)
    let completeSchedule;
    const scheduleRef = db.ref(`students/${studentEmailKey}/courses/${courseId}/ScheduleJSON`);
    
    if (isScheduleUpdate) {
      // For schedule updates, ALWAYS fetch current value from database and preserve it
      // Never trust client-side values for remainingSchedules
      const existingScheduleSnapshot = await scheduleRef.once('value');
      const existingRemainingSchedules = existingScheduleSnapshot.exists() 
        ? (existingScheduleSnapshot.val().remainingSchedules !== undefined 
           ? existingScheduleSnapshot.val().remainingSchedules 
           : 2)
        : 2;

      console.log(`Schedule update - preserving remaining schedules from database: ${existingRemainingSchedules}`);

      // Create a clean copy without any existing remainingSchedules property from client
      const { remainingSchedules: _, ...cleanScheduleData } = scheduleData;
      
      completeSchedule = {
        ...cleanScheduleData,
        remainingSchedules: existingRemainingSchedules,
        updatedViaValidation: true,
        updatedBy: userEmail,
        updatedAt: new Date().toISOString()
      };
    } else {
      // For new schedules, ALWAYS fetch current value from database and decrement by 1
      // Never trust client-side values for remainingSchedules
      const existingScheduleSnapshot = await scheduleRef.once('value');
      let currentRemainingSchedules;
      
      if (existingScheduleSnapshot.exists()) {
        const existingSchedule = existingScheduleSnapshot.val();
        // Get the current value from database, default to 2 if undefined
        currentRemainingSchedules = existingSchedule.remainingSchedules !== undefined 
          ? existingSchedule.remainingSchedules
          : 2;
      } else {
        // No existing schedule, start with default of 2
        currentRemainingSchedules = 2;
      }
      
      console.log(`Current remaining schedules from database: ${currentRemainingSchedules}`);
      
      if (currentRemainingSchedules <= 0) {
        throw new HttpsError('failed-precondition', 'No remaining schedules left to save');
      }
      
      // Calculate new value by decrementing database value by 1
      const newRemainingSchedules = currentRemainingSchedules - 1;
      console.log(`Setting remaining schedules to: ${newRemainingSchedules}`);
      
      // Create a clean copy without any existing remainingSchedules property from client
      const { remainingSchedules: _, ...cleanScheduleData } = scheduleData;
      
      completeSchedule = {
        ...cleanScheduleData,
        remainingSchedules: newRemainingSchedules,
        createdBy: userEmail,
        createdAt: new Date().toISOString()
      };
    }

    // Prepare the database updates
    const updates = {};
    
    // Save the complete schedule
    updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleJSON`] = completeSchedule;
    
    // Save start and end dates separately for compatibility
    updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleStartDate`] = scheduleData.startDate;
    updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleEndDate`] = scheduleData.endDate;
    
    // Add student note if provided
    if (note && note.content) {
      const notesRef = db.ref(`students/${studentEmailKey}/courses/${courseId}/jsonStudentNotes`);
      const existingNotesSnapshot = await notesRef.once('value');
      const existingNotes = existingNotesSnapshot.exists() ? existingNotesSnapshot.val() : [];
      
      const newNote = {
        id: `note-${Date.now()}`,
        content: note.content,
        timestamp: new Date().toISOString(),
        author: note.author || userEmail,
        noteType: note.noteType || '📅',
      };
      
      const updatedNotes = [newNote, ...(Array.isArray(existingNotes) ? existingNotes : Object.values(existingNotes))];
      updates[`students/${studentEmailKey}/courses/${courseId}/jsonStudentNotes`] = updatedNotes;
    }
    
    // Save diploma choices if provided
    if (scheduleData.diplomaMonth) {
      const diplomaValue = scheduleData.diplomaMonth.alreadyWrote 
        ? "Already Wrote" 
        : scheduleData.diplomaMonth.month;
      
      updates[`students/${studentEmailKey}/courses/${courseId}/DiplomaMonthChoices`] = {
        Id: 1,
        Value: diplomaValue
      };
    }

    // Perform all updates atomically
    await db.ref().update(updates);
    
    return {
      success: true,
      message: `Schedule ${isScheduleUpdate ? 'updated' : 'saved'} successfully`,
      remainingSchedules: completeSchedule.remainingSchedules,
      scheduleData: completeSchedule
    };
    
  } catch (error) {
    console.error('Error saving student schedule:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to save schedule');
  }
});

// Export the function
module.exports = {
  saveStudentSchedule
};