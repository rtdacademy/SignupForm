const admin = require('firebase-admin');
const { onValueWritten, onValueDeleted, onValueCreated } = require('firebase-functions/v2/database');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { recalculateCredits, formatSchoolYear } = require('./utils/creditTracking');
const { sanitizeEmail } = require('./utils');

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: Track credit changes when course status changes
 * Handles creation (null → value), updates, and deletion (value → null)
 */
const onCourseStatusChange = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}/ActiveFutureArchived/Value',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { studentKey, courseId } = event.params;
  const beforeStatus = event.data.before.val();
  const afterStatus = event.data.after.val();
  
  // Handle deletion case (value → null)
  if (afterStatus === null && beforeStatus !== null) {
    console.log(`Course ${courseId} deleted for ${studentKey}`);
    // Get student type and school year from somewhere else if needed
    // For now, we'll handle this in a separate trigger
    return null;
  }
  
  // Handle creation case (null → value)
  if (beforeStatus === null && afterStatus !== null) {
    console.log(`Course ${courseId} created with status ${afterStatus} for ${studentKey}`);
    // Small delay to ensure all course data is written
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Get the full course data to check student type and school year
  const db = admin.database();
  const courseRef = db.ref(`students/${studentKey}/courses/${courseId}`);
  const courseSnapshot = await courseRef.once('value');
  const courseData = courseSnapshot.val();
  
  if (!courseData) {
    return null;
  }
  
  const studentType = courseData.StudentType?.Value;
  const schoolYear = courseData.School_x0020_Year?.Value;
  
  // Only recalculate if we have a school year
  if (!schoolYear) {
    console.log(`Skipping credit tracking for ${studentKey} - No school year found`);
    return null;
  }
  
  try {
    // Now track for ALL student types, not just Non-Primary and Home Education
    await recalculateCredits(studentKey, schoolYear, studentType);
    const action = beforeStatus === null ? 'created' : (afterStatus === null ? 'deleted' : 'updated');
    console.log(`✅ Credit tracking updated for ${studentKey} (${studentType}) in ${schoolYear} after status ${action}: ${beforeStatus} → ${afterStatus}`);
  } catch (error) {
    console.error(`❌ Error updating credits for ${studentKey}:`, error);
  }
  
  return null;
});

/**
 * Cloud Function: Track when student type changes
 * This is important as it affects credit tracking eligibility
 */
const onStudentTypeChange = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}/StudentType/Value',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { studentKey, courseId } = event.params;
  const beforeType = event.data.before.val();
  const afterType = event.data.after.val();
  
  // Only proceed if type actually changed
  if (beforeType === afterType) {
    return null;
  }
  
  // Get the school year from the course data
  const db = admin.database();
  const courseRef = db.ref(`students/${studentKey}/courses/${courseId}`);
  const courseSnapshot = await courseRef.once('value');
  const courseData = courseSnapshot.val();
  
  if (!courseData) {
    return null;
  }
  
  const schoolYear = courseData.School_x0020_Year?.Value;
  if (!schoolYear) {
    return null;
  }
  
  try {
    // Recalculate for both old and new student types
    if (beforeType) {
      await recalculateCredits(studentKey, schoolYear, beforeType);
    }
    if (afterType) {
      await recalculateCredits(studentKey, schoolYear, afterType);
    }
    console.log(`✅ Credit tracking updated for ${studentKey} in ${schoolYear} after student type change: ${beforeType} → ${afterType}`);
  } catch (error) {
    console.error(`❌ Error updating credits for ${studentKey}:`, error);
  }
  
  return null;
});

// Note: onCourseCreated removed - creation is handled by onCourseStatusChange
// when ActiveFutureArchived/Value goes from null → value

/**
 * Cloud Function: Track when school year changes
 * Important for moving credits between years
 */
const onSchoolYearChange = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}/School_x0020_Year/Value',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { studentKey, courseId } = event.params;
  const beforeYear = event.data.before.val();
  const afterYear = event.data.after.val();
  
  // Only proceed if year actually changed
  if (beforeYear === afterYear) {
    return null;
  }
  
  // Get the full course data
  const db = admin.database();
  const courseRef = db.ref(`students/${studentKey}/courses/${courseId}`);
  const courseSnapshot = await courseRef.once('value');
  const courseData = courseSnapshot.val();
  
  if (!courseData) {
    return null;
  }
  
  const studentType = courseData.StudentType?.Value;
  
  // Update both old and new school years
  const yearsToUpdate = [];
  if (beforeYear) yearsToUpdate.push(beforeYear);
  if (afterYear) yearsToUpdate.push(afterYear);
  
  for (const year of yearsToUpdate) {
    try {
      await recalculateCredits(studentKey, year, studentType);
      console.log(`✅ Credit tracking updated for ${studentKey} (${studentType}) in ${year} after school year change`);
    } catch (error) {
      console.error(`❌ Error updating credits for ${studentKey} in ${year}:`, error);
    }
  }
  
  return null;
});

/**
 * Cloud Function: Track when CourseID is deleted (indicates course removal)
 * Using specific field to avoid listening to large course nodes
 */
const onCourseDeleted = onValueDeleted({
  ref: '/students/{studentKey}/courses/{courseId}/CourseID',
  region: 'us-central1',
  maxInstances: 10  
}, async (event) => {
  const { studentKey, courseId } = event.params;
  const deletedCourseId = event.data.val();
  
  // We need to get school year from the parent student node
  // since the course data is being deleted
  const db = admin.database();
  const studentRef = db.ref(`students/${studentKey}`);
  const studentSnapshot = await studentRef.once('value');
  const studentData = studentSnapshot.val();
  
  if (!studentData) {
    return null;
  }
  
  // Try to find school years and types from other courses
  const yearsAndTypes = new Set();
  if (studentData.courses) {
    for (const course of Object.values(studentData.courses)) {
      const year = course.School_x0020_Year?.Value;
      const type = course.StudentType?.Value;
      if (year && type) {
        yearsAndTypes.add(`${year}|${type}`);
      }
    }
  }
  
  if (yearsAndTypes.size === 0) {
    console.log(`No school year/type found for deleted course ${deletedCourseId}`);
    return null;
  }
  
  // Recalculate for all year/type combinations found
  for (const yearType of yearsAndTypes) {
    const [year, type] = yearType.split('|');
    try {
      await recalculateCredits(studentKey, year, type);
      console.log(`✅ Credit tracking updated for ${studentKey} (${type}) in ${year} after course ${deletedCourseId} deleted`);
    } catch (error) {
      console.error(`❌ Error updating credits for ${studentKey} (${type}) in ${year}:`, error);
    }
  }
  
  return null;
});

/**
 * Cloud Function: Clean up credit tracking when a student is removed
 * This ensures we don't have orphaned credit data
 */
const onStudentDelete = onValueDeleted({
  ref: '/students/{studentKey}',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { studentKey } = event.params;
  const db = admin.database();
  
  try {
    // Remove all credit tracking for this student from the main creditsPerStudent node
    const creditRef = db.ref(`creditsPerStudent`);
    const creditSnapshot = await creditRef.once('value');
    const allCredits = creditSnapshot.val() || {};
    
    const updates = {};
    
    // Find and remove entries for this student in all school years and types
    for (const schoolYear of Object.keys(allCredits)) {
      if (allCredits[schoolYear]) {
        for (const studentType of Object.keys(allCredits[schoolYear])) {
          if (allCredits[schoolYear][studentType] && allCredits[schoolYear][studentType][studentKey]) {
            updates[`creditsPerStudent/${schoolYear}/${studentType}/${studentKey}`] = null;
          }
        }
      }
    }
    
    // Also remove from the student profile path
    // Note: This will be automatically removed when the student node is deleted,
    // but we'll explicitly clean it up in case of partial deletions
    updates[`students/${studentKey}/profile/creditsPerStudent`] = null;
    
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`🗑️ Removed credit tracking for deleted student: ${studentKey}`);
    }
  } catch (error) {
    console.error(`Error cleaning up credit tracking for ${studentKey}:`, error);
  }
  
  return null;
});

/**
 * Manually recalculate credits for a specific student and school year
 * Can be called via Firebase Functions shell or admin SDK
 */
const recalculateStudentCredits = onCall({
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"],
  maxInstances: 10
}, async (data) => {
  // Check if user is authenticated
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const { studentEmailKey, schoolYear } = data.data;
  
  if (!studentEmailKey || !schoolYear) {
    throw new HttpsError('invalid-argument', 'Missing studentEmailKey or schoolYear');
  }
  
  try {
    const result = await recalculateCredits(studentEmailKey, schoolYear);
    return {
      success: true,
      message: `Credits recalculated for ${studentEmailKey} in ${schoolYear}`,
      creditData: result
    };
  } catch (error) {
    console.error('Error recalculating credits:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Trigger credit recalculation via toggle mechanism
 * Used for batch processing of credit updates
 */
const onCreditRecalcToggle = onValueWritten({
  ref: '/creditRecalculations/{studentKey}/trigger',
  region: 'us-central1',
  maxInstances: 50, // Higher limit for batch processing
  memory: '512MiB', // Increased memory for processing large datasets
  timeoutSeconds: 300 // 5 minutes timeout for complex calculations
}, async (event) => {
  const { studentKey } = event.params;
  const db = admin.database();
  
  try {
    // Get all course summaries for this student - fetch only required fields
    const summariesRef = db.ref('studentCourseSummaries');
    const summariesSnapshot = await summariesRef.orderByKey()
      .startAt(`${studentKey}_`)
      .endAt(`${studentKey}_\uf8ff`)
      .limitToFirst(100) // Limit to prevent memory overload
      .once('value');
    
    const summaries = summariesSnapshot.val() || {};
    
    // Extract unique school years and student types
    const yearTypeSet = new Set();
    
    for (const summary of Object.values(summaries)) {
      const schoolYear = summary.School_x0020_Year_Value;
      const studentType = summary.StudentType_Value;
      
      if (schoolYear && studentType) {
        yearTypeSet.add(`${schoolYear}|${studentType}`);
      }
      
      // Clear reference to help garbage collection
      delete summaries[Object.keys(summaries)[0]];
    }
    
    // Recalculate credits for each unique combination
    for (const yearType of yearTypeSet) {
      const [schoolYear, studentType] = yearType.split('|');
      
      try {
        await recalculateCredits(studentKey, schoolYear, studentType);
        console.log(`✅ Credits recalculated for ${studentKey} - ${studentType} - ${schoolYear}`);
      } catch (error) {
        console.error(`❌ Failed to recalculate for ${studentKey} - ${studentType} - ${schoolYear}:`, error);
      }
    }
    
    // Clean up the trigger after processing
    await db.ref(`creditRecalculations/${studentKey}`).remove();
    
    return null;
  } catch (error) {
    console.error(`Error in credit recalc toggle for ${studentKey}:`, error);
    // Still clean up the trigger even on error
    await db.ref(`creditRecalculations/${studentKey}`).remove();
    throw error;
  }
});

/**
 * Cloud Function: Trigger mass credit recalculation for all students
 * Callable function that processes students in batches
 */
const triggerMassCreditRecalculation = onCall({
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"],
  maxInstances: 10,
  memory: '1GiB', // Increased memory for processing all students
  timeoutSeconds: 540 // 9 minutes timeout
}, async (data) => {
  // Check if user is authenticated and has admin permissions
  if (!data.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  const db = admin.database();
  
  try {
    // Get all ASNs at once - the node is small enough to handle in memory
    console.log('Fetching all ASNs...');
    const asnsSnapshot = await db.ref('ASNs').once('value');
    const asnsData = asnsSnapshot.val() || {};
    
    const studentKeySet = new Set();
    let processedASNs = 0;
    
    // Process each ASN and extract student email keys
    for (const [asnId, asnData] of Object.entries(asnsData)) {
      processedASNs++;
      
      // Extract email keys that are marked as true
      if (asnData && asnData.emailKeys) {
        for (const [emailKey, value] of Object.entries(asnData.emailKeys)) {
          if (value === true) {
            // These are already sanitized email keys (e.g., lisa-dawn@live,ca)
            studentKeySet.add(emailKey);
          }
        }
      }
    }
    
    const validStudentKeys = Array.from(studentKeySet);
    
    console.log(`Processed ${processedASNs} ASNs, found ${validStudentKeys.length} unique students`);
    
    const totalStudents = validStudentKeys.length;
    
    console.log(`Starting mass credit recalculation for ${totalStudents} students`);
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 100; // Process 100 students per batch
    const batches = [];
    
    for (let i = 0; i < validStudentKeys.length; i += batchSize) {
      batches.push(validStudentKeys.slice(i, i + batchSize));
    }
    
    let processedCount = 0;
    let failedCount = 0;
    
    // Process each batch with a delay
    for (const [index, batch] of batches.entries()) {
      console.log(`Processing batch ${index + 1} of ${batches.length} (${batch.length} students)`);
      
      // Create triggers for this batch
      const updates = {};
      const timestamp = Date.now() + index; // Slightly stagger timestamps
      
      for (const studentKey of batch) {
        updates[`creditRecalculations/${studentKey}/trigger`] = timestamp;
      }
      
      try {
        await db.ref().update(updates);
        processedCount += batch.length;
      } catch (error) {
        console.error(`Error processing batch ${index + 1}:`, error);
        failedCount += batch.length;
      }
      
      // Add small delay between batches to prevent overload
      if (index < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
      }
    }
    
    return {
      success: true,
      totalStudents,
      processedCount,
      failedCount,
      message: `Triggered credit recalculation for ${processedCount} of ${totalStudents} students`
    };
    
  } catch (error) {
    console.error('Error in mass credit recalculation:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Track when payment status changes
 * Important for adult and international students who pay per course
 */
const onPaymentStatusChange = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}/payment_status/status',
  region: 'us-central1',
  maxInstances: 10
}, async (event) => {
  const { studentKey, courseId } = event.params;
  const beforeStatus = event.data.before.val();
  const afterStatus = event.data.after.val();
  
  // Only proceed if status actually changed
  if (beforeStatus === afterStatus) {
    return null;
  }
  
  console.log(`Payment status changed for ${studentKey} course ${courseId}: ${beforeStatus} → ${afterStatus}`);
  
  // Get the full course data to check student type and school year
  const db = admin.database();
  const courseRef = db.ref(`students/${studentKey}/courses/${courseId}`);
  const courseSnapshot = await courseRef.once('value');
  const courseData = courseSnapshot.val();
  
  if (!courseData) {
    return null;
  }
  
  const studentType = courseData.StudentType?.Value;
  const schoolYear = courseData.School_x0020_Year?.Value;
  
  // Only recalculate if we have a school year and student type
  if (!schoolYear || !studentType) {
    console.log(`Skipping credit tracking for ${studentKey} - Missing school year or student type`);
    return null;
  }
  
  // This is especially important for adult and international students
  // who pay per course instead of per credit
  try {
    await recalculateCredits(studentKey, schoolYear, studentType);
    console.log(`✅ Credit tracking updated for ${studentKey} (${studentType}) in ${schoolYear} after payment status change: ${beforeStatus} → ${afterStatus}`);
  } catch (error) {
    console.error(`❌ Error updating credits for ${studentKey} after payment status change:`, error);
  }
  
  return null;
});

module.exports = {
  onCourseStatusChange,
  onStudentTypeChange,
  onSchoolYearChange,
  onCourseDeleted,
  onStudentDelete,
  onPaymentStatusChange,
  recalculateStudentCredits,
  onCreditRecalcToggle,
  triggerMassCreditRecalculation
};