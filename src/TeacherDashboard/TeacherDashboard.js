import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
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
  Layout,
  Grid,
  Link,
  DollarSign,
  CalendarPlus,
  Bell,
} from 'lucide-react';
import ChatApp from '../chat/ChatApp';
import AdminPanel from '../Admin/AdminPanel';
import Courses from '../courses/Courses';
import StudentManagement from '../StudentManagement/StudentManagement';
import ExternalLinks from '../ExternalLinks/ExternalLinks';
import ContractorInvoiceSummary from '../Admin/ContractorInvoiceSummary';
import IcsUpload from '../Schedule/IcsUpload';
import Notifications from '../Notifications/Notifications';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import NavItemWithIndicator from '../Notifications/NavItemWithIndicator';

function TeacherDashboard() {
  const { user, isStaff } = useAuth();
  const { isFullScreen, setIsFullScreen } = useLayout();
  const [activeSection, setActiveSection] = useState('react-dashboard');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [invoicesData, setInvoicesData] = useState({});
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

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

  if (!user || !isStaff(user)) {
    return <div className="p-4">Access Denied. This page is only for staff members.</div>;
  }

  const navItems = [
    { icon: Grid, label: 'React Dashboard', key: 'react-dashboard' },
    { icon: Layout, label: 'PowerApps Dashboard', key: 'powerapps-dashboard' },
    { 
      icon: Bell, 
      label: 'Notifications', 
      key: 'notifications', 
      showIndicator: unreadChatsCount > 0,
      indicatorCount: unreadChatsCount
    },
    { icon: MessageSquare, label: 'Chats', key: 'chat' },
    // Removed the Schedule Builder navigation item
    { icon: BookOpen, label: 'Courses', key: 'courses' },
    { icon: CalendarPlus, label: 'Calendars', key: 'calendar-creator' },
    { icon: Link, label: 'Links', key: 'external-links' },
    { 
      icon: Settings, 
      label: 'Admin', 
      key: 'admin', 
      subItems: [
        { icon: DollarSign, label: 'Finance', key: 'finance' },
        { icon: BarChart2, label: 'Reports', key: 'reports' },
        { icon: DollarSign, label: 'Contractor Invoices', key: 'contractor-invoices' },
      ]
    },
  ];

  const handleNavItemClick = (key) => {
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

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return memoizedChatApp;
      case 'admin':
        return <AdminPanel setActiveSection={setActiveSection} />;
      case 'courses':
        return <Courses />;
      case 'students':
      case 'react-dashboard':
        return <StudentManagement isFullScreen={isFullScreen} onFullScreenToggle={toggleFullScreen} />;
      case 'powerapps-dashboard':
        return (
          <iframe
            src="https://apps.powerapps.com/play/e42ed678-5bbd-43fc-8c9c-e15ff3b181a8?source=iframe"
            title="Teacher Portal PowerApp"
            className="w-full h-full border-none rounded-lg"
          />
        );
      case 'external-links':
        return <ExternalLinks />;
      case 'finance':
        return <ContractorInvoiceSummary invoicesData={invoicesData} />;
      case 'calendar-creator':
        return <IcsUpload />;
      case 'notifications':
        return <Notifications />;
      case 'contractor-invoices':
        return <ContractorInvoiceSummary invoicesData={invoicesData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {!isFullScreen && (
        <aside
          className={`flex-shrink-0 border-r border-border transition-all duration-300 ${
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
              <nav className="space-y-2 p-2">
                {navItems.map((item) => (
                  <div key={item.key}>
                    <NavItemWithIndicator
                      item={item}
                      isActive={activeSection === item.key}
                      isExpanded={isSidebarExpanded}
                      onClick={() => handleNavItemClick(item.key)}
                    />
                    {item.subItems && isSidebarExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavItemWithIndicator
                            key={subItem.key}
                            item={subItem}
                            isActive={activeSection === subItem.key}
                            isExpanded={isSidebarExpanded}
                            onClick={() => handleNavItemClick(subItem.key)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </aside>
      )}

      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <div className="flex-grow overflow-auto p-4">
          {renderContent()}
        </div>
      </div>

      {!isFullScreen && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 lg:hidden z-50 hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="space-y-4 py-4">
              {navItems.map((item) => (
                <NavItemWithIndicator
                  key={item.key}
                  item={item}
                  isActive={activeSection === item.key}
                  isExpanded={true}
                  onClick={() => handleNavItemClick(item.key)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export default TeacherDashboard;
