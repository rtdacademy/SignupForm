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
 * OPTIMIZED: Listen to specific paths only to avoid large payloads
 */

// Create individual listeners for specific paths to avoid TRIGGER_PAYLOAD_TOO_LARGE errors
const createSpecificPathListener = (pathSuffix, fieldMappings) => {
  return onValueWritten({
    ref: `/students/{studentId}/courses/{courseId}/${pathSuffix}`,
    region: 'us-central1',
    memory: '256MiB',
    concurrency: 100
  }, async (event) => {
    const studentId = event.params.studentId;
    const courseId = event.params.courseId;
    const db = admin.database();

    console.log(`Processing specific path update: ${pathSuffix} for student ${studentId}, course ${courseId}`);
    
    // Check if record was deleted
    if (!event.data.after.exists()) {
      console.log(`Path ${pathSuffix} deleted for student ${studentId}, course ${courseId}`);
      return null;
    }

    try {
      const changes = {};
      
      // Handle the specific field mapping for this path
      if (typeof fieldMappings === 'string') {
        // Simple field mapping
        const beforeValue = event.data.before.exists() ? event.data.before.val() : null;
        const afterValue = event.data.after.val();
        
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
          console.log(`Field ${pathSuffix} changed from ${beforeValue} to ${afterValue}`);
          changes[fieldMappings] = afterValue !== null ? afterValue : '';
        }
      } else if (typeof fieldMappings === 'object') {
        // Complex field mapping with nested paths
        for (const [subPath, targetField] of Object.entries(fieldMappings)) {
          const beforeValue = event.data.before.exists() && event.data.before.child(subPath).exists() 
            ? event.data.before.child(subPath).val() : null;
          const afterValue = event.data.after.child(subPath).exists() 
            ? event.data.after.child(subPath).val() : null;
          
          if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
            console.log(`Nested field ${pathSuffix}/${subPath} changed from ${beforeValue} to ${afterValue}`);
            changes[targetField] = afterValue !== null ? afterValue : '';
          }
        }
      }

      // If no changes, exit early
      if (Object.keys(changes).length === 0) {
        console.log(`No changes detected in ${pathSuffix} for student ${studentId}, course ${courseId}`);
        return null;
      }

      // Check if summary exists before updating
      const summaryRef = db.ref(`studentCourseSummaries/${studentId}_${courseId}`);
      const summaryExists = (await summaryRef.once('value')).exists();

      if (!summaryExists) {
        console.log(`No summary exists for student ${studentId}, course ${courseId} - skipping update`);
        return null;
      }
      
      // Update only the changed fields
      changes.lastUpdated = admin.database.ServerValue.TIMESTAMP;
      await summaryRef.update(changes);
      
      console.log(`Updated ${Object.keys(changes).length - 1} fields for student ${studentId}, course ${courseId}`);
      
      return null;
    } catch (error) {
      console.error(`Error updating studentCourseSummary for path ${pathSuffix}:`, error.message);
      
      await db.ref('errorLogs/updateStudentCourseSummary').push({
        studentId,
        courseId,
        pathSuffix,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      throw error;
    }
  });
};

// Create specific listeners for each path we care about
const updateStudentCourseSummaryStatus = createSpecificPathListener('Status', {
  'Value': 'Status_Value',
  'SharepointValue': 'Status_SharepointValue'
});

const updateStudentCourseSummaryCourse = createSpecificPathListener('Course', {
  'Value': 'Course_Value'
});

const updateStudentCourseSummarySchoolYear = createSpecificPathListener('School_x0020_Year', {
  'Value': 'School_x0020_Year_Value'
});

const updateStudentCourseSummaryStudentType = createSpecificPathListener('StudentType', {
  'Value': 'StudentType_Value'
});

const updateStudentCourseSummaryDiplomaChoices = createSpecificPathListener('DiplomaMonthChoices', {
  'Value': 'DiplomaMonthChoices_Value'
});

const updateStudentCourseSummaryActiveFuture = createSpecificPathListener('ActiveFutureArchived', {
  'Value': 'ActiveFutureArchived_Value'
});

const updateStudentCourseSummaryPercentSchedule = createSpecificPathListener('PercentScheduleComplete', 'PercentScheduleComplete');

const updateStudentCourseSummaryPercentGradebook = createSpecificPathListener('PercentCompleteGradebook', 'PercentCompleteGradebook');

const updateStudentCourseSummaryCreated = createSpecificPathListener('Created', 'Created');

const updateStudentCourseSummaryScheduleStart = createSpecificPathListener('ScheduleStartDate', 'ScheduleStartDate');

const updateStudentCourseSummaryScheduleEnd = createSpecificPathListener('ScheduleEndDate', 'ScheduleEndDate');

const updateStudentCourseSummaryCourseID = createSpecificPathListener('CourseID', 'CourseID');

const updateStudentCourseSummaryLMSID = createSpecificPathListener('LMSStudentID', 'LMSStudentID');

const updateStudentCourseSummaryStatusCompare = createSpecificPathListener('StatusCompare', 'StatusCompare');

const updateStudentCourseSummarySection = createSpecificPathListener('section', 'section');

const updateStudentCourseSummaryAutoStatus = createSpecificPathListener('autoStatus', 'autoStatus');

const updateStudentCourseSummaryCategories = createSpecificPathListener('categories', 'categories');

const updateStudentCourseSummaryInOldSharePoint = createSpecificPathListener('inOldSharePoint', 'inOldSharePoint');

const updateStudentCourseSummaryTerm = createSpecificPathListener('Term', 'Term');

const updateStudentCourseSummaryPrimarySchool = createSpecificPathListener('primarySchoolName', 'primarySchoolName');

const updateStudentCourseSummaryResumingDate = createSpecificPathListener('resumingOnDate', 'resumingOnDate');

const updateStudentCourseSummaryPaymentStatus = createSpecificPathListener('payment_status/status', 'payment_status');

// Special listener for ScheduleJSON existence
const updateStudentCourseSummaryScheduleJSON = onValueWritten({
  ref: '/students/{studentId}/courses/{courseId}/ScheduleJSON',
  region: 'us-central1',
  memory: '256MiB',
  concurrency: 100
}, async (event) => {
  const studentId = event.params.studentId;
  const courseId = event.params.courseId;
  const db = admin.database();

  console.log(`Processing ScheduleJSON update for student ${studentId}, course ${courseId}`);

  try {
    const beforeExists = event.data.before.exists();
    const afterExists = event.data.after.exists();
    
    if (beforeExists !== afterExists) {
      console.log(`ScheduleJSON existence changed from ${beforeExists} to ${afterExists}`);
      
      const summaryRef = db.ref(`studentCourseSummaries/${studentId}_${courseId}`);
      const summaryExists = (await summaryRef.once('value')).exists();

      if (summaryExists) {
        await summaryRef.update({
          hasSchedule: afterExists,
          lastUpdated: admin.database.ServerValue.TIMESTAMP
        });
        console.log(`Updated hasSchedule to ${afterExists} for student ${studentId}, course ${courseId}`);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating ScheduleJSON summary:`, error.message);
    throw error;
  }
});

/**
 * Cloud Function: createStudentCourseSummaryOnCourseCreateV2
 * Listens to ActiveFutureArchived/Value creation to avoid TRIGGER_PAYLOAD_TOO_LARGE errors
 * Fetches full course data when needed
 */
const createStudentCourseSummaryOnCourseCreateV2 = onValueCreated({
  ref: '/students/{studentId}/courses/{courseId}/ActiveFutureArchived/Value',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 100
}, async (event) => {
  const studentId = event.params.studentId;
  const courseId = event.params.courseId;
  const db = admin.database();
  
  console.log(`Processing course creation for student ${studentId}, course ${courseId}`);
  
  // Check if the ActiveFutureArchived value was set
  if (!event.data.exists()) {
    console.log(`No ActiveFutureArchived value found for student ${studentId}, course ${courseId}`);
    return null;
  }
  
  try {
    // Fetch the full course data since we're now listening to a specific field
    const courseSnapshot = await db.ref(`students/${studentId}/courses/${courseId}`).once('value');
    const courseData = courseSnapshot.val();
    
    if (!courseData) {
      console.log(`No course data found for student ${studentId}, course ${courseId}`);
      return null;
    }
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

    // Extract fields from course data
    for (const [sourcePath, targetField] of Object.entries(fieldMappings)) {
      let value = null;
      
      // Handle nested paths
      if (sourcePath.includes('.')) {
        const [parent, child] = sourcePath.split('.');
        if (courseData[parent] && courseData[parent][child] !== undefined) {
          value = courseData[parent][child];
        }
      } else {
        value = courseData[sourcePath];
      }
      
      // Handle special cases
      if (sourcePath === 'CourseID') {
        summaryData[targetField] = value || courseId;
      } else if (sourcePath === 'autoStatus' || sourcePath === 'inOldSharePoint') {
        summaryData[targetField] = value !== undefined ? value : false;
      } else if (sourcePath === 'PercentScheduleComplete' || sourcePath === 'PercentCompleteGradebook') {
        summaryData[targetField] = value !== undefined ? value : 0;
      } else {
        summaryData[targetField] = value !== undefined ? value : '';
      }
    }

    // Handle special fields
    // For ScheduleJSON, just check existence
    summaryData['hasSchedule'] = courseData.ScheduleJSON !== undefined;
    
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
  
  // NEW: Specific path listeners to avoid TRIGGER_PAYLOAD_TOO_LARGE
  updateStudentCourseSummaryStatus,
  updateStudentCourseSummaryCourse,
  updateStudentCourseSummarySchoolYear,
  updateStudentCourseSummaryStudentType,
  updateStudentCourseSummaryDiplomaChoices,
  updateStudentCourseSummaryActiveFuture,
  updateStudentCourseSummaryPercentSchedule,
  updateStudentCourseSummaryPercentGradebook,
  updateStudentCourseSummaryCreated,
  updateStudentCourseSummaryScheduleStart,
  updateStudentCourseSummaryScheduleEnd,
  updateStudentCourseSummaryCourseID,
  updateStudentCourseSummaryLMSID,
  updateStudentCourseSummaryStatusCompare,
  updateStudentCourseSummarySection,
  updateStudentCourseSummaryAutoStatus,
  updateStudentCourseSummaryCategories,
  updateStudentCourseSummaryInOldSharePoint,
  updateStudentCourseSummaryTerm,
  updateStudentCourseSummaryPrimarySchool,
  updateStudentCourseSummaryResumingDate,
  updateStudentCourseSummaryPaymentStatus,
  updateStudentCourseSummaryScheduleJSON,
  
  createStudentCourseSummaryOnCourseCreateV2,
  batchSyncStudentDataV2,
  getNestedValue
};