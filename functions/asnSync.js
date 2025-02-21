const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { formatASN, sanitizeEmail } = require('./utils');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Database Function: syncStudentASN
 * Maintains ASN records in Realtime Database
 */
const syncStudentASN = functions.database
  .ref('/students/{userEmailKey}/profile/asn')
  .onWrite(async (change, context) => {
    const { userEmailKey } = context.params;
    const newASN = change.after.val();
    const previousASN = change.before.val();
    const db = admin.database();

    try {
      // Get student's current school year
      const studentRef = await db.ref(`/students/${userEmailKey}/profile/School_x0020_Year_Value`).once('value');
      const schoolYear = studentRef.val() || 'Unknown';

      // Handle old ASN reference if it exists
      if (previousASN) {
        const formattedPreviousASN = formatASN(previousASN);
        const isValidPrevious = /^\d{4}-\d{4}-\d$/.test(formattedPreviousASN);
        
        if (isValidPrevious) {
          // Remove email from previous ASN's emailKeys
          await db.ref(`/ASNs/${formattedPreviousASN}/emailKeys/${sanitizeEmail(userEmailKey)}`).remove();
          
          // Get the ASN node to check if it's empty
          const previousAsnRef = db.ref(`/ASNs/${formattedPreviousASN}`);
          const snapshot = await previousAsnRef.once('value');
          const asnData = snapshot.val();
          
          if (!asnData || !asnData.emailKeys || Object.keys(asnData.emailKeys).length === 0) {
            // Remove the entire ASN node if no more emailKeys
            await previousAsnRef.remove();
          }

          // Remove from wrong format if it was there
          await db.ref(`/ASN_Wrong_Format/${sanitizeEmail(userEmailKey)}`).remove();
        }
      }

      // Handle new ASN
      if (newASN) {
        const formattedASN = formatASN(newASN);
        const isValid = /^\d{4}-\d{4}-\d$/.test(formattedASN);
        const sanitizedEmail = sanitizeEmail(userEmailKey);

        if (isValid) {
          // Get existing ASN data if any
          const existingAsnRef = await db.ref(`/ASNs/${formattedASN}`).once('value');
          const existingAsnData = existingAsnRef.val() || {};

          // Add to valid ASNs
          const updates = {
            [`/ASNs/${formattedASN}/emailKeys/${sanitizedEmail}`]: true,
            [`/ASNs/${formattedASN}/lastUpdated`]: admin.database.ServerValue.TIMESTAMP,
            [`/ASN_Wrong_Format/${sanitizedEmail}`]: null // Remove from wrong format
          };
          
          await db.ref().update(updates);
        } else {
          // Add to wrong format
          const updates = {
            [`/ASN_Wrong_Format/${sanitizedEmail}`]: true
          };
          
          await db.ref().update(updates);
        }
      }

      return null;
    } catch (error) {
      console.error(`Error syncing ASN for user ${userEmailKey} in Realtime Database:`, error);

      // Log error to error_logs node
      await db.ref('error_logs').push({
        function: 'syncStudentASN',
        userEmailKey,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        oldASN: previousASN,
        newASN: newASN
      });

      throw error;
    }
  });

/**
 * HTTP Function: rebuildASNNodes
 * Rebuilds the /ASNs and /ASN_Wrong_Format nodes from studentCourseSummaries
 * while preserving existing data
 */
const rebuildASNNodes = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onRequest(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const db = admin.database();
    const stats = {
      totalProcessed: 0,
      validASNs: 0,
      invalidASNs: 0,
      duplicatesSkipped: 0,
      existingPreserved: 0,
      errors: [],
    };

    try {
      // First, get existing ASN data
      const [existingASNsSnapshot, summariesSnapshot] = await Promise.all([
        db.ref('/ASNs').once('value'),
        db.ref('/studentCourseSummaries').once('value')
      ]);

      const existingASNs = existingASNsSnapshot.val() || {};
      const summaries = summariesSnapshot.val();

      if (!summaries) {
        res.status(404).json({ 
          error: 'No student course summaries found' 
        });
        return;
      }

      // Prepare the new data structure
      const newData = {
        ASNs: {},
        ASN_Wrong_Format: {},
      };

      // Track processed emails to handle duplicates
      const processedEmails = new Set();

      // Process each student course summary
      for (const [key, data] of Object.entries(summaries)) {
        stats.totalProcessed++;
        
        try {
          if (!data.StudentEmail || !data.asn) continue;

          const studentEmail = data.StudentEmail;
          const asn = data.asn;
          
          // Skip if we've already processed this email
          if (processedEmails.has(studentEmail)) {
            stats.duplicatesSkipped++;
            continue;
          }

          const formattedASN = formatASN(asn);
          const isValid = /^\d{4}-\d{4}-\d$/.test(formattedASN);
          const sanitizedEmail = sanitizeEmail(studentEmail);

          if (isValid) {
            // Initialize ASN entry if it doesn't exist
            if (!newData.ASNs[formattedASN]) {
              newData.ASNs[formattedASN] = {
                emailKeys: {}
              };
              stats.validASNs++;
            } else {
              stats.existingPreserved++;
            }

            // Add email to emailKeys
            newData.ASNs[formattedASN].emailKeys[sanitizedEmail] = true;
          } else {
            // Add to wrong format with just true as the value
            newData.ASN_Wrong_Format[sanitizedEmail] = true;
            stats.invalidASNs++;
          }

          // Mark this email as processed
          processedEmails.add(studentEmail);
          
        } catch (error) {
          stats.errors.push({
            key,
            error: error.message,
            data: {
              email: data.StudentEmail,
              asn: data.asn
            }
          });
        }
      }

      // Create multi-path update
      const updates = {
        '/ASNs': newData.ASNs,
        '/ASN_Wrong_Format': newData.ASN_Wrong_Format,
      };

      // Perform the update
      await db.ref().update(updates);

      // Add completion log
      await db.ref('rebuild_logs').push({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        stats,
        summary: {
          totalValidASNs: Object.keys(newData.ASNs).length,
          totalInvalidASNs: Object.keys(newData.ASN_Wrong_Format).length
        }
      });

      res.status(200).json({
        message: 'ASN nodes rebuilt successfully',
        stats,
        summary: {
          totalValidASNs: Object.keys(newData.ASNs).length,
          totalInvalidASNs: Object.keys(newData.ASN_Wrong_Format).length
        }
      });

    } catch (error) {
      console.error('Error rebuilding ASN nodes:', error);

      // Log error
      await db.ref('error_logs').push({
        function: 'rebuildASNNodes',
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      res.status(500).json({
        error: 'Failed to rebuild ASN nodes',
        message: error.message,
        stats,
      });
    }
  });

module.exports = {
  syncStudentASN,
  rebuildASNNodes,
};