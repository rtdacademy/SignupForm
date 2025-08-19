import React, { useState, useEffect } from "react";
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { auth, microsoftProvider, isDevelopment } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { sanitizeEmail } from "../utils/sanitizeEmail";
import { useStaffClaims } from "../customClaims/useStaffClaims";
import { isStaffEmail } from "../customClaims/staffPermissions";
import { isMobileDevice, getDeviceType } from '../utils/deviceDetection';

// RTD Logo component
const RTDLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 75 75" 
    className="h-12 w-12"
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
    </g>
  </svg>
);

// Simple auth loading screen component
const AuthLoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex items-end justify-center space-x-3 mb-8">
        <RTDLogo />
        <h1 className="text-3xl font-extrabold text-primary leading-none">RTD Academy</h1>
      </div>
      
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <svg className="animate-spin h-12 w-12 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          
          <div className="text-xs text-gray-500">
            Please wait while we complete your authentication.
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StaffLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [showAuthLoading, setShowAuthLoading] = useState(false);
  const [authLoadingMessage, setAuthLoadingMessage] = useState("Completing your sign-in...");
  const { loading } = useAuth();
  const { 
    isStaff, 
    checkAndApplyStaffClaims, 
    loading: claimsLoading, 
    error: claimsError,
    isApplyingClaims 
  } = useStaffClaims();

  // Get the redirect URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/teacher-dashboard';

  // Handle redirect result from social sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (isDevelopment) {
        console.log('Skipping redirect result check in development');
        setCheckingRedirect(false);
        return;
      }

      try {
        setCheckingRedirect(true);
        console.log('Checking for redirect result in production...');
        
        // Check if we were expecting a redirect
        const authInProgress = sessionStorage.getItem('staffAuthInProgress');
        const authProvider = sessionStorage.getItem('staffAuthProvider');
        
        if (authInProgress) {
          console.log(`Expecting redirect result from ${authProvider}`);
        }
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('Redirect sign-in successful for:', result.user.email);
          
          // Show loading screen immediately
          setShowAuthLoading(true);
          setAuthLoadingMessage("Verifying staff credentials...");
          
          // Clear session storage flags
          sessionStorage.removeItem('staffAuthInProgress');
          sessionStorage.removeItem('staffAuthProvider');
          
          const user = result.user;
          
          if (!user.email) {
            setShowAuthLoading(false);
            setError("Unable to retrieve email from provider. Please try again.");
            return;
          }

          // Check if user has a staff email domain
          if (isStaffEmail(user.email)) {
            console.log("Staff email detected, applying custom claims:", user.email);
            setAuthLoadingMessage("Setting up permissions...");
            
            // Check and apply staff claims
            const staffClaims = await checkAndApplyStaffClaims();
            
            if (staffClaims && staffClaims.staffPermissions && staffClaims.staffPermissions.length > 0) {
              console.log("Successfully applied staff claims:", staffClaims);
              console.log("Signed in staff:", user.displayName, "with permissions:", staffClaims.staffPermissions);
              
              setAuthLoadingMessage("Preparing your dashboard...");
              
              // Navigate to appropriate dashboard based on email domain
              const finalRedirectTo = user.email.endsWith('@rtd-connect.com')
                ? '/home-education-staff' 
                : redirectTo;
              
              // Add a small delay to show the final message, then navigate
              setTimeout(() => {
                setShowAuthLoading(false);
                navigate(finalRedirectTo);
              }, 1000);
            } else {
              setShowAuthLoading(false);
              setError("Failed to apply staff permissions. Please contact support.");
              await auth.signOut();
            }
          } else {
            setShowAuthLoading(false);
            setError(
              <div className="text-center">
                <p className="mb-2">This login page is for RTD Academy staff only.</p>
                <p className="mb-2">Only @rtdacademy.com and @rtd-connect.com email addresses are allowed.</p>
                <p>Students should login at:{" "}
                  <a 
                    href="https://yourway.rtdacademy.com/login" 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    yourway.rtdacademy.com/login
                  </a>
                </p>
              </div>
            );
            await auth.signOut();
          }
        } else if (authInProgress) {
          // We were expecting a redirect but didn't get one - this might indicate an error
          console.log('Expected redirect result but none found');
          setShowAuthLoading(false);
          
          setError("Sign-in process was interrupted or cancelled. Please try again.");
          
          sessionStorage.removeItem('staffAuthInProgress');
          sessionStorage.removeItem('staffAuthProvider');
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        setShowAuthLoading(false);
        
        // Handle specific mobile authentication errors
        if (error.message && error.message.includes('missing initial state')) {
          console.log('Detected missing initial state error - likely storage issue on mobile');
          
          // Clear any stale session data
          sessionStorage.removeItem('staffAuthInProgress');
          sessionStorage.removeItem('staffAuthProvider');
          
          // Provide helpful error message for mobile users
          setError(
            isMobileDevice() 
              ? "Authentication failed due to browser storage restrictions. Please try clearing your browser data or using a different browser."
              : "Authentication failed. Please try again."
          );
        } else if (error.code !== 'auth/redirect-cancelled-by-user' && 
                  error.code !== 'auth/popup-blocked' &&
                  error.code !== 'auth/operation-not-allowed') {
          // Only show error for actual failures, not expected states
          setError("Failed to complete sign-in. Please try again.");
        }
      } finally {
        setCheckingRedirect(false);
      }
    };

    handleRedirectResult();

    // Reset login state when component unmounts
    return () => {
      setIsLoggingIn(false);
    };
  }, [navigate, redirectTo, checkAndApplyStaffClaims]);

  const signInWithMicrosoft = async () => {
    // Prevent multiple login attempts
    if (isLoggingIn || isApplyingClaims || checkingRedirect) return;
    
    setError(null);
    setIsLoggingIn(true);
    
    try {
      if (isDevelopment) {
        // Use popup in development
        console.log('Using popup flow for development');
        
        // Force a small delay to ensure any previous auth operations have completed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await signInWithPopup(auth, microsoftProvider);
        const user = result.user;
        
        if (!user.email) {
          setError("Unable to retrieve email from provider. Please try again.");
          setIsLoggingIn(false);
          return;
        }
        
        // Check if user has a staff email domain
        if (isStaffEmail(user.email)) {
          console.log("Staff email detected, applying custom claims:", user.email);
          
          // Check and apply staff claims
          const staffClaims = await checkAndApplyStaffClaims();
          
          if (staffClaims && staffClaims.staffPermissions && staffClaims.staffPermissions.length > 0) {
            console.log("Successfully applied staff claims:", staffClaims);
            console.log("Signed in staff:", user.displayName, "with permissions:", staffClaims.staffPermissions);
            
            // Navigate to appropriate dashboard based on email domain
            const finalRedirectTo = user.email.endsWith('@rtd-connect.com')
              ? '/home-education-staff' 
              : redirectTo;
              
            setTimeout(() => {
              navigate(finalRedirectTo);
              setIsLoggingIn(false);
            }, 1000);
          } else {
            setError("Failed to apply staff permissions. Please contact support.");
            await auth.signOut();
            setIsLoggingIn(false);
          }
        } else {
          setError(
            <div className="text-center">
              <p className="mb-2">This login page is for RTD Academy staff only.</p>
              <p className="mb-2">Only @rtdacademy.com and @rtd-connect.com email addresses are allowed.</p>
              <p>Students should login at:{" "}
                <a 
                  href="https://yourway.rtdacademy.com/login" 
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  yourway.rtdacademy.com/login
                </a>
              </p>
            </div>
          );
          await auth.signOut();
          setIsLoggingIn(false);
        }
      } else {
        // Use redirect in production
        console.log('Using redirect flow for production');
        
        // Store a flag to indicate we're expecting a redirect
        sessionStorage.setItem('staffAuthInProgress', 'true');
        sessionStorage.setItem('staffAuthProvider', 'microsoft.com');
        
        await signInWithRedirect(auth, microsoftProvider);
        // User will be redirected away, so we won't reach here
      }
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      
      // Handle popup blocked error specifically for development
      if (isDevelopment && error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      
      await auth.signOut();
      setIsLoggingIn(false);
    }
  };

  // Show auth loading screen if we're processing authentication
  if (showAuthLoading) {
    return <AuthLoadingScreen message={authLoadingMessage} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-primary">RTD Math Academy</h1>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-md mx-auto">
          Staff Portal - Course Management & Administration
        </p>
        <p className="mt-1 text-center text-xs text-green-600 max-w-md mx-auto">
          RTD Connect facilitators welcome
        </p>
        {!isDevelopment && (
          <p className="mt-2 text-center text-xs text-blue-600 bg-blue-50 p-2 rounded max-w-md mx-auto">
            You'll be redirected to sign in securely with Microsoft
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-center text-2xl font-bold text-gray-900">Staff Sign In</h2>
            </div>
            <div>
              <button
                onClick={signInWithMicrosoft}
                disabled={isLoggingIn || loading || claimsLoading || isApplyingClaims || checkingRedirect}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  (isLoggingIn || loading || claimsLoading || isApplyingClaims || checkingRedirect) ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {checkingRedirect ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking authentication...
                  </>
                ) : isLoggingIn || isApplyingClaims ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isApplyingClaims ? "Setting up permissions..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    <img 
                      src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png" 
                      alt="Microsoft logo" 
                      className="h-5 w-5 mr-2"
                    />
                    Sign in with Microsoft
                  </>
                )}
              </button>
            </div>
            {(error || claimsError) && (
              <div className="mt-2 text-sm text-red-600">
                {error || claimsError}
              </div>
            )}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">Are you a student?</p>
              <button 
                onClick={async () => {
                  // Sign out any existing auth and then navigate
                  try {
                    if (auth.currentUser) {
                      await auth.signOut();
                    }
                    navigate("/login");
                  } catch (error) {
                    console.error("Error signing out:", error);
                    navigate("/login");
                  }
                }}
                className="font-medium text-secondary hover:text-secondary-dark block w-full text-center"
              >
                Go to Student Login →
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} RTD Math Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StaffLogin;