// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _ = require('lodash');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
  }

// Use the environment variable for the API key
const API_KEY = functions.config().api.key;


const BATCH_SIZE = 100; // Adjust this value based on your needs and memory constraints

// Define the fields relevant to student profiles and large string fields
const profileFields = [
  'asn', 'ASN', 'originalEmail', 'StudentEmail', 'Title', 'StudentPhone', 'StudentAge',
  'Student', 'PrimaryID', 'Parent_x002f_Guardian', 'ParentPhone_x0023_',
  'ParentPermission_x003f_', 'ParentEmail', 'Name1', 'LastSync', 'StudentNotes'
];

const largeStringFields = ['Schedule', 'AssignmentsList'];

/**
 * Sanitizes an email address by:
 * 1. Converting to lowercase.
 * 2. Removing all whitespace.
 * 3. Replacing periods '.' with commas ','.
 * 
 * @param {string} email - The email address to sanitize.
 * @returns {string} - The sanitized email address.
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email
        .toLowerCase()          // Convert to lowercase
        .replace(/\s+/g, '')    // Remove all whitespace
        .replace(/\./g, ',');   // Replace '.' with ','
}

/**
 * Formats the ASN (Assumed to be a specific identifier) by:
 * 1. Removing non-digit characters.
 * 2. Trimming whitespace.
 * 3. Formatting into 'XXXX-XXXX-X' or 'XXXXXXXXX' patterns.
 * 
 * @param {string} asn - The ASN to format.
 * @returns {string} - The formatted ASN.
 */
function formatASN(asn) {
  const cleanASN = asn.replace(/\D/g, '').trim();
  if (/^\d{4}-\d{4}-\d$/.test(cleanASN)) return cleanASN;
  return cleanASN.length === 9 ? `${cleanASN.substr(0,4)}-${cleanASN.substr(4,4)}-${cleanASN.substr(8)}` : cleanASN;
}



/**
 * Cloud Function: updateGradebookData
 * 
 * Receives gradebook data from a PHP program and updates the Firebase Realtime Database.
 */
exports.updateGradebookData = functions.https.onRequest(async (req, res) => {
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
        console.log('Received gradebook data:', JSON.stringify(data));

        // Validate required fields
        if (!data.studentEmail || !data.LMSStudentID || !data.LMSCourseID || !data.SharePointStudentID) {
            return res.status(400).send('studentEmail, LMSStudentID, LMSCourseID, and SharePointStudentID are required');
        }

        const sanitizedEmail = sanitizeEmail(data.studentEmail);
        const db = admin.database();
        const studentRef = db.ref(`students/${sanitizedEmail}`);
        const courseRef = studentRef.child(`courses/${data.LMSCourseID}`);
        const gradebookRef = courseRef.child('jsonGradebook');

        // Prepare the new gradebook data
        const newGradebookData = {
            LMSStudentID: data.LMSStudentID,
            SharePointStudentID: data.SharePointStudentID,
            headers: data.headers,
            student: data.student,
            lastChecked: admin.database.ServerValue.TIMESTAMP
        };

        // Get the current gradebook data
        const currentGradebookSnapshot = await gradebookRef.once('value');
        const currentGradebookData = currentGradebookSnapshot.val();

        // Function to compare gradebook data (excluding lastChecked and lastUpdated fields)
        const isGradebookChanged = (current, newData) => {
            const currentCopy = { ...current };
            const newCopy = { ...newData };
            delete currentCopy.lastChecked;
            delete currentCopy.lastUpdated;
            delete newCopy.lastChecked;
            return JSON.stringify(currentCopy) !== JSON.stringify(newCopy);
        };

        if (!currentGradebookData || isGradebookChanged(currentGradebookData, newGradebookData)) {
            // Update the entire gradebook if it's new or has any changes
            newGradebookData.lastUpdated = admin.database.ServerValue.TIMESTAMP;
            await gradebookRef.set(newGradebookData);
            res.status(200).send(`Gradebook data for student ${sanitizedEmail} in course ${data.LMSCourseID} updated successfully`);
        } else {
            // No changes, just update the lastChecked timestamp
            await gradebookRef.update({ lastChecked: admin.database.ServerValue.TIMESTAMP });
            res.status(200).send(`No changes detected for student ${sanitizedEmail} in course ${data.LMSCourseID}`);
        }
    } catch (error) {
        console.error('Error updating gradebook data:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});





/**
 * Cloud Function: updateStudentData
 * 
 * Updates or adds student data based on the sanitized email.
 */
exports.updateStudentData = functions.https.onRequest(async (req, res) => {
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



/**
 * Cloud Function: updateCourseInfo
 * 
 * Updates or adds course information based on LMSCourseID.

exports.updateCourseInfo = functions.https.onRequest(async (req, res) => {
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
      console.log('Received course data:', JSON.stringify(data));

      // Validate required fields
      if (!data.LMSCourseID || !data.VersionNumber) {
          return res.status(400).send('LMSCourseID and VersionNumber are required');
      }

      // Ensure LMSCourseID is a string
      let lmsCourseId = data.LMSCourseID;
      if (typeof lmsCourseId !== 'string') {
          console.log(`LMSCourseID is not a string. Type: ${typeof lmsCourseId}, Value: ${lmsCourseId}`);
          lmsCourseId = String(lmsCourseId);
      }

      const db = admin.database();
      const courseRef = db.ref(`courses/${sanitizeEmail(lmsCourseId)}`);

      // Check if the course already exists and compare version numbers
      const snapshot = await courseRef.once('value');
      const existingData = snapshot.val();

      if (existingData && existingData.VersionNumber === data.VersionNumber) {
          return res.status(200).send(`Course data for LMSCourseID ${lmsCourseId} is already up to date.`);
      }

      // Process and store the data
      const courseData = {};

      for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'object' && value !== null) {
              if ('Value' in value) {
                  // Handle fields like Active, DiplomaCourse, CourseType
                  courseData[key] = value.Value;
              } else if (key.startsWith('Unit')) {
                  // Handle Unit fields
                  if (!courseData.units) courseData.units = [];
                  courseData.units.push({
                      name: key,
                      content: value,
                      sequence: parseInt(key.replace('Unit', ''))
                  });
              } else {
                  // For other object fields, store them as is
                  courseData[key] = value;
              }
          } else {
              // For simple fields, store them directly
              courseData[key] = value;
          }
      }

      // Ensure LMSCourseID is included in the courseData
      courseData.LMSCourseID = lmsCourseId.toLowerCase();

      // Sort units by sequence
      if (courseData.units) {
          courseData.units.sort((a, b) => a.sequence - b.sequence);
      }

      console.log('Processed course data:', JSON.stringify(courseData));

      // Set the data in the database
      await courseRef.set(courseData);

      res.status(200).send(`Course data for LMSCourseID ${lmsCourseId} updated successfully`);
  } catch (error) {
      console.error('Error updating course data:', error);
      res.status(500).send('Internal Server Error: ' + error.message);
  }
});
 */
/**
 * Cloud Function: updatePaymentInfo
 * 
 * Updates or adds payment information, handling both allPayments and student-specific Payments nodes.
 */
exports.updatePaymentInfo = functions.https.onRequest(async (req, res) => {
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

    /**
     * Determines the payment type based on the invoice number pattern.
     * 
     * @param {string} invoiceNumber - The invoice number to evaluate.
     * @returns {string} - The determined payment type.
     */
    function determinePaymentType(invoiceNumber) {
        // Highly flexible regex for legacy invoice numbers
        if (/^[0-9A-Z]{10,20}$/.test(invoiceNumber)) return 'legacy';
        if (/^DIP - \d{4}D$/.test(invoiceNumber)) return 'deposit';
        if (/^REC - \d{4}F$/.test(invoiceNumber)) return 'full';
        if (/^REC - \d{4}-S\d+\/\d+$/.test(invoiceNumber)) return 'subscription';
        return 'unknown';
    }

    try {
        const data = req.body;
        console.log('Received payment data:', JSON.stringify(data));

        // Validate required fields
        if (!data.InvoiceNumber) {
            return res.status(400).send('InvoiceNumber is required');
        }

        let paymentType = determinePaymentType(data.InvoiceNumber);

        const db = admin.database();
        let studentKey = null;
        let studentExists = false;

        if (data.StudentEmail) {
            studentKey = sanitizeEmail(data.StudentEmail);
            // Check if the student exists
            const studentSnapshot = await db.ref(`students/${studentKey}`).once('value');
            studentExists = studentSnapshot.exists();
        }

        // Check for existing payment in allPayments
        const allPaymentsRef = db.ref(`allPayments/${sanitizeEmail(data.InvoiceNumber)}`); // Ensure InvoiceNumber is sanitized if needed
        const allPaymentsSnapshot = await allPaymentsRef.once('value');

        let updates = {};
        let isNewPayment = !allPaymentsSnapshot.exists();
        let wasOrphaned = false;

        // Prepare payment data
        const paymentData = { 
            ...data, 
            type: paymentType,
            timestamp: admin.database.ServerValue.TIMESTAMP,
            orphaned: !studentExists
        };

        if (isNewPayment) {
            updates[`allPayments/${sanitizeEmail(data.InvoiceNumber)}`] = paymentData;
            if (studentExists) {
                updates[`students/${studentKey}/Payments/${sanitizeEmail(data.InvoiceNumber)}`] = paymentData;
            }
        } else {
            // Update existing payment
            const existingPayment = allPaymentsSnapshot.val();
            wasOrphaned = existingPayment.orphaned;
            const updatedPayment = { ...existingPayment, ...paymentData };
            
            updates[`allPayments/${sanitizeEmail(data.InvoiceNumber)}`] = updatedPayment;

            // Handle orphaned status changes
            if (wasOrphaned && studentExists) {
                updatedPayment.orphaned = false;
                updates[`students/${studentKey}/Payments/${sanitizeEmail(data.InvoiceNumber)}`] = updatedPayment;
            } else if (!wasOrphaned && !studentExists) {
                // Payment was associated with a student before, but now it's orphaned
                const oldStudentKey = sanitizeEmail(existingPayment.StudentEmail);
                updates[`students/${oldStudentKey}/Payments/${sanitizeEmail(data.InvoiceNumber)}`] = null; // Remove from previous student
            } else if (studentExists) {
                // Update in student's payments if student exists
                updates[`students/${studentKey}/Payments/${sanitizeEmail(data.InvoiceNumber)}`] = updatedPayment;
            }
        }

        // Perform the multi-path update
        await db.ref().update(updates);

        let responseMessage = '';
        if (isNewPayment) {
            if (studentExists) {
                responseMessage = `New payment data for invoice ${data.InvoiceNumber} added to student ${data.StudentEmail} and allPayments successfully`;
            } else {
                responseMessage = `New payment data for invoice ${data.InvoiceNumber} added to allPayments as orphaned.${data.StudentEmail ? ` Student ${data.StudentEmail} not found.` : ''}`;
            }
        } else {
            if (wasOrphaned && studentExists) {
                responseMessage = `Orphaned payment data for invoice ${data.InvoiceNumber} has been associated with student ${data.StudentEmail} and updated in allPayments`;
            } else if (studentExists) {
                responseMessage = `Existing payment data for invoice ${data.InvoiceNumber} updated for student ${data.StudentEmail} and in allPayments successfully`;
            } else {
                responseMessage = `Existing payment data for invoice ${data.InvoiceNumber} updated in allPayments.${data.StudentEmail ? ` Student ${data.StudentEmail} not found.` : ''}`;
            }
        }

        res.status(200).send(responseMessage);
    } catch (error) {
        console.error('Error updating payment data:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

/**
 * Cloud Function: deleteStudentsNode
 * 
 * Deletes the entire 'students' node from the database.
 * 
 * **Warning:** This action is irreversible. Ensure that you have a complete backup before proceeding.

exports.deleteStudentsNode = functions.https.onRequest(async (req, res) => {
    // Ensure this is a POST request
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Check for the Authorization header (use the same API_KEY as in your updateStudentData function)
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).send('Invalid or missing API key');
    }

    try {
        const db = admin.database();
        await db.ref('students').remove();
        res.status(200).send('Students node successfully deleted');
    } catch (error) {
        console.error('Error deleting students node:', error);
        res.status(500).send('Error deleting students node: ' + error.message);
    }
});
 */


// Safe to Remove
exports.restructureCourseData = functions.runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '1GB'
}).https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST, GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).send('Invalid or missing API key');
    }

    try {
        console.log('Starting restructuring of course data.');

        const coursesRef = admin.database().ref('courses');

        let processedCount = 0;
        let skippedCount = 0;
        let lastCourseKey = null;

        while (true) {
            let query = coursesRef.orderByKey().limitToFirst(BATCH_SIZE);
            if (lastCourseKey) {
                query = query.startAfter(lastCourseKey);
            }

            const snapshot = await query.once('value');
            const coursesData = snapshot.val();

            if (!coursesData) {
                break; // No more courses to process
            }

            const updates = {};

            for (const [courseId, courseData] of Object.entries(coursesData)) {
                try {
                    const restructuredCourse = restructureCourse(courseData);
                    if (restructuredCourse) {
                        updates[courseId] = restructuredCourse;
                        processedCount++;
                    } else {
                        console.log(`Skipped course ${courseId} due to incompatible structure.`);
                        skippedCount++;
                    }
                } catch (error) {
                    console.error(`Error processing course ${courseId}:`, error);
                    skippedCount++;
                }

                lastCourseKey = courseId;
            }

            // Update the courses node with the restructured data
            if (Object.keys(updates).length > 0) {
                await coursesRef.update(updates);
            }

            console.log(`Processed ${processedCount} courses, skipped ${skippedCount} courses.`);
        }

        console.log('Restructuring of course data completed.');
        res.status(200).send(`Course data restructured successfully. Processed ${processedCount} courses, skipped ${skippedCount} courses.`);
    } catch (error) {
        console.error('Error restructuring course data:', error);
        res.status(500).send('An error occurred while restructuring course data: ' + error.message);
    }
});

function restructureCourse(courseData) {
    if (!courseData) {
        return null; // Skip if course data is missing
    }

    // Clone the course data to avoid modifying the original
    const restructuredCourse = { ...courseData };

    // Remove the 'Unit_x0020_Names' property
    delete restructuredCourse['Unit_x0020_Names'];

    // Initialize the units array
    restructuredCourse.units = [];

    // Collect all unit keys that match 'Unit_x0020_1', 'Unit2', etc.
    const unitKeys = Object.keys(courseData).filter(key => key.match(/^Unit(_x0020_)?\d+$/));

    // Sort the unit keys based on the unit number
    unitKeys.sort((a, b) => {
        const aNum = parseInt(a.replace('Unit_x0020_', '').replace('Unit', ''), 10) || 0;
        const bNum = parseInt(b.replace('Unit_x0020_', '').replace('Unit', ''), 10) || 0;
        return aNum - bNum;
    });

    // Process each unit
    unitKeys.forEach((unitKey, index) => {
        const unitContent = courseData[unitKey];
        if (!unitContent) return; // Skip if no content

        // Split the unit content into items
        const unitItems = unitContent.split(',').map(item => item.trim()).filter(item => item);

        const unitNumber = parseInt(unitKey.replace('Unit_x0020_', '').replace('Unit', ''), 10) || (index + 1);
        const unitName = `Unit ${unitNumber}`;

        const unit = {
            name: unitName,
            sequence: unitNumber,
            items: []
        };

        let itemSequence = 1;

        unitItems.forEach(item => {
            if (item.startsWith('L') || item.startsWith('A') || item.startsWith('E')) {
                let itemType = '';
                let multiplier = 1;

                if (item.startsWith('L')) {
                    itemType = 'lesson';
                    multiplier = 1;
                } else if (item.startsWith('A')) {
                    itemType = 'assignment';
                    multiplier = 1.5;
                } else if (item.startsWith('E')) {
                    itemType = 'exam';
                    multiplier = 2;
                }

                unit.items.push({
                    title: item,
                    type: itemType,
                    sequence: itemSequence++,
                    multiplier: multiplier
                });
            }
            // Ignore items that don't start with L, A, or E
        });

        // Only add the unit if it has items
        if (unit.items.length > 0) {
            restructuredCourse.units.push(unit);
        }

        // Remove the old unit property from the course data
        delete restructuredCourse[unitKey];
    });

    return restructuredCourse;
}



exports.cleanItemTitles = functions.runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '1GB'
}).https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST, GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).send('Invalid or missing API key');
    }

    try {
        console.log('Starting item title cleanup.');

        const coursesRef = admin.database().ref('courses');

        let processedCount = 0;
        let skippedCount = 0;
        let lastCourseKey = null;

        while (true) {
            let query = coursesRef.orderByKey().limitToFirst(BATCH_SIZE);
            if (lastCourseKey) {
                query = query.startAfter(lastCourseKey);
            }

            const snapshot = await query.once('value');
            const coursesData = snapshot.val();

            if (!coursesData) {
                break; // No more courses to process
            }

            const updates = {};

            for (const [courseId, courseData] of Object.entries(coursesData)) {
                try {
                    const updatedCourse = updateItemTitles(courseData);
                    if (updatedCourse) {
                        updates[courseId] = updatedCourse;
                        processedCount++;
                    } else {
                        console.log(`Skipped course ${courseId} due to incompatible structure.`);
                        skippedCount++;
                    }
                } catch (error) {
                    console.error(`Error processing course ${courseId}:`, error);
                    skippedCount++;
                }

                lastCourseKey = courseId;
            }

            // Update the courses node with the updated data
            if (Object.keys(updates).length > 0) {
                await coursesRef.update(updates);
            }

            console.log(`Processed ${processedCount} courses, skipped ${skippedCount} courses.`);
        }

        console.log('Item title cleanup completed.');
        res.status(200).send(`Item titles cleaned successfully. Processed ${processedCount} courses, skipped ${skippedCount} courses.`);
    } catch (error) {
        console.error('Error cleaning item titles:', error);
        res.status(500).send('An error occurred while cleaning item titles: ' + error.message);
    }
});

function updateItemTitles(courseData) {
    if (!courseData || !Array.isArray(courseData.units)) {
        return null; // Skip if course data is missing or units are not an array
    }

    // Clone the course data to avoid modifying the original
    const updatedCourse = { ...courseData };

    updatedCourse.units = courseData.units.map(unit => {
        if (unit.items && Array.isArray(unit.items)) {
            const updatedItems = unit.items.map(item => {
                const updatedItem = { ...item };
                updatedItem.title = cleanTitle(item.title);
                return updatedItem;
            });
            return {
                ...unit,
                items: updatedItems
            };
        } else {
            return unit;
        }
    });

    return updatedCourse;
}

function cleanTitle(title) {
    if (!title) return title;

    // Remove leading 'L - ', 'A - ', 'E - ' or 'L', 'A', 'E' followed by ' - '
    return title.replace(/^[LAE]\s*-\s*/i, '');
}




///  Chat Functions

exports.removeUserFromChat = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to remove from chat.');
    }
  
    const { chatId } = data;
    const userEmail = context.auth.token.email.toLowerCase();
    const userDisplayName = context.auth.token.name || userEmail;
  
    const db = admin.database();
  
    try {
      // Add a system message about the user leaving
      await db.ref(`chats/${chatId}/messages`).push({
        text: `${userDisplayName} has left the chat.`,
        sender: 'system',
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });
  
      // Update the chat's participants list
      const chatSnapshot = await db.ref(`chats/${chatId}`).once('value');
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.val();
        const updatedParticipants = chatData.participants.filter(
          (email) => email.toLowerCase() !== userEmail
        );
        await db.ref(`chats/${chatId}`).update({ participants: updatedParticipants });
      }
  
      // Remove the chat from the user's userChats
      await db.ref(`userChats/${userEmail.replace('.', ',')}/${chatId}`).remove();
  
      return { success: true };
    } catch (error) {
      console.error('Error removing user from chat:', error);
      throw new functions.https.HttpsError('internal', 'Failed to remove user from chat.');
    }
  });