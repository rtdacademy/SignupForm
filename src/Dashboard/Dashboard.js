import React, { useState, useCallback } from 'react';
import { FaUser, FaPlusCircle, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import FormDialog from '../Registration/FormDialog';
import ProfileComponent from './ProfileComponent';
import CourseCard from './CourseCard';
import LMSWrapper from './LMSWrapper';
import { useAuth } from '../context/AuthContext';
import { useStudentData } from './hooks/useStudentData';
import { useNavigate } from 'react-router-dom';

// Constants for triangles
const TRIANGLE_SIZE = 220;

// Static Triangle Component with random position
const StaticTriangle = ({ color }) => {
  // Calculate random position once when the component mounts
  const [randomPosition] = useState(() => ({
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - TRIANGLE_SIZE : 500),
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - TRIANGLE_SIZE : 500),
    rotation: Math.random() * 360, // Random rotation between 0 and 360 degrees
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
const DashboardHeader = ({ user, onLogout, onBackClick, showBackButton }) => {
  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email.split('@')[0] || 'User';
    }
    return 'User';
  };

  return (
    <header className="w-full bg-gray-200 text-gray-600 shadow-lg transition-all duration-200">
      <div className="container mx-auto px-4">
        <div className="h-16 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {showBackButton && (
              <button 
                onClick={onBackClick} 
                className="text-gray-500"
              >
                <FaArrowLeft className="text-sm" />
              </button>
            )}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <RTDLogo />
              <div className="flex flex-col">
                <h1 className="text-gray-800 text-lg font-semibold">
                  RTD Academy
                </h1>
                <div className="text-xs font-medium text-gray-500">
                  Student Portal
                </div>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <span className="text-gray-500 text-sm hidden lg:inline">
                Welcome, {getUserDisplayName()}
              </span>
              <button 
                onClick={onLogout} 
                className="flex items-center space-x-2 text-gray-500 text-sm"
              >
                <FaSignOutAlt /> 
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};



const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, user_email_key, loading: authLoading } = useAuth();
  const { courses, profile, loading: dataLoading, error, studentExists } = useStudentData(user_email_key);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [showLMS, setShowLMS] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate]);

  const handleBackClick = useCallback(() => {
    if (showLMS) {
      setShowLMS(false);
      setSelectedCourse(null);
    } else if (selectedCourse) {
      setSelectedCourse(null);
    }
  }, [showLMS, selectedCourse]);

  const showBackButton = showLMS || selectedCourse;

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          user={user}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={showBackButton}
        />
        <div className="flex justify-center items-center flex-1">
          <div className="text-gray-600">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Show data loading state
  if (dataLoading) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          user={user}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={showBackButton}
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
          user={user}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={showBackButton}
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

  // If LMS is active, render the LMS wrapper with course data
  if (showLMS && selectedCourse) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          user={user}
          onLogout={handleLogout}
          onBackClick={handleBackClick}
          showBackButton={true}
        />
        <div className="flex-1">
          <LMSWrapper
            userEmailKey={user.email}
            courseId={selectedCourse.CourseID}
            courseData={selectedCourse}
            onReturn={handleBackClick}
          />
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader 
        user={user}
        onLogout={handleLogout}
        onBackClick={handleBackClick}
        showBackButton={showBackButton}
      />
      
      <div className="flex-1 relative">
        {/* Background SVG layer */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" className="absolute top-0 left-0">
            <StaticTriangle color="#49a3a6" />
            <StaticTriangle color="#b1dbda" />
            <StaticTriangle color="#0d8081" />
          </svg>
        </div>

        {/* Content layer */}
        <div className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col overflow-auto">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <FormDialog
              trigger={
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90 text-white text-lg py-3 transition-all duration-200"
                >
                  <FaPlusCircle className="mr-2" /> Register for a New Course
                </Button>
              }
              open={isFormDialogOpen}
              onOpenChange={setIsFormDialogOpen}
            />
          </div>

          {/* Welcome Message */}
          <div className="mb-6">
            <WelcomeMessage
              hasStudentNode={!!profile}
              hasCourses={courses.length > 0}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            {/* Left Column: Courses */}
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
      user_email_key = {user_email_key}
        key={course.CourseID || course.id}
        course={course}
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
                  <CardContent>
                    <Button
                      className="w-full bg-customGreen-dark hover:bg-customGreen-hover text-white shadow-sm border-customGreen-dark"
                      onClick={() => setIsProfileOpen(true)}
                    >
                      <FaUser className="mr-2" /> View Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Profile Sheet - Only render if student exists */}
          {studentExists && (
            <ProfileComponent
              isOpen={isProfileOpen}
              onOpenChange={setIsProfileOpen}
              profile={profile}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
