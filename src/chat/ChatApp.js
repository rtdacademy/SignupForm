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
import ParticipantInfo from './ParticipantInfo';  // Adjust path if needed

// Optionally import DOMPurify if available
let DOMPurify;
try {
  DOMPurify = require('dompurify');
  console.log('DOMPurify successfully imported.');
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
      console.log(
        `ChatApp: Fetched student profile for ${sanitizedEmail}:`,
        studentSnapshot.exists()
      );

      if (studentSnapshot.exists()) {
        const profile = studentSnapshot.val();
        names[email] = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
        };
        console.log(
          `ChatApp: Student name set for ${sanitizedEmail}:`,
          names[email]
        );
      } else {
        // If not a student, attempt to fetch staff profile
        const staffRef = ref(db, `staff/${sanitizedEmail}`);
        const staffSnapshot = await get(staffRef);
        console.log(
          `ChatApp: Fetched staff profile for ${sanitizedEmail}:`,
          staffSnapshot.exists()
        );

        if (staffSnapshot.exists()) {
          const profile = staffSnapshot.val();
          names[email] = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          };
          console.log(
            `ChatApp: Staff name set for ${sanitizedEmail}:`,
            names[email]
          );
        } else {
          // Fallback to using the email prefix as the name
          names[email] = {
            firstName: email.split('@')[0],
            lastName: '',
          };
          console.log(
            `ChatApp: Fallback name set for ${email.split('@')[0]}`
          );
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

// ChatApp Component
const ChatApp = ({
  courseInfo = null,
  courseTeachers = [],
  courseSupportStaff = [],
  initialParticipants = [],
  mode = 'full', 
  existingChatId = null,
}) => {
  console.log('ChatApp rendered with props:', {
    courseInfo,
    courseTeachers,
    courseSupportStaff,
    initialParticipants,
    mode,
  });

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
  const [showSearch, setShowSearch] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatCreated, setIsChatCreated] = useState(false);
  const [error, setError] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const quillRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const chatInitializedRef = useRef(false);

  // Auth Context
  const { user, isStaff: userIsStaff } = useAuth();
  console.log('ChatApp: User context:', { user, userIsStaff });

  // State to control participant search visibility
  const [showParticipantSearch, setShowParticipantSearch] = useState(true);

  // Load Existing Chat Function
  const loadExistingChat = useCallback(
    async (chatId, chatParticipants) => {
      console.log("ChatApp: loadExistingChat called with chatId:", chatId);
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
    [user] 
  );

  // Initialize Chat Function
  const initializeChat = useCallback(
    async (chatParticipants, chatId = null, newChat = false) => {
      console.log("ChatApp: initializeChat called with:", { chatParticipants, chatId, newChat });
      setIsLoading(true);
      setError(null);
      console.log('ChatApp: Loading state set to true');

      try {
        setCurrentChatId(chatId);
        console.log(`ChatApp: Current chat ID set to: ${chatId}`);
        setMessages([]);
        console.log('ChatApp: Messages cleared');
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
          console.log(`ChatApp: Fetched chat data for chatId ${chatId}:`, chatSnapshot.exists());

          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            // Use participants from chat data
            finalParticipants = chatData.participants.map((email) => ({
              email: sanitizeEmail(email).toLowerCase(),
              displayName: '', // Will be fetched later
            }));
            console.log(`ChatApp: Participants from existing chat ${chatId}:`, finalParticipants);
          }
        }

        setParticipants(finalParticipants);
        console.log('ChatApp: Participants set in initializeChat:', finalParticipants);
        chatInitializedRef.current = true;
        setIsChatCreated(!!chatId); // Set to true if chatId exists
        console.log(`ChatApp: isChatCreated set to ${!!chatId}`);
      } catch (error) {
        console.error('ChatApp: Error initializing chat:', error);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setIsLoading(false);
        console.log('ChatApp: Loading state set to false');
      }
    },
    []
  );

  // Initialize chat with initialParticipants using useEffect with dependency
  useEffect(() => {
    if (existingChatId && !chatInitializedRef.current) {
      console.log('ChatApp: Initializing existing chat with ID:', existingChatId);
      loadExistingChat(existingChatId, initialParticipants);
      chatInitializedRef.current = true;
    } else if (!chatInitializedRef.current && initialParticipants && initialParticipants.length > 0) {
      console.log('ChatApp: Initializing chat with participants:', initialParticipants);
      initializeChat(initialParticipants, null, true);
      chatInitializedRef.current = true;
    }
  }, [existingChatId, initialParticipants, loadExistingChat, initializeChat]);

  useEffect(() => {
    console.log('ChatApp: useEffect - Participants changed:', participants);
  }, [participants]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    console.log('ChatApp: scrollToBottom called');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    console.log('ChatApp: useEffect - Messages updated, scrolling to bottom.');
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch participant names
  useEffect(() => {
    console.log('ChatApp: useEffect - Participants changed:', participants);

    if (!participants || participants.length === 0) {
      console.log('ChatApp: No participants, participantNames cleared.');
      setParticipantNames({});
      return;
    }

    // Fetch participant names
    const fetchParticipantNamesEffect = async () => {
      console.log('ChatApp: useEffect - Fetching participant names for:', participants);
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
      console.log(
        `ChatApp: createNotification called for ${participantEmail}, chatId: ${chatId}, messagePreview: "${messagePreview}"`
      );
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
        console.log(`ChatApp: Notification created for ${participantEmail} in chat ${chatId}`);
      } catch (error) {
        console.error(`ChatApp: Error creating notification for ${participantEmail}:`, error);
      }
    },
    [user.displayName, user.email]
  );

  // Handle Chat Selection
  const handleChatSelect = useCallback(
    ({ isNew, chatId, participants: selectedParticipants }) => {
      console.log('ChatApp: handleChatSelect called with:', { isNew, chatId, selectedParticipants });
      setShowChatListModal(false);
      console.log('ChatApp: ChatListModal closed');

      if (isNew) {
        const currentUserEmail = sanitizeEmail(user.email).toLowerCase();
        const allParticipants = [
          ...new Set([
            ...selectedParticipants.map((p) => sanitizeEmail(p.email).toLowerCase()),
            currentUserEmail,
          ]),
        ].filter((email) => email);
        const participantObjects = allParticipants.map((email) => ({
          email,
          displayName: selectedParticipants.find((p) => p.email === email)?.displayName || email,
        }));
        console.log('ChatApp: Initializing new chat with participants:', participantObjects);
        initializeChat(participantObjects, null, true);
      } else {
        loadExistingChat(chatId, selectedParticipants);
      }
    },
    [user.email, initializeChat, loadExistingChat]
  );

  // Toggle Participant Info Visibility
  const toggleParticipantInfo = useCallback(() => {
    setShowParticipantInfo((prev) => {
      console.log(`ChatApp: toggleParticipantInfo called. Previous state: ${prev}`);
      return !prev;
    });
  }, []);

  // Handle Send Message Function
  const handleSendMessage = useCallback(async () => {
    console.log('ChatApp: handleSendMessage called');
    if (inputMessage.trim() !== '' && participants && participants.length > 0 && user) {
      setIsLoading(true);
      setError(null);
      console.log('ChatApp: Sending message. Loading state set to true');
      const db = getDatabase();
      let chatId = currentChatId;
      let chatRef;
  
      const currentUserEmail = sanitizeEmail(user.email).toLowerCase();
  
      const newMessage = {
        text: inputMessage,
        sender: currentUserEmail,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
      };
      console.log('ChatApp: New message object created:', newMessage);
  
      try {
        if (!chatId) {
          chatRef = push(ref(db, 'chats'));
          chatId = chatRef.key;
          console.log('ChatApp: New chat created with ID:', chatId);
  
          let allParticipants = participants.map((p) => p.email);
          if (!allParticipants.includes(currentUserEmail)) {
            allParticipants.push(currentUserEmail);
          }
          console.log('ChatApp: All participants for new chat:', allParticipants);
  
          const newChatData = {
            participants: allParticipants,
            createdAt: serverTimestamp(),
            lastMessage: inputMessage,
            lastMessageTimestamp: serverTimestamp(),
            firstMessage: inputMessage,
          };
  
          await set(chatRef, newChatData);
          console.log('ChatApp: New chat data set in database:', newChatData);
  
          // Add chat to all participants' profiles in userChats
          for (const participantEmail of allParticipants) {
            const userChatRef = ref(db, `userChats/${participantEmail}/${chatId}`);
            await set(userChatRef, {
              timestamp: serverTimestamp(),
              lastMessage: inputMessage,
              firstMessage: inputMessage,
            });
            console.log(`ChatApp: Chat ${chatId} added to userChats for ${participantEmail}`);
          }
  
          setCurrentChatId(chatId);
          setIsChatCreated(true);
          console.log(`ChatApp: Current chat ID updated to ${chatId} and isChatCreated set to true`);
        } else {
          // Update userChats for all participants with the new last message
          for (const participantEmail of participants.map((p) => p.email)) {
            const userChatRef = ref(db, `userChats/${participantEmail}/${chatId}`);
            await update(userChatRef, {
              timestamp: serverTimestamp(),
              lastMessage: inputMessage,
            });
            console.log(`ChatApp: Updated userChats for ${participantEmail} with new message`);
          }
        }
  
        // Send message
        await push(ref(db, `chats/${chatId}/messages`), newMessage);
        console.log(`ChatApp: Message pushed to chat ${chatId}`);
  
        // Check and update mustRespond in current user's notification
        const notificationRef = ref(db, `notifications/${currentUserEmail}/${chatId}`);
        const notificationSnapshot = await get(notificationRef);
        
        if (notificationSnapshot.exists()) {
          const notificationData = notificationSnapshot.val();
          if (notificationData.mustRespond !== undefined) {
            await update(notificationRef, {
              mustRespond: false,
              lastResponseTime: serverTimestamp()
            });
            console.log(`ChatApp: Updated mustRespond to false for notification ${chatId}`);
          }
        }
  
        setInputMessage('');
        console.log('ChatApp: Input message cleared');
        if (quillRef.current) {
          quillRef.current.getEditor().setText('');
          console.log('ChatApp: Quill editor text cleared');
        }
        setIsNewChat(false);
        setIsChatCreated(true);
        console.log('ChatApp: isNewChat set to false and isChatCreated set to true');
      } catch (error) {
        console.error('ChatApp: Error handling message:', error);
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
        console.log('ChatApp: Loading state set to false');
      }
    } else {
      console.log('ChatApp: handleSendMessage called but conditions not met');
    }
  }, [inputMessage, participants, user, currentChatId]);

  // Listen to Chat and Messages Updates
  useEffect(() => {
    if (participants && participants.length > 0 && user && currentChatId) {
      console.log(`ChatApp: useEffect - Setting up listeners for chatId ${currentChatId}`);
      const db = getDatabase();
      const chatRef = ref(db, `chats/${currentChatId}`);
      const messagesRef = ref(db, `chats/${currentChatId}/messages`);

      const chatUnsubscribe = onValue(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const chatData = snapshot.val();
          console.log(`ChatApp: Chat data updated for chatId ${currentChatId}:`, chatData);

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
              console.log('ChatApp: User is a participant in the chat');
            }
          } else {
            console.error('ChatApp: Chat data is missing or incomplete');
            setError('Chat data is missing or incomplete.');
            setIsChatCreated(false); // Update chat created status
          }
        } else {
          console.log(`ChatApp: Chat ${currentChatId} does not exist yet`);
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
          console.log(`ChatApp: Messages updated for chatId ${currentChatId}:`, messagesList.length);
        } else {
          setMessages([]);
          console.log(`ChatApp: No messages found for chatId ${currentChatId}`);
        }
      });

      return () => {
        off(chatRef, chatUnsubscribe);
        off(messagesRef, messagesUnsubscribe);
        console.log(`ChatApp: Listeners removed for chatId ${currentChatId}`);
      };
    }
  }, [participants, user, currentChatId]);

  // Listen to Typing Status
  useEffect(() => {
    if (currentChatId && user) {
      console.log(`ChatApp: useEffect - Setting up typing status listener for chatId ${currentChatId}`);
      const db = getDatabase();
      const typingStatusRef = ref(db, `chats/${currentChatId}/typingStatus`);

      const typingStatusListener = onValue(typingStatusRef, (snapshot) => {
        if (snapshot.exists()) {
          const status = snapshot.val();
          setTypingStatus(status);
          console.log(`ChatApp: Typing status updated for chatId ${currentChatId}:`, status);
        }
      });

      return () => {
        off(typingStatusRef, typingStatusListener);
        console.log(`ChatApp: Typing status listener removed for chatId ${currentChatId}`);
      };
    }
  }, [currentChatId, user]);

  // Update Typing Status
  const updateTypingStatus = useCallback(
    (isTyping) => {
      console.log(`ChatApp: updateTypingStatus called with isTyping=${isTyping}`);
      if (currentChatId && user) {
        const db = getDatabase();
        const userTypingStatusRef = ref(
          db,
          `chats/${currentChatId}/typingStatus/${sanitizeEmail(user.email).toLowerCase()}`
        );
        set(userTypingStatusRef, isTyping)
          .then(() => {
            console.log(`ChatApp: Typing status updated to ${isTyping} for user ${user.email}`);
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
      console.log('ChatApp: handleInputChange called with value:', value);
      setInputMessage(value);
      console.log('ChatApp: inputMessage state updated');

      clearTimeout(typingTimerRef.current);
      updateTypingStatus(true);

      typingTimerRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 2000);
    },
    [updateTypingStatus]
  );

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

    console.log('ChatApp: Rendering typing indicator for users:', typingUsers);
    return <TypingIndicator typingUsers={typingUsers} />;
  }, [typingStatus, user.email, participantNames]);

  // Handle Insert Math
  const handleInsertMath = useCallback((latex) => {
    console.log('ChatApp: handleInsertMath called with latex:', latex);
    const latexCode = `$$${latex}$$`;
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertText(range.index, latexCode);
      console.log('ChatApp: Inserted math into editor:', latexCode);
    }
  }, []);

  // Sanitize HTML
  const sanitizeHtml = useMemo(
    () => (html) => {
      if (DOMPurify) {
        console.log('ChatApp: Sanitizing HTML using DOMPurify');
        return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
      }
      console.log('ChatApp: Sanitizing HTML using regex fallback');
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    },
    []
  );

  // Render Message Content
  const renderMessageContent = useMemo(
    () => (text) => {
      const cleanHtml = sanitizeHtml(text);
      const parts = cleanHtml.split(/(\$\$.*?\$\$)/g);
      console.log('ChatApp: Rendering message content:', text);
      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.substring(2, part.length - 2);
          return <BlockMath key={index}>{latex}</BlockMath>;
        } else {
          return (
            <div
              key={index}
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: part }}
            />
          );
        }
      });
    },
    [sanitizeHtml]
  );

  // Render Participant Names
  const renderParticipantNames = useMemo(() => {
    if (!participants || participants.length === 0) {
      console.log('ChatApp: renderParticipantNames: No participants');
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
    console.log('ChatApp: renderParticipantNames:', names);
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
      console.log('ChatApp: handleAddParticipant called with:', newParticipant);
      if (currentChatId) {
        setIsLoading(true);
        setError(null);
        console.log('ChatApp: Loading state set to true while adding participant');
        const db = getDatabase();
        const chatRef = ref(db, `chats/${currentChatId}`);

        try {
          const chatSnapshot = await get(chatRef);
          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            const updatedParticipants = [...chatData.participants, newParticipant.email];

            // Update the chat with the new participant
            await update(chatRef, { participants: updatedParticipants });
            console.log(`ChatApp: Added ${newParticipant.email} to chat ${currentChatId}`);

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
            console.log(
              `ChatApp: Chat ${currentChatId} added to userChats for ${newParticipant.email}`
            );

            // Update local state
            setParticipants((prevParticipants) => {
              const updated = [...prevParticipants, newParticipant];
              console.log(
                'ChatApp: Participants updated locally after adding new participant:',
                updated
              );
              return updated;
            });

            // Send a message from the current user about the new participant
            const newParticipantMessage = {
              text: `${newParticipant.firstName} ${newParticipant.lastName} has been added to the chat.`,
              sender: sanitizeEmail(user.email).toLowerCase(),
              timestamp: serverTimestamp(),
            };
            await push(ref(db, `chats/${currentChatId}/messages`), newParticipantMessage);
            console.log(
              `ChatApp: Notification message about new participant added to chat ${currentChatId}`
            );
          }
        } catch (error) {
          console.error('ChatApp: Error adding participant:', error);
          setError('Failed to add participant. Please try again.');
        } finally {
          setIsLoading(false);
          console.log('ChatApp: Loading state set to false after adding participant');
          setShowAddParticipantDialog(false);
          console.log('ChatApp: AddChatParticipantDialog closed');
        }
      }
    },
    [currentChatId, user.email]
  );

  // Handle clearing the chat
  const handleClearChat = useCallback(() => {
    console.log('ChatApp: handleClearChat called');
    setMessages([]);
    console.log('ChatApp: Messages cleared');
    setParticipants([]);
    console.log('ChatApp: Participants cleared');
    setCurrentChatId(null);
    console.log('ChatApp: Current chat ID set to null');
    setIsNewChat(true);
    console.log('ChatApp: isNewChat set to true');
    setIsChatCreated(false);
    console.log('ChatApp: isChatCreated set to false');
    setShowParticipantSearch(true);
    console.log('ChatApp: Participant search shown');
    setShowParticipantInfo(false);
    console.log('ChatApp: Participant info hidden');
    setInputMessage('');
    console.log('ChatApp: Input message cleared');
    if (quillRef.current) {
      quillRef.current.getEditor().setText('');
      console.log('ChatApp: Quill editor text cleared');
    }
  }, []);

  // Handle removing the user from the chat using Firebase Cloud Function
  const removeUserFromChat = useCallback(async () => {
    console.log('ChatApp: removeUserFromChat called');
    if (!currentChatId || !user) {
      console.log('ChatApp: removeUserFromChat aborted due to missing chatId or user');
      return;
    }

    try {
      const functions = getFunctions();
      const removeUserFromChatFunction = httpsCallable(functions, 'removeUserFromChat');
      await removeUserFromChatFunction({ chatId: currentChatId });
      console.log(`ChatApp: removeUserFromChat Cloud Function called for chatId ${currentChatId}`);

      // Clear the current chat and return to participant search
      handleClearChat();
      console.log('ChatApp: Chat cleared after removing user from chat');
    } catch (error) {
      console.error('ChatApp: Error removing user from chat:', error);
      setError('Failed to leave the chat. Please try again.');
    }
  }, [currentChatId, user, handleClearChat]);

  // Render header based on mode
  const renderHeader = useCallback(() => {
    console.log('ChatApp: renderHeader called');
    const headerClasses = `border-b border-gray-200 ${
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
                <span className="font-medium">
                  Chatting with: {renderParticipantNames}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChatListModal(true);
                    console.log('ChatApp: ChatListModal opened from header');
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
                      console.log('ChatApp: AddChatParticipantDialog opened from header');
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Add Participant"
                    aria-label="Add Participant"
                  >
                    <UserPlus size={20} />
                  </button>
                )}
                {mode === 'full' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUserFromChat();
                      console.log('ChatApp: removeUserFromChat triggered from header');
                    }}
                    className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                    title="Leave Chat"
                    aria-label="Leave Chat"
                  >
                    <LogOut size={20} />
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
  <div className="mt-2 text-sm">
    {participants
      .filter((participant) => !compareEmails(participant.email, user.email))
      .map((participant) => (
        <ParticipantInfo
          key={participant.email}
          email={participant.email}
          isStaff={userIsStaff}
          chatId={currentChatId}  // Add this prop
          onError={setError}      // Add this prop
        />
      ))}
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
    user.email,
    userIsStaff,
    handleClearChat,
    removeUserFromChat,
    renderParticipantNames,
    toggleParticipantInfo,
  ]);

  // Render chat interface based on mode
  const renderChatInterface = useCallback(() => {
    console.log('ChatApp: renderChatInterface called');
    return (
      <div className={`flex flex-col ${mode === 'popup' ? 'h-full' : 'h-full'}`}>
        {renderHeader()}
        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
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
                <p className="font-semibold mb-1">{message.senderName}</p>
                <div className="text-sm">{renderMessageContent(message.text)}</div>
              </div>
            </div>
          ))}
          {renderTypingIndicator}
          <div ref={messagesEndRef} />
        </div>
        {/* Footer Section */}
        <div
          ref={footerRef}
          className={`p-4 bg-gray-100 border-t border-gray-200 ${
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
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowMathModal(true);
                console.log('ChatApp: MathModal opened from footer');
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
  ]);

  // Handle Start New Chat
  const handleStartNewChat = useCallback(
    (participants) => {
      console.log('ChatApp: handleStartNewChat called with participants:', participants);
      initializeChat(participants, null, true);
      setShowParticipantSearch(false);
      console.log('ChatApp: Participant search hidden after starting new chat');
    },
    [initializeChat]
  );

  // Handle Open Chat List
  const handleOpenChatList = useCallback(
    (participants) => {
      console.log('ChatApp: handleOpenChatList called with participants:', participants);
      setSelectedParticipants(participants);
      setShowChatListModal(true);
      setShowParticipantSearch(false);
      console.log('ChatApp: ChatListModal opened and participant search hidden');
    },
    []
  );

  return (
    <div
      className={`flex flex-col ${
        mode === 'popup' ? 'h-full overflow-hidden' : 'h-full'
      } bg-white text-gray-800`}
    >
      {mode === 'full' && showParticipantSearch ? (
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <ChatParticipantSearch
            onStartNewChat={handleStartNewChat}
            onOpenChatList={handleOpenChatList}
            courseInfo={courseInfo}
            courseTeachers={courseTeachersMemo}
            courseSupportStaff={courseSupportStaffMemo}
          />
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {initialParticipantsMemo.map((p) => p.email).join(', ')}
            </p>
          </div>
        </div>
      ) : (
        renderChatInterface()
      )}

      {/* Math Modal */}
      <MathModal
        isOpen={showMathModal}
        onClose={() => {
          setShowMathModal(false);
          console.log('ChatApp: MathModal closed');
        }}
        onInsert={handleInsertMath}
        initialLatex=""
      />

      {/* Chat List Modal */}
      {showChatListModal && (
        <ChatListModal
          participants={selectedParticipants}
          onChatSelect={handleChatSelect}
          onClose={() => {
            setShowChatListModal(false);
            console.log('ChatApp: ChatListModal closed');
          }}
        />
      )}

      {/* Add Chat Participant Dialog */}
      <AddChatParticipantDialog
        isOpen={showAddParticipantDialog}
        onClose={() => {
          setShowAddParticipantDialog(false);
          console.log('ChatApp: AddChatParticipantDialog closed');
        }}
        onAddParticipant={handleAddParticipant}
        currentParticipants={participants ? participants.map((p) => p.email) : []}
        courseInfo={courseInfo}
      />
    </div>
  );
};

export default ChatApp;
