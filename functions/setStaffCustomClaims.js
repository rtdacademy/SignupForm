// functions/setStaffCustomClaims.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Staff Permissions Configuration
 * This mirrors the client-side configuration but is kept server-side for security
 */
const STAFF_PERMISSIONS = {
  // Available permission levels
  LEVELS: {
    STAFF: 'staff',
    TEACHER: 'teacher',
    COURSE_MANAGER: 'course_manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },
  
  // Domain-based automatic permissions
  DOMAIN_PERMISSIONS: {
    '@rtdacademy.com': ['staff'],
    '@rtd-connect.com': ['staff']
  },
  
  // Specific email permissions (additive to domain permissions)
  EMAIL_PERMISSIONS: {
    'kyle@rtdacademy.com': ['staff', 'super_admin'],
    'stan@rtdacademy.com': ['staff', 'super_admin'],
    'charlie@rtdacademy.com': ['staff', 'super_admin'],
    // Add more specific permissions as needed
  },
  
  // Permission hierarchy (higher levels include lower level permissions)
  HIERARCHY: {
    'super_admin': ['super_admin', 'admin', 'course_manager', 'teacher', 'staff'],
    'admin': ['admin', 'course_manager', 'teacher', 'staff'],
    'course_manager': ['course_manager', 'teacher', 'staff'],
    'teacher': ['teacher', 'staff'],
    'staff': ['staff']
  }
};

/**
 * Determines what permissions a user should have based on their email
 * @param {string} email - User's email address
 * @returns {string[]} Array of permission levels
 */
function getPermissionsForEmail(email) {
  if (!email || typeof email !== 'string') {
    return [];
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const permissions = new Set();
  
  // Check domain-based permissions
  for (const [domain, domainPermissions] of Object.entries(STAFF_PERMISSIONS.DOMAIN_PERMISSIONS)) {
    if (normalizedEmail.endsWith(domain.toLowerCase())) {
      domainPermissions.forEach(permission => permissions.add(permission));
    }
  }
  
  // Check email-specific permissions
  if (STAFF_PERMISSIONS.EMAIL_PERMISSIONS[normalizedEmail]) {
    STAFF_PERMISSIONS.EMAIL_PERMISSIONS[normalizedEmail].forEach(permission => 
      permissions.add(permission)
    );
  }
  
  return Array.from(permissions);
}

/**
 * Gets the highest permission level for a user
 * @param {string[]} permissions - Array of user's permissions
 * @returns {string|null} Highest permission level
 */
function getHighestPermission(permissions) {
  if (!permissions || permissions.length === 0) {
    return null;
  }
  
  const permissionOrder = ['super_admin', 'admin', 'course_manager', 'teacher', 'staff'];
  
  for (const level of permissionOrder) {
    if (permissions.includes(level)) {
      return level;
    }
  }
  
  return null;
}

/**
 * Expands permissions to include all inherited permissions based on hierarchy
 * @param {string[]} permissions - Base permissions
 * @returns {string[]} Expanded permissions including inherited ones
 */
function expandPermissions(permissions) {
  const expanded = new Set();
  
  permissions.forEach(permission => {
    if (STAFF_PERMISSIONS.HIERARCHY[permission]) {
      STAFF_PERMISSIONS.HIERARCHY[permission].forEach(inheritedPermission => 
        expanded.add(inheritedPermission)
      );
    } else {
      expanded.add(permission);
    }
  });
  
  return Array.from(expanded);
}

/**
 * Validates if an email belongs to a staff domain
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is from a staff domain
 */
function isStaffEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  return Object.keys(STAFF_PERMISSIONS.DOMAIN_PERMISSIONS).some(domain =>
    normalizedEmail.endsWith(domain.toLowerCase())
  );
}

/**
 * Cloud Function: setBasicStaffClaim
 * 
 * Sets basic staff claims for users with staff domain emails (@rtdacademy.com or @rtd-connect.com)
 * This is called during login to establish basic staff status only
 */
const setBasicStaffClaim = onCall({
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

  const uid = request.auth.uid;
  const userEmail = request.auth.token.email;
  
  if (!userEmail) {
    throw new HttpsError('invalid-argument', 'User email is required.');
  }

  console.log(`Setting basic staff claim for user: ${userEmail} (${uid})`);

  // Validate that this is a staff email
  if (!isStaffEmail(userEmail)) {
    throw new HttpsError(
      'permission-denied', 
      'Only users with @rtdacademy.com or @rtd-connect.com email addresses can have staff claims.'
    );
  }

  const db = admin.database();
  
  try {
    // Get user's existing custom claims
    const userRecord = await admin.auth().getUser(uid);
    const existingClaims = userRecord.customClaims || {};
    
    // Prepare the basic staff claims (matching your example structure)
    const basicStaffClaims = {
      // Preserve existing non-staff claims
      ...existingClaims,
      
      // Basic staff structure
      roles: ['staff'],
      primaryRole: 'staff',
      permissions: {
        isStaff: true
      },
      lastUpdated: Date.now(),
      email: userEmail,
      
      // Legacy staff fields
      staffPermissions: ['staff'],
      staffRole: 'staff',
      lastPermissionUpdate: Date.now(),
      permissionSource: 'domain',
      isStaffUser: true,
      isTeacher: false,
      isCourseManager: false,
      isAdminUser: false,
      isSuperAdminUser: false
    };
    
    // Set the custom claims
    await admin.auth().setCustomUserClaims(uid, basicStaffClaims);
    console.log(`✓ Successfully set basic staff claim for user ${uid}`);
    
    // Small delay to ensure claims are propagated
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update metadata to trigger token refresh
    try {
      await db.ref(`metadata/${uid}`).set({
        refreshTime: Date.now(),
        basicStaffClaimApplied: Date.now()
      });
      console.log(`✓ Updated metadata to trigger token refresh for user ${uid}`);
    } catch (error) {
      console.error(`✗ Failed to update metadata for user ${uid}:`, error);
      // Don't throw here as the claims were successfully set
    }
    
    return {
      success: true,
      message: 'Basic staff claim applied successfully',
      claims: {
        roles: ['staff'],
        primaryRole: 'staff',
        isStaffUser: true
      }
    };
    
  } catch (error) {
    console.error('Error setting basic staff claim:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while setting basic staff claim.');
  }
});

/**
 * Cloud Function: setStaffCustomClaims (LEGACY - kept for manual management)
 * 
 * Sets custom claims for staff members based on their email domain and specific permissions
 * NOTE: This is now primarily used by the manual permission management system
 */
const setStaffCustomClaims = onCall({
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

  const uid = request.auth.uid;
  const userEmail = request.auth.token.email;
  
  if (!userEmail) {
    throw new HttpsError('invalid-argument', 'User email is required.');
  }

  console.log(`Setting staff custom claims for user: ${userEmail} (${uid})`);

  // Validate that this is a staff email
  if (!isStaffEmail(userEmail)) {
    throw new HttpsError(
      'permission-denied', 
      'Only users with @rtdacademy.com or @rtd-connect.com email addresses can have staff permissions.'
    );
  }

  const db = admin.database();
  
  try {
    // Get user's existing custom claims
    const userRecord = await admin.auth().getUser(uid);
    const existingClaims = userRecord.customClaims || {};
    
    // Determine permissions based on email
    const basePermissions = getPermissionsForEmail(userEmail);
    const expandedPermissions = expandPermissions(basePermissions);
    const highestPermission = getHighestPermission(basePermissions);
    
    console.log(`Determined permissions for ${userEmail}:`, {
      basePermissions,
      expandedPermissions,
      highestPermission
    });
    
    if (basePermissions.length === 0) {
      throw new HttpsError(
        'permission-denied', 
        'No staff permissions configured for this email address.'
      );
    }
    
    // Determine permission source
    let permissionSource = 'domain';
    if (STAFF_PERMISSIONS.EMAIL_PERMISSIONS[userEmail.toLowerCase()]) {
      permissionSource = 'email';
    }
    
    // Prepare the custom claims
    const staffClaims = {
      // Preserve existing non-staff claims
      ...existingClaims,
      
      // Staff-specific claims
      staffPermissions: expandedPermissions,
      staffRole: highestPermission,
      lastPermissionUpdate: Date.now(),
      permissionSource: permissionSource,
      
      // Legacy compatibility (keeping existing fields if they exist)
      isStaffUser: true,
      isTeacher: expandedPermissions.includes('teacher'),
      isCourseManager: expandedPermissions.includes('course_manager'),
      isAdminUser: expandedPermissions.includes('admin'),
      isSuperAdminUser: basePermissions.includes('super_admin') || highestPermission === 'super_admin',
      // RTD Learning Admin status (preserve if already set)
      isRTDLearningAdmin: existingClaims.isRTDLearningAdmin || false
    };
    
    // Set the custom claims
    await admin.auth().setCustomUserClaims(uid, staffClaims);
    console.log(`✓ Successfully set staff custom claims for user ${uid}`);
    
    // Verify the claims were set by reading them back
    const updatedUserRecord = await admin.auth().getUser(uid);
    const verifyCustomClaims = updatedUserRecord.customClaims || {};
    console.log(`✓ Verified staff custom claims:`, {
      staffPermissions: verifyCustomClaims.staffPermissions,
      staffRole: verifyCustomClaims.staffRole,
      lastPermissionUpdate: verifyCustomClaims.lastPermissionUpdate
    });
    
    // Small delay to ensure claims are propagated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update metadata to trigger token refresh
    try {
      await db.ref(`metadata/${uid}`).set({
        refreshTime: Date.now(),
        staffPermissionsApplied: Date.now(),
        lastStaffClaimsUpdate: Date.now()
      });
      console.log(`✓ Updated metadata to trigger token refresh for user ${uid}`);
    } catch (error) {
      console.error(`✗ Failed to update metadata for user ${uid}:`, error);
      // Don't throw here as the claims were successfully set
    }
    
    
    return {
      success: true,
      staffPermissions: expandedPermissions,
      staffRole: highestPermission,
      permissionSource: permissionSource,
      message: 'Staff permissions applied successfully'
    };
    
  } catch (error) {
    console.error('Error setting staff custom claims:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while setting staff permissions.');
  }
});


/**
 * Cloud Function: getAnyStaffPermissions
 * 
 * Returns the current staff permissions for any specified user (super admin only)
 */
const getAnyStaffPermissions = onCall({
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
  const { targetEmail, targetUid } = request.data;
  
  // Verify caller has super admin permissions
  const callerTokenResult = await admin.auth().getUser(request.auth.uid);
  const callerClaims = callerTokenResult.customClaims || {};
  
  if (!callerClaims.isSuperAdminUser && callerClaims.staffRole !== 'super_admin' && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only super admin users can fetch staff permissions for other users.');
  }
  
  console.log(`Super admin ${callerEmail} requesting permissions for: ${targetEmail || targetUid}`);
  
  try {
    let targetUser;
    
    // Get target user by email or UID
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else if (targetUid) {
      targetUser = await admin.auth().getUser(targetUid);
    } else {
      throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
    }
    
    // Check if target user is staff
    if (!isStaffEmail(targetUser.email)) {
      return {
        success: true,
        email: targetUser.email,
        uid: targetUser.uid,
        isStaff: false,
        message: 'User is not a staff member'
      };
    }
    
    // Get target user's current custom claims
    const customClaims = targetUser.customClaims || {};
    
    // Get expected permissions for comparison
    const expectedBasePermissions = getPermissionsForEmail(targetUser.email);
    const expectedExpandedPermissions = expandPermissions(expectedBasePermissions);
    const expectedHighestPermission = getHighestPermission(expectedBasePermissions);
    
    return {
      success: true,
      email: targetUser.email,
      uid: targetUser.uid,
      isStaff: true,
      currentClaims: {
        staffPermissions: customClaims.staffPermissions || [],
        staffRole: customClaims.staffRole || null,
        lastPermissionUpdate: customClaims.lastPermissionUpdate || null,
        permissionSource: customClaims.permissionSource || null,
        isStaffUser: customClaims.isStaffUser || false,
        isTeacher: customClaims.isTeacher || false,
        isCourseManager: customClaims.isCourseManager || false,
        isAdminUser: customClaims.isAdminUser || false,
        isSuperAdminUser: customClaims.isSuperAdminUser || false
      },
      expectedClaims: {
        staffPermissions: expectedExpandedPermissions,
        staffRole: expectedHighestPermission,
        isStaffUser: true,
        isAdminUser: expectedExpandedPermissions.includes('admin'),
        isSuperAdminUser: expectedHighestPermission === 'super_admin'
      },
      claimsMatch: JSON.stringify(customClaims.staffPermissions || []) === JSON.stringify(expectedExpandedPermissions) &&
                   customClaims.staffRole === expectedHighestPermission &&
                   customClaims.isStaffUser === true &&
                   customClaims.isAdminUser === expectedExpandedPermissions.includes('admin') &&
                   customClaims.isSuperAdminUser === (expectedHighestPermission === 'super_admin')
    };
    
  } catch (error) {
    console.error('Error getting staff permissions:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    throw new HttpsError('internal', 'An error occurred while retrieving staff permissions.');
  }
});

/**
 * Cloud Function: getAllStaffPermissions
 * 
 * Returns permissions for all staff members (super admin only)
 */
const getAllStaffPermissions = onCall({
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
  
  console.log(`Super admin ${callerEmail} requesting all staff permissions`);
  
  try {
    // Get all users from Firebase Auth (paginated)
    let allUsers = [];
    let nextPageToken;
    
    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(result.users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);
    
    // Filter for staff users only
    const staffUsers = allUsers.filter(user => 
      user.email && isStaffEmail(user.email)
    );
    
    console.log(`Found ${staffUsers.length} staff users out of ${allUsers.length} total users`);
    
    // Process each staff user
    const staffPermissions = [];
    
    for (const user of staffUsers) {
      try {
        // Get expected permissions for this user
        const expectedBasePermissions = getPermissionsForEmail(user.email);
        const expectedExpandedPermissions = expandPermissions(expectedBasePermissions);
        const expectedHighestPermission = getHighestPermission(expectedBasePermissions);
        
        // Get current custom claims
        const customClaims = user.customClaims || {};
        
        // Check if claims match expected values
        const currentStaffPermissions = customClaims.staffPermissions || [];
        const claimsMatch = JSON.stringify(currentStaffPermissions) === JSON.stringify(expectedExpandedPermissions) &&
                           customClaims.staffRole === expectedHighestPermission &&
                           customClaims.isStaffUser === true &&
                           customClaims.isAdminUser === expectedExpandedPermissions.includes('admin') &&
                           customClaims.isSuperAdminUser === (expectedHighestPermission === 'super_admin');
        
        staffPermissions.push({
          email: user.email,
          uid: user.uid,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
          lastSignInTime: user.metadata.lastSignInTime,
          creationTime: user.metadata.creationTime,
          currentClaims: {
            staffPermissions: currentStaffPermissions,
            staffRole: customClaims.staffRole || null,
            lastPermissionUpdate: customClaims.lastPermissionUpdate || null,
            permissionSource: customClaims.permissionSource || null,
            isStaffUser: customClaims.isStaffUser || false,
            isTeacher: customClaims.isTeacher || false,
            isCourseManager: customClaims.isCourseManager || false,
            isAdminUser: customClaims.isAdminUser || false,
            isSuperAdminUser: customClaims.isSuperAdminUser || false
          },
          expectedClaims: {
            staffPermissions: expectedExpandedPermissions,
            staffRole: expectedHighestPermission,
            isStaffUser: true,
            isAdminUser: expectedExpandedPermissions.includes('admin'),
            isSuperAdminUser: expectedHighestPermission === 'super_admin'
          },
          claimsMatch,
          needsUpdate: !claimsMatch
        });
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        // Continue processing other users even if one fails
        staffPermissions.push({
          email: user.email,
          uid: user.uid,
          error: 'Failed to process user permissions',
          claimsMatch: false,
          needsUpdate: true
        });
      }
    }
    
    // Sort by email for consistent ordering
    staffPermissions.sort((a, b) => a.email.localeCompare(b.email));
    
    const summary = {
      totalStaff: staffPermissions.length,
      validClaims: staffPermissions.filter(user => user.claimsMatch).length,
      invalidClaims: staffPermissions.filter(user => !user.claimsMatch).length,
      superAdmins: staffPermissions.filter(user => 
        user.expectedClaims && user.expectedClaims.isSuperAdminUser
      ).length,
      admins: staffPermissions.filter(user => 
        user.expectedClaims && user.expectedClaims.isAdminUser && !user.expectedClaims.isSuperAdminUser
      ).length
    };
    
    return {
      success: true,
      summary,
      staffPermissions,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('Error getting all staff permissions:', error);
    throw new HttpsError('internal', 'An error occurred while retrieving staff permissions.');
  }
});

/**
 * Cloud Function: getAnyUserPermissions
 * 
 * Returns user information and permissions for any user (super admin only)
 */
const getAnyUserPermissions = onCall({
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
  const { targetEmail, targetUid } = request.data;
  
  // Verify caller has staff permissions
  const callerTokenResult = await admin.auth().getUser(request.auth.uid);
  const callerClaims = callerTokenResult.customClaims || {};
  
  // Check if user is staff (any staff member can fetch user permissions)
  const isStaff = callerClaims.isStaffUser || 
                  (callerClaims.staffPermissions && callerClaims.staffPermissions.length > 0) ||
                  isStaffEmail(callerEmail);
  
  if (!isStaff && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only staff members can fetch user permissions.');
  }
  
  console.log(`Staff member ${callerEmail} requesting permissions for: ${targetEmail || targetUid}`);
  
  try {
    let targetUser;
    
    // Get target user by email or UID
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else if (targetUid) {
      targetUser = await admin.auth().getUser(targetUid);
    } else {
      throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
    }
    
    // Determine user type
    const userIsStaff = isStaffEmail(targetUser.email);
    const customClaims = targetUser.customClaims || {};
    
    const userInfo = {
      success: true,
      email: targetUser.email,
      uid: targetUser.uid,
      emailVerified: targetUser.emailVerified,
      disabled: targetUser.disabled,
      lastSignInTime: targetUser.metadata.lastSignInTime,
      creationTime: targetUser.metadata.creationTime,
      userType: userIsStaff ? 'staff' : 'regular_user'
    };
    
    if (userIsStaff) {
      // Handle staff user - show staff permissions
      const expectedBasePermissions = getPermissionsForEmail(targetUser.email);
      const expectedExpandedPermissions = expandPermissions(expectedBasePermissions);
      const expectedHighestPermission = getHighestPermission(expectedBasePermissions);
      
      const claimsMatch = JSON.stringify(customClaims.staffPermissions || []) === JSON.stringify(expectedExpandedPermissions) &&
                         customClaims.staffRole === expectedHighestPermission &&
                         customClaims.isStaffUser === true &&
                         customClaims.isAdminUser === expectedExpandedPermissions.includes('admin') &&
                         customClaims.isSuperAdminUser === (expectedHighestPermission === 'super_admin');
      
      return {
        ...userInfo,
        isStaff: true,
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
        },
        expectedClaims: {
          staffPermissions: expectedExpandedPermissions,
          staffRole: expectedHighestPermission,
          isStaffUser: true,
          isAdminUser: expectedExpandedPermissions.includes('admin'),
          isSuperAdminUser: expectedHighestPermission === 'super_admin'
        },
        claimsMatch,
        needsUpdate: !claimsMatch,
        allCustomClaims: customClaims // Add this for raw claims viewer
      };
    } else {
      // Handle regular user - show family/parent permissions if they exist
      const familyClaims = {
        familyId: customClaims.familyId || null,
        familyRole: customClaims.familyRole || null,
        isParent: customClaims.isParent || false,
        isHomeEducationParent: customClaims.isHomeEducationParent || false,
        lastFamilyUpdate: customClaims.lastFamilyUpdate || null
      };
      
      return {
        ...userInfo,
        isStaff: false,
        currentClaims: {
          ...familyClaims,
          // Include any other custom claims
          customClaimsKeys: Object.keys(customClaims)
        },
        allCustomClaims: customClaims // Include all claims for debugging
      };
    }
    
  } catch (error) {
    console.error('Error getting user permissions:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    throw new HttpsError('internal', 'An error occurred while retrieving user permissions.');
  }
});

/**
 * Cloud Function: updateStaffPermissions
 * 
 * Manually update staff permissions with hierarchy support and custom claims (super admin only)
 */
const updateStaffPermissions = onCall({
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
  const callerUid = request.auth.uid;
  const { 
    targetEmail, 
    targetUid, 
    staffRole, 
    individualPermissions, 
    customClaims: additionalCustomClaims,
    isRTDLearningAdmin,
    reason 
  } = request.data;
  
  // Verify caller has super admin permissions
  const callerTokenResult = await admin.auth().getUser(callerUid);
  const callerClaims = callerTokenResult.customClaims || {};
  
  if (!callerClaims.isSuperAdminUser && callerClaims.staffRole !== 'super_admin' && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only super admin users can update staff permissions.');
  }
  
  console.log(`Super admin ${callerEmail} updating permissions for: ${targetEmail || targetUid}`);
  
  try {
    let targetUser;
    
    // Get target user by email or UID
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else if (targetUid) {
      targetUser = await admin.auth().getUser(targetUid);
    } else {
      throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
    }
    
    // Prevent super admins from removing their own super admin status
    if (targetUser.uid === callerUid && staffRole !== 'super_admin' && callerClaims.staffRole === 'super_admin') {
      throw new HttpsError('permission-denied', 'Cannot remove your own super admin privileges.');
    }
    
    // Get current claims for comparison
    const currentClaims = targetUser.customClaims || {};
    
    // Build new staff permissions
    let finalStaffPermissions = [];
    let finalStaffRole = null;
    
    if (staffRole && STAFF_PERMISSIONS.HIERARCHY[staffRole]) {
      // Use hierarchy to determine permissions
      finalStaffPermissions = [...STAFF_PERMISSIONS.HIERARCHY[staffRole]];
      finalStaffRole = staffRole;
    } else if (individualPermissions && Array.isArray(individualPermissions)) {
      // Use individual permissions (no hierarchy auto-fill)
      finalStaffPermissions = [...individualPermissions];
      // Determine highest role from individual permissions
      const permissionOrder = ['super_admin', 'admin', 'course_manager', 'teacher', 'staff'];
      for (const level of permissionOrder) {
        if (finalStaffPermissions.includes(level)) {
          finalStaffRole = level;
          break;
        }
      }
    }
    
    // Ensure staff permission is always included if any staff permissions are set
    if (finalStaffPermissions.length > 0 && !finalStaffPermissions.includes('staff')) {
      finalStaffPermissions.push('staff');
    }
    
    // Remove duplicates and sort
    finalStaffPermissions = [...new Set(finalStaffPermissions)].sort();
    
    // Build the complete custom claims object
    const newCustomClaims = {
      // Preserve non-staff claims
      ...currentClaims,

      // Staff permissions
      staffPermissions: finalStaffPermissions,
      staffRole: finalStaffRole,
      lastPermissionUpdate: Date.now(),
      permissionSource: 'manual_admin',
      lastUpdatedBy: callerEmail,

      // Staff boolean flags for compatibility
      isStaffUser: finalStaffPermissions.length > 0,
      isTeacher: finalStaffPermissions.includes('teacher'),
      isCourseManager: finalStaffPermissions.includes('course_manager'),
      isAdminUser: finalStaffPermissions.includes('admin'),
      isSuperAdminUser: finalStaffPermissions.includes('super_admin'),

      // RTD Learning Admin flag
      isRTDLearningAdmin: isRTDLearningAdmin !== undefined ? isRTDLearningAdmin : (currentClaims.isRTDLearningAdmin || false),

      // Add any additional custom claims
      ...(additionalCustomClaims || {})
    };

    // Clean up invalid/unwanted custom claims properties
    // These should not exist on staff user accounts
    delete newCustomClaims.familyId;
    delete newCustomClaims.familyRole;
    delete newCustomClaims.customClaims; // Accidentally nested property from previous operations

    // If no staff permissions, remove staff-related claims
    if (finalStaffPermissions.length === 0) {
      delete newCustomClaims.staffPermissions;
      delete newCustomClaims.staffRole;
      delete newCustomClaims.isStaffUser;
      delete newCustomClaims.isTeacher;
      delete newCustomClaims.isCourseManager;
      delete newCustomClaims.isAdminUser;
      delete newCustomClaims.isSuperAdminUser;
      delete newCustomClaims.permissionSource;
    }
    
    // Set the custom claims
    await admin.auth().setCustomUserClaims(targetUser.uid, newCustomClaims);
    console.log(`✅ Successfully updated permissions for user ${targetUser.uid}`);
    
    // Update metadata to trigger token refresh
    const db = admin.database();
    try {
      await db.ref(`metadata/${targetUser.uid}`).set({
        refreshTime: Date.now(),
        permissionsUpdated: Date.now(),
        lastManualUpdate: Date.now()
      });
      console.log(`✅ Updated metadata to trigger token refresh for user ${targetUser.uid}`);
    } catch (error) {
      console.error(`✗ Failed to update metadata for user ${targetUser.uid}:`, error);
    }
    
    // Log the permission change for audit trail
    try {
      const auditEntry = {
        targetUser: {
          email: targetUser.email,
          uid: targetUser.uid
        },
        updatedBy: {
          email: callerEmail,
          uid: callerUid
        },
        changes: {
          previousClaims: {
            staffPermissions: currentClaims.staffPermissions || [],
            staffRole: currentClaims.staffRole || null,
            isStaffUser: currentClaims.isStaffUser || false,
            isAdminUser: currentClaims.isAdminUser || false,
            isSuperAdminUser: currentClaims.isSuperAdminUser || false,
            isRTDLearningAdmin: currentClaims.isRTDLearningAdmin || false
          },
          newClaims: {
            staffPermissions: finalStaffPermissions,
            staffRole: finalStaffRole,
            isStaffUser: newCustomClaims.isStaffUser,
            isTeacher: newCustomClaims.isTeacher,
            isCourseManager: newCustomClaims.isCourseManager,
            isAdminUser: newCustomClaims.isAdminUser,
            isSuperAdminUser: newCustomClaims.isSuperAdminUser,
            isRTDLearningAdmin: newCustomClaims.isRTDLearningAdmin
          },
          additionalCustomClaims: additionalCustomClaims || {}
        },
        reason: reason || 'Manual permission update',
        timestamp: Date.now(),
        method: 'manual_update'
      };
      
      await db.ref(`permissionAudit/${targetUser.uid}`).push(auditEntry);
      console.log(`✅ Logged permission change to audit trail`);
    } catch (error) {
      console.error('Failed to log permission change:', error);
      // Don't throw here as the main operation succeeded
    }
    
    return {
      success: true,
      targetUser: {
        email: targetUser.email,
        uid: targetUser.uid
      },
      updatedClaims: {
        staffPermissions: finalStaffPermissions,
        staffRole: finalStaffRole,
        isStaffUser: newCustomClaims.isStaffUser,
        isTeacher: newCustomClaims.isTeacher,
        isCourseManager: newCustomClaims.isCourseManager,
        isAdminUser: newCustomClaims.isAdminUser,
        isSuperAdminUser: newCustomClaims.isSuperAdminUser,
        additionalCustomClaims: additionalCustomClaims || {}
      },
      message: 'Staff permissions updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating staff permissions:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    throw new HttpsError('internal', 'An error occurred while updating staff permissions.');
  }
});

/**
 * Cloud Function: removeStaffPermissions
 * 
 * Remove all staff permissions from a user (super admin only)
 */
const removeStaffPermissions = onCall({
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
  const callerUid = request.auth.uid;
  const { targetEmail, targetUid, reason } = request.data;
  
  // Verify caller has super admin permissions
  const callerTokenResult = await admin.auth().getUser(callerUid);
  const callerClaims = callerTokenResult.customClaims || {};
  
  if (!callerClaims.isSuperAdminUser && callerClaims.staffRole !== 'super_admin' && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only super admin users can remove staff permissions.');
  }
  
  try {
    let targetUser;
    
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else if (targetUid) {
      targetUser = await admin.auth().getUser(targetUid);
    } else {
      throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
    }
    
    // Prevent super admins from removing their own permissions
    if (targetUser.uid === callerUid) {
      throw new HttpsError('permission-denied', 'Cannot remove your own staff permissions.');
    }
    
    const currentClaims = targetUser.customClaims || {};
    
    // Remove all staff-related claims
    const newCustomClaims = { ...currentClaims };
    delete newCustomClaims.staffPermissions;
    delete newCustomClaims.staffRole;
    delete newCustomClaims.isStaffUser;
    delete newCustomClaims.isTeacher;
    delete newCustomClaims.isCourseManager;
    delete newCustomClaims.isAdminUser;
    delete newCustomClaims.isSuperAdminUser;
    delete newCustomClaims.permissionSource;
    delete newCustomClaims.lastPermissionUpdate;
    delete newCustomClaims.lastUpdatedBy;
    
    await admin.auth().setCustomUserClaims(targetUser.uid, newCustomClaims);
    
    // Update metadata and log audit entry (similar to updateStaffPermissions)
    const db = admin.database();
    
    try {
      await db.ref(`metadata/${targetUser.uid}`).set({
        refreshTime: Date.now(),
        permissionsRemoved: Date.now()
      });
    } catch (error) {
      console.error(`Failed to update metadata:`, error);
    }
    
    // Log the removal
    try {
      const auditEntry = {
        targetUser: { email: targetUser.email, uid: targetUser.uid },
        updatedBy: { email: callerEmail, uid: callerUid },
        action: 'remove_all_staff_permissions',
        previousClaims: {
          staffPermissions: currentClaims.staffPermissions || [],
          staffRole: currentClaims.staffRole || null
        },
        reason: reason || 'Manual staff permissions removal',
        timestamp: Date.now()
      };
      
      await db.ref(`permissionAudit/${targetUser.uid}`).push(auditEntry);
    } catch (error) {
      console.error('Failed to log permission removal:', error);
    }
    
    return {
      success: true,
      message: 'All staff permissions removed successfully',
      targetUser: { email: targetUser.email, uid: targetUser.uid }
    };
    
  } catch (error) {
    console.error('Error removing staff permissions:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while removing staff permissions.');
  }
});

module.exports = {
  setBasicStaffClaim,
  setStaffCustomClaims,
  getAnyStaffPermissions,
  getAllStaffPermissions,
  getAnyUserPermissions,
  updateStaffPermissions,
  removeStaffPermissions
};