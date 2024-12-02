const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const { sanitizeEmail } = require('./utils');

// Initialize SendGrid with API key from Firebase environment
sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Cloud Function: sendEmail
 */
const sendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send emails.');
  }

  const { to, subject, text, html, ccParent } = data;
  if (!to || !subject || !text) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
  }

  const senderEmail = context.auth.token.email;
  const senderName = context.auth.token.name || senderEmail;
  const timestamp = admin.database.ServerValue.TIMESTAMP;

  // Validate sender's email domain
  if (!senderEmail.endsWith('@rtdacademy.com')) {
    throw new functions.https.HttpsError('permission-denied', 'Only RTD Academy staff members can send emails.');
  }

  const db = admin.database();
  const recipientKey = sanitizeEmail(to);
  const senderKey = sanitizeEmail(senderEmail);

  try {
    // Generate new email ID
    const newEmailId = db.ref('emails').push().key;

    // If ccParent is true, fetch parent email
    let parentEmail = null;
    if (ccParent) {
      const studentRef = db.ref(`students/${recipientKey}/profile/ParentEmail`);
      const snapshot = await studentRef.once('value');
      parentEmail = snapshot.val();
    }

    // Prepare email message
    const msg = {
      to,
      from: {
        email: senderEmail,
        name: senderName
      },
      subject,
      text,
      html: html || text
    };

    // Add CC if parent email exists
    if (parentEmail) {
      msg.cc = parentEmail;
    }

    // Send email via SendGrid
    await sgMail.send(msg);

    // Prepare database updates
    const updates = {};

    // Store email in recipient's history
    updates[`userEmails/${recipientKey}/${newEmailId}`] = {
      subject,
      text,
      html: html || text,
      timestamp,
      sender: senderEmail,
      senderName,
      read: false,
      ccParent: !!parentEmail
    };

    // Store in sender's sent emails
    updates[`userEmails/${senderKey}/sent/${newEmailId}`] = {
      to,
      subject,
      text,
      html: html || text,
      timestamp,
      recipient: to,
      ccParent: !!parentEmail
    };

    // Create notification
    updates[`notifications/${recipientKey}/${newEmailId}`] = {
      type: 'new_email',
      emailId: newEmailId,
      sender: senderEmail,
      senderName,
      subject,
      preview: text.substring(0, 100) + '...',
      timestamp,
      read: false,
      isStaff: senderEmail.includes('@rtdacademy.com'),
      ccParent: !!parentEmail
    };

    // Perform all updates atomically
    await db.ref().update(updates);

    return {
      success: true,
      emailId: newEmailId,
      timestamp,
      ccParent: !!parentEmail
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email.');
  }
});

/**
 * Cloud Function: sendBulkEmails
 */
const sendBulkEmails = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const senderEmail = context.auth.token.email;
  
  // Validate sender's email domain
  if (!senderEmail.endsWith('@rtdacademy.com')) {
    throw new functions.https.HttpsError('permission-denied', 'Only RTD Academy staff members can send emails.');
  }

  const { recipients } = data;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Recipients must be a non-empty array.');
  }

  const senderName = context.auth.token.name || senderEmail;
  const timestamp = admin.database.ServerValue.TIMESTAMP;
  const db = admin.database();
  const senderKey = sanitizeEmail(senderEmail);

  try {
    // Prepare messages for SendGrid
    const messages = recipients.map(({ to, subject, text, html, ccParent }) => {
      const emailConfig = {
        to,
        from: {
          email: senderEmail,
          name: senderName
        },
        subject,
        text,
        html: html || text
      };

      return emailConfig;
    });

    // Send all emails
    await sgMail.send(messages);

    // For each recipient, update the database accordingly
    await Promise.all(recipients.map(async ({ to, subject, text, html, ccParent, courseId, courseName }) => {
      const recipientKey = sanitizeEmail(to);
      const newEmailId = db.ref('emails').push().key;

      // Store email in recipient's history
      await db.ref(`userEmails/${recipientKey}/${newEmailId}`).set({
        subject,
        text,
        html: html || text,
        timestamp,
        sender: senderEmail,
        senderName,
        read: false,
        ccParent: ccParent
      });

      // Store in sender's sent emails
      await db.ref(`userEmails/${senderKey}/sent/${newEmailId}`).set({
        to,
        subject,
        text,
        html: html || text,
        timestamp,
        recipient: to,
        ccParent: ccParent
      });

      // Create notification
      await db.ref(`notifications/${recipientKey}/${newEmailId}`).set({
        type: 'new_email',
        emailId: newEmailId,
        sender: senderEmail,
        senderName,
        subject,
        preview: text.substring(0, 100) + '...',
        timestamp,
        read: false,
        isStaff: senderEmail.includes('@rtdacademy.com'),
        ccParent: ccParent
      });

      // Add note to student's course
      if (courseId) {
        const notesRef = db.ref(`students/${recipientKey}/courses/${courseId}/jsonStudentNotes`);
        await notesRef.transaction((currentNotes) => {
          const notesArray = Array.isArray(currentNotes) ? currentNotes : [];
          const newNote = {
            id: `email-note-${newEmailId}`,
            content: `Subject: ${subject}\nCourse: ${courseName}\n${ccParent ? '(CC\'d to parent)' : ''}`,
            timestamp: Date.now(),
            author: senderName,
            noteType: '📧',
            metadata: {
              type: 'email',
              emailId: newEmailId,
              subject: subject,
              courseId: courseId,
              senderEmail: senderEmail
            }
          };
          // Prepend the new note to the array
          return [newNote, ...notesArray];
        });
      }
    }));

    return {
      success: true,
      timestamp,
      message: `Successfully sent ${recipients.length} emails`
    };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send bulk emails.');
  }
});



module.exports = {
  sendEmail,
  sendBulkEmails
};