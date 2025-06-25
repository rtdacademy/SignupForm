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
 * Cloud Function: setUserRoles
 * Automatically sets custom claims based on existing database roles
 * Called when user logs in and custom claims are missing or outdated
 */
const setUserRoles = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = data.auth.uid;
  const userEmail = data.auth.token.email;
  const sanitizedEmail = sanitizeEmail(userEmail);

  const db = admin.database();
  
  try {
    console.log(`Setting user roles for ${userEmail}`);
    
    // Initialize role tracking
    const roles = [];
    const permissions = {};
    
    // Check if user is staff (email domain check)
    const isStaffEmail = userEmail.endsWith('@rtdacademy.com');
    if (isStaffEmail) {
      roles.push('staff');
      permissions.isStaff = true;
      
      // Check admin status from database
      try {
        const adminSnapshot = await db.ref('adminEmails').once('value');
        const adminEmails = adminSnapshot.val() || [];
        if (adminEmails.includes(userEmail.toLowerCase())) {
          roles.push('admin');
          permissions.isAdmin = true;
        }
      } catch (adminError) {
        console.warn('Could not check admin status:', adminError.message);
      }
      
      // Check super admin status (hardcoded list)
      const superAdminEmails = [
        'kyle@rtdacademy.com',
        'stan@rtdacademy.com', 
        'charlie@rtdacademy.com'
      ];
      if (superAdminEmails.includes(userEmail.toLowerCase())) {
        roles.push('superadmin');
        permissions.isSuperAdmin = true;
      }
    }

    // Check if user has student data
    try {
      const studentSnapshot = await db.ref(`students/${sanitizedEmail}`).once('value');
      if (studentSnapshot.exists()) {
        roles.push('student');
        permissions.canAccessStudentPortal = true;
        console.log(`Found student data for ${userEmail}`);
      }
    } catch (studentError) {
      // Permission denied or not found - user is not a student
      console.log(`No student data found for ${userEmail}:`, studentError.message);
    }

    // Check if user has parent data
    try {
      const parentSnapshot = await db.ref(`parents/${sanitizedEmail}/profile`).once('value');
      if (parentSnapshot.exists()) {
        const parentProfile = parentSnapshot.val();
        // Only add parent role if email is verified
        if (parentProfile.emailVerified === true) {
          roles.push('parent');
          permissions.canAccessParentPortal = true;
          console.log(`Found verified parent data for ${userEmail}`);
        } else {
          console.log(`Found unverified parent data for ${userEmail}`);
        }
      }
    } catch (parentError) {
      // Permission denied or not found - user is not a parent
      console.log(`No parent data found for ${userEmail}:`, parentError.message);
    }

    // Determine primary role (priority: staff > parent > student)
    let primaryRole = 'student'; // default
    if (permissions.isStaff) {
      primaryRole = 'staff';
    } else if (permissions.canAccessParentPortal) {
      primaryRole = 'parent';
    } else if (permissions.canAccessStudentPortal) {
      primaryRole = 'student';
    }

    // If no roles found, default to student role
    if (roles.length === 0) {
      roles.push('student');
      permissions.canAccessStudentPortal = true;
      console.log(`No existing roles found for ${userEmail}, defaulting to student`);
    }

    // Create custom claims object
    const customClaims = {
      roles,
      primaryRole,
      permissions,
      lastUpdated: Date.now(),
      email: userEmail // For debugging purposes
    };

    // Set custom claims on the user
    await admin.auth().setCustomUserClaims(uid, customClaims);
    
    console.log(`Successfully set custom claims for ${userEmail}:`, customClaims);

    return {
      success: true,
      message: 'User roles set successfully',
      claims: customClaims,
      rolesFound: roles.length
    };
    
  } catch (error) {
    console.error('Error setting user roles:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', `Failed to set user roles: ${error.message}`);
  }
});

// Export the function
module.exports = {
  setUserRoles
};