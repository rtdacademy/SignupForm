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
    failed: []
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
      id:pasiRecord.id
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
    updates[`studentCourseSummaries/${summaryKey}/categories/info@rtdacademy,com/YourWay_PASI_Status_Mismatch`] = true;
    if (linkId) {
      mismatch.details.linkId = linkId;
    }
  } else {
    updates[`studentCourseSummaries/${summaryKey}/categories/info@rtdacademy,com/YourWay_PASI_Status_Mismatch`] = false;
  }

  return { updates, mismatch };
}


// New function to find missing PASI records
async function findMissingPasiRecords(summaries) {
  const missingPasi = {};
  const updates = {};
  
  Object.entries(summaries).forEach(([key, summary]) => {
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
        status: summary.Status_Value
      };
      
      updates[`studentCourseSummaries/${key}/categories/info@rtdacademy,com/PASI_Record_Missing`] = true;
    } else {
      updates[`studentCourseSummaries/${key}/categories/info@rtdacademy,com/PASI_Record_Missing`] = false;
    }
  });

  return {
    missingPasi,
    updates,
    totalMissing: Object.keys(missingPasi).length
  };
}



exports.syncPasiRecordsV2 = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    // Authentication and authorization checks remain the same
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
      // Fetch filtered data in parallel
      const [linksSnapshot, pasiSnapshot, summariesSnapshot] = await Promise.all([
        db.ref('pasiLinks')
          .orderByChild('schoolYear')
          .equalTo(schoolYearWithSlash)
          .once('value'),
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

      // Use new simplified approach for finding missing PASI records
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

      // Merge all updates
      const updates = {
        ...existingLinksUpdates,
        ...unlinkedRecordsUpdates,
        ...missingUpdates,
        [`pasiSyncReport/history/${historyKey}`]: historySummary,
        [`pasiSyncReport/schoolYear/${schoolYearWithUnderscore}`]: {
          ...results,
          lastSync: {
            timestamp: linkedAt,
            initiatedBy: userEmail
          }
        }
      };

      // Perform atomic update if there are changes
      if (Object.keys(updates).length > 0) {
        console.log(`Performing atomic update with ${Object.keys(updates).length} changes`);
        await db.ref().update(updates);
      }

      return {
        success: true,
        message: 'PASI sync completed successfully',
        results
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
        [`studentCourseSummaries/${linkData.studentCourseSummaryKey}/categories/info@rtdacademy,com/PASI_Course_Link`]: false
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
  const unlinkedRecords = Object.entries(pasiRecords)
    .filter(([_, record]) => !record.linked);

  // Add standardized error handling function
  const addFailedRecord = (results, pasiRecordId, reason, pasiRecord, additionalData = {}) => {
    results.newLinks.failed.push({
      pasiRecordId,
      reason,
      data: {
        pasiRecord,
        ...additionalData
      }
    });
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
      updates[`studentCourseSummaries/${summaryKey}/categories/info@rtdacademy,com/PASI_Course_Link`] = true;
    });
  }

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
