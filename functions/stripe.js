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
    
    if (paymentData.payment_count) {
      content += `\nPayment ${paymentData.payment_count} of 3 completed`;
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
  
  const paymentId = paymentData.payment_id || paymentData.subscription_id || paymentData.invoice_id;
  
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
    
    const noteMetadata = {
      type: 'payment',
      paymentType: paymentData.type,
      status: paymentData.status,
      paymentId: paymentId,
      eventType: metadata.eventType || 'payment_update'
    };
    
    // Only add paymentCount if it exists (won't exist for subscription.created events)
    if (paymentData.payment_count !== undefined) {
      noteMetadata.paymentCount = paymentData.payment_count;
    }
    
    const newNote = {
      id: `payment-note-${paymentId}`,
      content: createPaymentNoteContent(paymentData, metadata),
      timestamp: Date.now(),
      author: 'Payment System',
      noteType: '💳',
      metadata: noteMetadata
    };
    
    return [newNote, ...notesArray];
  });
}

// Updated updatePaymentStatus function
async function updatePaymentStatus(userEmail, courseId, paymentData, eventType) {
  const sanitizedEmail = sanitizeEmail(userEmail);
  
  // Check if manual payment override is active - if so, skip all updates
  const manualCheckRef = admin.database()
    .ref(`payments/${sanitizedEmail}/courses/${courseId}/manual`);
  const manualSnapshot = await manualCheckRef.once('value');
  
  if (manualSnapshot.exists() && manualSnapshot.val() === true) {
    console.log(`Skipping payment update for ${sanitizedEmail} course ${courseId} - manual payment override active`);
    return { 
      success: true, 
      skipped: true, 
      reason: 'manual_override_active' 
    };
  }
  
  // Use a transaction for the main payment record
  const paymentRef = admin.database()
    .ref(`payments/${sanitizedEmail}/courses/${courseId}`);
  
  await paymentRef.transaction(currentData => {
    // If there's no data or our data is newer, use our data
    if (!currentData) {
      // Initialize with subscription tracking array
      return {
        ...paymentData,
        all_subscription_ids: paymentData.subscription_id ? [paymentData.subscription_id] : []
      };
    }
    
    // Check if this is a sync from Stripe (has synced_from_stripe flag)
    const isSyncFromStripe = paymentData.synced_from_stripe === true;
    
    // Preserve existing fields while updating with new data
    const mergedData = {...currentData, ...paymentData};
    
    // Track ALL subscription IDs that have been created for this course
    if (paymentData.subscription_id) {
      const existingIds = currentData.all_subscription_ids || [];
      if (!existingIds.includes(paymentData.subscription_id)) {
        mergedData.all_subscription_ids = [...existingIds, paymentData.subscription_id];
      } else {
        mergedData.all_subscription_ids = existingIds;
      }
    }
    
    // Special handling for cancel_at: never remove it once set
    if (currentData.cancel_at && !paymentData.cancel_at) {
      mergedData.cancel_at = currentData.cancel_at;
    }
    if (currentData.canceled_at && !paymentData.canceled_at) {
      mergedData.canceled_at = currentData.canceled_at;
    }
    
    // Invoice handling: If syncing from Stripe, REPLACE invoice data completely
    if (isSyncFromStripe && paymentData.invoices) {
      // When syncing from Stripe, trust Stripe's invoice data completely
      mergedData.invoices = paymentData.invoices;
      console.log(`Replacing invoice data with ${paymentData.invoices.length} invoices from Stripe sync`);
    } else if (currentData.invoices && paymentData.invoices) {
      // For webhook events, merge invoices to avoid losing data
      const invoiceMap = new Map();
      
      // Add existing invoices to map
      currentData.invoices.forEach(inv => {
        invoiceMap.set(inv.id, inv);
      });
      
      // Update or add new invoices (newer data overwrites older)
      paymentData.invoices.forEach(inv => {
        invoiceMap.set(inv.id, inv);
      });
      
      // Convert back to array, sorted by creation/payment date
      mergedData.invoices = Array.from(invoiceMap.values()).sort((a, b) => {
        const aDate = a.paid_at || a.created || 0;
        const bDate = b.paid_at || b.created || 0;
        return bDate - aDate; // Most recent first
      });
    }
    
    // Preserve successful_invoice_ids array
    if (paymentData.successful_invoice_ids) {
      if (isSyncFromStripe) {
        // For sync, replace with fresh data from Stripe
        mergedData.successful_invoice_ids = paymentData.successful_invoice_ids;
      } else {
        // For webhooks, merge the arrays
        const existingInvoiceIds = new Set(currentData.successful_invoice_ids || []);
        paymentData.successful_invoice_ids.forEach(id => existingInvoiceIds.add(id));
        mergedData.successful_invoice_ids = Array.from(existingInvoiceIds);
      }
    }
    
    return mergedData;
  });
  
  // Update the payment status with COMPLETE data in BOTH locations
  // This ensures consistency between webhook and manual sync
  const statusData = {
    status: paymentData.status,
    last_checked: admin.database.ServerValue?.TIMESTAMP || Date.now(),
    last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
    payment_count: paymentData.payment_count || null,
    subscription_id: paymentData.subscription_id || null,
    payment_method: 'stripe_api_verified', // Indicates this uses new Stripe API verification
    successful_invoice_ids: paymentData.successful_invoice_ids || [],
    final_payment_count: paymentData.final_payment_count || null,
    canceled_at: paymentData.canceled_at || null,
    version: 2, // Version identifier
    // Include FULL invoice details with URLs
    invoices: paymentData.invoices || [],
    // Include stripe links for easy access
    stripe_links: paymentData.stripe_links || null,
    customer_id: paymentData.customer_id || null,
    // Include additional useful fields if present
    courseName: paymentData.courseName || null,
    type: paymentData.type || 'subscription',
    // For canceled subscriptions, include cancellation details
    cancellation_details: paymentData.cancellation_details || null,
    cancellation_reason: paymentData.cancellation_reason || null,
    // For one-time payments
    amount_paid: paymentData.amount_paid || null,
    payment_date: paymentData.payment_date || null,
    receipt_url: paymentData.receipt_url || null,
    // For active subscriptions
    current_period_start: paymentData.current_period_start || null,
    current_period_end: paymentData.current_period_end || null,
    cancel_at: paymentData.cancel_at || null,
    // Latest invoice info if available
    latest_invoice: paymentData.latest_invoice || null
  };

  // Remove null values to keep data clean
  Object.keys(statusData).forEach(key => {
    if (statusData[key] === null) {
      delete statusData[key];
    }
  });

  // Update in students path (primary location for PaymentInfo component)
  const statusRef = admin.database()
    .ref(`students/${sanitizedEmail}/courses/${courseId}/payment_status`);
  await statusRef.set(statusData);
  
  // Also update in studentCourseSummaries path
  const summaryKey = `${sanitizedEmail}_${courseId}`;
  const summaryRef = admin.database()
    .ref(`studentCourseSummaries/${summaryKey}/payment_status`);
  await summaryRef.set(paymentData.status);
  
  // Add payment note (already uses transactions)
  await addPaymentNote(userEmail, courseId, paymentData, {
    courseName: paymentData.courseName,
    eventType: eventType
  });
  
  console.log('Payment status and notes updated for user:', sanitizedEmail, 'course:', courseId, 'event:', eventType, 'summary:', summaryKey);
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
      created_at: admin.database.ServerValue?.TIMESTAMP || Date.now()
    });
  } else if (!snapshot.val().stripeLink) {
    // Update existing record with stripeLink if it's missing
    const stripeLink = `https://dashboard.stripe.com/customers/${stripeCustomerId}`;
    await paymentRef.child('stripeLink').set(stripeLink);
  }
  
  return paymentRef;
}

// NEW: Helper function to count successful payments for a subscription directly from Stripe
async function countSuccessfulPaymentsForSubscription(stripe, subscriptionId, courseId, customerId = null) {
  try {
    console.log(`Counting payments for subscription ${subscriptionId}, course ${courseId}, customer ${customerId}`);
    
    // First, try to get ALL invoices for this subscription (not just paid ones)
    let allSubscriptionInvoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 100 // Should be more than enough for any subscription
    });
    
    console.log(`Found ${allSubscriptionInvoices.data.length} total invoices for subscription ${subscriptionId}`);
    
    // Filter to only paid invoices
    let paidInvoices = allSubscriptionInvoices.data.filter(inv => inv.status === 'paid');
    console.log(`Found ${paidInvoices.length} paid invoices for subscription ${subscriptionId}`);
    
    // If no paid invoices found by subscription, try by customer (for edge cases)
    if (paidInvoices.length === 0 && customerId) {
      console.log(`No paid invoices found for subscription ${subscriptionId}, checking by customer ${customerId}`);
      const customerInvoices = await stripe.invoices.list({
        customer: customerId,
        status: 'paid',
        limit: 100
      });
      
      console.log(`Found ${customerInvoices.data.length} paid invoices for customer ${customerId}`);
      
      // Filter to only invoices for this subscription or course
      paidInvoices = customerInvoices.data.filter(inv => {
        // Check if this invoice is for our subscription
        const isForSubscription = inv.subscription === subscriptionId;
        
        // Also check if invoice has line items for this subscription
        const hasSubscriptionLineItem = inv.lines?.data?.some(line => 
          line.subscription === subscriptionId ||
          line.subscription_item === subscriptionId
        );
        
        // Check metadata for course ID (as fallback)
        const hasCorrectMetadata = inv.lines?.data?.some(line => 
          String(line.metadata?.courseId) === String(courseId)
        ) || String(inv.metadata?.courseId) === String(courseId);
        
        const matches = isForSubscription || hasSubscriptionLineItem || hasCorrectMetadata;
        
        if (matches) {
          console.log(`Invoice ${inv.id}: subscription_match=${isForSubscription}, line_item_match=${hasSubscriptionLineItem}, metadata_match=${hasCorrectMetadata}`);
        }
        
        return matches;
      });
      
      console.log(`Found ${paidInvoices.length} matching paid invoices after filtering`);
    }
    
    // Filter invoices to ensure they:
    // 1. Are actually paid
    // 2. Have payment amount > 0 (not a trial or $0 invoice)
    const validPayments = paidInvoices.filter(invoice => {
      const isValid = invoice.status === 'paid' && invoice.amount_paid > 0;
      
      // Log details for debugging
      console.log(`Invoice ${invoice.id}: status=${invoice.status}, amount_paid=${invoice.amount_paid}, valid=${isValid}`);
      
      return isValid;
    });
    
    console.log(`Found ${validPayments.length} valid payments for subscription ${subscriptionId}`);
    
    // Sort by payment date (most recent first)
    validPayments.sort((a, b) => {
      const aDate = a.status_transitions?.paid_at || a.created || 0;
      const bDate = b.status_transitions?.paid_at || b.created || 0;
      return bDate - aDate;
    });
    
    // Return both count and full invoice details including public URLs
    return {
      count: validPayments.length,
      invoices: validPayments.map(inv => ({
        id: inv.id,
        amount_paid: inv.amount_paid,
        paid_at: inv.status_transitions?.paid_at || inv.created,
        period_start: inv.period_start,
        period_end: inv.period_end,
        // Include public URLs from the invoice object
        hosted_invoice_url: inv.hosted_invoice_url || null,
        invoice_pdf: inv.invoice_pdf || null,
        status: inv.status
      }))
    };
  } catch (error) {
    console.error(`Error counting payments for subscription ${subscriptionId}:`, error);
    throw error;
  }
}

// NEW: Primary handler for invoice.paid events
async function handleInvoicePaid(stripe, invoice) {
  try {
    console.log('Processing invoice.paid event:', invoice.id);
    
    // If invoice doesn't have complete metadata, fetch it from Stripe
    if (!invoice.subscription_details?.metadata && invoice.subscription) {
      console.log('Invoice missing subscription_details, fetching subscription metadata');
      try {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        if (subscription.metadata) {
          invoice.subscription_details = { metadata: subscription.metadata };
        }
      } catch (error) {
        console.error('Error fetching subscription metadata:', error);
      }
    }
    
    // Extract metadata from the invoice
    const metadata = invoice.subscription_details?.metadata || {};
    const lineItemMetadata = invoice.lines?.data?.[0]?.metadata || {};
    
    // Merge metadata sources (subscription_details takes precedence)
    const fullMetadata = { ...lineItemMetadata, ...metadata };
    
    const { userEmail, courseId, paymentType, courseName, firebaseUID } = fullMetadata;
    
    if (!userEmail || !courseId) {
      console.log('Missing required metadata, skipping invoice processing');
      return { success: false, message: 'Missing metadata' };
    }
    
    // Only process subscription payments (not one-time)
    if (!invoice.subscription) {
      console.log('Not a subscription invoice, skipping');
      return { success: false, message: 'Not a subscription invoice' };
    }
    
    const subscriptionId = invoice.subscription;
    
    // Ensure customer payment record exists
    await getOrCreateCustomerPaymentRecord(userEmail, invoice.customer);
    
    // Count successful payments directly from Stripe
    const paymentInfo = await countSuccessfulPaymentsForSubscription(stripe, subscriptionId, courseId);
    
    console.log(`Payment ${paymentInfo.count} of 3 received for subscription ${subscriptionId}`);
    
    // Build payment data object with enhanced Stripe dashboard links
    const paymentData = {
      status: 'active',
      type: 'subscription',
      last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      subscription_id: subscriptionId,
      customer_id: invoice.customer,
      courseName: courseName,
      firebaseUID: firebaseUID,
      payment_count: paymentInfo.count,
      invoice_id: invoice.id,
      // Add Stripe dashboard links for easy admin access
      stripe_links: {
        customer: `https://dashboard.stripe.com/customers/${invoice.customer}`,
        subscription: `https://dashboard.stripe.com/subscriptions/${subscriptionId}`,
        latest_invoice: `https://dashboard.stripe.com/invoices/${invoice.id}`
      },
      latest_invoice: {
        id: invoice.id,
        amount_paid: invoice.amount_paid,
        // hosted_invoice_url serves as both viewing and payment URL for customers
        // Customers can use this link to update payment method and complete payment
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        paid_at: invoice.status_transitions?.paid_at || Date.now(),
        stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${invoice.id}`
      },
      // Store complete invoice history with public URLs
      invoices: paymentInfo.invoices.map(inv => ({
        id: inv.id,
        amount_paid: inv.amount_paid,
        paid_at: inv.paid_at,
        period_start: inv.period_start,
        period_end: inv.period_end,
        // Include public customer-facing URLs
        hosted_invoice_url: inv.hosted_invoice_url || null,
        invoice_pdf: inv.invoice_pdf || null,
        status: inv.status || 'paid',
        stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${inv.id}`
      })),
      // Store all successful payment invoice IDs for audit trail
      successful_invoice_ids: paymentInfo.invoices.map(inv => inv.id)
    };
    
    // Check if this is a 3-payment subscription and we've reached the limit
    if (paymentType === 'subscription_3_month' && paymentInfo.count >= 3) {
      console.log(`3rd payment received for subscription ${subscriptionId}. Canceling immediately without proration.`);
      
      try {
        // First check if subscription still exists and is active
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        if (subscription && subscription.status !== 'canceled') {
          // Cancel immediately with proration disabled to prevent any partial charges
          const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId, {
            prorate: false,      // Prevent proration charges for partial period
            invoice_now: false   // Don't create a final invoice
          });
          console.log(`Subscription ${subscriptionId} canceled without proration - marking as fully paid`);
        } else {
          console.log(`Subscription ${subscriptionId} already canceled - marking as fully paid`);
        }
        
        // Update payment data - mark as PAID since all payments are complete
        paymentData.status = 'paid'; // Mark as paid since all 3 payments are complete
        paymentData.canceled_at = Date.now();
        paymentData.cancellation_reason = 'completed_3_payments'; // Clearer reason - payments completed successfully
        paymentData.final_payment_count = paymentInfo.count;
        paymentData.no_proration = true; // Flag that we prevented proration
        
      } catch (cancelError) {
        // Check if error is because subscription doesn't exist (already canceled)
        if (cancelError.code === 'resource_missing' || cancelError.statusCode === 404) {
          console.log(`Subscription ${subscriptionId} already canceled or doesn't exist - marking as fully paid`);
          
          // Still update payment data as paid
          paymentData.status = 'paid';
          paymentData.canceled_at = Date.now();
          paymentData.cancellation_reason = 'completed_3_payments';
          paymentData.final_payment_count = paymentInfo.count;
          paymentData.no_proration = true;
        } else {
          // Log other errors but continue processing
          console.error(`Error handling subscription ${subscriptionId}:`, cancelError.message);
          // Still mark as paid if we have 3 payments
          paymentData.status = 'paid';
          paymentData.final_payment_count = paymentInfo.count;
        }
      }
    }
    
    // Store payment data
    await updatePaymentStatus(userEmail, courseId, paymentData, 'invoice.paid');
    
    // Trigger credit recalculation for the student
    // This is important for adult and international students who pay per course
    const sanitizedEmail = sanitizeEmail(userEmail);
    const db = admin.database();
    await db.ref(`creditRecalculations/${sanitizedEmail}/trigger`).set(Date.now());
    console.log(`Triggered credit recalculation for ${sanitizedEmail} after invoice payment`);
    
    return { 
      success: true, 
      paymentCount: paymentInfo.count,
      subscriptionCanceled: paymentInfo.count >= 3 && paymentType === 'subscription_3_month'
    };
    
  } catch (error) {
    console.error('Error handling invoice.paid:', error);
    throw error;
  }
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
      last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      amount_paid: charge.amount,
      receipt_url: charge.receipt_url,
      payment_date: charge.created * 1000,
      customer_id: charge.customer,
      payment_id: charge.id,
      courseName: metadata.courseName,
      payment_method: charge.payment_method_details?.type || 'unknown'
    };

    await updatePaymentStatus(userEmail, metadata.courseId, paymentData, eventType);
    
    // Trigger credit recalculation for the student
    // This is important for adult and international students who pay per course
    const sanitizedEmail = sanitizeEmail(userEmail);
    const db = admin.database();
    await db.ref(`creditRecalculations/${sanitizedEmail}/trigger`).set(Date.now());
    console.log(`Triggered credit recalculation for ${sanitizedEmail} after one-time payment`);
    
    return { success: true };
  } catch (error) {
    console.error('Error handling one-time payment:', error);
    throw new Error(error.message);
  }
}

// Handle subscription updates (secondary handler, mainly for status changes)
async function handleSubscriptionUpdate(stripe, data, eventType = 'subscription.updated') {
  try {
    const { subscription } = data;
    console.log('Processing subscription update:', { subscription_id: subscription.id, metadata: subscription.metadata });
    
    const metadata = subscription.metadata;
    
    if (!metadata.userEmail || !metadata.courseId) {
      console.log('Missing required metadata for subscription update');
      return { success: false, message: 'Missing metadata' };
    }

    const userEmail = metadata.userEmail;
    const courseId = metadata.courseId;
    
    // Ensure customer payment record exists
    await getOrCreateCustomerPaymentRecord(userEmail, subscription.customer);

    // Count successful payments for this subscription
    let paymentInfo = { count: 0, invoices: [] };
    try {
      paymentInfo = await countSuccessfulPaymentsForSubscription(
        stripe, 
        subscription.id, 
        courseId,
        subscription.customer
      );
      console.log(`Subscription ${subscription.id} has ${paymentInfo.count} successful payments`);
    } catch (error) {
      console.error('Error counting payments in subscription update:', error);
    }

    // Build comprehensive subscription status update with payment info
    const paymentData = {
      status: subscription.status,
      type: 'subscription',
      last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      current_period_end: subscription.current_period_end * 1000,
      current_period_start: subscription.current_period_start * 1000,
      cancel_at: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
      canceled_at: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
      courseName: metadata.courseName,
      payment_count: paymentInfo.count,
      // Include invoice history
      invoices: paymentInfo.invoices.map(inv => ({
        id: inv.id,
        amount_paid: inv.amount_paid,
        paid_at: inv.paid_at,
        period_start: inv.period_start,
        period_end: inv.period_end,
        hosted_invoice_url: inv.hosted_invoice_url || null,
        invoice_pdf: inv.invoice_pdf || null,
        status: inv.status || 'paid',
        stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${inv.id}`
      })),
      successful_invoice_ids: paymentInfo.invoices.map(inv => inv.id),
      // Add Stripe dashboard links
      stripe_links: {
        customer: `https://dashboard.stripe.com/customers/${subscription.customer}`,
        subscription: `https://dashboard.stripe.com/subscriptions/${subscription.id}`
      }
    };

    // Check if this is a completed 3-payment subscription
    if (metadata.paymentType === 'subscription_3_month' && paymentInfo.count >= 3) {
      paymentData.status = 'paid';
      paymentData.final_payment_count = paymentInfo.count;
      paymentData.cancellation_reason = 'completed_3_payments';
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
          last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now()
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
      case 'invoice.paid':
        // PRIMARY HANDLER for successful subscription payments
        const paidInvoice = event.data.object;
        await handleInvoicePaid(stripe, paidInvoice);
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payments
        const failedInvoice = event.data.object;
        console.log('Invoice payment failed:', failedInvoice.id);
        
        if (failedInvoice.subscription) {
          const metadata = failedInvoice.subscription_details?.metadata || {};
          if (metadata.userEmail && metadata.courseId) {
            const paymentData = {
              status: 'payment_failed',
              type: 'subscription',
              last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
              subscription_id: failedInvoice.subscription,
              failed_invoice_id: failedInvoice.id,
              failure_reason: failedInvoice.last_finalization_error?.message || 'Payment failed',
              // Include payment retry URL for customer to update card and retry payment
              payment_retry_url: failedInvoice.hosted_invoice_url || null,
              failed_invoice: {
                id: failedInvoice.id,
                amount_due: failedInvoice.amount_due,
                hosted_invoice_url: failedInvoice.hosted_invoice_url,
                invoice_pdf: failedInvoice.invoice_pdf,
                status: failedInvoice.status,
                stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${failedInvoice.id}`
              }
            };
            
            await updatePaymentStatus(
              metadata.userEmail,
              metadata.courseId,
              paymentData,
              'invoice.payment_failed'
            );
          }
        }
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session);
        
        // Check if this is a credit payment
        let metadata = session.metadata || {};
        
        // If metadata is empty but we have a payment_intent, try to get metadata from the payment intent
        if ((!metadata || Object.keys(metadata).length === 0) && session.payment_intent) {
          console.log('Session metadata is empty, fetching payment intent for metadata...');
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            if (paymentIntent.metadata) {
              metadata = paymentIntent.metadata;
              console.log('Found metadata in payment intent:', metadata);
            }
            
            // If still no metadata, try the charges
            if ((!metadata || Object.keys(metadata).length === 0) && paymentIntent.charges && paymentIntent.charges.data.length > 0) {
              metadata = paymentIntent.charges.data[0].metadata || {};
              console.log('Found metadata in charge:', metadata);
            }
          } catch (error) {
            console.error('Error fetching payment intent:', error);
          }
        }
        
        if (metadata.paymentType === 'credits') {
          console.log('Processing credit payment:', metadata);
          
          const creditsPurchased = parseInt(metadata.creditsAmount) || 0;
          const studentEmailKey = sanitizeEmail(metadata.userEmail);
          const schoolYear = metadata.schoolYear;
          const studentType = metadata.studentType;
          
          try {
            // Format school year for database key (e.g., "25/26" → "25_26")
            const schoolYearKey = schoolYear ? schoolYear.replace('/', '_') : null;
            
            // Map display names to pricing node keys (same as in creditTracking.js)
            const typeMapping = {
              'Non-Primary': 'nonPrimaryStudents',
              'Home Education': 'homeEducationStudents',
              'Summer School': 'summerSchoolStudents',
              'Adult Student': 'adultStudents',
              'International Student': 'internationalStudents'
            };
            
            // Determine the sanitized type - check if it's already sanitized or needs mapping
            let sanitizedType = studentType;
            if (typeMapping[studentType]) {
              sanitizedType = typeMapping[studentType];
            } else if (!studentType.endsWith('Students')) {
              sanitizedType = studentType.replace(/\s+/g, '_').toLowerCase() + 'Students';
            }
            
            // Retrieve charge ID from payment intent if available
            let chargeId = null;
            if (session.payment_intent) {
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
                  chargeId = paymentIntent.charges.data[0].id;
                  console.log(`Retrieved charge ID ${chargeId} for credit payment`);
                }
              } catch (error) {
                console.error('Error retrieving charge from payment intent:', error);
              }
            }
            
            const db = admin.database();
            const updates = {};
            
            // Update paid credits total in profile
            const paidCreditsPath = `students/${studentEmailKey}/profile/creditsPaid/${schoolYearKey}/${sanitizedType}`;
            const currentPaidRef = db.ref(paidCreditsPath);
            const currentPaidSnapshot = await currentPaidRef.once('value');
            const currentPaidCredits = currentPaidSnapshot.val() || 0;
            
            updates[paidCreditsPath] = currentPaidCredits + creditsPurchased;
            
            // Record the payment transaction in profile with complete Stripe identifiers
            const paymentId = db.ref().push().key;
            updates[`students/${studentEmailKey}/profile/creditPayments/${paymentId}`] = {
              stripeSessionId: session.id,
              amount: session.amount_total,
              currency: session.currency,
              receiptUrl: session.receipt || session.url,
              coursesToUnlock: metadata.coursesToUnlock ? metadata.coursesToUnlock.split(',') : [],
              payment_intent: session.payment_intent,
              customer_id: session.customer,  // Added: Essential for Stripe API operations
              charge_id: chargeId,             // Added: For refunds and payment lookups
              payment_method: session.payment_method_types?.[0] || 'card',
              creditsPurchased,
              schoolYear,
              studentType,
              timestamp: admin.database.ServerValue.TIMESTAMP
            };
            
            // Apply updates
            await db.ref().update(updates);
            
            // Trigger credit recalculation through the database trigger
            await db.ref(`creditRecalculations/${studentEmailKey}/trigger`).set(Date.now());
            
            console.log(`✅ Processed credit payment for ${studentEmailKey}: ${creditsPurchased} credits for ${schoolYear} ${studentType}`);
            
            // Create payment note for the student AND save to payments path
            if (metadata.userEmail && metadata.coursesToUnlock) {
              const paymentData = {
                type: 'credit_payment',
                payment_id: session.payment_intent || session.id,
                amount_paid: session.amount_total,
                currency: session.currency,
                receipt_url: session.receipt || session.url,
                credits_purchased: creditsPurchased,
                school_year: schoolYear,
                student_type: studentType,
                status: 'paid'
              };
              
              // Add payment notes to each course that was unlocked
              const coursesUnlocked = metadata.coursesToUnlock.split(',');
              for (const courseId of coursesUnlocked) {
                if (courseId) {
                  const trimmedCourseId = courseId.trim();
                  
                  // Fetch the actual course title from the database
                  let courseTitle = `Course ${trimmedCourseId}`; // Default fallback
                  try {
                    const courseTitleSnapshot = await db.ref(`courses/${trimmedCourseId}/Title`).once('value');
                    if (courseTitleSnapshot.exists()) {
                      courseTitle = courseTitleSnapshot.val();
                      console.log(`Fetched course title for ${trimmedCourseId}: ${courseTitle}`);
                    } else {
                      console.log(`Course title not found for ${trimmedCourseId}, using default`);
                    }
                  } catch (error) {
                    console.error(`Error fetching course title for ${trimmedCourseId}:`, error);
                  }
                  
                  // Save payment data to /payments/{email}/courses/{courseId}
                  // This centralizes all payment information in one location
                  const coursePaymentData = {
                    status: 'paid',
                    type: 'credits',  // Distinguish from 'one_time' payments
                    last_updated: admin.database.ServerValue.TIMESTAMP,
                    amount_paid: session.amount_total,
                    receipt_url: session.receipt || session.url,
                    payment_date: Date.now(),
                    customer_id: session.customer,  // Using the customer_id we added earlier
                    payment_id: chargeId || session.payment_intent,  // Using charge_id if available, otherwise payment_intent
                    payment_intent: session.payment_intent,
                    courseName: courseTitle,  // Now using the fetched course title
                    payment_method: session.payment_method_types?.[0] || 'card',
                    // Credit-specific fields
                    credits_purchased: creditsPurchased,
                    school_year: schoolYear,
                    student_type: studentType,
                    stripe_session_id: session.id
                  };
                  
                  const paymentPath = `payments/${studentEmailKey}/courses/${trimmedCourseId}`;
                  await db.ref(paymentPath).set(coursePaymentData);
                  console.log(`Saved credit payment data to ${paymentPath}`);
                  
                  // Also add payment note (existing functionality)
                  await addPaymentNote(metadata.userEmail, trimmedCourseId, paymentData, {
                    ...metadata,
                    courseName: `${creditsPurchased} Credits Purchased`
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error processing credit payment:', error);
            // Don't throw - let the webhook complete successfully
          }
        } else if (session.subscription) {
          // Retrieve the subscription to process it
          let subscription = await stripe.subscriptions.retrieve(session.subscription);
          console.log('Initial subscription data:', {
            id: subscription.id,
            cancel_at: subscription.cancel_at,
            metadata: subscription.metadata
          });
          
          // Process the subscription update
          await handleSubscriptionUpdate(stripe, { subscription }, event.type);
          
          // Trigger credit recalculation for subscription payments
          // Important for adult and international students
          if (subscription.metadata?.userEmail) {
            const sanitizedEmail = sanitizeEmail(subscription.metadata.userEmail);
            const db = admin.database();
            await db.ref(`creditRecalculations/${sanitizedEmail}/trigger`).set(Date.now());
            console.log(`Triggered credit recalculation for ${sanitizedEmail} after subscription checkout`);
          }
        } else if (session.payment_intent) {
          // Handle one-time payment if needed
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          if (paymentIntent.charges && paymentIntent.charges.data.length > 0) {
            const charge = paymentIntent.charges.data[0];
            await handleOneTimePayment(stripe, charge, 'checkout.session.completed');
            
            // Trigger credit recalculation for one-time payments
            // Important for adult and international students
            if (charge.metadata?.userEmail) {
              const sanitizedEmail = sanitizeEmail(charge.metadata.userEmail);
              const db = admin.database();
              await db.ref(`creditRecalculations/${sanitizedEmail}/trigger`).set(Date.now());
              console.log(`Triggered credit recalculation for ${sanitizedEmail} after one-time checkout`);
            }
          }
        }
        break;

      case 'charge.succeeded':
        const charge = event.data.object;
        console.log('Charge succeeded:', charge.id);
        
        // Check if this is a credit payment - skip if it is (handled by checkout.session.completed)
        if (charge.metadata && charge.metadata.paymentType === 'credits') {
          console.log('Skipping charge.succeeded for credit payment - will be handled by checkout.session.completed');
          break;
        }
        
        // Only process if it's not part of a subscription invoice
        if (!charge.invoice) {
          await handleOneTimePayment(stripe, charge, event.type);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // SECONDARY HANDLER for subscription status changes
        const subscription = event.data.object;
        console.log('Subscription event:', event.type, subscription.id, 'Status:', subscription.status);
        
        // Skip if no metadata (means it wasn't created with our metadata)
        if (!subscription.metadata?.userEmail || !subscription.metadata?.courseId) {
          console.log('Skipping subscription event - no metadata');
          break;
        }
        
        // For subscription.created, ALWAYS process it
        if (event.type === 'customer.subscription.created') {
          console.log('Processing subscription creation for:', subscription.id);
          await handleSubscriptionUpdate(stripe, { subscription }, event.type);
          break;
        }
        
        // For subscription.updated, process all events to ensure we capture payment counts
        // and subscription changes properly
        console.log(`Processing subscription update for ${subscription.id} with status: ${subscription.status}`);
        await handleSubscriptionUpdate(stripe, { subscription }, event.type);
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription deletion/cancellation with enhanced data capture
        const deletedSub = event.data.object;
        console.log('Subscription deleted:', deletedSub.id);
        
        const delMetadata = deletedSub.metadata || {};
        if (delMetadata.userEmail && delMetadata.courseId) {
          // Query final payment count and invoice details from Stripe
          let finalPaymentCount = 0;
          let finalInvoices = [];
          try {
            const finalPaymentInfo = await countSuccessfulPaymentsForSubscription(
              stripe, 
              deletedSub.id, 
              delMetadata.courseId
            );
            finalPaymentCount = finalPaymentInfo.count;
            // Store complete invoice history with public URLs
            finalInvoices = finalPaymentInfo.invoices.map(inv => ({
              id: inv.id,
              amount_paid: inv.amount_paid,
              paid_at: inv.paid_at,
              period_start: inv.period_start,
              period_end: inv.period_end,
              hosted_invoice_url: inv.hosted_invoice_url || null,
              invoice_pdf: inv.invoice_pdf || null,
              status: inv.status || 'paid',
              stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${inv.id}`
            }));
          } catch (error) {
            console.error('Error getting final payment info:', error);
          }
          
          // Determine if this is a completed 3-payment plan
          const isCompleted3Payment = delMetadata.paymentType === 'subscription_3_month' && finalPaymentCount >= 3;
          
          const paymentData = {
            // Mark as 'paid' if 3 payments completed, otherwise 'canceled'
            status: isCompleted3Payment ? 'paid' : 'canceled',
            type: 'subscription',
            last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
            subscription_id: deletedSub.id,
            customer_id: deletedSub.customer,
            canceled_at: Date.now(),
            ended_at: deletedSub.ended_at ? deletedSub.ended_at * 1000 : Date.now(),
            // Capture comprehensive cancellation details
            cancellation_details: {
              reason: isCompleted3Payment ? 'completed_3_payments' : (deletedSub.cancellation_details?.reason || 'unknown'),
              comment: deletedSub.cancellation_details?.comment || null,
              feedback: deletedSub.cancellation_details?.feedback || null,
              canceled_at: deletedSub.canceled_at ? deletedSub.canceled_at * 1000 : null
            },
            final_payment_count: finalPaymentCount,
            // Include complete invoice history with public URLs
            invoices: finalInvoices,
            successful_invoice_ids: finalInvoices.map(inv => inv.id),
            // Add Stripe dashboard links for deleted subscription
            stripe_links: {
              customer: `https://dashboard.stripe.com/customers/${deletedSub.customer}`,
              subscription: `https://dashboard.stripe.com/subscriptions/${deletedSub.id}`
            }
          };
          
          await updatePaymentStatus(
            delMetadata.userEmail,
            delMetadata.courseId,
            paymentData,
            event.type
          );
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

/**
 * Sync payment status from Stripe - for legacy data migration
 * Fetches current payment data directly from Stripe API
 */
const syncStripePaymentStatusV2 = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (request) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const { userEmail, courseId } = request.data;
    
    if (!userEmail || !courseId) {
      throw new Error('Missing required parameters: userEmail and courseId');
    }
    
    console.log(`Syncing Stripe payment status for ${userEmail}, course ${courseId}`);
    
    const sanitizedEmail = sanitizeEmail(userEmail);
    
    // First, try to get the customer ID from our database
    const paymentRef = admin.database().ref(`payments/${sanitizedEmail}`);
    const paymentSnapshot = await paymentRef.once('value');
    
    let customerId = null;
    
    // Check if we have a stored customer ID
    let storedCustomerId = null;
    if (paymentSnapshot.exists() && paymentSnapshot.val().stripe_customer_id) {
      storedCustomerId = paymentSnapshot.val().stripe_customer_id;
      console.log(`Found stored customer ID in database: ${storedCustomerId}`);
    }
    
    // Always search for all customers with this email to handle multiple customer scenarios
    console.log(`Searching Stripe for all customers with email: ${userEmail}`);
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 100  // Increased limit to find all customers
    });
    
    if (customers.data.length === 0) {
      // No Stripe customer found, try to find payment in database directly
      console.log(`No Stripe customer found for ${userEmail}, searching database directly`);
      
      // First try with the student's email
      const paymentRef = admin.database()
        .ref(`payments/${sanitizedEmail}/courses/${courseId}`);
      const paymentSnapshot = await paymentRef.once('value');
      
      if (paymentSnapshot.exists()) {
        console.log(`Found payment data in database for ${sanitizedEmail}, course ${courseId}`);
        const dbPaymentData = paymentSnapshot.val();
        
        // Return the database payment data with indicator that it's from database
        return {
          success: true,
          message: 'Payment data found in database (no Stripe record)',
          paymentType: dbPaymentData.type || 'unknown',
          hasStripeData: false,
          data_source: 'firebase_database',
          paymentData: {
            ...dbPaymentData,
            synced_from_stripe: false,
            data_source: 'firebase_database',
            sync_timestamp: Date.now()
          }
        };
      }
      
      // If not found with student email, try parent email
      console.log(`No payment found for student email, checking parent email`);
      const studentProfileRef = admin.database()
        .ref(`students/${sanitizedEmail}/profile/ParentEmail`);
      const parentEmailSnapshot = await studentProfileRef.once('value');
      
      if (parentEmailSnapshot.exists()) {
        const parentEmail = parentEmailSnapshot.val();
        const sanitizedParentEmail = sanitizeEmail(parentEmail);
        
        console.log(`Checking payments under parent email: ${parentEmail}`);
        
        const parentPaymentRef = admin.database()
          .ref(`payments/${sanitizedParentEmail}/courses/${courseId}`);
        const parentPaymentSnapshot = await parentPaymentRef.once('value');
        
        if (parentPaymentSnapshot.exists()) {
          console.log(`Found payment data under parent email ${sanitizedParentEmail}, course ${courseId}`);
          const dbPaymentData = parentPaymentSnapshot.val();
          
          // Return the database payment data with indicator that it's from parent's payment
          return {
            success: true,
            message: 'Payment data found in database under parent email (no Stripe record)',
            paymentType: dbPaymentData.type || 'unknown',
            hasStripeData: false,
            data_source: 'firebase_database',
            parent_payment: true,
            paymentData: {
              ...dbPaymentData,
              synced_from_stripe: false,
              data_source: 'firebase_database',
              parent_payment: true,
              sync_timestamp: Date.now()
            }
          };
        }
      }
      
      // No payment found anywhere
      return {
        success: false,
        message: 'No Stripe customer found for this email and no payment record in database',
        hasStripeData: false
      };
    }
    
    console.log(`Found ${customers.data.length} customers with email ${userEmail}`);
    
    // Always check all customers for this course, don't trust the stored customer ID
    // as it might be for a different course
    console.log(`Will check all ${customers.data.length} customers for course ${courseId}`);
    
    // Handle multiple customers case - always check all customers
    let allCourseSubscriptions = [];
    let allCourseCharges = [];
    let finalCustomerId = null;
    
    // Always check all customers, even if we have a stored ID
    // The stored ID might be for a different course
    console.log(`Checking ${customers.data.length} customers for course ${courseId} payments`);
    
    for (const customer of customers.data) {
        console.log(`Checking customer ${customer.id}...`);
        
        // Check subscriptions (including canceled ones)
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 100,
          status: 'all',  // Include canceled subscriptions
          expand: ['data.latest_invoice']
        });
        
        const courseSubs = subs.data.filter(sub => {
          const metadata = sub.metadata || {};
          // Compare as strings to handle both string and number courseIds
          return String(metadata.courseId) === String(courseId);
        });
        
        if (courseSubs.length > 0) {
          console.log(`Found ${courseSubs.length} subscriptions for course ${courseId} in customer ${customer.id}`);
          allCourseSubscriptions.push(...courseSubs);
          if (!finalCustomerId) finalCustomerId = customer.id;
        }
        
        // Check one-time charges
        const charges = await stripe.charges.list({
          customer: customer.id,
          limit: 100
        });
        
        const courseCharges = charges.data.filter(charge => {
          const metadata = charge.metadata || {};
          // Compare as strings to handle both string and number courseIds
          return String(metadata.courseId) === String(courseId) && !charge.invoice;
        });
        
        if (courseCharges.length > 0) {
          console.log(`Found ${courseCharges.length} one-time payments for course ${courseId} in customer ${customer.id}`);
          allCourseCharges.push(...courseCharges);
          if (!finalCustomerId) finalCustomerId = customer.id;
        }
    }
    
    // Use the customer ID that has payments for this course
    if (finalCustomerId) {
      customerId = finalCustomerId;
      console.log(`Using customer ${customerId} which has payments for course ${courseId}`);
      await getOrCreateCustomerPaymentRecord(userEmail, customerId);
    } else {
      console.log(`No payments found for course ${courseId} across all customers`);
    }
    
    const courseSubscriptions = allCourseSubscriptions;
    
    if (courseSubscriptions.length === 0) {
      // Check for one-time payments (use already collected charges if available)
      let courseCharges = allCourseCharges;
      
      if (!courseCharges || courseCharges.length === 0 && customerId) {
        const charges = await stripe.charges.list({
          customer: customerId,
          limit: 100
        });
        
        courseCharges = charges.data.filter(charge => {
          const metadata = charge.metadata || {};
          // Compare as strings to handle both string and number courseIds
          return String(metadata.courseId) === String(courseId) && !charge.invoice; // Exclude subscription charges
        });
      }
      
      if (courseCharges && courseCharges.length > 0) {
        // Process one-time payment
        const latestCharge = courseCharges[0];
        const paymentData = {
          status: 'paid',
          type: 'one_time',
          last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
          amount_paid: latestCharge.amount,
          receipt_url: latestCharge.receipt_url,
          payment_date: latestCharge.created * 1000,
          customer_id: customerId,
          payment_id: latestCharge.id,
          courseName: latestCharge.metadata?.courseName || '',
          payment_method: latestCharge.payment_method_details?.type || 'unknown',
          synced_from_stripe: true,
          sync_timestamp: Date.now()
        };
        
        await updatePaymentStatus(userEmail, courseId, paymentData, 'manual_sync');
        
        return {
          success: true,
          message: 'One-time payment data synced successfully',
          paymentType: 'one_time',
          paymentData
        };
      }
      
      // No Stripe payments found, try database fallback
      console.log(`No Stripe payments found for course ${courseId}, searching database directly`);
      
      // First try with the student's email
      const dbPaymentRef = admin.database()
        .ref(`payments/${sanitizedEmail}/courses/${courseId}`);
      const dbPaymentSnapshot = await dbPaymentRef.once('value');
      
      if (dbPaymentSnapshot.exists()) {
        console.log(`Found payment data in database for ${sanitizedEmail}, course ${courseId}`);
        const dbPaymentData = dbPaymentSnapshot.val();
        
        // Return the database payment data
        return {
          success: true,
          message: 'Payment data found in database (no Stripe payment record)',
          paymentType: dbPaymentData.type || 'unknown',
          hasStripeData: false,
          data_source: 'firebase_database',
          paymentData: {
            ...dbPaymentData,
            synced_from_stripe: false,
            data_source: 'firebase_database',
            sync_timestamp: Date.now()
          }
        };
      }
      
      // If not found with student email, try parent email
      console.log(`No payment found for student email in database, checking parent email`);
      const studentProfileRef = admin.database()
        .ref(`students/${sanitizedEmail}/profile/ParentEmail`);
      const parentEmailSnapshot = await studentProfileRef.once('value');
      
      if (parentEmailSnapshot.exists()) {
        const parentEmail = parentEmailSnapshot.val();
        const sanitizedParentEmail = sanitizeEmail(parentEmail);
        
        console.log(`Checking database payments under parent email: ${parentEmail}`);
        
        const parentPaymentRef = admin.database()
          .ref(`payments/${sanitizedParentEmail}/courses/${courseId}`);
        const parentPaymentSnapshot = await parentPaymentRef.once('value');
        
        if (parentPaymentSnapshot.exists()) {
          console.log(`Found payment data under parent email ${sanitizedParentEmail}, course ${courseId}`);
          const dbPaymentData = parentPaymentSnapshot.val();
          
          // Return the database payment data
          return {
            success: true,
            message: 'Payment data found in database under parent email (no Stripe payment record)',
            paymentType: dbPaymentData.type || 'unknown',
            hasStripeData: false,
            data_source: 'firebase_database',
            parent_payment: true,
            paymentData: {
              ...dbPaymentData,
              synced_from_stripe: false,
              data_source: 'firebase_database',
              parent_payment: true,
              sync_timestamp: Date.now()
            }
          };
        }
      }
      
      return {
        success: false,
        message: 'No payments found for this course in Stripe or database',
        hasStripeData: false
      };
    }
    
    // Process the most recent subscription (or the only one)
    const subscription = courseSubscriptions[0];
    const paymentType = subscription.metadata?.paymentType || 'subscription';
    
    // Count successful payments - always pass the customer ID
    let paymentInfo = { count: 0, invoices: [] };
    
    try {
      paymentInfo = await countSuccessfulPaymentsForSubscription(
        stripe, 
        subscription.id, 
        courseId,
        subscription.customer || customerId // Use subscription's customer or fallback to customerId
      );
    } catch (error) {
      console.error('Error counting payments:', error);
      // Try without customer ID as fallback
      try {
        paymentInfo = await countSuccessfulPaymentsForSubscription(
          stripe, 
          subscription.id, 
          courseId,
          null
        );
      } catch (error2) {
        console.error('Error counting payments (second attempt):', error2);
      }
    }
    
    console.log(`Subscription ${subscription.id} has ${paymentInfo.count} successful payments`);
    
    // Also fetch ALL invoices (including unpaid/open ones) for this subscription
    let allInvoices = [];
    try {
      const invoiceList = await stripe.invoices.list({
        subscription: subscription.id,
        limit: 100 // Get all invoices
      });
      
      allInvoices = invoiceList.data.map(inv => ({
        id: inv.id,
        amount_paid: inv.amount_paid,
        amount_due: inv.amount_due,
        paid_at: inv.status_transitions?.paid_at || null,
        created: inv.created * 1000,
        period_start: inv.period_start * 1000,
        period_end: inv.period_end * 1000,
        hosted_invoice_url: inv.hosted_invoice_url || null,
        invoice_pdf: inv.invoice_pdf || null,
        status: inv.status, // 'paid', 'open', 'draft', 'void', 'uncollectible'
        stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${inv.id}`
      }));
      
      console.log(`Found ${allInvoices.length} total invoices (including unpaid) for subscription ${subscription.id}`);
    } catch (error) {
      console.error('Error fetching all invoices:', error);
      // Fallback to just the paid invoices
      allInvoices = paymentInfo.invoices;
    }
    
    // Build comprehensive payment data
    const paymentData = {
      status: subscription.status === 'canceled' && paymentInfo.count >= 3 ? 'paid' : 
              subscription.status === 'active' ? 'active' : 
              subscription.status,
      type: 'subscription',
      last_updated: admin.database.ServerValue?.TIMESTAMP || Date.now(),
      subscription_id: subscription.id,
      customer_id: customerId,
      courseName: subscription.metadata?.courseName || '',
      payment_count: paymentInfo.count,
      current_period_end: subscription.current_period_end * 1000,
      current_period_start: subscription.current_period_start * 1000,
      cancel_at: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
      canceled_at: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
      stripe_links: {
        customer: `https://dashboard.stripe.com/customers/${customerId}`,
        subscription: `https://dashboard.stripe.com/subscriptions/${subscription.id}`
      },
      invoices: allInvoices, // Use all invoices (including unpaid)
      successful_invoice_ids: paymentInfo.invoices.map(inv => inv.id), // Keep track of only paid invoice IDs
      synced_from_stripe: true,
      sync_timestamp: Date.now()
    };
    
    // Add completion details for 3-payment plans
    if (paymentType === 'subscription_3_month' && paymentInfo.count >= 3) {
      paymentData.status = 'paid';
      paymentData.cancellation_reason = 'completed_3_payments';
      paymentData.final_payment_count = paymentInfo.count;
    }
    
    // Add latest invoice if available
    if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
      const latestInvoice = subscription.latest_invoice;
      paymentData.latest_invoice = {
        id: latestInvoice.id,
        amount_paid: latestInvoice.amount_paid,
        hosted_invoice_url: latestInvoice.hosted_invoice_url,
        invoice_pdf: latestInvoice.invoice_pdf,
        paid_at: latestInvoice.status_transitions?.paid_at || null,
        stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${latestInvoice.id}`
      };
      paymentData.stripe_links.latest_invoice = `https://dashboard.stripe.com/invoices/${latestInvoice.id}`;
    }
    
    // Store all subscription IDs for this course
    const allSubscriptionIds = courseSubscriptions.map(sub => sub.id);
    paymentData.all_subscription_ids = allSubscriptionIds;
    
    // Update the payment status in database
    await updatePaymentStatus(userEmail, courseId, paymentData, 'manual_sync');
    
    return {
      success: true,
      message: `Payment data synced successfully (${paymentInfo.count} payments found)`,
      paymentType: 'subscription',
      paymentCount: paymentInfo.count,
      subscriptionStatus: subscription.status,
      paymentData
    };
    
  } catch (error) {
    console.error('Error syncing payment status:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync payment data',
      error: error.toString()
    };
  }
});

// Export all V2 functions
module.exports = {
  handleStripeWebhookV2,
  handleOneTimePaymentV2,
  handleSubscriptionUpdateV2,
  handleSubscriptionScheduleV2,
  getPaymentStatusV2,
  syncStripePaymentStatusV2
};