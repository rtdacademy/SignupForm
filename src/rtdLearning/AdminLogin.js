import React, { useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Alert, AlertDescription } from "../components/ui/alert";

const RTDLearningAdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const db = getDatabase();

  // Check if email is an RTD Learning admin email
  const isRTDLearningAdmin = (email) => {
    if (typeof email !== 'string') return false;
    const sanitized = sanitizeEmail(email);
    return sanitized.endsWith("@rtdlearning.com");
  };

  // Convert Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (error) => {
    const errorMessages = {
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
      'auth/cancelled-popup-request': 'Sign-in process was interrupted. Please try again.',
      'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact support.',
      'auth/network-request-failed': 'Connection problem. Please check your internet and try again.',
      'auth/internal-error': 'An unexpected error occurred. Please try again later.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    };
    
    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  const ensureAdminUserData = async (user) => {
    if (!user || !isRTDLearningAdmin(user.email)) return false;
    
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
          type: "rtd_learning_admin",
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0]?.providerId || 'google.com',
          emailVerified: user.emailVerified,
          isRTDLearningAdmin: true
        };
        await set(userRef, userData);
      } else {
        const existingData = snapshot.val();
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now(),
          emailVerified: user.emailVerified,
          type: "rtd_learning_admin",
          isRTDLearningAdmin: true
        });
      }
      return true;
    } catch (error) {
      console.error("Error ensuring admin user data:", error);
      return true; // Allow user to continue even if database write fails
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        setError("Unable to retrieve email from Google. Please try again.");
        await auth.signOut();
        return;
      }

      if (!isRTDLearningAdmin(user.email)) {
        await auth.signOut();
        setError("Access denied. This login is only for RTD Learning administrators with @rtdlearning.com email addresses.");
        return;
      }

      await ensureAdminUserData(user);
      navigate("/rtd-learning-admin-dashboard");
      
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
          Sign in with your RTD Learning administrator account
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
                Only RTD Learning administrators with @rtdlearning.com email addresses can access this portal.
              </p>
            </div>

            <div>
              <button
                onClick={handleGoogleSignIn}
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
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google logo"
                    />
                    <span>Sign in with Google</span>
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