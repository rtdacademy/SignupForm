import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from "firebase/database";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [user_email_key, setUserEmailKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStaffUser, setIsStaffUser] = useState(false);
  
  // New state for course teachers and staff members
  const [courseTeachers, setCourseTeachers] = useState({});
  const [staffMembers, setStaffMembers] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  // Define all public routes
  const publicRoutes = [
    '/login',
    '/staff-login',
    '/reset-password',
    '/signup',
    '/auth-action-handler',
    '/contractor-invoice',
    '/adult-students',
    '/your-way',
    '/get-started'  
  ];

  // Helper function to check if current route is public
  const isPublicRoute = (path) => {
    // First check exact matches
    if (publicRoutes.some(route => path.toLowerCase() === route.toLowerCase())) {
      return true;
    }

    // Then check if it's a student portal route
    if (path.toLowerCase().startsWith('/student-portal/')) {
      // This regex will match the pattern /student-portal/{userId}/{accessKey}
      const studentPortalPattern = /^\/student-portal\/[^/]+\/[^/]+$/i;
      return studentPortalPattern.test(path);
    }

    return false;
  };

  const checkIsStaff = (user) => {
    return user && user.email.endsWith("@rtdacademy.com");
  };

  const ensureUserNode = async (user, emailKey) => {
    // Only require email verification for regular users
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
          type: 'student',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0].providerId,
          emailVerified: user.emailVerified
        };
        
        await set(userRef, userData);
        
        const notificationsRef = ref(db, `notifications/${emailKey}`);
        await set(notificationsRef, {});
        
      } else {
        await set(userRef, {
          ...snapshot.val(),
          lastLogin: Date.now(),
          emailVerified: user.emailVerified
        });
      }
      return true;
    } catch (error) {
      if (error.message?.includes('PERMISSION_DENIED')) {
        console.log("User does not have permission yet - email verification may be pending");
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

  const ensureStaffNode = async (user, emailKey) => {
    const db = getDatabase();
    const staffRef = ref(db, `staff/${emailKey}`);
    
    try {
      const snapshot = await get(staffRef);
      if (!snapshot.exists()) {
        await set(staffRef, {
          email: user.email,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0].providerId
        });
      } else {
        await set(ref(db, `staff/${emailKey}/lastLogin`), Date.now());
      }
      return true;
    } catch (error) {
      console.error("Error ensuring staff data:", error);
      throw error;
    }
  };

  // Function to fetch all staff members
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

  // Function to fetch teachers for all courses
  const fetchCourseTeachers = async () => {
    const db = getDatabase();
    const coursesRef = ref(db, 'courses');
    
    try {
      const snapshot = await get(coursesRef);
      if (snapshot.exists()) {
        const courses = snapshot.val();
        const teacherMapping = {};

        // Process each course
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

  // Function to get teacher info for a specific course
  const getTeacherForCourse = (courseId) => {
    const teacherKey = courseTeachers[courseId];
    if (teacherKey && staffMembers[teacherKey]) {
      return staffMembers[teacherKey];
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const emailKey = sanitizeEmail(currentUser.email);
          const staffStatus = checkIsStaff(currentUser);
          
          let dataCreated = false;
          if (staffStatus) {
            // Staff users don't need email verification
            dataCreated = await ensureStaffNode(currentUser, emailKey);
            if (dataCreated && isMounted) {
              // Fetch staff and course data after successful login
              await Promise.all([
                fetchStaffMembers(),
                fetchCourseTeachers()
              ]);
              
              setUser(currentUser);
              setUserEmailKey(emailKey);
              setIsStaffUser(true);
              
              // Redirect staff to teacher dashboard if on staff-login page
              if (location.pathname.toLowerCase() === '/staff-login') {
                navigate('/teacher-dashboard');
              }
            }
          } else {
            // Regular users need email verification
            dataCreated = await ensureUserNode(currentUser, emailKey);
            if (dataCreated && isMounted) {
              setUser(currentUser);
              setUserEmailKey(emailKey);
              setIsStaffUser(false);
              
              // Redirect students to dashboard if on login page
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
            setCourseTeachers({});
            setStaffMembers({});

            // Only redirect if not on a public route
            const currentPath = location.pathname.toLowerCase();
            if (!isPublicRoute(currentPath)) {
              if (currentPath.includes('teacher') || currentPath === '/courses') {
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
          setCourseTeachers({});
          setStaffMembers({});
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
      setCourseTeachers({});
      setStaffMembers({});
      navigate(wasStaff ? '/staff-login' : '/login');
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const isStaff = (user) => {
    return checkIsStaff(user);
  };

  const value = {
    user,
    user_email_key,
    loading,
    isStaff,
    isStaffUser,
    ensureStaffNode,
    ensureUserNode,
    signOut,
    courseTeachers,
    staffMembers,
    getTeacherForCourse
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
