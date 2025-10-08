import { ref, set, update, remove, get } from 'firebase/database';
import { database } from '../firebase';
import { getAlbertaCourseById } from '../config/albertaCourses';

/**
 * Get the database path for course status data
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} courseId - The course ID
 * @returns {string} - The Firebase database path
 */
export const getCourseStatusPath = (familyId, schoolYear, studentId, courseId) => {
  return `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear}/${studentId}/courseStatus/${courseId}`;
};

/**
 * Get course status from the database
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} courseId - The course ID
 * @returns {Promise<Object>} - The course status object
 */
export const getCourseStatus = async (familyId, schoolYear, studentId, courseId) => {
  try {
    const path = getCourseStatusPath(familyId, schoolYear, studentId, courseId);
    const statusRef = ref(database, path);
    const snapshot = await get(statusRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    // Return default status if none exists
    return {
      committed: false,
      needsPasiRegistration: false,
      pasiRegistered: false,
      finalMark: null,
      registrarComment: ''
    };
  } catch (error) {
    console.error('Error fetching course status:', error);
    throw error;
  }
};

/**
 * Get the student's ASN (Alberta Student Number)
 * @param {string} familyId - The family ID
 * @param {number} studentId - The student ID (timestamp)
 * @returns {Promise<string|null>} - The ASN or null if not found
 */
export const getStudentAsn = async (familyId, studentId) => {
  try {
    const asnPath = `homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/asn`;
    const asnRef = ref(database, asnPath);
    const snapshot = await get(asnRef);

    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching student ASN:', error);
    return null;
  }
};

/**
 * Update course status in the database
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} courseId - The course ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<void>}
 */
export const updateCourseStatus = async (familyId, schoolYear, studentId, courseId, updates) => {
  try {
    const path = getCourseStatusPath(familyId, schoolYear, studentId, courseId);
    const statusRef = ref(database, path);

    // Fetch the student's ASN
    const asn = await getStudentAsn(familyId, studentId);

    await update(statusRef, {
      ...updates,
      familyId,
      studentId,
      schoolYear,
      courseId,
      ...(asn && { asn }), // Only include ASN if it exists
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    throw error;
  }
};

/**
 * Remove a course from the database
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} courseId - The course ID
 * @param {boolean} isAlbertaCourse - Whether this is an Alberta course
 * @param {string} category - The category of the Alberta course (e.g., "english_language_arts")
 * @returns {Promise<void>}
 */
export const removeCourse = async (familyId, schoolYear, studentId, courseId, isAlbertaCourse, category = null) => {
  try {
    if (isAlbertaCourse && category) {
      // Remove from selectedAlbertaCourses
      const coursePath = `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear}/${studentId}/selectedAlbertaCourses/${category}`;
      const courseRef = ref(database, coursePath);
      const snapshot = await get(courseRef);

      if (snapshot.exists()) {
        const courses = snapshot.val();
        const updatedCourses = Array.isArray(courses)
          ? courses.filter(id => id !== courseId)
          : [];

        if (updatedCourses.length === 0) {
          // Remove the category if no courses left
          await remove(courseRef);
        } else {
          await set(courseRef, updatedCourses);
        }
      }
    } else {
      // Remove from otherCourses
      const otherCoursesPath = `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear}/${studentId}/otherCourses`;
      const otherCoursesRef = ref(database, otherCoursesPath);
      const snapshot = await get(otherCoursesRef);

      if (snapshot.exists()) {
        const courses = snapshot.val();
        const updatedCourses = Array.isArray(courses)
          ? courses.filter(course => course.id !== courseId)
          : [];

        await set(otherCoursesRef, updatedCourses);
      }
    }

    // Remove course status
    const statusPath = getCourseStatusPath(familyId, schoolYear, studentId, courseId);
    const statusRef = ref(database, statusPath);
    await remove(statusRef);

  } catch (error) {
    console.error('Error removing course:', error);
    throw error;
  }
};

/**
 * Add an Alberta course to a student
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {string} category - The category (e.g., "english_language_arts")
 * @param {string} courseId - The course ID
 * @returns {Promise<void>}
 */
export const addAlbertaCourse = async (familyId, schoolYear, studentId, category, courseId) => {
  try {
    const coursePath = `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear}/${studentId}/selectedAlbertaCourses/${category}`;
    const courseRef = ref(database, coursePath);
    const snapshot = await get(courseRef);

    let courses = [];
    if (snapshot.exists()) {
      courses = snapshot.val();
      if (!Array.isArray(courses)) {
        courses = [];
      }
    }

    // Add course if not already present
    if (!courses.includes(courseId)) {
      courses.push(courseId);
      await set(courseRef, courses);
    }
  } catch (error) {
    console.error('Error adding Alberta course:', error);
    throw error;
  }
};

/**
 * Add a custom "other" course to a student
 * @param {string} familyId - The family ID
 * @param {string} schoolYear - The school year (e.g., "25_26")
 * @param {number} studentId - The student ID (timestamp)
 * @param {Object} courseData - The course data object
 * @returns {Promise<void>}
 */
export const addOtherCourse = async (familyId, schoolYear, studentId, courseData) => {
  try {
    const otherCoursesPath = `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear}/${studentId}/otherCourses`;
    const otherCoursesRef = ref(database, otherCoursesPath);
    const snapshot = await get(otherCoursesRef);

    let courses = [];
    if (snapshot.exists()) {
      courses = snapshot.val();
      if (!Array.isArray(courses)) {
        courses = [];
      }
    }

    // Generate unique ID for the course
    const newCourse = {
      ...courseData,
      id: `course_${Date.now()}`
    };

    courses.push(newCourse);
    await set(otherCoursesRef, courses);

    return newCourse.id;
  } catch (error) {
    console.error('Error adding other course:', error);
    throw error;
  }
};

/**
 * Get all courses for a student (both Alberta and Other courses)
 * @param {Object} selectedAlbertaCourses - Object with categories and course IDs
 * @param {Array} otherCourses - Array of other course objects
 * @returns {Array} - Normalized array of course objects
 */
export const getAllStudentCourses = (selectedAlbertaCourses = {}, otherCourses = []) => {
  const courses = [];

  // Process Alberta courses
  Object.entries(selectedAlbertaCourses).forEach(([category, courseIds]) => {
    if (Array.isArray(courseIds)) {
      courseIds.forEach(courseId => {
        const courseInfo = getAlbertaCourseById(courseId);
        if (courseInfo) {
          courses.push({
            id: courseId,
            name: courseInfo.name,
            code: courseInfo.code,
            credits: courseInfo.credits,
            grade: courseInfo.grade,
            category: category,
            description: courseInfo.description,
            isAlbertaCourse: true,
            prerequisite: courseInfo.prerequisite,
            note: courseInfo.note
          });
        }
      });
    }
  });

  // Process other courses
  if (Array.isArray(otherCourses)) {
    otherCourses.forEach(course => {
      courses.push({
        ...course,
        isAlbertaCourse: false
      });
    });
  }

  return courses;
};

/**
 * Validate a final mark (must be 0-100)
 * @param {number} mark - The mark to validate
 * @returns {boolean} - Whether the mark is valid
 */
export const validateFinalMark = (mark) => {
  const numMark = Number(mark);
  return !isNaN(numMark) && numMark >= 0 && numMark <= 100;
};

/**
 * Extract course metadata for storage in courseStatus
 * @param {Object} course - The course object (normalized from Alberta or other courses)
 * @returns {Object} - Metadata object with courseSource, courseCode, courseName, description, forCredit, credits
 */
export const getCourseMetadata = (course) => {
  if (!course) {
    return {};
  }

  if (course.isAlbertaCourse) {
    // For Alberta courses, map properties from albertaCourses.js structure
    return {
      courseSource: 'albertaCourse',
      courseCode: course.code || 'N/A',
      courseName: course.name || '',
      description: course.description || '',
      forCredit: typeof course.credits === 'number' ? course.credits > 0 : false,
      credits: course.credits // Keep as number for Alberta courses
    };
  } else {
    // For other courses, use the properties from otherCourses structure
    return {
      courseSource: 'otherCourse',
      courseCode: course.courseCode || '',
      courseName: course.courseName || course.name || '',
      description: course.description || '',
      forCredit: course.forCredit !== undefined ? course.forCredit : true,
      credits: course.credits !== undefined ? String(course.credits) : '' // Convert to string for other courses
    };
  }
};

/**
 * Get the category key for an Alberta course ID
 * @param {string} courseId - The course ID
 * @param {Object} selectedAlbertaCourses - The selectedAlbertaCourses object
 * @returns {string|null} - The category key or null if not found
 */
export const getCategoryForCourse = (courseId, selectedAlbertaCourses) => {
  for (const [category, courseIds] of Object.entries(selectedAlbertaCourses)) {
    if (Array.isArray(courseIds) && courseIds.includes(courseId)) {
      return category;
    }
  }
  return null;
};

/**
 * Get course status summary for a student
 * @param {Object} courseStatuses - Object with courseId keys and status values
 * @returns {Object} - Summary object with counts
 */
export const getCourseStatusSummary = (courseStatuses = {}) => {
  const summary = {
    total: 0,
    committed: 0,
    needsPasiRegistration: 0,
    pasiRegistered: 0,
    completed: 0
  };

  Object.values(courseStatuses).forEach(status => {
    summary.total++;
    if (status.committed) summary.committed++;
    if (status.needsPasiRegistration) summary.needsPasiRegistration++;
    if (status.pasiRegistered) summary.pasiRegistered++;
    if (status.finalMark !== null && status.finalMark !== undefined) summary.completed++;
  });

  return summary;
};
