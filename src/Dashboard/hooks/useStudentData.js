import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { 
  calculateAge as calculateAgeUtil,
  processNotificationsForCourses as processNotificationsUtil,
  getCurrentDate,
  setMockDate,
  resetNotificationAcknowledgment
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
        
        // Convert to array with IDs, explicitly handling important config properties
        const notifications = Object.entries(notificationsData).map(([id, data]) => {
          // Debug the fetched notification data
          if (process.env.NODE_ENV === 'development') {
            console.log(`Notification ${id} raw data:`, {
              id,
              title: data.title,
              type: data.type,
              hasDisplayConfig: !!data.displayConfig,
              displayConfigFrequency: data.displayConfig?.frequency,
              hasRenewalConfig: !!data.renewalConfig,
              renewalConfigMethod: data.renewalConfig?.method
            });
          }
          
          // Directly return the data with ID added
          return {
            id,
            ...data
          };
        });
        
        return notifications;
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
  const markNotificationSeen = async (notificationId, userEmail, notification) => {
    if (!userEmail || !notificationId) return;
    
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../../utils/sanitizeEmail');
    
    // Use the sanitizeEmail function to get the proper format for storage keys
    // For localStorage we still use underscores since periods are not recommended in keys
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
    
    // For Firebase paths, use the proper sanitizeEmail function which replaces dots with commas
    const sanitizedUserEmail = sanitizeEmail(userEmail);
    const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
    
    // First try to get existing data so we don't overwrite survey results
    get(resultsRef).then(snapshot => {
      const existingData = snapshot.exists() ? snapshot.val() : {};
      const currentTimestamp = Date.now();
      const currentDate = new Date().toISOString();
      
      // Base update data for any notification type
      let updateData = {
        ...existingData,
        hasSeen: true,
        hasSeenTimeStamp: currentDate,
        acknowledged: true,
        acknowledgedAt: currentDate,
        userEmail: userEmail
      };
      
      // Add window function for testing
      if (!window.resetNotificationStatus) {
        window.resetNotificationStatus = async (notificationId, email) => {
          return await resetNotificationAcknowledgment(notificationId, email);
        };
      }
      
      // Add window function for date mocking
      if (!window.mockDate) {
        window.mockDate = (dateString) => {
          return setMockDate(dateString ? new Date(dateString) : null);
        };
      }
      
      // Get display frequency from notification properties, with strong prioritization
      // 1. Use displayConfig.frequency if available (new format)
      // 2. Use explicit type-based identification (weekly-survey)
      // 3. Use renewalConfig if available (transitional format)
      // 4. Check for repeatInterval (legacy format)
      // 5. Fall back to one-time as default
      const displayFrequency = 
        // New primary structure
        notification?.displayConfig?.frequency || 
        // Type-based detection
        (notification?.type === 'weekly-survey' ? 'weekly' : 
        // Legacy renewalConfig structure
        (notification?.renewalConfig?.method === 'day' ? 'weekly' : 
         notification?.renewalConfig?.method === 'custom' ? 'custom' : 
        // Legacy repeatInterval structure
        (notification?.repeatInterval ? 
          (notification?.repeatInterval.unit === 'day' ? 'weekly' : 
           notification?.repeatInterval.unit === 'week' ? 'weekly' : 
           notification?.repeatInterval.unit === 'month' ? 'monthly' : 'custom') :
        // Default fallback
        'one-time')));
          
      // Determine if this is a survey type
      const isSurveyType = notification?.type === 'survey' || 
                          notification?.type === 'weekly-survey' || 
                          (notification?.type === 'notification' && notification?.surveyQuestions);
      
      // Determine if this is a repeating notification
      // A notification repeats if it has any frequency other than one-time,
      // or has any repeating configuration in any format
      const hasRepeatInterval = displayFrequency === 'weekly' || 
                              displayFrequency === 'monthly' ||
                              displayFrequency === 'custom' ||
                              !!notification?.repeatInterval || 
                              !!notification?.renewalConfig ||
                              notification?.type === 'weekly-survey' ||
                              notification?.type === 'recurring';
      
      // For any non-one-time notification, track history
      if (notification && (displayFrequency === 'weekly' || displayFrequency === 'custom' || hasRepeatInterval)) {
        // Store with timestamp to keep historical record
        if (!updateData.submissions) {
          updateData.submissions = {};
        }
        
        // Only record timestamp but don't add answers yet - those are added when survey is submitted
        updateData.submissions[currentTimestamp] = {
          seen: true,
          seenAt: currentDate
        };
        
        // Update the lastSeen timestamp
        updateData.lastSeen = currentDate;
      }
      
      // Update the record
      set(resultsRef, updateData);
    }).catch(error => {
      console.error('Error updating notification seen status in Firebase:', error);
      
      // Fallback: create a new entry if get() fails
      const currentTimestamp = Date.now();
      const currentDate = new Date().toISOString();
      
      // Base update data for new entry
      let updateData = {
        hasSeen: true,
        hasSeenTimeStamp: currentDate,
        acknowledged: true,
        acknowledgedAt: currentDate,
        userEmail: userEmail
      };
      
      // Get display frequency from notification properties, with strong prioritization
      // 1. Use displayConfig.frequency if available (new format)
      // 2. Use explicit type-based identification (weekly-survey)
      // 3. Use renewalConfig if available (transitional format)
      // 4. Check for repeatInterval (legacy format)
      // 5. Fall back to one-time as default
      const displayFrequency = 
        // New primary structure
        notification?.displayConfig?.frequency || 
        // Type-based detection
        (notification?.type === 'weekly-survey' ? 'weekly' : 
        // Legacy renewalConfig structure
        (notification?.renewalConfig?.method === 'day' ? 'weekly' : 
         notification?.renewalConfig?.method === 'custom' ? 'custom' : 
        // Legacy repeatInterval structure
        (notification?.repeatInterval ? 
          (notification?.repeatInterval.unit === 'day' ? 'weekly' : 
           notification?.repeatInterval.unit === 'week' ? 'weekly' : 
           notification?.repeatInterval.unit === 'month' ? 'monthly' : 'custom') :
        // Default fallback
        'one-time')));
      
      // Determine if this is a repeating notification
      // A notification repeats if it has any frequency other than one-time,
      // or has any repeating configuration in any format
      const hasRepeatInterval = displayFrequency === 'weekly' || 
                               displayFrequency === 'monthly' ||
                               displayFrequency === 'custom' ||
                               !!notification?.repeatInterval || 
                               !!notification?.renewalConfig ||
                               notification?.type === 'weekly-survey' ||
                               notification?.type === 'recurring';
      
      // For repeating notifications, initialize interaction history
      if (notification && (displayFrequency === 'weekly' || displayFrequency === 'custom' || hasRepeatInterval)) {
        updateData.submissions = {
          [currentTimestamp]: {
            seen: true,
            seenAt: currentDate
          }
        };
        updateData.lastSeen = currentDate;
      }
      
      set(resultsRef, updateData).catch(error => {
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
    
    // Debug all notifications before processing
    if (process.env.NODE_ENV === 'development' && allNotifications?.length > 0) {
      console.log('Raw notification objects before processing:', allNotifications.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        hasDisplayConfig: !!n.displayConfig,
        displayConfig: n.displayConfig ? {
          frequency: n.displayConfig.frequency,
          dayOfWeek: n.displayConfig.dayOfWeek,
          hasDates: !!n.displayConfig.dates
        } : null,
        hasRenewalConfig: !!n.renewalConfig,
        renewalConfig: n.renewalConfig ? {
          method: n.renewalConfig.method,
          dayOfWeek: n.renewalConfig.dayOfWeek,
          hasDates: !!n.renewalConfig.dates
        } : null,
        hasRepeatInterval: !!n.repeatInterval,
        repeatInterval: n.repeatInterval,
        hasRepeatIntervalProperty: n.hasOwnProperty('repeatInterval')
      })));
    }
    
    // Get previously seen notifications
    const seenNotifications = profile?.StudentEmail ? getSeenNotifications(profile.StudentEmail) : {};
    
    // Use the utility function to process notifications
    const processedCourses = processNotificationsUtil(courses, profile, allNotifications, seenNotifications);
    
    // Debug processed notifications in each course
    if (process.env.NODE_ENV === 'development') {
      processedCourses.forEach(course => {
        if (course.notificationIds && Object.keys(course.notificationIds).length > 0) {
          console.log(`Processed notifications for course ${course.id}:`, 
            Object.values(course.notificationIds).map(n => ({
              id: n.id,
              title: n.title,
              type: n.type,
              hasDisplayConfig: !!n.displayConfig,
              displayConfig: n.displayConfig ? {
                frequency: n.displayConfig.frequency,
                dayOfWeek: n.displayConfig.dayOfWeek,
                hasDates: !!n.displayConfig.dates
              } : null,
              hasRenewalConfig: !!n.renewalConfig,
              renewalConfig: n.renewalConfig ? {
                method: n.renewalConfig.method,
                dayOfWeek: n.renewalConfig.dayOfWeek,
                hasDates: !!n.renewalConfig.dates
              } : null,
              hasRepeatInterval: !!n.repeatInterval,
              repeatInterval: n.repeatInterval,
              hasRepeatIntervalProperty: n.hasOwnProperty('repeatInterval'),
              shouldDisplay: n.shouldDisplay
            }))
          );
        }
      });
    }
    
    return processedCourses;
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

  // Function to handle survey submission
  const submitSurveyResponse = async (notificationId, courseId, answers) => {
    if (!studentData.profile || !studentData.profile.StudentEmail) return;
    
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../../utils/sanitizeEmail');
    
    const userEmail = studentData.profile.StudentEmail;
    // Use the proper sanitized email format for database paths
    const sanitizedUserEmail = sanitizeEmail(userEmail);
    const db = getDatabase();
    const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
    
    // Get notification details to determine if it's a weekly survey
    const notification = studentData.courses
      .find(course => course.id === courseId)?.notificationIds?.[notificationId];
      
    if (!notification) return;
    
    // Get current data first
    get(resultsRef).then(snapshot => {
      const existingData = snapshot.exists() ? snapshot.val() : {};
      const currentTimestamp = Date.now();
      const currentDate = new Date().toISOString();
      const courseDetails = studentData.courses.find(c => c.id === courseId);
      
      let updateData = {
        ...existingData,
        completed: true,
        completedAt: currentDate,
        answers: answers,
        courseIds: [courseId],
        courses: [{
          id: courseId,
          title: courseDetails?.courseDetails?.Title || `Course ${courseId}`
        }],
        email: userEmail,
        notificationId: notificationId,
        studentEmail: userEmail,
        studentName: `${studentData.profile.firstName || ''} ${studentData.profile.lastName || ''}`.trim()
      };
      
      // Get display frequency from notification properties, with strong prioritization
      // 1. Use displayConfig.frequency if available (new format)
      // 2. Use explicit type-based identification (weekly-survey)
      // 3. Use renewalConfig if available (transitional format)
      // 4. Check for repeatInterval (legacy format)
      // 5. Fall back to one-time as default
      const displayFrequency = 
        // New primary structure
        notification?.displayConfig?.frequency || 
        // Type-based detection
        (notification?.type === 'weekly-survey' ? 'weekly' : 
        // Legacy renewalConfig structure
        (notification?.renewalConfig?.method === 'day' ? 'weekly' : 
         notification?.renewalConfig?.method === 'custom' ? 'custom' : 
        // Legacy repeatInterval structure
        (notification?.repeatInterval ? 
          (notification?.repeatInterval.unit === 'day' ? 'weekly' : 
           notification?.repeatInterval.unit === 'week' ? 'weekly' : 
           notification?.repeatInterval.unit === 'month' ? 'monthly' : 'custom') :
        // Default fallback
        'one-time')));
          
      // For repeating surveys (weekly or custom), store in the submissions history
      if (displayFrequency === 'weekly' || displayFrequency === 'custom' || notification.type === 'weekly-survey') {
        if (!updateData.submissions) {
          updateData.submissions = {};
        }
        
        // Add the submission with answers
        updateData.submissions[currentTimestamp] = {
          answers: answers,
          submittedAt: currentDate,
          courseIds: [courseId],
          courses: [{
            id: courseId,
            title: courseDetails?.courseDetails?.Title || `Course ${courseId}`
          }]
        };
        
        // Update the lastSubmitted timestamp
        updateData.lastSubmitted = currentDate;
        
        // For repeating surveys, completed is temporary (until next cycle)
        updateData.completed = true;
        
        // Calculate and store the next renewal date based on the frequency
        if (displayFrequency === 'weekly') {
          const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                        notification.renewalConfig?.dayOfWeek || 'monday';
          
          const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
            'thursday': 4, 'friday': 5, 'saturday': 6
          };
          const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1; // Default to Monday
          
          // Start with today's date for calculation
          let nextRenewalDate = new Date();
          
          // Add days until we reach the target day of the week
          while (nextRenewalDate.getDay() !== targetDayNum) {
            nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
          }
          
          // If today is the target day, add 7 days for next week
          if (nextRenewalDate.getDay() === new Date().getDay()) {
            nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
          }
          
          // Store the next renewal date
          updateData.nextRenewalDate = nextRenewalDate.toISOString();
          console.log(`Set next renewal date to ${updateData.nextRenewalDate} for ${dayOfWeek}`);
        }
      }
      
      // Update the record
      set(resultsRef, updateData).then(() => {
        console.log('Survey response submitted successfully!');
      }).catch(error => {
        console.error('Error submitting survey response:', error);
      });
    }).catch(error => {
      console.error('Error getting existing data:', error);
    });
  };

  // Add a utility function to mark a notification as seen
  const markNotificationAsSeen = async (notificationId) => {
    if (!studentData.profile || !studentData.profile.StudentEmail) return;
    
    // Get notification details
    let notification = null;
    for (const course of studentData.courses) {
      if (course.notificationIds && course.notificationIds[notificationId]) {
        notification = course.notificationIds[notificationId];
        break;
      }
    }
    
    await markNotificationSeen(notificationId, studentData.profile.StudentEmail, notification);
    
    // Update the courses to reflect that this notification has been seen
    setStudentData(prev => {
      const updatedCourses = prev.courses.map(course => {
        if (!course.notificationIds || !course.notificationIds[notificationId]) {
          return course;
        }
        
        // Create a new course object to avoid mutation
        const updatedCourse = { ...course };
        updatedCourse.notificationIds = { ...course.notificationIds };
        
        const notification = updatedCourse.notificationIds[notificationId];
        
        // Check for displayConfig first, then fall back to legacy configuration
        const displayFrequency = notification.displayConfig?.frequency || 
          (notification.type === 'weekly-survey' ? 'weekly' : 
          (notification.renewalConfig?.method === 'day' ? 'weekly' : 
            notification.renewalConfig?.method === 'custom' ? 'custom' : 'one-time'));
            
        // Determine if this is a one-time notification type
        const isOneTimeType = displayFrequency === 'one-time' ||
                            notification.type === 'once' || 
                            (notification.type === 'notification' && !notification.repeatInterval) ||
                            (notification.type === 'survey' && !notification.repeatInterval && notification.type !== 'weekly-survey');
                            
        // For debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Marking notification as seen:', {
            id: notification.id,
            type: notification.type,
            displayFrequency,
            hasRepeatInterval: !!notification.repeatInterval,
            repeatInterval: notification.repeatInterval,
            isOneTimeType
          });
        }
        
        // Mark this notification as seen if it's one-time (for all courses)
        if (isOneTimeType || displayFrequency === 'one-time') {
          updatedCourse.notificationIds[notificationId] = {
            ...notification,
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

  // Add a function to force refresh data
  const forceRefresh = async () => {
    console.log("Force refresh requested!");
    
    try {
      // Re-fetch notifications
      const notifications = await fetchNotifications();
      
      // Re-process notifications for courses if we have data
      let updatedCourses = studentData.courses;
      if (studentData.profile && studentData.courses && studentData.courses.length > 0) {
        updatedCourses = processNotificationsForCourses(
          studentData.courses,
          studentData.profile,
          notifications
        );
      }
      
      // Update state with new data
      setStudentData(prev => ({
        ...prev,
        allNotifications: notifications,
        courses: updatedCourses
      }));
      
      console.log("Force refresh completed with", notifications.length, "notifications");
      return true;
    } catch (error) {
      console.error("Error during force refresh:", error);
      return false;
    }
  };
  
  // Listen for refresh events
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log("Notification refresh event received");
      forceRefresh();
    };
    
    // Add event listener
    window.addEventListener('notification-refresh-needed', handleRefreshEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('notification-refresh-needed', handleRefreshEvent);
    };
  }, []);
  
  // Add the global refresh function for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshStudentData = forceRefresh;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshStudentData;
      }
    };
  }, []);

  // Return the data along with the utility functions
  return {
    ...studentData,
    markNotificationAsSeen,
    submitSurveyResponse,
    forceRefresh
  };
};