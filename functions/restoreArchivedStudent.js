// functions/restoreArchivedStudent.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const zlib = require('zlib');
const { sanitizeEmail } = require('./utils');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Helper function to merge student notes intelligently
 */
function mergeStudentNotes(currentNotes, archivedNotes) {
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
  
  // Convert back to array and sort by timestamp (newest first)
  return Array.from(noteMap.values())
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA; // Descending order (newest first)
    });
}

/**
 * Cloud Function: restoreArchivedStudent
 * 
 * Restores an archived student's data from cold storage
 * Supports different restore modes: check, merge_notes, full_restore
 */
const restoreArchivedStudent = onCall({
  concurrency: 50,
  memory: '1GiB',
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000", "http://localhost:3001"]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  // Verify user has staff permissions
  const uid = request.auth.uid;
  const userEmail = request.auth.token.email;
  
  try {
    // Get the user record to check custom claims
    const userRecord = await admin.auth().getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    // Check if user is staff (through custom claims or email domain)
    const isStaff = customClaims.isStaffUser || 
                    customClaims.staffPermissions?.includes('staff') ||
                    customClaims.roles?.includes('staff') ||
                    (userEmail && (userEmail.endsWith('@rtdacademy.com') || userEmail.endsWith('@rtd-connect.com')));
    
    if (!isStaff) {
      console.log(`Access denied for non-staff user: ${userEmail}`);
      throw new HttpsError('permission-denied', 'Only staff members can restore archived students.');
    }
    
    console.log(`Staff member ${userEmail} restoring archived student`);
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error checking staff permissions:', error);
    throw new HttpsError('internal', 'Failed to verify staff permissions.');
  }

  const { studentEmail, courseId, mode = 'check' } = request.data;
  
  if (!studentEmail || !courseId) {
    throw new HttpsError('invalid-argument', 'Student email and course ID are required.');
  }

  const db = admin.database();
  const storage = admin.storage().bucket();
  
  // Sanitize the email for use as a database key
  const studentKey = sanitizeEmail(studentEmail);
  const summaryKey = `${studentKey}_${courseId}`;
  
  console.log(`Starting restoration process for student ${studentKey}, course ${courseId}, mode: ${mode}`);
  
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
    
    const { archiveFilePath, restorationData } = summaryData.archiveInfo;
    
    // Check current archive status
    const currentStatus = summaryData.ActiveFutureArchived_Value;
    
    // Only require archived status for full_restore mode
    // Allow other modes (check, merge_notes, archive_current) regardless of status
    if (mode === 'full_restore' && currentStatus !== 'Archived') {
      return {
        success: false,
        message: 'Student must be archived for full restoration.',
        currentStatus: currentStatus
      };
    }
    
    console.log(`Processing ${mode} for student with status: ${currentStatus}`);
    
    // Check if there's already course data (new enrollment)
    const currentDataSnapshot = await db.ref(restorationData.coursePath).once('value');
    const currentData = currentDataSnapshot.val();
    
    // If mode is 'check', return information about existing data and check for unique notes
    if (mode === 'check') {
      // We need to check the archive to see if there are unique notes
      let uniqueArchivedNotes = 0;
      let archivedNoteCount = 0;
      
      // Download and check archive data if we have existing data
      if (currentData || currentStatus === 'Active') {
        try {
          // Download the archive to check for unique notes
          const file = storage.file(archiveFilePath);
          const [exists] = await file.exists();
          
          if (exists) {
            const [compressedBuffer] = await file.download();
            const decompressedBuffer = await new Promise((resolve, reject) => {
              zlib.gunzip(compressedBuffer, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
            
            const archiveData = JSON.parse(decompressedBuffer.toString());
            const archivedNotes = archiveData.courseData?.jsonStudentNotes || [];
            const currentNotes = currentData?.jsonStudentNotes || [];
            
            archivedNoteCount = archivedNotes.length;
            
            // Create a Set of current note IDs for quick lookup
            const currentNoteIds = new Set(currentNotes.map(note => note?.id).filter(id => id));
            
            // Count unique archived notes (not in current)
            uniqueArchivedNotes = archivedNotes.filter(note => 
              note?.id && !currentNoteIds.has(note.id)
            ).length;
            
            console.log(`Found ${uniqueArchivedNotes} unique notes in archive out of ${archivedNoteCount} total archived notes`);
          }
        } catch (error) {
          console.error('Error checking archive for unique notes:', error);
        }
      }
      
      if (currentData) {
        // Analyze what's in the current data
        const hasNotes = !!(currentData.jsonStudentNotes && currentData.jsonStudentNotes.length > 0);
        const noteCount = hasNotes ? currentData.jsonStudentNotes.length : 0;
        // Keep enrollmentDate as null if not present, so formatDate can handle it properly
        const enrollmentDate = currentData.Created || null;
        const status = currentData.Status?.Value || 'Unknown';
        
        return {
          success: true,
          mode: 'check',
          hasExistingData: true,
          existingDataInfo: {
            hasNotes: hasNotes,
            noteCount: noteCount,
            enrollmentDate: enrollmentDate,
            status: status,
            schoolYear: currentData.School_x0020_Year?.Value || 'Unknown',
            uniqueArchivedNotes: uniqueArchivedNotes,
            totalArchivedNotes: archivedNoteCount,
            canMergeNotes: uniqueArchivedNotes > 0
          },
          message: 'Existing enrollment found. Choose restore option.',
          archiveFilePath: archiveFilePath
        };
      } else {
        return {
          success: true,
          mode: 'check',
          hasExistingData: false,
          message: 'No existing data. Safe to restore.',
          archiveFilePath: archiveFilePath
        };
      }
    }
    
    // Download and decompress the archive
    const file = storage.file(archiveFilePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new HttpsError('not-found', `Archive file not found: ${archiveFilePath}`);
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
    console.log(`Archive data decompressed successfully`);
    
    // Handle different restore modes
    if (mode === 'merge_notes') {
      // Only merge notes from archived data with current enrollment
      if (!currentData) {
        throw new HttpsError('failed-precondition', 'No current enrollment to merge notes with.');
      }
      
      const archivedNotes = archiveData.courseData?.jsonStudentNotes || [];
      const currentNotes = currentData.jsonStudentNotes || [];
      
      // First merge the notes
      const mergedNotes = mergeStudentNotes(currentNotes, archivedNotes);
      
      // Add a system note about the merge
      const mergeNote = {
        id: `note-merge-${Date.now()}`,
        author: 'System',
        content: `📂 Merged ${archivedNotes.length} notes from archived enrollment with ${currentNotes.length} notes from current enrollment.`,
        noteType: '📂',
        timestamp: new Date().toISOString()
      };
      mergedNotes.push(mergeNote);
      
      // Sort again after adding the merge note to ensure proper order (newest first)
      const finalNotes = mergedNotes.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      // Update only the notes
      await db.ref(`${restorationData.coursePath}/jsonStudentNotes`).set(finalNotes);
      
      // Update restoration info - add to archiveInfo to preserve archive reference
      await db.ref(`studentCourseSummaries/${summaryKey}/archiveInfo/restorationInfo`).set({
        restoredAt: admin.database.ServerValue?.TIMESTAMP || Date.now(),
        restoredFrom: archiveFilePath,
        restoredBy: request.auth.uid,
        restoredByEmail: request.auth.token.email,
        restorationType: 'notes_merge',
        notesArchivedCount: archivedNotes.length,
        notesCurrentCount: currentNotes.length,
        notesMergedTotal: mergedNotes.length
      });
      
      console.log(`Successfully merged notes for ${summaryKey}`);
      
      return {
        success: true,
        mode: 'merge_notes',
        message: `Successfully merged ${archivedNotes.length} archived notes with ${currentNotes.length} current notes.`,
        totalNotes: mergedNotes.length
      };
      
    } else if (mode === 'full_restore') {
      // Full restoration - will overwrite any existing data
      if (currentData) {
        console.log(`WARNING: Overwriting existing data at ${restorationData.coursePath}`);
      }
      
      // Restore course data
      if (archiveData.courseData && restorationData.courseDataExists) {
        // Simply restore the complete course data as it was archived
        let dataToRestore = archiveData.courseData;
        
        // Update the ActiveFutureArchived.Value to Active
        if (dataToRestore.ActiveFutureArchived) {
          dataToRestore.ActiveFutureArchived.Value = 'Active';
        } else {
          dataToRestore.ActiveFutureArchived = { Value: 'Active' };
        }
        
        // Restore the complete course data
        await db.ref(restorationData.coursePath).set(dataToRestore);
        console.log(`Restored complete course data to ${restorationData.coursePath}`);
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
        restoredAt: admin.database.ServerValue?.TIMESTAMP || Date.now(),
        restoredFrom: archiveFilePath,
        restoredBy: request.auth.uid,
        restoredByEmail: request.auth.token.email,
        messageCount: Object.keys(archiveData.courseMessages || {}).length,
        restoredStatus: 'Active',
        restorationType: 'full_restore',
        overwroteExisting: !!currentData
      };
      
      // Update the summary with restoration info and status
      // Keep archiveInfo but add restorationInfo to track that it was restored
      await db.ref(`studentCourseSummaries/${summaryKey}`).update({
        'archiveInfo/restorationInfo': restorationInfo,
        'archiveInfo/lastRestoredAt': restorationInfo.restoredAt,
        archiveStatus: 'Restored',
        ActiveFutureArchived_Value: 'Active'
      });
      
      console.log(`Successfully restored data for ${summaryKey}`);
      
      return {
        success: true,
        mode: 'full_restore',
        message: currentData 
          ? 'Student data fully restored from archive (existing data was overwritten).'
          : 'Student data fully restored from archive.',
        messagesRestored: Object.keys(archiveData.courseMessages || {}).length
      };
      
    } else if (mode === 'archive_current') {
      // Archive current enrollment before restoring old one
      if (!currentData) {
        throw new HttpsError('failed-precondition', 'No current enrollment to archive.');
      }
      
      // Generate a new archive for the current enrollment
      const timestamp = Date.now();
      const crypto = require('crypto');
      const uniqueId = crypto.randomBytes(8).toString('hex');
      const fileName = `archive_current_${timestamp}_${uniqueId}.json.gz`;
      const filePath = `coldStorage/${fileName}`;
      
      // Create archive of current data
      const currentArchiveData = {
        studentCourseSummary: summaryData,
        courseData: currentData,
        courseMessages: {}, // Would need to fetch if needed
        archiveMetadata: {
          archiveDate: new Date().toISOString(),
          summaryKey: summaryKey,
          studentKey: studentKey,
          studentEmail: studentEmail,
          courseId: courseId,
          reason: 'Archived before restoring previous enrollment',
          archivedBy: request.auth.uid
        }
      };
      
      // Compress and save
      const jsonString = JSON.stringify(currentArchiveData);
      const compressedBuffer = await new Promise((resolve, reject) => {
        zlib.gzip(jsonString, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      // Upload to Cloud Storage
      const newFile = storage.file(filePath);
      await newFile.save(compressedBuffer, {
        metadata: {
          contentType: 'application/gzip',
          metadata: {
            studentKey: studentKey,
            studentEmail: studentEmail,
            courseId: courseId.toString(),
            archiveDate: new Date().toISOString(),
            summaryKey: summaryKey,
            timestamp: timestamp.toString(),
            reason: 'current_enrollment_backup'
          }
        }
      });
      
      console.log(`Archived current enrollment to ${filePath}`);
      
      // Update archive info to track multiple archives
      const updatedArchiveInfo = {
        ...summaryData.archiveInfo,
        previousArchives: [
          ...(summaryData.archiveInfo.previousArchives || []),
          {
            archiveFilePath: filePath,
            fileName: fileName,
            fileId: uniqueId,
            archivedAt: timestamp,
            reason: 'Current enrollment archived before restoration',
            schoolYear: currentData.School_x0020_Year?.Value || 'Unknown'
          }
        ]
      };
      
      await db.ref(`studentCourseSummaries/${summaryKey}/archiveInfo`).set(updatedArchiveInfo);
      
      // Now restore the original archived data
      let dataToRestore = archiveData.courseData;
      if (dataToRestore.ActiveFutureArchived) {
        dataToRestore.ActiveFutureArchived.Value = 'Active';
      } else {
        dataToRestore.ActiveFutureArchived = { Value: 'Active' };
      }
      
      await db.ref(restorationData.coursePath).set(dataToRestore);
      
      // Restore messages
      if (archiveData.courseMessages) {
        const messagePromises = Object.entries(archiveData.courseMessages).map(([messageId, messageData]) => 
          db.ref(`${restorationData.messagesPath}/${messageId}`).set(messageData)
        );
        await Promise.all(messagePromises);
      }
      
      // Update status
      await db.ref(`studentCourseSummaries/${summaryKey}`).update({
        archiveStatus: 'Restored',
        ActiveFutureArchived_Value: 'Active'
      });
      
      return {
        success: true,
        mode: 'archive_current',
        message: 'Current enrollment archived and previous enrollment restored.',
        currentArchivedTo: filePath,
        restoredFrom: archiveFilePath
      };
    }
    
    throw new HttpsError('invalid-argument', `Invalid restore mode: ${mode}`);
    
  } catch (error) {
    console.error('Error restoring data:', error);
    
    // Log the error
    await db.ref('errorLogs/restoreStudentData').push({
      summaryKey,
      studentEmail,
      courseId,
      mode,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      triggeredBy: request.auth.uid
    });
    
    // Update status to indicate restoration failure
    await db.ref(`studentCourseSummaries/${summaryKey}/archiveStatus`).set('Restoration Failed');
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to restore student data. ' + error.message);
  }
});

module.exports = restoreArchivedStudent;