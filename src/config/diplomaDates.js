// src/config/diplomaDates.js
import { toEdmontonDate } from '../utils/timeZoneUtils';

/**
 * Diploma Exam Dates Configuration
 *
 * Single source of truth for all diploma exam dates and registration deadlines
 * Organized by school year and course
 *
 * Registration Deadline Pattern: Typically 2 months before exam date
 */

export const DIPLOMA_COURSES = {
  2: {
    id: 2,
    title: 'Physics 30',
    courseCode: 'PHY30'
  },
  87: {
    id: 87,
    title: 'Math 30-2',
    courseCode: 'MATH30-2'
  },
  89: {
    id: 89,
    title: 'Math 30-1',
    courseCode: 'MATH30-1'
  }
};

/**
 * Diploma exam sessions by school year
 */
export const diplomaDates = {
  '25/26': [
    // Math 30-2
    {
      id: 'diploma-math30-2-nov-2025',
      courseId: 87,
      courseTitle: 'Math 30-2',
      courseCode: 'MATH30-2',
      examDate: toEdmontonDate('2025-11-03'),
      examTime: '9:00 AM',
      session: 'November 2025',
      registrationDeadlines: {
        all: toEdmontonDate('2025-09-29') // All students same deadline
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-2-jan-2026',
      courseId: 87,
      courseTitle: 'Math 30-2',
      courseCode: 'MATH30-2',
      examDate: toEdmontonDate('2026-01-19'),
      examTime: '9:00 AM',
      session: 'January 2026',
      registrationDeadlines: {
        nonPrimary: toEdmontonDate('2025-09-29'),
        homeEducation: toEdmontonDate('2025-09-29'),
        adult: toEdmontonDate('2025-11-30')
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-2-apr-2026',
      courseId: 87,
      courseTitle: 'Math 30-2',
      courseCode: 'MATH30-2',
      examDate: toEdmontonDate('2026-04-13'),
      examTime: '9:00 AM',
      session: 'April 2026',
      registrationDeadlines: {
        all: toEdmontonDate('2026-02-28') // All students same deadline
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-2-jun-2026',
      courseId: 87,
      courseTitle: 'Math 30-2',
      courseCode: 'MATH30-2',
      examDate: toEdmontonDate('2026-06-12'),
      examTime: '9:00 AM',
      session: 'June 2026',
      registrationDeadlines: {
        nonPrimary: toEdmontonDate('2026-04-15'),
        homeEducation: toEdmontonDate('2026-02-28'),
        adult: toEdmontonDate('2026-04-30')
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-2-aug-2026',
      courseId: 87,
      courseTitle: 'Math 30-2',
      courseCode: 'MATH30-2',
      examDate: toEdmontonDate('2026-08-06'),
      examTime: '9:00 AM',
      session: 'August 2026',
      registrationDeadlines: {
        all: toEdmontonDate('2026-06-30') // All students same deadline
      },
      confirmed: true
    },

    // Math 30-1
    {
      id: 'diploma-math30-1-nov-2025',
      courseId: 89,
      courseTitle: 'Math 30-1',
      courseCode: 'MATH30-1',
      examDate: toEdmontonDate('2025-11-03'),
      examTime: '9:00 AM',
      session: 'November 2025',
      registrationDeadlines: {
        all: toEdmontonDate('2025-09-29') // All students same deadline
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-1-jan-2026',
      courseId: 89,
      courseTitle: 'Math 30-1',
      courseCode: 'MATH30-1',
      examDate: toEdmontonDate('2026-01-19'),
      examTime: '9:00 AM',
      session: 'January 2026',
      registrationDeadlines: {
        nonPrimary: toEdmontonDate('2025-09-29'),
        homeEducation: toEdmontonDate('2025-09-29'),
        adult: toEdmontonDate('2025-11-30')
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-1-apr-2026',
      courseId: 89,
      courseTitle: 'Math 30-1',
      courseCode: 'MATH30-1',
      examDate: toEdmontonDate('2026-04-13'),
      examTime: '9:00 AM',
      session: 'April 2026',
      registrationDeadlines: {
        all: toEdmontonDate('2026-02-28') // All students same deadline
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-1-jun-2026',
      courseId: 89,
      courseTitle: 'Math 30-1',
      courseCode: 'MATH30-1',
      examDate: toEdmontonDate('2026-06-12'),
      examTime: '9:00 AM',
      session: 'June 2026',
      registrationDeadlines: {
        nonPrimary: toEdmontonDate('2026-04-15'),
        homeEducation: toEdmontonDate('2026-02-28'),
        adult: toEdmontonDate('2026-04-30')
      },
      confirmed: true
    },
    {
      id: 'diploma-math30-1-aug-2026',
      courseId: 89,
      courseTitle: 'Math 30-1',
      courseCode: 'MATH30-1',
      examDate: toEdmontonDate('2026-08-06'),
      examTime: '9:00 AM',
      session: 'August 2026',
      registrationDeadlines: {
        all: toEdmontonDate('2026-06-30') // All students same deadline
      },
      confirmed: true
    },

    // Physics 30
    {
      id: 'diploma-physics30-nov-2025',
      courseId: 2,
      courseTitle: 'Physics 30',
      courseCode: 'PHY30',
      examDate: toEdmontonDate('2025-11-06'),
      examTime: '9:00 AM',
      session: 'November 2025',
      registrationDeadlines: {
        all: toEdmontonDate('2025-09-29') // All students same deadline
      },
      confirmed: true
    },
    {
      id: 'diploma-physics30-jan-2026',
      courseId: 2,
      courseTitle: 'Physics 30',
      courseCode: 'PHY30',
      examDate: toEdmontonDate('2026-01-26'),
      examTime: '9:00 AM',
      session: 'January 2026',
      registrationDeadlines: {
        nonPrimary: toEdmontonDate('2025-09-29'),
        homeEducation: toEdmontonDate('2025-09-29'),
        adult: toEdmontonDate('2025-11-30')
      },
      confirmed: true
    },
    {
      id: 'diploma-physics30-apr-2026',
      courseId: 2,
      courseTitle: 'Physics 30',
      courseCode: 'PHY30',
      examDate: toEdmontonDate('2026-04-15'),
      examTime: '1:00 PM',
      session: 'April 2026',
      registrationDeadlines: {
        all: toEdmontonDate('2026-02-28') // All students same deadline
      },
      confirmed: true
    },
    {
      id: 'diploma-physics30-jun-2026',
      courseId: 2,
      courseTitle: 'Physics 30',
      courseCode: 'PHY30',
      examDate: toEdmontonDate('2026-06-22'),
      examTime: '9:00 AM',
      session: 'June 2026',
      registrationDeadlines: {
        nonPrimary: toEdmontonDate('2026-04-15'),
        homeEducation: toEdmontonDate('2026-02-28'),
        adult: toEdmontonDate('2026-04-30')
      },
      confirmed: true
    },
    {
      id: 'diploma-physics30-aug-2026',
      courseId: 2,
      courseTitle: 'Physics 30',
      courseCode: 'PHY30',
      examDate: toEdmontonDate('2026-08-12'),
      examTime: '9:00 AM',
      session: 'August 2026',
      registrationDeadlines: {
        all: toEdmontonDate('2026-06-30') // All students same deadline
      },
      confirmed: true
    }
  ]
};

/**
 * Get diploma dates for a specific school year
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Array} Array of diploma exam objects
 */
export const getDiplomaDatesByYear = (schoolYear) => {
  return diplomaDates[schoolYear] || [];
};

/**
 * Get diploma dates for a specific course
 * @param {number} courseId - Course ID
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Array} Array of diploma exam objects for that course
 */
export const getDiplomaDatesByCourse = (courseId, schoolYear) => {
  const yearDates = diplomaDates[schoolYear] || [];
  return yearDates.filter(exam => exam.courseId === courseId);
};

/**
 * Get all future diploma dates from a reference date
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Array} Array of future diploma exam objects
 */
export const getFutureDiplomaDates = (referenceDate = new Date(), schoolYear) => {
  const yearDates = diplomaDates[schoolYear] || [];
  return yearDates.filter(exam => exam.examDate >= referenceDate);
};

/**
 * Get upcoming registration deadlines
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @param {string} studentType - Optional student type to filter by
 * @returns {Array} Array of upcoming registration deadlines
 */
export const getUpcomingRegistrationDeadlines = (referenceDate = new Date(), schoolYear, studentType = null) => {
  const yearDates = diplomaDates[schoolYear] || [];
  return yearDates.filter(exam => {
    let deadline;
    if (studentType) {
      deadline = getDiplomaDeadlineByStudentType(exam.id, studentType, schoolYear);
    } else {
      deadline = getEarliestDeadline(exam);
    }
    return deadline && deadline >= referenceDate;
  });
};

/**
 * Get the earliest deadline for an exam (for backward compatibility)
 * @param {Object} exam - Diploma exam object
 * @returns {Date|null} Earliest deadline or null
 */
const getEarliestDeadline = (exam) => {
  if (!exam || !exam.registrationDeadlines) return null;

  const deadlines = exam.registrationDeadlines;

  // If there's an "all" deadline, return it
  if (deadlines.all) return deadlines.all;

  // Otherwise, find the earliest deadline among student types
  const allDeadlines = Object.values(deadlines).filter(d => d instanceof Date);
  if (allDeadlines.length === 0) return null;

  return new Date(Math.min(...allDeadlines.map(d => d.getTime())));
};

/**
 * Get diploma deadline for a specific student type
 * @param {string} examId - Diploma exam ID
 * @param {string} studentType - Student type ('nonPrimary', 'homeEducation', 'adult', 'international')
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Date|null} Deadline for that student type or null
 */
export const getDiplomaDeadlineByStudentType = (examId, studentType, schoolYear) => {
  const yearDates = diplomaDates[schoolYear] || [];
  const exam = yearDates.find(e => e.id === examId);

  if (!exam || !exam.registrationDeadlines) return null;

  const deadlines = exam.registrationDeadlines;

  // Check if there's an "all" deadline (applies to all students)
  if (deadlines.all) return deadlines.all;

  // Return student-specific deadline
  // International students use adult deadline if not specified
  if (studentType === 'international' && !deadlines.international && deadlines.adult) {
    return deadlines.adult;
  }

  return deadlines[studentType] || null;
};

/**
 * Get all deadlines for an exam grouped by student type
 * @param {string} examId - Diploma exam ID
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Object} Object with student types as keys and deadlines as values
 */
export const getAllDeadlinesForExam = (examId, schoolYear) => {
  const yearDates = diplomaDates[schoolYear] || [];
  const exam = yearDates.find(e => e.id === examId);

  if (!exam || !exam.registrationDeadlines) return {};

  return exam.registrationDeadlines;
};

/**
 * Check if a diploma registration deadline has passed for a student type
 * @param {string} examId - Diploma exam ID
 * @param {string} studentType - Student type (optional, uses earliest if not provided)
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {boolean} True if deadline has passed
 */
export const hasRegistrationDeadlinePassed = (examId, studentType = null, referenceDate = new Date(), schoolYear) => {
  const yearDates = diplomaDates[schoolYear] || [];
  const exam = yearDates.find(e => e.id === examId);

  if (!exam) return false;

  let deadline;
  if (studentType) {
    deadline = getDiplomaDeadlineByStudentType(examId, studentType, schoolYear);
  } else {
    // Use earliest deadline if student type not specified (backward compatibility)
    deadline = getEarliestDeadline(exam);
  }

  return deadline ? referenceDate > deadline : false;
};

/**
 * Create calendar events from diploma registration deadlines
 * Groups by exam session (November 2025, January 2026, etc.) for clarity
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Array} Array of calendar event objects
 */
export const createDiplomaDeadlineCalendarEvents = (schoolYear) => {
  const yearDates = diplomaDates[schoolYear] || [];

  // Group exams by session (November 2025, January 2026, etc.)
  const sessionMap = {};

  yearDates.forEach(exam => {
    if (!exam.registrationDeadlines) return;

    const session = exam.session;
    if (!sessionMap[session]) {
      sessionMap[session] = {
        session,
        courses: [],
        deadlinesByType: {}
      };
    }

    // Add course to this session
    sessionMap[session].courses.push(exam);

    // Track deadlines by student type
    const deadlines = exam.registrationDeadlines;

    if (deadlines.all) {
      // All students have same deadline
      sessionMap[session].deadlinesByType.all = deadlines.all;
    } else {
      // Different deadlines for different types
      Object.entries(deadlines).forEach(([type, date]) => {
        sessionMap[session].deadlinesByType[type] = date;
      });
    }
  });

  // Create events - one per session per unique deadline
  const events = [];

  Object.values(sessionMap).forEach(sessionInfo => {
    const { session, courses, deadlinesByType } = sessionInfo;

    // Get unique deadlines for this session
    const uniqueDeadlines = {};

    if (deadlinesByType.all) {
      // All students same deadline
      uniqueDeadlines[deadlinesByType.all.getTime()] = {
        date: deadlinesByType.all,
        studentTypes: ['all']
      };
    } else {
      // Different deadlines by type
      Object.entries(deadlinesByType).forEach(([type, date]) => {
        const dateKey = date.getTime();
        if (!uniqueDeadlines[dateKey]) {
          uniqueDeadlines[dateKey] = {
            date,
            studentTypes: []
          };
        }
        uniqueDeadlines[dateKey].studentTypes.push(type);
      });
    }

    // Create one event per unique deadline for this session
    Object.entries(uniqueDeadlines).forEach(([dateKey, deadlineInfo]) => {
      const { date, studentTypes } = deadlineInfo;
      const isAllStudents = studentTypes.includes('all');

      // Create student type label
      let studentTypeLabel = '';
      if (!isAllStudents) {
        studentTypeLabel = studentTypes
          .map(type => {
            switch (type) {
              case 'nonPrimary': return 'NP';
              case 'homeEducation': return 'HE';
              case 'adult': return 'Adult';
              case 'international': return 'Intl';
              default: return type;
            }
          })
          .join(' & ');
      }

      // Create title
      const title = isAllStudents
        ? `Diploma Registration - ${session} Exams`
        : `Diploma Registration - ${session} Exams (${studentTypeLabel})`;

      // Create description
      const description = `Register for ${session} diploma exams`;

      // List available courses
      const courseList = courses.map(c => c.courseTitle).join(', ');
      const additionalInfo = `Available courses: ${courseList}`;

      // Get exam dates
      const examDates = [...new Set(courses.map(c =>
        c.examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      ))].join(', ');

      // Build student type messages
      const studentTypeMessages = {};

      const hasNonPrimary = isAllStudents || studentTypes.includes('nonPrimary');
      const hasHomeEducation = isAllStudents || studentTypes.includes('homeEducation');
      const hasAdult = isAllStudents || studentTypes.includes('adult') || studentTypes.includes('international');

      if (hasNonPrimary) {
        studentTypeMessages['non-primary'] = {
          applies: true,
          importance: 'critical',
          message: `You must register for ${session} diploma exams by this date.`,
          whatThisMeans: `This is your registration deadline for ${session} diploma exams.`,
          afterDeadline: {
            canDo: 'Contact your teacher or school administrator to discuss options for the next exam session.',
            learnMoreLink: '/student-faq',
            learnMoreText: 'View diploma exam FAQ'
          }
        };
      }

      if (hasHomeEducation) {
        studentTypeMessages['home-education'] = {
          applies: true,
          importance: 'critical',
          message: `You must register for ${session} diploma exams by this date.`,
          whatThisMeans: `This is your registration deadline for ${session} diploma exams.`,
          afterDeadline: {
            canDo: 'Contact your facilitator to discuss options for the next exam session.',
            learnMoreLink: '/student-faq',
            learnMoreText: 'View diploma exam FAQ'
          }
        };
      }

      if (hasAdult) {
        const adultMessage = {
          applies: true,
          importance: 'critical',
          message: `You must register for ${session} diploma exams by this date.`,
          whatThisMeans: `This is your registration deadline for ${session} diploma exams.`,
          afterDeadline: {
            canDo: 'Contact the school office to discuss options for the next exam session.',
            learnMoreLink: '/student-faq',
            learnMoreText: 'View diploma exam FAQ'
          }
        };

        studentTypeMessages['adult'] = adultMessage;
        studentTypeMessages['international'] = {
          ...adultMessage,
          whatThisMeans: 'International students follow the adult student deadline for diploma exam registration.'
        };
      }

      events.push({
        id: `diploma-deadline-${session.replace(/\s+/g, '-').toLowerCase()}-${dateKey}`,
        title,
        start: date,
        end: new Date(date.getTime() + 86400000), // +1 day for exclusive end
        type: 'deadline',
        visibility: 'public',
        description,
        additionalInfo,
        link: {
          text: 'Learn about diploma exam registration',
          url: '/student-faq'
        },
        studentTypeMessages
      });
    });
  });

  return events;
};

export default {
  DIPLOMA_COURSES,
  diplomaDates,
  getDiplomaDatesByYear,
  getDiplomaDatesByCourse,
  getFutureDiplomaDates,
  getUpcomingRegistrationDeadlines,
  hasRegistrationDeadlinePassed,
  getDiplomaDeadlineByStudentType,
  getAllDeadlinesForExam,
  createDiplomaDeadlineCalendarEvents
};
