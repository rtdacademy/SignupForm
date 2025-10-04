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
    date: toEdmontonDate('2025-09-30'),
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
    showOnLanding: true,
    category: 'deadline'
  },
  {
    key: 'term1CountDay',
    type: 'date',
    date: toEdmontonDate('2025-09-30'),
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
    showOnLanding: true,
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

// Intent to Register period (special case - not a single date)
export const intentToRegisterPeriod = {
  start: toEdmontonDate('2025-09-30'),
  end: toEdmontonDate('2025-12-31'),
};

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

// Add intentToRegisterPeriod to the lookup for backward compatibility
importantDatesLookup.intentToRegisterPeriod = intentToRegisterPeriod;

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
        message: 'Welcome to the new school year! If you\'re registered for Term 1, you can access all course materials now.',
        whatThisMeans: 'Due to grant funding requirements, exams and teacher communication begin September 1. You can start learning and practicing right away!',
        learnMoreLink: '/student-faq#grantFunding',
        learnMoreText: 'Learn about early access benefits →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'Welcome to the new school year! If you\'re registered for Term 1, you can access all course materials now.',
        whatThisMeans: 'Due to grant funding requirements, exams and teacher communication begin September 1. You can start learning and practicing right away!',
        learnMoreLink: '/student-faq#grantFunding',
        learnMoreText: 'Learn about early access benefits →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This marks the start of the regular school year.',
        whatThisMeans: 'Summer School runs separately from July-August. If you\'re planning summer courses, look for summer-specific dates.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This is the traditional school year start, but doesn\'t restrict when you can begin.',
        whatThisMeans: 'As a paid student, you have full access to everything immediately upon registration - no waiting for school year dates.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your flexibility →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This is the traditional school year start, but doesn\'t restrict when you can begin.',
        whatThisMeans: 'As a paid student, you have full access to everything immediately upon registration - no waiting for school year dates.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your flexibility →',
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
        message: '🎉 GREAT NEWS: This deadline is temporarily lifted due to labour disruption!',
        whatThisMeans: 'Alberta Education has lifted the September count enrollment deadline. You can register for Term 1 courses at any time! Plus, the 10-credit cap is also lifted - take as many courses as you want! You can also choose a later end date (like June) to become a full-year student and work at your own pace.',
        learnMoreLink: '/student-faq#teacherStrike',
        learnMoreText: 'Learn about labour disruption changes →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: '🎉 GREAT NEWS: This deadline is temporarily lifted due to labour disruption!',
        whatThisMeans: 'Alberta Education has lifted the September count enrollment deadline. You can register for Term 1 courses at any time! You can also choose a later end date (like June) to become a full-year student. Note: The 10-credit cap still applies to Home Education students.',
        learnMoreLink: '/student-faq#teacherStrike',
        learnMoreText: 'Learn about labour disruption changes →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This deadline is only for Term 1 funded students.',
        whatThisMeans: 'Summer School runs July-August with different registration deadlines. Check summer-specific dates on the calendar.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'Term deadlines don\'t apply to paid students.',
        whatThisMeans: 'As a paid student, you have full flexibility to register and start anytime without waiting for official term dates.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about Adult Student flexibility →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'Term deadlines don\'t apply to paid students.',
        whatThisMeans: 'As a paid student, you have full flexibility to register and start anytime without waiting for official term dates.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about International Student options →',
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
    start: toEdmontonDate('2025-09-30'),
    end: toEdmontonDate('2025-09-30'),
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
    type: 'break',
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
        message: 'This is your final deadline to register for Term 2 courses (ending June 26).',
        afterDeadline: {
          canDo: 'You can still register for Summer School! Summer courses run July-August. Register anytime to access materials, with exams and teacher support beginning July 1.',
          learnMoreLink: '/student-faq#summerStudents',
          learnMoreText: 'Learn about Summer School →'
        },
        importance: 'critical'
      },
      'non-primary': {
        applies: false,
        message: 'This deadline is specifically for Home Education students.',
        whatThisMeans: 'Non-Primary students have until April 15 to register for Term 2. Check the April 15 deadline for your registration cutoff.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'See Non-Primary deadlines →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This is a Term 2 deadline for funded students during the school year.',
        whatThisMeans: 'Summer School has separate registration periods in June-August. Look for summer-specific dates on the calendar.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'Term deadlines don\'t apply to paid students.',
        whatThisMeans: 'As a paid student, you can register and start anytime without term restrictions or deadlines.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about Adult Student flexibility →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'Term deadlines don\'t apply to paid students.',
        whatThisMeans: 'As a paid student, you can register and start anytime without term restrictions or deadlines.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about International Student options →',
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
        message: 'This is your final deadline to register for Term 2 courses (ending June 26).',
        afterDeadline: {
          canDo: 'You can still register for Summer School! Summer courses run July-August. Register anytime to access materials, with exams and teacher support beginning July 1.',
          learnMoreLink: '/student-faq#summerStudents',
          learnMoreText: 'Learn about Summer School →'
        },
        importance: 'critical'
      },
      'home-education': {
        applies: false,
        message: 'This deadline is specifically for Non-Primary students.',
        whatThisMeans: 'Home Education students had until February 28 to register for Term 2. You can still register for Summer School courses.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'See Home Education options →',
        importance: 'info'
      },
      'summer': {
        applies: false,
        message: 'This is a Term 2 deadline for funded students during the school year.',
        whatThisMeans: 'Summer School has separate registration periods in June-August. Look for summer-specific dates on the calendar.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'Term deadlines don\'t apply to paid students.',
        whatThisMeans: 'As a paid student, you can register and start anytime without term restrictions or deadlines.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about Adult Student flexibility →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'Term deadlines don\'t apply to paid students.',
        whatThisMeans: 'As a paid student, you can register and start anytime without term restrictions or deadlines.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about International Student options →',
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
        message: 'This is the PASI deadline - when marks are submitted to Alberta Education for Term 2 students.',
        whatThisMeans: 'If you finish by this date, your mark appears on your June transcript. If you finish after, you automatically continue into Summer School and your mark is submitted in August/September.',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about course continuation →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'This is the PASI deadline - when marks are submitted to Alberta Education for Term 2 students.',
        whatThisMeans: 'If you finish by this date, your mark appears on your June transcript. If you finish after, you automatically continue into Summer School and your mark is submitted in August/September.',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about course continuation →',
        importance: 'info'
      },
      'summer': {
        applies: true,
        message: 'Summer School registration opens around this time (deadline typically June 28).',
        whatThisMeans: 'If you\'re planning to take summer courses, watch for the registration deadline announcement. Courses run July-August.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This deadline is for funded students. Your marks are submitted when you complete courses.',
        whatThisMeans: 'As a paid student, you\'re not restricted by school year calendars. Your transcript is updated as soon as you finish each course.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your flexibility →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This deadline is for funded students. Your marks are submitted when you complete courses.',
        whatThisMeans: 'As a paid student, you\'re not restricted by school year calendars. Your transcript is updated as soon as you finish each course.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your flexibility →',
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
        message: 'Summer School officially begins! This is when exams and teacher support start.',
        whatThisMeans: 'If you registered early, you already have access to course materials. Starting today, you can write exams and receive full teacher support.',
        learnMoreLink: '/student-faq#summerStudents',
        learnMoreText: 'Learn about Summer School →',
        importance: 'info'
      },
      'non-primary': {
        applies: true,
        message: 'If you didn\'t finish Term 2 by June 26, you\'ve automatically continued into Summer School.',
        whatThisMeans: 'You can continue your course work now through August. Your mark will be submitted when you finish (appearing on September transcript).',
        learnMoreLink: '/student-faq#nonPrimary',
        learnMoreText: 'Learn about course continuation →',
        importance: 'info'
      },
      'home-education': {
        applies: true,
        message: 'If you didn\'t finish Term 2 by June 26, you\'ve automatically continued into Summer School.',
        whatThisMeans: 'You can continue your course work now through August. Your mark will be submitted when you finish (appearing on September transcript).',
        learnMoreLink: '/student-faq#homeEducation',
        learnMoreText: 'Learn about course continuation →',
        importance: 'info'
      },
      'adult': {
        applies: false,
        message: 'This is when summer courses officially begin for funded students.',
        whatThisMeans: 'As a paid student, you\'re not affected by summer schedules. You have full access year-round without waiting for term dates.',
        learnMoreLink: '/student-faq#adultStudents',
        learnMoreText: 'Learn about your flexibility →',
        importance: 'info'
      },
      'international': {
        applies: false,
        message: 'This is when summer courses officially begin for funded students.',
        whatThisMeans: 'As a paid student, you\'re not affected by summer schedules. You have full access year-round without waiting for term dates.',
        learnMoreLink: '/student-faq#internationalStudents',
        learnMoreText: 'Learn about your flexibility →',
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
    },
    studentTypeMessages: {
      'non-primary': {
        applies: true,
        message: `Last day to register for the ${diploma.session} ${diploma.courseTitle} diploma exam.`,
        whatThisMeans: `The exam is on ${diploma.examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${diploma.examTime}. Register through MyPass before this deadline.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'home-education': {
        applies: true,
        message: `Last day to register for the ${diploma.session} ${diploma.courseTitle} diploma exam.`,
        whatThisMeans: `The exam is on ${diploma.examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${diploma.examTime}. Register through MyPass before this deadline.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'summer': {
        applies: true,
        message: `Last day to register for the ${diploma.session} ${diploma.courseTitle} diploma exam.`,
        whatThisMeans: `The exam is on ${diploma.examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${diploma.examTime}. Register through MyPass before this deadline.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'adult': {
        applies: true,
        message: `Last day to register for the ${diploma.session} ${diploma.courseTitle} diploma exam.`,
        whatThisMeans: `The exam is on ${diploma.examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${diploma.examTime}. Register through MyPass before this deadline.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'international': {
        applies: true,
        message: `Last day to register for the ${diploma.session} ${diploma.courseTitle} diploma exam.`,
        whatThisMeans: `The exam is on ${diploma.examDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${diploma.examTime}. Register through MyPass before this deadline. International students must arrange approved test centers.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      }
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
    },
    studentTypeMessages: {
      'non-primary': {
        applies: true,
        message: `${diploma.courseTitle} diploma exam day at ${diploma.examTime}.`,
        whatThisMeans: diploma.registrationDeadline
          ? `This exam is worth 30% of your final grade. Make sure you registered through MyPass before ${diploma.registrationDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
          : `This exam is worth 30% of your final grade. Registration deadline to be announced.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'home-education': {
        applies: true,
        message: `${diploma.courseTitle} diploma exam day at ${diploma.examTime}.`,
        whatThisMeans: diploma.registrationDeadline
          ? `This exam is worth 30% of your final grade. Make sure you registered through MyPass before ${diploma.registrationDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
          : `This exam is worth 30% of your final grade. Registration deadline to be announced.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'summer': {
        applies: true,
        message: `${diploma.courseTitle} diploma exam day at ${diploma.examTime}.`,
        whatThisMeans: diploma.registrationDeadline
          ? `This exam is worth 30% of your final grade. Make sure you registered through MyPass before ${diploma.registrationDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
          : `This exam is worth 30% of your final grade. Registration deadline to be announced.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'adult': {
        applies: true,
        message: `${diploma.courseTitle} diploma exam day at ${diploma.examTime}.`,
        whatThisMeans: diploma.registrationDeadline
          ? `This exam is worth 30% of your final grade. Make sure you registered through MyPass before ${diploma.registrationDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
          : `This exam is worth 30% of your final grade. Registration deadline to be announced.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      },
      'international': {
        applies: true,
        message: `${diploma.courseTitle} diploma exam day at ${diploma.examTime}.`,
        whatThisMeans: diploma.registrationDeadline
          ? `This exam is worth 30% of your final grade. Confirm your approved test center location and ensure you registered through MyPass before ${diploma.registrationDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
          : `This exam is worth 30% of your final grade. Confirm your approved test center location. Registration deadline to be announced.`,
        learnMoreLink: '/student-faq#general',
        learnMoreText: 'Learn about diploma exams →',
        importance: 'critical'
      }
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
    label: 'Holiday',
    icon: Calendar
  },
  break: {
    color: '#8B5CF6', // violet-600
    bgColor: '#F3E8FF', // violet-100
    label: 'Break',
    icon: Coffee
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
  },
  'announcement': {
    color: '#0D9488', // teal-600
    bgColor: '#CCFBF1', // teal-100
    label: 'Announcement',
    icon: AlertCircle
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
  intentToRegisterPeriod,
  calendarEvents: allCalendarEvents, // Export combined events (regular + diploma)
  eventTypes,
  filterEventsByVisibility
};
