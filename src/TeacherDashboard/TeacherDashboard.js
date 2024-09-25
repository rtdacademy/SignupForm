import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import {
  GraduationCap,
  Users,
  BookOpen,
  BarChart2,
  MessageSquare,
  Settings,
  X,
  Maximize,
  Minimize,
} from 'lucide-react';
import ChatApp from '../chat/ChatApp';
import AdminPanel from '../Admin/AdminPanel';
import Courses from '../courses/Courses';
import StudentManagement from '../StudentManagement/StudentManagement';

function TeacherDashboard() {
  const { user, isStaff } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [usePowerApp, setUsePowerApp] = useState(true);

  if (!user || !isStaff(user)) {
    return <div className="p-4">Access Denied. This page is only for staff members.</div>;
  }

  const navItems = [
    { icon: GraduationCap, label: 'Dashboard', key: 'dashboard' },
    { icon: Users, label: 'Students', key: 'students' },
    { icon: BookOpen, label: 'Courses', key: 'courses' },
    { icon: BarChart2, label: 'Reports', key: 'reports' },
    { icon: MessageSquare, label: 'Chat', key: 'chat' },
    { icon: Settings, label: 'Admin Panel', key: 'admin' },
  ];

  const handleNavItemClick = (key) => {
    setActiveSection(activeSection === key ? null : key);
    setIsFullScreen(false);
    setIsChatExpanded(key === 'chat');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatApp />;
      case 'admin':
        return <AdminPanel setActiveSection={setActiveSection} />;
      case 'courses':
        return <Courses />;
      case 'students':
        return <StudentManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 lg:hidden z-50">
            <Users className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <nav className="space-y-4 py-4">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? "secondary" : "ghost"}
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

      <aside className="hidden lg:block w-64 border-r border-border">
        <ScrollArea className="h-full py-4">
          <nav className="space-y-2 px-4">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavItemClick(item.key)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">PowerApp</span>
              <Switch
                checked={usePowerApp}
                onCheckedChange={setUsePowerApp}
              />
              <span className="text-sm">New View</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-4">
          {activeSection ? (
            <div className="bg-card rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {navItems.find((item) => item.key === activeSection)?.label}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setActiveSection(null);
                    setIsChatExpanded(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-auto max-h-[calc(100vh-200px)]">
                {renderContent()}
              </div>
            </div>
          ) : usePowerApp ? (
            <iframe
              src="https://apps.powerapps.com/play/e42ed678-5bbd-43fc-8c9c-e15ff3b181a8?source=iframe"
              title="Teacher Portal PowerApp"
              className="w-full h-[calc(100vh-130px)] border-none rounded-lg shadow-md"
            />
          ) : (
            <StudentManagement />
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;