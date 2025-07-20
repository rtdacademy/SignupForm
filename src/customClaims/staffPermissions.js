// Staff Permissions Configuration
// This file defines the permission system for staff members

/**
 * Available staff permission levels
 */
export const STAFF_PERMISSIONS = {
  // Available permission levels
  LEVELS: {
    STAFF: 'staff',                    // Basic staff access to teaching tools
    TEACHER: 'teacher',               // Course teaching and student management
    COURSE_MANAGER: 'course_manager', // Course creation and administration
    ADMIN: 'admin',                   // Administrative functions and reports
    SUPER_ADMIN: 'super_admin'        // Full system administration access
  },
  
  // Domain-based automatic permissions
  // Users with these email domains automatically get the specified permissions
  DOMAIN_PERMISSIONS: {
    '@rtdacademy.com': ['staff'],
    '@rtd-connect.com': ['staff']
  },
  
  // Specific email permissions (additive to domain permissions)
  // These permissions are added to any domain-based permissions
  EMAIL_PERMISSIONS: {
    'kyle@rtdacademy.com': ['staff', 'super_admin'],
    'stan@rtdacademy.com': ['staff', 'super_admin'],
    'charlie@rtdacademy.com': ['staff', 'super_admin'],
    // Add more specific permissions as needed
    // 'teacher@rtdacademy.com': ['staff', 'teacher'],
    // 'admin@rtdacademy.com': ['staff', 'admin'],
  },
  
  // Permission descriptions for UI and documentation
  DESCRIPTIONS: {
    'staff': 'Basic staff access to teaching tools and course management',
    'teacher': 'Course teaching permissions and student progress management',
    'course_manager': 'Course creation, editing, and administrative functions',
    'admin': 'Administrative functions, reports, and user management',
    'super_admin': 'Full system administration access and configuration'
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
export const getPermissionsForEmail = (email) => {
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
};

/**
 * Gets the highest permission level for a user
 * @param {string[]} permissions - Array of user's permissions
 * @returns {string|null} Highest permission level
 */
export const getHighestPermission = (permissions) => {
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
};

/**
 * Expands permissions to include all inherited permissions based on hierarchy
 * @param {string[]} permissions - Base permissions
 * @returns {string[]} Expanded permissions including inherited ones
 */
export const expandPermissions = (permissions) => {
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
};

/**
 * Checks if a user has a specific permission
 * @param {string[]} userPermissions - User's current permissions
 * @param {string} requiredPermission - Permission to check for
 * @returns {boolean} Whether user has the permission
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !requiredPermission) {
    return false;
  }
  
  const expandedPermissions = expandPermissions(userPermissions);
  return expandedPermissions.includes(requiredPermission);
};

/**
 * Checks if a user has any of the specified permissions
 * @param {string[]} userPermissions - User's current permissions
 * @param {string[]} requiredPermissions - Permissions to check for (any)
 * @returns {boolean} Whether user has any of the permissions
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }
  
  const expandedPermissions = expandPermissions(userPermissions);
  return requiredPermissions.some(permission => expandedPermissions.includes(permission));
};

/**
 * Checks if a user has all of the specified permissions
 * @param {string[]} userPermissions - User's current permissions
 * @param {string[]} requiredPermissions - Permissions to check for (all)
 * @returns {boolean} Whether user has all of the permissions
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }
  
  const expandedPermissions = expandPermissions(userPermissions);
  return requiredPermissions.every(permission => expandedPermissions.includes(permission));
};

/**
 * Validates if an email belongs to a staff domain
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is from a staff domain
 */
export const isStaffEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  
  return Object.keys(STAFF_PERMISSIONS.DOMAIN_PERMISSIONS).some(domain =>
    normalizedEmail.endsWith(domain.toLowerCase())
  );
};

export default STAFF_PERMISSIONS;