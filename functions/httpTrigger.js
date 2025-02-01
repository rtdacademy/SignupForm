const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

exports.addSchoolYearToPasiLinks = functions.https.onRequest(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const db = admin.database();
    const pasiLinksRef = db.ref('pasiLinks');

    try {
        // Get all pasiLinks records
        const pasiLinksSnapshot = await pasiLinksRef.once('value');
        const updates = {};
        let updateCount = 0;
        let errorCount = 0;
        const errors = [];

        // Process each link
        for (const [linkId, linkData] of Object.entries(pasiLinksSnapshot.val() || {})) {
            try {
                if (!linkData.studentCourseSummaryKey) {
                    throw new Error('Missing studentCourseSummaryKey');
                }

                // Get the corresponding student course summary
                const summarySnapshot = await db.ref(`studentCourseSummaries/${linkData.studentCourseSummaryKey}`)
                    .once('value');
                
                const summary = summarySnapshot.val();
                if (!summary || !summary.School_x0020_Year_Value) {
                    throw new Error('Summary or school year not found');
                }

                // Update the schoolYear in pasiLinks
                updates[`${linkId}/schoolYear`] = summary.School_x0020_Year_Value;
                updateCount++;

            } catch (error) {
                errorCount++;
                errors.push({
                    linkId,
                    error: error.message,
                    data: linkData
                });
            }
        }

        if (Object.keys(updates).length === 0) {
            res.status(200).json({
                status: 'success',
                message: 'No records found to update',
                recordsUpdated: 0,
                errorCount,
                errors
            });
            return;
        }

        // Perform the batch update
        await pasiLinksRef.update(updates);

        // Log success and return response
        console.log(`Successfully updated ${updateCount} pasiLinks records`);
        res.status(200).json({
            status: 'success',
            message: 'Successfully updated schoolYear property in pasiLinks records',
            recordsUpdated: updateCount,
            errorCount,
            errors
        });

    } catch (error) {
        console.error('Error updating pasiLinks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update pasiLinks records',
            error: error.message
        });
    }
});