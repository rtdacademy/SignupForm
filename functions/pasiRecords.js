const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: cleanupOrphanedPasiLinks
 * 
 * This function scans all PASI links and cleans up orphaned links
 * with concurrent batch processing for improved performance.
 */
const cleanupOrphanedPasiLinks = functions.runWith({
  timeoutSeconds: 540,  // 9 minutes (max is 540 seconds)
  memory: '1GB',       
  maxInstances: 1       
}).https.onCall(async (data, context) => {
  const db = admin.database();
  console.log('Starting cleanup of orphaned PASI links...');
  
  const results = {
    processed: 0,
    deleted: 0,
    errors: 0,
    details: []
  };
  
  try {
    // 1. Get all pasiLinks
    const linksSnapshot = await db.ref('pasiLinks').once('value');
    if (!linksSnapshot.exists()) {
      console.log('No PASI links found. Nothing to cleanup.');
      return { 
        success: true, 
        message: 'No PASI links found. Nothing to cleanup.',
        results 
      };
    }
    
    // 2. Process each link in batches to avoid timeouts
    const links = [];
    linksSnapshot.forEach(snapshot => {
      links.push({
        id: snapshot.key,
        data: snapshot.val()
      });
    });
    
    results.total = links.length;
    console.log(`Found ${links.length} PASI links to check`);
    
    // Process in batches of 50
    const BATCH_SIZE = 50;
    const CONCURRENT_BATCHES = 8; // Process 8 batches concurrently
    
    const batches = [];
    for (let i = 0; i < links.length; i += BATCH_SIZE) {
      batches.push(links.slice(i, i + BATCH_SIZE));
    }
    
    // Process batches in groups
    for (let groupIndex = 0; groupIndex < batches.length; groupIndex += CONCURRENT_BATCHES) {
      const batchGroup = batches.slice(groupIndex, groupIndex + CONCURRENT_BATCHES);
      console.log(`Processing batch group ${Math.floor(groupIndex / CONCURRENT_BATCHES) + 1} (${batchGroup.length} batches)`);
      
      const batchResults = await Promise.all(
        batchGroup.map(async (batch, batchIdx) => {
          const batchNumber = groupIndex + batchIdx + 1;
          console.log(`Starting batch ${batchNumber}/${batches.length} (${batch.length} links)`);
          
          const updates = {};
          const batchDetails = {
            processedCount: 0,
            deletedCount: 0,
            errorCount: 0,
            detailsList: [],
            updates: {}
          };
          
          for (const link of batch) {
            try {
              batchDetails.processedCount++;
              const { id, data } = link;
              const { pasiRecordId, studentCourseSummaryKey, courseCode } = data;
              
              // Skip links without basic required data
              if (!pasiRecordId || !studentCourseSummaryKey || !courseCode) {
                console.log(`Link ${id} is missing required fields. Deleting.`);
                updates[`pasiLinks/${id}`] = null;
                batchDetails.updates[`pasiLinks/${id}`] = null;
                batchDetails.deletedCount++;
                batchDetails.detailsList.push({
                  linkId: id,
                  reason: 'Missing required fields',
                  action: 'Deleted link'
                });
                continue;
              }
              
              // Check if PASI record exists
              const pasiRecordExists = await db.ref(`pasiRecords/${pasiRecordId}`).once('value').then(snap => snap.exists());
              
              // Check if student course summary exists
              const studentCourseSummaryExists = await db.ref(`studentCourseSummaries/${studentCourseSummaryKey}`).once('value').then(snap => snap.exists());
              
              // Case 1: Both exist - keep the link
              if (pasiRecordExists && studentCourseSummaryExists) {
                // Verify that the link is correctly set in studentCourseSummaries
                const pasiRefInSummary = await db.ref(`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`).once('value');
                
                if (!pasiRefInSummary.exists()) {
                  // The link is correct but reference is missing, add it
                  updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = true;
                  batchDetails.updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = true;
                  batchDetails.detailsList.push({
                    linkId: id,
                    reason: 'Reference missing in student course summary',
                    action: 'Added missing reference'
                  });
                }
                
                continue;
              }
              
              // Case 2 & 3: If student course summary doesn't exist or both don't exist
              if (!studentCourseSummaryExists) {
                updates[`pasiLinks/${id}`] = null;
                batchDetails.updates[`pasiLinks/${id}`] = null;
                batchDetails.deletedCount++;
                batchDetails.detailsList.push({
                  linkId: id,
                  reason: !pasiRecordExists ? 'Both PASI record and student course summary missing' : 'Student course summary missing',
                  action: 'Deleted link'
                });
                continue;
              }
              
              // Case 4: Only PASI record doesn't exist
              if (!pasiRecordExists && studentCourseSummaryExists) {
                // Remove the reference from studentCourseSummary using courseCode
                updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
                batchDetails.updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
                
                // Delete the link
                updates[`pasiLinks/${id}`] = null;
                batchDetails.updates[`pasiLinks/${id}`] = null;
                batchDetails.deletedCount++;
                batchDetails.detailsList.push({
                  linkId: id,
                  reason: 'PASI record missing',
                  action: 'Removed reference from student course summary and deleted link'
                });
              }
            } catch (error) {
              console.error(`Error processing link ${link.id}:`, error);
              batchDetails.errorCount++;
              batchDetails.detailsList.push({
                linkId: link.id,
                error: error.message,
                action: 'Skipped due to error'
              });
            }
          }
          
          // Apply updates in a single batch for efficiency
          if (Object.keys(updates).length > 0) {
            await db.ref().update(updates);
            console.log(`Batch ${batchNumber}: Applied ${Object.keys(updates).length} updates`);
          } else {
            console.log(`Batch ${batchNumber}: No updates needed`);
          }
          
          return batchDetails;
        })
      );
      
      // Consolidate batch results
      batchResults.forEach(batchResult => {
        results.processed += batchResult.processedCount;
        results.deleted += batchResult.deletedCount;
        results.errors += batchResult.errorCount;
        results.details = [...results.details, ...batchResult.detailsList];
      });
      
      // Log progress after each group
      console.log(`Progress: ${Math.round((results.processed / links.length) * 100)}% complete (${results.processed}/${links.length})`);
    }
    
    // Log the cleanup results for audit purposes
    await db.ref('logs/pasiLinkCleanups').push({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      results: {
        total: results.total,
        processed: results.processed,
        deleted: results.deleted,
        errors: results.errors
      }
    });
    
    console.log(`PASI link cleanup completed: Processed ${results.processed}, Deleted ${results.deleted}, Errors ${results.errors}`);
    
    return {
      success: true,
      message: `PASI link cleanup completed successfully. Processed ${results.processed}, deleted ${results.deleted} orphaned links.`,
      results
    };
    
  } catch (error) {
    console.error('Error during PASI link cleanup:', error);
    
    // Log the error
    await db.ref('errorLogs/cleanupOrphanedPasiLinks').push({
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      results
    });
    
    // For callable functions, we throw a HttpsError
    throw new functions.https.HttpsError('internal', `Error during PASI link cleanup: ${error.message}`, { 
      partial_results: results 
    });
  }
});

/**
 * Cloud Function: cleanupDeletedPasiRecord
 * 
 * This function is triggered when a PASI record is deleted.
 * It cleans up all the associated data:
 * 1. Finds the corresponding link using pasiRecordId
 * 2. Gets the studentCourseSummaryKey from that link
 * 3. Removes the record reference from studentCourseSummaries
 * 4. Deletes the link
 */
const cleanupDeletedPasiRecord = functions.database
  .ref('/pasiRecords/{pasiRecordId}')
  .onDelete(async (snapshot, context) => {
    const { pasiRecordId } = context.params;
    const deletedData = snapshot.val();
    const db = admin.database();
    
    console.log(`PASI record deleted: ${pasiRecordId}. Starting cleanup process...`);

    try {
      // 1. Find the corresponding link by querying pasiLinks by pasiRecordId
      const pasiLinksRef = db.ref('pasiLinks');
      const query = pasiLinksRef.orderByChild('pasiRecordId').equalTo(pasiRecordId);
      const linksSnapshot = await query.once('value');
      
      if (!linksSnapshot.exists()) {
        console.log(`No linked data found for PASI record: ${pasiRecordId}. No cleanup needed.`);
        return null;
      }
      
      // Process each link (normally there should be just one, but let's handle multiple just in case)
      const updates = {};
      
      linksSnapshot.forEach((linkSnapshot) => {
        const linkId = linkSnapshot.key;
        const linkData = linkSnapshot.val();
        const studentCourseSummaryKey = linkData.studentCourseSummaryKey;
        const courseCode = linkData.courseCode; // Make sure to use courseCode
        
        console.log(`Found link: ${linkId} for PASI record: ${pasiRecordId}`);
        
        if (studentCourseSummaryKey && courseCode) {
          // Remove the PASI record reference from student course summary using courseCode
          updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
          console.log(`Marked for removal: PASI record reference from studentCourseSummary: ${studentCourseSummaryKey}, courseCode: ${courseCode}`);
        }
        
        // Mark the link for deletion
        updates[`pasiLinks/${linkId}`] = null;
        console.log(`Marked for deletion: pasiLink: ${linkId}`);
      });
      
      // Apply all updates in a single batch
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log(`Successfully cleaned up all associated data for PASI record: ${pasiRecordId}`);
      }
      
      // Log the deletion event for audit purposes
      await db.ref('logs/pasiRecordDeletions').push({
        pasiRecordId,
        studentName: deletedData?.studentName || 'Unknown',
        courseCode: deletedData?.courseCode || 'Unknown',
        deletionTime: admin.database.ServerValue.TIMESTAMP,
        linksRemoved: Object.keys(linksSnapshot.val() || {}).length
      });
      
      return null;
    } catch (error) {
      console.error(`Error cleaning up PASI record: ${pasiRecordId}`, error);
      
      // Log the error for debugging
      await db.ref('errorLogs/cleanupDeletedPasiRecord').push({
        pasiRecordId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });
      
      // Re-throw to mark the function as failed
      throw error;
    }
  });

module.exports = {
  cleanupDeletedPasiRecord,
  cleanupOrphanedPasiLinks
};