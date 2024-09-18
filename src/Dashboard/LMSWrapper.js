import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBook, FaComments, FaCog, FaTimes, FaHome, FaGraduationCap, FaClipboardList, FaRegCalendarCheck } from 'react-icons/fa';
import { getDatabase, ref, get } from "firebase/database";
import { useAuth } from '../context/AuthContext';
import ChatApp from '../chat/ChatApp';

const LMSWrapper = () => {
  const [expandedIcon, setExpandedIcon] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cid = searchParams.get('cid');
    setCourseId(cid);

    const fetchSchedule = async () => {
      if (user && cid) {
        const db = getDatabase();
        const sanitizedEmail = user.email.replace(/\./g, ',');
        const courseScheduleRef = ref(db, `students/${sanitizedEmail}/courses/${cid}/Schedule`);
        
        try {
          const snapshot = await get(courseScheduleRef);
          if (snapshot.exists()) {
            setSchedule(snapshot.val());
          } else {
            console.log("No schedule available for this course");
          }
        } catch (error) {
          console.error("Error fetching course schedule:", error);
        }
      }
    };

    fetchSchedule();
  }, [location, user, courseId]);

  const navItems = [
    { icon: <FaHome />, label: 'Portal', content: 'Back to Student Portal' },
    { icon: <FaBook />, label: 'Courses', content: 'Course content goes here' },
    { icon: <FaGraduationCap />, label: 'Gradebook', content: 'gradebook' },
    { icon: <FaClipboardList />, label: 'Schedule', content: 'Schedule content goes here' },
    { icon: <FaComments />, label: 'Messages', content: 'Messaging content goes here' },
    { icon: <FaCog />, label: 'Settings', content: 'Settings content goes here' },
    { icon: <FaRegCalendarCheck />, label: 'Book Time', content: 'booking' },
  ];

  const handleIconClick = (label) => {
    setExpandedIcon(expandedIcon === label ? null : label);
  };

  const handleReturnToPortal = () => {
    navigate('/dashboard');
  };

  const renderExpandedContent = () => {
    if (expandedIcon === 'Portal') {
      return (
        <button
          onClick={handleReturnToPortal}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
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
          src='https://outlook.office365.com/owa/calendar/RTDBookings@rtdacademy.com/bookings/'
          title="Book Time"
          className="w-full h-full border-none"
        />
      );
    } else if (expandedIcon === 'Messages') {
      return <ChatApp />;
    } else {
      return (
        <p className="text-gray-300">{navItems.find((item) => item.label === expandedIcon).content}</p>
      );
    }
  };

  const getSidebarWidth = () => {
    switch (expandedIcon) {
      case 'Messages':
        return 'w-[calc(60vw-3rem)]';
      case 'Gradebook':
      case 'Book Time':
      case 'Schedule':
        return 'w-[calc(50vw-3rem)]';
      default:
        return 'w-64';
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex h-full">
        <div className="bg-gray-800 text-white w-12 flex-shrink-0 flex flex-col items-center py-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleIconClick(item.label)}
              className={`p-2 mb-4 rounded-full hover:bg-gray-700 transition-colors duration-200 ${
                expandedIcon === item.label ? 'bg-gray-700' : ''
              }`}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
        {expandedIcon && (
          <div className={`bg-gray-700 text-white flex flex-col ${getSidebarWidth()}`}>
            <div className="flex justify-between items-center p-4">
              <h3 className="text-lg font-semibold">{expandedIcon}</h3>
              <button
                onClick={() => setExpandedIcon(null)}
                className="text-gray-300 hover:text-white transition-colors duration-200"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-grow overflow-hidden">
              {renderExpandedContent()}
            </div>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <iframe
          src={`https://edge.rtdacademy.com/course/course.php?folder=0&cid=${courseId}`}
          title="RTD Academy LMS"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};

export default LMSWrapper;