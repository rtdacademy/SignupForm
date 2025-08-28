import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RTDLearningHeader from '../Layout/RTDLearningHeader';
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
    stopEmulation,
    isRTDLearningAdmin
  } = useAuth();
  
  // Sample admin data
  const profile = { firstName: 'Admin', lastName: 'User' };
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!currentUser || !isRTDLearningAdmin) {
      navigate('/rtd-learning-admin-login');
    }
  }, [currentUser, isRTDLearningAdmin, navigate]);
  
  // Show nothing while checking authentication
  if (!currentUser || !isRTDLearningAdmin) {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <RTDLearningHeader 
        user={currentUser}
        onLogout={handleLogout}
        profile={profile}
        onProfileClick={() => setIsProfileOpen(true)}
        isAdmin={true}
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