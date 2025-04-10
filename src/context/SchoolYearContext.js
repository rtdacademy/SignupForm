import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, onChildAdded, onChildChanged, onChildRemoved, query, orderByChild, equalTo } from 'firebase/database';
import { getSchoolYearOptions } from '../config/DropdownOptions';

const SchoolYearContext = createContext();

export const useSchoolYear = () => {
  const context = useContext(SchoolYearContext);
  if (!context) {
    throw new Error('useSchoolYear must be used within a SchoolYearProvider');
  }
  return context;
};

export const SchoolYearProvider = ({ children }) => {
  // Get the options from the configuration
  const schoolYearOptions = getSchoolYearOptions();
  
  // Find the default option (marked with isDefault: true)
  const defaultOption = schoolYearOptions.find(opt => opt.isDefault);
  const defaultYear = defaultOption?.value || schoolYearOptions[0]?.value || '';
  
  const [currentSchoolYear, setCurrentSchoolYear] = useState(() => {
    // Try to get saved year from localStorage or use default
    const savedYear = localStorage.getItem('currentSchoolYear');
    
    // Make sure the saved year exists in our options, otherwise use default
    if (savedYear && schoolYearOptions.some(opt => opt.value === savedYear)) {
      return savedYear;
    }
    return defaultYear;
  });

  // State for student summaries
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // Save to localStorage when changed
  useEffect(() => {
    if (currentSchoolYear) {
      localStorage.setItem('currentSchoolYear', currentSchoolYear);
    }
  }, [currentSchoolYear]);

  // Fetch student summaries from Firebase based on current school year
  useEffect(() => {
    console.log('Setting up Firebase listeners for school year in context:', currentSchoolYear);
    setIsLoadingStudents(true);
    
    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');
    
    // Create a query filtered by school year
    const yearQuery = query(
      studentSummariesRef,
      orderByChild('School_x0020_Year_Value'),
      equalTo(currentSchoolYear)
    );

    // Listen for added students that match the current school year
    const handleChildAdded = (snapshot) => {
      const key = snapshot.key;
      const data = snapshot.val();
      const student = { ...data, id: key };
      
      setStudentSummaries((prevSummaries) => {
        // Check if this student is already in our list to avoid duplicates
        if (!prevSummaries.some(s => s.id === key)) {
          return [...prevSummaries, student];
        }
        return prevSummaries;
      });
      setIsLoadingStudents(false);
    };

    // For changes, listen to the entire collection
    // This helps catch updates where school year changes to/from our target year
    const handleChildChanged = (snapshot) => {
      const key = snapshot.key;
      const data = snapshot.val();
      
      if (data && data.School_x0020_Year_Value === currentSchoolYear) {
        // This student should be in our list
        const updatedStudent = { ...data, id: key };
        
        setStudentSummaries((prevSummaries) => {
          // If student is already in our list, update it
          if (prevSummaries.some(s => s.id === key)) {
            return prevSummaries.map((student) => 
              student.id === key ? updatedStudent : student
            );
          } 
          // If not in our list yet, add it
          else {
            return [...prevSummaries, updatedStudent];
          }
        });
      } else {
        // This student should NOT be in our list (school year doesn't match)
        setStudentSummaries((prevSummaries) =>
          prevSummaries.filter((student) => student.id !== key)
        );
      }
    };

    // For removals, listen to all removals that might affect our current view
    const handleChildRemoved = (snapshot) => {
      const key = snapshot.key;
      setStudentSummaries((prevSummaries) =>
        prevSummaries.filter((student) => student.id !== key)
      );
    };
  
    // Clear existing data when changing school year
    setStudentSummaries([]);
  
    // Attach listeners - child added uses the filtered query
    const unsubscribeChildAdded = onChildAdded(yearQuery, handleChildAdded);
    
    // Changes and removes should listen to the broader collection
    const unsubscribeChildChanged = onChildChanged(studentSummariesRef, handleChildChanged);
    const unsubscribeChildRemoved = onChildRemoved(studentSummariesRef, handleChildRemoved);
  
    return () => {
      unsubscribeChildAdded();
      unsubscribeChildChanged();
      unsubscribeChildRemoved();
    };
  }, [currentSchoolYear]);

  // Function to refresh student summaries if needed
  const refreshStudentSummaries = () => {
    setStudentSummaries([]);
    // The effect will handle re-fetching the data because we're clearing the array
  };

  const value = {
    currentSchoolYear,
    setCurrentSchoolYear,
    schoolYearOptions,
    studentSummaries,
    isLoadingStudents,
    refreshStudentSummaries
  };

  return (
    <SchoolYearContext.Provider value={value}>
      {children}
    </SchoolYearContext.Provider>
  );
};