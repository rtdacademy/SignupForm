const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Determine payment status based on trial period and schedule dates
 * @param {string} created - ISO date string when course was created
 * @param {string} scheduleStartDate - ISO date string when course starts
 * @param {number} trialPeriodDays - Number of trial days (default 10)
 * @returns {string} Payment status detailed value
 */
function determinePaymentStatus(created, scheduleStartDate, trialPeriodDays = 10) {
  const now = new Date();
  const createdDate = new Date(created);
  const trialEndDate = new Date(createdDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);
  const startDate = new Date(scheduleStartDate);
  
  // Check if we're still in trial period
  if (now <= trialEndDate) {
    return 'trial_period';
  } 
  // Check if trial ended but course hasn't started
  else if (now < startDate) {
    return 'unpaid_before_start_date';
  } 
  // Trial ended and course has started
  else {
    return 'unpaid';
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
      // Skip if not Adult or International student
      if (record.StudentType_Value !== 'Adult Student' && 
          record.StudentType_Value !== 'International Student') {
        stats.skipped++;
        continue;
      }

      // Skip if already paid
      if (record.payment_status !== 'requires_payment') {
        stats.skipped++;
        continue;
      }

      // Skip if missing required dates
      if (!record.Created || !record.ScheduleStartDate) {
        logger.warn(`Missing dates for ${key}`, { 
          created: record.Created, 
          scheduleStartDate: record.ScheduleStartDate 
        });
        stats.skipped++;
        continue;
      }

      // Determine the new payment status
      const newStatus = determinePaymentStatus(
        record.Created,
        record.ScheduleStartDate,
        10 // Trial period days - could be made configurable
      );

      // Only update if status has changed
      if (record.payment_status_detailed !== newStatus) {
        updates[`studentCourseSummaries/${key}/payment_status_detailed`] = newStatus;
        // Use ServerValue.TIMESTAMP if available, otherwise fallback to Date.now()
        updates[`studentCourseSummaries/${key}/payment_details/lastTrialCheck`] = 
          admin.database?.ServerValue?.TIMESTAMP || Date.now();
        stats.updated++;
      } else {
        stats.skipped++;
      }
      
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

module.exports = {
  updateTrialPaymentStatuses: exports.updateTrialPaymentStatuses,
  manualUpdateTrialPaymentStatuses: exports.manualUpdateTrialPaymentStatuses
};