const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const sgMail = require('@sendgrid/mail');

// Utility functions
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  

const validateEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = String(email).trim().toLowerCase(); // Trim whitespace
  return emailRegex.test(normalizedEmail);
};

const logEmailFailure = async (db, error, emailDetails) => {
  try {
    const errorRecord = {
      error: {
        message: error.message || 'No error message provided',
        code: error.code || 'NO_CODE',
        response: error.response?.body || null
      },
      emailDetails: emailDetails || {},
      timestamp: Date.now(),
      resolved: false
    };

    await db.ref('emailFailures').push(errorRecord);
  } catch (logError) {
    console.error('Failed to log email failure:', logError);
  }
};

// Initialize SendGrid with API key from Firebase environment
sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Cloud Function: sendBulkEmails
 * Sends bulk emails and creates corresponding records in Firebase
 */
exports.sendBulkEmails = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    console.error('Unauthenticated request attempted');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const senderEmail = context.auth.token.email;

  // Domain validation
  if (!senderEmail.endsWith('@rtdacademy.com')) {
    console.error(`Unauthorized sender domain: ${senderEmail}`);
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only RTD Academy staff members can send emails.'
    );
  }

  // Input validation
  const { recipients } = data;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    console.error('Invalid recipients array:', recipients);
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Recipients must be a non-empty array.'
    );
  }

  const senderName = context.auth.token.name || senderEmail;
  const timestamp = admin.database.ServerValue.TIMESTAMP;
  const db = admin.database();
  const senderKey = sanitizeEmail(senderEmail);

  try {
    console.log(
      `Processing bulk email request from ${senderEmail} to ${recipients.length} recipients`
    );
    const messagePrep = [];
    const invalidEmails = [];

    // Process each recipient
    recipients.forEach((recipient) => {
      // Normalize the recipient's email to lowercase and trim whitespace
      const normalizedTo = recipient.to?.trim().toLowerCase();
    
      if (!validateEmail(normalizedTo)) {
        console.warn(`Invalid recipient email: ${recipient.to}`);
        invalidEmails.push(recipient.to);
        return;
      }
    
      // Process CC and BCC emails similarly
      const validCc = (recipient.cc || [])
        .map(email => email.trim().toLowerCase()) // Trim and normalize
        .filter((email) => validateEmail(email));
    
      const validBcc = (recipient.bcc || [])
        .map(email => email.trim().toLowerCase()) // Trim and normalize
        .filter((email) => validateEmail(email));
    
      const recipientKey = sanitizeEmail(normalizedTo);
    
      // Prepare email content
      let finalHtml = recipient.html || recipient.text;
      let finalText = recipient.text || '';
    
      if (recipient.useDoNotReply) {
        const doNotReplyNotice = `
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        `;
        finalHtml += doNotReplyNotice;
        finalText += '\n\n---\nThis is an automated message. Please do not reply to this email.';
      }
    
      const emailId = db.ref('emails').push().key;
      console.log(`Generated emailId: ${emailId} for recipient: ${normalizedTo}`);
    
      // Prepare email configuration
      const emailConfig = {
        personalizations: [
          {
            to: [{ email: normalizedTo }], // Use sanitized version
            subject: recipient.subject,
            custom_args: {
              emailId
            },
            cc: validCc.map((email) => ({ email })), // Use sanitized version
            bcc: validBcc.map((email) => ({ email })) // Use sanitized version
          }
        ],
        from: {
          email: recipient.useDoNotReply ? 'noreply@rtdacademy.com' : senderEmail,
          name: recipient.useDoNotReply ? 'RTD Academy (Do Not Reply)' : senderName
        },
        reply_to: recipient.useDoNotReply
          ? undefined
          : {
              email: senderEmail,
              name: senderName
            },
        content: [
          {
            type: 'text/plain',
            value: finalText
          },
          {
            type: 'text/html',
            value: `${finalHtml}`
          }
        ],
        trackingSettings: {
          openTracking: {
            enable: true,
            substitutionTag: '%open-track%'
          }
        }
      };
    
      messagePrep.push({
        config: emailConfig,
        recipientKey,
        emailId,
        originalRecipient: {
          ...recipient,
          to: normalizedTo // Use sanitized version
        },
        ccRecipients: validCc,
        bccRecipients: validBcc,
        finalText,
        finalHtml
      });
    });
    

    // Send emails if we have valid recipients
    if (messagePrep.length > 0) {
      console.log(`Sending ${messagePrep.length} emails via SendGrid`);
      const messageConfigs = messagePrep.map((m) => m.config);

      try {
        await sgMail.send(messageConfigs);
        console.log('SendGrid send operation completed successfully');

        // Create tracking records
        const trackingRecords = messagePrep.map(
          ({ emailId, recipientKey, originalRecipient }) => ({
            emailId,
            recipientKey,
            senderKey,
            recipientEmail: originalRecipient.to,
            senderEmail,
            senderName,
            timestamp: Date.now(),
            subject: originalRecipient.subject,
            sent: true,
            events: {
              sent: {
                timestamp: Date.now(),
                success: true
              }
            },
            metadata: {
              courseId: originalRecipient.courseId || null,
              courseName: originalRecipient.courseName || null,
              useDoNotReply: originalRecipient.useDoNotReply || false
            }
          })
        );

        // Store tracking records
        await Promise.all([
          // Store tracking records
          ...trackingRecords.map(async (record, index) => {
            const { emailId, recipientKey, recipientEmail } = record;
            const ccEmails = messagePrep[index].ccRecipients || [];
            const bccEmails = messagePrep[index].bccRecipients || [];

            // -------------------------------
            // NEW for multiple recipients:
            // Build the "recipients" object for this emailId
            // containing "to", "cc", and "bcc" addresses
            // so handleWebhookEvents can store statuses in
            // /sendGridTracking/{emailId}/recipients/sanitizedEmail
            // -------------------------------
            const recipientsObj = {};

            // 1) The main "to" recipient
            recipientsObj[sanitizeEmail(recipientEmail)] = {
              email: recipientEmail,
              status: 'sent', // or "unknown" until webhook updates
              timestamp: Date.now()
            };

            // 2) CC
            ccEmails.forEach((cc) => {
              recipientsObj[sanitizeEmail(cc)] = {
                email: cc,
                status: 'sent',
                timestamp: Date.now()
              };
            });

            // 3) BCC
            bccEmails.forEach((bcc) => {
              recipientsObj[sanitizeEmail(bcc)] = {
                email: bcc,
                status: 'sent',
                timestamp: Date.now()
              };
            });

            // Build the top-level record (backwards-compatible)
            const topLevelTrackingData = {
              ...record,
              recipients: recipientsObj // <--- store them here
            };

            // Write the entire record
            return db.ref(`sendGridTracking/${emailId}`).set(topLevelTrackingData);
          }),

          // Also store userEmails & notifications
          ...messagePrep.map(async (preparedMessage) => {
            const { recipientKey, emailId, originalRecipient } = preparedMessage;

            const emailRecord = {
              subject: originalRecipient.subject,
              text: preparedMessage.finalText,
              html: preparedMessage.finalHtml,
              timestamp,
              sender: senderEmail,
              senderName,
              status: 'sent',
              ccRecipients: preparedMessage.ccRecipients,
              bccRecipients: preparedMessage.bccRecipients,
              sentAsNoReply: originalRecipient.useDoNotReply || false,
              courseId: originalRecipient.courseId,
              courseName: originalRecipient.courseName
            };

            return Promise.all([
              // Store recipient's copy
              db.ref(`userEmails/${recipientKey}/${emailId}`).set(emailRecord),

              // Store sender's copy
              db.ref(`userEmails/${senderKey}/sent/${emailId}`).set({
                ...emailRecord,
                to: originalRecipient.to
              }),

              // Create notification
              db.ref(`notifications/${recipientKey}/${emailId}`).set({
                type: 'new_email',
                emailId,
                sender: senderEmail,
                senderName,
                subject: originalRecipient.subject,
                preview: preparedMessage.finalText.substring(0, 100) + '...',
                timestamp,
                read: false
              }),

              // Add course note if applicable
              originalRecipient.courseId
                ? db
                    .ref(
                      `students/${recipientKey}/courses/${originalRecipient.courseId}/jsonStudentNotes`
                    )
                    .transaction((currentNotes) => {
                      const notesArray = Array.isArray(currentNotes) ? currentNotes : [];
                      const newNote = {
                        id: `email-note-${emailId}`,
                        content: `Subject: ${originalRecipient.subject}\nCourse: ${originalRecipient.courseName}`,
                        timestamp: Date.now(),
                        author: senderName,
                        noteType: '📧',
                        metadata: {
                          type: 'email',
                          emailId,
                          subject: originalRecipient.subject,
                          courseId: originalRecipient.courseId
                        }
                      };
                      return [newNote, ...notesArray];
                    })
                : Promise.resolve()
            ]);
          })
        ]);

        console.log('Successfully stored all records');
      } catch (sendGridError) {
        console.error('SendGrid send operation failed:', {
          message: sendGridError.message,
          response: sendGridError.response?.body,
          statusCode: sendGridError.code,
          details: sendGridError.response?.body?.errors,
          config: messageConfigs
        });

        await logEmailFailure(db, sendGridError, {
          recipients: messagePrep.map((m) => ({
            to: m.originalRecipient.to,
            subject: m.originalRecipient.subject,
            emailId: m.emailId
          })),
          sender: senderEmail,
          timestamp: Date.now()
        });

        throw new functions.https.HttpsError('internal', 'Failed to send emails via SendGrid');
      }

      return {
        success: true,
        timestamp,
        successfulCount: messagePrep.length,
        failedCount: invalidEmails.length,
        invalidEmails: invalidEmails.length > 0 ? invalidEmails : undefined
      };
    }

    console.log('No valid emails to send');
    return {
      success: false,
      message: 'No valid emails to send',
      invalidEmails
    };
  } catch (error) {
    console.error('Error in sendBulkEmails:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process email request');
  }
});

/**
 * Cloud Function: handleWebhookEvents
 * Processes webhook events from SendGrid
 */


exports.handleWebhookEvents = functions.runWith({
  timeoutSeconds: 30,
  memory: '128MB',
  maxInstances: 10,
}).https.onRequest(async (req, res) => {
  // 1) Ensure correct method
  if (req.method !== 'POST') {
    console.warn(`Invalid request method: ${req.method}`);
    return res.status(405).send('Method not allowed');
  }

  try {
    // 2) Parse events payload
    const events = req.body;
    if (!Array.isArray(events)) {
      console.error('Invalid event payload - expected array');
      return res.status(400).send('Invalid event payload');
    }

    console.log(`Processing ${events.length} webhook events...`);
    const db = admin.database();

    // 3) Process each event in parallel, but catch per-event errors
    await Promise.all(
      events.map(async (event) => {
        try {
          // Destructure fields from the incoming SendGrid event
          const {
            email,
            timestamp,
            event: eventType,
            sg_message_id,
            reason,
            status, // numeric code (bounces) or string
            ip,
            useragent,
            response,
            emailId
          } = event;

          // Validate core fields
          if (!emailId || !eventType || !timestamp) {
            console.log('Skipping invalid event:', event);
            return; // Skip
          }

          // Filter out unsupported event types
          const allowedEvents = ['processed', 'delivered', 'bounce', 'dropped', 'open'];
          if (!allowedEvents.includes(eventType)) {
            console.log(`Ignoring unsupported event type: ${eventType}`);
            return; // Skip
          }

          console.log(`Processing event for emailId: ${emailId}`, {
            type: eventType,
            timestamp,
            recipient: email
          });

          // Determine our internal status
          let newStatus;
          switch (eventType) {
            case 'delivered':
              newStatus = 'delivered';
              break;
            case 'bounce':
            case 'dropped':
              newStatus = 'failed';
              break;
            case 'open':
              newStatus = 'opened';
              break;
            case 'processed':
              newStatus = 'sent';
              break;
            default:
              newStatus = 'unknown';
          }

          // Build the object to store (omit undefined props)
          const newData = {
            email,
            eventType,
            timestamp,
            sg_message_id,
            status: newStatus // Our internal status
          };
          if (reason !== undefined) newData.reason = reason;
          if (status !== undefined) newData.code = status; // numeric code if bounce
          if (ip !== undefined) newData.ip = ip;
          if (useragent !== undefined) newData.useragent = useragent;
          if (response !== undefined) newData.response = response;

          // Fetch existing record from /sendGridTracking/{emailId}
          const trackingRef = db.ref(`sendGridTracking/${emailId}`);
          const snapshot = await trackingRef.once('value');
          const existingData = snapshot.val() || {};

          // If the record doesn't exist at all, skip or handle differently
          if (!existingData.recipients) {
            console.warn(`Unknown emailId: ${emailId}, no 'recipients' node found.`);
            return;
          }

          // Overwrite the per-recipient node with this new data
          const sanitizedRecipient = sanitizeEmail(email);
          const recipientRef = trackingRef.child(`recipients/${sanitizedRecipient}`);
          await recipientRef.set(newData);

          // Optionally, update userEmails if event is delivered or failed
          if (newStatus === 'delivered' || newStatus === 'failed') {
            const recipientKey = existingData.recipientKey; // main "to" user
            const senderKey = existingData.senderKey;

            // If this event is for the main "recipientEmail"
            if (email === existingData.recipientEmail && recipientKey) {
              await db.ref(`userEmails/${recipientKey}/${emailId}/status`).set(newStatus);
            }

            // Update the sender's "sent" folder if we have a senderKey
            if (senderKey) {
              await db.ref(`userEmails/${senderKey}/sent/${emailId}/status`).set(newStatus);
            }
          }

          console.log(
            `Successfully processed ${eventType} event for emailId: ${emailId} -> ${email}`
          );
        } catch (innerErr) {
          // This error only affects the single event
          console.error('Error processing individual event:', {
            message: innerErr.message,
            stack: innerErr.stack,
            event
          });
          // We do NOT throw again; we allow other events to continue
        }
      })
    );

    // If we reach here, we've tried to process all events
    console.log('Successfully processed all webhook events (with possible per-event errors)');
    return res.status(200).send('Events processed successfully');
  } catch (outerErr) {
    console.error('Critical error processing webhook events:', {
      message: outerErr.message,
      stack: outerErr.stack
    });
    return res.status(500).send('Error processing events');
  }
});
