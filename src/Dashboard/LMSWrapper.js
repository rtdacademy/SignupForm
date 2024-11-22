import React, { useState, useCallback, useMemo } from 'react';
import CryptoJS from 'crypto-js';
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
import ChatApp from '../chat/ChatApp';
import Notifications from '../Notifications/Notifications';

const LMSWrapper = ({ 
  userEmailKey, 
  courseId, 
  courseData,
  onReturn
}) => {
  const [expandedIcon, setExpandedIcon] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Extract course data from courseDetails
  const courseTitle = courseData.Course?.Value || courseData.courseDetails?.Title || '';
  const courseTeachers = courseData.courseDetails?.Teachers || [];
  const courseSupportStaff = courseData.courseDetails?.SupportStaff || [];
  const allowStudentChats = courseData.courseDetails?.allowStudentChats || false;

  // Generate encrypted SSO token
  const generateSSOToken = useCallback(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;
    
    if (!ENCRYPTION_KEY || !userEmailKey) {
      console.warn('Missing required SSO parameters');
      return '';
    }

    const payload = {
      studentEmail: userEmailKey,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7)
    };

    console.log('SSO Payload before encryption:', payload);

    try {
      const payloadString = JSON.stringify(payload);
      const encryptedPayload = CryptoJS.AES.encrypt(
        payloadString,
        ENCRYPTION_KEY
      ).toString();

      console.log('Encrypted SSO token:', encryptedPayload);
      return encodeURIComponent(encryptedPayload);
    } catch (error) {
      console.error('SSO token generation failed:', error);
      return '';
    }
  }, [userEmailKey]);

  // Generate the LMS URL with SSO token
  const getLMSUrl = useCallback(() => {
    const baseUrl = 'https://edge.rtdacademy.com/course/course.php';
    const ssoToken = generateSSOToken();
    
    const params = new URLSearchParams({
      folder: '0',
      cid: courseId,
      view: 'iframe'
    });

    if (ssoToken) {
      params.append('ssoToken', ssoToken);
    }

    return `${baseUrl}?${params.toString()}`;
  }, [courseId, generateSSOToken]);

  const navItems = useMemo(
    () => [
      { icon: <FaClipboardList />, label: 'Schedule', content: 'Schedule content goes here' },
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

  const handleChatSelect = useCallback(() => {
    setExpandedIcon('Messages');
  }, []);

  const renderExpandedContent = useCallback(() => {
    if (expandedIcon === 'Notifications') {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <Notifications 
            userEmailKey={userEmailKey}
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
    } else {
      return (
        <p className="text-gray-600">
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
    navItems,
  ]);

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

        {/* iframe content */}
        <div className={`flex-grow ${expandedIcon ? 'hidden sm:block' : 'block'}`}>
          <iframe
            src={getLMSUrl()}
            title="RTD Academy LMS"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(LMSWrapper);