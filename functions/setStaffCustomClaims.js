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
    'super_admin': ['admin', 'course_manager', 'teacher', 'staff'],
    'admin': ['course_manager', 'teacher', 'staff'],
    'course_manager': ['teacher', 'staff'],
    'teacher': ['staff'],
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
 * Cloud Function: setStaffCustomClaims
 * 
 * Sets custom claims for staff members based on their email domain and specific permissions
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
      isAdminUser: expandedPermissions.includes('admin'),
      isSuperAdminUser: basePermissions.includes('super_admin') || highestPermission === 'super_admin'
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
    
    // Log the activity for audit purposes
    try {
      await db.ref(`staffClaimsAudit/${uid}`).push({
        email: userEmail,
        action: 'claims_applied',
        permissions: expandedPermissions,
        staffRole: highestPermission,
        permissionSource: permissionSource,
        timestamp: Date.now(),
        appliedBy: 'system'
      });
    } catch (error) {
      console.error('Failed to log staff claims audit:', error);
      // Don't throw here as it's just for logging
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
 * Cloud Function: getStaffPermissions
 * 
 * Returns the current staff permissions for the authenticated user
 */
const getStaffPermissions = onCall({
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
  
  try {
    // Get user's current custom claims
    const userRecord = await admin.auth().getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    return {
      success: true,
      email: userEmail,
      staffPermissions: customClaims.staffPermissions || [],
      staffRole: customClaims.staffRole || null,
      lastPermissionUpdate: customClaims.lastPermissionUpdate || null,
      permissionSource: customClaims.permissionSource || null,
      isStaffUser: customClaims.isStaffUser || false
    };
    
  } catch (error) {
    console.error('Error getting staff permissions:', error);
    throw new HttpsError('internal', 'An error occurred while retrieving staff permissions.');
  }
});

module.exports = {
  setStaffCustomClaims,
  getStaffPermissions
};