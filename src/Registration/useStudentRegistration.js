import { getDatabase, ref, set, push, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

// Custom hook for student registration
export const useStudentRegistration = () => {
  const { user, user_email_key } = useAuth();
  const database = getDatabase();

  const validateStudentAge = async (birthday) => {
    const age = calculateAge(new Date(birthday));
    return age < 20; // School-age student check
  };

  const checkExistingCourseEnrollment = async (courseId) => {
    if (!user_email_key || !courseId) return false;
    
    const studentCoursesRef = ref(database, `students/${user_email_key}/courses/${courseId}`);
    const snapshot = await get(studentCoursesRef);
    return snapshot.exists();
  };

  const registerStudent = async (registrationData) => {
    try {
      const {
        firstName,
        lastName,
        phoneNumber,
        birthday,
        albertaStudentNumber,
        currentSchool,
        schoolAddress,
        courseId,
        startDate,
        endDate,
        parentInfo,
        enrollmentYear,
        additionalInformation
      } = registrationData;

      // Validate age
      const isEligible = await validateStudentAge(birthday);
      if (!isEligible) {
        throw new Error('Student is not eligible due to age restrictions');
      }

      // Check existing enrollment
      const isEnrolled = await checkExistingCourseEnrollment(courseId);
      if (isEnrolled) {
        throw new Error('Student is already enrolled in this course');
      }

      // Generate unique course registration ID
      const courseRef = ref(database, `students/${user_email_key}/courses`);
      const newCourseRef = push(courseRef);
      const courseRegistrationId = newCourseRef.key;

      // Create student course record
      const studentCourseData = {
        ActiveFutureArchived: {
          Id: 1,
          Value: "Active"
        },
        Course: {
          Id: courseId,
          Value: courseId // Will be replaced with course name from courses node
        },
        CourseID: courseId,
        Created: new Date().toISOString(),
        Custom1: additionalInformation || "",
        Display_x0020_Name: `${firstName} ${lastName}`,
        ID: courseRegistrationId,
        Modified: new Date().toISOString(),
        Over18_x003f_: {
          Id: calculateAge(new Date(birthday)) >= 18 ? 1 : 0,
          Value: calculateAge(new Date(birthday)) >= 18 ? "Yes" : "No"
        },
        ScheduleStartDate: startDate,
        ScheduleEndDate: endDate,
        School_x0020_Year: {
          Id: enrollmentYear,
          Value: enrollmentYear
        },
        Status: {
          Id: 1,
          Value: "Pending"
        }
      };

      // Create student profile if it doesn't exist
      const studentProfileData = {
        firstName,
        lastName,
        phoneNumber,
        birthday,
        albertaStudentNumber,
        currentSchool,
        schoolAddress,
        parentInfo,
        email: user.email,
        lastUpdated: new Date().toISOString()
      };

      // Create summary for quick searching
      const summaryData = {
        courseId,
        studentName: `${firstName} ${lastName}`,
        email: user.email,
        status: "Pending",
        startDate,
        endDate,
        schoolYear: enrollmentYear
      };

      // Batch write all data
      await Promise.all([
        set(ref(database, `students/${user_email_key}/courses/${courseRegistrationId}`), studentCourseData),
        set(ref(database, `students/${user_email_key}/profile`), studentProfileData),
        set(ref(database, `studentCourseSummaries/${user_email_key}_${courseId}`), summaryData)
      ]);

      return {
        success: true,
        registrationId: courseRegistrationId
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return {
    registerStudent,
    validateStudentAge,
    checkExistingCourseEnrollment
  };
};

// Utility function for age calculation
const calculateAge = (birthday) => {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  
  return age;
};