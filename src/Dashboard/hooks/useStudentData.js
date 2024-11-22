import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';

export const useStudentData = (userEmailKey) => {
  const [studentData, setStudentData] = useState({
    courses: [],
    profile: null,
    loading: true,
    error: null,
    studentExists: false
  });

  useEffect(() => {
    if (!userEmailKey) {
      setStudentData(prev => ({ ...prev, loading: false }));
      return;
    }

    const db = getDatabase();
    const studentRef = ref(db, `students/${userEmailKey}`);
    let unsubscribe = null;

    const fetchStaffMember = async (emailKey) => {
      try {
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

      // Convert array of [key, value] pairs to object, filtering out null values
      return Object.fromEntries(
        staffMembers.filter(([_, value]) => value !== null)
      );
    };

    const fetchCourseDetails = async (courseId) => {
      try {
        const courseRef = ref(db, `courses/${courseId}`);
        const snapshot = await get(courseRef);
        const courseData = snapshot.exists() ? snapshot.val() : null;
        
        if (courseData) {
          // Remove existing Teachers and SupportStaff arrays
          const { Teachers, SupportStaff, ...courseDataWithoutStaff } = courseData;
          
          const teachers = await fetchStaffMembers(Teachers || []);
          const supportStaff = await fetchStaffMembers(SupportStaff || []);
          
          const courseWithStaff = {
            ...courseDataWithoutStaff,
            teachers,
            supportStaff
          };
          
          console.log(`Course Details for ${courseId}:`, courseWithStaff);
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
          
          const courseDetails = await fetchCourseDetails(id);
          
          const mergedCourse = {
            id,
            ...studentCourse,
            courseDetails: courseDetails,
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

    const handleData = async (snapshot) => {
      try {
        const exists = snapshot.exists();
        
        if (exists) {
          const data = snapshot.val();
          console.log('Raw Student Data:', {
            profile: data.profile,
            coursesCount: data.courses ? Object.keys(data.courses).length : 0,
            notificationsCount: data.notifications ? Object.keys(data.notifications).length : 0,
            fullData: data
          });

          const processedCourses = await processCourses(data.courses);
          
          const finalData = {
            courses: processedCourses,
            profile: data.profile || null,
            loading: false,
            error: null,
            studentExists: true
          };

          console.log('Final Student Data Structure:', finalData);
          
          setStudentData(finalData);
        } else {
          console.log('No student data found');
          setStudentData({
            courses: [],
            profile: null,
            loading: false,
            error: null,
            studentExists: false
          });
        }
      } catch (error) {
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
      console.error('Firebase listener error:', error);
      setStudentData(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        studentExists: false
      }));
    };

    console.log('Setting up Firebase listener for:', userEmailKey);
    unsubscribe = onValue(studentRef, 
      (snapshot) => {
        handleData(snapshot).catch(handleError);
      }, 
      handleError
    );

    return () => {
      console.log('Cleaning up Firebase listener');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userEmailKey]);

  return studentData;
};