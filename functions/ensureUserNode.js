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
 * Cloud Function: ensureUserNode
 * Ensures a user node exists in the database and updates it with latest information
 * This function runs with admin privileges to bypass security rules
 */
const ensureUserNode = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  // Get auth context - this might be null if called before auth is fully established
  const auth = request.auth;
  const { uid, email, emailVerified, providerData } = request.data;

  if (!uid || !email) {
    throw new HttpsError('invalid-argument', 'Missing required user information');
  }

  const db = admin.database();
  const userRef = db.ref(`users/${uid}`);
  const emailKey = sanitizeEmail(email);

  try {
    // Check if user node exists
    const snapshot = await userRef.once('value');
    
    if (!snapshot.exists()) {
      // For new users, check if they have migrated data
      let isMigrated = false;
      try {
        const studentsRef = db.ref(`students/${emailKey}`);
        const studentSnapshot = await studentsRef.once('value');
        isMigrated = studentSnapshot.exists();
      } catch (studentsError) {
        // If we can't read students data, assume not migrated
        console.log("Cannot check migration status, assuming new user");
        isMigrated = false;
      }

      const userData = {
        uid: uid,
        email: email,
        sanitizedEmail: emailKey,
        type: 'student',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        provider: providerData?.[0]?.providerId || 'password',
        emailVerified: emailVerified || false,
        isMigratedUser: isMigrated
      };
      
      await userRef.set(userData);
      
      return {
        success: true,
        userExists: false,
        isMigratedUser: isMigrated,
        userData: userData
      };
    } else {
      // Update existing user
      const existingData = snapshot.val();
      const isMigrated = existingData.isMigratedUser || false;
      
      const updatedData = {
        ...existingData,
        lastLogin: Date.now(),
        emailVerified: emailVerified || false,
        isMigratedUser: isMigrated
      };
      
      await userRef.set(updatedData);
      
      return {
        success: true,
        userExists: true,
        isMigratedUser: isMigrated,
        userData: updatedData
      };
    }
  } catch (error) {
    console.error("Error ensuring user node:", error);
    throw new HttpsError('internal', 'Failed to ensure user node: ' + error.message);
  }
});

// Export the function
module.exports = {
  ensureUserNode
};