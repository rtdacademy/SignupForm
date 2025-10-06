/**
 * Backfill eligibility calculation for ALL families in a school year
 * Run with: node test-backfill-all-families.js
 *
 * WARNING: This will trigger recalculation for every family with notification forms.
 * Use with caution in production!
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
});

const db = admin.database();
const schoolYear = '25/26';
const schoolYearKey = '25_26';

async function backfillAllFamilies() {
  console.log('🔄 BACKFILL: Recalculating Eligibility for All Families\n');
  console.log('='.repeat(80));
  console.log(`School Year: ${schoolYear}`);
  console.log('='.repeat(80));
  console.log('\n⚠️  WARNING: This will trigger recalculation for ALL families.');
  console.log('⏱️  This may take several minutes depending on number of families.\n');

  try {
    // Step 1: Get all families with notification forms
    console.log('📋 Step 1: Finding families with notification forms...');
    const familiesRef = db.ref('homeEducationFamilies/familyInformation');
    const snapshot = await familiesRef.once('value');
    const families = snapshot.val() || {};

    const eligibleFamilies = [];

    // Find families with notification forms for this school year
    for (const [familyId, familyData] of Object.entries(families)) {
      const forms = familyData.NOTIFICATION_FORMS?.[schoolYearKey];

      if (forms && Object.keys(forms).length > 0) {
        // Get guardian info for display
        let guardian;
        if (Array.isArray(familyData.guardians)) {
          guardian = familyData.guardians.find(g => g.guardianType === 'primary_guardian') || familyData.guardians[0];
        } else if (familyData.guardians) {
          const guardiansList = Object.values(familyData.guardians);
          guardian = guardiansList.find(g => g.guardianType === 'primary_guardian') || guardiansList[0];
        }

        eligibleFamilies.push({
          familyId,
          guardianName: guardian ? `${guardian.firstName} ${guardian.lastName}` : 'Unknown',
          studentCount: Object.keys(forms).length
        });
      }
    }

    console.log(`   ✅ Found ${eligibleFamilies.length} families with notification forms\n`);

    if (eligibleFamilies.length === 0) {
      console.log('   No families to process. Exiting.');
      return;
    }

    // Show list
    console.log('   Families to process:');
    eligibleFamilies.forEach((family, idx) => {
      console.log(`      ${idx + 1}. ${family.guardianName} (${family.studentCount} students)`);
    });

    // Step 2: Trigger recalculation for each family
    console.log('\n📋 Step 2: Triggering recalculations...');
    console.log('   (Setting trigger flags for all families...)\n');

    const triggerPromises = eligibleFamilies.map(family => {
      const triggerRef = db.ref(`reimbursementRecalculations/${schoolYearKey}/${family.familyId}/trigger`);
      return triggerRef.set(true);
    });

    await Promise.all(triggerPromises);
    console.log('   ✅ All triggers set!');

    // Step 3: Wait for Cloud Functions to complete
    const waitTime = Math.min(eligibleFamilies.length * 2, 60); // 2 seconds per family, max 60 seconds
    console.log(`\n⏳ Waiting ${waitTime} seconds for Cloud Functions to complete...`);
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

    // Step 4: Check results
    console.log('\n📋 Step 3: Checking results...\n');

    const results = {
      success: [],
      failed: [],
      noData: []
    };

    for (const family of eligibleFamilies) {
      const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${family.familyId}`);
      const accountSnapshot = await accountRef.once('value');
      const account = accountSnapshot.val();

      if (!account) {
        results.noData.push(family);
      } else if (account.summary_totalAllocation > 0) {
        results.success.push({
          ...family,
          allocation: account.summary_totalAllocation
        });
      } else {
        results.failed.push(family);
      }
    }

    // Step 5: Display summary
    console.log('='.repeat(80));
    console.log('📊 BACKFILL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Families Processed: ${eligibleFamilies.length}`);
    console.log(`✅ Success: ${results.success.length}`);
    console.log(`❌ Failed/No Data: ${results.failed.length + results.noData.length}`);

    if (results.success.length > 0) {
      console.log('\n✅ Successfully Processed:');
      results.success.forEach((family, idx) => {
        console.log(`   ${idx + 1}. ${family.guardianName} - $${family.allocation} allocated`);
      });
    }

    if (results.failed.length > 0) {
      console.log('\n❌ Failed (No Allocation):');
      results.failed.forEach((family, idx) => {
        console.log(`   ${idx + 1}. ${family.guardianName}`);
      });
    }

    if (results.noData.length > 0) {
      console.log('\n⚠️  No Reimbursement Account Created:');
      results.noData.forEach((family, idx) => {
        console.log(`   ${idx + 1}. ${family.guardianName}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Backfill Complete!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

backfillAllFamilies();
