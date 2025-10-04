import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { isLabourDisruptionActive } from '../config/calendarConfig';

/**
 * Sanitize student type for database paths
 * Converts to camelCase to match pricing node structure
 */
const sanitizeStudentType = (studentType) => {
  if (!studentType) return null;
  
  const typeMapping = {
    'Non-Primary': 'nonPrimaryStudents',
    'Home Education': 'homeEducationStudents',
    'Summer School': 'summerSchoolStudents',
    'Adult Student': 'adultStudents',
    'International Student': 'internationalStudents'
  };
  
  return typeMapping[studentType] || studentType.replace(/\s+/g, '_').toLowerCase() + 'Students';
};

/**
 * Hook to get ALL credit data for a student in a school year
 * @param {string} schoolYear - School year in format "25/26"
 * @returns {Object} All credit data by student type
 */
export const useAllStudentCredits = (schoolYear) => {
  const { user } = useAuth();
  const [creditsData, setCreditsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !schoolYear) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const emailKey = sanitizeEmail(user.email);
    const schoolYearKey = schoolYear.replace('/', '_');
    
    // Read all credit data for this school year from profile
    const creditRef = ref(db, `students/${emailKey}/profile/creditsPerStudent/${schoolYearKey}`);

    const unsubscribe = onValue(
      creditRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setCreditsData(snapshot.val());
        } else {
          setCreditsData({});
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching all credit data:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, schoolYear]);

  return { creditsData, loading };
};

/**
 * Hook to track student credit usage for a specific type
 * @param {string} schoolYear - School year in format "25/26"
 * @param {string} studentType - Student type (e.g., "Non-Primary", "Home Education")
 * @returns {Object} Credit data and loading state
 */
export const useCreditTracking = (schoolYear, studentType) => {
  const { user } = useAuth();
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.email || !schoolYear || !studentType) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const emailKey = sanitizeEmail(user.email);
    const schoolYearKey = schoolYear.replace('/', '_');
    const sanitizedType = sanitizeStudentType(studentType);
    
    if (!sanitizedType) {
      setLoading(false);
      return;
    }
    
    // Read from student profile path for easier access
    const creditRef = ref(db, `students/${emailKey}/profile/creditsPerStudent/${schoolYearKey}/${sanitizedType}`);

    // Set up real-time listener
    const unsubscribe = onValue(
      creditRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // During labour disruption, override credit limit to unlimited ONLY for Non-Primary
          if (isLabourDisruptionActive() && studentType === 'Non-Primary') {
            setCreditData({
              ...data,
              freeCreditsLimit: null, // Unlimited for Non-Primary during disruption
              labourDisruptionActive: true
            });
          } else {
            setCreditData(data);
          }
        } else {
          // No credit data yet - initialize with defaults based on student type
          const hasLimit = studentType === 'Non-Primary' || studentType === 'Home Education';

          // During labour disruption, set limit to null (unlimited) ONLY for Non-Primary
          // Home Education students keep the 10-credit cap
          let creditLimit;
          if (studentType === 'Non-Primary' && isLabourDisruptionActive()) {
            creditLimit = null; // Unlimited for Non-Primary during disruption
          } else if (hasLimit) {
            creditLimit = 10; // Regular 10-credit limit
          } else {
            creditLimit = null; // No limit for Adult/International (always unlimited)
          }

          setCreditData({
            nonExemptCredits: 0,
            exemptCredits: 0,
            totalCredits: 0,
            freeCreditsUsed: 0,
            paidCreditsRequired: 0,
            freeCreditsLimit: creditLimit,
            remainingFreeCredits: creditLimit,
            requiresPayment: false,
            studentType,
            labourDisruptionActive: isLabourDisruptionActive()
          });
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching credit data:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user, schoolYear, studentType]);

  return {
    creditData,
    loading,
    error,
    // Computed values for convenience - using dynamic limits from data
    remainingFreeCredits: creditData?.remainingFreeCredits ?? creditData?.freeCreditsLimit,
    atCreditLimit: creditData?.freeCreditsLimit ? 
      creditData?.nonExemptCredits >= creditData?.freeCreditsLimit : false,
    requiresPayment: creditData?.requiresPayment || creditData?.paidCreditsRequired > 0,
    hasLimit: creditData?.freeCreditsLimit !== null && creditData?.freeCreditsLimit !== undefined
  };
};

/**
 * Hook to get course credits from the database
 * @param {string|number} courseId - Course ID
 * @returns {Object} Credits value and loading state
 */
export const useCourseCredits = (courseId) => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    
    const db = getDatabase();
    const creditRef = ref(db, `courses/${parseInt(courseId)}/courseCredits`);
    
    const unsubscribe = onValue(creditRef, (snapshot) => {
      setCredits(snapshot.val() || 0);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [courseId]);
  
  return { credits, loading };
};

/**
 * Check if a course is exempt from credit limits
 */
export const isExemptCourse = (courseId) => {
  const EXEMPT_COURSE_IDS = [4, 6]; // COM1255 and INF2020
  return EXEMPT_COURSE_IDS.includes(parseInt(courseId));
};