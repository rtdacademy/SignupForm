const functions = require('firebase-functions');
const admin = require('firebase-admin');

const updateHistoricalPaymentStatus = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const db = admin.database();
    const studentsRef = db.ref('students');
    
    // The cutoff date for historical payments (Nov 21, 2024)
    const CUTOFF_DATE = new Date('2024-11-21').getTime();
    
    // Get all students
    const studentsSnapshot = await studentsRef.once('value');
    const students = studentsSnapshot.val();
    
    if (!students) {
      return res.status(404).send('No students found');
    }

    let updateCount = 0;
    const updates = {};
    const errors = [];

    // Iterate through each student
    for (const [studentId, studentData] of Object.entries(students)) {
      if (!studentData.courses) continue;

      // Iterate through each course for the student
      for (const [courseId, courseData] of Object.entries(studentData.courses)) {
        try {
          // Check if student type matches our criteria
          const studentType = courseData?.StudentType?.Value;
          if (studentType !== 'Adult Student' && studentType !== 'International Student') {
            continue;
          }

          // Check if payment_status already exists
          if (courseData.payment_status) {
            continue;
          }

          // Check if the course was created before the cutoff date
          const createdTimestamp = new Date(courseData.Created).getTime();
          if (isNaN(createdTimestamp) || createdTimestamp >= CUTOFF_DATE) {
            continue;
          }

          // Add update to our batch
          updates[`/students/${studentId}/courses/${courseId}/payment_status/status`] = 'unknown';
          updateCount++;

        } catch (error) {
          errors.push({
            studentId,
            courseId,
            error: error.message
          });
          console.error(`Error processing student ${studentId}, course ${courseId}:`, error);
        }
      }
    }

    // If we have updates to make, perform them in a single transaction
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
    }

    // Prepare response
    const response = {
      message: `Successfully processed historical payment status updates`,
      statistics: {
        totalUpdates: updateCount,
        errorCount: errors.length
      }
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    // Log the operation to a new node for record-keeping
    await db.ref('operationLogs/updateHistoricalPaymentStatus').push({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      statistics: response.statistics,
      errors: errors
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error updating historical payment status:', error);
    
    // Log the error
    await admin.database().ref('errorLogs/updateHistoricalPaymentStatus').push({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).send('Internal Server Error: ' + error.message);
  }
});

module.exports = {
  updateHistoricalPaymentStatus
};