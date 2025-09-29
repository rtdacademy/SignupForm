// Script to remove family claims from Grace-Anne's account
// Run with: node remove-grace-anne-family.js

const admin = require('firebase-admin');

// Use application default credentials (from Firebase CLI)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://signup-form-8a485-default-rtdb.firebaseio.com',
  projectId: 'rtd-academy'
});

async function removeGraceAnneFamilyClaims() {
  try {
    const email = 'grace-anne@rtd-connect.com';

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid, email);

    // Get current custom claims
    const currentClaims = user.customClaims || {};
    console.log('Current claims:', JSON.stringify(currentClaims, null, 2));

    // Create a copy and delete the unwanted properties
    const updatedClaims = { ...currentClaims };

    console.log('\nRemoving properties:', {
      familyId: updatedClaims.familyId,
      familyRole: updatedClaims.familyRole,
      customClaims: updatedClaims.customClaims
    });

    delete updatedClaims.familyId;
    delete updatedClaims.familyRole;
    delete updatedClaims.customClaims;

    // Update timestamps
    updatedClaims.lastUpdated = Date.now();
    updatedClaims.lastPermissionUpdate = Date.now();

    // Set the updated claims
    await admin.auth().setCustomUserClaims(user.uid, updatedClaims);
    console.log('✅ Successfully removed family claims from Grace-Anne');
    console.log('Updated claims:', JSON.stringify(updatedClaims, null, 2));

    // Write metadata to trigger token refresh
    const db = admin.database();
    await db.ref(`metadata/${user.uid}`).set({
      refreshTime: Date.now(),
      reason: 'family_claims_removed'
    });
    console.log('✅ Metadata updated to trigger token refresh');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing family claims:', error);
    process.exit(1);
  }
}

removeGraceAnneFamilyClaims();