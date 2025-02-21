import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, microsoftProvider } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { sanitizeEmail } from "../utils/sanitizeEmail";

const StaffLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { isStaff, ensureStaffNode } = useAuth();

  const signInWithMicrosoft = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const user = result.user;
      if (isStaff(user)) {
        const staffNodeCreated = await ensureStaffNode(user, sanitizeEmail(user.email));
        if (staffNodeCreated) {
          console.log("Signed in staff:", user.displayName);
          navigate("/teacher-dashboard");
        } else {
          setError("Failed to create staff profile. Please contact support.");
          await auth.signOut();
        }
      } else {
        setError(
          <div className="text-center">
            <p className="mb-2">This login page is for RTD Math Academy staff only.</p>
            <p>Students should login at:{" "}
              <a 
                href="https://yourway.rtdacademy.com/login" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                yourway.rtdacademy.com/login
              </a>
            </p>
          </div>
        );
        await auth.signOut();
      }
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      setError("Failed to sign in. Please try again.");
      await auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-primary">RTD Math Academy</h1>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-md mx-auto">
          Staff Portal - Course Management & Administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-center text-2xl font-bold text-gray-900">Staff Sign In</h2>
            </div>
            <div>
              <button
                onClick={signInWithMicrosoft}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <img 
                  src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.png" 
                  alt="Microsoft logo" 
                  className="h-5 w-5 mr-2"
                />
                Sign in with Microsoft
              </button>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">Are you a student?</p>
              <a 
                href="https://yourway.rtdacademy.com/login"
                className="font-medium text-secondary hover:text-secondary-dark block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Student Login →
              </a>
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

export default StaffLogin;