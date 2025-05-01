import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import {
  Users,
  BookOpen,
  BarChart2,
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
  Grid
} from 'lucide-react';
import ChatApp from '../chat/ChatApp';
import CoursesWithSheet from '../courses/CoursesWithSheet';
import StudentManagement from '../StudentManagement/StudentManagement';
import ExternalLinks from '../ExternalLinks/ExternalLinks';
import ContractorInvoiceSummary from '../Admin/ContractorInvoiceSummary';
import IcsUpload from '../Schedule/IcsUpload';
import Notifications from '../Notifications/Notifications';
import TemplateManager from '../StudentManagement/TemplateManager';
import PricingComponent from '../config/PricingComponent';
import OrgChart from '../OrgChart/OrgChart';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import NavItemWithIndicator from '../Notifications/NavItemWithIndicator';
import IMathASGradeImporter from './IMathASGradeImporter';
import LTIManagement from '../LTI/LTIManagement';
import EnrollmentStatistics from '../Statistics/EnrollmentStatistics'; 
import PASIDataUpload from '../PASI/PASIDataUpload';


function TeacherDashboard() {
  const { user, isStaff, hasAdminAccess } = useAuth();
  const { isFullScreen, setIsFullScreen } = useLayout();
  const { preferences, updateFilterPreferences, clearAllFilters } = useUserPreferences();
  const [activeSection, setActiveSection] = useState('react-dashboard');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
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

  const memoizedChatApp = useMemo(() => {
    return <ChatApp />;
  }, []);

  // Update navItems to be dynamic based on admin access
  const navItems = useMemo(() => {
    const baseItems = [
      { icon: Grid, label: 'React Dashboard', key: 'react-dashboard' },
      { icon: Shield, label: 'PASI Records', key: 'pasi-records' },
      { icon: BookOpen, label: 'Course Management', key: 'courses' },
      { 
        icon: Bell, 
        label: 'Notifications', 
        key: 'notifications', 
        showIndicator: unreadChatsCount > 0,
        indicatorCount: unreadChatsCount
      },
      { icon: MessageSquare, label: 'Chats', key: 'chat' },
      { icon: FilePenLine, label: 'Email Templates', key: 'templates' },
      { icon: CalendarPlus, label: 'Calendars', key: 'calendar-creator' },
      { icon: Link, label: 'Links', key: 'external-links' },
      { icon: Users, label: 'Org Chart', key: 'org-chart' },
    ];

    // Only add admin items if user has admin access
    if (hasAdminAccess()) {
      baseItems.push({
        icon: Settings,
        label: 'Admin',
        key: 'admin',
        subItems: [
          { icon: DollarSign, label: 'Pricing', key: 'pricing' },
          { icon: BarChart2, label: 'Reports', key: 'reports' },
          { icon: Handshake, label: 'Contractor Invoices', key: 'contractor-invoices' },
          { icon: Upload, label: 'IMathAS Import', key: 'imathas-import' },
          { icon: Link, label: 'LTI Management', key: 'lti-management' }  
        ]
      });
    }

    return baseItems;
  }, [unreadChatsCount, hasAdminAccess]);

  const renderContent = () => {
    // Check for admin-only sections
    const adminOnlySections = ['pricing', 'reports', 'contractor-invoices', 'sso-testing']; 
    if (adminOnlySections.includes(activeSection) && !hasAdminAccess()) {
      return <div className="p-4">Access Denied. This section requires admin privileges.</div>;
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
      case 'external-links':
        return <ExternalLinks />;
      case 'calendar-creator':
        return <IcsUpload />;
      case 'notifications':
        return <Notifications />;
      case 'contractor-invoices':
        return <ContractorInvoiceSummary invoicesData={invoicesData} />;
      case 'pricing':
        return <PricingComponent />;
      case 'templates':
        return <TemplateManager defaultOpen={true} />;
      case 'org-chart':
        return <OrgChart />;
      case 'imathas-import':  
        return <IMathASGradeImporter />;
      case 'lti-management':
        return <LTIManagement />;
      case 'enrollment-stats':
        return <EnrollmentStatistics />;
      case 'pasi-data-upload':
        return <PASIDataUpload />;
      case 'pasi-records':
        return <PASIDataUpload />;
      default:
        return null;
    }
  };

  const handleNavItemClick = (key) => {
    const adminOnlySections = ['pricing', 'reports', 'contractor-invoices', 'sso-testing'];

    if (adminOnlySections.includes(key) && !hasAdminAccess()) {
      alert('Access Denied. You do not have the necessary permissions to access this section.');
      return;
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
      {navItems.map((item) => (
        <div key={item.key}>
          <NavItemWithIndicator
            item={item}
            isActive={activeSection === item.key}
            isExpanded={isExpanded}
            onClick={() => {
              handleNavItemClick(item.key);
              if (inSheet) setIsSheetOpen(false);
            }}
          />
          {item.subItems && isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems.map((subItem) => (
                <NavItemWithIndicator
                  key={subItem.key}
                  item={subItem}
                  isActive={activeSection === subItem.key}
                  isExpanded={isExpanded}
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

  if (!user || !isStaff(user)) {
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