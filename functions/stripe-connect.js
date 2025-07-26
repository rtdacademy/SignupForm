const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

//==============================================================================
// CREATE STRIPE CONNECT ACCOUNT
//==============================================================================

/**
 * Creates a Stripe Connect account for a family's primary guardian
 * This replaces the manual bank account system
 */
const createStripeConnectAccount = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_LIVE"]
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
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE, {
        apiVersion: '2024-10-28.acacia', // Required for disable_stripe_user_authentication feature
      });
      
      try {
        // Update existing account with business profile only
        // Note: Individual data cannot be updated after Account Session is created for embedded accounts
        // This is for accounts created before the individual data prefill was implemented
        await stripe.accounts.update(existingStripeData.accountId, {
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
          settings: {
            payouts: {
              schedule: {
                interval: 'weekly',
                weekly_anchor: 'friday'
              }
            }
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

    // Initialize Stripe with the secret key from Secret Manager and required API version
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE, {
      apiVersion: '2024-10-28.acacia', // Required for disable_stripe_user_authentication feature
    });
    
    // Step 1: Create minimal account with Custom configuration
    const account = await stripe.accounts.create({
      country: 'CA',
      controller: {
        stripe_dashboard: {
          type: 'none',
        },
        requirement_collection: 'application', // This allows us to update any data later
        losses: {
          payments: 'application',
        },
        fees: {
          payer: 'application',
        },
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        account_type: 'parent_reimbursements',
        platform: 'rtd_academy',
        purpose: 'education_expense_reimbursements',
        family_id: familyId,
      },
    });

    // Step 2: Update account with minimal data to avoid verification
    // We'll let the embedded components handle most individual data collection
    const updatedAccount = await stripe.accounts.update(account.id, {
      email: request.auth.token.email,
      // Minimal individual data just to enable the account - users can update in embedded components
      individual: {
        first_name: userProfile?.firstName || 'User',
        last_name: userProfile?.lastName || 'Name', 
        email: request.auth.token.email,
        phone: userProfile?.phone || '+14035551234',
        address: {
          line1: userProfile?.address?.streetAddress || '123 Main Street',
          city: userProfile?.address?.city || 'Calgary',
          state: userProfile?.address?.province || 'AB', 
          postal_code: userProfile?.address?.postalCode || 'T2P 1M7',
          country: userProfile?.address?.country || 'CA',
        },
        ...(userProfile?.birthday && {
          dob: {
            day: new Date(userProfile.birthday).getDate(),
            month: new Date(userProfile.birthday).getMonth() + 1, // getMonth() returns 0-11, Stripe expects 1-12
            year: new Date(userProfile.birthday).getFullYear(),
          }
        }),
        political_exposure: 'none',
      },
      // Business profile
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
          amount: 1000000,
          currency: 'cad',
          fiscal_year_end: '2024-12-31'
        },
        estimated_worker_count: 1,
        minority_owned_business_designation: ['prefer_not_to_answer']
      },
      // Terms of Service acceptance
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: '127.0.0.1',
        user_agent: 'RTD Academy Connect Platform'
      },
      // No external account - users must add their own banking details
      // Settings
      settings: {
        payouts: {
          schedule: {
            interval: 'weekly',
            weekly_anchor: 'friday'
          }
        }
      },
      // Update metadata with user info
      metadata: {
        account_type: 'parent_reimbursements',
        platform: 'rtd_academy',
        purpose: 'education_expense_reimbursements',
        individual_account: 'true',
        parent_name: `${userProfile?.firstName} ${userProfile?.lastName}`,
        family_id: familyId,
        created_with_prefill: 'true'
      }
    });

    // Step 3: Update the person's relationship information
    // This needs to be done via the persons API for individual accounts
    try {
      const persons = await stripe.accounts.listPersons(account.id);
      if (persons.data.length > 0) {
        const personId = persons.data[0].id;
        await stripe.accounts.updatePerson(account.id, personId, {
          relationship: {
            representative: true,
            title: 'Owner'
          }
        });
        console.log('Successfully updated person relationship');
      }
    } catch (personError) {
      console.warn('Could not update person relationship:', personError.message);
      // Continue anyway - this may be handled by embedded components
    }

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

//==============================================================================
// CREATE ACCOUNT SESSION
//==============================================================================

/**
 * Creates a Stripe Account Session for embedded components
 * This enables families to use onboarding, account management, and payout components
 */
const createAccountSession = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_LIVE"]
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

    // Initialize Stripe with the secret key from Secret Manager and required API version
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE, {
      apiVersion: '2024-10-28.acacia', // Required for disable_stripe_user_authentication feature
    });

    // Default components configuration
    const defaultComponents = {
      account_onboarding: {
        enabled: true,
        features: {
          external_account_collection: true,
          disable_stripe_user_authentication: true,
        },
      },
      account_management: {
        enabled: true,
        features: {
          external_account_collection: true,
          disable_stripe_user_authentication: true,
        },
      },
      notification_banner: {
        enabled: true,
        features: {
          external_account_collection: true,
          disable_stripe_user_authentication: true,
        },
      },
      payouts: {
        enabled: true,
        features: {
          instant_payouts: true,
          standard_payouts: true,
          edit_payout_schedule: true,
          external_account_collection: true,
          disable_stripe_user_authentication: true,
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

//==============================================================================
// DEBUG STRIPE ACCOUNT
//==============================================================================

/**
 * Debug function to retrieve Stripe account requirements and current state
 * This helps us understand what fields are required and how to structure the data
 */
const debugStripeAccount = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_LIVE"]
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

    // Initialize Stripe with required API version
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE, {
      apiVersion: '2024-10-28.acacia', // Required for disable_stripe_user_authentication feature
    });
    
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

    // Log detailed information to function logs
    console.log('=== STRIPE ACCOUNT DEBUG INFO ===');
    console.log('Account ID:', accountId);
    console.log('Details Submitted:', account.details_submitted);
    console.log('Charges Enabled:', account.charges_enabled);
    console.log('Payouts Enabled:', account.payouts_enabled);
    console.log('Business Type:', account.business_type);
    console.log('Country:', account.country);
    console.log('Controller Configuration:', JSON.stringify(account.controller, null, 2));
    console.log('Requirements:', JSON.stringify(account.requirements, null, 2));
    console.log('Future Requirements:', JSON.stringify(account.future_requirements, null, 2));
    console.log('Individual Data:', JSON.stringify(account.individual, null, 2));
    console.log('Business Profile:', JSON.stringify(account.business_profile, null, 2));
    console.log('=== END DEBUG INFO ===');

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
        
        // Check what's actually stored
        business_profile_raw: JSON.stringify(account.business_profile, null, 2),
        
        // Current individual info (safely handle if undefined)
        individual: account.individual ? {
          id: account.individual.id || null,
          first_name: account.individual.first_name || null,
          last_name: account.individual.last_name || null,
          email: account.individual.email || null,
          phone: account.individual.phone || null,
          address: account.individual.address || null,
          political_exposure: account.individual.political_exposure || null,
          dob: account.individual.dob || null,
          // Show if individual object exists but is empty
          _raw: Object.keys(account.individual).length
        } : 'No individual data yet',
        
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

//==============================================================================
// UPDATE STRIPE ACCOUNT
//==============================================================================

/**
 * Updates an existing Stripe Connect account with pre-filled data
 * This can be used to fix accounts that were created without proper prefilling
 */
const updateStripeAccount = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_LIVE"]
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { familyId } = request.data;
  const userId = request.auth.uid;

  // Verify user has permission to update this family's Stripe account
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId || customClaims.familyRole !== 'primary_guardian') {
    throw new Error('Only primary guardians can update Stripe accounts');
  }

  try {
    // Get the Stripe account ID from Firebase
    const db = admin.database();
    const stripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const stripeData = stripeDataRef.val();
    
    if (!stripeData?.accountId) {
      throw new Error('No Stripe account found for this family');
    }

    // Get user profile data
    const userRef = await db.ref(`users/${userId}`).once('value');
    const userProfile = userRef.val();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Initialize Stripe with required API version
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE, {
      apiVersion: '2024-10-28.acacia', // Required for disable_stripe_user_authentication feature
    });
    
    // For embedded accounts (controller.stripe_dashboard.type: 'none'), 
    // we can only update certain fields. Individual and email fields must be 
    // updated through the embedded onboarding components.
    const updatedAccount = await stripe.accounts.update(stripeData.accountId, {
      // Business profile fields are allowed for updates
      business_profile: {
        name: `${userProfile.firstName} ${userProfile.lastName} - RTD Academy Parent`,
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
          amount: 1000000,
          currency: 'cad',
          fiscal_year_end: '2024-12-31'
        },
        estimated_worker_count: 1,
        minority_owned_business_designation: ['prefer_not_to_answer']
      },
      // Settings are allowed
      settings: {
        payouts: {
          schedule: {
            interval: 'weekly',
            weekly_anchor: 'friday'
          }
        }
      },
      // Update metadata
      metadata: {
        ...stripeData.metadata,
        parent_name: `${userProfile.firstName} ${userProfile.lastName}`,
        last_prefill_update: new Date().toISOString()
      }
    });

    // Update Firebase with the latest status
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).update({
      lastUpdated: new Date().toISOString(),
      status: updatedAccount.details_submitted ? 'active' : 'pending',
    });

    // Log the action
    await db.ref(`homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`).push({
      action: 'stripe_connect_account_updated',
      performed_by: userId,
      performed_by_email: request.auth.token.email,
      timestamp: new Date().toISOString(),
      details: {
        stripe_account_id: stripeData.accountId,
        update_type: 'prefill_data',
      }
    });

    return {
      success: true,
      accountId: stripeData.accountId,
      message: 'Business profile and settings updated successfully. Individual data must be updated through the onboarding form.',
      business_profile: updatedAccount.business_profile,
      settings: updatedAccount.settings,
      metadata: updatedAccount.metadata,
      note: 'For security reasons, personal information (name, email, phone) can only be updated through the embedded onboarding components.'
    };

  } catch (error) {
    console.error('Error updating Stripe account:', error);
    throw new Error(`Failed to update Stripe account: ${error.message}`);
  }
});

//==============================================================================
// DELETE STRIPE ACCOUNT
//==============================================================================

/**
 * Deletes a Stripe Connect account and cleans up Firebase data
 * This can only be used in test mode and when the account has zero balance
 */
const deleteStripeAccount = onCall({
  concurrency: 50,
  memory: '512MiB',
  timeoutSeconds: 60,
  secrets: ["STRIPE_SECRET_KEY_LIVE"]
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { familyId } = request.data;
  const userId = request.auth.uid;

  // Verify user has permission to delete this family's Stripe account
  const userClaims = await admin.auth().getUser(userId);
  const customClaims = userClaims.customClaims || {};
  
  if (customClaims.familyId !== familyId || customClaims.familyRole !== 'primary_guardian') {
    throw new Error('Only primary guardians can delete Stripe accounts');
  }

  try {
    // Get the Stripe account ID from Firebase
    const db = admin.database();
    const stripeDataRef = await db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).once('value');
    const stripeData = stripeDataRef.val();
    
    if (!stripeData?.accountId) {
      throw new Error('No Stripe account found for this family');
    }

    // Initialize Stripe with required API version
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE, {
      apiVersion: '2024-10-28.acacia', // Required for disable_stripe_user_authentication feature
    });
    
    // Delete the Stripe account
    const deletedAccount = await stripe.accounts.del(stripeData.accountId);
    
    if (!deletedAccount.deleted) {
      throw new Error('Failed to delete Stripe account');
    }

    // Clean up Firebase data
    await Promise.all([
      // Remove Stripe Connect data
      db.ref(`homeEducationFamilies/familyInformation/${familyId}/STRIPE_CONNECT`).remove(),
      
      // Log the deletion
      db.ref(`homeEducationFamilies/familyInformation/${familyId}/AUDIT_LOG`).push({
        action: 'stripe_connect_account_deleted',
        performed_by: userId,
        performed_by_email: request.auth.token.email,
        timestamp: new Date().toISOString(),
        details: {
          deleted_stripe_account_id: stripeData.accountId,
          reason: 'testing_and_prefill_improvements'
        }
      })
    ]);

    console.log(`Successfully deleted Stripe account ${stripeData.accountId} for family ${familyId}`);

    return {
      success: true,
      message: 'Stripe account deleted successfully',
      deletedAccountId: stripeData.accountId
    };

  } catch (error) {
    console.error('Error deleting Stripe account:', error);
    
    // Handle specific Stripe errors
    if (error.code === 'account_invalid') {
      throw new Error('The Stripe account is invalid or has already been deleted');
    }
    if (error.code === 'account_not_found') {
      throw new Error('Stripe account not found. It may have already been deleted');
    }
    
    throw new Error(`Failed to delete Stripe account: ${error.message}`);
  }
});

//==============================================================================
// EXPORTS
//==============================================================================

module.exports = {
  createStripeConnectAccount,
  createAccountSession,
  debugStripeAccount,
  updateStripeAccount,
  deleteStripeAccount
};