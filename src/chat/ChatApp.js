import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  UserPlus,
  Loader,
  LogOut,
  X,
  Search,
  Users
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import MathModal from './MathModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ChatParticipantSearch from './ChatParticipantSearch';
import ChatListModal from './ChatListModal';
import AddChatParticipantDialog from './AddChatParticipantDialog';
import { useAuth } from '../context/AuthContext';
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  serverTimestamp,
  update,
  onValue,
  off,
  remove,
} from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { sanitizeEmail, compareEmails } from '../utils/sanitizeEmail';
import TypingIndicator from './TypingIndicator';
import ParticipantInfo from './ParticipantInfo'; // Adjust path if needed

// Add this import at the top of ChatApp.jsx
import ChatHistory from './ChatHistory';

// Optionally import DOMPurify if available
let DOMPurify;
try {
  DOMPurify = require('dompurify');
  //console.log('DOMPurify successfully imported.');
} catch (e) {
  console.warn('DOMPurify not available. HTML sanitization will be limited.');
}

// Helper function to fetch participant names
const getParticipantNames = async (participants) => {
  const db = getDatabase();
  const names = {};

  for (const participant of participants) {
    const email = participant.email;
    const sanitizedEmail = sanitizeEmail(email).toLowerCase();
    try {
      // Attempt to fetch student profile
      const studentRef = ref(db, `students/${sanitizedEmail}/profile`);
      const studentSnapshot = await get(studentRef);
      //console.log(
      //  `ChatApp: Fetched student profile for ${sanitizedEmail}:`,
      //  studentSnapshot.exists()
      //);

      if (studentSnapshot.exists()) {
        const profile = studentSnapshot.val();
        names[email] = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
        };
        //console.log(
        //  `ChatApp: Student name set for ${sanitizedEmail}:`,
        //  names[email]
        //);
      } else {
        // If not a student, attempt to fetch staff profile
        const staffRef = ref(db, `staff/${sanitizedEmail}`);
        const staffSnapshot = await get(staffRef);
        //console.log(
        //  `ChatApp: Fetched staff profile for ${sanitizedEmail}:`,
        //  staffSnapshot.exists()
        //);

        if (staffSnapshot.exists()) {
          const profile = staffSnapshot.val();
          names[email] = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          };
          //console.log(
          //  `ChatApp: Staff name set for ${sanitizedEmail}:`,
          //  names[email]
          //);
        } else {
          // Fallback to using the email prefix as the name
          names[email] = {
            firstName: email.split('@')[0],
            lastName: '',
          };
          //console.log(
          //  `ChatApp: Fallback name set for ${email.split('@')[0]}`
          //);
        }
      }
    } catch (error) {
      console.error(`ChatApp: Error fetching participant name for ${email}:`, error);
      names[email] = {
        firstName: email.split('@')[0],
        lastName: '',
      };
    }
  }

  return names;
};

// Helper function to format time since last active
const getTimeSinceActive = (timestamp) => {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
};

// Create a more detailed ActiveUserInfo component
const ActiveUserInfo = ({ email, activeViewers }) => {
  const sanitizedEmail = sanitizeEmail(email);
  const activeData = activeViewers[sanitizedEmail];
  const isActive = useMemo(() => {
    if (!activeData?.timestamp) return false;
    return (Date.now() - activeData.timestamp) < 45000;
  }, [activeData]);

  if (!activeData?.timestamp) return null;

  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`h-2 w-2 rounded-full ${
          isActive ? 'bg-green-400' : 'bg-gray-300'
        }`}
      />
      <span className="text-xs text-gray-600">
        {isActive ? 'Active now' : `Active ${getTimeSinceActive(activeData.timestamp)}`}
      </span>
    </div>
  );
};

// ChatApp Component
const ChatApp = ({
  courseInfo = null,
  courseTitle = '',
  courseTeachers = [],
  courseSupportStaff = [],
  initialParticipants = [],
  mode = 'full', 
  existingChatId = null,
  allowStudentChats = false, // Add default value
}) => {
  // Update the useAuth destructuring
  const { user, isStaffUser } = useAuth();
  
  //console.log('ChatApp access control:', {
  //  allowStudentChats,
  //  isStaffUser,
  //  shouldShowSearch: allowStudentChats || isStaffUser
  //});

  //console.log('ChatApp rendered with props:', {
  //  courseInfo,
  //  courseTitle,
  //  courseTeachers,
  //  courseSupportStaff,
  //  initialParticipants,
  //  mode,
  //  existingChatId,
  //  allowStudentChats,
  //});

  // Memoize default values
  const courseTeachersMemo = useMemo(
    () => courseTeachers || [],
    [courseTeachers]
  );
  const courseSupportStaffMemo = useMemo(
    () => courseSupportStaff || [],
    [courseSupportStaff]
  );
  const initialParticipantsMemo = useMemo(
    () => initialParticipants || [],
    [initialParticipants]
  );

  // State Variables
  const [participants, setParticipants] = useState([]); // Initialized as empty array
  const [participantNames, setParticipantNames] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showMathModal, setShowMathModal] = useState(false);
  const [showChatListModal, setShowChatListModal] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showParticipantInfo, setShowParticipantInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // Updated to false
  const [isNewChat, setIsNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatCreated, setIsChatCreated] = useState(false);
  const [error, setError] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  
  // New state for chat metadata
  const [chatMetadata, setChatMetadata] = useState({
    createdAt: null,
    lastMessageTimestamp: null
  });

  // New state to track active viewers
  const [activeViewers, setActiveViewers] = useState({});

  // Refs
  const messagesEndRef = useRef(null);
  const quillRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const chatInitializedRef = useRef(false);

  const user_email_key = useMemo(() => user ? sanitizeEmail(user.email).toLowerCase() : null, [user]);

  // State to control participant search visibility
  const [showParticipantSearch, setShowParticipantSearch] = useState(true);

  // Window size tracking for responsiveness
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    };

    // Scroll on initial load
    scrollToBottom();

    // Add a small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  // Determine size class based on window dimensions
  const sizeClass = useMemo(() => (windowSize.width < 640 ? 'small' : 'large'), [windowSize]);

  // Load Existing Chat Function
  const loadExistingChat = useCallback(
    async (chatId, chatParticipants) => {
      //console.log("ChatApp: loadExistingChat called with chatId:", chatId);
      setIsLoading(true);
      setError(null);
  
      try {
        const db = getDatabase();
        const chatRef = ref(db, `chats/${chatId}`);
        const chatSnapshot = await get(chatRef);

        if (chatSnapshot.exists()) {
          const chatData = chatSnapshot.val();
          setCurrentChatId(chatId);
          
          // First set the initial participants passed from the notification
          if (chatParticipants && chatParticipants.length > 0) {
            setParticipants(chatParticipants);
          } 
          // Fallback to chat data participants if no participants were passed
          else if (chatData.participants) {
            const participantObjects = chatData.participants.map(email => ({
              email: sanitizeEmail(email).toLowerCase(),
              displayName: email
            }));
            setParticipants(participantObjects);
          }
          
          const messageArray = chatData.messages
            ? Object.entries(chatData.messages).map(([id, message]) => ({
                id,
                ...message,
                timestamp: message.timestamp || Date.now(),
              }))
            : [];
          messageArray.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageArray);
          
          setIsNewChat(false);
          setShowParticipantSearch(false);
          setIsChatCreated(true);
          
          // Set chat metadata
          setChatMetadata({
            createdAt: chatData.createdAt,
            lastMessageTimestamp: chatData.lastMessageTimestamp
          });
          //console.log('ChatApp: Chat metadata set:', {
          //  createdAt: chatData.createdAt,
          //  lastMessageTimestamp: chatData.lastMessageTimestamp
          //});

          // Mark the notification as read and reset unreadCount
          const notificationRef = ref(
            db,
            `notifications/${sanitizeEmail(user.email)}/${chatId}`
          );
          const notificationSnapshot = await get(notificationRef);
          
          if (notificationSnapshot.exists()) {
            await update(notificationRef, {
              read: true,
              unreadCount: 0,
            });
          }
        } else {
          console.error('ChatApp: Chat not found');
          setError('Chat not found');
        }
      } catch (error) {
        console.error('ChatApp: Error loading existing chat:', error);
        setError('Failed to load chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [user] // Removed chatMetadata from dependencies
  );

  // Initialize Chat Function
  const initializeChat = useCallback(
    async (chatParticipants, chatId = null, newChat = false) => {
      //console.log("ChatApp: initializeChat called with:", { chatParticipants, chatId, newChat });
      setIsLoading(true);
      setError(null);
      //console.log('ChatApp: Loading state set to true');

      try {
        setCurrentChatId(chatId);
        //console.log(`ChatApp: Current chat ID set to: ${chatId}`);
        setMessages([]);
        //console.log('ChatApp: Messages cleared');
        setShowSearch(false);
        setShowParticipantInfo(false);
        setIsNewChat(newChat);
        setShowParticipantSearch(false);

        // Sanitize participant emails
        const sanitizedParticipants = chatParticipants.map((participant) => ({
          ...participant,
          email: sanitizeEmail(participant.email).toLowerCase(),
        }));

        let finalParticipants = sanitizedParticipants;

        // Fetch participants from existing chat if chatId is provided
        if (chatId) {
          const db = getDatabase();
          const chatRef = ref(db, `chats/${chatId}`);
          const chatSnapshot = await get(chatRef);
          //console.log(`ChatApp: Fetched chat data for chatId ${chatId}:`, chatSnapshot.exists());

          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            // Use participants from chat data
            finalParticipants = chatData.participants.map((email) => ({
              email: sanitizeEmail(email).toLowerCase(),
              displayName: '', // Will be fetched later
            }));
            //console.log(`ChatApp: Participants from existing chat ${chatId}:`, finalParticipants);
          }
        }

        setParticipants(finalParticipants);
        //console.log('ChatApp: Participants set in initializeChat:', finalParticipants);
        chatInitializedRef.current = true;
        setIsChatCreated(!!chatId); // Set to true if chatId exists
        //console.log(`ChatApp: isChatCreated set to ${!!chatId}`);
      } catch (error) {
        console.error('ChatApp: Error initializing chat:', error);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setIsLoading(false);
        //console.log('ChatApp: Loading state set to false');
      }
    },
    []
  );

  // Initialize chat with initialParticipants using useEffect with dependency
  useEffect(() => {
    if (existingChatId && !chatInitializedRef.current) {
      //console.log('ChatApp: Initializing existing chat with ID:', existingChatId);
      loadExistingChat(existingChatId, initialParticipants);
      chatInitializedRef.current = true;
    } else if (!chatInitializedRef.current && initialParticipants && initialParticipants.length > 0) {
      //console.log('ChatApp: Initializing chat with participants:', initialParticipants);
      initializeChat(initialParticipants, null, true);
      chatInitializedRef.current = true;
    }
  }, [existingChatId, initialParticipants, loadExistingChat, initializeChat]);

  useEffect(() => {
    //console.log('ChatApp: useEffect - Participants changed:', participants);
  }, [participants]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    //console.log('ChatApp: scrollToBottom called');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    //console.log('ChatApp: useEffect - Messages updated, scrolling to bottom.');
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch participant names
  useEffect(() => {
    //console.log('ChatApp: useEffect - Participants changed:', participants);

    if (!participants || participants.length === 0) {
      //console.log('ChatApp: No participants, participantNames cleared.');
      setParticipantNames({});
      return;
    }

    // Fetch participant names
    const fetchParticipantNamesEffect = async () => {
      //console.log('ChatApp: useEffect - Fetching participant names for:', participants);
      try {
        const names = await getParticipantNames(participants);
        setParticipantNames(names);
      } catch (error) {
        console.error('ChatApp: Error fetching participant names:', error);
        setError('Failed to fetch participant names. Please try again.');
      }
    };

    fetchParticipantNamesEffect();
  }, [participants]);

  // Create Notification Function
  const createNotification = useCallback(
    async (participantEmail, chatId, messagePreview) => {
      //console.log(
      //  `ChatApp: createNotification called for ${participantEmail}, chatId: ${chatId}, messagePreview: "${messagePreview}"`
      //);
      const db = getDatabase();
      const notificationRef = ref(
        db,
        `students/${sanitizeEmail(participantEmail).toLowerCase()}/notifications`
      );
      try {
        await push(notificationRef, {
          type: 'new_chat',
          message: `New message from ${user.displayName || user.email}: "${messagePreview}"`,
          chatId: chatId,
          timestamp: serverTimestamp(),
          read: false,
        });
        //console.log(`ChatApp: Notification created for ${participantEmail} in chat ${chatId}`);
      } catch (error) {
        console.error(`ChatApp: Error creating notification for ${participantEmail}:`, error);
      }
    },
    [user.displayName, user.email]
  );

  // Handle Chat Selection
  const handleChatSelect = useCallback(
    ({ isNew, chatId, participants }) => {
      //console.log('ChatApp: handleChatSelect called with:', { isNew, chatId, participants });
      //console.log('isNew:', isNew);
      //console.log('participants:', participants);
  
      setShowChatListModal(false);
      //console.log('ChatApp: ChatListModal closed');
  
      if (isNew) {
        const currentUserEmail = sanitizeEmail(user.email).toLowerCase();
        const allParticipants = [
          ...new Set([
            ...participants.map((p) => sanitizeEmail(p.email).toLowerCase()),
            currentUserEmail,
          ]),
        ].filter((email) => email);
        const participantObjects = allParticipants.map((email) => ({
          email,
          displayName: participants.find((p) => p.email === email)?.displayName || email,
        }));
        //console.log('ChatApp: Initializing new chat with participants:', participantObjects);
        initializeChat(participantObjects, null, true);
      } else {
        loadExistingChat(chatId, participants);
      }
    },
    [user.email, initializeChat, loadExistingChat]
  );
  

  // Toggle Participant Info Visibility
  const toggleParticipantInfo = useCallback(() => {
    setShowParticipantInfo((prev) => {
      //console.log(`ChatApp: toggleParticipantInfo called. Previous state: ${prev}`);
      return !prev;
    });
  }, []);

  // Updated handleSendMessage function
  // Client-side handleSendMessage
  const handleSendMessage = useCallback(async () => {
    //console.log('ChatApp: handleSendMessage called');
    if (!inputMessage.trim() || !participants || participants.length === 0 || !user || !user_email_key) {
      //console.log('ChatApp: Message validation failed:', {
      //  hasMessage: !!inputMessage.trim(),
      //  hasParticipants: participants?.length > 0,
      //  hasUser: !!user,
      //  hasUserEmailKey: !!user_email_key
      //});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all participant emails and sanitize them
      const participantEmails = participants.map(p => sanitizeEmail(p.email));
      if (!participantEmails.includes(user_email_key)) {
        participantEmails.push(user_email_key);
      }

      const functions = getFunctions();
      const sendMessage = httpsCallable(functions, 'sendChatMessageV2');

      // Generate a new chatId if this is a new chat
      const chatIdToUse = currentChatId || push(ref(getDatabase(), 'chats')).key;

      //console.log('ChatApp: Sending message with:', {
      //  chatId: chatIdToUse,
      //  participants: participantEmails,
      //  senderEmailKey: user_email_key,
      //  isNewChat: !currentChatId
      //});

      // Call the cloud function
      const result = await sendMessage({
        chatId: chatIdToUse,
        text: inputMessage,
        participants: participantEmails,
        senderEmailKey: user_email_key,
        senderName: user.displayName || user.email,
        isNewChat: !currentChatId
      });

      if (result.data.success) {
        // Update the currentChatId if this was a new chat
        if (!currentChatId) {
          //console.log('ChatApp: Setting new chat ID:', chatIdToUse);
          setCurrentChatId(chatIdToUse);
        }

        // Clear input
        setInputMessage('');
        if (quillRef.current) {
          quillRef.current.getEditor().setText('');
        }

        // Update chat state
        setIsNewChat(false);
        setIsChatCreated(true);

        // Update metadata
        setChatMetadata(prev => ({
          createdAt: prev.createdAt || result.data.timestamp,
          lastMessageTimestamp: result.data.timestamp
        }));

        //console.log('ChatApp: Message sent successfully', {
        //  messageId: result.data.messageId,
        //  timestamp: result.data.timestamp
        //});
      } else {
        console.error('ChatApp: Message send failed:', result.data);
        setError('Failed to send message: ' + (result.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('ChatApp: Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    participants,
    user,
    user_email_key,
    currentChatId,
    quillRef
  ]);

  // Listen to Chat and Messages Updates
  useEffect(() => {
    if (participants && participants.length > 0 && user && currentChatId) {
      //console.log(`ChatApp: useEffect - Setting up listeners for chatId ${currentChatId}`);
      const db = getDatabase();
      const chatRef = ref(db, `chats/${currentChatId}`);
      const messagesRef = ref(db, `chats/${currentChatId}/messages`);

      const chatUnsubscribe = onValue(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const chatData = snapshot.val();
          //console.log(`ChatApp: Chat data updated for chatId ${currentChatId}:`, chatData);

          // Update chat metadata only if values have changed
          setChatMetadata(prev => {
            const updated = {
              createdAt: chatData.createdAt,
              lastMessageTimestamp: chatData.lastMessageTimestamp
            };
            if (
              prev.createdAt !== updated.createdAt ||
              prev.lastMessageTimestamp !== updated.lastMessageTimestamp
            ) {
              //console.log('ChatApp: Chat metadata changed, updating state');
              return updated;
            }
            return prev;
          });

          if (chatData && chatData.participants) {
            const chatParticipants = chatData.participants.map((email) =>
              sanitizeEmail(email).toLowerCase()
            );

            const isUserInChat = chatParticipants.some((email) =>
              compareEmails(email, user.email)
            );

            if (!isUserInChat) {
              console.error('ChatApp: Current user is not a participant in this chat');
              setError('You are not a participant in this chat.');
              setIsChatCreated(false); // Update chat created status
            } else {
              setIsChatCreated(true); // Chat exists and user is a participant
              //console.log('ChatApp: User is a participant in the chat');
            }
          } else {
            console.error('ChatApp: Chat data is missing or incomplete');
            setError('Chat data is missing or incomplete.');
            setIsChatCreated(false); // Update chat created status
          }
        } else {
          //console.log(`ChatApp: Chat ${currentChatId} does not exist yet`);
          setIsChatCreated(false); // Set this to false when the chat doesn't exist
        }
      });

      const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesList = Object.entries(messagesData)
            .map(([id, message]) => ({
              id,
              ...message,
              timestamp: message.timestamp || Date.now(),
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messagesList);
          //console.log(`ChatApp: Messages updated for chatId ${currentChatId}:`, messagesList.length);
        } else {
          setMessages([]);
          //console.log(`ChatApp: No messages found for chatId ${currentChatId}`);
        }
      });

      return () => {
        off(chatRef, chatUnsubscribe);
        off(messagesRef, messagesUnsubscribe);
        //console.log(`ChatApp: Listeners removed for chatId ${currentChatId}`);
      };
    }
  }, [participants, user, currentChatId]); // Removed chatMetadata from dependencies

  // Listen to Typing Status
  useEffect(() => {
    if (currentChatId && user) {
      //console.log(`ChatApp: useEffect - Setting up typing status listener for chatId ${currentChatId}`);
      const db = getDatabase();
      const typingStatusRef = ref(db, `chats/${currentChatId}/typingStatus`);

      const typingStatusListener = onValue(typingStatusRef, (snapshot) => {
        if (snapshot.exists()) {
          const status = snapshot.val();
          setTypingStatus(status);
          //console.log(`ChatApp: Typing status updated for chatId ${currentChatId}:`, status);
        }
      });

      return () => {
        off(typingStatusRef, typingStatusListener);
        //console.log(`ChatApp: Typing status listener removed for chatId ${currentChatId}`);
      };
    }
  }, [currentChatId, user]);

  // Add a listener for active viewers
  useEffect(() => {
    if (!currentChatId || !user) return;

    const db = getDatabase();
    const activeViewersRef = ref(db, `chats/${currentChatId}/activeViewers`);

    const activeViewersListener = onValue(activeViewersRef, (snapshot) => {
      if (snapshot.exists()) {
        setActiveViewers(snapshot.val());
      } else {
        setActiveViewers({});
      }
    });

    return () => {
      off(activeViewersRef, activeViewersListener);
    };
  }, [currentChatId, user]);

  // Update Typing Status
  const updateTypingStatus = useCallback(
    (isTyping) => {
      //console.log(`ChatApp: updateTypingStatus called with isTyping=${isTyping}`);
      if (currentChatId && user) {
        const db = getDatabase();
        const userTypingStatusRef = ref(
          db,
          `chats/${currentChatId}/typingStatus/${sanitizeEmail(user.email).toLowerCase()}`
        );
        set(userTypingStatusRef, isTyping)
          .then(() => {
            //console.log(`ChatApp: Typing status updated to ${isTyping} for user ${user.email}`);
          })
          .catch((error) => {
            console.error('ChatApp: Error updating typing status:', error);
          });
      }
    },
    [currentChatId, user]
  );

  // Handle Input Change
  const handleInputChange = useCallback(
    (value) => {
      //console.log('ChatApp: handleInputChange called with value:', value);
      setInputMessage(value);
      //console.log('ChatApp: inputMessage state updated');

      clearTimeout(typingTimerRef.current);
      updateTypingStatus(true);

      typingTimerRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 2000);
    },
    [updateTypingStatus]
  );

  // Helper function to format timestamps
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firebase Timestamp objects
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(timestamp.seconds * 1000));
      }
  
      // Handle numeric timestamps
      if (typeof timestamp === 'number') {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(timestamp));
      }
  
      // If it's already a Date object
      if (timestamp instanceof Date) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(timestamp);
      }
  
      console.warn('Invalid timestamp format:', timestamp);
      return 'N/A';
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'N/A';
    }
  }, []);

  // Render Typing Indicator
  const renderTypingIndicator = useMemo(() => {
    const typingUsers = Object.entries(typingStatus)
      .filter(
        ([email, status]) =>
          status && email !== sanitizeEmail(user.email).toLowerCase()
      )
      .map(
        ([email]) =>
          participantNames[email]
            ? `${participantNames[email].firstName} ${participantNames[email].lastName}`
            : email.replace(',', '.')
      );

    //console.log('ChatApp: Rendering typing indicator for users:', typingUsers);
    return <TypingIndicator typingUsers={typingUsers} />;
  }, [typingStatus, user.email, participantNames]);

  // Handle Insert Math
  const handleInsertMath = useCallback((latex) => {
    //console.log('ChatApp: handleInsertMath called with latex:', latex);
    const latexCode = `$$${latex}$$`;
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertText(range.index, latexCode);
      //console.log('ChatApp: Inserted math into editor:', latexCode);
    }
  }, []);

  // Sanitize HTML
  const sanitizeHtml = useMemo(
    () => (html) => {
      if (DOMPurify) {
        //console.log('ChatApp: Sanitizing HTML using DOMPurify');
        return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
      }
      //console.log('ChatApp: Sanitizing HTML using regex fallback');
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    },
    []
  );

  // Render Message Content
  const renderMessageContent = useMemo(
    () => (text) => {
      const cleanHtml = sanitizeHtml(text);
      const parts = cleanHtml.split(/(\$\$.*?\$\$)/g);
      //console.log('ChatApp: Rendering message content:', text);
      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.substring(2, part.length - 2);
          return <BlockMath key={index}>{latex}</BlockMath>;
        } else {
          return (
            <div
              key={index}
              className={`prose prose-sm max-w-none ${sizeClass === 'small' ? 'message-content text-sm' : 'message-content text-base'}`}
              dangerouslySetInnerHTML={{ __html: part }}
            />
          );
        }
      });
    },
    [sanitizeHtml, sizeClass]
  );

  // Render Participant Names
  const renderParticipantNames = useMemo(() => {
    if (!participants || participants.length === 0) {
      //console.log('ChatApp: renderParticipantNames: No participants');
      return '';
    }
    const names = participants
      .filter((participant) => !compareEmails(participant.email, user.email))
      .map((participant) => {
        const name = participantNames[participant.email];
        if (name) {
          return `${name.firstName} ${name.lastName}`.trim();
        }
        return participant.displayName || participant.email.split('@')[0];
      })
      .join(', ');
    //console.log('ChatApp: renderParticipantNames:', names);
    return names;
  }, [participants, user.email, participantNames]);

  // ReactQuill Modules
  const modules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  // Handle Add Participant
  const handleAddParticipant = useCallback(
    async (newParticipant) => {
      //console.log('ChatApp: handleAddParticipant called with:', newParticipant);
      if (currentChatId) {
        setIsLoading(true);
        setError(null);
        //console.log('ChatApp: Loading state set to true while adding participant');
        const db = getDatabase();
        const chatRef = ref(db, `chats/${currentChatId}`);

        try {
          const chatSnapshot = await get(chatRef);
          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            const updatedParticipants = [...chatData.participants, newParticipant.email];

            // Update the chat with the new participant
            await update(chatRef, { participants: updatedParticipants });
            //console.log(`ChatApp: Added ${newParticipant.email} to chat ${currentChatId}`);

            // Add the chat to the new participant's userChats
            const userChatRef = ref(
              db,
              `userChats/${sanitizeEmail(newParticipant.email).toLowerCase()}/${currentChatId}`
            );
            await set(userChatRef, {
              timestamp: serverTimestamp(),
              lastMessage: chatData.lastMessage || '',
              firstMessage: chatData.firstMessage || '',
            });
            //console.log(
            //  `ChatApp: Chat ${currentChatId} added to userChats for ${newParticipant.email}`
            //);

            // Update local state
            setParticipants((prevParticipants) => {
              const updated = [...prevParticipants, newParticipant];
              //console.log(
              //  'ChatApp: Participants updated locally after adding new participant:',
              //  updated
              //);
              return updated;
            });

            // Send a message from the current user about the new participant
            const newParticipantMessage = {
              text: `${newParticipant.firstName} ${newParticipant.lastName} has been added to the chat.`,
              sender: sanitizeEmail(user.email).toLowerCase(),
              timestamp: serverTimestamp(),
            };
            await push(ref(db, `chats/${currentChatId}/messages`), newParticipantMessage);
            //console.log(
            //  `ChatApp: Notification message about new participant added to chat ${currentChatId}`
            //);

            // Update chat metadata
            setChatMetadata(prev => ({
              ...prev,
              lastMessageTimestamp: serverTimestamp()
            }));
            //console.log('ChatApp: Chat metadata updated after adding participant');
          }
        } catch (error) {
          console.error('ChatApp: Error adding participant:', error);
          setError('Failed to add participant. Please try again.');
        } finally {
          setIsLoading(false);
          //console.log('ChatApp: Loading state set to false after adding participant');
          setShowAddParticipantDialog(false);
          //console.log('ChatApp: AddChatParticipantDialog closed');
        }
      }
    },
    [currentChatId, user.email]
  );

  // Handle clearing the chat
  const handleClearChat = useCallback(() => {
    //console.log('ChatApp: handleClearChat called');
    setMessages([]);
    //console.log('ChatApp: Messages cleared');
    setParticipants([]);
    //console.log('ChatApp: Participants cleared');
    setCurrentChatId(null);
    //console.log('ChatApp: Current chat ID set to null');
    setIsNewChat(true);
    //console.log('ChatApp: isNewChat set to true');
    setIsChatCreated(false);
    //console.log('ChatApp: isChatCreated set to false');
    setShowParticipantSearch(true);
    //console.log('ChatApp: Participant search shown');
    setShowParticipantInfo(false);
    //console.log('ChatApp: Participant info hidden');
    setInputMessage('');
    //console.log('ChatApp: Input message cleared');
    if (quillRef.current) {
      quillRef.current.getEditor().setText('');
      //console.log('ChatApp: Quill editor text cleared');
    }
  }, []);

  // Handle removing the user from the chat using Firebase Cloud Function
  const removeUserFromChat = useCallback(async () => {
    //console.log('ChatApp: removeUserFromChat called');
    if (!currentChatId || !user) {
      //console.log('ChatApp: removeUserFromChat aborted due to missing chatId or user');
      return;
    }

    try {
      const functions = getFunctions();
      const removeUserFromChatFunction = httpsCallable(functions, 'removeUserFromChatV2');
      await removeUserFromChatFunction({ chatId: currentChatId });
      //console.log(`ChatApp: removeUserFromChat Cloud Function called for chatId ${currentChatId}`);

      // Clear the current chat and return to participant search
      handleClearChat();
      //console.log('ChatApp: Chat cleared after removing user from chat');
    } catch (error) {
      console.error('ChatApp: Error removing user from chat:', error);
      setError('Failed to leave the chat. Please try again.');
    }
  }, [currentChatId, user, handleClearChat]);

  // Render header based on mode and responsiveness
  const CurrentUserInfo = ({ onError }) => {
    return (
      <div className="text-gray-700">
        <span className="font-medium">Me</span>
      </div>
    );
  };
  
  // Update the renderHeader function
  const renderHeader = useCallback(() => {
    //console.log('ChatApp: renderHeader called');
    const headerPadding = sizeClass === 'small' ? 'p-0' : 'p-0';
    const headerClasses = `border-b border-gray-200 ${headerPadding} ${
      mode === 'popup' ? 'sticky top-0 bg-white z-10' : ''
    }`;
    
    return (
      <div ref={headerRef} className={headerClasses}>
        {participants && participants.length > 0 && (
          <div className="bg-blue-100 p-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleParticipantInfo}
            >
              <div className="flex items-center">
                {mode === 'full' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearChat();
                    }}
                    className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    title="Clear Chat"
                    aria-label="Clear Chat"
                  >
                    <X size={20} />
                  </button>
                )}
                <span className={`font-medium ${sizeClass === 'small' ? 'text-sm' : 'text-base'}`}>
                  Chatting with: {renderParticipantNames}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChatListModal(true);
                    //console.log('ChatApp: ChatListModal opened from header');
                  }}
                  className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                  title="Select Chat"
                  aria-label="Select Chat"
                >
                  <MessageSquare size={20} />
                </button>
                {isChatCreated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddParticipantDialog(true);
                      //console.log('ChatApp: AddChatParticipantDialog opened from header');
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Add Participant"
                    aria-label="Add Participant"
                  >
                    <UserPlus size={20} />
                  </button>
                )}
                {showParticipantInfo ? (
                  <ChevronUp size={20} className="ml-2" aria-hidden="true" />
                ) : (
                  <ChevronDown size={20} className="ml-2" aria-hidden="true" />
                )}
              </div>
            </div>
            {showParticipantInfo && (
              <div className="mt-2 space-y-4">
                {/* Participant List */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 flex items-center">
                    Participants
                    <span className="ml-2 text-sm text-gray-500">
                      ({Object.values(activeViewers).filter(v => 
                        (Date.now() - v.timestamp) < 45000
                      ).length} active)
                    </span>
                  </h3>
                  <div className="pl-2 space-y-2">
                    {/* Current user */}
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg">
                      <div className="flex items-center flex-1">
                        <CurrentUserInfo onError={setError} />
                        <div className="ml-2">
                          <ActiveUserInfo email={user.email} activeViewers={activeViewers} />
                        </div>
                      </div>
                      {mode === 'full' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to leave this chat? You will no longer receive notifications for new messages.')) {
                              removeUserFromChat();
                            }
                          }}
                          className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center text-sm"
                          title="Leave Chat"
                        >
                          <LogOut size={16} className="mr-1" />
                          Leave Chat
                        </button>
                      )}
                    </div>
                    
                    {/* Other participants */}
                    {participants
                      .filter((participant) => !compareEmails(participant.email, user.email))
                      .map((participant) => (
                        <div key={participant.email} className="bg-white p-2 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <ParticipantInfo
                                email={participant.email}
                                chatId={currentChatId}
                                onError={setError}
                              />
                              <div className="ml-6 mt-1">
                                <ActiveUserInfo email={participant.email} activeViewers={activeViewers} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Chat Information */}
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-gray-700">Chat Information</h3>
                  <div className="pl-2 space-y-1">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Created:</span>
                      <span>{formatTimestamp(chatMetadata.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Last Message:</span>
                      <span>{formatTimestamp(chatMetadata.lastMessageTimestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [
    participants,
    showParticipantInfo,
    isChatCreated,
    mode,
    user,
    isStaffUser,
    toggleParticipantInfo,
    sizeClass,
    chatMetadata,
    formatTimestamp,
    currentChatId,
    renderParticipantNames,
    removeUserFromChat,
    activeViewers
  ]);

  // Enhanced render chat interface with responsive classes
  const renderChatInterface = useCallback(() => {
    //console.log('ChatApp: renderChatInterface called');
    const headerPadding = sizeClass === 'small' ? 'p-2' : 'p-4';
    const messagesPadding = sizeClass === 'small' ? 'p-2 space-y-2' : 'p-4 space-y-4';
    const footerPadding = sizeClass === 'small' ? 'p-2' : 'p-4';
    const inputTextSize = sizeClass === 'small' ? 'text-sm' : 'text-base';
    const quillMinHeight = sizeClass === 'small' ? '80px' : '80px';
    const quillFontSize = sizeClass === 'small' ? '14px' : '16px';
    const quillToolbarPadding = sizeClass === 'small' ? '4px' : '8px';

    return (
      <div className={`flex flex-col ${mode === 'popup' ? 'h-full' : 'h-full'}`}>
        {renderHeader()}
        {/* Messages Section - Updated for better visibility */}
        <div 
          className={`flex-1 overflow-y-auto ${messagesPadding}`}
          style={{
            height: 'calc(100% - 100px)', // Adjust based on your header/footer heights
            minHeight: sizeClass === 'small' ? '100px' : '150px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex-1">
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader className="animate-spin" size={24} />
                <span className="ml-2">Loading...</span>
              </div>
            )}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {isNewChat && messages.length === 0 && (
              <div className="text-center text-gray-500 italic">
                <p>
                  You are starting a new chat with {renderParticipantNames} and they
                  will receive a notification.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id || `${message.sender}-${message.timestamp}`}
                className={`flex ${
                  compareEmails(message.sender, user.email)
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    compareEmails(message.sender, user.email)
                      ? 'bg-green-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <p className={`font-semibold mb-1 ${
                    sizeClass === 'small' ? 'text-sm' : 'text-base'
                  }`}>
                    {message.senderName}
                  </p>
                  <div className={`${sizeClass === 'small' ? 'text-sm' : 'text-base'}`}>
                    {renderMessageContent(message.text)}
                  </div>
                </div>
              </div>
            ))}
            {renderTypingIndicator}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Footer Section - Compact on small screens */}
        <div
          ref={footerRef}
          className={`bg-gray-100 border-t border-gray-200 ${footerPadding} ${
            mode === 'popup' ? 'sticky bottom-0' : ''
          }`}
        >
          <ReactQuill
            ref={quillRef}
            value={inputMessage}
            onChange={handleInputChange}
            modules={modules}
            className="bg-white mb-2"
            placeholder="Type your message or question..."
            style={{
              minHeight: quillMinHeight,
              fontSize: quillFontSize,
            }}
          />
          <div className={`flex space-x-2 ${inputTextSize}`}>
            <button
              onClick={() => {
                setShowMathModal(true);
                //console.log('ChatApp: MathModal opened from footer');
              }}
              className="flex-1 bg-teal-500 text-white rounded-md p-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 ease-in-out"
              disabled={isLoading}
            >
              Insert Math
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!participants || participants.length === 0 || isLoading}
              className="flex-1 bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                <>
                  <Send size={24} className="mr-2" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }, [
    mode,
    renderHeader,
    isLoading,
    handleSendMessage,
    handleInputChange,
    modules,
    inputMessage,
    participants,
    error,
    isNewChat,
    messages,
    renderParticipantNames,
    renderMessageContent,
    renderTypingIndicator,
    user.email,
    sizeClass,
  ]);

 
const handleChatHistorySelect = useCallback(
  ({ isNew, chatId, participants }) => {
    //console.log('ChatApp: handleChatHistorySelect called with:', { isNew, chatId, participants });

    if (isNew) {
      // Initialize a new chat
      const currentUserEmail = sanitizeEmail(user.email).toLowerCase();
      const allParticipants = [
        ...new Set([
          ...participants.map((p) => sanitizeEmail(p.email).toLowerCase()),
          currentUserEmail,
        ]),
      ].filter((email) => email);

      const participantObjects = allParticipants.map((email) => ({
        email,
        displayName: participants.find((p) => p.email === email)?.displayName || email,
      }));

      //console.log('ChatApp: Initializing new chat with participants:', participantObjects);
      initializeChat(participantObjects, null, true);
    } else {
      // Load existing chat
      //console.log('ChatApp: Loading existing chat:', chatId);
      loadExistingChat(chatId, participants);
    }
  },
  [user.email, initializeChat, loadExistingChat]
);


  // Update the handleOpenChatList function
  const handleOpenChatList = useCallback((participants) => {
    //console.log('ChatApp: handleOpenChatList called with participants:', participants);
    // Ensure we're setting selectedParticipants correctly
    setSelectedParticipants(Array.isArray(participants) ? participants : [participants]);
    setShowChatListModal(true);
    setShowParticipantSearch(false);
  }, []);

  // Handle Start New Chat
  const handleStartNewChat = useCallback(
    (participants) => {
      //console.log('ChatApp: handleStartNewChat called with participants:', participants);
      initializeChat(participants, null, true);
      setShowParticipantSearch(false);
      //console.log('ChatApp: Participant search hidden after starting new chat');
    },
    [initializeChat]
  );

  // Handle Open Chat List
  const handleOpenChatListCallback = useCallback(
    (participants) => {
      //console.log('ChatApp: handleOpenChatListCallback called with participants:', participants);
      handleOpenChatList(participants);
    },
    [handleOpenChatList]
  );

  // Update the existing useEffect for active viewers
  useEffect(() => {
    if (!currentChatId || !user || !user_email_key) return;
  
    const db = getDatabase();
    const activeViewerRef = ref(db, `chats/${currentChatId}/activeViewers/${user_email_key}`);
    let heartbeatInterval = null;
  
    // Function to update active status
    const updateActiveStatus = async () => {
      try {
        await set(activeViewerRef, {
          timestamp: serverTimestamp(),
          displayName: user.displayName || user.email,
          email: user.email
        });
        //console.log(`ChatApp: Active status updated for ${user.email}`);
      } catch (error) {
        console.error('Error updating active status:', error);
      }
    };
  
    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized - clear interval
        //console.log('ChatApp: Tab hidden, clearing heartbeat');
        clearInterval(heartbeatInterval);
        // Optionally remove active status immediately when tab is hidden
        remove(activeViewerRef).catch(err => 
          console.error('Error removing active viewer status:', err)
        );
      } else {
        // User returned to tab - restart heartbeat
        //console.log('ChatApp: Tab visible, starting heartbeat');
        updateActiveStatus(); // Immediate update
        heartbeatInterval = setInterval(updateActiveStatus, 30000);
      }
    };
  
    // Initial setup
    if (!document.hidden) {
      updateActiveStatus();
      heartbeatInterval = setInterval(updateActiveStatus, 30000);
    }
  
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
  
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeatInterval);
      remove(activeViewerRef).catch(err => 
        console.error('Error removing active viewer status:', err)
      );
      //console.log(`ChatApp: Active status removed for ${user.email}`);
    };
  }, [currentChatId, user, user_email_key]);

  return (
    <div
      className={`flex flex-col bg-white text-gray-800 ${
        mode === 'popup' ? 'h-full overflow-hidden' : 'h-full'
      }`}
      style={{ maxHeight: '100vh' }}
    >
      {mode === 'full' && showParticipantSearch ? (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          {/* New header with toggle button - now conditional on allowStudentChats */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chat Dashboard</h2>
            {/* Only show search toggle if student chats are allowed or user is staff */}
            {(allowStudentChats || isStaffUser) && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {showSearch ? (
                  <>
                    <Users className="h-5 w-5" />
                    <span>Show Chat History</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search Users</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Conditional rendering of search and history components */}
          <div className="grid grid-cols-1 gap-4">
            {showSearch ? (
              // Only render ChatParticipantSearch if student chats are allowed or user is staff
              (allowStudentChats || isStaffUser) ? (
                <ChatParticipantSearch
                  onStartNewChat={handleStartNewChat}
                  onOpenChatList={handleOpenChatListCallback}
                  courseInfo={courseInfo}
                  courseTeachers={courseTeachersMemo}
                  courseSupportStaff={courseSupportStaffMemo}
                  allowStudentChats={allowStudentChats}
                />
              ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-md">
                  <p className="text-yellow-700">
                    Student-to-student chat is currently disabled for this course.
                  </p>
                </div>
              )
            ) : (
              <ChatHistory 
                onChatSelect={handleChatHistorySelect}
                courseId={courseInfo?.courseId || ''}
                courseTitle={courseTitle}
                courseTeachers={courseTeachersMemo}
                courseSupportStaff={courseSupportStaffMemo}
                allowStudentChats={allowStudentChats}
              />
            )}
          </div>

          {initialParticipantsMemo.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {initialParticipantsMemo.map((p) => p.email).join(', ')}
              </p>
            </div>
          )}
        </div>
      ) : (
        renderChatInterface()
      )}

      {/* Math Modal */}
      <MathModal
        isOpen={showMathModal}
        onClose={() => {
          setShowMathModal(false);
          //console.log('ChatApp: MathModal closed');
        }}
        onInsert={handleInsertMath}
        initialLatex=""
      />

      {/* Chat List Modal */}
      {showChatListModal && (
        <ChatListModal
          participants={selectedParticipants.length > 0 ? selectedParticipants : initialParticipants}
          onChatSelect={handleChatSelect}
          onClose={() => {
            setShowChatListModal(false);
            //console.log('ChatApp: ChatListModal closed');
          }}
        />
      )}

      {/* Add Chat Participant Dialog - updated with new props */}
      <AddChatParticipantDialog
        isOpen={showAddParticipantDialog}
        onClose={() => {
          setShowAddParticipantDialog(false);
          //console.log('ChatApp: AddChatParticipantDialog closed');
        }}
        onAddParticipant={handleAddParticipant}
        currentParticipants={participants ? participants.map((p) => p.email) : []}
        courseInfo={courseInfo}
        courseTitle={courseTitle}
        courseTeachers={courseTeachers}
        courseSupportStaff={courseSupportStaff}
        allowStudentChats={allowStudentChats}
      />
    </div>
  );
};

export default ChatApp;
