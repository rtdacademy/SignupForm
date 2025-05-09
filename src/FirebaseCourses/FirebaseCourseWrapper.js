import React, { useState } from 'react';
import { FaBars, FaBookOpen, FaClipboardList, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Main wrapper component for all Firebase courses
// Provides common layout, navigation, and context for course content
const FirebaseCourseWrapper = ({ course, children }) => {
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  const courseTitle = course.Course?.Value || course.courseDetails?.Title || '';
  const unitsList = course.courseDetails?.units || [];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-md z-20 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-16'
        } h-full`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          {isSidebarOpen ? (
            <h1 className="text-lg font-semibold truncate">{courseTitle}</h1>
          ) : (
            <span className="mx-auto">
              <FaBookOpen className="text-blue-600" />
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaBars />
          </button>
        </div>

        <nav className="mt-4">
          <button
            className={`w-full p-3 flex items-center ${
              activeTab === 'content'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('content')}
          >
            <FaBookOpen className="mr-3" />
            {isSidebarOpen && <span>Content</span>}
          </button>

          <button
            className={`w-full p-3 flex items-center ${
              activeTab === 'progress'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('progress')}
          >
            <FaClipboardList className="mr-3" />
            {isSidebarOpen && <span>Progress</span>}
          </button>

          <button
            className={`w-full p-3 flex items-center ${
              activeTab === 'grades'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('grades')}
          >
            <FaGraduationCap className="mr-3" />
            {isSidebarOpen && <span>Grades</span>}
          </button>
        </nav>

        {isSidebarOpen && unitsList.length > 0 && (
          <div className="mt-8 px-4 overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Units
            </h2>
            <ul className="space-y-1">
              {unitsList.map((unit, index) => (
                <li key={unit.unitId || index}>
                  <button className="w-full text-left p-2 text-sm rounded hover:bg-gray-100">
                    {unit.name || `Unit ${index + 1}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 flex-1 overflow-auto`}>
        <main className="p-6">
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow">
              {children}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Your Progress</h1>
              <p className="text-gray-600">
                Course progress tracking interface will be displayed here.
              </p>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-xl font-bold mb-4">Your Grades</h1>
              <p className="text-gray-600">
                Gradebook interface will be displayed here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FirebaseCourseWrapper;