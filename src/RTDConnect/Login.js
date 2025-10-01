import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  setPersistence,
  browserSessionPersistence,
  linkWithPopup,
  linkWithRedirect,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Info, Calendar } from "lucide-react";
import { auth, googleProvider, microsoftProvider, isDevelopment } from "../firebase";
import {
  getRegistrationPhase,
  formatImportantDate
} from '../config/calendarConfig';
import { useAuth } from '../context/AuthContext';
import { isMobileDevice, getDeviceType } from '../utils/deviceDetection';
import AuthLoadingScreen from './AuthLoadingScreen';
import ForcedPasswordChange from '../components/auth/ForcedPasswordChange';
import { toast } from 'sonner';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../components/ui/accordion";

// RTD Connect Logo with gradient colors
const RTDConnectLogo = () => (
  <div className="flex items-center justify-center space-x-4 mb-6">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-16 w-auto"
    />
    <div className="text-left">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-lg text-gray-600 font-medium">Home Education Portal</p>
    </div>
  </div>
);

const RTDConnectLogin = ({ hideWelcome = false, startWithSignUp = false, compactView = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentAuthUser, isHomeEducationParent, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState(startWithSignUp ? "signup" : "signin");
  const [message, setMessage] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [signInMethods, setSignInMethods] = useState([]);
  const [isResetingPassword, setIsResetingPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [showAuthLoading, setShowAuthLoading] = useState(false);
  const [authLoadingMessage, setAuthLoadingMessage] = useState("Completing your sign-in...");
  const [showLinkAccountDialog, setShowLinkAccountDialog] = useState(false);
  const [pendingProvider, setPendingProvider] = useState(null);
  const [linkingEmail, setLinkingEmail] = useState("");
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  // Get registration phase for conditional messaging
  const registrationPhase = getRegistrationPhase();

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
      'auth/account-exists-with-different-credential': 'An account already exists with this email. Please sign in with your email and password first. Then you can add this sign-in method to your account.',
      'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
      'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow popups for this site and try again.',
      'auth/cancelled-popup-request': 'Sign-in process was interrupted. Please try again.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please try another method.',
      'auth/redirect-cancelled-by-user': 'Sign-in was cancelled. Please try again.',
      'auth/web-storage-unsupported': 'Your browser does not support web storage. Please try a different browser or enable cookies.',
      
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
    
    return errorMessages[error.code] || `Something went wrong. Please try again. (${error.message})`;
  };

  const isStaffEmail = (email) => {
    if (typeof email !== 'string') return false;
    return email.toLowerCase().endsWith("@rtdacademy.com");
  };

  // Check if user has temporary password requirement
  const checkTempPasswordRequirement = async (user) => {
    if (!user) return false;

    try {
      // Get current token claims
      const tokenResult = await user.getIdTokenResult();
      const currentClaims = tokenResult.claims;
      
      return currentClaims.tempPasswordRequired === true;
    } catch (error) {
      console.error('Error checking temp password requirement:', error);
      return false;
    }
  };

  // Handle password change completion
  const handlePasswordChangeComplete = async () => {
    console.log('Password change completed, refreshing auth state');
    setRequiresPasswordChange(false);
    
    // Show loading while AuthContext handles the navigation
    setShowAuthLoading(true);
    setAuthLoadingMessage("Password updated successfully. Preparing your dashboard...");
    
    // Get the current user and force token refresh to ensure claims are updated
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Force token refresh to get the updated claims without tempPasswordRequired
        await currentUser.getIdToken(true);
        console.log('Token refreshed successfully after password change');
        
        // Set the portal login flag
        localStorage.setItem('rtdConnectPortalLogin', 'true');
        
        // AuthContext will handle the navigation once it detects the updated claims
      } catch (error) {
        console.error('Error refreshing token after password change:', error);
        setShowAuthLoading(false);
        setError('An error occurred. Please try signing in again.');
      }
    }
  };


  const handleStaffAttempt = () => {
    setError("This email belongs to staff. Please use the staff login portal instead.");
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

  // Note: ensureUserData has been removed - AuthContext now handles all user data setup

  // Redirect to dashboard if user is already authenticated when component mounts
  useEffect(() => {
    // Only redirect if we're not already showing auth loading (from a login attempt)
    if (!authLoading && currentAuthUser && currentAuthUser.emailVerified && !showAuthLoading) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard');
    }
  }, [currentAuthUser, authLoading, navigate, showAuthLoading]);

  useEffect(() => {
    const initializePersistence = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
        console.log('Auth persistence set to browser session');
      } catch (error) {
        console.error('Failed to set auth persistence:', error);
      }
    };

    initializePersistence();
    
    // Check if user is already signed in and trying to link accounts
    const checkExistingAuth = async () => {
      const user = auth.currentUser;
      if (user && user.emailVerified) {
        // User is already signed in - they might be trying to add another sign-in method
        console.log('User already signed in:', user.email);
        // We'll handle this in the provider sign-in function
      }
    };
    
    checkExistingAuth();

    // Handle redirect result from social sign-in (only in production)
    const handleRedirectResult = async () => {
      if (isDevelopment) {
        console.log('Skipping redirect result check in development');
        setCheckingRedirect(false);
        return;
      }

      try {
        setCheckingRedirect(true);
        console.log('Checking for redirect result in production...');
        
        // Check if we were linking accounts
        const linkingInProgress = sessionStorage.getItem('rtdConnectLinkingInProgress');
        const linkingProvider = sessionStorage.getItem('rtdConnectLinkingProvider');
        
        if (linkingInProgress) {
          console.log(`Expecting account linking result from ${linkingProvider}`);
          sessionStorage.removeItem('rtdConnectLinkingInProgress');
          sessionStorage.removeItem('rtdConnectLinkingProvider');
        }
        
        // Check if we were expecting a redirect
        const authInProgress = sessionStorage.getItem('rtdConnectAuthInProgress');
        const authProvider = sessionStorage.getItem('rtdConnectAuthProvider');
        
        if (authInProgress) {
          console.log(`Expecting redirect result from ${authProvider}`);
        }
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('Redirect sign-in successful for:', result.user.email);
          
          // Show loading screen immediately
          setShowAuthLoading(true);
          setAuthLoadingMessage("Completing your sign-in...");
          
          // Clear session storage flags
          sessionStorage.removeItem('rtdConnectAuthInProgress');
          sessionStorage.removeItem('rtdConnectAuthProvider');
          
          const user = result.user;
          
          if (!user.email) {
            setShowAuthLoading(false);
            setError("Unable to retrieve email from provider. Please try again.");
            return;
          }

          if (isStaffEmail(user.email)) {
            setShowAuthLoading(false);
            await auth.signOut();
            handleStaffAttempt();
          } else {
            // Set the portal login flag and let AuthContext handle navigation
            localStorage.setItem('rtdConnectPortalLogin', 'true');
            setAuthLoadingMessage("Preparing your dashboard...");
            // AuthContext will detect the auth state change and handle navigation
            // Keep loading screen showing briefly to avoid flashing
            setTimeout(() => {
              setShowAuthLoading(false);
            }, 1000);
          }
        } else if (authInProgress) {
          // We were expecting a redirect but didn't get one - this might indicate an error
          console.log('Expected redirect result but none found');
          setShowAuthLoading(false);
          
          setError("Sign-in process was interrupted or cancelled. Please try again.");
          
          sessionStorage.removeItem('rtdConnectAuthInProgress');
          sessionStorage.removeItem('rtdConnectAuthProvider');
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        setShowAuthLoading(false);
        
        // Handle account linking case for redirect flow
        if (error.code === 'auth/account-exists-with-different-credential') {
          const email = error.customData?.email || error.email;
          const authProvider = sessionStorage.getItem('rtdConnectAuthProvider');
          
          if (email && authProvider) {
            try {
              // Check which sign-in methods exist for this email
              const methods = await fetchSignInMethodsForEmail(auth, email);
              console.log('Existing sign-in methods for', email, ':', methods);
              
              // If methods array is empty, Firebase might not be returning the correct info
              // In this case, we'll assume it's a password account and show the linking dialog
              if (methods.length === 0) {
                console.log('No sign-in methods found (redirect), assuming password account and showing linking dialog');
                setError(null); // Clear any existing error
                setPendingProvider(authProvider);
                setLinkingEmail(email);
                setShowLinkAccountDialog(true);
                sessionStorage.removeItem('rtdConnectAuthInProgress');
                sessionStorage.removeItem('rtdConnectAuthProvider');
                return;
              }
              
              // If the existing account uses a social provider, prompt to sign in with that
              if (methods.includes('google.com') && authProvider !== 'google.com') {
                setError(`This email is already linked to a Google account. Please sign in with Google instead.`);
                sessionStorage.removeItem('rtdConnectAuthInProgress');
                sessionStorage.removeItem('rtdConnectAuthProvider');
                return;
              } else if (methods.includes('microsoft.com') && authProvider !== 'microsoft.com') {
                setError(`This email is already linked to a Microsoft account. Please sign in with Microsoft instead.`);
                sessionStorage.removeItem('rtdConnectAuthInProgress');
                sessionStorage.removeItem('rtdConnectAuthProvider');
                return;
              } else if (methods.includes('password')) {
                // If they have email/password, show dialog to sign in and link
                console.log('Showing account linking dialog for email (redirect):', email);
                setError(null); // Clear any existing error
                setPendingProvider(authProvider);
                setLinkingEmail(email);
                setShowLinkAccountDialog(true);
                sessionStorage.removeItem('rtdConnectAuthInProgress');
                sessionStorage.removeItem('rtdConnectAuthProvider');
                return;
              }
            } catch (fetchError) {
              console.error('Error fetching sign-in methods:', fetchError);
              // If we can't fetch methods, show a generic error
              setError('An account already exists with this email. Please try signing in with the method you used to create your account.');
              sessionStorage.removeItem('rtdConnectAuthInProgress');
              sessionStorage.removeItem('rtdConnectAuthProvider');
              return;
            }
          }
        }
        
        // Handle specific mobile authentication errors
        if (error.message && error.message.includes('missing initial state')) {
          console.log('Detected missing initial state error - likely storage issue on mobile');
          
          // Clear any stale session data
          sessionStorage.removeItem('rtdConnectAuthInProgress');
          sessionStorage.removeItem('rtdConnectAuthProvider');
          
          // Provide helpful error message for mobile users
          setError(
            isMobileDevice() 
              ? "Authentication failed due to browser storage restrictions. Please try clearing your browser data or using a different browser."
              : "Authentication failed. Please try again or use email sign-in instead."
          );
        } else if (error.code !== 'auth/redirect-cancelled-by-user' && 
                  error.code !== 'auth/popup-blocked' &&
                  error.code !== 'auth/operation-not-allowed') {
          // Only show error for actual failures, not expected states
          setError(getFriendlyErrorMessage(error) || "Failed to complete sign-in. Please try again.");
        }
      } finally {
        setCheckingRedirect(false);
      }
    };

    // Handle verification flag
    const handleVerificationFlag = () => {
      const verificationFlag = localStorage.getItem('verificationEmailSent');
      if (verificationFlag) {
        const email = localStorage.getItem('verificationEmail');
        if (email) {
          toast.success(
            <div>
              <div className="font-semibold mb-1">Verification Email Sent!</div>
              <div className="text-sm">
                We've sent a verification email to <strong>{email}</strong>
              </div>
              <div className="text-sm mt-1">
                Please check your inbox (and spam folder) to verify your email.
              </div>
            </div>,
            {
              duration: 8000,
            }
          );
        }
        localStorage.removeItem('verificationEmailSent');
        localStorage.removeItem('verificationEmail');
      }
    };
    
    // Check for redirect result first
    handleRedirectResult();
    handleVerificationFlag();

    // Check for navigation state message
    const state = location?.state;
    if (state?.message) {
      setMessage(state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Removed duplicate onAuthStateChanged listener - AuthContext handles this
  }, [location, navigate]);

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
        const methods = await checkExistingAccount(emailInput);
        
        if (methods.length > 0) {
          setError("An account with this email already exists. Please sign in instead.");
          return;
        }
        await handleSignUp(e);
      } else {
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

  const handleAccountLinking = async (password) => {
    if (!pendingProvider || !linkingEmail) return;
    
    setError(null);
    setMessage(null);
    setIsAuthenticating(true);
    
    try {
      // First, sign in with email/password
      const userCredential = await signInWithEmailAndPassword(auth, linkingEmail, password);
      const user = userCredential.user;
      
      // Now link the provider
      const provider = pendingProvider === 'google.com' ? googleProvider : microsoftProvider;
      
      if (isDevelopment) {
        // Use linkWithPopup in development
        const result = await linkWithPopup(user, provider);
        console.log('Successfully linked account:', result.user.email);
        
        // Close the dialog
        setShowLinkAccountDialog(false);
        setPendingProvider(null);
        setLinkingEmail("");
        
        // Set the portal login flag and let AuthContext handle navigation
        localStorage.setItem('rtdConnectPortalLogin', 'true');
        setShowAuthLoading(true);
        setAuthLoadingMessage("Account linked successfully. Preparing your dashboard...");
        // AuthContext will detect the auth state change and handle navigation
      } else {
        // Use linkWithRedirect in production
        sessionStorage.setItem('rtdConnectLinkingInProgress', 'true');
        sessionStorage.setItem('rtdConnectLinkingProvider', provider.providerId);
        await linkWithRedirect(user, provider);
        // User will be redirected
      }
    } catch (error) {
      console.error("Account linking error:", error);
      setError(getFriendlyErrorMessage(error) || "Failed to link accounts. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleProviderSignIn = async (provider) => {
    setError(null);
    setMessage(null);
    setIsAuthenticating(true);
    let showingLinkDialog = false;
    
    try {
      if (isDevelopment) {
        // Use popup in development
        console.log('Using popup flow for development');
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
          // Set the portal login flag and let AuthContext handle navigation
          localStorage.setItem('rtdConnectPortalLogin', 'true');
          setShowAuthLoading(true);
          setAuthLoadingMessage("Preparing your dashboard...");
          // AuthContext will detect the auth state change and handle navigation
        }
      } else {
        // Use redirect in production
        console.log('Using redirect flow for production');
        
        // Store a flag to indicate we're expecting a redirect
        sessionStorage.setItem('rtdConnectAuthInProgress', 'true');
        sessionStorage.setItem('rtdConnectAuthProvider', provider.providerId);
        
        await signInWithRedirect(auth, provider);
        // User will be redirected away, so we won't reach here
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      
      // Handle account linking case
      if (error.code === 'auth/account-exists-with-different-credential') {
        console.log('Account linking error detected:', error);
        console.log('Error custom data:', error.customData);
        console.log('Error email:', error.email);
        console.log('Error credential:', error.credential);
        console.log('Full error object:', JSON.stringify(error, null, 2));
        
        // Extract email from different possible locations
        const email = error.customData?.email || error.email || error.credential?.email;
        const credential = error.credential;
        
        if (email) {
          console.log('Extracted email for account linking:', email);
          try {
            // Check which sign-in methods exist for this email
            const methods = await fetchSignInMethodsForEmail(auth, email);
            console.log('Existing sign-in methods for', email, ':', methods);
            
            // If methods array is empty, Firebase might not be returning the correct info
            // In this case, we'll assume it's a password account and show the linking dialog
            if (methods.length === 0) {
              console.log('No sign-in methods found, assuming password account and showing linking dialog');
              setError(null); // Clear any existing error
              setPendingProvider(provider.providerId);
              setLinkingEmail(email);
              setShowLinkAccountDialog(true);
              showingLinkDialog = true;
              setIsAuthenticating(false);
              return;
            }
            
            // If the existing account uses a social provider, prompt to sign in with that
            if (methods.includes('google.com') && provider.providerId !== 'google.com') {
              setError(`This email is already linked to a Google account. Please sign in with Google instead.`);
              setIsAuthenticating(false);
              return;
            } else if (methods.includes('microsoft.com') && provider.providerId !== 'microsoft.com') {
              setError(`This email is already linked to a Microsoft account. Please sign in with Microsoft instead.`);
              setIsAuthenticating(false);
              return;
            } else if (methods.includes('password')) {
              // If they have email/password, show dialog to sign in and link
              console.log('Showing account linking dialog for email:', email);
              setError(null); // Clear any existing error
              setPendingProvider(provider.providerId);
              setLinkingEmail(email);
              setShowLinkAccountDialog(true);
              showingLinkDialog = true;
              setIsAuthenticating(false);
              return;
            }
          } catch (fetchError) {
            console.error('Error fetching sign-in methods:', fetchError);
            // If we can't fetch methods, show a generic error
            setError('An account already exists with this email. Please try signing in with the method you used to create your account.');
            setIsAuthenticating(false);
            return;
          }
        } else {
          console.log('No email found in error object, showing generic account linking error');
          setError('An account already exists with this email. Please try signing in with the method you used to create your account.');
          setIsAuthenticating(false);
          return;
        }
      }
      
      // Handle popup blocked error specifically for development
      if (isDevelopment && error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
      } else if (error.code !== 'auth/account-exists-with-different-credential') {
        // Don't show generic error for account linking cases
        setError(getFriendlyErrorMessage(error) || `Failed to sign in with ${provider.providerId}. Please try again.`);
      }
    } finally {
      // Don't set isAuthenticating to false if we're showing the account linking dialog
      if (!showingLinkDialog) {
        setIsAuthenticating(false);
      }
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
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput.trim(), password);
      
      // Create action code settings with dynamic continueUrl
      const actionCodeSettings = {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: true
      };
      
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      localStorage.setItem('rtdConnectPortalSignup', 'true');
      
      await auth.signOut();
      
      // Show toast notification instead of dialog
      toast.success(
        <div>
          <div className="font-semibold mb-1">Verification Email Sent!</div>
          <div className="text-sm">
            We've sent a verification email to <strong>{emailInput.trim()}</strong>
          </div>
          <div className="text-sm mt-1">
            Please check your inbox (and spam folder) to verify your email before signing in.
          </div>
        </div>,
        {
          duration: 8000,
        }
      );
      
      // Clear form
      setEmailInput("");
      setPassword("");
      setActiveTab("signin");
      
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
      setShowAuthLoading(true);
      setAuthLoadingMessage("Signing you in...");
      
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        // Set the portal login flag and let AuthContext handle navigation
        localStorage.setItem('rtdConnectPortalLogin', 'true');
        setAuthLoadingMessage("Preparing your dashboard...");
        // AuthContext will detect the auth state change and handle navigation
      } else {
        // Create action code settings with dynamic continueUrl
        const actionCodeSettings = {
          url: `${window.location.origin}/login?verified=true`,
          handleCodeInApp: true
        };
        
        await sendEmailVerification(user, actionCodeSettings);
        await auth.signOut();
        setShowAuthLoading(false);
        
        // Show toast notification for unverified email
        toast.info(
          <div>
            <div className="font-semibold mb-1">Email Verification Required</div>
            <div className="text-sm">
              A new verification email has been sent to <strong>{userEmail}</strong>
            </div>
            <div className="text-sm mt-1">
              Please verify your email before signing in.
            </div>
          </div>,
          {
            duration: 8000,
          }
        );
      }
      
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      setShowAuthLoading(false);
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

  // Render prominent Google/Microsoft login section
  const renderSocialLogin = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Choose your preferred sign-in method below
          </p>
          <p className="mt-1 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Recommended: Use your Google or Microsoft account
          </p>
          <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            {isDevelopment ? "A popup window will open for secure sign-in" : "You'll be redirected to sign in securely"}
          </p>
        </div>
        
        {renderAlerts()}

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => handleProviderSignIn(googleProvider)}
            disabled={isAuthenticating || checkingRedirect}
            className={`w-full flex items-center justify-center px-6 py-4 border rounded-lg shadow-sm text-base font-medium transition-all duration-200 ${
              isAuthenticating || checkingRedirect
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:border-purple-300'
            }`}
          >
            {isAuthenticating || checkingRedirect ? (
              <svg className="animate-spin h-6 w-6 mr-3 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <img
                className="h-6 w-6 mr-3"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
            )}
            <span>{checkingRedirect ? 'Checking authentication...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={() => handleProviderSignIn(microsoftProvider)}
            disabled={isAuthenticating || checkingRedirect}
            className={`w-full flex items-center justify-center px-6 py-4 border rounded-lg shadow-sm text-base font-medium transition-all duration-200 ${
              isAuthenticating || checkingRedirect
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:border-cyan-300'
            }`}
          >
            {isAuthenticating || checkingRedirect ? (
              <svg className="animate-spin h-6 w-6 mr-3 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <img
                className="h-6 w-6 mr-3"
                src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                alt="Microsoft logo"
              />
            )}
            <span>{checkingRedirect ? 'Checking authentication...' : 'Continue with Microsoft'}</span>
          </button>
        </div>
      </div>
    );
  };

  // Render email/password forms for accordion content
  const renderEmailPasswordForms = () => {
    return (
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={switchTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="signin" className="text-base">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="text-base">Create Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your RTD Connect family portal.
              </p>
            </div>
            
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="signin-email"
                  type="email"
                  value={emailInput}
                  onChange={handleEmailChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="e.g., parent@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsResetingPassword(true)}
                    className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 focus:outline-none"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Your Password"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="signup">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Join RTD Connect</h3>
              <p className="mt-2 text-sm text-gray-600">
                Create your family account to get started with home education support.
              </p>
            </div>
            
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
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                  placeholder="e.g., parent@example.com"
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
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
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
                      : 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="e.g., parent@example.com"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsResetingPassword(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Primary Social Login Section */}
        {renderSocialLogin()}
        
        {/* Secondary Email/Password Section in Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="email-login">
            <AccordionTrigger className="text-left" showExpandText={true}>
              <span className="text-sm text-gray-600">
                Don't have Google or Microsoft? <span className="font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Use email instead</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="text-center pb-2">
                  <p className="text-sm text-gray-600">
                    Sign in or create an account using your email address
                  </p>
                </div>
                {renderAlerts()}
                {renderEmailPasswordForms()}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };

  // Show loading while checking auth state
  if (authLoading) {
    return <AuthLoadingScreen message="Checking authentication..." />;
  }

  // Redirect if already authenticated
  if (currentAuthUser && currentAuthUser.emailVerified) {
    return <AuthLoadingScreen message="Redirecting to dashboard..." />;
  }

  // Show auth loading screen if we're processing authentication
  if (showAuthLoading) {
    return <AuthLoadingScreen message={authLoadingMessage} />;
  }

  // Show forced password change screen if temporary password detected
  if (requiresPasswordChange) {
    return <ForcedPasswordChange onPasswordChanged={handlePasswordChangeComplete} />;
  }

  return (
    <>
      <Dialog open={showLinkAccountDialog} onOpenChange={setShowLinkAccountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link Your Accounts</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 mt-4">
                <div>
                  An account with the email <span className="font-medium bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{linkingEmail}</span> already exists.
                </div>
                <div>
                  To continue with {pendingProvider === 'google.com' ? 'Google' : 'Microsoft'}, please enter your existing password to link these accounts.
                </div>
                <div className="text-sm text-gray-600">
                  Once linked, you'll be able to sign in with either method.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="link-password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your account password
              </label>
              <input
                id="link-password"
                type="password"
                placeholder="Your existing password"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAccountLinking(e.target.value);
                  }
                }}
              />
            </div>
            {error && (
              <Alert variant="destructive" className="border-red-500 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter className="sm:justify-center space-x-2">
            <button
              onClick={() => {
                setShowLinkAccountDialog(false);
                setPendingProvider(null);
                setLinkingEmail("");
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const passwordInput = document.getElementById('link-password');
                if (passwordInput?.value) {
                  handleAccountLinking(passwordInput.value);
                }
              }}
              disabled={isAuthenticating}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isAuthenticating ? 'Linking...' : 'Link Accounts'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {compactView ? (
        // Compact view 
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderAuthForm()}
        </div>
      ) : (
        // Full view with all wrappers
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          {!hideWelcome && (
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              {/* Back to Home Button */}
              <div className="mb-6">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </div>
              
              <RTDConnectLogo />
              <p className="mt-4 text-center text-sm text-gray-600 leading-relaxed">
                Welcome to RTD Connect, your home education portal. Here you can register your family,
                manage your home education program, and access support and reimbursement services.
              </p>

              {/* Registration Phase Notice - Simple */}
              {registrationPhase.phase === 'intent-period' && (
                <div className="mt-6 bg-white rounded-lg border border-purple-200 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        New families: Intent to Register now available
                      </h4>
                      <p className="text-xs text-gray-600">
                        If you're new to RTD Connect, you can create an account and submit an Intent to Register for the {registrationPhase.targetYear} school year.
                        <Link to="/faq" className="text-purple-600 hover:text-purple-800 underline ml-1 font-medium">Learn more</Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Current families: Your dashboard has everything you need
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={`${!hideWelcome ? 'mt-8' : ''} sm:mx-auto sm:w-full sm:max-w-md`}>
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-purple-100">
              {renderAuthForm()}
            </div>
          </div>

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} RTD Connect - Home Education Portal. All rights reserved.</p>
          </footer>
        </div>
      )}
    </>
  );
};

export default RTDConnectLogin;