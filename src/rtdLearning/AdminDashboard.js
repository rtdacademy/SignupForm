import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../Layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  UserCheck, 
  GraduationCap,
  TrendingUp,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';
import ShopifyConnectionTest from './components/ShopifyConnectionTest';
import CourseCatalog from './components/CourseCatalog';

// Static Triangle Component with RTD Learning green theme
const StaticTriangle = ({ color }) => {
  const [randomPosition] = useState(() => ({
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 220 : 500),
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 220 : 500),
    rotation: Math.random() * 360,
  }));

  const points = `
    ${randomPosition.x + 110},${randomPosition.y}
    ${randomPosition.x},${randomPosition.y + 220}
    ${randomPosition.x + 220},${randomPosition.y + 220}
  `;

  return (
    <polygon
      points={points}
      fill={color}
      opacity="0.08"
      transform={`rotate(${randomPosition.rotation} ${randomPosition.x + 110} ${randomPosition.y + 110})`}
    />
  );
};

const RTDLearningAdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    signOut, 
    isEmulating,
    stopEmulation
  } = useAuth();
  
  // Sample admin data
  const profile = { firstName: 'Admin', lastName: 'User' };
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check if user is RTD Learning admin
  const isRTDLearningAdmin = (email) => {
    return email && email.endsWith('@rtdlearning.com');
  };

  // Redirect non-admin users
  if (!currentUser || !isRTDLearningAdmin(currentUser.email)) {
    navigate('/rtd-learning-admin-login');
    return null;
  }

  const handleLogout = useCallback(async () => {
    try {
      if (isEmulating) {
        stopEmulation();
      } else {
        await signOut();
        navigate('/rtd-learning-admin-login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate, isEmulating, stopEmulation]);

  // Sample admin stats
  const adminStats = {
    totalStudents: 1247,
    activeCourses: 23,
    completionRate: 87,
    monthlyGrowth: 15
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        user={currentUser}
        onLogout={handleLogout}
        onBackClick={null}
        onDashboardClick={() => {}}
        portalType="RTD Learning Admin Portal"
        isEmulating={isEmulating}
        isStaffUser={true}
        onProfileClick={() => setIsProfileOpen(true)}
        profile={profile}
        hasIncompleteProfile={false}
        rtdLearningTheme={true}
        logoUrl="https://rtdlearning.com/cdn/shop/files/RTD_FINAL_LOGO.png?v=1727549428&width=160"
      />

      <div className="flex-1 relative flex flex-col">
        {/* Background triangles */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
          <svg width="100%" height="100%" className="absolute top-0 left-0">
            <StaticTriangle color="#10b981" />
            <StaticTriangle color="#34d399" />
            <StaticTriangle color="#059669" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col">
          {/* Welcome Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center">
                    <Shield className="h-8 w-8 mr-3" />
                    RTD Learning Admin Dashboard
                  </h2>
                  <p className="text-lg text-emerald-50">
                    Welcome back, {currentUser.displayName || currentUser.email.split('@')[0]}
                  </p>
                  <p className="text-emerald-100 mt-1">
                    Manage students, courses, and monitor platform performance
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-emerald-100 text-sm">Admin Access</div>
                  <div className="text-white font-medium">{currentUser.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-emerald-600">{adminStats.totalStudents.toLocaleString()}</p>
                  </div>
                  <Users className="h-12 w-12 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-3xl font-bold text-teal-600">{adminStats.activeCourses}</p>
                  </div>
                  <BookOpen className="h-12 w-12 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-3xl font-bold text-emerald-600">{adminStats.completionRate}%</p>
                  </div>
                  <GraduationCap className="h-12 w-12 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                    <p className="text-3xl font-bold text-teal-600">+{adminStats.monthlyGrowth}%</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-teal-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shopify Integration Section */}
          <div className="mb-8">
            <ShopifyConnectionTest />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Admin Actions */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 mb-6 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <Settings className="h-6 w-6 mr-2 text-emerald-600" />
                    Admin Actions
                  </h3>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="h-20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      Manage Students
                    </Button>
                    
                    <Button className="h-20 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col">
                      <BookOpen className="h-6 w-6 mb-2" />
                      Course Management
                    </Button>
                    
                    <Button className="h-20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Analytics & Reports
                    </Button>
                    
                    <Button className="h-20 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col">
                      <UserCheck className="h-6 w-6 mb-2" />
                      User Management
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <Calendar className="h-6 w-6 mr-2 text-emerald-600" />
                    Recent Activity
                  </h3>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-emerald-800">New student registration: John Smith</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold">2 min ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-teal-800">Course completed: Physics 101</span>
                      </div>
                      <span className="text-xs text-teal-600 font-semibold">15 min ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-emerald-800">System backup completed</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Stats */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 mb-6 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <BarChart3 className="h-6 w-6 mr-2 text-emerald-600" />
                    Quick Stats
                  </h3>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">94%</div>
                      <div className="text-sm text-emerald-700 font-medium">System Uptime</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-teal-600">156</div>
                      <div className="text-sm text-teal-700 font-medium">Active Sessions</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">2.3GB</div>
                      <div className="text-sm text-emerald-700 font-medium">Storage Used</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
                  <h3 className="text-xl font-bold flex items-center text-emerald-800">
                    <Shield className="h-6 w-6 mr-2 text-emerald-600" />
                    System Status
                  </h3>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Database</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">Online</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Authentication</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">Online</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">File Storage</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">Online</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Email Service</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">Slow</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Course Catalog Section */}
          <div className="mt-8">
            <CourseCatalog maxItems={8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTDLearningAdminDashboard;