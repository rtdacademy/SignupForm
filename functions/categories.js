// functions/categories.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: deleteCategoryForStudentsV2
 *
 * Deletes or removes a category for all students associated with a teacher.
 */
const deleteCategoryForStudentsV2 = onCall({
  concurrency: 50,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Verify that the user is authenticated
  if (!data.auth) {
    console.log('Unauthenticated user attempted to delete a category');
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  // Extract required parameters from the request payload
  const { categoryId, teacherEmailKey, action } = data.data;

  if (!categoryId || !teacherEmailKey || !action) {
    console.log('Missing required parameters:', { categoryId, teacherEmailKey, action });
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  console.log(`Attempting to ${action} category ${categoryId} for teacher ${teacherEmailKey}`);

  // Get a reference to the database
  const db = admin.database();

  try {
    // Check if the studentCourseSummaries node exists
    const summariesSnapshot = await db.ref('studentCourseSummaries').once('value');
    if (!summariesSnapshot.exists()) {
      console.log('No studentCourseSummaries node found');
      return { success: true, message: "No students affected", affectedStudents: 0 };
    }

    // Query all studentCourseSummaries that contain this category
    const summariesQuery = db.ref('studentCourseSummaries')
      .orderByChild(`categories/${teacherEmailKey}/${categoryId}`)
      .equalTo(true);
    const summariesSnapshot2 = await summariesQuery.once('value');

    const updates = {};
    let affectedStudents = 0;

    summariesSnapshot2.forEach(childSnapshot => {
      const studentCourseKey = childSnapshot.key;
      updates[`studentCourseSummaries/${studentCourseKey}/categories/${teacherEmailKey}/${categoryId}`] = null;
      affectedStudents++;
    });

    console.log(`Found ${affectedStudents} students with the category`);

    // Perform all updates in a single transaction if necessary
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`Successfully updated ${affectedStudents} student records`);
    } else {
      console.log('No updates needed, no students had this category');
    }

    // If the action is 'delete', remove the category from the teacher's categories
    if (action === 'delete') {
      await db.ref(`teacherCategories/${teacherEmailKey}/${categoryId}`).remove();
      console.log(`Category ${categoryId} removed from teacher ${teacherEmailKey}`);
    }

    return { 
      success: true, 
      message: `Category ${action === 'delete' ? 'deleted' : 'removed'} successfully for ${affectedStudents} students`, 
      affectedStudents 
    };
  } catch (error) {
    console.error(`Error ${action === 'delete' ? 'deleting' : 'removing'} category for students:`, error);
    throw new HttpsError('internal', `An error occurred while ${action === 'delete' ? 'deleting' : 'removing'} the category for students.`);
  }
});

module.exports = {
  deleteCategoryForStudentsV2,
};
