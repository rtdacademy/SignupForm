import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaLock } from 'react-icons/fa';
import './AdminPanel.css';

function AdminPanel() {
  const [adminEmails, setAdminEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const PROTECTED_EMAIL = 'kyle@rtdacademy,com'; // Note the comma here

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkSuperAdmin = async () => {
      if (!(await isSuperAdmin(user.email))) {
        navigate('/dashboard');
      }
    };

    checkSuperAdmin();

    const db = getDatabase();
    const adminEmailsRef = ref(db, 'adminEmails');
    onValue(adminEmailsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAdminEmails(Object.keys(data));
      }
    });
  }, [user, isSuperAdmin, navigate]);

  const getSafeEmailPath = (email) => {
    return email.replace(/\./g, ',');
  };

  const getOriginalEmail = (email) => {
    return email.replace(/,/g, '.');
  };

  const addAdminEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      const db = getDatabase();
      set(ref(db, `adminEmails/${getSafeEmailPath(newEmail.toLowerCase())}`), true);
      setNewEmail('');
    }
  };

  const removeAdminEmail = (email) => {
    if (email !== PROTECTED_EMAIL) {
      const db = getDatabase();
      remove(ref(db, `adminEmails/${email}`));
    }
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-content">
        <button className="back-button" onClick={() => navigate('/teacher-dashboard')}>
          <FaArrowLeft /> Back to Teacher Dashboard
        </button>
        <h1 className="admin-panel-title">Admin Email Management</h1>
        <div className="add-admin-form">
          <input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            placeholder="New admin email"
            className="admin-input"
          />
          <button onClick={addAdminEmail} className="admin-button">
            <FaPlus /> Add Admin
          </button>
        </div>
        <ul className="admin-list">
          {adminEmails.map(email => (
            <li key={email} className="admin-list-item">
              <span>{getOriginalEmail(email)}</span>
              {email === PROTECTED_EMAIL ? (
                <span className="protected-email">
                  <FaLock /> Protected
                </span>
              ) : (
                <button onClick={() => removeAdminEmail(email)} className="remove-button">
                  <FaTrash /> Remove
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