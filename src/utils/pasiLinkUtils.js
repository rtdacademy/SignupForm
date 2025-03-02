
import { getDatabase, ref, push, set, update, query, orderByChild, equalTo, get } from 'firebase/database';
import { PASI_COURSES } from '../config/DropdownOptions';
/**
 * Utility functions for managing PASI record links
 */

/**
 * Finds a PASI link by PASI record ID
 * @param {string} pasiRecordId - The ID of the PASI record
 * @returns {Promise<{linkId: string, data: object} | null>} The link data or null if not found
 */
export const findPasiLinkByRecordId = async (pasiRecordId) => {
  try {
    const db = getDatabase();
    const pasiLinksRef = ref(db, 'pasiLinks');
    const linkQuery = query(
      pasiLinksRef,
      orderByChild('pasiRecordId'),
      equalTo(pasiRecordId)
    );
    
    const snapshot = await get(linkQuery);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    // Should only be one link per PASI record, but loop to be safe
    let linkData = null;
    snapshot.forEach((childSnapshot) => {
      linkData = {
        linkId: childSnapshot.key,
        data: childSnapshot.val()
      };
    });
    
    return linkData;
  } catch (error) {
    console.error('Error finding PASI link:', error);
    throw error;
  }
};

/**
 * Removes a PASI record link from the student course summary and the links collection
 * @param {string} pasiRecordId - The ID of the PASI record being deleted
 * @returns {Promise<boolean>} True if a link was found and removed, false otherwise
 */
export const removePasiRecordLink = async (pasiRecordId) => {
  try {
    const link = await findPasiLinkByRecordId(pasiRecordId);
    
    if (!link) {
      console.log(`No link found for PASI record: ${pasiRecordId}`);
      return false;
    }
    
    const { linkId, data } = link;
    const { studentCourseSummaryKey, courseCode } = data;
    
    if (!studentCourseSummaryKey || !courseCode) {
      console.error('Invalid link data:', data);
      return false;
    }
    
    const db = getDatabase();
    const updates = {};
    
    // Remove the PASI record reference from the student course summary
    updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
    
    // Remove the link itself
    updates[`pasiLinks/${linkId}`] = null;
    
    await update(ref(db), updates);
    
    console.log(`Successfully removed PASI link: ${linkId} for record: ${pasiRecordId}`);
    return true;
  } catch (error) {
    console.error('Error removing PASI record link:', error);
    throw error;
  }
};

/**
 * Process a batch of PASI records for deletion, removing any associated links
 * @param {Array<object>} recordsToDelete - Array of PASI records being deleted
 * @returns {Promise<{success: number, failed: number}>} Results of the operation
 */
export const processPasiRecordDeletions = async (recordsToDelete) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const record of recordsToDelete) {
    try {
      const removed = await removePasiRecordLink(record.id);
      if (removed) {
        results.success++;
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        recordId: record.id,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Utility functions for linking PASI records with student course summaries
 */

/**
 * Finds student course summaries matching a given ASN
 * @param {string} asn - The ASN to search for
 * @param {string} courseCode - The PASI course code
 * @returns {Promise<Array<{key: string, data: object, matchType: string}>>} Array of matching student course summaries
 */
export const findStudentCourseSummariesByASN = async (asn, courseCode) => {
  try {
    const db = getDatabase();
    const summariesRef = ref(db, 'studentCourseSummaries');
    const asnQuery = query(
      summariesRef,
      orderByChild('asn'),
      equalTo(asn)
    );
    
    const snapshot = await get(asnQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    // Get the possible course IDs for this PASI code
    const possibleCourseIds = getCourseIdsForPasiCode(courseCode);
    
    const matchingSummaries = [];
    snapshot.forEach((childSnapshot) => {
      const summaryData = childSnapshot.val();
      const summaryKey = childSnapshot.key;
      
      // Default match type is "partial" (just matches by ASN)
      let matchType = "partial";
      
      // Check if this summary has a matching course ID
      if (possibleCourseIds && possibleCourseIds.length > 0) {
        const summaryIdStr = String(summaryData.CourseID);
        
        // Check if there's a direct match with one of the possible IDs
        const isExactMatch = possibleCourseIds.some(id => String(id) === summaryIdStr);
        
        if (isExactMatch) {
          matchType = "exact";
        }
      }
      
      matchingSummaries.push({
        key: summaryKey,
        data: summaryData,
        matchType,
        displayName: `${summaryData.Course_Value || 'Unknown Course'} (${summaryData.School_x0020_Year_Value || 'Unknown Year'})`,
        courseId: summaryData.CourseID
      });
    });
    
    // Sort results to put exact matches first, then by year (more recent first)
    matchingSummaries.sort((a, b) => {
      // First by match type (exact first)
      if (a.matchType === "exact" && b.matchType !== "exact") return -1;
      if (a.matchType !== "exact" && b.matchType === "exact") return 1;
      
      // Then by year (more recent first)
      const yearA = a.data.School_x0020_Year_Value || '';
      const yearB = b.data.School_x0020_Year_Value || '';
      return yearB.localeCompare(yearA);
    });
    
    return matchingSummaries;
  } catch (error) {
    console.error('Error finding student course summaries:', error);
    throw error;
  }
};

/**
 * Get the corresponding course IDs for a PASI course code
 * @param {string} pasiCode - The PASI course code
 * @returns {Array<number>|null} Array of possible course IDs or null if not found
 */
export const getCourseIdsForPasiCode = (pasiCode) => {
  if (!pasiCode) return null;
  
  const upperCaseCode = pasiCode.toUpperCase();
  const matchingCourse = PASI_COURSES.find(course => course.pasiCode === upperCaseCode);
  
  return matchingCourse ? matchingCourse.courseId : null;
};

/**
 * Parses a student key from a student course summary key
 * @param {string} summaryKey - The student course summary key (format: studentKey_courseId)
 * @returns {string} The student key
 */
export const parseStudentKeyFromSummaryKey = (summaryKey) => {
  if (!summaryKey || typeof summaryKey !== 'string') {
    return null;
  }
  
  const parts = summaryKey.split('_');
  if (parts.length < 2) {
    return null;
  }
  
  // The student key is everything before the last underscore
  return parts.slice(0, -1).join('_');
};

/**
 * Creates a new PASI link between a PASI record and a student course summary
 * @param {object} linkData - The link data object
 * @returns {Promise<string>} The ID of the newly created link
 */
export const createPasiLink = async (linkData) => {
  try {
    const {
      pasiRecordId,
      studentCourseSummaryKey,
      studentKey,
      schoolYear,
      courseCode,
      courseDescription,
      creditsAttempted,
      period,
      studentName
    } = linkData;
    
    if (!pasiRecordId || !studentCourseSummaryKey || !courseCode) {
      throw new Error('Missing required fields for PASI link creation');
    }
    
    const db = getDatabase();
    const newLinkRef = push(ref(db, 'pasiLinks'));
    const linkId = newLinkRef.key;
    const linkedAt = new Date().toISOString();
    
    // Create the link object
    const link = {
      linkedAt,
      pasiRecordId,
      schoolYear,
      studentCourseSummaryKey,
      studentKey: studentKey || parseStudentKeyFromSummaryKey(studentCourseSummaryKey),
      courseCode
    };
    
    // Create the record to add to the student course summary
    const pasiRecordLink = {
      courseDescription: courseDescription || '',
      creditsAttempted: creditsAttempted || '',
      linkId,
      linkedAt,
      period: period || '',
      schoolYear,
      studentName: studentName || ''
    };
    
    // Prepare the update
    const updates = {};
    updates[`pasiLinks/${linkId}`] = link;
    updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = pasiRecordLink;
    updates[`pasiRecords/${pasiRecordId}/linked`] = true;
    updates[`pasiRecords/${pasiRecordId}/linkedAt`] = linkedAt;
    
    // Perform the update
    await update(ref(db), updates);
    
    return linkId;
  } catch (error) {
    console.error('Error creating PASI link:', error);
    throw error;
  }
};

/**
 * Formats a school year with underscores to one with slashes
 * @param {string} schoolYear - School year in format "23_24"
 * @returns {string} School year in format "23/24"
 */
export const formatSchoolYearWithSlash = (schoolYear) => {
  if (!schoolYear) return '';
  return schoolYear.replace('_', '/');
};

/**
 * Process a batch of PASI links to create
 * @param {Array<object>} linksToCreate - Array of link data objects
 * @returns {Promise<{success: number, failed: number, errors: Array}>} Results of the operation
 */
export const processPasiLinkCreation = async (linksToCreate) => {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
    createdLinks: []
  };
  
  for (const linkData of linksToCreate) {
    try {
      const linkId = await createPasiLink(linkData);
      results.success++;
      results.createdLinks.push({
        pasiRecordId: linkData.pasiRecordId,
        linkId
      });
    } catch (error) {
      results.failed++;
      results.errors.push({
        linkData,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Check if a PASI course code needs manual course selection
 * @param {string} courseCode - The PASI course code
 * @returns {object} Object with hasMultipleCourseIds and courseIds properties
 */
export const checkCourseCodeMapping = (courseCode) => {
  if (!courseCode) {
    return { hasMultipleCourseIds: false, courseIds: [], requiresManualSelection: true };
  }
  
  const courseIds = getCourseIdsForPasiCode(courseCode);
  
  if (!courseIds || courseIds.length === 0) {
    return { hasMultipleCourseIds: false, courseIds: [], requiresManualSelection: true };
  }
  
  return { 
    hasMultipleCourseIds: courseIds.length > 1, 
    courseIds,
    requiresManualSelection: courseIds.length > 1
  };
};