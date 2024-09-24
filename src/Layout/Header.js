import React from 'react';
import { FaSignOutAlt, FaArrowLeft, FaBars } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

function Header({ user, onLogout, onBackClick, onDashboardClick, onSidebarToggle, portalType }) {
  const location = useLocation();

  // Check if the current location is the teacher dashboard
  const isTeacherDashboard = location.pathname === '/teacher-dashboard';

  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'User';
    }
    return 'User';
  };

  return (
    <header className="bg-primary text-white py-3 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          {onBackClick && (
            <button onClick={onBackClick} className="text-highlight hover:text-secondary transition-colors duration-200">
              <FaArrowLeft className="inline mr-2" /> Back
            </button>
          )}
          {isTeacherDashboard && (
            <button onClick={onSidebarToggle} className="text-highlight hover:text-secondary transition-colors duration-200">
              <FaBars className="text-xl" />
            </button>
          )}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold cursor-pointer text-secondary hover:text-highlight transition-colors duration-200" onClick={onDashboardClick}>RTD Academy</h1>
            <h2 className="text-sm font-semibold text-primary bg-highlight px-3 py-1 rounded-md">
              {portalType}
            </h2>
          </div>
        </div>
        {user && (
          <div className="flex items-center space-x-6">
            <span className="hidden sm:inline-block text-highlight">Welcome, {getUserDisplayName()}!</span>
            <button onClick={onLogout} className="flex items-center space-x-2 bg-tertiary hover:bg-secondary text-white transition-colors duration-200 px-4 py-2 rounded">
              <FaSignOutAlt /> <span className="hidden sm:inline-block">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
