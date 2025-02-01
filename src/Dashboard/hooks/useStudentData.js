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
      // Get the payment status from the students node
      const statusRef = ref(db, `students/${userEmailKey}/courses/${courseId}/payment_status/status`);
      const statusSnapshot = await get(statusRef);
      const status = statusSnapshot.val();

      // Get the detailed payment information from the payments node
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
        
        const courseWithStaff = {
          ...courseDataWithoutStaff,
          teachers,
          supportStaff
        };
        
        return courseWithStaff;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  };

  const processCourses = async (studentCourses) => {
    console.log('Raw Student Courses Data:', studentCourses);

    if (!studentCourses) return [];

    const courseEntries = Object.entries(studentCourses)
      .filter(([key]) => key !== 'sections');

    console.log('Filtered Course Entries:', courseEntries);

    const coursesWithDetails = await Promise.all(
      courseEntries.map(async ([id, studentCourse]) => {
        console.log(`Processing course ${id}:`, studentCourse);
        
        const [courseDetails, paymentInfo] = await Promise.all([
          fetchCourseDetails(id),
          fetchPaymentDetails(id)
        ]);
        
        const mergedCourse = {
          id,
          ...studentCourse,
          courseDetails: courseDetails,
          payment: paymentInfo || {
            status: 'unpaid',
            details: null,
            hasValidPayment: false
          }
        };

        console.log(`Merged course data for ${id}:`, mergedCourse);
        return mergedCourse;
      })
    );

    const sortedCourses = coursesWithDetails
      .filter(course => course)
      .sort((a, b) => new Date(b.Created) - new Date(a.Created));

    console.log('Final processed courses:', sortedCourses);
    return sortedCourses;
  };

  useEffect(() => {
    let isMounted = true; // Add mounted flag
    
    if (!userEmailKey) {
      setStudentData(prev => ({ ...prev, loading: false }));
      return;
    }

    const db = getDatabase();
    const studentRef = ref(db, `students/${userEmailKey}`);
    let unsubscribe = null;

    const handleData = async (snapshot) => {
      if (!isMounted) return; // Check if still mounted

      try {
        const exists = snapshot.exists();
        
        if (exists) {
          const data = snapshot.val();
          
          // Batch all the async operations together
          const processedCourses = await processCourses(data.courses);
          
          if (!isMounted) return; // Check again after async operations

          const finalData = {
            courses: processedCourses,
            profile: data.profile || null,
            loading: false,
            error: null,
            studentExists: true
          };
          
          setStudentData(finalData);
        } else {
          if (!isMounted) return;
          
          setStudentData({
            courses: [],
            profile: null,
            loading: false,
            error: null,
            studentExists: false
          });
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error processing student data:', error);
        setStudentData(prev => ({
          ...prev,
          loading: false,
          error: error.message,
          studentExists: false
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

    const fetchData = async () => {
      try {
        const snapshot = await get(studentRef);
        await handleData(snapshot);
      } catch (error) {
        handleError(error);
      }
    };

    if (isEmulating) {
      // Single fetch for emulation
      fetchData();
    } else {
      // Real-time listener for normal mode
      unsubscribe = onValue(
        studentRef,
        snapshot => handleData(snapshot),
        handleError
      );
    }

    return () => {
      isMounted = false; // Cleanup
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userEmailKey, isEmulating]); // Keep these dependencies

  return studentData;
};