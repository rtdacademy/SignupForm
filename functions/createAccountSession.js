const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Creates a Stripe Account Session for embedded components
 * This enables families to use onboarding, account management, and payout components
 */
const createAccountSession = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_TEST"]
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { familyId, components = [] } = request.data;
  const userId = request.auth.uid;

  // Verify user has permission to access this family's Stripe account
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId) {
    throw new Error('User does not have access to this family');
  }

  try {
    // Get the Stripe account ID from Firebase
    const db = admin.database();
    const stripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const stripeData = stripeDataRef.val();
    
    if (!stripeData?.accountId) {
      throw new Error('No Stripe account found for this family. Please create an account first.');
    }

    // Initialize Stripe with the secret key from Secret Manager
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);

    // Default components configuration
    const defaultComponents = {
      account_onboarding: {
        enabled: true,
        features: {
          external_account_collection: true,
        },
      },
      account_management: {
        enabled: true,
        features: {
          external_account_collection: true,
        },
      },
      notification_banner: {
        enabled: true,
        features: {
          external_account_collection: true,
        },
      },
      payouts: {
        enabled: true,
        features: {
          instant_payouts: true,
          standard_payouts: true,
          edit_payout_schedule: true,
          external_account_collection: true,
        },
      },
    };

    // Allow custom component configuration if provided
    let componentsConfig = defaultComponents;
    if (components.length > 0) {
      componentsConfig = {};
      components.forEach(component => {
        if (defaultComponents[component]) {
          componentsConfig[component] = defaultComponents[component];
        }
      });
    }

    // Create Account Session for embedded components
    const accountSession = await stripe.accountSessions.create({
      account: stripeData.accountId,
      components: componentsConfig,
    });

    // Log the session creation
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`).push({
      action: 'account_session_created',
      performed_by: userId,
      performed_by_email: request.auth.token.email,
      timestamp: new Date().toISOString(),
      details: {
        stripe_account_id: stripeData.accountId,
        session_client_secret: accountSession.client_secret,
        components_enabled: Object.keys(componentsConfig),
      }
    });

    // Update last accessed timestamp
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT/lastAccessed`).set(new Date().toISOString());

    return {
      success: true,
      clientSecret: accountSession.client_secret,
      accountId: stripeData.accountId,
      components: Object.keys(componentsConfig),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // Sessions expire in 1 hour
    };

  } catch (error) {
    console.error('Error creating account session:', error);
    
    // Handle specific Stripe errors
    if (error.code === 'account_invalid') {
      throw new Error('The connected Stripe account is invalid or has been deactivated');
    }
    if (error.code === 'account_not_found') {
      throw new Error('Stripe account not found. Please recreate the account');
    }
    
    throw new Error(`Failed to create account session: ${error.message}`);
  }
});

module.exports = {
  createAccountSession
};