/**
 * Test the upgrade Cloud Functions
 * Run with: node test-upgrade-functions.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
});

const familyId = '922c2d4a-ea85-409c-ad56-f91039543a25';
const schoolYear = '25/26';

async function testUpgradeFunctions() {
  console.log('🧪 Testing Upgrade Cloud Functions\n');
  console.log('='.repeat(80));

  try {
    console.log('\n📋 Step 1: List Eligible Families');
    console.log('-'.repeat(80));

    // Call listEligibleForUpgrade
    const listFunction = admin.functions().httpsCallable('listEligibleForUpgrade');
    const listResult = await listFunction({ schoolYear });

    console.log(`\n✅ Found ${listResult.data.totalFamilies} families eligible for upgrade:`);

    if (listResult.data.families && listResult.data.families.length > 0) {
      listResult.data.families.forEach((family, idx) => {
        console.log(`\n   ${idx + 1}. ${family.primaryGuardianName} (${family.primaryGuardianEmail})`);
        console.log(`      Family ID: ${family.familyId}`);
        console.log(`      Total Remaining: $${family.totalRemainingAllocation}`);
        console.log(`      Eligible Students: ${family.numberOfEligibleStudents}`);

        family.students.forEach((student) => {
          console.log(`\n         ${student.studentName}:`);
          console.log(`            Current: $${student.currentAllocation}`);
          console.log(`            Remaining: $${student.remainingAllocation}`);
          console.log(`            Phase: ${student.registrationPhase}`);
          console.log(`            Upgrade After: ${student.upgradeEligibleAfter}`);
        });
      });

      console.log('\n\n📋 Step 2: Test Upgrade (Dry Run)');
      console.log('-'.repeat(80));
      console.log('\n💡 To upgrade, call upgradeReimbursementAccounts with:');
      console.log('\nconst confirmations = [');

      listResult.data.families.forEach((family) => {
        console.log(`  { familyId: '${family.familyId}', confirmed: true, reason: 'Student still enrolled' },`);
      });

      console.log('];');
      console.log('\nconst result = await upgradeReimbursementAccounts({');
      console.log('  schoolYear: "25/26",');
      console.log('  familyConfirmations: confirmations');
      console.log('});');

      // Example: Upgrade just the test family
      if (listResult.data.families.some(f => f.familyId === familyId)) {
        console.log('\n\n📋 Step 3: Upgrade Test Family');
        console.log('-'.repeat(80));
        console.log('\n⚠️ This will actually upgrade the family! Press Ctrl+C to cancel.');
        console.log('💡 Waiting 5 seconds before proceeding...\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        const upgradeFunction = admin.functions().httpsCallable('upgradeReimbursementAccounts');
        const upgradeResult = await upgradeFunction({
          schoolYear,
          familyConfirmations: [
            { familyId, confirmed: true, reason: 'Testing proration upgrade' }
          ]
        });

        console.log('\n✅ Upgrade Complete!');
        console.log(`   Upgraded: ${upgradeResult.data.summary.upgraded}`);
        console.log(`   Rejected: ${upgradeResult.data.summary.rejected}`);
        console.log(`   Errors: ${upgradeResult.data.summary.errors}`);

        if (upgradeResult.data.results.upgraded.length > 0) {
          upgradeResult.data.results.upgraded.forEach((family) => {
            console.log(`\n   ${family.primaryGuardianName}:`);
            console.log(`      Total Upgraded: $${family.totalUpgraded}`);
            family.students.forEach((student) => {
              console.log(`         ${student.studentName}: +$${student.addedAmount} → $${student.newAllocation}`);
            });
          });
        }

        console.log('\n💡 Run test-family-proration.js to verify the upgrade!');
      }

    } else {
      console.log('   No families eligible for upgrade at this time');
      console.log('\n💡 Make sure:');
      console.log('   1. Students registered during Oct 6 - Jan 31, 2026');
      console.log('   2. Notification forms are submitted');
      console.log('   3. Reimbursement accounts have been created');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
  } finally {
    process.exit(0);
  }
}

testUpgradeFunctions();
