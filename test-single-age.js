/**
 * Test a single age scenario by updating birthday and triggering recalculation
 * Usage: node test-single-age.js <birthday>
 * Example: node test-single-age.js 2020-03-15
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
const studentId = '1759671908885';
const schoolYear = '25/26';
const schoolYearKey = '25_26';

async function testSingleAge(birthday) {
  console.log('🧪 Testing Single Age Scenario\n');
  console.log('='.repeat(80));
  console.log(`Birthday: ${birthday}`);
  console.log('='.repeat(80));

  try {
    // Step 1: Update birthday
    console.log('\n📝 Step 1: Updating student birthday...');
    const studentRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/birthday`);
    await studentRef.set(birthday);
    console.log(`   ✅ Birthday updated to: ${birthday}`);

    // Step 2: Trigger recalculation
    console.log('\n🔄 Step 2: Triggering recalculation...');
    const recalcRef = db.ref(`reimbursementRecalculations/${schoolYearKey}/${familyId}/trigger`);
    await recalcRef.set(true);
    console.log('   ✅ Trigger set - waiting 8 seconds for Cloud Function...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Step 3: Check eligibility
    console.log('\n📊 Step 3: Checking calculated eligibility...');
    const eligibilityRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/FUNDING_ELIGIBILITY/${schoolYearKey}`);
    const snapshot = await eligibilityRef.once('value');
    const eligibility = snapshot.val();

    if (!eligibility) {
      console.log('   ❌ ERROR: No eligibility data found');
      console.log('   💡 Cloud Function may not have completed yet. Try waiting longer.');
      return;
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTS:');
    console.log('='.repeat(80));
    console.log(`Eligible: ${eligibility.fundingEligible ? '✅ YES' : '❌ NO'}`);
    console.log(`Category: ${eligibility.ageCategory}`);
    console.log(`Full Amount: $${eligibility.fundingAmount}`);
    console.log(`Current Allocation: $${eligibility.currentAllocation}`);
    console.log(`Remaining Allocation: $${eligibility.remainingAllocation}`);
    console.log(`Registration Phase: ${eligibility.registrationPhase}`);

    if (eligibility.proratedReason) {
      console.log(`Proration: ${eligibility.proratedReason}`);
    }

    if (eligibility.upgradeEligibleAfter) {
      console.log(`Upgrade After: ${eligibility.upgradeEligibleAfter}`);
    }

    if (eligibility.eligibilityMessage) {
      console.log(`Message: ${eligibility.eligibilityMessage}`);
    }

    if (eligibility.calculatedAt) {
      const calcDate = new Date(eligibility.calculatedAt);
      console.log(`\nCalculated: ${calcDate.toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
    }

    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Get birthday from command line argument
const birthday = process.argv[2];

if (!birthday) {
  console.log('Usage: node test-single-age.js <birthday>');
  console.log('Example: node test-single-age.js 2020-03-15');
  process.exit(1);
}

testSingleAge(birthday);
