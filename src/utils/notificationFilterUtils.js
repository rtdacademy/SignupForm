/**
 * Utilities for notification filtering
 * This file contains shared logic for filtering student dashboard notifications
 * Used by both StudentDashboardNotifications.js and useStudentData.js
 */

// Global date override for testing
let _mockDate = null;

// Export for testing purposes
export const setMockDate = (date) => {
  if (date === null) {
    _mockDate = null;
    console.log("Date mocking disabled. Using real date.");
    return new Date();
  }
  
  const newDate = date instanceof Date ? date : new Date(date);
  _mockDate = newDate;
  console.log(`Date mocked to: ${newDate.toLocaleString()}`);
  return newDate;
};

// Function to get current date (real or mocked)
export const getCurrentDate = () => {
  return _mockDate || new Date();
};

// Helper to clear notification status for testing
export const resetNotificationAcknowledgment = async (notificationId, userEmail) => {
  try {
    // Import Firebase functions dynamically to avoid circular dependencies
    const { getDatabase, ref, get, set } = await import('firebase/database');
    const { sanitizeEmail } = await import('./sanitizeEmail');
    
    const db = getDatabase();
    
    // Get the properly sanitized email using the canonical sanitizeEmail function
    const sanitizedEmail = sanitizeEmail(userEmail);
    
    // For backward compatibility, also try the underscore format
    const underscoredEmail = userEmail.replace(/\./g, '_');  // kyle_e_brown13@gmail_com
    
    // Add the 000 prefix for the standardized format
    const zeroPrefixedEmail = `000${sanitizedEmail}`; // 000kyle,e,brown13@gmail,com
    
    console.log('Email formats for testing:', { 
      original: userEmail, 
      sanitized: sanitizedEmail,
      underscored: underscoredEmail,
      zeroPrefixed: zeroPrefixedEmail
    });
    
    let success = false;
    
    // 1. Try the proper format first in studentDashboardNotificationsResults/{notificationId}/{userEmailKey}
    try {
      const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedEmail}`);
      
      // Get existing data first
      const snapshot = await get(resultsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Keep submissions history but reset acknowledge status
        await set(resultsRef, {
          ...data,
          acknowledged: false,
          completed: false,
          // Keep submissions history
        });
        console.log(`Reset acknowledgment status for notification ${notificationId} in main results (sanitized format)`);
        success = true;
      } else {
        // Try legacy underscore format as fallback
        const legacyRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${underscoredEmail}`);
        const legacySnapshot = await get(legacyRef);
        if (legacySnapshot.exists()) {
          const data = legacySnapshot.val();
          // Keep submissions history but reset acknowledge status
          await set(legacyRef, {
            ...data,
            acknowledged: false,
            completed: false,
            // Keep submissions history
          });
          console.log(`Reset acknowledgment status for notification ${notificationId} in main results (legacy format)`);
          success = true;
        }
      }
    } catch (error) {
      console.error(`Error updating primary path: ${error.message}`);
    }
    
    // 2. Also check for the specific timestamp-based entries
    try {
      // Get all potential timestamp entries for this notification
      const timestampsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}`);
      const timestampsSnapshot = await get(timestampsRef);
      
      if (timestampsSnapshot.exists()) {
        const entries = timestampsSnapshot.val();
        
        // Process numeric timestamps (these are the hierarchical entries)
        for (const [key, value] of Object.entries(entries)) {
          // Check if the key is numeric (a timestamp) and if it contains our email
          // Try both formats for backward compatibility
          if (!isNaN(Number(key))) {
            // Try sanitized format first (preferred format)
            if (value && value[sanitizedEmail]) {
              const timestampRef = ref(db, 
                `studentDashboardNotificationsResults/${notificationId}/${key}/${sanitizedEmail}`);
                
              try {
                const data = (await get(timestampRef)).val();
                if (data) {
                  await set(timestampRef, {
                    ...data,
                    completed: false,
                    acknowledged: false,
                    hasAcknowledged: false
                  });
                  console.log(`Reset timestamp entry: ${key} (sanitized format)`);
                  success = true;
                }
              } catch (error) {
                console.error(`Error updating timestamp entry ${key} (sanitized format): ${error.message}`);
              }
            }
            
            // Also try legacy underscore format as fallback
            else if (value && value[underscoredEmail]) {
              const timestampRef = ref(db, 
                `studentDashboardNotificationsResults/${notificationId}/${key}/${underscoredEmail}`);
                
              try {
                const data = (await get(timestampRef)).val();
                if (data) {
                  await set(timestampRef, {
                    ...data,
                    completed: false,
                    acknowledged: false,
                    hasAcknowledged: false
                  });
                  console.log(`Reset timestamp entry: ${key} (legacy underscore format)`);
                  success = true;
                }
              } catch (error) {
                console.error(`Error updating timestamp entry ${key} (legacy underscore format): ${error.message}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing timestamps: ${error.message}`);
    }
    
    // 3. Try different formats for student course data
    // Attempt all email format variants to find the right path for this student
    // IMPORTANT: Prioritize the standard sanitized format with 000 prefix (which is our standard format)
    const emailFormats = [zeroPrefixedEmail, sanitizedEmail];
    
    for (const emailFormat of emailFormats) {
      try {
        console.log(`Trying student path format: students/${emailFormat}/courses`);
        const coursesRef = ref(db, `students/${emailFormat}/courses`);
        const coursesSnapshot = await get(coursesRef);
        
        if (coursesSnapshot.exists()) {
          console.log(`Found student courses at path: students/${emailFormat}/courses`);
          const courses = coursesSnapshot.val();
          
          // For each course, check and reset notification results
          for (const courseId in courses) {
            if (courseId === 'sections' || courseId === 'normalizedSchedule') continue;
            
            const courseNotificationPath = `students/${emailFormat}/courses/${courseId}/studentDashboardNotificationsResults/${notificationId}`;
            console.log(`Checking course notification at: ${courseNotificationPath}`);
            
            try {
              const courseNotificationRef = ref(db, courseNotificationPath);
              const courseNotificationSnapshot = await get(courseNotificationRef);
              
              if (courseNotificationSnapshot.exists()) {
                const courseData = courseNotificationSnapshot.val();
                
                // Reset completion and acknowledgment status while keeping other data
                await set(courseNotificationRef, {
                  ...courseData,
                  acknowledged: false,
                  hasAcknowledged: false,
                  completed: false
                });
                
                console.log(`Reset notification ${notificationId} for course ${courseId}`);
                success = true;
              }
            } catch (error) {
              console.error(`Error resetting course notification: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error with email format ${emailFormat}: ${error.message}`);
        // Continue with next format
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error resetting notification:', error);
    return false;
  }
};

/**
 * Calculate age from birthdate
 * @param {string} birthdate - Birthdate in any format accepted by Date constructor
 * @returns {number|null} - Age in years or null if birthdate is invalid
 */
export const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  
  const birthDate = new Date(birthdate);
  const today = getCurrentDate(); // Use our mocked date if set
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Evaluate a single notification condition against a student/course
 * @param {Object} condition - The condition to evaluate
 * @param {Object} student - Student data (may be course with student data embedded)
 * @param {Object} profile - Student profile data
 * @returns {Object} - Result object containing match status and details
 */
export const evaluateCondition = (condition, student, profile) => {
  const conditionType = condition.type;
  const conditionValue = condition.value;
  
  // Handle case where profile-level data is embedded in student
  const effectiveProfile = profile || student;
  const studentEmail = effectiveProfile.StudentEmail || '';
  const studentAge = calculateAge(effectiveProfile.birthday);
  
  // For debugging - log first course to understand structure
  // Commented out to reduce console noise
  // if (process.env.NODE_ENV === 'development' && conditionType === 'studentTypes') {
  //   console.log('DEBUG COURSE STRUCTURE:', {
  //     id: student.id,
  //     studentType: student.StudentType?.Value,
  //     studentType_Value: student.StudentType_Value,
  //     courseId: student.CourseID,
  //     schoolYear: student.School_x0020_Year?.Value,
  //     schoolYear_Value: student.School_x0020_Year_Value,
  //     diplomaMonth: student.DiplomaMonthChoices?.Value,
  //     diplomaMonth_Value: student.DiplomaMonthChoices_Value
  //   });
  // }

  switch (conditionType) {
    case 'studentTypes': {
      // Check both possible property paths
      const studentType = student.StudentType?.Value || student.StudentType_Value;
      const match = studentType && conditionValue.includes(studentType);
      return { 
        condition: 'studentTypes', 
        match,
        expected: conditionValue,
        actual: studentType
      };
    }
    
    case 'diplomaMonths': {
      // Check both possible property paths
      const diplomaMonth = student.DiplomaMonthChoices?.Value || student.DiplomaMonthChoices_Value;
      const match = diplomaMonth && conditionValue.includes(diplomaMonth);
      return { 
        condition: 'diplomaMonths', 
        match,
        expected: conditionValue,
        actual: diplomaMonth
      };
    }
    
    case 'courses': {
      const courseId = parseInt(student.id || student.CourseID);
      const match = !isNaN(courseId) && conditionValue.includes(courseId);
      return { 
        condition: 'courses', 
        match,
        expected: conditionValue,
        actual: courseId
      };
    }
    
    case 'schoolYears': {
      // Check both possible property paths
      const schoolYear = student.School_x0020_Year?.Value || student.School_x0020_Year_Value;
      const match = schoolYear && conditionValue.includes(schoolYear);
      return { 
        condition: 'schoolYears', 
        match,
        expected: conditionValue,
        actual: schoolYear
      };
    }
    
    case 'scheduleEndDateRange': {
      let scheduleEndDate = student.ScheduleEndDate;
      
      // Extract date portion if it's in ISO format
      if (scheduleEndDate && scheduleEndDate.includes('T')) {
        scheduleEndDate = scheduleEndDate.split('T')[0];
      }
      
      const { start, end } = conditionValue;
      const match = scheduleEndDate && scheduleEndDate >= start && scheduleEndDate <= end;
      return { 
        condition: 'scheduleEndDateRange', 
        match,
        expected: `${start} to ${end}`,
        actual: scheduleEndDate
      };
    }
    
    case 'ageRange': {
      if (studentAge === null) {
        return {
          condition: 'ageRange',
          match: false,
          expected: `${conditionValue.min} to ${conditionValue.max}`,
          actual: null
        };
      }
      
      const { min, max } = conditionValue;
      const match = studentAge >= min && studentAge <= max;
      return { 
        condition: 'ageRange', 
        match,
        expected: `${min} to ${max}`,
        actual: studentAge
      };
    }
    
    case 'emails': {
      // Keep email filtering functionality, but it will be hidden in UI
      if (!studentEmail) {
        return {
          condition: 'emails',
          match: false,
          expected: conditionValue,
          actual: ''
        };
      }
      
      const match = conditionValue.some(email => 
        email.toLowerCase() === studentEmail.toLowerCase()
      );
      return { 
        condition: 'emails', 
        match,
        expected: conditionValue,
        actual: studentEmail
      };
    }
    
    case 'categories': {
      if (!student.categories) {
        return {
          condition: 'categories',
          match: false,
          expected: 'At least one matching category',
          actual: 'No categories'
        };
      }
      
      const match = conditionValue.some(teacherCat => {
        const teacherEmailKey = Object.keys(teacherCat)[0];
        const categoryIds = teacherCat[teacherEmailKey] || [];
        
        // Skip if no categories for this teacher
        if (!categoryIds.length) return false;
        
        // If we have teacher categories for this student
        if (student.categories && student.categories[teacherEmailKey]) {
          // Check if any of the required categories match
          return categoryIds.some(categoryId => 
            student.categories[teacherEmailKey] && 
            student.categories[teacherEmailKey][categoryId] === true
          );
        }
        
        return false;
      });
      
      return { 
        condition: 'categories', 
        match,
        expected: 'At least one matching category',
        actual: 'Student categories'
      };
    }
    
    case 'activeFutureArchivedValues': {
      // Check both possible property paths
      const status = student.ActiveFutureArchived_Value || student.ActiveFutureArchived?.Value;
      const match = status && conditionValue.includes(status);
      return { 
        condition: 'activeFutureArchivedValues', 
        match,
        expected: conditionValue,
        actual: status
      };
    }
    
    default:
      return {
        condition: conditionType,
        match: false,
        expected: conditionValue,
        actual: 'Unknown condition type'
      };
  }
};

/**
 * Convert notification conditions to evaluatable format
 * @param {Object} conditions - Raw conditions object from notification
 * @returns {Array} - Array of condition objects with type and value
 */
export const formatConditions = (conditions) => {
  if (!conditions) return [];
  
  const result = [];
  
  if (conditions.studentTypes && conditions.studentTypes.length > 0) {
    result.push({
      type: 'studentTypes',
      value: conditions.studentTypes
    });
  }
  
  if (conditions.diplomaMonths && conditions.diplomaMonths.length > 0) {
    result.push({
      type: 'diplomaMonths',
      value: conditions.diplomaMonths
    });
  }
  
  if (conditions.courses && conditions.courses.length > 0) {
    result.push({
      type: 'courses',
      value: conditions.courses
    });
  }
  
  if (conditions.schoolYears && conditions.schoolYears.length > 0) {
    result.push({
      type: 'schoolYears',
      value: conditions.schoolYears
    });
  }
  
  if (conditions.scheduleEndDateRange && 
      conditions.scheduleEndDateRange.start && 
      conditions.scheduleEndDateRange.end) {
    result.push({
      type: 'scheduleEndDateRange',
      value: conditions.scheduleEndDateRange
    });
  }
  
  if (conditions.ageRange && 
      typeof conditions.ageRange.min === 'number' && 
      typeof conditions.ageRange.max === 'number') {
    result.push({
      type: 'ageRange',
      value: conditions.ageRange
    });
  }
  
  // Keep email filtering functionality for backward compatibility
  if (conditions.emails && conditions.emails.length > 0) {
    result.push({
      type: 'emails',
      value: conditions.emails
    });
  }
  
  if (conditions.categories && conditions.categories.length > 0) {
    result.push({
      type: 'categories',
      value: conditions.categories
    });
  }
  
  if (conditions.activeFutureArchivedValues && conditions.activeFutureArchivedValues.length > 0) {
    result.push({
      type: 'activeFutureArchivedValues',
      value: conditions.activeFutureArchivedValues
    });
  }
  
  return result;
};

/**
 * Helper function to get interval in milliseconds
 * @param {Object} interval - The interval object with unit and value
 * @returns {number} - Interval in milliseconds
 */
export const getIntervalInMilliseconds = (interval) => {
  if (!interval || !interval.unit || !interval.value) {
    return 604800000; // Default to 7 days (1 week) if invalid
  }
  
  const valueNum = Number(interval.value) || 1;
  
  switch (interval.unit) {
    case 'day':
      return valueNum * 24 * 60 * 60 * 1000;
    case 'week':
      return valueNum * 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return valueNum * 30 * 24 * 60 * 60 * 1000; // approximation
    default:
      return 7 * 24 * 60 * 60 * 1000; // default to 1 week
  }
};

/**
 * Determine if a notification should be displayed for a specific course/student
 * @param {Object} notification - The notification to evaluate
 * @param {Object} course - The course object with student data
 * @param {Object} profile - Student profile data
 * @param {Object} seenNotifications - Dictionary of notifications that have been seen
 * @returns {Object} - Match result with condition results and overall match status
 */
export const evaluateNotificationMatch = (notification, course, profile, seenNotifications = {}) => {


  // Determine notification characteristics
  const isSurveyType = notification.type === 'survey' || 
                       notification.type === 'weekly-survey' || 
                       (notification.type === 'notification' && notification.surveyQuestions);
  
  // Get display frequency from notification properties, with strong prioritization
  // 1. Use displayConfig.frequency if available (new format)
  // 2. Use explicit type-based identification (weekly-survey)
  // 3. Use renewalConfig if available (transitional format)
  // 4. Check for repeatInterval (legacy format)
  // 5. Fall back to one-time as default
  const displayFrequency = 
    // New primary structure
    notification.displayConfig?.frequency || 
    // Type-based detection
    (notification.type === 'weekly-survey' ? 'weekly' : 
    // Legacy renewalConfig structure
    (notification.renewalConfig?.method === 'day' ? 'weekly' : 
     notification.renewalConfig?.method === 'custom' ? 'custom' : 
    // Legacy repeatInterval structure
    (notification.repeatInterval ? 
      (notification.repeatInterval.unit === 'day' ? 'weekly' : 
       notification.repeatInterval.unit === 'week' ? 'weekly' : 
       notification.repeatInterval.unit === 'month' ? 'monthly' : 'custom') :
    // Default fallback
    'one-time')));
  
  // Determine if this is a one-time notification type
  // Prioritize displayConfig.frequency, then check other properties for backwards compatibility
  const isOneTimeType = displayFrequency === 'one-time' || 
                        notification.type === 'once' || 
                        (notification.type === 'notification' && 
                         !notification.repeatInterval && 
                         !notification.renewalConfig && 
                         (!notification.displayConfig || notification.displayConfig.frequency === 'one-time')) ||
                        (notification.type === 'survey' && 
                         !notification.repeatInterval && 
                         !notification.renewalConfig && 
                         (!notification.displayConfig || notification.displayConfig.frequency === 'one-time') && 
                         notification.type !== 'weekly-survey');
  
  // Determine if this is a repeating notification
  // A notification repeats if it has any frequency other than one-time,
  // or has any repeating configuration in any format
  const hasRepeatInterval = displayFrequency === 'weekly' || 
                           displayFrequency === 'monthly' ||
                           displayFrequency === 'custom' ||
                           !!notification.repeatInterval || 
                           !!notification.renewalConfig ||
                           notification.type === 'weekly-survey' ||
                           notification.type === 'recurring';
  
  // Skip if this is a one-time notification that has been seen
  // For surveys, only check course-specific completion
  // For regular notifications, check both global and course-specific
  if (isSurveyType) {
    // For surveys, ONLY check course-specific completion
    if (isOneTimeType && course.studentDashboardNotificationsResults?.[notification.id]?.completed) {
      return {
        isMatch: false,
        shouldDisplay: false,
        conditionResults: [],
        reason: 'Survey already completed for this course'
      };
    }
  } else {
    // For regular notifications, check both global seen status and course-specific acknowledgment
    if ((isOneTimeType && seenNotifications[notification.id]) ||
        (isOneTimeType && course.studentDashboardNotificationsResults?.[notification.id]?.acknowledged)) {
      return {
        isMatch: false,
        shouldDisplay: false,
        conditionResults: [],
        reason: 'Already seen/acknowledged (one-time)'
      };
    }
  }
  
  // For repeating notifications/surveys, check if enough time has passed since the last interaction
  if (hasRepeatInterval) {
    const notificationResults = course.studentDashboardNotificationsResults?.[notification.id];
    
    // Find the most recent interaction from multiple possible sources
    // We need to check both lastSubmitted and lastSeen across different data structures
    let lastInteracted = null;
    
    // Check primaryNotificationResult first (direct result)
    if (notificationResults?.lastSubmitted) {
      lastInteracted = notificationResults.lastSubmitted;
    } else if (notificationResults?.lastSeen) {
      lastInteracted = notificationResults.lastSeen;
    }
    
    // Check submissions history (might have more recent timestamps)
    if (notificationResults?.submissions && Object.keys(notificationResults.submissions).length > 0) {
      const submissionTimestamps = Object.keys(notificationResults.submissions)
        .map(timestamp => {
          const submission = notificationResults.submissions[timestamp];
          return submission.submittedAt || submission.seenAt;
        })
        .filter(Boolean);
      
      if (submissionTimestamps.length > 0) {
        // Get the most recent timestamp
        const mostRecentSubmission = new Date(Math.max(...submissionTimestamps.map(date => new Date(date).getTime())));
        
        // If we found a submission date and it's more recent than what we had, use it
        if (!lastInteracted || new Date(mostRecentSubmission) > new Date(lastInteracted)) {
          lastInteracted = mostRecentSubmission.toISOString();
        }
      }
    }
    

    
    if (lastInteracted) {
      const lastInteractedDate = new Date(lastInteracted);
      const currentDate = getCurrentDate(); // Use our mocked date if set
      
      // Check if we have a stored nextRenewalDate that we can use
      let nextRenewalDateField = notificationResults?.nextRenewalDate;
      if (nextRenewalDateField) {
        const storedNextRenewalDate = new Date(nextRenewalDateField);
        
        
        // If we have a renewal date and the current date has reached it, immediately show
        if (currentDate >= storedNextRenewalDate) {
          // The renewal date has passed, allow the notification to show
          // console.log(`Renewal date ${storedNextRenewalDate.toISOString()} has passed, showing notification`);
          // Skip the day-of-week calculation and immediately determine this is a match
          return null; // Return null to continue with the rest of the match evaluation
        }
      }
      
      if (displayFrequency === 'weekly') {
        // Get day of week from displayConfig or renewalConfig or default to Monday
        const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                         notification.renewalConfig?.dayOfWeek || 'monday';
        
        // Convert day string to day number (0 = Sunday, 1 = Monday, etc.)
        const dayMap = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1; // Default to Monday
        
        // Calculate days since last interaction
        const daysSinceInteraction = Math.floor((currentDate - lastInteractedDate) / (24 * 60 * 60 * 1000));
        const currentDayNum = currentDate.getDay();
        
        // Find the next renewal date based on the last interaction
        let nextRenewalDate = new Date(lastInteractedDate);
        
        // Add days until we reach the target day of the week
        while (nextRenewalDate.getDay() !== targetDayNum) {
          nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
        }
        
        // If the next renewal date is the same as the last interaction date 
        // (i.e., the last interaction was on the target day),
        // add 7 days to get to the next occurrence of that day
        if (nextRenewalDate.getTime() === lastInteractedDate.getTime()) {
          nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
        }
        
        // Debug info for understanding the renewal logic
        // Commented out to reduce console noise
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`Weekly renewal calculation for ${notification.id}:`, {
        //     lastInteractedDate: lastInteractedDate.toISOString(),
        //     currentDate: currentDate.toISOString(),
        //     targetDayOfWeek: dayOfWeek,
        //     targetDayNum,
        //     currentDayNum,
        //     nextRenewalDate: nextRenewalDate.toISOString(),
        //     daysSinceInteraction,
        //     shouldRenew: currentDate >= nextRenewalDate
        //   });
        // }
        
        // The notification should display if the current date is on or after the next renewal date
        const shouldDisplay = currentDate >= nextRenewalDate;
        
        if (!shouldDisplay) {
          return {
            isMatch: false,
            shouldDisplay: false,
            conditionResults: [],
            reason: 'Weekly notification not yet due for display',
            nextAvailableDate: nextRenewalDate.toISOString()
          };
        }
      } else if (displayFrequency === 'custom') {
        // Get custom dates from displayConfig or renewalConfig
        const customDates = notification.displayConfig?.dates || notification.renewalConfig?.dates || [];
        
        // Check if any custom date is in the future and past the last interaction
        const now = currentDate.getTime();
        const hasUpcomingDate = customDates.some(dateMs => {
          const dateTime = new Date(dateMs).getTime();
          return dateTime > lastInteractedDate.getTime() && dateTime <= now;
        });
        
        if (!hasUpcomingDate) {
          // Find the next upcoming date for debug info
          const nextDate = customDates
            .filter(dateMs => new Date(dateMs).getTime() > now)
            .sort((a, b) => a - b)[0];
          
          return {
            isMatch: false,
            shouldDisplay: false,
            conditionResults: [],
            reason: 'Custom date notification not yet due for display',
            nextAvailableDate: nextDate ? new Date(nextDate).toISOString() : null
          };
        }
      } else {
        // For legacy repeating notifications, use the old interval logic
        let repeatInterval = notification.repeatInterval;
        if (notification.type === 'weekly-survey' && !repeatInterval) {
          repeatInterval = { value: 1, unit: 'week' };
        }
        
        const intervalMs = getIntervalInMilliseconds(repeatInterval);
        
        // If not enough time has passed, don't show the notification
        if (currentDate - lastInteractedDate < intervalMs) {
          return {
            isMatch: false,
            shouldDisplay: false,
            conditionResults: [],
            reason: 'Repeating notification was recently seen/completed',
            nextAvailableDate: new Date(lastInteractedDate.getTime() + intervalMs).toISOString()
          };
        }
      }
    }
  }
  
  // Check if this survey has already been completed for this specific course
  const notificationResults = course.studentDashboardNotificationsResults?.[notification.id];
  
  // For surveys, we ONLY check the course-specific completion status
  // This ensures each course can have its own survey completion state
  let surveyCompleted = false;
  
  if (isSurveyType) {
    // Always check course-specific completion for surveys
    // This is the key change - we only look at the course-specific result
    surveyCompleted = notificationResults?.completed === true;
    
    // Debug logging for survey completion check
    // Commented out to reduce console noise
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`Survey completion check for ${notification.id} in course ${course.id}:`, {
    //     courseSpecificCompleted: notificationResults?.completed,
    //     surveyCompleted
    //   });
    // }
  }
  
  // Format conditions for evaluation
  const conditions = notification.conditions || {};
  const formattedConditions = formatConditions(conditions);
  
  // If no conditions, don't match
  if (formattedConditions.length === 0) {
    return {
      isMatch: false,
      shouldDisplay: false,
      conditionResults: [],
      reason: 'No matching conditions defined'
    };
  }
  
  // Evaluate each condition
  const conditionResults = formattedConditions.map(condition => 
    evaluateCondition(condition, course, profile)
  );
  
  // Apply logic - AND requires all conditions to match, OR requires any condition to match
  const logic = conditions.logic || 'and';
  let isMatch = false;
  
  if (logic === 'and') {
    isMatch = conditionResults.every(result => result.match);
  } else {
    isMatch = conditionResults.some(result => result.match);
  }
  
  // Debug match results
  // Commented out to reduce console noise
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('NOTIFICATION MATCHING RESULTS:', {
  //     notificationId: notification.id,
  //     notificationTitle: notification.title,
  //     courseId: course.id,
  //     logic,
  //     isMatch,
  //     conditionResults: conditionResults.map(r => ({
  //       condition: r.condition,
  //       match: r.match,
  //       expected: r.expected,
  //       actual: r.actual
  //     }))
  //   });
  // }
  
  // If not matched, return now
  if (!isMatch) {
    return {
      isMatch: false,
      shouldDisplay: false,
      conditionResults,
      reason: 'Conditions did not match'
    };
  }
  
  // Check if notification should actually be displayed
  let shouldDisplay = true;
  let displayReason = 'Conditions matched';
  
  // Handle completed surveys differently based on frequency
  if (isSurveyType) {
    if (isOneTimeType && surveyCompleted) {
      // One-time surveys don't show again once completed
      shouldDisplay = false;
      displayReason = 'One-time survey already completed';
    } else if (hasRepeatInterval && surveyCompleted) {
      // For repeating surveys, we need to check if enough time has passed to show it again
      // This check happens in the hasRepeatInterval section above, so if we get here with
      // shouldDisplay still true, it means we should show it despite being completed before
      
      // Add debug info
      // Commented out to reduce console noise
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`Survey ${notification.id} renewal evaluation:`, {
      //     type: notification.type,
      //     completed: surveyCompleted,
      //     hasRepeatInterval,
      //     displayFrequency,
      //     shouldDisplay
      //   });
      // }
    }
  }
  
  // If it's a one-time notification (not survey) that's been completed or acknowledged, don't show it again
  if (isOneTimeType && !isSurveyType && 
      (course.studentDashboardNotificationsResults?.[notification.id]?.completed ||
       course.studentDashboardNotificationsResults?.[notification.id]?.acknowledged)) {
    shouldDisplay = false;
    displayReason = 'One-time notification already acknowledged';
  }
  
  // Prepare the result object
  const result = {
    isMatch,
    shouldDisplay,
    conditionResults,
    reason: displayReason,
    surveyCompleted,
    surveyAnswers: notificationResults?.answers,
    surveyCompletedAt: notificationResults?.completedAt
  };
  
  // Add next available date for repeating notifications
  if (hasRepeatInterval && notificationResults?.lastSubmitted) {
    const lastSubmittedDate = new Date(notificationResults.lastSubmitted);
    const repeatInterval = notification.repeatInterval || 
                          (notification.type === 'weekly-survey' ? { value: 1, unit: 'week' } : null);
    const intervalMs = getIntervalInMilliseconds(repeatInterval);
    result.nextAvailableDate = new Date(lastSubmittedDate.getTime() + intervalMs).toISOString();
  }
  
  return result;
};

/**
 * Process notifications for a set of courses/students
 * @param {Array} courses - Array of course objects with student data
 * @param {Object} profile - Student profile data
 * @param {Array} allNotifications - Array of all notifications
 * @param {Object} seenNotifications - Dictionary of notifications that have been seen
 * @returns {Array} - Updated courses with matching notifications
 */
export const processNotificationsForCourses = (courses, profile, allNotifications, seenNotifications = {}) => {
  // Debug what's being passed in
  // Commented out to reduce console noise
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('PROCESSING NOTIFICATIONS:', {
  //     courseCount: courses?.length || 0,
  //     hasProfile: !!profile,
  //     notificationCount: allNotifications?.length || 0
  //   });
  // }

  if (!courses || !profile || !allNotifications || !Array.isArray(courses) || courses.length === 0) {
    return courses;
  }

  if (allNotifications.length === 0) {
    return courses;
  }

  // Process each course
  return courses.map(course => {
    // Create new object to avoid modifying the original
    const courseWithNotifications = { ...course };
    courseWithNotifications.notificationIds = {};

    // Process each notification for this course
    allNotifications.forEach(notification => {
      const result = evaluateNotificationMatch(notification, course, profile, seenNotifications);
      
      // If matched and should display, add to course
      if (result.isMatch && result.shouldDisplay) {
        // Create the base notification object
        const processedNotification = {
          id: notification.id,
          title: notification.title,
          content: notification.content,
          frequency: notification.frequency,
          type: notification.type,
          important: notification.important,
          Important: notification.Important, // Include capitalized version for backward compatibility
          surveyCompleted: result.surveyCompleted,
          surveyAnswers: result.surveyAnswers,
          surveyCompletedAt: result.surveyCompletedAt,
          // Include acknowledged status from results
          hasAcknowledged: course.studentDashboardNotificationsResults?.[notification.id]?.hasAcknowledged || false,
          acknowledgedAt: course.studentDashboardNotificationsResults?.[notification.id]?.acknowledgedAt,
          shouldDisplay: true,
          surveyQuestions: notification.surveyQuestions || [],
          notificationId: notification.id, // Add explicit notificationId for easier reference
          
          // IMPORTANT: Preserve the configuration properties
          displayConfig: notification.displayConfig,
          renewalConfig: notification.renewalConfig
        };
        
        // IMPORTANT: Explicitly preserve the repeatInterval property if it exists
        // This ensures we maintain the information about whether this is a repeating notification
        if (notification.hasOwnProperty('repeatInterval')) {
          processedNotification.repeatInterval = notification.repeatInterval;
          
          // Add debugging in development
          // Commented out to reduce console noise
          // if (process.env.NODE_ENV === 'development') {
          //   console.log(`Preserved repeatInterval for notification ${notification.id}:`, {
          //     type: notification.type,
          //     repeatInterval: notification.repeatInterval,
          //     isObject: typeof notification.repeatInterval === 'object',
          //     hasUnit: notification.repeatInterval?.unit,
          //     hasValue: notification.repeatInterval?.value
          //   });
          // }
        }
        
        courseWithNotifications.notificationIds[notification.id] = processedNotification;
      }
    });
    
    // Debug the notifications added to this course
    // Commented out to reduce console noise
    // if (process.env.NODE_ENV === 'development') {
    //   const notificationCount = Object.keys(courseWithNotifications.notificationIds).length;
    //   if (notificationCount > 0) {
    //     console.log('NOTIFICATIONS ADDED TO COURSE:', {
    //       courseId: course.id,
    //       notificationCount,
    //       notifications: Object.values(courseWithNotifications.notificationIds).map(n => ({
    //         id: n.id,
    //         title: n.title,
    //         type: n.type,
    //         hasRepeatInterval: !!n.repeatInterval,
    //         repeatInterval: n.repeatInterval,
    //         hasRepeatIntervalProperty: n.hasOwnProperty('repeatInterval'),
    //         typeDescription: n.type === 'survey' ? 
    //           (n.repeatInterval ? 'Repeating Survey' : 'One-time Survey') : 
    //           n.type === 'notification' ? 
    //             (n.repeatInterval ? 'Repeating Notification' : 'One-time Notification') : 
    //             n.type
    //       }))
    //     });
    //   }
    // }
    
    return courseWithNotifications;
  });
};

/**
 * Filter students by notification conditions
 * @param {Object} notification - Notification object with conditions
 * @param {Array} students - Array of student objects
 * @param {boolean} useFormState - Whether to use form state instead of notification (for StudentDashboardNotifications.js)
 * @param {Object} formState - Current form state for notification editing (only used if useFormState is true)
 * @returns {Array} - Filtered student array
 */
export const filterStudentsByNotificationConditions = (notification, students, useFormState = false, formState = {}) => {
  if (!students || !students.length) {
    return [];
  }
  
  // Determine which conditions to use - either from the notification object or current form state
  let conditions;
  let isAndLogic;
  
  if (useFormState) {
    // Use current form state instead of a notification object
    conditions = {
      studentTypes: formState.selectedStudentTypes.length > 0 ? formState.selectedStudentTypes : undefined,
      diplomaMonths: formState.selectedDiplomaMonths.length > 0 ? formState.selectedDiplomaMonths : undefined,
      courses: formState.selectedCourses.length > 0 ? formState.selectedCourses : undefined,
      schoolYears: formState.selectedSchoolYears.length > 0 ? formState.selectedSchoolYears : undefined,
      emails: formState.selectedEmails.length > 0 ? formState.selectedEmails : undefined,
      categories: formState.selectedCategories.length > 0 ? formState.selectedCategories : undefined,
      activeFutureArchivedValues: formState.selectedActiveFutureArchivedValues.length > 0 ? formState.selectedActiveFutureArchivedValues : ["Active"],
      ageRange: formState.ageRange.min && formState.ageRange.max ? {
        min: parseInt(formState.ageRange.min),
        max: parseInt(formState.ageRange.max)
      } : undefined,
      scheduleEndDateRange: formState.scheduleEndDateRange.start && formState.scheduleEndDateRange.end ? {
        start: formState.scheduleEndDateRange.start,
        end: formState.scheduleEndDateRange.end
      } : undefined,
      logic: formState.conditionLogic
    };
    isAndLogic = formState.conditionLogic !== 'or';
  } else {
    // Use the provided notification object
    conditions = notification.conditions || {};
    // Set default ActiveFutureArchived values to "Active" if not specified
    if (!conditions.activeFutureArchivedValues) {
      conditions.activeFutureArchivedValues = ["Active"];
    }
    isAndLogic = conditions.logic !== 'or'; // Default to 'and' logic if not specified
  }
  
  return students.filter(student => {
    // Array to track which conditions are met
    const conditionResults = [];
    
    // Check email condition - if specified, this is still a supported filter type
    if (conditions.emails && conditions.emails.length > 0) {
      // For selected email AND course, check if student email matches any of the selected emails
      const emailMatches = student.StudentEmail && 
                          conditions.emails.includes(student.StudentEmail.toLowerCase());
      
      // If email doesn't match, return false immediately (AND condition)
      if (!emailMatches) {
        return false;
      }
    }
    
    // Check student type condition
    if (conditions.studentTypes && conditions.studentTypes.length > 0) {
      const studentTypesMatch = conditions.studentTypes.includes(student.StudentType_Value);
      conditionResults.push(studentTypesMatch);
    }
    
    // Check diploma month condition
    if (conditions.diplomaMonths && conditions.diplomaMonths.length > 0) {
      const diplomaMonthsMatch = conditions.diplomaMonths.includes(student.DiplomaMonthChoices_Value);
      conditionResults.push(diplomaMonthsMatch);
    }
    
    // Check course condition
    if (conditions.courses && conditions.courses.length > 0) {
      const coursesMatch = conditions.courses.includes(student.CourseID);
      conditionResults.push(coursesMatch);
    }
    
    // Check school year condition
    if (conditions.schoolYears && conditions.schoolYears.length > 0) {
      const schoolYearsMatch = conditions.schoolYears.includes(student.School_x0020_Year_Value);
      conditionResults.push(schoolYearsMatch);
    }
    
    // Check schedule end date range condition
    if (conditions.scheduleEndDateRange && 
        conditions.scheduleEndDateRange.start && 
        conditions.scheduleEndDateRange.end && 
        student.ScheduleEndDate) {
      
      const scheduleEndDate = new Date(student.ScheduleEndDate);
      const rangeStart = new Date(conditions.scheduleEndDateRange.start);
      const rangeEnd = new Date(conditions.scheduleEndDateRange.end);
      
      const dateInRange = scheduleEndDate >= rangeStart && scheduleEndDate <= rangeEnd;
      conditionResults.push(dateInRange);
    }
    
    // Check age range condition
    if (conditions.ageRange && 
        typeof conditions.ageRange.min === 'number' && 
        typeof conditions.ageRange.max === 'number' && 
        typeof student.age === 'number') {
      
      const ageInRange = student.age >= conditions.ageRange.min && student.age <= conditions.ageRange.max;
      conditionResults.push(ageInRange);
    }
    
    // Check category condition
    if (conditions.categories && conditions.categories.length > 0) {
      const categoryMatches = conditions.categories.some(teacherCat => {
        const teacherEmailKey = Object.keys(teacherCat)[0];
        const categoryIds = teacherCat[teacherEmailKey] || [];
        
        // Skip if no categories for this teacher
        if (!categoryIds.length) return false;
        
        // If we have teacher categories for this student
        if (student.categories && student.categories[teacherEmailKey]) {
          // Check if any of the required categories match
          return categoryIds.some(categoryId => 
            student.categories[teacherEmailKey] && 
            student.categories[teacherEmailKey][categoryId] === true
          );
        }
        
        return false;
      });
      
      conditionResults.push(categoryMatches);
    }
    
    // Check ActiveFutureArchived condition
    if (conditions.activeFutureArchivedValues && conditions.activeFutureArchivedValues.length > 0) {
      const activeFutureArchivedMatches = conditions.activeFutureArchivedValues.includes(
        student.ActiveFutureArchived_Value
      );
      conditionResults.push(activeFutureArchivedMatches);
    }
    
    // If no conditions were evaluated (besides email which was already checked)
    // and we have an email condition, return true since email already matched
    if (conditionResults.length === 0) {
      return conditions.emails && conditions.emails.length > 0;
    }
    
    // Check all conditions based on logic
    if (isAndLogic) {
      // AND logic - all conditions must be true
      return conditionResults.every(result => result === true);
    } else {
      // OR logic - at least one condition must be true
      return conditionResults.some(result => result === true);
    }
  });
};

/**
 * Check if a notification is important
 * @param {Object} notification - Notification object
 * @returns {boolean} - True if the notification is important
 */
export const isImportantNotification = (notification) => {
  return (notification.important === true) || 
         (notification.Important === true) ||
         (typeof notification.important === 'string' && notification.important.toLowerCase() === 'true') ||
         (typeof notification.Important === 'string' && notification.Important.toLowerCase() === 'true');
};