# Testing Funding Eligibility Scenarios

## How to Test

### Step 1: Update Student Birthday
**Path:** `/homeEducationFamilies/familyInformation/{familyId}/students/{studentId}/birthday`

### Step 2: Trigger Recalculation
**Option A - Manual Trigger (Recommended):**
```
Path: /reimbursementRecalculations/25_26/{familyId}/trigger
Value: true
```

**Option B - Update Notification Form:**
```
Path: /homeEducationFamilies/familyInformation/{familyId}/NOTIFICATION_FORMS/25_26/{studentId}/lastUpdated
Value: Current timestamp (e.g., Date.now())
```

### Step 3: View Results
- Open Dashboard in development mode (localhost)
- Look for the student card
- Check the "DEV MODE ONLY - Funding Eligibility" yellow box
- Compare "Backend Calculated" vs "Frontend Calculation"

---

## Test Scenarios for 25/26 School Year

### Reference Dates for 25/26:
- **Sept 1, 2025**: Age reference date (most eligibility rules)
- **Dec 31, 2025**: Kindergarten cutoff (must turn 5 by this date)

---

## Scenario 1: Kindergarten Eligible (Half Funding with Proration)

### Test Case A: 5 years old on Sept 1
**Update birthday to:** `2020-03-15`
```json
{
  "birthday": "2020-03-15"
}
```

**Expected Result:**
- ✅ Eligible: YES
- Category: kindergarten
- Full Amount: $450.50
- Current Allocation: $225.25 (if registered mid-term)
- Remaining Allocation: $225.25 (if registered mid-term)
- Age on Sept 1: 5 years, 5 months

### Test Case B: Just turned 5 before Sept 1
**Update birthday to:** `2020-08-15`
```json
{
  "birthday": "2020-08-15"
}
```

**Expected Result:**
- ✅ Eligible: YES
- Category: kindergarten
- Full Amount: $450.50
- Age on Sept 1: 5 years, 0 months

### Test Case C: Will turn 5 by Dec 31 (4 years 8+ months)
**Update birthday to:** `2020-12-20`
```json
{
  "birthday": "2020-12-20"
}
```

**Expected Result:**
- ✅ Eligible: YES (just barely)
- Category: kindergarten
- Full Amount: $450.50
- Age on Sept 1: 4 years, 8 months

---

## Scenario 2: Grades 1-12 Eligible (Full Funding with Proration)

### Test Case A: Grade 1 age (6 years old)
**Update birthday to:** `2018-06-15`
```json
{
  "birthday": "2018-06-15"
}
```

**Expected Result:**
- ✅ Eligible: YES
- Category: grades_1_12
- Full Amount: $901
- Current Allocation: $450.50 (if registered mid-term)
- Remaining Allocation: $450.50 (if registered mid-term)
- Age on Sept 1: 7 years

### Test Case B: Grade 5 age (10 years old)
**Update birthday to:** `2015-03-20`
```json
{
  "birthday": "2015-03-20"
}
```

**Expected Result:**
- ✅ Eligible: YES
- Category: grades_1_12
- Full Amount: $901
- Age on Sept 1: 10 years

### Test Case C: Grade 12 age (17 years old)
**Update birthday to:** `2008-02-10`
```json
{
  "birthday": "2008-02-10"
}
```

**Expected Result:**
- ✅ Eligible: YES
- Category: grades_1_12
- Full Amount: $901
- Age on Sept 1: 17 years

### Test Case D: 19 years old (last eligible year)
**Update birthday to:** `2005-09-15`
```json
{
  "birthday": "2005-09-15"
}
```

**Expected Result:**
- ✅ Eligible: YES
- Category: grades_1_12
- Full Amount: $901
- Age on Sept 1: 19 years, 11 months

---

## Scenario 3: Too Young for Funding

### Test Case A: Only 4 years old, won't turn 5 by Dec 31
**Update birthday to:** `2021-02-15`
```json
{
  "birthday": "2021-02-15"
}
```

**Expected Result:**
- ❌ Eligible: NO
- Category: too_young
- Full Amount: $0
- Current Allocation: $0
- Message: "This student is too young for funding. Kindergarten students must turn 5 by December 31, 2025."

### Test Case B: 4 years old but less than 4y8m on Sept 1
**Update birthday to:** `2021-06-01`
```json
{
  "birthday": "2021-06-01"
}
```

**Expected Result:**
- ❌ Eligible: NO
- Category: too_young
- Full Amount: $0
- Age on Sept 1: 4 years, 3 months
- Message: "This student must be at least 4 years 8 months old by September 1, 2025..."

---

## Scenario 4: Too Old for Funding

### Test Case A: Just turned 20 on Sept 1
**Update birthday to:** `2005-09-01`
```json
{
  "birthday": "2005-09-01"
}
```

**Expected Result:**
- ❌ Eligible: NO
- Category: too_old
- Full Amount: $0
- Current Allocation: $0
- Message: "This student is too old for funding (20 or older as of September 1, 2025)."

### Test Case B: 21 years old
**Update birthday to:** `2004-03-15`
```json
{
  "birthday": "2004-03-15"
}
```

**Expected Result:**
- ❌ Eligible: NO
- Category: too_old
- Full Amount: $0

---

## Scenario 5: Testing Proration Registration Phases

To test different proration phases, update the PASI registration date:

**Path:** `/homeEducationFamilies/familyInformation/{familyId}/PASI_REGISTRATIONS/25_26/{studentId}/registeredAt`

### Phase A: Early Registration (Full Funding Immediately)
**Update registeredAt to:** `1725177600000` (Sept 1, 2025 00:00:00 MDT)
```json
{
  "registeredAt": 1725177600000
}
```

**Expected Result:**
- Registration Phase: early
- Current Allocation: $901 (full amount)
- Remaining Allocation: $0
- Proration Reason: "Registered before Oct 6, 2025 - full funding immediately"

### Phase B: Mid-Term Registration (Half Now, Half Later)
**Update registeredAt to:** `1731700800000` (Nov 15, 2025 00:00:00 MST)
```json
{
  "registeredAt": 1731700800000
}
```

**Expected Result:**
- Registration Phase: mid_term
- Current Allocation: $450.50 (half)
- Remaining Allocation: $450.50 (locked)
- Upgrade After: 2026-02-01
- Proration Reason: "Registered during mid-term period (Oct 6, 2025 - Jan 31, 2026)..."

### Phase C: Late Registration (Full Funding Immediately)
**Update registeredAt to:** `1739491200000` (Feb 14, 2026 00:00:00 MST)
```json
{
  "registeredAt": 1739491200000
}
```

**Expected Result:**
- Registration Phase: late
- Current Allocation: $901 (full amount)
- Remaining Allocation: $0
- Proration Reason: "Registered after Jan 31, 2026 - full funding immediately"

---

## Quick Reference: Birthday Ranges for 25/26

| Category | Birthday Range | Age on Sept 1, 2025 | Funding |
|----------|---------------|---------------------|---------|
| Too Young | After Dec 31, 2020 | < 5 years | $0 |
| Kindergarten | Jan 1, 2020 - Dec 31, 2020 | 4y8m - 5y11m | $450.50 |
| Grades 1-12 | Sept 2, 2005 - Aug 31, 2019 | 6 - 19 years | $901 |
| Too Old | Before Sept 1, 2005 | ≥ 20 years | $0 |

---

## Testing Workflow

### Using Firebase Console:
1. Go to Firebase Console → Realtime Database
2. Navigate to the student path
3. Click "birthday" field
4. Edit the value
5. Navigate to `/reimbursementRecalculations/25_26/{familyId}/trigger`
6. Set value to `true`
7. Wait 5-10 seconds
8. Refresh Dashboard
9. Check dev mode display

### Using Test Script:
We can also create a script that automates these tests!

```javascript
// Create test-various-ages.js
const scenarios = [
  { name: 'Kindergarten', birthday: '2020-03-15' },
  { name: 'Grade 1', birthday: '2018-06-15' },
  { name: 'Grade 5', birthday: '2015-03-20' },
  { name: 'Too Young', birthday: '2021-02-15' },
  { name: 'Too Old', birthday: '2004-03-15' }
];

// Run each scenario
for (const scenario of scenarios) {
  await updateStudentBirthday(scenario.birthday);
  await triggerRecalculation();
  await wait(10000);
  const result = await checkEligibility();
  console.log(`${scenario.name}: ${result}`);
}
```

---

## What to Look For in Dev Mode

The dev mode display will show:

### Backend Calculated Section (Green Box):
- ✅ Should match the expected scenario
- Shows proration if mid-term registration
- Displays calculation timestamp

### Frontend Calculation Section (White Boxes):
- Should also show correct eligibility
- Helps verify backend matches frontend logic
- Useful for debugging discrepancies

### Key Indicators:
1. **Eligible vs Not Eligible**: Color-coded (green = yes, red = no)
2. **Category**: kindergarten, grades_1_12, too_young, too_old
3. **Amounts**: Full, current, and remaining allocations
4. **Proration Info**: Only shows if mid-term registration
5. **Messages**: Error or info messages explaining status
