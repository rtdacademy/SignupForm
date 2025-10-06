/**
 * Test various student age scenarios for funding eligibility
 * Run with: node test-various-ages.js
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
const studentId = '1759671908885'; // Update this to your student ID
const schoolYear = '25/26';
const schoolYearKey = '25_26';

// Test scenarios
const scenarios = [
  {
    name: '✅ Kindergarten (5 years old)',
    birthday: '2020-03-15',
    expected: {
      eligible: true,
      category: 'kindergarten',
      fullAmount: 450.50,
      currentAllocation: 225.25 // Assuming mid-term registration
    }
  },
  {
    name: '✅ Kindergarten (4y8m - barely eligible)',
    birthday: '2020-12-20',
    expected: {
      eligible: true,
      category: 'kindergarten',
      fullAmount: 450.50,
      currentAllocation: 225.25
    }
  },
  {
    name: '✅ Grade 1 (7 years old)',
    birthday: '2018-06-15',
    expected: {
      eligible: true,
      category: 'grades_1_12',
      fullAmount: 901,
      currentAllocation: 450.50
    }
  },
  {
    name: '✅ Grade 5 (10 years old)',
    birthday: '2015-03-20',
    expected: {
      eligible: true,
      category: 'grades_1_12',
      fullAmount: 901,
      currentAllocation: 450.50
    }
  },
  {
    name: '✅ Grade 12 (17 years old)',
    birthday: '2008-02-10',
    expected: {
      eligible: true,
      category: 'grades_1_12',
      fullAmount: 901,
      currentAllocation: 450.50
    }
  },
  {
    name: '✅ Last eligible year (19 years old)',
    birthday: '2005-09-15',
    expected: {
      eligible: true,
      category: 'grades_1_12',
      fullAmount: 901,
      currentAllocation: 450.50
    }
  },
  {
    name: '❌ Too Young (4 years, won\'t turn 5)',
    birthday: '2021-02-15',
    expected: {
      eligible: false,
      category: 'too_young',
      fullAmount: 0,
      currentAllocation: 0
    }
  },
  {
    name: '❌ Too Young (4y3m)',
    birthday: '2021-06-01',
    expected: {
      eligible: false,
      category: 'too_young',
      fullAmount: 0,
      currentAllocation: 0
    }
  },
  {
    name: '❌ Too Old (20 years)',
    birthday: '2005-09-01',
    expected: {
      eligible: false,
      category: 'too_old',
      fullAmount: 0,
      currentAllocation: 0
    }
  },
  {
    name: '❌ Too Old (21 years)',
    birthday: '2004-03-15',
    expected: {
      eligible: false,
      category: 'too_old',
      fullAmount: 0,
      currentAllocation: 0
    }
  }
];

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateStudentBirthday(birthday) {
  const studentRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/birthday`);
  await studentRef.set(birthday);
  console.log(`   📝 Updated birthday to: ${birthday}`);
}

async function triggerRecalculation() {
  const recalcRef = db.ref(`reimbursementRecalculations/${schoolYearKey}/${familyId}/trigger`);
  await recalcRef.set(true);
  console.log('   🔄 Triggered recalculation...');
}

async function checkEligibility() {
  const eligibilityRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/FUNDING_ELIGIBILITY/${schoolYearKey}`);
  const snapshot = await eligibilityRef.once('value');
  return snapshot.val();
}

async function runTests() {
  console.log('🧪 Testing Various Student Age Scenarios\n');
  console.log('='.repeat(80));
  console.log(`Family ID: ${familyId}`);
  console.log(`Student ID: ${studentId}`);
  console.log(`School Year: ${schoolYear}`);
  console.log('='.repeat(80));

  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n\n📋 Test ${i + 1}/${scenarios.length}: ${scenario.name}`);
    console.log('-'.repeat(80));

    try {
      // Update birthday
      await updateStudentBirthday(scenario.birthday);

      // Trigger recalculation
      await triggerRecalculation();

      // Wait for Cloud Function to complete
      console.log('   ⏳ Waiting 8 seconds for Cloud Function...');
      await wait(8000);

      // Check result
      const eligibility = await checkEligibility();

      if (!eligibility) {
        console.log('   ❌ ERROR: No eligibility data found');
        results.failed++;
        results.errors.push({ scenario: scenario.name, error: 'No eligibility data' });
        continue;
      }

      // Display results
      console.log('\n   📊 Results:');
      console.log(`      Eligible: ${eligibility.fundingEligible ? '✅ YES' : '❌ NO'}`);
      console.log(`      Category: ${eligibility.ageCategory}`);
      console.log(`      Full Amount: $${eligibility.fundingAmount}`);
      console.log(`      Current Allocation: $${eligibility.currentAllocation}`);
      console.log(`      Remaining Allocation: $${eligibility.remainingAllocation || 0}`);
      console.log(`      Registration Phase: ${eligibility.registrationPhase}`);

      if (eligibility.proratedReason) {
        console.log(`      Proration: ${eligibility.proratedReason}`);
      }

      if (eligibility.eligibilityMessage) {
        console.log(`      Message: ${eligibility.eligibilityMessage}`);
      }

      // Verify against expected
      let passed = true;
      if (eligibility.fundingEligible !== scenario.expected.eligible) {
        console.log(`   ⚠️  MISMATCH: Expected eligible=${scenario.expected.eligible}, got ${eligibility.fundingEligible}`);
        passed = false;
      }
      if (eligibility.ageCategory !== scenario.expected.category) {
        console.log(`   ⚠️  MISMATCH: Expected category=${scenario.expected.category}, got ${eligibility.ageCategory}`);
        passed = false;
      }
      if (eligibility.fundingAmount !== scenario.expected.fullAmount) {
        console.log(`   ⚠️  MISMATCH: Expected fullAmount=${scenario.expected.fullAmount}, got ${eligibility.fundingAmount}`);
        passed = false;
      }

      if (passed) {
        console.log('\n   ✅ TEST PASSED');
        results.passed++;
      } else {
        console.log('\n   ❌ TEST FAILED - See mismatches above');
        results.failed++;
        results.errors.push({
          scenario: scenario.name,
          error: 'Mismatched values',
          expected: scenario.expected,
          actual: {
            eligible: eligibility.fundingEligible,
            category: eligibility.ageCategory,
            fullAmount: eligibility.fundingAmount,
            currentAllocation: eligibility.currentAllocation
          }
        });
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.failed++;
      results.errors.push({ scenario: scenario.name, error: error.message });
    }

    // Brief pause between tests
    await wait(1000);
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${scenarios.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err.scenario}`);
      console.log(`   Error: ${err.error}`);
      if (err.expected) {
        console.log('   Expected:', JSON.stringify(err.expected, null, 2));
        console.log('   Actual:', JSON.stringify(err.actual, null, 2));
      }
    });
  }

  console.log('\n✅ Testing complete!');
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests();
