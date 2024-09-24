// src/components/StaffLogin.js

import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, microsoftProvider } from "../firebase";
import { useAuth } from "../context/AuthContext";

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
        await ensureStaffNode(user);
        console.log("Signed in staff:", user.displayName);
        navigate("/teacher-dashboard");
      } else {
        setError("Access denied. Please use an @rtdacademy.com email address.");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Sign-in error:", error.code, error.message);
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-primary">RTD Math Academy</h1>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-md mx-auto">
          Welcome to the Staff Portal. Access the dashboard to manage courses,
          view student information, and perform administrative tasks.
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
            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
            <div className="mt-6 text-center">
              <Link to="/login" className="font-medium text-secondary hover:text-secondary-dark">
                Student Login
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

export default StaffLogin;
