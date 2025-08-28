// functions/getAllStaffPermissionsOptimized.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Helper function to determine if an email is a staff email
 */
function isStaffEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const staffDomains = ['@rtdacademy.com', '@rtd-connect.com'];
  
  return staffDomains.some(domain => normalizedEmail.endsWith(domain));
}

/**
 * Cloud Function: getAllStaffPermissionsOptimized
 * 
 * Efficiently retrieves all staff members using the /staff database index
 * instead of fetching all users from Firebase Auth
 */
const getAllStaffPermissionsOptimized = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const callerEmail = request.auth.token.email;
  
  // Verify caller has super admin permissions
  const callerTokenResult = await admin.auth().getUser(request.auth.uid);
  const callerClaims = callerTokenResult.customClaims || {};
  
  if (!callerClaims.isSuperAdminUser && callerClaims.staffRole !== 'super_admin' && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only super admin users can fetch all staff permissions.');
  }
  
  console.log(`Super admin ${callerEmail} requesting all staff permissions (optimized)`);
  
  const db = admin.database();
  
  try {
    // Step 1: Get all staff members from the database index
    const staffSnapshot = await db.ref('staff').once('value');
    const staffData = staffSnapshot.val() || {};
    
    console.log(`Found ${Object.keys(staffData).length} staff members in database index`);
    
    // Step 2: Get auth data for each staff member (batch requests)
    const staffPermissions = [];
    const emailToKeyMap = {};
    
    // Create email to database key mapping
    Object.entries(staffData).forEach(([key, data]) => {
      if (data.email) {
        emailToKeyMap[data.email.toLowerCase()] = key;
      }
    });
    
    // Process staff members in batches to avoid rate limits
    const batchSize = 100;
    const staffEmails = Object.values(staffData).map(s => s.email).filter(Boolean);
    
    for (let i = 0; i < staffEmails.length; i += batchSize) {
      const batch = staffEmails.slice(i, i + batchSize);
      const batchPromises = batch.map(async (email) => {
        try {
          // Get auth user data
          const authUser = await admin.auth().getUserByEmail(email);
          const customClaims = authUser.customClaims || {};
          const dbKey = emailToKeyMap[email.toLowerCase()];
          const dbData = staffData[dbKey] || {};
          
          return {
            // Auth data
            email: authUser.email,
            uid: authUser.uid,
            emailVerified: authUser.emailVerified,
            disabled: authUser.disabled,
            lastSignInTime: authUser.metadata.lastSignInTime,
            creationTime: authUser.metadata.creationTime,
            
            // Database data (for display purposes only)
            displayName: dbData.displayName || '',
            firstName: dbData.firstName || '',
            lastName: dbData.lastName || '',
            lastLogin: dbData.lastLogin || null,
            provider: dbData.provider || '',
            
            // Custom claims from Auth (source of truth)
            currentClaims: {
              staffPermissions: customClaims.staffPermissions || [],
              staffRole: customClaims.staffRole || null,
              lastPermissionUpdate: customClaims.lastPermissionUpdate || null,
              permissionSource: customClaims.permissionSource || null,
              isStaffUser: customClaims.isStaffUser || false,
              isTeacher: customClaims.isTeacher || false,
              isCourseManager: customClaims.isCourseManager || false,
              isAdminUser: customClaims.isAdminUser || false,
              isSuperAdminUser: customClaims.isSuperAdminUser || false,
              isRTDLearningAdmin: customClaims.isRTDLearningAdmin || false
            }
          };
        } catch (error) {
          console.error(`Error processing staff member ${email}:`, error);
          
          // Include database info even if auth lookup fails
          const dbKey = emailToKeyMap[email.toLowerCase()];
          const dbData = staffData[dbKey] || {};
          
          return {
            email: email,
            uid: null,
            error: error.code === 'auth/user-not-found' ? 'User not found in Auth' : 'Failed to fetch auth data',
            
            // Database data (for display purposes only)
            displayName: dbData.displayName || '',
            firstName: dbData.firstName || '',
            lastName: dbData.lastName || '',
            lastLogin: dbData.lastLogin || null,
            provider: dbData.provider || '',
            
            // Empty claims since auth lookup failed
            currentClaims: {}
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      staffPermissions.push(...batchResults);
    }
    
    // Sort by email for consistent ordering
    staffPermissions.sort((a, b) => a.email.localeCompare(b.email));
    
    // Generate summary statistics
    const summary = {
      totalStaff: staffPermissions.length,
      authFound: staffPermissions.filter(user => !user.error).length,
      authMissing: staffPermissions.filter(user => user.error).length,
      validClaims: staffPermissions.filter(user => 
        user.currentClaims.staffPermissions && user.currentClaims.staffPermissions.length > 0
      ).length,
      superAdmins: staffPermissions.filter(user => 
        user.currentClaims.isSuperAdminUser
      ).length,
      admins: staffPermissions.filter(user => 
        user.currentClaims.isAdminUser && !user.currentClaims.isSuperAdminUser
      ).length,
      staff: staffPermissions.filter(user => 
        user.currentClaims.isStaffUser && !user.currentClaims.isAdminUser && !user.currentClaims.isSuperAdminUser
      ).length
    };
    
    return {
      success: true,
      summary,
      staffPermissions,
      timestamp: Date.now(),
      source: 'database_index'
    };
    
  } catch (error) {
    console.error('Error getting all staff permissions:', error);
    throw new HttpsError('internal', 'An error occurred while retrieving staff permissions.');
  }
});

module.exports = {
  getAllStaffPermissionsOptimized
};