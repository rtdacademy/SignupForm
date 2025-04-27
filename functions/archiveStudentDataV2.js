// functions/archiveStudentDataV2.js (updated)
const { onValueWritten } = require('firebase-functions/v2/database');
const admin = require('firebase-admin');
const zlib = require('zlib');
const { sanitizeEmail } = require('./utils');
const crypto = require('crypto');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const archiveStudentDataV2 = onValueWritten({
  ref: '/studentCourseSummaries/{summaryKey}/ActiveFutureArchived_Value',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 80
}, async (event) => {
  const summaryKey = event.params.summaryKey;
  
  // Check if value changed to "Cold Storage"
  const beforeValue = event.data.before.val();
  const afterValue = event.data.after.val();
  
  if (afterValue !== 'Cold Storage' || beforeValue === 'Cold Storage') {
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
    const courseData = courseSnapshot.val();

    // Fetch messages for this course
    const messagesSnapshot = await db.ref(`/userEmails/${studentKey}`).once('value');
    const allMessages = messagesSnapshot.val() || {};
    
    // Filter messages for this specific course
    const courseMessages = {};
    Object.entries(allMessages).forEach(([messageId, message]) => {
      if (message && message.courseId === courseId) {
        courseMessages[messageId] = message;
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

    console.log(`Successfully archived data to ${filePath}`);
    
    // Update the database to indicate successful archival
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveInfo`).set({
      archivedAt: admin.database.ServerValue.TIMESTAMP,
      archiveFilePath: filePath,
      fileName: fileName,
      fileId: uniqueId
    });

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

    // Optionally, update the status to indicate failure
    await db.ref(`/studentCourseSummaries/${summaryKey}/archiveStatus`).set('Failed');
    
    throw error;
  }
});

module.exports = {
  archiveStudentDataV2
};