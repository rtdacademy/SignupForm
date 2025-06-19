// functions/archiveUserActivity.js
const { onValueWritten } = require('firebase-functions/v2/database');
const admin = require('firebase-admin');
const zlib = require('zlib');
const crypto = require('crypto');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Archive user activity sessions when they're marked as ready for archive
const archiveUserActivity = onValueWritten({
  ref: '/users/{uid}/activityTracking/pendingArchive/{sessionId}/readyForArchive',
  region: 'us-central1',
  memory: '512MiB',
  concurrency: 50
}, async (event) => {
  const { uid, sessionId } = event.params;
  
  // Check if value changed to true
  const beforeValue = event.data.before.val();
  const afterValue = event.data.after.val();
  
  if (afterValue !== true || beforeValue === true) {
    console.log(`No action needed: value changed from ${beforeValue} to ${afterValue}`);
    return null;
  }
  
  console.log(`Starting archive process for user ${uid}, session ${sessionId}`);
  
  const db = admin.database();
  const storage = admin.storage().bucket();

  try {
    // Get the session data
    const sessionRef = db.ref(`/users/${uid}/activityTracking/pendingArchive/${sessionId}`);
    const sessionSnapshot = await sessionRef.once('value');
    const sessionData = sessionSnapshot.val();

    if (!sessionData) {
      console.error('Session data not found:', sessionId);
      return null;
    }

    // Get user email for folder organization
    const userRef = db.ref(`/users/${uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();
    const userEmail = userData?.email || 'unknown';

    console.log(`Archiving session ${sessionId} for user ${userEmail}`);

    // Create archive object with metadata
    const archiveData = {
      sessionData: sessionData,
      archiveMetadata: {
        archiveDate: new Date().toISOString(),
        sessionId: sessionId,
        uid: uid,
        userEmail: userEmail,
        sessionStartTime: sessionData.startTime,
        sessionEndTime: sessionData.endTime,
        activityEventCount: sessionData.activityEvents?.length || 0
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

    // Generate file path organized by user and date
    const archiveDate = new Date();
    const year = archiveDate.getFullYear();
    const month = String(archiveDate.getMonth() + 1).padStart(2, '0');
    const day = String(archiveDate.getDate()).padStart(2, '0');
    
    const timestamp = Date.now();
    const uniqueId = crypto.randomBytes(4).toString('hex');
    const fileName = `${sessionId}_${timestamp}_${uniqueId}.json.gz`;
    const filePath = `userActivityLogs/${uid}/${year}/${month}/${day}/${fileName}`;

    // Upload to Cloud Storage
    const file = storage.file(filePath);
    await file.save(compressedBuffer, {
      metadata: {
        contentType: 'application/gzip',
        metadata: {
          uid: uid,
          userEmail: userEmail,
          sessionId: sessionId,
          archiveDate: archiveDate.toISOString(),
          timestamp: timestamp.toString(),
          activityEventCount: (sessionData.activityEvents?.length || 0).toString(),
          sessionStartTime: sessionData.startTime?.toString() || '',
          sessionEndTime: sessionData.endTime?.toString() || ''
        }
      }
    });

    console.log(`Successfully uploaded archive to ${filePath}`);
    
    // Verify the file exists before proceeding with deletion
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('File verification failed after upload');
    }

    // Create archive info record for easy restoration/reference
    const archiveInfo = {
      archivedAt: admin.database.ServerValue.TIMESTAMP,
      archiveFilePath: filePath,
      fileName: fileName,
      fileId: uniqueId,
      sessionId: sessionId,
      activityEventCount: sessionData.activityEvents?.length || 0,
      sessionDuration: sessionData.endTime && sessionData.startTime ? 
        sessionData.endTime - sessionData.startTime : null
    };

    // Store archive info in user's activity history
    await db.ref(`/users/${uid}/activityTracking/archivedSessions/${sessionId}`).set(archiveInfo);

    // Delete the pending archive data
    await sessionRef.remove();
    console.log(`Deleted pending archive data for session ${sessionId}`);

    console.log(`Archive process completed successfully for ${sessionId}`);
    return null;

  } catch (error) {
    console.error('Error archiving user activity:', error);
    
    // Log the error
    await db.ref('errorLogs/archiveUserActivity').push({
      uid,
      sessionId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Mark the session as failed
    await db.ref(`/users/${uid}/activityTracking/pendingArchive/${sessionId}/archiveStatus`).set('Failed');
    
    throw error;
  }
});

// Clean up old activity data (optional - runs daily)
const cleanupOldActivityData = onValueWritten({
  ref: '/maintenance/cleanupActivityData',
  region: 'us-central1',
  memory: '256MiB'
}, async (event) => {
  const shouldRun = event.data.after.val();
  
  if (!shouldRun) return null;
  
  console.log('Starting cleanup of old activity data');
  
  const db = admin.database();
  const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
  
  try {
    // Get all users with pending archive data
    const usersSnapshot = await db.ref('/users').once('value');
    const users = usersSnapshot.val() || {};
    
    const cleanupPromises = [];
    
    Object.keys(users).forEach(uid => {
      if (users[uid].activityTracking?.pendingArchive) {
        const pendingArchive = users[uid].activityTracking.pendingArchive;
        
        Object.entries(pendingArchive).forEach(([sessionId, sessionData]) => {
          // If session is older than cutoff and not marked as ready for archive, auto-archive it
          if (sessionData.endTime && sessionData.endTime < cutoffTime && !sessionData.readyForArchive) {
            cleanupPromises.push(
              db.ref(`/users/${uid}/activityTracking/pendingArchive/${sessionId}/readyForArchive`).set(true)
            );
          }
        });
      }
    });
    
    await Promise.all(cleanupPromises);
    
    // Reset the trigger
    await db.ref('/maintenance/cleanupActivityData').set(false);
    
    console.log(`Cleanup completed, processed ${cleanupPromises.length} sessions`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    await db.ref('/maintenance/cleanupActivityData').set(false);
  }
});

module.exports = {
  archiveUserActivity,
  cleanupOldActivityData
};