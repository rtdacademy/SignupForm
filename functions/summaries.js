const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: syncProfileToCourseSummaries
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
        const courseData = courses[courseId];
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
        updates[`studentCourseSummaries/${studentId}_${courseId}/gender`] = 
          newProfileData.gender || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/uid`] = 
          newProfileData.uid || '';
        
        updates[`studentCourseSummaries/${studentId}_${courseId}/ScheduleStartDate`] = 
          courseData.ScheduleStartDate || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/ScheduleEndDate`] = 
          courseData.ScheduleEndDate || '';
        updates[`studentCourseSummaries/${studentId}_${courseId}/Created`] = 
          courseData.Created || null;

        // Update guardian emails
        const guardians = newProfileData.AdditionalGuardians || [];
        for (let i = 0; i < guardians.length; i++) {
          updates[`studentCourseSummaries/${studentId}_${courseId}/guardianEmail${i + 1}`] = guardians[i].email || '';
        }

        // Remove any extra guardian emails if the number of guardians has decreased
        const maxGuardians = guardians.length;
        for (let i = maxGuardians + 1; ; i++) {
          const guardianEmailKey = `studentCourseSummaries/${studentId}_${courseId}/guardianEmail${i}`;
          if (updates[guardianEmailKey] === undefined) {
            break; // No more guardian emails to remove
          }
          updates[guardianEmailKey] = null; // Set to null to remove the property
        } 
      });

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
 */
const updateStudentCourseSummary = functions.database
  .ref('/students/{studentId}/courses/{courseId}')
  .onWrite(async (change, context) => {
    const { studentId, courseId } = context.params;
    const newValue = change.after.val();
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
      const profileSnap = await db
        .ref(`students/${studentId}/profile`)
        .once('value');
      const profile = profileSnap.val() || {};

      const adherenceMetricsSnap = await db
        .ref(
          `/students/${studentId}/courses/${courseId}/jsonGradebookSchedule/adherenceMetrics`
        )
        .once('value');
      const adherenceMetrics = adherenceMetricsSnap.val() || {};

      const gradeSnap = await db
        .ref(
          `/students/${studentId}/courses/${courseId}/jsonGradebookSchedule/overallTotals/percentage`
        )
        .once('value');
      const grade = gradeSnap.val() || 0;

      const scheduleJsonSnap = await db
        .ref(`students/${studentId}/courses/${courseId}/ScheduleJSON`)
        .once('value');
      const hasSchedule = scheduleJsonSnap.exists();

      // Get primarySchoolName
      const primarySchoolNameSnap = await db
        .ref(`students/${studentId}/courses/${courseId}/primarySchoolName`)
        .once('value');
      const primarySchoolName = primarySchoolNameSnap.val() || '';

      // Get resumingOnDate
      const resumingOnDateSnap = await db
        .ref(`students/${studentId}/courses/${courseId}/resumingOnDate`)
        .once('value');
      const resumingOnDate = resumingOnDateSnap.val() || '';

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
        primarySchoolName: primarySchoolName,
        resumingOnDate: resumingOnDate, // Add resumingOnDate to summary
        
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
        gender: profile.gender || '',
        uid: profile.uid || '',
      
        ScheduleStartDate: newValue.ScheduleStartDate || '',
        ScheduleEndDate: newValue.ScheduleEndDate || '',
      
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