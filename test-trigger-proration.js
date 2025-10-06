/**
 * Test triggering proration calculation for a family
 * This will add registeredAt if missing and trigger recalculation
 * Run with: node test-trigger-proration.js
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

async function setupTestScenario() {
  console.log('🧪 Setting Up Test Scenario for Proration\n');
  console.log('='.repeat(80));

  try {
    // Get family data
    const familyRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}`);
    const snapshot = await familyRef.once('value');
    const familyData = snapshot.val();

    if (!familyData) {
      console.log('❌ Family not found');
      return;
    }

    // Handle students as object or array
    let studentsList = [];
    if (Array.isArray(familyData.students)) {
      studentsList = familyData.students;
    } else if (familyData.students) {
      studentsList = Object.values(familyData.students);
    }

    if (studentsList.length === 0) {
      console.log('❌ No students found in family');
      return;
    }

    const student = studentsList[0]; // Use first student
    console.log(`\n📋 Testing with student: ${student.firstName} ${student.lastName}`);
    console.log(`   Student ID: ${student.id}`);
    console.log(`   Birthday: ${student.birthday}`);

    // Check if PASI registration exists
    const pasiRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/PASI_REGISTRATIONS/${schoolYearKey}/${student.id}`);
    const pasiSnapshot = await pasiRef.once('value');
    let pasiData = pasiSnapshot.val();

    console.log('\n🎓 PASI Registration Status:');
    if (!pasiData) {
      console.log('   ❌ No PASI registration found - creating one...');

      // Create PASI registration with mid-term date (Nov 15, 2025)
      const midTermDate = new Date('2025-11-15T10:00:00-07:00').getTime();
      pasiData = {
        status: 'completed',
        registeredAt: midTermDate,
        createdForTesting: true
      };

      await pasiRef.set(pasiData);
      console.log(`   ✅ Created PASI registration with mid-term date: ${new Date(midTermDate).toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
    } else if (!pasiData.registeredAt) {
      console.log('   ⚠️ PASI registration exists but missing registeredAt');

      // Add registeredAt with mid-term date
      const midTermDate = new Date('2025-11-15T10:00:00-07:00').getTime();
      await pasiRef.update({ registeredAt: midTermDate });
      console.log(`   ✅ Added registeredAt: ${new Date(midTermDate).toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
    } else {
      const regDate = new Date(pasiData.registeredAt);
      console.log(`   ✅ Existing registeredAt: ${regDate.toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
    }

    // Check if notification form exists
    const formRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYearKey}/${student.id}`);
    const formSnapshot = await formRef.once('value');
    let formData = formSnapshot.val();

    console.log('\n📝 Notification Form Status:');
    if (!formData) {
      console.log('   ❌ No notification form found');
      console.log('   💡 You need to submit a notification form for this student to trigger calculation');
      console.log('   💡 OR manually trigger using the recalc toggle (see below)');
    } else if (formData.submissionStatus !== 'submitted') {
      console.log(`   ⚠️ Form exists but not submitted (status: ${formData.submissionStatus})`);
      console.log('   💡 Submit the form to trigger automatic calculation');
    } else {
      console.log('   ✅ Form is submitted - should trigger automatic calculation');
    }

    console.log('\n🔄 Triggering Manual Recalculation...');

    // Write to recalculation trigger path
    const recalcRef = db.ref(`reimbursementRecalculations/${schoolYearKey}/${familyId}/trigger`);
    await recalcRef.set(true);

    console.log('   ✅ Trigger set - Cloud Function should run momentarily');
    console.log('   ⏳ Wait 5-10 seconds, then run test-family-proration.js to see results');

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Next Steps:');
    console.log('   1. Wait 5-10 seconds for Cloud Function to complete');
    console.log('   2. Run: node test-family-proration.js');
    console.log('   3. Check the reimbursement account for proration fields');
    console.log('\n💡 Expected Results (if registered mid-term):');
    console.log('   - Kindergarten: allocation = $225.25, remainingAllocation = $225.25');
    console.log('   - Grades 1-12: allocation = $450.50, remainingAllocation = $450.50');
    console.log('   - registrationPhase = "mid_term"');
    console.log('   - upgradeEligibleAfter = "2026-02-01"');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

setupTestScenario();
