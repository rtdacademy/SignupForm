import React, { useState, useEffect, createContext, useContext } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
  ConnectAccountManagement,
  ConnectNotificationBanner,
  ConnectPayouts,
} from '@stripe/react-connect-js';
import { CreditCard, CheckCircle2, AlertCircle, Shield, Loader2, ArrowRight, ExternalLink, Settings } from 'lucide-react';

// Global Connect instance management
let globalConnectInstance = null;
let globalConnectPromise = null;
let currentFamilyId = null;

// Helper function to create fetchClientSecret function
const createFetchClientSecret = (familyId) => {
  return async () => {
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const createSession = httpsCallable(functions, 'createAccountSession');
      
      const result = await createSession({
        familyId: familyId,
        components: ['notification_banner', 'account_management', 'account_onboarding', 'payouts']
      });

      if (result.data.success) {
        return result.data.clientSecret;
      } else {
        throw new Error('Failed to create account session');
      }
    } catch (error) {
      console.error('Error in fetchClientSecret:', error);
      throw error;
    }
  };
};

// Helper function to get or create the global Connect instance
const getConnectInstance = async (familyId) => {
  // If family changed, reset the instance
  if (currentFamilyId !== familyId) {
    globalConnectInstance = null;
    globalConnectPromise = null;
    currentFamilyId = familyId;
  }

  // If we already have an instance for this family, return it
  if (globalConnectInstance) {
    return globalConnectInstance;
  }

  // If we're already initializing, wait for that promise
  if (globalConnectPromise) {
    return globalConnectPromise;
  }

  // Initialize once and cache the promise
  globalConnectPromise = loadConnectAndInitialize({
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    fetchClientSecret: createFetchClientSecret(familyId),
  });

  try {
    globalConnectInstance = await globalConnectPromise;
    return globalConnectInstance;
  } catch (error) {
    // Reset on error so we can retry
    globalConnectInstance = null;
    globalConnectPromise = null;
    throw error;
  }
};

// Individual component wrappers
export const EmbeddedAccountOnboarding = ({ 
  familyId, 
  onExit = () => {},
  className = "" 
}) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setError('Family ID is required');
      setLoading(false);
      return;
    }

    const initializeStripe = async () => {
      try {
        const instance = await getConnectInstance(familyId);
        setStripeConnectInstance(instance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize Stripe Connect:', err);
        setError('Failed to load Stripe Connect');
        setLoading(false);
      }
    };

    initializeStripe();
  }, [familyId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-500" />
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (error || !stripeConnectInstance) {
    return (
      <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error || 'Failed to load onboarding'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountOnboarding onExit={onExit} />
      </ConnectComponentsProvider>
    </div>
  );
};

export const EmbeddedAccountManagement = ({ 
  familyId, 
  className = "" 
}) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setError('Family ID is required');
      setLoading(false);
      return;
    }

    const initializeStripe = async () => {
      try {
        const instance = await getConnectInstance(familyId);
        setStripeConnectInstance(instance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize Stripe Connect:', err);
        setError('Failed to load Stripe Connect');
        setLoading(false);
      }
    };

    initializeStripe();
  }, [familyId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-gray-600">Loading account management...</p>
        </div>
      </div>
    );
  }

  if (error || !stripeConnectInstance) {
    return (
      <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error || 'Failed to load account management'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountManagement />
      </ConnectComponentsProvider>
    </div>
  );
};

export const EmbeddedNotificationBanner = ({ 
  familyId, 
  className = "" 
}) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return; // No error for notification banner - it's optional
    }

    const initializeStripe = async () => {
      try {
        const instance = await getConnectInstance(familyId);
        setStripeConnectInstance(instance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize Stripe Connect for notification banner:', err);
        // Fail silently for notification banner
        setLoading(false);
      }
    };

    initializeStripe();
  }, [familyId]);

  if (loading || !familyId) {
    return null; // Don't show loading state for notifications
  }

  if (error || !stripeConnectInstance) {
    return null; // Fail silently for notifications
  }

  return (
    <div className={`${className}`}>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectNotificationBanner />
      </ConnectComponentsProvider>
    </div>
  );
};

export const EmbeddedPayouts = ({ 
  familyId, 
  className = "" 
}) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setError('Family ID is required');
      setLoading(false);
      return;
    }

    const initializeStripe = async () => {
      try {
        const instance = await getConnectInstance(familyId);
        setStripeConnectInstance(instance);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize Stripe Connect:', err);
        setError('Failed to load payout information');
        setLoading(false);
      }
    };

    initializeStripe();
  }, [familyId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-500" />
          <p className="text-gray-600">Loading payout information...</p>
        </div>
      </div>
    );
  }

  if (error || !stripeConnectInstance) {
    return (
      <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error || 'Failed to load payout information'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectPayouts />
      </ConnectComponentsProvider>
    </div>
  );
};

// Combined onboarding flow component
export const StripeConnectEmbeddedOnboarding = ({ 
  familyId,
  userProfile,
  onAccountCreated = () => {},
  onOnboardingComplete = () => {},
  existingStripeAccount = null,
  isSubmitting = false,
  error = null
}) => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [createAccountError, setCreateAccountError] = useState(null);
  const [connectedAccountId, setConnectedAccountId] = useState(existingStripeAccount?.accountId || null);
  const [accountSession, setAccountSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Check if we should show onboarding based on existing account status
  const shouldShowOnboarding = connectedAccountId && (!existingStripeAccount || existingStripeAccount?.status !== 'completed');

  const createAccountSession = async (accountId) => {
    setSessionLoading(true);
    try {
      // Call your Firebase function to create account session
      const { httpsCallable } = await import('firebase/functions');
      const { getFunctions } = await import('firebase/functions');
      
      const functions = getFunctions();
      const createSession = httpsCallable(functions, 'createAccountSession');
      
      const result = await createSession({
        familyId: familyId,
        components: ['account_onboarding'] // Create a fresh session for onboarding only
      });

      if (result.data.success) {
        setAccountSession(result.data);
      } else {
        throw new Error('Failed to create account session');
      }
    } catch (err) {
      console.error('Error creating account session:', err);
      
      // Handle session claiming errors
      if (err.message?.includes('already been claimed') || err.message?.includes('account session')) {
        setCreateAccountError('Session expired. Please try refreshing the page.');
      } else {
        setCreateAccountError(err.message || 'Failed to create account session');
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!familyId || !userProfile) {
      setCreateAccountError('Family and user profile information required');
      return;
    }

    setAccountCreatePending(true);
    setCreateAccountError(null);

    try {
      const { httpsCallable } = await import('firebase/functions');
      const { getFunctions } = await import('firebase/functions');
      
      const functions = getFunctions();
      const createAccount = httpsCallable(functions, 'createStripeConnectAccount');
      
      const result = await createAccount({
        familyId: familyId,
        userProfile: userProfile
      });

      if (result.data.success) {
        setConnectedAccountId(result.data.accountId);
        if (onAccountCreated) {
          onAccountCreated(result.data);
        }
        
        // Immediately create account session for onboarding
        await createAccountSession(result.data.accountId);
      } else {
        throw new Error('Failed to create Stripe account');
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setCreateAccountError(error.message || 'Failed to create Stripe account');
    } finally {
      setAccountCreatePending(false);
    }
  };

  const handleOnboardingExit = () => {
    console.log('Onboarding exited');
    if (onOnboardingComplete) {
      onOnboardingComplete();
    }
  };

  // If we have a connected account but no session, create one
  useEffect(() => {
    if (connectedAccountId && shouldShowOnboarding && !accountSession && !sessionLoading) {
      createAccountSession(connectedAccountId);
    }
  }, [connectedAccountId, shouldShowOnboarding, accountSession, sessionLoading]);

  if (!familyId) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center text-gray-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Family information required to set up payouts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Set Up Secure Payouts
          </h3>
          <p className="text-sm text-gray-600">
            Connect your bank account securely through Stripe for direct reimbursement payouts
          </p>
        </div>
      </div>

      {/* Security and Information Notice */}
      <div className="mb-6 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">Bank-level security with Stripe</p>
              <p className="text-blue-700">
                Your financial information is protected with the same security used by major banks. 
                Stripe is trusted by millions of businesses worldwide and is PCI DSS Level 1 certified.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-green-800 font-medium mb-2">Most information is pre-filled for you</p>
              <ul className="text-green-700 space-y-1">
                <li>• Your personal details from your RTD Academy profile</li>
                <li>• Business information is set to RTD Academy's details</li>
                <li>• You'll mainly need to verify identity and add banking details</li>
                <li>• "Business type" and "Professional details" are required by financial regulations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Account Creation Step */}
      {!connectedAccountId && !accountCreatePending && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create a secure Stripe account linked to your family</li>
              <li>• Complete identity verification directly in this page</li>
              <li>• Add your bank account details securely</li>
              <li>• Start receiving reimbursement payouts directly to your bank</li>
              <li>• Track all payouts in your secure dashboard</li>
            </ul>
          </div>

          <button
            onClick={handleCreateAccount}
            disabled={accountCreatePending}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accountCreatePending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Start Secure Setup</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Account Creation Pending */}
      {accountCreatePending && (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-500" />
          <p className="text-gray-600">Creating your secure Stripe account...</p>
        </div>
      )}

      {/* Embedded Onboarding Component */}
      {connectedAccountId && accountSession && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-green-800 font-medium">Account created successfully!</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Complete the verification process below to start receiving payouts.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <EmbeddedAccountOnboarding
              familyId={familyId}
              onExit={handleOnboardingExit}
            />
          </div>
        </div>
      )}

      {/* Loading Session */}
      {connectedAccountId && !accountSession && sessionLoading && (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-gray-600">Setting up verification...</p>
        </div>
      )}

      {/* Error Display */}
      {(error || createAccountError) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-800">
              {error || createAccountError}
            </p>
          </div>
        </div>
      )}

      {/* Help Information */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Need help?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• This process is powered by Stripe, the same technology used by major companies</li>
          <li>• Your banking information is encrypted and never stored on our servers</li>
          <li>• Payouts typically arrive in 1-2 business days after processing</li>
          <li>• You can update your banking information anytime through your dashboard</li>
        </ul>
      </div>
    </div>
  );
};