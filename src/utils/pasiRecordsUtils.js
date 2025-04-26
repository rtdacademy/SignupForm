// src/utils/pasiRecordsUtils.js
/**
 * Utilities for handling PASI records and determining missing records
 */

import { COURSE_ID_TO_CODE } from '../config/DropdownOptions';
import { sanitizeEmail } from './sanitizeEmail'; // Import sanitizeEmail function
import { getDatabase, ref, get } from 'firebase/database'; // Import Firebase functions

/**
 * Checks if a student has a valid ASN-email association in Firebase
 * @param {Object} record - The student record to check
 * @returns {Promise<boolean>} - Promise that resolves to true if the association exists
 */
export const hasValidAsnEmailAssociation = async (record) => {
  if (!record || !record.asn || (!record.StudentEmail && !record.email)) {
    return false;
  }

  const email = record.StudentEmail || record.email;
  const sanitizedEmailValue = sanitizeEmail(email);
  
  const db = getDatabase();
  const associationRef = ref(db, `ASNs/${record.asn}/emailKeys/${sanitizedEmailValue}`);
  
  try {
    const snapshot = await get(associationRef);
    return snapshot.exists() && snapshot.val() === true;
  } catch (error) {
    console.error(`Error checking ASN-email association for ASN ${record.asn}:`, error);
    return false;
  }
};

/**
 * Filters student summaries to determine which ones are relevant for missing PASI records display
 * with additional check for valid ASN-email association and staff review status
 * @param {Array} records - The student summaries/records to filter
 * @returns {Promise<Array>} - Promise that resolves to filtered array of records
 */
export const filterRelevantMissingPasiRecordsWithEmailCheck = async (records) => {
  if (!records || !Array.isArray(records)) return [];
  
  // First apply basic filters
  const basicFilteredRecords = records
    .filter(record => (record.StudentEmail || record.email) !== '000kyle.e.brown13@gmail.com')
    .filter(record => record.Status_Value !== '✗ Removed (Not Funded)' && record.Status_Value !== 'Unenrolled')
    .filter(record => record.staffReview !== true); // Exclude records that have been reviewed by staff
  
  // Then check ASN-email association for each record
  const recordsWithAssociationChecks = await Promise.all(
    basicFilteredRecords.map(async (record) => {
      const hasAssociation = await hasValidAsnEmailAssociation(record);
      return { ...record, hasValidAssociation: hasAssociation };
    })
  );
  
  // Return only records with valid associations
  return recordsWithAssociationChecks.filter(record => record.hasValidAssociation);
};

// Keep existing functions
export const hasPasiRecordForCourse = (summary, pasiCodeMapping) => {
    if (!summary || !summary.pasiRecords) {
      return false;
    }
  
    // Get the course ID from either property
    const courseId = summary.courseId || summary.CourseID;
    if (!courseId) {
      console.log("No courseId found for summary:", summary.summaryKey || "unknown");
      return false;
    }
  
    // Get all possible PASI codes for this course ID
    const pasiCodes = getPasiCodesForCourseId(courseId, pasiCodeMapping);
    if (!pasiCodes || pasiCodes.length === 0) {
      console.log(`No PASI codes found for courseId: ${courseId}`);
      return false;
    }
  
    // Normalize all keys and PASI codes to lowercase
    const normalizedPasiRecordKeys = Object.keys(summary.pasiRecords).map(key => key.toLowerCase());
    const normalizedPasiCodes = pasiCodes.map(code => code.toLowerCase());
    
    // Check if any of the possible PASI codes exist in the normalized pasiRecords keys
    const hasMatch = normalizedPasiCodes.some(code => 
      normalizedPasiRecordKeys.includes(code)
    );
  
    // For debugging
    if (!hasMatch) {
      console.log(`No match found for courseId: ${courseId}, PASI codes: [${pasiCodes.join(', ')}], available records: [${Object.keys(summary.pasiRecords).join(', ')}]`);
    }
  
    return hasMatch;
};

// Rest of existing functions remain the same
export const getPasiCodesForCourseId = (courseId, pasiCodeMapping) => {
  // Convert courseId to number for consistency
  const courseIdNum = parseInt(courseId, 10);
  
  // Check if we have a direct mapping in the passed mapping
  if (pasiCodeMapping && pasiCodeMapping[courseIdNum]) {
    // If this is already an array, return it, otherwise wrap in array
    return Array.isArray(pasiCodeMapping[courseIdNum]) 
      ? pasiCodeMapping[courseIdNum]
      : [pasiCodeMapping[courseIdNum]];
  }
  
  // Check if we have a mapping in COURSE_ID_TO_CODE
  if (COURSE_ID_TO_CODE[courseIdNum]) {
    return Array.isArray(COURSE_ID_TO_CODE[courseIdNum])
      ? COURSE_ID_TO_CODE[courseIdNum]
      : [COURSE_ID_TO_CODE[courseIdNum]];
  }
  
  // Special handling for course ID 2000
  if (courseIdNum === 2000) {
    return ["COM1255", "INF2020"];
  }
  
  // No mapping found
  return [];
};

export const isRecordActuallyMissing = (record) => {
  if (!record) return false;

  // Check if it's an archived/unenrolled-like record
  const isArchived = record.ActiveFutureArchived_Value === "Archived";
  const isUnenrolledLikeStatus = 
    record.status === "Unenrolled" || 
    record.status === "✅ Mark Added to PASI" || 
    record.status === "☑️ Removed From PASI (Funded)";
  const isArchivedUnenrolled = isArchived && isUnenrolledLikeStatus;
  
  // Check if it has future start/resume date (more than 2 months away)
  const hasUpcomingStartResumeDate = 
    (record.status === "Starting on (Date)" && record.ScheduleStartDate && isWithinTwoMonths(record.ScheduleStartDate)) ||
    (record.status === "Resuming on (date)" && record.resumingOnDate && isWithinTwoMonths(record.resumingOnDate));
  
  // Check if it's a registration record (newly enrolled student in registration process)
  const isRegistration = record.status === "Newly Enrolled" && record.ActiveFutureArchived_Value === "Registration";
  
  // Check if the courseId is for excluded courses (139 - COM1255, and potentially others)
  const isExcludedCourse = record.courseId === 139 || record.CourseID === 139;
  
  // We only want to count records that are NOT archived/unenrolled, 
  // don't have upcoming dates, are NOT in registration, and are NOT excluded courses
  return !isArchivedUnenrolled && !hasUpcomingStartResumeDate && !isRegistration && !isExcludedCourse;
};

export const isWithinTwoMonths = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return false;
    
    // Get today's date
    const today = new Date();
    
    // Calculate date 2 months in the future
    const twoMonthsFuture = new Date();
    twoMonthsFuture.setMonth(today.getMonth() + 2);
    
    // The date is MORE than 2 months away if it's after the twoMonthsFuture date
    return date > twoMonthsFuture;
  } catch (error) {
    console.error("Error checking date range:", error);
    return false;
  }
};

// Keep original function but note it's being replaced by the async version
export const filterRelevantMissingPasiRecords = (records) => {
  if (!records || !Array.isArray(records)) return [];
  
  return records
    // Filter out a specific test email
    .filter(record => (record.StudentEmail || record.email) !== '000kyle.e.brown13@gmail.com')
    // Filter out records with irrelevant status values
    .filter(record => record.Status_Value !== '✗ Removed (Not Funded)' && record.Status_Value !== 'Unenrolled');
};