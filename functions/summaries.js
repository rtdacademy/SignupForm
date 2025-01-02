const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: syncProfileToCourseSummaries
 * 
 * Syncs profile changes to all related studentCourseSummaries entries
 * when a student's profile is updated.
 */
const syncProfileToCourseSummaries = functions.database
  .ref('/students/{studentId}/profile')
  .onWrite(async (change, context) => {
    const { studentId } = context.params;
    const newProfileData = change.after.val();
    const db = admin.database();

    if (!newProfileData) {
      console.log(`Profile data was deleted for student ${studentId}`);
      return null;
    }

    try {
      // Get all courses for this student
      const coursesSnap = await db
        .ref(`students/${studentId}/courses`)
        .once('value');
      const courses = coursesSnap.val();

      if (!courses) {
        console.log(`No courses found for student ${studentId}`);
        return null;
      }

      // Create batch updates object
      const updates = {};

      // For each course, update the corresponding summary
      Object.keys(courses).forEach(courseId => {
        const courseData = courses[courseId];
        // Sync all profile-related fields
        updates[`studentCourseSummaries/${studentId}_${courseId}/LastSync`] = 
          newProfileData.LastSync || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/ParentEmail`] = 
          newProfileData.ParentEmail || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/ParentFirstName`] = 
          newProfileData.ParentFirstName || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/ParentLastName`] = 
          newProfileData.ParentLastName || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/ParentPhone_x0023_`] = 
          newProfileData.ParentPhone_x0023_ || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/StudentEmail`] = 
          newProfileData.StudentEmail || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/StudentPhone`] = 
          newProfileData.StudentPhone || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/age`] = 
          newProfileData.age || 0;
        updates[`studentCourseSummaries/${studentId}_${courseId}/asn`] = 
          newProfileData.asn || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/birthday`] = 
          newProfileData.birthday || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/firstName`] = 
          newProfileData.firstName || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/lastName`] = 
          newProfileData.lastName || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/originalEmail`] = 
          newProfileData.originalEmail || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/preferredFirstName`] = 
          newProfileData.preferredFirstName || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/uid`] = 
          newProfileData.uid || '';
        
        // Include schedule dates and Created timestamp from the course data
        updates[`studentCourseSummaries/${studentId}_${courseId}/ScheduleStartDate`] = 
          courseData.ScheduleStartDate || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/ScheduleEndDate`] = 
          courseData.ScheduleEndDate || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/Created`] = 
          courseData.Created || null;
      });

      // Perform all updates in a single transaction
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log(
          `Successfully synced profile updates for student ${studentId} across ${
            Object.keys(courses).length
          } courses`
        );
      }

      return null;
    } catch (error) {
      console.error(
        `Error syncing profile updates for student ${studentId}: ${error.message}`
      );

      // Log error for debugging
      await db.ref('errorLogs/syncProfileToCourseSummaries').push({
        studentId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      throw error; // Rethrow to ensure function failure is properly logged
    }
  });

/**
 * Cloud Function: updateStudentCourseSummary
 *
 * Updates the studentCourseSummaries node whenever a student's course data changes.
 * Includes handling for course deletion and error logging.
 */
const updateStudentCourseSummary = functions.database
  .ref('/students/{studentId}/courses/{courseId}')
  .onWrite(async (change, context) => {
    const { studentId, courseId } = context.params;
    const newValue = change.after.val();
    const db = admin.database();

    // If the course was deleted, remove it from studentCourseSummaries
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
      // Fetch additional required data from the student's profile
      const profileSnap = await db
        .ref(`students/${studentId}/profile`)
        .once('value');
      const profile = profileSnap.val() || {};

      // Fetch adherenceMetrics from jsonGradebookSchedule
      const adherenceMetricsSnap = await db
        .ref(
          `/students/${studentId}/courses/${courseId}/jsonGradebookSchedule/adherenceMetrics`
        )
        .once('value');
      const adherenceMetrics = adherenceMetricsSnap.val() || {};

      // Fetch grade percentage from overallTotals
      const gradeSnap = await db
        .ref(
          `/students/${studentId}/courses/${courseId}/jsonGradebookSchedule/overallTotals/percentage`
        )
        .once('value');
      const grade = gradeSnap.val() || 0;

      // Check if ScheduleJSON exists
      const scheduleJsonSnap = await db
        .ref(`students/${studentId}/courses/${courseId}/ScheduleJSON`)
        .once('value');
      const hasSchedule = scheduleJsonSnap.exists();

      // Construct the summary object with only the required fields
      const summary = {
        Status_Value: newValue.Status?.Value || '',
        Status_SharepointValue: newValue.Status?.SharepointValue || '',
        Course_Value: newValue.Course?.Value || '',
        School_x0020_Year_Value: newValue.School_x0020_Year?.Value || '',
        StudentType_Value: newValue.StudentType?.Value || '',
        DiplomaMonthChoices_Value: newValue.DiplomaMonthChoices?.Value || '',
        ActiveFutureArchived_Value: newValue.ActiveFutureArchived?.Value || '',
        PercentScheduleComplete: newValue.PercentScheduleComplete || 0,
        PercentCompleteGradebook: newValue.PercentCompleteGradebook || 0,
        Created: newValue.Created || null,
        hasSchedule: hasSchedule,
        
        // Profile fields
        LastSync: profile.LastSync || '',
        ParentEmail: profile.ParentEmail || '',
        ParentFirstName: profile.ParentFirstName || '',
        ParentLastName: profile.ParentLastName || '',
        ParentPhone_x0023_: profile.ParentPhone_x0023_ || '',
        StudentEmail: profile.StudentEmail || '',
        StudentPhone: profile.StudentPhone || '',
        age: profile.age || 0,
        asn: profile.asn || '',
        birthday: profile.birthday || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        originalEmail: profile.originalEmail || '',
        preferredFirstName: profile.preferredFirstName || '',
        uid: profile.uid || '',
      
        // Schedule dates
        ScheduleStartDate: newValue.ScheduleStartDate || '',
        ScheduleEndDate: newValue.ScheduleEndDate || '',
      
        // Course-specific fields
        CourseID: newValue.CourseID || courseId,
        LMSStudentID: newValue.LMSStudentID || '',
        StatusCompare: newValue.StatusCompare || '',
        section: newValue.section || '',
        autoStatus: newValue.autoStatus !== undefined ? newValue.autoStatus : false,
        categories: newValue.categories || {},
        adherenceMetrics: adherenceMetrics,
        grade: grade,
        inOldSharePoint: newValue.inOldSharePoint !== undefined ? newValue.inOldSharePoint : false,
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
      };

      // Update the studentCourseSummaries node
      await db
        .ref(`studentCourseSummaries/${studentId}_${courseId}`)
        .update(summary);

      console.log(
        `Successfully updated studentCourseSummary for student ${studentId} in course ${courseId}`
      );
      return null;
    } catch (error) {
      console.error(
        `Error updating studentCourseSummary for student ${studentId} in course ${courseId}: ${error.message}`
      );

      // Log the error to a database path for debugging
      await db.ref('errorLogs/updateStudentCourseSummary').push({
        studentId,
        courseId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      throw error; // Rethrow to ensure function failure is properly logged
    }
  });

/**
 * Export all functions
 */
module.exports = {
  updateStudentCourseSummary,
  syncProfileToCourseSummaries,
};