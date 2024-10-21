// functions/summaries.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Cloud Function: updateStudentCourseSummary
 *
 * Updates the studentCourseSummaries node whenever a student's course data changes.
 */
const updateStudentCourseSummary = functions.database
  .ref('/students/{studentId}/courses/{courseId}')
  .onWrite(async (change, context) => {
    const { studentId, courseId } = context.params;
    const newValue = change.after.val();
    const db = admin.database();

    // If the course was deleted, remove it from studentCourseSummaries
    if (!newValue) {
      await db.ref(`studentCourseSummaries/${studentId}_${courseId}`).remove();
      return null;
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

      // Construct the summary object with only the required fields
      const summary = {
        Status_Value: newValue.Status?.Value || '',
        Course_Value: newValue.Course?.Value || '',
        School_x0020_Year_Value: newValue.School_x0020_Year?.Value || '',
        StudentType_Value: newValue.StudentType?.Value || '',
        DiplomaMonthChoices_Value: newValue.DiplomaMonthChoices?.Value || '',
        ActiveFutureArchived_Value:
          newValue.ActiveFutureArchived?.Value || '',
        PercentScheduleComplete: newValue.PercentScheduleComplete || 0,
        PercentCompleteGradebook: newValue.PercentCompleteGradebook || 0,
        StudentEmail: profile.StudentEmail || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        asn: profile.asn || '',
        CourseID: newValue.CourseID || courseId,
        LMSStudentID: newValue.LMSStudentID || '',
        StatusCompare: newValue.StatusCompare || '',
        autoStatus:
          newValue.autoStatus !== undefined ? newValue.autoStatus : false,
        categories: newValue.categories || {},
        adherenceMetrics: adherenceMetrics,
        grade: grade,
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

      // Optionally log the error to a database path for debugging
      await db.ref('errorLogs/updateStudentCourseSummary').push({
        studentId,
        courseId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      return null;
    }
  });

module.exports = {
  updateStudentCourseSummary,
};
