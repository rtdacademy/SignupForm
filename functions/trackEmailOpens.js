// SendGrid Webhook Handler for Email Event Tracking
// Processes email open, click, and other events from SendGrid

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Verifies SendGrid webhook signature
 * @param {string} publicKey - SendGrid webhook verification key
 * @param {object} payload - Request payload
 * @param {string} signature - SendGrid signature from headers
 * @param {string} timestamp - SendGrid timestamp from headers
 * @returns {boolean} - Whether signature is valid
 */
const verifyWebhookSignature = (publicKey, payload, signature, timestamp) => {
  if (!publicKey || !signature || !timestamp) {
    console.warn('Missing webhook verification parameters');
    return false;
  }

  try {
    const timestampPayload = timestamp + JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', publicKey)
      .update(timestampPayload)
      .digest('base64');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Cloud Function: trackEmailOpens
 * Webhook endpoint for SendGrid email event tracking
 */
const trackEmailOpens = onRequest({
  memory: '512MiB',
  timeoutSeconds: 60,
  concurrency: 500,
  cors: false, // Webhooks don't need CORS
  secrets: ["SENDGRID_WEBHOOK_KEY"]
}, async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Verify SendGrid webhook signature (optional but recommended)
  const signature = req.headers['x-twilio-email-event-webhook-signature'];
  const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];
  const webhookKey = process.env.SENDGRID_WEBHOOK_KEY;

  // If webhook key is configured, verify signature
  if (webhookKey) {
    const isValid = verifyWebhookSignature(webhookKey, req.body, signature, timestamp);
    if (!isValid) {
      console.error('Invalid webhook signature');
      res.status(401).send('Unauthorized');
      return;
    }
  }

  const db = admin.database();
  const events = Array.isArray(req.body) ? req.body : [req.body];
  
  console.log(`Processing ${events.length} email events`);

  const updatePromises = [];
  const processedEvents = {
    open: 0,
    click: 0,
    bounce: 0,
    dropped: 0,
    deferred: 0,
    delivered: 0,
    other: 0
  };

  for (const event of events) {
    try {
      const { 
        event: eventType, 
        email, 
        timestamp: eventTimestamp,
        emailId,
        familyId,
        sg_event_id,
        sg_message_id,
        url,
        ip,
        useragent
      } = event;

      // Skip if no emailId or familyId in custom args
      if (!emailId || !familyId) {
        console.warn('Event missing emailId or familyId:', event);
        continue;
      }

      // Prepare event data
      const eventData = {
        type: eventType,
        timestamp: eventTimestamp * 1000, // Convert to milliseconds
        email,
        ip: ip || null,
        userAgent: useragent || null,
        url: url || null,
        sgEventId: sg_event_id,
        sgMessageId: sg_message_id
      };

      // Handle different event types
      switch (eventType) {
        case 'open':
          // Update email as opened
          updatePromises.push(
            db.ref(`homeEducationFamilies/familyEmails/${familyId}/sent/${emailId}`).update({
              opened: true,
              openedAt: eventTimestamp * 1000,
              lastOpenedAt: eventTimestamp * 1000,
              openCount: admin.database.ServerValue.increment(1)
            })
          );

          // Update daily summary
          const today = new Date(eventTimestamp * 1000);
          const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          
          updatePromises.push(
            db.ref(`homeEducationFamilies/familyEmails/${familyId}/dailySummary/${dateKey}`).transaction((current) => {
              if (!current) {
                return {
                  emailsSent: 0,
                  emailsRead: 1,
                  lastSentAt: null,
                  lastReadAt: eventTimestamp * 1000
                };
              }
              return {
                ...current,
                emailsRead: (current.emailsRead || 0) + 1,
                lastReadAt: eventTimestamp * 1000
              };
            })
          );
          
          processedEvents.open++;
          break;

        case 'click':
          // Track click events
          updatePromises.push(
            db.ref(`homeEducationFamilies/familyEmails/${familyId}/sent/${emailId}/clicks`).push({
              ...eventData,
              clickedUrl: url
            })
          );
          
          // Ensure email is marked as opened (clicks imply opens)
          updatePromises.push(
            db.ref(`homeEducationFamilies/familyEmails/${familyId}/sent/${emailId}`).update({
              opened: true,
              hasClicks: true,
              lastClickAt: eventTimestamp * 1000
            })
          );
          
          processedEvents.click++;
          break;

        case 'bounce':
        case 'dropped':
        case 'deferred':
          // Track delivery issues
          updatePromises.push(
            db.ref(`homeEducationFamilies/familyEmails/${familyId}/sent/${emailId}`).update({
              deliveryStatus: eventType,
              deliveryStatusUpdatedAt: eventTimestamp * 1000
            })
          );
          
          processedEvents[eventType]++;
          break;

        case 'delivered':
          // Mark as delivered
          updatePromises.push(
            db.ref(`homeEducationFamilies/familyEmails/${familyId}/sent/${emailId}`).update({
              delivered: true,
              deliveredAt: eventTimestamp * 1000
            })
          );
          
          processedEvents.delivered++;
          break;

        default:
          processedEvents.other++;
          console.log(`Unhandled event type: ${eventType}`);
      }

      // Store raw event for debugging/audit
      updatePromises.push(
        db.ref(`homeEducationFamilies/emailTracking/${familyId}/emails/${emailId}/events/${eventType}`).push(eventData)
      );

    } catch (error) {
      console.error('Error processing event:', error, event);
    }
  }

  // Execute all updates
  try {
    await Promise.all(updatePromises);
    console.log('Successfully processed events:', processedEvents);
    res.status(200).json({ 
      success: true, 
      processed: processedEvents,
      total: events.length 
    });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update database' 
    });
  }
});

module.exports = { trackEmailOpens };