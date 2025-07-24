const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Debug function to retrieve Stripe account requirements and current state
 * This helps us understand what fields are required and how to structure the data
 */
const debugStripeAccount = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_TEST"]
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { familyId } = request.data;
  const userId = request.auth.uid;

  // Verify user has permission to access this family's Stripe account
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId || customClaims.familyRole !== 'primary_guardian') {
    throw new Error('Only primary guardians can debug Stripe accounts');
  }

  try {
    // Get the Stripe account ID from Firebase
    const db = admin.database();
    const stripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const stripeData = stripeDataRef.val();
    
    console.log('Firebase stripeData:', stripeData);
    
    if (!stripeData?.accountId) {
      throw new Error('No Stripe account found for this family');
    }

    console.log('Attempting to retrieve Stripe account:', stripeData.accountId);

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
    
    // First, let's just check what we have in Firebase
    if (!stripeData.accountId) {
      return {
        success: false,
        error: 'No account ID in Firebase',
        firebase_data: stripeData
      };
    }

    // Try to retrieve the account from Stripe
    let account;
    try {
      account = await stripe.accounts.retrieve(stripeData.accountId);
      console.log('Successfully retrieved Stripe account:', account?.id);
      console.log('Account object type:', typeof account);
      console.log('Account object keys:', account ? Object.keys(account) : 'account is null/undefined');
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return {
        success: false,
        error: `Stripe API error: ${stripeError.message}`,
        account_id_attempted: stripeData.accountId,
        firebase_data: stripeData
      };
    }

    if (!account) {
      return {
        success: false,
        error: 'Account object is null or undefined',
        account_response: account,
        firebase_data: stripeData
      };
    }

    // Handle case where account doesn't have id property
    const accountId = account.id || account.account_id || 'unknown';
    if (!accountId || accountId === 'unknown') {
      return {
        success: false,
        error: 'Account retrieved but missing ID property',
        account_response: account,
        account_keys: Object.keys(account || {}),
        firebase_data: stripeData
      };
    }

    // Return detailed information about the account
    return {
      success: true,
      accountId: accountId,
      debug_info: {
        // Raw account object keys for debugging
        account_keys: Object.keys(account || {}),
        
        // Current account status
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        
        // Current business profile (this is what we want to see!)
        business_profile: account.business_profile,
        
        // Current individual info
        individual: account.individual ? {
          id: account.individual.id,
          first_name: account.individual.first_name,
          last_name: account.individual.last_name,
          email: account.individual.email,
          phone: account.individual.phone,
          address: account.individual.address,
          political_exposure: account.individual.political_exposure
        } : null,
        
        // What Stripe currently requires (CRITICAL!)
        requirements: account.requirements ? {
          currently_due: account.requirements.currently_due || [],
          eventually_due: account.requirements.eventually_due || [],
          past_due: account.requirements.past_due || [],
          pending_verification: account.requirements.pending_verification || [],
          disabled_reason: account.requirements.disabled_reason || null,
          errors: account.requirements.errors || []
        } : null,
        
        // Future requirements
        future_requirements: account.future_requirements ? {
          currently_due: account.future_requirements.currently_due || [],
          eventually_due: account.future_requirements.eventually_due || [],
          past_due: account.future_requirements.past_due || [],
          pending_verification: account.future_requirements.pending_verification || []
        } : null,
        
        // Account metadata
        business_type: account.business_type,
        country: account.country,
        default_currency: account.default_currency,
        email: account.email,
        
        // Controller info (shows if it's properly configured for embedded components)
        controller: account.controller,
        
        // Full account object (for complete debugging)
        full_account: account
      }
    };

  } catch (error) {
    console.error('Error debugging Stripe account:', error);
    throw new Error(`Failed to debug Stripe account: ${error.message}`);
  }
});

module.exports = {
  debugStripeAccount
};