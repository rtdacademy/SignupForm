import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { 
  processNotificationsForCourses as processNotificationsUtil,
} from '../../utils/notificationFilterUtils';
import { sanitizeEmail } from '../../utils/sanitizeEmail';

/**
 * Teacher version of useStudentData that allows teachers to fetch and construct
 * course objects for any student, mirroring the functionality of useStudentData
 * but with teacher-specific permissions and parameters.
 */
export const useTeacherStudentData = (studentEmailKey, teacherPermissions = {}) => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState({
    courses: [],
    profile: null,
    loading: true,
    error: null,
    studentExists: false,
    importantDates: null,
    allNotifications: [],
    isTeacherView: true
  });
  
  // Track real-time course details separate from student course enrollment
  const [courseDetails, setCourseDetails] = useState({});
  
  // Track active course listeners for cleanup
  const courseListenersRef = useRef({});

  // Check if teacher has permission to access student data
  const hasTeacherPermission = () => {
    // Basic permission check - can be enhanced based on your permission system
    return user && (
      user.email?.includes('@rtdacademy.com') || 
      teacherPermissions.canViewStudentData ||
      teacherPermissions.isStaff ||
      teacherPermissions.isTeacher
    );
  };

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
      const statusRef = ref(db, `students/${studentEmailKey}/courses/${courseId}/payment_status/status`);
      const statusSnapshot = await get(statusRef);
      const status = statusSnapshot.val();

      const paymentRef = ref(db, `payments/${studentEmailKey}/courses/${courseId}`);
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

  // Fetch course configuration from database only
  const fetchCourseConfig = async (courseId) => {
    try {
      const db = getDatabase();
      const courseConfigRef = ref(db, `courses/${courseId}/course-config`);
      const configSnapshot = await get(courseConfigRef);
      
      if (configSnapshot.exists()) {
        console.log(`✅ Teacher view: Using course config from database for course ${courseId}`);
        return configSnapshot.val();
      }
      
      console.warn(`Teacher view: Course config not found in database for ${courseId}`);
      return null;
    } catch (error) {
      console.error(`Teacher view: Error fetching course config for ${courseId}:`, error);
      return null;
    }
  };

  // Set up real-time listener for course details
  const setupCourseListener = (courseId) => {
    const db = getDatabase();
    const courseRef = ref(db, `courses/${courseId}`);
    
    console.log(`🔥 Teacher view: Setting up real-time listener for course: ${courseId}`);
    
    // Listen to course data changes
    const courseUnsubscribe = onValue(courseRef, async (snapshot) => {
      try {
        const courseData = snapshot.exists() ? snapshot.val() : null;

        if (courseData) {
          // Enhance with resolved staff members
          const teachers = await fetchStaffMembers(courseData.Teachers || []);
          const supportStaff = await fetchStaffMembers(courseData.SupportStaff || []);

          console.log(`🔄 Teacher view: Course ${courseId} real-time update:`, {
            restrictCourseAccess: courseData.restrictCourseAccess,
            OnRegistration: courseData.OnRegistration,
            hasCourseConfig: !!courseConfig,
            firebaseCourse: courseData.firebaseCourse,
            timestamp: new Date().toLocaleTimeString()
          });

          // Update course details state without course config (will be in Gradebook only)
          setCourseDetails(prev => ({
            ...prev,
            [courseId]: {
              ...courseData,  // Include all original course data
              teachers,       // Add resolved teacher objects
              supportStaff    // Add resolved support staff objects
              // courseConfig removed - will be added directly to Gradebook structure
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
        console.error(`Teacher view: Error processing course data for ${courseId}:`, error);
      }
    }, (error) => {
      console.error(`Teacher view: Firebase listener error for course ${courseId}:`, error);
    });
    
    // Note: Course config listener removed - config will be added directly to Gradebook in processCourses
    
    // Return a function that unsubscribes from the listener
    return () => {
      courseUnsubscribe();
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
        console.log(`🔥 Teacher view: Removing listener for course: ${courseId}`);
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
        console.log(`🔥 Teacher view: Adding listener for course: ${courseId}`);
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
        
        // Convert to array with IDs
        const notifications = Object.entries(notificationsData).map(([id, data]) => ({
          id,
          ...data
        }));
        
        return notifications;
      }
      return [];
    } catch (error) {
      console.error('Teacher view: Error fetching notifications:', error);
      return [];
    }
  };

  // Process notifications for each course - using the utility function
  const processNotificationsForCourses = (courses, profile, allNotifications) => {
    // For teacher view, we process notifications but don't show them as actionable
    const processedCourses = processNotificationsUtil(courses, profile, allNotifications, {});
    
    // Mark all notifications as teacher view (non-actionable)
    return processedCourses.map(course => ({
      ...course,
      notificationIds: course.notificationIds ? 
        Object.fromEntries(
          Object.entries(course.notificationIds).map(([id, notification]) => [
            id, 
            { ...notification, isTeacherView: true }
          ])
        ) : {}
    }));
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
            // Generate studentKey from the user's email
            const studentKey = sanitizeEmail(userEmail);

            // Format the required course to match the structure of student courses
            requiredCourses.push({
              id,
              CourseID: id,
              Course: { Value: course.Title },
              ActiveFutureArchived: { Value: "Active" },
              Created: course.Created || new Date().toISOString(),
              studentKey, // Add studentKey to required course data
              // Include the full course object here without modifications
              courseDetails: course,
              payment: {
                status: 'paid', // Always mark required courses as paid
                details: null,
                hasValidPayment: true
              },
              isRequiredCourse: true, // Flag to indicate this is a required course
              firebaseCourse: course.firebaseCourse || true,
              isTeacherView: true // Flag for teacher view
            });
          }
        }
      }

      return requiredCourses;

    } catch (error) {
      console.error('Teacher view: Error fetching required courses:', error);
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
          // Get course details from real-time state (may be null if not loaded yet)
          const realtimeCourseDetails = courseDetails[id] || null;
          
          // Debug log for course details merging
          if (realtimeCourseDetails) {
            console.log(`📋 Teacher view: Merging course details for ${id}:`, {
              restrictCourseAccess: realtimeCourseDetails.restrictCourseAccess,
              OnRegistration: realtimeCourseDetails.OnRegistration,
              hasRealtimeDetails: !!realtimeCourseDetails,
              hasCourseConfig: !!realtimeCourseDetails?.courseConfig,
              firebaseCourse: realtimeCourseDetails.firebaseCourse,
              timestamp: new Date().toLocaleTimeString()
            });
          }
          
          // Fetch payment info and course config
          const [paymentInfo, courseConfig] = await Promise.all([
            fetchPaymentDetails(id),
            fetchCourseConfig(id)
          ]);

          // Generate studentKey reliably from the studentEmailKey parameter
          // This ensures studentKey is always consistent, even during real-time updates
          const studentKey = studentEmailKey;

          // Build the enhanced course object with proper Gradebook structure
          const enhancedCourse = {
            id,
            ...studentCourse,
            studentKey, // Add studentKey to course data
            courseDetails: realtimeCourseDetails,  // This will include all course properties from Firebase real-time
            payment: paymentInfo || {
              status: 'unpaid',
              details: null,
              hasValidPayment: false
            },
            isTeacherView: true // Flag for teacher view
          };
          
          // Add course config directly to Gradebook structure (single source of truth)
          if (courseConfig) {
            // Ensure Gradebook structure exists
            if (!enhancedCourse.Gradebook) {
              enhancedCourse.Gradebook = {};
            }
            
            // Add course config to Gradebook structure
            enhancedCourse.Gradebook.courseConfig = courseConfig;
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
          // Get real-time course details if available
          const realtimeCourseDetails = courseDetails[requiredCourse.id] || requiredCourse.courseDetails;
          
          // Fetch course config for required course
          const courseConfig = await fetchCourseConfig(requiredCourse.id);
          
          // Update required course with real-time details and proper Gradebook structure
          const enhancedRequiredCourse = {
            ...requiredCourse,
            courseDetails: realtimeCourseDetails
          };
          
          // Add course config to Gradebook structure
          if (courseConfig) {
            if (!enhancedRequiredCourse.Gradebook) {
              enhancedRequiredCourse.Gradebook = {};
            }
            enhancedRequiredCourse.Gradebook.courseConfig = courseConfig;
          }
          
          allCourses.push(enhancedRequiredCourse);
        }
      }
    }

    // Sort all courses by creation date
    allCourses = allCourses.sort((a, b) => new Date(b.Created) - new Date(a.Created));
    
    // Set up course listeners for ALL courses (including required courses)
    const allCourseIds = {};
    allCourses.forEach(course => {
      allCourseIds[course.id] = true;
    });
    manageCourseListeners(allCourseIds);
    
    return allCourses;
  };

  const fetchImportantDates = async () => {
    try {
      const db = getDatabase();
      const datesRef = ref(db, 'ImportantDates');
      const snapshot = await get(datesRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Teacher view: Error fetching important dates:', error);
      return null;
    }
  };

  // Effect to re-process courses when course details change
  useEffect(() => {
    // Only re-process if we have student data and course details have been updated
    if (studentData.loading || !studentData.profile || !studentEmailKey) return;
    
    console.log('🔄 Teacher view: Course details changed, re-processing courses...', {
      courseDetailsKeys: Object.keys(courseDetails),
      timestamp: new Date().toLocaleTimeString()
    });
    
    const updateCoursesWithNewDetails = async () => {
      // Get the latest student courses from state
      const coursesSnapshot = await new Promise((resolve) => {
        if (!studentEmailKey) {
          resolve(null);
          return;
        }
        
        const db = getDatabase();
        const coursesRef = ref(db, `students/${studentEmailKey}/courses`);
        get(coursesRef).then(snapshot => {
          resolve(snapshot.exists() ? snapshot.val() : null);
        }).catch(() => resolve(null));
      });
      
      // Re-process courses with updated course details (including required courses)
      const processedCourses = await processCourses(coursesSnapshot);
      
      console.log('✅ Teacher view: Courses re-processed with updated details', {
        courseCount: processedCourses.length,
        timestamp: new Date().toLocaleTimeString()
      });
      
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
    };
    
    updateCoursesWithNewDetails();
  }, [courseDetails, studentEmailKey]); // Re-run when course details change

  useEffect(() => {
    let isMounted = true;
    let profileReceived = false;
    let coursesReceived = false;
    let datesReceived = false;
    let notificationsReceived = false;
    
    
    // Check teacher permissions first
    if (!hasTeacherPermission()) {
      console.warn('Teacher view: No permission to access student data');
      setStudentData(prev => ({
        ...prev,
        loading: false,
        error: 'Insufficient permissions to access student data',
        studentExists: false
      }));
      return;
    }
    
    // Always fetch important dates and notifications, regardless of studentEmailKey
    const fetchInitialData = async () => {
      try {
        const [dates, notifications] = await Promise.all([
          fetchImportantDates(),
          fetchNotifications()
        ]);
        
        if (isMounted) {
          
          setStudentData(prev => ({
            ...prev,
            importantDates: dates,
            allNotifications: notifications
          }));
          
          datesReceived = true;
          notificationsReceived = true;
          
          // If this is a new user (no studentEmailKey), we need to mark loading as complete
          if (!studentEmailKey) {
            setStudentData(prev => ({ ...prev, loading: false }));
          } else {
            checkLoadingComplete();
          }
        }
      } catch (error) {
        console.error('Teacher view: Error in fetchInitialData:', error);
        datesReceived = true;
        notificationsReceived = true;
        if (!studentEmailKey) {
          setStudentData(prev => ({ ...prev, loading: false }));
        } else {
          checkLoadingComplete();
        }
      }
    };
    
    // Execute fetchInitialData immediately
    fetchInitialData();
    
    // If no studentEmailKey, we're done after fetching dates and notifications
    if (!studentEmailKey) {
      profileReceived = true;
      coursesReceived = true;
      return;
    }

    const db = getDatabase();
    let unsubscribe = null;

    const checkLoadingComplete = () => {
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
      
      console.error('Teacher view: Firebase listener error:', error);
      setStudentData(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        studentExists: false
      }));
    };

    const setupListeners = () => {
      const profileRef = ref(db, `students/${studentEmailKey}/profile`);
      const coursesRef = ref(db, `students/${studentEmailKey}/courses`);

      // Listen for profile changes
      const profileUnsubscribe = onValue(profileRef, async (profileSnapshot) => {
        if (!isMounted) return;
        
        profileReceived = true;
        console.log('Teacher view: Profile received for student:', studentEmailKey);
        
        setStudentData(prev => ({
          ...prev,
          profile: profileSnapshot.val() || null,
          studentExists: profileSnapshot.exists()
        }));
        
        checkLoadingComplete();
      }, handleError);

      // Listen for course changes with deep monitoring
      const coursesUnsubscribe = onValue(coursesRef, async (coursesSnapshot) => {
        if (!isMounted) return;

        console.log('Teacher view: Courses data update received for student:', studentEmailKey, {
          timestamp: new Date().toLocaleTimeString(),
          exists: coursesSnapshot.exists()
        });

        if (coursesSnapshot.exists()) {
          const coursesData = coursesSnapshot.val();
          
          // Remove jsonStudentNotes from each course before processing
          // (teachers might have access but we'll sanitize for consistency)
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

      return () => {
        profileUnsubscribe();
        coursesUnsubscribe();
      };
    };

    // Set up real-time listeners (teachers always use real-time data)
    unsubscribe = setupListeners();

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
  }, [studentEmailKey, user]);


  // Add a function to force refresh data
  const forceRefresh = async () => {
    console.log("Teacher view: Force refresh requested!");
    
    try {
      if (!studentEmailKey) return false;
      
      const db = getDatabase();
      
      // Re-fetch all data
      const [coursesSnapshot, notifications] = await Promise.all([
        get(ref(db, `students/${studentEmailKey}/courses`)),
        fetchNotifications()
      ]);
      
      if (coursesSnapshot.exists()) {
        const coursesData = coursesSnapshot.val();
        
        // Remove jsonStudentNotes from each course before processing
        const sanitizedCoursesData = Object.fromEntries(
          Object.entries(coursesData).map(([courseId, courseData]) => {
            if (courseData && typeof courseData === 'object') {
              const { jsonStudentNotes, ...sanitizedCourseData } = courseData;
              return [courseId, sanitizedCourseData];
            }
            return [courseId, courseData];
          })
        );
        
        // Re-process courses
        const processedCourses = await processCourses(sanitizedCoursesData);
        
        // Re-process notifications for courses if we have data
        let updatedCourses = processedCourses;
        if (studentData.profile && processedCourses.length > 0) {
          updatedCourses = processNotificationsForCourses(
            processedCourses,
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
        
        console.log("Teacher view: Force refresh completed");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Teacher view: Error during force refresh:", error);
      return false;
    }
  };

  // Return the data with teacher-specific flags
  return {
    ...studentData,
    isTeacherView: true,
    hasPermissions: hasTeacherPermission(),
    forceRefresh
  };
};