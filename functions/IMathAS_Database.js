const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.updateIMathASGrade = functions.https.onRequest(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the API key from the request header
        const apiKey = req.headers['x-api-key'];
        
        // Verify API key
        if (!apiKey || apiKey !== functions.config().api.key) {
            throw new Error('Invalid API key');
        }

        const gradeData = req.body;
        console.log('Received grade data:', gradeData);

        // Validate required fields
        if (!gradeData.Assessment_Record_Id) {
            throw new Error('Assessment Record ID is required');
        }

        // Create the document data
        const docData = {
            assessmentId: parseInt(gradeData.Assessment_Record_Id.split('_')[0]),
            userId: parseInt(gradeData.Assessment_Record_Id.split('_')[1]),
            score: parseFloat(gradeData.Score) || 0,
            status: parseInt(gradeData.Status) || 0,
            startTime: parseInt(gradeData.Starttime) || 0,
            lastChange: parseInt(gradeData.Lastchange) || 0,
            timeOnTask: parseInt(gradeData.Timeontask) || 0,
            version: parseInt(gradeData.Ver) || 1,
            // Store original values
            agroupid: gradeData.Agroupid || '',
            lti_sourcedid: gradeData.Lti_Sourcedid || '',
            timelimitexp: gradeData.Timelimitexp || '',
            scoreddata: gradeData.Scoreddata || '',
            practicedata: gradeData.Practicedata || '',
            // Metadata
            imported: true,
            importedAt: new Date().toISOString(),
            updatedViaZapier: true,
            lastUpdateSource: 'zapier_webhook'
        };

        // Update the document in Firestore
        const db = admin.firestore();
        const docRef = db.collection('imathas_grades').doc(gradeData.Assessment_Record_Id);
        
        await docRef.set(docData, { merge: true });

        // Log the successful update
        console.log(`Updated grade for Assessment_Record_Id: ${gradeData.Assessment_Record_Id}`);

        return res.status(200).json({
            success: true,
            message: 'Grade updated successfully',
            docId: gradeData.Assessment_Record_Id,
            data: docData
        });

    } catch (error) {
        console.error('Grade update error:', error);
        
        // Return a proper error response
        return res.status(500).json({
            success: false,
            error: error.message,
            errorDetail: error.stack
        });
    }
});