// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function: updateStudentCategories
 * Securely handles updating student category assignments from survey submissions
 * This replaces direct database writes from the client
 */
const updateStudentCategories = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  const { categoryUpdates, studentEmail, courseId } = data.data;

  // Validate inputs
  if (!categoryUpdates || !Array.isArray(categoryUpdates)) {
    throw new HttpsError('invalid-argument', 'Missing or invalid category updates');
  }

  if (!studentEmail || !courseId) {
    throw new HttpsError('invalid-argument', 'Missing student email or course ID');
  }

  const db = admin.database();
  const sanitizedEmail = sanitizeEmail(studentEmail);

  try {
    // Verify student exists and is enrolled in the course
    const courseRef = db.ref(`students/${sanitizedEmail}/courses/${courseId}`);
    const courseSnapshot = await courseRef.once('value');
    
    if (!courseSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student is not enrolled in this course');
    }

    // Build the update object
    const updates = {};
    
    for (const update of categoryUpdates) {
      const { staffKey, categoryId, value } = update;
      
      // Validate each update
      if (!staffKey || !categoryId) {
        console.warn('Skipping invalid category update:', update);
        continue;
      }
      
      // Sanitize the staff key (in case it's an email)
      const sanitizedStaffKey = staffKey.includes('@') ? sanitizeEmail(staffKey) : staffKey;
      
      // Build the path
      const path = `students/${sanitizedEmail}/courses/${courseId}/categories/${sanitizedStaffKey}/${categoryId}`;
      updates[path] = value !== false ? true : false; // Ensure boolean value
    }

    // Only proceed if we have valid updates
    if (Object.keys(updates).length === 0) {
      return {
        success: true,
        message: 'No valid category updates to process',
        updatedCount: 0
      };
    }

    // Execute the updates
    await db.ref().update(updates);

    console.log(`Updated ${Object.keys(updates).length} categories for student ${sanitizedEmail} in course ${courseId}`);

    return {
      success: true,
      message: 'Categories updated successfully',
      updatedCount: Object.keys(updates).length,
      updates: Object.keys(updates).map(path => {
        const parts = path.split('/');
        return {
          staffKey: parts[5],
          categoryId: parts[6]
        };
      })
    };

  } catch (error) {
    console.error('Error updating student categories:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update categories');
  }
});

// Export the function
module.exports = {
  updateStudentCategories
};