import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendEmailVerification
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, microsoftProvider } from "../firebase";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const NewUserSignUp = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const db = getDatabase();

  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{7,}$/;

  const validateEmail = (email) => {
    if (emailRegex.test(email.trim())) {
      setEmailError(null);
      return true;
    }
    setEmailError("Please enter a valid email address.");
    return false;
  };

  const validatePassword = (password) => {
    if (passwordRegex.test(password)) {
      setPasswordError(null);
      return true;
    }
    setPasswordError("Password must be at least 7 characters long and include at least one number and one symbol.");
    return false;
  };

  // User data creation
  const createUserData = async (user) => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      sanitizedEmail: sanitizeEmail(user.email),
      type: "student",
      createdAt: Date.now(),
    };
    await set(userRef, userData);
  };

  // Handle manual sign up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email) || !validatePassword(password)) {
      setError("Please correct the errors before submitting.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);
      await createUserData(userCredential.user);
      
      localStorage.setItem('verificationEmailSent', 'true');
      await auth.signOut();
      
      navigate("/login");
    } catch (error) {
      console.error("Sign-up error:", error);
      setError("Failed to create account. Please try again.");
    }
  };

  // Handle provider sign up
  const handleProviderSignUp = async (provider) => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserData(result.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Provider sign-up error:", error);
      setError(`Failed to sign up with ${provider.providerId}. Please try again.`);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Create Your Account
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => handleProviderSignUp(googleProvider)}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
            />
            <span>Sign up with Google</span>
          </button>

          <button
            onClick={() => handleProviderSignUp(microsoftProvider)}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png"
              alt="Microsoft logo"
            />
            <span>Sign up with Microsoft</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              className={`mt-1 block w-full border ${
                emailError ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
              placeholder="student@example.com"
              required
            />
            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              className={`mt-1 block w-full border ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
              placeholder="Create a secure password"
              required
            />
            {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={!!emailError || !!passwordError}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              emailError || passwordError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          >
            Create Account
          </button>
        </form>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-primary hover:text-primary-dark focus:outline-none"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default NewUserSignUp;