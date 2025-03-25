import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { getDatabase, ref, get } from "firebase/database";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const Layout = React.memo(({ children }) => {
  const { user, signOut, isStaff, isEmulating } = useAuth(); 
  const { isFullScreen, setIsFullScreen } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);

  const fetchStudentData = useCallback(async () => {
    if (user && !isStaff(user)) {
      const db = getDatabase();
      const sanitizedEmail = sanitizeEmail(user.email);
      const studentRef = ref(db, `students/${sanitizedEmail}`);
      
      try {
        const snapshot = await get(studentRef);
        if (snapshot.exists()) {
          setStudentData(snapshot.val());
          console.log("Fetched student data:", snapshot.val());
        } else {
          console.log("No data available for this student");
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    }
  }, [user, isStaff]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, navigate]);

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleDashboardClick = useCallback(() => {
    navigate(isStaff(user) ? '/teacher-dashboard' : '/dashboard');
  }, [navigate, isStaff, user]);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleFullScreenToggle = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, [setIsFullScreen]);

  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/teacher-dashboard';

  const childrenWithProps = useMemo(() => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 
          userEmail: user ? user.email : null,
          isSidebarOpen: isSidebarOpen,
          onSidebarToggle: handleSidebarToggle,
          studentData: studentData,
          isFullScreen: isFullScreen,
          onFullScreenToggle: handleFullScreenToggle
        });
      }
      return child;
    });
  }, [user, isSidebarOpen, handleSidebarToggle, studentData, isFullScreen, handleFullScreenToggle, children]);

  const headerProps = useMemo(() => ({
    user,
    onLogout: handleLogout,
    onBackClick: showBackButton ? handleBackClick : null,
    onDashboardClick: handleDashboardClick,
    onSidebarToggle: handleSidebarToggle,
    showSidebarToggle: isStaff(user),
    portalType: isStaff(user) ? "Staff Portal" : "Student Portal",
    onFullScreenToggle: handleFullScreenToggle,
    isEmulating,
    isStaffUser: isStaff(user) 
  }), [user, handleLogout, showBackButton, handleBackClick, handleDashboardClick, handleSidebarToggle, isStaff, handleFullScreenToggle, isEmulating]);

  return (
    <div className={`flex flex-col h-screen bg-white ${isFullScreen ? 'overflow-hidden' : ''}`}>
      {/* Header - only shown when not fullscreen */}
      {!isFullScreen && <Header {...headerProps} />}

      {/* Main content area */}
      <main className="flex-1 overflow-hidden bg-gray-50 min-h-0">
        {childrenWithProps}
      </main>

      {/* Footer - only shown when not fullscreen 
      {!isFullScreen && (
        <footer className="flex-none h-8 bg-gray-800 text-gray-400 px-4 flex items-center justify-between text-xs">
          <div>
            © {new Date().getFullYear()} Edbotz
          </div>
          <div className="flex items-center gap-4">
            <span>Version 2.0</span>
            {user && !isEmulating && (
              <span>Logged in as {user.email}</span>
            )}
          </div>
        </footer>
      )}
        */}
    </div>
  );
});

export default Layout;