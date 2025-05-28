// functions/profileHistory.js
const { onValueWritten } = require('firebase-functions/v2/database');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Track profile changes and maintain history
const trackProfileChangesV2 = onValueWritten({
  ref: '/students/{studentKey}/profile',
  region: 'us-central1',
  memory: '512MiB',
  concurrency: 80
}, async (event) => {
  const studentKey = event.params.studentKey;
  
  // Get before and after data
  const beforeData = event.data.before.val();
  const afterData = event.data.after.val();
  
  // If this is a new profile (no before data), don't create history
  if (!beforeData) {
    console.log(`New profile created for ${studentKey}, no history needed`);
    return null;
  }
  
  // If profile is deleted, log it but don't create history
  if (!afterData) {
    console.log(`Profile deleted for ${studentKey}`);
    return null;
  }
  
  const db = admin.database();
  const timestamp = admin.database.ServerValue.TIMESTAMP;
  const changedFields = [];
  
  // Get the lastChange info if it exists
  let lastChangeInfo = null;
  try {
    const lastChangeSnapshot = await db.ref(`/students/${studentKey}/profileHistory/lastChange`).once('value');
    lastChangeInfo = lastChangeSnapshot.val();
  } catch (error) {
    console.log('No lastChange info found, continuing without it');
  }
  
  try {
    // Compare each field and track changes
    const fieldsToTrack = [
      'firstName',
      'lastName',
      'preferredFirstName',
      'gender',
      'StudentPhone',
      'birthday',
      'address',
      'asn',
      'ParentFirstName',
      'ParentLastName',
      'ParentPhone_x0023_',
      'ParentEmail',
      'studentPhoto',
      'albertaResident',
      'parentRelationship',
      'isLegalGuardian',
      'hasLegalRestrictions',
      'legalDocumentUrl',
      'indigenousIdentification',
      'indigenousStatus',
      'citizenshipDocuments',
      'howDidYouHear',
      'whyApplying',
      'internationalDocuments'
    ];
    
    // Process each field
    for (const field of fieldsToTrack) {
      const beforeValue = beforeData[field];
      const afterValue = afterData[field];
      
      // Skip if values are the same
      if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
        continue;
      }
      
      // Skip if both are falsy (undefined, null, empty string, etc.)
      if (!beforeValue && !afterValue) {
        continue;
      }
      
      // Skip if the before value doesn't exist (null, undefined, or empty string)
      // This prevents tracking initial value settings
      if (beforeValue === null || beforeValue === undefined || beforeValue === '') {
        continue;
      }
      
      // Handle address object specially
      if (field === 'address') {
        // Skip if beforeValue doesn't exist for address
        if (!beforeValue || Object.keys(beforeValue).length === 0) {
          continue;
        }
        // Compare the entire address object
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
          changedFields.push({
            field: 'address',
            before: beforeValue,
            after: afterValue,
            timestamp: timestamp
          });
        }
        continue;
      }
      
      // Handle array fields (like citizenshipDocuments)
      if (field === 'citizenshipDocuments' || field === 'internationalDocuments') {
        // Skip if beforeValue doesn't exist or is empty array
        if (!beforeValue || (Array.isArray(beforeValue) && beforeValue.length === 0)) {
          continue;
        }
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
          changedFields.push({
            field: field,
            before: beforeValue,
            after: afterValue,
            timestamp: timestamp
          });
        }
        continue;
      }
      
      // For all other fields
      changedFields.push({
        field: field,
        before: beforeValue || null,
        after: afterValue || null,
        timestamp: timestamp
      });
    }
    
    // If no changes detected, return
    if (changedFields.length === 0) {
      console.log(`No meaningful changes detected for ${studentKey}`);
      return null;
    }
    
    console.log(`Detected ${changedFields.length} field changes for ${studentKey}`);
    
    // Save each changed field to history
    const historyPromises = changedFields.map(async (change) => {
      // Create a unique key for this history entry
      const historyKey = `${change.field}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Save to profileHistory
      return db.ref(`/students/${studentKey}/profileHistory/${historyKey}`).set({
        fieldName: change.field,
        previousValue: change.before,
        newValue: change.after,
        changedAt: change.timestamp,
        // Add metadata about the change
        metadata: {
          userEmail: lastChangeInfo?.userEmail || 'system',
          uid: afterData.uid || null,
          changeSource: 'profile_update', // Could be extended to track source of change
          lastChangeTimestamp: lastChangeInfo?.timestamp || null
        }
      });
    });
    
    await Promise.all(historyPromises);
    
    console.log(`Successfully saved ${changedFields.length} history entries for ${studentKey}`);
    
    // Also create a summary entry for this update session
    const summaryKey = `update_${Date.now()}`;
    await db.ref(`/students/${studentKey}/profileHistory/summaries/${summaryKey}`).set({
      timestamp: timestamp,
      fieldsChanged: changedFields.map(c => c.field),
      changeCount: changedFields.length,
      userEmail: lastChangeInfo?.userEmail || 'system',
      uid: afterData.uid || null,
      lastChangeTimestamp: lastChangeInfo?.timestamp || null
    });
    
    // Clean up the lastChange field after using it
    if (lastChangeInfo) {
      try {
        await db.ref(`/students/${studentKey}/profileHistory/lastChange`).remove();
        console.log('Cleaned up lastChange field');
      } catch (cleanupError) {
        console.error('Error cleaning up lastChange field:', cleanupError);
        // Continue even if cleanup fails
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error tracking profile changes:', error);
    
    // Log the error
    await db.ref('errorLogs/profileHistory').push({
      studentKey,
      error: error.message,
      stack: error.stack,
      timestamp: timestamp
    });
    
    throw error;
  }
});

// Track course enrollment changes and maintain history
const trackCourseEnrollmentChangesV2 = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}',
  region: 'us-central1',
  memory: '512MiB',
  concurrency: 80
}, async (event) => {
  const studentKey = event.params.studentKey;
  const courseId = event.params.courseId;
  
  // Get before and after data
  const beforeData = event.data.before.val();
  const afterData = event.data.after.val();
  
  // If this is a new enrollment (no before data), don't create history
  if (!beforeData) {
    console.log(`New course enrollment created for ${studentKey} in course ${courseId}, no history needed`);
    return null;
  }
  
  // If enrollment is deleted, log it but don't create history
  if (!afterData) {
    console.log(`Course enrollment deleted for ${studentKey} in course ${courseId}`);
    return null;
  }
  
  const db = admin.database();
  const timestamp = admin.database.ServerValue.TIMESTAMP;
  const changedFields = [];
  
  // Get the lastChange info if it exists
  let lastChangeInfo = null;
  try {
    const lastChangeSnapshot = await db.ref(`/students/${studentKey}/courses/${courseId}/enrollmentHistory/lastChange`).once('value');
    lastChangeInfo = lastChangeSnapshot.val();
  } catch (error) {
    console.log('No lastChange info found for enrollment, continuing without it');
  }
  
  try {
    // Define the course enrollment fields to track
    const fieldsToTrack = [
      { path: 'ActiveFutureArchived/Value', fieldName: 'ActiveFutureArchived_Value' },
      { path: 'Course/Value', fieldName: 'Course_Value' },
      { path: 'PASI/Value', fieldName: 'PASI_Value' },
      { path: 'ScheduleEndDate', fieldName: 'ScheduleEndDate' },
      { path: 'School_x0020_Year/Value', fieldName: 'School_x0020_Year_Value' },
      { path: 'Status/Value', fieldName: 'Status_Value' },
      { path: 'StudentType/Value', fieldName: 'StudentType_Value' },
      { path: 'DiplomaMonthChoices/Value', fieldName: 'DiplomaMonthChoices_Value' }, // Also track diploma month
      { path: 'showStats', fieldName: 'showStats' }, // Track the showStats field
      { path: 'LMSStudentID', fieldName: 'LMSStudentID' } // Track LMS ID changes
    ];
    
    // Helper function to get nested value
    const getNestedValue = (obj, path) => {
      if (!obj) return undefined;
      const parts = path.split('/');
      let current = obj;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    };
    
    // Process each field
    for (const { path, fieldName } of fieldsToTrack) {
      const beforeValue = getNestedValue(beforeData, path);
      const afterValue = getNestedValue(afterData, path);
      
      // Skip if values are the same
      if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
        continue;
      }
      
      // Skip if the before value doesn't exist (null, undefined, or empty string)
      if (beforeValue === null || beforeValue === undefined || beforeValue === '') {
        continue;
      }
      
      changedFields.push({
        field: fieldName,
        before: beforeValue,
        after: afterValue || null,
        timestamp: timestamp
      });
    }
    
    // If no changes detected, return
    if (changedFields.length === 0) {
      console.log(`No meaningful enrollment changes detected for ${studentKey} in course ${courseId}`);
      return null;
    }
    
    console.log(`Detected ${changedFields.length} enrollment field changes for ${studentKey} in course ${courseId}`);
    
    // Save each changed field to profileHistory (same location as profile changes)
    const historyPromises = changedFields.map(async (change) => {
      // Create a unique key for this history entry
      const historyKey = `${change.field}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Save to profileHistory (same as profile changes)
      return db.ref(`/students/${studentKey}/profileHistory/${historyKey}`).set({
        fieldName: change.field,
        previousValue: change.before,
        newValue: change.after,
        changedAt: change.timestamp,
        courseId: courseId, // Add courseId to distinguish course-related changes
        // Add metadata about the change
        metadata: {
          userEmail: lastChangeInfo?.userEmail || 'system',
          uid: afterData.uid || null,
          changeSource: 'course_enrollment_update',
          lastChangeTimestamp: lastChangeInfo?.timestamp || null,
          // Include special update metadata if present
          isMassUpdate: lastChangeInfo?.isMassUpdate || false,
          massUpdateDetails: lastChangeInfo?.massUpdateDetails || null,
          isFinalization: lastChangeInfo?.isFinalization || false,
          finalizationDetails: lastChangeInfo?.finalizationDetails || null,
          isResumingOn: lastChangeInfo?.isResumingOn || false,
          resumingOnDetails: lastChangeInfo?.resumingOnDetails || null
        }
      });
    });
    
    await Promise.all(historyPromises);
    
    console.log(`Successfully saved ${changedFields.length} enrollment history entries for ${studentKey}`);
    
    // Also create a summary entry for this update session
    const summaryKey = `enrollment_update_${Date.now()}`;
    await db.ref(`/students/${studentKey}/profileHistory/summaries/${summaryKey}`).set({
      timestamp: timestamp,
      fieldsChanged: changedFields.map(c => c.field),
      changeCount: changedFields.length,
      courseId: courseId,
      userEmail: lastChangeInfo?.userEmail || 'system',
      uid: afterData.uid || null,
      lastChangeTimestamp: lastChangeInfo?.timestamp || null
    });
    
    // Clean up the lastChange field after using it
    if (lastChangeInfo) {
      try {
        await db.ref(`/students/${studentKey}/courses/${courseId}/enrollmentHistory/lastChange`).remove();
        console.log('Cleaned up enrollment lastChange field');
      } catch (cleanupError) {
        console.error('Error cleaning up enrollment lastChange field:', cleanupError);
        // Continue even if cleanup fails
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error tracking enrollment changes:', error);
    
    // Log the error
    await db.ref('errorLogs/enrollmentHistory').push({
      studentKey,
      courseId,
      error: error.message,
      stack: error.stack,
      timestamp: timestamp
    });
    
    throw error;
  }
});

module.exports = {
  trackProfileChangesV2,
  trackCourseEnrollmentChangesV2
};