// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

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

  const { registrationData } = data.data;
  const uid = data.auth.uid;
  const userEmail = data.auth.token.email;

  if (!registrationData || !registrationData.formData) {
    throw new HttpsError('invalid-argument', 'Missing registration data');
  }

  const db = admin.database();
  const studentEmailKey = sanitizeEmail(userEmail);
  const formData = registrationData.formData;

  try {
    // Validate required fields
    if (!formData.courseId || !formData.studentType || !formData.firstName || !formData.lastName) {
      throw new HttpsError('invalid-argument', 'Missing required registration fields');
    }

    // Ensure courseId is a valid number
    const numericCourseId = Number(formData.courseId);
    if (isNaN(numericCourseId)) {
      throw new HttpsError('invalid-argument', 'Invalid Course ID format');
    }

    // Check if course already exists
    const existingCourseRef = db.ref(`students/${studentEmailKey}/courses/${numericCourseId}`);
    const existingCourseSnapshot = await existingCourseRef.once('value');

    if (existingCourseSnapshot.exists()) {
      throw new HttpsError('already-exists', 'You are already registered for this course');
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
      "gender": formData.gender || '',
      "firstName": formData.firstName || '',
      "lastName": formData.lastName || '',
      "originalEmail": userEmail,
      "uid": uid,
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

    // Build the course data
    const courseData = {
      "inOldSharePoint": false,
      "ActiveFutureArchived": {
        "Id": 1,
        "Value": "Registration"
      },
      "Course": {
        "Id": numericCourseId,
        "Value": formData.courseName || ''
      },
      "CourseID": numericCourseId,
      "Created": new Date().toISOString(),
      "ScheduleStartDate": formData.startDate || '',
      "ScheduleEndDate": formData.endDate || '',
      "StudentType": {
        "Id": 1,
        "Value": formData.studentType || ''
      },
      "Status": {
        "Id": 1,
        "Value": "Newly Enrolled"
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
      // Add Term information
      "Term": formData.term || 'Full Year',
      // Add parent approval status for under-18 students
      "parentApproval": {
        "required": formData.age < 18,
        "approved": false,
        "approvedAt": null,
        "approvedBy": null
      },
      // Single DiplomaMonthChoices conditional that only adds if there's data
      ...(formData.diplomaMonth && {
        "DiplomaMonthChoices": {
          "Id": 1,
          "Value": formData.diplomaMonth.alreadyWrote
            ? "Already Wrote"
            : formData.diplomaMonth.month || ""
        }
      }),
      // Add registration settings information
      ...(formData.registrationSettingsPath && {
        "registrationSettingsPath": formData.registrationSettingsPath,
        "timeSectionId": formData.timeSectionId || null
      }),
      ...(registrationData.studentType !== 'Adult Student' && {
        "primarySchoolName": formData.schoolAddress?.name || '',
        "primarySchoolAddress": formData.schoolAddress?.fullAddress || '',
        "primarySchoolPlaceId": formData.schoolAddress?.placeId || ''
      }),
      // Add international documents to course data if student is international
      ...(registrationData.studentType === 'International Student' && {
        "internationalDocuments": formData.internationalDocuments || 
          // Fallback to old format if new format is not available
          (formData.documents ? {
            "passport": formData.documents.passport || '',
            "additionalID": formData.documents.additionalID || '',
            "residencyProof": formData.documents.residencyProof || ''
          } : [])
      }),
      "jsonStudentNotes": [
        {
          "author": `${formData.firstName} ${formData.lastName}`,
          "content": `Student completed the registration form.${
            formData.additionalInformation
              ? '\n\nAdditional Information:\n' + formData.additionalInformation
              : ''
          }${
            requiredCourses.length > 0
              ? '\n\nAuto-enrolled in required courses.'
              : ''
          }`,
          "id": `note-${Date.now()}`,
          "noteType": "📝",
          "timestamp": new Date().toISOString()
        }
      ]
    };

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
    
    // Add main course
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

    // Remove the pending registration data
    const pendingRegRef = db.ref(`users/${uid}/pendingRegistration`);
    await pendingRegRef.remove();

    return {
      success: true,
      message: 'Registration submitted successfully',
      studentEmailKey: studentEmailKey,
      courseId: numericCourseId,
      requiredCourses: requiredCourses.map(c => ({
        courseId: c.courseId,
        title: c.title
      }))
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