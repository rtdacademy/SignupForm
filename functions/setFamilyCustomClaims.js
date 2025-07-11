// functions/setFamilyCustomClaims.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: setFamilyCustomClaims
 * 
 * Sets custom claims for a primary guardian when they register their family.
 * Creates a unique family ID and assigns appropriate permissions.
 */
const setFamilyCustomClaims = onCall({
  concurrency: 50,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"]
}, async (data) => {
  // Verify that the user is authenticated
  if (!data.auth) {
    console.log('Unauthenticated user attempted to set family custom claims');
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const uid = data.auth.uid;
  console.log(`Setting family custom claims for user: ${uid}`);

  try {
    // Check if user already has family custom claims
    const userRecord = await admin.auth().getUser(uid);
    const existingClaims = userRecord.customClaims || {};

    // If user already has family claims, return the existing family ID
    if (existingClaims.familyId && existingClaims.familyRole === 'primary_guardian') {
      console.log(`User ${uid} already has family claims with familyId: ${existingClaims.familyId}`);
      return {
        success: true,
        familyId: existingClaims.familyId,
        message: 'User already has family registration claims',
        isExisting: true
      };
    }

    // Generate a new unique family ID
    const familyId = uuidv4();
    
    // Define custom claims for primary guardian
    const customClaims = {
      ...existingClaims, // Preserve any existing claims
      familyId: familyId,
      familyRole: 'primary_guardian',
      permissions: {
        canManageFamily: true,
        canAddRemoveMembers: true,
        canEditAllProfiles: true,
        canDeleteFamily: true,
        canManageBilling: true,
        canViewAllRecords: true,
        canSubmitReceipts: true // Allow primary to submit receipts too
      }
    };

    // Set the custom claims
    await admin.auth().setCustomUserClaims(uid, customClaims);

    // Update real-time database to notify client to force refresh token
    const db = admin.database();
    const metadataRef = db.ref(`metadata/${uid}`);
    await metadataRef.set({
      refreshTime: new Date().getTime(),
      familyRegistrationTime: new Date().getTime()
    });

    console.log(`Successfully set family custom claims for user ${uid} with familyId: ${familyId}`);

    return {
      success: true,
      familyId: familyId,
      message: 'Family custom claims set successfully',
      isExisting: false
    };

  } catch (error) {
    console.error('Error setting family custom claims:', error);
    throw new HttpsError('internal', 'An error occurred while setting family custom claims.');
  }
});

module.exports = {
  setFamilyCustomClaims,
};