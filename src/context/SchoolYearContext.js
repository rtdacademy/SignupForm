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
  
    const handleChildAdded = (snapshot) => {
      const key = snapshot.key;
      const data = snapshot.val();
      const student = { ...data, id: key };
      
      setStudentSummaries((prevSummaries) => [...prevSummaries, student]);
      setIsLoadingStudents(false);
    };
  
    const handleChildChanged = (snapshot) => {
      const key = snapshot.key;
      const data = snapshot.val();
      const updatedStudent = { ...data, id: key };
  
      setStudentSummaries((prevSummaries) =>
        prevSummaries.map((student) => 
          student.id === key ? updatedStudent : student
        )
      );
    };
  
    const handleChildRemoved = (snapshot) => {
      const key = snapshot.key;
      setStudentSummaries((prevSummaries) =>
        prevSummaries.filter((student) => student.id !== key)
      );
    };
  
    // Clear existing data when changing school year
    setStudentSummaries([]);
  
    // Attach the listeners to the filtered query
    const unsubscribeChildAdded = onChildAdded(yearQuery, handleChildAdded);
    const unsubscribeChildChanged = onChildChanged(yearQuery, handleChildChanged);
    const unsubscribeChildRemoved = onChildRemoved(yearQuery, handleChildRemoved);
  
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