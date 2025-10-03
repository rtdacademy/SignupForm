// src/config/schoolYears/2025-26.js
import { toEdmontonDate } from '../../utils/timeZoneUtils';

/**
 * 2025-2026 School Year Configuration
 *
 * Contains important dates and calendar events for the academic year
 */

export const schoolYear = '25/26';
export const schoolYearDisplay = '2025-2026';

// ============================================================================
// IMPORTANT DATES - Used for registration cards and key deadlines
// ============================================================================
export const importantDates = {
  // Registration periods
  registrationOpen: toEdmontonDate('2025-09-29'),
  septemberCount: toEdmontonDate('2025-09-29'),

  // Term 1
  term1RegistrationDeadline: toEdmontonDate('2025-09-29'),
  term1CountDay: toEdmontonDate('2025-09-30'),
  term1End: toEdmontonDate('2026-01-31'),

  // Term 2
  term2RegistrationDeadline: toEdmontonDate('2026-04-15'), // Non-Primary students
  term2HomeEducationDeadline: toEdmontonDate('2026-02-28'), // Home Education students
  term2End: toEdmontonDate('2026-06-19'),
  term2PasiDeadline: toEdmontonDate('2026-06-19'),

  // Summer School
  summerRegistrationDeadline: toEdmontonDate('2025-06-30'),
  summerStart: toEdmontonDate('2025-07-01'),
  summerEnd: toEdmontonDate('2025-08-31'),

  // Intent to Register period
  intentToRegisterPeriod: {
    start: toEdmontonDate('2025-09-30'),
    end: toEdmontonDate('2025-12-31'),
  }
};

// ============================================================================
// CALENDAR EVENTS - Used for academic calendar display
// ============================================================================
export const calendarEvents = [
  // === SEPTEMBER 2025 ===
  {
    id: 'labour-day-2025',
    title: 'Labour Day',
    start: toEdmontonDate('2025-09-01'),
    end: toEdmontonDate('2025-09-01'),
    type: 'holiday',
    description: 'Statutory Holiday - School Closed'
  },
  {
    id: 'term1-start-2025',
    title: 'Term 1 Begins',
    start: toEdmontonDate('2025-09-01'),
    end: toEdmontonDate('2025-09-01'),
    type: 'important',
    description: 'First day of Term 1'
  },
  {
    id: 'sept-count-2025',
    title: 'September Count Day',
    start: toEdmontonDate('2025-09-30'),
    end: toEdmontonDate('2025-09-30'),
    type: 'deadline',
    description: 'Final day for Term 1 registration'
  },

  // === OCTOBER 2025 ===
  {
    id: 'thanksgiving-2025',
    title: 'Thanksgiving Day',
    start: toEdmontonDate('2025-10-13'),
    end: toEdmontonDate('2025-10-13'),
    type: 'holiday',
    description: 'Statutory Holiday - School Closed'
  },

  // === NOVEMBER 2025 ===
  {
    id: 'remembrance-day-2025',
    title: 'Remembrance Day',
    start: toEdmontonDate('2025-11-11'),
    end: toEdmontonDate('2025-11-11'),
    type: 'holiday',
    description: 'Statutory Holiday - School Closed'
  },

  // === DECEMBER 2025 ===
  {
    id: 'winter-break-start-2025',
    title: 'Winter Break Begins',
    start: toEdmontonDate('2025-12-20'),
    end: toEdmontonDate('2025-12-20'),
    type: 'break',
    description: 'Last day before winter break'
  },
  {
    id: 'winter-break-2025',
    title: 'Winter Break',
    start: toEdmontonDate('2025-12-21'),
    end: toEdmontonDate('2026-01-05'),
    type: 'break',
    description: 'Winter Break - School Closed',
    allDay: true
  },
  {
    id: 'christmas-2025',
    title: 'Christmas Day',
    start: toEdmontonDate('2025-12-25'),
    end: toEdmontonDate('2025-12-25'),
    type: 'holiday',
    description: 'Statutory Holiday'
  },
  {
    id: 'boxing-day-2025',
    title: 'Boxing Day',
    start: toEdmontonDate('2025-12-26'),
    end: toEdmontonDate('2025-12-26'),
    type: 'holiday',
    description: 'Statutory Holiday'
  },
  {
    id: 'new-years-day-2026',
    title: 'New Year\'s Day',
    start: toEdmontonDate('2026-01-01'),
    end: toEdmontonDate('2026-01-01'),
    type: 'holiday',
    description: 'Statutory Holiday'
  },

  // === JANUARY 2026 ===
  {
    id: 'classes-resume-jan-2026',
    title: 'Classes Resume',
    start: toEdmontonDate('2026-01-06'),
    end: toEdmontonDate('2026-01-06'),
    type: 'important',
    description: 'Classes resume after winter break'
  },
  {
    id: 'term1-end-2026',
    title: 'Term 1 Ends',
    start: toEdmontonDate('2026-01-31'),
    end: toEdmontonDate('2026-01-31'),
    type: 'important',
    description: 'Last day of Term 1'
  },

  // === FEBRUARY 2026 ===
  {
    id: 'term2-start-2026',
    title: 'Term 2 Begins',
    start: toEdmontonDate('2026-02-01'),
    end: toEdmontonDate('2026-02-01'),
    type: 'important',
    description: 'First day of Term 2'
  },
  {
    id: 'term2-he-deadline-2026',
    title: 'Term 2 Deadline (Home Education)',
    start: toEdmontonDate('2026-02-28'),
    end: toEdmontonDate('2026-02-28'),
    type: 'deadline',
    description: 'Registration deadline for Home Education students - Term 2'
  },
  {
    id: 'family-day-2026',
    title: 'Family Day',
    start: toEdmontonDate('2026-02-16'),
    end: toEdmontonDate('2026-02-16'),
    type: 'holiday',
    description: 'Statutory Holiday - School Closed'
  },

  // === MARCH 2026 ===
  {
    id: 'spring-break-2026',
    title: 'Spring Break',
    start: toEdmontonDate('2026-03-28'),
    end: toEdmontonDate('2026-04-05'),
    type: 'break',
    description: 'Spring Break - School Closed',
    allDay: true
  },

  // === APRIL 2026 ===
  {
    id: 'classes-resume-april-2026',
    title: 'Classes Resume',
    start: toEdmontonDate('2026-04-06'),
    end: toEdmontonDate('2026-04-06'),
    type: 'important',
    description: 'Classes resume after spring break'
  },
  {
    id: 'term2-np-deadline-2026',
    title: 'Term 2 Deadline (Non-Primary)',
    start: toEdmontonDate('2026-04-15'),
    end: toEdmontonDate('2026-04-15'),
    type: 'deadline',
    description: 'Registration deadline for Non-Primary students - Term 2'
  },

  // === MAY 2026 ===
  {
    id: 'victoria-day-2026',
    title: 'Victoria Day',
    start: toEdmontonDate('2026-05-18'),
    end: toEdmontonDate('2026-05-18'),
    type: 'holiday',
    description: 'Statutory Holiday - School Closed'
  },

  // === JUNE 2026 ===
  {
    id: 'term2-end-2026',
    title: 'Term 2 Ends',
    start: toEdmontonDate('2026-06-19'),
    end: toEdmontonDate('2026-06-19'),
    type: 'important',
    description: 'Last day of Term 2 / School Year'
  },

  // === JULY 2026 ===
  {
    id: 'canada-day-2026',
    title: 'Canada Day',
    start: toEdmontonDate('2026-07-01'),
    end: toEdmontonDate('2026-07-01'),
    type: 'holiday',
    description: 'Statutory Holiday'
  },
  {
    id: 'summer-school-start-2026',
    title: 'Summer School Begins',
    start: toEdmontonDate('2026-07-01'),
    end: toEdmontonDate('2026-07-01'),
    type: 'important',
    description: 'Summer school session begins'
  },

  // === AUGUST 2026 ===
  {
    id: 'civic-holiday-2026',
    title: 'Heritage Day',
    start: toEdmontonDate('2026-08-03'),
    end: toEdmontonDate('2026-08-03'),
    type: 'holiday',
    description: 'Civic Holiday - School Closed'
  },
  {
    id: 'summer-school-end-2026',
    title: 'Summer School Ends',
    start: toEdmontonDate('2026-08-31'),
    end: toEdmontonDate('2026-08-31'),
    type: 'important',
    description: 'Last day of summer school'
  },
];

// Event type configuration for styling
export const eventTypes = {
  holiday: {
    color: '#DC2626', // red-600
    bgColor: '#FEE2E2', // red-100
    label: 'Holiday'
  },
  break: {
    color: '#7C3AED', // violet-600
    bgColor: '#EDE9FE', // violet-100
    label: 'Break'
  },
  deadline: {
    color: '#EA580C', // orange-600
    bgColor: '#FFEDD5', // orange-100
    label: 'Deadline'
  },
  important: {
    color: '#0D9488', // teal-600
    bgColor: '#CCFBF1', // teal-100
    label: 'Important Date'
  },
  exam: {
    color: '#7C2D12', // amber-900
    bgColor: '#FEF3C7', // amber-100
    label: 'Exam Period'
  }
};

export default {
  schoolYear,
  schoolYearDisplay,
  importantDates,
  calendarEvents,
  eventTypes
};
