// Cloud function to get student payment details from Stripe
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Get student payment details by searching Stripe for customers with matching firebaseUID metadata
 */
const getStudentPaymentDetailsV2 = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (request) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const { firebaseUID, email, customerId, customerIds, courseIds } = request.data;
    
    // Handle multiple customer IDs if provided (for students with multiple payers)
    if (customerIds && Array.isArray(customerIds) && customerIds.length > 0) {
      console.log(`Processing multiple customer IDs: ${customerIds.join(', ')}`);
      
      let allSubscriptions = [];
      let allCharges = [];
      let allInvoices = [];
      const customers = [];
      
      // Fetch data from each customer
      for (const custId of customerIds) {
        try {
          const customer = await stripe.customers.retrieve(custId);
          
          if (!customer) continue;
          
          console.log(`Processing customer: ${customer.id} (${customer.email})`);
          customers.push({
            id: customer.id,
            email: customer.email,
            name: customer.name,
            created: customer.created,
            currency: customer.currency,
            metadata: customer.metadata,
            balance: customer.balance
          });
          
          // Fetch subscriptions for this customer
          const subscriptionList = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 100,
            status: 'all',
            expand: ['data.latest_invoice']
          });
          
          const formattedSubs = subscriptionList.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            amount: sub.items.data[0]?.price?.unit_amount || 0,
            currency: sub.currency,
            created: sub.created,
            current_period_start: sub.current_period_start,
            current_period_end: sub.current_period_end,
            cancel_at: sub.cancel_at,
            canceled_at: sub.canceled_at,
            metadata: sub.metadata,
            customer_id: customer.id,
            customer_email: customer.email,
            latest_invoice: sub.latest_invoice ? {
              id: sub.latest_invoice.id,
              amount_paid: sub.latest_invoice.amount_paid,
              hosted_invoice_url: sub.latest_invoice.hosted_invoice_url,
              invoice_pdf: sub.latest_invoice.invoice_pdf
            } : null
          }));
          
          allSubscriptions.push(...formattedSubs);
          
          // Fetch charges for this customer
          const chargeList = await stripe.charges.list({
            customer: customer.id,
            limit: 100
          });
          
          const formattedCharges = chargeList.data.map(charge => ({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            created: charge.created,
            description: charge.description,
            receipt_url: charge.receipt_url,
            metadata: charge.metadata,
            customer_id: customer.id,
            customer_email: customer.email,
            payment_method_details: {
              type: charge.payment_method_details?.type
            }
          }));
          
          allCharges.push(...formattedCharges);
          
          // Fetch invoices for this customer
          const invoiceList = await stripe.invoices.list({
            customer: customer.id,
            limit: 50
          });
          
          const formattedInvoices = invoiceList.data.map(inv => ({
            id: inv.id,
            status: inv.status,
            amount_paid: inv.amount_paid,
            amount_due: inv.amount_due,
            currency: inv.currency,
            created: inv.created,
            paid_at: inv.status_transitions?.paid_at,
            hosted_invoice_url: inv.hosted_invoice_url,
            invoice_pdf: inv.invoice_pdf,
            metadata: inv.metadata,
            subscription: inv.subscription,
            customer_id: customer.id,
            customer_email: customer.email
          }));
          
          allInvoices.push(...formattedInvoices);
          
        } catch (error) {
          console.error(`Error fetching data for customer ${custId}:`, error);
        }
      }
      
      // Sort all data by date (most recent first)
      allSubscriptions.sort((a, b) => b.created - a.created);
      allCharges.sort((a, b) => b.created - a.created);
      allInvoices.sort((a, b) => b.created - a.created);
      
      return {
        success: true,
        multiple_customers: true,
        customers: customers,
        customerId: customerIds[0], // Keep first ID for compatibility
        customer: customers[0], // Keep first customer for compatibility
        subscriptions: allSubscriptions,
        charges: allCharges,
        invoices: allInvoices,
        summary: {
          totalCustomers: customers.length,
          totalSubscriptions: allSubscriptions.length,
          activeSubscriptions: allSubscriptions.filter(s => s.status === 'active').length,
          totalCharges: allCharges.length,
          successfulCharges: allCharges.filter(c => c.status === 'succeeded').length,
          totalInvoices: allInvoices.length,
          paidInvoices: allInvoices.filter(i => i.status === 'paid').length
        }
      };
    }
    
    // If single customerId is provided directly, use it (backward compatibility)
    if (customerId) {
      console.log(`Using provided customer ID: ${customerId}`);
      
      try {
        const customer = await stripe.customers.retrieve(customerId);
        
        if (!customer) {
          throw new Error('Customer not found');
        }
        
        console.log(`Found Stripe customer: ${customer.id}`);
        
        // Fetch subscriptions
        const subscriptionList = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 100,
          status: 'all',
          expand: ['data.latest_invoice']
        });
        
        let subscriptions = subscriptionList.data;
        
        // Optional: Filter by courseIds if provided (but don't filter if we want all subscriptions)
        // Comment out filtering for now to see all subscriptions
        /*
        if (courseIds && courseIds.length > 0) {
          subscriptions = subscriptions.filter(sub => {
            const metadata = sub.metadata || {};
            return courseIds.includes(String(metadata.courseId));
          });
        }
        */
        
        const formattedSubscriptions = subscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          amount: sub.items.data[0]?.price?.unit_amount || 0,
          currency: sub.currency,
          created: sub.created,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
          cancel_at: sub.cancel_at,
          canceled_at: sub.canceled_at,
          metadata: sub.metadata,
          latest_invoice: sub.latest_invoice ? {
            id: sub.latest_invoice.id,
            amount_paid: sub.latest_invoice.amount_paid,
            hosted_invoice_url: sub.latest_invoice.hosted_invoice_url,
            invoice_pdf: sub.latest_invoice.invoice_pdf
          } : null
        }));
        
        // Fetch recent charges - increase limit to get more history
        const chargeList = await stripe.charges.list({
          customer: customer.id,
          limit: 100  // Increased from 50 to 100
        });
        
        let charges = chargeList.data;
        
        // Optional: Filter by courseIds if provided (but don't filter if we want all payments)
        // Comment out filtering for now to see all payments
        /*
        if (courseIds && courseIds.length > 0) {
          charges = charges.filter(charge => {
            const metadata = charge.metadata || {};
            return courseIds.includes(String(metadata.courseId));
          });
        }
        */
        
        const formattedCharges = charges.map(charge => ({
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: charge.status,
          created: charge.created,
          description: charge.description,
          receipt_url: charge.receipt_url,
          metadata: charge.metadata,
          payment_method_details: {
            type: charge.payment_method_details?.type
          }
        }));
        
        // Fetch recent invoices
        const invoiceList = await stripe.invoices.list({
          customer: customer.id,
          limit: 50
        });
        
        const invoices = invoiceList.data.map(inv => ({
          id: inv.id,
          status: inv.status,
          amount_paid: inv.amount_paid,
          amount_due: inv.amount_due,
          currency: inv.currency,
          created: inv.created,
          paid_at: inv.status_transitions?.paid_at,
          hosted_invoice_url: inv.hosted_invoice_url,
          invoice_pdf: inv.invoice_pdf,
          metadata: inv.metadata,
          subscription: inv.subscription
        }));
        
        return {
          success: true,
          customerId: customer.id,
          customer: {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            created: customer.created,
            currency: customer.currency,
            metadata: customer.metadata,
            balance: customer.balance
          },
          subscriptions: formattedSubscriptions,
          charges: formattedCharges,
          invoices,
          summary: {
            totalSubscriptions: formattedSubscriptions.length,
            activeSubscriptions: formattedSubscriptions.filter(s => s.status === 'active').length,
            totalCharges: formattedCharges.length,
            successfulCharges: formattedCharges.filter(c => c.status === 'succeeded').length,
            totalInvoices: invoices.length,
            paidInvoices: invoices.filter(i => i.status === 'paid').length
          }
        };
        
      } catch (error) {
        console.error('Error fetching customer by ID:', error);
        // Fall through to legacy search methods if direct lookup fails
      }
    }
    
    // Legacy fallback: search by email or firebaseUID
    if (!firebaseUID && !email) {
      throw new Error('Either customerId, firebaseUID, or email is required');
    }
    
    console.log(`Falling back to search with firebaseUID: ${firebaseUID} or email: ${email}`);
    
    let customer = null;
    let subscriptions = [];
    let charges = [];
    let invoices = [];
    
    // First try to search by email (more reliable)
    if (email) {
      const customers = await stripe.customers.list({
        email: email,
        limit: 100
      });
      
      // If we have firebaseUID, try to find exact match
      if (firebaseUID && customers.data.length > 0) {
        customer = customers.data.find(c => c.metadata?.firebaseUID === firebaseUID);
        
        // If no exact match, use first customer with this email
        if (!customer) {
          customer = customers.data[0];
        }
      } else if (customers.data.length > 0) {
        customer = customers.data[0];
      }
    }
    
    // If no customer found by email, search by metadata (slower, requires iterating)
    if (!customer && firebaseUID) {
      // Note: Stripe doesn't support direct metadata search, so we need to list and filter
      // This is a limitation - in production, consider storing Stripe customer ID in Firebase
      const allCustomers = await stripe.customers.list({
        limit: 100 // Adjust based on your customer base size
      });
      
      customer = allCustomers.data.find(c => c.metadata?.firebaseUID === firebaseUID);
    }
    
    if (!customer) {
      return {
        success: false,
        message: 'No Stripe customer found',
        firebaseUID,
        email
      };
    }
    
    console.log(`Found Stripe customer: ${customer.id}`);
    
    // Fetch subscriptions
    const subscriptionList = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 100,
      status: 'all', // Get all statuses
      expand: ['data.latest_invoice']
    });
    
    subscriptions = subscriptionList.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      amount: sub.items.data[0]?.price?.unit_amount || 0,
      currency: sub.currency,
      created: sub.created,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at: sub.cancel_at,
      canceled_at: sub.canceled_at,
      metadata: sub.metadata,
      latest_invoice: sub.latest_invoice ? {
        id: sub.latest_invoice.id,
        amount_paid: sub.latest_invoice.amount_paid,
        hosted_invoice_url: sub.latest_invoice.hosted_invoice_url,
        invoice_pdf: sub.latest_invoice.invoice_pdf
      } : null
    }));
    
    // Fetch recent charges
    const chargeList = await stripe.charges.list({
      customer: customer.id,
      limit: 50
    });
    
    charges = chargeList.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      created: charge.created,
      description: charge.description,
      receipt_url: charge.receipt_url,
      metadata: charge.metadata,
      payment_method_details: {
        type: charge.payment_method_details?.type
      }
    }));
    
    // Fetch recent invoices
    const invoiceList = await stripe.invoices.list({
      customer: customer.id,
      limit: 50
    });
    
    invoices = invoiceList.data.map(inv => ({
      id: inv.id,
      status: inv.status,
      amount_paid: inv.amount_paid,
      amount_due: inv.amount_due,
      currency: inv.currency,
      created: inv.created,
      paid_at: inv.status_transitions?.paid_at,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      metadata: inv.metadata,
      subscription: inv.subscription
    }));
    
    return {
      success: true,
      customerId: customer.id,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
        currency: customer.currency,
        metadata: customer.metadata,
        balance: customer.balance
      },
      subscriptions,
      charges,
      invoices,
      summary: {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        totalCharges: charges.length,
        successfulCharges: charges.filter(c => c.status === 'succeeded').length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(i => i.status === 'paid').length
      }
    };
    
  } catch (error) {
    console.error('Error fetching student payment details:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch payment details',
      error: error.toString()
    };
  }
});

/**
 * Create a Stripe checkout session for a student
 * Updated to use Checkout Sessions instead of Payment Links for better metadata handling
 */
const createStripePaymentLinkV2 = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY"]
}, async (request) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const { email, uid, customerId, amount, description, productDescription, metadata } = request.data;
    
    if (!email || !amount) {
      throw new Error('Email and amount are required');
    }
    
    console.log(`Creating checkout session for ${email}, amount: ${amount} CAD, customerId: ${customerId}`);
    
    // Use provided customer ID or create/retrieve customer
    let customer;
    
    if (customerId) {
      // Use the provided customer ID
      try {
        customer = await stripe.customers.retrieve(customerId);
        console.log(`Using existing customer: ${customer.id}`);
      } catch (error) {
        console.error('Error retrieving customer by ID, will search by email:', error);
        // Fall back to email search if customer ID is invalid
        const customers = await stripe.customers.list({
          email: email,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: email,
            metadata: {
              firebaseUID: uid || '',
              ...metadata
            }
          });
        }
      }
    } else {
      // Legacy path: search by email
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: email,
          metadata: {
            firebaseUID: uid || '',
            ...metadata
          }
        });
      }
    }
    
    // Build product name and description with student/course info
    const courseName = metadata?.courseName || 'Course Payment';
    const schoolYear = metadata?.schoolYear || 'Current';
    const studentType = metadata?.studentType || '';
    
    // Create product name that clearly identifies what's being paid for
    const productName = description || 
      (metadata?.paymentType === 'credits' ? 
        `${metadata.creditsAmount || ''} Credits - ${courseName}` : 
        courseName);
    
    // Use custom product description if provided, otherwise use default
    const checkoutDescription = productDescription || 
      metadata?.customProductDescription || 
      `Student: ${email}${schoolYear ? `\nSchool Year: ${schoolYear}` : ''}${studentType ? `\nType: ${studentType}` : ''}`;
    
    // Create a Checkout Session instead of Payment Link for better control
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad', // Canadian dollars
          product_data: {
            name: productName,
            description: checkoutDescription,
          },
          unit_amount: amount // amount should be in cents
        },
        quantity: 1
      }],
      mode: 'payment',
      customer: customer.id,
      success_url: `${process.env.APP_URL || 'https://rtdacademy.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'https://rtdacademy.com'}/payment-cancelled`,
      
      // CRITICAL: Pass metadata to the Payment Intent for webhook processing
      payment_intent_data: {
        metadata: {
          // Include all fields needed by webhooks
          firebaseUID: uid || '',
          userEmail: email,
          courseId: metadata?.courseId || '',
          courseName: metadata?.courseName || '',
          studentType: metadata?.studentType || '',
          schoolYear: metadata?.schoolYear || '',
          paymentType: metadata?.paymentType || 'manual',
          // For credit payments specifically
          ...(metadata?.paymentType === 'credits' && {
            creditsAmount: metadata.creditsAmount || '',
            coursesToUnlock: metadata.coursesToUnlock || ''
          }),
          // Spread any additional metadata
          ...metadata
        },
        description: `${productName} - ${email}`
      },
      
      // Also keep metadata on Checkout Session for reference
      metadata: {
        ...metadata,
        firebaseUID: uid || '',
        userEmail: email
      },
      
      // Add custom text for submit button to show CAD amount
      custom_text: {
        submit: {
          message: `Complete payment of $${(amount/100).toFixed(2)} CAD`
        }
      },
      
      // Enable invoice creation for better documentation
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${courseName} - ${schoolYear}`,
          metadata: {
            studentEmail: email,
            courseId: metadata?.courseId || '',
            firebaseUID: uid || ''
          },
          footer: `Payment for ${email} - ${schoolYear} school year`
        }
      }
    });
    
    console.log(`Created checkout session: ${session.id} with URL: ${session.url}`);
    
    return {
      success: true,
      url: session.url,
      id: session.id,
      customerId: customer.id,
      sessionId: session.id
    };
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      message: error.message || 'Failed to create checkout session',
      error: error.toString()
    };
  }
});

module.exports = {
  getStudentPaymentDetailsV2,
  createStripePaymentLinkV2
};