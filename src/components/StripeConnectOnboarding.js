import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Shield, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import { useStripeConnect } from '../hooks/useStripeConnect';
import { getFunctions, httpsCallable } from 'firebase/functions';

const StripeConnectOnboarding = ({ 
  familyId,
  userProfile,
  onAccountCreated,
  onOnboardingComplete,
  existingStripeAccount = null,
  isSubmitting = false,
  error = null
}) => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [createAccountError, setCreateAccountError] = useState(null);
  const [connectedAccountId, setConnectedAccountId] = useState(existingStripeAccount?.accountId || null);

  const { stripeConnectInstance, error: connectError, loading: connectLoading } = useStripeConnect(
    connectedAccountId ? familyId : null, 
    'account_onboarding'
  );

  const handleCreateAccount = async () => {
    if (!familyId || !userProfile) {
      setCreateAccountError('Family and user profile information required');
      return;
    }

    setAccountCreatePending(true);
    setCreateAccountError(null);

    try {
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
    setOnboardingExited(true);
    if (onOnboardingComplete) {
      onOnboardingComplete();
    }
  };

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

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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

      {/* Account Creation Step */}
      {!connectedAccountId && !accountCreatePending && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create a secure Stripe account linked to your family</li>
              <li>• Verify your identity and bank account details</li>
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

      {/* Onboarding Flow */}
      {connectedAccountId && !onboardingExited && stripeConnectInstance && (
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

          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <ConnectAccountOnboarding
                onExit={handleOnboardingExit}
              />
            </div>
          </ConnectComponentsProvider>
        </div>
      )}

      {/* Loading State */}
      {connectedAccountId && connectLoading && !stripeConnectInstance && (
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          <p className="text-gray-600">Loading verification form...</p>
        </div>
      )}

      {/* Onboarding Complete */}
      {onboardingExited && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-green-800 font-medium">Setup Complete!</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your account is ready to receive reimbursement payouts. You can access your payout dashboard anytime.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || createAccountError || connectError) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-800">
              {error || createAccountError || connectError}
            </p>
          </div>
        </div>
      )}

      {/* Development Info */}
      {(connectedAccountId || accountCreatePending || onboardingExited) && (
        <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Development Info</h4>
          <div className="text-xs text-gray-600 space-y-1">
            {connectedAccountId && <p>Connected Account ID: <code className="font-mono bg-gray-200 px-1 rounded">{connectedAccountId}</code></p>}
            {accountCreatePending && <p>Creating account...</p>}
            {onboardingExited && <p>Onboarding completed</p>}
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

export default StripeConnectOnboarding;