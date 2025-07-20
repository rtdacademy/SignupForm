const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Creates a Stripe account session for embedded components
 * This enables the onboarding flow and account management
 */
const createStripeAccountSession = onCall({
  concurrency: 100,
  memory: '256MiB',
  timeoutSeconds: 30,
  secrets: ["STRIPE_SECRET_KEY_TEST"]
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { familyId, componentType = 'account_onboarding' } = request.data;
  const userId = request.auth.uid;

  // Verify user has permission to access this family's Stripe account
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId) {
    throw new Error('User does not belong to this family');
  }

  try {
    // Get the Stripe account ID from Firebase
    const db = admin.database();
    const stripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const stripeData = stripeDataRef.val();

    if (!stripeData?.accountId) {
      throw new functions.https.HttpsError('not-found', 'No Stripe account found for this family');
    }

    const accountId = stripeData.accountId;

    // Define component configurations based on type
    const componentConfigs = {
      account_onboarding: {
        account_onboarding: { enabled: true }
      },
      account_management: {
        account_management: { enabled: true },
        notification_banner: { enabled: true }
      },
      payments: {
        payments: { enabled: true, features: { refund_management: true, dispute_management: true } }
      },
      payouts: {
        payouts: { enabled: true, features: { instant_payouts: true, standard_payouts: true } }
      }
    };

    // Initialize Stripe with the secret key from Secret Manager
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: componentConfigs[componentType] || componentConfigs.account_onboarding,
    });

    // Update last accessed timestamp
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT/lastAccessed`).set(new Date().toISOString());

    return {
      success: true,
      client_secret: accountSession.client_secret,
      accountId: accountId,
    };

  } catch (error) {
    console.error('Error creating Stripe account session:', error);
    throw new Error(`Failed to create account session: ${error.message}`);
  }
});

module.exports = {
  createStripeAccountSession
};