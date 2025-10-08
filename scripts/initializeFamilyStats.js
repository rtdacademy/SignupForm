/**
 * Initialize Family Statistics
 *
 * This script counts all families by status and facilitator,
 * then writes the counts to /homeEducationFamilies/stats/
 *
 * Usage:
 *   node scripts/initializeFamilyStats.js
 *
 * Requires:
 *   - Service account JSON file in project root
 *   - Firebase Admin SDK
 */

const admin = require('firebase-admin');
const path = require('path');

// Utility function to sanitize email addresses (Firebase keys can't contain '.')
function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email
    .toLowerCase()          // Convert to lowercase
    .replace(/\s+/g, '')    // Remove all whitespace
    .replace(/\./g, ',');   // Replace '.' with ','
}

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(__dirname, '..', 'rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
  });

  console.log('✅ Firebase Admin initialized with service account');
} catch (error) {
  console.error('❌ Error loading service account:', error.message);
  console.error('   Make sure the service account JSON file exists at:');
  console.error(`   ${serviceAccountPath}`);
  process.exit(1);
}

/**
 * Main function to calculate and write family statistics
 */
async function initializeFamilyStats() {
  const db = admin.database();

  console.log('🔄 Starting family statistics calculation...\n');

  try {
    // Get all families
    console.log('📥 Fetching all families from database...');
    const familiesRef = db.ref('homeEducationFamilies/familyInformation');
    const snapshot = await familiesRef.once('value');
    const families = snapshot.val();

    if (!families) {
      console.error('❌ No families found in database');
      process.exit(1);
    }

    console.log(`✅ Found ${Object.keys(families).length} families\n`);

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
      lastCalculatedBy: 'initialization-script'
    };

    // Count families
    console.log('🔢 Counting families by status and facilitator...');

    const facilitatorSet = new Set();

    for (const [familyId, family] of Object.entries(families)) {
      const status = family.status || 'inactive';
      const facilitatorEmail = family.facilitatorEmail;

      // Count by status
      if (stats.byStatus[status] !== undefined) {
        stats.byStatus[status]++;
      } else {
        console.log(`⚠️  Unknown status "${status}" for family ${familyId}, counting as inactive`);
        stats.byStatus.inactive++;
      }

      stats.total++;

      // Count by facilitator
      if (facilitatorEmail) {
        facilitatorSet.add(facilitatorEmail);

        // Sanitize email for use as Firebase key (can't contain '.')
        const sanitizedEmail = sanitizeEmail(facilitatorEmail);

        if (!stats.byFacilitator[sanitizedEmail]) {
          stats.byFacilitator[sanitizedEmail] = {
            active: 0,
            archived: 0,
            inactive: 0,
            total: 0
          };
        }

        const normalizedStatus = stats.byFacilitator[sanitizedEmail][status] !== undefined ? status : 'inactive';
        stats.byFacilitator[sanitizedEmail][normalizedStatus]++;
        stats.byFacilitator[sanitizedEmail].total++;
      }
    }

    // Display summary
    console.log('\n📊 Family Statistics Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Total Families: ${stats.total}`);
    console.log(`   Active: ${stats.byStatus.active}`);
    console.log(`   Archived: ${stats.byStatus.archived}`);
    console.log(`   Inactive: ${stats.byStatus.inactive}`);
    console.log(`   Unique Facilitators: ${facilitatorSet.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show top 5 facilitators by family count
    if (facilitatorSet.size > 0) {
      console.log('👥 Top Facilitators by Active Families:');
      const facilitatorArray = Object.entries(stats.byFacilitator)
        .map(([email, counts]) => ({ email, active: counts.active, total: counts.total }))
        .sort((a, b) => b.active - a.active)
        .slice(0, 5);

      facilitatorArray.forEach((fac, index) => {
        console.log(`   ${index + 1}. ${fac.email}: ${fac.active} active (${fac.total} total)`);
      });
      console.log();
    }

    // Write stats to database
    console.log('💾 Writing statistics to database...');
    const statsRef = db.ref('homeEducationFamilies/stats');
    await statsRef.set(stats);

    console.log('✅ Statistics written to: /homeEducationFamilies/stats/\n');

    // Verify the write
    console.log('🔍 Verifying written data...');
    const verifySnapshot = await statsRef.once('value');
    const verifyData = verifySnapshot.val();

    if (verifyData && verifyData.total === stats.total) {
      console.log('✅ Verification successful!\n');
      console.log('📍 Data Location:');
      console.log('   Path: /homeEducationFamilies/stats/');
      console.log('   Console: https://console.firebase.google.com/project/rtd-academy/database/rtd-academy-default-rtdb/data/~2FhomeEducationFamilies~2Fstats');
      console.log('\n✨ Family statistics initialization complete!\n');

      return stats;
    } else {
      console.error('❌ Verification failed - data mismatch');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the initialization
initializeFamilyStats()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
