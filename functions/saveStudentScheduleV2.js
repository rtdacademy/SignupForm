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
 * Cloud Function: saveStudentScheduleV2
 * Enhanced version that supports both traditional and new course structure formats
 * Automatically detects format and saves schedule data appropriately
 */
const saveStudentScheduleV2 = onCall({
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

    // Detect which format we're working with
    const courseStructureRef = db.ref(`students/${studentEmailKey}/courses/${courseId}/Gradebook/courseStructure`);
    const courseStructureSnapshot = await courseStructureRef.once('value');
    const hasNewFormat = courseStructureSnapshot.exists();
    
    console.log(`Course format detected: ${hasNewFormat ? 'NEW' : 'TRADITIONAL'} for course ${courseId}`);

    // Handle remaining schedules logic (same for both formats)
    let completeSchedule;
    const scheduleRef = db.ref(`students/${studentEmailKey}/courses/${courseId}/ScheduleJSON`);
    
    if (isScheduleUpdate) {
      // For schedule updates, preserve existing remainingSchedules from database
      const existingScheduleSnapshot = await scheduleRef.once('value');
      const existingRemainingSchedules = existingScheduleSnapshot.exists() 
        ? (existingScheduleSnapshot.val().remainingSchedules !== undefined 
           ? existingScheduleSnapshot.val().remainingSchedules 
           : 2)
        : 2;

      console.log(`Schedule update - preserving remaining schedules: ${existingRemainingSchedules}`);

      const { remainingSchedules: _, ...cleanScheduleData } = scheduleData;
      
      completeSchedule = {
        ...cleanScheduleData,
        remainingSchedules: existingRemainingSchedules,
        updatedViaValidation: true,
        updatedBy: userEmail,
        updatedAt: new Date().toISOString()
      };
    } else {
      // For new schedules, decrement remainingSchedules
      const existingScheduleSnapshot = await scheduleRef.once('value');
      let currentRemainingSchedules;
      
      if (existingScheduleSnapshot.exists()) {
        const existingSchedule = existingScheduleSnapshot.val();
        currentRemainingSchedules = existingSchedule.remainingSchedules !== undefined 
          ? existingSchedule.remainingSchedules
          : 2;
      } else {
        currentRemainingSchedules = 2;
      }
      
      console.log(`Current remaining schedules: ${currentRemainingSchedules}`);
      
      if (currentRemainingSchedules <= 0) {
        throw new HttpsError('failed-precondition', 'No remaining schedules left to save');
      }
      
      const newRemainingSchedules = currentRemainingSchedules - 1;
      console.log(`Setting remaining schedules to: ${newRemainingSchedules}`);
      
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
    
    // Choose saving strategy based on format
    if (hasNewFormat) {
      console.log('Saving with enhanced new format strategy');
      await saveToNewFormat(updates, completeSchedule, courseId, studentEmailKey, db);
    } else {
      console.log('Saving with traditional format strategy');
      await saveToTraditionalFormat(updates, completeSchedule, courseId, studentEmailKey);
    }
    
    // Add student note if provided (same for both formats)
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
    
    // Save diploma choices if provided (same for both formats)
    if (completeSchedule.diplomaMonth) {
      const diplomaValue = completeSchedule.diplomaMonth.alreadyWrote 
        ? "Already Wrote" 
        : completeSchedule.diplomaMonth.month;
      
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
      scheduleData: completeSchedule,
      formatUsed: hasNewFormat ? 'enhanced' : 'traditional'
    };
    
  } catch (error) {
    console.error('Error saving student schedule:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to save schedule');
  }
});

/**
 * Save schedule using enhanced new format
 * Adds dates directly to courseStructure items for better integration
 */
async function saveToNewFormat(updates, scheduleData, courseId, studentEmailKey, db) {
  // Save standard schedule data
  updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleJSON`] = scheduleData;
  updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleStartDate`] = scheduleData.startDate;
  updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleEndDate`] = scheduleData.endDate;

  // Enhanced: Add scheduled dates directly to courseStructure items
  if (scheduleData._sourceFormat === 'new' && scheduleData.units) {
    console.log('Adding schedule dates to courseStructure items');
    
    for (const unit of scheduleData.units) {
      if (unit.unitId && unit.items) {
        for (const item of unit.items) {
          if (item.itemId && item.date) {
            // Add scheduled date to the courseStructure item
            updates[`students/${studentEmailKey}/courses/${courseId}/Gradebook/courseStructure/units/${unit.unitId}/items/${item.itemId}/scheduledDate`] = item.date;
            
            // Add estimated minutes if available
            if (item.estimatedMinutes) {
              updates[`students/${studentEmailKey}/courses/${courseId}/Gradebook/courseStructure/units/${unit.unitId}/items/${item.itemId}/estimatedMinutes`] = item.estimatedMinutes;
            }
            
            // Add schedule metadata
            updates[`students/${studentEmailKey}/courses/${courseId}/Gradebook/courseStructure/units/${unit.unitId}/items/${item.itemId}/scheduleMetadata`] = {
              scheduledAt: new Date().toISOString(),
              scheduleSource: 'YourWay Schedule Builder V2'
            };
          }
        }
      }
    }
    
    // Add schedule metadata to courseStructure root
    updates[`students/${studentEmailKey}/courses/${courseId}/Gradebook/courseStructure/scheduleInfo`] = {
      lastScheduled: new Date().toISOString(),
      startDate: scheduleData.startDate,
      endDate: scheduleData.endDate,
      scheduledBy: scheduleData.createdBy || scheduleData.updatedBy,
      version: 'v2'
    };
  }
}

/**
 * Save schedule using traditional format
 * Standard approach for backward compatibility
 */
async function saveToTraditionalFormat(updates, scheduleData, courseId, studentEmailKey) {
  // Save standard schedule data (traditional approach)
  updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleJSON`] = scheduleData;
  updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleStartDate`] = scheduleData.startDate;
  updates[`students/${studentEmailKey}/courses/${courseId}/ScheduleEndDate`] = scheduleData.endDate;
}

// Export the function
module.exports = {
  saveStudentScheduleV2
};