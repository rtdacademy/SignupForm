import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { getDatabase, ref, get, onValue, off } from "firebase/database";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courseId, setCourseId] = useState(null);
  const [userEmailKey, setUserEmailKey] = useState(null);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const { user, isStaffUser } = useAuth();

  // Set courseId from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cid = searchParams.get('cid');
    setCourseId(cid);
  }, [location]);

  // Set userEmailKey when user is available
  useEffect(() => {
    if (user) {
      const emailKey = sanitizeEmail(user.email);
      setUserEmailKey(emailKey);
      // console.log('Core identifiers:', {
      //   userEmailKey: emailKey,
      //   courseId
      // });
    }
  }, [user, courseId]);

  // Fetch and subscribe to courses data
  useEffect(() => {
    if (!user) {
      setCourses({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getDatabase();
    const coursesRef = ref(db, 'courses');

    const handleData = (snapshot) => {
      try {
        if (snapshot.exists()) {
          const coursesData = snapshot.val();
          
          // Process each course to exclude the 'units' property
          const processedCourses = Object.entries(coursesData).reduce((acc, [id, course]) => {
            const { units, ...courseWithoutUnits } = course;
            acc[id] = courseWithoutUnits;
            return acc;
          }, {});

          setCourses(processedCourses);
        } else {
          setCourses({});
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing courses data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Initial fetch
    get(coursesRef)
      .then(handleData)
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setError(err.message);
        setLoading(false);
      });

    // Subscribe to real-time updates if user is staff
    if (isStaffUser) {
      onValue(coursesRef, handleData, (err) => {
        console.error('Error in courses subscription:', err);
        setError(err.message);
        setLoading(false);
      });

      // Cleanup subscription
      return () => off(coursesRef);
    }

    return undefined;
  }, [user, isStaffUser]);

  // Helper functions
  const getCurrentCourse = () => {
    return courseId ? courses[courseId] : null;
  };

  const getCourseById = (id) => {
    return courses[id] || null;
  };

  const getAllCourses = () => {
    return courses;
  };

  const getCoursesArray = () => {
    return Object.entries(courses).map(([id, course]) => ({
      id,
      ...course
    }));
  };

  const value = {
    // Original values
    courseId,
    userEmailKey,
    
    // New values and functions
    loading,
    error,
    courses,
    getCurrentCourse,
    getCourseById,
    getAllCourses,
    getCoursesArray
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom hook to use the course context
export const useCourse = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export default CourseProvider;