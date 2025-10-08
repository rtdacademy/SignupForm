import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import HomeEducationHeader from './HomeEducationHeader';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { getDatabase, ref, get, onValue, off } from "firebase/database";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const Layout = React.memo(({ children }) => {
  const { user, currentUser, signOut, isStaff, isEmulating, checkUserRoles } = useAuth(); 
  const { isFullScreen, setIsFullScreen } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [hasParentAccount, setHasParentAccount] = useState(false);
  
  // Home Education Header state
  const [viewMode, setViewMode] = useState('my'); // 'my', 'all', 'inactive', or 'unassigned'
  const [impersonatingFacilitator, setImpersonatingFacilitator] = useState(null);
  const [showImpersonationDropdown, setShowImpersonationDropdown] = useState(false);
  const [showTestFamilies, setShowTestFamilies] = useState(false); // Filter out test families by default
  const [homeEducationStats, setHomeEducationStats] = useState({
    totalFamilies: 0,
    myFamilies: 0,
    inactiveFamilies: 0,
    unassignedFamilies: 0
  });

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

  const checkParentAccount = useCallback(async () => {
    if (user && !isStaff(user)) {
      try {
        const sanitizedEmail = sanitizeEmail(user.email);
        const userRoles = await checkUserRoles(user, sanitizedEmail);
        
        // Check if user has parent access from custom claims or database
        const hasParentAccess = userRoles.permissions.canAccessParentPortal === true;
        setHasParentAccount(hasParentAccess);
        
        console.log("Parent account check using hybrid approach:", {
          hasParentAccess,
          roles: userRoles.roles,
          usingCustomClaims: userRoles.hasCustomClaims
        });
      } catch (error) {
        console.error("Error checking parent account:", error);
        setHasParentAccount(false);
      }
    } else {
      setHasParentAccount(false);
    }
  }, [user, isStaff, checkUserRoles]);

  useEffect(() => {
    fetchStudentData();
    checkParentAccount();
  }, [fetchStudentData, checkParentAccount]);

  // Listen to family statistics directly in Layout
  // This ensures stats are always up-to-date for the header
  useEffect(() => {
    const db = getDatabase();

    // Listen to global stats for "All Families" count
    const globalStatsRef = ref(db, 'homeEducationFamilies/stats');
    const unsubscribeGlobal = onValue(globalStatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const statsData = snapshot.val();
        const allFamiliesCount = statsData.byStatus?.active || 0;
        const inactiveFamiliesCount = statsData.byStatus?.inactive || 0;
        const unassignedFamiliesCount = statsData.unassigned || 0;

        console.log('📊 FETCHED STATS FROM FIREBASE:', {
          fullStatsData: statsData,
          byStatus: statsData.byStatus,
          activeCount: statsData.byStatus?.active,
          inactiveCount: statsData.byStatus?.inactive,
          unassignedCount: statsData.unassigned,
          settingTotalFamiliesTo: allFamiliesCount,
          settingInactiveFamiliesTo: inactiveFamiliesCount,
          settingUnassignedFamiliesTo: unassignedFamiliesCount
        });

        // Update the totalFamilies, inactiveFamilies, and unassignedFamilies counts
        setHomeEducationStats(prev => ({
          ...prev,
          totalFamilies: allFamiliesCount,
          inactiveFamilies: inactiveFamiliesCount,
          unassignedFamilies: unassignedFamiliesCount
        }));
      } else {
        console.log('⚠️ Stats snapshot does not exist at /homeEducationFamilies/stats');
      }
    });

    // Listen to facilitator-specific stats for "My Families" count
    let unsubscribeFacilitator;
    if (user?.email) {
      const effectiveEmail = impersonatingFacilitator?.contact?.email || user.email;
      const sanitizedEmail = sanitizeEmail(effectiveEmail);
      const facilitatorStatsRef = ref(db, `homeEducationFamilies/stats/byFacilitator/${sanitizedEmail}`);

      unsubscribeFacilitator = onValue(facilitatorStatsRef, (snapshot) => {
        if (snapshot.exists()) {
          const facilitatorData = snapshot.val();
          const myFamiliesCount = facilitatorData.active || 0;

          console.log('👤 FETCHED FACILITATOR STATS:', {
            email: effectiveEmail,
            sanitizedEmail: sanitizedEmail,
            facilitatorData: facilitatorData,
            activeCount: facilitatorData.active,
            settingMyFamiliesTo: myFamiliesCount
          });

          // Update the myFamilies count
          setHomeEducationStats(prev => ({
            ...prev,
            myFamilies: myFamiliesCount
          }));
        } else {
          console.log('⚠️ No facilitator stats found for:', sanitizedEmail);
          setHomeEducationStats(prev => ({
            ...prev,
            myFamilies: 0
          }));
        }
      });
    }

    return () => {
      off(globalStatsRef, 'value', unsubscribeGlobal);
      if (unsubscribeFacilitator) {
        const effectiveEmail = impersonatingFacilitator?.contact?.email || user?.email;
        if (effectiveEmail) {
          const sanitizedEmail = sanitizeEmail(effectiveEmail);
          const facilitatorStatsRef = ref(db, `homeEducationFamilies/stats/byFacilitator/${sanitizedEmail}`);
          off(facilitatorStatsRef, 'value', unsubscribeFacilitator);
        }
      }
    };
  }, [user?.email, impersonatingFacilitator]);

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
  const isHomeEducationRoute = location.pathname === '/home-education-staff' || location.pathname === '/registrar';

  const childrenWithProps = useMemo(() => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        const baseProps = { 
          userEmail: user ? user.email : null,
          isSidebarOpen: isSidebarOpen,
          onSidebarToggle: handleSidebarToggle,
          studentData: studentData,
          isFullScreen: isFullScreen,
          onFullScreenToggle: handleFullScreenToggle
        };

        // Add home education props if on the home education route
        if (isHomeEducationRoute) {
          return React.cloneElement(child, {
            ...baseProps,
            viewMode,
            setViewMode,
            impersonatingFacilitator,
            setImpersonatingFacilitator,
            showImpersonationDropdown,
            setShowImpersonationDropdown,
            showTestFamilies,
            setShowTestFamilies,
            homeEducationStats,
            setHomeEducationStats
          });
        }

        return React.cloneElement(child, baseProps);
      }
      return child;
    });
  }, [
    user, isSidebarOpen, handleSidebarToggle, studentData, isFullScreen, handleFullScreenToggle,
    children, isHomeEducationRoute, viewMode, impersonatingFacilitator, showImpersonationDropdown, showTestFamilies, homeEducationStats
  ]);

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
    isStaffUser: isStaff(user),
    hasParentAccount
  }), [user, handleLogout, showBackButton, handleBackClick, handleDashboardClick, handleSidebarToggle, isStaff, handleFullScreenToggle, isEmulating, hasParentAccount]);

  // Check if we're on the registrar page
  const isRegistrarRoute = location.pathname === '/registrar';
  
  const homeEducationHeaderProps = useMemo(() => ({
    user,
    onLogout: handleLogout,
    viewMode: isRegistrarRoute ? 'all' : viewMode, // Always show all families on registrar
    setViewMode,
    impersonatingFacilitator,
    setImpersonatingFacilitator,
    showImpersonationDropdown,
    setShowImpersonationDropdown,
    showTestFamilies,
    setShowTestFamilies,
    stats: homeEducationStats
  }), [
    user, handleLogout, viewMode, impersonatingFacilitator,
    showImpersonationDropdown, showTestFamilies, homeEducationStats, isRegistrarRoute
  ]);

  return (
    <div className={`flex flex-col h-screen bg-white ${isFullScreen ? 'overflow-hidden' : ''}`}>
      {/* Header - only shown when not fullscreen */}
      {!isFullScreen && (
        isHomeEducationRoute ? 
          <HomeEducationHeader {...homeEducationHeaderProps} /> :
          <Header {...headerProps} />
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-gray-50 min-h-0">
        {childrenWithProps}
      </main>

      {/* Footer - only shown when not fullscreen */}
      {!isFullScreen && (
        <footer className="flex-none bg-gray-800 text-gray-400 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            © {new Date().getFullYear()} Edbotz Inc. - YourWay Platform
            <span>|</span>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <span>|</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
          <div className="flex items-center gap-4">
            <span>Version 2.0</span>
            {user && (
              <span>Logged in as {isEmulating ? currentUser?.email : user.email}</span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
});

export default Layout;