const admin = require('firebase-admin');
const { onValueWritten } = require('firebase-functions/v2/database');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { determineFundingEligibility, calculateProratedAllocation } = require('./fundingEligibilityUtils');

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Core function to recalculate reimbursement account for a family and school year
 * @param {string} familyId - Family ID
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Object} Updated reimbursement account data
 */
async function recalculateReimbursementAccount(familyId, schoolYear) {
  const db = admin.database();
  const schoolYearKey = schoolYear.replace('/', '_');

  console.log(`🔄 Recalculating reimbursement account for family ${familyId}, ${schoolYear}`);

  // Get family data for display information
  const familyRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}`);
  const familySnapshot = await familyRef.once('value');
  const familyData = familySnapshot.val();

  if (!familyData) {
    console.log(`⚠️ No family data found for ${familyId}`);
    return null;
  }

  // Handle guardians as object or array
  let primaryGuardian;
  if (Array.isArray(familyData.guardians)) {
    primaryGuardian = familyData.guardians.find(g => g.guardianType === 'primary_guardian') || familyData.guardians[0];
  } else if (familyData.guardians) {
    const guardiansList = Object.values(familyData.guardians);
    primaryGuardian = guardiansList.find(g => g.guardianType === 'primary_guardian') || guardiansList[0];
  }

  // Get notification forms data
  const formsRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYearKey}`);
  const formsSnapshot = await formsRef.once('value');
  const forms = formsSnapshot.val() || {};

  // Get PASI registrations for registration dates (needed for proration)
  const pasiRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/PASI_REGISTRATIONS/${schoolYearKey}`);
  const pasiSnapshot = await pasiRef.once('value');
  const pasiRegistrations = pasiSnapshot.val() || {};

  // Handle students as object or array
  let studentsList = [];
  if (Array.isArray(familyData.students)) {
    studentsList = familyData.students;
  } else if (familyData.students) {
    studentsList = Object.values(familyData.students);
  }

  // Calculate student accounts and total allocation
  let totalAllocation = 0;
  const studentAccounts = {};

  // Process each student with a submitted notification form
  for (const [studentId, formData] of Object.entries(forms)) {
    // Only process submitted forms
    if (formData.submissionStatus !== 'submitted') {
      continue;
    }

    // Get student data
    const student = studentsList.find(s => s.id === studentId);
    if (!student || !student.birthday) {
      console.log(`⚠️ Skipping student ${studentId} - no birthday found`);
      continue;
    }

    // Calculate eligibility on-the-fly from birthday and school year
    const eligibility = determineFundingEligibility(student.birthday, schoolYear);

    // Get registration date from PASI registrations
    const pasiData = pasiRegistrations[studentId];
    const registeredAt = pasiData?.registeredAt;

    // Only create account if eligible for funding
    if (eligibility.fundingEligible && eligibility.fundingAmount > 0) {
      // Check if registeredAt is missing
      if (!registeredAt) {
        console.error(`❌ ERROR: Missing registeredAt for student ${studentId} (${student.firstName} ${student.lastName}). Creating account with $0 allocation.`);

        // Write error eligibility to student object
        const studentEligibilityRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/FUNDING_ELIGIBILITY/${schoolYearKey}`);
        await studentEligibilityRef.set({
          fundingEligible: false,
          fundingAmount: 0,
          ageCategory: eligibility.ageCategory,
          fullEligibleAmount: eligibility.fundingAmount,
          eligibilityMessage: 'ERROR: Missing registration date (registeredAt). Cannot determine proration status.',
          registrationPhase: 'error',
          registrationDate: null,
          currentAllocation: 0,
          remainingAllocation: 0,
          upgradeEligibleAfter: null,
          calculatedAt: admin.database.ServerValue.TIMESTAMP,
          calculatedBy: 'cloud-function'
        });

        // Create account with $0 allocation
        studentAccounts[studentId] = {
          studentName: `${student.firstName} ${student.lastName}`,
          birthday: student.birthday,
          allocation: 0,
          spent: 0,
          remaining: 0,
          fundingEligible: false,
          ageCategory: eligibility.ageCategory,
          fullEligibleAmount: eligibility.fundingAmount,
          remainingAllocation: 0,
          registrationPhase: 'error',
          registrationDate: null,
          proratedReason: 'ERROR: Missing registration date (registeredAt). Cannot determine proration status.',
          upgradeEligibleAfter: null,
          upgradedAt: null,
          sourceNotificationFormId: formData?.submissionId || null,
          lastRecalculated: admin.database.ServerValue.TIMESTAMP
        };
        continue;
      }

      // Calculate prorated allocation based on registration date
      const allocationDetails = calculateProratedAllocation(
        eligibility.fundingAmount,
        registeredAt,
        schoolYear
      );

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

      console.log(`✅ Wrote eligibility to student ${studentId}: $${allocationDetails.currentAllocation} (phase: ${allocationDetails.registrationPhase})`);

      studentAccounts[studentId] = {
        studentName: `${student.firstName} ${student.lastName}`,
        birthday: student.birthday,
        allocation: allocationDetails.currentAllocation,
        spent: 0, // Will be calculated from transactions
        remaining: allocationDetails.currentAllocation,
        fundingEligible: true,
        ageCategory: eligibility.ageCategory,

        // Proration fields
        fullEligibleAmount: allocationDetails.fullAmount,
        remainingAllocation: allocationDetails.remainingAllocation,
        registrationPhase: allocationDetails.registrationPhase,
        registrationDate: allocationDetails.registrationDate,
        proratedReason: allocationDetails.proratedReason,
        upgradeEligibleAfter: allocationDetails.upgradeEligibleAfter,
        upgradedAt: null, // Set when upgraded to full funding

        sourceNotificationFormId: formData?.submissionId || null,
        lastRecalculated: admin.database.ServerValue.TIMESTAMP
      };

      totalAllocation += allocationDetails.currentAllocation;

      // Log proration details
      if (allocationDetails.registrationPhase === 'mid_term') {
        console.log(`📅 Student ${studentId} registered mid-term: $${allocationDetails.currentAllocation} now, $${allocationDetails.remainingAllocation} after ${allocationDetails.upgradeEligibleAfter}`);
      }
    } else {
      console.log(`⚠️ Student ${studentId} not eligible for funding: ${eligibility.message}`);

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
    }
  }

  // Get existing account to preserve spending data
  const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);
  const existingAccountSnapshot = await accountRef.once('value');
  const existingAccount = existingAccountSnapshot.val();

  // Calculate total spent from existing student data or transactions
  let totalSpent = 0;
  if (existingAccount?.students) {
    for (const [studentId, studentData] of Object.entries(existingAccount.students)) {
      if (studentData.spent) {
        totalSpent += studentData.spent;
        // Preserve spent amount in new calculation
        if (studentAccounts[studentId]) {
          studentAccounts[studentId].spent = studentData.spent;
          studentAccounts[studentId].remaining = studentAccounts[studentId].allocation - studentData.spent;
        }
      }
    }
  }

  // Build flattened account structure with indexed root properties
  const reimbursementAccount = {
    // Core identifiers
    familyId,
    schoolYear,

    // Metadata (meta_ prefix)
    meta_createdAt: existingAccount?.meta_createdAt || admin.database.ServerValue.TIMESTAMP,
    meta_lastUpdated: admin.database.ServerValue.TIMESTAMP,
    meta_lastCalculatedBy: 'cloud-function',

    // Summary (summary_ prefix) - INDEXED for efficient queries
    summary_totalAllocation: totalAllocation,
    summary_totalSpent: totalSpent,
    summary_totalRemaining: totalAllocation - totalSpent,
    summary_numberOfStudents: Object.keys(studentAccounts).length,
    summary_carryoverAmount: existingAccount?.summary_carryoverAmount || 0,

    // Family info (family_ prefix) - INDEXED for efficient queries
    family_primaryGuardianName: primaryGuardian ? `${primaryGuardian.firstName} ${primaryGuardian.lastName}` : 'Unknown',
    family_primaryGuardianEmail: primaryGuardian?.email || '',
    family_status: existingAccount?.family_status || 'active',

    // Nested data (not indexed but preserved)
    students: studentAccounts,

    // Preserve transactions if they exist
    ...(existingAccount?.transactions && { transactions: existingAccount.transactions })
  };

  // Save to optimized path: /reimbursementAccounts/{schoolYear}/{familyId}
  await accountRef.set(reimbursementAccount);

  console.log(`✅ Reimbursement account updated: ${schoolYear}/${familyId} = $${totalAllocation.toFixed(2)} (${Object.keys(studentAccounts).length} students)`);

  return reimbursementAccount;
}

/**
 * Cloud Function: Trigger reimbursement calculation when notification form is updated
 * Listens to: /homeEducationFamilies/familyInformation/{familyId}/NOTIFICATION_FORMS/{schoolYear}/{studentId}
 */
const onNotificationFormUpdate = onValueWritten({
  ref: '/homeEducationFamilies/familyInformation/{familyId}/NOTIFICATION_FORMS/{schoolYear}/{studentId}',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { familyId, schoolYear, studentId } = event.params;
  const formData = event.data.after.val();

  // Only process if form is submitted
  if (!formData || formData.submissionStatus !== 'submitted') {
    console.log(`⏭️ Skipping reimbursement calc for ${familyId}/${studentId} - form not submitted`);
    return null;
  }

  const schoolYearFormatted = schoolYear.replace('_', '/');

  try {
    await recalculateReimbursementAccount(familyId, schoolYearFormatted);
    console.log(`✅ Reimbursement account updated for ${familyId} after form submission`);
  } catch (error) {
    console.error(`❌ Error updating reimbursement account for ${familyId}:`, error);
  }

  return null;
});

/**
 * Cloud Function: Manual recalculation toggle trigger
 * Used for batch processing and backfilling
 * Listens to: /reimbursementRecalculations/{schoolYear}/{familyId}/trigger
 */
const onReimbursementRecalcToggle = onValueWritten({
  ref: '/reimbursementRecalculations/{schoolYear}/{familyId}/trigger',
  region: 'us-central1',
  maxInstances: 50,
  memory: '512MiB',
  timeoutSeconds: 300
}, async (event) => {
  const { familyId, schoolYear } = event.params;
  const db = admin.database();

  const schoolYearFormatted = schoolYear.replace('_', '/');

  try {
    await recalculateReimbursementAccount(familyId, schoolYearFormatted);
    console.log(`✅ Manual recalc completed for ${familyId}, ${schoolYearFormatted}`);
  } catch (error) {
    console.error(`❌ Error in manual recalc for ${familyId}:`, error);
  } finally {
    // Clean up the trigger after processing
    await db.ref(`reimbursementRecalculations/${schoolYear}/${familyId}`).remove();
  }

  return null;
});

/**
 * Cloud Function: Backfill reimbursement accounts for all families in a school year
 * Callable function for admin use
 */
const backfillReimbursementAccounts = onCall({
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "https://*.rtdacademy.com",
    "http://localhost:3000"
  ],
  maxInstances: 10,
  memory: '1GiB',
  timeoutSeconds: 540
}, async (data) => {
  // Verify admin permissions
  if (!data.auth?.token?.isAdminUser) {
    throw new HttpsError('permission-denied', 'Must be admin to backfill reimbursement accounts');
  }

  const { targetSchoolYear } = data.data; // e.g., "25/26"

  if (!targetSchoolYear) {
    throw new HttpsError('invalid-argument', 'targetSchoolYear is required');
  }

  const db = admin.database();
  const schoolYearKey = targetSchoolYear.replace('/', '_');

  console.log(`🔄 Starting backfill for school year ${targetSchoolYear}`);

  try {
    // Get all families with notification forms for this school year
    const familiesRef = db.ref('homeEducationFamilies/familyInformation');
    const snapshot = await familiesRef.once('value');
    const families = snapshot.val() || {};

    const results = [];
    let processedCount = 0;
    let skippedCount = 0;

    // Process each family
    for (const [familyId, familyData] of Object.entries(families)) {
      const forms = familyData.NOTIFICATION_FORMS?.[schoolYearKey];

      if (forms && Object.keys(forms).length > 0) {
        try {
          await recalculateReimbursementAccount(familyId, targetSchoolYear);
          results.push({ familyId, status: 'success' });
          processedCount++;
        } catch (error) {
          results.push({
            familyId,
            status: 'failed',
            error: error.message
          });
          console.error(`Failed to process ${familyId}:`, error);
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`✅ Backfill complete: ${processedCount} processed, ${skippedCount} skipped`);

    return {
      success: true,
      totalProcessed: processedCount,
      totalSkipped: skippedCount,
      results
    };

  } catch (error) {
    console.error('Error in backfill:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Record a transaction (purchase/refund) for a student
 * Callable function for admin/parent use
 */
const recordReimbursementTransaction = onCall({
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "https://*.rtdacademy.com",
    "http://localhost:3000"
  ],
  maxInstances: 10
}, async (data) => {
  // Verify authentication
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { familyId, schoolYear, studentId, amount, type, description } = data.data;

  // Verify permissions: admin or family member
  const isAdmin = data.auth.token.isAdminUser;
  const isFamilyMember = data.auth.token.familyId === familyId;

  if (!isAdmin && !isFamilyMember) {
    throw new HttpsError('permission-denied', 'Not authorized for this family');
  }

  // Validate inputs
  if (!familyId || !schoolYear || !studentId || !amount || !type) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  if (!['purchase', 'refund', 'adjustment'].includes(type)) {
    throw new HttpsError('invalid-argument', 'Invalid transaction type');
  }

  const db = admin.database();
  const schoolYearKey = schoolYear.replace('/', '_');
  const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);

  try {
    const accountSnapshot = await accountRef.once('value');
    const account = accountSnapshot.val();

    if (!account) {
      throw new HttpsError('not-found', 'Reimbursement account not found');
    }

    // Create transaction record
    const transactionId = db.ref().push().key;
    const transaction = {
      studentId,
      amount: parseFloat(amount),
      type,
      description: description || '',
      timestamp: admin.database.ServerValue.TIMESTAMP,
      createdBy: data.auth.uid,
      createdByEmail: data.auth.token.email || ''
    };

    // Update student spending
    const currentStudentData = account.students[studentId];
    if (!currentStudentData) {
      throw new HttpsError('not-found', 'Student not found in reimbursement account');
    }

    const newSpent = (currentStudentData.spent || 0) + parseFloat(amount);
    const newRemaining = currentStudentData.allocation - newSpent;

    // Check if sufficient funds
    if (type === 'purchase' && newRemaining < 0) {
      throw new HttpsError('failed-precondition', 'Insufficient funds for this purchase');
    }

    // Update account with transaction
    const updates = {};
    updates[`students/${studentId}/spent`] = newSpent;
    updates[`students/${studentId}/remaining`] = newRemaining;
    updates[`transactions/${transactionId}`] = transaction;

    // Update summary totals
    const newTotalSpent = (account.summary_totalSpent || 0) + parseFloat(amount);
    updates['summary_totalSpent'] = newTotalSpent;
    updates['summary_totalRemaining'] = account.summary_totalAllocation - newTotalSpent;
    updates['meta_lastUpdated'] = admin.database.ServerValue.TIMESTAMP;

    await accountRef.update(updates);

    console.log(`✅ Transaction recorded: ${type} $${amount} for student ${studentId}`);

    return {
      success: true,
      transactionId,
      newBalance: {
        spent: newSpent,
        remaining: newRemaining
      }
    };

  } catch (error) {
    console.error('Error recording transaction:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Get reimbursement account summary for a family
 * Callable function for parent/staff use
 */
const getReimbursementAccountSummary = onCall({
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "https://*.rtdacademy.com",
    "http://localhost:3000"
  ],
  maxInstances: 10
}, async (data) => {
  // Verify authentication
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { familyId, schoolYear } = data.data;

  // Verify permissions
  const isStaff = data.auth.token.isStaffUser || data.auth.token.isAdminUser;
  const isFamilyMember = data.auth.token.familyId === familyId;

  if (!isStaff && !isFamilyMember) {
    throw new HttpsError('permission-denied', 'Not authorized to view this account');
  }

  if (!familyId || !schoolYear) {
    throw new HttpsError('invalid-argument', 'familyId and schoolYear are required');
  }

  const db = admin.database();
  const schoolYearKey = schoolYear.replace('/', '_');
  const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);

  try {
    const snapshot = await accountRef.once('value');
    const account = snapshot.val();

    if (!account) {
      return {
        success: false,
        message: 'No reimbursement account found for this family and school year'
      };
    }

    return {
      success: true,
      account: {
        familyId: account.familyId,
        schoolYear: account.schoolYear,
        totalAllocation: account.summary_totalAllocation,
        totalSpent: account.summary_totalSpent,
        totalRemaining: account.summary_totalRemaining,
        numberOfStudents: account.summary_numberOfStudents,
        students: account.students,
        transactions: account.transactions || {},
        lastUpdated: account.meta_lastUpdated
      }
    };

  } catch (error) {
    console.error('Error getting account summary:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: List families eligible for funding upgrade
 * Returns list of families with remainingAllocation > 0 for admin review
 * Callable function for admin use
 */
const listEligibleForUpgrade = onCall({
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "https://*.rtdacademy.com",
    "http://localhost:3000"
  ],
  maxInstances: 10
}, async (data) => {
  // Verify admin permissions
  if (!data.auth?.token?.isAdminUser) {
    throw new HttpsError('permission-denied', 'Must be admin to list eligible accounts');
  }

  const { schoolYear } = data.data; // e.g., "25/26"

  if (!schoolYear) {
    throw new HttpsError('invalid-argument', 'schoolYear is required');
  }

  const db = admin.database();
  const schoolYearKey = schoolYear.replace('/', '_');

  console.log(`🔍 Listing families eligible for upgrade in ${schoolYear}`);

  try {
    // Get all reimbursement accounts for this school year
    const accountsRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}`);
    const snapshot = await accountsRef.once('value');
    const accounts = snapshot.val() || {};

    const eligibleFamilies = [];

    // Check each family account
    for (const [familyId, account] of Object.entries(accounts)) {
      const eligibleStudents = [];
      let totalRemainingForFamily = 0;

      // Check each student in the account
      for (const [studentId, studentData] of Object.entries(account.students || {})) {
        if (studentData.remainingAllocation > 0) {
          eligibleStudents.push({
            studentId,
            studentName: studentData.studentName,
            currentAllocation: studentData.allocation,
            remainingAllocation: studentData.remainingAllocation,
            fullEligibleAmount: studentData.fullEligibleAmount,
            registrationPhase: studentData.registrationPhase,
            registrationDate: studentData.registrationDate,
            upgradeEligibleAfter: studentData.upgradeEligibleAfter,
            upgradedAt: studentData.upgradedAt
          });
          totalRemainingForFamily += studentData.remainingAllocation;
        }
      }

      // Add family if they have students eligible for upgrade
      if (eligibleStudents.length > 0) {
        eligibleFamilies.push({
          familyId,
          primaryGuardianName: account.family_primaryGuardianName,
          primaryGuardianEmail: account.family_primaryGuardianEmail,
          numberOfEligibleStudents: eligibleStudents.length,
          totalRemainingAllocation: totalRemainingForFamily,
          students: eligibleStudents,
          familyStatus: account.family_status || 'unknown'
        });
      }
    }

    console.log(`✅ Found ${eligibleFamilies.length} families eligible for upgrade`);

    return {
      success: true,
      schoolYear,
      totalFamilies: eligibleFamilies.length,
      families: eligibleFamilies,
      upgradeEligibleDate: '2026-02-01'
    };

  } catch (error) {
    console.error('Error listing eligible accounts:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Upgrade families from half to full funding
 * Admin provides confirmations for which families should be upgraded
 * Callable function for admin use (after Feb 1, 2026)
 */
const upgradeReimbursementAccounts = onCall({
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "https://*.rtdacademy.com",
    "http://localhost:3000"
  ],
  maxInstances: 10,
  memory: '512MiB',
  timeoutSeconds: 300
}, async (data) => {
  // Verify admin permissions
  if (!data.auth?.token?.isAdminUser) {
    throw new HttpsError('permission-denied', 'Must be admin to upgrade accounts');
  }

  const { schoolYear, familyConfirmations } = data.data;
  // familyConfirmations = [
  //   { familyId: 'abc123', confirmed: true, reason: 'Student still enrolled' },
  //   { familyId: 'def456', confirmed: false, reason: 'Student withdrew' }
  // ]

  if (!schoolYear || !familyConfirmations || !Array.isArray(familyConfirmations)) {
    throw new HttpsError('invalid-argument', 'schoolYear and familyConfirmations array are required');
  }

  const db = admin.database();
  const schoolYearKey = schoolYear.replace('/', '_');
  const upgradeTimestamp = Date.now();
  const upgradeDate = new Date(upgradeTimestamp).toISOString();

  console.log(`🔄 Starting upgrade process for ${familyConfirmations.length} families in ${schoolYear}`);

  const results = {
    upgraded: [],
    rejected: [],
    errors: []
  };

  try {
    // Process each family confirmation
    for (const confirmation of familyConfirmations) {
      const { familyId, confirmed, reason } = confirmation;

      if (!familyId) {
        results.errors.push({ familyId: 'unknown', error: 'Missing familyId in confirmation' });
        continue;
      }

      const accountRef = db.ref(`homeEducationFamilies/reimbursementAccounts/${schoolYearKey}/${familyId}`);

      try {
        const snapshot = await accountRef.once('value');
        const account = snapshot.val();

        if (!account) {
          results.errors.push({ familyId, error: 'Reimbursement account not found' });
          continue;
        }

        // Handle rejected families
        if (confirmed === false) {
          console.log(`❌ Family ${familyId} rejected for upgrade: ${reason}`);
          results.rejected.push({
            familyId,
            primaryGuardianName: account.family_primaryGuardianName,
            reason: reason || 'Not specified',
            studentsAffected: Object.keys(account.students || {}).length
          });
          continue;
        }

        // Process confirmed families
        if (confirmed === true) {
          const updates = {};
          let familyTotalUpgraded = 0;
          const upgradedStudents = [];

          // Check each student for remaining allocation
          for (const [studentId, studentData] of Object.entries(account.students || {})) {
            if (studentData.remainingAllocation > 0) {
              const newAllocation = studentData.allocation + studentData.remainingAllocation;
              const newRemaining = studentData.remaining + studentData.remainingAllocation;

              updates[`students/${studentId}/allocation`] = newAllocation;
              updates[`students/${studentId}/remaining`] = newRemaining;
              updates[`students/${studentId}/remainingAllocation`] = 0;
              updates[`students/${studentId}/upgradedAt`] = upgradeTimestamp;

              familyTotalUpgraded += studentData.remainingAllocation;

              upgradedStudents.push({
                studentId,
                studentName: studentData.studentName,
                previousAllocation: studentData.allocation,
                addedAmount: studentData.remainingAllocation,
                newAllocation
              });

              console.log(`  ✅ Student ${studentData.studentName}: +$${studentData.remainingAllocation} → $${newAllocation}`);
            }
          }

          if (upgradedStudents.length > 0) {
            // Update summary totals
            const newTotalAllocation = (account.summary_totalAllocation || 0) + familyTotalUpgraded;
            updates['summary_totalAllocation'] = newTotalAllocation;
            updates['summary_totalRemaining'] = newTotalAllocation - (account.summary_totalSpent || 0);
            updates['meta_lastUpdated'] = admin.database.ServerValue.TIMESTAMP;

            // Apply updates
            await accountRef.update(updates);

            console.log(`✅ Upgraded family ${familyId}: +$${familyTotalUpgraded} (${upgradedStudents.length} students)`);

            results.upgraded.push({
              familyId,
              primaryGuardianName: account.family_primaryGuardianName,
              primaryGuardianEmail: account.family_primaryGuardianEmail,
              totalUpgraded: familyTotalUpgraded,
              students: upgradedStudents,
              reason: reason || 'Student(s) continuing'
            });
          } else {
            console.log(`⏭️ Family ${familyId} has no remaining allocation to upgrade`);
            results.errors.push({ familyId, error: 'No remaining allocation found' });
          }
        }
      } catch (error) {
        console.error(`❌ Error processing family ${familyId}:`, error);
        results.errors.push({ familyId, error: error.message });
      }
    }

    console.log(`\n✅ Upgrade complete:`);
    console.log(`   ${results.upgraded.length} families upgraded`);
    console.log(`   ${results.rejected.length} families rejected`);
    console.log(`   ${results.errors.length} errors`);

    return {
      success: true,
      schoolYear,
      upgradeDate,
      summary: {
        totalProcessed: familyConfirmations.length,
        upgraded: results.upgraded.length,
        rejected: results.rejected.length,
        errors: results.errors.length
      },
      results
    };

  } catch (error) {
    console.error('Error in upgrade process:', error);
    throw new HttpsError('internal', error.message);
  }
});

module.exports = {
  onNotificationFormUpdate,
  onReimbursementRecalcToggle,
  backfillReimbursementAccounts,
  recordReimbursementTransaction,
  getReimbursementAccountSummary,
  listEligibleForUpgrade,
  upgradeReimbursementAccounts
};
