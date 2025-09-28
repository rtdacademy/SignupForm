import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useSchoolYear } from '../context/SchoolYearContext';
import { useAuth } from '../context/AuthContext';
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
import { CreditSummaryCard } from '../Dashboard/CreditSummaryCard';
import NotificationCenterSheet from '../Dashboard/NotificationCenterSheet';

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
  parentInfo,
  hasParentAccount,
  rtdLearningTheme = false,
  logoUrl,
  // Props for student credit and notification components
  getCurrentSchoolYear,
  courses,
  markNotificationAsSeen,
  submitSurveyResponse,
  forceRefresh,
  allNotifications,
  studentExists,
  onOpenCreditSummary,
  onPaymentRequest
}) {
  const navigate = useNavigate();
  const creditSummaryRef = React.useRef(null);

  // Expose the open function to parent
  React.useEffect(() => {
    if (onOpenCreditSummary) {
      onOpenCreditSummary.current = () => {
        if (creditSummaryRef.current?.open) {
          creditSummaryRef.current.open();
        }
      };
    }
  }, [onOpenCreditSummary]);

  const handleParentDashboardClick = () => {
    navigate('/parent-dashboard');
  };
  
  // Validation logic for record limits
  const getRecordCountStyle = (total) => {
    if (total > 4000) return 'text-red-500';
    if (total > 3000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRecordCountDescription = (total) => {
    if (total > 4000) return 'Over limit';
    if (total > 3000) return 'Warning';
    return 'Normal';
  };

  const wouldExceedLimit = (currentTotal, additionalCount) => {
    return currentTotal + additionalCount > 4000;
  };

  const handleNextYearToggle = (checked) => {
    if (!checked) {
      setIncludeNextYear(false);
      return;
    }
    
    // Calculate if adding next year would exceed limit
    const potentialTotal = recordCounts.current + recordCounts.previous + recordCounts.next;
    if (wouldExceedLimit(recordCounts.current + (includePreviousYear ? recordCounts.previous : 0), recordCounts.next)) {
      alert('Adding next year data would exceed the 4,000 record limit. Please uncheck another year first.');
      return;
    }
    
    setIncludeNextYear(true);
  };

  const handlePreviousYearToggle = (checked) => {
    if (!checked) {
      setIncludePreviousYear(false);
      return;
    }
    
    // Calculate if adding previous year would exceed limit
    if (wouldExceedLimit(recordCounts.current + (includeNextYear ? recordCounts.next : 0), recordCounts.previous)) {
      alert('Adding previous year data would exceed the 4,000 record limit. Please uncheck another year first.');
      return;
    }
    
    setIncludePreviousYear(true);
  };
  const { 
    currentSchoolYear, 
    setCurrentSchoolYear, 
    schoolYearOptions, 
    refreshStudentSummaries,
    isLoadingStudents,
    includeNextYear,
    setIncludeNextYear,
    includePreviousYear,
    setIncludePreviousYear,
    recordCounts,
    getNextSchoolYear,
    getPreviousSchoolYear
  } = useSchoolYear();
  const { isAdminUser } = useAuth();
  
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
    <header className={rtdLearningTheme ? "bg-green-800 border-b border-green-700" : "bg-gray-800 border-b border-gray-700"}>
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
              {rtdLearningTheme && logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="RTD Learning" 
                  className="h-10 w-auto"
                />
              ) : (
                <RTDLogo />
              )}
              <div className="flex flex-col">
                <h1 className="text-white text-lg font-semibold group-hover:text-gray-200 transition-colors duration-200">
                  {rtdLearningTheme ? "RTD Learning" : "RTD Academy"}
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
            
            {/* School Year Selector with Multi-Year Options - Only for staff */}
            {isStaffUser && selectedOption && (
              <div className="ml-6 flex items-center space-x-4">
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
                
                {/* Multi-Year Checkboxes */}
                <div className="flex flex-col space-y-1">
                  {/* Previous Year Checkbox */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center space-x-2 text-xs text-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includePreviousYear}
                            onChange={(e) => handlePreviousYearToggle(e.target.checked)}
                            className="w-3 h-3 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                          />
                          <span className="select-none">Previous ({getPreviousSchoolYear(currentSchoolYear)})</span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">
                          Include data from the previous school year ({getPreviousSchoolYear(currentSchoolYear)}).
                          Useful for comparing year-over-year data.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Next Year Checkbox */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="flex items-center space-x-2 text-xs text-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeNextYear}
                            onChange={(e) => handleNextYearToggle(e.target.checked)}
                            className="w-3 h-3 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                          />
                          <span className="select-none">Next ({getNextSchoolYear(currentSchoolYear)})</span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">
                          Include data from the next school year ({getNextSchoolYear(currentSchoolYear)}).
                          Useful during registration periods and transitions.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Record Count Display */}
                <div className="flex flex-col items-center text-xs">
                  <div className={`font-medium ${getRecordCountStyle(recordCounts.total)}`}>
                    {recordCounts.total.toLocaleString()} / 4,000
                  </div>
                  <div className="text-gray-400">
                    {getRecordCountDescription(recordCounts.total)}
                  </div>
                </div>
                
                {/* Refresh Button - Only visible for admin users */}
                {isAdminUser && (
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
              {/* Credit Summary and Notifications for Students */}
              {(!isStaffUser || isEmulating) && studentExists && (
                <div className="flex items-center space-x-2">
                  {/* Credit Summary Card */}
                  {getCurrentSchoolYear && (
                    <CreditSummaryCard
                      ref={creditSummaryRef}
                      schoolYear={getCurrentSchoolYear}
                      compactMode={true}
                      onOpenPaymentDialog={onPaymentRequest || (() => console.log('Payment request handler not provided'))}
                    />
                  )}

                  {/* Notification Center Sheet */}
                  {courses && profile && (
                    <NotificationCenterSheet
                      courses={courses}
                      profile={profile}
                      markNotificationAsSeen={markNotificationAsSeen}
                      submitSurveyResponse={submitSurveyResponse}
                      forceRefresh={forceRefresh}
                      allNotifications={allNotifications}
                    />
                  )}
                </div>
              )}
              
              {isStaffUser && (
                <button
                  onClick={() => navigate('/employee-portal')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  <FaUserCircle />
                  <span className="hidden lg:inline">Employee Portal</span>
                </button>
              )}
              
              {/* Parent Dashboard Button - Only show for non-staff users who have a parent account */}
              {!isStaffUser && hasParentAccount && (
                <button
                  onClick={handleParentDashboardClick}
                  className="flex items-center space-x-2 text-purple-300 hover:text-purple-200 text-sm transition-colors duration-200"
                  title="Access Parent Dashboard"
                >
                  <FaUserCircle />
                  <span className="hidden lg:inline">Parent Portal</span>
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
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors duration-200"
              >
                <FaSignOutAlt />
                <span className="hidden lg:inline">{isEmulating ? 'Exit Emulation' : 'Sign Out'}</span>
              </button>
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
      {/* Record Count Warning Banner */}
      {isStaffUser && recordCounts.total > 3000 && (
        <div className={`px-4 py-2 text-sm text-center ${
          recordCounts.total > 4000 
            ? 'bg-red-600 text-white' 
            : 'bg-yellow-500 text-black'
        }`}>
          <AlertCircle className="w-4 h-4 inline-block mr-1" />
          {recordCounts.total > 4000 
            ? `Record limit exceeded: ${recordCounts.total.toLocaleString()} / 4,000 records. Please uncheck a year to continue.`
            : `Approaching record limit: ${recordCounts.total.toLocaleString()} / 4,000 records loaded.`
          }
        </div>
      )}
    </header>
  );
}

export default Header;