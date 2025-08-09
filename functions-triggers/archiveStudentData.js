// functions/archiveStudentDataV2.js
const { onValueWritten } = require('firebase-functions/v2/database');
const admin = require('firebase-admin');
const zlib = require('zlib');
const { sanitizeEmail } = require('./utils');
const crypto = require('crypto');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Archive function
const archiveStudentDataV2 = onValueWritten({
  ref: '/studentCourseSummaries/{summaryKey}/ActiveFutureArchived_Value',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 80
}, async (event) => {
  const summaryKey = event.params.summaryKey;
  
  // Check if value changed to "Archived"
  const beforeValue = event.data.before.val();
  const afterValue = event.data.after.val();
  
  if (afterValue !== 'Archived' || beforeValue === 'Archived') {
    console.log(`No action needed: value changed from ${beforeValue} to ${afterValue}`);
    return null;
  }
  
  console.log(`Starting archive process for summaryKey: ${summaryKey}`);
  
  const db = admin.database();
  const storage = admin.storage().bucket();

  try {
    // Get the full student course summary
    const summarySnapshot = await db.ref(`/studentCourseSummaries/${summaryKey}`).once('value');
    const summaryData = summarySnapshot.val();

    if (!summaryData) {
      console.error('Summary data not found:', summaryKey);
      return null;
    }

    // Extract required properties
    const studentEmail = summaryData.StudentEmail;
    const studentKey = sanitizeEmail(studentEmail);
    const courseId = summaryData.CourseID;
    const asn = summaryData.asn;
    const lmsStudentId = summaryData.LMSStudentID;

    console.log(`Archiving data for student ${studentKey}, course ${courseId}`);

    // Fetch related data
    const courseSnapshot = await db.ref(`/students/${studentKey}/courses/${courseId}`).once('value');
    let courseData = courseSnapshot.val();
    
    // If course data exists, exclude the previousCourse subfolder to prevent nesting
    if (courseData && courseData.previousCourse) {
      console.log(`Excluding previousCourse subfolder from archive to prevent nesting`);
      // Create a copy without the previousCourse folder
      const { previousCourse, hasPreviousEnrollment, ...courseDataWithoutPrevious } = courseData;
      courseData = courseDataWithoutPrevious;
      
      // Store a reference that previous enrollments exist but don't include the actual data
      courseData.hadPreviousEnrollments = {
        existed: true,
        count: hasPreviousEnrollment?.count || Object.keys(previousCourse || {}).length,
        note: 'Previous enrollment data excluded from archive to prevent nesting'
      };
    }

    // Fetch messages for this course
    const messagesSnapshot = await db.ref(`/userEmails/${studentKey}`).once('value');
    const allMessages = messagesSnapshot.val() || {};
    
    // Filter messages for this specific course
    const courseMessages = {};
    const messageKeysToDelete = [];
    Object.entries(allMessages).forEach(([messageId, message]) => {
      if (message && message.courseId === courseId) {
        courseMessages[messageId] = message;
        messageKeysToDelete.push(messageId);
      }
    });

    // Create archive object
    const archiveData = {
      studentCourseSummary: summaryData,
      courseData: courseData,
      courseMessages: courseMessages,
      archiveMetadata: {
        archiveDate: new Date().toISOString(),
        summaryKey: summaryKey,
        studentKey: studentKey,
        studentEmail: studentEmail,
        courseId: courseId,
        asn: asn,
        lmsStudentId: lmsStudentId
      }
    };

    // Compress the data
    const jsonString = JSON.stringify(archiveData);
    const compressedBuffer = await new Promise((resolve, reject) => {
      zlib.gzip(jsonString, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Generate a unique ID for the filename
    const timestamp = Date.now();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const fileName = `archive_${timestamp}_${uniqueId}.json.gz`;
    const filePath = `coldStorage/${fileName}`;

    // Upload to Cloud Storage
    const file = storage.file(filePath);
    await file.save(compressedBuffer, {
      metadata: {
        contentType: 'application/gzip',
        metadata: {
          studentKey: studentKey,
          studentEmail: studentEmail,
          courseId: courseId.toString(),
          asn: asn,
          lmsStudentId: lmsStudentId?.toString() || '',
          archiveDate: new Date().toISOString(),
          summaryKey: summaryKey,
          timestamp: timestamp.toString()
        }
      }
    });

    console.log(`Successfully uploaded archive to ${filePath}`);
    
    // Verify the file exists before proceeding with deletion
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('File verification failed after upload');
    }

    // Update the studentCourseSummary with archival information for easy restoration
    const archiveInfo = {
      archivedAt: admin.database.ServerValue.TIMESTAMP,
      archiveFilePath: filePath,
      fileName: fileName,
      fileId: uniqueId,
      restorationData: {
        coursePath: `/students/${studentKey}/courses/${courseId}`,
        messagesPath: `/userEmails/${studentKey}`,
        archivedMessageIds: messageKeysToDelete,
        courseDataExists: courseData !== null,
        messageCount: Object.keys(courseMessages).length
      }
    };

    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveInfo`).set(archiveInfo);

    // Now that we've verified the upload and updated the summary, delete the original data
    console.log(`Deleting original data...`);

    // Delete course data if it exists, but preserve previousCourse folder
    if (courseData) {
      // First, check if there's a previousCourse folder to preserve
      const fullCourseSnapshot = await db.ref(`/students/${studentKey}/courses/${courseId}/previousCourse`).once('value');
      const previousCourseData = fullCourseSnapshot.val();
      const hasPrevEnrollmentSnapshot = await db.ref(`/students/${studentKey}/courses/${courseId}/hasPreviousEnrollment`).once('value');
      const hasPrevEnrollmentData = hasPrevEnrollmentSnapshot.val();
      
      // Delete the entire course
      await db.ref(`/students/${studentKey}/courses/${courseId}`).remove();
      console.log(`Deleted course data for ${studentKey}/${courseId}`);
      
      // Restore the previousCourse folder if it existed
      if (previousCourseData) {
        await db.ref(`/students/${studentKey}/courses/${courseId}/previousCourse`).set(previousCourseData);
        if (hasPrevEnrollmentData) {
          await db.ref(`/students/${studentKey}/courses/${courseId}/hasPreviousEnrollment`).set(hasPrevEnrollmentData);
        }
        console.log(`Preserved previousCourse data during archival`);
      }
    }

    // Delete messages for this course
    if (messageKeysToDelete.length > 0) {
      const deletePromises = messageKeysToDelete.map(messageId => 
        db.ref(`/userEmails/${studentKey}/${messageId}`).remove()
      );
      await Promise.all(deletePromises);
      console.log(`Deleted ${messageKeysToDelete.length} messages for ${studentKey}`);
    }

    // Update archive status to completed
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Completed');

    console.log(`Archive process completed successfully for ${summaryKey}`);
    return null;

  } catch (error) {
    console.error('Error archiving student data:', error);
    
    // Log the error
    await db.ref('errorLogs/archiveStudentData').push({
      summaryKey,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Update the status to indicate failure
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Failed');
    
    throw error;
  }
});

// Helper function to merge student notes intelligently
const mergeStudentNotes = (currentNotes, archivedNotes) => {
  if (!currentNotes && !archivedNotes) return [];
  if (!currentNotes) return archivedNotes;
  if (!archivedNotes) return currentNotes;
  
  // Create a Map to handle duplicates by ID
  const noteMap = new Map();
  
  // Add archived notes first (older)
  if (Array.isArray(archivedNotes)) {
    archivedNotes.forEach(note => {
      if (note && note.id) {
        noteMap.set(note.id, note);
      }
    });
  }
  
  // Add current notes (may override if same ID exists)
  if (Array.isArray(currentNotes)) {
    currentNotes.forEach(note => {
      if (note && note.id) {
        noteMap.set(note.id, note);
      }
    });
  }
  
  // Convert back to array and sort by timestamp
  return Array.from(noteMap.values())
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateA - dateB;
    });
};

// Helper function to extract school year from course data
const extractSchoolYear = (courseData) => {
  if (courseData?.School_x0020_Year?.Value) {
    return courseData.School_x0020_Year.Value;
  }
  // Fallback: try to extract from Created date
  if (courseData?.Created) {
    const date = new Date(courseData.Created);
    const year = date.getFullYear();
    const month = date.getMonth();
    // School year typically starts in September
    if (month >= 8) {
      return `${year % 100}/${(year + 1) % 100}`;
    } else {
      return `${(year - 1) % 100}/${year % 100}`;
    }
  }
  return 'Unknown';
};

// Restoration function
const restoreStudentDataV2 = onValueWritten({
  ref: '/studentCourseSummaries/{summaryKey}/ActiveFutureArchived_Value',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 80
}, async (event) => {
  const summaryKey = event.params.summaryKey;
  
  // Check if value changed from "Archived" to something else
  const beforeValue = event.data.before.val();
  const afterValue = event.data.after.val();
  
  if (beforeValue !== 'Archived' || afterValue === 'Archived') {
    console.log(`No restoration needed: value changed from ${beforeValue} to ${afterValue}`);
    return null;
  }
  
  console.log(`Starting restoration process for summaryKey: ${summaryKey}`);
  
  const db = admin.database();
  const storage = admin.storage().bucket();
  
  try {
    // Get archive info from studentCourseSummary
    const summarySnapshot = await db.ref(`/studentCourseSummaries/${summaryKey}`).once('value');
    const summaryData = summarySnapshot.val();
    
    if (!summaryData || !summaryData.archiveInfo) {
      console.error('No archive information found for:', summaryKey);
      return null;
    }
    
    const { archiveFilePath, restorationData } = summaryData.archiveInfo;
    
    // Download and decompress the archive
    const file = storage.file(archiveFilePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new Error(`Archive file not found: ${archiveFilePath}`);
    }
    
    console.log(`Downloading archive from ${archiveFilePath}`);
    const [compressedBuffer] = await file.download();
    
    const decompressedBuffer = await new Promise((resolve, reject) => {
      zlib.gunzip(compressedBuffer, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    const archiveData = JSON.parse(decompressedBuffer.toString());
    
    // Check if there's already course data (new enrollment)
    let currentData = null;
    if (restorationData.coursePath) {
      const currentDataSnapshot = await db.ref(restorationData.coursePath).once('value');
      currentData = currentDataSnapshot.val();
    }
    
    // Restore course data with smart logic for re-enrollments
    if (archiveData.courseData && restorationData.courseDataExists) {
      
      if (currentData) {
        // New enrollment exists - preserve it and save old data to previousCourse
        console.log(`Found existing enrollment, preserving new data and archiving old`);
        
        // Generate timestamp for the previous course folder
        const timestamp = Date.now();
        const previousCoursePath = `${restorationData.coursePath}/previousCourse/${timestamp}`;
        
        // Extract school year from archived data
        const schoolYear = extractSchoolYear(archiveData.courseData);
        
        // Check if archived data contains previousCourse (from old archives) and exclude it
        let dataToArchive = archiveData.courseData;
        if (dataToArchive.previousCourse) {
          console.log(`Removing nested previousCourse from archived data to prevent nesting`);
          const { previousCourse, hasPreviousEnrollment, hadPreviousEnrollments, ...cleanData } = dataToArchive;
          dataToArchive = cleanData;
        }
        
        // Prepare the archived course data with metadata
        const previousCourseData = {
          ...dataToArchive,
          archivedMetadata: {
            schoolYear: schoolYear,
            archivedFrom: archiveFilePath,
            restoredAt: timestamp,
            originalStatus: dataToArchive.Status?.Value || 'Unknown',
            completionStatus: 'Incomplete', // Since they're re-enrolling
            originalCreated: dataToArchive.Created,
            originalScheduleStart: dataToArchive.ScheduleStartDate,
            originalScheduleEnd: dataToArchive.ScheduleEndDate
          }
        };
        
        // Save the archived course data to previousCourse folder
        await db.ref(previousCoursePath).set(previousCourseData);
        console.log(`Saved previous enrollment to ${previousCoursePath}`);
        
        // Get existing previous enrollments to update the count
        const existingPrevCoursesSnapshot = await db.ref(`${restorationData.coursePath}/previousCourse`).once('value');
        const existingPrevCourses = existingPrevCoursesSnapshot.val() || {};
        const allEnrollmentTimestamps = Object.keys(existingPrevCourses).map(ts => parseInt(ts)).sort();
        
        // Merge notes if both enrollments have them
        if (currentData.jsonStudentNotes || archiveData.courseData.jsonStudentNotes) {
          const mergedNotes = mergeStudentNotes(
            currentData.jsonStudentNotes,
            archiveData.courseData.jsonStudentNotes
          );
          
          // Add a system note about the restoration
          const restorationNote = {
            id: `note-restoration-${timestamp}`,
            author: 'System',
            content: `📂 Previous enrollment data from ${schoolYear} school year has been restored and merged with current enrollment.`,
            noteType: '📂',
            timestamp: new Date().toISOString()
          };
          mergedNotes.push(restorationNote);
          
          // Update only the notes, preserving all other current enrollment data
          await db.ref(`${restorationData.coursePath}/jsonStudentNotes`).set(mergedNotes);
          console.log(`Merged ${mergedNotes.length} notes from both enrollments`);
        }
        
        // Update the current enrollment with a reference to all previous enrollments
        await db.ref(`${restorationData.coursePath}/hasPreviousEnrollment`).set({
          exists: true,
          count: allEnrollmentTimestamps.length,
          enrollmentTimestamps: allEnrollmentTimestamps,
          latestPreviousPath: previousCoursePath,
          latestPreviousTimestamp: timestamp,
          latestPreviousSchoolYear: schoolYear
        });
        
      } else {
        // No current data - safe to restore normally
        console.log(`No existing enrollment found, restoring normally`);
        
        // Check if the archived data contains previousCourse and handle it separately
        let dataToRestore = archiveData.courseData;
        let previousCourseToRestore = null;
        let hasPreviousEnrollmentToRestore = null;
        
        if (dataToRestore.previousCourse) {
          console.log(`Found previousCourse in archived data, will restore separately to prevent nesting`);
          previousCourseToRestore = dataToRestore.previousCourse;
          hasPreviousEnrollmentToRestore = dataToRestore.hasPreviousEnrollment;
          
          // Remove previousCourse from main data
          const { previousCourse, hasPreviousEnrollment, hadPreviousEnrollments, ...cleanData } = dataToRestore;
          dataToRestore = cleanData;
        }
        
        // Update the ActiveFutureArchived.Value before restoration to prevent triggering archive function
        if (dataToRestore.ActiveFutureArchived) {
          dataToRestore.ActiveFutureArchived.Value = afterValue;
          console.log(`Updated ActiveFutureArchived.Value to ${afterValue} before restoration`);
        } else {
          // If the structure doesn't exist, create it
          dataToRestore.ActiveFutureArchived = { Value: afterValue };
          console.log(`Created ActiveFutureArchived.Value with ${afterValue} before restoration`);
        }
        
        // Restore the main course data
        await db.ref(restorationData.coursePath).set(dataToRestore);
        console.log(`Restored course data to ${restorationData.coursePath}`);
        
        // Restore previousCourse data separately if it existed
        if (previousCourseToRestore) {
          await db.ref(`${restorationData.coursePath}/previousCourse`).set(previousCourseToRestore);
          if (hasPreviousEnrollmentToRestore) {
            await db.ref(`${restorationData.coursePath}/hasPreviousEnrollment`).set(hasPreviousEnrollmentToRestore);
          }
          console.log(`Restored previousCourse data separately to maintain flat structure`);
        }
      }
    }
    
    // Restore messages
    if (archiveData.courseMessages) {
      const messagePromises = Object.entries(archiveData.courseMessages).map(([messageId, messageData]) => 
        db.ref(`${restorationData.messagesPath}/${messageId}`).set(messageData)
      );
      await Promise.all(messagePromises);
      console.log(`Restored ${Object.keys(archiveData.courseMessages).length} messages`);
    }
    
    // Update the studentCourseSummary to reflect restoration
    const restorationInfo = {
      restoredAt: admin.database.ServerValue.TIMESTAMP,
      restoredFrom: archiveFilePath,
      messageCount: Object.keys(archiveData.courseMessages || {}).length,
      restoredStatus: afterValue
    };
    
    // Add additional info if data was merged with existing enrollment
    if (currentData) {
      restorationInfo.restorationType = 'merged_with_existing';
      restorationInfo.previousEnrollmentSaved = true;
      restorationInfo.notesWereMerged = !!(currentData.jsonStudentNotes || archiveData.courseData.jsonStudentNotes);
    } else {
      restorationInfo.restorationType = 'full_restoration';
    }
    
    await db.ref(`/studentCourseSummaries/${summaryKey}/restorationInfo`).set(restorationInfo);
    
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Restored');
    
    console.log(`Successfully restored data for ${summaryKey}`);
    return null;
    
  } catch (error) {
    console.error('Error restoring data:', error);
    
    // Log the error
    await db.ref('errorLogs/restoreStudentData').push({
      summaryKey,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
    
    // Update status to indicate restoration failure
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Restoration Failed');
    
    throw error;
  }
});

module.exports = {
  archiveStudentDataV2,
  restoreStudentDataV2
};