/**
 * Test proration for specific family
 * Run with: node test-family-proration.js
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

async function inspectFamily() {
  console.log('🔍 Inspecting Family Data\n');
  console.log('='.repeat(80));

  try {
    // Get family data
    const familyRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}`);
    const snapshot = await familyRef.once('value');
    const familyData = snapshot.val();

    if (!familyData) {
      console.log('❌ Family not found!');
      return;
    }

    console.log('\n📋 Family Information:');

    // Handle guardians as object or array
    let primaryGuardian;
    if (Array.isArray(familyData.guardians)) {
      primaryGuardian = familyData.guardians.find(g => g.guardianType === 'primary_guardian') || familyData.guardians[0];
    } else if (familyData.guardians) {
      // guardians is an object
      const guardiansList = Object.values(familyData.guardians);
      primaryGuardian = guardiansList.find(g => g.guardianType === 'primary_guardian') || guardiansList[0];
    }

    console.log(`   Name: ${primaryGuardian?.firstName} ${primaryGuardian?.lastName}`);
    console.log(`   Email: ${primaryGuardian?.email}`);

    console.log('\n👨‍👩‍👧‍👦 Students:');

    // Handle students as object or array
    let studentsList = [];
    if (Array.isArray(familyData.students)) {
      studentsList = familyData.students;
    } else if (familyData.students) {
      studentsList = Object.values(familyData.students);
    }

    if (studentsList.length > 0) {
      studentsList.forEach((student, idx) => {
        console.log(`   ${idx + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`      ID: ${student.id}`);
        console.log(`      Birthday: ${student.birthday}`);
      });
    } else {
      console.log('   No students found');
    }

    console.log('\n📝 Notification Forms (25/26):');
    const forms = familyData.NOTIFICATION_FORMS?.[schoolYearKey];
    if (forms) {
      Object.entries(forms).forEach(([studentId, form]) => {
        const student = studentsList.find(s => s.id === studentId);
        console.log(`   ${student?.firstName || 'Unknown'}: ${form.submissionStatus || 'draft'}`);
      });
    } else {
      console.log('   No notification forms found for 25/26');
    }

    console.log('\n🎓 PASI Registrations (25/26):');
    const pasi = familyData.PASI_REGISTRATIONS?.[schoolYearKey];
    if (pasi) {
      Object.entries(pasi).forEach(([studentId, pasiData]) => {
        const student = studentsList.find(s => s.id === studentId);
        console.log(`   ${student?.firstName || 'Unknown'}:`);
        console.log(`      Status: ${pasiData.status || 'unknown'}`);
        if (pasiData.registeredAt) {
          const date = new Date(pasiData.registeredAt);
          console.log(`      Registered: ${date.toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
        } else {
          console.log(`      Registered: ❌ MISSING - This will cause $0 allocation!`);
        }
      });
    } else {
      console.log('   No PASI registrations found for 25/26');
    }

    console.log('\n💰 Reimbursement Accounts (25/26):');
    const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);
    const accountSnapshot = await accountRef.once('value');
    const account = accountSnapshot.val();

    if (account) {
      console.log(`   Total Allocation: $${account.summary_totalAllocation || 0}`);
      console.log(`   Total Spent: $${account.summary_totalSpent || 0}`);
      console.log(`   Total Remaining: $${account.summary_totalRemaining || 0}`);
      console.log(`\n   Students:`);
      if (account.students) {
        Object.entries(account.students).forEach(([studentId, studentData]) => {
          console.log(`\n      ${studentData.studentName}:`);
          console.log(`         Allocation: $${studentData.allocation}`);
          console.log(`         Remaining Allocation: $${studentData.remainingAllocation || 0}`);
          console.log(`         Registration Phase: ${studentData.registrationPhase || 'N/A'}`);
          console.log(`         Upgrade Eligible After: ${studentData.upgradeEligibleAfter || 'N/A'}`);
          if (studentData.proratedReason) {
            console.log(`         Reason: ${studentData.proratedReason}`);
          }
        });
      }
    } else {
      console.log('   No reimbursement account found for 25/26');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

inspectFamily();
