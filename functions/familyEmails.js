// Family Email Cloud Functions
// Specialized email handling for Home Education families

const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Utility functions
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = String(email).trim().toLowerCase();
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

    await db.ref('homeEducationFamilies/emailFailures').push(errorRecord);
  } catch (logError) {
    console.error('Failed to log email failure:', logError);
  }
};

/**
 * Cloud Function: sendFamilyEmailsV2
 * Sends bulk emails to Home Education families and creates corresponding records
 */
const sendFamilyEmailsV2 = onCall({
  memory: '2GiB',
  timeoutSeconds: 540,
  concurrency: 500,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"],
  secrets: ["SENDGRID_KEY"]
}, async (data) => {
  // Initialize SendGrid with API key from Secret Manager
  sgMail.setApiKey(process.env.SENDGRID_KEY);
  
  // Authentication check
  if (!data.auth) {
    console.error('Unauthenticated request attempted');
    throw new Error('User must be authenticated.');
  }

  const senderEmail = data.auth.token.email;

  // Domain validation
  if (!senderEmail.endsWith('@rtdacademy.com')) {
    console.error(`Unauthorized sender domain: ${senderEmail}`);
    throw new Error('Only RTD Academy staff members can send emails.');
  }

  // Input validation
  const { recipients } = data.data;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    console.error('Invalid recipients array:', recipients);
    throw new Error('Recipients must be a non-empty array.');
  }

  // Limit batch size to 3000
  if (recipients.length > 3000) {
    console.error(`Batch size exceeds limit: ${recipients.length}`);
    throw new Error('Maximum 3000 recipients can be processed in a single batch.');
  }

  const senderName = data.auth.token.name || senderEmail;
  const timestamp = Date.now();
  const db = admin.database();
  const firestore = admin.firestore();
  const senderKey = sanitizeEmail(senderEmail);
  let batchId;

  try {
    console.log(
      `Processing family email request from ${senderEmail} to ${recipients.length} recipients`
    );
    
    // Create batch ID for tracking
    batchId = db.ref('homeEducationFamilies/emailBatches').push().key;
    const batchRef = db.ref(`homeEducationFamilies/emailBatches/${batchId}`);
    
    // Initialize batch status
    await batchRef.set({
      status: 'processing',
      total: recipients.length,
      completed: 0,
      successful: 0,
      failed: 0,
      startTime: Date.now(),
      sender: senderEmail,
      senderName
    });
    
    // Validate and prepare message configurations
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
    
      // Process CC and BCC emails
      const validCc = (recipient.cc || [])
        .map(email => email.trim().toLowerCase())
        .filter((email) => validateEmail(email));
    
      const validBcc = (recipient.bcc || [])
        .map(email => email.trim().toLowerCase())
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
    
      const emailId = db.ref('homeEducationFamilies/emails').push().key;
      console.log(`Generated emailId: ${emailId} for recipient: ${normalizedTo}`);
    
      // Prepare email configuration
      const emailConfig = {
        personalizations: [
          {
            to: [{ email: normalizedTo }],
            subject: recipient.subject,
            custom_args: {
              emailId,
              familyId: recipient.familyId
            },
            cc: validCc.map((email) => ({ email })),
            bcc: validBcc.map((email) => ({ email }))
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
          to: normalizedTo
        },
        ccRecipients: validCc,
        bccRecipients: validBcc,
        finalText,
        finalHtml,
        familyId: recipient.familyId,
        guardianName: recipient.guardianName
      });
    });
    
    // Update batch status with counts
    await batchRef.update({
      validRecipients: messagePrep.length,
      invalidCount: invalidEmails.length
    });

    // Process emails if we have valid recipients
    if (messagePrep.length > 0) {
      console.log(`Sending ${messagePrep.length} emails via SendGrid`);
      
      // Process in chunks to avoid overloading the system
      const MAIN_CHUNK_SIZE = 500;
      const mainChunks = [];
      
      for (let i = 0; i < messagePrep.length; i += MAIN_CHUNK_SIZE) {
        mainChunks.push(messagePrep.slice(i, i + MAIN_CHUNK_SIZE));
      }
      
      let totalSuccessful = 0;
      let totalFailed = 0;
      const failedEmails = [];
      
      // Process main chunks sequentially
      for (let mainChunkIndex = 0; mainChunkIndex < mainChunks.length; mainChunkIndex++) {
        const mainChunk = mainChunks[mainChunkIndex];
        console.log(`Processing main chunk ${mainChunkIndex + 1}/${mainChunks.length} (${mainChunk.length} emails)`);
        
        // Update batch status for this main chunk
        await batchRef.update({
          currentMainChunk: mainChunkIndex + 1,
          totalMainChunks: mainChunks.length,
          mainChunkSize: mainChunk.length
        });
        
        // Sub-chunking
        const SUB_CHUNK_SIZE = 25;
        const subChunks = [];
        
        for (let i = 0; i < mainChunk.length; i += SUB_CHUNK_SIZE) {
          subChunks.push(mainChunk.slice(i, i + SUB_CHUNK_SIZE));
        }
        
        // Process sub-chunks sequentially
        for (let subChunkIndex = 0; subChunkIndex < subChunks.length; subChunkIndex++) {
          const subChunk = subChunks[subChunkIndex];
          const globalChunkIndex = `${mainChunkIndex+1}.${subChunkIndex+1}`;
          console.log(`Processing sub-chunk ${globalChunkIndex} (${subChunk.length} emails)`);
          
          try {
            // Send this chunk of emails via SendGrid
            const messageConfigs = subChunk.map((m) => m.config);
            await sgMail.send(messageConfigs);
            console.log(`SendGrid send operation completed successfully for subchunk ${globalChunkIndex}`);
            
            // Create tracking records in parallel
            await Promise.all([
              // Store tracking records
              ...subChunk.map(async (preparedMessage) => {
                const { emailId, recipientKey, originalRecipient, ccRecipients, bccRecipients, familyId, guardianName } = preparedMessage;
                
                // Build the "recipients" object for this emailId
                const recipientsObj = {};

                // Main "to" recipient
                recipientsObj[sanitizeEmail(originalRecipient.to)] = {
                  email: originalRecipient.to,
                  status: 'sent',
                  timestamp: Date.now()
                };

                // CC recipients
                ccRecipients.forEach((cc) => {
                  recipientsObj[sanitizeEmail(cc)] = {
                    email: cc,
                    status: 'sent',
                    timestamp: Date.now()
                  };
                });

                // BCC recipients
                bccRecipients.forEach((bcc) => {
                  recipientsObj[sanitizeEmail(bcc)] = {
                    email: bcc,
                    status: 'sent',
                    timestamp: Date.now()
                  };
                });

                // Store tracking record in Realtime Database
                await db.ref(`homeEducationFamilies/emailTracking/${familyId}/emails/${emailId}`).set({
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
                    familyId,
                    guardianName,
                    useDoNotReply: originalRecipient.useDoNotReply || false
                  },
                  recipients: recipientsObj
                });

                // Store email record for recipient
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
                  familyId,
                  guardianName
                };

                // Store in user emails
                await db.ref(`userEmails/${recipientKey}/${emailId}`).set(emailRecord);

                // Store sender's copy
                await db.ref(`userEmails/${senderKey}/sent/${emailId}`).set({
                  ...emailRecord,
                  to: originalRecipient.to
                });

                // Create notification
                await db.ref(`notifications/${recipientKey}/${emailId}`).set({
                  type: 'new_email',
                  emailId,
                  sender: senderEmail,
                  senderName,
                  subject: originalRecipient.subject,
                  preview: preparedMessage.finalText.substring(0, 100) + '...',
                  timestamp,
                  read: false
                });

                // Create a note in Firestore for the family
                if (familyId) {
                  try {
                    const noteRef = firestore.collection('familyNotes').doc(familyId).collection('notes');
                    await noteRef.add({
                      content: `
                        <div class="email-note">
                          <p><strong>Email Sent:</strong> ${originalRecipient.subject}</p>
                          <p><strong>To:</strong> ${guardianName} (${originalRecipient.to})</p>
                          ${ccRecipients.length > 0 ? `<p><strong>CC:</strong> ${ccRecipients.join(', ')}</p>` : ''}
                          <p class="email-preview">${preparedMessage.finalText.substring(0, 200)}...</p>
                        </div>
                      `,
                      category: 'communication',
                      visibility: 'shared',
                      isImportant: false,
                      authorEmail: senderEmail,
                      authorName: senderName,
                      createdAt: process.env.FUNCTIONS_EMULATOR ? new Date() : admin.firestore.FieldValue.serverTimestamp(),
                      updatedAt: process.env.FUNCTIONS_EMULATOR ? new Date() : admin.firestore.FieldValue.serverTimestamp(),
                      readBy: [senderEmail],
                      metadata: {
                        type: 'email',
                        emailId,
                        subject: originalRecipient.subject,
                        recipientEmail: originalRecipient.to,
                        familyId
                      }
                    });
                  } catch (firestoreError) {
                    console.error('Error creating Firestore note:', firestoreError);
                    // Don't fail the email send if note creation fails
                  }
                }
                
                // Update batch counts
                await batchRef.child('successful').transaction(current => (current || 0) + 1);
                await batchRef.child('completed').transaction(current => (current || 0) + 1);
                
                totalSuccessful++;
              })
            ]);
            
          } catch (sendGridError) {
            console.error('SendGrid send operation failed for subchunk:', {
              chunkIndex: globalChunkIndex,
              message: sendGridError.message,
              response: sendGridError.response?.body,
              statusCode: sendGridError.code,
              details: sendGridError.response?.body?.errors
            });

            await logEmailFailure(db, sendGridError, {
              recipients: subChunk.map((m) => ({
                to: m.originalRecipient.to,
                subject: m.originalRecipient.subject,
                emailId: m.emailId,
                familyId: m.familyId
              })),
              sender: senderEmail,
              timestamp: Date.now(),
              chunkIndex: globalChunkIndex
            });
            
            // Track failed emails
            subChunk.forEach(m => {
              failedEmails.push({
                recipient: m.originalRecipient.to,
                message: sendGridError.message || 'SendGrid error'
              });
            });
            
            // Mark all emails in this chunk as failed
            totalFailed += subChunk.length;
            await batchRef.child('failed').transaction(current => (current || 0) + subChunk.length);
            await batchRef.child('completed').transaction(current => (current || 0) + subChunk.length);
          }
          
          // Update progress
          await batchRef.update({
            currentSubChunk: subChunkIndex + 1,
            totalSubChunks: subChunks.length,
            subChunkSize: subChunk.length,
            progress: Math.round((totalSuccessful + totalFailed) / messagePrep.length * 100)
          });
          
          console.log(`Completed sub-chunk ${globalChunkIndex}: ${subChunk.length} emails processed`);
        }
        
        console.log(`Completed main chunk ${mainChunkIndex + 1}/${mainChunks.length}`);
        console.log(`Progress: ${totalSuccessful} successful, ${totalFailed} failed`);
      }
      
      // Update final batch status
      await batchRef.update({
        status: 'completed',
        endTime: Date.now(),
        totalSuccessful,
        totalFailed,
        progress: 100
      });
      
      console.log(`Family email batch completed: ${totalSuccessful} successful, ${totalFailed} failed`);
      
      return {
        success: true,
        batchId,
        timestamp,
        successfulCount: totalSuccessful,
        failedCount: totalFailed,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
        invalidEmails: invalidEmails.length > 0 ? invalidEmails : undefined
      };
    }

    console.log('No valid emails to send');
    return {
      success: false,
      batchId,
      message: 'No valid emails to send',
      invalidEmails
    };
  } catch (error) {
    console.error('Error in sendFamilyEmailsV2:', error);
    
    // Update batch status to failed
    if (batchId) {
      await db.ref(`homeEducationFamilies/emailBatches/${batchId}`).update({
        status: 'failed',
        endTime: Date.now(),
        error: error.message
      });
    }
    
    throw new Error('Failed to process email request: ' + error.message);
  }
});

/**
 * Cloud Function: handleFamilyWebhookEvents
 * Processes webhook events from SendGrid for family emails
 */
const handleFamilyWebhookEvents = onRequest({
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 20,
  cors: true,
  secrets: ["SENDGRID_KEY"]
}, async (req, res) => {
  // Initialize SendGrid with API key
  sgMail.setApiKey(process.env.SENDGRID_KEY);
  
  // Ensure correct method
  if (req.method !== 'POST') {
    console.warn(`Invalid request method: ${req.method}`);
    return res.status(405).send('Method not allowed');
  }

  try {
    // Parse events payload
    const events = req.body;
    if (!Array.isArray(events)) {
      console.error('Invalid event payload - expected array');
      return res.status(400).send('Invalid event payload');
    }

    console.log(`Processing ${events.length} family webhook events...`);
    const db = admin.database();
    const firestore = admin.firestore();

    // Process each event
    await Promise.all(
      events.map(async (event) => {
        try {
          const {
            email,
            timestamp,
            event: eventType,
            sg_message_id,
            reason,
            status,
            ip,
            useragent,
            response,
            emailId,
            familyId
          } = event;

          // Validate core fields
          if (!emailId || !eventType || !timestamp || !familyId) {
            console.log('Skipping invalid event:', event);
            return;
          }

          // Filter out unsupported event types
          const allowedEvents = ['processed', 'delivered', 'bounce', 'dropped', 'open'];
          if (!allowedEvents.includes(eventType)) {
            console.log(`Ignoring unsupported event type: ${eventType}`);
            return;
          }

          console.log(`Processing event for emailId: ${emailId}`, {
            type: eventType,
            timestamp,
            recipient: email,
            familyId
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

          // Build the update object
          const newData = {
            email,
            eventType,
            timestamp,
            sg_message_id,
            status: newStatus
          };
          if (reason !== undefined) newData.reason = reason;
          if (status !== undefined) newData.code = status;
          if (ip !== undefined) newData.ip = ip;
          if (useragent !== undefined) newData.useragent = useragent;
          if (response !== undefined) newData.response = response;

          // Update tracking in Realtime Database
          const trackingRef = db.ref(`homeEducationFamilies/emailTracking/${familyId}/emails/${emailId}`);
          const snapshot = await trackingRef.once('value');
          const existingData = snapshot.val() || {};

          if (!existingData.recipients) {
            console.warn(`Unknown emailId: ${emailId}, no 'recipients' node found.`);
            return;
          }

          // Update the per-recipient node
          const sanitizedRecipient = sanitizeEmail(email);
          const recipientRef = trackingRef.child(`recipients/${sanitizedRecipient}`);
          await recipientRef.set(newData);

          // Update userEmails if event is delivered or failed
          if (newStatus === 'delivered' || newStatus === 'failed') {
            const recipientKey = existingData.recipientKey;
            const senderKey = existingData.senderKey;

            if (email === existingData.recipientEmail && recipientKey) {
              await db.ref(`userEmails/${recipientKey}/${emailId}/status`).set(newStatus);
            }

            if (senderKey) {
              await db.ref(`userEmails/${senderKey}/sent/${emailId}/status`).set(newStatus);
            }
          }

          // Update Firestore note if exists (for status tracking in UI)
          if (newStatus === 'delivered' || newStatus === 'opened') {
            try {
              const notesQuery = await firestore
                .collection('familyNotes')
                .doc(familyId)
                .collection('notes')
                .where('metadata.emailId', '==', emailId)
                .limit(1)
                .get();

              if (!notesQuery.empty) {
                const noteDoc = notesQuery.docs[0];
                await noteDoc.ref.update({
                  'metadata.status': newStatus,
                  'metadata.lastStatusUpdate': process.env.FUNCTIONS_EMULATOR ? new Date() : admin.firestore.FieldValue.serverTimestamp()
                });
              }
            } catch (firestoreError) {
              console.error('Error updating Firestore note status:', firestoreError);
            }
          }

          console.log(
            `Successfully processed ${eventType} event for emailId: ${emailId} -> ${email}`
          );
        } catch (innerErr) {
          console.error('Error processing individual event:', {
            message: innerErr.message,
            stack: innerErr.stack,
            event
          });
        }
      })
    );

    console.log('Successfully processed all family webhook events');
    return res.status(200).send('Events processed successfully');
  } catch (outerErr) {
    console.error('Critical error processing family webhook events:', {
      message: outerErr.message,
      stack: outerErr.stack
    });
    return res.status(500).send('Error processing events');
  }
});

// Export functions
module.exports = {
  sendFamilyEmailsV2,
  handleFamilyWebhookEvents
};