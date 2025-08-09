import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  UserPlus, 
  AlertTriangle, 
  UserCheck, 
  Globe, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { getAllFacilitators } from '../config/facilitators';
import { useAuth } from '../context/AuthContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';

// RTD Connect Logo component matching the Dashboard.js styling
const RTDConnectLogo = () => (
  <div className="flex items-center space-x-3">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-12 w-auto"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-sm text-gray-600">Home Education Staff Portal</p>
    </div>
  </div>
);

function HomeEducationHeader({ 
  user, 
  onLogout,
  // Home Education specific props
  showMyFamiliesOnly,
  setShowMyFamiliesOnly,
  impersonatingFacilitator,
  setImpersonatingFacilitator,
  showImpersonationDropdown,
  setShowImpersonationDropdown,
  stats
}) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'User';
    }
    return 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left section - RTD Connect branding */}
          <div className="flex items-center space-x-6">
            <RTDConnectLogo />
          </div>

          {/* Center section - Home Education Controls */}
          <div className="flex items-center space-x-4">
            {/* Admin Impersonation Dropdown */}
            {(isAdmin || user?.email === 'kyle@rtdacademy.com') && (
              <div className="relative">
                <button
                  onClick={() => setShowImpersonationDropdown(!showImpersonationDropdown)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    impersonatingFacilitator 
                      ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Test as different facilitator"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm">
                    {impersonatingFacilitator 
                      ? `Testing as: ${impersonatingFacilitator.name}`
                      : 'Test as Facilitator'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showImpersonationDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showImpersonationDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 px-3 py-2">
                        TEST AS FACILITATOR
                      </div>
                      {getAllFacilitators().map(facilitator => (
                        <button
                          key={facilitator.id}
                          onClick={() => {
                            setImpersonatingFacilitator(facilitator);
                            setShowImpersonationDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                            impersonatingFacilitator?.id === facilitator.id ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {facilitator.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {facilitator.contact.email}
                          </div>
                        </button>
                      ))}
                      <div className="border-t mt-2 pt-2">
                        <button
                          onClick={() => {
                            setImpersonatingFacilitator(null);
                            setShowImpersonationDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-sm text-red-600">
                            Stop Impersonating
                          </div>
                          <div className="text-xs text-gray-500">
                            Return to your own view
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <button
                onClick={() => setShowMyFamiliesOnly(!showMyFamiliesOnly)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showMyFamiliesOnly 
                    ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showMyFamiliesOnly ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>My Families ({stats.myFamilies})</span>
                    <ToggleRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>All Families ({stats.totalFamilies})</span>
                    <ToggleLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right section - User info and logout */}
          {user && (
            <div className="flex items-center space-x-6">
              <span className="text-gray-700 text-sm hidden lg:inline">
                Welcome, {getUserDisplayName()}
              </span>
              
              <button 
                onClick={onLogout} 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
              >
                <FaSignOutAlt /> 
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {impersonatingFacilitator && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              Testing Mode: Viewing as {impersonatingFacilitator.name} ({impersonatingFacilitator.contact.email})
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

export default HomeEducationHeader;