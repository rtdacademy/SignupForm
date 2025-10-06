/**
 * Test eligibility calculation for a specific family
 * Run with: node test-specific-family.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
});

const db = admin.database();
const familyId = '01369e20-e8e5-4357-80e6-cfeef1a79390'; // New family to test
const schoolYear = '25/26';
const schoolYearKey = '25_26';

async function testFamily() {
  console.log('🧪 Testing Family Eligibility Calculation\n');
  console.log('='.repeat(80));
  console.log(`Family ID: ${familyId}`);
  console.log(`School Year: ${schoolYear}`);
  console.log('='.repeat(80));

  try {
    // Step 1: Get family data
    console.log('\n📋 Step 1: Getting family data...');
    const familyRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}`);
    const familySnapshot = await familyRef.once('value');
    const familyData = familySnapshot.val();

    if (!familyData) {
      console.log('   ❌ Family not found!');
      return;
    }

    // Handle students as object or array
    let studentsList = [];
    if (Array.isArray(familyData.students)) {
      studentsList = familyData.students;
    } else if (familyData.students) {
      studentsList = Object.values(familyData.students);
    }

    console.log(`   ✅ Found ${studentsList.length} students`);

    // Show guardian info
    let guardian;
    if (Array.isArray(familyData.guardians)) {
      guardian = familyData.guardians.find(g => g.guardianType === 'primary_guardian') || familyData.guardians[0];
    } else if (familyData.guardians) {
      const guardiansList = Object.values(familyData.guardians);
      guardian = guardiansList.find(g => g.guardianType === 'primary_guardian') || guardiansList[0];
    }

    if (guardian) {
      console.log(`   Guardian: ${guardian.firstName} ${guardian.lastName}`);
    }

    // List students
    console.log('\n   Students:');
    studentsList.forEach((student, idx) => {
      console.log(`      ${idx + 1}. ${student.firstName} ${student.lastName} (ID: ${student.id})`);
      console.log(`         Birthday: ${student.birthday || 'NOT SET'}`);
    });

    // Step 2: Trigger recalculation
    console.log('\n📋 Step 2: Triggering recalculation...');
    const recalcRef = db.ref(`reimbursementRecalculations/${schoolYearKey}/${familyId}/trigger`);
    await recalcRef.set(true);
    console.log('   ✅ Trigger set - waiting 10 seconds for Cloud Function...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 3: Check results for each student
    console.log('\n📋 Step 3: Checking eligibility results...\n');

    for (const student of studentsList) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Student: ${student.firstName} ${student.lastName}`);
      console.log(`${'─'.repeat(80)}`);

      if (!student.birthday) {
        console.log('   ⚠️  WARNING: No birthday set - cannot calculate eligibility');
        continue;
      }

      const eligibilityRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${student.id}/FUNDING_ELIGIBILITY/${schoolYearKey}`);
      const eligSnapshot = await eligibilityRef.once('value');
      const eligibility = eligSnapshot.val();

      if (!eligibility) {
        console.log('   ❌ No eligibility data found');
        console.log('   💡 Student may not have a notification form submitted');
      } else {
        console.log(`   Eligible: ${eligibility.fundingEligible ? '✅ YES' : '❌ NO'}`);
        console.log(`   Category: ${eligibility.ageCategory}`);
        console.log(`   Full Amount: $${eligibility.fundingAmount}`);
        console.log(`   Current Allocation: $${eligibility.currentAllocation}`);
        console.log(`   Remaining Allocation: $${eligibility.remainingAllocation}`);
        console.log(`   Registration Phase: ${eligibility.registrationPhase}`);

        if (eligibility.proratedReason) {
          console.log(`   Proration: ${eligibility.proratedReason}`);
        }

        if (eligibility.upgradeEligibleAfter) {
          console.log(`   Upgrade After: ${eligibility.upgradeEligibleAfter}`);
        }

        if (eligibility.eligibilityMessage) {
          console.log(`   Message: ${eligibility.eligibilityMessage}`);
        }

        if (eligibility.calculatedAt) {
          const calcDate = new Date(eligibility.calculatedAt);
          console.log(`   Calculated: ${calcDate.toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
        }
      }
    }

    // Step 4: Check reimbursement account
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 REIMBURSEMENT ACCOUNT SUMMARY');
    console.log('='.repeat(80));

    const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);
    const accountSnapshot = await accountRef.once('value');
    const account = accountSnapshot.val();

    if (!account) {
      console.log('   ❌ No reimbursement account found');
      console.log('   💡 Family may not have any submitted notification forms for this school year');
    } else {
      console.log(`   Total Allocation: $${account.summary_totalAllocation || 0}`);
      console.log(`   Total Spent: $${account.summary_totalSpent || 0}`);
      console.log(`   Total Remaining: $${account.summary_totalRemaining || 0}`);

      if (account.students) {
        console.log('\n   Student Allocations:');
        Object.entries(account.students).forEach(([studentId, studentData]) => {
          console.log(`      • ${studentData.studentName}: $${studentData.allocation}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test Complete!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testFamily();
