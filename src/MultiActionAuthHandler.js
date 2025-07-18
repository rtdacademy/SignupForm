import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, applyActionCode, verifyPasswordResetCode, confirmPasswordReset, fetchSignInMethodsForEmail } from "firebase/auth";

function MultiActionAuthHandler() {
  const [status, setStatus] = useState('Processing...');
  const [mode, setMode] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [signInMethods, setSignInMethods] = useState([]);
  const [canResetPassword, setCanResetPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const actionMode = urlParams.get('mode');
    const actionCode = urlParams.get('oobCode');

    console.log("URL Parameters:", { mode: actionMode, hasCode: !!actionCode });
    setMode(actionMode);

    if (actionCode) {
      handleAuthAction(actionMode, actionCode);
    } else {
      setStatus('Invalid action link.');
    }
  }, [location]);

  const handleAuthAction = async (mode, actionCode) => {
    const auth = getAuth();
    console.log("Handling auth action:", { mode, auth: !!auth });

    try {
      switch (mode) {
        case 'verifyEmail':
          console.log("Starting email verification process");
          
          try {
            // Apply the verification code first
            const result = await applyActionCode(auth, actionCode);
            console.log("Action code applied successfully:", result);
            
            // After successful verification, set status and redirect
            setStatus('Email verified successfully! You can now sign in.');
            console.log("Verification complete, redirecting to login");
            
            // Check which portal this verification is for by looking at localStorage flags
            const isParentVerification = localStorage.getItem('parentPortalSignup') === 'true';
            const isRtdConnectVerification = localStorage.getItem('rtdConnectPortalSignup') === 'true';
            
            let redirectUrl;
            if (isRtdConnectVerification) {
              redirectUrl = 'https://rtd-connect.com/login';
            } else if (isParentVerification) {
              redirectUrl = 'https://yourway.rtdacademy.com/parent-login';
            } else {
              redirectUrl = 'https://yourway.rtdacademy.com/login';
            }
            
            setTimeout(() => {
              // Use window.location.href for external redirects
              window.location.href = redirectUrl;
            }, 3000);
          } catch (verificationError) {
            console.error("Email verification error:", verificationError);
            throw verificationError; // Re-throw to be caught by outer catch block
          }
          break;

        case 'resetPassword':
          console.log("Starting password reset verification");
          try {
            const email = await verifyPasswordResetCode(auth, actionCode);
            console.log("Reset code verified for email:", email);
            
            const methods = await fetchSignInMethodsForEmail(auth, email);
            console.log("Available sign-in methods:", methods);
            setSignInMethods(methods);
            
            if (methods.length === 0 || methods.includes('password')) {
              setStatus('Password reset code verified. Please enter a new password.');
              setCanResetPassword(true);
            } else {
              setStatus('This account uses external authentication (Google or Microsoft). You cannot reset its password here.');
              setCanResetPassword(false);
            }
          } catch (resetError) {
            console.error("Password reset verification error:", resetError);
            throw resetError;
          }
          break;

        default:
          console.log("Invalid action mode:", mode);
          setStatus('Invalid action mode.');
      }
    } catch (error) {
      console.error("Error processing auth action:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        mode,
      });
      
      switch (error.code) {
        case 'auth/invalid-action-code':
          setStatus('The verification link has expired or already been used. Please request a new one.');
          break;
        case 'auth/user-disabled':
          setStatus('This account has been disabled. Please contact support.');
          break;
        case 'auth/user-not-found':
          setStatus('Account not found. Please sign up first.');
          break;
        case 'auth/invalid-email':
          setStatus('Invalid email address. Please check the link and try again.');
          break;
        default:
          setStatus(`Action processing failed: ${error.message}. Please try again or contact support.`);
      }
    }
  };

  const handlePasswordReset = async () => {
    const urlParams = new URLSearchParams(location.search);
    const actionCode = urlParams.get('oobCode');
    
    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{7,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError("Password must be at least 7 characters long and include at least one number and one symbol.");
      return;
    }
    
    try {
      const auth = getAuth();
      // This is the critical missing line that confirms the password reset
      await confirmPasswordReset(auth, actionCode, newPassword);
      
      setStatus('Password reset successful! You can now sign in with your new password.');
      
      // Check which portal this password reset is for by looking at localStorage flags
      const isParentReset = localStorage.getItem('parentPortalSignup') === 'true';
      const isRtdConnectReset = localStorage.getItem('rtdConnectPortalSignup') === 'true';
      
      let redirectUrl;
      if (isRtdConnectReset) {
        redirectUrl = 'https://rtd-connect.com/login';
      } else if (isParentReset) {
        redirectUrl = 'https://yourway.rtdacademy.com/parent-login';
      } else {
        redirectUrl = 'https://yourway.rtdacademy.com/login';
      }
      
      setTimeout(() => {
        // Use window.location.href for external redirects
        window.location.href = redirectUrl;
      }, 3000);
    } catch (error) {
      console.error("Error confirming password reset:", error);
      switch (error.code) {
        case 'auth/weak-password':
          setPasswordError("The password is too weak. Please choose a stronger password.");
          break;
        case 'auth/invalid-action-code':
          setStatus('The reset link has expired or already been used. Please request a new one.');
          break;
        default:
          setStatus(`Failed to reset password: ${error.message}. Please try again.`);
      }
    }
  };

  // Check which portal this is for to show appropriate branding
  const isRtdConnectPortal = localStorage.getItem('rtdConnectPortalSignup') === 'true';
  
  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      isRtdConnectPortal ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50' : 'bg-gray-100'
    }`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {isRtdConnectPortal ? (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <img 
              src="/connectImages/Connect.png" 
              alt="RTD Connect Logo"
              className="h-16 w-auto"
            />
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                RTD Connect
              </h1>
              <p className="text-lg text-gray-600 font-medium">Home Education Portal</p>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-extrabold text-center text-primary">RTD Academy</h1>
        )}
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === 'verifyEmail' ? 'Email Verification' : 'Password Reset'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-center text-2xl font-bold text-gray-900">
                {mode === 'verifyEmail' ? 'Verify Your Email' : 'Reset Your Password'}
              </h2>
            </div>

            {mode === 'resetPassword' && canResetPassword ? (
              <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                    required
                    className={`mt-1 block w-full border ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                    placeholder="Enter new password"
                  />
                  {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className={`text-lg ${status.includes('successfully') ? 'text-green-600' : 'text-gray-700'}`}>
                  {status}
                </p>
                {status.includes('successfully') && (
                  <p className="mt-2 text-sm text-gray-500">
                    You will be redirected to the login page shortly.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {isRtdConnectPortal ? 'RTD Connect - Home Education Portal' : 'RTD Math Academy'}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MultiActionAuthHandler;