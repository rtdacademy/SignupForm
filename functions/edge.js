// functions/edge.js
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { sanitizeEmail } = require('./utils');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.fetchLMSStudentIdV2 = onCall({
  concurrency: 50,
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // For v2, the actual payload is nested inside data.data
    const { email, courseId } = data.data;
    
    if (!email || !courseId) {
      throw new HttpsError('invalid-argument', 'Email and courseId are required');
    }

    console.log('Attempting to fetch LMS ID for:', email);

    // Send as JSON instead of form-data
    const response = await fetch('https://edge.rtdacademy.com/return_data_to_yourway.php', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new HttpsError('internal', 'Invalid response from Edge system');
    }

    console.log('Parsed result:', result);

    if (!result.success) {
      console.log('Edge system returned error:', result.message);
      throw new HttpsError('internal', result.message || 'Failed to fetch LMS ID');
    }

    const sanitizedEmail = sanitizeEmail(email);
    const db = admin.database();

    console.log('Updating database for:', sanitizedEmail, 'courseId:', courseId);

    const updates = {};
    updates[`students/${sanitizedEmail}/courses/${courseId}/LMSStudentID`] = result.user.id;
    
    const summaryRef = db.ref(`studentCourseSummaries/${sanitizedEmail}_${courseId}`);
    const summarySnapshot = await summaryRef.once('value');
    const currentToggle = summarySnapshot.exists() ? summarySnapshot.val().toggle : false;
    
    updates[`studentCourseSummaries/${sanitizedEmail}_${courseId}/toggle`] = !currentToggle;

    await db.ref().update(updates);

    return {
      success: true,
      lmsId: result.user.id,
      message: 'LMS ID successfully updated'
    };

  } catch (error) {
    console.error('Error in fetchLMSStudentIdV2:', error);
    throw new HttpsError('internal', error.message);
  }
});
