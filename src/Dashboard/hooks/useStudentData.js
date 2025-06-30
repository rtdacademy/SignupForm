import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  
  // Track real-time course details separate from student course enrollment
  const [courseDetails, setCourseDetails] = useState({});
  
  // Track active course listeners for cleanup
  const courseListenersRef = useRef({});

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

  // Fetch course configuration from database with file fallback
  const fetchCourseConfig = async (courseId) => {
    try {
      const db = getDatabase();
      const courseConfigRef = ref(db, `courses/${courseId}/course-config`);
      const configSnapshot = await get(courseConfigRef);
      
      if (configSnapshot.exists()) {
        return configSnapshot.val();
      }
      
      // Fallback: try to get from Firebase Function that reads local files
      const functions = getFunctions();
      const getCourseConfigV2 = httpsCallable(functions, 'getCourseConfigV2');
      const result = await getCourseConfigV2({ courseId });
      
      if (result.data.success) {
        return result.data.config;
      }
      
      console.warn(`Course config not found in database or file for ${courseId}`);
      return null;
    } catch (error) {
      console.error(`Error fetching course config for ${courseId}:`, error);
      return null;
    }
  };

  // Set up real-time listener for course details
  const setupCourseListener = (courseId) => {
    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}`);
    const courseConfigRef = ref(db, `courses/${courseId}/course-config`);
    
    
    // Listen to both course data and course config changes
    const courseUnsubscribe = onValue(courseRef, async (snapshot) => {
      try {
        const courseData = snapshot.exists() ? snapshot.val() : null;

        if (courseData) {
          // Enhance with resolved staff members
          const teachers = await fetchStaffMembers(courseData.Teachers || []);
          const supportStaff = await fetchStaffMembers(courseData.SupportStaff || []);
          
          // Fetch course configuration
          const courseConfig = await fetchCourseConfig(courseId);

          // Log restrictCourseAccess changes for debugging

          // Update course details state with course config integrated
          setCourseDetails(prev => ({
            ...prev,
            [courseId]: {
              ...courseData,  // Include all original course data
              teachers,       // Add resolved teacher objects
              supportStaff,   // Add resolved support staff objects
              courseConfig    // Add course configuration
            }
          }));
        } else {
          // Remove course details if course no longer exists
          setCourseDetails(prev => {
            const updated = { ...prev };
            delete updated[courseId];
            return updated;
          });
        }
      } catch (error) {
        console.error(`Error processing course data for ${courseId}:`, error);
      }
    }, (error) => {
      console.error(`Firebase listener error for course ${courseId}:`, error);
    });
    
    // Listen specifically to course config changes
    const configUnsubscribe = onValue(courseConfigRef, async (configSnapshot) => {
      try {
        const courseConfig = configSnapshot.exists() ? configSnapshot.val() : null;
        
        
        // Update only the course config in course details
        setCourseDetails(prev => {
          const currentCourse = prev[courseId];
          if (currentCourse) {
            return {
              ...prev,
              [courseId]: {
                ...currentCourse,
                courseConfig
              }
            };
          }
          return prev;
        });
      } catch (error) {
        console.error(`Error processing course config for ${courseId}:`, error);
      }
    }, (error) => {
      console.error(`Firebase course config listener error for ${courseId}:`, error);
    });
    
    // Return a function that unsubscribes from both listeners
    return () => {
      courseUnsubscribe();
      configUnsubscribe();
    };
  };
  
  // Manage course listeners based on current student courses
  const manageCourseListeners = (studentCourses) => {
    if (!studentCourses) return;
    
    const currentCourseIds = new Set(
      Object.keys(studentCourses)
        .filter(key => key !== 'sections' && key !== 'normalizedSchedule')
    );
    
    const activeCourseIds = new Set(Object.keys(courseListenersRef.current));
    
    // Remove listeners for courses no longer enrolled
    activeCourseIds.forEach(courseId => {
      if (!currentCourseIds.has(courseId)) {
        courseListenersRef.current[courseId](); // Call unsubscribe
        delete courseListenersRef.current[courseId];
        
        // Remove from course details state
        setCourseDetails(prev => {
          const updated = { ...prev };
          delete updated[courseId];
          return updated;
        });
      }
    });
    
    // Add listeners for new courses
    currentCourseIds.forEach(courseId => {
      if (!activeCourseIds.has(courseId)) {
        const unsubscribe = setupCourseListener(courseId);
        courseListenersRef.current[courseId] = unsubscribe;
      }
    });
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
        // console.log(`Fetched ${Object.keys(notificationsData).length} active notifications`);
        
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
      // console.log('No active notifications found');
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };



  // Mark a notification as seen - using cloud function
  const markNotificationSeen = async (notificationId, userEmail, notification) => {
    if (!userEmail || !notificationId) return;
    
    try {
      // Get all course IDs where this notification appears
      const courseIds = studentData.courses
        ?.filter(course => course.notificationIds && course.notificationIds[notificationId])
        ?.map(course => course.id) || [];
      
      if (courseIds.length === 0) {
        console.warn(`No courses found for notification ${notificationId}`);
        return;
      }
      
      // Call the cloud function to handle the database writes
      const functions = getFunctions();
      const submitNotificationSurvey = httpsCallable(functions, 'submitNotificationSurvey');
      
      const result = await submitNotificationSurvey({
        operation: 'mark_seen',
        notificationId: notificationId,
        courseIds: courseIds,
        userEmail: userEmail
      });
      
      console.log('Notification marked as seen successfully:', result.data);
      
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
      
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
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
    // Set up course listeners for the current student courses
    manageCourseListeners(studentCourses);
    
    // Initialize an array to hold all courses (student-enrolled and required)
    let allCourses = [];

    // Process student-enrolled courses if they exist
    if (studentCourses) {
      const courseEntries = Object.entries(studentCourses)
        .filter(([key]) => key !== 'sections' && key !== 'normalizedSchedule');

      const coursesWithDetails = await Promise.all(
        courseEntries.map(async ([id, studentCourse]) => {
          // Get course details from real-time state (may be null if not loaded yet)
          const realtimeCourseDetails = courseDetails[id] || null;
          
          // Debug log for course details merging
          if (realtimeCourseDetails) {
          }
          
          // Fetch payment info
          const paymentInfo = await fetchPaymentDetails(id);

          // Build the enhanced course object with proper Gradebook structure
          const enhancedCourse = {
            id,
            ...studentCourse,
            courseDetails: realtimeCourseDetails,  // This will include all course properties from Firebase real-time
            payment: paymentInfo || {
              status: 'unpaid',
              details: null,
              hasValidPayment: false
            }
          };
          
          // If we have course config from real-time details, integrate it into Gradebook structure
          if (realtimeCourseDetails?.courseConfig) {
            // Ensure Gradebook structure exists
            if (!enhancedCourse.Gradebook) {
              enhancedCourse.Gradebook = {};
            }
            
            // Add course config to Gradebook structure
            enhancedCourse.Gradebook.courseConfig = realtimeCourseDetails.courseConfig;
            
          }
          
          return enhancedCourse;
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
      
      // console.log('Fetching ImportantDates directly:', snapshot.exists(), snapshot.val());
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error fetching important dates:', error);
      return null;
    }
  };

  // Effect to re-process courses when course details change
  useEffect(() => {
    // Only re-process if we have student data and course details have been updated
    if (studentData.loading || !studentData.profile) return;
    
    const updateCoursesWithNewDetails = async () => {
      // Get the latest student courses from state
      const coursesSnapshot = await new Promise((resolve) => {
        if (!userEmailKey) {
          resolve(null);
          return;
        }
        
        const db = getDatabase();
        const coursesRef = ref(db, `students/${userEmailKey}/courses`);
        get(coursesRef).then(snapshot => {
          resolve(snapshot.exists() ? snapshot.val() : null);
        }).catch(() => resolve(null));
      });
      
      if (coursesSnapshot) {
        // Re-process courses with updated course details
        const processedCourses = await processCourses(coursesSnapshot);
        
        setStudentData(prev => {
          // Re-process notifications if we have them
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
            courses: updatedCourses
          };
        });
      }
    };
    
    updateCoursesWithNewDetails();
  }, [courseDetails, userEmailKey]); // Re-run when course details change

  useEffect(() => {
    let isMounted = true;
    let profileReceived = false;
    let coursesReceived = false;
    let datesReceived = false;
    let notificationsReceived = false;
    
    // console.log('useStudentData effect running, userEmailKey:', userEmailKey);
    
    // Always fetch important dates and notifications, regardless of userEmailKey
    const fetchInitialData = async () => {
      try {
        const [dates, notifications] = await Promise.all([
          fetchImportantDates(),
          fetchNotifications()
        ]);
        
        if (isMounted) {
          // console.log('Fetched ImportantDates:', dates);
          // console.log('Fetched Notifications:', notifications.length);
          
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
      // console.log('checkLoadingComplete:', { 
      //   profileReceived, 
      //   coursesReceived, 
      //   datesReceived, 
      //   notificationsReceived,
      //   isMounted 
      // });
      
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
        // console.log('Profile received:', profileSnapshot.val());
        
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

        // console.log('Courses received:', coursesSnapshot.exists());

        if (coursesSnapshot.exists()) {
          const coursesData = coursesSnapshot.val();
          
          // Remove jsonStudentNotes from each course before processing
          // since students no longer have read access to this field
          const sanitizedCoursesData = Object.fromEntries(
            Object.entries(coursesData).map(([courseId, courseData]) => {
              if (courseData && typeof courseData === 'object') {
                const { jsonStudentNotes, ...sanitizedCourseData } = courseData;
                return [courseId, sanitizedCourseData];
              }
              return [courseId, courseData];
            })
          );
          
          const processedCourses = await processCourses(sanitizedCoursesData);
          
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
        // console.log('ImportantDates received via listener:', datesSnapshot.exists(), datesSnapshot.val());
        
        setStudentData(prev => ({
          ...prev,
          importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null
        }));
        
        checkLoadingComplete();
      }, handleError);
      
      // Listen for active notifications changes using the query
      const notificationsUnsubscribe = onValue(activeNotificationsQuery, async (notificationsSnapshot) => {
        if (!isMounted) return;
        
        // console.log('Active notifications received via listener:', notificationsSnapshot.exists());
        
        if (notificationsSnapshot.exists()) {
          const notificationsData = notificationsSnapshot.val();
          const notificationsArray = Object.entries(notificationsData).map(([id, data]) => ({
            id,
            ...data
          }));
          
          // console.log(`Received ${notificationsArray.length} active notifications`);
          
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
      
      // Clean up all course listeners
      Object.values(courseListenersRef.current).forEach(unsubscribeCourse => {
        if (typeof unsubscribeCourse === 'function') {
          unsubscribeCourse();
        }
      });
      courseListenersRef.current = {};
      
      // Clear course details state
      setCourseDetails({});
    };
  }, [userEmailKey, isEmulating]);

  // Add a simplified notification summary log
  if (!studentData.loading && studentData.profile) {
    const visibleNotifications = studentData.courses?.reduce((count, course) => {
      if (!course.notificationIds) return count;
      return count + Object.values(course.notificationIds)
        .filter(n => n.shouldDisplay).length;
    }, 0) || 0;
    
    // console.log('📋 NOTIFICATION SUMMARY:', {
    //   totalActive: studentData.allNotifications?.length || 0,
    //   visibleNotifications,
    //   coursesWithNotifications: studentData.courses?.filter(c => 
    //     c.notificationIds && Object.keys(c.notificationIds).length > 0
    //   ).length || 0
    // });

    // Development-only raw data logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 RAW STUDENT DATA:', {
        courses: studentData.courses,
        profile: studentData.profile,
        importantDates: studentData.importantDates,
        allNotifications: studentData.allNotifications
      });
    }
  }
  

  // Function to handle survey submission
  const submitSurveyResponse = async (notificationId, courseId, answers) => {
    if (!studentData.profile || !studentData.profile.StudentEmail) return;
    
    try {
      const userEmail = studentData.profile.StudentEmail;
      const studentName = `${studentData.profile.firstName || ''} ${studentData.profile.lastName || ''}`.trim();
      
      // Call the cloud function to handle the survey submission
      const functions = getFunctions();
      const submitNotificationSurvey = httpsCallable(functions, 'submitNotificationSurvey');
      
      const result = await submitNotificationSurvey({
        operation: 'submit_survey',
        notificationId: notificationId,
        courseId: courseId,
        answers: answers,
        userEmail: userEmail,
        studentName: studentName
      });
      
      console.log('Survey response submitted successfully:', result.data);
      
    } catch (error) {
      console.error('Error submitting survey response:', error);
    }
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
    // console.log("Force refresh requested!");
    
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
      
      // console.log("Force refresh completed with", notifications.length, "notifications");
      return true;
    } catch (error) {
      console.error("Error during force refresh:", error);
      return false;
    }
  };
  
  // Listen for refresh events
  useEffect(() => {
    const handleRefreshEvent = () => {
      // console.log("Notification refresh event received");
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