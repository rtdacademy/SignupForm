import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from "firebase/database";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [user_email_key, setUserEmailKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const emailKey = sanitizeEmail(currentUser.email);
        setUserEmailKey(emailKey);
        if (isStaff(currentUser)) {
          await ensureStaffNode(currentUser, emailKey);
        }
      } else {
        setUser(null);
        setUserEmailKey(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isStaff = (user) => {
    return user && user.email.endsWith("@rtdacademy.com");
  };

  const ensureStaffNode = async (user, emailKey) => {
    const db = getDatabase();
    const staffRef = ref(db, `staff/${emailKey}`);
    const snapshot = await get(staffRef);
    if (!snapshot.exists()) {
      await set(staffRef, {
        email: user.email,
        displayName: user.displayName || null,
        firstName: user.displayName ? user.displayName.split(' ')[0] : null,
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : null,
        photoURL: user.photoURL || null,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        provider: user.providerData[0].providerId
      });
    } else {
      await set(ref(db, `staff/${emailKey}/lastLogin`), Date.now());
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserEmailKey(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    user_email_key,
    loading,
    isStaff,
    ensureStaffNode,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}