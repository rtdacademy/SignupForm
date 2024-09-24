import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, applyActionCode, verifyPasswordResetCode, confirmPasswordReset, fetchSignInMethodsForEmail } from "firebase/auth";

function MultiActionAuthHandler() {
  const [status, setStatus] = useState('Processing...');
  const [mode, setMode] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [signInMethods, setSignInMethods] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const actionMode = urlParams.get('mode');
    const actionCode = urlParams.get('oobCode');

    setMode(actionMode);

    if (actionCode) {
      handleAuthAction(actionMode, actionCode);
    } else {
      setStatus('Invalid action link.');
    }
  }, [location]);

  const handleAuthAction = async (mode, actionCode) => {
    const auth = getAuth();

    try {
      switch (mode) {
        case 'verifyEmail':
          await applyActionCode(auth, actionCode);
          setStatus('Email verified successfully!');
          setTimeout(() => navigate('/login'), 3000);
          break;
        case 'resetPassword':
          await verifyPasswordResetCode(auth, actionCode);
          const email = await verifyPasswordResetCode(auth, actionCode);
          const methods = await fetchSignInMethodsForEmail(auth, email);
          setSignInMethods(methods);
          if (methods.includes('password')) {
            setStatus('Password reset code verified. Please enter a new password.');
          } else {
            setStatus('This account uses external authentication (Google or Microsoft). You cannot reset its password here.');
          }
          break;
        default:
          setStatus('Invalid action mode.');
      }
    } catch (error) {
      console.error("Error processing auth action", error);
      setStatus('Action processing failed. Please try again.');
    }
  };

  const validatePassword = (password) => {
    const minLength = 7;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 7 characters long.';
    }
    if (!hasNumber) {
      return 'Password must include at least one number.';
    }
    if (!hasSymbol) {
      return 'Password must include at least one symbol.';
    }
    return null;
  };

  const handlePasswordReset = async () => {
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    const auth = getAuth();
    const actionCode = new URLSearchParams(location.search).get('oobCode');

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setStatus('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error("Error resetting password", error);
      setStatus('Password reset failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-primary">RTD Academy</h1>
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

            {mode === 'resetPassword' && signInMethods.includes('password') ? (
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
        <p>&copy; {new Date().getFullYear()} RTD Math Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MultiActionAuthHandler;