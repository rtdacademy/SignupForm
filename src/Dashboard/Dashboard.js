import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FaUser, FaPlusCircle, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { ChevronRight, AlertCircle, Home } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import FormDialog from '../Registration/FormDialog';
import WelcomeDialog from './WelcomeDialog';
import MigrationWelcomeDialog from '../migration/MigrationWelcomeSheet';
import ProfileComponent from './ProfileComponent';
import CourseCard from './CourseCard';
import LMSWrapper from './LMSWrapper';
import { useAuth } from '../context/AuthContext';
import { useStudentData } from './hooks/useStudentData';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import ModernCourseViewer from '../courses/CourseViewer/ModernCourseViewer';
import { useModernCourse } from './hooks/useModernCourse';



// Constants for triangles
const TRIANGLE_SIZE = 220;

// Static Triangle Component with random position
const StaticTriangle = ({ color }) => {
  const [randomPosition] = useState(() => ({
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - TRIANGLE_SIZE : 500),
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - TRIANGLE_SIZE : 500),
    rotation: Math.random() * 360,
  }));

  const points = `
    ${randomPosition.x + TRIANGLE_SIZE / 2},${randomPosition.y}
    ${randomPosition.x},${randomPosition.y + TRIANGLE_SIZE}
    ${randomPosition.x + TRIANGLE_SIZE},${randomPosition.y + TRIANGLE_SIZE}
  `;

  return (
    <polygon
      points={points}
      fill={color}
      opacity="0.15"
      transform={`rotate(${randomPosition.rotation} ${randomPosition.x + TRIANGLE_SIZE / 2} ${randomPosition.y + TRIANGLE_SIZE / 2})`}
    />
  );
};

// RTD Logo Component
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

// Custom Welcome Message Component
const WelcomeMessage = ({ hasStudentNode, hasCourses }) => {
  if (!hasStudentNode) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Welcome to RTD Academy!</h3>
        </div>
        <p className="mt-2 text-sm">
          To get started, please click the 'Register for a New Course' button above to enroll in your first course.
        </p>
      </div>
    );
  }
  
  if (!hasCourses) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Ready to Begin Your Learning Journey?</h3>
        </div>
        <p className="mt-2 text-sm">
          You're all set up! Click the 'Register for a New Course' button above to enroll in your first course.
        </p>
      </div>
    );
  }

  return null;
};

// Dashboard Header Component
const DashboardHeader = ({ user, onLogout, onBackClick, showBackButton, isEmulating, onStopEmulation, profile }) => {
  const getUserDisplayName = () => {
    if (profile) {
      if (profile.preferredFirstName) {
        return `Welcome, ${profile.preferredFirstName}`;
      } else if (profile.firstName) {
        return `Welcome, ${profile.firstName}`;
      }
    }
    return 'Welcome to RTD Academy!';
  };

  return (
    <header className="w-full bg-gray-200 text-gray-600 shadow-lg transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="h-16 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {showBackButton && (
              <button 
                onClick={onBackClick} 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                title="Return to Dashboard"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
              </button>
            )}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <RTDLogo />
              <div className="flex flex-col">
                <h1 className="text-gray-800 text-lg font-semibold">
                  RTD Academy
                </h1>
                <div className="text-xs font-medium text-gray-500">
                  Student Portal {isEmulating && '(Emulation Mode)'}
                </div>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
             {isEmulating && (
<Button
  variant="secondary"
  size="sm"
  onClick={() => {
    onStopEmulation();
    window.close();
  }}
  className="mr-4 bg-blue-800 hover:bg-blue-900 text-white border-none transition-colors duration-200"
>
  Exit Emulation
</Button>
)}
              <span className="text-gray-700 text-lg hidden lg:inline font-semibold tracking-wide">
                {getUserDisplayName()}
              </span>
              {!isEmulating && (
                <button 
                  onClick={onLogout} 
                  className="flex items-center space-x-2 text-gray-500 text-sm"
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
        <div className="bg-blue-100 text-blue-800 px-4 py-2 text-sm flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          You are currently viewing the dashboard as {user.email}
        </div>
      )}
    </header>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    current_user_email_key, 
    signOut, 
    loading: authLoading,
    isEmulating,
    stopEmulation
  } = useAuth();
  
  const { 
    courses, 
    profile, 
    loading: dataLoading, 
    error, 
    studentExists 
  } = useStudentData(current_user_email_key);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [showLMS, setShowLMS] = useState(false);
  
  // Only set showWelcomeDialog initially, after data is loaded
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  // New state for Migration Dialog
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);

  const [forceProfileOpen, setForceProfileOpen] = useState(false);

  const { isModernCourse, loading: courseTypeLoading } = useModernCourse(
    selectedCourse?.CourseID
  );

  

  // Helper function to check required fields
  const checkRequiredFields = (profileData) => {
    if (!profileData) return false;
    
    const requiredFields = ['firstName', 'lastName', 'preferredFirstName', 'StudentPhone', 'gender'];
    return requiredFields.every(field => {
      const value = profileData[field];
      return value && String(value).trim() !== '';
    });
  };


  // Add these two functions
const getMissingFields = (profileData) => {
  if (!profileData) return [];
  
  const required = [
    { key: 'firstName', label: 'first name' },
    { key: 'lastName', label: 'last name' },
    { key: 'preferredFirstName', label: 'preferred name' },
    { key: 'StudentPhone', label: 'phone number' },
    { key: 'gender', label: 'gender' }
  ];
  
  return required.filter(field => 
    !profileData[field.key] || !String(profileData[field.key]).trim()
  ).map(field => field.label);
};

// Use useMemo to calculate these values
const hasRequiredFields = useMemo(() => {
  return checkRequiredFields(profile);
}, [profile]);

const missingFields = useMemo(() => {
  return getMissingFields(profile);
}, [profile]);

  // Once data is loaded, determine if we need to show the welcome dialog
  useEffect(() => {
    if (!dataLoading && courses.length === 0) {
      setShowWelcomeDialog(true);
    }
  }, [dataLoading, courses.length]);

  // Effect to handle the migration dialog
  useEffect(() => {
    const checkMigrationMessage = async () => {
      if (currentUser?.uid) {
        const db = getDatabase();
        const messageRef = ref(db, `users/${currentUser.uid}/readMigrationMessage`);
        const snapshot = await get(messageRef);
        
        // Show migration dialog if user is migrated and hasn't dismissed the message
        if (currentUser.isMigratedUser && !snapshot.exists()) {
          setShowMigrationDialog(true);
        }
      }
    };

    if (!dataLoading && currentUser) {
      checkMigrationMessage();
    }
  }, [dataLoading, currentUser]);

  // Updated useEffect with helper function and logging
  useEffect(() => {
    if (profile && !dataLoading) {
      const hasAllRequiredFields = checkRequiredFields(profile);
      
      console.log('Profile check:', {
        profile,
        hasAllRequiredFields,
        fields: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          preferredFirstName: profile.preferredFirstName,
          StudentPhone: profile.StudentPhone,
          gender: profile.gender
        }
      });
      
      // Only update if the value would actually change
      if (!hasAllRequiredFields !== forceProfileOpen) {
        setForceProfileOpen(!hasAllRequiredFields);
      }
      
      // Only close if fields are complete and it was forced open
      if (hasAllRequiredFields && forceProfileOpen) {
        setIsProfileOpen(false);
        setForceProfileOpen(false);
      }
    }
  }, [profile, dataLoading]); // Remove forceProfileOpen from dependencies

  const handleLogout = useCallback(async () => {
    try {
      if (isEmulating) {
        stopEmulation();
      } else {
        await signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate, isEmulating, stopEmulation]);

  const handleBackClick = useCallback(() => {
    if (showLMS) {
      setShowLMS(false);
      setSelectedCourse(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    }
  }, [showLMS, selectedCourse]);

  const showBackButton = showLMS || selectedCourse;

  // Memoize the trigger button to prevent unnecessary re-mounts
  const triggerButton = useMemo(() => (
    <Button
      variant="default"
      className={`
        relative bg-gradient-to-r from-blue-600/80 to-purple-600/80
        hover:from-blue-700/90 hover:to-purple-700/90
        text-white text-lg py-3
        ${(!dataLoading && (!studentExists || courses.length === 0)) ? 'animate-bounce' : ''}
      `}
    >
      <FaPlusCircle className="mr-2" /> Register for a New Course
    </Button>
  ), [dataLoading, studentExists, courses.length]);

  if (authLoading) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={showBackButton}
          isEmulating={isEmulating}
          onStopEmulation={stopEmulation}
          profile={profile}
        />
        <div className="flex justify-center items-center flex-1">
          <div className="text-gray-600">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={showBackButton}
          isEmulating={isEmulating}
          onStopEmulation={stopEmulation}
          profile={profile}
        />
        <div className="flex justify-center items-center flex-1">
          <div className="text-gray-600">Loading your courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={showBackButton}
          isEmulating={isEmulating}
          onStopEmulation={stopEmulation}
          profile={profile}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Error Loading Data</h3>
            </div>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }



// Then update your render logic:
if (showLMS && selectedCourse) {
  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={handleBackClick}
        showBackButton={true}
        isEmulating={isEmulating}
        onStopEmulation={stopEmulation}
        profile={profile}
      />
      <div className="flex-1">
        {courseTypeLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-600">Loading course...</div>
          </div>
        ) : isModernCourse ? (
          <ModernCourseViewer 
          courseId={selectedCourse.CourseID}
          studentCourseData={selectedCourse}
          profile={profile}  
          previewMode={false}
        />
        ) : (
          <LMSWrapper
            courseId={selectedCourse.CourseID}
            courseData={selectedCourse}
            onReturn={handleBackClick}
          />
        )}
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={handleBackClick}
        showBackButton={showBackButton}
        isEmulating={isEmulating}
        onStopEmulation={stopEmulation}
        profile={profile}
      />
      
      {/* Migration Welcome Dialog */}
      <MigrationWelcomeDialog 
        isOpen={showMigrationDialog} 
        onOpenChange={setShowMigrationDialog}
        currentUser={currentUser}
      />

      {/* Existing Welcome Dialog */}
      {courses.length === 0 && (
        <WelcomeDialog 
          isOpen={showWelcomeDialog} 
          onOpenChange={setShowWelcomeDialog}
        />
      )}

      <div className="flex-1 relative">
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" className="absolute top-0 left-0">
            <StaticTriangle color="#49a3a6" />
            <StaticTriangle color="#b1dbda" />
            <StaticTriangle color="#0d8081" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col overflow-auto">
          {!isEmulating && (
            <div className="grid grid-cols-1 gap-4 mb-6">
              <FormDialog
                trigger={triggerButton}
                open={isFormDialogOpen}
                onOpenChange={(open) => {
                  setIsFormDialogOpen(open);
                  if (open) {
                    setShowWelcomeDialog(false);
                  }
                }}
              />
            </div>
          )}

          <div className="mb-6">
            <WelcomeMessage
              hasStudentNode={!!profile}
              hasCourses={courses.length > 0}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            <div className="lg:w-2/3 space-y-6 flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-background to-muted">
                  <h3 className="text-xl font-semibold flex items-center">
                    <ChevronRight className="h-6 w-6 mr-2 text-primary" />
                    My Courses
                  </h3>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-6 p-6">
                {courses.length > 0 ? (
  courses.map((course) => (
    <CourseCard
      user_email_key={current_user_email_key}
      key={course.CourseID || course.id}
      course={course}
      profile={profile}  // Add this line
      onViewDetails={() => setSelectedCourse(course)}
      onGoToCourse={() => {
        setSelectedCourse(course);
        setShowLMS(true);
      }}
                        customActions={
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowLMS(false);
                              }}
                              className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                              size="sm"
                            >
                              View Details
                            </Button>
                            <Button
                              className="flex-1 bg-customGreen-dark hover:bg-customGreen-hover text-white shadow-sm border-customGreen-dark"
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowLMS(true);
                              }}
                            >
                              Go to Course
                            </Button>
                          </div>
                        }
                        showProgressBar={true}
                        showGradeInfo={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No courses enrolled yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Profile - Only show if student exists */}
            {studentExists && (
              <div className="lg:w-1/3 space-y-6">
                <Card>
                  <CardHeader className="bg-gradient-to-br from-background to-muted">
                    <h3 className="text-xl font-semibold flex items-center">
                      <ChevronRight className="h-6 w-6 mr-2 text-primary" />
                      Profile
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Button
                      variant="outline"
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 hover:border-gray-300"
                      onClick={() => setIsProfileOpen(true)}
                    >
                      <FaUser className="mr-2 text-gray-500" /> View Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

        
{studentExists && (
  <ProfileComponent
    isOpen={isProfileOpen || forceProfileOpen}
    onOpenChange={(open) => {
      // Simply update both states when closing
      if (!open) {
        setIsProfileOpen(false);
        setForceProfileOpen(false);
      } else {
        setIsProfileOpen(true);
      }
    }}
    profile={profile}
  />
)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
