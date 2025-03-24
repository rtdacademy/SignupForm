const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: syncProfileToCourseSummaries
 * Only updates fields that have actually changed
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

      const updates = {};

      Object.keys(courses).forEach(courseId => {
        // Only update fields that actually changed
        for (const field of fieldsToCheck) {
          if (field === 'AdditionalGuardians' && changedFields.AdditionalGuardians) {
            // Handle guardian emails
            const guardians = newProfileData.AdditionalGuardians || [];
            for (let i = 0; i < guardians.length; i++) {
              updates[`studentCourseSummaries/${studentId}_${courseId}/guardianEmail${i + 1}`] = guardians[i].email || '';
            }
            
            // Remove any extra guardian emails if the number of guardians has decreased
            const oldGuardians = oldProfileData.AdditionalGuardians || [];
            if (guardians.length < oldGuardians.length) {
              for (let i = guardians.length + 1; i <= oldGuardians.length; i++) {
                updates[`studentCourseSummaries/${studentId}_${courseId}/guardianEmail${i}`] = null;
              }
            }
          } else if (changedFields[field]) {
            updates[`studentCourseSummaries/${studentId}_${courseId}/${field}`] = 
              newProfileData[field] !== undefined ? newProfileData[field] : (field === 'age' ? 0 : '');
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log(
          `Successfully synced ${Object.keys(changedFields).length} profile fields for student ${studentId} across ${
            Object.keys(courses).length
          } courses`
        );
      }

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
 * Only updates fields that have actually changed
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
        await db.ref(`studentCourseSummaries/${studentId}_${courseId}`).remove();
        console.log(`Successfully removed course summary for student ${studentId}, course ${courseId}`);
        return null;
      } catch (error) {
        console.error(`Error removing course summary: ${error.message}`);
        throw error;
      }
    }

    try {
      // Determine which fields have changed
      const updates = {};
      
      // Course fields to check for changes
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

      // Check each direct field for changes
      for (const [sourceField, targetField] of Object.entries(directCourseFields)) {
        // Handle nested fields like Status.Value
        if (sourceField.includes('.')) {
          const [parent, child] = sourceField.split('.');
          const newFieldValue = newValue[parent]?.[child];
          const oldFieldValue = oldValue[parent]?.[child];
          
          if (JSON.stringify(newFieldValue) !== JSON.stringify(oldFieldValue)) {
            updates[targetField] = newFieldValue || '';
          }
        } 
        // Handle normal fields
        else {
          if (JSON.stringify(newValue[sourceField]) !== JSON.stringify(oldValue[sourceField])) {
            if (sourceField === 'CourseID') {
              updates[targetField] = newValue[sourceField] || courseId;
            } else if (sourceField === 'autoStatus' || sourceField === 'inOldSharePoint') {
              updates[targetField] = newValue[sourceField] !== undefined ? newValue[sourceField] : false;
            } else {
              updates[targetField] = newValue[sourceField] !== undefined ? 
                newValue[sourceField] : 
                (sourceField === 'PercentScheduleComplete' || sourceField === 'PercentCompleteGradebook' ? 0 : '');
            }
          }
        }
      }

      // Check specific fields that need special handling
      const additionalFields = {
        'ScheduleJSON': 'hasSchedule',
        'primarySchoolName': 'primarySchoolName',
        'resumingOnDate': 'resumingOnDate',
        'payment_status/status': 'payment_status'
      };

      for (const [sourceField, targetField] of Object.entries(additionalFields)) {
        let newFieldValue, oldFieldValue;
        
        // For nested fields like payment_status/status
        if (sourceField.includes('/')) {
          const fieldPath = sourceField.split('/');
          const fieldSnap = await db
            .ref(`students/${studentId}/courses/${courseId}/${sourceField}`)
            .once('value');
          newFieldValue = fieldSnap.val();
          
          const oldFieldSnap = change.before.ref.parent.child(fieldPath[0]).child(fieldPath[1]).once('value');
          oldFieldValue = (await oldFieldSnap).val();
        } 
        // For ScheduleJSON which needs existence check
        else if (sourceField === 'ScheduleJSON') {
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
        }
        // For regular fields
        else {
          const fieldSnap = await db
            .ref(`students/${studentId}/courses/${courseId}/${sourceField}`)
            .once('value');
          newFieldValue = fieldSnap.val() || '';
          oldFieldValue = oldValue[sourceField];
        }
        
        if (JSON.stringify(newFieldValue) !== JSON.stringify(oldFieldValue)) {
          if (sourceField === 'ScheduleJSON') {
            updates[targetField] = newFieldValue;
          } else {
            updates[targetField] = newFieldValue || '';
          }
        }
      }

      // Always update lastUpdated timestamp if there are any changes
      if (Object.keys(updates).length > 0) {
        updates['lastUpdated'] = admin.database.ServerValue.TIMESTAMP;
        
        await db
          .ref(`studentCourseSummaries/${studentId}_${courseId}`)
          .update(updates);

        console.log(
          `Successfully updated ${Object.keys(updates).length} fields in studentCourseSummary for student ${studentId} in course ${courseId}`
        );
      } else {
        console.log(`No relevant changes detected for student ${studentId} in course ${courseId}`);
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

module.exports = {
  updateStudentCourseSummary,
  syncProfileToCourseSummaries,
};