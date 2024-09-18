const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Use the environment variable for the API key
const API_KEY = functions.config().api.key;

const profileFields = [
  'asn', 'ASN', 'originalEmail', 'StudentEmail', 'Title', 'StudentPhone', 'StudentAge',
  'Student', 'PrimaryID', 'Parent_x002f_Guardian', 'ParentPhone_x0023_',
  'ParentPermission_x003f_', 'ParentEmail', 'Name1', 'LastSync', 'StudentNotes'
];

const largeStringFields = ['Schedule', 'AssignmentsList'];

function sanitizeEmail(email) {
    return email.replace(/\./g, ',');
  }

function formatASN(asn) {
  const cleanASN = asn.replace(/\D/g, '').trim();
  if (/^\d{4}-\d{4}-\d$/.test(cleanASN)) return cleanASN;
  return cleanASN.length === 9 ? `${cleanASN.substr(0,4)}-${cleanASN.substr(4,4)}-${cleanASN.substr(8)}` : cleanASN;
}

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

        profileData.originalEmail = data.StudentEmail;

        if (Object.keys(profileData).length > 0) {
            await studentRef.child('profile').update(profileData);
        }

        if (Object.keys(courseData).length > 0) {
            await coursesRef.child(data.CourseID).update(courseData);
        }

        res.status(200).send(`Data for student with email ${data.StudentEmail} ${isNewCourse ? 'added to' : 'updated in'} course ${data.CourseID} successfully`);
    } catch (error) {
        console.error('Error updating student data:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});


/// Course information function

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

        if (!data.LMSCourseID || !data.VersionNumber) {
            return res.status(400).send('LMSCourseID and VersionNumber are required');
        }

        const db = admin.database();
        const courseRef = db.ref(`courses/${data.LMSCourseID}`);

        // Check if the course already exists and compare version numbers
        const snapshot = await courseRef.once('value');
        const existingData = snapshot.val();

        if (existingData && existingData.VersionNumber === data.VersionNumber) {
            return res.status(200).send(`Course data for LMSCourseID ${data.LMSCourseID} is already up to date.`);
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
                    if (!courseData.Units) courseData.Units = {};
                    courseData.Units[key] = value;
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
        courseData.LMSCourseID = data.LMSCourseID;

        // Set the data in the database
        await courseRef.set(courseData);

        res.status(200).send(`Course data for LMSCourseID ${data.LMSCourseID} updated successfully`);
    } catch (error) {
        console.error('Error updating course data:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});



// Updated Payment information function with dual storage
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

    function determinePaymentType(invoiceNumber) {
        // Highly flexible regex for legacy invoice numbers
        if (/^[0-9A-Z]{10,20}$/.test(invoiceNumber)) return 'legacy';
        if (/^DIP - \d{4}D$/.test(invoiceNumber)) return 'deposit';
        if (/^REC - \d{4}F$/.test(invoiceNumber)) return 'full';
        if (/^REC - \d{4}-S\d+\/\d+$/.test(invoiceNumber)) return 'subscription';
        return 'unknown';
    }

    function sanitizeEmail(email) {
        return email.replace(/\./g, ',');
    }

    try {
        const data = req.body;
        console.log('Received payment data:', JSON.stringify(data));

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
        const allPaymentsRef = db.ref(`allPayments/${data.InvoiceNumber}`);
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
            updates[`allPayments/${data.InvoiceNumber}`] = paymentData;
            if (studentExists) {
                updates[`students/${studentKey}/Payments/${data.InvoiceNumber}`] = paymentData;
            }
        } else {
            // Update existing payment
            const existingPayment = allPaymentsSnapshot.val();
            wasOrphaned = existingPayment.orphaned;
            const updatedPayment = { ...existingPayment, ...paymentData };
            
            updates[`allPayments/${data.InvoiceNumber}`] = updatedPayment;

            // Handle orphaned status changes
            if (wasOrphaned && studentExists) {
                updatedPayment.orphaned = false;
                updates[`students/${studentKey}/Payments/${data.InvoiceNumber}`] = updatedPayment;
            } else if (!wasOrphaned && !studentExists) {
                // Payment was associated with a student before, but now it's orphaned
                const oldStudentKey = sanitizeEmail(existingPayment.StudentEmail);
                updates[`students/${oldStudentKey}/Payments/${data.InvoiceNumber}`] = null; // Remove from previous student
            } else if (studentExists) {
                // Update in student's payments if student exists
                updates[`students/${studentKey}/Payments/${data.InvoiceNumber}`] = updatedPayment;
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
/*
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