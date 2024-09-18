import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaChalkboardTeacher, FaUsers, FaBook, FaChartBar, FaComments, FaCog, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import ChatApp from '../chat/ChatApp';
import AdminPanel from '../Admin/AdminPanel';

function TeacherDashboard({ isSidebarOpen }) {
  const { user, isStaff } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!user || !isStaff(user)) {
    return <div>Access Denied. This page is only for staff members.</div>;
  }

  const navItems = [
    { icon: <FaChalkboardTeacher />, label: 'Dashboard', key: 'dashboard' },
    { icon: <FaUsers />, label: 'Students', key: 'students' },
    { icon: <FaBook />, label: 'Courses', key: 'courses' },
    { icon: <FaChartBar />, label: 'Reports', key: 'reports' },
    { icon: <FaComments />, label: 'Chat', key: 'chat' },
    { icon: <FaCog />, label: 'Admin Panel', key: 'admin' },
  ];

  const handleNavItemClick = (key) => {
    setActiveSection(activeSection === key ? null : key);
    setIsFullScreen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatApp />;
      case 'admin':
        return <AdminPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`bg-gray-200 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-16'
      } flex-shrink-0 ${isFullScreen ? 'hidden' : ''}`}>
        <nav className="h-full py-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li 
                key={item.key}
                className={`px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-300 cursor-pointer ${activeSection === item.key ? 'bg-gray-300' : ''}`}
                onClick={() => handleNavItemClick(item.key)}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={isSidebarOpen ? 'inline-block' : 'hidden'}>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {activeSection && (
        <div className={`bg-white overflow-y-auto transition-all duration-300 ease-in-out ${
          isFullScreen ? 'w-full' : 'w-96'
        } ${activeSection ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 bg-gray-100">
            <h3 className="text-lg font-semibold">{navItems.find(item => item.key === activeSection)?.label}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullScreen}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button
                onClick={() => setActiveSection(null)}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      )}

      <main className={`flex-grow overflow-hidden ${isFullScreen ? 'hidden' : ''}`}>
        <iframe
          src="https://apps.powerapps.com/play/e42ed678-5bbd-43fc-8c9c-e15ff3b181a8?source=iframe"
          title="Teacher Portal PowerApp"
          className="w-full h-full border-none"
        />
      </main>
    </div>
  );
}

export default TeacherDashboard;