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

  const { to, subject, text, html, ccParent = false, useDoNotReply = false } = data;
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

    // Prepare email content with do-not-reply notice if applicable
    let finalHtml = html || text;
    let finalText = text;

    if (useDoNotReply) {
      const doNotReplyNotice = `
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      `;
      finalHtml += doNotReplyNotice;
      finalText += "\n\n---\nThis is an automated message. Please do not reply to this email.";
    }

    // Prepare email message
    const msg = {
      to,
      from: {
        email: useDoNotReply ? 'noreply@rtdacademy.com' : senderEmail,
        name: useDoNotReply ? 'RTD Academy (Do Not Reply)' : senderName
      },
      subject,
      text: finalText,
      html: finalHtml,
      replyTo: useDoNotReply ? undefined : senderEmail
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
      text: finalText,
      html: finalHtml,
      timestamp,
      sender: senderEmail,
      senderName,
      read: false,
      ccParent: !!parentEmail,
      sentAsNoReply: useDoNotReply || false
    };

    // Store in sender's sent emails
    updates[`userEmails/${senderKey}/sent/${newEmailId}`] = {
      to,
      subject,
      text: finalText,
      html: finalHtml,
      timestamp,
      recipient: to,
      ccParent: !!parentEmail,
      sentAsNoReply: useDoNotReply || false
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
      isStaff: true,
      ccParent: !!parentEmail,
      sentAsNoReply: useDoNotReply || false
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
    const messagePrep = await Promise.all(recipients.map(async ({ to, subject, text, html, ccParent = false, useDoNotReply = false }) => {
      // Get parent email if needed
      let parentEmail = null;
      if (ccParent) {
        const recipientKey = sanitizeEmail(to);
        const studentRef = db.ref(`students/${recipientKey}/profile/ParentEmail`);
        const snapshot = await studentRef.once('value');
        parentEmail = snapshot.val();
      }

      // Add do-not-reply notice if applicable
      let finalHtml = html || text;
      let finalText = text;

      if (useDoNotReply) {
        const doNotReplyNotice = `
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        `;
        finalHtml += doNotReplyNotice;
        finalText += "\n\n---\nThis is an automated message. Please do not reply to this email.";
      }

      const emailConfig = {
        to,
        from: {
          email: useDoNotReply ? 'noreply@rtdacademy.com' : senderEmail,
          name: useDoNotReply ? 'RTD Academy (Do Not Reply)' : senderName
        },
        subject,
        text: finalText,
        html: finalHtml,
        replyTo: useDoNotReply ? undefined : senderEmail
      };

      // Add CC if parent email exists
      if (parentEmail) {
        emailConfig.cc = parentEmail;
      }

      return {
        config: emailConfig,
        parentEmail,
        finalText,
        finalHtml
      };
    }));

    // Extract just the email configs for SendGrid
    const messageConfigs = messagePrep.map(m => m.config);

    // Send all emails
    await sgMail.send(messageConfigs);

    // For each recipient, update the database accordingly
    await Promise.all(recipients.map(async ({ to, subject, text, html, ccParent = false, courseId, courseName, useDoNotReply = false }, index) => {
      const recipientKey = sanitizeEmail(to);
      const newEmailId = db.ref('emails').push().key;
      const { parentEmail, finalText, finalHtml } = messagePrep[index];

      // Store email in recipient's history
      await db.ref(`userEmails/${recipientKey}/${newEmailId}`).set({
        subject,
        text: finalText,
        html: finalHtml,
        timestamp,
        sender: senderEmail,
        senderName,
        read: false,
        ccParent: !!parentEmail,
        sentAsNoReply: useDoNotReply || false
      });

      // Store in sender's sent emails
      await db.ref(`userEmails/${senderKey}/sent/${newEmailId}`).set({
        to,
        subject,
        text: finalText,
        html: finalHtml,
        timestamp,
        recipient: to,
        ccParent: !!parentEmail,
        sentAsNoReply: useDoNotReply || false
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
        isStaff: true,
        ccParent: !!parentEmail,
        sentAsNoReply: useDoNotReply || false
      });

      // Add note to student's course
      if (courseId) {
        const notesRef = db.ref(`students/${recipientKey}/courses/${courseId}/jsonStudentNotes`);
        await notesRef.transaction((currentNotes) => {
          const notesArray = Array.isArray(currentNotes) ? currentNotes : [];
          const newNote = {
            id: `email-note-${newEmailId}`,
            content: `Subject: ${subject}\nCourse: ${courseName}\n${parentEmail ? `(CC'd to parent: ${parentEmail})` : ''}${useDoNotReply ? ' (Sent as no-reply)' : ''}`,
            timestamp: Date.now(),
            author: senderName,
            noteType: '📧',
            metadata: {
              type: 'email',
              emailId: newEmailId,
              subject: subject,
              courseId: courseId,
              senderEmail: senderEmail,
              sentAsNoReply: useDoNotReply || false
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