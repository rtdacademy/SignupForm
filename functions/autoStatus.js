const admin = require('firebase-admin');
const functions = require('firebase-functions/v1');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Determines the appropriate status based on schedule adherence metrics
 * 
 * @param {Object} scheduleAdherence - The schedule adherence object from normalizedSchedule
 * @returns {String} The appropriate status value
 */
function determineAutoStatus(scheduleAdherence) {
  if (!scheduleAdherence) return null;
  
  const { lessonsOffset, lastCompletedDate } = scheduleAdherence;
  
  // First priority: Check for activity timeout
  if (lastCompletedDate) {
    const lastCompletedTimestamp = typeof lastCompletedDate === 'string' 
      ? new Date(lastCompletedDate).getTime() 
      : lastCompletedDate;
    
    const daysSinceActivity = (Date.now() - lastCompletedTimestamp) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity > 14) {
      return "Not Active";
    }
  }
  
  // Second priority: Determine status based on lessons offset
  if (lessonsOffset >= 3) {
    return "Rocking it!";
  } else if (lessonsOffset >= -2) {  // Changed from -1 to -2
    return "On Track";
  } else if (lessonsOffset >= -4) {
    return "⚠️ Behind";
  } else {
    return "❗ Behind";
  }
}

/**
 * Update student auto status (without changing the actual status)
 * 
 * @param {Object} db - Firebase database reference
 * @param {String} studentKey - Student key
 * @param {String} courseId - Course ID
 * @param {Object} scheduleAdherence - Schedule adherence metrics
 * @returns {Promise} A promise that resolves when the status update is complete
 */
async function updateStudentAutoStatus(db, studentKey, courseId, scheduleAdherence) {
  try {
    // Get current actual status for reference
    const currentStatusRef = db.ref(`students/${studentKey}/courses/${courseId}/Status/Value`);
    const currentStatusSnapshot = await currentStatusRef.once('value');
    const currentStatus = currentStatusSnapshot.val();
    
    // Get current auto-status value (if it exists)
    const currentAutoStatusRef = db.ref(`students/${studentKey}/courses/${courseId}/autoStatus/Value`);
    const currentAutoStatusSnapshot = await currentAutoStatusRef.once('value');
    const currentAutoStatus = currentAutoStatusSnapshot.val();
    
    // Determine new auto-status
    const newAutoStatus = determineAutoStatus(scheduleAdherence);
    
    // Only update if we have a valid new status that differs from current auto-status
    if (newAutoStatus && newAutoStatus !== currentAutoStatus) {
      console.log(`Auto-status for student ${studentKey} in course ${courseId}: "${newAutoStatus}" (current actual status: "${currentStatus}")`);
      
      const timestamp = new Date().toISOString();
      
      // Update both status values in a single transaction
      const updates = {};
      
      // Update in students node
      updates[`students/${studentKey}/courses/${courseId}/autoStatus/Value`] = newAutoStatus;
      updates[`students/${studentKey}/courses/${courseId}/autoStatus/timestamp`] = timestamp;
      updates[`students/${studentKey}/courses/${courseId}/autoStatus/previousStatus`] = currentAutoStatus || '';
      
      // Also update in studentCourseSummaries for quicker access
      updates[`studentCourseSummaries/${studentKey}_${courseId}/autoStatus_Value`] = newAutoStatus;
      updates[`studentCourseSummaries/${studentKey}_${courseId}/autoStatus_timestamp`] = timestamp;
      updates[`studentCourseSummaries/${studentKey}_${courseId}/autoStatus_previousStatus`] = currentAutoStatus || '';
      
      return db.ref().update(updates);
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating auto-status for student ${studentKey} in course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Process all students' auto-statuses
 * 
 * @returns {Promise} A promise that resolves when all status updates are complete
 */
async function processAllAutoStatuses() {
  const db = admin.database();
  
  try {
    console.log('Starting batch auto-status update for all students');
    
    // Get all students
    const studentsRef = db.ref('students');
    const studentsSnapshot = await studentsRef.once('value');
    const students = studentsSnapshot.val() || {};
    
    let updatedCount = 0;
    let processedCount = 0;
    const updatePromises = [];
    
    // Process each student
    Object.entries(students).forEach(([studentKey, studentData]) => {
      if (!studentData.courses) return;
      
      // Process each course
      Object.entries(studentData.courses).forEach(([courseId, courseData]) => {
        // Skip if no normalized schedule
        if (!courseData.normalizedSchedule?.scheduleAdherence) {
          return;
        }
        
        processedCount++;
        
        // Schedule an update
        updatePromises.push(
          updateStudentAutoStatus(
            db, 
            studentKey, 
            courseId, 
            courseData.normalizedSchedule.scheduleAdherence
          ).then(result => {
            if (result !== null) updatedCount++;
            return result;
          })
        );
      });
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    console.log(`Auto-status update complete. Processed ${processedCount} courses, updated ${updatedCount} auto-statuses.`);
    
    return {
      success: true,
      processed: processedCount,
      updated: updatedCount
    };
  } catch (error) {
    console.error('Error processing auto-statuses:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  determineAutoStatus,
  updateStudentAutoStatus,
  processAllAutoStatuses
};