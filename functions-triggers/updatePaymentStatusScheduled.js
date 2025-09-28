const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Determine payment status and trial days remaining based on trial period and schedule dates
 * @param {string} created - ISO date string when course was created
 * @param {string} scheduleStartDate - ISO date string when course starts
 * @param {number} trialPeriodDays - Number of trial days (default 10)
 * @returns {Object} Payment status detailed value and trial days remaining
 */
function determinePaymentStatus(created, scheduleStartDate, trialPeriodDays = 10) {
  const now = new Date();
  const createdDate = new Date(created);
  const trialEndDate = new Date(createdDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);
  const startDate = new Date(scheduleStartDate);

  // Calculate trial days remaining (can be negative if trial has expired)
  const trialDaysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));

  // Check if we're still in trial period
  if (now <= trialEndDate) {
    return {
      status: 'trial_period',
      trialDaysRemaining: Math.max(0, trialDaysRemaining),
      trialEndDate: trialEndDate.toISOString()
    };
  }
  // Check if trial ended but course hasn't started
  else if (now < startDate) {
    return {
      status: 'unpaid_before_start_date',
      trialDaysRemaining: 0,
      trialEndDate: trialEndDate.toISOString()
    };
  }
  // Trial ended and course has started
  else {
    return {
      status: 'unpaid',
      trialDaysRemaining: 0,
      trialEndDate: trialEndDate.toISOString()
    };
  }
}

/**
 * Process a batch of student records in parallel
 * @param {Array} records - Array of [key, record] tuples
 * @param {Object} db - Database reference
 * @returns {Object} Processing statistics
 */
async function processBatch(records, db) {
  const stats = {
    processed: 0,
    updated: 0,
    errors: 0,
    skipped: 0
  };

  const updates = {};
  
  for (const [key, record] of records) {
    try {
      // Add debug logging for specific students
      if (key.includes('gabbyhudson10@hotmail,com_87') || key.includes('000kyle,e,brown13@gmail,com_86')) {
        logger.info(`Processing record: ${key}`, {
          studentType: record.StudentType_Value,
          paymentStatus: record.payment_status,
          paymentStatusDetailed: record.payment_status_detailed,
          created: record.Created,
          scheduleStartDate: record.ScheduleStartDate,
          existingTrialDays: record.payment_details?.trialDaysRemaining,
          hasPaymentDetails: !!record.payment_details
        });
      }

      // Skip if not Adult or International student
      if (record.StudentType_Value !== 'Adult Student' &&
          record.StudentType_Value !== 'International Student') {
        if (key.includes('gabbyhudson10@hotmail,com_87') || key.includes('000kyle,e,brown13@gmail,com_86')) {
          logger.info(`Skipping ${key}: Not Adult/International (${record.StudentType_Value})`);
        }
        stats.skipped++;
        continue;
      }

      // Skip if already paid
      if (record.payment_status !== 'requires_payment') {
        if (key.includes('gabbyhudson10@hotmail,com_87') || key.includes('000kyle,e,brown13@gmail,com_86')) {
          logger.info(`Skipping ${key}: Payment status is not 'requires_payment' (${record.payment_status})`);
        }
        stats.skipped++;
        continue;
      }

      // Skip if missing required dates
      if (!record.Created || !record.ScheduleStartDate) {
        logger.warn(`Missing dates for ${key}`, {
          created: record.Created,
          scheduleStartDate: record.ScheduleStartDate
        });
        if (key.includes('gabbyhudson10@hotmail,com_87') || key.includes('000kyle,e,brown13@gmail,com_86')) {
          logger.info(`Skipping ${key}: Missing dates`);
        }
        stats.skipped++;
        continue;
      }

      // Determine the new payment status and trial info
      const trialInfo = determinePaymentStatus(
        record.Created,
        record.ScheduleStartDate,
        10 // Trial period days - could be made configurable
      );

      // Always update to ensure all paths are populated and recalculated
      // This function serves as both a scheduled updater and a manual recalculation tool

      if (key.includes('gabbyhudson10@hotmail,com_87') || key.includes('000kyle,e,brown13@gmail,com_86')) {
        logger.info(`Trial info for ${key}:`, {
          newStatus: trialInfo.status,
          oldStatus: record.payment_status_detailed,
          newTrialDays: trialInfo.trialDaysRemaining,
          oldTrialDays: record.payment_details?.trialDaysRemaining,
          trialEndDate: trialInfo.trialEndDate,
          willUpdate: true // Always update
        });
      }

      // Always perform the update to ensure all paths are in sync
      if (true) {
        // Update studentCourseSummaries
        updates[`studentCourseSummaries/${key}/payment_status_detailed`] = trialInfo.status;
        updates[`studentCourseSummaries/${key}/payment_details/trialDaysRemaining`] = trialInfo.trialDaysRemaining;
        updates[`studentCourseSummaries/${key}/payment_details/trialEndDate`] = trialInfo.trialEndDate;
        updates[`studentCourseSummaries/${key}/payment_details/lastTrialCheck`] =
          admin.database?.ServerValue?.TIMESTAMP || Date.now();

        // Also update the student's profile creditsPerStudent path for course-based payments
        // Extract student email and course ID from the key (format: email_courseID)
        const keyParts = key.split('_');
        const courseId = keyParts[keyParts.length - 1]; // Last part is course ID
        const studentEmail = keyParts.slice(0, -1).join('_'); // Everything else is email (already sanitized with commas)

        // Log path details for debugging
        if (key.includes('gabbyhudson10@hotmail,com_87')) {
          logger.info(`Extracting paths for ${key}:`, {
            courseId,
            studentEmail,
            originalKey: key
          });
        }

        // Get the school year from the record
        const schoolYear = record.School_x0020_Year_Value?.replace('/', '_') || '25_26';

        // Determine student type path
        let studentTypePath = null;
        if (record.StudentType_Value === 'Adult Student') {
          studentTypePath = 'adultStudents';
        } else if (record.StudentType_Value === 'International Student') {
          studentTypePath = 'internationalStudents';
        }

        // Update the student's profile path if it's a course-based payment model
        if (studentTypePath && courseId) {
          // Log the paths we're updating for debugging
          if (key.includes('gabbyhudson10@hotmail,com_87')) {
            logger.info(`Updating paths for ${key}:`, {
              path1: `creditsPerStudent/${schoolYear}/${studentTypePath}/${studentEmail}/courses/${courseId}`,
              path2: `students/${studentEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}`,
              schoolYear,
              studentTypePath,
              trialInfo
            });
          }

          // Update creditsPerStudent path
          updates[`creditsPerStudent/${schoolYear}/${studentTypePath}/${studentEmail}/courses/${courseId}/paymentStatusDetailed`] = trialInfo.status;
          updates[`creditsPerStudent/${schoolYear}/${studentTypePath}/${studentEmail}/courses/${courseId}/trialDaysRemaining`] = trialInfo.trialDaysRemaining;
          updates[`creditsPerStudent/${schoolYear}/${studentTypePath}/${studentEmail}/courses/${courseId}/trialEndDate`] = trialInfo.trialEndDate;

          // Also update the students profile path for direct access
          updates[`students/${studentEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}/paymentStatusDetailed`] = trialInfo.status;
          updates[`students/${studentEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}/trialDaysRemaining`] = trialInfo.trialDaysRemaining;
          updates[`students/${studentEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}/trialEndDate`] = trialInfo.trialEndDate;
        }

        stats.updated++;
      }
      // No else clause needed since we always update
      
      stats.processed++;
    } catch (error) {
      logger.error(`Error processing ${key}:`, error);
      stats.errors++;
    }
  }

  // Apply all updates in a single batch
  if (Object.keys(updates).length > 0) {
    try {
      await db.ref().update(updates);
      logger.info(`Batch update completed: ${Object.keys(updates).length} records updated`);
    } catch (error) {
      logger.error('Error applying batch updates:', error);
      stats.errors += Object.keys(updates).length;
      stats.updated = 0;
    }
  }

  return stats;
}

/**
 * Scheduled function to update payment statuses based on trial periods
 * Runs daily at midnight Mountain Time
 */
exports.updateTrialPaymentStatuses = onSchedule({
  schedule: 'every day 00:00',
  timeZone: 'America/Edmonton', // Mountain Time
  region: 'us-central1',
  concurrency: 500, // Allow high concurrency for Cloud Run
  memory: '512MiB',
  maxInstances: 10,
  retryConfig: {
    retryCount: 3,
    minBackoffSeconds: 10,
    maxBackoffSeconds: 600,
    maxRetrySeconds: 3600,
    maxDoublings: 5
  }
}, async (event) => {
  const db = admin.database();
  const startTime = Date.now();
  
  logger.info('Starting scheduled payment status update');
  
  try {
    // Calculate cutoff date (11 days ago from today)
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - 11);
    const cutoffISO = cutoffDate.toISOString();
    
    // Also set an upper bound to avoid fetching far future courses
    const upperBound = new Date();
    upperBound.setDate(today.getDate() + 90); // 90 days in future
    const upperBoundISO = upperBound.toISOString();
    
    logger.info(`Fetching records with ScheduleStartDate between ${cutoffISO} and ${upperBoundISO}`);
    
    // Query records with ScheduleStartDate in our window
    const summariesRef = db.ref('studentCourseSummaries');
    const snapshot = await summariesRef
      .orderByChild('ScheduleStartDate')
      .startAt(cutoffISO)
      .endAt(upperBoundISO)
      .once('value');
    
    if (!snapshot.exists()) {
      logger.info('No records found in date range');
      return;
    }
    
    const allRecords = snapshot.val();
    const recordEntries = Object.entries(allRecords);
    
    logger.info(`Found ${recordEntries.length} records in date range`);
    
    // Filter for Adult/International students with requires_payment status
    const eligibleRecords = recordEntries.filter(([key, record]) => {
      const isEligibleType = record.StudentType_Value === 'Adult Student' || 
                             record.StudentType_Value === 'International Student';
      const isUnpaid = record.payment_status === 'requires_payment';
      return isEligibleType && isUnpaid;
    });
    
    logger.info(`Filtered to ${eligibleRecords.length} eligible records (Adult/International with requires_payment)`);
    
    if (eligibleRecords.length === 0) {
      logger.info('No eligible records to process');
      return;
    }
    
    // Process in batches of 100 for efficiency
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < eligibleRecords.length; i += batchSize) {
      batches.push(eligibleRecords.slice(i, i + batchSize));
    }
    
    logger.info(`Processing ${batches.length} batches of up to ${batchSize} records each`);

    // Process batches in parallel
    const batchPromises = batches.map((batch, index) => {
      return processBatch(batch, db).then(stats => {
        logger.info(`Batch ${index + 1} completed:`, stats);
        return stats;
      });
    });

    const batchResults = await Promise.all(batchPromises);

    // Aggregate statistics
    const totalStats = batchResults.reduce((acc, stats) => {
      acc.processed += stats.processed;
      acc.updated += stats.updated;
      acc.errors += stats.errors;
      acc.skipped += stats.skipped;
      return acc;
    }, { processed: 0, updated: 0, errors: 0, skipped: 0 });

    // SECONDARY PASS: Process ALL students with trial_period status regardless of date
    logger.info('Starting secondary pass for all trial_period students');

    // Query for all records with payment_status_detailed = "trial_period"
    const trialSnapshot = await summariesRef
      .orderByChild('payment_status_detailed')
      .equalTo('trial_period')
      .once('value');

    if (trialSnapshot.exists()) {
      const trialRecords = Object.entries(trialSnapshot.val());

      // Filter for Adult/International students with requires_payment status
      const eligibleTrialRecords = trialRecords.filter(([key, record]) => {
        const isEligibleType = record.StudentType_Value === 'Adult Student' ||
                               record.StudentType_Value === 'International Student';
        const isUnpaid = record.payment_status === 'requires_payment';
        return isEligibleType && isUnpaid;
      });

      logger.info(`Found ${eligibleTrialRecords.length} trial_period students to process`);

      if (eligibleTrialRecords.length > 0) {
        // Process in batches
        const trialBatches = [];
        for (let i = 0; i < eligibleTrialRecords.length; i += batchSize) {
          trialBatches.push(eligibleTrialRecords.slice(i, i + batchSize));
        }

        logger.info(`Processing ${trialBatches.length} trial batches of up to ${batchSize} records each`);

        // Process trial batches in parallel
        const trialBatchPromises = trialBatches.map((batch, index) => {
          return processBatch(batch, db).then(stats => {
            logger.info(`Trial batch ${index + 1} completed:`, stats);
            return stats;
          });
        });

        const trialBatchResults = await Promise.all(trialBatchPromises);

        // Add trial stats to total stats
        trialBatchResults.forEach(stats => {
          totalStats.processed += stats.processed;
          totalStats.updated += stats.updated;
          totalStats.errors += stats.errors;
          totalStats.skipped += stats.skipped;
        });

        logger.info('Secondary pass for trial_period students completed');
      }
    } else {
      logger.info('No trial_period students found in secondary pass');
    }
    
    const duration = Date.now() - startTime;
    
    logger.info('Payment status update completed', {
      ...totalStats,
      duration: `${duration}ms`,
      recordsPerSecond: Math.round(totalStats.processed / (duration / 1000))
    });
    
    // Log summary to database for monitoring
    await db.ref('systemLogs/scheduledJobs/updateTrialPaymentStatuses').push({
      timestamp: admin.database?.ServerValue?.TIMESTAMP || Date.now(),
      date: new Date().toISOString(),
      stats: totalStats,
      duration: duration,
      success: true
    });
    
  } catch (error) {
    logger.error('Fatal error in scheduled payment status update:', error);
    
    // Log error to database for monitoring
    await db.ref('systemLogs/scheduledJobs/updateTrialPaymentStatuses').push({
      timestamp: admin.database?.ServerValue?.TIMESTAMP || Date.now(),
      date: new Date().toISOString(),
      error: error.message,
      success: false
    });
    
    throw error; // Re-throw to trigger retry
  }
});

/**
 * Manually trigger the payment status update (for testing/maintenance)
 * Can be called via Firebase Functions shell or admin SDK
 */
exports.manualUpdateTrialPaymentStatuses = require('firebase-functions/v2/https').onCall({
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"],
  maxInstances: 10
}, async (data) => {
  // Check if user is authenticated
  if (!data.auth) {
    throw new require('firebase-functions/v2/https').HttpsError('unauthenticated', 'Must be authenticated');
  }

  logger.info('Manual trigger of payment status update requested by:', data.auth.uid);

  // Call the same logic as scheduled function
  const event = { time: new Date().toISOString() };
  await exports.updateTrialPaymentStatuses.run(event);

  return {
    success: true,
    message: 'Payment status update completed',
    timestamp: Date.now()
  };
});

/**
 * Process a single student's trial status (for debugging)
 */
exports.processSingleStudentTrial = require('firebase-functions/v2/https').onCall({
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"],
  maxInstances: 10
}, async (data) => {
  // Check if user is authenticated
  if (!data.auth) {
    throw new require('firebase-functions/v2/https').HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { studentEmail, courseId } = data.data || {};

  if (!studentEmail || !courseId) {
    throw new require('firebase-functions/v2/https').HttpsError('invalid-argument', 'studentEmail and courseId are required');
  }

  const db = admin.database();
  const sanitizedEmail = studentEmail.replace(/\./g, ',');
  const key = `${sanitizedEmail}_${courseId}`;

  logger.info(`Processing single student trial for: ${key}`);

  try {
    // Get the student course summary
    const snapshot = await db.ref(`studentCourseSummaries/${key}`).once('value');

    if (!snapshot.exists()) {
      throw new require('firebase-functions/v2/https').HttpsError('not-found', `No record found for ${key}`);
    }

    const record = snapshot.val();

    logger.info(`Found record for ${key}:`, {
      studentType: record.StudentType_Value,
      paymentStatus: record.payment_status,
      paymentStatusDetailed: record.payment_status_detailed,
      created: record.Created,
      scheduleStartDate: record.ScheduleStartDate,
      currentTrialDays: record.payment_details?.trialDaysRemaining
    });

    // Check if eligible for trial processing
    if (record.StudentType_Value !== 'Adult Student' &&
        record.StudentType_Value !== 'International Student') {
      return {
        success: false,
        message: `Student is not Adult/International type (${record.StudentType_Value})`,
        key
      };
    }

    if (record.payment_status !== 'requires_payment') {
      return {
        success: false,
        message: `Payment status is not 'requires_payment' (${record.payment_status})`,
        key
      };
    }

    if (!record.Created || !record.ScheduleStartDate) {
      return {
        success: false,
        message: 'Missing required dates',
        created: record.Created,
        scheduleStartDate: record.ScheduleStartDate,
        key
      };
    }

    // Calculate trial info
    const trialInfo = determinePaymentStatus(
      record.Created,
      record.ScheduleStartDate,
      10
    );

    logger.info(`Calculated trial info for ${key}:`, trialInfo);

    // Prepare updates
    const updates = {};

    // Update studentCourseSummaries
    updates[`studentCourseSummaries/${key}/payment_status_detailed`] = trialInfo.status;
    updates[`studentCourseSummaries/${key}/payment_details/trialDaysRemaining`] = trialInfo.trialDaysRemaining;
    updates[`studentCourseSummaries/${key}/payment_details/trialEndDate`] = trialInfo.trialEndDate;
    updates[`studentCourseSummaries/${key}/payment_details/lastTrialCheck`] =
      admin.database?.ServerValue?.TIMESTAMP || Date.now();

    // Get school year
    const schoolYear = record.School_x0020_Year_Value?.replace('/', '_') || '25_26';

    // Determine student type path
    let studentTypePath = null;
    if (record.StudentType_Value === 'Adult Student') {
      studentTypePath = 'adultStudents';
    } else if (record.StudentType_Value === 'International Student') {
      studentTypePath = 'internationalStudents';
    }

    // Update profile paths
    if (studentTypePath) {
      updates[`creditsPerStudent/${schoolYear}/${studentTypePath}/${sanitizedEmail}/courses/${courseId}/paymentStatusDetailed`] = trialInfo.status;
      updates[`creditsPerStudent/${schoolYear}/${studentTypePath}/${sanitizedEmail}/courses/${courseId}/trialDaysRemaining`] = trialInfo.trialDaysRemaining;
      updates[`creditsPerStudent/${schoolYear}/${studentTypePath}/${sanitizedEmail}/courses/${courseId}/trialEndDate`] = trialInfo.trialEndDate;

      updates[`students/${sanitizedEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}/paymentStatusDetailed`] = trialInfo.status;
      updates[`students/${sanitizedEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}/trialDaysRemaining`] = trialInfo.trialDaysRemaining;
      updates[`students/${sanitizedEmail}/profile/creditsPerStudent/${schoolYear}/${studentTypePath}/courses/${courseId}/trialEndDate`] = trialInfo.trialEndDate;
    }

    logger.info(`Applying updates for ${key}:`, {
      pathCount: Object.keys(updates).length,
      paths: Object.keys(updates)
    });

    // Apply updates
    await db.ref().update(updates);

    return {
      success: true,
      message: 'Trial status updated successfully',
      key,
      trialInfo,
      updatedPaths: Object.keys(updates)
    };

  } catch (error) {
    logger.error(`Error processing single student ${key}:`, error);
    throw new require('firebase-functions/v2/https').HttpsError('internal', error.message);
  }
});

module.exports = {
  updateTrialPaymentStatuses: exports.updateTrialPaymentStatuses,
  manualUpdateTrialPaymentStatuses: exports.manualUpdateTrialPaymentStatuses,
  processSingleStudentTrial: exports.processSingleStudentTrial
};