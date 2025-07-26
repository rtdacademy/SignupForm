// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Helper functions for date validation
const toEdmontonDate = (dateValue) => {
  if (!dateValue) return null;
  
  // For YYYY-MM-DD format
  if (typeof dateValue === 'string') {
    const [year, month, day] = dateValue.split('-').map(Number);
    // Create a date at the specified day with time set to midnight
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    return date;
  }
  
  // If we get here, try to parse it as a date anyway
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date;
};

const toDateString = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return 0;
  
  // Convert string to Date if necessary
  const birthDateObj = typeof birthDate === 'string' ? toEdmontonDate(birthDate) : birthDate;
  
  let age = referenceDate.getFullYear() - birthDateObj.getFullYear();
  const m = referenceDate.getMonth() - birthDateObj.getMonth();
  
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
};

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
    const allowedFields = ['preferredFirstName', 'StudentPhone', 'gender', 'birthday'];
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
      
      if (field === 'birthday' && newValue) {
        // Parse the date using Edmonton timezone
        const birthDate = toEdmontonDate(newValue);
        
        // Validate it's a valid date
        if (!birthDate || isNaN(birthDate.getTime())) {
          throw new HttpsError('invalid-argument', 'Invalid date format');
        }
        
        // Check not in future (using current date)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        if (birthDate > today) {
          throw new HttpsError('invalid-argument', 'Birthday cannot be in the future');
        }
        
        // Check reasonable age bounds (5-100 years)
        const age = calculateAge(birthDate);
        if (age < 5 || age > 100) {
          throw new HttpsError('invalid-argument', 'Please enter a valid birthday');
        }
      }
      
      const oldValue = currentProfile[field];
      if (oldValue !== newValue) {
        updateData[field] = newValue;
        fieldsChanged.push(field);
        
        // If birthday changed, also update age
        if (field === 'birthday') {
          const age = calculateAge(toEdmontonDate(newValue));
          updateData.age = age;
          if (!fieldsChanged.includes('age')) {
            fieldsChanged.push('age');
          }
        }
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