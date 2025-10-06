/**
 * Test script for mid-year proration policy (25/26 school year only)
 * Run with: node test-proration-policy.js
 */

const {
  determineFundingEligibility,
  calculateProratedAllocation,
  determineRegistrationPhase,
  FUNDING_RATES,
  PRORATION_POLICY_25_26
} = require('./functions-triggers/fundingEligibilityUtils');

console.log('🧪 Testing Mid-Year Proration Policy (25/26)\n');
console.log('='.repeat(80));
console.log('\n📅 Policy Details:');
console.log(`   School Year: ${PRORATION_POLICY_25_26.schoolYear}`);
console.log(`   Mid-term Period: Oct 6, 2025 - Jan 31, 2026`);
console.log(`   Upgrade Eligible: ${PRORATION_POLICY_25_26.upgradeEligibleDate}`);
console.log('\n' + '='.repeat(80));

const testCases = [
  // ===== KINDERGARTEN STUDENTS ($450.50) =====
  {
    name: 'Kindergarten - Registered Early (Sept 1, 2025)',
    birthday: '2020-12-01', // Will be 4y 9m on Sept 1, 2025
    registeredAt: new Date('2025-09-01T08:00:00-06:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'early',
    expectedCurrent: 450.50,
    expectedRemaining: 0,
    expectedTotal: 450.50
  },
  {
    name: 'Kindergarten - Registered Mid-term (Oct 15, 2025)',
    birthday: '2020-12-01',
    registeredAt: new Date('2025-10-15T10:00:00-06:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'mid_term',
    expectedCurrent: 225.25,
    expectedRemaining: 225.25,
    expectedTotal: 450.50
  },
  {
    name: 'Kindergarten - Registered Late (Feb 10, 2026)',
    birthday: '2020-12-01',
    registeredAt: new Date('2026-02-10T09:00:00-07:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'late',
    expectedCurrent: 450.50,
    expectedRemaining: 0,
    expectedTotal: 450.50
  },
  {
    name: 'Kindergarten - Registered on Oct 6 (boundary)',
    birthday: '2020-12-01',
    registeredAt: new Date('2025-10-06T00:00:00-06:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'mid_term',
    expectedCurrent: 225.25,
    expectedRemaining: 225.25,
    expectedTotal: 450.50
  },
  {
    name: 'Kindergarten - Registered on Jan 31 (boundary)',
    birthday: '2020-12-01',
    registeredAt: new Date('2026-01-31T23:59:59-07:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'mid_term',
    expectedCurrent: 225.25,
    expectedRemaining: 225.25,
    expectedTotal: 450.50
  },

  // ===== GRADES 1-12 STUDENTS ($901) =====
  {
    name: 'Grade 5 - Registered Early (Aug 20, 2025)',
    birthday: '2015-03-20', // Will be 10y 5m on Sept 1, 2025
    registeredAt: new Date('2025-08-20T12:00:00-06:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'early',
    expectedCurrent: 901,
    expectedRemaining: 0,
    expectedTotal: 901
  },
  {
    name: 'Grade 5 - Registered Mid-term (Nov 20, 2025)',
    birthday: '2015-03-20',
    registeredAt: new Date('2025-11-20T14:00:00-07:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'mid_term',
    expectedCurrent: 450.50,
    expectedRemaining: 450.50,
    expectedTotal: 901
  },
  {
    name: 'Grade 5 - Registered Late (March 1, 2026)',
    birthday: '2015-03-20',
    registeredAt: new Date('2026-03-01T10:00:00-07:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'late',
    expectedCurrent: 901,
    expectedRemaining: 0,
    expectedTotal: 901
  },
  {
    name: 'Grade 12 - Registered Mid-term (Dec 15, 2025)',
    birthday: '2008-04-10', // Will be 17y 4m on Sept 1, 2025
    registeredAt: new Date('2025-12-15T11:00:00-07:00').getTime(),
    schoolYear: '25/26',
    expectedPhase: 'mid_term',
    expectedCurrent: 450.50,
    expectedRemaining: 450.50,
    expectedTotal: 901
  },

  // ===== POLICY NOT APPLICABLE =====
  {
    name: 'Grade 3 - 26/27 School Year (not applicable)',
    birthday: '2016-05-15',
    registeredAt: new Date('2026-10-10T09:00:00-06:00').getTime(),
    schoolYear: '26/27',
    expectedPhase: 'not_applicable',
    expectedCurrent: 901,
    expectedRemaining: 0,
    expectedTotal: 901
  },
  {
    name: 'Kindergarten - 24/25 School Year (not applicable)',
    birthday: '2019-11-20',
    registeredAt: new Date('2024-09-15T08:00:00-06:00').getTime(),
    schoolYear: '24/25',
    expectedPhase: 'not_applicable',
    expectedCurrent: 450.50,
    expectedRemaining: 0,
    expectedTotal: 450.50
  },

  // ===== ERROR CASES =====
  {
    name: 'Grade 2 - Missing registeredAt',
    birthday: '2017-06-10',
    registeredAt: null,
    schoolYear: '25/26',
    expectedPhase: 'not_applicable',
    expectedCurrent: 901,
    expectedRemaining: 0,
    expectedTotal: 901
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`\n\nTest ${index + 1}: ${test.name}`);
  console.log('-'.repeat(80));
  console.log(`Birthday: ${test.birthday}`);
  console.log(`School Year: ${test.schoolYear}`);
  if (test.registeredAt) {
    console.log(`Registered: ${new Date(test.registeredAt).toLocaleString('en-US', { timeZone: 'America/Edmonton' })}`);
  } else {
    console.log(`Registered: null (missing)`);
  }

  // Step 1: Check funding eligibility
  const eligibility = determineFundingEligibility(test.birthday, test.schoolYear);
  console.log(`\nEligibility:`);
  console.log(`  Age Category: ${eligibility.ageCategory}`);
  console.log(`  Full Amount: $${eligibility.fundingAmount}`);

  if (!eligibility.fundingEligible || eligibility.fundingAmount === 0) {
    console.log(`\n⏭️ SKIPPED - Student not eligible for funding`);
    return;
  }

  // Step 2: Check registration phase
  const phase = determineRegistrationPhase(test.registeredAt, test.schoolYear);
  console.log(`\nRegistration Phase:`);
  console.log(`  Phase: ${phase}`);

  // Step 3: Calculate proration
  const allocation = calculateProratedAllocation(
    eligibility.fundingAmount,
    test.registeredAt,
    test.schoolYear
  );

  console.log(`\nProration Result:`);
  console.log(`  Full Eligible Amount: $${allocation.fullAmount}`);
  console.log(`  Current Allocation: $${allocation.currentAllocation}`);
  console.log(`  Remaining Allocation: $${allocation.remainingAllocation}`);
  console.log(`  Registration Phase: ${allocation.registrationPhase}`);
  console.log(`  Upgrade Eligible After: ${allocation.upgradeEligibleAfter || 'N/A'}`);
  if (allocation.proratedReason) {
    console.log(`  Reason: ${allocation.proratedReason}`);
  }

  // Validation
  const phaseMatch = allocation.registrationPhase === test.expectedPhase;
  const currentMatch = allocation.currentAllocation === test.expectedCurrent;
  const remainingMatch = allocation.remainingAllocation === test.expectedRemaining;
  const totalMatch = allocation.fullAmount === test.expectedTotal;

  console.log(`\nExpected:`);
  console.log(`  Phase: ${test.expectedPhase} ${phaseMatch ? '✅' : '❌'}`);
  console.log(`  Current: $${test.expectedCurrent} ${currentMatch ? '✅' : '❌'}`);
  console.log(`  Remaining: $${test.expectedRemaining} ${remainingMatch ? '✅' : '❌'}`);
  console.log(`  Total: $${test.expectedTotal} ${totalMatch ? '✅' : '❌'}`);

  if (phaseMatch && currentMatch && remainingMatch && totalMatch) {
    console.log(`\n✅ PASSED`);
    passed++;
  } else {
    console.log(`\n❌ FAILED`);
    failed++;
  }
});

console.log('\n\n' + '='.repeat(80));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! Mid-year proration policy is working correctly.\n');
} else {
  console.log('⚠️  Some tests failed. Please review the logic.\n');
  process.exit(1);
}
