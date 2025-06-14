import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, off } from 'firebase/database';
import { getSchoolYearOptions } from '../config/DropdownOptions';
import { useAuth } from './AuthContext';
import { useUserPreferences } from './UserPreferencesContext';

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
  const { preferences, updateSchoolYearPreferences } = useUserPreferences();

  // Get the options from the configuration
  const schoolYearOptions = getSchoolYearOptions();
  const defaultOption = schoolYearOptions.find(opt => opt.isDefault);
  const defaultYear = defaultOption?.value || schoolYearOptions[0]?.value || '';

  const [currentSchoolYear, setCurrentSchoolYear] = useState(() => {
    const savedYear = localStorage.getItem('currentSchoolYear');
    if (savedYear && schoolYearOptions.some(opt => opt.value === savedYear)) {
      return savedYear;
    }
    return defaultYear;
  });

  // Include next year checkbox state - use preferences if available
  const [includeNextYear, setIncludeNextYear] = useState(false);

  // Include previous year checkbox state - use preferences if available
  const [includePreviousYear, setIncludePreviousYear] = useState(false);

  // Initialize states from preferences once they're loaded
  useEffect(() => {
    if (preferences?.schoolYear) {
      setIncludeNextYear(Boolean(preferences.schoolYear.includeNextYear));
      setIncludePreviousYear(Boolean(preferences.schoolYear.includePreviousYear));
    } else {
      // Fallback to localStorage for backward compatibility
      const savedNext = localStorage.getItem('includeNextYear');
      const savedPrevious = localStorage.getItem('includePreviousYear');
      setIncludeNextYear(savedNext === 'true');
      setIncludePreviousYear(savedPrevious === 'true');
    }
  }, [preferences]);

  // Refresh trigger for re-fetching
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State for fetched data
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [pasiRecords, setPasiRecords] = useState([]);
  const [asnsRecords, setAsnsRecords] = useState([]);

  // State for next year data
  const [nextYearStudentSummaries, setNextYearStudentSummaries] = useState([]);
  const [nextYearPasiRecords, setNextYearPasiRecords] = useState([]);

  // State for previous year data
  const [previousYearStudentSummaries, setPreviousYearStudentSummaries] = useState([]);
  const [previousYearPasiRecords, setPreviousYearPasiRecords] = useState([]);

  // State for record counts
  const [recordCounts, setRecordCounts] = useState({
    current: 0,
    next: 0,
    previous: 0,
    total: 0
  });

  // Loading and error states - initialize to false to avoid showing loading when not authenticated
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingPasi, setIsLoadingPasi] = useState(false);
  const [isLoadingAsns, setIsLoadingAsns] = useState(false);
  const [isLoadingNextYear, setIsLoadingNextYear] = useState(false);
  const [isLoadingPreviousYear, setIsLoadingPreviousYear] = useState(false);
  const [error, setError] = useState(null);

  // Persist current year preference
  useEffect(() => {
    if (currentSchoolYear) {
      localStorage.setItem('currentSchoolYear', currentSchoolYear);
    }
  }, [currentSchoolYear]);

  // Create custom setters that handle both local state and preferences
  const setIncludeNextYearWithPersistence = useCallback(async (value) => {
    setIncludeNextYear(value);
    
    // Persist to localStorage immediately
    localStorage.setItem('includeNextYear', value.toString());
    
    // Persist to preferences if available
    if (updateSchoolYearPreferences && preferences) {
      try {
        await updateSchoolYearPreferences({ includeNextYear: value });
      } catch (error) {
        console.error('Failed to save includeNextYear preference:', error);
      }
    }
  }, [updateSchoolYearPreferences, preferences]);

  const setIncludePreviousYearWithPersistence = useCallback(async (value) => {
    setIncludePreviousYear(value);
    
    // Persist to localStorage immediately
    localStorage.setItem('includePreviousYear', value.toString());
    
    // Persist to preferences if available
    if (updateSchoolYearPreferences && preferences) {
      try {
        await updateSchoolYearPreferences({ includePreviousYear: value });
      } catch (error) {
        console.error('Failed to save includePreviousYear preference:', error);
      }
    }
  }, [updateSchoolYearPreferences, preferences]);

  // Helper function to calculate next school year
  const getNextSchoolYear = useCallback((year) => {
    // Handle both formats: "2024/2025" and "24/25"
    const fullYearMatch = year.match(/^(\d{4})\/(\d{4})$/);
    const shortYearMatch = year.match(/^(\d{2})\/(\d{2})$/);
    
    if (fullYearMatch) {
      const startYear = parseInt(fullYearMatch[1]);
      const endYear = parseInt(fullYearMatch[2]);
      return `${startYear + 1}/${endYear + 1}`;
    } else if (shortYearMatch) {
      const startYear = parseInt(shortYearMatch[1]);
      const endYear = parseInt(shortYearMatch[2]);
      // Convert to full year by adding 2000
      const fullStartYear = 2000 + startYear;
      const fullEndYear = 2000 + endYear;
      // Return in the same short format
      return `${(fullStartYear + 1).toString().slice(-2)}/${(fullEndYear + 1).toString().slice(-2)}`;
    }
    
    return null;
  }, []);

  // Helper function to calculate previous school year
  const getPreviousSchoolYear = useCallback((year) => {
    // Handle both formats: "2024/2025" and "24/25"
    const fullYearMatch = year.match(/^(\d{4})\/(\d{4})$/);
    const shortYearMatch = year.match(/^(\d{2})\/(\d{2})$/);
    
    if (fullYearMatch) {
      const startYear = parseInt(fullYearMatch[1]);
      const endYear = parseInt(fullYearMatch[2]);
      return `${startYear - 1}/${endYear - 1}`;
    } else if (shortYearMatch) {
      const startYear = parseInt(shortYearMatch[1]);
      const endYear = parseInt(shortYearMatch[2]);
      // Convert to full year by adding 2000
      const fullStartYear = 2000 + startYear;
      const fullEndYear = 2000 + endYear;
      // Return in the same short format
      return `${(fullStartYear - 1).toString().slice(-2)}/${(fullEndYear - 1).toString().slice(-2)}`;
    }
    
    return null;
  }, []);

  // Update record counts whenever data changes (only count studentSummaries)
  useEffect(() => {
    const currentCount = studentSummaries.length;
    const nextCount = nextYearStudentSummaries.length;
    const previousCount = previousYearStudentSummaries.length;
    const totalCount = currentCount + nextCount + previousCount;

    setRecordCounts({
      current: currentCount,
      next: nextCount,
      previous: previousCount,
      total: totalCount
    });
  }, [
    studentSummaries,
    nextYearStudentSummaries,
    previousYearStudentSummaries
  ]);

  // Fetch student summaries - only when user is authenticated and staff
  useEffect(() => {
    // Skip if not a staff user to prevent permission errors
    if (!isStaffUser) {
      setIsLoadingStudents(false);
      setStudentSummaries([]);
      return;
    }
    
    console.log('Setting up Firebase listeners for school year:', currentSchoolYear);
    setIsLoadingStudents(true);
    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');
    const yearQuery = query(
      studentSummariesRef,
      orderByChild('School_x0020_Year_Value'),
      equalTo(currentSchoolYear)
    );

    const unsubscribe = onValue(yearQuery, snapshot => {
      const students = [];
      snapshot.forEach(childSnapshot => {
        students.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setStudentSummaries(students);
      setIsLoadingStudents(false);
    }, error => {
      console.error('Error fetching student summaries:', error);
      setError(error.message);
      setIsLoadingStudents(false);
    });

    return () => unsubscribe();
  }, [isStaffUser, currentSchoolYear, refreshTrigger]);

  // Fetch next year student summaries when checkbox is checked
  useEffect(() => {
    if (!isStaffUser || !includeNextYear || !currentSchoolYear) {
      setNextYearStudentSummaries([]);
      setIsLoadingNextYear(false);
      return;
    }

    const nextYear = getNextSchoolYear(currentSchoolYear);
    if (!nextYear) {
      console.error('Could not calculate next school year from:', currentSchoolYear);
      return;
    }

    console.log('Setting up Firebase listeners for next school year:', nextYear);
    setIsLoadingNextYear(true);
    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');
    const yearQuery = query(
      studentSummariesRef,
      orderByChild('School_x0020_Year_Value'),
      equalTo(nextYear)
    );

    const unsubscribe = onValue(yearQuery, snapshot => {
      const students = [];
      snapshot.forEach(childSnapshot => {
        students.push({ 
          id: childSnapshot.key, 
          ...childSnapshot.val(),
          _isNextYear: true  // Mark as next year data for filtering/display
        });
      });
      setNextYearStudentSummaries(students);
      setIsLoadingNextYear(false);
    }, error => {
      console.error('Error fetching next year student summaries:', error);
      setError(error.message);
      setIsLoadingNextYear(false);
    });

    return () => unsubscribe();
  }, [isStaffUser, includeNextYear, currentSchoolYear, refreshTrigger, getNextSchoolYear]);

  // Fetch previous year student summaries when checkbox is checked
  useEffect(() => {
    if (!isStaffUser || !includePreviousYear || !currentSchoolYear) {
      setPreviousYearStudentSummaries([]);
      setIsLoadingPreviousYear(false);
      return;
    }

    const previousYear = getPreviousSchoolYear(currentSchoolYear);
    if (!previousYear) {
      console.error('Could not calculate previous school year from:', currentSchoolYear);
      return;
    }

    console.log('Setting up Firebase listeners for previous school year:', previousYear);
    setIsLoadingPreviousYear(true);
    const db = getDatabase();
    const studentSummariesRef = ref(db, 'studentCourseSummaries');
    const yearQuery = query(
      studentSummariesRef,
      orderByChild('School_x0020_Year_Value'),
      equalTo(previousYear)
    );

    const unsubscribe = onValue(yearQuery, snapshot => {
      const students = [];
      snapshot.forEach(childSnapshot => {
        students.push({ 
          id: childSnapshot.key, 
          ...childSnapshot.val(),
          _isPreviousYear: true  // Mark as previous year data for filtering/display
        });
      });
      setPreviousYearStudentSummaries(students);
      setIsLoadingPreviousYear(false);
    }, error => {
      console.error('Error fetching previous year student summaries:', error);
      setError(error.message);
      setIsLoadingPreviousYear(false);
    });

    return () => unsubscribe();
  }, [isStaffUser, includePreviousYear, currentSchoolYear, refreshTrigger, getPreviousSchoolYear]);

  // Fetch PASI records from new pasiRecordsNew structure
  useEffect(() => {
    if (!isStaffUser || !currentSchoolYear) {
      setIsLoadingPasi(false);
      setPasiRecords([]);
      return;
    }

    console.log('Fetching PASI records for', currentSchoolYear);
    setIsLoadingPasi(true);
    const db = getDatabase();

    // Format year, e.g., "2023/2024" -> "23_24"
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
      return;
    }

    // Use new pasiRecordsNew structure - direct node access
    const pasiRef = ref(db, `pasiRecordsNew/${formattedYear}`);
    
    const unsubscribe = onValue(pasiRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          console.log(`No PASI records found for year ${formattedYear}`);
          setPasiRecords([]);
          setIsLoadingPasi(false);
          return;
        }
        
        const records = [];
        snapshot.forEach(child => {
          const record = child.val();
          const recordId = child.key;
          records.push({ id: recordId, ...record });
        });
        
        console.log(`Loaded ${records.length} PASI records for ${formattedYear}`);
        
        // Sort by student name for consistency
        const sortedRecords = records.sort((a, b) => {
          if (a.studentName && b.studentName) {
            return a.studentName.localeCompare(b.studentName);
          }
          return a.id.localeCompare(b.id);
        });
        
        setPasiRecords(sortedRecords);
        setIsLoadingPasi(false);
      } catch (err) {
        console.error('Error processing PASI records:', err);
        setError(err.message);
        setPasiRecords([]);
        setIsLoadingPasi(false);
      }
    }, error => {
      console.error('Database error fetching PASI records:', error);
      setError(error.message);
      setPasiRecords([]);
      setIsLoadingPasi(false);
    });

    return () => unsubscribe();
  }, [isStaffUser, currentSchoolYear, refreshTrigger]);

  // Fetch next year PASI records when checkbox is checked
  useEffect(() => {
    if (!isStaffUser || !includeNextYear || !currentSchoolYear) {
      setNextYearPasiRecords([]);
      return;
    }

    const nextYear = getNextSchoolYear(currentSchoolYear);
    if (!nextYear) return;

    console.log('Fetching next year PASI records for', nextYear);
    const db = getDatabase();

    // Format next year, e.g., "2024/2025" -> "24_25"
    const yearParts = nextYear.split('/');
    let formattedYear = '';
    if (yearParts.length === 2 && yearParts[0].length >= 2 && yearParts[1].length >= 2) {
      formattedYear = `${yearParts[0].slice(-2)}_${yearParts[1].slice(-2)}`;
    } else {
      console.error('Invalid nextYear format:', nextYear);
      return;
    }

    // Use new pasiRecordsNew structure - direct node access
    const pasiRef = ref(db, `pasiRecordsNew/${formattedYear}`);
    
    const unsubscribe = onValue(pasiRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          console.log(`No next year PASI records found for year ${formattedYear}`);
          setNextYearPasiRecords([]);
          return;
        }
        
        const records = [];
        snapshot.forEach(child => {
          const record = child.val();
          const recordId = child.key;
          records.push({ id: recordId, ...record, _isNextYear: true });
        });
        
        console.log(`Loaded ${records.length} next year PASI records for ${formattedYear}`);
        
        // Sort by student name for consistency
        const sortedRecords = records.sort((a, b) => {
          if (a.studentName && b.studentName) {
            return a.studentName.localeCompare(b.studentName);
          }
          return a.id.localeCompare(b.id);
        });
        
        setNextYearPasiRecords(sortedRecords);
      } catch (err) {
        console.error('Error processing next year PASI records:', err);
        setNextYearPasiRecords([]);
      }
    });

    return () => unsubscribe();
  }, [isStaffUser, includeNextYear, currentSchoolYear, refreshTrigger, getNextSchoolYear]);

  // Fetch previous year PASI records when checkbox is checked
  useEffect(() => {
    if (!isStaffUser || !includePreviousYear || !currentSchoolYear) {
      setPreviousYearPasiRecords([]);
      return;
    }

    const previousYear = getPreviousSchoolYear(currentSchoolYear);
    if (!previousYear) return;

    console.log('Fetching previous year PASI records for', previousYear);
    const db = getDatabase();

    // Format previous year, e.g., "2023/2024" -> "23_24"
    const yearParts = previousYear.split('/');
    let formattedYear = '';
    if (yearParts.length === 2 && yearParts[0].length >= 2 && yearParts[1].length >= 2) {
      formattedYear = `${yearParts[0].slice(-2)}_${yearParts[1].slice(-2)}`;
    } else {
      console.error('Invalid previousYear format:', previousYear);
      return;
    }

    // Use new pasiRecordsNew structure - direct node access
    const pasiRef = ref(db, `pasiRecordsNew/${formattedYear}`);
    
    const unsubscribe = onValue(pasiRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          console.log(`No previous year PASI records found for year ${formattedYear}`);
          setPreviousYearPasiRecords([]);
          return;
        }
        
        const records = [];
        snapshot.forEach(child => {
          const record = child.val();
          const recordId = child.key;
          records.push({ id: recordId, ...record, _isPreviousYear: true });
        });
        
        console.log(`Loaded ${records.length} previous year PASI records for ${formattedYear}`);
        
        // Sort by student name for consistency
        const sortedRecords = records.sort((a, b) => {
          if (a.studentName && b.studentName) {
            return a.studentName.localeCompare(b.studentName);
          }
          return a.id.localeCompare(b.id);
        });
        
        setPreviousYearPasiRecords(sortedRecords);
      } catch (err) {
        console.error('Error processing previous year PASI records:', err);
        setPreviousYearPasiRecords([]);
      }
    });

    return () => unsubscribe();
  }, [isStaffUser, includePreviousYear, currentSchoolYear, refreshTrigger, getPreviousSchoolYear]);

  // Fetch ASNs node - only for staff users
  useEffect(() => {
    // Skip if not a staff user to avoid permission errors
    if (!isStaffUser) {
      setIsLoadingAsns(false);
      setAsnsRecords([]);
      return;
    }
    
    console.log('Fetching ASNs records for staff user');
    setIsLoadingAsns(true);
    const db = getDatabase();
    const asnsRef = ref(db, 'ASNs');
    const unsubscribe = onValue(asnsRef, snapshot => {
      const records = [];
      snapshot.forEach(child => {
        records.push({ id: child.key, ...child.val() });
      });
      setAsnsRecords(records);
      setIsLoadingAsns(false);
    }, error => {
      console.error('Error fetching ASNs records:', error);
      setError(error.message);
      setIsLoadingAsns(false);
    });
    return () => unsubscribe();
  }, [isStaffUser, refreshTrigger]);

  // Helper function to get the latest PASI record by exitDate
  const getLatestPasiRecord = useCallback((pasiRecords) => {
    if (!pasiRecords || pasiRecords.length === 0) return null;
    if (pasiRecords.length === 1) return pasiRecords[0];
    
    // Sort by exitDate (newest first), then by assignmentDate if exitDate is same
    return pasiRecords.sort((a, b) => {
      const dateA = a.exitDate ? new Date(a.exitDate) : new Date(0);
      const dateB = b.exitDate ? new Date(b.exitDate) : new Date(0);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime(); // Newest first
      }
      
      // If exitDate is same, use assignmentDate
      const assignA = a.assignmentDate ? new Date(a.assignmentDate) : new Date(0);
      const assignB = b.assignmentDate ? new Date(b.assignmentDate) : new Date(0);
      
      return assignB.getTime() - assignA.getTime(); // Newest first
    })[0];
  }, []);

  // Helper function to match PASI records to student summaries using ASN and courseId
  const matchPasiToStudentSummary = useCallback((pasiRecords, studentSummaries) => {
    const results = [];
    
    // Create a map of student summaries by ASN + courseId for quick lookup
    const summaryMap = new Map();
    studentSummaries.forEach(summary => {
      if (summary.ASN && summary.CourseID) {
        const key = `${summary.ASN}_${summary.CourseID}`;
        summaryMap.set(key, summary);
      }
    });
    
    // Group PASI records by ASN + courseId
    const pasiGrouped = new Map();
    pasiRecords.forEach(record => {
      if (record.asn && record.courseId) {
        const key = `${record.asn}_${record.courseId}`;
        if (!pasiGrouped.has(key)) {
          pasiGrouped.set(key, []);
        }
        pasiGrouped.get(key).push(record);
      }
    });
    
    // For each student summary, find matching PASI records
    studentSummaries.forEach(summary => {
      if (!summary.ASN || !summary.CourseID) {
        // No ASN or CourseID, can't match - add summary without PASI data
        results.push(summary);
        return;
      }
      
      const key = `${summary.ASN}_${summary.CourseID}`;
      const matchingPasiRecords = pasiGrouped.get(key) || [];
      
      if (matchingPasiRecords.length === 0) {
        // No matching PASI records - add summary without PASI data
        results.push(summary);
      } else {
        // Get the latest PASI record for this ASN + courseId combination
        const latestPasiRecord = getLatestPasiRecord(matchingPasiRecords);
        
        // Merge student summary with latest PASI record
        const { term, ...restRecord } = latestPasiRecord;
        const merged = {
          ...summary, // Student summary data first
          ...restRecord, // PASI record data second (overwrites conflicts)
          pasiTerm: term, // Rename term to avoid conflicts
          pasiRecordCount: matchingPasiRecords.length // Show how many PASI records exist
        };
        
        results.push(merged);
      }
      
      // Remove processed PASI records from the map
      pasiGrouped.delete(key);
    });
    
    // Add any remaining unmatched PASI records (no corresponding student summary)
    pasiGrouped.forEach(pasiRecords => {
      pasiRecords.forEach(record => {
        const { term, ...restRecord } = record;
        results.push({
          ...restRecord,
          pasiTerm: term,
          // Add placeholder student summary fields for unmatched PASI records
          CourseID: record.courseId,
          Status_Value: null,
          StudentType_Value: null,
          ActiveFutureArchived_Value: 'Not Set',
          Term: null,
          pasiRecordCount: 1
        });
      });
    });
    
    return results;
  }, [getLatestPasiRecord]);

  // Combine PASI & summaries with optional next/previous year data
  const pasiStudentSummariesCombined = useMemo(() => {
    // Merge all selected year data
    let allStudentSummaries = [...studentSummaries];
    let allPasiRecords = [...pasiRecords];
    
    if (includeNextYear) {
      allStudentSummaries = [...allStudentSummaries, ...nextYearStudentSummaries];
      allPasiRecords = [...allPasiRecords, ...nextYearPasiRecords];
    }
    
    if (includePreviousYear) {
      allStudentSummaries = [...allStudentSummaries, ...previousYearStudentSummaries];
      allPasiRecords = [...allPasiRecords, ...previousYearPasiRecords];
    }
    
    if (!isStaffUser) {
      return allStudentSummaries;
    }
    
    // Use new simplified matching logic
    return matchPasiToStudentSummary(allPasiRecords, allStudentSummaries);
  }, [studentSummaries, pasiRecords, nextYearStudentSummaries, nextYearPasiRecords, previousYearStudentSummaries, previousYearPasiRecords, includeNextYear, includePreviousYear, isStaffUser, matchPasiToStudentSummary]);

  // Other derived lists (unlinked, unmatched, duplicates)
  const unlinkedPasiRecords = useMemo(() => {
    let allPasiRecords = [...pasiRecords];
    let allStudentSummaries = [...studentSummaries];
    
    if (includeNextYear) {
      allPasiRecords = [...allPasiRecords, ...nextYearPasiRecords];
      allStudentSummaries = [...allStudentSummaries, ...nextYearStudentSummaries];
    }
    
    if (includePreviousYear) {
      allPasiRecords = [...allPasiRecords, ...previousYearPasiRecords];
      allStudentSummaries = [...allStudentSummaries, ...previousYearStudentSummaries];
    }
      
    if (!isStaffUser || allPasiRecords.length === 0) return [];
    
    // Create a set of ASN + courseId combinations that exist in student summaries
    const studentKeys = new Set();
    allStudentSummaries.forEach(summary => {
      if (summary.ASN && summary.CourseID) {
        studentKeys.add(`${summary.ASN}_${summary.CourseID}`);
      }
    });
    
    // Filter PASI records that don't have matching student summaries
    return allPasiRecords.filter(record => {
      if (!record.asn || !record.courseId) return true; // Include if missing ASN or courseId
      const key = `${record.asn}_${record.courseId}`;
      return !studentKeys.has(key);
    }).map(record => {
      const { term, ...rest } = record;
      return { ...rest, pasiTerm: term };
    });
  }, [pasiRecords, nextYearPasiRecords, previousYearPasiRecords, studentSummaries, nextYearStudentSummaries, previousYearStudentSummaries, includeNextYear, includePreviousYear, isStaffUser]);

  const unmatchedStudentSummaries = useMemo(() => {
    let allStudentSummaries = [...studentSummaries];
    let allPasiRecords = [...pasiRecords];
    
    if (includeNextYear) {
      allStudentSummaries = [...allStudentSummaries, ...nextYearStudentSummaries];
      allPasiRecords = [...allPasiRecords, ...nextYearPasiRecords];
    }
    
    if (includePreviousYear) {
      allStudentSummaries = [...allStudentSummaries, ...previousYearStudentSummaries];
      allPasiRecords = [...allPasiRecords, ...previousYearPasiRecords];
    }
      
    if (!isStaffUser || allStudentSummaries.length === 0) return [];
    
    // Create a set of ASN + courseId combinations that exist in PASI records
    const pasiKeys = new Set();
    allPasiRecords.forEach(record => {
      if (record.asn && record.courseId) {
        pasiKeys.add(`${record.asn}_${record.courseId}`);
      }
    });
    
    // Filter student summaries that don't have matching PASI records
    return allStudentSummaries.filter(summary => {
      if (!summary.ASN || !summary.CourseID) return true; // Include if missing ASN or courseId
      const key = `${summary.ASN}_${summary.CourseID}`;
      return !pasiKeys.has(key);
    });
  }, [studentSummaries, pasiRecords, nextYearStudentSummaries, nextYearPasiRecords, previousYearStudentSummaries, previousYearPasiRecords, includeNextYear, includePreviousYear, isStaffUser]);

  const duplicateAsnStudents = useMemo(() => {
    let allStudentSummaries = [...studentSummaries];
    
    if (includeNextYear) {
      allStudentSummaries = [...allStudentSummaries, ...nextYearStudentSummaries];
    }
    
    if (includePreviousYear) {
      allStudentSummaries = [...allStudentSummaries, ...previousYearStudentSummaries];
    }
      
    // Skip for non-staff users since they won't have access to student summaries
    if (!isStaffUser || allStudentSummaries.length === 0) return [];
    
    const asnMap = new Map();
    allStudentSummaries.forEach(student => {
      if (!student.asn || !student.StudentEmail) return;
      if (!asnMap.has(student.asn)) {
        asnMap.set(student.asn, new Map());
      }
      asnMap.get(student.asn).set(student.StudentEmail, student);
    });
    const duplicates = [];
    asnMap.forEach((emailMap, asn) => {
      if (emailMap.size > 1) {
        emailMap.forEach(st => duplicates.push(st));
      }
    });
    return duplicates;
  }, [isStaffUser, studentSummaries, nextYearStudentSummaries, previousYearStudentSummaries, includeNextYear, includePreviousYear]);

  const refreshStudentSummaries = useCallback(() => {
    console.log('Refreshing student summaries and PASI records');
    setRefreshTrigger(prev => prev + 1);
    setStudentSummaries([]);
    setNextYearStudentSummaries([]);
    setPreviousYearStudentSummaries([]);
    if (isStaffUser) {
      setPasiRecords([]);
      setNextYearPasiRecords([]);
      setPreviousYearPasiRecords([]);
    }
    setIsLoadingStudents(true);
    setIsLoadingNextYear(true);
    setIsLoadingPreviousYear(true);
  }, [isStaffUser]);

  // Helper function to combine all selected year data
  const getCombinedData = useCallback((baseData, nextData, previousData) => {
    let combined = [...baseData];
    if (includeNextYear) combined = [...combined, ...nextData];
    if (includePreviousYear) combined = [...combined, ...previousData];
    return combined;
  }, [includeNextYear, includePreviousYear]);

  const value = {
    currentSchoolYear,
    setCurrentSchoolYear,
    schoolYearOptions,
    studentSummaries: getCombinedData(studentSummaries, nextYearStudentSummaries, previousYearStudentSummaries),
    pasiStudentSummariesCombined,
    unlinkedPasiRecords,
    unmatchedStudentSummaries,
    duplicateAsnStudents,
    asnsRecords,
    isLoadingStudents: isLoadingStudents || isLoadingPasi || isLoadingAsns || isLoadingNextYear || isLoadingPreviousYear,
    refreshStudentSummaries,
    pasiRecords: getCombinedData(pasiRecords, nextYearPasiRecords, previousYearPasiRecords),
    error,
    includeNextYear,
    setIncludeNextYear: setIncludeNextYearWithPersistence,
    includePreviousYear,
    setIncludePreviousYear: setIncludePreviousYearWithPersistence,
    nextYearStudentSummaries,
    nextYearPasiRecords,
    previousYearStudentSummaries,
    previousYearPasiRecords,
    recordCounts,
    getNextSchoolYear,
    getPreviousSchoolYear
  };

  return (
    <SchoolYearContext.Provider value={value}>
      {children}
    </SchoolYearContext.Provider>
  );
};

export default SchoolYearProvider;

export const getStudentsWithDuplicateAsn = () => {
  const { duplicateAsnStudents } = useSchoolYear();
  return duplicateAsnStudents;
};

export const getAsns = () => {
  const { asnsRecords } = useSchoolYear();
  return asnsRecords;
};