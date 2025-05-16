// Test script to verify the registration settings path is built correctly

// Mock the time section data structure
const mockTimeSection = {
  id: "section-2024-fall",
  term: "Full Year",
  isForNextYear: false,
  originalIndex: 1
};

// Mock the registration settings currentSchoolYearKey
const currentSchoolYearKey = "24_25";
const enrollmentYear = "25/26"; // Different from current school year
const studentType = "Non-Primary";

// Build registration settings path using the actual school year from settings
const actualSchoolYearKey = currentSchoolYearKey || '';
const studentTypeKey = studentType ? studentType.replace(/\s+/g, '-') : '';
const registrationBasePath = `/registrationSettings/${actualSchoolYearKey}/${studentTypeKey}`;

// Create the full path including the time section index if available
const registrationSettingsPath = registrationBasePath && mockTimeSection?.originalIndex !== undefined ?
  `${registrationBasePath}/timeSections/${mockTimeSection.originalIndex}` : registrationBasePath;

console.log('Registration settings path test:', {
  enrollmentYear,
  currentSchoolYearKey,
  studentType,
  registrationSettingsPath,
  timeSectionId: mockTimeSection.id,
  timeSectionOriginalIndex: mockTimeSection.originalIndex
});

// Expected output: /registrationSettings/24_25/Non-Primary/timeSections/1
console.log('Expected path:', '/registrationSettings/24_25/Non-Primary/timeSections/1');
console.log('Actual path:', registrationSettingsPath);
console.log('Paths match:', registrationSettingsPath === '/registrationSettings/24_25/Non-Primary/timeSections/1');