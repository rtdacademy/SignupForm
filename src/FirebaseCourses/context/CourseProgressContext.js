import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDatabase, ref, get, set, onValue } from 'firebase/database';

const CourseProgressContext = createContext();

export const useProgress = () => useContext(CourseProgressContext);

export const ProgressProvider = ({ children, courseId }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [grades, setGrades] = useState({});
  
  const emailKey = currentUser?.email?.replace(/\./g, '_');
  
  useEffect(() => {
    if (!emailKey || !courseId) return;
    
    const db = getDatabase();
    const progressRef = ref(db, `students/${emailKey}/courses/${courseId}/progress`);
    const gradesRef = ref(db, `students/${emailKey}/courses/${courseId}/gradebook`);
    
    // Subscribe to progress changes
    const progressUnsubscribe = onValue(progressRef, (snapshot) => {
      const data = snapshot.val() || {};
      setProgress(data);
      setLoading(false);
    });
    
    // Subscribe to grades changes
    const gradesUnsubscribe = onValue(gradesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setGrades(data);
    });
    
    return () => {
      progressUnsubscribe();
      gradesUnsubscribe();
    };
  }, [emailKey, courseId]);
  
  // Mark a content item as completed
  const markCompleted = async (itemId) => {
    if (!emailKey || !courseId) return;
    
    const db = getDatabase();
    const itemRef = ref(db, `students/${emailKey}/courses/${courseId}/progress/${itemId}`);
    
    await set(itemRef, {
      completed: true,
      completedAt: new Date().toISOString()
    });
  };
  
  // Save grade for an assessment
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
    if (!progress || Object.keys(progress).length === 0) return 0;
    
    const totalItems = Object.keys(progress).length;
    const completedItems = Object.values(progress).filter(item => item.completed).length;
    
    return Math.round((completedItems / totalItems) * 100);
  };
  
  // Calculate overall grade
  const calculateOverallGrade = (courseDetails) => {
    if (!grades || Object.keys(grades).length === 0 || !courseDetails?.weights) return null;
    
    const weights = courseDetails.weights;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    // Calculate grade based on course weights and completed assessments
    Object.entries(grades).forEach(([itemId, gradeData]) => {
      // Find the assessment in course structure
      let itemType = null;
      let itemWeight = 0;
      
      courseDetails.units.forEach(unit => {
        unit.items.forEach(item => {
          if (item.itemId === itemId) {
            itemType = item.type;
            itemWeight = item.weight || 0;
          }
        });
      });
      
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