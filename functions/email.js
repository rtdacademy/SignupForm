// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');


// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const sgMail = require('@sendgrid/mail');
const { getUpcomingCourseEmail, getStartingTodayEmail } = require('./emailTemplates');



// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

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

/**
 * Cloud Function: sendBulkEmailsV2
 * Sends bulk emails and creates corresponding records in Firebase
 * V2 version with improved concurrency handling for up to 3000 emails
 */
const sendBulkEmailsV2 = onCall({
  memory: '2GiB',
  timeoutSeconds: 540, // 9 minutes should be enough for 3000 emails
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
    throw new Error('Maximum 3000 recipients can be processed in a single batch. Please reduce the selection and try again.');
  }

  const senderName = data.auth.token.name || senderEmail;
  const timestamp = Date.now();
  const db = admin.database();
  const senderKey = sanitizeEmail(senderEmail);

  try {
    console.log(
      `Processing bulk email request from ${senderEmail} to ${recipients.length} recipients`
    );
    
    // Create batch ID for tracking
    const batchId = db.ref('emailBatches').push().key;
    const batchRef = db.ref(`emailBatches/${batchId}`);
    
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
        
        // Sub-chunking - break each 500-email chunk into smaller chunks for parallel processing
        const SUB_CHUNK_SIZE = 25;
        const subChunks = [];
        
        for (let i = 0; i < mainChunk.length; i += SUB_CHUNK_SIZE) {
          subChunks.push(mainChunk.slice(i, i + SUB_CHUNK_SIZE));
        }
        
        // Process sub-chunks sequentially to reduce SendGrid rate limiting
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
              ...subChunk.map(async (preparedMessage, index) => {
                const { emailId, recipientKey, originalRecipient, ccRecipients, bccRecipients } = preparedMessage;
                
                // Build the "recipients" object for this emailId
                const recipientsObj = {};

                // 1) The main "to" recipient
                recipientsObj[sanitizeEmail(originalRecipient.to)] = {
                  email: originalRecipient.to,
                  status: 'sent',
                  timestamp: Date.now()
                };

                // 2) CC
                ccRecipients.forEach((cc) => {
                  recipientsObj[sanitizeEmail(cc)] = {
                    email: cc,
                    status: 'sent',
                    timestamp: Date.now()
                  };
                });

                // 3) BCC
                bccRecipients.forEach((bcc) => {
                  recipientsObj[sanitizeEmail(bcc)] = {
                    email: bcc,
                    status: 'sent',
                    timestamp: Date.now()
                  };
                });

                // Store tracking record
                await db.ref(`sendGridTracking/${emailId}`).set({
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
                  },
                  recipients: recipientsObj
                });

                // Store email record and create notification
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

                await Promise.all([
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
                
                // Update batch counts using transactions
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
                emailId: m.emailId
              })),
              sender: senderEmail,
              timestamp: Date.now(),
              chunkIndex: globalChunkIndex
            });
            
            // Mark all emails in this chunk as failed
            totalFailed += subChunk.length;
            await batchRef.child('failed').transaction(current => (current || 0) + subChunk.length);
            await batchRef.child('completed').transaction(current => (current || 0) + subChunk.length);
            
            // Update failed status in batch details
            const failedChunksRef = batchRef.child('failedChunks');
            await failedChunksRef.transaction(current => {
              const failedChunks = current || [];
              failedChunks.push({
                chunkIndex: globalChunkIndex,
                error: sendGridError.message,
                count: subChunk.length
              });
              return failedChunks;
            });
          }
          
          // Update progress info for this sub-chunk
          await batchRef.update({
            currentSubChunk: subChunkIndex + 1,
            totalSubChunks: subChunks.length,
            subChunkSize: subChunk.length,
            progress: Math.round((totalSuccessful + totalFailed) / messagePrep.length * 100)
          });
          
          console.log(`Completed sub-chunk ${globalChunkIndex}: ${subChunk.length} emails processed`);
        }
        
        // Checkpoint after each main chunk
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
      
      console.log(`Batch email send completed: ${totalSuccessful} successful, ${totalFailed} failed`);
      
      return {
        success: true,
        batchId,
        timestamp,
        successfulCount: totalSuccessful,
        failedCount: totalFailed,
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
    console.error('Error in sendBulkEmailsV2:', error);
    
    // Update batch status to failed
    if (batchId) {
      await batchRef.update({
        status: 'failed',
        endTime: Date.now(),
        error: error.message
      });
    }
    
    throw new Error('Failed to process email request: ' + error.message);
  }
});

/**
 * Cloud Function: handleWebhookEventsV2
 * Processes webhook events from SendGrid
 */
const handleWebhookEventsV2 = onRequest({
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 20,
  cors: true,
  secrets: ["SENDGRID_KEY"]
}, async (req, res) => {
  // Initialize SendGrid with API key from Secret Manager if needed for any operations
  sgMail.setApiKey(process.env.SENDGRID_KEY);
  
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

// Helper function for sending course emails
const sendCourseEmail = async (sgMail, studentKey, studentEmail, courseId, courseName, ccList, type) => {
  const db = admin.database();
  const emailId = db.ref('emails').push().key;
  
  // Determine email content based on type
  const isUpcoming = type === 'upcoming';
  const subject = isUpcoming ? 
      `Upcoming Course Reminder - ${courseName}` :
      `Your Course Begins Today - ${courseName}`;
  
  const html = isUpcoming ?
      getUpcomingCourseEmail(courseName) :
      getStartingTodayEmail(courseName);
  
  const text = isUpcoming ?
      `Your course ${courseName} will be resuming in 2 days.` :
      `Your course ${courseName} is resuming today!`;

  const emailConfig = {
      personalizations: [{
          to: [{ email: studentEmail }],
          cc: ccList.map(email => ({ email })),
          subject,
          custom_args: { emailId }
      }],
      from: {
          email: 'info@rtdacademy.com',
          name: 'RTD Academy'
      },
      content: [
          {
              type: 'text/plain',
              value: text
          },
          {
              type: 'text/html',
              value: html
          }
      ],
      trackingSettings: {
          openTracking: {
              enable: true,
              substitutionTag: '%open-track%'
          }
      }
  };

  await sgMail.send(emailConfig);

  const timestamp = Date.now();
  const recipientKey = sanitizeEmail(studentEmail);

  // Store tracking record
  await db.ref(`sendGridTracking/${emailId}`).set({
      emailId,
      recipientKey,
      recipientEmail: studentEmail,
      senderEmail: 'info@rtdacademy.com',
      senderName: 'RTD Academy',
      timestamp,
      subject,
      sent: true,
      events: {
          sent: {
              timestamp,
              success: true
          }
      },
      metadata: {
          courseId,
          courseName,
          emailType: isUpcoming ? 'upcoming_course' : 'course_starting'
      },
      recipients: {
          [recipientKey]: {
              email: studentEmail,
              status: 'sent',
              timestamp
          },
          ...Object.fromEntries(
              ccList.map(email => [
                  sanitizeEmail(email),
                  {
                      email,
                      status: 'sent',
                      timestamp
                  }
              ])
          )
      }
  });

  // Store in userEmails
  await db.ref(`userEmails/${recipientKey}/${emailId}`).set({
      subject,
      text,
      html,
      timestamp,
      sender: 'info@rtdacademy.com',
      senderName: 'RTD Academy',
      status: 'sent',
      ccRecipients: ccList,
      courseId,
      courseName
  });

  // Create notification
  await db.ref(`notifications/${recipientKey}/${emailId}`).set({
      type: 'new_email',
      emailId,
      sender: 'info@rtdacademy.com',
      senderName: 'RTD Academy',
      subject,
      preview: text.substring(0, 100) + '...',
      timestamp,
      read: false
  });
};

// Helper functions for course email notifications
const getStaffEmails = async (db, courseId) => {
  const [teachersSnapshot, supportStaffSnapshot] = await Promise.all([
    db.ref(`courses/${courseId}/Teachers`).once('value'),
    db.ref(`courses/${courseId}/SupportStaff`).once('value')
  ]);

  const teachers = teachersSnapshot.val() || [];
  const supportStaff = supportStaffSnapshot.val() || [];
  
  // Combine and format all staff emails
  return [...teachers, ...supportStaff].map(email => email.replace(',', '.'));
};

const getParentEmail = async (db, studentKey) => {
  const studentProfileRef = db.ref(`students/${studentKey}/profile`);
  const snapshot = await studentProfileRef.once('value');
  const profile = snapshot.val();

  if (profile?.age < 18 && profile?.ParentEmail) {
    return profile.ParentEmail;
  }
  return null;
};

/**
 * Cloud Function: checkCourseDatesV2
 * Checks for courses starting today or in 2 days and sends notifications
 */
const checkCourseDatesV2 = onSchedule({
  schedule: '0 9 * * *',  // Runs daily at 9 AM
  timeZone: 'America/Edmonton',
  memory: '1GiB',
  secrets: ["SENDGRID_KEY"]
}, async (context) => {
  try {
    // Initialize SendGrid with API key from Secret Manager
    sgMail.setApiKey(process.env.SENDGRID_KEY);
    
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedTwoDays = twoDaysFromNow.toISOString().split('T')[0];
    
    const db = admin.database();

    // Get all notifications for today and two days from now
    const [todaySnapshot, upcomingSnapshot] = await Promise.all([
      db.ref(`notificationDates/resumingDates/${formattedToday}`).once('value'),
      db.ref(`notificationDates/resumingDates/${formattedTwoDays}`).once('value')
    ]);

    const processDates = async (snapshot, type) => {
      if (!snapshot.exists()) return;
      
      const notifications = snapshot.val();
      
      for (const [studentKey, data] of Object.entries(notifications)) {
        try {
          const { courseId, studentEmail } = data;

          // Get course title
          const courseTitleSnapshot = await db.ref(`courses/${courseId}/Title`).once('value');
          const courseName = courseTitleSnapshot.val();

          // Get staff emails
          const staffEmails = await getStaffEmails(db, courseId);

          // Build CC list
          const ccList = [...staffEmails];

          // Add parent email if applicable
          const parentEmail = await getParentEmail(db, studentKey);
          if (parentEmail) {
            ccList.push(parentEmail);
          }

          // Send email - pass sgMail instance
          await sendCourseEmail(
            sgMail,
            studentKey,
            studentEmail,
            courseId,
            courseName,
            ccList,
            type
          );

        } catch (emailError) {
          console.error(`Error processing email for student ${studentKey}:`, emailError);
        }
      }
    };

    // Process both dates
    await Promise.all([
      processDates(todaySnapshot, 'starting'),
      processDates(upcomingSnapshot, 'upcoming')
    ]);

    return null;
  } catch (error) {
    console.error('Error in checkCourseDatesV2:', error);
    throw error;
  }
});

/**
 * Cloud Function: testCheckCourseDatesV2
 * Test function to check course notifications for a specific date
 */
const testCheckCourseDatesV2 = onRequest({
  timeoutSeconds: 120,
  memory: '512MiB',
  secrets: ["SENDGRID_KEY"]
}, async (req, res) => {
  try {
    // Initialize SendGrid with API key from Secret Manager
    sgMail.setApiKey(process.env.SENDGRID_KEY);
    
    const testDate = req.query.testDate ? new Date(req.query.testDate) : new Date();
    const twoDaysFromTest = new Date(testDate);
    twoDaysFromTest.setDate(testDate.getDate() + 2);
    
    const formattedTestDate = testDate.toISOString().split('T')[0];
    const formattedTwoDays = twoDaysFromTest.toISOString().split('T')[0];

    console.log(`Testing with dates: Today=${formattedTestDate}, TwoDays=${formattedTwoDays}`);

    const db = admin.database();

    const results = {
      testDate: formattedTestDate,
      twoDayNotice: formattedTwoDays,
      emailsSent: [],
      errors: []
    };

    // Get notifications for test dates
    const [todaySnapshot, upcomingSnapshot] = await Promise.all([
      db.ref(`notificationDates/resumingDates/${formattedTestDate}`).once('value'),
      db.ref(`notificationDates/resumingDates/${formattedTwoDays}`).once('value')
    ]);

    const processTestDates = async (snapshot, type) => {
      if (!snapshot.exists()) return;
      
      const notifications = snapshot.val();
      
      for (const [studentKey, data] of Object.entries(notifications)) {
        try {
          const { courseId, studentEmail } = data;

          // Get course title
          const courseTitleSnapshot = await db.ref(`courses/${courseId}/Title`).once('value');
          const courseName = courseTitleSnapshot.val();

          // Get staff emails
          const staffEmails = await getStaffEmails(db, courseId);

          // Build CC list
          const ccList = [...staffEmails];

          // Add parent email if applicable
          const parentEmail = await getParentEmail(db, studentKey);
          if (parentEmail) {
            ccList.push(parentEmail);
          }

          // Send email - pass sgMail instance
          await sendCourseEmail(
            sgMail,
            studentKey,
            studentEmail,
            courseId,
            courseName,
            ccList,
            type
          );

          results.emailsSent.push({
            type,
            studentEmail,
            courseId,
            courseName,
            ccList,
            resumingDate: type === 'upcoming' ? formattedTwoDays : formattedTestDate
          });

        } catch (emailError) {
          results.errors.push({
            studentKey,
            courseId: data.courseId,
            error: emailError.message
          });
        }
      }
    };

    // Process both test dates
    await Promise.all([
      processTestDates(todaySnapshot, 'starting'),
      processTestDates(upcomingSnapshot, 'upcoming')
    ]);

    return res.status(200).json(results);

  } catch (error) {
    console.error('Error in testCheckCourseDatesV2:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Export all functions
module.exports = {
  sendBulkEmailsV2,
  handleWebhookEventsV2,
  checkCourseDatesV2,
  testCheckCourseDatesV2
};