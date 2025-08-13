// functions/viewArchivedData.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const zlib = require('zlib');
const { sanitizeEmail } = require('./utils');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: viewArchivedData
 * 
 * Views archived student data from cold storage without modifying it
 * Returns the decompressed JSON data for inspection
 */
const viewArchivedData = onCall({
  concurrency: 50,
  memory: '1GiB',
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000", "http://localhost:3001"]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  // TODO: Add admin check when custom claims are available
  // For now, we'll rely on database rules or manual verification

  const { studentEmail, courseId } = request.data;
  
  if (!studentEmail || !courseId) {
    throw new HttpsError('invalid-argument', 'Student email and course ID are required.');
  }

  const db = admin.database();
  const storage = admin.storage().bucket();
  
  // Sanitize the email for use as a database key
  const studentKey = sanitizeEmail(studentEmail);
  const summaryKey = `${studentKey}_${courseId}`;
  
  console.log(`Viewing archived data for student ${studentKey}, course ${courseId}`);
  
  try {
    // Get archive info from studentCourseSummary
    const summarySnapshot = await db.ref(`studentCourseSummaries/${summaryKey}`).once('value');
    const summaryData = summarySnapshot.val();
    
    if (!summaryData) {
      throw new HttpsError('not-found', 'Student course summary not found.');
    }
    
    if (!summaryData.archiveInfo) {
      throw new HttpsError('failed-precondition', 'No archive information found. This student may not be archived.');
    }
    
    const { archiveFilePath } = summaryData.archiveInfo;
    const currentStatus = summaryData.ActiveFutureArchived_Value;
    
    // Allow viewing archive data anytime it exists, regardless of current status
    console.log(`Viewing archive for student with status: ${currentStatus}`);
    
    // Download and decompress the archive
    const file = storage.file(archiveFilePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new HttpsError('not-found', `Archive file not found: ${archiveFilePath}`);
    }
    
    console.log(`Downloading archive from ${archiveFilePath}`);
    
    // Get file metadata for size information
    const [metadata] = await file.getMetadata();
    const compressedSize = parseInt(metadata.size);
    
    // Download the compressed file
    const [compressedBuffer] = await file.download();
    
    // Decompress the data
    const decompressedBuffer = await new Promise((resolve, reject) => {
      zlib.gunzip(compressedBuffer, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    const archiveData = JSON.parse(decompressedBuffer.toString());
    const decompressedSize = decompressedBuffer.length;
    
    console.log(`Archive data retrieved successfully. Compressed: ${compressedSize} bytes, Decompressed: ${decompressedSize} bytes`);
    
    // Calculate statistics
    const stats = {
      compressedSize: compressedSize,
      decompressedSize: decompressedSize,
      compressionRatio: ((1 - (compressedSize / decompressedSize)) * 100).toFixed(2) + '%',
      messageCount: Object.keys(archiveData.courseMessages || {}).length,
      hasStudentNotes: !!(archiveData.courseData?.jsonStudentNotes?.length),
      noteCount: archiveData.courseData?.jsonStudentNotes?.length || 0,
      hasPreviousEnrollments: !!(archiveData.courseData?.previousCourse || archiveData.courseData?.hadPreviousEnrollments),
      archiveDate: archiveData.archiveMetadata?.archiveDate,
      filePath: archiveFilePath
    };
    
    // Structure the response with sections
    const response = {
      success: true,
      stats: stats,
      data: {
        archiveMetadata: archiveData.archiveMetadata || {},
        studentCourseSummary: archiveData.studentCourseSummary || {},
        courseData: archiveData.courseData || {},
        courseMessages: archiveData.courseMessages || {}
      },
      // Include current summary data for comparison
      currentSummaryData: {
        archiveInfo: summaryData.archiveInfo,
        archiveStatus: summaryData.archiveStatus,
        ActiveFutureArchived_Value: summaryData.ActiveFutureArchived_Value
      }
    };
    
    return response;
    
  } catch (error) {
    console.error('Error viewing archived data:', error);
    
    // Log the error
    await db.ref('errorLogs/viewArchivedData').push({
      summaryKey,
      studentEmail,
      courseId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      triggeredBy: request.auth.uid
    });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to view archived data. ' + error.message);
  }
});

module.exports = viewArchivedData;