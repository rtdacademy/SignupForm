// Import the necessary v2 modules
const { onValueWritten, onValueCreated } = require('firebase-functions/v2/database');
const { onCall } = require('firebase-functions/v2/https');

const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper function to safely extract nested values from Firebase DataSnapshot
const getNestedValue = (snapshot, path) => {
  if (!snapshot || !snapshot.exists()) return null;
  
  if (path.includes('.')) {
    const parts = path.split('.');
    let current = snapshot;
    
    for (const part of parts) {
      if (!current.child(part).exists()) return null;
      current = current.child(part);
    }
    
    return current.val();
  } else {
    // Handle non-nested paths
    return snapshot.child(path).exists() ? snapshot.child(path).val() : null;
  }
};

/**
 * Cloud Function: syncProfileToCourseSummariesV2
 * Uses event data directly and only updates fields that have changed
 */
const syncProfileToCourseSummariesV2 = onValueWritten({
  ref: '/students/{studentId}/profile',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 100
}, async (event) => {
  const studentId = event.params.studentId;
  const db = admin.database();

  // Check if profile was deleted
  if (!event.data.after.exists()) {
    console.log(`Profile data was deleted for student ${studentId}`);
    return null;
  }

  try {
    // Define profile fields to sync (excluding arrays and objects that need special handling)
    const profileFields = [
      'LastSync', 'ParentEmail', 'ParentFirstName', 'ParentLastName', 
      'ParentPhone_x0023_', 'StudentEmail', 'StudentPhone', 'age', 'asn', 
      'birthday', 'firstName', 'lastName', 'originalEmail', 
      'preferredFirstName', 'gender', 'uid', 'ParentPermission_x003f_',
      'albertaResident', 'hasLegalRestrictions', 'howDidYouHear',
      'indigenousIdentification', 'indigenousStatus', 'internationalDocuments',
      'isLegalGuardian', 'legalDocumentUrl', 'parentRelationship',
      'studentPhoto', 'whyApplying'
    ];

    // Collect changes by comparing before and after
    const changes = {};
    
    // Check regular fields
    for (const field of profileFields) {
      const beforeValue = getNestedValue(event.data.before, field);
      const afterValue = getNestedValue(event.data.after, field);
      
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        console.log(`Profile field ${field} changed from ${beforeValue} to ${afterValue}`);
        changes[field] = afterValue !== null ? 
          afterValue : 
          (field === 'age' ? 0 : '');
      }
    }
    
    // Special handling for AdditionalGuardians
    const beforeGuardians = event.data.before && 
                           event.data.before.exists() && 
                           event.data.before.child('AdditionalGuardians').exists() ?
                           event.data.before.child('AdditionalGuardians').val() : [];
    
    const afterGuardians = event.data.after.child('AdditionalGuardians').exists() ?
                          event.data.after.child('AdditionalGuardians').val() : [];
    
    // Check if guardians changed
    const guardiansChanged = JSON.stringify(beforeGuardians) !== JSON.stringify(afterGuardians);
    
    if (guardiansChanged) {
      console.log('AdditionalGuardians changed');
      // Map guardian emails to target fields
      afterGuardians.forEach((guardian, index) => {
        changes[`guardianEmail${index + 1}`] = guardian.email || '';
      });
      
      // Remove any extra guardian emails if the number of guardians has decreased
      if (beforeGuardians.length > afterGuardians.length) {
        for (let i = afterGuardians.length + 1; i <= beforeGuardians.length; i++) {
          changes[`guardianEmail${i}`] = null;
        }
      }
    }

    // Check for address changes - sync entire address object
    const beforeAddress = event.data.before && event.data.before.exists() && event.data.before.child('address').exists() ?
                         event.data.before.child('address').val() : null;
    const afterAddress = event.data.after.child('address').exists() ?
                        event.data.after.child('address').val() : null;
    
    if (JSON.stringify(beforeAddress) !== JSON.stringify(afterAddress)) {
      console.log(`Profile field address changed`);
      changes['address'] = afterAddress !== null ? afterAddress : null;
    }

    // Check for citizenshipDocuments changes - sync entire array
    const beforeCitizenshipDocs = event.data.before && event.data.before.exists() && event.data.before.child('citizenshipDocuments').exists() ?
                                  event.data.before.child('citizenshipDocuments').val() : null;
    const afterCitizenshipDocs = event.data.after.child('citizenshipDocuments').exists() ?
                                 event.data.after.child('citizenshipDocuments').val() : null;
    
    if (JSON.stringify(beforeCitizenshipDocs) !== JSON.stringify(afterCitizenshipDocs)) {
      console.log(`Profile field citizenshipDocuments changed`);
      // Convert object-based array back to actual array if needed
      if (afterCitizenshipDocs && typeof afterCitizenshipDocs === 'object' && !Array.isArray(afterCitizenshipDocs)) {
        // Firebase stores arrays as objects with numeric keys
        const docsArray = [];
        Object.keys(afterCitizenshipDocs).forEach(key => {
          if (!isNaN(key)) {
            docsArray[parseInt(key)] = afterCitizenshipDocs[key];
          }
        });
        changes['citizenshipDocuments'] = docsArray.filter(doc => doc !== undefined);
      } else {
        changes['citizenshipDocuments'] = afterCitizenshipDocs;
      }
    }

    // If nothing changed, exit early
    if (Object.keys(changes).length === 0) {
      console.log(`No profile changes detected for student ${studentId}`);
      return null;
    }

    // Get all courses for this student
    const coursesSnap = await db.ref(`students/${studentId}/courses`).once('value');
    const courses = coursesSnap.val();

    if (!courses) {
      console.log(`No courses found for student ${studentId}`);
      return null;
    }

    // Add timestamp to track update
    changes.profileLastUpdated = admin.database.ServerValue.TIMESTAMP;

    // Create an array of promises for parallel processing
    const updatePromises = Object.keys(courses).map(async courseId => {
      const summaryRef = db.ref(`studentCourseSummaries/${studentId}_${courseId}`);
      const summaryExists = (await summaryRef.once('value')).exists();
      
      if (!summaryExists) {
        console.log(`No summary exists for student ${studentId}, course ${courseId}`);
        return { courseId, success: false, reason: 'Summary does not exist' };
      }
      
      try {
        await summaryRef.update(changes);
        return { courseId, success: true };
      } catch (error) {
        console.error(`Error updating ${courseId}: ${error.message}`);
        return { courseId, success: false, reason: error.message };
      }
    });

    // Execute all updates in parallel
    const results = await Promise.all(updatePromises);
    
    // Count successful updates
    const successCount = results.filter(result => result.success).length;
    
    console.log(
      `Successfully synced ${Object.keys(changes).length - 1} profile fields for student ${studentId} across ${successCount} courses`
    );

    return null;
  } catch (error) {
    console.error(
      `Error syncing profile updates for student ${studentId}: ${error.message}`
    );

    await db.ref('errorLogs/syncProfileToCourseSummaries').push({
      studentId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    throw error;
  }
});

/**
 * Cloud Function: updateStudentCourseSummaryV2
 * Uses event data directly and only updates fields that have changed
 */
const updateStudentCourseSummaryV2 = onValueWritten({
  ref: '/students/{studentId}/courses/{courseId}',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 100
}, async (event) => {
  const studentId = event.params.studentId;
  const courseId = event.params.courseId;
  const db = admin.database();

  console.log(`Processing update for student ${studentId}, course ${courseId}`);
  
  // Check if record was deleted
  if (!event.data.after.exists()) {
    try {
      console.log(`Course deleted for student ${studentId}, course ${courseId}`);
      
      // Check if the summary exists and if it's Archived
      const summaryRef = db.ref(`studentCourseSummaries/${studentId}_${courseId}`);
      const summarySnapshot = await summaryRef.once('value');
      const summaryData = summarySnapshot.val();
      
      // If summary exists and ActiveFutureArchived_Value is 'Archived', don't remove it
      if (summaryData && summaryData.ActiveFutureArchived_Value === 'Archived') {
        console.log(`Summary is Archived - preserving for student ${studentId}, course ${courseId}`);
        return null;
      }
      
      // Otherwise, proceed with deletion
      await summaryRef.transaction(currentData => {
        return currentData !== null ? null : currentData; // Remove if exists
      });
        
      console.log(`Successfully removed course summary for student ${studentId}, course ${courseId}`);
      return null;
    } catch (error) {
      console.error(`Error removing course summary: ${error.message}`);
      throw error;
    }
  }

  try {
    // Define field mappings
    const fieldMappings = {
      'Status.Value': 'Status_Value',
      'Status.SharepointValue': 'Status_SharepointValue', 
      'Course.Value': 'Course_Value', 
      'School_x0020_Year.Value': 'School_x0020_Year_Value',
      'StudentType.Value': 'StudentType_Value',
      'DiplomaMonthChoices.Value': 'DiplomaMonthChoices_Value',
      'ActiveFutureArchived.Value': 'ActiveFutureArchived_Value',
      'PercentScheduleComplete': 'PercentScheduleComplete',
      'PercentCompleteGradebook': 'PercentCompleteGradebook',
      'Created': 'Created',
      'ScheduleStartDate': 'ScheduleStartDate',
      'ScheduleEndDate': 'ScheduleEndDate',
      'CourseID': 'CourseID',
      'LMSStudentID': 'LMSStudentID',
      'StatusCompare': 'StatusCompare',
      'section': 'section',
      'autoStatus': 'autoStatus',
      'categories': 'categories',
      'inOldSharePoint': 'inOldSharePoint',
      'Term': 'Term'
    };

    // Define special fields that need custom handling
    const specialFieldMappings = {
      'ScheduleJSON': 'hasSchedule',
      'primarySchoolName': 'primarySchoolName',
      'resumingOnDate': 'resumingOnDate',
      'payment_status/status': 'payment_status'
    };

    // Collect changes by comparing before and after
    const changes = {};
    
    // Process standard field mappings
    for (const [sourcePath, targetField] of Object.entries(fieldMappings)) {
      const beforeValue = getNestedValue(event.data.before, sourcePath);
      const afterValue = getNestedValue(event.data.after, sourcePath);
      
      // String comparison is needed for things like arrays or objects
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        console.log(`Field ${sourcePath} changed from ${beforeValue} to ${afterValue}`);
        
        // Handle special cases
        if (sourcePath === 'CourseID') {
          changes[targetField] = afterValue || courseId;
        } else if (sourcePath === 'autoStatus' || sourcePath === 'inOldSharePoint') {
          changes[targetField] = afterValue !== null ? afterValue : false;
        } else if (sourcePath === 'PercentScheduleComplete' || sourcePath === 'PercentCompleteGradebook') {
          changes[targetField] = afterValue !== null ? afterValue : 0;
        } else {
          changes[targetField] = afterValue !== null ? afterValue : '';
        }
      }
    }
    
    // Process special fields needing custom handling
    for (const [sourcePath, targetField] of Object.entries(specialFieldMappings)) {
      // For paths with nested structures like "payment_status/status"
      if (sourcePath.includes('/')) {
        const [parent, child] = sourcePath.split('/');
        const beforeExists = event.data.before && 
                           event.data.before.exists() && 
                           event.data.before.child(parent).exists() && 
                           event.data.before.child(parent).child(child).exists();
        const afterExists = event.data.after && 
                          event.data.after.exists() && 
                          event.data.after.child(parent).exists() && 
                          event.data.after.child(parent).child(child).exists();
        
        const beforeValue = beforeExists ? event.data.before.child(parent).child(child).val() : null;
        const afterValue = afterExists ? event.data.after.child(parent).child(child).val() : null;
        
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
          console.log(`Nested path ${sourcePath} changed from ${beforeValue} to ${afterValue}`);
          changes[targetField] = afterValue !== null ? afterValue : '';
        }
      } 
      // Special case for ScheduleJSON which only checks existence
      else if (sourcePath === 'ScheduleJSON') {
        const beforeExists = event.data.before && 
                           event.data.before.exists() && 
                           event.data.before.child('ScheduleJSON').exists();
        const afterExists = event.data.after && 
                          event.data.after.exists() && 
                          event.data.after.child('ScheduleJSON').exists();
        
        if (beforeExists !== afterExists) {
          console.log(`ScheduleJSON existence changed from ${beforeExists} to ${afterExists}`);
          changes[targetField] = afterExists;
        }
      } 
      // Regular fields
      else {
        const beforeValue = event.data.before && 
                          event.data.before.exists() && 
                          event.data.before.child(sourcePath).exists() ? 
                          event.data.before.child(sourcePath).val() : null;
        const afterValue = event.data.after && 
                         event.data.after.exists() && 
                         event.data.after.child(sourcePath).exists() ? 
                         event.data.after.child(sourcePath).val() : null;
        
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
          console.log(`Field ${sourcePath} changed from ${beforeValue} to ${afterValue}`);
          changes[targetField] = afterValue !== null ? afterValue : '';
        }
      }
    }

    // Check if there are any changes to apply
    if (Object.keys(changes).length === 0) {
      console.log(`No changes detected for student ${studentId}, course ${courseId}`);
      return null;
    }

    // Check if summary exists before updating
    const summaryRef = db.ref(`studentCourseSummaries/${studentId}_${courseId}`);
    const summaryExists = (await summaryRef.once('value')).exists();

    // If record doesn't exist, create a new complete record
    if (!summaryExists) {
      console.log(`Creating new course summary for student ${studentId}, course ${courseId}`);
      
      // Get profile data to create the complete record
      const profileSnap = await db.ref(`/students/${studentId}/profile`).once('value');
      const profileData = profileSnap.val();
      
      if (!profileData) {
        console.error(`No profile found for student ${studentId} - cannot create summary`);
        return null;
      }
      
      // Create complete data object
      let summaryData = {};
      
      // Add profile fields
      const profileFields = [
        'LastSync', 'ParentEmail', 'ParentFirstName', 'ParentLastName', 
        'ParentPhone_x0023_', 'StudentEmail', 'StudentPhone', 'age', 'asn', 
        'birthday', 'firstName', 'lastName', 'originalEmail', 
        'preferredFirstName', 'gender', 'uid', 'ParentPermission_x003f_',
        'albertaResident', 'hasLegalRestrictions', 'howDidYouHear',
        'indigenousIdentification', 'indigenousStatus', 'internationalDocuments',
        'isLegalGuardian', 'legalDocumentUrl', 'parentRelationship',
        'studentPhoto', 'whyApplying'
      ];
      
      // Copy profile fields
      profileFields.forEach(field => {
        summaryData[field] = profileData[field] !== undefined 
          ? profileData[field] 
          : (field === 'age' ? 0 : '');
      });
      
      // Handle additional guardians
      const guardians = profileData.AdditionalGuardians || [];
      guardians.forEach((guardian, index) => {
        summaryData[`guardianEmail${index + 1}`] = guardian.email || '';
      });
      
      // Handle address fields - sync entire address object
      if (profileData.address) {
        summaryData['address'] = profileData.address;
      } else {
        summaryData['address'] = null;
      }
      
      // Handle citizenshipDocuments array
      if (profileData.citizenshipDocuments) {
        // Convert object-based array to actual array if needed
        if (typeof profileData.citizenshipDocuments === 'object' && !Array.isArray(profileData.citizenshipDocuments)) {
          const docsArray = [];
          Object.keys(profileData.citizenshipDocuments).forEach(key => {
            if (!isNaN(key)) {
              docsArray[parseInt(key)] = profileData.citizenshipDocuments[key];
            }
          });
          summaryData['citizenshipDocuments'] = docsArray.filter(doc => doc !== undefined);
        } else {
          summaryData['citizenshipDocuments'] = profileData.citizenshipDocuments;
        }
      } else {
        summaryData['citizenshipDocuments'] = null;
      }
      
      // Merge with detected changes
      summaryData = { ...summaryData, ...changes };
      
      // Add timestamps
      summaryData.lastUpdated = admin.database.ServerValue.TIMESTAMP;
      summaryData.createdAt = admin.database.ServerValue.TIMESTAMP;
      
      // Set the complete data
      await summaryRef.set(summaryData);
      
      console.log(`Created new course summary for student ${studentId}, course ${courseId}`);
      return null;
    }
    
    // For existing records, update only the changed fields
    changes.lastUpdated = admin.database.ServerValue.TIMESTAMP;
    
    await summaryRef.update(changes);
    
    console.log(`Updated ${Object.keys(changes).length - 1} fields for student ${studentId}, course ${courseId}`);
    console.log(`Fields updated: ${JSON.stringify(changes)}`);
    
    return null;
  } catch (error) {
    console.error(
      `Error updating studentCourseSummary for student ${studentId} in course ${courseId}: ${error.message}`
    );

    await db.ref('errorLogs/updateStudentCourseSummary').push({
      studentId,
      courseId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    throw error;
  }
});

/**
 * Cloud Function: createStudentCourseSummaryOnCourseCreateV2
 * Uses event data directly from the creation event
 */
const createStudentCourseSummaryOnCourseCreateV2 = onValueCreated({
  ref: '/students/{studentId}/courses/{courseId}',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 100
}, async (event) => {
  const studentId = event.params.studentId;
  const courseId = event.params.courseId;
  const db = admin.database();
  
  console.log(`Processing course creation for student ${studentId}, course ${courseId}`);
  
  // Check if we have course data in the event
  if (!event.data.exists()) {
    console.log(`No course data found in event for student ${studentId}, course ${courseId}`);
    return null;
  }
  
  try {
    // Check if the summary already exists (race condition safety)
    const summaryRef = db.ref(`studentCourseSummaries/${studentId}_${courseId}`);
    const summaryExists = (await summaryRef.once('value')).exists();
    
 
    
    // Retrieve the student's profile data
    const profileSnap = await db.ref(`/students/${studentId}/profile`).once('value');
    const profileData = profileSnap.val();

    if (!profileData) {
      console.log(`No profile found for student ${studentId}`);
      return null;
    }
    
    // Initialize summary data
    let summaryData = {};
    
    // Add profile fields
    const profileFields = [
      'LastSync', 'ParentEmail', 'ParentFirstName', 'ParentLastName', 
      'ParentPhone_x0023_', 'StudentEmail', 'StudentPhone', 'age', 'asn', 
      'birthday', 'firstName', 'lastName', 'originalEmail', 
      'preferredFirstName', 'gender', 'uid', 'ParentPermission_x003f_',
      'albertaResident', 'hasLegalRestrictions', 'howDidYouHear',
      'indigenousIdentification', 'indigenousStatus', 'internationalDocuments',
      'isLegalGuardian', 'legalDocumentUrl', 'parentRelationship',
      'studentPhoto', 'whyApplying'
    ];
    
    // Copy profile fields
    profileFields.forEach(field => {
      summaryData[field] = profileData[field] !== undefined 
        ? profileData[field] 
        : (field === 'age' ? 0 : '');
    });
    
    // Handle additional guardians
    const guardians = profileData.AdditionalGuardians || [];
    guardians.forEach((guardian, index) => {
      summaryData[`guardianEmail${index + 1}`] = guardian.email || '';
    });
    
    // Handle address fields - sync entire address object
    if (profileData.address) {
      summaryData['address'] = profileData.address;
    } else {
      summaryData['address'] = null;
    }
    
    // Handle citizenshipDocuments array
    if (profileData.citizenshipDocuments) {
      // Convert object-based array to actual array if needed
      if (typeof profileData.citizenshipDocuments === 'object' && !Array.isArray(profileData.citizenshipDocuments)) {
        const docsArray = [];
        Object.keys(profileData.citizenshipDocuments).forEach(key => {
          if (!isNaN(key)) {
            docsArray[parseInt(key)] = profileData.citizenshipDocuments[key];
          }
        });
        summaryData['citizenshipDocuments'] = docsArray.filter(doc => doc !== undefined);
      } else {
        summaryData['citizenshipDocuments'] = profileData.citizenshipDocuments;
      }
    } else {
      summaryData['citizenshipDocuments'] = null;
    }
    
    // Define field mappings to extract from event data
    const fieldMappings = {
      'Status.Value': 'Status_Value',
      'Status.SharepointValue': 'Status_SharepointValue', 
      'Course.Value': 'Course_Value', 
      'School_x0020_Year.Value': 'School_x0020_Year_Value',
      'StudentType.Value': 'StudentType_Value',
      'DiplomaMonthChoices.Value': 'DiplomaMonthChoices_Value',
      'ActiveFutureArchived.Value': 'ActiveFutureArchived_Value',
      'PercentScheduleComplete': 'PercentScheduleComplete',
      'PercentCompleteGradebook': 'PercentCompleteGradebook',
      'Created': 'Created',
      'ScheduleStartDate': 'ScheduleStartDate',
      'ScheduleEndDate': 'ScheduleEndDate',
      'CourseID': 'CourseID',
      'LMSStudentID': 'LMSStudentID',
      'StatusCompare': 'StatusCompare',
      'section': 'section',
      'autoStatus': 'autoStatus',
      'categories': 'categories',
      'inOldSharePoint': 'inOldSharePoint',
      'Term': 'Term'
    };

    // Extract fields from event data
    for (const [sourcePath, targetField] of Object.entries(fieldMappings)) {
      const value = getNestedValue(event.data, sourcePath);
      
      // Handle special cases
      if (sourcePath === 'CourseID') {
        summaryData[targetField] = value || courseId;
      } else if (sourcePath === 'autoStatus' || sourcePath === 'inOldSharePoint') {
        summaryData[targetField] = value !== null ? value : false;
      } else if (sourcePath === 'PercentScheduleComplete' || sourcePath === 'PercentCompleteGradebook') {
        summaryData[targetField] = value !== null ? value : 0;
      } else {
        summaryData[targetField] = value !== null ? value : '';
      }
    }

    // Handle special fields
    // For ScheduleJSON, just check existence
    summaryData['hasSchedule'] = event.data.child('ScheduleJSON').exists();
    
    // For primarySchoolName
    if (event.data.child('primarySchoolName').exists()) {
      summaryData['primarySchoolName'] = event.data.child('primarySchoolName').val();
    } else {
      summaryData['primarySchoolName'] = '';
    }
    
    // For resumingOnDate
    if (event.data.child('resumingOnDate').exists()) {
      summaryData['resumingOnDate'] = event.data.child('resumingOnDate').val();
    } else {
      summaryData['resumingOnDate'] = '';
    }
    
    // For payment_status/status
    if (event.data.child('payment_status').exists() && 
        event.data.child('payment_status').child('status').exists()) {
      summaryData['payment_status'] = event.data.child('payment_status').child('status').val();
    } else {
      summaryData['payment_status'] = '';
    }
    
    // Add creation and update timestamps
    summaryData.lastUpdated = admin.database.ServerValue.TIMESTAMP;
    summaryData.createdAt = admin.database.ServerValue.TIMESTAMP;
    
    // Use transaction to ensure we don't create duplicate data
    await summaryRef.transaction(currentData => {
      if (currentData !== null) {
        // Even if data exists, update it with new information
        console.log(`Updating existing summary for student ${studentId}, course ${courseId}`);
        return {...currentData, ...summaryData};
      }
      return summaryData;
    });
      
    console.log(`Successfully created summary for student ${studentId}, course ${courseId}`);
    return null;
  } catch (error) {
    console.error(
      `Error creating studentCourseSummary for student ${studentId} in course ${courseId}: ${error.message}`
    );

    await db.ref('errorLogs/createStudentCourseSummaryOnCourseCreate').push({
      studentId,
      courseId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    throw error;
  }
});

/**
 * Callable function: batchSyncStudentDataV2
 * Uses helper function to extract nested values and only updates what's necessary
 */
const batchSyncStudentDataV2 = onCall({
  memory: '2GiB',
  timeoutSeconds: 540, // 9 minutes should be enough for 3000 students
  concurrency: 500,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"]
}, async (request) => {
  // Extract parameters from request
  const { students } = request.data;
  
  if (!students || !Array.isArray(students) || students.length === 0) {
    throw new Error('You must provide an array of students');
  }
  
  // Increase max students to 3000
  if (students.length > 3000) {
    throw new Error('Maximum 3000 students can be processed in a single batch. Please reduce the selection and try again.');
  }
  
  console.log(`Starting complete data sync for ${students.length} students`);
  const db = admin.database();
  
  // Create batch ID for tracking
  const batchId = db.ref('dataSyncBatches').push().key;
  const batchRef = db.ref(`dataSyncBatches/${batchId}`);
  
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
            
            // Get student profile data
            const profileSnapshot = await db.ref(`students/${studentKey}/profile`).once('value');
            const profileData = profileSnapshot.val();
            
            if (!profileData) {
              throw new Error(`No profile found for student ${studentKey}`);
            }
            
            // Get course data
            const courseDataSnapshot = await db.ref(`students/${studentKey}/courses/${courseId}`).once('value');
            const courseData = courseDataSnapshot.val();
            
            if (!courseData) {
              throw new Error(`No course data found for student ${studentKey}, course ${courseId}`);
            }
            
            // Initialize summary data
            let summaryData = {};
            
            // 1. Add profile fields
            const profileFields = [
              'LastSync', 'ParentEmail', 'ParentFirstName', 'ParentLastName', 
              'ParentPhone_x0023_', 'StudentEmail', 'StudentPhone', 'age', 'asn', 
              'birthday', 'firstName', 'lastName', 'originalEmail', 
              'preferredFirstName', 'gender', 'uid', 'ParentPermission_x003f_',
              'albertaResident', 'hasLegalRestrictions', 'howDidYouHear',
              'indigenousIdentification', 'indigenousStatus', 'internationalDocuments',
              'isLegalGuardian', 'legalDocumentUrl', 'parentRelationship',
              'studentPhoto', 'whyApplying'
            ];
            
            // Copy profile fields
            profileFields.forEach(field => {
              summaryData[field] = profileData[field] !== undefined 
                ? profileData[field] 
                : (field === 'age' ? 0 : '');
            });
            
            // Handle additional guardians
            const guardians = profileData.AdditionalGuardians || [];
            guardians.forEach((guardian, index) => {
              summaryData[`guardianEmail${index + 1}`] = guardian.email || '';
            });
            
            // Remove any extra guardian emails if needed
            const currentGuardianCount = guardians.length;
            for (let i = currentGuardianCount + 1; i <= 5; i++) { // Assuming max 5 guardians
              summaryData[`guardianEmail${i}`] = null;
            }
            
            // Handle address fields - sync entire address object
            if (profileData.address) {
              summaryData['address'] = profileData.address;
            } else {
              summaryData['address'] = null;
            }
            
            // Handle citizenshipDocuments array
            if (profileData.citizenshipDocuments) {
              // Convert object-based array to actual array if needed
              if (typeof profileData.citizenshipDocuments === 'object' && !Array.isArray(profileData.citizenshipDocuments)) {
                const docsArray = [];
                Object.keys(profileData.citizenshipDocuments).forEach(key => {
                  if (!isNaN(key)) {
                    docsArray[parseInt(key)] = profileData.citizenshipDocuments[key];
                  }
                });
                summaryData['citizenshipDocuments'] = docsArray.filter(doc => doc !== undefined);
              } else {
                summaryData['citizenshipDocuments'] = profileData.citizenshipDocuments;
              }
            } else {
              summaryData['citizenshipDocuments'] = null;
            }
            
            // 2. Add course fields
            const directCourseFields = {
              'Status.Value': 'Status_Value',
              'Status.SharepointValue': 'Status_SharepointValue', 
              'Course.Value': 'Course_Value', 
              'School_x0020_Year.Value': 'School_x0020_Year_Value',
              'StudentType.Value': 'StudentType_Value',
              'DiplomaMonthChoices.Value': 'DiplomaMonthChoices_Value',
              'ActiveFutureArchived.Value': 'ActiveFutureArchived_Value',
              'PercentScheduleComplete': 'PercentScheduleComplete',
              'PercentCompleteGradebook': 'PercentCompleteGradebook',
              'Created': 'Created',
              'ScheduleStartDate': 'ScheduleStartDate',
              'ScheduleEndDate': 'ScheduleEndDate',
              'CourseID': 'CourseID',
              'LMSStudentID': 'LMSStudentID',
              'StatusCompare': 'StatusCompare',
              'section': 'section',
              'autoStatus': 'autoStatus',
              'categories': 'categories',
              'inOldSharePoint': 'inOldSharePoint',
              'Term': 'Term'
            };
            
            // Copy course fields using getNestedValue helper
            for (const [sourceField, targetField] of Object.entries(directCourseFields)) {
              // For nested fields we need a different approach since it's not a DataSnapshot
              if (sourceField.includes('.')) {
                const [parent, child] = sourceField.split('.');
                if (courseData[parent] && courseData[parent][child] !== undefined) {
                  summaryData[targetField] = courseData[parent][child];
                } else {
                  summaryData[targetField] = '';
                }
              } else {
                // Handle normal fields
                if (sourceField === 'CourseID') {
                  summaryData[targetField] = courseData[sourceField] || courseId;
                } else if (sourceField === 'autoStatus' || sourceField === 'inOldSharePoint') {
                  summaryData[targetField] = courseData[sourceField] !== undefined ? courseData[sourceField] : false;
                } else {
                  summaryData[targetField] = courseData[sourceField] !== undefined ? 
                    courseData[sourceField] : 
                    (sourceField === 'PercentScheduleComplete' || sourceField === 'PercentCompleteGradebook' ? 0 : '');
                }
              }
            }
            
            // 3. Handle special fields
            // For ScheduleJSON, just check existence
            const scheduleExists = courseData.ScheduleJSON !== undefined;
            summaryData['hasSchedule'] = scheduleExists;
            
            // For primarySchoolName
            summaryData['primarySchoolName'] = courseData.primarySchoolName || '';
            
            // For resumingOnDate
            summaryData['resumingOnDate'] = courseData.resumingOnDate || '';
            
            // For payment_status/status
            if (courseData.payment_status && courseData.payment_status.status !== undefined) {
              summaryData['payment_status'] = courseData.payment_status.status;
            } else {
              summaryData['payment_status'] = '';
            }
            
            // Add timestamps
            summaryData.lastUpdated = Date.now();
            summaryData.profileLastUpdated = Date.now();
            
            // Check if summary already exists
            const summaryRef = db.ref(`studentCourseSummaries/${studentKey}_${courseId}`);
            const existingSummary = await summaryRef.once('value');
            
            if (existingSummary.exists()) {
              // If it exists, preserve the creation timestamp
              summaryData.createdAt = existingSummary.val().createdAt || Date.now();
              await summaryRef.update(summaryData);
            } else {
              // If it doesn't exist, set creation timestamp
              summaryData.createdAt = Date.now();
              await summaryRef.set(summaryData);
            }
            
            console.log(`Successfully synced all data for student ${studentKey}, course ${courseId}`);
            
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
              success: true
            };
          } catch (error) {
            console.error(`Error syncing data for student: ${error.message}`);
            
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
  
  console.log(`Batch data sync completed: ${totalSuccessful} successful, ${totalFailed} failed`);
  
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
module.exports = {
  syncProfileToCourseSummariesV2,
  updateStudentCourseSummaryV2,
  createStudentCourseSummaryOnCourseCreateV2,
  batchSyncStudentDataV2,
  getNestedValue
};