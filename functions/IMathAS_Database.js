const functions = require('firebase-functions');
const admin = require('firebase-admin');


// Make sure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

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
    const logBody = { ...req.body };
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

    // Process scoreddata if present – now keeping it as a Base64 string
    if (gradeData.Scoreddata) {
      // Simply store the Base64 string without converting
      docData.scoreddata = gradeData.Scoreddata;
    }

    // Log transformed data
    const logDocData = { ...docData };
    if (logDocData.scoreddata) {
      logDocData.scoreddata = `[Base64 string of length: ${logDocData.scoreddata.length}]`;
    }
    console.log(createLogEntry('dataTransformation', {
      requestId,
      transformedData: logDocData
    }));

    // Get reference to Realtime Database
    const db = admin.database();

    // Update main grade data
    const gradeRef = db.ref(`imathas_grades/${gradeData.Assessment_Record_Id}`);
    await gradeRef.set(docData);

    // Create a history entry with a push key
    const historyRef = db.ref(`imathas_grades/${gradeData.Assessment_Record_Id}/history`).push();
    const historyData = {
      timestamp: new Date().toISOString(),
      score: docData.score,
      status: docData.status,
      currentQuestion: docData.currentQuestion || null,
      hasStoredData: !!docData.scoreddata
    };
    await historyRef.set(historyData);

    // Log successful update
    console.log(createLogEntry('updateSuccess', {
      requestId,
      docId: gradeData.Assessment_Record_Id,
      historyId: historyRef.key,
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      docId: gradeData.Assessment_Record_Id,
      historyId: historyRef.key,
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


exports.importIMathASGrades = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 540
  })
  .https.onRequest(async (req, res) => {
    try {
      console.log('Starting import process...');

      // Get the file from Cloud Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file('imports/imas_grades.json');

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('Import file not found in Cloud Storage');
      }

      // Download and parse the file
      const [content] = await file.download();
      const gradesData = JSON.parse(content.toString('utf8'));

      console.log(`Total records to process: ${gradesData.length}`);

      // Process in batches of 500 records
      const BATCH_SIZE = 500;
      const batches = [];

      for (let i = 0; i < gradesData.length; i += BATCH_SIZE) {
        batches.push(gradesData.slice(i, i + BATCH_SIZE));
      }

      console.log(`Split into ${batches.length} batches of ${BATCH_SIZE} records`);

      // Get reference to the database
      const db = admin.database();
      const gradesRef = db.ref('imathas_grades');

      let totalProcessed = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const updates = {};

        console.log(`Processing batch ${batchIndex + 1} of ${batches.length}`);

        for (const record of batch) {
          try {
            const recordId = record.Assessment_Record_Id;

            // Create the formatted record
            const formattedRecord = {
              agroupid: record.agroupid.toString(),
              assessmentId: parseInt(record.assessmentid),
              userId: parseInt(record.userid),
              score: parseFloat(record.score),
              status: parseInt(record.status),
              startTime: parseInt(record.starttime),
              lastChange: parseInt(record.lastchange),
              timeOnTask: parseInt(record.timeontask),
              version: parseInt(record.version),
              lti_sourcedid: record.lti_sourcedid,
              timelimitexp: record.timelimitexp.toString(),
              imported: true,
              importedAt: record.importedAt,
              lastUpdateSource: record.lastUpdateSource
            };

            // Store scoreddata as Base64 (no conversion to binary)
            if (record.scoreddata) {
              formattedRecord.scoreddata = record.scoreddata;
            }

            // Store practicedata as Base64 if it exists
            if (record.practicedata) {
              formattedRecord.practicedata = record.practicedata;
            }

            // Add to updates batch
            updates[recordId] = formattedRecord;

            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              recordId: record.Assessment_Record_Id,
              error: error.message
            });
            console.error(`Error processing record ${record.Assessment_Record_Id}:`, error);
          }
        }

        // Perform batch update
        try {
          await gradesRef.update(updates);
          totalProcessed += batch.length;
          console.log(`Successfully processed batch ${batchIndex + 1}. Total processed: ${totalProcessed}`);
        } catch (error) {
          console.error(`Error updating batch ${batchIndex + 1}:`, error);
          errors.push({
            batchIndex,
            error: error.message
          });
        }

        // Add a small delay between batches to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const summary = {
        success: true,
        totalRecords: gradesData.length,
        successfullyProcessed: successCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined
      };

      console.log('Import process completed', summary);
      res.status(200).json(summary);

    } catch (error) {
      console.error('Fatal import error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
