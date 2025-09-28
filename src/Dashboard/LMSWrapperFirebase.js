import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { toast } from 'sonner';
import {
  FaClipboardList,
  FaRegCalendarCheck,
  FaBell,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaChevronLeft,
  FaArrowLeft,
} from 'react-icons/fa';

import Notifications from '../Notifications/Notifications';
import ScheduleDisplay from '../Schedule/ScheduleDisplay';

/**
 * Enhanced LMS Wrapper for Firebase SSO Integration
 *
 * This component seamlessly integrates with your own IMathAS instance
 * using Firebase authentication for Single Sign-On.
 *
 * Features:
 * - Automatic Firebase token generation and refresh
 * - Seamless iframe embedding with SSO
 * - Post-message communication for auth status
 * - Automatic course enrollment
 */
const LMSWrapperFirebase = ({
  courseId,
  courseData,
  onReturn
}) => {
  const { current_user_email_key, isEmulating, user } = useAuth();

  const [expandedIcon, setExpandedIcon] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Your IMathAS instance URL
  // Uses environment variable if set, otherwise defaults based on environment
  const IMATHAS_BASE_URL = process.env.REACT_APP_IMATHAS_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'  // Local IMathAS instance for development
      : 'https://imathas-backend-406494878558.northamerica-northeast1.run.app');

  console.log('Using IMathAS URL:', IMATHAS_BASE_URL);

  // Extract course data from courseDetails
  const courseTitle = courseData.Course?.Value || courseData.courseDetails?.Title || '';
  const courseTeachers = courseData.courseDetails?.Teachers || [];
  const courseSupportStaff = courseData.courseDetails?.SupportStaff || [];
  const allowStudentChats = courseData.courseDetails?.allowStudentChats || false;

  // Get Firebase ID token for SSO
  useEffect(() => {
    const fetchToken = async () => {
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken(true);
          setFirebaseToken(token);
          setAuthError(null);
        } catch (error) {
          console.error('Error getting Firebase token:', error);
          setAuthError('Failed to authenticate. Please refresh the page.');
          toast.error('Authentication error. Please try again.');
        }
      }
    };

    fetchToken();

    // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
    const tokenRefreshInterval = setInterval(fetchToken, 50 * 60 * 1000);

    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  // Generate the IMathAS URL with Firebase SSO
  const getLMSUrl = useCallback(() => {
    if (!firebaseToken) {
      return null;
    }

    // Use the Firebase SSO endpoint
    const params = new URLSearchParams({
      firebase_token: firebaseToken, // Changed to match what the auth hook expects
      cid: courseId,
      embed: '1', // Indicate iframe embedding
      view: 'iframe'
    });

    return `${IMATHAS_BASE_URL}/firebase_sso.php?${params.toString()}`;
  }, [courseId, firebaseToken, IMATHAS_BASE_URL]);

  // Handle messages from IMathAS iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify origin - handle both local and production
      const allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:8081',
        IMATHAS_BASE_URL
      ];

      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
        return;
      }

      // Handle the message data
      const messageData = event.data;

      // Check if it's an object with type property
      if (typeof messageData === 'object' && messageData !== null) {
        const { type, data, error, userId, courseId } = messageData;

        switch (type) {
          case 'firebase-sso-success':
            console.log('SSO successful:', { userId, courseId, data });
            setIframeLoading(false);
            toast.success('Connected to course successfully!');
            break;

          case 'firebase-sso-error':
            console.error('SSO error:', error || data);
            setAuthError(error || 'Authentication failed');
            setIframeLoading(false);
            toast.error('Failed to connect to course. Please try again.');
            break;

          case 'imathas-navigation':
            // Handle navigation events from IMathAS if needed
            console.log('IMathAS navigation:', data);
            break;

          default:
            // Ignore other messages
            console.log('Unknown message type from iframe:', type);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [IMATHAS_BASE_URL]);

  const navItems = useMemo(
    () => [
      { icon: <FaClipboardList />, label: 'Schedule' },
      { icon: <FaRegCalendarCheck />, label: 'Book Time' },
      { icon: <FaBell />, label: 'Notifications' },
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

  const handleScheduleSaved = useCallback((schedule) => {
    console.log('Schedule saved:', schedule);
    toast.success('Schedule saved successfully!');
  }, []);

  const handleChatSelect = useCallback(() => {
    setExpandedIcon('Messages');
  }, []);

  const renderExpandedContent = useCallback(() => {
    if (expandedIcon === 'Schedule') {
      return (
        <div className="h-full overflow-auto p-4">
          <ScheduleDisplay scheduleJSON={courseData.ScheduleJSON} />
        </div>
      );
    } else if (expandedIcon === 'Notifications') {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <Notifications
            userEmailKey={current_user_email_key}
            onChatSelect={handleChatSelect}
          />
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
    }
  }, [expandedIcon, courseData, current_user_email_key, handleChatSelect]);

  // Show loading or error state
  if (!firebaseToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile menu button */}
      {!expandedIcon && (
        <button
          className="sm:hidden fixed top-4 left-4 z-50 bg-white text-gray-700 p-2 rounded-md shadow-lg"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          <FaBars />
        </button>
      )}

      {/* Navigation sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:relative sm:translate-x-0
        ${isSidebarExpanded ? 'sm:w-64' : 'sm:w-20'}
        border-r border-gray-100`}
      >
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-gray-100">
            <button className="sm:hidden text-gray-600" onClick={closeMobileNav}>
              <FaTimes />
            </button>
            <button
              className="hidden sm:block text-gray-600 hover:text-gray-800 transition-colors duration-200"
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
                className={`w-full text-left p-4 transition-all duration-200 flex items-center
                  ${expandedIcon === item.label
                    ? 'bg-gray-100 text-gray-900 border-r-4 border-blue-500 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
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
          <div className="fixed inset-0 bg-white z-50 flex flex-col sm:static sm:inset-auto sm:w-1/2 shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {expandedIcon}
                </h3>
                <button
                  onClick={closeExpandedContent}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  aria-label="Close expanded content"
                >
                  <FaArrowLeft size={24} />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-hidden">
              {renderExpandedContent()}
            </div>
          </div>
        )}

        {/* IMathAS iframe content */}
        <div className={`flex-grow relative ${expandedIcon ? 'hidden sm:block' : 'block'}`}>
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading course content...</p>
              </div>
            </div>
          )}
          <iframe
            src={getLMSUrl()}
            title="RTD Academy LMS"
            className="w-full h-full border-none"
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(LMSWrapperFirebase);