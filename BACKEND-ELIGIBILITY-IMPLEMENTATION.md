# Backend-Driven Funding Eligibility Implementation

## Overview
This document describes the implementation of backend-calculated funding eligibility that is stored directly on student objects in the database.

## Architecture Change

### Before (Old System)
- ❌ Frontend calculated eligibility on-the-fly from grade
- ❌ Grade-based fallback logic (kindergarten vs grades 1-12)
- ❌ No proration support
- ❌ Inconsistent calculations across different parts of the app
- ❌ No audit trail of when eligibility was calculated

### After (New System)
- ✅ Backend calculates eligibility from birthday + school year
- ✅ Stores complete eligibility data on student object
- ✅ Proration policy fully supported
- ✅ Single source of truth - backend calculation
- ✅ Frontend just reads pre-calculated data
- ✅ Audit trail with calculation timestamp

## Database Structure

### Eligibility Data Location
```
/homeEducationFamilies/familyInformation/{familyId}/students/{studentId}/FUNDING_ELIGIBILITY/
  {schoolYearKey}/  // e.g., "25_26"
    - fundingEligible: boolean
    - fundingAmount: number (full amount student is eligible for)
    - currentAllocation: number (amount available now)
    - remainingAllocation: number (amount locked until upgrade date)
    - fullEligibleAmount: number (same as fundingAmount)
    - ageCategory: string (kindergarten, grades_1_12, too_young, too_old)
    - eligibilityMessage: string (user-friendly message or null)
    - registrationPhase: string (early, mid_term, late, not_applicable, error)
    - registrationDate: ISO date string
    - proratedReason: string (explanation of proration)
    - upgradeEligibleAfter: date string (when remaining becomes available)
    - calculatedAt: timestamp
    - calculatedBy: "cloud-function"
```

## Backend Implementation

### Cloud Functions Modified
**File:** `functions-triggers/updateReimbursementAccounts.js`

**Changes:**
1. After calculating eligibility for each student, write complete eligibility data to student object
2. Write eligibility data for both eligible and ineligible students
3. Include proration details when applicable
4. Add calculation timestamp and source

**Triggering Events:**
- Notification form submission (`onNotificationFormUpdate`)
- Manual recalculation trigger (`onReimbursementRecalcToggle`)
- Backfill operation (`backfillReimbursementAccounts`)

### Key Code Sections

#### Writing Eligible Student Data
```javascript
// Write eligibility data to student object
const studentEligibilityRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/FUNDING_ELIGIBILITY/${schoolYearKey}`);
await studentEligibilityRef.set({
  fundingEligible: true,
  fundingAmount: eligibility.fundingAmount,
  ageCategory: eligibility.ageCategory,
  eligibilityMessage: eligibility.message,

  // Proration details
  registrationPhase: allocationDetails.registrationPhase,
  registrationDate: allocationDetails.registrationDate,
  currentAllocation: allocationDetails.currentAllocation,
  remainingAllocation: allocationDetails.remainingAllocation,
  fullEligibleAmount: allocationDetails.fullAmount,
  proratedReason: allocationDetails.proratedReason,
  upgradeEligibleAfter: allocationDetails.upgradeEligibleAfter,

  // Metadata
  calculatedAt: admin.database.ServerValue.TIMESTAMP,
  calculatedBy: 'cloud-function'
});
```

#### Writing Ineligible Student Data
```javascript
// Write ineligible status to student object
const studentEligibilityRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/FUNDING_ELIGIBILITY/${schoolYearKey}`);
await studentEligibilityRef.set({
  fundingEligible: false,
  fundingAmount: 0,
  ageCategory: eligibility.ageCategory,
  eligibilityMessage: eligibility.message,
  registrationPhase: 'not_applicable',
  registrationDate: registeredAt ? new Date(registeredAt).toISOString() : null,
  currentAllocation: 0,
  remainingAllocation: 0,
  fullEligibleAmount: 0,
  proratedReason: null,
  upgradeEligibleAfter: null,
  calculatedAt: admin.database.ServerValue.TIMESTAMP,
  calculatedBy: 'cloud-function'
});
```

## Frontend Implementation

### Dashboard.js Changes

#### New Helper Function: `getStudentFundingEligibility`
```javascript
const getStudentFundingEligibility = (student, activeSchoolYear) => {
  if (!student || !activeSchoolYear) {
    return {
      fundingEligible: false,
      fundingAmount: 0,
      currentAllocation: 0,
      remainingAllocation: 0,
      registrationPhase: 'unknown',
      ageCategory: 'unknown',
      eligibilityMessage: 'Missing student or school year data'
    };
  }

  const schoolYearKey = activeSchoolYear.replace('/', '_');
  const eligibilityData = student.FUNDING_ELIGIBILITY?.[schoolYearKey];

  if (!eligibilityData) {
    return {
      fundingEligible: false,
      fundingAmount: 0,
      currentAllocation: 0,
      remainingAllocation: 0,
      registrationPhase: 'not_calculated',
      ageCategory: 'unknown',
      eligibilityMessage: 'Eligibility not yet calculated. Please submit notification form.'
    };
  }

  return {
    fundingEligible: eligibilityData.fundingEligible || false,
    fundingAmount: eligibilityData.fundingAmount || 0,
    currentAllocation: eligibilityData.currentAllocation || 0,
    remainingAllocation: eligibilityData.remainingAllocation || 0,
    fullEligibleAmount: eligibilityData.fullEligibleAmount || 0,
    registrationPhase: eligibilityData.registrationPhase || 'unknown',
    registrationDate: eligibilityData.registrationDate,
    proratedReason: eligibilityData.proratedReason,
    upgradeEligibleAfter: eligibilityData.upgradeEligibleAfter,
    ageCategory: eligibilityData.ageCategory || 'unknown',
    eligibilityMessage: eligibilityData.eligibilityMessage,
    calculatedAt: eligibilityData.calculatedAt
  };
};
```

#### Updated Budget Calculation
```javascript
// Old: Grade-based calculation
const calculateStudentBudget = (student) => {
  if (student.grade === 'K') {
    return FUNDING_RATES.KINDERGARTEN.amount;
  } else {
    return FUNDING_RATES.GRADES_1_TO_12.amount;
  }
};

// New: Read from backend-calculated data
const calculateStudentBudget = (student, activeSchoolYear) => {
  const eligibility = getStudentFundingEligibility(student, activeSchoolYear);
  return eligibility.currentAllocation || 0;
};
```

### Development Mode Display

The development mode section now displays:

1. **Backend Calculated Eligibility** (primary display)
   - Shows data from `student.FUNDING_ELIGIBILITY[schoolYearKey]`
   - Displays proration information
   - Shows calculation timestamp

2. **Frontend Calculation** (for comparison)
   - Shows frontend-calculated eligibility from timeZoneUtils.js
   - Helps verify backend calculations are correct

## Proration Integration

The backend eligibility storage fully supports the mid-year proration policy:

### For Mid-Term Registrations (Oct 6 - Jan 31, 2026)
```javascript
{
  fundingEligible: true,
  fundingAmount: 901,           // Full eligible amount
  currentAllocation: 450.50,    // Half available now
  remainingAllocation: 450.50,  // Half locked until Feb 1, 2026
  registrationPhase: "mid_term",
  proratedReason: "Registered during mid-term period (Oct 6, 2025 - Jan 31, 2026). Half funding now, remainder after Feb 1, 2026 if continuing.",
  upgradeEligibleAfter: "2026-02-01"
}
```

### For Early/Late Registrations
```javascript
{
  fundingEligible: true,
  fundingAmount: 901,
  currentAllocation: 901,       // Full amount available now
  remainingAllocation: 0,       // Nothing locked
  registrationPhase: "early",   // or "late"
  proratedReason: "Registered before Oct 6, 2025 - full funding immediately",
  upgradeEligibleAfter: null
}
```

## Testing

### Test Script: `test-eligibility-storage.js`

Run: `node test-eligibility-storage.js`

This script:
1. Triggers recalculation for a test family
2. Verifies eligibility data was written to student object
3. Shows backend-calculated data
4. Compares with reimbursement account data

### Expected Output
```
📊 Backend Calculated (25/26):
   Eligible: ✅ YES
   Category: grades_1_12
   Full Amount: $901
   Current Allocation: $450.5
   Remaining (Locked): $450.5
   Registration Phase: mid_term
   Upgrade After: 2026-02-01
   Proration Reason: Registered during mid-term period...
   Calculated: 10/6/2025, 9:47:35 AM
```

## Benefits

1. **Consistency**: Single source of truth - all parts of app use same calculation
2. **Performance**: Frontend doesn't need to recalculate - just reads pre-calculated data
3. **Auditability**: Calculation timestamp and source tracked
4. **Proration Support**: Full support for complex proration policies
5. **Multi-Year**: Stores eligibility per school year, not just current year
6. **Error Handling**: Clear messaging when data is missing or student is ineligible

## Migration Path

### Existing Students
For students who already have notification forms submitted but no eligibility data:
1. Run backfill: `backfillReimbursementAccounts({ targetSchoolYear: '25/26' })`
2. Or trigger manual recalc: Write `true` to `/reimbursementRecalculations/{schoolYear}/{familyId}/trigger`

### New Students
Eligibility is automatically calculated and stored when:
1. Notification form is submitted
2. Form status changes to 'submitted'
3. Cloud Function `onNotificationFormUpdate` runs

## Files Modified

1. **Backend:**
   - `functions-triggers/updateReimbursementAccounts.js` - Writes eligibility to student objects

2. **Frontend:**
   - `src/RTDConnect/Dashboard.js` - Reads eligibility from student objects, displays in dev mode

3. **Testing:**
   - `test-eligibility-storage.js` - Verifies backend writes and frontend reads

## Next Steps

1. ✅ Backend writes eligibility data to student objects
2. ✅ Frontend reads and displays backend data
3. ✅ Development mode shows complete eligibility info
4. ⏳ Test with different scenarios:
   - Early registration (full funding)
   - Late registration (full funding)
   - Kindergarten student (half of $450.50)
   - Too young student (ineligible)
   - Too old student (ineligible)
5. ⏳ Update StudentBudgetCard component to display proration info
6. ⏳ Add user-facing proration messaging (not just dev mode)
