/**
 * Debug a single family to see why they're getting $0
 */

const admin = require('firebase-admin');
const { determineFundingEligibility, calculateProratedAllocation } = require('./functions-triggers/fundingEligibilityUtils');

// Initialize Firebase Admin
const serviceAccount = require('./rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
});

const db = admin.database();
const familyId = 'ac067f51-8eec-4b35-8c27-4e05bd7f9b19'; // Samantha Newhook
const schoolYear = '25/26';
const schoolYearKey = '25_26';

async function debugFamily() {
  console.log('🔍 DEBUG: Single Family Analysis\n');
  console.log('='.repeat(80));

  try {
    const familyRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}`);
    const familySnapshot = await familyRef.once('value');
    const familyData = familySnapshot.val();

    console.log('📋 Step 1: Students Data Structure');
    console.log('   Type:', Array.isArray(familyData.students) ? 'Array' : 'Object');
    console.log('   Keys:', Object.keys(familyData.students || {}));

    let studentsList = [];
    if (Array.isArray(familyData.students)) {
      studentsList = familyData.students;
    } else if (familyData.students) {
      studentsList = Object.values(familyData.students);
    }

    console.log('   Student List Length:', studentsList.length);
    studentsList.forEach(s => {
      console.log(`   - ID: ${s.id}, Name: ${s.firstName} ${s.lastName}, Birthday: ${s.birthday}`);
    });

    console.log('\n📋 Step 2: Notification Forms');
    const forms = familyData.NOTIFICATION_FORMS?.[schoolYearKey] || {};
    console.log('   Form Student IDs:', Object.keys(forms));

    console.log('\n📋 Step 3: PASI Registrations');
    const pasiRegistrations = familyData.PASI_REGISTRATIONS?.[schoolYearKey] || {};
    console.log('   PASI Student IDs:', Object.keys(pasiRegistrations));
    Object.entries(pasiRegistrations).forEach(([sid, data]) => {
      const date = new Date(data.registeredAt);
      console.log(`   - ${sid}: ${date.toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
    });

    console.log('\n📋 Step 4: Processing Each Student');
    for (const studentId of Object.keys(forms)) {
      console.log(`\n   Student ID: ${studentId}`);

      const student = studentsList.find(s => s.id === studentId);
      console.log('   Found in students list?', !!student);

      if (!student) {
        console.log('   ❌ ERROR: Student not found in students list!');
        continue;
      }

      console.log(`   Name: ${student.firstName} ${student.lastName}`);
      console.log(`   Birthday: ${student.birthday}`);

      if (!student.birthday) {
        console.log('   ❌ ERROR: No birthday!');
        continue;
      }

      // Calculate eligibility
      const eligibility = determineFundingEligibility(student.birthday, schoolYear);
      console.log(`   Eligibility:`);
      console.log(`      - Eligible: ${eligibility.fundingEligible}`);
      console.log(`      - Category: ${eligibility.ageCategory}`);
      console.log(`      - Amount: $${eligibility.fundingAmount}`);

      // Get PASI registration
      const pasiReg = pasiRegistrations[studentId];
      console.log(`   PASI Registration:`);
      console.log(`      - Has PASI data: ${!!pasiReg}`);

      if (pasiReg) {
        const registeredAt = pasiReg.registeredAt;
        console.log(`      - registeredAt: ${registeredAt}`);
        console.log(`      - Date: ${new Date(registeredAt).toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);

        if (eligibility.fundingEligible && registeredAt) {
          const allocationDetails = calculateProratedAllocation(
            eligibility.fundingAmount,
            registeredAt,
            schoolYear
          );

          console.log(`   Allocation Calculation:`);
          console.log(`      - Registration Phase: ${allocationDetails.registrationPhase}`);
          console.log(`      - Full Amount: $${allocationDetails.fullAmount}`);
          console.log(`      - Current Allocation: $${allocationDetails.currentAllocation}`);
          console.log(`      - Remaining: $${allocationDetails.remainingAllocation}`);
        } else {
          console.log(`   ⚠️  No allocation: eligible=${eligibility.fundingEligible}, registeredAt=${!!registeredAt}`);
        }
      } else {
        console.log(`      ❌ No PASI registration found!`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugFamily();
