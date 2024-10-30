// src/context/CourseContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courseId, setCourseId] = useState(null);
  const [userEmailKey, setUserEmailKey] = useState(null);
  const location = useLocation();
  const { user } = useAuth();

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
      console.log('Core identifiers:', {
        userEmailKey: emailKey,
        courseId
      });
    }
  }, [user, courseId]);

  const value = {
    courseId,
    userEmailKey
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