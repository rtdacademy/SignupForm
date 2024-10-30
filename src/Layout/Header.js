import React from 'react';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

function Header({ user, onLogout, onBackClick, onDashboardClick, portalType }) {
  const location = useLocation();
  const isTeacherDashboard = location.pathname === '/teacher-dashboard';

  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'User';
    }
    return 'User';
  };

  return (
    <header className="bg-primary text-white py-2 shadow-md">
      <div className="container mx-auto px-3 flex justify-between items-center h-8">
        {/* Left section with title */}
        <div className="flex items-center justify-end lg:justify-start w-2/3 lg:w-1/3">
          <div className="hidden lg:block mr-3">
            {onBackClick && (
              <button 
                onClick={onBackClick} 
                className="text-highlight hover:text-secondary transition-colors duration-200 text-sm"
              >
                <FaArrowLeft className="inline mr-1 text-xs" /> Back
              </button>
            )}
          </div>
          <div className="flex items-center whitespace-nowrap">
            <h1 
              className="text-base font-bold cursor-pointer hover:text-highlight transition-colors duration-200 mr-2"
              onClick={onDashboardClick}
            >
              RTD Academy
            </h1>
            <h2 className="text-xs font-semibold text-primary bg-highlight px-2 py-0.5 rounded">
              {portalType}
            </h2>
          </div>
        </div>

        {/* Empty middle section - hidden on mobile */}
        <div className="hidden lg:block w-1/3" />

        {/* Right section */}
        {user && (
          <div className="flex items-center justify-end space-x-3 w-1/3">
            <span className="hidden lg:inline-block text-highlight text-sm">
              Welcome, {getUserDisplayName()}!
            </span>
            <button 
              onClick={onLogout} 
              className="flex items-center space-x-1 bg-tertiary hover:bg-secondary text-white transition-colors duration-200 px-2 py-1 rounded text-sm"
            >
              <FaSignOutAlt className="text-xs" /> 
              <span className="hidden lg:inline-block">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;