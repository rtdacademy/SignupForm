import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getStudentTypeMessageHTML, REGISTRATION_PERIODS } from '../config/DropdownOptions';

export const RegistrationPeriod = REGISTRATION_PERIODS;

export function useRegistrationPeriod() {
  const [period, setPeriod] = useState(RegistrationPeriod.REGULAR);
  const [importantDates, setImportantDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canRegisterForNextYear, setCanRegisterForNextYear] = useState(false);
  const [isHomeEdDeadlinePassed, setIsHomeEdDeadlinePassed] = useState(false);
  const [datesByType, setDatesByType] = useState({});
  const [academicYearHomeEdDeadline, setAcademicYearHomeEdDeadline] = useState(null);

  useEffect(() => {
    async function fetchImportantDates() {
      try {
        setLoading(true);
        const db = getDatabase();
        const importantDatesRef = ref(db, 'ImportantDates');
        const snapshot = await get(importantDatesRef);

        if (snapshot.exists()) {
          const datesData = snapshot.val();
          const datesCollection = {};
          const studentTypeDates = {
            'Non-Primary': {},
            'Home Education': {},
            'Summer School': {},
            'Adult Student': {},
            'International Student': {}
          };
          
          // Process each date and organize by name
          Object.entries(datesData).forEach(([key, date]) => {
            datesCollection[date.title] = {
              ...date,
              jsDate: parseDate(date.displayDate)
            };
            
            // Also organize dates by student type
            if (date.applicableStudentTypes) {
              date.applicableStudentTypes.forEach(type => {
                if (studentTypeDates[type]) {
                  studentTypeDates[type][date.title] = {
                    ...date,
                    jsDate: parseDate(date.displayDate)
                  };
                }
              });
            }
          });

          setImportantDates(datesCollection);
          setDatesByType(studentTypeDates);
          
          // Determine the current period
          determinePeriod(datesCollection);
          
          // Check if Home Education deadline has passed
          checkHomeEdDeadline(datesCollection);
        } else {
          throw new Error("No important dates found");
        }
      } catch (err) {
        console.error("Error fetching important dates:", err);
        setError(err.message);
        // Default to REGULAR period if there's an error
        setPeriod(RegistrationPeriod.REGULAR);
      } finally {
        setLoading(false);
      }
    }

    fetchImportantDates();
  }, []);

  // Helper function to parse dates consistently
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Months are 0-indexed in JS
    
    // Adjust year to ensure date is in the future or current
    const today = new Date();
    const currentYear = today.getFullYear();
    
    if (date.getMonth() < today.getMonth() || 
        (date.getMonth() === today.getMonth() && date.getDate() < today.getDate())) {
      // If the date is already past for this year, use next year
      if (date.getFullYear() === currentYear) {
        date.setFullYear(currentYear + 1);
      }
    } else if (date.getFullYear() < currentYear) {
      // If the year is in the past, update to current year
      date.setFullYear(currentYear);
    }
    
    return date;
  };

  // Function to get date for current academic year (Sept 1 - Aug 31)
  const getDateForCurrentAcademicYear = (date) => {
    if (!date) return null;
    
    const today = new Date();
    const academicYearStart = new Date(today.getFullYear(), 8, 1); // September 1
    
    // Clone the date to avoid modifying the original
    const result = new Date(date);
    
    // If today is before Sept 1, use the date from the previous year's academic cycle
    if (today < academicYearStart) {
      result.setFullYear(today.getFullYear());
    } else {
      // We're in a new academic year (on or after Sept 1), use next year's date
      result.setFullYear(today.getFullYear() + 1);
    }
    
    return result;
  };

  // Function to determine the current registration period
  const determinePeriod = (dates) => {
    const today = new Date();
    
    const regularToSummer = dates["Regular-to-Summer Cutoff"]?.jsDate;
    const summerToRegular = dates["Summer-to-Regular Cutoff"]?.jsDate;
    const nextYearOpens = dates["Next School Year Registration Opens"]?.jsDate;
    
    if (!regularToSummer || !summerToRegular) {
      console.warn("Missing critical cutoff dates, defaulting to REGULAR period");
      setPeriod(RegistrationPeriod.REGULAR);
      return;
    }

    // Set next year registration status
    if (nextYearOpens) {
      setCanRegisterForNextYear(today >= nextYearOpens);
    } else {
      // Default to April 1st if not specified
      const defaultNextYearDate = new Date(today.getFullYear(), 3, 1); // April 1st
      setCanRegisterForNextYear(today >= defaultNextYearDate);
    }
    
    // Determine current period
    if (today < regularToSummer) {
      setPeriod(RegistrationPeriod.REGULAR);
    } else if (today >= regularToSummer && today < summerToRegular) {
      setPeriod(RegistrationPeriod.SUMMER);
    } else {
      setPeriod(RegistrationPeriod.NEXT_REGULAR);
    }
  };

  // Function to check if Home Education deadline has passed
  const checkHomeEdDeadline = (dates) => {
    const today = new Date();
    const homeEdDeadlineDate = dates["Home Education Semester 2 Deadline"]?.jsDate;
    
    if (!homeEdDeadlineDate) {
      setIsHomeEdDeadlinePassed(false);
      return;
    }
    
    // Get current academic year's September 1st
    const currentYear = today.getFullYear();
    const septFirst = new Date(currentYear, 8, 1); // September 1st of current year
    
    // Determine the relevant academic year for home ed deadline
    let relevantHomeEdDeadline;
    
    if (today >= septFirst) {
      // If we're on or after Sept 1, the relevant deadline is in the coming year
      relevantHomeEdDeadline = new Date(homeEdDeadlineDate);
      if (relevantHomeEdDeadline < today) {
        relevantHomeEdDeadline.setFullYear(currentYear + 1);
      } else {
        relevantHomeEdDeadline.setFullYear(currentYear);
      }
    } else {
      // If we're before Sept 1, the relevant deadline is in the current year or has passed
      relevantHomeEdDeadline = new Date(homeEdDeadlineDate);
      relevantHomeEdDeadline.setFullYear(currentYear);
      
      // If that date is in the past, then the deadline has passed for this academic year
      if (relevantHomeEdDeadline < today) {
        setIsHomeEdDeadlinePassed(true);
        // Don't set academicYearHomeEdDeadline since it's already passed
        return;
      }
    }
    
    // Save the academic-year-specific date for the UI
    setAcademicYearHomeEdDeadline(relevantHomeEdDeadline);
    
    // Set the flag based on whether today is past the deadline
    setIsHomeEdDeadlinePassed(today > relevantHomeEdDeadline);
  };

  // Function that calls the centralized messaging function from DropdownOptions.js
  const getStudentTypeMessage = (studentType) => {
    if (!studentType || loading || !importantDates) return "";
    
    // Prepare parameters for messaging function
    const params = {
      period,
      canRegisterForNextYear,
      regularToSummer: importantDates["Regular-to-Summer Cutoff"]?.jsDate,
      summerToRegular: importantDates["Summer-to-Regular Cutoff"]?.jsDate,
      nextYearOpens: importantDates["Next School Year Registration Opens"]?.jsDate,
      sepCount: importantDates["September Count"]?.jsDate,
      homeEdDeadline: academicYearHomeEdDeadline || importantDates["Home Education Semester 2 Deadline"]?.jsDate,
      isHomeEdDeadlinePassed
    };
    
    return getStudentTypeMessageHTML(studentType, params);
  };

  return { 
    period, 
    importantDates,
    canRegisterForNextYear,
    isHomeEdDeadlinePassed,
    loading, 
    error,
    getStudentTypeMessage,
    datesByType,
    academicYearHomeEdDeadline
  };
}