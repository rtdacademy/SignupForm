/**
 * DRY RUN: Preview eligibility recalculation for all families
 * Run with: node test-dry-run-backfill.js
 *
 * This script DOES NOT modify any data - it only shows what WOULD change.
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
const schoolYear = '25/26';
const schoolYearKey = '25_26';

async function dryRunBackfill() {
  console.log('🔍 DRY RUN: Preview Eligibility Recalculation\n');
  console.log('='.repeat(80));
  console.log(`School Year: ${schoolYear}`);
  console.log('⚠️  NO DATA WILL BE MODIFIED - This is a preview only');
  console.log('='.repeat(80));

  try {
    // Get all families
    console.log('\n📋 Finding families with notification forms...');
    const familiesRef = db.ref('homeEducationFamilies/familyInformation');
    const snapshot = await familiesRef.once('value');
    const families = snapshot.val() || {};

    const totalFamilyCount = Object.keys(families).length;
    console.log(`   Found ${totalFamilyCount} total families in database`);

    const analysis = {
      totalFamilies: 0,
      withChanges: [],
      noChanges: [],
      errors: [],
      missingPasiDates: [],
      totals: {
        currentAllocation: 0,
        newAllocation: 0,
        difference: 0
      }
    };

    let processedCount = 0;
    console.log('   Processing families...');

    // Process each family
    for (const [familyId, familyData] of Object.entries(families)) {
      processedCount++;

      // Show progress every 50 families
      if (processedCount % 50 === 0) {
        console.log(`   ... ${processedCount}/${totalFamilyCount} families scanned`);
      }
      const forms = familyData.NOTIFICATION_FORMS?.[schoolYearKey];

      if (!forms || Object.keys(forms).length === 0) {
        continue; // Skip families without notification forms
      }

      analysis.totalFamilies++;

      // Get guardian info
      let guardian;
      if (Array.isArray(familyData.guardians)) {
        guardian = familyData.guardians.find(g => g.guardianType === 'primary_guardian') || familyData.guardians[0];
      } else if (familyData.guardians) {
        const guardiansList = Object.values(familyData.guardians);
        guardian = guardiansList.find(g => g.guardianType === 'primary_guardian') || guardiansList[0];
      }

      const guardianName = guardian ? `${guardian.firstName} ${guardian.lastName}` : 'Unknown';

      // Get students
      let studentsList = [];
      if (Array.isArray(familyData.students)) {
        studentsList = familyData.students;
      } else if (familyData.students) {
        studentsList = Object.values(familyData.students);
      }

      // Get existing reimbursement account
      const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);
      const accountSnapshot = await accountRef.once('value');
      const existingAccount = accountSnapshot.val();

      // Get PASI registrations for proration
      const pasiRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/PASI_REGISTRATIONS/${schoolYearKey}`);
      const pasiSnapshot = await pasiRef.once('value');
      const pasiRegistrations = pasiSnapshot.val() || {};

      // Calculate what the NEW allocation would be
      let newTotalAllocation = 0;
      const studentDetails = [];

      for (const studentId of Object.keys(forms)) {
        const student = studentsList.find(s => s.id === studentId);

        if (!student) {
          studentDetails.push({
            id: studentId,
            name: 'Unknown',
            error: 'Student not found'
          });
          continue;
        }

        if (!student.birthday) {
          studentDetails.push({
            id: studentId,
            name: `${student.firstName} ${student.lastName}`,
            error: 'No birthday'
          });
          continue;
        }

        // Calculate eligibility
        const eligibility = determineFundingEligibility(student.birthday, schoolYear);

        // Get registration date
        const pasiReg = pasiRegistrations[studentId];
        const registeredAt = pasiReg?.registeredAt;

        let allocation = 0;
        let registrationPhase = 'not_applicable';

        if (eligibility.fundingEligible && registeredAt) {
          const allocationDetails = calculateProratedAllocation(
            eligibility.fundingAmount,
            registeredAt,
            schoolYear
          );
          allocation = allocationDetails.currentAllocation;
          registrationPhase = allocationDetails.registrationPhase;
        }

        newTotalAllocation += allocation;

        // Get existing data for this student
        const existingStudentData = existingAccount?.students?.[studentId];

        studentDetails.push({
          id: studentId,
          name: `${student.firstName} ${student.lastName}`,
          birthday: student.birthday,
          category: eligibility.ageCategory,
          eligible: eligibility.fundingEligible,
          registrationPhase,
          hasRegistrationDate: !!registeredAt,
          registeredAt,
          eligibilityAmount: eligibility.fundingAmount,
          currentAllocation: existingStudentData?.allocation || 0,
          newAllocation: allocation,
          spent: existingStudentData?.spent || 0,
          changed: (existingStudentData?.allocation || 0) !== allocation
        });
      }

      const currentTotal = existingAccount?.summary_totalAllocation || 0;
      const hasChanges = currentTotal !== newTotalAllocation || !existingAccount;

      const familyInfo = {
        familyId,
        guardianName,
        studentCount: studentDetails.length,
        currentAllocation: currentTotal,
        newAllocation: newTotalAllocation,
        difference: newTotalAllocation - currentTotal,
        students: studentDetails,
        hasExistingAccount: !!existingAccount,
        hasTransactions: !!(existingAccount?.transactions)
      };

      if (hasChanges) {
        analysis.withChanges.push(familyInfo);
      } else {
        analysis.noChanges.push(familyInfo);
      }

      // Track errors
      const studentErrors = studentDetails.filter(s => s.error);
      if (studentErrors.length > 0) {
        analysis.errors.push({
          familyId,
          guardianName,
          errors: studentErrors
        });
      }

      // Update totals
      analysis.totals.currentAllocation += currentTotal;
      analysis.totals.newAllocation += newTotalAllocation;
    }

    console.log(`   ✅ Finished scanning all ${totalFamilyCount} families\n`);

    analysis.totals.difference = analysis.totals.newAllocation - analysis.totals.currentAllocation;

    // Display results
    console.log(`\n✅ Found ${analysis.totalFamilies} families with notification forms\n`);

    console.log('='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Families: ${analysis.totalFamilies}`);
    console.log(`Families with Changes: ${analysis.withChanges.length}`);
    console.log(`Families with No Changes: ${analysis.noChanges.length}`);
    console.log(`Families with Errors: ${analysis.errors.length}`);
    console.log('');
    console.log(`Current Total Allocation: $${analysis.totals.currentAllocation.toFixed(2)}`);
    console.log(`New Total Allocation: $${analysis.totals.newAllocation.toFixed(2)}`);
    console.log(`Difference: ${analysis.totals.difference >= 0 ? '+' : ''}$${analysis.totals.difference.toFixed(2)}`);

    // Show families with changes
    if (analysis.withChanges.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log(`🔄 FAMILIES WITH CHANGES (${analysis.withChanges.length})`);
      console.log('='.repeat(80));

      analysis.withChanges.forEach((family, idx) => {
        const changeSymbol = family.difference > 0 ? '📈' : family.difference < 0 ? '📉' : '➡️';
        const diffStr = family.difference >= 0 ? `+$${family.difference.toFixed(2)}` : `-$${Math.abs(family.difference).toFixed(2)}`;

        console.log(`\n${idx + 1}. ${changeSymbol} ${family.guardianName}`);
        console.log(`   Current: $${family.currentAllocation.toFixed(2)} → New: $${family.newAllocation.toFixed(2)} (${diffStr})`);
        console.log(`   ${family.hasExistingAccount ? '✅' : '🆕'} ${family.hasExistingAccount ? 'Existing account' : 'New account will be created'}`);

        if (family.hasTransactions) {
          console.log(`   💰 Has transaction history (will be preserved)`);
        }

        if (family.students.length > 0) {
          console.log(`   Students:`);
          family.students.forEach(student => {
            if (student.error) {
              console.log(`      ❌ ${student.name}: ERROR - ${student.error}`);
            } else if (student.changed) {
              console.log(`      🔄 ${student.name}: $${student.currentAllocation} → $${student.newAllocation} (${student.category}, ${student.registrationPhase})`);
            } else if (student.newAllocation === 0 && student.eligible) {
              console.log(`      ⚠️  ${student.name}: $0 - ${student.category}, eligible for $${student.eligibilityAmount} BUT missing PASI registration date`);
            } else if (student.newAllocation === 0 && !student.eligible) {
              console.log(`      ℹ️  ${student.name}: $0 - ${student.category} (not eligible)`);
            } else {
              console.log(`      ✓ ${student.name}: $${student.newAllocation} (no change)`);
            }
          });
        }
      });
    }

    // Show families with no changes
    if (analysis.noChanges.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log(`✅ FAMILIES WITH NO CHANGES (${analysis.noChanges.length})`);
      console.log('='.repeat(80));

      analysis.noChanges.forEach((family, idx) => {
        console.log(`${idx + 1}. ${family.guardianName} - $${family.currentAllocation.toFixed(2)} (${family.studentCount} students)`);
      });
    }

    // Show errors
    if (analysis.errors.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log(`⚠️  FAMILIES WITH ERRORS (${analysis.errors.length})`);
      console.log('='.repeat(80));

      analysis.errors.forEach((errorInfo, idx) => {
        console.log(`\n${idx + 1}. ${errorInfo.guardianName}`);
        errorInfo.errors.forEach(err => {
          console.log(`   ❌ ${err.name}: ${err.error}`);
        });
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('💡 NEXT STEPS');
    console.log('='.repeat(80));
    console.log('1. Review the changes above carefully');
    console.log('2. Fix any errors (missing birthdays, etc.)');
    console.log('3. If everything looks good, run: node test-backfill-all-families.js');
    console.log('');
    console.log('⚠️  Remember: Existing spent amounts and transactions will be preserved!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

dryRunBackfill();
