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
 * Cloud Function: updateStudentProfile
 * Allows students to update limited profile fields
 */
const updateStudentProfile = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { updates } = data.data;
  const uid = data.auth.uid;
  const userEmail = data.auth.token.email;
  const studentEmailKey = sanitizeEmail(userEmail);

  if (!updates) {
    throw new HttpsError('invalid-argument', 'Missing updates data');
  }

  const db = admin.database();
  
  try {
    // Get current profile to validate the student exists
    const profileRef = db.ref(`students/${studentEmailKey}/profile`);
    const profileSnapshot = await profileRef.once('value');
    
    if (!profileSnapshot.exists()) {
      throw new HttpsError('not-found', 'Student profile not found');
    }
    
    const currentProfile = profileSnapshot.val();
    
    // Verify this is the correct student by checking email and UID
    if (currentProfile.StudentEmail !== userEmail || currentProfile.uid !== uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }
    
    // Valid fields that students can update themselves
    const allowedFields = ['preferredFirstName', 'StudentPhone', 'gender'];
    const updateData = {};
    const fieldsChanged = [];
    
    for (const [field, newValue] of Object.entries(updates)) {
      if (!allowedFields.includes(field)) {
        throw new HttpsError('invalid-argument', `Field '${field}' is not allowed for student updates`);
      }
      
      // Validate the data
      if (field === 'StudentPhone' && newValue) {
        // Basic phone validation - should be a string with numbers
        if (typeof newValue !== 'string' || newValue.length < 10) {
          throw new HttpsError('invalid-argument', 'Invalid phone number format');
        }
      }
      
      if (field === 'gender' && newValue) {
        const validGenders = ['male', 'female', 'prefer-not-to-say'];
        if (!validGenders.includes(newValue)) {
          throw new HttpsError('invalid-argument', 'Invalid gender value');
        }
      }
      
      if (field === 'preferredFirstName' && newValue) {
        if (typeof newValue !== 'string' || newValue.trim().length === 0) {
          throw new HttpsError('invalid-argument', 'Preferred first name cannot be empty');
        }
      }
      
      const oldValue = currentProfile[field];
      if (oldValue !== newValue) {
        updateData[field] = newValue;
        fieldsChanged.push(field);
      }
    }
    
    if (fieldsChanged.length === 0) {
      return {
        success: true,
        message: 'No changes detected',
        updatedFields: []
      };
    }
    
    // Update the profile
    await profileRef.update(updateData);
    
    return {
      success: true,
      message: 'Profile updated successfully',
      updatedFields: fieldsChanged,
      updatedData: updateData
    };
    
  } catch (error) {
    console.error('Error updating student profile:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to update profile');
  }
});

// Export the function
module.exports = {
  updateStudentProfile
};