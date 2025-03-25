const functions = require('firebase-functions');
const stripeSecretKey = functions.config().stripe?.secret_key || 'sk_test_emulator_key';
const stripe = require('stripe')(stripeSecretKey);
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

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
  const updates = {};
  
  // Update main payment record
  updates[`payments/${sanitizedEmail}/courses/${courseId}`] = paymentData;
  
  // Update slim reference in student course
  updates[`students/${sanitizedEmail}/courses/${courseId}/payment_status`] = {
    status: paymentData.status,
    last_checked: admin.database.ServerValue.TIMESTAMP
  };

  await admin.database().ref().update(updates);
  
  // Add payment note
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
async function handleOneTimePayment(charge, eventType = 'charge.succeeded') {
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
    throw new functions.https.HttpsError('internal', error.message);
  }
}

// Update the handleSubscriptionUpdate function to maintain invoice history
async function handleSubscriptionUpdate(data, eventType = 'subscription.updated') {
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
      }

      // Also keep latest_invoice for backwards compatibility
      paymentData.latest_invoice = newInvoiceData;
    }

    await updatePaymentStatus(userEmail, metadata.courseId, paymentData, eventType);
    return { success: true };
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}

// Handle subscription scheduling
async function handleSubscriptionSchedule(data) {
  try {
    const { subscriptionId, cancelAt } = data;
    console.log('Scheduling subscription cancellation:', { subscriptionId, cancelAt });
    
    if (!subscriptionId || !cancelAt) {
      throw new Error('Missing required parameters');
    }

    const cancelTimestamp = Math.floor(new Date(cancelAt).getTime() / 1000);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at: cancelTimestamp
    });

    console.log('Successfully scheduled subscription cancellation:', {
      subscriptionId: updatedSubscription.id,
      cancelAt: updatedSubscription.cancel_at
    });

    return { success: true, subscription: updatedSubscription };
  } catch (error) {
    console.error('Error scheduling subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}

// Main webhook handler
async function handleStripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

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
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          if (subscription.metadata?.cancel_at) {
            await handleSubscriptionSchedule({
              subscriptionId: subscription.id,
              cancelAt: subscription.metadata.cancel_at
            });
          }
          await handleSubscriptionUpdate({ subscription }, event.type);
        } else if (session.payment_intent) {
          console.log('Processing one-time payment, fetching payment intent:', session.payment_intent);
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          const charge = paymentIntent.latest_charge ? 
            await stripe.charges.retrieve(paymentIntent.latest_charge) :
            null;
            
          if (charge) {
            console.log('Processing charge:', charge.id);
            await handleOneTimePayment(charge, event.type);
          }
        }
        break;

      case 'charge.succeeded':
        const charge = event.data.object;
        console.log('Charge succeeded:', charge.id);
        if (!charge.invoice) {
          await handleOneTimePayment(charge, event.type);
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
        await handleSubscriptionUpdate({ subscription, invoice }, event.type);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed':
        const invoiceEvent = event.data.object;
        console.log('Invoice event:', event.type, invoiceEvent.id);
        if (invoiceEvent.subscription) {
          const invoiceSubscription = await stripe.subscriptions.retrieve(invoiceEvent.subscription);
          await handleSubscriptionUpdate({ 
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
    throw new functions.https.HttpsError('internal', error.message);
  }
}

// Export all functions
module.exports = {
  handleStripeWebhook: functions.https.onRequest(handleStripeWebhook),
  handleOneTimePayment: functions.https.onCall(handleOneTimePayment),
  handleSubscriptionUpdate: functions.https.onCall(handleSubscriptionUpdate),
  handleSubscriptionSchedule: functions.https.onCall(handleSubscriptionSchedule),
  getPaymentStatus: functions.https.onCall(getPaymentStatus)
};