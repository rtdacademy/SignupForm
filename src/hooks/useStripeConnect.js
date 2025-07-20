import { useState, useEffect } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { getFunctions, httpsCallable } from 'firebase/functions';

export const useStripeConnect = (familyId, componentType = 'account_onboarding') => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (familyId) {
      setLoading(true);
      setError(null);

      const fetchClientSecret = async () => {
        try {
          const functions = getFunctions();
          const createAccountSession = httpsCallable(functions, 'createStripeAccountSession');
          
          const result = await createAccountSession({
            familyId: familyId,
            componentType: componentType
          });

          if (result.data.success) {
            return result.data.client_secret;
          } else {
            throw new Error('Failed to create account session');
          }
        } catch (error) {
          console.error('Error fetching client secret:', error);
          setError(error.message || 'Failed to initialize Stripe Connect');
          throw error;
        }
      };

      const initializeConnect = async () => {
        try {
          const connectInstance = await loadConnectAndInitialize({
            publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
            fetchClientSecret,
            appearance: {
              overlays: "dialog",
              variables: {
                colorPrimary: "#7c3aed", // Purple to match your theme
                colorBackground: "#ffffff",
                colorText: "#374151",
                colorDanger: "#dc2626",
                fontFamily: 'system-ui, -apple-system, sans-serif',
                spacingUnit: "4px",
                borderRadius: "6px",
              },
              rules: {
                '.Tab': {
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                },
                '.Tab--selected': {
                  borderColor: '#7c3aed',
                  backgroundColor: '#f3f4f6',
                },
                '.Input': {
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '8px 12px',
                },
                '.Input:focus': {
                  borderColor: '#7c3aed',
                  boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
                },
                '.Button': {
                  backgroundColor: '#7c3aed',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                '.Button:hover': {
                  backgroundColor: '#6d28d9',
                },
              }
            },
          });

          setStripeConnectInstance(connectInstance);
          setLoading(false);
        } catch (error) {
          console.error('Error initializing Stripe Connect:', error);
          setError(error.message || 'Failed to initialize Stripe Connect');
          setLoading(false);
        }
      };

      initializeConnect();
    } else {
      setStripeConnectInstance(null);
      setError(null);
      setLoading(false);
    }
  }, [familyId, componentType]);

  return { stripeConnectInstance, error, loading };
};

export default useStripeConnect;