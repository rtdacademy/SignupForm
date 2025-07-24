const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Creates a Stripe Connect account for a family's primary guardian
 * This replaces the manual bank account system
 */
const createStripeConnectAccount = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_TEST"]
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { familyId, userProfile } = request.data;
  const userId = request.auth.uid;

  // Verify user has permission to create accounts for this family
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId || customClaims.familyRole !== 'primary_guardian') {
    throw new Error('Only primary guardians can create Stripe accounts');
  }

  try {
    // Check if account already exists
    const db = admin.database();
    const existingStripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const existingStripeData = existingStripeDataRef.val();
    
    if (existingStripeData?.accountId) {
      // Account already exists, but update it with enhanced prefilling if not already done
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
      
      try {
        // Update existing account with enhanced prefilling
        await stripe.accounts.update(existingStripeData.accountId, {
          email: request.auth.token.email, // Add email if missing
          business_profile: {
            name: `${userProfile?.firstName} ${userProfile?.lastName} - RTD Academy Parent`,
            mcc: '8299',
            url: 'https://rtdacademy.ca',
            product_description: 'Home education expense reimbursements through RTD Academy partnership program',
            support_email: 'support@rtdacademy.ca',
            support_phone: '+14032995722',
            support_url: 'https://rtdacademy.ca/support',
            support_address: {
              line1: '1500 4 St SW, Suite 200',
              city: 'Calgary',
              state: 'AB',
              postal_code: 'T2R 0X7',
              country: 'CA',
            },
            annual_revenue: {
              amount: 1000000, // $10,000 CAD in cents
              currency: 'cad',
              fiscal_year_end: '2024-12-31'
            },
            estimated_worker_count: 1,
            minority_owned_business_designation: ['prefer_not_to_answer']
          },
          individual: {
            first_name: userProfile?.firstName,
            last_name: userProfile?.lastName,
            email: request.auth.token.email,
            phone: userProfile?.phone,
            political_exposure: 'none',
            address: userProfile?.address ? {
              line1: userProfile.address.street,
              city: userProfile.address.city,
              state: userProfile.address.province,
              postal_code: userProfile.address.postalCode,
              country: userProfile.address.country || 'CA',
            } : undefined,
          }
        });
        
        console.log(`Updated existing Stripe account ${existingStripeData.accountId} with enhanced prefilling`);
      } catch (updateError) {
        console.warn('Could not update existing account with prefilling:', updateError.message);
        // Continue anyway - account exists and may be partially filled
      }
      
      return {
        success: true,
        accountId: existingStripeData.accountId,
        status: existingStripeData.status || 'pending',
        onboardingUrl: null,
        message: 'Stripe account already exists for this family (enhanced prefilling applied)'
      };
    }

    // Initialize Stripe with the secret key from Secret Manager
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
    
    // Create account configured for embedded components (fully embedded platform integration)
    const account = await stripe.accounts.create({
      country: 'CA', // Canadian accounts
      email: request.auth.token.email, // Top-level email field for account
      controller: {
        stripe_dashboard: {
          type: 'none', // Critical: No Stripe dashboard access, use embedded components only
        },
      },
      capabilities: {
        card_payments: { requested: true }, // Required for embedded components
        transfers: { requested: true },
      },
      // Comprehensive prefill to minimize manual entry
      business_type: 'individual',
      individual: {
        first_name: userProfile?.firstName,
        last_name: userProfile?.lastName,
        email: request.auth.token.email,
        phone: userProfile?.phone,
        address: userProfile?.address ? {
          line1: userProfile.address.street,
          city: userProfile.address.city,
          state: userProfile.address.province,
          postal_code: userProfile.address.postalCode,
          country: userProfile.address.country || 'CA',
        } : undefined,
        // Pre-fill additional individual details to reduce questions
        dob: {
          day: 1,
          month: 1,
          year: 1980, // Default DOB - user can update if needed
        },
        // Additional prefills to minimize questions
        id_number_provided: false, // They'll provide SIN when ready
        ssn_last_4_provided: false, // Not applicable for Canada
      },
      business_profile: {
        // Pre-fill business profile to minimize business questions
        name: `${userProfile?.firstName} ${userProfile?.lastName} - RTD Academy Parent`,
        mcc: '8299', // Educational Services - Other
        url: 'https://rtdacademy.ca',
        product_description: 'Home education expense reimbursements through RTD Academy partnership program',
        support_email: 'support@rtdacademy.ca',
        support_phone: '+14032995722', // RTD Academy support line
        support_url: 'https://rtdacademy.ca/support',
        support_address: {
          line1: '1500 4 St SW, Suite 200',
          city: 'Calgary',
          state: 'AB',
          postal_code: 'T2R 0X7',
          country: 'CA',
        },
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'weekly',
            weekly_anchor: 'friday'
          }
        }
      },
      metadata: {
        account_type: 'parent_reimbursements',
        platform: 'rtd_academy',
        purpose: 'education_expense_reimbursements',
        individual_account: 'true',
        parent_name: `${userProfile?.firstName} ${userProfile?.lastName}`,
        family_id: familyId,
      },
    });

    // Now update the account with additional prefilled information (Stripe's recommended approach)
    const updatedAccount = await stripe.accounts.update(account.id, {
      // Additional business profile fields to minimize form questions
      business_profile: {
        // Pre-fill annual revenue with a reasonable default for education reimbursements
        annual_revenue: {
          amount: 1000000, // $10,000 CAD in cents - reasonable for family education expenses
          currency: 'cad',
          fiscal_year_end: '2024-12-31'
        },
        estimated_worker_count: 1, // Individual account
        minority_owned_business_designation: ['prefer_not_to_answer']
      },
      // Pre-fill individual fields that help with business questions
      individual: {
        political_exposure: 'none' // Most parents won't have political exposure
      }
    });

    // Store the Stripe account ID in Firebase
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).set({
      accountId: account.id,
      status: updatedAccount.details_submitted ? 'active' : 'pending',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    // Log the action
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`).push({
      action: 'stripe_connect_account_created',
      performed_by: userId,
      performed_by_email: request.auth.token.email,
      timestamp: new Date().toISOString(),
      details: {
        stripe_account_id: account.id,
        status: account.details_submitted ? 'active' : 'pending',
      }
    });

    return {
      success: true,
      accountId: account.id,
      status: account.details_submitted ? 'active' : 'pending',
      onboardingUrl: null, // Will be provided by account session
    };

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    throw new Error(`Failed to create Stripe account: ${error.message}`);
  }
});

module.exports = {
  createStripeConnectAccount
};