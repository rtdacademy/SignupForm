const admin = require('firebase-admin');
const { onValueWritten } = require('firebase-functions/v2/database');

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Helper function to create a unique summary key
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {string} studentId - The student ID
 * @param {string} courseId - The course ID
 * @returns {string} - Unique key for the summary node
 */
function createSummaryKey(familyId, schoolYear, studentId, courseId) {
  return `${familyId}_${schoolYear}_${studentId}_${courseId}`;
}

/**
 * Cloud Function: Sync course status to summary
 * Handles creation, updates, and deletion
 * Listens to: /homeEducationFamilies/familyInformation/{familyId}/SOLO_EDUCATION_PLANS/{schoolYear}/{studentId}/courseStatus/{courseId}
 */
const onHomeEducationCourseStatusChange = onValueWritten({
  ref: '/homeEducationFamilies/familyInformation/{familyId}/SOLO_EDUCATION_PLANS/{schoolYear}/{studentId}/courseStatus/{courseId}',
  region: 'us-central1',
  maxInstances: 10,
  memory: '256MiB'
}, async (event) => {
  const { familyId, schoolYear, studentId, courseId } = event.params;
  const db = admin.database();
  const summaryKey = createSummaryKey(familyId, schoolYear, studentId, courseId);
  const summaryRef = db.ref(`homeEducationFamilies/courseStatusSummary/${summaryKey}`);

  try {
    // Handle deletion (value → null)
    if (!event.data.after.exists()) {
      console.log(`🗑️ Course status deleted for ${summaryKey}`);
      await summaryRef.remove();
      console.log(`✅ Removed course status summary for ${summaryKey}`);
      return null;
    }

    // Handle creation or update
    const courseStatusData = event.data.after.val();
    const beforeExists = event.data.before.exists();

    // Prepare summary data with all course status fields
    const summaryData = {
      // Identifiers for filtering
      familyId,
      schoolYear,
      studentId,
      courseId,

      // Copy all course status fields (entire node)
      ...courseStatusData,

      // Add/update timestamp
      lastUpdated: admin.database.ServerValue.TIMESTAMP
    };

    // Get the existing createdAt if this is an update
    let createdAt = admin.database.ServerValue.TIMESTAMP;
    if (beforeExists) {
      const existingSummary = await summaryRef.once('value');
      createdAt = existingSummary.val()?.createdAt || admin.database.ServerValue.TIMESTAMP;
    }

    summaryData.createdAt = createdAt;

    // Use .set() for both creation and updates to ensure exact mirroring
    // This ensures deleted properties are removed from the summary
    await summaryRef.set(summaryData);
    console.log(beforeExists ? `✅ Updated` : `✨ Created`, `course status summary for ${summaryKey}`);

    return null;
  } catch (error) {
    console.error(`❌ Error syncing course status summary for ${summaryKey}:`, error);

    // Log error for debugging
    await db.ref('errorLogs/updateHomeEducationCourseStatusSummary').push({
      familyId,
      schoolYear,
      studentId,
      courseId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    throw error;
  }
});

module.exports = {
  onHomeEducationCourseStatusChange
};
