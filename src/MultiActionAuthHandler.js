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
  const [showSiteSelection, setShowSiteSelection] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const actionMode = urlParams.get('mode');
    const actionCode = urlParams.get('oobCode');
    const continueUrl = urlParams.get('continueUrl');

    console.log("URL Parameters:", { mode: actionMode, hasCode: !!actionCode, continueUrl });
    setMode(actionMode);

    if (actionCode) {
      handleAuthAction(actionMode, actionCode, continueUrl);
    } else {
      setStatus('Invalid action link.');
    }
  }, [location]);

  const handleAuthAction = async (mode, actionCode, continueUrl) => {
    const auth = getAuth();
    console.log("Handling auth action:", { mode, auth: !!auth, continueUrl });

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
            
            let redirectUrl = null;
            let shouldShowSelection = false;
            
            // First, check if we have a continueUrl from the email link
            if (continueUrl) {
              try {
                const url = new URL(continueUrl);
                // Validate that the URL is from an allowed domain
                const allowedDomains = [
                  'rtd-connect.com',
                  'rtd-connect.web.app',
                  'yourway.rtdacademy.com',
                  'rtdacademy.web.app',
                  'localhost'
                ];
                
                if (allowedDomains.some(domain => url.hostname.includes(domain))) {
                  redirectUrl = continueUrl;
                  console.log("Using continueUrl from email link:", redirectUrl);
                } else {
                  console.warn("Invalid continueUrl domain, will show site selection");
                  shouldShowSelection = true;
                }
              } catch (urlError) {
                console.error("Error parsing continueUrl:", urlError);
                shouldShowSelection = true;
              }
            }
            
            // If we don't have a valid redirectUrl yet, try localStorage
            if (!redirectUrl && !shouldShowSelection) {
              const isParentVerification = localStorage.getItem('parentPortalSignup') === 'true';
              const isRtdConnectVerification = localStorage.getItem('rtdConnectPortalSignup') === 'true';
              
              if (isRtdConnectVerification) {
                redirectUrl = 'https://rtd-connect.com/login';
              } else if (isParentVerification) {
                redirectUrl = 'https://yourway.rtdacademy.com/parent-login';
              } else {
                // No clear indication of which portal - show selection
                console.log("No clear portal indication, showing site selection");
                shouldShowSelection = true;
              }
            }
            
            if (shouldShowSelection) {
              // Show site selection interface
              setShowSiteSelection(true);
            } else {
              // Redirect to the determined URL
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 3000);
            }
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
      
      setStatus('Password reset successful!');
      // Always show site selection after password reset
      setShowSiteSelection(true);
      
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

            {showSiteSelection ? (
              // Enhanced site selection interface
              <div className="space-y-6">
                {/* Success message for password reset */}
                {mode === 'resetPassword' && status.includes('successful') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Password successfully updated!
                        </h3>
                        <p className="mt-1 text-xs text-green-700">
                          Your new password will work for all RTD portals where you have an account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success message for email verification */}
                {mode === 'verifyEmail' && status.includes('successfully') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Email verified successfully!
                        </h3>
                        <p className="mt-1 text-xs text-green-700">
                          You can now sign in to your account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Select Your Portal
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose the portal that matches your needs:
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* RTD Connect - Home Education Portal */}
                  <button
                    onClick={() => window.location.href = 'https://rtd-connect.com/login'}
                    className="w-full group relative overflow-hidden border-2 border-gray-200 rounded-xl hover:border-purple-400 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-purple-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-5 text-left">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">RTD Connect</h4>
                          <p className="text-sm font-medium text-purple-600 mb-2">Home Education Portal</p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Manage your family's home education program, submit reimbursements, and access support services
                          </p>
                          <p className="text-xs text-gray-500 mt-2 italic">
                            For: Parents and guardians
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* RTD Academy - Student Portal */}
                  <button
                    onClick={() => window.location.href = 'https://yourway.rtdacademy.com/login'}
                    className="w-full group relative overflow-hidden border-2 border-gray-200 rounded-xl hover:border-teal-400 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-5 text-left">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">RTD Academy</h4>
                          <p className="text-sm font-medium text-teal-600 mb-2">Student Learning Portal</p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Access your courses, complete assignments, view grades, and track your educational progress
                          </p>
                          <p className="text-xs text-gray-500 mt-2 italic">
                            For: Students enrolled in courses
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Parent Portal - Progress Monitoring */}
                  <button
                    onClick={() => window.location.href = 'https://yourway.rtdacademy.com/parent-login'}
                    className="w-full group relative overflow-hidden border-2 border-gray-200 rounded-xl hover:border-green-400 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-5 text-left">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">Parent Portal</h4>
                          <p className="text-sm font-medium text-green-600 mb-2">Progress Monitoring</p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Monitor your child's academic progress, view grades, and track course completion
                          </p>
                          <p className="text-xs text-gray-500 mt-2 italic">
                            For: Parents of RTD Academy students
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                
                {/* Info message about unified password */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 text-center">
                    <strong>Note:</strong> If you have accounts in multiple portals, your password works for all of them.
                  </p>
                </div>
                
                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>Not sure which portal to use?</p>
                  <a 
                    href="https://rtdacademy.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Visit our main website for help
                  </a>
                </div>
              </div>
            ) : mode === 'resetPassword' && canResetPassword ? (
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