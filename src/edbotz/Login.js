import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, microsoftProvider } from '../firebase';
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

  const handleProviderSignIn = async (provider) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createOrUpdateUser(result.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(`Failed to sign in with ${provider.providerId}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

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
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleProviderSignIn(microsoftProvider)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <img
                src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                alt="Microsoft"
                className="w-5 h-5"
              />
              <span>Continue with Microsoft</span>
            </button>
          </div>

          {loading && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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