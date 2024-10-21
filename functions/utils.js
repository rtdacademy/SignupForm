// functions/utils.js

const functions = require('firebase-functions');

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

// Environment variable for the API key
const API_KEY = functions.config().api.key;

// Fields relevant to student profiles and large string fields
const profileFields = [
  'asn', 'ASN', 'originalEmail', 'StudentEmail', 'Title', 'StudentPhone', 'StudentAge',
  'Student', 'PrimaryID', 'Parent_x002f_Guardian', 'ParentPhone_x0023_',
  'ParentPermission_x003f_', 'ParentEmail', 'Name1', 'LastSync', 'StudentNotes'
];

const largeStringFields = ['Schedule', 'AssignmentsList'];

module.exports = {
  sanitizeEmail,
  formatASN,
  API_KEY,
  profileFields,
  largeStringFields,
};
