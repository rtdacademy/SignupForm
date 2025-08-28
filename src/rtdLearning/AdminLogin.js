import React, { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, microsoftProvider } from "../firebase";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../context/AuthContext";

const RTDLearningAdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, isRTDLearningAdmin } = useAuth();

  const db = getDatabase();
  
  // Check authentication on mount
  useEffect(() => {
    if (currentUser && isRTDLearningAdmin) {
      navigate('/rtd-learning-admin-dashboard');
    }
  }, [currentUser, isRTDLearningAdmin, navigate]);

  // Convert Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (error) => {
    const errorMessages = {
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
      'auth/cancelled-popup-request': 'Sign-in process was interrupted. Please try again.',
      'auth/operation-not-allowed': 'Microsoft sign-in is not enabled. Please contact support.',
      'auth/network-request-failed': 'Connection problem. Please check your internet and try again.',
      'auth/internal-error': 'An unexpected error occurred. Please try again later.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    };
    
    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  const ensureAdminUserData = async (user) => {
    if (!user) return false;
    
    const uid = user.uid;
    const userRef = ref(db, `users/${uid}`);
    
    try {
      const snapshot = await get(child(ref(db), `users/${uid}`));
      const sanitizedEmail = sanitizeEmail(user.email);
      
      if (!snapshot.exists()) {
        const userData = {
          uid: uid,
          email: user.email,
          sanitizedEmail: sanitizedEmail,
          type: "staff",
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0]?.providerId || 'microsoft.com',
          emailVerified: user.emailVerified
        };
        await set(userRef, userData);
      } else {
        const existingData = snapshot.val();
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now(),
          emailVerified: user.emailVerified,
          type: "staff"
        });
      }
      return true;
    } catch (error) {
      console.error("Error ensuring admin user data:", error);
      return true; // Allow user to continue even if database write fails
    }
  };

  const handleMicrosoftSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const user = result.user;

      if (!user.email) {
        setError("Unable to retrieve email from Microsoft. Please try again.");
        await auth.signOut();
        return;
      }

      // First ensure user data in database
      await ensureAdminUserData(user);
      
      // Force token refresh to get the latest claims
      try {
        const tokenResult = await user.getIdTokenResult(true); // Force refresh
        const hasRTDLearningAdmin = tokenResult.claims?.isRTDLearningAdmin === true;
        
        if (!hasRTDLearningAdmin) {
          await auth.signOut();
          setError("Access denied. This login is only for authorized RTD Learning administrators.");
          return;
        }
        
        // User has the right permissions, the useEffect will handle navigation
        // once AuthContext updates with the new claims
      } catch (error) {
        console.error("Error checking admin claims:", error);
      }
      
    } catch (error) {
      console.error("Admin sign-in error:", error);
      setError(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img
            className="h-20 w-auto"
            src="https://rtdlearning.com/cdn/shop/files/RTD_FINAL_LOGO.png?v=1727549428&width=160"
            alt="RTD Learning"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-center text-green-600">RTD Learning</h1>
        <h2 className="mt-2 text-center text-xl font-bold text-gray-900">Admin Portal</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in with your authorized RTD Learning administrator account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6">
              <Alert variant="destructive" className="border-red-500 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Administrator Access</h3>
              <p className="mt-2 text-sm text-gray-600">
                Only authorized RTD Learning administrators (kyle@rtdacademy.com, stan@rtdacademy.com, or marc@rtdacademy.com) can access this portal.
              </p>
            </div>

            <div>
              <button
                onClick={handleMicrosoftSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <img
                      className="h-6 w-6 mr-3"
                      src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                      alt="Microsoft logo"
                    />
                    <span>Sign in with Microsoft</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to use this portal in accordance with RTD Learning policies.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm space-y-2">
            <p className="text-gray-600">
              <strong>Student Portal:</strong>{" "}
              <a href="/rtd-learning-login" className="text-green-600 hover:text-green-700 underline">
                RTD Learning Student Login
              </a>
            </p>
            <p className="text-gray-600">
              <strong>Staff Portal:</strong>{" "}
              <a href="/staff-login" className="text-blue-600 hover:text-blue-700 underline">
                RTD Academy Staff Login
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} RTD Learning. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RTDLearningAdminLogin;