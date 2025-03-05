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
 * Process a batch of PASI records for deletion, removing any associated links
 * @param {Array<object>} recordsToDelete - Array of PASI records being deleted
 * @returns {Promise<{success: number, failed: number}>} Results of the operation
 */
export const processPasiRecordDeletions = async (recordsToDelete) => {
  if (!recordsToDelete || recordsToDelete.length === 0) {
    return { success: 0, failed: 0, errors: [] };
  }

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  try {
    const db = getDatabase();
    
    // Group records by batches to avoid exceeding Firebase limits
    const BATCH_SIZE = 100;
    const recordBatches = [];
    
    for (let i = 0; i < recordsToDelete.length; i += BATCH_SIZE) {
      recordBatches.push(recordsToDelete.slice(i, i + BATCH_SIZE));
    }
    
    // Process each batch
    for (const batch of recordBatches) {
      // Step 1: Get all pasiRecordIds for this batch
      const pasiRecordIds = batch.map(record => record.id);
      
      // Step 2: Find all links in a single batch query using a complex query
      // This is much more efficient than querying one by one
      const linkData = await findPasiLinksByRecordIds(pasiRecordIds);
      
      // Step 3: Prepare a single update operation for all changes
      const updates = {};
      
      // Add record unlink updates
      Object.values(linkData).forEach(link => {
        // Mark the PASI record as unlinked
        updates[`pasiRecords/${link.pasiRecordId}/linked`] = false;
        updates[`pasiRecords/${link.pasiRecordId}/linkedAt`] = null;
        
        // Remove reference from student course summary
        if (link.studentCourseSummaryKey && link.courseCode) {
          updates[`studentCourseSummaries/${link.studentCourseSummaryKey}/pasiRecords/${link.courseCode}`] = null;
        }
        
        // Remove the link itself
        updates[`pasiLinks/${link.linkId}`] = null;
        
        results.success++;
      });
      
      // Step 4: Apply all updates in a single operation if we have any
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
      
      // Track records that didn't have links to delete
      const linkedRecordIds = new Set(Object.keys(linkData).map(key => linkData[key].pasiRecordId));
      const unlinkedRecords = pasiRecordIds.filter(id => !linkedRecordIds.has(id));
      
      // These records had no links to remove (which is not an error)
      unlinkedRecords.forEach(() => {
        results.success++;
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error in batch deletion of PASI links:', error);
    results.errors.push({
      batchError: true,
      error: error.message
    });
    return results;
  }
};

/**
 * Find multiple PASI links by a list of PASI record IDs efficiently
 * @param {Array<string>} pasiRecordIds - List of PASI record IDs to find links for
 * @returns {Object} Object with linkId as keys and link data as values
 */
export const findPasiLinksByRecordIds = async (pasiRecordIds) => {
  if (!pasiRecordIds || pasiRecordIds.length === 0) {
    return {};
  }
  
  try {
    const db = getDatabase();
    const links = {};
    
    // Process in smaller batches to avoid hitting Firebase limits
    const BATCH_SIZE = 25;
    
    for (let i = 0; i < pasiRecordIds.length; i += BATCH_SIZE) {
      const batchIds = pasiRecordIds.slice(i, i + BATCH_SIZE);
      
      // We need to make individual queries since Firebase doesn't support 
      // querying for multiple values in a single field
      const queries = batchIds.map(id => {
        const pasiLinksRef = ref(db, 'pasiLinks');
        return query(
          pasiLinksRef,
          orderByChild('pasiRecordId'),
          equalTo(id)
        );
      });
      
      // Execute all queries concurrently
      const results = await Promise.all(queries.map(q => get(q)));
      
      // Process query results
      results.forEach(snapshot => {
        if (snapshot.exists()) {
          snapshot.forEach(childSnapshot => {
            const linkData = childSnapshot.val();
            links[childSnapshot.key] = {
              linkId: childSnapshot.key,
              pasiRecordId: linkData.pasiRecordId,
              studentCourseSummaryKey: linkData.studentCourseSummaryKey,
              courseCode: linkData.courseCode
            };
          });
        }
      });
    }
    
    return links;
  } catch (error) {
    console.error('Error finding PASI links by record IDs:', error);
    throw error;
  }
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
 * Process a batch of PASI links to create with improved batch processing and progress feedback
 * @param {Array<object>} linksToCreate - Array of link data objects
 * @param {Function} updateProgress - Optional callback for progress updates (receives percentage and batch info)
 * @returns {Promise<{success: number, failed: number, errors: Array, createdLinks: Array}>} Results of the operation
 */
export const processPasiLinkCreation = async (linksToCreate, updateProgress = null) => {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
    createdLinks: []
  };
  
  if (!linksToCreate || linksToCreate.length === 0) {
    return results;
  }
  
  try {
    const db = getDatabase();
    
    // Process in larger batches for better efficiency
    const BATCH_SIZE = 100; // Increased from 50 to 100
    const totalBatches = Math.ceil(linksToCreate.length / BATCH_SIZE);
    
    // Pre-fetch all PASI records to avoid individual lookups
    console.log(`Pre-fetching PASI records for ${linksToCreate.length} links`);
    const allPasiRecordIds = [...new Set(linksToCreate.map(link => link.pasiRecordId))];
    const pasiRecordsMap = {};
    
    // Fetch in sub-batches to avoid hitting Firebase limits
    const FETCH_BATCH_SIZE = 200;
    for (let i = 0; i < allPasiRecordIds.length; i += FETCH_BATCH_SIZE) {
      const idsBatch = allPasiRecordIds.slice(i, i + FETCH_BATCH_SIZE);
      const fetchPromises = idsBatch.map(id => get(ref(db, `pasiRecords/${id}`)));
      const snapshots = await Promise.all(fetchPromises);
      
      snapshots.forEach((snapshot, index) => {
        pasiRecordsMap[idsBatch[index]] = snapshot.exists() ? snapshot.val() : null;
      });
      
      // Update prefetch progress if callback provided
      if (updateProgress) {
        const prefetchProgress = Math.round((i + FETCH_BATCH_SIZE) / allPasiRecordIds.length * 25); // Use 25% for prefetch
        updateProgress(prefetchProgress, { phase: 'prefetch', completed: i + idsBatch.length, total: allPasiRecordIds.length });
      }
    }
    
    console.log(`Completed pre-fetching ${Object.keys(pasiRecordsMap).length} PASI records`);
    
    // Process links in batches
    for (let i = 0; i < linksToCreate.length; i += BATCH_SIZE) {
      const batch = linksToCreate.slice(i, i + BATCH_SIZE);
      const batchUpdates = {};
      const batchResults = [];
      const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`Processing batch ${currentBatchNumber}/${totalBatches} (${batch.length} links)`);
      
      // Prepare updates for all links in this batch
      for (const linkData of batch) {
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
          
          // Generate a new link ID
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
          
          // Add to batch updates
          batchUpdates[`pasiLinks/${linkId}`] = link;
          batchUpdates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = pasiRecordLink;
          
          // Check if the PASI record exists using our prefetched data
          const existingRecord = pasiRecordsMap[pasiRecordId];
          
          if (existingRecord) {
            // Record exists, so we can update the linked property
            batchUpdates[`pasiRecords/${pasiRecordId}/linked`] = true;
            batchUpdates[`pasiRecords/${pasiRecordId}/linkedAt`] = linkedAt;
          } else {
            // Record doesn't exist, create a minimal record
            console.log(`PASI record ${pasiRecordId} not found, creating minimal record`);
            batchUpdates[`pasiRecords/${pasiRecordId}`] = {
              id: pasiRecordId,
              linked: true,
              linkedAt: linkedAt,
              schoolYear: schoolYear || '',
              courseCode: courseCode || '',
              courseDescription: courseDescription || '',
              studentName: studentName || '',
              period: period || '',
              createdAt: linkedAt
            };
          }
          
          // Track this link in results
          batchResults.push({
            pasiRecordId,
            linkId,
            success: true
          });
          
        } catch (error) {
          // Track failures
          results.failed++;
          results.errors.push({
            linkData,
            error: error.message
          });
          
          batchResults.push({
            pasiRecordId: linkData.pasiRecordId,
            success: false,
            error: error.message
          });
        }
      }
      
      // Apply all updates in a single operation if there are any
      if (Object.keys(batchUpdates).length > 0) {
        try {
          await update(ref(db), batchUpdates);
          
          // Process successful results
          batchResults.forEach(result => {
            if (result.success) {
              results.success++;
              results.createdLinks.push({
                pasiRecordId: result.pasiRecordId,
                linkId: result.linkId
              });
            }
          });
          
          // Calculate progress percentage (25-100% range, saving first 25% for prefetch)
          if (updateProgress) {
            const progressPercent = 25 + Math.round((currentBatchNumber / totalBatches) * 75);
            updateProgress(progressPercent, { 
              phase: 'linking',
              batch: currentBatchNumber, 
              totalBatches, 
              batchSize: batch.length,
              success: batchResults.filter(r => r.success).length,
              failed: batchResults.filter(r => !r.success).length
            });
          }
          
          console.log(`Completed batch ${currentBatchNumber}/${totalBatches}: ${batchResults.filter(r => r.success).length} successful, ${batchResults.filter(r => !r.success).length} failed`);
          
        } catch (batchError) {
          console.error('Error applying batch updates:', batchError);
          
          // Mark all links in this batch as failed
          batchResults.forEach(result => {
            if (result.success) {
              results.failed++;
              results.errors.push({
                linkData: linksToCreate.find(l => l.pasiRecordId === result.pasiRecordId),
                error: batchError.message
              });
            }
          });
        }
      }
    }
    
    console.log(`Completed all batches: ${results.success} successful, ${results.failed} failed`);
    
  } catch (error) {
    console.error('Error in batch processing of PASI links:', error);
    results.errors.push({
      batchError: true,
      error: error.message
    });
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