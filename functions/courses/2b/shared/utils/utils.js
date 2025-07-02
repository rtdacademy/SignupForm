// Utility function to sanitize email addresses
function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email
    .toLowerCase()          // Convert to lowercase
    .replace(/\s+/g, '')    // Remove all whitespace
    .replace(/\./g, ',');   // Replace '.' with ','
}

// Utility function to format ASN (Assumed Student Number)
function formatASN(asn) {
  const cleanASN = asn.replace(/\D/g, '').trim();
  if (/^\d{4}-\d{4}-\d$/.test(cleanASN)) return cleanASN;
  return cleanASN.length === 9 ? `${cleanASN.substr(0, 4)}-${cleanASN.substr(4, 4)}-${cleanASN.substr(8)}` : cleanASN;
}

// Fields relevant to student profiles and large string fields
const profileFields = [
  'asn', 'ASN', 'originalEmail', 'StudentEmail', 'Title', 'StudentPhone', 'StudentAge',
  'Student', 'PrimaryID', 'Parent_x002f_Guardian', 'ParentPhone_x0023_',
  'ParentPermission_x003f_', 'ParentEmail', 'Name1', 'LastSync', 'StudentNotes'
];

const largeStringFields = ['Schedule', 'AssignmentsList'];

// Mapping PASI course codes to internal course IDs
const PASI_TO_COURSE_MAP = {
  'KAE1782': 82,
  'MAT1793': 78,
  'MAT1791': 97,
  'LDC1515': 90,
  'KAE2782': 84,
  'MAT2793': 96,
  'MAT2792': 98,
  'MAT2791': 95,
  'MAT3793': 86,
  'MAT3792': 87,
  'MAT3791': 89,
  'MAT3211': 93,
  'SCN2797': 137,
  'SCN3797': 2,
  'CSE1210': 1111,
  'CSE1110': 1111,
  'CSE1120': 1111,
  'CSE1220': 1111,
  'CSE1910': 1111,
  'CSE2110': 1111, 
  'CSE3120': 1111,
  'COM1255': 4,
  'INF2020': 5
};

module.exports = {
  sanitizeEmail,
  formatASN,
  profileFields,
  largeStringFields,
  PASI_TO_COURSE_MAP
};