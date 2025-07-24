import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, get, set, update, serverTimestamp, onValue, off } from "firebase/database";
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { getEdmontonTimestamp } from '../utils/timeZoneUtils';
import { useNavigate, useLocation } from 'react-router-dom';

// Permission level indicators
export const PERMISSION_INDICATORS = {
  STAFF: {
    icon: Shield,
    label: 'Staff Access Required',
    description: 'This feature requires RTD Academy staff access'
  },
  ADMIN: {
    icon: ShieldCheck,
    label: 'Admin Access Required',
    description: 'This feature requires RTD Academy admin access'
  },
  SUPER_ADMIN: {
    icon: ShieldAlert,
    label: 'Super Admin Access Required',
    description: 'This feature requires RTD Academy super admin access'
  }
};

// Only keep super admin emails hardcoded for highest level security
const SUPER_ADMIN_EMAILS = [
  'kyle@rtdacademy.com',
  'stan@rtdacademy.com',
  'charlie@rtdacademy.com'
];

// Blocked emails that should never be allowed to login
const BLOCKED_EMAILS = [];

// Firebase handles session management automatically - ID tokens refresh every hour
// We only need to track activity for analytics, not for forced logout

// For tracking app version to handle cache issues
const APP_VERSION_KEY = 'rtd_app_version';
const CURRENT_APP_VERSION = '1.1.0'; // Update this on each deployment

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [user_email_key, setUserEmailKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStaffUser, setIsStaffUser] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [isParentUser, setIsParentUser] = useState(false);
  const [isHomeEducationParent, setIsHomeEducationParent] = useState(false);
  const [courseTeachers, setCourseTeachers] = useState({});
  const [staffMembers, setStaffMembers] = useState({});
  const [adminEmails, setAdminEmails] = useState([]);
  const [tokenExpirationTime, setTokenExpirationTime] = useState(null);

  // Parent login progress tracking
  const [parentLoginProgress, setParentLoginProgress] = useState({
    isLoading: false,
    step: '',
    message: ''
  });

  // Home education login progress tracking
  const [homeEducationLoginProgress, setHomeEducationLoginProgress] = useState({
    isLoading: false,
    step: '',
    message: ''
  });

  // Emulation states
  const [emulatedUser, setEmulatedUser] = useState(null);
  const [emulatedUserEmailKey, setEmulatedUserEmailKey] = useState(null);
  const [isEmulating, setIsEmulating] = useState(false);

  // Token refresh ref for Firebase native token management
  const tokenRefreshTimeoutRef = useRef(null);

  // Activity tracking state
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const activityBuffer = useRef([]);
  const lastDatabaseUpdate = useRef(0);
  const DATABASE_UPDATE_INTERVAL = 10 * 60 * 1000; // Update database max once per 10 minutes

  const navigate = useNavigate();
  const location = useLocation();

  // Check for version changes on component mount to handle cached code issues
  useEffect(() => {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    if (storedVersion !== CURRENT_APP_VERSION) {
      // Clear any session-related data on version change
      localStorage.removeItem('rtd_last_activity_timestamp');
      localStorage.removeItem('rtd_scheduled_logout_time');
      localStorage.setItem(APP_VERSION_KEY, CURRENT_APP_VERSION);
    }
  }, []);

  // Define all public routes - lowercase for consistent comparison
  const publicRoutes = [
    '/',
    '/login',
    '/migrate',
    '/staff-login',
    '/reset-password',
    '/signup',
    '/auth-action-handler',
    '/contractor-invoice',
    '/adult-students',
    '/your-way',
    '/get-started',
    '/policies-reports',
    '/google-ai-chat',
    '/parent-login',
    '/aerr/2023-24',
    '/education-plan/2025-26',
    '/prerequisite-flowchart',
    '/parent-verify-email',
    '/rtd-learning-login',
    '/rtd-learning-admin-login',
    '/facilitators'
  ].map(route => route.toLowerCase());

  // Helper function to check if current route is public
  const isPublicRoute = (path) => {
    const normalizedPath = path.toLowerCase();
    
    // Check exact matches
    if (publicRoutes.includes(normalizedPath)) {
      return true;
    }

    // Check student portal routes
    if (normalizedPath.startsWith('/student-portal/')) {
      const studentPortalPattern = /^\/student-portal\/[^/]+\/[^/]+$/i;
      return studentPortalPattern.test(normalizedPath);
    }

    // Check facilitator routes
    if (normalizedPath.startsWith('/facilitator/')) {
      return true;
    }

    return false;
  };

  // Check if email is blocked
  const isBlockedEmail = (email) => {
    return BLOCKED_EMAILS.includes(email.toLowerCase());
  };

  const checkIsStaff = (user) => {
    return user && user.email.endsWith("@rtdacademy.com");
  };

  const checkIsParent = async (user, emailKey) => {
    if (!user) return false;
    try {
      const db = getDatabase();
      const parentRef = ref(db, `parents/${emailKey}/profile`);
      const snapshot = await get(parentRef);
      return snapshot.exists();
    } catch (error) {
      // Silently handle permission denied errors - just return false
      // This is expected for non-parent users
      if (error.code === 'PERMISSION_DENIED' || error.message.includes('Permission denied')) {
        return false;
      }
      console.error('Error checking parent status:', error);
      return false;
    }
  };

  // checkIsHomeEducation function removed - home education status now determined by custom claims

  // Ensure parent node exists in database
  const ensureParentNode = async (user, emailKey) => {
    if (!user.emailVerified) {
      console.log("Skipping parent data creation - email not verified");
      await signOut();
      navigate('/parent-login', { 
        state: { 
          message: "Please verify your email before signing in. Check your inbox for a verification link." 
        } 
      });
      return false;
    }

    const db = getDatabase();
    const parentRef = ref(db, `parents/${emailKey}/profile`);
    
    try {
      setParentLoginProgress({
        isLoading: true,
        step: 'creating_profile',
        message: 'Setting up your parent account...'
      });

      const snapshot = await get(parentRef);
      if (!snapshot.exists()) {
        // Create parent profile
        setParentLoginProgress({
          isLoading: true,
          step: 'creating_profile',
          message: 'Creating your parent profile...'
        });
        
        await set(parentRef, {
          email: user.email,
          displayName: user.displayName || '',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0]?.providerId || 'password',
          emailVerified: user.emailVerified
        });
        console.log('Parent profile created successfully');
      } else {
        // Update last login
        setParentLoginProgress({
          isLoading: true,
          step: 'updating_profile',
          message: 'Updating your login information...'
        });
        
        await set(ref(db, `parents/${emailKey}/profile/lastLogin`), Date.now());
        console.log('Parent last login updated');
      }
      return true;
    } catch (error) {
      console.error("Error ensuring parent node:", error);
      setParentLoginProgress({
        isLoading: false,
        step: 'error',
        message: 'Error setting up parent account'
      });
      return false;
    }
  };

  // ensureHomeEducationNode function removed - home education families now use custom claims
  // Family registration will be handled by separate registration process

  const checkIsAdmin = (user, adminEmailsList) => {
    return user && adminEmailsList.includes(user.email.toLowerCase());
  };

  const checkIsSuperAdmin = (user) => {
    return user && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
  };

  // Activity tracking functions
  const initializeUserSession = async (user) => {
    if (!user) return null;
    
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const db = getDatabase();
      const userActivityRef = ref(db, `users/${user.uid}/activityTracking/currentSession`);
      
      const sessionData = {
        sessionId,
        startTime: serverTimestamp(),
        lastActivityTimestamp: getEdmontonTimestamp(),
        userAgent: navigator.userAgent,
        activityEvents: []
      };

      await set(userActivityRef, sessionData);
      setCurrentSessionId(sessionId);
      activityBuffer.current = [];
      lastDatabaseUpdate.current = Date.now();
      
      return sessionId;
    } catch (error) {
      console.error('Error initializing user session:', error);
      return null;
    }
  };

  const addActivityEvent = useCallback((eventType, eventData = {}) => {
    if (!user || !currentSessionId) return;
    
    const timestamp = getEdmontonTimestamp();
    const event = {
      timestamp,
      type: eventType,
      data: {
        url: window.location.pathname,
        ...eventData
      }
    };
    
    activityBuffer.current.push(event);
    
    // Keep buffer size reasonable (last 20 events)
    if (activityBuffer.current.length > 20) {
      activityBuffer.current = activityBuffer.current.slice(-20);
    }
  }, [user, currentSessionId]);

  const updateUserActivityInDatabase = useCallback(async () => {
    if (!user || !currentSessionId) return;
    
    const now = getEdmontonTimestamp();
    
    // Throttle database updates
    if (now - lastDatabaseUpdate.current < DATABASE_UPDATE_INTERVAL) {
      return;
    }
    
    try {
      const db = getDatabase();
      
      // Get current events from buffer
      const eventsToUpdate = [...activityBuffer.current];
      
      // Single batched update instead of multiple set() calls
      await update(ref(db, `users/${user.uid}/activityTracking/currentSession`), {
        lastActivityTimestamp: now,
        activityEvents: eventsToUpdate
      });
      
      lastDatabaseUpdate.current = now;
      
      // Clear buffer after successful update
      activityBuffer.current = [];
      
    } catch (error) {
      if (error.code !== 'PERMISSION_DENIED') {
        console.error('Error updating user activity:', error);
      }
    }
  }, [user, currentSessionId]);

  const archivePreviousSession = async (user) => {
    if (!user) return;
    
    try {
      const db = getDatabase();
      const currentSessionRef = ref(db, `users/${user.uid}/activityTracking/currentSession`);
      const snapshot = await get(currentSessionRef);
      
      if (snapshot.exists()) {
        const sessionData = snapshot.val();
        
        // Add session to pending archive list
        const archiveRef = ref(db, `users/${user.uid}/activityTracking/pendingArchive/${sessionData.sessionId}`);
        await set(archiveRef, {
          ...sessionData,
          endTime: serverTimestamp(),
          readyForArchive: true
        });
      }
    } catch (error) {
      console.error('Error archiving previous session:', error);
    }
  };

  // Fetch admin emails (only called after staff authentication)
  const fetchAdminEmails = async () => {
    try {
      const db = getDatabase();
      const adminEmailsRef = ref(db, 'adminEmails');
      const snapshot = await get(adminEmailsRef);
      
      if (snapshot.exists()) {
        const emails = snapshot.val();
        if (Array.isArray(emails)) {
          return emails.map(email => email.toLowerCase());
        }
      }
      console.warn('No admin emails found or invalid format');
      return [];
    } catch (error) {
      console.error("Error fetching admin emails:", error);
      return [];
    }
  };

  // Simplified token expiration check - Firebase handles automatic refresh
  const checkTokenExpiration = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    
    try {
      // Get the current token with expiration info
      const tokenResult = await auth.currentUser.getIdTokenResult();
      const expirationTime = new Date(tokenResult.expirationTime).getTime();
      setTokenExpirationTime(expirationTime);
      
      return expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return null;
    }
  }, [user]);

  // Simplified session refresh - Firebase handles this automatically
  const refreshSession = useCallback(async () => {
    if (!user || !auth.currentUser) return false;
    
    try {
      // Simply check token status - Firebase will refresh automatically if needed
      await checkTokenExpiration();
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }, [user, checkTokenExpiration]);


  // Simple activity tracking for analytics only - no forced logout
  const trackActivity = useCallback(() => {
    if (!user) return;
    
    // Add activity event to buffer for analytics
    addActivityEvent('user_interaction', {
      timestamp: getEdmontonTimestamp(),
      path: window.location.pathname
    });
    
    // Update database if enough time has passed
    updateUserActivityInDatabase();
  }, [user, updateUserActivityInDatabase, addActivityEvent]);


  // Set up activity tracking (for analytics only - no forced logout)
  useEffect(() => {
    if (!user) return;

    // Check token expiration immediately - Firebase handles refresh automatically
    checkTokenExpiration();

    // Add event listeners to track user activity for analytics
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });
    
    // Handle browser visibility changes - just for token status check
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, just check token status
        checkTokenExpiration();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up interval to periodically check token expiration  
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Clean up event listeners and intervals
    return () => {
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      
      clearInterval(tokenCheckInterval);
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, [user, trackActivity, checkTokenExpiration, currentSessionId]);

  // Listen for metadata changes to trigger token refresh
  useEffect(() => {
    if (!user?.uid) return;

    const db = getDatabase();
    const metadataRef = ref(db, `metadata/${user.uid}`);
    
    const handleMetadataChange = async (snapshot) => {
      if (snapshot.exists()) {
        const metadata = snapshot.val();
        console.log('Metadata change detected, refreshing token...');
        
        try {
          // Force token refresh to get updated custom claims
          await user.getIdToken(true);
          console.log('Token refreshed successfully after metadata change');
          
          // Trigger a custom event to notify components to re-read custom claims
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
            detail: { timestamp: Date.now() } 
          }));
        } catch (error) {
          console.error('Error refreshing token after metadata change:', error);
        }
      }
    };

    // Listen for metadata changes
    const unsubscribe = onValue(metadataRef, handleMetadataChange, (error) => {
      // Silently handle permission errors - metadata might not exist yet
      if (error.code !== 'PERMISSION_DENIED') {
        console.error('Error listening to metadata changes:', error);
      }
    });

    return () => {
      off(metadataRef, 'value', unsubscribe);
    };
  }, [user?.uid]);

  // Enhanced permission checking that guarantees primary guardian permissions
  const checkAndApplyPendingPermissions = async (user) => {
    if (!user?.email) return null;
    
    try {
      console.log('Checking for pending permissions for user:', user.email);
      
      // First, check if user already has familyId in claims
      const currentTokenResult = await user.getIdTokenResult();
      if (currentTokenResult.claims.familyId) {
        console.log('User already has familyId in claims:', currentTokenResult.claims.familyId);
        return null; // No need to apply pending permissions
      }
      
      // Check if user is a primary guardian based on database lookup
      const isEmailStaff = user.email.endsWith('@rtdacademy.com');
      if (!isEmailStaff) {
        const hasExistingFamily = await checkForExistingFamily(user);
        if (hasExistingFamily) {
          console.log('User appears to be primary guardian but missing claims, forcing refresh...');
          
          // Force token refresh to get updated claims
          await user.getIdToken(true);
          const refreshedTokenResult = await user.getIdTokenResult();
          
          if (refreshedTokenResult.claims.familyId) {
            console.log('✅ Claims restored after forced refresh:', refreshedTokenResult.claims.familyId);
            return {
              success: true,
              familyId: refreshedTokenResult.claims.familyId,
              familyRole: refreshedTokenResult.claims.familyRole,
              source: 'forced_refresh'
            };
          }
        }
      }
      
      // Import and call the cloud function for pending permissions
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const applyPendingPermissions = httpsCallable(functions, 'applyPendingPermissions');
      
      const result = await applyPendingPermissions();
      
      if (result.data.success) {
        console.log('✅ Applied pending permissions:', result.data);
        
        // Force immediate token refresh
        await user.getIdToken(true);
        const tokenResult = await user.getIdTokenResult();
        
        if (tokenResult.claims.familyId) {
          console.log('✅ familyId confirmed in claims after pending permissions:', tokenResult.claims.familyId);
          return result.data;
        } else {
          console.log('⚠️ familyId not yet in claims, will trigger metadata refresh...');
          return result.data;
        }
      } else {
        console.log('No pending permissions found or already applied');
        return null;
      }
    } catch (error) {
      console.log('No pending permissions to apply or error occurred:', error.message);
      return null;
    }
  };

  // Helper function to check if user has an existing family (for primary guardians)
  const checkForExistingFamily = async (user) => {
    if (!user?.email) return false;
    
    try {
      const db = getDatabase();
      const userEmailKey = sanitizeEmail(user.email);
      
      // Check if user exists in any family as primary guardian
      const familiesRef = ref(db, 'homeEducationFamilies/familyInformation');
      const snapshot = await get(familiesRef);
      
      if (snapshot.exists()) {
        const families = snapshot.val();
        for (const [familyId, familyData] of Object.entries(families)) {
          if (familyData.guardians && 
              familyData.guardians[userEmailKey] && 
              familyData.guardians[userEmailKey].guardianType === 'primary_guardian') {
            console.log('Found existing family for user as primary guardian:', familyId);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for existing family:', error);
      return false;
    }
  };

  // Staff permissions configuration (mirrored from cloud function)
  const STAFF_PERMISSIONS = {
    LEVELS: {
      STAFF: 'staff',
      TEACHER: 'teacher',
      COURSE_MANAGER: 'course_manager',
      ADMIN: 'admin',
      SUPER_ADMIN: 'super_admin'
    },
    
    DOMAIN_PERMISSIONS: {
      '@rtdacademy.com': ['staff'],
      '@rtd-connect.com': ['staff']
    },
    
    EMAIL_PERMISSIONS: {
      'kyle@rtdacademy.com': ['staff', 'super_admin'],
      'stan@rtdacademy.com': ['staff', 'super_admin'],
      'charlie@rtdacademy.com': ['staff', 'super_admin'],
    },
    
    HIERARCHY: {
      'super_admin': ['super_admin', 'admin', 'course_manager', 'teacher', 'staff'],
      'admin': ['admin', 'course_manager', 'teacher', 'staff'],
      'course_manager': ['course_manager', 'teacher', 'staff'],
      'teacher': ['teacher', 'staff'],
      'staff': ['staff']
    }
  };

  // Get expected permissions for an email address
  const getExpectedPermissionsForEmail = (email) => {
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

  // Expand permissions based on hierarchy
  const expandPermissions = (permissions) => {
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

  // Get highest permission level
  const getHighestPermission = (permissions) => {
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

  // Validate if staff member has basic staff claim
  const validateStaffClaims = async (user) => {
    if (!user || !checkIsStaff(user)) {
      return { needsUpdate: false, reason: 'not_staff' };
    }
    
    try {
      // Get current token claims
      const tokenResult = await user.getIdTokenResult();
      const currentClaims = tokenResult.claims;
      
      // Check if user has basic staff claim
      const hasStaffUser = currentClaims.isStaffUser === true;
      const hasStaffRole = currentClaims.roles && currentClaims.roles.includes('staff');
      const hasStaffPermission = currentClaims.permissions && currentClaims.permissions.isStaff === true;
      
      // User needs basic staff claim if they don't have any of the staff indicators
      if (!hasStaffUser && !hasStaffRole && !hasStaffPermission) {
        return {
          needsUpdate: true,
          reason: 'missing_basic_staff_claim',
          current: {
            isStaffUser: currentClaims.isStaffUser || false,
            roles: currentClaims.roles || [],
            permissions: currentClaims.permissions || {}
          }
        };
      }
      
      return { needsUpdate: false, reason: 'basic_staff_claim_exists' };
      
    } catch (error) {
      console.error('Error validating staff claims:', error);
      return { needsUpdate: true, reason: 'validation_error' };
    }
  };

  // Ensure staff node includes admin and super admin status
  const ensureStaffNode = async (user, emailKey) => {
    // Add staff verification at the start of the function
    if (!checkIsStaff(user)) {
      console.error("Attempted to create staff node for non-staff user");
      return false;
    }
  
    const db = getDatabase();
    const staffRef = ref(db, `staff/${emailKey}`);
    const isAdmin = isAdminUser;
    const isSuperAdmin = checkIsSuperAdmin(user);
    
    try {
      const snapshot = await get(staffRef);
      if (!snapshot.exists()) {
        const [firstName = '', lastName = ''] = (user.displayName || '').split(' ');
        
        await set(staffRef, {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0].providerId,
          isAdmin: isAdmin,
          isSuperAdmin: isSuperAdmin
        });
      } else {
        await set(ref(db, `staff/${emailKey}`), {
          ...snapshot.val(),
          lastLogin: Date.now(),
          isAdmin: isAdmin,
          isSuperAdmin: isSuperAdmin
        });
      }
      return true;
    } catch (error) {
      console.error("Error ensuring staff data:", error);
      throw error;
    }
  };

  const ensureUserNode = async (user, emailKey) => {
    if (!user.emailVerified) {
      console.log("Skipping user data creation - email not verified");
      await signOut();
      navigate('/login', { 
        state: { 
          message: "Please verify your email before signing in. Check your inbox for a verification link." 
        } 
      });
      return false;
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    
    try {
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        
        const userData = {
          uid: user.uid,
          email: user.email,
          sanitizedEmail: emailKey,
          type: "student",
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0]?.providerId || 'password',
          emailVerified: user.emailVerified
        };
        
        await set(userRef, userData);
      } else {
        const existingData = snapshot.val();
        
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now(),
          emailVerified: user.emailVerified
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring user data:", error);
      
      // Handle permission errors
      if (error.code === 'PERMISSION_DENIED') {
        console.log("Permission denied - user may need to re-authenticate");
        await signOut();
        navigate('/login', { 
          state: { 
            message: "Authentication error. Please sign in again." 
          } 
        });
        return false;
      }
      
      // For other errors, log but allow user to continue
      console.error("Non-critical error ensuring user node:", error);
      return true;
    }
  };

  const fetchStaffMembers = async () => {
    const db = getDatabase();
    const staffRef = ref(db, 'staff');
    
    try {
      const snapshot = await get(staffRef);
      if (snapshot.exists()) {
        const staffData = snapshot.val();
        setStaffMembers(staffData);
        return staffData;
      }
      return {};
    } catch (error) {
      console.error("Error fetching staff members:", error);
      return {};
    }
  };

  const fetchCourseTeachers = async () => {
    const db = getDatabase();
    const coursesRef = ref(db, 'courses');
    
    try {
      const snapshot = await get(coursesRef);
      if (snapshot.exists()) {
        const courses = snapshot.val();
        const teacherMapping = {};

        Object.entries(courses).forEach(([courseId, courseData]) => {
          if (courseData.Teachers && courseData.Teachers.length > 0) {
            const primaryTeacherKey = courseData.Teachers[0];
            teacherMapping[courseId] = primaryTeacherKey;
          }
        });

        setCourseTeachers(teacherMapping);
        return teacherMapping;
      }
      return {};
    } catch (error) {
      console.error("Error fetching course teachers:", error);
      return {};
    }
  };

  const getTeacherForCourse = (courseId) => {
    const teacherKey = courseTeachers[courseId];
    if (teacherKey && staffMembers[teacherKey]) {
      return staffMembers[teacherKey];
    }
    return null;
  };




  // Updated auth state change handler
  useEffect(() => {
    let isMounted = true;
    let authTimeout = null;
  
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        // Clear any pending timeout
        if (authTimeout) {
          clearTimeout(authTimeout);
        }
        
        if (currentUser) {
          // Check if the email is blocked
          if (isBlockedEmail(currentUser.email)) {
            console.log(`Login blocked for email: ${currentUser.email}`);
            await firebaseSignOut(auth);
            if (isMounted) {
              const isStaffEmail = currentUser.email.endsWith('@rtdacademy.com');
              navigate(isStaffEmail ? '/staff-login' : '/login', {
                state: {
                  message: "Access denied. Please contact the administrator if you believe this is an error."
                }
              });
              setLoading(false);
            }
            return;
          }
          
          const emailKey = sanitizeEmail(currentUser.email);
          const staffStatus = checkIsStaff(currentUser);
          
          // Add a guard to prevent processing if component unmounted
          if (!isMounted) return;
          
          let dataCreated = false;
          if (staffStatus) {
            // First validate if staff claims need updating
            console.log('Validating staff claims for:', currentUser.email);
            const claimsValidation = await validateStaffClaims(currentUser);
            
            if (claimsValidation.needsUpdate) {
              console.log('Basic staff claim missing:', claimsValidation.reason);
              try {
                // Import and call the new basic staff claim function
                const { getFunctions, httpsCallable } = await import('firebase/functions');
                const functions = getFunctions();
                const setBasicStaffClaim = httpsCallable(functions, 'setBasicStaffClaim');
                
                const result = await setBasicStaffClaim();
                if (result.data.success) {
                  console.log('✅ Basic staff claim set successfully:', result.data);
                  
                  // Force token refresh to get updated claims
                  await currentUser.getIdToken(true);
                } else {
                  console.error('Failed to set basic staff claim:', result.data);
                }
              } catch (error) {
                console.error('Error setting basic staff claim:', error);
              }
            } else {
              console.log('Basic staff claim exists, skipping cloud function call');
            }
            
            // Fetch admin emails first for staff users
            const adminEmailsList = await fetchAdminEmails();
            if (isMounted) {
              setAdminEmails(adminEmailsList);
              const adminStatus = checkIsAdmin(currentUser, adminEmailsList);
              const superAdminStatus = checkIsSuperAdmin(currentUser);
              
              setIsAdminUser(adminStatus);
              setIsSuperAdminUser(superAdminStatus);
              
              dataCreated = await ensureStaffNode(currentUser, emailKey);
              if (dataCreated) {
                try {
                  await Promise.all([
                    fetchStaffMembers(),
                    fetchCourseTeachers(),
                    checkTokenExpiration(),
                    archivePreviousSession(currentUser).then(() => initializeUserSession(currentUser))
                  ]);
                } catch (error) {
                  console.error('Error initializing staff activity tracking:', error);
                }
                
                setUser(currentUser);
                setUserEmailKey(emailKey);
                setIsStaffUser(true);
                
                // Add a small delay before navigation to ensure state is updated
                if (location.pathname.toLowerCase() === '/staff-login') {
                  authTimeout = setTimeout(() => {
                    if (isMounted) navigate('/teacher-dashboard');
                  }, 500);
                }
              }
            }
          } else {
            // Determine user type based on which portal they're accessing
            const isParentPortalAccess = location.pathname === '/parent-login' || 
                                        location.pathname === '/parent-dashboard' ||
                                        localStorage.getItem('parentPortalSignup') === 'true';
            
            const isHomeEducationPortalAccess = location.pathname === '/rtd-connect/login' || 
                                              location.pathname === '/rtd-connect/dashboard' ||
                                              localStorage.getItem('rtdConnectPortalLogin') === 'true' ||
                                              localStorage.getItem('rtdConnectPortalSignup') === 'true' ||
                                              process.env.REACT_APP_SITE === 'rtdconnect';
            
            if (isHomeEducationPortalAccess) {
              // RTD Connect user - enhanced permission checking
              dataCreated = await ensureUserNode(currentUser, emailKey);
              if (dataCreated && isMounted) {
                try {
                  // Enhanced permission checking - this will handle both pending permissions 
                  // and missing claims for existing primary guardians
                  const permissionResult = await checkAndApplyPendingPermissions(currentUser);
                  
                  if (permissionResult) {
                    console.log('✅ RTD Connect permissions applied/restored:', permissionResult);
                  }
                  
                  // Initialize basic user session
                  await Promise.all([
                    checkTokenExpiration(),
                    archivePreviousSession(currentUser).then(() => initializeUserSession(currentUser))
                  ]);
                } catch (error) {
                  console.error('Error initializing RTD Connect user session:', error);
                }
                
                setUser(currentUser);
                setUserEmailKey(emailKey);
                setIsStaffUser(false);
                setIsAdminUser(false);
                setIsSuperAdminUser(false);
                setIsParentUser(false);
                
                // For RTD Connect portal access, set isHomeEducationParent to true
                // This ensures access to the portal even if custom claims are delayed
                setIsHomeEducationParent(true);
                
                // Clear RTD Connect signup/login flags if they exist
                localStorage.removeItem('rtdConnectPortalSignup');
                localStorage.removeItem('rtdConnectPortalLogin');
                
                // Navigate to RTD Connect dashboard
                if (location.pathname.toLowerCase() === '/rtd-connect/login') {
                  authTimeout = setTimeout(() => {
                    if (isMounted) navigate('/rtd-connect/dashboard');
                  }, 500);
                }
              }
            } else if (isParentPortalAccess) {
              // Parent user - create/update parent node
              setParentLoginProgress({
                isLoading: true,
                step: 'authenticating',
                message: 'Authenticating parent account...'
              });

              const parentCreated = await ensureParentNode(currentUser, emailKey);
              if (parentCreated && isMounted) {
                setParentLoginProgress({
                  isLoading: true,
                  step: 'initializing_session',
                  message: 'Initializing your session...'
                });

                try {
                  // Check for pending permissions first
                  await checkAndApplyPendingPermissions(currentUser);
                  
                  await Promise.all([
                    checkTokenExpiration(),
                    archivePreviousSession(currentUser).then(() => initializeUserSession(currentUser))
                  ]);
                } catch (error) {
                  console.error('Error initializing parent activity tracking:', error);
                }
                
                setUser(currentUser);
                setUserEmailKey(emailKey);
                setIsStaffUser(false);
                setIsAdminUser(false);
                setIsSuperAdminUser(false);
                setIsParentUser(true);
                
                // Clear parent signup flag if it exists
                localStorage.removeItem('parentPortalSignup');
                
                setParentLoginProgress({
                  isLoading: true,
                  step: 'redirecting',
                  message: 'Redirecting to your dashboard...'
                });
                
                // Navigate to parent dashboard
                if (location.pathname.toLowerCase() === '/parent-login') {
                  authTimeout = setTimeout(() => {
                    if (isMounted) navigate('/parent-dashboard');
                  }, 500);
                }
              } else {
                setParentLoginProgress({
                  isLoading: false,
                  step: 'error',
                  message: 'Failed to set up parent account'
                });
              }
            } else {
              // Regular student user
              dataCreated = await ensureUserNode(currentUser, emailKey);
              if (dataCreated && isMounted) {
                try {
                  // Check for pending permissions first
                  await checkAndApplyPendingPermissions(currentUser);
                  
                  await archivePreviousSession(currentUser);
                  await initializeUserSession(currentUser);
                  await checkTokenExpiration();
                } catch (error) {
                  console.error('Error initializing activity tracking:', error);
                }
                
                setUser(currentUser);
                setUserEmailKey(emailKey);
                setIsStaffUser(false);
                setIsAdminUser(false);
                setIsSuperAdminUser(false);
                setIsParentUser(false);
                setIsHomeEducationParent(false);
                
                // Add a small delay before navigation to ensure state is updated
                if (location.pathname.toLowerCase() === '/login') {
                  authTimeout = setTimeout(() => {
                    if (isMounted) navigate('/dashboard');
                  }, 500);
                }
              }
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
            setUserEmailKey(null);
            setIsStaffUser(false);
            setIsAdminUser(false);
            setIsSuperAdminUser(false);
            setIsParentUser(false);
            setIsHomeEducationParent(false);
            setCourseTeachers({});
            setStaffMembers({});
            setEmulatedUser(null);
            setEmulatedUserEmailKey(null);
            setIsEmulating(false);
            setAdminEmails([]);
            setTokenExpirationTime(null);
  
            const currentPath = location.pathname;
            if (!isPublicRoute(currentPath)) {
              authTimeout = setTimeout(() => {
                if (isMounted) {
                  if (currentPath.toLowerCase().includes('teacher') || 
                      currentPath.toLowerCase() === '/courses') {
                    navigate('/staff-login');
                  } else if (currentPath.toLowerCase() === '/parent-dashboard') {
                    navigate('/parent-login');
                  } else if (currentPath.toLowerCase() === '/rtd-connect/dashboard') {
                    navigate('/rtd-connect/login');
                  } else if (currentPath.toLowerCase() === '/rtd-learning-dashboard') {
                    navigate('/rtd-learning-login');
                  } else if (currentPath.toLowerCase() === '/rtd-learning-admin-dashboard') {
                    navigate('/rtd-learning-admin-login');
                  } else {
                    navigate('/login');
                  }
                }
              }, 300);
            }
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        if (isMounted) {
          setUser(null);
          setUserEmailKey(null);
          setIsStaffUser(false);
          setIsAdminUser(false);
          setIsSuperAdminUser(false);
          setIsParentUser(false);
          setIsHomeEducationParent(false);
          setCourseTeachers({});
          setStaffMembers({});
          setEmulatedUser(null);
          setEmulatedUserEmailKey(null);
          setIsEmulating(false);
          setAdminEmails([]);
          setTokenExpirationTime(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });
  
    return () => {
      isMounted = false;
      unsubscribe();
      if (authTimeout) clearTimeout(authTimeout);
    };
  }, [navigate, location.pathname, checkTokenExpiration]);

  const signOut = async () => {
    try {
      const wasStaff = isStaffUser;
      const wasParent = isParentUser;
      const wasHomeEducation = isHomeEducationParent;
      
      // Archive current session before signing out
      if (user) {
        await archivePreviousSession(user);
      }
      
      // Clear any existing timeouts
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
        tokenRefreshTimeoutRef.current = null;
      }
      
      // First reset all state variables
      setUser(null);
      setUserEmailKey(null);
      setIsStaffUser(false);
      setIsAdminUser(false);
      setIsSuperAdminUser(false);
      setIsParentUser(false);
      setIsHomeEducationParent(false);
      setCourseTeachers({});
      setStaffMembers({});
      setEmulatedUser(null);
      setEmulatedUserEmailKey(null);
      setIsEmulating(false);
      setAdminEmails([]);
      setTokenExpirationTime(null);
      setCurrentSessionId(null);
      
      // Clear activity tracking state
      activityBuffer.current = [];
      lastDatabaseUpdate.current = 0;
      
      // Clear localStorage items used for session management
      localStorage.removeItem('rtd_last_activity_timestamp');
      
      // Clear portal-specific flags
      localStorage.removeItem('rtdConnectPortalLogin');
      localStorage.removeItem('rtdConnectPortalSignup');
      localStorage.removeItem('parentPortalSignup');
      
      // Then sign out of Firebase
      await firebaseSignOut(auth);
      
      // Wait a moment to ensure everything is cleaned up
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate after cleanup is complete - check current path to determine where to redirect
      const currentPath = location.pathname.toLowerCase();
      if (wasStaff) {
        navigate('/staff-login');
      } else if (wasHomeEducation || currentPath.includes('rtd-connect')) {
        navigate('/rtd-connect/login');
      } else if (wasParent || currentPath.includes('parent')) {
        navigate('/parent-login');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Force a clean state even if there's an error
      setUser(null);
      setUserEmailKey(null);
      setIsStaffUser(false);
      setIsAdminUser(false);
      setIsSuperAdminUser(false);
      setIsParentUser(false);
      setIsHomeEducationParent(false);
      navigate('/login');
      
      throw error;
    }
  };

  const isStaff = (user) => {
    return checkIsStaff(user);
  };

  // Start emulation function
  const startEmulation = async (studentEmail) => {
    if (!isStaffUser) {
      console.error("Only staff members can emulate students");
      return false;
    }

    try {
      const db = getDatabase();
      const emailKey = sanitizeEmail(studentEmail);
      const studentRef = ref(db, `students/${emailKey}`);
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        const studentData = snapshot.val();
        
        const emulatedUserData = {
          email: studentEmail,
          emailVerified: true,
          profile: studentData.profile || null
        };

        setEmulatedUser(emulatedUserData);
        setEmulatedUserEmailKey(emailKey);
        setIsEmulating(true);
        return true;
      } else {
        console.error("Student not found");
        return false;
      }
    } catch (error) {
      console.error("Error starting emulation:", error);
      return false;
    }
  };

  // Stop emulation function
  const stopEmulation = () => {
    setEmulatedUser(null);
    setEmulatedUserEmailKey(null);
    setIsEmulating(false);
    navigate('/teacher-dashboard');
  };

  // Helper function to check migration status
  const checkMigrationStatus = async (email) => {
    const db = getDatabase();
    const emailKey = sanitizeEmail(email);
    const studentsRef = ref(db, `students/${emailKey}`);
    const snapshot = await get(studentsRef);
    return snapshot.exists();
  };

  // Get remaining session time based on Firebase token expiration
  const getRemainingSessionTime = useCallback(() => {
    if (!user || !tokenExpirationTime) return 0;
    
    const currentTime = Date.now();
    const timeUntilTokenExpires = Math.max(0, tokenExpirationTime - currentTime);
    
    return timeUntilTokenExpires;
  }, [user, tokenExpirationTime]);

  const value = {
    // Original auth values
    user,
    user_email_key: isEmulating ? emulatedUserEmailKey : user_email_key,
    loading,
    isStaff,
    isStaffUser,
    isAdminUser,
    isSuperAdminUser,
    isParentUser,
    isHomeEducationParent,
    ensureStaffNode,
    ensureUserNode,
    signOut,
    courseTeachers,
    staffMembers,
    getTeacherForCourse,
    
    // Firebase native session management
    refreshSession,
    getRemainingSessionTime,
    tokenExpirationTime,
    
    // Emulation values 
    emulatedUser,
    emulatedUserEmailKey,
    isEmulating,
    startEmulation,
    stopEmulation,
    
    // Current user
    currentUser: isEmulating ? {
      ...emulatedUser,
      uid: user ? user.uid : null
    } : user,
    
    // Both email keys should be the emulated user's during emulation
    current_user_email_key: isEmulating ? emulatedUserEmailKey : user_email_key,

    // Admin access helpers
    hasAdminAccess: () => isStaffUser && isAdminUser,
    hasSuperAdminAccess: () => isStaffUser && isSuperAdminUser,

    // Permission indicators
    permissionIndicators: PERMISSION_INDICATORS,
    
    // Helper functions to check permissions
    requiresStaffAccess: () => isStaffUser,
    requiresAdminAccess: () => isStaffUser && isAdminUser,
    requiresSuperAdminAccess: () => isStaffUser && isSuperAdminUser,

    // Added function to check if an email is blocked
    isBlockedEmail,
    
    // Activity tracking functions
    addActivityEvent,
    updateUserActivityInDatabase,
    currentSessionId,

    // Parent login progress
    parentLoginProgress,
    setParentLoginProgress,

    // Home education login progress
    homeEducationLoginProgress,
    setHomeEducationLoginProgress,

    // Pending permissions function
    checkAndApplyPendingPermissions: () => checkAndApplyPendingPermissions(user),

  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;