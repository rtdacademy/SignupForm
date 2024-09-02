import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, get } from "firebase/database";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getSafeEmailPath = (email) => {
    return email.replace(/\./g, ','); // Replace all '.' with ','
  };

  const isTeacherEmail = async (email) => {
    const db = getDatabase();
    try {
      const snapshot = await get(ref(db, `adminEmails/${getSafeEmailPath(email)}`));
      return snapshot.exists();  // This only returns true if the email is in adminEmails
    } catch (error) {
      console.error("Error checking teacher email:", error);
      return false;
    }
  };

  const isSuperAdmin = async (email) => {
    return await isTeacherEmail(email); // This checks if the email is in adminEmails
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); // Clear the user state after signing out
    } catch (error) {
      console.error("Error signing out:", error);
      throw error; // Rethrow the error so it can be caught and handled by the component
    }
  };

  const value = {
    user,
    loading,
    isTeacherEmail,
    isSuperAdmin,
    signOut // Add the signOut function to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}