import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { NotebookPen } from 'lucide-react';
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
import { ImportantDatesCard } from './ImportantDatesCard';
import Header from '../Layout/Header';

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

  // Open profile if forced or requested
  useEffect(() => {
    if (forceProfileOpen) {
      setIsProfileOpen(true);
    }
  }, [forceProfileOpen]);

  if (authLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={showBackButton ? handleBackClick : null}
          onDashboardClick={() => {}} // Already on dashboard
          portalType="Student Portal"
          isEmulating={isEmulating}
          isStaffUser={false}
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
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={showBackButton ? handleBackClick : null}
          onDashboardClick={() => {}} // Already on dashboard
          portalType="Student Portal"
          isEmulating={isEmulating}
          isStaffUser={false}
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
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={showBackButton ? handleBackClick : null}
          onDashboardClick={() => {}} // Already on dashboard
          portalType="Student Portal"
          isEmulating={isEmulating}
          isStaffUser={false}
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

  if (showLMS && selectedCourse) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          onDashboardClick={() => {
            setSelectedCourse(null);
            setShowLMS(false);
          }}
          portalType="Student Portal"
          isEmulating={isEmulating}
          isStaffUser={false}
          onProfileClick={() => setIsProfileOpen(true)}
          profile={profile}
          hasIncompleteProfile={!hasRequiredFields}
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
        
        {/* Profile Component as a Sheet */}
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
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={showBackButton ? handleBackClick : null}
        onDashboardClick={() => {}} // Already on dashboard
        portalType="Student Portal"
        isEmulating={isEmulating}
        isStaffUser={false}
        onProfileClick={() => setIsProfileOpen(true)}
        profile={profile}
        hasIncompleteProfile={!hasRequiredFields}
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
            {/* Main content: Courses */}
            <div className="lg:w-3/4 space-y-6 flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <NotebookPen className="h-5 w-5 mr-2 text-blue-600" />
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
                      profile={profile}
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

            {/* Right Column: Important Dates Only (Profile Card Removed) */}
            <div className="lg:w-1/4 space-y-6">
              {/* Important Dates Card */}
              <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <NotebookPen className="h-5 w-5 mr-2 text-blue-600" />
                    Important Dates
                  </h3>
                </CardHeader>
                <CardContent className="p-4">
                  <ImportantDatesCard />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Profile Component as a Sheet */}
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