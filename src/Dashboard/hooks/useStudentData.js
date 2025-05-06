import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { 
  calculateAge as calculateAgeUtil,
  processNotificationsForCourses as processNotificationsUtil
} from '../../utils/notificationFilterUtils';

export const useStudentData = (userEmailKey) => {
  const { isEmulating } = useAuth();
  const [studentData, setStudentData] = useState({
    courses: [],
    profile: null,
    loading: true,
    error: null,
    studentExists: false,
    importantDates: null,
    allNotifications: [] // Store all notifications before filtering
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

  // Fetch only active notifications using a query
  const fetchNotifications = async () => {
    try {
      const db = getDatabase();
      const notificationsRef = ref(db, 'studentDashboardNotifications');
      // Create a query for active notifications only
      const activeNotificationsQuery = query(
        notificationsRef,
        orderByChild('active'),
        equalTo(true)
      );
      const snapshot = await get(activeNotificationsQuery);
      
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        console.log(`Fetched ${Object.keys(notificationsData).length} active notifications`);
        // Convert to array with IDs
        return Object.entries(notificationsData).map(([id, data]) => ({
          id,
          ...data
        }));
      }
      console.log('No active notifications found');
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  // Function to calculate age from birthdate - using utility function
  const calculateAge = calculateAgeUtil;

  // Store seen notifications in local storage to handle one-time notifications
  const getSeenNotifications = (userEmail) => {
    if (!userEmail) return {};
    
    const storageKey = `seen_notifications_${userEmail.replace(/\./g, '_')}`;
    let seenNotifications = {};
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        seenNotifications = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    
    return seenNotifications;
  };

  // Mark a notification as seen
  const markNotificationSeen = (notificationId, userEmail) => {
    if (!userEmail || !notificationId) return;
    
    const storageKey = `seen_notifications_${userEmail.replace(/\./g, '_')}`;
    let seenNotifications = getSeenNotifications(userEmail);
    
    // Mark as seen locally
    seenNotifications[notificationId] = Date.now();
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(seenNotifications));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
    
    // Update the Firebase database to track this notification as seen and acknowledged
    const db = getDatabase();
    const sanitizedEmail = userEmail.replace(/\./g, '_');
    const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedEmail}`);
    
    // First try to get existing data so we don't overwrite survey results
    get(resultsRef).then(snapshot => {
      const existingData = snapshot.exists() ? snapshot.val() : {};
      
      // Update with hasSeen, hasSeenTimeStamp, and acknowledged
      set(resultsRef, {
        ...existingData,
        hasSeen: true,
        hasSeenTimeStamp: new Date().toISOString(),
        acknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        userEmail: userEmail
      });
    }).catch(error => {
      console.error('Error updating notification seen status in Firebase:', error);
      
      // Fallback: create a new entry if get() fails
      set(resultsRef, {
        hasSeen: true,
        hasSeenTimeStamp: new Date().toISOString(),
        acknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        userEmail: userEmail
      }).catch(error => {
        console.error('Error updating notification seen status in Firebase (fallback):', error);
      });
    });
  };

  // Process notifications for each course - using the utility function
  const processNotificationsForCourses = (courses, profile, allNotifications) => {
    // Log the student data we have for matching
    console.log('Processing notifications for student:', {
      email: profile?.StudentEmail,
      age: calculateAge(profile?.birthday),
      birthday: profile?.birthday,
      notificationCount: allNotifications?.length || 0
    });
    
    // Get previously seen notifications
    const seenNotifications = profile?.StudentEmail ? getSeenNotifications(profile.StudentEmail) : {};
    
    // Use the utility function to process notifications
    return processNotificationsUtil(courses, profile, allNotifications, seenNotifications);
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
    let notificationsReceived = false;
    
    console.log('useStudentData effect running, userEmailKey:', userEmailKey);
    
    // Always fetch important dates and notifications, regardless of userEmailKey
    const fetchInitialData = async () => {
      try {
        const [dates, notifications] = await Promise.all([
          fetchImportantDates(),
          fetchNotifications()
        ]);
        
        if (isMounted) {
          console.log('Fetched ImportantDates:', dates);
          console.log('Fetched Notifications:', notifications.length);
          
          setStudentData(prev => ({
            ...prev,
            importantDates: dates,
            allNotifications: notifications
          }));
          
          datesReceived = true;
          notificationsReceived = true;
          
          // If this is a new user (no userEmailKey), we need to mark loading as complete
          if (!userEmailKey) {
            setStudentData(prev => ({ ...prev, loading: false }));
          } else {
            checkLoadingComplete();
          }
        }
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
        datesReceived = true;
        notificationsReceived = true;
        if (!userEmailKey) {
          setStudentData(prev => ({ ...prev, loading: false }));
        } else {
          checkLoadingComplete();
        }
      }
    };
    
    // Execute fetchInitialData immediately
    fetchInitialData();
    
    // If no userEmailKey, we're done after fetching dates and notifications
    if (!userEmailKey) {
      // We're not setting loading to false right away, as fetchInitialData will do that
      profileReceived = true;
      coursesReceived = true;
      return;
    }

    const db = getDatabase();
    let unsubscribe = null;

    const checkLoadingComplete = () => {
      console.log('checkLoadingComplete:', { 
        profileReceived, 
        coursesReceived, 
        datesReceived, 
        notificationsReceived,
        isMounted 
      });
      
      if (profileReceived && coursesReceived && datesReceived && notificationsReceived && isMounted) {
        setStudentData(prev => {
          // Process all data now that we have everything
          if (prev.profile && prev.courses && prev.courses.length > 0 && prev.allNotifications) {
            // Process notifications for each course
            const coursesWithNotifications = processNotificationsForCourses(
              prev.courses,
              prev.profile,
              prev.allNotifications
            );
            
            return {
              ...prev,
              loading: false,
              courses: coursesWithNotifications
            };
          }
          
          return {
            ...prev,
            loading: false
          };
        });
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
      const notificationsRef = ref(db, 'studentDashboardNotifications');
      // Create a query for active notifications only
      const activeNotificationsQuery = query(
        notificationsRef,
        orderByChild('active'),
        equalTo(true)
      );

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
      const coursesUnsubscribe = onValue(coursesRef, async (coursesSnapshot) => {
        if (!isMounted) return;

        console.log('Courses received:', coursesSnapshot.exists());

        if (coursesSnapshot.exists()) {
          const coursesData = coursesSnapshot.val();
          const processedCourses = await processCourses(coursesData);
          
          if (!isMounted) return;

          setStudentData(prev => {
            // Need to re-process notifications if courses changed
            let updatedCourses = processedCourses;
            
            if (prev.profile && prev.allNotifications) {
              updatedCourses = processNotificationsForCourses(
                processedCourses,
                prev.profile,
                prev.allNotifications
              );
            }
            
            return {
              ...prev,
              courses: updatedCourses,
              studentExists: true
            };
          });
        } else {
          setStudentData(prev => ({
            ...prev,
            courses: []
          }));
        }
        
        // Mark courses as received after async processing is complete
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
      
      // Listen for active notifications changes using the query
      const notificationsUnsubscribe = onValue(activeNotificationsQuery, async (notificationsSnapshot) => {
        if (!isMounted) return;
        
        console.log('Active notifications received via listener:', notificationsSnapshot.exists());
        
        if (notificationsSnapshot.exists()) {
          const notificationsData = notificationsSnapshot.val();
          const notificationsArray = Object.entries(notificationsData).map(([id, data]) => ({
            id,
            ...data
          }));
          
          console.log(`Received ${notificationsArray.length} active notifications`);
          
          setStudentData(prev => {
            // Need to re-process notifications if they changed
            let updatedCourses = prev.courses;
            
            if (prev.profile && prev.courses && prev.courses.length > 0) {
              updatedCourses = processNotificationsForCourses(
                prev.courses,
                prev.profile,
                notificationsArray
              );
            }
            
            return {
              ...prev,
              allNotifications: notificationsArray,
              courses: updatedCourses
            };
          });
        } else {
          setStudentData(prev => ({
            ...prev,
            allNotifications: []
          }));
        }
        
        notificationsReceived = true;
        checkLoadingComplete();
      }, handleError);

      return () => {
        profileUnsubscribe();
        coursesUnsubscribe();
        datesUnsubscribe();
        notificationsUnsubscribe();
      };
    };

    if (isEmulating) {
      // For emulation, do a one-time fetch
      const studentRef = ref(db, `students/${userEmailKey}`);
      const datesRef = ref(db, 'ImportantDates');
      // Use query for active notifications only
      const activeNotificationsQuery = query(
        ref(db, 'studentDashboardNotifications'),
        orderByChild('active'),
        equalTo(true)
      );
      
      Promise.all([
        get(studentRef),
        get(datesRef),
        get(activeNotificationsQuery)
      ]).then(async ([studentSnapshot, datesSnapshot, notificationsSnapshot]) => {
        if (!isMounted) return;

        console.log('Emulation mode fetches:', {
          studentExists: studentSnapshot.exists(),
          datesExists: datesSnapshot.exists(),
          notificationsExists: notificationsSnapshot.exists()
        });

        // Process notifications
        let allNotifications = [];
        if (notificationsSnapshot.exists()) {
          const notificationsData = notificationsSnapshot.val();
          allNotifications = Object.entries(notificationsData).map(([id, data]) => ({
            id,
            ...data
          }));
          console.log(`Fetched ${allNotifications.length} active notifications in emulation mode`);
        }

        const exists = studentSnapshot.exists();
        if (exists) {
          const data = studentSnapshot.val();
          let processedCourses = await processCourses(data.courses);
          
          if (!isMounted) return;
          
          // Add notifications to courses if we have profile data
          if (data.profile) {
            processedCourses = processNotificationsForCourses(
              processedCourses,
              data.profile,
              allNotifications
            );
          }

          setStudentData({
            courses: processedCourses,
            profile: data.profile || null,
            loading: false,
            error: null,
            studentExists: true,
            importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null,
            allNotifications: allNotifications
          });
        } else {
          setStudentData({
            courses: [],
            profile: null,
            loading: false,
            error: null,
            studentExists: false,
            importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null,
            allNotifications: allNotifications
          });
        }
        
        // Mark all as received
        profileReceived = true;
        coursesReceived = true;
        datesReceived = true;
        notificationsReceived = true;
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

  // Add a detailed console log to see complete student data for debugging
  if (!studentData.loading && studentData.profile) {
    console.log('====== COMPLETE STUDENT DATA FOR NOTIFICATION FILTERING ======');
    console.log('STUDENT EMAIL KEY:', userEmailKey);
    
    // Log the entire raw studentData object for complete reference
    console.log('COMPLETE RAW STUDENT DATA:', JSON.parse(JSON.stringify(studentData)));
    
    // Log detailed profile information
    console.log('PROFILE DATA:', {
      ...studentData.profile,
      // Extract specific fields for easy reference
      email: studentData.profile.StudentEmail,
      firstName: studentData.profile.firstName,
      lastName: studentData.profile.lastName,
      fullName: `${studentData.profile.firstName || ''} ${studentData.profile.lastName || ''}`,
      age: calculateAge(studentData.profile.birthday)
    });
    
    // Log courses with notifications
    console.log('COURSES WITH NOTIFICATIONS:', studentData.courses?.map(course => ({
      id: course.id,
      title: course.courseDetails?.Title,
      studentType: course.StudentType?.Value,
      scheduleEndDate: course.ScheduleEndDate,
      schoolYear: course.School_x0020_Year?.Value,
      notificationCount: course.notificationIds ? Object.keys(course.notificationIds).length : 0,
      notifications: course.notificationIds || {}
    })));
    
    console.log('==========================================================');
  }
  
  // Standard summary log
  console.log('useStudentData returning:', {
    hasImportantDates: !!studentData.importantDates,
    loading: studentData.loading,
    hasError: !!studentData.error,
    totalNotificationCount: studentData.allNotifications?.length || 0,
    coursesWithNotifications: studentData.courses?.filter(c => c.notificationIds && Object.keys(c.notificationIds).length > 0).length || 0
  });

  // Add a utility function to mark a notification as seen
  const markNotificationAsSeen = (notificationId) => {
    if (!studentData.profile || !studentData.profile.StudentEmail) return;
    
    markNotificationSeen(notificationId, studentData.profile.StudentEmail);
    
    // Update the courses to reflect that this notification has been seen
    setStudentData(prev => {
      const updatedCourses = prev.courses.map(course => {
        if (!course.notificationIds || !course.notificationIds[notificationId]) {
          return course;
        }
        
        // Create a new course object to avoid mutation
        const updatedCourse = { ...course };
        updatedCourse.notificationIds = { ...course.notificationIds };
        
        // Mark this notification as seen if it's one-time (for all courses)
        if (updatedCourse.notificationIds[notificationId].type === 'once') {
          updatedCourse.notificationIds[notificationId] = {
            ...updatedCourse.notificationIds[notificationId],
            shouldDisplay: false
          };
        }
        
        return updatedCourse;
      });
      
      return {
        ...prev,
        courses: updatedCourses
      };
    });
  };

  // Return the data along with the utility function
  return {
    ...studentData,
    markNotificationAsSeen
  };
};