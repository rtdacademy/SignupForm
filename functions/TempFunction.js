// TempFunctions.js
const admin = require('firebase-admin');
const { onCall } = require('firebase-functions/v2/https');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const cleanupIncorrectRootNodes = onCall({
    timeoutSeconds: 540,  // 9 minutes
    memory: '2GiB',       // Increased memory for larger workloads
    maxInstances: 10      // Allow more instances to run concurrently
  }, async (data) => {
    const db = admin.database();
    console.log('Starting cleanup of incorrect root nodes with @ character...');
    
    const results = {
      processed: 0,
      deleted: 0,
      errors: 0,
      details: []
    };
    
    try {
      // 1. Get all root nodes
      const rootSnapshot = await db.ref().once('value');
      if (!rootSnapshot.exists()) {
        console.log('No root nodes found. Nothing to cleanup.');
        return { 
          success: true, 
          message: 'No root nodes found. Nothing to cleanup.',
          results 
        };
      }
      
      // 2. List of known valid root nodes to preserve
      const validRootNodes = [
        'pricing', 'adminEmails', 'sendGridTracking', 'users', 
        'registrationSettings', 'ImportantDates', 'courses', 'payments',
        'students', 'staff', 'studentCourseSummaries', 'pasiRecords',
        'allPayments', 'chats', 'userChats', 'Admin', 'invoices', 'lti',
        'imathas_grades', 'edbotz', 'logs', 'errorLogs', 'pasiLinks', 'functions'
      ];
      
      // 3. Identify nodes to delete - those containing '@' character
      const nodesToDelete = [];
      
      rootSnapshot.forEach(childSnapshot => {
        const nodeKey = childSnapshot.key;
        
        // Skip known valid nodes
        if (validRootNodes.includes(nodeKey)) {
          console.log(`Preserving valid node: ${nodeKey}`);
          return;
        }
        
        // Check if node contains '@' character
        if (nodeKey.includes('@')) {
          nodesToDelete.push({
            key: nodeKey,
            size: JSON.stringify(childSnapshot.val()).length
          });
        }
      });
      
      results.total = nodesToDelete.length;
      console.log(`Found ${nodesToDelete.length} incorrect root nodes with @ character to delete`);
      
      // 4. Delete nodes in batches
      const BATCH_SIZE = 20; // Smaller batch size for deletion operations
      
      const batches = [];
      for (let i = 0; i < nodesToDelete.length; i += BATCH_SIZE) {
        batches.push(nodesToDelete.slice(i, i + BATCH_SIZE));
      }
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Processing deletion batch ${batchIndex + 1}/${batches.length} (${batch.length} nodes)`);
        
        const updates = {};
        const batchDetails = {
          processedCount: 0,
          deletedCount: 0,
          errorCount: 0,
          detailsList: []
        };
        
        for (const node of batch) {
          try {
            batchDetails.processedCount++;
            
            // Mark for deletion
            updates[node.key] = null;
            
            batchDetails.deletedCount++;
            batchDetails.detailsList.push({
              nodeKey: node.key,
              approximateSize: `${Math.round(node.size / 1024)} KB`,
              action: 'Deleted node'
            });
            
          } catch (error) {
            console.error(`Error processing node ${node.key}:`, error);
            batchDetails.errorCount++;
            batchDetails.detailsList.push({
              nodeKey: node.key,
              error: error.message,
              action: 'Error during deletion'
            });
          }
        }
        
        // Apply all deletions at once for this batch
        if (Object.keys(updates).length > 0) {
          await db.ref().update(updates);
          console.log(`Batch ${batchIndex + 1}: Deleted ${Object.keys(updates).length} nodes`);
        } else {
          console.log(`Batch ${batchIndex + 1}: No deletions needed`);
        }
        
        // Update results
        results.processed += batchDetails.processedCount;
        results.deleted += batchDetails.deletedCount;
        results.errors += batchDetails.errorCount;
        results.details = results.details.concat(batchDetails.detailsList);
        
        // Log progress
        console.log(`Progress: ${Math.round((results.processed / nodesToDelete.length) * 100)}% complete (${results.processed}/${nodesToDelete.length})`);
      }
      
      // 5. Log the cleanup results for audit purposes
      await db.ref('logs/rootNodeCleanup').push({
        timestamp: admin.database.ServerValue.TIMESTAMP, 
        results: {
          total: results.total,
          processed: results.processed,
          deleted: results.deleted,
          errors: results.errors
        }
      });
      
      console.log(`Root node cleanup completed: Processed ${results.processed}, Deleted ${results.deleted}, Errors ${results.errors}`);
      
      return {
        success: true,
        message: `Root node cleanup completed successfully. Deleted ${results.deleted} nodes containing '@' character.`,
        results
      };
      
    } catch (error) {
      console.error('Error during root node cleanup:', error);
      
      // Log the error details
      await db.ref('errorLogs/rootNodeCleanup').push({
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        results
      });
      
      throw new Error(`Error during root node cleanup: ${error.message}`);
    }
  });
  
  exports.cleanupIncorrectRootNodes = cleanupIncorrectRootNodes;