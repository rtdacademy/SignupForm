const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Validates and formats ASN
 * @param {string} asn - The ASN to validate
 * @returns {Object} - { isValid: boolean, formattedASN: string }
 */
const validateAndFormatASN = (asn) => {
  if (!asn) return { isValid: false, formattedASN: null };

  // Remove any existing dashes and whitespace
  const cleanASN = asn.replace(/[-\s]/g, '');

  // Check if it's a 9-digit number
  if (/^\d{9}$/.test(cleanASN)) {
    // Format as ####-####-#
    const formattedASN = `${cleanASN.slice(0, 4)}-${cleanASN.slice(4, 8)}-${cleanASN.slice(8)}`;
    return { isValid: true, formattedASN, wasReformatted: true };
  }

  // Check if it's already in correct format
  if (/^\d{4}-\d{4}-\d{1}$/.test(asn)) {
    return { isValid: true, formattedASN: asn, wasReformatted: false };
  }

  return { isValid: false, formattedASN: null, wasReformatted: false };
};

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
      // Handle old ASN reference if it exists
      if (previousASN) {
        const { isValid: wasValidPrevious, formattedASN: formattedPreviousASN } = validateAndFormatASN(previousASN);
        if (wasValidPrevious) {
          // Remove email from previous ASN's emailKeys
          await db.ref(`/ASNs/${formattedPreviousASN}/emailKeys/${userEmailKey}`).remove();
          
          // Check if the ASN node is empty and remove it if so
          const previousAsnRef = db.ref(`/ASNs/${formattedPreviousASN}/emailKeys`);
          const snapshot = await previousAsnRef.once('value');
          if (!snapshot.exists() || !snapshot.val()) {
            await db.ref(`/ASNs/${formattedPreviousASN}`).remove();
          }

          // Remove from wrong format if it was there
          await db.ref(`/ASN_Wrong_Format/${userEmailKey}`).remove();
        }
      }

      // Handle new ASN
      if (newASN) {
        const { isValid, formattedASN } = validateAndFormatASN(newASN);

        if (isValid) {
          // Add to valid ASNs
          const updates = {
            [`/ASNs/${formattedASN}/emailKeys/${userEmailKey}`]: true,
            [`/ASNs/${formattedASN}/lastUpdated`]: admin.database.ServerValue.TIMESTAMP,
            [`/ASN_Wrong_Format/${userEmailKey}`]: null // Remove from wrong format
          };
          
          await db.ref().update(updates);
        } else {
          // Add to wrong format
          const updates = {
            [`/ASN_Wrong_Format/${userEmailKey}`]: true
          };
          
          await db.ref().update(updates);
        }
      }

      console.log(
        `Successfully synced ASN for user ${userEmailKey} in Realtime Database. ` +
        `Old ASN: ${previousASN || 'none'}, New ASN: ${newASN || 'none'}`
      );

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
        newASN: newASN,
      });

      throw error;
    }
  });


/**
 * HTTP Function: rebuildASNNodes
 * Rebuilds the /ASNs and /ASN_Wrong_Format nodes from studentCourseSummaries
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
      errors: [],
    };

    try {
      // Create a query to filter by school year
      const query = db.ref('/studentCourseSummaries')
        .orderByChild('School_x0020_Year_Value')
        .equalTo('24/25');

      const summariesSnapshot = await query.once('value');
      const summaries = summariesSnapshot.val();

      if (!summaries) {
        res.status(404).json({ 
          error: 'No student course summaries found for school year 24/25' 
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
          const studentEmail = data.StudentEmail;
          const asn = data.asn;

          // Skip if we've already processed this email
          if (processedEmails.has(studentEmail)) {
            stats.duplicatesSkipped++;
            continue;
          }

          if (asn) {
            const { isValid, formattedASN } = validateAndFormatASN(asn);
            
            if (isValid) {
              // Add to valid ASNs
              if (!newData.ASNs[formattedASN]) {
                newData.ASNs[formattedASN] = {
                  emailKeys: {},
                  lastUpdated: admin.database.ServerValue.TIMESTAMP,
                  schoolYear: '24/25' // Add school year reference
                };
              }
              // Use sanitized email as key
              const sanitizedEmail = studentEmail.replace(/\./g, ',');
              newData.ASNs[formattedASN].emailKeys[sanitizedEmail] = true;
              stats.validASNs++;
            } else {
              // Add to wrong format
              const sanitizedEmail = studentEmail.replace(/\./g, ',');
              newData.ASN_Wrong_Format[sanitizedEmail] = {
                timestamp: admin.database.ServerValue.TIMESTAMP,
                schoolYear: '24/25'
              };
              stats.invalidASNs++;
            }
          }

          // Mark this email as processed
          processedEmails.add(studentEmail);
          
        } catch (error) {
          stats.errors.push({
            key,
            error: error.message,
            schoolYear: '24/25'
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

      // Add completion log with school year information
      await db.ref('rebuild_logs').push({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        schoolYear: '24/25',
        stats,
      });

      res.status(200).json({
        message: 'ASN nodes rebuilt successfully for school year 24/25',
        schoolYear: '24/25',
        stats,
      });

    } catch (error) {
      console.error('Error rebuilding ASN nodes:', error);

      // Log error with school year information
      await db.ref('error_logs').push({
        function: 'rebuildASNNodes',
        schoolYear: '24/25',
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      res.status(500).json({
        error: 'Failed to rebuild ASN nodes',
        schoolYear: '24/25',
        message: error.message,
        stats,
      });
    }
  });

module.exports = {
  syncStudentASN,
  rebuildASNNodes,
};