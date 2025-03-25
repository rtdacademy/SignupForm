// functions/categories.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Cloud Function: deleteCategoryForStudents
 *
 * Deletes or removes a category for all students associated with a teacher.
 */
const deleteCategoryForStudents = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    console.log('Unauthenticated user attempted to delete a category');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const { categoryId, teacherEmailKey, action } = data;

  if (!categoryId || !teacherEmailKey || !action) {
    console.log('Missing required parameters:', { categoryId, teacherEmailKey, action });
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
  }

  console.log(`Attempting to ${action} category ${categoryId} for teacher ${teacherEmailKey}`);

  // Get a reference to the database
  const db = admin.database();

  try {
    // Check if the studentCourseSummaries node exists
    const summariesExist = await db.ref('studentCourseSummaries').once('value');
    if (!summariesExist.exists()) {
      console.log('No studentCourseSummaries node found');
      return { success: true, message: "No students affected", affectedStudents: 0 };
    }

    // Query all studentCourseSummaries with this category
    const summariesSnapshot = await db.ref('studentCourseSummaries')
      .orderByChild(`categories/${teacherEmailKey}/${categoryId}`)
      .equalTo(true)
      .once('value');

    const updates = {};
    let affectedStudents = 0;

    summariesSnapshot.forEach(childSnapshot => {
      const studentCourseKey = childSnapshot.key;
      updates[`studentCourseSummaries/${studentCourseKey}/categories/${teacherEmailKey}/${categoryId}`] = null;
      affectedStudents++;
    });

    console.log(`Found ${affectedStudents} students with the category`);

    // Perform all updates in a single transaction
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
    throw new functions.https.HttpsError('internal', `An error occurred while ${action === 'delete' ? 'deleting' : 'removing'} the category for students.`);
  }
});

module.exports = {
  deleteCategoryForStudents,
};
