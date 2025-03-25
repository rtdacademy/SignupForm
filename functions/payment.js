// functions/payment.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail, API_KEY } = require('./utils');

/**
 * Cloud Function: updatePaymentInfo
 *
 * Updates or adds payment information, handling both allPayments and student-specific Payments nodes.
 */
const updatePaymentInfo = functions.https.onRequest(async (req, res) => {
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

module.exports = {
  updatePaymentInfo,
};
