import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
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
  Calendar,
  CalendarPlus,
} from 'lucide-react';
import ChatApp from '../chat/ChatApp';
import AdminPanel from '../Admin/AdminPanel';
import Courses from '../courses/Courses';
import StudentManagement from '../StudentManagement/StudentManagement';
import ExternalLinks from '../ExternalLinks/ExternalLinks';
import ContractorInvoiceSummary from '../Admin/ContractorInvoiceSummary';
import ScheduleMaker from '../Schedule/ScheduleMaker';
import IcsUpload from '../Schedule/IcsUpload';
import { getDatabase, ref, get } from 'firebase/database';

function TeacherDashboard() {
  const { user, isStaff } = useAuth();
  const { isFullScreen, setIsFullScreen } = useLayout();
  const [activeSection, setActiveSection] = useState('react-dashboard');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [invoicesData, setInvoicesData] = useState({});

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

  // Memoize the ChatApp component to prevent unnecessary re-renders
  const memoizedChatApp = useMemo(() => <ChatApp />, []);

  if (!user || !isStaff(user)) {
    return <div className="p-4">Access Denied. This page is only for staff members.</div>;
  }

  const navItems = [
    { icon: Grid, label: 'React Dashboard', key: 'react-dashboard' },
    { icon: Layout, label: 'PowerApps Dashboard', key: 'powerapps-dashboard' },
    { icon: Users, label: 'Students', key: 'students' },
    { icon: BookOpen, label: 'Courses', key: 'courses' },
    { icon: BarChart2, label: 'Reports', key: 'reports' },
    { icon: MessageSquare, label: 'Chat', key: 'chat' },
    { icon: Link, label: 'External Links', key: 'external-links' },
    { icon: DollarSign, label: 'Finance', key: 'finance' },
    { icon: Settings, label: 'Admin Panel', key: 'admin' },
    { icon: Calendar, label: 'Schedule Builder', key: 'schedule-builder' },
    { icon: CalendarPlus, label: 'Calendar Creator', key: 'calendar-creator' },
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
      case 'schedule-builder':
        return <ScheduleMaker />;
      case 'calendar-creator':
        return <IcsUpload />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {!isFullScreen && (
        <aside
          className={`flex-shrink-0 border-r border-border transition-all duration-300 ${
            isSidebarExpanded ? 'w-64' : 'w-16'
          }`}
        >
          <div className="flex flex-col h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="self-end m-2"
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
                  <Button
                    key={item.key}
                    variant={activeSection === item.key ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${isSidebarExpanded ? '' : 'px-2'}`}
                    onClick={() => handleNavItemClick(item.key)}
                  >
                    <item.icon className={`h-4 w-4 ${isSidebarExpanded ? 'mr-2' : ''}`} />
                    {isSidebarExpanded && <span>{item.label}</span>}
                  </Button>
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
              className="fixed top-4 left-4 lg:hidden z-50"
            >
              <Users className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="space-y-4 py-4">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant={activeSection === item.key ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleNavItemClick(item.key)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export default TeacherDashboard;
