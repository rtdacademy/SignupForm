import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, get, query, orderByChild, equalTo, onChildAdded } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import { 
  calculateAge as calculateAgeUtil,
  processNotificationsForCourses as processNotificationsUtil,
  getCurrentDate,
  setMockDate,
  resetNotificationAcknowledgment
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

          // Debug: Check if course-config is present
          console.log(`📚 Teacher view: Course ${courseId} data loaded:`, {
            hasCourseConfig: !!courseData['course-config'],
            hasCourseStructure: !!courseData['course-config']?.courseStructure,
            courseConfigKeys: courseData['course-config'] ? Object.keys(courseData['course-config']) : 'none'
          });

          // Update course details state with all course data including course-config
          setCourseDetails(prev => ({
            ...prev,
            [courseId]: {
              ...courseData,  // Include all original course data (including course-config)
              teachers,       // Add resolved teacher objects
              supportStaff    // Add resolved support staff objects
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
    
    // Note: Course config is included in courseData from the listener
    
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

  // Mark a notification as seen - using cloud function (teacher view)
  const markNotificationSeen = async (notificationId, userEmail, notification) => {
    if (!userEmail || !notificationId) return;
    
    try {
      // Get all course IDs where this notification appears
      const courseIds = studentData.courses
        ?.filter(course => course.notificationIds && course.notificationIds[notificationId])
        ?.map(course => course.id) || [];
      
      if (courseIds.length === 0) {
        console.warn(`Teacher view: No courses found for notification ${notificationId}`);
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
      
      console.log('Teacher view: Notification marked as seen successfully:', result.data);
      
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
      console.error('Teacher view: Error marking notification as seen:', error);
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
          
          // Fetch payment info only (course config will come from courseDetails)
          const paymentInfo = await fetchPaymentDetails(id);

          // Generate studentKey reliably from the studentEmailKey parameter
          // This ensures studentKey is always consistent, even during real-time updates
          const studentKey = studentEmailKey;

          // Build the enhanced course object
          const enhancedCourse = {
            id,
            ...studentCourse,
            studentKey, // Add studentKey to course data
            courseDetails: realtimeCourseDetails,  // This will include all course properties from Firebase real-time including course-config
            payment: paymentInfo || {
              status: 'unpaid',
              details: null,
              hasValidPayment: false
            },
            isTeacherView: true // Flag for teacher view
          };
          
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
          
          // Update required course with real-time details (course config will come from courseDetails)
          const enhancedRequiredCourse = {
            ...requiredCourse,
            courseDetails: realtimeCourseDetails
          };
          
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

    const setupListeners = async () => {
      const profileRef = ref(db, `students/${studentEmailKey}/profile`);
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
        console.log('Teacher view: Profile received for student:', studentEmailKey);
        
        const profileData = profileSnapshot.val();
        console.log('🔍 Teacher view: Profile data received:', profileData);
        
        setStudentData(prev => ({
          ...prev,
          profile: profileData || null,
          studentExists: profileSnapshot.exists()
        }));
        
        checkLoadingComplete();
      }, handleError);

      // Set up optimized course listeners - listen to specific paths only to avoid large payloads
      const setupOptimizedCourseListeners = async () => {
        // First, get the list of courses the student is enrolled in (initial fetch is OK)
        const coursesListRef = ref(db, `students/${studentEmailKey}/courses`);
        const coursesListSnapshot = await get(coursesListRef);
        
        if (!coursesListSnapshot.exists()) {
          setStudentData(prev => ({
            ...prev,
            courses: []
          }));
          coursesReceived = true;
          checkLoadingComplete();
          
          // Even if no courses exist, set up listener for when the first course gets added
          const parentCoursesRef = ref(db, `students/${studentEmailKey}/courses`);
          const parentUnsubscribe = onChildAdded(parentCoursesRef, async (snapshot) => {
            if (!isMounted) return;
            
            const newCourseId = snapshot.key;
            
            // Skip non-course keys
            if (newCourseId === 'sections' || newCourseId === 'normalizedSchedule') {
              return;
            }
            
            console.log(`🎓 Teacher view: First course detected for student: ${newCourseId} - refreshing data`);
            
            // For teacher view, just trigger a refresh instead of page reload
            await forceRefresh();
          }, handleError);
          
          return () => {
            parentUnsubscribe();
          };
        }

        const coursesData = coursesListSnapshot.val();
        const courseIds = Object.keys(coursesData).filter(key => 
          key !== 'sections' && key !== 'normalizedSchedule'
        );

        // Track all unsubscribe functions
        const courseUnsubscribers = [];
        
        // State to accumulate course data from multiple listeners
        const courseDataAccumulator = {};
        
        // Initialize accumulator with course IDs
        courseIds.forEach(courseId => {
          courseDataAccumulator[courseId] = {};
        });

        // Helper function to set up listeners for a specific course
        const setupCourseListeners = (courseId) => {
          // Define the specific paths we want to listen to (excluding Assessments)
          const pathsToListen = [
            'ActiveFutureArchived/Value',
            'DiplomaMonthChoices/Value', 
            'Grades/assessments',
            'Gradebook/items',
            'School_x0020_Year/Value',
            'Status/Value',
            'StudentType/Value',
            'TeacherComments'
          ];

          // Listen to each specific path
          pathsToListen.forEach(pathSuffix => {
            const specificRef = ref(db, `students/${studentEmailKey}/courses/${courseId}/${pathSuffix}`);
            
            const unsubscribe = onValue(specificRef, (snapshot) => {
              if (!isMounted) return;
              
              const value = snapshot.exists() ? snapshot.val() : null;
              updateCourseData(courseId, pathSuffix.replace('/', '_'), value);
            }, handleError);
            
            courseUnsubscribers.push(unsubscribe);
          });

          // Listen to specific root-level course properties individually to avoid large payloads
          const rootPropertiesToListen = [
            'Created',
            'Course/Value', 
            'CourseID',
            'Enrolled_x0020_Date',
            'Final_x0020_Grade',
            'Program',
            'Semester'
          ];

          rootPropertiesToListen.forEach(propertyPath => {
            const propertyRef = ref(db, `students/${studentEmailKey}/courses/${courseId}/${propertyPath}`);
            const propertyUnsubscribe = onValue(propertyRef, (snapshot) => {
              if (!isMounted) return;
              
              const value = snapshot.exists() ? snapshot.val() : null;
              updateCourseData(courseId, propertyPath.replace('/', '_'), value);
            }, handleError);
            
            courseUnsubscribers.push(propertyUnsubscribe);
          });
        };

        // Helper function to update course data and reprocess
        const updateCourseData = async (courseId, path, value) => {
          // Ensure courseId exists in accumulator
          if (!courseDataAccumulator[courseId]) {
            courseDataAccumulator[courseId] = {};
          }
          
          // Update the specific path in the accumulator
          if (path === 'root') {
            // For root level properties like Created, Course, etc.
            courseDataAccumulator[courseId] = { ...courseDataAccumulator[courseId], ...value };
          } else {
            // For nested paths
            courseDataAccumulator[courseId][path] = value;
          }
          
          // Reconstruct the full courses data structure
          const reconstructedCoursesData = { ...coursesData };
          Object.entries(courseDataAccumulator).forEach(([id, data]) => {
            reconstructedCoursesData[id] = { ...reconstructedCoursesData[id], ...data };
          });
          
          // Remove jsonStudentNotes from each course before processing
          const sanitizedCoursesData = Object.fromEntries(
            Object.entries(reconstructedCoursesData).map(([courseId, courseData]) => {
              if (courseData && typeof courseData === 'object') {
                const { jsonStudentNotes, ...sanitizedCourseData } = courseData;
                return [courseId, sanitizedCourseData];
              }
              return [courseId, courseData];
            })
          );
          
          // Process courses with the updated data
          const processedCourses = await processCourses(sanitizedCoursesData);
          
          if (!isMounted) return;

          setStudentData(prev => {
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
        };

        // Set up parent-level listener to detect new course additions
        const parentCoursesRef = ref(db, `students/${studentEmailKey}/courses`);
        const parentUnsubscribe = onChildAdded(parentCoursesRef, async (snapshot) => {
          if (!isMounted) return;
          
          const newCourseId = snapshot.key;
          
          // Skip non-course keys
          if (newCourseId === 'sections' || newCourseId === 'normalizedSchedule') {
            return;
          }
          
          // Check if we already have listeners for this course (prevents refresh on initial load)
          if (courseDataAccumulator[newCourseId] !== undefined) {
            return; // Already being tracked
          }
          
          console.log(`🎓 Teacher view: New course detected: ${newCourseId} - refreshing data`);
          
          // For teacher view, trigger a refresh instead of page reload
          await forceRefresh();
        }, handleError);
        
        courseUnsubscribers.push(parentUnsubscribe);

        // Set up individual listeners for existing courses
        for (const courseId of courseIds) {
          setupCourseListeners(courseId);
        }

        // Initial processing with existing data - sanitize first
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
        
        if (isMounted) {
          setStudentData(prev => {
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
        }

        // Mark courses as received
        coursesReceived = true;
        checkLoadingComplete();

        // Return cleanup function
        return () => {
          courseUnsubscribers.forEach(unsubscribe => unsubscribe());
        };
      };

      // Set up the optimized course listeners
      const coursesUnsubscribe = await setupOptimizedCourseListeners();

      // Listen for ImportantDates changes
      const datesUnsubscribe = onValue(datesRef, async (datesSnapshot) => {
        if (!isMounted) return;
        
        datesReceived = true;
        console.log('Teacher view: ImportantDates received via listener');
        
        setStudentData(prev => ({
          ...prev,
          importantDates: datesSnapshot.exists() ? datesSnapshot.val() : null
        }));
        
        checkLoadingComplete();
      }, handleError);
      
      // Listen for active notifications changes using the query
      const notificationsUnsubscribe = onValue(activeNotificationsQuery, async (notificationsSnapshot) => {
        if (!isMounted) return;
        
        console.log('Teacher view: Active notifications received via listener');
        
        if (notificationsSnapshot.exists()) {
          const notificationsData = notificationsSnapshot.val();
          const notificationsArray = Object.entries(notificationsData).map(([id, data]) => ({
            id,
            ...data
          }));
          
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
        if (coursesUnsubscribe && typeof coursesUnsubscribe === 'function') {
          coursesUnsubscribe();
        }
        datesUnsubscribe();
        notificationsUnsubscribe();
      };
    };

    // Set up real-time listeners (teachers always use real-time data)
    setupListeners().then(cleanupFn => {
      unsubscribe = cleanupFn;
    }).catch(handleError);

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

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log("Teacher view: Notification refresh event received");
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
      window.refreshTeacherStudentData = forceRefresh;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshTeacherStudentData;
      }
    };
  }, []);

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

  // Add a simplified notification summary log
  if (!studentData.loading && studentData.profile) {
    const visibleNotifications = studentData.courses?.reduce((count, course) => {
      if (!course.notificationIds) return count;
      return count + Object.values(course.notificationIds)
        .filter(n => n.shouldDisplay).length;
    }, 0) || 0;

    // Development-only raw data logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Teacher view RAW STUDENT DATA:', {
        courses: studentData.courses,
        profile: studentData.profile,
        importantDates: studentData.importantDates,
        allNotifications: studentData.allNotifications
      });
    }
  }

  // Function to handle survey submission (teacher view)
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
      
      console.log('Teacher view: Survey response submitted successfully:', result.data);
      
    } catch (error) {
      console.error('Teacher view: Error submitting survey response:', error);
    }
  };

  // Add a utility function to mark a notification as seen (teacher view)
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

  // Debug: Log what we're returning
  console.log('🔍 Teacher view: Returning student data:', {
    hasProfile: !!studentData.profile,
    profileEmail: studentData.profile?.StudentEmail,
    loading: studentData.loading,
    coursesCount: studentData.courses?.length || 0
  });

  // Return the data with teacher-specific flags
  return {
    ...studentData,
    markNotificationAsSeen,
    submitSurveyResponse,
    isTeacherView: true,
    hasPermissions: hasTeacherPermission(),
    forceRefresh
  };
};