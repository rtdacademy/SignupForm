import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, microsoftProvider, isDevelopment } from '../firebase';
import { createOrUpdateUser } from './utils/userSetup';
import { Loader2 } from 'lucide-react';

// Keep existing component definitions
const CircuitLine = ({ className = '' }) => (
  <div className={`absolute bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse ${className}`} />
);

const FloatingGear = ({ size = 'lg', position, rotation = 0 }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div 
      className={`absolute ${sizeClasses[size]} animate-float opacity-10`}
      style={{ ...position }}
    >
      <svg 
        viewBox="0 0 24 24" 
        className={`w-full h-full transform rotate-${rotation} animate-spin-slow`}
      >
        <path 
          fill="currentColor" 
          d="M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-2 12a10 10 0 0 1-8-8h3a7 7 0 0 0 6 6v2m4 0v-2a7 7 0 0 0 6-6h3a10 10 0 0 1-8 8m8-16a10 10 0 0 1 0 16h-3a7 7 0 0 0 0-12h3M2 12a10 10 0 0 1 8-8v2a7 7 0 0 0-6 6H2z"
        />
      </svg>
    </div>
  );
};

const EdBotzLogo = () => (
  <div className="relative w-32 h-32 mx-auto mb-8">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl transform rotate-3 opacity-20 animate-pulse" />
    <div className="relative flex items-center justify-center h-full">
      <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        EdBotz
      </span>
    </div>
  </div>
);

const EdBotzLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  // Convert Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (error) => {
    const errorMessages = {
      'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email. Try signing in with a different method.',
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
      'auth/cancelled-popup-request': 'Sign-in process was interrupted. Please try again.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please try another method.',
      'auth/network-request-failed': 'Connection problem. Please check your internet and try again.',
      'auth/internal-error': 'An unexpected error occurred. Please try again later.',
    };

    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  // Handle redirect result on component mount (only in production)
  useEffect(() => {
    const handleRedirectResult = async () => {
      // Skip redirect check in development since we're using popup
      if (isDevelopment) {
        console.log('Skipping redirect result check in development');
        setCheckingRedirect(false);
        return;
      }

      try {
        console.log('Checking for redirect result in production...');
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('Redirect sign-in successful for:', result.user.email);
          setLoading(true);
          await createOrUpdateUser(result.user);
          navigate("/dashboard");
        }
      } catch (error) {
        if (error.code && error.code !== 'auth/popup-blocked' &&
            error.code !== 'auth/redirect-cancelled-by-user') {
          console.error("Redirect sign-in error:", error);
          setError(getFriendlyErrorMessage(error));
        }
      } finally {
        setCheckingRedirect(false);
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const handleProviderSignIn = async (provider) => {
    setError(null);
    setLoading(true);

    try {
      if (isDevelopment) {
        // Use popup in development to avoid cross-domain issues
        console.log('Using popup flow for development');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user.email) {
          setError("Unable to retrieve email from provider. Please try again.");
          setLoading(false);
          return;
        }

        await createOrUpdateUser(user);
        navigate("/dashboard");
      } else {
        // Use redirect in production
        console.log('Using redirect flow for production');
        localStorage.setItem('edbotz_auth_provider', provider.providerId);
        await signInWithRedirect(auth, provider);
        // Loading state will persist through redirect
      }
    } catch (error) {
      console.error("Sign-in error:", error);

      // Handle popup blocked error specifically for development
      if (isDevelopment && error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(getFriendlyErrorMessage(error));
      }
      setLoading(false);
    }
  };

  // Show loading state while checking for redirect result
  if (checkingRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center items-center px-4">
      {/* Background Elements */}
      <CircuitLine className="h-0.5 w-96 top-1/4 -left-24 opacity-40" />
      <CircuitLine className="h-0.5 w-72 bottom-1/3 -right-12 opacity-30" />
      <CircuitLine className="w-0.5 h-96 -top-24 right-1/3 opacity-20" />
      
      <FloatingGear size="xl" position={{ top: '10%', right: '15%' }} rotation={45} />
      <FloatingGear size="lg" position={{ bottom: '20%', left: '10%' }} rotation={90} />
      <FloatingGear size="md" position={{ top: '30%', left: '20%' }} rotation={0} />
      <FloatingGear size="sm" position={{ bottom: '30%', right: '25%' }} rotation={180} />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200/50">
          <EdBotzLogo />
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to EdBotz</h1>
            <p className="text-gray-600">Sign in to access your AI-powered learning platform</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleProviderSignIn(googleProvider)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>{loading ? (isDevelopment ? 'Signing in...' : 'Redirecting...') : 'Continue with Google'}</span>
            </button>

            <button
              onClick={() => handleProviderSignIn(microsoftProvider)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                alt="Microsoft"
                className="w-5 h-5"
              />
              <span>{loading ? (isDevelopment ? 'Signing in...' : 'Redirecting...') : 'Continue with Microsoft'}</span>
            </button>
          </div>

          {loading && !isDevelopment && (
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Redirecting to sign in...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 text-sm bg-red-50 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>By continuing, you agree to EdBotz's Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdBotzLogin;