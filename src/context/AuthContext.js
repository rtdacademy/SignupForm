import React, { createContext, useState, useEffect, useContext } from 'react';
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
  'stan@rtdacademy.com'
];

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
  const [courseTeachers, setCourseTeachers] = useState({});
  const [staffMembers, setStaffMembers] = useState({});
  const [isMigratedUser, setIsMigratedUser] = useState(false);
  const [adminEmails, setAdminEmails] = useState([]);

  // Emulation states
  const [emulatedUser, setEmulatedUser] = useState(null);
  const [emulatedUserEmailKey, setEmulatedUserEmailKey] = useState(null);
  const [isEmulating, setIsEmulating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
    '/policies-reports'
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

  const checkIsStaff = (user) => {
    return user && user.email.endsWith("@rtdacademy.com");
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
        const studentsRef = ref(db, `students/${emailKey}`);
        const studentSnapshot = await get(studentsRef);
        const isMigrated = studentSnapshot.exists();

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
        
        if (!isMigrated) {
          const notificationsRef = ref(db, `notifications/${emailKey}`);
          await set(notificationsRef, {});
        }
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
      if (error.message?.includes('PERMISSION_DENIED')) {
        console.log("User does not have permission - email verification may be pending");
        await signOut();
        navigate('/login', { 
          state: { 
            message: "Please verify your email before signing in. Check your inbox for a verification link." 
          } 
        });
        return false;
      }
      console.error("Error ensuring user data:", error);
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

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const emailKey = sanitizeEmail(currentUser.email);
          const staffStatus = checkIsStaff(currentUser);
          
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
                  fetchCourseTeachers()
                ]);
                
                setUser(currentUser);
                setUserEmailKey(emailKey);
                setIsStaffUser(true);
                
                if (location.pathname.toLowerCase() === '/staff-login') {
                  navigate('/teacher-dashboard');
                }
              }
            }
          } else {
            dataCreated = await ensureUserNode(currentUser, emailKey);
            if (dataCreated && isMounted) {
              setUser(currentUser);
              setUserEmailKey(emailKey);
              setIsStaffUser(false);
              setIsAdminUser(false);
              setIsSuperAdminUser(false);
              
              if (location.pathname.toLowerCase() === '/login') {
                navigate('/dashboard');
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
            setCourseTeachers({});
            setStaffMembers({});
            setEmulatedUser(null);
            setEmulatedUserEmailKey(null);
            setIsEmulating(false);
            setIsMigratedUser(false);
            setAdminEmails([]);

            const currentPath = location.pathname;
            if (!isPublicRoute(currentPath)) {
              if (currentPath.toLowerCase().includes('teacher') || 
                  currentPath.toLowerCase() === '/courses') {
                navigate('/staff-login');
              } else {
                navigate('/login');
              }
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
    };
  }, [navigate, location.pathname]);

  const signOut = async () => {
    try {
      const wasStaff = isStaffUser;
      await firebaseSignOut(auth);
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
      
      navigate(wasStaff ? '/staff-login' : '/login');
    } catch (error) {
      console.error("Error signing out:", error);
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

  const value = {
    // Original auth values
    user,
    user_email_key: isEmulating ? emulatedUserEmailKey : user_email_key,
    loading,
    isStaff,
    isStaffUser,
    isAdminUser,
    isSuperAdminUser,
    ensureStaffNode,
    ensureUserNode,
    signOut,
    courseTeachers,
    staffMembers,
    getTeacherForCourse,
    
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