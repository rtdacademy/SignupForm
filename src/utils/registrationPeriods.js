import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

export const RegistrationPeriod = {
  REGULAR: 'REGULAR',
  SUMMER: 'SUMMER',
  NEXT_REGULAR: 'NEXT_REGULAR'
};

export function useRegistrationPeriod() {
  const [period, setPeriod] = useState(RegistrationPeriod.REGULAR);
  const [cutoffDates, setCutoffDates] = useState(null);
  const [nextYearRegistrationDate, setNextYearRegistrationDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canRegisterForNextYear, setCanRegisterForNextYear] = useState(false);

  useEffect(() => {
    async function fetchImportantDates() {
      try {
        setLoading(true);
        const db = getDatabase();
        const importantDatesRef = ref(db, 'ImportantDates');
        const snapshot = await get(importantDatesRef);

        if (snapshot.exists()) {
          const datesData = snapshot.val();
          let regularToSummerDate = null;
          let summerToRegularDate = null;
          let nextYearRegistrationOpens = null;

          // Find the important dates
          Object.entries(datesData).forEach(([key, date]) => {
            if (date.title === "Regular-to-Summer Cutoff") {
              // Parse the date correctly in local time
              const [year, month, day] = date.displayDate.split('-').map(Number);
              regularToSummerDate = new Date(year, month - 1, day); // Note: months are 0-indexed in JS
            } else if (date.title === "Summer-to-Regular Cutoff") {
              // Parse the date correctly in local time
              const [year, month, day] = date.displayDate.split('-').map(Number);
              summerToRegularDate = new Date(year, month - 1, day); // Note: months are 0-indexed in JS
            } else if (date.title === "Next School Year Registration Opens") {
              // Parse the date correctly in local time
              const [year, month, day] = date.displayDate.split('-').map(Number);
              nextYearRegistrationOpens = new Date(year, month - 1, day); // Note: months are 0-indexed in JS
            }
          });

          // Ensure we have all required dates
          if (!regularToSummerDate || !summerToRegularDate) {
            throw new Error("Missing required cutoff dates");
          }

          // If nextYearRegistrationOpens is missing, default to April 1st
          if (!nextYearRegistrationOpens) {
            console.warn("Next School Year Registration date not found, defaulting to April 1st");
            nextYearRegistrationOpens = new Date(new Date().getFullYear(), 3, 1); // April 1st
          }

          // Adjust years to ensure dates are in the future or current
          const today = new Date();
          const currentYear = today.getFullYear();
          
          // Adjust years for all dates to current year initially
          regularToSummerDate.setFullYear(currentYear);
          summerToRegularDate.setFullYear(currentYear);
          nextYearRegistrationOpens.setFullYear(currentYear);
          
          // If dates are in the past, move them to next year
          if (regularToSummerDate < today) {
            regularToSummerDate.setFullYear(currentYear + 1);
          }
          
          if (summerToRegularDate < today) {
            summerToRegularDate.setFullYear(currentYear + 1);
          }
          
          if (nextYearRegistrationOpens < today) {
            nextYearRegistrationOpens.setFullYear(currentYear + 1);
          }

          // Ensure the dates are in the correct sequence:
          // nextYearRegistrationOpens -> regularToSummer -> summerToRegular
          if (nextYearRegistrationOpens > regularToSummerDate) {
            if (nextYearRegistrationOpens.getFullYear() === regularToSummerDate.getFullYear()) {
              // If they're in the same year but in wrong order, move regularToSummer to next year
              regularToSummerDate.setFullYear(regularToSummerDate.getFullYear() + 1);
              summerToRegularDate.setFullYear(summerToRegularDate.getFullYear() + 1);
            }
          }
          
          if (regularToSummerDate > summerToRegularDate) {
            if (regularToSummerDate.getFullYear() === summerToRegularDate.getFullYear()) {
              // If they're in the same year but in wrong order, move summerToRegular to next year
              summerToRegularDate.setFullYear(summerToRegularDate.getFullYear() + 1);
            }
          }

          setCutoffDates({ 
            regularToSummer: regularToSummerDate, 
            summerToRegular: summerToRegularDate 
          });
          
          setNextYearRegistrationDate(nextYearRegistrationOpens);
          
          // Determine current period and next year registration status
          // Check if today is after the next year registration opens date
          setCanRegisterForNextYear(today >= nextYearRegistrationOpens);
          
          if (today < regularToSummerDate) {
            setPeriod(RegistrationPeriod.REGULAR);
          } else if (today >= regularToSummerDate && today < summerToRegularDate) {
            setPeriod(RegistrationPeriod.SUMMER);
          } else {
            setPeriod(RegistrationPeriod.NEXT_REGULAR);
          }
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

  return { 
    period, 
    cutoffDates, 
    nextYearRegistrationDate, 
    canRegisterForNextYear, 
    loading, 
    error 
  };
}