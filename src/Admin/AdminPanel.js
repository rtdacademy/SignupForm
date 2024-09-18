import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue, remove, get } from "firebase/database";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaLock } from 'react-icons/fa';
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

function AdminPanel() {
  const [adminEmails, setAdminEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();

  const PROTECTED_EMAIL = 'kyle@rtdacademy,com'; // Note the comma here

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isStaff(user)) {
      navigate('/dashboard');
      return;
    }

    const db = getDatabase();
    const adminEmailsRef = ref(db, 'adminEmails');
    onValue(adminEmailsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAdminEmails(Object.keys(data));
      }
    });
  }, [user, isStaff, navigate]);

  const getSafeEmailPath = (email) => {
    return email.replace(/\./g, ',');
  };

  const getOriginalEmail = (email) => {
    return email.replace(/,/g, '.');
  };

  const addAdminEmail = async () => {
    if (newEmail && newEmail.includes('@')) {
      const db = getDatabase();
      const auth = getAuth();
      
      try {
        // Check if the email is associated with an existing account
        const signInMethods = await fetchSignInMethodsForEmail(auth, newEmail);
        if (signInMethods.length === 0) {
          alert("This email is not associated with any existing account.");
          return;
        }

        // Get the UID for this email
        const userSnapshot = await get(ref(db, 'users'));
        const users = userSnapshot.val();
        const userEntry = Object.entries(users).find(([_, userData]) => userData.email === newEmail);
        
        if (!userEntry) {
          alert("User not found in the database.");
          return;
        }

        const [uid, _] = userEntry;

        // Set up the admin status
        await set(ref(db, `adminStatus/${uid}`), true);
        await set(ref(db, `adminEmails/${getSafeEmailPath(newEmail.toLowerCase())}`), true);
        
        setNewEmail('');
      } catch (error) {
        console.error("Error adding admin:", error);
        alert("An error occurred while adding the admin.");
      }
    }
  };

  const removeAdminEmail = async (email) => {
    if (email !== PROTECTED_EMAIL) {
      const db = getDatabase();
      try {
        // Remove from adminEmails
        await remove(ref(db, `adminEmails/${email}`));

        // Remove from adminStatus
        const userSnapshot = await get(ref(db, 'users'));
        const users = userSnapshot.val();
        const userEntry = Object.entries(users).find(([_, userData]) => getSafeEmailPath(userData.email) === email);
        
        if (userEntry) {
          const [uid, _] = userEntry;
          await remove(ref(db, `adminStatus/${uid}`));
        }
      } catch (error) {
        console.error("Error removing admin:", error);
        alert("An error occurred while removing the admin.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
  
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Email Management</h1>
        <div className="flex mb-4">
          <input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            placeholder="New admin email"
            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={addAdminEmail} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition duration-200"
          >
            <FaPlus className="mr-2" /> Add Admin
          </button>
        </div>
        <ul className="space-y-2">
          {adminEmails.map(email => (
            <li key={email} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{getOriginalEmail(email)}</span>
              {email === PROTECTED_EMAIL ? (
                <span className="flex items-center text-gray-500">
                  <FaLock className="mr-1" /> Protected
                </span>
              ) : (
                <button 
                  onClick={() => removeAdminEmail(email)} 
                  className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                >
                  <FaTrash className="mr-1" /> Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;