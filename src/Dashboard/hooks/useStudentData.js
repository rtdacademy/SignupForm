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
        // Instead of destructuring and removing Teachers/SupportStaff,
        // keep the full course object and just enhance it with resolved staff members
        const teachers = await fetchStaffMembers(courseData.Teachers || []);
        const supportStaff = await fetchStaffMembers(courseData.SupportStaff || []);

        // Return the complete course object with resolved staff members
        return {
          ...courseData,  // Include all original course data
          teachers,       // Add resolved teacher objects
          supportStaff    // Add resolved support staff objects
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
          // No longer logging debug data for each notification
          
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



  // Mark a notification as seen - now only using Firebase
  const markNotificationSeen = async (notificationId, userEmail, notification) => {
    if (!userEmail || !notificationId) return;
    
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../../utils/sanitizeEmail');
    
    // Update the Firebase database to track this notification as seen and acknowledged
    const db = getDatabase();
    
    // For Firebase paths, use the proper sanitizeEmail function which replaces dots with commas
    const sanitizedUserEmail = sanitizeEmail(userEmail);
    
    // Primary path for the notification results in the shared results collection
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
      
      // Update the record in the main notifications results collection
      set(resultsRef, updateData);
      
      // Also store the acknowledgment in each course's notifications results
      // This is critical for letting students know which notifications they've seen
      if (studentData.courses) {
        for (const course of studentData.courses) {
          if (course.id) {
            // Path to the course-specific notification results
            const courseNotificationRef = ref(db, 
              `students/${sanitizedUserEmail}/courses/${course.id}/studentDashboardNotificationsResults/${notificationId}`);
            
            // Get any existing course-specific notification data
            get(courseNotificationRef).then(courseSnapshot => {
              const existingCourseData = courseSnapshot.exists() ? courseSnapshot.val() : {};
              
              // Create update data that preserves existing data but updates seen status
              const courseUpdateData = {
                ...existingCourseData,
                hasSeen: true,
                hasSeenTimeStamp: currentDate,
                hasAcknowledged: updateData.hasAcknowledged || false,
                acknowledgedAt: updateData.acknowledgedAt
              };
              
              // Store submission data if this is a repeating notification
              if (updateData.submissions && Object.keys(updateData.submissions).length > 0) {
                courseUpdateData.submissions = updateData.submissions;
              }
              
              // Update the course-specific record
              set(courseNotificationRef, courseUpdateData);
            }).catch(error => {
              console.error(`Error updating course notification status for course ${course.id}:`, error);
            });
          }
        }
      }
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
    // We now use Firebase exclusively for notification tracking, passing an empty object for seenNotifications
    const processedCourses = processNotificationsUtil(courses, profile, allNotifications, {});
    
    return processedCourses;
  };

  // Function to fetch required courses that all students need to complete
  const fetchRequiredCourses = async (userEmail) => {
    try {
      const db = getDatabase();
      const coursesRef = ref(db, 'courses');
      const snapshot = await get(coursesRef);

      if (!snapshot.exists()) return [];

      const coursesData = snapshot.val();
      const requiredCourses = [];

      // Loop through all courses to find ones with Active:"Required"
      for (const [id, course] of Object.entries(coursesData)) {
        if (course.Active === "Required") {
          // Check if this course should be included for this user
          const includeForUser =
            // Include if allowedEmails doesn't exist (available to everyone)
            !course.allowedEmails ||
            // Include if allowedEmails is empty (available to everyone)
            (Array.isArray(course.allowedEmails) && course.allowedEmails.length === 0) ||
            // Include if user's email is in the allowedEmails list
            (Array.isArray(course.allowedEmails) && course.allowedEmails.includes(userEmail));

          if (includeForUser) {
            // Format the required course to match the structure of student courses
            requiredCourses.push({
              id,
              CourseID: id,
              Course: { Value: course.Title },
              ActiveFutureArchived: { Value: "Active" },
              Created: course.Created || new Date().toISOString(),
              // Include the full course object here without modifications
              courseDetails: course,
              payment: {
                status: 'paid', // Always mark required courses as paid
                details: null,
                hasValidPayment: true
              },
              isRequiredCourse: true, // Flag to indicate this is a required course
              firebaseCourse: course.firebaseCourse || true
            });
          }
        }
      }

      return requiredCourses;

    } catch (error) {
      console.error('Error fetching required courses:', error);
      return [];
    }
  };

  const processCourses = async (studentCourses) => {
    // Initialize an array to hold all courses (student-enrolled and required)
    let allCourses = [];

    // Process student-enrolled courses if they exist
    if (studentCourses) {
      const courseEntries = Object.entries(studentCourses)
        .filter(([key]) => key !== 'sections' && key !== 'normalizedSchedule');

      const coursesWithDetails = await Promise.all(
        courseEntries.map(async ([id, studentCourse]) => {
          // Fetch the complete course details and payment info
          const [courseDetails, paymentInfo] = await Promise.all([
            fetchCourseDetails(id),  // This now returns the complete course object
            fetchPaymentDetails(id)
          ]);

          // Return the enhanced student course object with complete course details
          return {
            id,
            ...studentCourse,
            courseDetails: courseDetails,  // This will include all course properties from Firebase
            payment: paymentInfo || {
              status: 'unpaid',
              details: null,
              hasValidPayment: false
            }
          };
        })
      );

      // Filter out any undefined courses and add to allCourses
      allCourses = coursesWithDetails.filter(course => course);
    }

    // Get the student's email if profile is available
    const userEmail = studentData.profile?.StudentEmail;

    // Fetch and add required courses if we have the user's email
    if (userEmail) {
      const requiredCourses = await fetchRequiredCourses(userEmail);

      // Add required courses to allCourses, avoiding duplicates
      for (const requiredCourse of requiredCourses) {
        // Check if this required course is already in the student's courses
        const isDuplicate = allCourses.some(course => course.id === requiredCourse.id);

        if (!isDuplicate) {
          allCourses.push(requiredCourse);
        }
      }
    }

    // Sort all courses by creation date
    return allCourses.sort((a, b) => new Date(b.Created) - new Date(a.Created));
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

  // Add a simplified notification summary log
  if (!studentData.loading && studentData.profile) {
    const visibleNotifications = studentData.courses?.reduce((count, course) => {
      if (!course.notificationIds) return count;
      return count + Object.values(course.notificationIds)
        .filter(n => n.shouldDisplay).length;
    }, 0) || 0;
    
    console.log('📋 NOTIFICATION SUMMARY:', {
      totalActive: studentData.allNotifications?.length || 0,
      visibleNotifications,
      coursesWithNotifications: studentData.courses?.filter(c => 
        c.notificationIds && Object.keys(c.notificationIds).length > 0
      ).length || 0
    });
  }
  

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
      
      // For surveys, we want to track completion per course
      // Keep existing course completions and add this one
      const existingCourseIds = existingData.courseIds || [];
      const existingCourses = existingData.courses || [];
      
      // Add current course if not already in the list
      if (!existingCourseIds.includes(courseId)) {
        existingCourseIds.push(courseId);
        existingCourses.push({
          id: courseId,
          title: courseDetails?.courseDetails?.Title || `Course ${courseId}`
        });
      }
      
      let updateData = {
        ...existingData,
        completed: true,
        completedAt: currentDate,
        answers: answers,
        courseIds: existingCourseIds,
        courses: existingCourses,
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
        
        // IMPORTANT: Also update the course-specific notification result
        // This ensures that the survey is marked as completed for THIS specific course
        const courseNotificationRef = ref(db, 
          `students/${sanitizedUserEmail}/courses/${courseId}/studentDashboardNotificationsResults/${notificationId}`);
        
        // Create course-specific completion record
        const courseSpecificData = {
          completed: true,
          completedAt: currentDate,
          courseId: courseId,
          notificationId: notificationId,
          // For repeating surveys, also store submission history
          ...(updateData.submissions && { submissions: updateData.submissions })
        };
        
        set(courseNotificationRef, courseSpecificData).then(() => {
          console.log(`Survey marked as completed for course ${courseId}`);
        }).catch(error => {
          console.error(`Error updating course-specific notification status: ${error}`);
        });
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
                            
        // No longer logging detailed notification data when marking as seen
        
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