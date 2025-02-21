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
    studentExists: false
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

  useEffect(() => {
    let isMounted = true;
    let profileReceived = false;
    let coursesReceived = false;
    
    if (!userEmailKey) {
      setStudentData(prev => ({ ...prev, loading: false }));
      return;
    }

    const db = getDatabase();
    let unsubscribe = null;

    const checkLoadingComplete = () => {
      if (profileReceived && coursesReceived && isMounted) {
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

      // Listen for profile changes
      const profileUnsubscribe = onValue(profileRef, async (profileSnapshot) => {
        if (!isMounted) return;
        
        profileReceived = true;
        
        setStudentData(prev => ({
          ...prev,
          profile: profileSnapshot.val() || null,
          studentExists: profileSnapshot.exists()
        }));
        
        checkLoadingComplete();
      }, handleError);

      // Listen for course changes
      const coursesUnsubscribe = onValue(coursesRef, async (coursesSnapshot) => {
        if (!isMounted) return;

        coursesReceived = true;

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
        
        checkLoadingComplete();
      }, handleError);

      return () => {
        profileUnsubscribe();
        coursesUnsubscribe();
      };
    };

    if (isEmulating) {
      // For emulation, do a one-time fetch
      const studentRef = ref(db, `students/${userEmailKey}`);
      get(studentRef).then(async (snapshot) => {
        if (!isMounted) return;

        const exists = snapshot.exists();
        if (exists) {
          const data = snapshot.val();
          const processedCourses = await processCourses(data.courses);
          
          if (!isMounted) return;

          setStudentData({
            courses: processedCourses,
            profile: data.profile || null,
            loading: false,
            error: null,
            studentExists: true
          });
        } else {
          setStudentData({
            courses: [],
            profile: null,
            loading: false,
            error: null,
            studentExists: false
          });
        }
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

  return studentData;
};