// src/config/schoolYears/2024-25.js
import { toEdmontonDate } from '../../utils/timeZoneUtils';

export const schoolYear = '24/25';
export const schoolYearDisplay = '2024-2025';

export const importantDates = {
  schoolYearDisplay: '2024-2025',
  registrationOpen: toEdmontonDate('2025-09-29'),
  septemberCount: toEdmontonDate('2024-09-29'),
  term1RegistrationDeadline: toEdmontonDate('2024-09-29'),
  term1CountDay: toEdmontonDate('2024-09-30'),
  term1End: toEdmontonDate('2025-01-31'),
  term2RegistrationDeadline: toEdmontonDate('2025-04-15'),
  term2HomeEducationDeadline: toEdmontonDate('2025-02-28'),
  term2End: toEdmontonDate('2025-06-19'),
  term2PasiDeadline: toEdmontonDate('2025-06-19'),
  summerStart: toEdmontonDate('2024-07-01'),
  summerEnd: toEdmontonDate('2024-08-31'),
};

export const calendarEvents = [
  // === AUGUST 2024 ===
  {
    id: 'aisca-retreat-aug-2024',
    title: 'AISCA New Leader\'s Retreat',
    start: toEdmontonDate('2024-08-21'),
    end: toEdmontonDate('2024-08-22'),
    type: 'important',
    description: 'AISCA New Leader\'s Retreat',
    allDay: true
  },
  {
    id: 'first-day-school-2024',
    title: 'First Day of School',
    start: toEdmontonDate('2024-08-25'),
    end: toEdmontonDate('2024-08-25'),
    type: 'important',
    description: 'First Day of School for Students'
  },

  // === SEPTEMBER 2024 ===
  {
    id: 'labour-day-2024',
    title: 'Labour Day',
    start: toEdmontonDate('2024-09-01'),
    end: toEdmontonDate('2024-09-01'),
    type: 'holiday',
    description: 'Labour Day - No School'
  },
  {
    id: 'truth-reconciliation-2024',
    title: 'National Day of Truth and Reconciliation',
    start: toEdmontonDate('2024-09-30'),
    end: toEdmontonDate('2024-09-30'),
    type: 'holiday',
    description: 'National Day of Truth and Reconciliation - No School'
  },

  // === OCTOBER 2024 ===
  {
    id: 'aisca-leadership-oct-2024',
    title: 'AISCA Leadership Conference',
    start: toEdmontonDate('2024-10-09'),
    end: toEdmontonDate('2024-10-10'),
    type: 'important',
    description: 'AISCA Leadership Conference',
    allDay: true
  },
  {
    id: 'thanksgiving-2024',
    title: 'Thanksgiving',
    start: toEdmontonDate('2024-10-13'),
    end: toEdmontonDate('2024-10-13'),
    type: 'holiday',
    description: 'Thanksgiving - No School'
  },
  {
    id: 'october-halfdays-2024',
    title: 'October Halfdays',
    start: toEdmontonDate('2024-10-14'),
    end: toEdmontonDate('2024-10-24'),
    type: 'break',
    description: 'October Halfdays',
    allDay: true
  },

  // === NOVEMBER 2024 ===
  {
    id: 'remembrance-day-2024',
    title: 'Remembrance Day',
    start: toEdmontonDate('2024-11-10'),
    end: toEdmontonDate('2024-11-11'),
    type: 'holiday',
    description: 'Remembrance Day - No School',
    allDay: true
  },

  // === DECEMBER 2024 ===
  {
    id: 'winter-break-2024',
    title: 'Winter Break',
    start: toEdmontonDate('2024-12-20'),
    end: toEdmontonDate('2025-01-02'),
    type: 'break',
    description: 'Winter Break - No School',
    allDay: true
  },
  {
    id: 'christmas-2024',
    title: 'Christmas Day',
    start: toEdmontonDate('2024-12-25'),
    end: toEdmontonDate('2024-12-25'),
    type: 'holiday',
    description: 'Christmas Day'
  },

  // === JANUARY 2025 ===
  {
    id: 'new-years-2025',
    title: 'New Year\'s Day',
    start: toEdmontonDate('2025-01-01'),
    end: toEdmontonDate('2025-01-01'),
    type: 'holiday',
    description: 'New Year\'s Day'
  },
  {
    id: 'school-resumes-jan-2025',
    title: 'School Resumes',
    start: toEdmontonDate('2025-01-05'),
    end: toEdmontonDate('2025-01-05'),
    type: 'important',
    description: 'School Resumes'
  },

  // === FEBRUARY 2025 ===
  {
    id: 'february-halfdays-2025',
    title: 'February Halfdays',
    start: toEdmontonDate('2025-02-09'),
    end: toEdmontonDate('2025-02-20'),
    type: 'break',
    description: 'February Halfdays',
    allDay: true
  },
  {
    id: 'aisca-convention-2025',
    title: 'AISCA Teacher\'s Convention',
    start: toEdmontonDate('2025-02-13'),
    end: toEdmontonDate('2025-02-13'),
    type: 'important',
    description: 'AISCA Teacher\'s Convention'
  },
  {
    id: 'family-day-2025',
    title: 'Family Day',
    start: toEdmontonDate('2025-02-16'),
    end: toEdmontonDate('2025-02-16'),
    type: 'holiday',
    description: 'Family Day'
  },

  // === MARCH 2025 ===
  {
    id: 'april-halfdays-2025',
    title: 'April Halfdays',
    start: toEdmontonDate('2025-03-30'),
    end: toEdmontonDate('2025-04-10'),
    type: 'break',
    description: 'April Halfdays',
    allDay: true
  },

  // === APRIL 2025 ===
  {
    id: 'good-friday-2025',
    title: 'Good Friday',
    start: toEdmontonDate('2025-04-03'),
    end: toEdmontonDate('2025-04-03'),
    type: 'holiday',
    description: 'Good Friday - No School'
  },
  {
    id: 'easter-monday-2025',
    title: 'Easter Monday',
    start: toEdmontonDate('2025-04-06'),
    end: toEdmontonDate('2025-04-06'),
    type: 'holiday',
    description: 'Easter Monday - No School'
  },

  // === MAY 2025 ===
  {
    id: 'aisca-agm-2025',
    title: 'AISCA AGM and Leadership Conference',
    start: toEdmontonDate('2025-05-01'),
    end: toEdmontonDate('2025-05-01'),
    type: 'important',
    description: 'AISCA AGM and Leadership Conference'
  },
  {
    id: 'victoria-day-2025',
    title: 'Victoria Day',
    start: toEdmontonDate('2025-05-18'),
    end: toEdmontonDate('2025-05-18'),
    type: 'holiday',
    description: 'Victoria Day - No School'
  },

  // === JUNE 2025 ===
  {
    id: 'june-halfdays-2025',
    title: 'June Halfdays',
    start: toEdmontonDate('2025-06-15'),
    end: toEdmontonDate('2025-06-26'),
    type: 'break',
    description: 'June Halfdays',
    allDay: true
  },
  {
    id: 'last-day-students-2025',
    title: 'Last Day for Students',
    start: toEdmontonDate('2025-06-26'),
    end: toEdmontonDate('2025-06-26'),
    type: 'important',
    description: 'Last Day for Students'
  },
  {
    id: 'summer-school-start-2025',
    title: 'Summer School Begins',
    start: toEdmontonDate('2025-06-29'),
    end: toEdmontonDate('2025-06-29'),
    type: 'important',
    description: 'Summer School Begins'
  },

  // === JULY 2025 ===
  {
    id: 'canada-day-2025',
    title: 'Canada Day',
    start: toEdmontonDate('2025-07-01'),
    end: toEdmontonDate('2025-07-01'),
    type: 'holiday',
    description: 'Canada Day - School Closed'
  },

  // === AUGUST 2025 ===
  {
    id: 'august-long-2025',
    title: 'August Long Weekend',
    start: toEdmontonDate('2025-08-03'),
    end: toEdmontonDate('2025-08-03'),
    type: 'holiday',
    description: 'August Long Weekend - School Closed'
  },
  {
    id: 'summer-school-end-2025',
    title: 'Last Day of Summer School',
    start: toEdmontonDate('2025-08-07'),
    end: toEdmontonDate('2025-08-07'),
    type: 'important',
    description: 'Last Day of Summer School'
  },
  {
    id: 'aisca-retreat-aug-2025',
    title: 'AISCA New Leader\'s Retreat',
    start: toEdmontonDate('2025-08-13'),
    end: toEdmontonDate('2025-08-14'),
    type: 'important',
    description: 'AISCA New Leader\'s Retreat',
    allDay: true
  }
];

export const eventTypes = {
  holiday: { color: '#DC2626', bgColor: '#FEE2E2', label: 'Holiday' },
  break: { color: '#7C3AED', bgColor: '#EDE9FE', label: 'Break' },
  deadline: { color: '#EA580C', bgColor: '#FFEDD5', label: 'Deadline' },
  important: { color: '#0D9488', bgColor: '#CCFBF1', label: 'Important Date' },
  exam: { color: '#7C2D12', bgColor: '#FEF3C7', label: 'Exam Period' }
};

export default {
  schoolYear,
  schoolYearDisplay,
  importantDates,
  calendarEvents,
  eventTypes
};
