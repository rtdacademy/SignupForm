import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaComments,
  FaCog,
  FaTimes,
  FaHome,
  FaGraduationCap,
  FaClipboardList,
  FaRegCalendarCheck,
  FaBell,
  FaBars,
  FaArrowLeft,
  FaChevronRight,
  FaChevronLeft,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import ChatApp from '../chat/ChatApp';
import Notifications from '../Notifications/Notifications';
import { sanitizeEmail } from '../utils/sanitizeEmail';

const LMSWrapper = () => {
  const [expandedIcon, setExpandedIcon] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [userEmailKey, setUserEmailKey] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTeachers, setCourseTeachers] = useState([]);
  const [courseSupportStaff, setCourseSupportStaff] = useState([]);
  const [allowStudentChats, setAllowStudentChats] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Set courseId from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cid = searchParams.get('cid');
    setCourseId(cid);
  }, [location]);

  // Set userEmailKey when user is available
  useEffect(() => {
    if (user) {
      const emailKey = sanitizeEmail(user.email);
      setUserEmailKey(emailKey);
      console.log('Core identifiers:', {
        userEmailKey: emailKey,
        courseId
      });
    }
  }, [user, courseId]);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);

      try {
        const snapshot = await get(courseRef);
        if (snapshot.exists()) {
          const courseData = snapshot.val();
          
          // Set course title
          setCourseTitle(courseData.Title || '');
          
          // Set teachers (ensure it's always an array)
          setCourseTeachers(courseData.Teachers || []);
          
          // Set support staff (ensure it's always an array)
          setCourseSupportStaff(courseData.SupportStaff || []);

          // Set allowStudentChats (default to false if not set)
          setAllowStudentChats(courseData.allowStudentChats || false);

          console.log('Course Data Loaded:', {
            title: courseData.Title,
            teachers: courseData.Teachers,
            supportStaff: courseData.SupportStaff,
            allowStudentChats: courseData.allowStudentChats
          });
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const navItems = useMemo(
    () => [
      { icon: <FaHome />, label: 'Portal', content: 'Back to Student Portal' },
      { icon: <FaBook />, label: 'Courses', content: 'Course content goes here' },
      { icon: <FaGraduationCap />, label: 'Gradebook', content: 'Gradebook' },
      { icon: <FaClipboardList />, label: 'Schedule', content: 'Schedule content goes here' },
      { icon: <FaComments />, label: 'Messages', content: 'Messaging content goes here' },
      { icon: <FaCog />, label: 'Settings', content: 'Settings content goes here' },
      { icon: <FaRegCalendarCheck />, label: 'Book Time', content: 'Booking' },
      { icon: <FaBell />, label: 'Notifications', content: 'Notifications' },
    ],
    []
  );

  const handleIconClick = useCallback((label) => {
    setExpandedIcon(label);
    setIsMobileNavOpen(false);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const closeExpandedContent = useCallback(() => {
    setExpandedIcon(null);
  }, []);

  const handleReturnToPortal = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleChatSelect = useCallback(() => {
    setExpandedIcon('Messages');
  }, []);

  const renderExpandedContent = useCallback(() => {
    if (expandedIcon === 'Portal') {
      return (
        <div className="h-full flex items-center justify-center">
          <button
            onClick={handleReturnToPortal}
            className="py-2 px-4 rounded transition-colors duration-200 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Back to Student Portal
          </button>
        </div>
      );
    } else if (expandedIcon === 'Messages') {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <ChatApp 
            userEmailKey={userEmailKey} 
            courseId={courseId}
            courseTitle={courseTitle}
            courseTeachers={courseTeachers}
            courseSupportStaff={courseSupportStaff}
            allowStudentChats={allowStudentChats}
          />
        </div>
      );
    } else if (expandedIcon === 'Notifications') {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <Notifications 
            userEmailKey={userEmailKey}
            onChatSelect={handleChatSelect}
          />
        </div>
      );
    } else if (expandedIcon === 'Gradebook') {
      return (
        <iframe
          src={`https://edge.rtdacademy.com/course/gradebook.php?cid=${courseId}`}
          title="Gradebook"
          className="w-full h-full border-none"
        />
      );
    } else if (expandedIcon === 'Book Time') {
      return (
        <iframe
          src="https://outlook.office365.com/owa/calendar/RTDBookings@rtdacademy.com/bookings/"
          title="Book Time"
          className="w-full h-full border-none"
        />
      );
    } else {
      return (
        <p className="text-gray-300">
          {navItems.find((item) => item.label === expandedIcon)?.content}
        </p>
      );
    }
  }, [
    expandedIcon,
    courseId,
    courseTitle,
    courseTeachers,
    courseSupportStaff,
    allowStudentChats,
    userEmailKey,
    handleChatSelect,
    handleReturnToPortal,
    navItems,
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      {!expandedIcon && (
        <button
          className="sm:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          <FaBars />
        </button>
      )}

      {/* Navigation sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:relative sm:translate-x-0 ${
          isSidebarExpanded ? 'sm:w-64' : 'sm:w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-4 flex justify-between items-center">
            <button className="sm:hidden text-white" onClick={closeMobileNav}>
              <FaTimes />
            </button>
            <button
              className="hidden sm:block text-white"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              {isSidebarExpanded ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleIconClick(item.label)}
                className={`w-full text-left p-4 transition-colors duration-200 flex items-center ${
                  expandedIcon === item.label ? 'bg-gray-700' : ''
                } hover:bg-gray-700`}
              >
                <span className="inline-block align-middle mr-2">{item.icon}</span>
                {isSidebarExpanded && (
                  <span className="inline-block align-middle">{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow flex overflow-hidden">
        {/* Expanded content */}
        {expandedIcon && (
          <div className="fixed inset-0 bg-gray-700 text-white z-50 flex flex-col sm:static sm:inset-auto sm:w-1/2">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {expandedIcon === 'Messages' ? `${expandedIcon} - ${courseTitle}` : expandedIcon}
                </h3>
                <button
                  onClick={closeExpandedContent}
                  className="text-white transition-colors duration-200 hover:text-gray-300"
                  aria-label="Close expanded content"
                >
                  <FaArrowLeft size={24} />
                </button>
              </div>
            </div>
            {/* Content wrapper with flex-grow and overflow handling */}
            <div className="flex-grow overflow-hidden">
              {renderExpandedContent()}
            </div>
          </div>
        )}

        {/* iframe content */}
        <div className={`flex-grow ${expandedIcon ? 'hidden sm:block' : 'block'}`}>
          <iframe
            src={`https://edge.rtdlearning.com/course/course.php?folder=0&cid=${courseId}`}
            title="RTD Academy LMS"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(LMSWrapper);