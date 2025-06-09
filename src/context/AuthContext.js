import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from "firebase/database";
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { sanitizeEmail } from '../utils/sanitizeEmail';
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
const BLOCKED_EMAILS = [
  'marc@rtdacademy.com',
  'marc@rtdlearning.com'
];

// Session timeout constants
const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes by default
const STAFF_SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes for staff
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 minutes of inactivity will force logout
// Firebase ID tokens last 1 hour by default; this aligns with our timeout values

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
  const [courseTeachers, setCourseTeachers] = useState({});
  const [staffMembers, setStaffMembers] = useState({});
  const [isMigratedUser, setIsMigratedUser] = useState(false);
  const [adminEmails, setAdminEmails] = useState([]);
  const [tokenExpirationTime, setTokenExpirationTime] = useState(null);

  // Emulation states
  const [emulatedUser, setEmulatedUser] = useState(null);
  const [emulatedUserEmailKey, setEmulatedUserEmailKey] = useState(null);
  const [isEmulating, setIsEmulating] = useState(false);

  // Session timeout refs
  const inactivityTimeoutRef = useRef(null);
  const tokenRefreshTimeoutRef = useRef(null);
  const userActivityTracking = useRef({
    lastActivity: Date.now(),
    isActive: true
  });

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
    '/education-plan/2025-26'
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

  const checkIsAdmin = (user, adminEmailsList) => {
    return user && adminEmailsList.includes(user.email.toLowerCase());
  };

  const checkIsSuperAdmin = (user) => {
    return user && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
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

  // Function to check token and set up expiration
  const checkTokenExpiration = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get the current token with expiration info
      const tokenResult = await auth.currentUser.getIdTokenResult();
      const expirationTime = new Date(tokenResult.expirationTime).getTime();
      setTokenExpirationTime(expirationTime);
      
      // Clear any existing token refresh timeout
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      
      const now = Date.now();
      const timeUntilExpiration = expirationTime - now;
      
      // If token will expire in less than 5 minutes and user is active, schedule a refresh
      if (timeUntilExpiration < 5 * 60 * 1000 && userActivityTracking.current.isActive) {
        // Schedule token refresh for 1 minute before expiration
        const refreshTime = Math.max(0, timeUntilExpiration - 60 * 1000);
        
        tokenRefreshTimeoutRef.current = setTimeout(async () => {
          if (userActivityTracking.current.isActive) {
            console.log('Refreshing Firebase token');
            await auth.currentUser.getIdToken(true);
          }
        }, refreshTime);
      }
      
      return expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return null;
    }
  }, [user]);

  // New refreshSession method that forces a token refresh
  const refreshSession = useCallback(async () => {
    if (!user) return false;
    
    try {
      // Track the activity
      userActivityTracking.current.lastActivity = Date.now();
      userActivityTracking.current.isActive = true;
      
      // Force a token refresh if token is going to expire soon
      if (tokenExpirationTime) {
        const timeUntilExpiration = tokenExpirationTime - Date.now();
        if (timeUntilExpiration < 10 * 60 * 1000) { // Less than 10 minutes left
          await auth.currentUser.getIdToken(true);
          await checkTokenExpiration(); // Update expiration time
        }
      } else {
        // If we don't have the expiration time yet, check it now
        await checkTokenExpiration();
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }, [user, tokenExpirationTime, checkTokenExpiration]);


  // Session timeout handling - updated to use token expiration
  const resetInactivityTimeout = useCallback(() => {
    if (!user) return;

    // Clear any existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    const now = Date.now();
    
    // Update activity tracking in memory
    userActivityTracking.current.lastActivity = now;
    userActivityTracking.current.isActive = true;
    
    // Also store in localStorage for persistence across sleep/hibernation
    localStorage.setItem('rtd_last_activity_timestamp', now.toString());
    
    // Refresh token if it's close to expiration
    refreshSession();
    
    // Use a local function to handle the logout to avoid reference issues
    const handleInactivityTimeout = () => {
      // Double-check if user is still inactive by comparing with localStorage timestamp
      const storedTimestamp = parseInt(localStorage.getItem('rtd_last_activity_timestamp') || '0', 10);
      const currentTime = Date.now();
      const inactivityDuration = currentTime - storedTimestamp;
      
      if (inactivityDuration >= INACTIVITY_TIMEOUT) {
        console.log("Inactivity timeout reached - logging user out");
        // Clear localStorage items
        localStorage.removeItem('rtd_last_activity_timestamp');
        localStorage.removeItem('rtd_scheduled_logout_time');
        
        // Sign out of Firebase (using promise instead of await)
        firebaseSignOut(auth).catch(error => {
          console.error("Error during inactivity logout:", error);
        });
      }
    };
    
    // Set up an inactivity timeout that will log the user out
    inactivityTimeoutRef.current = setTimeout(handleInactivityTimeout, INACTIVITY_TIMEOUT + 1000); // Add 1 second buffer
  }, [user, refreshSession]);

  // Track user activity
  const trackActivity = useCallback(() => {
    if (!user) return;
    
    // Reset the timeout on user activity
    resetInactivityTimeout();
  }, [user, resetInactivityTimeout]);

  // Set up activity tracking
  useEffect(() => {
    if (!user) return;

    // Initialize activity tracking when user logs in
    resetInactivityTimeout();
    
    // Check token expiration immediately
    checkTokenExpiration();

    // Add event listeners to track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });
    
    // Handle browser visibility changes for sleep/wake detection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, check if we should be logged out
        const storedTimestamp = parseInt(localStorage.getItem('rtd_last_activity_timestamp') || '0', 10);
        const currentTime = Date.now();
        const inactivityDuration = currentTime - storedTimestamp;
        
        console.log(`Visibility changed, inactivity duration: ${Math.round(inactivityDuration/1000)}s`);
        
        if (inactivityDuration >= INACTIVITY_TIMEOUT) {
          // Perform logout directly without async function
          // Clear localStorage items
          localStorage.removeItem('rtd_last_activity_timestamp');
          localStorage.removeItem('rtd_scheduled_logout_time');
          
          // Reset timeouts
          if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
          if (tokenRefreshTimeoutRef.current) clearTimeout(tokenRefreshTimeoutRef.current);
          
          // Sign out of Firebase using promises
          firebaseSignOut(auth).catch(error => {
            console.error("Error during inactivity logout:", error);
          });
        } else {
          // Not timed out, but refresh the token status
          checkTokenExpiration();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up interval to periodically check token expiration
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Clean up event listeners and intervals
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
      
      clearInterval(tokenCheckInterval);
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, [user, trackActivity, resetInactivityTimeout, checkTokenExpiration]);

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
      // First, try to read the user's own data
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // For new users, try to check migration status
        let isMigrated = false;
        try {
          const studentsRef = ref(db, `students/${emailKey}`);
          const studentSnapshot = await get(studentsRef);
          isMigrated = studentSnapshot.exists();
        } catch (studentsError) {
          // If we can't read students data due to permissions, assume not migrated
          console.log("Cannot check migration status, assuming new user");
          isMigrated = false;
        }

        const userData = {
          uid: user.uid,
          email: user.email,
          sanitizedEmail: emailKey,
          type: 'student',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0].providerId,
          emailVerified: user.emailVerified,
          isMigratedUser: isMigrated
        };
        
        await set(userRef, userData);
        setIsMigratedUser(isMigrated);
        
        // Note: Notifications node will be created by cloud functions when needed
      } else {
        const existingData = snapshot.val();
        const isMigrated = existingData.isMigratedUser || false;
        setIsMigratedUser(isMigrated);
        
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now(),
          emailVerified: user.emailVerified,
          isMigratedUser: isMigrated
        });
      }
      return true;
    } catch (error) {
      console.error("Error ensuring user data:", error);
      if (error.message?.includes('PERMISSION_DENIED') || error.code === 'PERMISSION_DENIED') {
        console.log("User does not have permission - email verification may be pending or security rules issue");
        await signOut();
        navigate('/login', { 
          state: { 
            message: "Authentication error. Please verify your email or contact support if the issue persists." 
          } 
        });
        return false;
      }
      throw error;
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
                await Promise.all([
                  fetchStaffMembers(),
                  fetchCourseTeachers(),
                  checkTokenExpiration() // Check token expiration for the new user
                ]);
                
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
            // Check if user is a parent (skip this check if on parent-login page with invitation token or parent-dashboard)
            const isParentInvitationFlow = location.pathname === '/parent-login' && 
                                          new URLSearchParams(location.search).get('token');
            const isParentDashboard = location.pathname === '/parent-dashboard';
            
            const parentStatus = !isParentInvitationFlow && !isParentDashboard && await checkIsParent(currentUser, emailKey);
            
            if (parentStatus) {
              // Parent user - don't create student node
              await checkTokenExpiration();
              
              setUser(currentUser);
              setUserEmailKey(emailKey);
              setIsStaffUser(false);
              setIsAdminUser(false);
              setIsSuperAdminUser(false);
              setIsParentUser(true);
              
              // Navigate to parent dashboard
              if (location.pathname.toLowerCase() === '/login') {
                authTimeout = setTimeout(() => {
                  if (isMounted) navigate('/parent-dashboard');
                }, 500);
              }
            } else {
              // Regular student user
              dataCreated = await ensureUserNode(currentUser, emailKey);
              if (dataCreated && isMounted) {
                await checkTokenExpiration(); // Check token expiration for the new user
                
                setUser(currentUser);
                setUserEmailKey(emailKey);
                setIsStaffUser(false);
                setIsAdminUser(false);
                setIsSuperAdminUser(false);
                setIsParentUser(false);
                
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
            setCourseTeachers({});
            setStaffMembers({});
            setEmulatedUser(null);
            setEmulatedUserEmailKey(null);
            setIsEmulating(false);
            setIsMigratedUser(false);
            setAdminEmails([]);
            setTokenExpirationTime(null);
  
            const currentPath = location.pathname;
            if (!isPublicRoute(currentPath)) {
              authTimeout = setTimeout(() => {
                if (isMounted) {
                  if (currentPath.toLowerCase().includes('teacher') || 
                      currentPath.toLowerCase() === '/courses') {
                    navigate('/staff-login');
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
          setCourseTeachers({});
          setStaffMembers({});
          setEmulatedUser(null);
          setEmulatedUserEmailKey(null);
          setIsEmulating(false);
          setIsMigratedUser(false);
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
      
      // Clear any existing timeouts
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      
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
      setCourseTeachers({});
      setStaffMembers({});
      setEmulatedUser(null);
      setEmulatedUserEmailKey(null);
      setIsEmulating(false);
      setIsMigratedUser(false);
      setAdminEmails([]);
      setTokenExpirationTime(null);
      
      // Clear localStorage items used for session management
      localStorage.removeItem('rtd_last_activity_timestamp');
      localStorage.removeItem('rtd_scheduled_logout_time');
      
      // Then sign out of Firebase
      await firebaseSignOut(auth);
      
      // Wait a moment to ensure everything is cleaned up
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate after cleanup is complete
      navigate(wasStaff ? '/staff-login' : '/login');
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Force a clean state even if there's an error
      setUser(null);
      setUserEmailKey(null);
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

  // Updated function to get remaining session time based on token expiration
  const getRemainingSessionTime = useCallback(() => {
    if (!user) return 0;
    
    // Get stored last activity from localStorage (more resilient to sleep/hibernation)
    const storedLastActivity = parseInt(localStorage.getItem('rtd_last_activity_timestamp') || 
                                       String(userActivityTracking.current.lastActivity), 10);
    const currentTime = Date.now();
    
    if (tokenExpirationTime) {
      // Calculate both token expiration and inactivity timeouts
      const timeUntilTokenExpires = Math.max(0, tokenExpirationTime - currentTime);
      const timeUntilInactivityTimeout = Math.max(0, INACTIVITY_TIMEOUT - (currentTime - storedLastActivity));
      
      // Return the smaller of the two (whichever will happen first)
      return Math.min(timeUntilTokenExpires, timeUntilInactivityTimeout);
    } else {
      // Fall back to the session timeout if token expiration is not available
      const timeoutDuration = isStaffUser ? STAFF_SESSION_TIMEOUT : SESSION_TIMEOUT;
      const elapsedTime = currentTime - storedLastActivity;
      return Math.max(0, timeoutDuration - elapsedTime);
    }
  }, [user, tokenExpirationTime, isStaffUser]);

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
    ensureStaffNode,
    ensureUserNode,
    signOut,
    courseTeachers,
    staffMembers,
    getTeacherForCourse,
    
    // Session timeout values and functions - updated for token-based timeouts
    refreshSession,
    getRemainingSessionTime,
    sessionTimeout: isStaffUser ? STAFF_SESSION_TIMEOUT : SESSION_TIMEOUT,
    tokenExpirationTime,
    
    // Emulation values 
    emulatedUser,
    emulatedUserEmailKey,
    isEmulating,
    startEmulation,
    stopEmulation,
    
    // Current user with migration status
    currentUser: isEmulating ? {
      ...emulatedUser,
      uid: user ? user.uid : null,
      isMigratedUser: false // Emulated users aren't considered migrated
    } : user ? {
      ...user,
      isMigratedUser // Include the migration status for regular users
    } : null,
    
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

    // Migration related values and functions
    isMigratedUser,
    checkMigrationStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;