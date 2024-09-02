import React from 'react';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';

function Header({ user, onLogout, onBackClick, onDashboardClick }) {
  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'Student';
    }
    return 'Student';
  };

  return (
    <header className={`rtd-header ${onBackClick ? 'with-back-button' : ''}`}>
      <div className="header-content">
        <div className="branding">
          {onBackClick && (
            <button onClick={onBackClick} className="back-button">
              <FaArrowLeft /> Back
            </button>
          )}
          <h1 className="company-name" onClick={onDashboardClick}>RTD Academy</h1>
          <h2 className="portal-title">Student Portal</h2>
        </div>
        {user && (
          <div className="user-actions">
            <span className="welcome-message">Welcome, {getUserDisplayName()}!</span>
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