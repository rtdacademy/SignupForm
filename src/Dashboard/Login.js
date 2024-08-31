import React, { useState } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, microsoftProvider } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);
  const [name, setName] = useState("");

  const signInWithProvider = (provider) => {
    setError(null);
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        console.log("Signed in user:", user.displayName);

        // Only navigate to the teacher dashboard if the user is a super admin
        if (await isSuperAdmin(user.email)) {
          navigate("/teacher-dashboard");
        } else {
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Sign-in error:", error.code, error.message);
        setError("Failed to sign in. Please try again.");
      });
  };

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      setMessage("Verification email sent. Please check your inbox and verify your email before signing in.");
      await auth.signOut();
    } catch (error) {
      console.error("Email verification error:", error.code, error.message);
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
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.emailVerified) {
        // Only navigate to the teacher dashboard if the user is a super admin
        if (await isSuperAdmin(userCredential.user.email)) {
          navigate("/teacher-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Please verify your email before signing in. Check your inbox for a verification link.");
        await auth.signOut();
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
        default:
          setError("Failed to sign in. Please try again.");
      }
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error.code, error.message);
      setError("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-content">
        <div className="signin-left">
          <h1 className="company-name">RTD Math Academy</h1>
          <p className="company-slogan">Empowering students through personalized online math education</p>
          <div className="company-description">
            <p>Welcome to RTD Math Academy, where we offer:</p>
            <ul>
              <li>Flexible online high school math courses</li>
              <li>Personalized learning experiences</li>
              <li>Expert instructors and support</li>
            </ul>
            <p>Sign in to access your courses or create an account to start your learning journey today.</p>
          </div>
        </div>
        <div className="signin-right">
          <div className={`signin-box ${isSignUp ? 'signup-mode' : 'signin-mode'}`}>
            <h2 className="signin-title">{isSignUp ? "Sign Up" : "Sign In"}</h2>
            <form onSubmit={isSignUp ? handleEmailVerification : handleSignIn} className="email-password-form">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="email-password-button">
                {isSignUp ? "Verify Email" : "Sign In"}
              </button>
            </form>
            {!isSignUp && (
              <p className="forgot-password" onClick={handlePasswordReset}>
                Forgot Password?
              </p>
            )}
            <p className="auth-switch" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </p>
            <div className="or-divider">
              <span>OR</span>
            </div>
            <button className="google-signin-button" onClick={() => signInWithProvider(googleProvider)}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="google-logo" />
              <span>Sign in with Google</span>
            </button>
            <button className="microsoft-signin-button" onClick={() => signInWithProvider(microsoftProvider)}>
              <img 
                src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png" 
                alt="Microsoft logo" 
                className="microsoft-logo" 
              />
              <span>Sign in with Microsoft</span>
            </button>
            {error && <p className="signin-error">{error}</p>}
            {message && <p className="signin-message">{message}</p>}
          </div>
        </div>
      </div>
      <footer className="signin-footer">
        <p>&copy; 2024 RTD Math Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
