import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { getAuth } from 'firebase/auth';
import { useStaffClaims } from '../customClaims/useStaffClaims';
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import {
  Users,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronLeft,
  Link,
  DollarSign,
  CalendarPlus,
  Bell,
  Menu,
  Mail,
  Handshake,
  Upload,
  FilePenLine,
  Shield,
  Grid,
  Database,
  FolderOpen,
  Home,
  Activity
} from 'lucide-react';
import ChatApp from '../chat/ChatApp';
import CoursesWithSheet from '../courses/CoursesWithSheet';
import StudentManagement from '../StudentManagement/StudentManagement';
import ContractorInvoiceSummary from '../Admin/ContractorInvoiceSummary';
import IcsUpload from '../Schedule/IcsUpload';
import Notifications from '../Notifications/Notifications';
import TemplateManager from '../StudentManagement/TemplateManager';
import OrgChart from '../OrgChart/OrgChart';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import NavItemWithIndicator from '../Notifications/NavItemWithIndicator';
 
import PASIDataUpload from '../PASI/PASIDataUpload';
import DataRectification from './DataRectification';
import PASIDataUploadV2 from '../PASI/PASIDataUploadV2';
import TeacherFileStorage from './TeacherFileStorage';
import ParentStudentManagement from './ParentStudentManagement';
import StaffPermissionsManager from './StaffPermissionsManager';
import AuthActivityDashboard from './AuthActivityDashboard';


function TeacherDashboard() {
  const { user, isStaff, hasAdminAccess, isSuperAdminUser } = useAuth();
  const { isFullScreen, setIsFullScreen } = useLayout();
  const { preferences, updateFilterPreferences, clearAllFilters } = useUserPreferences();
  const { 
    checkAndApplyStaffClaims, 
    isStaff: hasStaffClaims, 
    loading: claimsLoading, 
    error: claimsError,
    staffPermissions,
    staffRole
  } = useStaffClaims();
  const [activeSection, setActiveSection] = useState('react-dashboard');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [invoicesData, setInvoicesData] = useState({});
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check for URL parameters on component mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Check for asn parameter first (more specific than general search)
    const asnParam = searchParams.get('asn');
    if (asnParam) {
      console.log(`ASN parameter found: ${asnParam}`);
      clearFiltersAndSetSearch(asnParam);
      return;
    }
    
    // Check for general search parameter
    const searchParam = searchParams.get('search');
    if (searchParam) {
      console.log(`Search parameter found: ${searchParam}`);
      clearFiltersAndSetSearch(searchParam);
    }
  }, [location.search]); // Re-run when URL changes

  // Function to clear filters and set search term
  const clearFiltersAndSetSearch = useCallback((searchValue) => {
    console.log(`Clearing filters and setting search to: ${searchValue}`);
    
    // Clear all filters
    const clearedFilters = {
      categories: [],
      hasSchedule: [],
      dateFilters: {},
      // Reset any other filter properties your application uses
      CourseID: [],
      Status_Value: [],
      StudentType_Value: [],
      DiplomaMonthChoices_Value: [],
      Term: [],
      School_x0020_Year_Value: [],
      currentMode: undefined, // This will let the default mode be applied
    };
    
    // Update local state
    setFilters(clearedFilters);
    setSearchTerm(searchValue);
    
    // Also update user preferences to persist the changes
    updateFilterPreferences({
      ...clearedFilters,
      searchTerm: searchValue
    });
    
    // Remove the parameter from the URL to prevent re-applying
    // when navigating back to this page
    const updatedSearchParams = new URLSearchParams(location.search);
    updatedSearchParams.delete('asn');
    updatedSearchParams.delete('search');
    
    // Only navigate if there are other params, otherwise just use the path
    const newPath = updatedSearchParams.toString() 
      ? `${location.pathname}?${updatedSearchParams.toString()}`
      : location.pathname;
      
    navigate(newPath, { replace: true });
  }, [location, navigate, updateFilterPreferences]);

  // Initialize filters from user preferences
  useEffect(() => {
    if (preferences?.filters && !location.search.includes('asn') && !location.search.includes('search')) {
      setFilters(preferences.filters);
      setSearchTerm(preferences.filters.searchTerm || '');
    }
  }, [preferences, location.search]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const db = getDatabase();
        const invoicesRef = ref(db, 'invoices');
        const snapshot = await get(invoicesRef);
        if (snapshot.exists()) {
          setInvoicesData(snapshot.val());
        } else {
          console.warn('No invoices data available.');
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    if (!user) return;

    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(user.email);
    const notificationsRef = ref(db, `notifications/${sanitizedEmail}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const unreadCount = Object.values(notificationsData).filter(
          (notification) => !notification.read && notification.type === 'new_message'
        ).length;
        setUnreadChatsCount(unreadCount);
      } else {
        setUnreadChatsCount(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Debug: Log custom claims when user is available AND check/apply staff claims
  useEffect(() => {
    if (!user) return;

    const debugAndEnsureStaffClaims = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          const result = await auth.currentUser.getIdTokenResult();
          console.log('🔍 Teacher Dashboard - Custom claims:', result.claims);
          console.log('📧 User email:', user.email);
          console.log('🆔 User UID:', user.uid);
          
          // Log specific staff permissions if they exist
          if (result.claims.staffPermissions) {
            console.log('👨‍🏫 Staff permissions:', result.claims.staffPermissions);
            console.log('🎭 Staff role:', result.claims.staffRole);
            console.log('📅 Last permission update:', result.claims.lastPermissionUpdate);
            console.log('📍 Permission source:', result.claims.permissionSource);
          } else {
            console.log('⚠️ No staff permissions found in claims');
            
            // If no staff permissions found, try to apply them
            console.log('🔧 Attempting to apply staff claims...');
            const appliedClaims = await checkAndApplyStaffClaims();
            if (appliedClaims) {
              console.log('✅ Staff claims applied successfully:', appliedClaims);
            } else {
              console.log('❌ Failed to apply staff claims');
            }
          }
          
          // Also log from the hook state
          console.log('🎯 Hook state - hasStaffClaims:', hasStaffClaims);
          console.log('🎯 Hook state - staffPermissions:', staffPermissions);
          console.log('🎯 Hook state - staffRole:', staffRole);
          console.log('🎯 Hook state - claimsLoading:', claimsLoading);
          console.log('🎯 Hook state - claimsError:', claimsError);
        }
      } catch (error) {
        console.error('❌ Error getting custom claims:', error);
      }
    };

    debugAndEnsureStaffClaims();
  }, [user, checkAndApplyStaffClaims, hasStaffClaims, staffPermissions, staffRole, claimsLoading, claimsError]);

  const memoizedChatApp = useMemo(() => {
    return <ChatApp />;
  }, []);

  // Update navItems to be dynamic based on admin access
  const navItems = useMemo(() => {
    const baseItems = [
      { icon: Grid, label: 'React Dashboard', key: 'react-dashboard' },
      { icon: Database, label: 'Data Management', key: 'data-rectification' },
      { icon: BookOpen, label: 'Course Management', key: 'courses' },
      { 
        icon: Bell, 
        label: 'Notifications', 
        key: 'notifications', 
        showIndicator: unreadChatsCount > 0,
        indicatorCount: unreadChatsCount
      },
      { icon: MessageSquare, label: 'Chats', key: 'chat' },
      { icon: FolderOpen, label: 'File Storage', key: 'file-storage' },
      { icon: FilePenLine, label: 'Email Templates', key: 'templates' },
      { icon: CalendarPlus, label: 'Calendars', key: 'calendar-creator' },
      { icon: Shield, label: 'Parent Management', key: 'parent-management' },
      { icon: Home, label: 'Home Education', key: 'home-education' },
      { icon: Users, label: 'Org Chart', key: 'org-chart' },
    ];

    // Only add admin items if user has admin access
    if (hasAdminAccess()) {
      const adminSubItems = [
        { icon: Handshake, label: 'Contractor Invoices', key: 'contractor-invoices' },
        { icon: Activity, label: 'Auth Activity', key: 'auth-activity' },
      ];

      // Add super admin only items
      if (isSuperAdminUser || user?.email === 'kyle@rtdacademy.com') {
        adminSubItems.push(
          { icon: Shield, label: 'Staff Permissions', key: 'staff-permissions' }
        );
      }

      baseItems.push({
        icon: Settings,
        label: 'Admin',
        key: 'admin',
        subItems: adminSubItems
      });
    }

    return baseItems;
  }, [unreadChatsCount, hasAdminAccess, isSuperAdminUser]);

  const renderContent = () => {
    // Check for admin-only sections
    const adminOnlySections = ['contractor-invoices', 'auth-activity', 'sso-testing']; 
    if (adminOnlySections.includes(activeSection) && !hasAdminAccess()) {
      return <div className="p-4">Access Denied. This section requires admin privileges.</div>;
    }

    // Check for super admin-only sections
    const superAdminOnlySections = ['staff-permissions'];
    if (superAdminOnlySections.includes(activeSection) && !isSuperAdminUser && user?.email !== 'kyle@rtdacademy.com') {
      return <div className="p-4">Access Denied. This section requires super admin privileges.</div>;
    }

    switch (activeSection) {
      case 'chat':
        return memoizedChatApp;
      case 'courses':
        return <CoursesWithSheet />;
      case 'students':
      case 'react-dashboard':
        return <StudentManagement 
          isFullScreen={isFullScreen} 
          onFullScreenToggle={toggleFullScreen}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={setFilters}
        />;
      case 'calendar-creator':
        return <IcsUpload />;
      case 'notifications':
        return <Notifications />;
      case 'contractor-invoices':
        return <ContractorInvoiceSummary invoicesData={invoicesData} />;
      case 'templates':
        return <TemplateManager defaultOpen={true} />;
      case 'org-chart':
        return <OrgChart />;
      case 'pasi-data-upload':
        return <PASIDataUpload />;
      case 'pasi-records':
        return <PASIDataUpload />;
      case 'data-rectification':
        return <PASIDataUploadV2 />;
      case 'file-storage':
        return <TeacherFileStorage />;
      case 'parent-management':
        return <ParentStudentManagement />;
      case 'staff-permissions':
        return <StaffPermissionsManager />;
      case 'auth-activity':
        return <AuthActivityDashboard />;
      default:
        return null;
    }
  };

  const handleNavItemClick = (key) => {
    const adminOnlySections = ['contractor-invoices', 'auth-activity', 'sso-testing'];
    const superAdminOnlySections = ['staff-permissions'];

    if (adminOnlySections.includes(key) && !hasAdminAccess()) {
      alert('Access Denied. You do not have the necessary permissions to access this section.');
      return;
    }

    if (superAdminOnlySections.includes(key) && !isSuperAdminUser && user?.email !== 'kyle@rtdacademy.com') {
      alert('Access Denied. You do not have super admin privileges to access this section.');
      return;
    }

    // Handle section expansion/collapse for parent items with subItems
    const item = navItems.find(item => item.key === key);
    if (item && item.subItems) {
      // Special handling for Admin section - expand sidebar if collapsed
      if (key === 'admin' && !isSidebarExpanded) {
        setIsSidebarExpanded(true);
        // Also expand the admin section so user sees the options immediately
        const newExpandedSections = new Set(expandedSections);
        newExpandedSections.add(key);
        setExpandedSections(newExpandedSections);
        return;
      }
      
      const newExpandedSections = new Set(expandedSections);
      if (expandedSections.has(key)) {
        newExpandedSections.delete(key);
      } else {
        newExpandedSections.add(key);
      }
      setExpandedSections(newExpandedSections);
      return;
    }

    // Handle navigation to external routes
    if (key === 'home-education') {
      navigate('/home-education-staff');
      return;
    }

    // When clicking a regular navigation item (not admin subitems), collapse admin section
    const isAdminSubitem = adminOnlySections.includes(key) || superAdminOnlySections.includes(key);
    if (!isAdminSubitem) {
      const newExpandedSections = new Set(expandedSections);
      newExpandedSections.delete('admin');
      setExpandedSections(newExpandedSections);
    }

    setActiveSection(activeSection === key ? null : key);
    setIsFullScreen(false);
    setIsChatExpanded(key === 'chat');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const navContent = (isExpanded = true, inSheet = false) => (
    <nav className={`space-y-${inSheet ? '4 py-4' : '2 p-2'}`}>
      {navItems
        .filter(item => {
          // Hide admin section completely if user doesn't have admin access
          if (item.key === 'admin' && !hasAdminAccess()) {
            return false;
          }
          return true;
        })
        .map((item) => (
        <div key={item.key}>
          <NavItemWithIndicator
            item={item}
            isActive={activeSection === item.key || (item.subItems && expandedSections.has(item.key))}
            isExpanded={isExpanded}
            isAdminItem={item.key === 'admin'}
            onClick={() => {
              handleNavItemClick(item.key);
              if (inSheet) setIsSheetOpen(false);
            }}
          />
          {item.subItems && isExpanded && expandedSections.has(item.key) && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems.map((subItem) => (
                <NavItemWithIndicator
                  key={subItem.key}
                  item={subItem}
                  isActive={activeSection === subItem.key}
                  isExpanded={isExpanded}
                  isAdminItem={item.key === 'admin'}
                  onClick={() => {
                    handleNavItemClick(subItem.key);
                    if (inSheet) setIsSheetOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  // Show loading state while claims are being applied
  if (claimsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your permissions...</p>
        </div>
      </div>
    );
  }

  // Show error if claims failed to apply
  if (claimsError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <h3 className="font-medium">Permission Error</h3>
            <p className="mt-1">{claimsError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check access using either legacy isStaff or new staff claims
  if (!user || (!isStaff(user) && !hasStaffClaims)) {
    return <div className="p-4">Access Denied. This page is only for staff members.</div>;
  }

  return (
    <div className="flex h-full">
      {!isFullScreen && (
        <aside
          className={`hidden lg:flex flex-shrink-0 border-r border-border transition-all duration-300 ${
            isSidebarExpanded ? 'w-64' : 'w-15'
          }`}
        >
          <div className="flex flex-col h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="self-end m-2 hover:bg-accent hover:text-accent-foreground"
            >
              {isSidebarExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <ScrollArea className="flex-grow">
              {navContent(isSidebarExpanded)}
            </ScrollArea>
          </div>
        </aside>
      )}
  
      <div className="flex-grow flex flex-col h-full">
        <div className={`flex-grow ${activeSection === 'courses' ? 'flex flex-col' : 'overflow-auto'} p-4`}>
          {renderContent()}
        </div>
      </div>
  
      {!isFullScreen && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-1 left-1 lg:hidden z-50 hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            {navContent(true, true)}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export default TeacherDashboard;