// LMSWrapper.jsx
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
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import ChatApp from '../chat/ChatApp';
import Notifications from '../Notifications/Notifications';
import { sanitizeEmail } from '../utils/sanitizeEmail';

const LMSWrapper = () => {
  const [expandedIcon, setExpandedIcon] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [studentCourseInfo, setStudentCourseInfo] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [courseTeachers, setCourseTeachers] = useState([]);
  const [courseSupportStaff, setCourseSupportStaff] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [hasMandatoryNotifications, setHasMandatoryNotifications] = useState(false);
  const [mandatoryNotifications, setMandatoryNotifications] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const emptyArray = useMemo(() => [], []);

  // Course ID from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cid = searchParams.get('cid');
    setCourseId(cid);
  }, [location]);

  // Fetch notifications and handle mandatory status
  useEffect(() => {
    if (!user) return;

    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(user.email);
    const notificationsRef = ref(db, `notifications/${sanitizedEmail}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        
        // Process notifications
        const mandatoryNotifs = [];
        let hasUnreadMandatory = false;

        Object.entries(notificationsData).forEach(([id, notification]) => {
          // Check for either unread mandatory notifications or any mustRespond notifications
          if ((!notification.read && notification.mustRead) || notification.mustRespond) {
            hasUnreadMandatory = true;
            mandatoryNotifs.push({
              id,
              ...notification,
            });
          }
        });

        // Update states
        setUnreadNotificationsCount(
          Object.values(notificationsData).filter((n) => !n.read).length
        );
        setHasMandatoryNotifications(hasUnreadMandatory);
        setMandatoryNotifications(mandatoryNotifs);

        // Auto-open notifications if there are mandatory ones
        if (hasUnreadMandatory && expandedIcon !== 'Notifications') {
          setExpandedIcon('Notifications');
        }
      } else {
        setUnreadNotificationsCount(0);
        setHasMandatoryNotifications(false);
        setMandatoryNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [user, expandedIcon]);

  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      if (user && courseId) {
        const db = getDatabase();
        const sanitizedEmail = sanitizeEmail(user.email);

        try {
          const courseSnapshot = await get(ref(db, `courses/${courseId}`));
          if (courseSnapshot.exists()) {
            const courseData = courseSnapshot.val();
            setCourseInfo(courseData);
            setCourseTeachers(courseData.Teachers || emptyArray);
            setCourseSupportStaff(courseData.SupportStaff || emptyArray);
          }

          const studentCourseSnapshot = await get(
            ref(db, `students/${sanitizedEmail}/courses/${courseId}`)
          );
          if (studentCourseSnapshot.exists()) {
            const studentCourseData = studentCourseSnapshot.val();
            setStudentCourseInfo(studentCourseData);
            setSchedule(studentCourseData.Schedule);
          }

          const profileSnapshot = await get(ref(db, `students/${sanitizedEmail}/profile`));
          if (profileSnapshot.exists()) {
            setStudentProfile(profileSnapshot.val());
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [user, courseId, emptyArray]);

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

  const handleIconClick = useCallback(
    (label) => {
      if (hasMandatoryNotifications && label !== 'Notifications') {
        // Check if there are any notifications with mustRespond
        const hasMustRespond = mandatoryNotifications.some(
          (notification) => notification.mustRespond
        );
        
        if (hasMustRespond) {
          alert('You have notifications that require a response before proceeding.');
          return;
        }

        // Check if there are any unread mandatory notifications
        const hasUnreadMandatory = mandatoryNotifications.some(
          (notification) => !notification.read && notification.mustRead
        );

        if (hasUnreadMandatory) {
          alert('You have mandatory notifications that need to be read before proceeding.');
          return;
        }
      }
      setExpandedIcon(label);
      setIsMobileNavOpen(false);
    },
    [hasMandatoryNotifications, mandatoryNotifications]
  );

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const closeExpandedContent = useCallback(() => {
    if (expandedIcon === 'Notifications' && hasMandatoryNotifications) {
      const hasMustRespond = mandatoryNotifications.some(
        (notification) => notification.mustRespond
      );
      const hasUnreadMandatory = mandatoryNotifications.some(
        (notification) => !notification.read && notification.mustRead
      );

      if (hasMustRespond || hasUnreadMandatory) {
        alert('You have mandatory notifications that require your attention before proceeding.');
        return;
      }
    }
    setExpandedIcon(null);
  }, [expandedIcon, hasMandatoryNotifications, mandatoryNotifications]);

  const handleReturnToPortal = useCallback(() => {
    if (hasMandatoryNotifications) {
      const hasMustRespond = mandatoryNotifications.some(
        (notification) => notification.mustRespond
      );
      const hasUnreadMandatory = mandatoryNotifications.some(
        (notification) => !notification.read && notification.mustRead
      );

      if (hasMustRespond || hasUnreadMandatory) {
        alert('You have mandatory notifications that require attention before returning to the portal.');
        return;
      }
    }
    navigate('/dashboard');
  }, [navigate, hasMandatoryNotifications, mandatoryNotifications]);

  const handleChatSelect = useCallback((chatId) => {
    setExpandedIcon('Messages');
  }, []);

  const MemoizedChatApp = useMemo(
    () => (
      <ChatApp
        courseInfo={courseInfo}
        courseTeachers={courseTeachers}
        courseSupportStaff={courseSupportStaff}
        initialParticipants={studentCourseInfo?.participants || []}
      />
    ),
    [courseInfo, courseTeachers, courseSupportStaff, studentCourseInfo]
  );

  const renderExpandedContent = useCallback(() => {
    if (expandedIcon === 'Portal') {
      return (
        <button
          onClick={handleReturnToPortal}
          className={`w-full py-2 px-4 rounded transition-colors duration-200 ${
            hasMandatoryNotifications
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={hasMandatoryNotifications}
        >
          Back to Student Portal
        </button>
      );
    } else if (expandedIcon === 'Gradebook') {
      return (
        <iframe
          src={`https://edge.rtdacademy.com/course/gradebook.php?cid=${courseId}`}
          title="Gradebook"
          className="w-full h-full border-none"
        />
      );
    } else if (expandedIcon === 'Schedule') {
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Course Schedule</h4>
          {schedule ? (
            <div dangerouslySetInnerHTML={{ __html: schedule }} />
          ) : (
            <p>No schedule available for this course.</p>
          )}
        </div>
      );
    } else if (expandedIcon === 'Book Time') {
      return (
        <iframe
          src="https://outlook.office365.com/owa/calendar/RTDBookings@rtdacademy.com/bookings/"
          title="Book Time"
          className="w-full h-full border-none"
        />
      );
    } else if (expandedIcon === 'Messages') {
      return MemoizedChatApp;
    } else if (expandedIcon === 'Notifications') {
      return (
        <Notifications 
          onChatSelect={handleChatSelect} 
          hasMandatoryNotifications={hasMandatoryNotifications}
          mandatoryNotifications={mandatoryNotifications}
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
    schedule,
    MemoizedChatApp,
    handleChatSelect,
    handleReturnToPortal,
    hasMandatoryNotifications,
    mandatoryNotifications,
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
                } ${
                  hasMandatoryNotifications && item.label !== 'Notifications'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-700'
                }`}
                disabled={hasMandatoryNotifications && item.label !== 'Notifications'}
              >
                <span className="inline-block align-middle mr-2">{item.icon}</span>
                {isSidebarExpanded && (
                  <span className="inline-block align-middle">{item.label}</span>
                )}
                {item.label === 'Notifications' && (
                  <>
                    {unreadNotificationsCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadNotificationsCount}
                      </span>
                    )}
                    {hasMandatoryNotifications && (
                      <span className="ml-2 text-yellow-400">
                        <FaExclamationTriangle size={16} />
                      </span>
                    )}
                  </>
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
          <div className="fixed inset-0 bg-gray-700 text-white z-50 overflow-y-auto sm:static sm:inset-auto sm:w-1/2">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{expandedIcon}</h3>
                <button
                  onClick={closeExpandedContent}
                  className={`text-white transition-colors duration-200 ${
                    expandedIcon === 'Notifications' && hasMandatoryNotifications
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:text-gray-300'
                  }`}
                  aria-label="Close expanded content"
                  disabled={expandedIcon === 'Notifications' && hasMandatoryNotifications}
                  title={
                    expandedIcon === 'Notifications' && hasMandatoryNotifications
                      ? 'You have mandatory notifications that need attention'
                      : 'Close expanded content'
                  }
                >
                  <FaArrowLeft size={24} />
                </button>
              </div>
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