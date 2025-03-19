import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

export const RegistrationPeriod = {
  REGULAR: 'REGULAR',
  SUMMER: 'SUMMER',
  NEXT_REGULAR: 'NEXT_REGULAR'
};

export function useRegistrationPeriod() {
  const [period, setPeriod] = useState(RegistrationPeriod.REGULAR);
  const [importantDates, setImportantDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canRegisterForNextYear, setCanRegisterForNextYear] = useState(false);
  const [datesByType, setDatesByType] = useState({});

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

  // Function to get messages specific to a student type
  const getStudentTypeMessage = (studentType) => {
    if (!studentType || loading || !importantDates) return "";
    
    const today = new Date();
    const formatDate = (date) => {
      if (!date) return "unknown date";
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    };
    
    // Get dates relevant to this student type
    const typeSpecificDates = datesByType[studentType] || {};
    const regularToSummer = importantDates["Regular-to-Summer Cutoff"]?.jsDate;
    const summerToRegular = importantDates["Summer-to-Regular Cutoff"]?.jsDate;
    const nextYearOpens = importantDates["Next School Year Registration Opens"]?.jsDate;
    const sepCount = importantDates["September Count"]?.jsDate;
    const homeEdDeadline = importantDates["Home Education Semester 2 Deadline"]?.jsDate;
    
    // Messages based on student type and current period
    switch (studentType) {
      case 'Non-Primary':
        if (period === RegistrationPeriod.SUMMER) {
          return `Non-Primary registration for the current year is closed. You can register as a Summer School student until ${formatDate(summerToRegular)}, or wait until after that date to register for the next school year.`;
        } else if (period === RegistrationPeriod.REGULAR) {
          if (canRegisterForNextYear) {
            return `You can register for the current school year until ${formatDate(regularToSummer)} or choose to register for next school year.`;
          }
          return `You can register for the current school year until ${formatDate(regularToSummer)}. Next year registration opens on ${formatDate(nextYearOpens)}.`;
        } else {
          return `Registration is now open for the next school year. If you want to complete your courses in semester one, please register before ${formatDate(sepCount)}.`;
        }

      case 'Home Education':
        if (period === RegistrationPeriod.SUMMER) {
          return `Home Education registration for the current year is closed. You can register as a Summer School student until ${formatDate(summerToRegular)}, or wait until after that date to register for the next school year.`;
        } else if (period === RegistrationPeriod.REGULAR) {
          if (today > homeEdDeadline) {
            return `The deadline for Home Education registration for the current school year has passed (${formatDate(homeEdDeadline)}). You may register as a Summer School student starting ${formatDate(regularToSummer)}.`;
          }
          if (canRegisterForNextYear) {
            return `You can register for the current school year until ${formatDate(homeEdDeadline)} or choose to register for next school year.`;
          }
          return `You can register for the current school year until ${formatDate(homeEdDeadline)}. Next year registration opens on ${formatDate(nextYearOpens)}.`;
        } else {
          return `Registration is now open for the next school year. If you want to complete your courses in semester one, please register before ${formatDate(sepCount)}.`;
        }

      case 'Summer School':
        if (period === RegistrationPeriod.SUMMER) {
          return `Summer School registration is open until ${formatDate(summerToRegular)}. You must complete your course by the end of August.`;
        } else if (period === RegistrationPeriod.REGULAR) {
          return `Summer School registration will open on ${formatDate(regularToSummer)}. Currently, you should register as a Non-Primary or Home Education student.`;
        } else {
          return `Summer School registration has ended for this year. You can now register for courses in the next school year.`;
        }

      case 'Adult Student':
        if (canRegisterForNextYear) {
          return `Registration is open for both the current and next school year. Adult students may register at any time throughout the year.`;
        }
        return `Adult students may register at any time throughout the year. Registration for next school year opens on ${formatDate(nextYearOpens)}.`;

      case 'International Student':
        if (canRegisterForNextYear) {
          return `Registration is open for both the current and next school year. International students may register at any time throughout the year.`;
        }
        return `International students may register at any time throughout the year. Registration for next school year opens on ${formatDate(nextYearOpens)}.`;

      default:
        return "";
    }
  };

  return { 
    period, 
    importantDates,
    canRegisterForNextYear, 
    loading, 
    error,
    getStudentTypeMessage,
    datesByType
  };
}