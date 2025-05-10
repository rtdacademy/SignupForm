import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import CourseRouter from './CourseRouter';
import { Button } from '../components/ui/button';
import { FaWrench, FaEdit } from 'react-icons/fa';

/**
 * Staff course wrapper that loads a course and passes it to the CourseRouter
 * with additional staff controls for editing content and managing questions
 */
const StaffCourseWrapper = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const { currentUser, isStaff, hasSuperAdminAccess } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devMode, setDevMode] = useState(false);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        const db = getDatabase();
        const courseRef = ref(db, `courses/${courseId}`);
        const snapshot = await get(courseRef);
        
        if (snapshot.exists()) {
          setCourse({
            CourseID: courseId,
            ...snapshot.val()
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading course:', error);
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId]);

  // Toggle developer mode
  const handleToggleDevMode = () => {
    setDevMode(!devMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-4">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">Course not found or access denied.</p>
        </div>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]"> {/* Adjust for Layout header */}
      {/* Staff toolbar - fixed at the top */}
      <div className="bg-gray-800 text-white p-2 z-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <span className="font-medium mr-4">{course.Title || `Course #${courseId}`}</span>
          <Button
            variant={devMode ? "default" : "default"}
            size="sm"
            className={devMode
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-blue-700 hover:bg-blue-800 text-white"
            }
            onClick={handleToggleDevMode}
          >
            <FaWrench className="mr-2" />
            {devMode ? 'Developer Mode Active' : 'Enable Developer Mode'}
          </Button>

          {devMode && (
            <div className="ml-4 flex items-center text-sm">
              <span className="bg-green-600 text-white px-2 py-0.5 rounded">Staff</span>
              <span className="mx-2">|</span>
              <span className="text-yellow-300 font-medium">{currentUser?.email}</span>
            </div>
          )}
        </div>

        {/* Empty div to maintain the flex layout */}
        <div></div>
      </div>

      {/* Pass the course to the router - make this div scrollable */}
      <div className="flex-grow overflow-auto">
        <CourseRouter
          course={course}
          isStaffView={true}
          devMode={devMode}
          key={`course-${devMode ? 'dev' : 'normal'}`} // Force remount when toggling dev mode
        />
      </div>
    </div>
  );
};

export default StaffCourseWrapper;