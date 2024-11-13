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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [signInMethods, setSignInMethods] = useState([]);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const db = getDatabase();

  const isStaffEmail = (email) => {
    if (typeof email !== 'string') return false;
    const sanitized = sanitizeEmail(email);
    return sanitized.endsWith("@rtdacademy.com"); // Corrected comma to dot
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
    if (isSignUp) {
      validateEmail(email);
    }
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (isSignUp) {
      validatePassword(pwd);
    }
  };

  const ensureUserData = async (user) => {
    if (!user || !user.emailVerified) return false;
    
    const uid = user.uid;
    const userRef = ref(db, `users/${uid}`);
    
    try {
      console.log("Checking if user data exists for UID:", uid);
      const snapshot = await get(child(ref(db), `users/${uid}`));
      if (!snapshot.exists()) {
        console.log("User data doesn't exist, creating new data");
        const sanitizedEmail = sanitizeEmail(user.email);
        const userData = {
          uid: uid,
          email: user.email,
          sanitizedEmail: sanitizedEmail,
          type: isStaffEmail(user.email) ? "staff" : "student",
          createdAt: Date.now(),
        };
        await set(userRef, userData);
        console.log("User data created successfully:", userData);
      } else {
        console.log("User data already exists");
      }
      return true;
    } catch (error) {
      console.error("Error ensuring user data:", error);
      throw new Error("Failed to create or verify user data");
    }
  };

  useEffect(() => {
    const verificationFlag = localStorage.getItem('verificationEmailSent');
    if (verificationFlag) {
      setVerificationEmail(localStorage.getItem('verificationEmail') || emailInput);
      setShowVerificationDialog(true);
      localStorage.removeItem('verificationEmailSent');
      localStorage.removeItem('verificationEmail');
    }

    // Check for navigation state message
    const state = location?.state;
    if (state?.message) {
      setMessage(state.message);
      // Clear the message from navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Auth state changed - user:", user);
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
      if (isSignUp) {
        // Check for existing account during signup
        const methods = await checkExistingAccount(emailInput);
        console.log("Signup - checking methods:", methods);
        
        if (methods.length > 0) {
          console.log("Account exists, preventing sign-up");
          setError("An account with this email already exists. Please sign in instead.");
          return;
        }
        await handleSignUp(e);
      } else {
        // Skip methods check for sign in
        console.log("Sign in - attempting direct sign in");
        await handleSignIn(e);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const checkExistingAccount = async (email) => {
    try {
      console.log("Checking existing account for email:", email);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("Sign-in methods found:", methods);
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
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(`Failed to sign in with ${provider.providerId}. Please try again.`);
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
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("This email is already registered. Please sign in or use a different email.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address. Please check and try again.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please use a stronger password.");
          break;
        default:
          setError("Failed to create account. Please try again.");
      }
    }
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setMessage(null);

    const userEmail = emailInput.trim();
    console.log("Attempting sign in for email:", userEmail);

    try {
      console.log("Calling signInWithEmailAndPassword");
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        console.log("Email is verified, ensuring user data");
        await ensureUserData(user);
        console.log("Navigating to dashboard");
        navigate("/dashboard");
      } else {
        console.log("Email not verified");
        await sendEmailVerification(user);
        await auth.signOut();
        setVerificationEmail(userEmail);
        setShowVerificationDialog(true);
      }
      
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email. Please sign up first.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address. Please check and try again.");
          break;
        case 'auth/too-many-requests':
          setError("Too many unsuccessful login attempts. Please try again later.");
          break;
        default:
          setError(`Sign in failed: ${error.message}`);
      }
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
    } catch (error) {
      console.error("Password reset error:", error.code, error.message);
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address. Please check and try again.");
          break;
        default:
          setError("Failed to send password reset email. Please try again.");
      }
    }
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

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-3xl font-extrabold text-center text-primary">RTD Academy</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to the Student Portal. Here you can register for new courses, manage your personal information, and access your enrolled courses.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-bold text-gray-900">
                {isSignUp ? "Sign Up" : "Sign In"}
              </h2>

              <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={`mt-1 block w-full border ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                    placeholder="Your Password"
                  />
                  {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSignUp && (!!emailError || !!passwordError)}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isSignUp && (emailError || passwordError)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                  >
                    {isSignUp ? "Register with Email" : "Sign In with Email"}
                  </button>
                </div>
              </form>

              {!isSignUp && (
                <div className="text-sm">
                  <button
                    onClick={handlePasswordReset}
                    className="font-medium text-primary hover:text-primary-dark focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <div className="text-sm">
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); setEmailError(null); setPasswordError(null); }}
                  className="font-medium text-primary hover:text-primary-dark focus:outline-none"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleProviderSignIn(googleProvider)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <img
                    className="h-5 w-5 mr-2"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                  />
                  <span>{isSignUp ? "Sign up with Google" : "Sign in with Google"}</span>
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
                  <span>{isSignUp ? "Sign up with Microsoft" : "Sign in with Microsoft"}</span>
                </button>
              </div>

              {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
              {message && <p className="mt-2 text-center text-sm text-green-600">{message}</p>}

              <div className="mt-6 text-center">
                <Link to="/staff-login" className="font-medium text-secondary hover:text-secondary-dark">
                  Staff Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} RTD Math Academy. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Login;
