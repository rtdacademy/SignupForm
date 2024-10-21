// Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, get, update, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Loader, Eye, EyeOff, MessageSquare, User, UserCheck } from 'lucide-react';
import DOMPurify from 'dompurify';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import ChatApp from '../chat/ChatApp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [chatParticipants, setChatParticipants] = useState([]);
  const db = getDatabase();
  const sanitizedEmail = user ? sanitizeEmail(user.email) : '';

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const notificationsRef = ref(db, `notifications/${sanitizedEmail}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsList = Object.entries(notificationsData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter((notification) => !notification.read);
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db, sanitizedEmail]);

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
      if (!user) return;

      try {
        const notificationRef = ref(db, `notifications/${sanitizedEmail}/${notificationId}`);
        await update(notificationRef, {
          read: true,
          unreadCount: 0,
        });
        console.log(`Notification ${notificationId} marked as read.`);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [db, sanitizedEmail, user]
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
          setChatParticipants(chatData.participants.map(email => ({
            email: email,
            displayName: email // You might want to fetch actual display names if available
          })));
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
                notification.read ? 'bg-neutral-200' : 'bg-highlight shadow-md'
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
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-[1000px] h-[800px]">
          <DialogHeader>
            <DialogTitle>
              Chat with {selectedNotification?.senderName}
            </DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-hidden">
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
