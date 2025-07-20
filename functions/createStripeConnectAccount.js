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
    // Initialize Stripe with the secret key from Secret Manager
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application"
        },
        losses: {
          payments: "application"
        },
      },
      capabilities: {
        transfers: { requested: true },
      },
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
      },
      business_profile: {
        name: `${userProfile?.firstName} ${userProfile?.lastName} - Home Education`,
        product_description: 'Home education reimbursements',
        support_email: request.auth.token.email,
      },
      // Note: tos_acceptance with service_agreement is not supported for CA platforms creating CA accounts
      // Terms of service will be handled during the onboarding flow
    });

    // Store the Stripe account ID in Firebase
    const db = admin.database();
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).set({
      accountId: account.id,
      status: account.details_submitted ? 'active' : 'pending',
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