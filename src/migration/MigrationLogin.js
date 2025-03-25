import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { useNavigate } from "react-router-dom";
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

const MigrationLogin = () => {
  const navigate = useNavigate();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const db = getDatabase();

  // Common Microsoft domains
  const microsoftDomains = [
    "@outlook.com",
    "@hotmail.com",
    "@live.com",
    "@msn.com"
  ];

  const handleProviderSignIn = async (provider) => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        setError("Unable to retrieve email from provider. Please try again.");
        return;
      }

      if (user.email.endsWith("@rtdacademy.com")) {
        await auth.signOut();
        setError("This email belongs to staff. Please use the staff login page.");
        return;
      }

      await ensureUserData(user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(`Failed to sign in with ${provider.providerId}. Please try again.`);
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
          type: "student",
          createdAt: Date.now(),
          isMigratedUser: true
        };
        await set(userRef, userData);
      }
      return true;
    } catch (error) {
      console.error("Error ensuring user data:", error);
      throw new Error("Failed to create or verify user data");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!emailInput.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailInput.trim(), password);
      await sendEmailVerification(userCredential.user);
      
      await auth.signOut();
      setVerificationEmail(emailInput.trim());
      setShowVerificationDialog(true);
      
    } catch (error) {
      console.error("Sign-up error:", error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("This email is already registered. Please use Google or Microsoft sign-in if available.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address. Please check and try again.");
          break;
        default:
          setError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h1 className="text-3xl font-extrabold text-center text-primary">Welcome to the New Portal</h1>
        
        <div className="bg-white mt-8 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Migration explanation */}
          <div className="mb-8 text-gray-600">
            <p className="mb-4">
              We've upgraded our system to make it easier for you to access your courses. 
              You can now use your existing email address to sign in - no need to remember 
              a separate username and password.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="font-medium">Important:</p>
              <p>Please use the same email address you've been using with us to ensure 
              access to all your course materials.</p>
            </div>
          </div>

          {!showEmailForm ? (
            <>
              {/* Provider sign-in section */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Alberta Students</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you're using your school email, it's likely a Google account. 
                    Click "Sign in with Google" below.
                  </p>
                  <button
                    onClick={() => handleProviderSignIn(googleProvider)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google logo"
                    />
                    Sign in with Google
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Microsoft Account Users</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    If your email ends with any of these domains, use "Sign in with Microsoft":
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                    {microsoftDomains.map(domain => (
                      <li key={domain}>{domain}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleProviderSignIn(microsoftProvider)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
                      alt="Microsoft logo"
                    />
                    Sign in with Microsoft
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    I'm not using a Google or Microsoft email
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Email verification form
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Create a password"
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Continue with Email
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Back to sign-in options
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Email verification dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check Your Email</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 mt-4">
                <div>
                  We've sent a verification link to:
                  <span className="block font-medium text-primary mt-1">{verificationEmail}</span>
                </div>
                <div>
                  Please check your inbox (and spam folder) for the verification email. 
                  Click the link in the email to verify your address before signing in.
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
    </div>
  );
};

export default MigrationLogin;