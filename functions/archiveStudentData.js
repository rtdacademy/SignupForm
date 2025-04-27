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
    const courseData = courseSnapshot.val();

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

    // Delete course data if it exists
    if (courseData) {
      await db.ref(`/students/${studentKey}/courses/${courseId}`).remove();
      console.log(`Deleted course data for ${studentKey}/${courseId}`);
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
    
    // Restore course data
    if (archiveData.courseData && restorationData.courseDataExists) {
      // Update the ActiveFutureArchived.Value before restoration to prevent triggering archive function
      if (archiveData.courseData.ActiveFutureArchived) {
        archiveData.courseData.ActiveFutureArchived.Value = afterValue;
        console.log(`Updated ActiveFutureArchived.Value to ${afterValue} before restoration`);
      } else {
        // If the structure doesn't exist, create it
        archiveData.courseData.ActiveFutureArchived = { Value: afterValue };
        console.log(`Created ActiveFutureArchived.Value with ${afterValue} before restoration`);
      }
      
      await db.ref(restorationData.coursePath).set(archiveData.courseData);
      console.log(`Restored course data to ${restorationData.coursePath}`);
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
    await db.ref(`/studentCourseSummaries/${summaryKey}/restorationInfo`).set({
      restoredAt: admin.database.ServerValue.TIMESTAMP,
      restoredFrom: archiveFilePath,
      messageCount: Object.keys(archiveData.courseMessages || {}).length,
      restoredStatus: afterValue
    });
    
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