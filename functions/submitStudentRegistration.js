// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const { initializeGradebook } = require('./shared/utilities/database-utils');
const { updateCreditTracking } = require('./utils/creditTracking');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function: submitStudentRegistration
 * Securely handles the initial student registration process
 * Creates student profile and course enrollments
 */
const submitStudentRegistration = onCall({
  memory: '512MiB',
  timeoutSeconds: 120,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { registrationData, emulationOverride } = data.data;
  const uid = data.auth.uid;

  // Use emulated student email if teacher is emulating, otherwise use the authenticated user's email
  const userEmail = emulationOverride?.studentEmail || data.auth.token.email;
  const studentEmailKey = emulationOverride?.studentEmailKey || sanitizeEmail(userEmail);

  if (!registrationData || !registrationData.formData) {
    throw new HttpsError('invalid-argument', 'Missing registration data');
  }

  const db = admin.database();

  // Log if this is an emulated registration for audit purposes
  if (emulationOverride) {
    console.log(`📋 Teacher ${data.auth.token.email} is registering course for student ${userEmail} via emulation`);
  }
  const formData = registrationData.formData;

  try {
    // Validate required fields
    if (!formData.courseId || !formData.studentType || !formData.firstName || !formData.lastName) {
      throw new HttpsError('invalid-argument', 'Missing required registration fields');
    }

    // Check blacklist before proceeding with registration
    const blacklistRef = db.ref('blacklist/active');
    const blacklistSnapshot = await blacklistRef.once('value');
    
    if (blacklistSnapshot.exists()) {
      const blacklistData = blacklistSnapshot.val();
      const blacklistEntries = Object.values(blacklistData);
      
      // Check if student's ASN or email is blacklisted
      const isBlacklisted = blacklistEntries.some(entry => 
        (formData.albertaStudentNumber && entry.asn === formData.albertaStudentNumber) ||
        (userEmail && entry.email.toLowerCase() === userEmail.toLowerCase())
      );
      
      if (isBlacklisted) {
        // Log the blacklist attempt for audit purposes
        const blacklistLogRef = db.ref('blacklist/rejectionLog');
        await blacklistLogRef.push({
          attemptedEmail: userEmail,
          attemptedASN: formData.albertaStudentNumber || '',
          attemptedCourse: formData.courseName || formData.courseId,
          timestamp: new Date().toISOString(),
          reason: 'Student is blacklisted'
        });
        
        throw new HttpsError('permission-denied', 'Registration not permitted for this student account.');
      }
    }

    // Ensure courseId is a valid number
    const numericCourseId = Number(formData.courseId);
    if (isNaN(numericCourseId)) {
      throw new HttpsError('invalid-argument', 'Invalid Course ID format');
    }

    // Check if student is already actively enrolled in this course
    const existingCourseRef = db.ref(`students/${studentEmailKey}/courses/${numericCourseId}`);
    const existingCourseSnapshot = await existingCourseRef.once('value');
    
    // Store existing data for preservation if this is a transition
    let existingCourseData = null;
    let isTransitionRegistration = false;

    if (existingCourseSnapshot.exists()) {
      existingCourseData = existingCourseSnapshot.val();
      const status = existingCourseData?.ActiveFutureArchived?.Value;
      
      // Check if this is a transition re-registration
      if (existingCourseData?.transition === true) {
        isTransitionRegistration = true;
        console.log(`Processing transition re-registration for course ${numericCourseId}`);
      } else {
        // Only block registration if student has Active, Future, or Registration status
        // Empty status or Archived status should allow re-registration
        if (status === 'Active' || status === 'Future' || status === 'Registration') {
          throw new HttpsError('already-exists', `You are already registered for this course with status: ${status}`);
        }
      }
    }

    // Build the profile data
    const profileData = {
      "LastSync": new Date().toISOString(),
      "ParentEmail": formData.parentEmail || '',
      "parentApprovalStatus": {
        "required": formData.age < 18,
        "status": formData.age >= 18 ? "not_required" : "pending",
        "lastUpdated": new Date().toISOString()
      },
      "ParentPhone_x0023_": formData.parentPhone || '',
      "ParentFirstName": formData.parentFirstName || '',
      "ParentLastName": formData.parentLastName || '',
      "preferredFirstName": formData.preferredFirstName || formData.firstName,
      "age": formData.age || '',
      "birthday": formData.birthday || '',
      "StudentEmail": userEmail,
      "StudentPhone": formData.phoneNumber || '',
      "asn": formData.albertaStudentNumber || '',
      // ASN guidance tracking - only track if RTD needs to create ASN
      "needsASNCreation": formData.needsASNCreation || false,
      "gender": formData.gender || '',
      "firstName": formData.firstName || '',
      "lastName": formData.lastName || '',
      "originalEmail": userEmail,
      "uid": emulationOverride ? null : uid, // Don't save staff uid when emulating
      // Add address information if provided
      ...(formData.address && {
        "address": formData.address
      }),
      // Add new registration fields
      "studentPhoto": formData.studentPhoto || '',
      "albertaResident": formData.albertaResident || false,
      "parentRelationship": formData.parentRelationship || '',
      "isLegalGuardian": formData.isLegalGuardian || false,
      "hasLegalRestrictions": formData.hasLegalRestrictions || '',
      "legalDocumentUrl": formData.legalDocumentUrl || '',
      "indigenousIdentification": formData.indigenousIdentification || '',
      "indigenousStatus": formData.indigenousStatus || '',
      "citizenshipDocuments": formData.citizenshipDocuments || [],
      "howDidYouHear": formData.howDidYouHear || '',
      "whyApplying": formData.whyApplying || '',
      // Add international student information to profile if applicable
      ...(registrationData.studentType === 'International Student' && {
        "internationalDocuments": formData.internationalDocuments || 
          // Fallback to old format if new format is not available
          (formData.documents ? {
            "passport": formData.documents.passport || '',
            "additionalID": formData.documents.additionalID || '',
            "residencyProof": formData.documents.residencyProof || ''
          } : [])
      })
    };

    // Fetch required courses
    const requiredCourses = await fetchRequiredCourses(userEmail);

    // STEP 1: Extract data to preserve if this is a transition
    let preservedPaymentStatus = null;
    let preservedNotes = [];
    let preservedStatusLog = [];
    let preservedCreatedDate = null;
    
    if (isTransitionRegistration && existingCourseData) {
      // Extract each preserved field explicitly
      preservedPaymentStatus = existingCourseData.payment_status || null;
      preservedNotes = Array.isArray(existingCourseData.jsonStudentNotes) 
        ? existingCourseData.jsonStudentNotes 
        : [];
      preservedStatusLog = Array.isArray(existingCourseData.statusLog) 
        ? existingCourseData.statusLog 
        : [];
      preservedCreatedDate = existingCourseData.Created || null;
      
      console.log('Preserving transition data:', {
        hasPaymentStatus: !!preservedPaymentStatus,
        notesCount: preservedNotes.length,
        statusLogCount: preservedStatusLog.length,
        hasCreatedDate: !!preservedCreatedDate
      });
    }
    
    // STEP 2: Build student notes array
    let studentNotes = [];
    
    // Add transition note if applicable
    if (isTransitionRegistration) {
      studentNotes.push({
        "author": "System",
        "content": `🔄 Course Transition Re-registration\n\nStudent re-registered for the next school year.\nPrevious Student Type: ${existingCourseData?.StudentType?.Value || 'Unknown'}\nNew Student Type: ${formData.studentType}\nPrevious Year: ${existingCourseData?.School_x0020_Year?.Value || 'Unknown'}\nNew Year: ${formData.enrollmentYear}`,
        "id": `note-transition-${Date.now()}`,
        "noteType": "🔄",
        "timestamp": new Date().toISOString()
      });
    }
    
    // Add the new registration note
    studentNotes.push({
      "author": emulationOverride
        ? `(${data.auth.token.email}) on behalf of ${formData.firstName} ${formData.lastName}`
        : `${formData.firstName} ${formData.lastName}`,
      "content": `${emulationOverride ? `(${data.auth.token.email}) registered student via emulation. ` : ''}Student completed the registration form.${
        formData.needsASNCreation
          ? '\n\n🆔 ASN Required: RTD Academy needs to create a K-12 ASN for this student.'
          : ''
      }${
        formData.additionalInformation
          ? '\n\nAdditional Information:\n' + formData.additionalInformation
          : ''
      }${
        requiredCourses.length > 0
          ? '\n\nAuto-enrolled in required courses.'
          : ''
      }${
        isTransitionRegistration
          ? '\n\n📌 This is a transition re-registration for the next school year.'
          : ''
      }`,
      "id": `note-${Date.now()}`,
      "noteType": isTransitionRegistration ? "🔄" : "📝",
      "timestamp": new Date().toISOString()
    });
    
    // Append preserved notes after new notes
    if (isTransitionRegistration && preservedNotes.length > 0) {
      studentNotes = [...studentNotes, ...preservedNotes];
    }

    // STEP 3: Build clean course data object (no conditional spreading)
    const courseData = {
      "inOldSharePoint": false,
      "ActiveFutureArchived": {
        "Id": 1,
        "Value": isTransitionRegistration ? "Active" : "Registration"
      },
      "Course": {
        "Id": numericCourseId,
        "Value": formData.courseName || ''
      },
      "CourseID": numericCourseId,
      "Created": new Date().toISOString(), // Will be overwritten if transition
      "ScheduleStartDate": formData.startDate || '',
      "ScheduleEndDate": formData.endDate || '',
      "StudentType": {
        "Id": 1,
        "Value": formData.studentType || ''
      },
      "Status": {
        "Id": 1,
        "Value": isTransitionRegistration ? "Re-enrolled" : "Newly Enrolled"
      },
      "Over18_x003f_": {
        "Id": registrationData.studentType === 'Adult Student' ? 1 : (formData.age >= 18 ? 1 : 2),
        "Value": formData.age >= 18 ? "Yes" : "No"
      },
      "PASI": {
        "Id": 1,
        "Value": "No"
      },
      "School_x0020_Year": {
        "Id": 1,
        "Value": formData.enrollmentYear || ''
      },
      "Term": formData.term || 'Full Year',
      "parentApproval": {
        "required": formData.age < 18,
        "approved": false,
        "approvedAt": null,
        "approvedBy": null
      },
      "jsonStudentNotes": studentNotes
    };
    
    // Add optional fields if they exist
    if (formData.diplomaMonth) {
      courseData["DiplomaMonthChoices"] = {
        "Id": 1,
        "Value": formData.diplomaMonth.alreadyWrote
          ? "Already Wrote"
          : formData.diplomaMonth.month || ""
      };
    }
    
    if (formData.registrationSettingsPath) {
      courseData["registrationSettingsPath"] = formData.registrationSettingsPath;
      courseData["timeSectionId"] = formData.timeSectionId || null;
    }
    
    if (registrationData.studentType !== 'Adult Student') {
      courseData["primarySchoolName"] = formData.schoolAddress?.name || '';
      courseData["primarySchoolAddress"] = formData.schoolAddress?.fullAddress || '';
      courseData["primarySchoolPlaceId"] = formData.schoolAddress?.placeId || '';
    }
    
    if (registrationData.studentType === 'International Student') {
      courseData["internationalDocuments"] = formData.internationalDocuments || 
        (formData.documents ? {
          "passport": formData.documents.passport || '',
          "additionalID": formData.documents.additionalID || '',
          "residencyProof": formData.documents.residencyProof || ''
        } : []);
    }
    
    // STEP 4: Merge preserved data for transitions
    if (isTransitionRegistration) {
      // Preserve original creation date
      if (preservedCreatedDate) {
        courseData["Created"] = preservedCreatedDate;
      }
      
      // Preserve payment status
      if (preservedPaymentStatus) {
        courseData["payment_status"] = preservedPaymentStatus;
      }
      
      // Build complete status log with transition entry
      const transitionEntry = {
        "status": "Transition Re-registration",
        "timestamp": new Date().toISOString(),
        "previousStudentType": existingCourseData?.StudentType?.Value,
        "newStudentType": formData.studentType,
        "previousYear": existingCourseData?.School_x0020_Year?.Value,
        "newYear": formData.enrollmentYear
      };
      
      courseData["statusLog"] = [...preservedStatusLog, transitionEntry];
      
      // Clear the transition flag by setting it to false in the course data
      courseData["transition"] = false;
      console.log(`Clearing transition flag for course ${numericCourseId}`);
    }

    // Prepare profile updates using flattened object for Firebase update
    const profileUpdates = {};
    const flattenObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const path = prefix ? `${prefix}/${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Recursively flatten nested objects
          flattenObject(value, path);
        } else {
          profileUpdates[`students/${studentEmailKey}/profile/${path}`] = value;
        }
      });
    };
    
    flattenObject(profileData);

    // Prepare all database operations
    const batch = {};

    // Add profile updates
    Object.assign(batch, profileUpdates);

    // Create notifications node for new students
    batch[`notifications/${studentEmailKey}`] = {};

    // Add 25/26 teacher strike credit override for Non-Primary Students
    if (formData.enrollmentYear === '25/26' && formData.studentType === 'Non-Primary Student') {
      batch[`students/${studentEmailKey}/profile/creditOverrides/25_26/nonPrimaryStudents/creditAdjustments`] = {
        additionalFreeCredits: 15,
        reason: 'Teacher strike update - additional credits granted for 25/26 school year',
        overriddenBy: 'registration-system',
        overriddenAt: Date.now(),
        schoolYear: '25/26'
      };
      console.log(`📊 Applied 25/26 teacher strike credit override for ${studentEmailKey}`);
    }

    // Add main course (transition flag removal is included in courseData if applicable)
    batch[`students/${studentEmailKey}/courses/${numericCourseId}`] = courseData;

    // Add required courses
    for (const requiredCourse of requiredCourses) {
      // Check if student is already registered for this required course
      const existingRequiredCourseRef = db.ref(`students/${studentEmailKey}/courses/${requiredCourse.courseId}`);
      const existingRequiredCourseSnapshot = await existingRequiredCourseRef.once('value');

      if (!existingRequiredCourseSnapshot.exists()) {
        const requiredCourseData = {
          "inOldSharePoint": false,
          "ActiveFutureArchived": {
            "Id": 1,
            "Value": "Active"
          },
          "Course": {
            "Id": Number(requiredCourse.courseId),
            "Value": requiredCourse.title || ''
          },
          "CourseID": Number(requiredCourse.courseId),
          "Created": new Date().toISOString(),
          "ScheduleStartDate": formData.startDate || '',
          "ScheduleEndDate": formData.endDate || '',
          "StudentType": {
            "Id": 1,
            "Value": formData.studentType || ''
          },
          "Status": {
            "Id": 1,
            "Value": "Auto-Enrolled"
          },
          "Over18_x003f_": {
            "Id": registrationData.studentType === 'Adult Student' ? 1 : (formData.age >= 18 ? 1 : 2),
            "Value": formData.age >= 18 ? "Yes" : "No"
          },
          "PASI": {
            "Id": 1,
            "Value": "No"
          },
          "School_x0020_Year": {
            "Id": 1,
            "Value": formData.enrollmentYear || ''
          },
          "Term": formData.term || 'Full Year',
          "isRequiredCourse": true,
          "parentApproval": {
            "required": formData.age < 18,
            "approved": false,
            "approvedAt": null,
            "approvedBy": null
          },
          ...(formData.registrationSettingsPath && {
            "registrationSettingsPath": formData.registrationSettingsPath,
            "timeSectionId": formData.timeSectionId || null
          }),
          "jsonStudentNotes": [
            {
              "author": "System",
              "content": `Student was automatically enrolled in this required course when registering for ${formData.courseName}.`,
              "id": `note-${Date.now()}-${requiredCourse.courseId}`,
              "noteType": "🔄",
              "timestamp": new Date().toISOString()
            }
          ]
        };

        batch[`students/${studentEmailKey}/courses/${requiredCourse.courseId}`] = requiredCourseData;
      }
    }

    // Handle parent invitation if student is under 18
    if (formData.age < 18 && formData.parentEmail) {
      batch[`students/${studentEmailKey}/parentInvitationRequest`] = {
        parentEmail: formData.parentEmail,
        parentName: `${formData.parentFirstName || ''} ${formData.parentLastName || ''}`.trim() || 'Parent/Guardian',
        studentEmail: userEmail,
        studentName: `${formData.firstName} ${formData.lastName}`,
        relationship: formData.parentRelationship || 'Parent',
        requestedAt: new Date().toISOString(),
        courseId: numericCourseId,
        courseName: formData.courseName,
        status: 'pending'
      };
    }

    // Execute all database operations in a single update
    await db.ref().update(batch);

    // Update credit tracking for ALL students (not just Non-Primary and Home Education)
    const coursesToTrack = [numericCourseId, ...requiredCourses.map(c => Number(c.courseId))];
    const schoolYear = formData.enrollmentYear || '';
    const studentType = formData.studentType || 'Unknown';
    
    try {
      await updateCreditTracking(studentEmailKey, schoolYear, studentType, coursesToTrack);
      console.log(`📊 Credit tracking updated for ${studentEmailKey} (${studentType}) in ${schoolYear}`);
    } catch (creditError) {
      console.error('Error updating credit tracking:', creditError);
      // Don't fail registration if credit tracking fails
    }

    // Initialize gradebooks for all enrolled courses
    const coursesToInitialize = [numericCourseId, ...requiredCourses.map(c => c.courseId)];
    
    console.log(`🎓 Initializing gradebooks for courses: ${coursesToInitialize.join(', ')}`);
    
    for (const courseId of coursesToInitialize) {
      try {
        // Check if this is a Firebase course
        const courseRef = db.ref(`courses/${courseId}`);
        const courseSnapshot = await courseRef.once('value');
        const courseData = courseSnapshot.val();
        const isFirebaseCourse = courseData?.firebaseCourse === true;
        
        await initializeGradebook(studentEmailKey, courseId, false);
        console.log(`✅ Gradebook initialized for course ${courseId}`);
        
        // For Firebase courses, validate the gradebook structure immediately after initialization
        if (isFirebaseCourse) {
          try {
            const { validateGradebookStructure } = require('./shared/utilities/database-utils');
            const validation = await validateGradebookStructure(studentEmailKey, courseId, false);
            
            if (!validation.isValid) {
              console.log(`🔧 Gradebook structure validation completed for Firebase course ${courseId}:`, {
                missingItems: validation.missingItems?.length || 0,
                missingCategories: validation.missingCategories?.length || 0,
                wasRebuilt: validation.wasRebuilt
              });
            } else {
              console.log(`✅ Gradebook structure validated for Firebase course ${courseId}`);
            }
          } catch (validationError) {
            console.error(`⚠️ Gradebook validation failed for Firebase course ${courseId}:`, validationError);
            // Don't fail the registration if validation fails
          }
        }
      } catch (error) {
        console.error(`❌ Error initializing gradebook for course ${courseId}:`, error);
        // Continue with other courses even if one fails
      }
    }

    // Remove the pending registration data (from student's uid in emulation, not teacher's)
    const pendingRegRef = db.ref(`users/${uid}/pendingRegistration`);
    await pendingRegRef.remove();

    return {
      success: true,
      message: isTransitionRegistration 
        ? 'Transition re-registration completed successfully. You can now access your course for the new school year.'
        : 'Registration submitted successfully',
      studentEmailKey: studentEmailKey,
      courseId: numericCourseId,
      requiredCourses: requiredCourses.map(c => ({
        courseId: c.courseId,
        title: c.title
      })),
      isTransition: isTransitionRegistration
    };

  } catch (error) {
    console.error('Error submitting registration:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message || 'Failed to submit registration');
  }
});

/**
 * Helper function to fetch required courses for a student
 */
async function fetchRequiredCourses(userEmail) {
  const db = admin.database();
  
  try {
    const coursesRef = db.ref('courses');
    const snapshot = await coursesRef.once('value');

    if (!snapshot.exists()) return [];

    const coursesData = snapshot.val();
    const required = [];

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
          required.push({
            courseId: id,
            title: course.Title,
            courseType: course.CourseType,
            credits: course.courseCredits,
            grade: course.grade,
            hasAllowedEmails: !!course.allowedEmails
          });
        }
      }
    }

    return required;
  } catch (error) {
    console.error('Error fetching required courses:', error);
    return [];
  }
}

// Export the function
module.exports = {
  submitStudentRegistration
};