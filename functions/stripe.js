// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize Firestore
const firestore = admin.firestore();

// Helper function to create payment note content
function createPaymentNoteContent(paymentData, metadata) {
  const courseName = metadata.courseName || 'Unknown Course';
  
  if (paymentData.type === 'one_time') {
    const amount = (paymentData.amount_paid / 100).toFixed(2);
    return `One-time payment of $${amount} received for ${courseName}\nPayment Method: ${paymentData.payment_method}\nReceipt: ${paymentData.receipt_url}`;
  } else if (paymentData.type === 'subscription') {
    const status = paymentData.status.charAt(0).toUpperCase() + paymentData.status.slice(1);
    const periodEnd = new Date(paymentData.current_period_end).toLocaleDateString();
    let content = `Subscription ${status} for ${courseName}\nNext Payment Due: ${periodEnd}`;
    
    if (paymentData.latest_invoice) {
      const invoiceAmount = (paymentData.latest_invoice.amount_paid / 100).toFixed(2);
      content += `\nLatest Payment: $${invoiceAmount}`;
      if (paymentData.latest_invoice.hosted_invoice_url) {
        content += `\nInvoice: ${paymentData.latest_invoice.hosted_invoice_url}`;
      }
    }
    
    if (paymentData.cancel_at) {
      const cancelDate = new Date(paymentData.cancel_at).toLocaleDateString();
      content += `\nScheduled to Cancel: ${cancelDate}`;
    }
    
    return content;
  }
  
  return 'Payment status updated';
}

// Helper function to add payment note
async function addPaymentNote(userEmail, courseId, paymentData, metadata) {
  const sanitizedEmail = sanitizeEmail(userEmail);
  const notesRef = admin.database()
    .ref(`students/${sanitizedEmail}/courses/${courseId}/jsonStudentNotes`);
  
  const paymentId = paymentData.payment_id || paymentData.subscription_id;
  
  await notesRef.transaction((currentNotes) => {
    const notesArray = Array.isArray(currentNotes) ? currentNotes : [];
    
    // Check if note already exists for this payment
    const noteExists = notesArray.some(note => 
      note.metadata?.type === 'payment' && 
      note.metadata?.paymentId === paymentId
    );
    
    if (noteExists) {
      return currentNotes; // No changes if note exists
    }
    
    const newNote = {
      id: `payment-note-${paymentId}`,
      content: createPaymentNoteContent(paymentData, metadata),
      timestamp: Date.now(),
      author: 'Payment System',
      noteType: '💳',
      metadata: {
        type: 'payment',
        paymentType: paymentData.type,
        status: paymentData.status,
        paymentId: paymentId,
        eventType: metadata.eventType || 'payment_update'
      }
    };
    
    return [newNote, ...notesArray];
  });
}

// Updated updatePaymentStatus function
async function updatePaymentStatus(userEmail, courseId, paymentData, eventType) {
  const sanitizedEmail = sanitizeEmail(userEmail);
  
  // Use a transaction for the main payment record
  const paymentRef = admin.database()
    .ref(`payments/${sanitizedEmail}/courses/${courseId}`);
  
  await paymentRef.transaction(currentData => {
    // If there's no data or our data is newer, use our data
    if (!currentData) {
      return paymentData;
    }
    
    // Preserve existing fields while updating with new data
    const mergedData = {...currentData, ...paymentData};
    
    // Special handling for cancel_at: never remove it once set
    if (currentData.cancel_at && !paymentData.cancel_at) {
      mergedData.cancel_at = currentData.cancel_at;
    }
    if (currentData.canceled_at && !paymentData.canceled_at) {
      mergedData.canceled_at = currentData.canceled_at;
    }
    
    // Keep the invoice history intact
    if (currentData.invoices && paymentData.invoices) {
      // Ensure no duplicates when merging invoice arrays
      const existingIds = new Set(currentData.invoices.map(inv => inv.id));
      const newInvoices = paymentData.invoices.filter(inv => !existingIds.has(inv.id));
      mergedData.invoices = [...newInvoices, ...currentData.invoices];
    }
    
    return mergedData;
  });
  
  // Update the slim reference in student course
  const statusRef = admin.database()
    .ref(`students/${sanitizedEmail}/courses/${courseId}/payment_status`);
  
  await statusRef.set({
    status: paymentData.status,
    last_checked: admin.database.ServerValue.TIMESTAMP
  });
  
  // Add payment note (already uses transactions)
  await addPaymentNote(userEmail, courseId, paymentData, {
    courseName: paymentData.courseName,
    eventType: eventType
  });
  
  console.log('Payment status and notes updated for user:', sanitizedEmail, 'course:', courseId, 'event:', eventType);
}

// Helper function to get or create customer payment record
async function getOrCreateCustomerPaymentRecord(userEmail, stripeCustomerId) {
  const sanitizedEmail = sanitizeEmail(userEmail);
  const paymentRef = admin.database().ref(`payments/${sanitizedEmail}`);
  const snapshot = await paymentRef.once('value');
  
  if (!snapshot.exists()) {
    const stripeLink = `https://dashboard.stripe.com/customers/${stripeCustomerId}`;
    
    await paymentRef.set({
      stripe_customer_id: stripeCustomerId,
      stripeLink: stripeLink,
      created_at: admin.database.ServerValue.TIMESTAMP
    });
  } else if (!snapshot.val().stripeLink) {
    // Update existing record with stripeLink if it's missing
    const stripeLink = `https://dashboard.stripe.com/customers/${stripeCustomerId}`;
    await paymentRef.child('stripeLink').set(stripeLink);
  }
  
  return paymentRef;
}

// One-time payment handler
async function handleOneTimePayment(stripe, charge, eventType = 'charge.succeeded') {
  try {
    const metadata = charge.metadata;
    console.log('Processing one-time payment:', { charge_id: charge.id, metadata });
    
    if (!metadata.userEmail || !metadata.courseId) {
      throw new Error('Missing required metadata');
    }

    const userEmail = metadata.userEmail;
    
    // Ensure customer payment record exists
    await getOrCreateCustomerPaymentRecord(userEmail, charge.customer);

    const paymentData = {
      status: 'paid',
      type: 'one_time',
      last_updated: admin.database.ServerValue.TIMESTAMP,
      amount_paid: charge.amount,
      receipt_url: charge.receipt_url,
      payment_date: charge.created * 1000,
      customer_id: charge.customer,
      payment_id: charge.id,
      courseName: metadata.courseName,
      payment_method: charge.payment_method_details?.type || 'unknown'
    };

    await updatePaymentStatus(userEmail, metadata.courseId, paymentData, eventType);
    return { success: true };
  } catch (error) {
    console.error('Error handling one-time payment:', error);
    throw new Error(error.message);
  }
}

// Update the handleSubscriptionUpdate function to maintain invoice history
async function handleSubscriptionUpdate(stripe, data, eventType = 'subscription.updated') {
  try {
    const { subscription, invoice = null } = data;
    console.log('Processing subscription update:', { subscription_id: subscription.id, metadata: subscription.metadata });
    
    const metadata = subscription.metadata;
    
    if (!metadata.userEmail || !metadata.courseId) {
      throw new Error('Missing required metadata');
    }

    const userEmail = metadata.userEmail;
    const sanitizedEmail = sanitizeEmail(userEmail);
    
    // Ensure customer payment record exists
    await getOrCreateCustomerPaymentRecord(userEmail, subscription.customer);

    // First, get existing payment data to preserve invoice history
    const existingPaymentRef = admin.database()
      .ref(`payments/${sanitizedEmail}/courses/${metadata.courseId}`);
    const existingPayment = await existingPaymentRef.once('value');
    const existingData = existingPayment.val() || {};

    const paymentData = {
      status: subscription.status,
      type: 'subscription',
      last_updated: admin.database.ServerValue.TIMESTAMP,
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      current_period_end: subscription.current_period_end * 1000,
      current_period_start: subscription.current_period_start * 1000,
      cancel_at: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
      canceled_at: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
      courseName: metadata.courseName,
      // Preserve existing invoices array or initialize new one
      invoices: existingData.invoices || []
    };

    // Add new invoice to the beginning of the array if it exists and isn't already included
    if (invoice) {
      const newInvoiceData = {
        id: invoice.id,
        amount_paid: invoice.amount_paid,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        status: invoice.status,
        created: invoice.created * 1000, // Convert to milliseconds
        paid_at: admin.database.ServerValue.TIMESTAMP
      };

      // Check if this invoice already exists in the array
      const invoiceExists = paymentData.invoices.some(inv => inv.id === invoice.id);
      
      if (!invoiceExists) {
        paymentData.invoices.unshift(newInvoiceData); // Add to beginning of array
        
        // For ALL subscriptions, limit to 3 payments maximum
        if (paymentData.type === 'subscription' && invoice.status === 'paid' && invoice.amount_paid > 0) {
          console.log(`Processing payment for subscription ${subscription.id}. Checking payment count...`);
          
          try {
            // Count successful payments from Firestore (from Stripe extension)
            const customerRef = firestore.collection('customers').doc(subscription.customer);
            const paymentsQuery = customerRef.collection('payments')
              .where('status', '==', 'succeeded');
            
            const paymentsSnapshot = await paymentsQuery.get();
            const successfulPayments = paymentsSnapshot.docs.filter(doc => {
              const paymentData = doc.data();
              // Only count payments for this specific subscription
              return paymentData.subscription === subscription.id;
            });
            
            const paymentCount = successfulPayments.length;
            console.log(`Found ${paymentCount} successful payments for subscription ${subscription.id}`);
            
            if (paymentCount >= 3) {
              console.log(`3rd payment received for subscription ${subscription.id}. Scheduling cancellation at period end.`);
              
              // Cancel the subscription at the end of the current billing period
              const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
                cancel_at_period_end: true
              });
              
              console.log(`Subscription ${subscription.id} set to cancel at period end after 3rd payment`);
              
              // Update the payment data with cancellation info
              paymentData.cancel_at_period_end = true;
              paymentData.canceled_at_period_end_timestamp = Date.now();
              paymentData.total_payments_received = paymentCount;
            }
            
          } catch (countError) {
            console.error(`Error counting payments for subscription ${subscription.id}:`, countError);
          }
        }
      }

      // Also keep latest_invoice for backwards compatibility
      paymentData.latest_invoice = newInvoiceData;
    }

    await updatePaymentStatus(userEmail, metadata.courseId, paymentData, eventType);
    return { success: true };
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw new Error(error.message);
  }
}

// Handle subscription scheduling
async function handleSubscriptionSchedule(stripe, data) {
  try {
    const { subscriptionId, cancelAt } = data;
    console.log('Scheduling subscription cancellation:', { subscriptionId, cancelAt });
    
    if (!subscriptionId || !cancelAt) {
      throw new Error('Missing required parameters');
    }

    const cancelTimestamp = Math.floor(new Date(cancelAt).getTime() / 1000);
    
    // Update subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at: cancelTimestamp
    });

    console.log('Successfully scheduled subscription cancellation:', {
      subscriptionId: updatedSubscription.id,
      cancelAt: updatedSubscription.cancel_at,
      userEmail: updatedSubscription.metadata?.userEmail,
      courseId: updatedSubscription.metadata?.courseId
    });
    
    // Add this: directly update the database with cancellation info
    if (updatedSubscription.metadata?.userEmail && updatedSubscription.metadata?.courseId) {
      console.log('Updating database with cancellation information');
      
      const userEmail = updatedSubscription.metadata.userEmail;
      const courseId = updatedSubscription.metadata.courseId;
      const sanitizedEmail = sanitizeEmail(userEmail);
      
      // Use transaction to update just the cancellation fields
      const paymentRef = admin.database()
        .ref(`payments/${sanitizedEmail}/courses/${courseId}`);
      
      await paymentRef.transaction(currentData => {
        if (!currentData) {
          console.log('Payment record not found yet, will be created by subsequent webhook');
          return null; // Don't create the record if it doesn't exist yet
        }
        
        // Update only the cancellation fields
        return {
          ...currentData,
          cancel_at: updatedSubscription.cancel_at * 1000,
          canceled_at: updatedSubscription.canceled_at ? updatedSubscription.canceled_at * 1000 : null,
          last_updated: admin.database.ServerValue.TIMESTAMP
        };
      });
    }

    return { success: true, subscription: updatedSubscription };
  } catch (error) {
    console.error('Error scheduling subscription:', error);
    throw new Error(error.message);
  }
}

// Helper function to check payment status
async function getPaymentStatus(data) {
  try {
    const { userEmail, courseId } = data;
    
    if (!userEmail || !courseId) {
      throw new Error('Missing required parameters');
    }

    const sanitizedEmail = sanitizeEmail(userEmail);
    const paymentRef = admin.database()
      .ref(`payments/${sanitizedEmail}/courses/${courseId}`);

    const snapshot = await paymentRef.once('value');
    
    if (!snapshot.exists()) {
      return { exists: false };
    }

    return {
      exists: true,
      data: snapshot.val()
    };
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw new Error(error.message);
  }
}

// V2 Functions

/**
 * Stripe Webhook Handler - V2 version
 */
const handleStripeWebhookV2 = onRequest({
  cors: true,
  maxInstances: 10,
  timeoutSeconds: 120,
  secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
}, async (req, res) => {
  // Initialize Stripe with the secret key from Secret Manager
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    console.log('Received webhook request');
    
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      endpointSecret
    );

    console.log('Webhook event received:', event.type, 'Event ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session);
        
        if (session.subscription) {
          // First retrieve the subscription
          let subscription = await stripe.subscriptions.retrieve(session.subscription);
          console.log('Initial subscription data:', {
            id: subscription.id,
            cancel_at: subscription.cancel_at,
            metadata: subscription.metadata
          });
          
          // Note: We no longer schedule cancellation at checkout completion
          // Instead, we cancel after the 3rd payment is received in handleSubscriptionUpdate
          
          // Now process the webhook with the updated subscription
          await handleSubscriptionUpdate(stripe, { subscription }, event.type);
        } else if (session.payment_intent) {
          // Existing code for payment_intent...
        }
        break;

      case 'charge.succeeded':
        const charge = event.data.object;
        console.log('Charge succeeded:', charge.id);
        if (!charge.invoice) {
          await handleOneTimePayment(stripe, charge, event.type);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('Subscription event:', event.type, subscription.id);
        const invoice = subscription.latest_invoice ? 
          await stripe.invoices.retrieve(subscription.latest_invoice) : 
          null;
        await handleSubscriptionUpdate(stripe, { subscription, invoice }, event.type);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed':
        const invoiceEvent = event.data.object;
        console.log('Invoice event:', event.type, invoiceEvent.id);
        if (invoiceEvent.subscription) {
          const invoiceSubscription = await stripe.subscriptions.retrieve(invoiceEvent.subscription);
          await handleSubscriptionUpdate(stripe, { 
            subscription: invoiceSubscription, 
            invoice: invoiceEvent 
          }, event.type);
        }
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error.message, error.stack);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

/**
 * One-time payment handler - V2 version
 */
const handleOneTimePaymentV2 = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (data) => {
  // Initialize Stripe with the secret key from Secret Manager
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return handleOneTimePayment(stripe, data.data);
});

/**
 * Subscription update handler - V2 version
 */
const handleSubscriptionUpdateV2 = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (data) => {
  // Initialize Stripe with the secret key from Secret Manager
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return handleSubscriptionUpdate(stripe, data.data);
});

/**
 * Subscription scheduling handler - V2 version
 */
const handleSubscriptionScheduleV2 = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (data) => {
  // Initialize Stripe with the secret key from Secret Manager
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return handleSubscriptionSchedule(stripe, data.data);
});

/**
 * Payment status checker - V2 version
 */
const getPaymentStatusV2 = onCall({
  concurrency: 100,
  memory: '256MiB',
  timeoutSeconds: 30
}, async (data) => {
  return getPaymentStatus(data.data);
});

// Export all V2 functions
module.exports = {
  handleStripeWebhookV2,
  handleOneTimePaymentV2,
  handleSubscriptionUpdateV2,
  handleSubscriptionScheduleV2,
  getPaymentStatusV2
};