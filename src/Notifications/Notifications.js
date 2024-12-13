import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, get, update, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { 
  Loader, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  User, 
  UserCheck,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import DOMPurify from 'dompurify';
import ChatApp from '../chat/ChatApp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const Notifications = () => {
  const { currentUser, current_user_email_key, isEmulating } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [chatParticipants, setChatParticipants] = useState([]);
  const db = getDatabase();

  // Fetch notifications
  useEffect(() => {
    if (!currentUser || !current_user_email_key) return;

    const notificationsRef = ref(db, `notifications/${current_user_email_key}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsList = Object.entries(notificationsData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter((notification) => {
            // Keep unread notifications OR notifications that have mustRespond set to true
            return !notification.read || notification.mustRespond === true;
          });
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, current_user_email_key, db]);

  // Fetch course names for notifications
  useEffect(() => {
    if (!notifications.length) return;

    const fetchCourses = async () => {
      const coursePromises = notifications.map(async (notification) => {
        if (notification.senderCourses && notification.senderCourses.length > 0) {
          const courseNamesPromises = notification.senderCourses.map(async (courseId) => {
            const courseRef = ref(db, `courses/${courseId}`);
            const courseSnapshot = await get(courseRef);
            return courseSnapshot.exists() ? courseSnapshot.val().Title : 'Unknown Course';
          });
          const courseNames = await Promise.all(courseNamesPromises);
          return { [notification.id]: courseNames };
        }
        return { [notification.id]: [] };
      });

      const coursesData = await Promise.all(coursePromises);
      const coursesObject = coursesData.reduce((acc, course) => ({ ...acc, ...course }), {});
      setCourses(coursesObject);
    };

    fetchCourses();
  }, [notifications, db]);

  // Mark a notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!currentUser || !current_user_email_key) return;
  
      try {
        const notificationRef = ref(db, `notifications/${current_user_email_key}/${notificationId}`);
        const notificationSnapshot = await get(notificationRef);
        
        if (notificationSnapshot.exists()) {
          const notificationData = notificationSnapshot.val();
          
          // Only mark as read if there's no mustRespond requirement
          // or if both mustRead and mustRespond are false
          if (!notificationData.mustRespond) {
            await update(notificationRef, {
              read: true,
              unreadCount: 0,
              // Only update mustRead flag if it exists and there's no mustRespond
              ...(notificationData.mustRead !== undefined && { mustRead: false })
            });
            console.log(`Notification ${notificationId} marked as read.`);
          } else {
            // If mustRespond is true, only update the mustRead flag
            if (notificationData.mustRead) {
              await update(notificationRef, {
                mustRead: false
              });
            }
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [db, current_user_email_key, currentUser]
  );

  // Sanitize HTML content to prevent XSS
  const sanitizeHtml = (html) => {
    return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
  };

  // Handle clicking on a notification
  const handleNotificationClick = async (notification) => {
    setSelectedChatId(notification.chatId);
    setSelectedNotification(notification);
    setIsChatOpen(true);
    markAsRead(notification.id);
  
    try {
      const chatRef = ref(db, `chats/${notification.chatId}`);
      const chatSnapshot = await get(chatRef);
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.val();
        if (chatData.participants) {
          const participantDetails = await Promise.all(
            chatData.participants.map(async (email) => {
              let userRef = ref(db, `staff/${email}`);
              let userSnapshot = await get(userRef);
  
              if (!userSnapshot.exists()) {
                userRef = ref(db, `students/${email}/profile`);
                userSnapshot = await get(userRef);
              }
  
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                const isStaff = email.includes('@rtdacademy.com');
                return {
                  email: email,
                  displayName: isStaff
                    ? userData.displayName
                    : `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                  type: isStaff ? 'staff' : 'student',
                  isStaff,
                };
              }
              return { email: email, displayName: email, type: 'unknown', isStaff: false };
            })
          );
          setChatParticipants(participantDetails);
        }
      }
    } catch (error) {
      console.error('Error fetching chat participants:', error);
    }
  };

  // Handle closing the chat modal
  const handleCloseChatModal = () => {
    setIsChatOpen(false);
    setSelectedChatId(null);
    setSelectedNotification(null);
    setChatParticipants([]);
  };

  // Render status indicators
  const renderStatusIndicators = (notification) => {
    return (
      <div className="flex gap-2 items-center">
        {Boolean(notification.mustRead) && (
          <div className="flex items-center text-red-500" title="Must Read">
            <BookOpen size={16} />
            <span className="text-xs ml-1">Must Read</span>
          </div>
        )}
        {Boolean(notification.mustRespond) && (
          <div className="flex items-center text-red-500" title="Must Respond">
            <MessageCircle size={16} />
            <span className="text-xs ml-1">Must Respond</span>
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-100 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-neutral-500">No unread notifications available.</p>
      ) : (
        <ul className="space-y-6">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-5 border rounded-lg transition-all duration-300 cursor-pointer ${
                notification.read && !notification.mustRespond ? 'bg-neutral-200' : 'bg-highlight shadow-md'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-neutral-700 flex items-center">
                  {notification.type === 'new_message' && (
                    <MessageSquare className="text-secondary mr-2" size={20} />
                  )}
                  {notification.isStaff ? (
                    <UserCheck className="text-success mr-2" size={20} />
                  ) : (
                    <User className="text-primary mr-2" size={20} />
                  )}
                  <div
                    className="font-medium"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(notification.preview) }}
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="ml-4 text-primary hover:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary transition duration-150 ease-in-out"
                  title={notification.read ? 'Already Read' : 'Mark as Read'}
                >
                  {notification.read ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Status Indicators */}
              {(Boolean(notification.mustRead) || Boolean(notification.mustRespond)) && (
                <div className="mb-3">
                  {renderStatusIndicators(notification)}
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="px-3 py-1 text-xs font-semibold text-primary bg-secondary bg-opacity-20 rounded-full shadow-sm">
                  From: {notification.senderName}
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-primary bg-secondary bg-opacity-20 rounded-full shadow-sm">
                  Unread Messages: {notification.unreadCount}
                </span>
                {courses[notification.id] && courses[notification.id].length > 0 && (
                  <span className="px-3 py-1 text-xs font-semibold text-success-dark bg-success-light bg-opacity-20 rounded-full shadow-sm">
                    Courses: {courses[notification.id].join(', ')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Chat Modal */}
      <Dialog open={isChatOpen} onOpenChange={handleCloseChatModal}>
        <DialogContent className="max-w-[90vw] w-[1000px] h-[95vh] max-h-[900px] p-4 flex flex-col">
          <DialogHeader className="mb-0 bg-white py-0">
            <DialogTitle>
              Messaging
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden rounded-lg border border-gray-200">
            {selectedChatId && (
              <ChatApp
                mode="popup"
                courseInfo={null}
                courseTeachers={[]}
                courseSupportStaff={[]}
                initialParticipants={chatParticipants}
                existingChatId={selectedChatId}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
