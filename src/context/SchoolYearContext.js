import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, off } from 'firebase/database';
import { getSchoolYearOptions } from '../config/DropdownOptions';
import { useAuth } from './AuthContext';

const SchoolYearContext = createContext();

export const useSchoolYear = () => {
  const context = useContext(SchoolYearContext);
  if (!context) {
    throw new Error('useSchoolYear must be used within a SchoolYearProvider');
  }
  return context;
};

export const SchoolYearProvider = ({ children }) => {
  const { isStaffUser } = useAuth();
  
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

  // Add a refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State for student summaries and PASI records
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [pasiRecords, setPasiRecords] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingPasi, setIsLoadingPasi] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage when changed
  useEffect(() => {
    if (currentSchoolYear) {
      localStorage.setItem('currentSchoolYear', currentSchoolYear);
    }
  }, [currentSchoolYear]);

  // Fetch student summaries from Firebase based on current school year
  useEffect(() => {
    console.log('Setting up Firebase listeners for school year:', currentSchoolYear);
    setIsLoadingStudents(true);
    
    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');
    
    // Create a query filtered by school year
    const yearQuery = query(
      studentSummariesRef,
      orderByChild('School_x0020_Year_Value'),
      equalTo(currentSchoolYear)
    );

    // Listen for any changes to the entire filtered query
    const unsubscribe = onValue(yearQuery, (snapshot) => {
      const students = [];
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        students.push({ ...data, id: key });
      });
      
      setStudentSummaries(students);
      setIsLoadingStudents(false);
    }, (error) => {
      console.error("Error fetching student summaries:", error);
      setError(error.message);
      setIsLoadingStudents(false);
    });
    
    return () => unsubscribe();
  }, [currentSchoolYear, refreshTrigger]); // Add refreshTrigger as dependency

  // Fetch PASI records for staff users
  useEffect(() => {
    if (!isStaffUser || !currentSchoolYear) {
      setIsLoadingPasi(false);
      setPasiRecords([]); // Clear records if not fetching
      return;
    }

    console.log('Fetching PASI records for', currentSchoolYear);
    setIsLoadingPasi(true);
    const db = getDatabase();

    // Format the currentSchoolYear (e.g., "2023/2024") to "YY_YY" (e.g., "23_24")
    const yearParts = currentSchoolYear.split('/');
    let formattedYear = '';
    if (yearParts.length === 2 && yearParts[0].length >= 2 && yearParts[1].length >= 2) {
      formattedYear = `${yearParts[0].slice(-2)}_${yearParts[1].slice(-2)}`;
      console.log('Formatted school year for PASI query:', formattedYear);
    } else {
      console.error('Invalid currentSchoolYear format:', currentSchoolYear);
      setError('Invalid school year format for PASI query.');
      setIsLoadingPasi(false);
      setPasiRecords([]);
      return; // Stop if format is invalid
    }
    
    const pasiRef = ref(db, 'pasiRecords');
    // Query using the correctly formatted year
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear) // Use the formatted year here
    );
    
    const unsubscribe = onValue(schoolYearQuery, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          console.log('No PASI records found for', formattedYear);
          setPasiRecords([]);
          // No error needed here, just no data
        } else {
          const records = [];
          snapshot.forEach((child) => {
            const record = child.val();
            records.push({
              id: child.key,
              linked: Boolean(record.linked), // Convert to boolean
              ...record
            });
          });
      
          console.log(`Found ${records.length} PASI records for ${formattedYear}`);
          // Sort records after fetching and processing
          setPasiRecords(records.sort((a, b) => a.studentName.localeCompare(b.studentName)));
        }
      } catch (err) {
        console.error("Error processing PASI records:", err);
        setError(err.message);
        setPasiRecords([]); // Clear records on error
      } finally {
        setIsLoadingPasi(false);
      }
    }, (error) => {
      console.error("Database error fetching PASI records:", error);
      setError(error.message);
      setPasiRecords([]); // Clear records on error
      setIsLoadingPasi(false);
    });
    
    // Cleanup function to detach the listener
    return () => {
      console.log('Detaching PASI listener for', formattedYear);
      off(schoolYearQuery);
    };
  }, [isStaffUser, currentSchoolYear, refreshTrigger]); // Dependencies remain the same

  // Combine the student summaries with PASI records
  const pasiStudentSummariesCombined = useMemo(() => {
    // If we're not a staff user or don't have PASI records, just return the basic summaries
    if (!isStaffUser || pasiRecords.length === 0) {
      console.log('Using student summaries, not combining with PASI data');
      return studentSummaries;
    }

    console.log(`Combining ${studentSummaries.length} student summaries with ${pasiRecords.length} PASI records`);

    // Create a map of student summaries for efficient lookups
    const summaryMap = {};
    studentSummaries.forEach(summary => {
      if (summary.id) {
        summaryMap[summary.id] = summary;
      }
    });

    // Combine PASI records with student summaries
    const combined = pasiRecords.map(record => {
      // Rename 'term' to 'pasiTerm' for each record
      const { term, ...restRecord } = record;
      const recordWithRenamedTerm = {
        ...restRecord,
        pasiTerm: term  // Rename term to pasiTerm
      };
      
      // Get summary data if available
      const summary = record.summaryKey && summaryMap[record.summaryKey] 
        ? summaryMap[record.summaryKey] 
        : null;
      
      // If no summary exists, just return the record with renamed term
      if (!summary) {
        return {
          ...recordWithRenamedTerm,
          CourseID: null,
          Status_Value: null,
          StudentType_Value: null,
          ActiveFutureArchived_Value: 'Not Set',
          Term: null
        };
      }
      
      // Return combined object, ensuring record.id takes precedence
      return {
        ...summary, // Spread summary first
        ...recordWithRenamedTerm // Spread record second, its id will overwrite summary's id
      };
    });

    console.log(`Combined data has ${combined.length} records`);
    return combined;
  }, [studentSummaries, pasiRecords, isStaffUser]);

  // NEW: PASI records that don't have a matching student summary
  const unlinkedPasiRecords = useMemo(() => {
    if (!isStaffUser || pasiRecords.length === 0) {
      return [];
    }
    
    // Create a set of all summary IDs for efficient lookup
    const summaryIdSet = new Set(studentSummaries.map(summary => summary.id));
    
    // Filter PASI records that don't have a matching student summary
    return pasiRecords
      .filter(record => !record.summaryKey || !summaryIdSet.has(record.summaryKey))
      .map(record => {
        // Rename term to pasiTerm for consistency with combined records
        const { term, ...rest } = record;
        return {
          ...rest,
          pasiTerm: term
        };
      });
  }, [studentSummaries, pasiRecords, isStaffUser]);

  // NEW: Student summaries that don't have a matching PASI record
  const unmatchedStudentSummaries = useMemo(() => {
    if (!isStaffUser || studentSummaries.length === 0) {
      return [];
    }
    
    // Create a set of all summaryKeys from PASI records for efficient lookup
    const pasiSummaryKeySet = new Set(
      pasiRecords
        .filter(record => record.summaryKey)
        .map(record => record.summaryKey)
    );
    
    // Filter student summaries that don't have a matching PASI record
    return studentSummaries.filter(summary => 
      summary.id && !pasiSummaryKeySet.has(summary.id)
    );
  }, [studentSummaries, pasiRecords, isStaffUser]);

  // Function to refresh student summaries if needed
  const refreshStudentSummaries = useCallback(() => {
    console.log("Refreshing student summaries and PASI records");
    // Increment the refresh trigger to force re-fetching data
    setRefreshTrigger(prev => prev + 1);
    // Optional: Clear existing data while refreshing
    setStudentSummaries([]);
    if (isStaffUser) {
      setPasiRecords([]);
    }
    setIsLoadingStudents(true);
  }, [isStaffUser]);

  const value = {
    currentSchoolYear,
    setCurrentSchoolYear,
    schoolYearOptions,
    studentSummaries,
    pasiStudentSummariesCombined,
    // NEW: Add the two new lists to the context value
    unlinkedPasiRecords,
    unmatchedStudentSummaries,
    isLoadingStudents: isLoadingStudents || isLoadingPasi,
    refreshStudentSummaries,
    // For debugging or special cases
    pasiRecords,
    error
  };

  return (
    <SchoolYearContext.Provider value={value}>
      {children}
    </SchoolYearContext.Provider>
  );
};

export default SchoolYearProvider;