/**
 * Test script for funding eligibility calculations
 * Run with: node test-funding-eligibility.js
 */

const { determineFundingEligibility, FUNDING_RATES } = require('./functions-triggers/fundingEligibilityUtils');

console.log('🧪 Testing Funding Eligibility Calculations\n');
console.log('='.repeat(80));

// Test cases for 25/26 school year
const schoolYear = '25/26';

const testCases = [
  {
    name: 'Kindergarten Student (4y 8m on Sept 1)',
    birthday: '2020-12-01', // Will be 4 years 9 months on Sept 1, 2025
    expectedCategory: 'kindergarten',
    expectedAmount: 450.50
  },
  {
    name: 'Kindergarten Student (exactly 4y 8m)',
    birthday: '2021-01-01', // Will be 4 years 8 months on Sept 1, 2025
    expectedCategory: 'kindergarten',
    expectedAmount: 450.50
  },
  {
    name: 'Kindergarten Student (6 years old)',
    birthday: '2019-08-15', // Will be 6 years on Sept 1, 2025
    expectedCategory: 'kindergarten',
    expectedAmount: 450.50
  },
  {
    name: 'Grade 1 Student (7 years old)',
    birthday: '2018-06-15', // Will be 7 years old on Sept 1, 2025
    expectedCategory: 'grades_1_12',
    expectedAmount: 901
  },
  {
    name: 'Grade 5 Student (10 years old)',
    birthday: '2015-03-20', // Will be 10 years old on Sept 1, 2025
    expectedCategory: 'grades_1_12',
    expectedAmount: 901
  },
  {
    name: 'Grade 12 Student (17 years old)',
    birthday: '2008-04-10', // Will be 17 years old on Sept 1, 2025
    expectedCategory: 'grades_1_12',
    expectedAmount: 901
  },
  {
    name: 'Too Young (3 years old)',
    birthday: '2022-05-01', // Will be 3 years old on Sept 1, 2025
    expectedCategory: 'too_young',
    expectedAmount: 0
  },
  {
    name: 'Too Young (4y 5m - below 4y 8m minimum)',
    birthday: '2021-04-01', // Will be 4 years 5 months on Sept 1, 2025
    expectedCategory: 'too_young',
    expectedAmount: 0
  },
  {
    name: 'Too Old (20 years old)',
    birthday: '2005-01-01', // Will be 20 years old on Sept 1, 2025
    expectedCategory: 'too_old',
    expectedAmount: 0
  },
  {
    name: 'Borderline Grade 1 (just turned 7)',
    birthday: '2018-09-01', // Exactly 7 years on Sept 1, 2025
    expectedCategory: 'grades_1_12',
    expectedAmount: 901
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.name}`);
  console.log('-'.repeat(80));
  console.log(`Birthday: ${test.birthday}`);
  console.log(`School Year: ${schoolYear}`);

  const result = determineFundingEligibility(test.birthday, schoolYear);

  console.log(`\nResult:`);
  console.log(`  Age Category: ${result.ageCategory}`);
  console.log(`  Funding Eligible: ${result.fundingEligible}`);
  console.log(`  Funding Amount: $${result.fundingAmount}`);
  if (result.message) {
    console.log(`  Message: ${result.message}`);
  }
  if (result.ageDetails) {
    console.log(`  Age on Sept 1: ${result.ageDetails.ageOnSept1.years}y ${result.ageDetails.ageOnSept1.months}m`);
    console.log(`  Age on Dec 31: ${result.ageDetails.ageOnDec31.years}y ${result.ageDetails.ageOnDec31.months}m`);
  }

  // Validation
  const categoryMatch = result.ageCategory === test.expectedCategory;
  const amountMatch = result.fundingAmount === test.expectedAmount;

  console.log(`\nExpected:`);
  console.log(`  Age Category: ${test.expectedCategory} ${categoryMatch ? '✅' : '❌'}`);
  console.log(`  Funding Amount: $${test.expectedAmount} ${amountMatch ? '✅' : '❌'}`);

  if (categoryMatch && amountMatch) {
    console.log(`\n✅ PASSED`);
    passed++;
  } else {
    console.log(`\n❌ FAILED`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! Funding eligibility is working correctly.\n');
} else {
  console.log('⚠️  Some tests failed. Please review the logic.\n');
  process.exit(1);
}
