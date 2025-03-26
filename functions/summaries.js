const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: syncProfileToCourseSummaries
 * Uses transactions to safely update fields that have actually changed
 */
const syncProfileToCourseSummaries = functions.database
  .ref('/students/{studentId}/profile')
  .onWrite(async (change, context) => {
    const { studentId } = context.params;
    const newProfileData = change.after.val();
    const oldProfileData = change.before.val() || {};
    const db = admin.database();

    if (!newProfileData) {
      console.log(`Profile data was deleted for student ${studentId}`);
      return null;
    }

    try {
      // Determine which fields have actually changed
      const changedFields = {};
      const fieldsToCheck = [
        'LastSync', 'ParentEmail', 'ParentFirstName', 'ParentLastName', 
        'ParentPhone_x0023_', 'StudentEmail', 'StudentPhone', 'age', 'asn', 
        'birthday', 'firstName', 'lastName', 'originalEmail', 
        'preferredFirstName', 'gender', 'uid', 'AdditionalGuardians'
      ];

      for (const field of fieldsToCheck) {
        if (field === 'AdditionalGuardians') {
          // Special handling for AdditionalGuardians array
          const oldGuardians = JSON.stringify(oldProfileData.AdditionalGuardians || []);
          const newGuardians = JSON.stringify(newProfileData.AdditionalGuardians || []);
          if (oldGuardians !== newGuardians) {
            changedFields.AdditionalGuardians = true;
          }
        } else if (JSON.stringify(oldProfileData[field]) !== JSON.stringify(newProfileData[field])) {
          changedFields[field] = true;
        }
      }

      // If nothing changed, exit early
      if (Object.keys(changedFields).length === 0) {
        console.log(`No relevant profile changes for student ${studentId}`);
        return null;
      }

      const coursesSnap = await db
        .ref(`students/${studentId}/courses`)
        .once('value');
      const courses = coursesSnap.val();

      if (!courses) {
        console.log(`No courses found for student ${studentId}`);
        return null;
      }

      // Create an array of promises for parallel processing
      const transactionPromises = Object.keys(courses).map(courseId => {
        // Use transaction to ensure atomic updates to each course summary
        return db.ref(`studentCourseSummaries/${studentId}_${courseId}`)
          .transaction(currentData => {
            // If no current data, we can't update what doesn't exist
            if (currentData === null) {
              console.log(`No existing summary for student ${studentId}, course ${courseId}`);
              return null; // Skip this update - will be created by other functions
            }

            // Start with current data and update only changed fields
            const updatedData = { ...currentData };
            
            // Update only fields that have changed
            for (const field of fieldsToCheck) {
              if (field === 'AdditionalGuardians' && changedFields.AdditionalGuardians) {
                // Handle guardian emails
                const guardians = newProfileData.AdditionalGuardians || [];
                for (let i = 0; i < guardians.length; i++) {
                  updatedData[`guardianEmail${i + 1}`] = guardians[i].email || '';
                }
                
                // Remove any extra guardian emails if the number of guardians has decreased
                const oldGuardians = oldProfileData.AdditionalGuardians || [];
                if (guardians.length < oldGuardians.length) {
                  for (let i = guardians.length + 1; i <= oldGuardians.length; i++) {
                    updatedData[`guardianEmail${i}`] = null;
                  }
                }
              } else if (changedFields[field]) {
                updatedData[field] = newProfileData[field] !== undefined ? 
                  newProfileData[field] : (field === 'age' ? 0 : '');
              }
            }
            
            // Add timestamp to track which update is newest
            updatedData.profileLastUpdated = admin.database.ServerValue.TIMESTAMP;
            
            return updatedData;
          });
      });

      // Execute all transactions in parallel
      const results = await Promise.all(transactionPromises);
      
      // Count successful updates
      const successCount = results.filter(result => 
        result.committed && result.snapshot.exists()).length;
      
      console.log(
        `Successfully synced ${Object.keys(changedFields).length} profile fields for student ${studentId} across ${successCount} courses`
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
 * Cloud Function: updateStudentCourseSummary
 * Uses transactions to safely update fields that have actually changed
 */
const updateStudentCourseSummary = functions.database
  .ref('/students/{studentId}/courses/{courseId}')
  .onWrite(async (change, context) => {
    const { studentId, courseId } = context.params;
    const newValue = change.after.val();
    const oldValue = change.before.val() || {};
    const db = admin.database();

    if (!newValue) {
      try {
        // Use transaction to safely remove the course summary
        await db.ref(`studentCourseSummaries/${studentId}_${courseId}`)
          .transaction(currentData => {
            // Only remove if it exists
            if (currentData !== null) {
              return null; // This removes the node
            }
            return currentData; // No change if it doesn't exist
          });
          
        console.log(`Successfully removed course summary for student ${studentId}, course ${courseId}`);
        return null;
      } catch (error) {
        console.error(`Error removing course summary: ${error.message}`);
        throw error;
      }
    }

    try {
      // Prepare course fields to check for changes
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
        'inOldSharePoint': 'inOldSharePoint'
      };

      // Prepare additional fields that need special handling
      const additionalFields = {
        'ScheduleJSON': 'hasSchedule',
        'primarySchoolName': 'primarySchoolName',
        'resumingOnDate': 'resumingOnDate',
        'payment_status/status': 'payment_status'
      };

      // Gather changes for direct course fields
      const directFieldChanges = {};
      for (const [sourceField, targetField] of Object.entries(directCourseFields)) {
        if (sourceField.includes('.')) {
          const [parent, child] = sourceField.split('.');
          const newFieldValue = newValue[parent]?.[child];
          const oldFieldValue = oldValue[parent]?.[child];
          
          if (JSON.stringify(newFieldValue) !== JSON.stringify(oldFieldValue)) {
            directFieldChanges[targetField] = newFieldValue || '';
          }
        } else if (JSON.stringify(newValue[sourceField]) !== JSON.stringify(oldValue[sourceField])) {
          if (sourceField === 'CourseID') {
            directFieldChanges[targetField] = newValue[sourceField] || courseId;
          } else if (sourceField === 'autoStatus' || sourceField === 'inOldSharePoint') {
            directFieldChanges[targetField] = newValue[sourceField] !== undefined ? newValue[sourceField] : false;
          } else {
            directFieldChanges[targetField] = newValue[sourceField] !== undefined ? 
              newValue[sourceField] : 
              (sourceField === 'PercentScheduleComplete' || sourceField === 'PercentCompleteGradebook' ? 0 : '');
          }
        }
      }

      // Gather changes for special fields that need extra processing
      const specialFieldChanges = {};
      for (const [sourceField, targetField] of Object.entries(additionalFields)) {
        let newFieldValue, oldFieldValue;
        
        if (sourceField.includes('/')) {
          const fieldPath = sourceField.split('/');
          const fieldSnap = await db
            .ref(`students/${studentId}/courses/${courseId}/${fieldPath[0]}/${fieldPath[1]}`)
            .once('value');
          newFieldValue = fieldSnap.val();
          
          const oldFieldSnap = await db
            .ref(`students/${studentId}/courses/${courseId}/${fieldPath[0]}/${fieldPath[1]}`)
            .once('value');
          oldFieldValue = oldFieldSnap.val();
        } else if (sourceField === 'ScheduleJSON') {
          const scheduleJsonSnap = await db
            .ref(`students/${studentId}/courses/${courseId}/ScheduleJSON`)
            .once('value');
          newFieldValue = scheduleJsonSnap.exists();
          
          // Try to determine if old value existed
          let oldScheduleCheck = false;
          try {
            oldScheduleCheck = change.before.child('ScheduleJSON').exists();
          } catch (e) {
            // Can't determine previous existence, assume it's changed
          }
          oldFieldValue = oldScheduleCheck;
        } else {
          const fieldSnap = await db
            .ref(`students/${studentId}/courses/${courseId}/${sourceField}`)
            .once('value');
          newFieldValue = fieldSnap.val() || '';
          oldFieldValue = oldValue[sourceField];
        }
        
        if (JSON.stringify(newFieldValue) !== JSON.stringify(oldFieldValue)) {
          specialFieldChanges[targetField] = newFieldValue || '';
        }
      }

      // Check if we have any changes to make
      const hasChanges = 
        Object.keys(directFieldChanges).length > 0 || 
        Object.keys(specialFieldChanges).length > 0;

      if (!hasChanges) {
        console.log(`No relevant changes detected for student ${studentId} in course ${courseId}`);
        return null;
      }

      // Use transaction to safely update the course summary
      const result = await db.ref(`studentCourseSummaries/${studentId}_${courseId}`)
        .transaction(currentData => {
          // If summary doesn't exist, initialize with full data
          if (currentData === null) {
            console.log(`Creating new course summary during update for student ${studentId}, course ${courseId}`);
            // This will be initialized by createStudentCourseSummaryOnCourseCreate
            // But we'll return empty object to avoid null error, will be filled by other function
            return {}; 
          }
          
          // Update current data with our changes
          const updatedData = { ...currentData, ...directFieldChanges, ...specialFieldChanges };
          
          // Always update lastUpdated timestamp
          updatedData.lastUpdated = admin.database.ServerValue.TIMESTAMP;
          
          return updatedData;
        });

      if (result.committed) {
        console.log(
          `Successfully updated ${Object.keys(directFieldChanges).length + Object.keys(specialFieldChanges).length} fields in studentCourseSummary for student ${studentId} in course ${courseId}`
        );
      } else {
        console.log(`Transaction aborted for student ${studentId} in course ${courseId}`);
      }
      
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
 * Cloud Function: createStudentCourseSummaryOnCourseCreate
 * Uses transactions to safely create course summaries
 */
const createStudentCourseSummaryOnCourseCreate = functions.database
  .ref('/students/{studentId}/courses/{courseId}')
  .onCreate(async (snapshot, context) => {
    const { studentId, courseId } = context.params;
    const db = admin.database();
    
    // Retrieve course data
    const courseData = snapshot.val();
    
    // Retrieve the student's profile data
    const profileSnap = await db.ref(`/students/${studentId}/profile`).once('value');
    const profileData = profileSnap.val();
  
    if (!profileData) {
      console.log(`No profile found for student ${studentId}`);
      return null;
    }
    
    try {
      // Initialize summary data
      let summaryData = {};
      
      // Add profile fields
      const profileFields = [
        'LastSync', 'ParentEmail', 'ParentFirstName', 'ParentLastName', 
        'ParentPhone_x0023_', 'StudentEmail', 'StudentPhone', 'age', 'asn', 
        'birthday', 'firstName', 'lastName', 'originalEmail', 
        'preferredFirstName', 'gender', 'uid'
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
      
      // Add course fields as defined in updateStudentCourseSummary
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
        'inOldSharePoint': 'inOldSharePoint'
      };
    
      // Copy course fields
      for (const [sourceField, targetField] of Object.entries(directCourseFields)) {
        // Handle nested fields like Status.Value
        if (sourceField.includes('.')) {
          const [parent, child] = sourceField.split('.');
          if (courseData[parent] && courseData[parent][child] !== undefined) {
            summaryData[targetField] = courseData[parent][child];
          } else {
            summaryData[targetField] = '';
          }
        }
        // Handle normal fields
        else {
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
      
      // Handle special fields
      const additionalFields = {
        'ScheduleJSON': 'hasSchedule',
        'primarySchoolName': 'primarySchoolName',
        'resumingOnDate': 'resumingOnDate',
        'payment_status/status': 'payment_status'
      };
    
      for (const [sourceField, targetField] of Object.entries(additionalFields)) {
        if (sourceField.includes('/')) {
          const [parent, child] = sourceField.split('/');
          const fieldPath = `students/${studentId}/courses/${courseId}/${parent}/${child}`;
          const fieldSnap = await db.ref(fieldPath).once('value');
          summaryData[targetField] = fieldSnap.val() || '';
        } else if (sourceField === 'ScheduleJSON') {
          const scheduleExists = await db.ref(`students/${studentId}/courses/${courseId}/ScheduleJSON`).once('value');
          summaryData[targetField] = scheduleExists.exists();
        } else {
          const fieldValue = await db.ref(`students/${studentId}/courses/${courseId}/${sourceField}`).once('value');
          summaryData[targetField] = fieldValue.val() || '';
        }
      }
      
      // Add creation and update timestamps
      summaryData.lastUpdated = admin.database.ServerValue.TIMESTAMP;
      summaryData.createdAt = admin.database.ServerValue.TIMESTAMP;
      
      // Use transaction to ensure we don't overwrite existing data
      const result = await db.ref(`studentCourseSummaries/${studentId}_${courseId}`)
        .transaction(currentData => {
          // If the data already exists (possibly from a race condition with updateStudentCourseSummary)
          if (currentData !== null) {
            console.log(`Course summary already exists for student ${studentId}, course ${courseId}, merging data`);
            // Merge our data with existing data, but don't overwrite newer timestamps
            return { ...summaryData, ...currentData, 
              // Only update these if they don't exist
              lastUpdated: currentData.lastUpdated || summaryData.lastUpdated,
              createdAt: currentData.createdAt || summaryData.createdAt
            };
          }
          
          // If no data exists, create it fresh
          return summaryData;
        });
        
      if (result.committed) {
        console.log(`Successfully created/merged course summary for student ${studentId}, course ${courseId}`);
      } else {
        console.log(`Transaction aborted for student ${studentId} in course ${courseId}`);
      }
      
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

// Export all functions
module.exports = {
  updateStudentCourseSummary,
  syncProfileToCourseSummaries,
  createStudentCourseSummaryOnCourseCreate
};