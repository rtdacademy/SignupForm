import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { auth, microsoftProvider } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { sanitizeEmail } from "../utils/sanitizeEmail";
import { useStaffClaims } from "../customClaims/useStaffClaims";
import { isStaffEmail } from "../customClaims/staffPermissions";

const StaffLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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

  // Reset login state when component mounts
  useEffect(() => {
    return () => {
      // Clear login state when component unmounts
      setIsLoggingIn(false);
    };
  }, []);

  const signInWithMicrosoft = async () => {
    // Prevent multiple login attempts
    if (isLoggingIn || isApplyingClaims) return;
    
    setError(null);
    setIsLoggingIn(true);
    
    try {
      // Force a small delay to ensure any previous auth operations have completed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await signInWithPopup(auth, microsoftProvider);
      const user = result.user;
      
      // Check if user has a staff email domain
      if (isStaffEmail(user.email)) {
        console.log("Staff email detected, applying custom claims:", user.email);
        
        // Check and apply staff claims
        const staffClaims = await checkAndApplyStaffClaims();
        
        if (staffClaims && staffClaims.staffPermissions && staffClaims.staffPermissions.length > 0) {
          console.log("Successfully applied staff claims:", staffClaims);
          console.log("Signed in staff:", user.displayName, "with permissions:", staffClaims.staffPermissions);
          
          // Navigate to appropriate dashboard based on email domain
          const finalRedirectTo = (user.email.endsWith('@rtd-connect.com') || user.email === 'kyle@rtdacademy.com') 
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
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      setError("Failed to sign in. Please try again.");
      await auth.signOut();
      setIsLoggingIn(false);
    }
  };

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
                disabled={isLoggingIn || loading || claimsLoading || isApplyingClaims}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  (isLoggingIn || loading || claimsLoading || isApplyingClaims) ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoggingIn || isApplyingClaims ? (
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