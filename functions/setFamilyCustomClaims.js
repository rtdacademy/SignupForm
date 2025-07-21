

const { onCall, HttpsError } = require('firebase-functions/v2/https');

const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}


/**
 * HTTPS Function: applyPendingPermissions
 * Allows users to apply their own pending permissions
 */
const applyPendingPermissions = onCall({
  region: 'us-central1',
  memory: '256MiB'
}, async (request) => {
  const { auth } = request;
  
  // Must be authenticated
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const userEmail = auth.token.email;
  const emailKey = sanitizeEmail(userEmail);
  
  const db = admin.database();
  const pendingRef = db.ref(`pendingPermissions/${emailKey}`);
  
  try {
    const snapshot = await pendingRef.once('value');
    
    if (!snapshot.exists()) {
      return { 
        success: false, 
        message: 'No pending permissions found for your email' 
      };
    }
    
    const pendingData = snapshot.val();
    
    // Double-check email match (extra security)
    if (pendingData.email !== userEmail) {
      throw new HttpsError(
        'permission-denied', 
        'Email mismatch in pending permissions'
      );
    }
    
    if (pendingData.applied) {
      return { 
        success: false, 
        message: 'Permissions already applied' 
      };
    }
    
    // Prepare custom claims
    const customClaims = {
      familyId: pendingData.familyId,
      familyRole: pendingData.familyRole || pendingData.role // Support both old and new field names
    };

    // Add student info if it's a student
    const userRole = pendingData.familyRole || pendingData.role;
    if (userRole === 'student' && pendingData.studentInfo) {
      customClaims.studentInfo = pendingData.studentInfo;
    }
    
    // Get user's existing custom claims first to preserve them
    const userRecord = await admin.auth().getUser(auth.uid);
    const existingClaims = userRecord.customClaims || {};
    
    // Merge with existing claims (preserving any existing roles/permissions)
    const finalClaims = {
      ...existingClaims,
      ...customClaims
    };
    
    // Apply the custom claims with retry logic
    let claimsSet = false;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!claimsSet && attempts < maxAttempts) {
      attempts++;
      
      try {
        await admin.auth().setCustomUserClaims(auth.uid, finalClaims);
        console.log(`✓ Attempt ${attempts}: Set custom claims for user ${auth.uid} with familyId: ${pendingData.familyId}`);
        
        // Verify the claims were set by reading them back
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for propagation
        const updatedUserRecord = await admin.auth().getUser(auth.uid);
        const verifyCustomClaims = updatedUserRecord.customClaims || {};
        
        if (verifyCustomClaims.familyId === pendingData.familyId) {
          console.log(`✓ Verified custom claims - familyId: ${verifyCustomClaims.familyId}, familyRole: ${verifyCustomClaims.familyRole}`);
          claimsSet = true;
        } else {
          console.log(`⚠️ Attempt ${attempts}: Claims verification failed, retrying...`);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
      } catch (error) {
        console.error(`✗ Attempt ${attempts} failed:`, error);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        } else {
          throw error;
        }
      }
    }
    
    if (!claimsSet) {
      throw new Error('Failed to set and verify custom claims after multiple attempts');
    }
    
    console.log(`✓ Successfully set and verified custom claims for user ${auth.uid} with familyId: ${pendingData.familyId}`);
    
    // Small delay to ensure claims are propagated
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark as applied
    await pendingRef.update({
      applied: true,
      appliedAt: Date.now(),
      appliedToUid: auth.uid
    });
    
    console.log(`Applied pending permissions for ${userEmail}`);
    
    // Update metadata to trigger token refresh - AFTER everything is complete
    try {
      await db.ref(`metadata/${auth.uid}`).set({
        refreshTime: Date.now(),
        pendingPermissionsApplied: Date.now()
      });
      console.log(`✓ Updated metadata to trigger token refresh for user ${auth.uid}`);
    } catch (error) {
      console.error(`✗ Failed to update metadata for user ${auth.uid}:`, error);
    }
    
    return { 
      success: true, 
      familyId: pendingData.familyId,
      familyRole: userRole,
      message: 'Permissions applied successfully'
    };
    
  } catch (error) {
    console.error('Error applying pending permissions:', error);
    throw new HttpsError('internal', 'Failed to apply permissions');
  }
});

module.exports = {
  applyPendingPermissions
};