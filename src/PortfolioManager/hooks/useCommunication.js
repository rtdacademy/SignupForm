import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook for managing portfolio entry communication and scoring
 */
export const useCommunication = (familyId, studentId, entryId = null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);
  const [messageBreakdown, setMessageBreakdown] = useState({
    parentMessages: { count: 0, unread: 0, lastAuthor: null },
    staffMessages: { count: 0, unread: 0, lastAuthor: null },
    lastMessage: null
  });

  const db = getFirestore();
  const unsubscribeRef = useRef(null);

  // Handle null values - return early if required params are missing
  const isValid = familyId && studentId;

  // Paths - only create if we have valid IDs
  // Structure: portfolios/{familyId}/communications and portfolios/{familyId}/notifications
  // These are subcollections under the family document
  const communicationsPath = isValid ? `portfolios/${familyId}/communications` : null;
  const notificationsPath = isValid ? `portfolios/${familyId}/notifications` : null;

  /**
   * Get user display name
   */
  const getUserDisplayName = useCallback(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Unknown User';
  }, [user]);

  /**
   * Get user role
   */
  const getUserRole = useCallback(() => {
    if (!user) return 'unknown';

    if (user.email?.includes('@rtdacademy.com') ||
        user.customClaims?.role === 'staff' ||
        user.role === 'staff') {
      return 'facilitator';
    }

    // Could add student detection logic here
    return 'parent';
  }, [user]);

  /**
   * Subscribe to messages for a specific entry
   */
  useEffect(() => {
    if (!isValid || !entryId || !user) {
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const messagesRef = collection(db, communicationsPath);
    const q = query(
      messagesRef,
      where('entryId', '==', entryId),
      orderBy('createdAt', 'asc')
    );

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const messageList = [];
        snapshot.forEach((doc) => {
          messageList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setMessages(messageList);
        setLoadingMessages(false);
      },
      (err) => {
        console.error('Error loading messages:', err);
        setError(err.message);
        setLoadingMessages(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isValid, entryId, user, db, communicationsPath]);

  /**
   * Subscribe to notifications for current user
   */
  useEffect(() => {
    if (!isValid || !user) return;

    const notificationRef = doc(db, notificationsPath, `${studentId}_${user.uid}`);

    const unsubscribe = onSnapshot(
      notificationRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setNotifications(docSnap.data());
        } else {
          setNotifications({
            unreadCount: 0,
            unreadByEntry: {},
            lastChecked: null,
            lastMessageAt: null
          });
        }
      },
      (err) => {
        console.error('Error loading notifications:', err);
      }
    );

    return () => unsubscribe();
  }, [isValid, user, db, notificationsPath, studentId]);

  /**
   * Process messages to get breakdown by role
   */
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setMessageBreakdown({
        parentMessages: { count: 0, unread: 0, lastAuthor: null },
        staffMessages: { count: 0, unread: 0, lastAuthor: null },
        lastMessage: null
      });
      return;
    }

    // Filter actual messages (not scores)
    const actualMessages = messages.filter(m => m.type !== 'score');

    // Separate by role
    const parentMsgs = actualMessages.filter(m => m.authorRole === 'parent');
    const staffMsgs = actualMessages.filter(m => m.authorRole === 'facilitator');

    // Count unread messages
    const parentUnread = parentMsgs.filter(m => !m.readBy || !m.readBy[user?.uid]).length;
    const staffUnread = staffMsgs.filter(m => !m.readBy || !m.readBy[user?.uid]).length;

    // Get last authors
    const lastParentAuthor = parentMsgs.length > 0 ? parentMsgs[0].authorName : null;
    const lastStaffAuthor = staffMsgs.length > 0 ? staffMsgs[0].authorName : null;

    // Get last message overall
    const lastMsg = actualMessages[0];
    const lastMessage = lastMsg ? {
      preview: lastMsg.content ?
        lastMsg.content.replace(/<[^>]*>/g, '').substring(0, 50) + '...' :
        'New message',
      authorRole: lastMsg.authorRole,
      authorName: lastMsg.authorName,
      timestamp: lastMsg.createdAt?.toDate ? lastMsg.createdAt.toDate() : new Date()
    } : null;

    setMessageBreakdown({
      parentMessages: {
        count: parentMsgs.length,
        unread: parentUnread,
        lastAuthor: lastParentAuthor
      },
      staffMessages: {
        count: staffMsgs.length,
        unread: staffUnread,
        lastAuthor: lastStaffAuthor
      },
      lastMessage
    });
  }, [messages, user]);

  /**
   * Send a new message
   */
  const sendMessage = useCallback(async (messageData) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const batch = writeBatch(db);

    // Create message document
    const messageRef = doc(collection(db, communicationsPath));
    const newMessage = {
      ...messageData,
      studentId: studentId, // Add missing studentId field
      authorId: user.uid,
      authorName: getUserDisplayName(),
      authorEmail: user.email,
      authorRole: messageData.authorRole || getUserRole(),
      readBy: {
        [user.uid]: serverTimestamp()
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    batch.set(messageRef, newMessage);

    // Update notifications for other users
    // Get all users who should be notified (those who have participated in the conversation)
    const existingAuthors = new Set(messages.map(m => m.authorId));
    existingAuthors.delete(user.uid); // Don't notify sender

    for (const recipientId of existingAuthors) {
      // Use studentId_userId format for notification document ID to match Firestore rules
      const notificationRef = doc(db, notificationsPath, `${studentId}_${recipientId}`);

      // Use set with merge to create if doesn't exist
      batch.set(
        notificationRef,
        {
          unreadCount: increment(1),
          [`unreadByEntry.${messageData.entryId}`]: increment(1),
          lastMessageAt: serverTimestamp()
        },
        { merge: true }
      );
    }

    // Update entry metadata to track communication activity
    const entryRef = doc(db, `portfolios/${familyId}/entries`, messageData.entryId);
    batch.update(entryRef, {
      lastCommunicationAt: serverTimestamp(),
      communicationCount: increment(1),
      hasUnreadCommunication: true
    });

    await batch.commit();

    return messageRef.id;
  }, [user, isValid, familyId, studentId, db, communicationsPath, notificationsPath, messages, getUserDisplayName, getUserRole]);

  /**
   * Add a score assessment
   */
  const addScore = useCallback(async (scoreData) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    // Scores are special messages with type 'score'
    return sendMessage({
      ...scoreData,
      type: 'score'
    });
  }, [user, isValid, sendMessage]);

  /**
   * Mark message as read
   */
  const markAsRead = useCallback(async (messageId) => {
    if (!user || !isValid) return;

    const batch = writeBatch(db);

    // Update message read status
    const messageRef = doc(db, communicationsPath, messageId);
    batch.update(messageRef, {
      [`readBy.${user.uid}`]: serverTimestamp()
    });

    // Get the message to find its entryId
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const entryId = messageDoc.data().entryId;

      // Update notification count for current user
      const notificationRef = doc(db, notificationsPath, `${studentId}_${user.uid}`);
      const notificationDoc = await getDoc(notificationRef);

      if (notificationDoc.exists()) {
        const currentData = notificationDoc.data();
        const entryUnreadCount = currentData.unreadByEntry?.[entryId] || 0;

        if (entryUnreadCount > 0) {
          batch.update(notificationRef, {
            unreadCount: increment(-1),
            [`unreadByEntry.${entryId}`]: increment(-1),
            lastChecked: serverTimestamp()
          });
        }
      }
    }

    await batch.commit();
  }, [user, isValid, db, communicationsPath, notificationsPath]);

  /**
   * Mark all messages for an entry as read
   */
  const markAllAsRead = useCallback(async (entryId) => {
    if (!user || !isValid || !entryId) return;

    const batch = writeBatch(db);

    // Get all unread messages for this entry
    const unreadMessages = messages.filter(
      msg => msg.entryId === entryId && (!msg.readBy || !msg.readBy[user.uid])
    );

    // Mark each message as read
    for (const message of unreadMessages) {
      const messageRef = doc(db, communicationsPath, message.id);
      batch.update(messageRef, {
        [`readBy.${user.uid}`]: serverTimestamp()
      });
    }

    // Reset notification count for this entry
    if (unreadMessages.length > 0) {
      const notificationRef = doc(db, notificationsPath, `${studentId}_${user.uid}`);
      batch.update(notificationRef, {
        unreadCount: increment(-unreadMessages.length),
        [`unreadByEntry.${entryId}`]: 0,
        lastChecked: serverTimestamp()
      });

      // Update entry metadata
      const entryRef = doc(db, `portfolios/${familyId}/entries`, entryId);
      batch.update(entryRef, {
        hasUnreadCommunication: false
      });
    }

    await batch.commit();
  }, [user, isValid, familyId, studentId, messages, db, communicationsPath, notificationsPath]);

  /**
   * Update a message
   */
  const updateMessage = useCallback(async (messageId, updates) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const messageRef = doc(db, communicationsPath, messageId);
    await updateDoc(messageRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      edited: true,
      editedBy: user.uid,
      editedAt: serverTimestamp()
    });
  }, [user, isValid, db, communicationsPath]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (messageId) => {
    if (!user || !isValid) {
      throw new Error('Missing required data');
    }

    const messageRef = doc(db, communicationsPath, messageId);
    await deleteDoc(messageRef);
  }, [user, isValid, db, communicationsPath]);

  /**
   * Get all entries with unread messages for dashboard
   */
  const getUnreadEntries = useCallback(async () => {
    if (!user || !isValid) return [];

    const notificationRef = doc(db, notificationsPath, `${studentId}_${user.uid}`);
    const notificationDoc = await getDoc(notificationRef);

    if (!notificationDoc.exists()) return [];

    const unreadByEntry = notificationDoc.data().unreadByEntry || {};
    const entriesWithUnread = Object.entries(unreadByEntry)
      .filter(([_, count]) => count > 0)
      .map(([entryId, count]) => ({
        entryId,
        unreadCount: count
      }));

    return entriesWithUnread;
  }, [user, isValid, db, notificationsPath]);

  /**
   * Get communication summary for an entry
   */
  const getEntryCommunicationSummary = useCallback(async (entryId) => {
    if (!isValid || !entryId) return null;

    const messagesRef = collection(db, communicationsPath);
    const q = query(
      messagesRef,
      where('entryId', '==', entryId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const allMessages = [];
    snapshot.forEach(doc => {
      allMessages.push({ id: doc.id, ...doc.data() });
    });

    // Get latest scores
    const scores = allMessages.filter(m => m.type === 'score');
    const parentScore = scores.find(s => s.authorRole === 'parent');
    const facilitatorScore = scores.find(s => s.authorRole === 'facilitator');

    // Get message count
    const messageCount = allMessages.filter(m => m.type === 'message').length;

    // Get unread count for current user
    const unreadCount = allMessages.filter(
      m => !m.readBy || !m.readBy[user?.uid]
    ).length;

    return {
      messageCount,
      unreadCount,
      parentScore: parentScore?.score || null,
      facilitatorScore: facilitatorScore?.score || null,
      lastMessageAt: allMessages[0]?.createdAt || null,
      hasActivity: allMessages.length > 0
    };
  }, [isValid, familyId, studentId, user, db, communicationsPath]);

  return {
    // Data
    messages,
    notifications,
    loadingMessages,
    error,

    // Actions
    sendMessage,
    addScore,
    updateMessage,
    deleteMessage,
    markAsRead,
    markAllAsRead,

    // Queries
    getUnreadEntries,
    getEntryCommunicationSummary,

    // Computed
    unreadCount: notifications.unreadCount || 0,
    unreadByEntry: notifications.unreadByEntry || {},
    messageBreakdown,
    parentMessages: messageBreakdown.parentMessages,
    staffMessages: messageBreakdown.staffMessages,
    lastMessage: messageBreakdown.lastMessage
  };
};

export default useCommunication;