/**
 * Test script to verify backend eligibility storage
 * Run with: node test-eligibility-storage.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
});

const db = admin.database();
const familyId = '922c2d4a-ea85-409c-ad56-f91039543a25';
const schoolYear = '25/26';
const schoolYearKey = '25_26';

async function testEligibilityStorage() {
  console.log('🧪 Testing Eligibility Storage\n');
  console.log('='.repeat(80));

  try {
    // Step 1: Trigger recalculation
    console.log('\n📋 Step 1: Triggering recalculation for family...');
    const recalcRef = db.ref(`reimbursementRecalculations/${schoolYearKey}/${familyId}/trigger`);
    await recalcRef.set(true);
    console.log('   ✅ Trigger set - waiting 10 seconds for Cloud Function...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 2: Check if eligibility was written to student object
    console.log('\n📋 Step 2: Checking student eligibility data...');
    const familyRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}`);
    const familySnapshot = await familyRef.once('value');
    const familyData = familySnapshot.val();

    if (!familyData) {
      console.log('❌ Family not found!');
      return;
    }

    // Handle students as object or array
    let studentsList = [];
    if (Array.isArray(familyData.students)) {
      studentsList = familyData.students;
    } else if (familyData.students) {
      studentsList = Object.values(familyData.students);
    }

    console.log(`\n👨‍👩‍👧‍👦 Found ${studentsList.length} students\n`);

    for (const student of studentsList) {
      console.log(`\n   Student: ${student.firstName} ${student.lastName}`);
      console.log(`   ID: ${student.id}`);
      console.log(`   Birthday: ${student.birthday}`);

      // Check eligibility data
      const eligibilityData = student.FUNDING_ELIGIBILITY?.[schoolYearKey];

      if (!eligibilityData) {
        console.log('   ❌ NO ELIGIBILITY DATA FOUND');
        console.log('   💡 Cloud Function may not have completed yet');
      } else {
        console.log('   ✅ ELIGIBILITY DATA FOUND:');
        console.log(`      Eligible: ${eligibilityData.fundingEligible ? 'YES' : 'NO'}`);
        console.log(`      Full Amount: $${eligibilityData.fundingAmount}`);
        console.log(`      Current Allocation: $${eligibilityData.currentAllocation}`);
        console.log(`      Remaining Allocation: $${eligibilityData.remainingAllocation}`);
        console.log(`      Registration Phase: ${eligibilityData.registrationPhase}`);
        console.log(`      Age Category: ${eligibilityData.ageCategory}`);

        if (eligibilityData.proratedReason) {
          console.log(`      Proration Reason: ${eligibilityData.proratedReason}`);
        }

        if (eligibilityData.upgradeEligibleAfter) {
          console.log(`      Upgrade After: ${eligibilityData.upgradeEligibleAfter}`);
        }

        if (eligibilityData.calculatedAt) {
          const calcDate = new Date(eligibilityData.calculatedAt);
          console.log(`      Calculated At: ${calcDate.toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
        }

        if (eligibilityData.eligibilityMessage) {
          console.log(`      Message: ${eligibilityData.eligibilityMessage}`);
        }
      }
    }

    // Step 3: Verify reimbursement account also has the data
    console.log('\n\n📋 Step 3: Checking reimbursement account...');
    const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);
    const accountSnapshot = await accountRef.once('value');
    const account = accountSnapshot.val();

    if (!account) {
      console.log('   ❌ No reimbursement account found');
    } else {
      console.log('   ✅ Reimbursement Account Found:');
      console.log(`      Total Allocation: $${account.summary_totalAllocation}`);
      console.log(`      Total Spent: $${account.summary_totalSpent}`);
      console.log(`      Total Remaining: $${account.summary_totalRemaining}`);

      if (account.students) {
        console.log('\n      Students in Account:');
        Object.entries(account.students).forEach(([studentId, studentData]) => {
          console.log(`\n         ${studentData.studentName}:`);
          console.log(`            Allocation: $${studentData.allocation}`);
          console.log(`            Remaining Allocation: $${studentData.remainingAllocation}`);
          console.log(`            Registration Phase: ${studentData.registrationPhase}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Test Complete!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Check that FUNDING_ELIGIBILITY data exists on student objects');
    console.log('   2. Verify frontend Dashboard reads this data correctly');
    console.log('   3. Test with students of different ages and registration dates');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testEligibilityStorage();
