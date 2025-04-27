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
  const defaultOption = schoolYearOptions.find(opt => opt.isDefault);
  const defaultYear = defaultOption?.value || schoolYearOptions[0]?.value || '';

  const [currentSchoolYear, setCurrentSchoolYear] = useState(() => {
    const savedYear = localStorage.getItem('currentSchoolYear');
    if (savedYear && schoolYearOptions.some(opt => opt.value === savedYear)) {
      return savedYear;
    }
    return defaultYear;
  });

  // Refresh trigger for re-fetching
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State for fetched data
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [pasiRecords, setPasiRecords] = useState([]);
  const [asnsRecords, setAsnsRecords] = useState([]);

  // Loading and error states
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingPasi, setIsLoadingPasi] = useState(false);
  const [isLoadingAsns, setIsLoadingAsns] = useState(false);
  const [error, setError] = useState(null);

  // Persist current year
  useEffect(() => {
    if (currentSchoolYear) {
      localStorage.setItem('currentSchoolYear', currentSchoolYear);
    }
  }, [currentSchoolYear]);

  // Fetch student summaries
  useEffect(() => {
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
  }, [currentSchoolYear, refreshTrigger]);

  // Fetch PASI records for staff
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

    const pasiRef = ref(db, 'pasiRecords');
    const schoolYearQuery = query(
      pasiRef,
      orderByChild('schoolYear'),
      equalTo(formattedYear)
    );

    const unsubscribe = onValue(schoolYearQuery, snapshot => {
      try {
        if (!snapshot.exists()) {
          setPasiRecords([]);
        } else {
          const records = [];
          snapshot.forEach(child => {
            const record = child.val();
            records.push({ id: child.key, linked: Boolean(record.linked), ...record });
          });
          setPasiRecords(records.sort((a, b) => a.studentName.localeCompare(b.studentName)));
        }
      } catch (err) {
        console.error('Error processing PASI records:', err);
        setError(err.message);
        setPasiRecords([]);
      } finally {
        setIsLoadingPasi(false);
      }
    }, error => {
      console.error('Database error fetching PASI records:', error);
      setError(error.message);
      setPasiRecords([]);
      setIsLoadingPasi(false);
    });

    return () => off(schoolYearQuery);
  }, [isStaffUser, currentSchoolYear, refreshTrigger]);

  // New: Fetch ASNs node
  useEffect(() => {
    console.log('Fetching ASNs records');
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
  }, [refreshTrigger]);

  // Combine PASI & summaries
  const pasiStudentSummariesCombined = useMemo(() => {
    if (!isStaffUser || pasiRecords.length === 0) {
      return studentSummaries;
    }
    const summaryMap = {};
    studentSummaries.forEach(summary => {
      if (summary.id) summaryMap[summary.id] = summary;
    });
    return pasiRecords.map(record => {
      const { term, summaryKey, ...restRecord } = record;
      const renamed = { ...restRecord, pasiTerm: term, summaryKey };
      const summary = summaryKey && summaryMap[summaryKey] ? summaryMap[summaryKey] : null;
      if (!summary) {
        return { ...renamed, CourseID: null, Status_Value: null, StudentType_Value: null, ActiveFutureArchived_Value: 'Not Set', Term: null };
      }
      return { ...summary, ...renamed };
    });
  }, [studentSummaries, pasiRecords, isStaffUser]);

  // Other derived lists (unlinked, unmatched, duplicates)
  const unlinkedPasiRecords = useMemo(() => {
    if (!isStaffUser || pasiRecords.length === 0) return [];
    // Removed the summaryIdSet creation since we're not using it anymore
    return pasiRecords.filter(r => !r.summaryKey).map(record => {
      const { term, ...rest } = record;
      return { ...rest, pasiTerm: term };
    });
  }, [studentSummaries, pasiRecords, isStaffUser]);

  const unmatchedStudentSummaries = useMemo(() => {
    if (!isStaffUser || studentSummaries.length === 0) return [];
    const pasiSummaryKeySet = new Set(pasiRecords.filter(r => r.summaryKey).map(r => r.summaryKey));
    return studentSummaries.filter(s => s.id && !pasiSummaryKeySet.has(s.id));
  }, [studentSummaries, pasiRecords, isStaffUser]);

  const duplicateAsnStudents = useMemo(() => {
    if (studentSummaries.length === 0) return [];
    const asnMap = new Map();
    studentSummaries.forEach(student => {
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
  }, [studentSummaries]);

  const refreshStudentSummaries = useCallback(() => {
    console.log('Refreshing student summaries and PASI records');
    setRefreshTrigger(prev => prev + 1);
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
    unlinkedPasiRecords,
    unmatchedStudentSummaries,
    duplicateAsnStudents,
    asnsRecords,
    isLoadingStudents: isLoadingStudents || isLoadingPasi || isLoadingAsns,
    refreshStudentSummaries,
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

export const getStudentsWithDuplicateAsn = () => {
  const { duplicateAsnStudents } = useSchoolYear();
  return duplicateAsnStudents;
};

export const getAsns = () => {
  const { asnsRecords } = useSchoolYear();
  return asnsRecords;
};
