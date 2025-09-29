// Run this with: node functions/removeGraceAnneFamilyClaims.js
// Make sure you're in the SignupForm directory

const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: 'https://signup-form-8a485-default-rtdb.firebaseio.com'
  });
}

async function removeGraceAnneFamilyClaims() {
  try {
    const email = 'grace-anne@rtd-connect.com';

    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid, email);

    // Get current custom claims
    const currentClaims = user.customClaims || {};
    console.log('\nCurrent claims:', JSON.stringify(currentClaims, null, 2));

    // Remove family-related claims but keep staff claims
    const updatedClaims = {
      roles: currentClaims.roles,
      primaryRole: currentClaims.primaryRole,
      permissions: currentClaims.permissions,
      lastUpdated: Date.now(),
      email: currentClaims.email,
      staffPermissions: currentClaims.staffPermissions,
      staffRole: currentClaims.staffRole,
      lastPermissionUpdate: Date.now(),
      permissionSource: currentClaims.permissionSource,
      isStaffUser: true,
      isTeacher: currentClaims.isTeacher,
      isCourseManager: currentClaims.isCourseManager,
      isAdminUser: true,
      isSuperAdminUser: false,
      lastUpdatedBy: 'kyle@rtdacademy.com'
      // Removed: familyId, familyRole
    };

    console.log('\n📝 Removing family claims: familyId and familyRole');
    console.log('✅ Keeping staff claims: staffPermissions, isStaffUser, isAdminUser, etc.');

    // Set the updated claims
    await admin.auth().setCustomUserClaims(user.uid, updatedClaims);
    console.log('\n✅ Successfully removed family claims from Grace-Anne');

    // Write metadata to trigger token refresh
    const db = admin.database();
    await db.ref(`metadata/${user.uid}`).set({
      refreshTime: Date.now(),
      reason: 'family_claims_removed',
      updatedBy: 'kyle@rtdacademy.com'
    });
    console.log('✅ Metadata updated to trigger token refresh on next login');

    console.log('\n📋 Grace-Anne should now:');
    console.log('   1. Sign out completely');
    console.log('   2. Close the browser');
    console.log('   3. Sign back in');
    console.log('   4. She will only have staff access, no family access');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error removing family claims:', error);
    process.exit(1);
  }
}

removeGraceAnneFamilyClaims();