import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';

export const useStudentData = (userEmailKey) => {
  const { isEmulating } = useAuth();
  const [studentData, setStudentData] = useState({
    courses: [],
    profile: null,
    loading: true,
    error: null,
    studentExists: false,
    importantDates: null
  });

  const fetchStaffMember = async (emailKey) => {
    try {
      const db = getDatabase();
      const staffRef = ref(db, `staff/${emailKey}`);
      const snapshot = await get(staffRef);
      if (snapshot.exists()) {
        const staffData = snapshot.val();
        return {
          displayName: staffData.displayName,
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          email: staffData.email
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching staff member ${emailKey}:`, error);
      return null;
    }
  };

  const fetchStaffMembers = async (emailKeys) => {
    if (!emailKeys || !Array.isArray(emailKeys)) return {};
    
    const staffMembers = await Promise.all(
      emailKeys.map(async emailKey => {
        const member = await fetchStaffMember(emailKey);
        return [emailKey, member];
      })
    );

    return Object.fromEntries(
      staffMembers.filter(([_, value]) => value !== null)
    );
  };

  const fetchPaymentDetails = async (courseId) => {
    try {
      const db = getDatabase();
      const statusRef = ref(db, `students/${userEmailKey}/courses/${courseId}/payment_status/status`);
      const statusSnapshot = await get(statusRef);
      const status = statusSnapshot.val();

      const paymentRef = ref(db, `payments/${userEmailKey}/courses/${courseId}`);
      const paymentSnapshot = await get(paymentRef);
      const paymentDetails = paymentSnapshot.val();

      if (!status && !paymentDetails) {
        return null;
      }

      return {
        status: status || 'unpaid',
        details: paymentDetails || null,
        hasValidPayment: status === 'paid' || status === 'active'
      };
    } catch (error) {
      console.error(`Error fetching payment details for course ${courseId}:`, error);
      return null;
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      const snapshot = await get(courseRef);
      const courseData = snapshot.exists() ? snapshot.val() : null;
      
      if (courseData) {
        const { Teachers, SupportStaff, ...courseDataWithoutStaff } = courseData;
        
        const teachers = await fetchStaffMembers(Teachers || []);
        const supportStaff = await fetchStaffMembers(SupportStaff || []);
        
        return {
          ...courseDataWithoutStaff,
          teachers,
          supportStaff
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  };

  const processCourses = async (studentCourses) => {
    if (!studentCourses) return [];

    const courseEntries = Object.entries(studentCourses)
      .filter(([key]) => key !== 'sections' && key !== 'normalizedSchedule');

    const coursesWithDetails = await Promise.all(
      courseEntries.map(async ([id, studentCourse]) => {
        const [courseDetails, paymentInfo] = await Promise.all([
          fetchCourseDetails(id),
          fetchPaymentDetails(id)
        ]);
        
        return {
          id,
          ...studentCourse,
          courseDetails: courseDetails,
          payment: paymentInfo || {
            status: 'unpaid',
            details: null,
            hasValidPayment: false
          }
        };
      })
    );

    return coursesWithDetails
      .filter(course => course)
      .sort((a, b) => new Date(b.Created) - new Date(a.Created));
  };

  const fetchImportantDates = async () => {
    try {
      const db = getDatabase();
      const datesRef = ref(db, 'ImportantDates');
      const snapshot = await get(datesRef);
      
      console.log('Fetching ImportantDates directly:', snapshot.exists(), snapshot.val());
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error fetching important dates:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let profileReceived = false;
    let coursesReceived = false;
    let datesReceived = false;
    
    console.log('useStudentData effect running, userEmailKey:', userEmailKey);
    
    // Always fetch important dates, regardless of userEmailKey
    const fetchDates = async () => {
      try {
        const dates = await fetchImportantDates();
        if (isMounted) {
          console.log('Fetched ImportantDates:', dates);
          setStudentData(prev => ({
            ...prev,
            importantDates: dates
          }));
          datesReceived = true;
          // If this is a new user (no userEmailKey), we need to mark loading as complete
          if (!userEmailKey) {
            setStudentData(prev => ({ ...prev, loading: false }));
          } else {
            checkLoadingComplete();
          }
        }
      } catch (error) {
        console.error('Error in fetchDates:', error);
        datesReceived = true;
        if (!userEmailKey) {
          setStudentData(prev => ({ ...prev, loading: false }));
        } else {
          checkLoadingComplete();
        }
      }
    };
    
    // Execute fetchDates immediately
    fetchDates();
    
    // If no userEmailKey, we're done after fetching dates
    if (!userEmailKey) {
      // We're not setting loading to false right away, as fetchDates will do that
      profileReceived = true;
      coursesReceived = true;
      return;
    }

    const db = getDatabase();
    let unsubscribe = null;

    const checkLoadingComplete = () => {
      console.log('checkLoadingComplete:', { profileReceived, coursesReceived, datesReceived, isMounted });
      if (profileReceived && coursesReceived && datesReceived && isMounted) {
        setStudentData(prev => ({
          ...prev,
          loading: false
        }));
      }
    };

    const handleError = (error) => {
      if (!isMounted) return;
      
      console.error('Firebase listener error:', error);
      setStudentData(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        studentExists: false
      }));
    };

    const setupListeners = () => {
      const profileRef = ref(db, `students/${userEmailKey}/profile`);
      const coursesRef = ref(db, `students/${userEmailKey}/courses`);
      const datesRef = ref(db, 'ImportantDates');

      // Listen for profile changes
      const profileUnsubscribe = onValue(profileRef, async (profileSnapshot) => {
        if (!isMounted) return;
        
        profileReceived = true;
        console.log('Profile received:', profileSnapshot.val());
        
        setStudentData(prev => ({
          ...prev,
          profile: profileSnapshot.val() || null,
          studentExists: profileSnapshot.exists()
        }));
        
        checkLoadingComplete();
      }, handleError);

      // Listen for course changes
   // In useStudentData.js
const coursesUnsubscribe = onValue(coursesRef, async (coursesSnapshot) => {
  if (!isMounted) return;

  console.log('Courses received:', coursesSnapshot.exists());

  if (coursesSnapshot.exists()) {
    const coursesData = coursesSnapshot.val();
    const processedCourses = await processCourses(coursesData);
    
    if (!isMounted) return;

    setStudentData(prev => ({
      ...prev,
      courses: processedCourses,
      studentExists: true
    }));
  } else {
    setStudentData(prev => ({
      ...prev,
      courses: []
    }));
  }
  
  // Move this line HERE, after all the async course processing is complete
  coursesReceived = true;
  checkLoadingComplete();
}, handleError);

      // Listen for ImportantDates changes
      const datesUnsubscribe = onValue(datesRef, async (datesSnapshot) => {
        if (!isMounted) return;
        
        datesReceived = true;
        console.log('ImportantDates received via listener:', datesSnapshot.exists(), datesSnapshot.val());
        
        setStudentData(prev => ({
          ...prev,
          importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null
        }));
        
        checkLoadingComplete();
      }, handleError);

      return () => {
        profileUnsubscribe();
        coursesUnsubscribe();
        datesUnsubscribe();
      };
    };

    if (isEmulating) {
      // For emulation, do a one-time fetch
      const studentRef = ref(db, `students/${userEmailKey}`);
      const datesRef = ref(db, 'ImportantDates');
      
      Promise.all([
        get(studentRef),
        get(datesRef)
      ]).then(async ([studentSnapshot, datesSnapshot]) => {
        if (!isMounted) return;

        console.log('Emulation mode fetches:', {
          studentExists: studentSnapshot.exists(),
          datesExists: datesSnapshot.exists(),
          dates: datesSnapshot.val()
        });

        const exists = studentSnapshot.exists();
        if (exists) {
          const data = studentSnapshot.val();
          const processedCourses = await processCourses(data.courses);
          
          if (!isMounted) return;

          setStudentData({
            courses: processedCourses,
            profile: data.profile || null,
            loading: false,
            error: null,
            studentExists: true,
            importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null
          });
        } else {
          setStudentData({
            courses: [],
            profile: null,
            loading: false,
            error: null,
            studentExists: false,
            importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null
          });
        }
        
        // Mark all as received
        profileReceived = true;
        coursesReceived = true;
        datesReceived = true;
      }).catch(handleError);
    } else {
      // Set up real-time listeners
      unsubscribe = setupListeners();
    }

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userEmailKey, isEmulating]);

  // Add a console log here to see if the data is correctly being returned
  console.log('useStudentData returning:', {
    hasImportantDates: !!studentData.importantDates,
    loading: studentData.loading,
    hasError: !!studentData.error
  });

  return studentData;
};