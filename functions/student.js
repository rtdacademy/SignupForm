// functions/student.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail, formatASN, API_KEY, profileFields, largeStringFields } = require('./utils');

/**
 * Cloud Function: updateStudentData
 *
 * Updates or adds student data based on the sanitized email.
 */
const updateStudentData = functions.https.onRequest(async (req, res) => {
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

  // Check for the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).send('Invalid or missing API key');
  }

  try {
    const data = req.body;
    console.log('Received student data:', JSON.stringify(data));

    // Validate required fields
    if (!data.StudentEmail || !data.VersionNumber || !data.CourseID) {
      return res.status(400).send('StudentEmail, VersionNumber, and CourseID are required');
    }

    const sanitizedEmail = sanitizeEmail(data.StudentEmail);
    const db = admin.database();
    const studentRef = db.ref(`students/${sanitizedEmail}`);
    const coursesRef = studentRef.child('courses');

    // Check if the course already exists for this student
    const coursesSnapshot = await coursesRef.once('value');
    const coursesData = coursesSnapshot.val() || {};

    let isNewCourse = !coursesData[data.CourseID];
    let currentCourseData = coursesData[data.CourseID] || {};

    if (!isNewCourse && currentCourseData.VersionNumber === data.VersionNumber) {
      return res.status(200).send(`Student data for ${data.StudentEmail} in course ${data.CourseID} is already up to date.`);
    }

    const profileData = {};
    const courseData = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (profileFields.map(f => f.toLowerCase()).includes(lowerKey)) {
        if (lowerKey === 'asn') {
          profileData['asn'] = formatASN(value);
        } else if (key === 'Title') {
          profileData['lastName'] = value;
        } else if (key === 'Student') {
          profileData['firstName'] = value;
        } else if (key === 'StudentNotes') {
          console.log('StudentNotes before processing:', value);
          profileData[key] = value.replace(/\\n/g, '\n');
          console.log('StudentNotes after processing:', profileData[key]);
        } else {
          profileData[key] = value;
        }
      } else if (largeStringFields.includes(key)) {
        if (isNewCourse || currentCourseData[key] !== value) {
          courseData[key] = value;
        }
      } else {
        courseData[key] = value;
      }
    }

    // Ensure originalEmail is stored
    profileData.originalEmail = data.StudentEmail;

    // Update profile data if present
    if (Object.keys(profileData).length > 0) {
      await studentRef.child('profile').update(profileData);
    }

    // Update course data if present
    if (Object.keys(courseData).length > 0) {
      await coursesRef.child(data.CourseID).update(courseData);
    }

    res.status(200).send(`Data for student with email ${data.StudentEmail} ${isNewCourse ? 'added to' : 'updated in'} course ${data.CourseID} successfully`);
  } catch (error) {
    console.error('Error updating student data:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

module.exports = {
  updateStudentData,
};