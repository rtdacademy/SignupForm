// src/config/schoolYears/2025-26.js
import { toEdmontonDate } from '../../utils/timeZoneUtils';
import { getDiplomaDatesByYear } from '../diplomaDates';
import {
  Calendar,
  Coffee,
  GraduationCap,
  AlertCircle,
  Users,
  Sun,
  Award
} from 'lucide-react';

/**
 * 2025-2026 School Year Configuration
 *
 * Contains important dates and calendar events for the academic year
 *
 * VISIBILITY LEVELS:
 * - 'public': Visible to everyone (default)
 * - 'staff': Visible only to staff members
 * - 'admin': Visible only to administrators
 */

export const schoolYear = '25/26';
export const schoolYearDisplay = '2025-2026';

// ============================================================================
// IMPORTANT DATES - Single source of truth with metadata
// ============================================================================
export const importantDates = [
  // Registration periods
  {
    key: 'registrationOpen',
    type: 'date',
    date: toEdmontonDate('2025-09-29'),
    label: 'Registration Opens',
    description: 'Registration opens for the school year',
    showOnLanding: false,
    category: 'administrative'
  },
  {
    key: 'septemberCount',
    type: 'date',
    date: toEdmontonDate('2026-01-31'),
    label: 'September Count Day',
    description: 'September count day for funding',
    showOnLanding: false,
    category: 'administrative'
  },

  // Term 1
  {
    key: 'term1Start',
    type: 'date',
    date: toEdmontonDate('2025-08-25'),
    label: 'First Day of School',
    description: 'First day of school for students',
    showOnLanding: false,
    category: 'important'
  },
  {
    key: 'term1RegistrationDeadline',
    type: 'date',
    date: toEdmontonDate('2025-09-29'),
    label: 'Term 1 Registration Deadline',
    description: 'Final day to register for Term 1 (courses ending January 31)',
    showOnLanding: false,
    category: 'deadline'
  },
  {
    key: 'term1CountDay',
    type: 'date',
    date: toEdmontonDate('2026-01-31'),
    label: 'Term 1 Count Day',
    description: 'Term 1 count day for funding',
    showOnLanding: false,
    category: 'administrative'
  },
  {
    key: 'term1End',
    type: 'date',
    date: toEdmontonDate('2026-01-31'),
    label: 'Term 1 End Date',
    description: 'Last day of Term 1',
    showOnLanding: true,
    category: 'important'
  },

  // Term 2 Messages
  {
    key: 'term2RegistrationOpenMessage',
    type: 'message',
    message: 'Term 2 Registration is Open!',
    whatThisMeans: 'Start learning NOW! Access all course materials immediately. Exams and teacher support begin February 1.',
    learnMoreLink: '/student-faq#grantFunding',
    learnMoreText: 'Learn about early access benefits',
    showFrom: toEdmontonDate('2025-10-01'),
    showUntil: toEdmontonDate('2026-02-01'),
    showOnLanding: false,
    category: 'announcement'
  },

  // Always-visible message for Adult & International Students
  {
    key: 'adultInternationalAnytimeMessage',
    type: 'message',
    message: 'Adult & International Students: Register Anytime!',
    whatThisMeans: 'No wait times! Full immediate access to course materials, exams, and teacher support from day one.',
    learnMoreLink: '/student-faq#adultStudents',
    learnMoreText: 'Learn about adult student enrollment',
    showFrom: toEdmontonDate('2025-08-01'), // Start of school year
    showUntil: toEdmontonDate('2030-08-31'), // Far future date to keep always visible
    showOnLanding: true,
    category: 'announcement'
  },

  // Term 2 Dates
  {
    key: 'term2Start',
    type: 'date',
    date: toEdmontonDate('2026-02-01'),
    label: 'Term 2 Starts',
    description: 'First day of Term 2',
    showOnLanding: false,
    category: 'important'
  },
  {
    key: 'term2HomeEducationDeadline',
    type: 'date',
    date: toEdmontonDate('2026-02-28'),
    label: 'Term 2 Deadline (Home Education)',
    description: 'Registration deadline for Home Education students - Term 2',
    showOnLanding: true,
    category: 'deadline'
  },
  {
    key: 'term2RegistrationDeadline',
    type: 'date',
    date: toEdmontonDate('2026-04-15'),
    label: 'Term 2 Deadline (Non-Primary)',
    description: 'Registration deadline for Non-Primary students - Term 2',
    showOnLanding: true,
    category: 'deadline'
  },
  {
    key: 'term2End',
    type: 'date',
    date: toEdmontonDate('2026-06-26'),
    label: 'Term 2 End Date',
    description: 'Last day of Term 2',
    showOnLanding: false,
    category: 'important'
  },
  {
    key: 'term2PasiDeadline',
    type: 'date',
    date: toEdmontonDate('2026-06-26'),
    label: 'Last Day for Students',
    description: 'PASI deadline - when marks are submitted to Alberta Education for Term 2',
    showOnLanding: true,
    category: 'important'
  },

  // Summer School
  {
    key: 'summerRegistrationOpen',
    type: 'date',
    date: toEdmontonDate('2026-04-15'),
    label: 'Summer School Registration Opens',
    description: 'Summer School registration opens for funded students',
    showOnLanding: true,
    category: 'important'
  },
  {
    key: 'summerRegistrationDeadline',
    type: 'date',
    date: toEdmontonDate('2026-06-28'),
    label: 'Summer School Registration Deadline',
    description: 'Final day to register for Summer School',
    showOnLanding: true,
    category: 'deadline'
  },
  {
    key: 'summerStart',
    type: 'date',
    date: toEdmontonDate('2026-06-29'),
    label: 'Summer School Begins',
    description: 'Summer school session begins - exams and teacher support start',
    showOnLanding: true,
    category: 'important'
  },
  {
    key: 'summerEnd',
    type: 'date',
    date: toEdmontonDate('2026-08-07'),
    label: 'Last Day of Summer School',
    description: 'Summer school session ends',
    showOnLanding: true,
    category: 'important'
  }
];

// ============================================================================
// BACKWARD COMPATIBILITY HELPERS
// ============================================================================
// Helper to get a specific date by key
export const getImportantDate = (key) => {
  return importantDates.find(d => d.key === key)?.date;
};

// Create object lookup for backward compatibility with old code
export const importantDatesLookup = importantDates.reduce((acc, item) => {
  acc[item.key] = item.date;
  return acc;
}, {});

// ============================================================================
// CALENDAR EVENTS - Used for academic calendar display
// ============================================================================
export const calendarEvents = [
  // === AUGUST 2025 ===
  {
    id: 'aisca-new-leader-retreat-aug-2025',
    title: 'AISCA New Leader\'s Retreat',
    start: toEdmontonDate('2025-08-21'),
    end: toEdmontonDate('2025-08-23'),
    type: 'professional-development',
    visibility: 'staff',
    description: 'AISCA New Leader\'s Retreat'
  },
  {
    id: 'first-day-school-2025',
    title: 'First Day of School for Students',
    start: toEdmontonDate('2025-08-25'),
    end: toEdmontonDate('2025-08-25'),
    type: 'important',
    visibility: 'public',
    description: 'First day of school for students',
    schoolClosed: false,
    additionalInfo: 'Welcome back! Please ensure all registration paperwork is completed.',
    studentTypeMessages: {
      'non-primary': {
        applies: true,
        message: 'First day of school - course materials are now available.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'First day of school - course materials are now available.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This date applies to the regular school year.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This date applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This date applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },

  // === SEPTEMBER 2025 ===
  {
    id: 'labour-day-2025',
    title: 'Labour Day',
    start: toEdmontonDate('2025-09-01'),
    end: toEdmontonDate('2025-09-01'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday - No School',
    schoolClosed: true
  },
  {
    id: 'term1-registration-deadline-2025',
    title: 'Term 1 Registration Deadline',
    start: toEdmontonDate('2025-09-29'),
    end: toEdmontonDate('2025-09-29'),
    type: 'deadline',
    visibility: 'public',
    description: 'Final day to register for Term 1 (courses ending January 31) - TEMPORARILY LIFTED during labour disruption',
    schoolClosed: false,
    studentTypeMessages: {
      'non-primary': {
        applies: true,
        message: 'This deadline is temporarily lifted due to labour disruption.',
        learnMoreLink: '/student-faq#teacherStrike',
        learnMoreText: 'Learn about policy changes →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'This deadline is temporarily lifted due to labour disruption.',
        learnMoreLink: '/student-faq#teacherStrike',
        learnMoreText: 'Learn about policy changes →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This deadline applies to Term 1 funded students only.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },
  {
    id: 'national-truth-reconciliation-2025',
    title: 'National Day of Truth and Reconciliation',
    start: toEdmontonDate('2025-09-30'),
    end: toEdmontonDate('2025-09-30'),
    type: 'holiday',
    visibility: 'public',
    description: 'National Day of Truth and Reconciliation - No School',
    schoolClosed: true
  },
  {
    id: 'sept-count-2025',
    title: 'September Count Day',
    start: toEdmontonDate('2026-01-31'),
    end: toEdmontonDate('2026-01-31'),
    type: 'deadline',
    visibility: 'staff',
    description: 'September count day for funding',
    schoolClosed: false
  },

  // === OCTOBER 2025 ===
  {
    id: 'aisca-leadership-conference-2025',
    title: 'AISCA Leadership Conference',
    start: toEdmontonDate('2025-10-09'),
    end: toEdmontonDate('2025-10-11'),
    type: 'professional-development',
    visibility: 'staff',
    description: 'AISCA Leadership Conference'
  },
  {
    id: 'thanksgiving-2025',
    title: 'Thanksgiving',
    start: toEdmontonDate('2025-10-13'),
    end: toEdmontonDate('2025-10-13'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday - No School',
    schoolClosed: true
  },
  {
    id: 'october-halfdays-2025',
    title: 'October Halfdays',
    start: toEdmontonDate('2025-10-14'),
    end: toEdmontonDate('2025-10-25'),
    type: 'halfday',
    visibility: 'staff',
    description: 'October Halfdays',
    allDay: true
  },

  // === NOVEMBER 2025 ===
  {
    id: 'remembrance-day-2025',
    title: 'Remembrance Day',
    start: toEdmontonDate('2025-11-10'),
    end: toEdmontonDate('2025-11-12'),
    type: 'holiday',
    visibility: 'public',
    description: 'Remembrance Day - No School'
  },

  // === DECEMBER 2025 ===
  {
    id: 'winter-break-2025',
    title: 'Winter Break',
    start: toEdmontonDate('2025-12-20'),
    end: toEdmontonDate('2026-01-03'),
    type: 'holiday',
    visibility: 'public',
    description: 'Winter Break - No School',
    schoolClosed: true,
    allDay: true
  },
  {
    id: 'christmas-2025',
    title: 'Christmas Day',
    start: toEdmontonDate('2025-12-25'),
    end: toEdmontonDate('2025-12-25'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday'
  },

  // === JANUARY 2026 ===
  {
    id: 'new-years-day-2026',
    title: 'New Year\'s Day',
    start: toEdmontonDate('2026-01-01'),
    end: toEdmontonDate('2026-01-01'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday'
  },
  {
    id: 'school-resumes-jan-2026',
    title: 'School Resumes',
    start: toEdmontonDate('2026-01-05'),
    end: toEdmontonDate('2026-01-05'),
    type: 'important',
    visibility: 'public',
    description: 'Classes resume after winter break'
  },

  // === FEBRUARY 2026 ===
  {
    id: 'february-halfdays-2026',
    title: 'February Halfdays',
    start: toEdmontonDate('2026-02-09'),
    end: toEdmontonDate('2026-02-21'),
    type: 'halfday',
    visibility: 'staff',
    description: 'February Halfdays',
    allDay: true
  },
  {
    id: 'aisca-teacher-convention-2026',
    title: 'AISCA Teacher\'s Convention',
    start: toEdmontonDate('2026-02-13'),
    end: toEdmontonDate('2026-02-13'),
    type: 'professional-development',
    visibility: 'staff',
    description: 'AISCA Teacher\'s Convention'
  },
  {
    id: 'family-day-2026',
    title: 'Family Day',
    start: toEdmontonDate('2026-02-16'),
    end: toEdmontonDate('2026-02-16'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday - No School'
  },
  {
    id: 'term2-he-deadline-2026',
    title: 'Term 2 Deadline (Home Education)',
    start: toEdmontonDate('2026-02-28'),
    end: toEdmontonDate('2026-02-28'),
    type: 'deadline',
    visibility: 'public',
    description: 'Registration deadline for Home Education students - Term 2',
    studentTypeMessages: {
      'home-education': {
        applies: true,
        message: 'Final deadline to register for Term 2 courses.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about your student type →',
        importance: 'critical'
      },
      'non-primary': {
        applies: false,
        message: 'This deadline is for Home Education students only.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about your deadlines →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This deadline applies to Term 2 funded students only.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },

  // === MARCH 2026 ===
  {
    id: 'april-halfdays-2026',
    title: 'April Halfdays',
    start: toEdmontonDate('2026-03-30'),
    end: toEdmontonDate('2026-04-11'),
    type: 'halfday',
    visibility: 'staff',
    description: 'April Halfdays (Spring Break period)',
    allDay: true
  },

  // === APRIL 2026 ===
  {
    id: 'good-friday-2026',
    title: 'Good Friday',
    start: toEdmontonDate('2026-04-03'),
    end: toEdmontonDate('2026-04-03'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday - No School'
  },
  {
    id: 'easter-monday-2026',
    title: 'Easter Monday',
    start: toEdmontonDate('2026-04-06'),
    end: toEdmontonDate('2026-04-06'),
    type: 'holiday',
    visibility: 'public',
    description: 'Easter Monday - No School'
  },
  {
    id: 'summer-registration-opens-2026',
    title: 'Summer School Registration Opens',
    start: toEdmontonDate('2026-04-15'),
    end: toEdmontonDate('2026-04-15'),
    type: 'important',
    visibility: 'public',
    description: 'Summer School registration opens for funded students',
    studentTypeMessages: {
      'summer': {
        applies: true,
        message: 'Summer School registration opens today for funded students.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'non-primary': {
        applies: true,
        message: 'Summer School registration is open if you need summer courses.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'Summer School registration is open if you need summer courses.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This date applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This date applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },
  {
    id: 'term2-np-deadline-2026',
    title: 'Term 2 Deadline (Non-Primary)',
    start: toEdmontonDate('2026-04-15'),
    end: toEdmontonDate('2026-04-15'),
    type: 'deadline',
    visibility: 'public',
    description: 'Registration deadline for Non-Primary students - Term 2',
    studentTypeMessages: {
      'non-primary': {
        applies: true,
        message: 'Final deadline to register for Term 2 courses.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about your student type →',
        importance: 'critical'
      },
      'home-education': {
        applies: false,
        message: 'This deadline is for Non-Primary students only.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about your deadlines →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This deadline applies to Term 2 funded students only.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },

  // === MAY 2026 ===
  {
    id: 'aisca-agm-conference-2026',
    title: 'AISCA AGM and Leadership Conference',
    start: toEdmontonDate('2026-05-01'),
    end: toEdmontonDate('2026-05-01'),
    type: 'professional-development',
    visibility: 'staff',
    description: 'AISCA AGM and Leadership Conference'
  },
  {
    id: 'victoria-day-2026',
    title: 'Victoria Day',
    start: toEdmontonDate('2026-05-18'),
    end: toEdmontonDate('2026-05-18'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday - No School'
  },

  // === JUNE 2026 ===
  {
    id: 'june-halfdays-2026',
    title: 'June Halfdays',
    start: toEdmontonDate('2026-06-15'),
    end: toEdmontonDate('2026-06-27'),
    type: 'halfday',
    visibility: 'staff',
    description: 'June Halfdays',
    allDay: true
  },
  {
    id: 'last-day-students-2026',
    title: 'Last Day for Students',
    start: toEdmontonDate('2026-06-26'),
    end: toEdmontonDate('2026-06-26'),
    type: 'important',
    visibility: 'public',
    description: 'Last day of school for students',
    studentTypeMessages: {
      'non-primary': {
        applies: true,
        message: 'PASI deadline - marks submitted to Alberta Education for Term 2.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about course deadlines →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'PASI deadline - marks submitted to Alberta Education for Term 2.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about course deadlines →',
        importance: 'info'
      },
      'summer': {
        applies: true,
        message: 'Summer School registration deadline is typically June 28.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This deadline applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },
  {
    id: 'summer-school-begins-2026',
    title: 'Summer School Begins',
    start: toEdmontonDate('2026-06-29'),
    end: toEdmontonDate('2026-06-29'),
    type: 'important',
    visibility: 'public',
    description: 'Summer school session begins',
    studentTypeMessages: {
      'summer': {
        applies: true,
        message: 'Summer School officially begins - exams and teacher support now available.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'non-primary': {
        applies: true,
        message: 'Term 2 courses automatically continue into Summer School if not completed.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about course continuation →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'Term 2 courses automatically continue into Summer School if not completed.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about course continuation →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This date applies to funded students only.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This date applies to funded students only.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your student type →',
        importance: 'info'
      }
    }
  },

  // === JULY 2026 ===
  {
    id: 'canada-day-2026',
    title: 'Canada Day',
    start: toEdmontonDate('2026-07-01'),
    end: toEdmontonDate('2026-07-01'),
    type: 'holiday',
    visibility: 'public',
    description: 'Statutory Holiday - School Closed'
  },

  // === AUGUST 2026 ===
  {
    id: 'august-long-weekend-2026',
    title: 'August Long Weekend',
    start: toEdmontonDate('2026-08-03'),
    end: toEdmontonDate('2026-08-03'),
    type: 'holiday',
    visibility: 'public',
    description: 'Heritage Day - School Closed'
  },
  {
    id: 'last-day-summer-school-2026',
    title: 'Last Day of Summer School',
    start: toEdmontonDate('2026-08-07'),
    end: toEdmontonDate('2026-08-07'),
    type: 'important',
    visibility: 'public',
    description: 'Last day of summer school'
  },
  {
    id: 'aisca-new-leader-retreat-aug-2026',
    title: 'AISCA New Leader\'s Retreat',
    start: toEdmontonDate('2026-08-13'),
    end: toEdmontonDate('2026-08-15'),
    type: 'professional-development',
    visibility: 'staff',
    description: 'AISCA New Leader\'s Retreat'
  }
];

// Generate diploma exam events from diploma dates config
const diplomaExamEvents = getDiplomaDatesByYear('25/26').flatMap(diploma => {
  const events = [];

  // Only add Registration Deadline Event if deadline exists
  if (diploma.registrationDeadline) {
    events.push({
      id: `${diploma.id}-registration`,
      title: `${diploma.courseTitle} Diploma Reg`,
      start: diploma.registrationDeadline,
      end: diploma.registrationDeadline,
      type: 'diploma-deadline',
      visibility: 'public',
      description: `Last day to register for ${diploma.courseTitle} diploma exam (${diploma.session})`,
      diplomaInfo: {
        courseId: diploma.courseId,
        courseTitle: diploma.courseTitle,
        courseCode: diploma.courseCode,
        examDate: diploma.examDate,
        examTime: diploma.examTime,
        session: diploma.session
      }
    });
  }

  // Always add Exam Date Event
  events.push({
    id: diploma.id,
    title: `${diploma.courseTitle} Diploma`,
    start: diploma.examDate,
    end: diploma.examDate,
    type: 'diploma-exam',
    visibility: 'public',
    description: `${diploma.courseTitle} diploma exam - ${diploma.examTime}`,
    diplomaInfo: {
      courseId: diploma.courseId,
      courseTitle: diploma.courseTitle,
      courseCode: diploma.courseCode,
      examTime: diploma.examTime,
      session: diploma.session,
      registrationDeadline: diploma.registrationDeadline
    }
  });

  return events;
});

// Combine regular calendar events with diploma events
export const allCalendarEvents = [...calendarEvents, ...diplomaExamEvents];

// Event type configuration for styling
export const eventTypes = {
  holiday: {
    color: '#7C3AED', // purple-600
    bgColor: '#EDE9FE', // purple-100
    label: 'Holiday/Break',
    icon: Calendar
  },
  important: {
    color: '#0D9488', // teal-600
    bgColor: '#CCFBF1', // teal-100
    label: 'Important Date',
    icon: AlertCircle
  },
  'professional-development': {
    color: '#6366F1', // indigo-600
    bgColor: '#E0E7FF', // indigo-100
    label: 'Professional Development',
    icon: Users
  },
  halfday: {
    color: '#F59E0B', // amber-600
    bgColor: '#FEF3C7', // amber-100
    label: 'Half Day',
    icon: Sun
  },
  'diploma-exam': {
    color: '#2563EB', // blue-600
    bgColor: '#DBEAFE', // blue-100
    label: 'Diploma Exam',
    icon: GraduationCap
  },
  'diploma-deadline': {
    color: '#DC2626', // red-600
    bgColor: '#FEE2E2', // red-100
    label: 'Diploma Registration Deadline',
    icon: Award
  }
};

/**
 * Filter events by visibility level
 * @param {Array} events - Array of calendar events
 * @param {string} userRole - User role ('public', 'staff', 'admin')
 * @returns {Array} Filtered events
 */
export const filterEventsByVisibility = (events, userRole = 'public') => {
  const visibilityHierarchy = {
    'public': ['public'],
    'staff': ['public', 'staff'],
    'admin': ['public', 'staff', 'admin']
  };

  const allowedVisibility = visibilityHierarchy[userRole] || ['public'];

  return events.filter(event => {
    const eventVisibility = event.visibility || 'public';
    return allowedVisibility.includes(eventVisibility);
  });
};

export default {
  schoolYear,
  schoolYearDisplay,
  importantDates, // Now an array with metadata
  importantDatesLookup, // Backward compatibility object
  calendarEvents: allCalendarEvents, // Export combined events (regular + diploma)
  eventTypes,
  filterEventsByVisibility
};
