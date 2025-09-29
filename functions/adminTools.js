const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Only initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to remove family claims from a user account
 * Only accessible by super admins
 */
exports.removeFamilyClaims = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  // Check if user is super admin
  const callerEmail = context.auth.token.email;
  const SUPER_ADMIN_EMAILS = [
    'kyle@rtdacademy.com',
    'stan@rtdacademy.com',
    'charlie@rtdacademy.com'
  ];

  if (!SUPER_ADMIN_EMAILS.includes(callerEmail)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can remove family claims.'
    );
  }

  const { email } = data;

  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email is required.'
    );
  }

  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid, email);

    // Get current custom claims
    const currentClaims = user.customClaims || {};
    console.log('Current claims:', currentClaims);

    // Track what we're removing
    const removedClaims = {
      familyId: currentClaims.familyId,
      familyRole: currentClaims.familyRole,
      customClaims: currentClaims.customClaims
    };

    // Create a copy and delete unwanted properties
    const updatedClaims = { ...currentClaims };
    delete updatedClaims.familyId;
    delete updatedClaims.familyRole;
    delete updatedClaims.customClaims;

    // Add metadata about the update
    updatedClaims.lastUpdated = Date.now();
    updatedClaims.lastUpdatedBy = callerEmail;
    updatedClaims.familyClaimsRemovedAt = Date.now();

    // Set the updated claims
    await admin.auth().setCustomUserClaims(user.uid, updatedClaims);
    console.log('Successfully removed family claims from:', email);

    // Write metadata to trigger token refresh
    const db = admin.database();
    await db.ref(`metadata/${user.uid}`).set({
      refreshTime: Date.now(),
      reason: 'family_claims_removed',
      removedClaims,
      updatedBy: callerEmail
    });

    return {
      success: true,
      message: `Successfully removed family claims from ${email}`,
      hadFamilyClaims: true,
      removedClaims,
      uid: user.uid
    };
  } catch (error) {
    console.error('Error removing family claims:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to remove family claims: ${error.message}`
    );
  }
});
