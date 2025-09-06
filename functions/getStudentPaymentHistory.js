// Cloud function to get comprehensive payment history from Stripe
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Get comprehensive payment history from Stripe including charges, invoices, and payment intents
 */
const getStudentPaymentHistory = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (request) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const { customerIds, email } = request.data;
    
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return {
        success: false,
        error: 'No customer IDs provided',
        history: []
      };
    }
    
    console.log(`Fetching payment history for customer IDs: ${customerIds.join(', ')}`);
    
    const allHistory = [];
    
    // Fetch data from each customer
    for (const customerId of customerIds) {
      try {
        console.log(`Processing customer: ${customerId}`);
        
        // Fetch customer details
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer) continue;
        
        // Fetch all charges for this customer
        const charges = await stripe.charges.list({
          customer: customerId,
          limit: 100
        });
        
        // Add charges to history
        for (const charge of charges.data) {
          allHistory.push({
            type: 'charge',
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            created: charge.created,
            description: charge.description || 'Charge',
            receipt_url: charge.receipt_url,
            refunded: charge.refunded,
            refund_amount: charge.amount_refunded,
            payment_method_type: charge.payment_method_details?.type,
            payment_method_last4: charge.payment_method_details?.card?.last4,
            payment_method_brand: charge.payment_method_details?.card?.brand,
            metadata: charge.metadata,
            customer_id: customerId,
            customer_email: customer.email,
            customer_name: customer.name,
            stripe_dashboard_url: `https://dashboard.stripe.com/payments/${charge.id}`,
            disputed: charge.disputed,
            dispute_status: charge.dispute?.status
          });
        }
        
        // Fetch all invoices for this customer
        const invoices = await stripe.invoices.list({
          customer: customerId,
          limit: 100
        });
        
        // Add invoices to history
        for (const invoice of invoices.data) {
          // Skip draft invoices unless they're finalized
          if (invoice.status === 'draft' && !invoice.finalized_at) continue;
          
          allHistory.push({
            type: 'invoice',
            id: invoice.id,
            amount: invoice.amount_paid || invoice.amount_due,
            currency: invoice.currency,
            status: invoice.status,
            created: invoice.created,
            description: invoice.description || `Invoice for ${invoice.metadata?.courseName || 'Course'}`,
            courseName: invoice.metadata?.courseName,
            courseId: invoice.metadata?.courseId,
            paid_at: invoice.status_transitions?.paid_at,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            receipt_url: invoice.receipt_url,
            subscription_id: invoice.subscription,
            metadata: invoice.metadata,
            customer_id: customerId,
            customer_email: customer.email,
            customer_name: customer.name,
            stripe_dashboard_url: `https://dashboard.stripe.com/invoices/${invoice.id}`,
            payment_intent_id: invoice.payment_intent,
            charge_id: invoice.charge
          });
        }
        
        // Fetch recent payment intents
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customerId,
          limit: 100
        });
        
        // Add payment intents to history (avoiding duplicates from charges)
        const chargeIds = new Set(charges.data.map(c => c.payment_intent).filter(Boolean));
        
        for (const pi of paymentIntents.data) {
          // Skip if this payment intent is already represented by a charge
          if (chargeIds.has(pi.id)) continue;
          
          allHistory.push({
            type: 'payment_intent',
            id: pi.id,
            amount: pi.amount,
            currency: pi.currency,
            status: pi.status,
            created: pi.created,
            description: pi.description || pi.metadata?.courseName || 'Payment',
            courseName: pi.metadata?.courseName,
            courseId: pi.metadata?.courseId,
            receipt_url: pi.charges?.data[0]?.receipt_url,
            payment_method_type: pi.payment_method_types?.[0],
            metadata: pi.metadata,
            customer_id: customerId,
            customer_email: customer.email,
            customer_name: customer.name,
            stripe_dashboard_url: `https://dashboard.stripe.com/payments/${pi.id}`,
            latest_charge_id: pi.latest_charge
          });
        }
        
      } catch (error) {
        console.error(`Error fetching data for customer ${customerId}:`, error);
        // Continue with other customers even if one fails
      }
    }
    
    // Sort all history by date (most recent first)
    allHistory.sort((a, b) => {
      const dateA = a.paid_at || a.created;
      const dateB = b.paid_at || b.created;
      return dateB - dateA;
    });
    
    // Deduplicate by ID (in case of overlapping data)
    const seen = new Set();
    const uniqueHistory = allHistory.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    
    console.log(`Found ${uniqueHistory.length} unique payment history items`);
    
    return {
      success: true,
      history: uniqueHistory,
      summary: {
        total_items: uniqueHistory.length,
        total_customers: customerIds.length,
        types: {
          charges: uniqueHistory.filter(h => h.type === 'charge').length,
          invoices: uniqueHistory.filter(h => h.type === 'invoice').length,
          payment_intents: uniqueHistory.filter(h => h.type === 'payment_intent').length
        },
        statuses: {
          succeeded: uniqueHistory.filter(h => h.status === 'succeeded' || h.status === 'paid').length,
          pending: uniqueHistory.filter(h => h.status === 'pending' || h.status === 'open').length,
          failed: uniqueHistory.filter(h => h.status === 'failed' || h.status === 'canceled').length
        }
      }
    };
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return {
      success: false,
      error: error.message,
      history: []
    };
  }
});

module.exports = { getStudentPaymentHistory };