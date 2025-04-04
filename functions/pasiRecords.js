const { onCall } = require('firebase-functions/v2/https');
const { onValueDeleted } = require('firebase-functions/v2/database');

// Other dependencies
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: cleanupOrphanedPasiLinksV2
 * 
 * This function scans all PASI links and cleans up orphaned links
 * with concurrent batch processing for improved performance.
 * Updated to handle up to 10,000 records with enhanced concurrency.
 */
const cleanupOrphanedPasiLinksV2 = onCall({
  timeoutSeconds: 540,   // 9 minutes
  memory: '2GiB',        // Increased memory for larger workloads
  maxInstances: 10,      // Allow more instances to run concurrently
  concurrency: 50,       // Increase concurrency per instance
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]  // Added CORS config here
}, async (data) => {
  const db = admin.database();
  console.log('Starting cleanup of orphaned PASI links...');
  
  const results = {
    processed: 0,
    deleted: 0,
    errors: 0,
    details: []
  };
  
  try {
    // 1. Retrieve all PASI links
    const linksSnapshot = await db.ref('pasiLinks').once('value');
    if (!linksSnapshot.exists()) {
      console.log('No PASI links found. Nothing to cleanup.');
      return { 
        success: true, 
        message: 'No PASI links found. Nothing to cleanup.',
        results 
      };
    }
    
    // 2. Collect links into an array
    const links = [];
    linksSnapshot.forEach(snapshot => {
      links.push({
        id: snapshot.key,
        data: snapshot.val()
      });
    });
    
    results.total = links.length;
    console.log(`Found ${links.length} PASI links to check`);
    
    // Define batch parameters:
    // - BATCH_SIZE: how many links to process in one update call
    // - CONCURRENT_BATCHES: how many batches to process in parallel
    const BATCH_SIZE = 100;
    const CONCURRENT_BATCHES = 20;
    
    const batches = [];
    for (let i = 0; i < links.length; i += BATCH_SIZE) {
      batches.push(links.slice(i, i + BATCH_SIZE));
    }
    
    // Process the batches in groups to control parallelism
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
              
              // Skip links missing required fields
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
              const pasiRecordExists = await db.ref(`pasiRecords/${pasiRecordId}`)
                                                .once('value')
                                                .then(snap => snap.exists());
              
              // Check if student course summary exists
              const studentCourseSummaryExists = await db.ref(`studentCourseSummaries/${studentCourseSummaryKey}`)
                                                           .once('value')
                                                           .then(snap => snap.exists());
              
              // Case 1: Both exist - verify link reference in student course summary
              if (pasiRecordExists && studentCourseSummaryExists) {
                const pasiRefInSummary = await db.ref(`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`)
                                                  .once('value');
                
                if (!pasiRefInSummary.exists()) {
                  // If missing, add the reference
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
              
              // Case 2 & 3: If student course summary doesn't exist (or both are missing)
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
              
              // Case 4: PASI record is missing while student course summary exists
              if (!pasiRecordExists && studentCourseSummaryExists) {
                updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
                batchDetails.updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
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
          
          // Apply all updates at once for this batch
          if (Object.keys(updates).length > 0) {
            await db.ref().update(updates);
            console.log(`Batch ${batchNumber}: Applied ${Object.keys(updates).length} updates`);
          } else {
            console.log(`Batch ${batchNumber}: No updates needed`);
          }
          
          return batchDetails;
        })
      );
      
      // Consolidate results from the current group of batches
      batchResults.forEach(batchResult => {
        results.processed += batchResult.processedCount;
        results.deleted += batchResult.deletedCount;
        results.errors += batchResult.errorCount;
        results.details = results.details.concat(batchResult.detailsList);
      });
      
      // Log progress after each group
      console.log(`Progress: ${Math.round((results.processed / links.length) * 100)}% complete (${results.processed}/${links.length})`);
    }
    
    // Log the cleanup results for audit purposes - FIXED HERE
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
    
    // Log the error details - FIXED HERE
    await db.ref('errorLogs/cleanupOrphanedPasiLinks').push({
      error: error.message,
      stack: error.stack,
      timestamp:  admin.database.ServerValue.TIMESTAMP,  
      results
    });
    
    throw new Error(`Error during PASI link cleanup: ${error.message}`);
  }
});

/**
 * Cloud Function: cleanupDeletedPasiRecordV2
 * 
 * Triggered when a PASI record is deleted.
 * Cleans up associated data by:
 * 1. Finding the corresponding link(s) using pasiRecordId
 * 2. Removing the record reference from studentCourseSummaries
 * 3. Deleting the orphaned link(s)
 * Updated to support higher concurrency.
 */
const cleanupDeletedPasiRecordV2 = onValueDeleted({
  ref: '/pasiRecords/{pasiRecordId}',
  region: 'us-central1',
  memory: '256MiB',
  maxInstances: 50  // Increase max instances to handle many deletions concurrently
}, async (event) => {
  const pasiRecordId = event.params.pasiRecordId;
  const deletedData = event.data.val();
  const db = admin.database();
  
  console.log(`PASI record deleted: ${pasiRecordId}. Starting cleanup process...`);

  try {
    // 1. Query pasiLinks by pasiRecordId
    const pasiLinksRef = db.ref('pasiLinks');
    const query = pasiLinksRef.orderByChild('pasiRecordId').equalTo(pasiRecordId);
    const linksSnapshot = await query.once('value');
    
    if (!linksSnapshot.exists()) {
      console.log(`No linked data found for PASI record: ${pasiRecordId}. No cleanup needed.`);
      return null;
    }
    
    // 2. Build a batch update to remove orphaned links and references
    const updates = {};
    linksSnapshot.forEach((linkSnapshot) => {
      const linkId = linkSnapshot.key;
      const linkData = linkSnapshot.val();
      const studentCourseSummaryKey = linkData.studentCourseSummaryKey;
      const courseCode = linkData.courseCode;
      
      console.log(`Found link: ${linkId} for PASI record: ${pasiRecordId}`);
      
      if (studentCourseSummaryKey && courseCode) {
        updates[`studentCourseSummaries/${studentCourseSummaryKey}/pasiRecords/${courseCode}`] = null;
        console.log(`Marked for removal: PASI record reference from studentCourseSummary ${studentCourseSummaryKey} (courseCode: ${courseCode})`);
      }
      
      updates[`pasiLinks/${linkId}`] = null;
      console.log(`Marked for deletion: pasiLink ${linkId}`);
    });
    
    // 3. Execute the batch update
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log(`Successfully cleaned up all associated data for PASI record: ${pasiRecordId}`);
    }
    
    // 4. Log the deletion event for auditing - FIXED HERE
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
    
    // Log error details for debugging purposes - FIXED HERE
    await db.ref('errorLogs/cleanupDeletedPasiRecord').push({
      pasiRecordId,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,  
    });
    
    throw error;
  }
});

module.exports = {
  cleanupDeletedPasiRecordV2,
  cleanupOrphanedPasiLinksV2
};