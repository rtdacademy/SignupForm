import { useMemo } from 'react';

// Keep for backward compatibility
export const RegistrationPeriod = {
  REGULAR: 'REGULAR',
  SUMMER: 'SUMMER',
  NEXT_REGULAR: 'NEXT_REGULAR'
};

/**
 * A custom hook to process registration windows from ImportantDates
 * @param {Object} importantDates - Object containing important dates data
 * @returns {Object} Registration window utility functions
 */
export function useRegistrationWindows(importantDates) {
  return useMemo(() => {
    // Helper function to parse dates into JS Date objects
    const parseDate = (dateString) => {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day); // Months are 0-indexed in JS
    };
    
    // Helper function to format date for display
    const formatDate = (date) => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
    };

    /**
     * Checks if a date is within a recurring date range
     */
    const isDateInRecurringRange = (date, startDate, endDate) => {
      const dateMonth = date.getMonth();
      const dateDay = date.getDate();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();
      
      // If date range spans across year boundary (e.g. Dec-Jan)
      if (startMonth > endMonth) {
        return (
          (dateMonth > startMonth || (dateMonth === startMonth && dateDay >= startDay)) ||
          (dateMonth < endMonth || (dateMonth === endMonth && dateDay <= endDay))
        );
      }
      
      // Regular date range within the same year
      return (
        (dateMonth > startMonth || (dateMonth === startMonth && dateDay >= startDay)) &&
        (dateMonth < endMonth || (dateMonth === endMonth && dateDay <= endDay))
      );
    };

    /**
     * Gets all active registration windows for a specific student type
     */
    const getActiveRegistrationWindows = (studentType) => {
      if (!importantDates || !studentType) return [];
      
      const today = new Date();
      
      // Filter for registration events applicable to the student type
      return Object.values(importantDates || {}).filter(event => {
        // Must be a registration type event
        if (event.type !== 'Registration') return false;
        
        // Must apply to this student type
        if (!event.applicableStudentTypes || 
            !event.applicableStudentTypes.includes(studentType)) {
          return false;
        }
        
        // Parse dates for comparison
        const startDate = parseDate(event.displayDate);
        const endDate = parseDate(event.endDateDisplayDate);
        if (!startDate || !endDate) return false;
        
        // Handle recurring events (focus on month/day, not year)
        if (event.recurring) {
          return isDateInRecurringRange(today, startDate, endDate);
        }
        
        // For non-recurring events, simple date comparison
        return today >= startDate && today <= endDate;
      });
    };
    
    /**
     * Calculate effective registration period from multiple windows (the intersection)
     */
    const getEffectiveRegistrationPeriod = (windows) => {
      if (!windows || windows.length === 0) return { 
        start: null, 
        end: null,
        startFormatted: '',
        endFormatted: '',
        hasActiveWindow: false
      };
      
      let effectiveStart = null;
      let effectiveEnd = null;
      
      windows.forEach(window => {
        const start = parseDate(window.displayDate);
        const end = parseDate(window.endDateDisplayDate);
        
        // For the first window, just use its dates
        if (effectiveStart === null) {
          effectiveStart = start;
          effectiveEnd = end;
          return;
        }
        
        // Find the latest start date (maximum of all starts)
        if (start > effectiveStart) {
          effectiveStart = start;
        }
        
        // Find the earliest end date (minimum of all ends)
        if (end < effectiveEnd) {
          effectiveEnd = end;
        }
      });
      
      // Check if we have a valid period (start must be before end)
      const hasActiveWindow = effectiveStart && effectiveEnd && effectiveStart <= effectiveEnd;
      
      return { 
        start: effectiveStart, 
        end: effectiveEnd,
        startFormatted: formatDate(effectiveStart),
        endFormatted: formatDate(effectiveEnd),
        hasActiveWindow
      };
    };
    
    /**
     * Check if next year registration is open for a specific student type
     */
    const isNextYearRegistrationOpen = (studentType) => {
      const nextYearWindows = Object.values(importantDates || {}).filter(event => {
        return (
          event.type === 'Registration' &&
          event.title === 'Next School Year Registration Opens' &&
          event.applicableStudentTypes?.includes(studentType)
        );
      });
      
      if (nextYearWindows.length === 0) return false;
      
      const today = new Date();
      
      // Check if today falls within any of the next year registration windows
      return nextYearWindows.some(window => {
        const startDate = parseDate(window.displayDate);
        const endDate = parseDate(window.endDateDisplayDate);
        
        if (!startDate || !endDate) return false;
        
        // Handle recurring events
        if (window.recurring) {
          return isDateInRecurringRange(today, startDate, endDate);
        }
        
        return today >= startDate && today <= endDate;
      });
    };
    
    /**
     * Get the next year registration window details
     */
    const getNextYearRegistrationWindow = (studentType) => {
      const nextYearWindow = Object.values(importantDates || {}).find(event => {
        return (
          event.type === 'Registration' &&
          event.title === 'Next School Year Registration Opens' &&
          event.applicableStudentTypes?.includes(studentType)
        );
      });
      
      if (!nextYearWindow) return null;
      
      return {
        ...nextYearWindow,
        startDate: parseDate(nextYearWindow.displayDate),
        endDate: parseDate(nextYearWindow.endDateDisplayDate),
        startFormatted: formatDate(parseDate(nextYearWindow.displayDate)),
        endFormatted: formatDate(parseDate(nextYearWindow.endDateDisplayDate))
      };
    };
    
    /**
     * Validate if a date falls within the registration windows
     */
    const isDateInRegistrationWindows = (date, windows) => {
      if (!date || !windows || windows.length === 0) return false;
      
      const checkDate = typeof date === 'string' ? parseDate(date) : date;
      
      return windows.some(window => {
        const startDate = parseDate(window.displayDate);
        const endDate = parseDate(window.endDateDisplayDate);
        
        if (window.recurring) {
          return isDateInRecurringRange(checkDate, startDate, endDate);
        }
        
        return checkDate >= startDate && checkDate <= endDate;
      });
    };

    /**
     * Get current school year in YY/YY format
     */
    const getCurrentSchoolYear = () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const startYear = currentMonth >= 8 ? currentYear : currentYear - 1; // School year starts in September
      
      const startYY = startYear.toString().slice(-2);
      const endYY = (startYear + 1).toString().slice(-2);
      
      return `${startYY}/${endYY}`;
    };
    
    /**
     * Get next school year in YY/YY format
     */
    const getNextSchoolYear = () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const startYear = currentMonth >= 8 ? currentYear + 1 : currentYear; // Next school year
      
      const startYY = startYear.toString().slice(-2);
      const endYY = (startYear + 1).toString().slice(-2);
      
      return `${startYY}/${endYY}`;
    };
    
   /**
 * Get restricted date range based on registration windows
 * for date validation in the form, taking into account enrollment year
 * @param {string} studentType - Type of student 
 * @param {string} enrollmentYear - Selected enrollment year in YY/YY format
 */
const getRegistrationDateRestrictions = (studentType, enrollmentYear) => {
  const windows = getActiveRegistrationWindows(studentType);
  const { start, end, hasActiveWindow } = getEffectiveRegistrationPeriod(windows);
  
  const currentSchoolYear = getCurrentSchoolYear();
  const isNextYear = enrollmentYear && enrollmentYear !== currentSchoolYear;
  
  let minDate = start;
  let maxDate = end;
  
  // If next year is selected, we need to modify the date restrictions
  if (isNextYear) {
    // For next year, find registration windows specific to next year
    const nextYearWindows = Object.values(importantDates || {}).filter(event => {
      return (
        event.type === 'Registration' &&
        event.applicableStudentTypes?.includes(studentType) &&
        // Filter for windows that aren't "Next School Year Registration Opens"
        event.title !== 'Next School Year Registration Opens'
      );
    });
    
    if (nextYearWindows.length > 0) {
      // For each window, shift its dates forward by a year
      const shiftedWindows = nextYearWindows.map(window => {
        const startDate = parseDate(window.displayDate);
        const endDate = parseDate(window.endDateDisplayDate);
        
        if (!startDate || !endDate) return null;
        
        // Create a copy of the window with shifted dates
        return {
          ...window,
          displayDate: formatDate(new Date(
            startDate.getFullYear() + 1,
            startDate.getMonth(),
            startDate.getDate()
          )),
          endDateDisplayDate: formatDate(new Date(
            endDate.getFullYear() + 1,
            endDate.getMonth(),
            endDate.getDate()
          ))
        };
      }).filter(w => w !== null);
      
      // Calculate effective registration period using the shifted windows
      const nextYearPeriod = getEffectiveRegistrationPeriod(shiftedWindows);
      
      // Update min/max dates if we have valid next year period
      if (nextYearPeriod.hasActiveWindow) {
        minDate = nextYearPeriod.start;
        maxDate = nextYearPeriod.end;
      }
    }
  }
  
  return {
    minDate,
    maxDate,
    hasActiveWindow: hasActiveWindow || (isNextYear && minDate && maxDate),
    windows
  };
};
    
/**
 * Gets the maximum schedule end date for a specific student type
 * based on the scheduleEndDateDisplayDate field in ImportantDates
 */
const getMaxScheduleEndDate = (studentType, enrollmentYear) => {
  if (!importantDates || !studentType) return null;
  
  const currentSchoolYear = getCurrentSchoolYear();
  const isNextYear = enrollmentYear && enrollmentYear !== currentSchoolYear;
  
  // Find the appropriate registration window
  let registrationWindow = null;
  
  if (studentType === 'Non-Primary' || studentType === 'Home Education') {
    // For next year or current year semester 1
    registrationWindow = Object.values(importantDates || {}).find(event => 
      event.type === 'Registration' &&
      event.applicableStudentTypes?.includes(studentType) &&
      event.title === 'Semester 1 Registration Window' &&
      event.scheduleEndDateDisplayDate
    );
  } else if (studentType === 'Summer School') {
    registrationWindow = Object.values(importantDates || {}).find(event => 
      event.type === 'Registration' &&
      event.applicableStudentTypes?.includes(studentType) &&
      event.title === 'Summer School Registration Window' &&
      event.scheduleEndDateDisplayDate
    );
  }
  
  if (!registrationWindow || !registrationWindow.scheduleEndDateDisplayDate) {
    return null;
  }
  
  // Parse the schedule end date
  let scheduleEndDate = parseDate(registrationWindow.scheduleEndDateDisplayDate);
  
  // For next year, increment the year by 1
  if (isNextYear && scheduleEndDate) {
    scheduleEndDate = new Date(
      scheduleEndDate.getFullYear() + 1,
      scheduleEndDate.getMonth(),
      scheduleEndDate.getDate()
    );
  }
  
  return scheduleEndDate;
};
    
    /**
     * Checks if a start date and end date cross the school year boundary
     * (e.g., starting in summer and ending after summer)
     */
    const crossesSchoolYearBoundary = (startDate, endDate) => {
      if (!startDate || !endDate) return false;
      
      const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;
      
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();
      
      // Starting in summer (Jun-Aug) and ending after August
      return (startMonth >= 5 && startMonth <= 7) && // Jun(5)-Aug(7) 
             (endMonth >= 8); // September(8) or later
    };

    /**
 * Finds a specific registration window by student type and title
 */
const getRegistrationWindowByTypeAndTitle = (studentType, title) => {
  if (!importantDates || !studentType || !title) return null;
  
  return Object.values(importantDates).find(event => 
    event.type === 'Registration' &&
    event.applicableStudentTypes?.includes(studentType) &&
    event.title === title
  );
};


    
    // Return all utility functions and computed properties
    return {
      // Functions
      getActiveRegistrationWindows,
      getEffectiveRegistrationPeriod,
      isNextYearRegistrationOpen,
      getNextYearRegistrationWindow,
      isDateInRegistrationWindows,
      getCurrentSchoolYear,
      getNextSchoolYear,
      getRegistrationDateRestrictions,
      getMaxScheduleEndDate, 
      crossesSchoolYearBoundary, 
      getRegistrationWindowByTypeAndTitle,
      parseDate,
      formatDate
    };
  }, [importantDates]);
}