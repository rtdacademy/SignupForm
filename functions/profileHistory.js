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
      
      // Handle address object specially
      if (field === 'address') {
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
      const historyKey = `${change.field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save to profileHistory
      return db.ref(`/students/${studentKey}/profileHistory/${historyKey}`).set({
        fieldName: change.field,
        previousValue: change.before,
        newValue: change.after,
        changedAt: change.timestamp,
        // Add metadata about the change
        metadata: {
          userEmail: afterData.StudentEmail || afterData.originalEmail,
          uid: afterData.uid || null,
          changeSource: 'profile_update' // Could be extended to track source of change
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
      userEmail: afterData.StudentEmail || afterData.originalEmail,
      uid: afterData.uid || null
    });
    
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

module.exports = {
  trackProfileChangesV2
};