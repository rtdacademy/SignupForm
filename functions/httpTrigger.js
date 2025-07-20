const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

// Configure with 2GB memory and 540 second timeout
const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '2GB'
};

/**
 * HTTP triggered function to update primarySchoolName in studentCourseSummaries
 */
const primarySchoolNameUpdate = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    const db = admin.database();
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 300; 
    let lastProcessedStudent = null;
    
    try {
      // Create a query for students, ordered by key for pagination
      let studentsQuery = db.ref('students').orderByKey();
      
      // If we have a last processed student, start after that one
      if (req.query.lastStudent) {
        studentsQuery = studentsQuery.startAfter(req.query.lastStudent);
      }
      
      // Limit the query to our batch size
      studentsQuery = studentsQuery.limitToFirst(batchSize);
      
      const studentsSnapshot = await studentsQuery.once('value');
      const students = studentsSnapshot.val();
      
      if (!students) {
        return res.status(200).json({
          message: 'No more students to process',
          totalProcessed: successCount,
          errors: errorCount,
          complete: true
        });
      }

      // Process each student
      for (const studentId of Object.keys(students)) {
        lastProcessedStudent = studentId;
        const coursesSnapshot = await db
          .ref(`students/${studentId}/courses`)
          .once('value');
        const courses = coursesSnapshot.val();

        if (!courses) continue;

        // Process each course for the student
        for (const courseId of Object.keys(courses)) {
          try {
            // Get the primarySchoolName
            const primarySchoolNameSnap = await db
              .ref(`students/${studentId}/courses/${courseId}/primarySchoolName`)
              .once('value');
            const primarySchoolName = primarySchoolNameSnap.val();

            // Update the studentCourseSummaries
            await db
              .ref(`studentCourseSummaries/${studentId}_${courseId}/primarySchoolName`)
              .set(primarySchoolName || '');

            successCount++;
          } catch (error) {
            errorCount++;
            console.error(
              `Error processing student ${studentId} course ${courseId}: ${error.message}`
            );
            
            // Log the error
            await db.ref('errorLogs/primarySchoolNameUpdate').push({
              studentId,
              courseId,
              error: error.message,
              stack: error.stack,
              timestamp: admin.database.ServerValue.TIMESTAMP
            });
          }
        }
      }

      // Return progress and next batch token
      const response = {
        message: 'Batch processed successfully',
        totalProcessed: successCount,
        errors: errorCount,
        lastStudent: lastProcessedStudent,
        complete: Object.keys(students).length < batchSize
      };

      // If there are more students to process, include continuation instructions
      if (!response.complete) {
        response.nextBatchUrl = 
          `https://us-central1-rtd-academy.cloudfunctions.net/primarySchoolNameUpdate?lastStudent=${lastProcessedStudent}`;
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('Major error in primarySchoolNameUpdate:', error);
      
      // Log the major error
      await db.ref('errorLogs/primarySchoolNameUpdate').push({
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        lastProcessedStudent
      });

      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        lastStudent: lastProcessedStudent
      });
    }
  });

module.exports = {
  primarySchoolNameUpdate
};