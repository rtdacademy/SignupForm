// scripts/update-25-26-credits-limit.js
const admin = require('firebase-admin');
const serviceAccount = require('../rtd-academy-firebase-adminsdk-s6r2t-ecbb87fed5.json');

// Set to true to see what would happen without making changes
const DRY_RUN = false;

// Configuration
const SCHOOL_YEAR = '25/26';
const SCHOOL_YEAR_KEY = '25_26';
const STUDENT_TYPE_KEY = 'nonPrimaryStudents';
const ADDITIONAL_FREE_CREDITS = 15;
const ADJUSTMENT_REASON = 'Teacher strike update - additional credits granted for 25/26 school year';
const ADMIN_EMAIL = 'automated-script@rtd-academy.com';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rtd-academy-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function updateCreditsLimit() {
  console.log('Starting credits limit update for 25/26 school year...');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE'}\n`);
  console.log(`Configuration:`);
  console.log(`- School Year: ${SCHOOL_YEAR}`);
  console.log(`- Student Type: ${STUDENT_TYPE_KEY}`);
  console.log(`- Additional Credits: ${ADDITIONAL_FREE_CREDITS}`);
  console.log(`- Reason: ${ADJUSTMENT_REASON}\n`);

  try {
    // Get all students
    const studentsSnapshot = await db.ref('students').once('value');
    const students = studentsSnapshot.val();

    if (!students) {
      console.log('No students found');
      return;
    }

    let newCount = 0;
    let overwriteCount = 0;
    let skippedCount = 0;
    const overrideUpdates = {};
    const logUpdates = {};
    const recalcUpdates = {};
    const overwrites = [];
    const timestamp = Date.now();

    // Build batch updates for students who have nonPrimaryStudents
    for (const [studentId, studentData] of Object.entries(students)) {
      const nonPrimaryPath = studentData?.profile?.creditsPerStudent?.[SCHOOL_YEAR_KEY]?.[STUDENT_TYPE_KEY];

      if (nonPrimaryPath !== undefined) {
        // 1. Set the credit override object (matching PaymentActions.js structure)
        const overridePath = `students/${studentId}/profile/creditOverrides/${SCHOOL_YEAR_KEY}/${STUDENT_TYPE_KEY}/creditAdjustments`;
        const existingOverride = studentData?.profile?.creditOverrides?.[SCHOOL_YEAR_KEY]?.[STUDENT_TYPE_KEY]?.creditAdjustments;

        overrideUpdates[overridePath] = {
          additionalFreeCredits: ADDITIONAL_FREE_CREDITS,
          reason: ADJUSTMENT_REASON,
          overriddenBy: ADMIN_EMAIL,
          overriddenAt: timestamp,
          schoolYear: SCHOOL_YEAR
        };

        // 2. Log the adjustment
        const adjustmentId = timestamp + Object.keys(logUpdates).length; // Ensure unique IDs
        const adjustmentPath = `creditAdjustments/${studentId}/${adjustmentId}`;
        logUpdates[adjustmentPath] = {
          amount: ADDITIONAL_FREE_CREDITS,
          reason: ADJUSTMENT_REASON,
          adjustedBy: ADMIN_EMAIL,
          timestamp: timestamp,
          schoolYear: SCHOOL_YEAR,
          studentType: STUDENT_TYPE_KEY,
          adjustmentType: 'freeCreditsOverride'
        };

        // 3. Trigger credit recalculation
        recalcUpdates[`creditRecalculations/${studentId}/trigger`] = timestamp;

        if (existingOverride?.additionalFreeCredits !== undefined &&
            existingOverride.additionalFreeCredits !== ADDITIONAL_FREE_CREDITS) {
          overwriteCount++;
          overwrites.push({
            studentId,
            oldValue: existingOverride.additionalFreeCredits,
            newValue: ADDITIONAL_FREE_CREDITS
          });
          console.log(`⚠ Will overwrite: ${studentId} (${existingOverride.additionalFreeCredits} → ${ADDITIONAL_FREE_CREDITS})`);
        } else if (existingOverride?.additionalFreeCredits === ADDITIONAL_FREE_CREDITS) {
          console.log(`- Already set: ${studentId} (${ADDITIONAL_FREE_CREDITS})`);
        } else {
          newCount++;
          console.log(`✓ Will add: ${studentId} (new override → ${ADDITIONAL_FREE_CREDITS})`);
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`\n═══════════════════════════════════════`);
    console.log(`Summary:`);
    console.log(`- New overrides to add: ${newCount}`);
    console.log(`- Existing overrides to update: ${overwriteCount}`);
    console.log(`- Students to skip: ${skippedCount}`);
    console.log(`- Total updates: ${newCount + overwriteCount}`);
    console.log(`═══════════════════════════════════════\n`);

    if (overwrites.length > 0) {
      console.log('Students with existing overrides that will be updated:');
      overwrites.forEach(({ studentId, oldValue }) => {
        console.log(`  - ${studentId}: ${oldValue} → ${ADDITIONAL_FREE_CREDITS}`);
      });
      console.log();
    }

    const totalUpdates = Object.keys(overrideUpdates).length;
    if (totalUpdates > 0) {
      if (DRY_RUN) {
        console.log('✓ DRY RUN complete. Set DRY_RUN = false to apply changes.');
        console.log(`\nWould apply ${totalUpdates} override updates, ${Object.keys(logUpdates).length} log entries, and ${Object.keys(recalcUpdates).length} recalculation triggers.`);
      } else {
        console.log('Applying updates...');
        console.log('- Setting credit overrides...');
        await db.ref().update(overrideUpdates);
        console.log('- Logging adjustments...');
        await db.ref().update(logUpdates);
        console.log('- Triggering recalculations...');
        await db.ref().update(recalcUpdates);
        console.log('✓ All updates completed successfully!');
      }
    } else {
      console.log('No updates needed.');
    }

  } catch (error) {
    console.error('Error updating credits limit:', error);
    process.exit(1);
  }

  process.exit(0);
}

updateCreditsLimit();
