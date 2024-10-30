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
  const [isStaffUser, setIsStaffUser] = useState(false);

  // Helper function to check if user is staff
  const checkIsStaff = (user) => {
    return user && user.email.endsWith("@rtdacademy.com");
  };

  // Function to ensure user data exists in the database
  const ensureUserNode = async (user, emailKey) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    
    try {
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // Create new user data
        const userData = {
          uid: user.uid,
          email: user.email,
          sanitizedEmail: emailKey,
          displayName: user.displayName || null,
          firstName: user.displayName ? user.displayName.split(' ')[0] : null,
          lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : null,
          photoURL: user.photoURL || null,
          type: 'student', // Default type for non-staff users
          createdAt: Date.now(),
          lastLogin: Date.now(),
          provider: user.providerData[0].providerId,
          emailVerified: user.emailVerified
        };
        
        await set(userRef, userData);
        
        // If it's a new user, also create their notifications node
        const notificationsRef = ref(db, `notifications/${emailKey}`);
        await set(notificationsRef, {});
        
      } else {
        // Update last login time and other relevant fields
        await set(userRef, {
          ...snapshot.val(),
          lastLogin: Date.now(),
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || snapshot.val().photoURL,
          displayName: user.displayName || snapshot.val().displayName
        });
      }
    } catch (error) {
      console.error("Error ensuring user data:", error);
      throw error;
    }
  };

  const ensureStaffNode = async (user, emailKey) => {
    const db = getDatabase();
    const staffRef = ref(db, `staff/${emailKey}`);
    
    try {
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
    } catch (error) {
      console.error("Error ensuring staff data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          const emailKey = sanitizeEmail(currentUser.email);
          setUserEmailKey(emailKey);
          
          // Set staff status
          const staffStatus = checkIsStaff(currentUser);
          setIsStaffUser(staffStatus);
          
          if (staffStatus) {
            await ensureStaffNode(currentUser, emailKey);
          } else {
            await ensureUserNode(currentUser, emailKey);
          }
        } else {
          setUser(null);
          setUserEmailKey(null);
          setIsStaffUser(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserEmailKey(null);
      setIsStaffUser(false);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // For backwards compatibility, keep isStaff as a function
  const isStaff = (user) => {
    return checkIsStaff(user);
  };

  const value = {
    user,
    user_email_key,
    loading,
    isStaff,
    isStaffUser,
    ensureStaffNode,
    ensureUserNode,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;