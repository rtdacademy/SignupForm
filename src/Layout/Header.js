import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { useMode, MODES } from '../context/ModeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../components/ui/tooltip";

const RTDLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 75 75" 
    className="h-10 w-10"
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 25)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#008B8B"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#20B2AA"/>
    </g>
  </svg>
);

function Header({ 
  user, 
  onLogout, 
  onBackClick, 
  onDashboardClick, 
  portalType, 
  isEmulating, 
  isStaffUser,
  onProfileClick,
  profile,
  hasIncompleteProfile,
  parentInfo
}) {
  const navigate = useNavigate();
  const { 
    currentSchoolYear, 
    setCurrentSchoolYear, 
    schoolYearOptions, 
    refreshStudentSummaries,
    isLoadingStudents 
  } = useSchoolYear();
  const { currentMode } = useMode();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the currently selected option or default to the first option
  const selectedOption = schoolYearOptions.find(opt => opt.value === currentSchoolYear) || 
                          schoolYearOptions.find(opt => opt.isDefault) || 
                          schoolYearOptions[0];

  // Ensure we have a valid selection on initial render
  useEffect(() => {
    if (currentSchoolYear !== selectedOption?.value && selectedOption) {
      setCurrentSchoolYear(selectedOption.value);
    }
  }, [currentSchoolYear, selectedOption, setCurrentSchoolYear]);

  const getUserDisplayName = () => {
    if (profile) {
      if (profile.preferredFirstName) {
        return profile.preferredFirstName;
      } else if (profile.firstName) {
        return profile.firstName;
      }
    }
    
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'User';
    }
    return 'User';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshStudentSummaries();
    // Add a slight delay to show the refresh animation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="h-16 flex justify-between items-center">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            {onBackClick && (
              <button 
                onClick={onBackClick} 
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <FaArrowLeft className="text-sm" />
              </button>
            )}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={onDashboardClick}
            >
              <RTDLogo />
              <div className="flex flex-col">
                <h1 className="text-white text-lg font-semibold group-hover:text-gray-200 transition-colors duration-200">
                  RTD Academy
                </h1>
                <div className="text-xs font-medium text-gray-300">
                  {portalType} {isEmulating && '(Emulation Mode)'}
                </div>
              </div>
            </div>
            
            {/* Parent Info Display - Only for parent portal */}
            {parentInfo && portalType === "Parent Portal" && (
              <div className="ml-6 flex items-center space-x-4 text-sm">
                <div className="text-gray-300">
                  <span className="text-gray-400">Parent:</span>
                  <span className="ml-2 text-white font-medium">{parentInfo.name}</span>
                </div>
                <div className="text-gray-300">
                  <span className="text-gray-400">Email:</span>
                  <span className="ml-2 text-gray-200">{parentInfo.email}</span>
                </div>
                {parentInfo.linkedStudents && parentInfo.linkedStudents.length > 0 && (
                  <div className="text-gray-300">
                    <span className="text-gray-400">
                      {parentInfo.linkedStudents.length === 1 ? 'Student:' : 'Students:'}
                    </span>
                    <span className="ml-2 text-gray-200">
                      {parentInfo.linkedStudents.map((student, index) => (
                        <span key={index}>
                          {student.name} ({student.relationship})
                          {index < parentInfo.linkedStudents.length - 1 && ', '}
                        </span>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* School Year Selector with Refresh Button - Only for staff */}
            {isStaffUser && selectedOption && (
              <div className="ml-6 flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 text-sm flex items-center gap-2">
                    <span>School Year: </span>
                    <span 
                      className="font-medium"
                      style={{ 
                        color: selectedOption.color || 'inherit'
                      }}
                    >
                      {selectedOption.value}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {schoolYearOptions.map(option => (
                      <DropdownMenuItem 
                        key={option.value}
                        onClick={() => setCurrentSchoolYear(option.value)}
                        className={currentSchoolYear === option.value ? "bg-blue-50" : ""}
                      >
                        <span style={{ color: option.color }}>
                          {option.value}
                        </span>
                        {option.isDefault && (
                          <span className="ml-2 text-xs text-gray-500">(Current)</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Refresh Button - Only visible in registration mode */}
                {currentMode === MODES.REGISTRATION && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={isLoadingStudents || isRefreshing}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 h-7"
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                          <span className="text-xs">Refresh</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs max-w-xs">
                          Although data is updated in realtime, you will need to refresh to see NEW registrations.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          {/* Right section */}
          {user && (
            <div className="flex items-center space-x-6">
              {isStaffUser && (
                <button
                  onClick={() => navigate('/employee-portal')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  <FaUserCircle />
                  <span className="hidden lg:inline">Employee Portal</span>
                </button>
              )}
              <span className="text-gray-300 text-sm hidden lg:inline">
                Welcome, {getUserDisplayName()}
              </span>
              
              {/* Profile Button */}
              {onProfileClick && !isStaffUser && (
                <button 
                  onClick={onProfileClick} 
                  className="relative flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  title="View Profile"
                >
                  <FaUserCircle className="text-xl" /> 
                  <span className="hidden lg:inline">Profile</span>
                  
                  {/* Notification indicator for incomplete profile */}
                  {hasIncompleteProfile && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>
              )}
              
              {!isEmulating && (
                <button 
                  onClick={onLogout} 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  <FaSignOutAlt /> 
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {isEmulating && (
        <div className="bg-blue-600 text-white px-4 py-2 text-sm text-center">
          <AlertCircle className="w-4 h-4 inline-block mr-1" />
          You are currently viewing the portal as {user.email}
        </div>
      )}
    </header>
  );
}

export default Header;