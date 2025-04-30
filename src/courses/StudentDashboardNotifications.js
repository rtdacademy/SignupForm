import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

function StudentDashboardNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    priority: 'normal',
    active: true,
    expirationDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { hasAdminAccess, hasSuperAdminAccess, PERMISSION_INDICATORS } = useAuth();
  
  useEffect(() => {
    // Fetch notifications from firebase
    const db = getDatabase();
    const notificationsRef = ref(db, 'dashboardNotifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setNotifications(notificationArray);
      } else {
        setNotifications([]);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewNotification({
      ...newNotification,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const saveNotification = () => {
    if (!hasAdminAccess()) return;
    
    const db = getDatabase();
    const notificationsRef = ref(db, 'dashboardNotifications');
    
    if (isEditing && editingId) {
      // Update existing notification
      const notificationRef = ref(db, `dashboardNotifications/${editingId}`);
      set(notificationRef, newNotification)
        .then(() => {
          setIsEditing(false);
          setEditingId(null);
          resetForm();
        })
        .catch(error => {
          console.error("Error updating notification:", error);
        });
    } else {
      // Create new notification with unique ID
      const newNotificationRef = ref(db, `dashboardNotifications/${Date.now()}`);
      set(newNotificationRef, newNotification)
        .then(() => {
          resetForm();
        })
        .catch(error => {
          console.error("Error saving notification:", error);
        });
    }
  };
  
  const editNotification = (notification) => {
    if (!hasAdminAccess()) return;
    
    setNewNotification({
      title: notification.title,
      message: notification.message,
      priority: notification.priority || 'normal',
      active: notification.active !== false,
      expirationDate: notification.expirationDate || ''
    });
    setIsEditing(true);
    setEditingId(notification.id);
  };
  
  const deleteNotification = (id) => {
    if (!hasAdminAccess()) return;
    
    const db = getDatabase();
    const notificationRef = ref(db, `dashboardNotifications/${id}`);
    set(notificationRef, null)
      .then(() => {
        console.log("Notification deleted successfully");
      })
      .catch(error => {
        console.error("Error deleting notification:", error);
      });
  };
  
  const resetForm = () => {
    setNewNotification({
      title: '',
      message: '',
      priority: 'normal',
      active: true,
      expirationDate: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Show admin access required message if not an admin
  if (!hasAdminAccess()) {
    const { icon: AdminIcon, label, description } = PERMISSION_INDICATORS.ADMIN;
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <ShieldAlert className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">{label}</h2>
          <p className="text-yellow-700 mb-4">{description}</p>
          <p className="text-sm text-yellow-600">
            You need administrator privileges to access the student dashboard notifications management.
            Please contact a super administrator if you believe you should have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">Student Dashboard Notifications</h2>
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-3">{isEditing ? 'Edit Notification' : 'Create New Notification'}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={newNotification.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Notification title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              value={newNotification.message}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Notification message"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                name="priority"
                value={newNotification.priority}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expiration Date</label>
              <input
                type="date"
                name="expirationDate"
                value={newNotification.expirationDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-center mt-7">
              <input
                type="checkbox"
                name="active"
                checked={newNotification.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 mr-2"
              />
              <label>Active</label>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={saveNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditing ? 'Update' : 'Add'} Notification
            </button>
            
            {isEditing && (
              <button 
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Current Notifications</h3>
        
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found.</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={`bg-white shadow-md rounded-lg p-4 border-l-4 ${
                notification.priority === 'urgent' ? 'border-red-500' :
                notification.priority === 'high' ? 'border-orange-500' :
                notification.priority === 'low' ? 'border-blue-500' : 'border-green-500'
              } ${!notification.active ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between">
                <h4 className="text-lg font-medium">{notification.title}</h4>
                <div className="space-x-2">
                  <button 
                    onClick={() => editNotification(notification)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="my-2">{notification.message}</p>
              
              <div className="flex text-sm text-gray-500 mt-2 space-x-4">
                <span>Status: {notification.active ? 'Active' : 'Inactive'}</span>
                <span>Priority: {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}</span>
                {notification.expirationDate && (
                  <span>Expires: {new Date(notification.expirationDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentDashboardNotifications;