import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { auth, googleProvider, microsoftProvider } from "../firebase";
import { sanitizeEmail } from '../utils/sanitizeEmail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";

const RTDLearningLogin = ({ hideWelcome = false, startWithSignUp = false, compactView = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState(startWithSignUp ? "signup" : "signin");
  const [message, setMessage] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [signInMethods, setSignInMethods] = useState([]);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isResetingPassword, setIsResetingPassword] = useState(false);

  const db = getDatabase();

  // Convert Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (error) => {
    
    const errorMessages = {
      // Sign in errors
      'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'We couldn\'t find an account with this email. Please check your email or create a new account.',
      'auth/wrong-password': 'The password you entered is incorrect. Please try again.',
      'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later or reset your password.',
      'auth/network-request-failed': 'Connection problem. Please check your internet and try again.',
      
      // Sign up errors
      'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
      'auth/weak-password': 'Your password is too weak. Please use a stronger password with at least 7 characters including numbers and symbols.',
      
      // Social sign-in errors
      'auth/account-exists-with-different-credential': 'An account already exists with this email. Try signing in with a different method.',
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
      'auth/cancelled-popup-request': 'Sign-in process was interrupted. Please try again.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please try another method.',
      
      // Password reset errors
      'auth/expired-action-code': 'The password reset link has expired. Please request a new one.',
      'auth/invalid-action-code': 'The password reset link is invalid or has already been used.',
      'auth/missing-ios-bundle-id': 'An error occurred. Please try again later.',
      'auth/missing-android-pkg-name': 'An error occurred. Please try again later.',
      'auth/missing-continue-uri': 'An error occurred. Please try again later.',
      'auth/invalid-continue-uri': 'An error occurred. Please try again later.',
      'auth/unauthorized-continue-uri': 'An error occurred. Please try again later.',
      
      // General errors
      'auth/internal-error': 'An unexpected error occurred. Please try again later.',
      'auth/requires-recent-login': 'For security reasons, please sign in again before continuing.',
    };
    
    // Return friendly message if available, or a default message
    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  const isStaffEmail = (email) => {
    if (typeof email !== 'string') return false;
    const sanitized = sanitizeEmail(email);
    return sanitized.endsWith("@rtdacademy.com");
  };

  const handleStaffAttempt = () => {
    setError("This email belongs to staff. Redirecting to the staff login page...");
    setTimeout(() => {
      navigate("/staff-login");
    }, 3000);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{7,}$/;

  const validateEmail = (email) => {
    if (emailRegex.test(email.trim())) {
      setEmailError(null);
      return true;
    } else {
      setEmailError("Please enter a valid email address.");
      return false;
    }
  };

  const validatePassword = (password) => {
    if (passwordRegex.test(password)) {
      setPasswordError(null);
      return true;
    } else {
      setPasswordError("Password must be at least 7 characters long and include at least one number and one symbol.");
      return false;
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmailInput(email);
    if (activeTab === "signup") {
      validateEmail(email);
    }
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (activeTab === "signup") {
      validatePassword(pwd);
    }
  };

  const ensureUserData = async (user) => {
    if (!user || !user.emailVerified) return false;
    
    const uid = user.uid;
    const userRef = ref(db, `users/${uid}`);
    
    try {
      const snapshot = await get(child(ref(db), `users/${uid}`));
      if (!snapshot.exists()) {
        const sanitizedEmail = sanitizeEmail(user.email);
        const userData = {
          uid: uid,
          email: user.email,
          sanitizedEmail: sanitizedEmail,
          type: isStaffEmail(user.email) ? "staff" : "student",
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0]?.providerId || 'password',
          emailVerified: user.emailVerified
        };
        await set(userRef, userData);
      } else {
        const existingData = snapshot.val();
        await set(userRef, {
          ...existingData,
          lastLogin: Date.now(),
          emailVerified: user.emailVerified
        });
      }
      return true;
    } catch (error) {
      console.error("Error ensuring user data:", error);
      // Log error but don't throw - allow user to continue
      return true;
    }
  };

  useEffect(() => {
    // Only check and handle verification flag once on initial mount
    const handleVerificationFlag = () => {
      const verificationFlag = localStorage.getItem('verificationEmailSent');
      if (verificationFlag) {
        const email = localStorage.getItem('verificationEmail');
        if (email) {
          setVerificationEmail(email);
          setShowVerificationDialog(true);
        }
        // Always clean up localStorage items, regardless of whether email was found
        localStorage.removeItem('verificationEmailSent');
        localStorage.removeItem('verificationEmail');
      }
    };
    
    handleVerificationFlag();

    // Check for navigation state message
    const state = location?.state;
    if (state?.message) {
      setMessage(state.message);
      // Clear the message from navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        ensureUserData(user);
      }
    });
    return () => unsubscribe();
  }, [location, navigate, emailInput]);

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (isStaffEmail(emailInput.trim())) {
      handleStaffAttempt();
      return;
    }

    try {
      if (activeTab === "signup") {
        // Check for existing account during signup
        const methods = await checkExistingAccount(emailInput);
        
        if (methods.length > 0) {
          setError("An account with this email already exists. Please sign in instead.");
          return;
        }
        await handleSignUp(e);
      } else {
        // Skip methods check for sign in
        await handleSignIn(e);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError(getFriendlyErrorMessage(error) || "An unexpected error occurred. Please try again.");
    }
  };

  const checkExistingAccount = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      setSignInMethods(methods);
      return methods;
    } catch (error) {
      console.error("Error checking existing account:", error);
      return [];
    }
  };

  const handleProviderSignIn = async (provider) => {
    setError(null);
    setMessage(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        setError("Unable to retrieve email from provider. Please try again.");
        return;
      }

      if (isStaffEmail(user.email)) {
        await auth.signOut();
        handleStaffAttempt();
      } else {
        await ensureUserData(user);
        navigate("/rtd-learning-dashboard");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(getFriendlyErrorMessage(error) || `Failed to sign in with ${provider.providerId}. Please try again.`);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
  
    if (isStaffEmail(emailInput.trim())) {
      handleStaffAttempt();
      return;
    }
  
    if (!validateEmail(emailInput) || !validatePassword(password)) {
      setError("Please correct the errors before submitting.");
      return;
    }
  
    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput.trim(), password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Store email for verification dialog
      localStorage.setItem('verificationEmailSent', 'true');
      localStorage.setItem('verificationEmail', emailInput.trim());
      
      // Sign out immediately - we'll only create user data after verification
      await auth.signOut();
      
      // Show verification dialog
      setVerificationEmail(emailInput.trim());
      setShowVerificationDialog(true);
      
    } catch (error) {
      console.error("Sign-up error:", error.code, error.message);
      setError(getFriendlyErrorMessage(error));
    }
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setMessage(null);

    const userEmail = emailInput.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        await ensureUserData(user);
        navigate("/rtd-learning-dashboard");
      } else {
        await sendEmailVerification(user);
        await auth.signOut();
        setVerificationEmail(userEmail);
        setShowVerificationDialog(true);
      }
      
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      setError(getFriendlyErrorMessage(error));
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setMessage(null);

    if (!emailInput.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (isStaffEmail(emailInput.trim())) {
      handleStaffAttempt();
      return;
    }

    if (!emailRegex.test(emailInput.trim())) {
      setEmailError("Please enter a valid email address.");
      setError("Invalid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setMessage("A password reset email has been sent. Please check your inbox.");
      setIsResetingPassword(false);
    } catch (error) {
      console.error("Password reset error:", error.code, error.message);
      setError(getFriendlyErrorMessage(error));
    }
  };

  const resetState = () => {
    setError(null);
    setMessage(null);
    setEmailError(null);
    setPasswordError(null);
    setEmailInput("");
    setPassword("");
    setIsResetingPassword(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetState();
  };

  // Helper function to render alerts at the top of forms
  const renderAlerts = () => {
    if (!error && !message) return null;
    
    return (
      <div className="mb-6">
        {error && (
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="border-green-500 bg-green-50">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderAuthForm = () => {
    if (isResetingPassword) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {renderAlerts()}

          <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="reset-email"
                type="email"
                value={emailInput}
                onChange={handleEmailChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., student@example.com"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsResetingPassword(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={switchTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="signin" className="text-base">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="text-base">Create Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your RTD Learning courses.
              </p>
            </div>
            
            {renderAlerts()}

            <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="signin-email"
                  type="email"
                  value={emailInput}
                  onChange={handleEmailChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., student@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsResetingPassword(true)}
                    className="text-xs text-primary hover:text-primary-dark focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Your Password"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign In
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleProviderSignIn(googleProvider)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                <span>Google</span>
              </button>

              <button
                onClick={() => handleProviderSignIn(microsoftProvider)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                  alt="Microsoft logo"
                />
                <span>Microsoft</span>
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="signup">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Join RTD Learning to start learning today.
              </p>
            </div>
            
            {renderAlerts()}

            <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={emailInput}
                  onChange={handleEmailChange}
                  required
                  className={`mt-1 block w-full border ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="e.g., student@example.com"
                />
                {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Create Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={`mt-1 block w-full border ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="Create a secure password"
                />
                {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
                {!passwordError && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 7 characters with at least one number and one symbol.
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!!emailError || !!passwordError}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    emailError || passwordError
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  Create Account
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleProviderSignIn(googleProvider)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                <span>Google</span>
              </button>

              <button
                onClick={() => handleProviderSignIn(microsoftProvider)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                  alt="Microsoft logo"
                />
                <span>Microsoft</span>
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 mt-4">
                <div>
                  We've sent a verification email to:
                  <span className="block font-medium text-primary mt-1">{verificationEmail}</span>
                </div>
                <div>
                  Please check your inbox (and spam folder) for the verification link. 
                  You'll need to verify your email before you can sign in.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <button
              onClick={() => setShowVerificationDialog(false)}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Got it, I'll check my email
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {compactView ? (
        // Compact view 
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderAuthForm()}
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Other login options</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/parent-login" 
                className="flex flex-col items-center p-3 border border-purple-200 rounded-md hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-purple-600 hover:text-purple-700">Parent Portal</span>
                <span className="text-xs text-gray-500 mt-1">For parents/guardians</span>
              </Link>
              
              <Link 
                to="/staff-login" 
                className="flex flex-col items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-secondary hover:text-secondary-dark">Staff Login</span>
                <span className="text-xs text-gray-500 mt-1">For RTD staff</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Full view with all wrappers
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          {!hideWelcome && (
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="flex justify-center mb-6">
                <img
                  className="h-20 w-auto"
                  src="https://rtdlearning.com/cdn/shop/files/RTD_FINAL_LOGO.png?v=1727549428&width=160"
                  alt="RTD Learning"
                />
              </div>
              <h1 className="text-3xl font-extrabold text-center text-primary">RTD Learning</h1>
              <p className="mt-2 text-center text-sm text-gray-600">
                Welcome to the Student Portal. Access your courses, manage your profile, and continue your learning journey.
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-center text-sm text-blue-700">
                  <strong>Also have RTD Academy courses?</strong> Use the same login - your account works for both systems! <Link to="/login" className="text-blue-600 hover:text-blue-800 underline font-medium">RTD Academy Portal</Link>
                </p>
              </div>
            </div>
          )}

          <div className={`${!hideWelcome ? 'mt-8' : ''} sm:mx-auto sm:w-full sm:max-w-md`}>
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {renderAuthForm()}
              
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Other login options</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/login" 
                    className="flex flex-col items-center p-3 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-medium text-blue-600 hover:text-blue-700">RTD Academy</span>
                    <span className="text-xs text-gray-500 mt-1">Main student portal</span>
                  </Link>
                  
                  <Link 
                    to="/staff-login" 
                    className="flex flex-col items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-secondary hover:text-secondary-dark">Staff Login</span>
                    <span className="text-xs text-gray-500 mt-1">For RTD staff</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} RTD Learning. All rights reserved.</p>
          </footer>
        </div>
      )}
    </>
  );
};

export default RTDLearningLogin;