import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDatabase, ref, get, set, onValue, serverTimestamp } from 'firebase/database';
import { httpsCallable, getFunctions } from 'firebase/functions';

const CourseProgressContext = createContext();

export const useProgress = () => useContext(CourseProgressContext);

export const ProgressProvider = ({ children, courseId }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [grades, setGrades] = useState({});
  const [gradebook, setGradebook] = useState({});
  
  const emailKey = currentUser?.email?.replace(/\./g, '_').replace(/@/g, ',');
  
  useEffect(() => {
    if (!emailKey || !courseId) return;
    
    const db = getDatabase();
    
    // Subscribe to legacy progress for backward compatibility
    const progressRef = ref(db, `students/${emailKey}/courses/${courseId}/progress`);
    const progressUnsubscribe = onValue(progressRef, (snapshot) => {
      const data = snapshot.val() || {};
      setProgress(data);
      setLoading(false);
    });
    
    // Subscribe to legacy gradebook for backward compatibility
    const gradesRef = ref(db, `students/${emailKey}/courses/${courseId}/gradebook`);
    const gradesUnsubscribe = onValue(gradesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setGrades(data);
    });
    
    // Subscribe to new comprehensive gradebook
    const gradebookRef = ref(db, `students/${emailKey}/courses/${courseId}/Gradebook`);
    const gradebookUnsubscribe = onValue(gradebookRef, (snapshot) => {
      const data = snapshot.val() || {};
      setGradebook(data);
      setLoading(false);
    });
    
    return () => {
      progressUnsubscribe();
      gradesUnsubscribe();
      gradebookUnsubscribe();
    };
  }, [emailKey, courseId]);
  
  // Track lesson access
  const trackLessonAccess = async (lessonId, lessonInfo = {}) => {
    if (!emailKey || !courseId || !lessonId) return;
    
    try {
      const functions = getFunctions();
      const trackLessonAccessFn = httpsCallable(functions, 'trackLessonAccess');
      
      await trackLessonAccessFn({
        courseId,
        lessonId,
        lessonInfo,
        studentEmail: currentUser?.email
      });
    } catch (error) {
      console.error('Error tracking lesson access:', error);
      // Fallback to legacy progress tracking
      const db = getDatabase();
      const itemRef = ref(db, `students/${emailKey}/courses/${courseId}/progress/${lessonId}`);
      
      await set(itemRef, {
        accessed: true,
        accessedAt: new Date().toISOString(),
        ...lessonInfo
      });
    }
  };
  
  // Mark a content item as completed (legacy support)
  const markCompleted = async (itemId) => {
    if (!emailKey || !courseId) return;
    
    const db = getDatabase();
    const itemRef = ref(db, `students/${emailKey}/courses/${courseId}/progress/${itemId}`);
    
    await set(itemRef, {
      completed: true,
      completedAt: new Date().toISOString()
    });
  };
  
  // Save grade for an assessment (legacy support)
  const saveGrade = async (itemId, score, feedback = '', attempts = 1) => {
    if (!emailKey || !courseId) return;
    
    const db = getDatabase();
    const gradeRef = ref(db, `students/${emailKey}/courses/${courseId}/gradebook/${itemId}`);
    
    await set(gradeRef, {
      score,
      attempts,
      feedback,
      completedAt: new Date().toISOString()
    });
  };
  
  // Calculate overall course progress percentage
  const calculateProgressPercentage = () => {
    // Try new gradebook first, then fall back to legacy
    if (gradebook.summary?.percentage !== undefined) {
      return gradebook.summary.percentage;
    }
    
    if (!progress || Object.keys(progress).length === 0) return 0;
    
    const totalItems = Object.keys(progress).length;
    const completedItems = Object.values(progress).filter(item => item.completed).length;
    
    return Math.round((completedItems / totalItems) * 100);
  };
  
  // Calculate overall grade
  const calculateOverallGrade = (courseDetails) => {
    // Try new gradebook first
    if (gradebook.summary?.percentage !== undefined) {
      return gradebook.summary.percentage;
    }
    
    // Fall back to legacy calculation
    if (!grades || Object.keys(grades).length === 0 || !courseDetails?.weights) return null;
    
    const weights = courseDetails.weights;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    // Calculate grade based on course weights and completed assessments
    Object.entries(grades).forEach(([itemId, gradeData]) => {
      // Find the assessment in course structure
      let itemType = null;
      let itemWeight = 0;
      
      if (courseDetails.units) {
        courseDetails.units.forEach(unit => {
          if (unit.items) {
            unit.items.forEach(item => {
              if (item.itemId === itemId) {
                itemType = item.type;
                itemWeight = item.weight || 0;
              }
            });
          }
        });
      }
      
      if (itemType && weights[itemType]) {
        const typeWeight = weights[itemType];
        totalWeightedScore += (gradeData.score / 100) * itemWeight * typeWeight;
        totalWeight += itemWeight * typeWeight;
      }
    });
    
    if (totalWeight === 0) return null;
    
    return Math.round((totalWeightedScore / totalWeight) * 100);
  };
  
  const value = {
    loading,
    progress,
    grades,
    gradebook,
    trackLessonAccess,
    markCompleted,
    saveGrade,
    calculateProgressPercentage,
    calculateOverallGrade
  };
  
  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  );
};

export default CourseProgressContext;