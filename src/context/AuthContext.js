import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from "firebase/database";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (isStaff(currentUser)) {
          await ensureStaffNode(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isStaff = (user) => {
    return user && user.email.endsWith("@rtdacademy.com");
  };

  const ensureStaffNode = async (user) => {
    const db = getDatabase();
    const staffRef = ref(db, `staff/${user.uid}`);
    const snapshot = await get(staffRef);
    if (!snapshot.exists()) {
      // Create the staff node if it doesn't exist
      await set(staffRef, {
        email: user.email,
        displayName: user.displayName || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        provider: user.providerData[0].providerId
      });
    } else {
      // Update last login time if the node already exists
      await set(ref(db, `staff/${user.uid}/lastLogin`), new Date().toISOString());
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
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