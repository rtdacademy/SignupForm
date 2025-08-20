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
  ref: '/students/{studentKey}/courses/{courseId}/ColdStorage',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 80
}, async (event) => {
  const studentKey = event.params.studentKey;
  const courseId = event.params.courseId;
  
  // Check if value changed to true
  const beforeValue = event.data.before.val();
  const afterValue = event.data.after.val();
  
  if (afterValue !== true || beforeValue === true) {
    console.log(`No action needed: ColdStorage changed from ${beforeValue} to ${afterValue}`);
    return null;
  }
  
  // Construct the summaryKey from studentKey and courseId
  const summaryKey = `${studentKey}_${courseId}`;
  console.log(`Starting archive process for student: ${studentKey}, course: ${courseId}, summaryKey: ${summaryKey}`);
  
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
    const asn = summaryData.asn;
    const lmsStudentId = summaryData.LMSStudentID;

    console.log(`Archiving data for student ${studentKey}, course ${courseId}`);

    // Fetch related data - archive EVERYTHING including previousCourse
    const courseSnapshot = await db.ref(`/students/${studentKey}/courses/${courseId}`).once('value');
    const courseData = courseSnapshot.val();
    
    if (courseData) {
      console.log(`Archiving complete course data for ${studentKey}/${courseId}`);
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
      archivedAt: admin.database.ServerValue?.TIMESTAMP || Date.now(),
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

    // Delete entire course data - no preservation of any folders
    if (courseData) {
      await db.ref(`/students/${studentKey}/courses/${courseId}`).remove();
      console.log(`Completely deleted course data for ${studentKey}/${courseId}`);
    }

    // Delete messages for this course
    if (messageKeysToDelete.length > 0) {
      const deletePromises = messageKeysToDelete.map(messageId => 
        db.ref(`/userEmails/${studentKey}/${messageId}`).remove()
      );
      await Promise.all(deletePromises);
      console.log(`Deleted ${messageKeysToDelete.length} messages for ${studentKey}`);
    }

    // Update ColdStorage status to completed
    await db.ref(`/students/${studentKey}/courses/${courseId}/ColdStorage`).set('completed');
    // Also update archive status in summary for backward compatibility
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Completed');

    console.log(`Archive process completed successfully for ${summaryKey}`);
    return null;

  } catch (error) {
    console.error('Error archiving student data:', error);
    
    // Log the error
    await db.ref('errorLogs/archiveStudentData').push({
      studentKey,
      courseId,
      summaryKey,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue?.TIMESTAMP || Date.now()
    });

    // Update the status to indicate failure
    await db.ref(`/students/${studentKey}/courses/${courseId}/ColdStorage`).set('failed');
    // Also update archive status in summary for backward compatibility
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Failed');
    
    throw error;
  }
});

// Export only the archive function
// Restoration is now handled by the callable function restoreArchivedStudent
module.exports = {
  archiveStudentDataV2
};