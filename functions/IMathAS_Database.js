const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Helper function for structured logging
const createLogEntry = (stage, data = null, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        stage,
        functionName: 'updateIMathASGrade'
    };

    if (data) logEntry.data = data;
    if (error) logEntry.error = error;

    return logEntry;
};

exports.updateIMathASGrade = functions.https.onRequest(async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(createLogEntry('functionStart', { 
        requestId,
        method: req.method,
        headers: req.headers,
        ip: req.ip
    }));

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.warn(createLogEntry('methodNotAllowed', {
            requestId,
            receivedMethod: req.method
        }));
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Log incoming request body (excluding large data fields)
        const logBody = {...req.body};
        if (logBody.Scoreddata) {
            logBody.Scoreddata = `[Base64 string of length: ${logBody.Scoreddata.length}]`;
        }
        console.log(createLogEntry('receivedData', {
            requestId,
            body: logBody,
            contentType: req.headers['content-type']
        }));

        // Get and verify Bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error(createLogEntry('authHeaderMissing', {
                requestId,
                authHeaderPresent: !!authHeader
            }));
            throw new Error('Authorization header missing or invalid');
        }

        const token = authHeader.split('Bearer ')[1];
        if (token !== functions.config().api.key) {
            console.error(createLogEntry('tokenInvalid', {
                requestId,
                tokenPresent: !!token
            }));
            throw new Error('Invalid authorization token');
        }

        const gradeData = req.body;
        
        // Validate required fields
        if (!gradeData.Assessment_Record_Id) {
            throw new Error('Assessment Record ID is required');
        }

        // Parse Assessment_Record_Id
        const [assessmentId, userId] = gradeData.Assessment_Record_Id.split('_');

        // Create the main document data
        const docData = {
            assessmentId: parseInt(assessmentId),
            userId: parseInt(userId),
            score: parseFloat(gradeData.Score) || 0,
            status: parseInt(gradeData.Status) || 0,
            startTime: parseInt(gradeData.Starttime) || 0,
            lastChange: parseInt(gradeData.Lastchange) || 0,
            timeOnTask: parseInt(gradeData.Timeontask) || 0,
            version: parseInt(gradeData.Ver) || 1,
            agroupid: gradeData.Agroupid || '',
            lti_sourcedid: gradeData.Lti_Sourcedid || '',
            timelimitexp: gradeData.Timelimitexp || '',
            imported: true,
            importedAt: new Date().toISOString(),
            lastUpdateSource: 'imathas_direct'
        };

        // Add current question data if present
        if (gradeData.CurrentQuestion) {
            docData.currentQuestion = {
                number: parseInt(gradeData.CurrentQuestion.number),
                id: parseInt(gradeData.CurrentQuestion.id),
                lastViewed: new Date().toISOString()
            };
        }

    
// Process scoreddata if present
if (gradeData.Scoreddata) {
    try {
        // Simply base64 decode to get back the original gzipped data
        docData.scoreddata = Buffer.from(gradeData.Scoreddata, 'base64').toString('binary');
    } catch (error) {
        console.error(createLogEntry('scoreddataProcessingError', {
            requestId,
            error: error.message
        }));
        throw new Error('Failed to process Scoreddata');
    }
}

        // Log transformed data
        const logDocData = {...docData};
        if (logDocData.scoreddata) {
            logDocData.scoreddata = `[Base64 string of length: ${logDocData.scoreddata.length}]`;
        }
        console.log(createLogEntry('dataTransformation', {
            requestId,
            transformedData: logDocData
        }));

        // Update Firestore
        const db = admin.firestore();
        const docRef = db.collection('imathas_grades').doc(gradeData.Assessment_Record_Id);
        
        await docRef.set(docData, { merge: true });

        // Create a history entry
        const historyRef = docRef.collection('history').doc();
        await historyRef.set({
            timestamp: new Date().toISOString(),
            score: docData.score,
            status: docData.status,
            currentQuestion: docData.currentQuestion || null,
            hasStoredData: !!docData.scoreddata
        });

        // Log successful update
        console.log(createLogEntry('updateSuccess', {
            requestId,
            docId: gradeData.Assessment_Record_Id,
            historyId: historyRef.id,
            timestamp: new Date().toISOString()
        }));

        return res.status(200).json({
            success: true,
            message: 'Grade updated successfully',
            docId: gradeData.Assessment_Record_Id,
            historyId: historyRef.id,
            requestId
        });

    } catch (error) {
        console.error(createLogEntry('error', {
            requestId,
            errorMessage: error.message,
            errorStack: error.stack,
            errorCode: error.code
        }));
        
        return res.status(500).json({
            success: false,
            error: error.message,
            requestId
        });
    }
});