const admin = require('firebase-admin');
const { onValueWritten, onValueDeleted, onValueCreated } = require('firebase-functions/v2/database');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { sanitizeEmail } = require('./utils');

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Core function to recalculate family statistics
 * Counts families by status and by facilitator
 * @returns {Object} Updated stats object
 */
async function recalculateFamilyStats() {
  const db = admin.database();

  console.log('🔄 Recalculating family statistics...');

  try {
    // Get all families
    const familiesRef = db.ref('homeEducationFamilies/familyInformation');
    const snapshot = await familiesRef.once('value');
    const families = snapshot.val() || {};

    // Initialize counters
    const stats = {
      byStatus: {
        active: 0,
        archived: 0,
        inactive: 0
      },
      byFacilitator: {},
      total: 0,
      lastUpdated: admin.database.ServerValue.TIMESTAMP,
      lastCalculatedBy: 'cloud-function'
    };

    // Count families
    for (const [familyId, family] of Object.entries(families)) {
      const status = family.status || 'inactive';
      const facilitatorEmail = family.facilitatorEmail;

      // Count by status
      if (stats.byStatus[status] !== undefined) {
        stats.byStatus[status]++;
      } else {
        stats.byStatus[status] = 1;
      }

      stats.total++;

      // Count by facilitator
      if (facilitatorEmail) {
        // Sanitize email for use as Firebase key
        const sanitizedEmail = sanitizeEmail(facilitatorEmail);

        if (!stats.byFacilitator[sanitizedEmail]) {
          stats.byFacilitator[sanitizedEmail] = {
            active: 0,
            archived: 0,
            inactive: 0,
            total: 0
          };
        }

        if (stats.byFacilitator[sanitizedEmail][status] !== undefined) {
          stats.byFacilitator[sanitizedEmail][status]++;
        } else {
          stats.byFacilitator[sanitizedEmail][status] = 1;
        }
        stats.byFacilitator[sanitizedEmail].total++;
      }
    }

    // Write stats to database
    const statsRef = db.ref('homeEducationFamilies/stats');
    await statsRef.set(stats);

    console.log(`✅ Family stats updated:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Active: ${stats.byStatus.active}`);
    console.log(`   Archived: ${stats.byStatus.archived}`);
    console.log(`   Facilitators: ${Object.keys(stats.byFacilitator).length}`);

    return stats;

  } catch (error) {
    console.error('❌ Error recalculating family stats:', error);
    throw error;
  }
}

/**
 * Optimized function to update stats incrementally (no full recalc)
 * @param {string} familyId - Family ID that changed
 * @param {Object|null} beforeData - Family data before change (null if created)
 * @param {Object|null} afterData - Family data after change (null if deleted)
 */
async function updateStatsIncremental(familyId, beforeData, afterData) {
  const db = admin.database();
  const statsRef = db.ref('homeEducationFamilies/stats');

  console.log(`🔄 Incremental stats update for family ${familyId}`);

  try {
    // Get current stats
    const statsSnapshot = await statsRef.once('value');
    let stats = statsSnapshot.val();

    // Initialize if doesn't exist
    if (!stats) {
      console.log('⚠️ Stats not initialized, running full recalculation...');
      return await recalculateFamilyStats();
    }

    // Ensure byFacilitator exists
    if (!stats.byFacilitator) {
      stats.byFacilitator = {};
    }

    const updates = {};

    // Handle deletion
    if (!afterData && beforeData) {
      const oldStatus = beforeData.status || 'inactive';
      const oldFacilitator = beforeData.facilitatorEmail;

      // Decrement old status
      updates[`byStatus/${oldStatus}`] = (stats.byStatus[oldStatus] || 1) - 1;
      updates['total'] = (stats.total || 1) - 1;

      // Decrement old facilitator
      if (oldFacilitator) {
        const sanitizedOldFacilitator = sanitizeEmail(oldFacilitator);
        const facilitatorPath = `byFacilitator/${sanitizedOldFacilitator}`;
        const facilitatorStats = stats.byFacilitator[sanitizedOldFacilitator] || { active: 0, archived: 0, inactive: 0, total: 0 };

        updates[`${facilitatorPath}/${oldStatus}`] = Math.max(0, (facilitatorStats[oldStatus] || 1) - 1);
        updates[`${facilitatorPath}/total`] = Math.max(0, (facilitatorStats.total || 1) - 1);
      }
    }
    // Handle creation
    else if (afterData && !beforeData) {
      const newStatus = afterData.status || 'inactive';
      const newFacilitator = afterData.facilitatorEmail;

      // Increment new status
      updates[`byStatus/${newStatus}`] = (stats.byStatus[newStatus] || 0) + 1;
      updates['total'] = (stats.total || 0) + 1;

      // Increment new facilitator
      if (newFacilitator) {
        const sanitizedNewFacilitator = sanitizeEmail(newFacilitator);
        const facilitatorPath = `byFacilitator/${sanitizedNewFacilitator}`;
        const facilitatorStats = stats.byFacilitator[sanitizedNewFacilitator] || { active: 0, archived: 0, inactive: 0, total: 0 };

        updates[`${facilitatorPath}/${newStatus}`] = (facilitatorStats[newStatus] || 0) + 1;
        updates[`${facilitatorPath}/total`] = (facilitatorStats.total || 0) + 1;
      }
    }
    // Handle update
    else if (beforeData && afterData) {
      const oldStatus = beforeData.status || 'inactive';
      const newStatus = afterData.status || 'inactive';
      const oldFacilitator = beforeData.facilitatorEmail;
      const newFacilitator = afterData.facilitatorEmail;

      // Status changed
      if (oldStatus !== newStatus) {
        updates[`byStatus/${oldStatus}`] = Math.max(0, (stats.byStatus[oldStatus] || 1) - 1);
        updates[`byStatus/${newStatus}`] = (stats.byStatus[newStatus] || 0) + 1;
      }

      // Facilitator changed
      if (oldFacilitator !== newFacilitator) {
        // Decrement old facilitator
        if (oldFacilitator) {
          const sanitizedOldFacilitator = sanitizeEmail(oldFacilitator);
          const oldPath = `byFacilitator/${sanitizedOldFacilitator}`;
          const oldFacilitatorStats = stats.byFacilitator[sanitizedOldFacilitator] || { active: 0, archived: 0, inactive: 0, total: 0 };

          updates[`${oldPath}/${oldStatus}`] = Math.max(0, (oldFacilitatorStats[oldStatus] || 1) - 1);
          updates[`${oldPath}/total`] = Math.max(0, (oldFacilitatorStats.total || 1) - 1);
        }

        // Increment new facilitator
        if (newFacilitator) {
          const sanitizedNewFacilitator = sanitizeEmail(newFacilitator);
          const newPath = `byFacilitator/${sanitizedNewFacilitator}`;
          const newFacilitatorStats = stats.byFacilitator[sanitizedNewFacilitator] || { active: 0, archived: 0, inactive: 0, total: 0 };

          updates[`${newPath}/${newStatus}`] = (newFacilitatorStats[newStatus] || 0) + 1;
          updates[`${newPath}/total`] = (newFacilitatorStats.total || 0) + 1;
        }
      }
      // Same facilitator but status changed
      else if (oldStatus !== newStatus && newFacilitator) {
        const sanitizedNewFacilitator = sanitizeEmail(newFacilitator);
        const facilitatorPath = `byFacilitator/${sanitizedNewFacilitator}`;
        const facilitatorStats = stats.byFacilitator[sanitizedNewFacilitator] || { active: 0, archived: 0, inactive: 0, total: 0 };

        updates[`${facilitatorPath}/${oldStatus}`] = Math.max(0, (facilitatorStats[oldStatus] || 1) - 1);
        updates[`${facilitatorPath}/${newStatus}`] = (facilitatorStats[newStatus] || 0) + 1;
      }
    }

    // Add metadata
    updates['lastUpdated'] = admin.database.ServerValue.TIMESTAMP;
    updates['lastCalculatedBy'] = 'cloud-function-incremental';

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await statsRef.update(updates);
      console.log(`✅ Stats updated incrementally for family ${familyId}`);
    } else {
      console.log(`⏭️ No stat changes needed for family ${familyId}`);
    }

  } catch (error) {
    console.error(`❌ Error in incremental update for ${familyId}:`, error);
    // Fall back to full recalculation on error
    console.log('⚠️ Falling back to full recalculation...');
    await recalculateFamilyStats();
  }
}

/**
 * Cloud Function: Trigger stats update when family status or facilitator changes
 * Listens to: /homeEducationFamilies/familyInformation/{familyId}
 */
const onFamilyChange = onValueWritten({
  ref: '/homeEducationFamilies/familyInformation/{familyId}',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { familyId } = event.params;
  const beforeData = event.data.before.val();
  const afterData = event.data.after.val();

  // Check if status or facilitatorEmail changed
  const statusChanged = beforeData?.status !== afterData?.status;
  const facilitatorChanged = beforeData?.facilitatorEmail !== afterData?.facilitatorEmail;

  if (statusChanged || facilitatorChanged) {
    console.log(`📊 Family ${familyId} changed - updating stats...`);
    console.log(`   Status: ${beforeData?.status} → ${afterData?.status}`);
    console.log(`   Facilitator: ${beforeData?.facilitatorEmail} → ${afterData?.facilitatorEmail}`);

    await updateStatsIncremental(familyId, beforeData, afterData);
  } else {
    console.log(`⏭️ Family ${familyId} changed but status/facilitator unchanged - skipping stats update`);
  }

  return null;
});

/**
 * Cloud Function: Trigger stats update when family is deleted
 * Listens to: /homeEducationFamilies/familyInformation/{familyId}
 */
const onFamilyDelete = onValueDeleted({
  ref: '/homeEducationFamilies/familyInformation/{familyId}',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { familyId } = event.params;
  const beforeData = event.data.before.val();

  console.log(`🗑️ Family ${familyId} deleted - updating stats...`);

  await updateStatsIncremental(familyId, beforeData, null);

  return null;
});

/**
 * Cloud Function: Trigger stats update when family is created
 * Listens to: /homeEducationFamilies/familyInformation/{familyId}
 */
const onFamilyCreate = onValueCreated({
  ref: '/homeEducationFamilies/familyInformation/{familyId}',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { familyId } = event.params;
  const afterData = event.data.after.val();

  console.log(`✨ New family ${familyId} created - updating stats...`);

  await updateStatsIncremental(familyId, null, afterData);

  return null;
});

/**
 * Cloud Function: Initialize or recalculate all family statistics
 * Callable function for admin use
 */
const initializeFamilyStats = onCall({
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "https://*.rtdacademy.com",
    "http://localhost:3000"
  ],
  maxInstances: 5,
  memory: '512MiB',
  timeoutSeconds: 300
}, async (data) => {
  // Verify admin permissions (optional - remove if you want to test without auth)
  if (data.auth && !data.auth.token?.isAdminUser) {
    throw new HttpsError('permission-denied', 'Must be admin to initialize family stats');
  }

  console.log('🔄 Manual initialization of family statistics...');

  try {
    const stats = await recalculateFamilyStats();

    return {
      success: true,
      message: 'Family statistics initialized successfully',
      stats: {
        total: stats.total,
        active: stats.byStatus.active,
        archived: stats.byStatus.archived,
        inactive: stats.byStatus.inactive,
        facilitatorCount: Object.keys(stats.byFacilitator).length
      }
    };

  } catch (error) {
    console.error('❌ Error initializing family stats:', error);
    throw new HttpsError('internal', error.message);
  }
});

module.exports = {
  onFamilyChange,
  onFamilyDelete,
  onFamilyCreate,
  initializeFamilyStats
};
