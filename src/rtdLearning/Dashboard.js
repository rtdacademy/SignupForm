import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { NotebookPen, AlertCircle, CheckCircle, Clock, UserX } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../Layout/Header';
import CourseCatalog from './components/CourseCatalog';

// Import actual components or keep as null if not needed
const FormDialog = ({ isOpen, onOpenChange, triggerButton }) => null;
const WelcomeDialog = ({ isOpen, onOpenChange }) => null;
const MigrationWelcomeDialog = ({ isOpen, onOpenChange, currentUser }) => null;
const ProfileComponent = ({ isOpen, onOpenChange, profile }) => null;
const CourseCard = ({ course }) => null;
const LMSWrapper = ({ courseId, courseData, onReturn }) => null;
const FirebaseCourseWrapper = ({ course, profile }) => null;
const ModernCourseViewer = ({ courseId, studentCourseData, profile, previewMode }) => null;
const ImportantDatesCard = () => null;
const NotificationCenter = () => null;

// Constants for triangles
const TRIANGLE_SIZE = 220;

// Static Triangle Component with random position - updated to use green shades
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
      opacity="0.08"
      transform={`rotate(${randomPosition.rotation} ${randomPosition.x + TRIANGLE_SIZE / 2} ${randomPosition.y + TRIANGLE_SIZE / 2})`}
    />
  );
};

// Blacklist Notification Component
const BlacklistNotification = ({ isBlacklisted }) => {
  if (!isBlacklisted) return null;

  return (
    <Alert className="border-red-200 bg-red-50 mb-6">
      <UserX className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-2">
          <p className="font-medium">Registration Currently Unavailable</p>
          <p className="text-sm">
            We are unable to process new course registrations for your account at this time. 
            If you believe this is an error or need assistance, please contact our school administration.
          </p>
          <p className="text-sm font-medium">
            Contact: <a href="mailto:info@rtdlearning.com" className="text-red-700 underline">info@rtdlearning.com</a>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Custom Welcome Message Component - updated with green theme
const WelcomeMessage = ({ hasStudentNode, hasCourses, hasRequiredCoursesOnly }) => {
  if (!hasStudentNode) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Welcome to RTD Learning!</h3>
        </div>
        <p className="mt-2 text-sm">
          To get started, please click the 'Register for a New Course' button above to enroll in your first course.
        </p>
      </div>
    );
  }

  if (!hasCourses) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Ready to Begin Your Learning Journey?</h3>
        </div>
        <p className="mt-2 text-sm">
          You're all set up! Click the 'Register for a New Course' button above to enroll in your first course.
        </p>
      </div>
    );
  }

  if (hasRequiredCoursesOnly) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Ready to Start Your Required Courses</h3>
        </div>
        <p className="mt-2 text-sm">
          You have been automatically enrolled in required courses. You can also register for additional courses by clicking the 'Register for a New Course' button above.
        </p>
      </div>
    );
  }

  return null;
};

const RTDLearningDashboard = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    signOut, 
    isEmulating,
    stopEmulation
  } = useAuth();
  
  // Sample data for the demo
  const profile = { firstName: 'John', lastName: 'Doe' };
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      if (isEmulating) {
        stopEmulation();
      } else {
        await signOut();
        navigate('/rtd-learning-login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate, isEmulating, stopEmulation]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={null}
        onDashboardClick={() => {}}
        portalType="RTD Learning Portal"
        isEmulating={isEmulating}
        isStaffUser={false}
        onProfileClick={() => setIsProfileOpen(true)}
        profile={profile}
        hasIncompleteProfile={false}
        rtdLearningTheme={true}
        logoUrl="https://rtdlearning.com/cdn/shop/files/RTD_FINAL_LOGO.png?v=1727549428&width=160"
      />

      <div className="flex-1 relative flex flex-col">
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" className="absolute top-0 left-0">
            <StaticTriangle color="#10b981" />
            <StaticTriangle color="#34d399" />
            <StaticTriangle color="#059669" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col">
          {/* Welcome Section with Green Gradient */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-6 text-white shadow-lg">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">
                  Welcome to RTD Learning! 🌟
                </h2>
                <p className="text-lg mb-4 text-emerald-50">
                  Your personalized learning journey starts here. Track your progress, explore new pathways, and achieve your goals.
                </p>
                <div className="flex justify-center gap-4">
                  <Button className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold shadow-md">
                    🚀 Start Learning
                  </Button>
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 font-semibold">
                    📚 Browse Catalog
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="lg:w-2/3">
              {/* Learning Pathways Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 mb-6 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <NotebookPen className="h-6 w-6 mr-2 text-emerald-600" />
                    Learning Pathways
                  </h3>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="space-y-4">
                    {/* Foundational Skills */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-emerald-800 mb-2">🚀 Foundational Skills</h4>
                      <p className="text-emerald-700 text-sm mb-3">Master the basics with personalized learning tracks.</p>
                      <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500" style={{width: '45%'}}></div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1 font-semibold">45% complete</p>
                    </div>
                    
                    {/* Core Knowledge */}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-teal-800 mb-2">📚 Core Knowledge</h4>
                      <p className="text-teal-700 text-sm mb-3">Dive deeper into essential concepts and theories.</p>
                      <div className="w-full bg-teal-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500" style={{width: '20%'}}></div>
                      </div>
                      <p className="text-xs text-teal-600 mt-1 font-semibold">20% complete</p>
                    </div>
                    
                    {/* Advanced Applications */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-emerald-800 mb-2">🎯 Advanced Applications</h4>
                      <p className="text-emerald-700 text-sm mb-3">Apply your knowledge to real-world scenarios.</p>
                      <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1 font-semibold">Not started</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Learning Analytics Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <NotebookPen className="h-6 w-6 mr-2 text-emerald-600" />
                    Your Learning Analytics
                  </h3>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-emerald-600">127</div>
                      <div className="text-sm text-emerald-700 font-medium">Hours Studied</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-teal-600">89%</div>
                      <div className="text-sm text-teal-700 font-medium">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-emerald-600">23</div>
                      <div className="text-sm text-emerald-700 font-medium">Achievements</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-teal-600">7</div>
                      <div className="text-sm text-teal-700 font-medium">Day Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Sidebar Content */}
            <div className="lg:w-1/3">
              {/* Quick Actions Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 mb-6 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <NotebookPen className="h-6 w-6 mr-2 text-emerald-600" />
                    Quick Actions
                  </h3>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all">
                      📝 Continue Learning
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600 transition-all">
                      📊 View Progress Report
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600 transition-all">
                      🎯 Set Learning Goals
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Today's Schedule Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 mb-6 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <Clock className="h-6 w-6 mr-2 text-emerald-600" />
                    Today's Schedule
                  </h3>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-emerald-800">Math Foundations</span>
                      <span className="text-xs text-emerald-600 font-semibold">9:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-teal-800">Science Lab</span>
                      <span className="text-xs text-teal-600 font-semibold">2:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:shadow-sm transition-shadow">
                      <span className="text-sm font-medium text-emerald-800">Study Group</span>
                      <span className="text-xs text-emerald-600 font-semibold">7:00 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Important Dates Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <NotebookPen className="h-6 w-6 mr-2 text-emerald-600" />
                    Important Dates
                  </h3>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 hover:bg-emerald-50 rounded transition-colors">
                      <span className="font-medium text-gray-700">Midterm Exams</span>
                      <span className="text-emerald-600 font-bold">Mar 15</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-teal-50 rounded transition-colors">
                      <span className="font-medium text-gray-700">Spring Break</span>
                      <span className="text-teal-600 font-bold">Mar 25</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-emerald-50 rounded transition-colors">
                      <span className="font-medium text-gray-700">Final Projects Due</span>
                      <span className="text-emerald-600 font-bold">Apr 20</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Course Catalog Section */}
          <div className="mt-8">
            <CourseCatalog maxItems={12} />
          </div>

          {/* Profile Component as a Sheet */}
          <ProfileComponent
            isOpen={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
};

export default RTDLearningDashboard;