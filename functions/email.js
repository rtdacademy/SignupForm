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

  const verifiedSender = functions.config().sendgrid.sender;
  const senderEmail = context.auth.token.email;
  const senderName = context.auth.token.name || senderEmail;
  const timestamp = admin.database.ServerValue.TIMESTAMP;

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
      from: verifiedSender,
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

  const { recipients } = data;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Recipients must be a non-empty array.');
  }

  const verifiedSender = functions.config().sendgrid.sender;
  const senderEmail = context.auth.token.email;
  const senderName = context.auth.token.name || senderEmail;
  const timestamp = admin.database.ServerValue.TIMESTAMP;
  const db = admin.database();
  const senderKey = sanitizeEmail(senderEmail);

  try {
    // Fetch parent emails for students where ccParent is true
    const parentEmailsPromises = recipients
      .filter(recipient => recipient.ccParent)
      .map(async recipient => {
        const studentKey = sanitizeEmail(recipient.to);
        const studentRef = db.ref(`students/${studentKey}/profile/ParentEmail`);
        const snapshot = await studentRef.once('value');
        return {
          studentEmail: recipient.to,
          parentEmail: snapshot.val()
        };
      });

    const parentEmails = await Promise.all(parentEmailsPromises);
    const parentEmailMap = parentEmails.reduce((acc, { studentEmail, parentEmail }) => {
      if (parentEmail) {
        acc[studentEmail] = parentEmail;
      }
      return acc;
    }, {});

    // Prepare messages for SendGrid
    const messages = recipients.map(({ to, subject, text, html, ccParent }) => {
      const emailConfig = {
        to,
        from: verifiedSender,
        subject,
        text,
        html: html || text
      };

      // Add CC if parent email exists and ccParent is true
      const parentEmail = parentEmailMap[to];
      if (ccParent && parentEmail) {
        emailConfig.cc = parentEmail;
      }

      return emailConfig;
    });

    // Send all emails
    await sgMail.send(messages);

    // Prepare database updates
    const updates = {};
    const emailIds = [];

    // Create database entries for each email
    recipients.forEach(({ to, subject, text, html, ccParent }) => {
      const newEmailId = db.ref('emails').push().key;
      emailIds.push(newEmailId);
      const recipientKey = sanitizeEmail(to);
      const parentEmail = parentEmailMap[to];

      // Store email in recipient's history
      updates[`userEmails/${recipientKey}/${newEmailId}`] = {
        subject,
        text,
        html: html || text,
        timestamp,
        sender: senderEmail,
        senderName,
        read: false,
        ccParent: ccParent && !!parentEmail
      };

      // Store in sender's sent emails
      updates[`userEmails/${senderKey}/sent/${newEmailId}`] = {
        to,
        subject,
        text,
        html: html || text,
        timestamp,
        recipient: to,
        ccParent: ccParent && !!parentEmail
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
        ccParent: ccParent && !!parentEmail
      };
    });

    // Perform all updates atomically
    await db.ref().update(updates);

    return {
      success: true,
      emailIds,
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