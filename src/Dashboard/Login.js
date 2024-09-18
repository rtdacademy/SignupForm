import React, { useState } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider, microsoftProvider } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);
  const [name, setName] = useState("");

  const isStaffEmail = (email) => {
    return email.toLowerCase().endsWith("@rtdacademy.com");
  };

  const handleStaffAttempt = () => {
    setError("This email belongs to staff. Please use the staff login page.");
    setTimeout(() => {
      navigate("/staff-login");
    }, 3000);
  };

  const signInWithProvider = (provider) => {
    setError(null);
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        if (isStaffEmail(user.email)) {
          auth.signOut().then(() => {
            handleStaffAttempt();
          });
        } else {
          console.log("Signed in student:", user.displayName);
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
    if (isStaffEmail(email)) {
      handleStaffAttempt();
      return;
    }
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
    if (isStaffEmail(email)) {
      handleStaffAttempt();
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.emailVerified) {
        navigate("/dashboard");
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
    if (isStaffEmail(email)) {
      handleStaffAttempt();
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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-primary">RTD Academy</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Welcome to the Student Portal. Here you can register for new courses, 
        manage your personal information, and access your enrolled courses.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-center text-2xl font-bold text-gray-900">{isSignUp ? "Sign Up" : "Sign In"}</h2>
            </div>
            <form onSubmit={isSignUp ? handleEmailVerification : handleSignIn} className="space-y-6">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              <div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  {isSignUp ? "Verify Email" : "Sign In"}
                </button>
              </div>
            </form>

            {!isSignUp && (
              <div className="text-sm">
                <button onClick={handlePasswordReset} className="font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </button>
              </div>
            )}

            <div className="text-sm">
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:text-primary-dark">
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <button onClick={() => signInWithProvider(googleProvider)} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <img className="h-5 w-5 mr-2" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
                    <span>Google</span>
                  </button>
                </div>
                <div>
                  <button onClick={() => signInWithProvider(microsoftProvider)} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <img className="h-5 w-5 mr-2" src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png" alt="Microsoft logo" />
                    <span>Microsoft</span>
                  </button>
                </div>
              </div>
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
  );
};

export default Login;