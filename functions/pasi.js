const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail, PASI_TO_COURSE_MAP } = require('./utils');


// Validation rules for status compatibility
const ValidationRules = {
  statusCompatibility: {
    Active: {
      incompatibleStatuses: [
        "🔒 Locked Out - No Payment",
        "✅ Mark Added to PASI",
        "☑️ Removed From PASI (Funded)",
        "✗ Removed (Not Funded)",
        "Course Completed",
        "Newly Enrolled",
        "Unenrolled"
      ]
    },
    Completed: {
      validStatuses: [
        "🔒 Locked Out - No Payment",
        "✅ Mark Added to PASI",
        "☑️ Removed From PASI (Funded)",
        "Course Completed",
        "Unenrolled"
      ]
    }
  }
};

// Add this to the top-level results object
const initialResults = {
  timestamp: '',
  initiatedBy: '',
  existingLinks: {
    processed: 0,
    updated: 0,
    failed: []
  },
  newLinks: {
    processed: 0,
    created: 0,
    needsManualCourseMapping: [],
    failed: [],
    // New diagnostic counters (won't affect existing structure)
    _diagnostic: {
      attemptedWithNoLinkedProperty: 0,
      attemptedWithLinkedFalse: 0,
      failedByLinkedStatus: {
        linkedFalse: 0,
        noLinkedProperty: 0,
        other: 0
      }
    }
  },
  studentCourseSummariesMissingPasi: {
    total: 0,
    details: []
  },
  statusMismatches: {
    total: 0,
    details: []
  }
};

// New helper function for status validation
function validateStatusConsistency(pasiRecord, summary, linkId = null) {
  // Early return if course code is in excluded list or maps to courseId 1111
  if (
    pasiRecord.courseCode === 'COM1255' || 
    pasiRecord.courseCode === 'INF2020' ||
    PASI_TO_COURSE_MAP[pasiRecord.courseCode] === 1111
  ) {
    return {
      updates: {},
      mismatch: { found: false, details: {} }
    };
  }
  
  const updates = {};
  const summaryKey = summary.key;
  const mismatch = {
    found: false,
    details: {
      summaryKey,
      studentName: `${summary.firstName} ${summary.lastName}`,
      yourWayStatus: summary.Status_Value,
      pasiStatus: pasiRecord.status,
      courseId: summary.CourseID,
      asn: summary.asn,
      courseCode: pasiRecord.courseCode,
      courseDescription: pasiRecord.courseDescription,
      id: pasiRecord.id
    }
  };

  if (pasiRecord.status === 'Active') {
    const invalidStatuses = ValidationRules.statusCompatibility.Active.incompatibleStatuses;

    if (invalidStatuses.includes(summary.Status_Value)) {
      mismatch.found = true;
      mismatch.details.reason = `YourWay status "${summary.Status_Value}" is invalid for PASI Active status`;
    }
  } else if (pasiRecord.status === 'Completed') {
    const validStatuses = ValidationRules.statusCompatibility.Completed.validStatuses;

    if (!validStatuses.includes(summary.Status_Value)) {
      mismatch.found = true;
      mismatch.details.reason = `YourWay status "${summary.Status_Value}" is invalid for PASI Completed status`;
    }
  }

  if (mismatch.found) {
    updates[`systemCategories/${summaryKey}/YourWay_PASI_Status_Mismatch`] = true;
    if (linkId) {
      mismatch.details.linkId = linkId;
    }
  } else {
    updates[`systemCategories/${summaryKey}/YourWay_PASI_Status_Mismatch`] = false;
  }

  return { updates, mismatch };
}


// New function to find missing PASI records
async function findMissingPasiRecords(summaries) {
  const missingPasi = {};
  const updates = {};
  
  Object.entries(summaries).forEach(([key, summary]) => {
     // Skip if ActiveFutureArchived_Value is 'Registration'
     const activeStatus = summary.ActiveFutureArchived_Value;
     if (activeStatus === 'Registration') {
       return;
     }
    
    // Skip records marked as removed
    if (summary.Status_Value === "✗ Removed (Not Funded)") {
      return;
    }
    
    // Check if pasiRecords exists and has any entries
    if (!summary.pasiRecords || Object.keys(summary.pasiRecords).length === 0) {
      missingPasi[key] = {
        summaryKey: key,
        studentName: `${summary.firstName} ${summary.lastName}`,
        courseId: summary.CourseID,
        asn: summary.asn,
        email: summary.StudentEmail,
        status: summary.Status_Value,
        schoolYear: summary.School_x0020_Year_Value,  // Added school year
        activeStatus: summary.ActiveFutureArchived_Value  
      };
      
      updates[`systemCategories/${key}/PASI_Record_Missing`] = true;
    } else {
      updates[`systemCategories/${key}/PASI_Record_Missing`] = false;
    }
  });

  console.log('Total missing PASI records:', Object.keys(missingPasi).length);
  
  return {
    missingPasi,
    updates,
    totalMissing: Object.keys(missingPasi).length
  };
}



/**
 * Process updates in batches to avoid triggering too many cloud functions
 * @param {Object} db - Firebase database reference
 * @param {Object} updates - Object containing all updates to be processed
 * @param {number} batchSize - Maximum number of operations per batch
 */
async function processBatchedUpdates(db, updates, batchSize = 200) {
  const entries = Object.entries(updates);
  const batches = [];
  let currentBatch = {};
  let count = 0;

  // Sort updates to prioritize non-systemCategories updates first
  entries.sort(([pathA], [pathB]) => {
    const isSystemCategoryA = pathA.startsWith('systemCategories/');
    const isSystemCategoryB = pathB.startsWith('systemCategories/');
    return isSystemCategoryA - isSystemCategoryB;
  });

  // Group updates into batches
  for (const [path, value] of entries) {
    currentBatch[path] = value;
    count++;

    if (count >= batchSize) {
      batches.push(currentBatch);
      currentBatch = {};
      count = 0;
    }
  }

  // Add the last batch if it has any updates
  if (count > 0) {
    batches.push(currentBatch);
  }

  console.log(`Processing ${batches.length} batches of updates`);

  // Process batches in parallel with a maximum of 3 concurrent batches
  const concurrentBatches = 3;
  for (let i = 0; i < batches.length; i += concurrentBatches) {
    const batchPromises = batches.slice(i, i + concurrentBatches).map(async (batch, index) => {
      try {
        console.log(`Processing batch ${i + index + 1} of ${batches.length} (${Object.keys(batch).length} updates)`);
        await db.ref().update(batch);
        
        // Add a shorter delay between batches
        if (i + index < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      } catch (error) {
        console.error(`Error processing batch ${i + index + 1}:`, error);
        throw error;
      }
    });

    // Wait for the current group of batches to complete before starting the next group
    await Promise.all(batchPromises);
  }
}

exports.syncPasiRecordsV2 = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    // Authentication and authorization checks
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be logged in to sync PASI records'
      );
    }

    const userEmail = context.auth.token.email || '';
    if (!userEmail.endsWith('@rtdacademy.com')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must have an RTD Academy email to sync PASI records'
      );
    }

    const schoolYearWithSlash = data.schoolYear;
    const schoolYearWithUnderscore = schoolYearWithSlash.replace('/', '_');
    
    const db = admin.database();
    const linkedAt = new Date().toISOString();
    const historyKey = `${schoolYearWithUnderscore}_${Date.now()}`;
    
    const results = JSON.parse(JSON.stringify(initialResults));
    results.timestamp = linkedAt;
    results.initiatedBy = userEmail;

    try {
      // Clear system categories first
      await db.ref('systemCategories').remove();

      // Fetch filtered data in parallel
      const [linksSnapshot, pasiSnapshot, summariesSnapshot] = await Promise.all([
        db.ref('pasiLinks').once('value'),
        db.ref('pasiRecords')
          .orderByChild('schoolYear')
          .equalTo(schoolYearWithUnderscore)
          .once('value'),
        db.ref('studentCourseSummaries')
          .orderByChild('School_x0020_Year_Value')
          .equalTo(schoolYearWithSlash)
          .once('value')
      ]);

      const links = linksSnapshot.val() || {};
      const pasiRecords = pasiSnapshot.val() || {};
      const summaries = summariesSnapshot.val() || {};

      // Diagnostic logging
      console.log(`Total PASI records: ${Object.keys(pasiRecords).length}`);
      console.log(`Records with linked=false: ${Object.values(pasiRecords).filter(r => r.linked === false).length}`);
      console.log(`Records with no linked property: ${Object.values(pasiRecords).filter(r => r.linked === undefined).length}`);
      console.log(`Records with linked=true: ${Object.values(pasiRecords).filter(r => r.linked === true).length}`);

      // Process existing links
      const existingLinksUpdates = await processExistingLinksParallel(
        links,
        pasiRecords,
        summaries,
        linkedAt,
        results
      );

      // Process unlinked records
      const unlinkedRecordsUpdates = await processUnlinkedRecordsParallel(
        pasiRecords,
        summaries,
        linkedAt,
        results
      );

      // Use simplified approach for finding missing PASI records
      const { missingPasi, updates: missingUpdates, totalMissing } = await findMissingPasiRecords(summaries);
      
      // Update results with missing PASI information
      results.studentCourseSummariesMissingPasi.total = totalMissing;
      results.studentCourseSummariesMissingPasi.details = Object.values(missingPasi);

      // Update the history summary
      const historySummary = {
        schoolYear: schoolYearWithUnderscore,
        timestamp: linkedAt,
        initiatedBy: userEmail,
        summary: {
          existingLinksProcessed: results.existingLinks.processed,
          existingLinksUpdated: results.existingLinks.updated,
          existingLinksFailed: results.existingLinks.failed.length,
          newLinksProcessed: results.newLinks.processed,
          newLinksCreated: results.newLinks.created,
          needsManualMapping: results.newLinks.needsManualCourseMapping.length,
          newLinksFailed: results.newLinks.failed.length,
          missingPasiTotal: totalMissing,
          removedRecordsCount: Object.values(summaries)
            .filter(summary => summary.Status_Value === "✗ Removed (Not Funded)")
            .length,
          statusMismatches: results.statusMismatches.total
        }
      };

      // Remove diagnostic information before storing in the report
      // to maintain backward compatibility
      const reportResults = JSON.parse(JSON.stringify(results));
      delete reportResults.newLinks._diagnostic;

      // First, update the school year report separately
      await db.ref(`pasiSyncReport/schoolYear/${schoolYearWithUnderscore}`).set({
        ...reportResults,
        lastSync: {
          timestamp: linkedAt,
          initiatedBy: userEmail
        }
      });

      // Add diagnostic information to a separate location
      await db.ref(`pasiSyncReport/diagnostics/${schoolYearWithUnderscore}`).set({
        timestamp: linkedAt,
        diagnostic: results.newLinks._diagnostic
      });

      // Merge all remaining updates
      const updates = {
        ...existingLinksUpdates,
        ...unlinkedRecordsUpdates,
        ...missingUpdates,
        [`pasiSyncReport/history/${historyKey}`]: historySummary
      };

      // Process updates in batches if there are any
      if (Object.keys(updates).length > 0) {
        console.log(`Starting batched processing of ${Object.keys(updates).length} updates`);
        await processBatchedUpdates(db, updates);
      }

      return {
        success: true,
        message: 'PASI sync completed successfully',
        results: results
      };

    } catch (error) {
      console.error('Sync failed:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Sync failed',
        { details: error.message }
      );
    }
  });

/**
 * Helper function to process existing links in parallel
 */
async function processExistingLinksParallel(links, pasiRecords, summaries, linkedAt, results) {
  const updates = {};
  const processPromises = Object.entries(links).map(async ([linkId, linkData]) => {
    try {
      results.existingLinks.processed++;
      
      const pasiRecord = pasiRecords[linkData.pasiRecordId];
      
      // First check if PASI record exists
      if (!pasiRecord) {
        results.existingLinks.failed.push({
          linkId,
          reason: 'PASI record not found',
          data: {
            ...linkData,
            details: 'Record may have been removed from PASI'
          }
        });
        return null;
      }

      // Fix: Get the summary directly using the stored key without course mapping
      const summary = summaries[linkData.studentCourseSummaryKey];
      
      // Add debug information if summary is not found
      if (!summary) {
        results.existingLinks.failed.push({
          linkId,
          reason: 'Student course summary not found',
          data: {
            ...linkData,
            pasiDetails: {
              courseCode: pasiRecord.courseCode,
              courseDescription: pasiRecord.courseDescription,
              studentName: pasiRecord.studentName
            }
          }
        });
        return null;
      }

      // Add summary key to the summary object for validation
      summary.key = linkData.studentCourseSummaryKey;
      
      // Validate status consistency
      const { updates: statusUpdates, mismatch } = validateStatusConsistency(pasiRecord, summary, linkId);
      
      if (mismatch.found) {
        results.statusMismatches.total++;
        results.statusMismatches.details.push(mismatch.details);
      }

      // Build updates object
      const linkUpdates = {
        [`studentCourseSummaries/${linkData.studentCourseSummaryKey}/pasiRecords/${pasiRecord.courseCode}`]: {
          courseDescription: pasiRecord.courseDescription,
          creditsAttempted: pasiRecord.creditsAttempted,
          linkedAt,
          linkId,
          period: pasiRecord.period,
          schoolYear: pasiRecord.schoolYear.replace('_', '/'),
          studentName: pasiRecord.studentName
        },
        [`pasiRecords/${linkData.pasiRecordId}/linked`]: true,
        [`pasiRecords/${linkData.pasiRecordId}/linkedAt`]: linkedAt,
        [`systemCategories/${linkData.studentCourseSummaryKey}/PASI_Course_Link`]: false
      };

      return { ...statusUpdates, ...linkUpdates };
      
    } catch (error) {
      console.error(`Error processing link ${linkId}:`, error);
      results.existingLinks.failed.push({
        linkId,
        reason: error.message,
        data: {
          ...linkData,
          error: error.toString()
        }
      });
      return null;
    }
  });

  // Wait for all link processing to complete
  const processedUpdates = await Promise.all(processPromises);
  
  // Merge all valid updates
  processedUpdates.forEach(update => {
    if (update) {
      Object.assign(updates, update);
      results.existingLinks.updated++;
    }
  });

  return updates;
}

/**
 * Helper function to process unlinked records in parallel
 */
async function processUnlinkedRecordsParallel(pasiRecords, summaries, linkedAt, results) {
  const updates = {};
  const db = admin.database();
  
  // First, get all existing links to determine which PASI records are already linked
  const existingLinksSnapshot = await db.ref('pasiLinks').once('value');
  const existingLinks = existingLinksSnapshot.val() || {};
  
  // Create a set of PASI record IDs that are already linked
  const linkedPasiRecordIds = new Set();
  Object.values(existingLinks).forEach(link => {
    linkedPasiRecordIds.add(link.pasiRecordId);
  });
  
  // Filter out PASI records that are already linked in pasiLinks
  const unlinkedRecords = Object.entries(pasiRecords).filter(([pasiRecordId]) => {
    return !linkedPasiRecordIds.has(pasiRecordId);
  });

  console.log(`Found ${linkedPasiRecordIds.size} already linked PASI records`);
  console.log(`Processing ${unlinkedRecords.length} unlinked PASI records`);

  // Count records by linked status
  unlinkedRecords.forEach(([_, record]) => {
    if (record.linked === false) {
      results.newLinks._diagnostic.attemptedWithLinkedFalse++;
    } else if (record.linked === undefined) {
      results.newLinks._diagnostic.attemptedWithNoLinkedProperty++;
    }
  });

  // Add standardized error handling function
  const addFailedRecord = (results, pasiRecordId, reason, pasiRecord, additionalData = {}) => {
    const failedRecord = {
      pasiRecordId,
      reason,
      data: {
        pasiRecord,
        ...additionalData
      }
    };
    
    results.newLinks.failed.push(failedRecord);
    
    // Count failures by linked status for diagnostics
    if (pasiRecord.linked === false) {
      results.newLinks._diagnostic.failedByLinkedStatus.linkedFalse++;
    } else if (pasiRecord.linked === undefined) {
      results.newLinks._diagnostic.failedByLinkedStatus.noLinkedProperty++;
    } else {
      results.newLinks._diagnostic.failedByLinkedStatus.other++;
    }
  };

  const processPromises = unlinkedRecords.map(async ([pasiRecordId, pasiRecord]) => {
    try {
      results.newLinks.processed++;

      if (!pasiRecord.email || pasiRecord.email === '-') {
        addFailedRecord(results, pasiRecordId, 'No ASN Found', pasiRecord);
        return null;
      }

      const studentKey = sanitizeEmail(pasiRecord.email);
      const courseId = PASI_TO_COURSE_MAP[pasiRecord.courseCode];
      console.log('Original email:', pasiRecord.email);
      console.log('Sanitized email:', studentKey);
      console.log('Course code:', pasiRecord.courseCode);
      console.log('Course ID:', courseId);
      if (courseId) {
        const summaryKey = `${studentKey}_${courseId}`;
        console.log('Generated summaryKey:', summaryKey);
        console.log('Available summary keys:', Object.keys(summaries));

        const summary = summaries[summaryKey];

        if (!summary) {
          addFailedRecord(results, pasiRecordId, 'Student course not found', pasiRecord, { summaryKey });
          return null;
        }

        // Add summary key to the summary object for validation
        summary.key = summaryKey;

        // Validate status consistency
        const { updates: statusUpdates, mismatch } = validateStatusConsistency(pasiRecord, summary);
        
        if (mismatch.found) {
          results.statusMismatches.total++;
          results.statusMismatches.details.push(mismatch.details);
        }

        const linkId = admin.database().ref('pasiLinks').push().key;
        
        results.newLinks.created++;
        return {
          ...statusUpdates,
          [`pasiLinks/${linkId}`]: {
            linkedAt,
            pasiRecordId,
            studentCourseSummaryKey: summaryKey,
            studentKey,
            schoolYear: pasiRecord.schoolYear.replace('_', '/') // Add schoolYear to pasiLinks
          },
          [`studentCourseSummaries/${summaryKey}/pasiRecords/${pasiRecord.courseCode}`]: {
            courseDescription: pasiRecord.courseDescription,
            creditsAttempted: pasiRecord.creditsAttempted,
            linkedAt,
            linkId,
            period: pasiRecord.period,
            schoolYear: pasiRecord.schoolYear.replace('_', '/'),
            studentName: pasiRecord.studentName
          },
          [`pasiRecords/${pasiRecordId}/linked`]: true,
          [`pasiRecords/${pasiRecordId}/linkedAt`]: linkedAt
        };
      } else {
        // Handle unknown course code
        const unknownCourseUpdates = await handleUnknownCourse(
            pasiRecord,
            pasiRecordId,
            studentKey,
            summaries,
            results
        );
        return unknownCourseUpdates;
      }

    } catch (error) {
      console.error(`Error processing record ${pasiRecordId}:`, error);
      addFailedRecord(results, pasiRecordId, error.message, pasiRecord);
      return null;
    }
  });

  // Wait for all processing to complete
  const processedUpdates = await Promise.all(processPromises);
  
  // Merge all valid updates
  processedUpdates.forEach(update => {
    if (update) {
      Object.assign(updates, update);
    }
  });

  return updates;
}

/**
 * Helper function to handle unknown course codes
 */
async function handleUnknownCourse(pasiRecord, pasiRecordId, studentKey, summaries, results) {
  // If the record is already linked, we don't need to do anything
  if (pasiRecord.linked === true) {
    return {};
  }

  const formattedSchoolYear = pasiRecord.schoolYear.replace('_', '/');
  const updates = {};
  
  // Find matching summaries using ASN
  const matchingSummaries = Object.entries(summaries)
    .filter(([_, summary]) => 
      summary.asn === pasiRecord.asn && 
      summary.School_x0020_Year_Value === formattedSchoolYear
    );

  let flaggedAny = false;
  if (matchingSummaries.length > 0) {
    flaggedAny = true;
    matchingSummaries.forEach(([summaryKey]) => {
      updates[`systemCategories/${summaryKey}/PASI_Course_Link`] = true;
    });
  }

  // Always add to needsManualCourseMapping to maintain original behavior
  results.newLinks.needsManualCourseMapping.push({
    pasiRecordId,
    courseCode: pasiRecord.courseCode,
    asn: pasiRecord.asn,
    email: pasiRecord.email,
    schoolYear: formattedSchoolYear,
    flaggedForReview: flaggedAny
  });

  return updates;
}


////// syncCategoriesToStudents /////

// Constants for category paths
const SYSTEM_CATEGORIES = 'systemCategories';
const CATEGORY_TYPES = {
  PASI_COURSE_LINK: 'PASI_Course_Link',
  PASI_RECORD_MISSING: 'PASI_Record_Missing',
  YOURWAY_PASI_STATUS_MISMATCH: 'YourWay_PASI_Status_Mismatch'
};

// Helper to extract studentKey and courseId from summaryKey
function parseKey(summaryKey) {
  const [studentKey, courseId] = summaryKey.split('_');
  return { studentKey, courseId };
}

// Validate category name
function isValidCategory(categoryName) {
  return Object.values(CATEGORY_TYPES).includes(categoryName);
}

// Function to process category updates in batches
async function processCategoryBatch(categories, batchSize = 100) {
  const db = admin.database();
  const batches = [];
  let currentBatch = {};
  let count = 0;

  for (const [summaryKey, categoryData] of Object.entries(categories)) {
    const { studentKey, courseId } = parseKey(summaryKey);
    
    // Skip if missing required data
    if (!studentKey || !courseId) {
      console.warn(`Invalid summary key: ${summaryKey}`);
      continue;
    }

    const updates = {};
    for (const [categoryName, value] of Object.entries(categoryData)) {
      // Skip invalid category names
      if (!isValidCategory(categoryName)) {
        console.warn(`Invalid category name: ${categoryName}`);
        continue;
      }

      updates[`students/${studentKey}/courses/${courseId}/categories/info@rtdacademy,com/${categoryName}`] = value;
      updates[`${SYSTEM_CATEGORIES}/${summaryKey}/${categoryName}/processed`] = true;
      updates[`${SYSTEM_CATEGORIES}/${summaryKey}/${categoryName}/processedAt`] = admin.database.ServerValue.TIMESTAMP;
    }

    currentBatch = { ...currentBatch, ...updates };
    count++;

    if (count >= batchSize) {
      batches.push(currentBatch);
      currentBatch = {};
      count = 0;
    }
  }

  if (count > 0) {
    batches.push(currentBatch);
  }

  // Process each batch sequentially
  for (const batch of batches) {
    try {
      await db.ref().update(batch);
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }
}

// Cloud Function to listen for system category changes
exports.syncCategoriesToStudents = functions.database
  .ref(`${SYSTEM_CATEGORIES}/{summaryKey}/{categoryName}`)
  .onCreate(async (snapshot, context) => {
    const { summaryKey, categoryName } = context.params;
    
    // Skip if already processed
    if (snapshot.val().processed) {
      return null;
    }

    // Validate category name
    if (!isValidCategory(categoryName)) {
      console.error(`Invalid category name: ${categoryName}`);
      return null;
    }

    try {
      const categories = {
        [summaryKey]: {
          [categoryName]: snapshot.val()
        }
      };

      await processCategoryBatch(categories);
      
      console.log(`Successfully processed category ${categoryName} for ${summaryKey}`);
      return null;
    } catch (error) {
      console.error(`Error processing category ${categoryName} for ${summaryKey}:`, error);
      
      // Mark as failed in systemCategories
      const updates = {};
      updates[`${SYSTEM_CATEGORIES}/${summaryKey}/${categoryName}/error`] = error.message;
      updates[`${SYSTEM_CATEGORIES}/${summaryKey}/${categoryName}/failedAt`] = admin.database.ServerValue.TIMESTAMP;
      
      await admin.database().ref().update(updates);
      throw error;
    }
  });