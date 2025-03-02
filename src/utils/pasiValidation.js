import { getDatabase, ref, get } from 'firebase/database';

/**
 * Validates the linked property for PASI records by checking against pasiLinks
 * @param {string} schoolYear - The formatted school year (e.g., "23_24")
 * @returns {Promise<{
 *   validationResults: { recordId: string, isLinked: boolean, isCorrect: boolean }[],
 *   summary: { totalChecked: number, correctlyMarked: number, incorrectlyMarked: number }
 * }>}
 */
export const validatePasiRecordsLinkStatus = async (schoolYear) => {
  const db = getDatabase();
  
  // Get all PASI records for the selected school year
  const pasiSnapshot = await get(ref(db, 'pasiRecords'));
  if (!pasiSnapshot.exists()) {
    throw new Error('No PASI records found');
  }
  
  // Get all PASI links
  const pasiLinksSnapshot = await get(ref(db, 'pasiLinks'));
  
  // Create a Set of pasiRecordIds that are linked
  const linkedRecordIds = new Set();
  
  if (pasiLinksSnapshot.exists()) {
    pasiLinksSnapshot.forEach(linkSnapshot => {
      const link = linkSnapshot.val();
      if (link.pasiRecordId) {
        linkedRecordIds.add(link.pasiRecordId);
      }
    });
  }
  
  // Validate each PASI record
  const validationResults = [];
  let correctlyMarked = 0;
  let incorrectlyMarked = 0;
  
  pasiSnapshot.forEach(recordSnapshot => {
    const recordId = recordSnapshot.key;
    const record = recordSnapshot.val();
    
    // Only check records for the specified school year
    if (record.schoolYear !== schoolYear) {
      return;
    }
    
    // Check if the record is actually linked
    const isActuallyLinked = linkedRecordIds.has(recordId);
    
    // Compare with the 'linked' property
    const isMarkedLinked = record.linked === true;
    const isCorrect = isActuallyLinked === isMarkedLinked;
    
    if (isCorrect) {
      correctlyMarked++;
    } else {
      incorrectlyMarked++;
    }
    
    validationResults.push({
      recordId,
      studentName: record.studentName,
      courseCode: record.courseCode,
      isMarkedLinked,
      isActuallyLinked,
      isCorrect,
      needsUpdate: !isCorrect
    });
  });
  
  const summary = {
    totalChecked: validationResults.length,
    correctlyMarked,
    incorrectlyMarked,
    accuracyPercentage: validationResults.length > 0 
      ? ((correctlyMarked / validationResults.length) * 100).toFixed(2) 
      : 100
  };
  
  return {
    validationResults,
    summary
  };
};

/**
 * Fixes incorrect linked status in PASI records
 * @param {Array} recordsToFix - Array of record IDs that need fixing
 * @param {Set} linkedRecordIds - Set of record IDs that are actually linked
 * @returns {Promise<{ fixed: number, errors: Array }>}
 */
export const fixPasiRecordLinkStatus = async (recordsToFix, linkedRecordIds) => {
  const db = getDatabase();
  let fixed = 0;
  const errors = [];
  
  // Prepare batch updates
  const updates = {};
  
  for (const recordId of recordsToFix) {
    const shouldBeLinked = linkedRecordIds.has(recordId);
    updates[`pasiRecords/${recordId}/linked`] = shouldBeLinked;
  }
  
  try {
    // Apply all updates in a single batch operation
    await update(ref(db), updates);
    fixed = recordsToFix.length;
  } catch (error) {
    console.error('Error fixing PASI record links:', error);
    errors.push(error.message);
  }
  
  return { fixed, errors };
};