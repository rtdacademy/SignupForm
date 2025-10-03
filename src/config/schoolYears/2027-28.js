// src/config/schoolYears/2027-28.js
import { toEdmontonDate } from '../../utils/timeZoneUtils';

export const schoolYear = '27/28';
export const schoolYearDisplay = '2027-2028';

export const importantDates = {
  schoolYearDisplay: '2027-2028',
  registrationOpen: toEdmontonDate('2027-01-01'),
  septemberCount: toEdmontonDate('2027-09-29'),
  term1RegistrationDeadline: toEdmontonDate('2027-09-29'),
  term1CountDay: toEdmontonDate('2027-09-30'),
  term1End: toEdmontonDate('2028-01-31'),
  term2RegistrationDeadline: toEdmontonDate('2028-04-15'),
  term2HomeEducationDeadline: toEdmontonDate('2028-02-28'),
  term2End: toEdmontonDate('2028-06-19'),
  term2PasiDeadline: toEdmontonDate('2028-06-19'),
  summerStart: toEdmontonDate('2027-07-01'),
  summerEnd: toEdmontonDate('2027-08-31'),
  intentToRegisterPeriod: {
    start: toEdmontonDate('2027-09-30'),
    end: toEdmontonDate('2027-12-31'),
  }
};

export const calendarEvents = [];

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
