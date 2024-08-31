// src/Layout/Header.js
import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

function Header({ user, onLogout }) {
  return (
    <header className="rtd-header">
      <div className="header-content">
        <div className="branding">
          <h1 className="company-name">RTD Academy</h1>
          <h2 className="portal-title">Student Portal</h2>
        </div>
        {user && (
          <div className="user-actions">
            <button onClick={onLogout} className="signout-button">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;