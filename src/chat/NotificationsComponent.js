import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onChildAdded, off, update, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaCheckCircle } from 'react-icons/fa';

const NotificationsComponent = ({ onChatSelect }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const notificationsRef = ref(db, `students/${user.uid}/notifications`);

      const handleNewNotification = (snapshot) => {
        const notification = { id: snapshot.key, ...snapshot.val() };
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      };

      onChildAdded(notificationsRef, handleNewNotification);

      return () => {
        off(notificationsRef, 'child_added', handleNewNotification);
      };
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    const db = getDatabase();
    const notificationRef = ref(db, `students/${user.uid}/notifications/${notification.id}`);
    
    if (notification.type === "new_chat") {
      // Remove the notification after handling
      await remove(notificationRef);
      
      // Navigate to the chat
      onChatSelect(notification.chatId);
    } else {
      // For other types of notifications, just mark as read
      await update(notificationRef, { read: true });
    }

    // Remove the notification from the local state
    setNotifications((prevNotifications) => 
      prevNotifications.filter((n) => n.id !== notification.id)
    );
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none focus:text-white"
      >
        <FaBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            <h3 className="text-lg leading-6 font-medium text-gray-900 px-4 py-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 px-4 py-2">No new notifications</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {notification.read ? (
                          <FaCheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm leading-5 ${notification.read ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs leading-4 text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsComponent;