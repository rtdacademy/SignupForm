/**
 * Utilities for notification filtering
 * This file contains shared logic for filtering student dashboard notifications
 * Used by both StudentDashboardNotifications.js and useStudentData.js
 */

/**
 * Calculate age from birthdate
 * @param {string} birthdate - Birthdate in any format accepted by Date constructor
 * @returns {number|null} - Age in years or null if birthdate is invalid
 */
export const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  
  const birthDate = new Date(birthdate);
  const today = new Date();
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
  if (process.env.NODE_ENV === 'development' && conditionType === 'studentTypes') {
    console.log('DEBUG COURSE STRUCTURE:', {
      id: student.id,
      studentType: student.StudentType?.Value,
      studentType_Value: student.StudentType_Value,
      courseId: student.CourseID,
      schoolYear: student.School_x0020_Year?.Value,
      schoolYear_Value: student.School_x0020_Year_Value,
      diplomaMonth: student.DiplomaMonthChoices?.Value,
      diplomaMonth_Value: student.DiplomaMonthChoices_Value
    });
  }

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
  // Debug first notification evaluation
  if (process.env.NODE_ENV === 'development') {
    console.log('EVALUATING NOTIFICATION MATCH:', {
      notificationId: notification.id,
      notificationTitle: notification.title,
      notificationType: notification.type,
      hasRepeatInterval: !!notification.repeatInterval,
      courseId: course.id,
      hasConditions: !!notification.conditions,
      conditionCount: notification.conditions ? Object.keys(notification.conditions).length : 0
    });
  }

  // Determine notification characteristics
  const isSurveyType = notification.type === 'survey' || 
                       notification.type === 'weekly-survey' || 
                       (notification.type === 'notification' && notification.surveyQuestions);
  
  const isOneTimeType = notification.type === 'once' || 
                        (notification.type === 'notification' && !notification.repeatInterval) ||
                        (notification.type === 'survey' && !notification.repeatInterval && notification.type !== 'weekly-survey');
  
  const hasRepeatInterval = !!notification.repeatInterval || notification.type === 'weekly-survey';
  
  // Skip if this is a one-time notification that has been seen
  if ((isOneTimeType && seenNotifications[notification.id]) ||
      (isOneTimeType && course.studentDashboardNotificationsResults?.[notification.id]?.completed) ||
      (notification.type === 'survey' && !hasRepeatInterval && course.studentDashboardNotificationsResults?.[notification.id]?.completed)) {
    return {
      isMatch: false,
      shouldDisplay: false,
      conditionResults: [],
      reason: 'Already seen/completed (one-time)'
    };
  }
  
  // For repeating notifications/surveys, check if enough time has passed since the last interaction
  if (hasRepeatInterval) {
    const notificationResults = course.studentDashboardNotificationsResults?.[notification.id];
    const lastInteracted = notificationResults?.lastSubmitted || notificationResults?.lastSeen;
    
    if (lastInteracted) {
      const lastInteractedDate = new Date(lastInteracted);
      const currentDate = new Date();
      
      // For legacy weekly-survey type
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
  
  // Check if this survey has already been completed for this specific course
  const notificationResults = course.studentDashboardNotificationsResults?.[notification.id];
  const surveyCompleted = isSurveyType && notificationResults?.completed === true;
  
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
  if (process.env.NODE_ENV === 'development') {
    console.log('NOTIFICATION MATCHING RESULTS:', {
      notificationId: notification.id,
      notificationTitle: notification.title,
      courseId: course.id,
      logic,
      isMatch,
      conditionResults: conditionResults.map(r => ({
        condition: r.condition,
        match: r.match,
        expected: r.expected,
        actual: r.actual
      }))
    });
  }
  
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
  
  // If it's a survey that's been completed for this course, and is not repeating, don't show it again
  if (isSurveyType && !hasRepeatInterval && surveyCompleted) {
    shouldDisplay = false;
    displayReason = 'Survey already completed';
  }
  
  // If it's a one-time notification that's been completed or acknowledged, don't show it again
  if (isOneTimeType && 
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
  if (process.env.NODE_ENV === 'development') {
    console.log('PROCESSING NOTIFICATIONS:', {
      courseCount: courses?.length || 0,
      hasProfile: !!profile,
      notificationCount: allNotifications?.length || 0
    });
  }

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
          shouldDisplay: true,
          surveyQuestions: notification.surveyQuestions || [],
          notificationId: notification.id // Add explicit notificationId for easier reference
        };
        
        // IMPORTANT: Explicitly preserve the repeatInterval property if it exists
        // This ensures we maintain the information about whether this is a repeating notification
        if (notification.hasOwnProperty('repeatInterval')) {
          processedNotification.repeatInterval = notification.repeatInterval;
          
          // Add debugging in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`Preserved repeatInterval for notification ${notification.id}:`, {
              type: notification.type,
              repeatInterval: notification.repeatInterval,
              isObject: typeof notification.repeatInterval === 'object',
              hasUnit: notification.repeatInterval?.unit,
              hasValue: notification.repeatInterval?.value
            });
          }
        }
        
        courseWithNotifications.notificationIds[notification.id] = processedNotification;
      }
    });
    
    // Debug the notifications added to this course
    if (process.env.NODE_ENV === 'development') {
      const notificationCount = Object.keys(courseWithNotifications.notificationIds).length;
      if (notificationCount > 0) {
        console.log('NOTIFICATIONS ADDED TO COURSE:', {
          courseId: course.id,
          notificationCount,
          notifications: Object.values(courseWithNotifications.notificationIds).map(n => ({
            id: n.id,
            title: n.title,
            type: n.type,
            hasRepeatInterval: !!n.repeatInterval,
            repeatInterval: n.repeatInterval,
            hasRepeatIntervalProperty: n.hasOwnProperty('repeatInterval'),
            typeDescription: n.type === 'survey' ? 
              (n.repeatInterval ? 'Repeating Survey' : 'One-time Survey') : 
              n.type === 'notification' ? 
                (n.repeatInterval ? 'Repeating Notification' : 'One-time Notification') : 
                n.type
          }))
        });
      }
    }
    
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