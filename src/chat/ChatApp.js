import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  UserPlus,
  Loader,
  LogOut,    // Imported the LogOut icon for Leave Chat button
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
  remove, // Imported remove for removing user from chat
} from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions'; // Imported Firebase Functions
import { sanitizeEmail, compareEmails } from '../utils/sanitizeEmail';
import TypingIndicator from './TypingIndicator';

// Optionally import DOMPurify if available
let DOMPurify;
try {
  DOMPurify = require('dompurify');
} catch (e) {
  console.warn('DOMPurify not available. HTML sanitization will be limited.');
}

// ParticipantInfo Component
const ParticipantInfo = React.memo(({ email, isStaff }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      const db = getDatabase();
      const sanitizedEmail = sanitizeEmail(email).toLowerCase();

      try {
        // Attempt to fetch student profile
        const studentRef = ref(db, `students/${sanitizedEmail}/profile`);
        const studentSnapshot = await get(studentRef);

        if (studentSnapshot.exists()) {
          const profile = studentSnapshot.val();
          setDetails({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          });
        } else {
          // If not a student, attempt to fetch staff profile
          const staffRef = ref(db, `staff/${sanitizedEmail}`);
          const staffSnapshot = await get(staffRef);

          if (staffSnapshot.exists()) {
            const profile = staffSnapshot.val();
            setDetails({
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
            });
          } else {
            // Fallback to using the email prefix as the name
            setDetails({
              firstName: email.split('@')[0],
              lastName: '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading participant details:', error);
        setDetails({
          firstName: email.split('@')[0],
          lastName: '',
        });
      }
    };

    loadDetails();
  }, [email]);

  if (!details) return <p>Loading...</p>;

  return (
    <div className="mb-2">
      <p>
        <strong>Name:</strong> {details.firstName} {details.lastName}
      </p>
      {/* Removed email display as per the requirement */}
    </div>
  );
});

// ChatApp Component
const ChatApp = React.memo(({
  courseInfo = null,
  courseTeachers = [],
  courseSupportStaff = [],
  initialParticipants = []
}) => {
  console.log("ChatApp rendering", { courseInfo, courseTeachers, courseSupportStaff, initialParticipants });
  
  // Memoize default values
  const courseTeachersMemo = useMemo(() => courseTeachers || [], [courseTeachers]);
  const courseSupportStaffMemo = useMemo(() => courseSupportStaff || [], [courseSupportStaff]);
  const initialParticipantsMemo = useMemo(() => initialParticipants || [], [initialParticipants]);

  // State Variables
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showMathModal, setShowMathModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showChatListModal, setShowChatListModal] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showParticipantInfo, setShowParticipantInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participantNames, setParticipantNames] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [isChatCreated, setIsChatCreated] = useState(false); // Added state variable

  // Refs
  const messagesEndRef = useRef(null);
  const quillRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const chatInitializedRef = useRef(false);
  const initialParticipantsRef = useRef(initialParticipants);

  // Auth Context
  const { user, isStaff: userIsStaff } = useAuth();

  // State to control participant search visibility
  const [showParticipantSearch, setShowParticipantSearch] = useState(true); // Added state variable

  // Initialize participants from initialParticipants prop
  useEffect(() => {
    console.log("ChatApp: Effect running, initialParticipants:", initialParticipantsRef.current);
    if (initialParticipantsRef.current.length > 0 && !chatInitializedRef.current) {
      const sanitizedParticipants = initialParticipantsRef.current.map((p) => ({
        email: sanitizeEmail(p.email).toLowerCase(),
        displayName: p.displayName || '',
      }));
      setParticipants(sanitizedParticipants);
      setShowParticipantSearch(false);
      chatInitializedRef.current = true;
      setIsChatCreated(true); // Assuming initial chat is created
      console.log("ChatApp: Participants set", sanitizedParticipants);
    } else if (!chatInitializedRef.current) {
      setShowParticipantSearch(true);
      console.log("ChatApp: Showing participant search");
    }
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages]);

  // Fetch participant names
  useEffect(() => {
    const fetchParticipantNames = async () => {
      const db = getDatabase();
      const names = {};

      for (const participant of participants) {
        const email = participant.email;
        const sanitizedEmail = sanitizeEmail(email).toLowerCase();
        try {
          // Attempt to fetch student profile
          const studentRef = ref(db, `students/${sanitizedEmail}/profile`);
          const studentSnapshot = await get(studentRef);

          if (studentSnapshot.exists()) {
            const profile = studentSnapshot.val();
            names[email] = {
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
            };
          } else {
            // If not a student, attempt to fetch staff profile
            const staffRef = ref(db, `staff/${sanitizedEmail}`);
            const staffSnapshot = await get(staffRef);

            if (staffSnapshot.exists()) {
              const profile = staffSnapshot.val();
              names[email] = {
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
              };
            } else {
              // Fallback to using the email prefix as the name
              names[email] = {
                firstName: email.split('@')[0],
                lastName: '',
              };
            }
          }
        } catch (error) {
          console.error('Error fetching participant name:', error);
          names[email] = {
            firstName: email.split('@')[0],
            lastName: '',
          };
        }
      }

      setParticipantNames(names);
    };

    if (participants.length > 0) {
      fetchParticipantNames();
    } else {
      setParticipantNames({});
    }
  }, [participants]);

  // Initialize Chat Function
  const initializeChat = useCallback(
    async (chatParticipants, chatId, newChat = false) => {
      console.log("ChatApp: Initializing chat", { chatParticipants, chatId, newChat });
      setIsLoading(true);
      setError(null);
      try {
        setCurrentChatId(chatId);
        setMessages([]);
        setShowSearch(false);
        setShowParticipantInfo(false);
        setIsNewChat(newChat);
        setShowParticipantSearch(false);

        let participantEmails = chatParticipants;
        if (chatId) {
          const db = getDatabase();
          const chatRef = ref(db, `chats/${chatId}`);
          const chatSnapshot = await get(chatRef);

          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            // Assume chatData.participants is array of emails
            participantEmails = chatData.participants.map(email => ({
              email: sanitizeEmail(email).toLowerCase(),
              displayName: '', // Will be fetched later
            }));
          }
        }
        setParticipants(participantEmails);
        chatInitializedRef.current = true;
        setIsChatCreated(!!chatId); // Set to true if chatId exists
        console.log("ChatApp: Chat initialized with participants", participantEmails);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load Existing Chat Function
  const loadExistingChat = useCallback(async (chatId, chatParticipants) => {
    console.log("Loading existing chat:", chatId);
    setIsLoading(true);
    setError(null);
    try {
      const db = getDatabase();
      const chatRef = ref(db, `chats/${chatId}`);
      const chatSnapshot = await get(chatRef);

      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.val();
        setCurrentChatId(chatId);
        setParticipants(chatData.participants.map(email => ({
          email: sanitizeEmail(email).toLowerCase(),
          displayName: chatParticipants.find(p => p.email === email)?.displayName || email,
        })));
        const messageArray = chatData.messages ? Object.entries(chatData.messages).map(([id, message]) => ({
          id,
          ...message,
          timestamp: message.timestamp || Date.now(),
        })) : [];
        messageArray.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageArray);
        setIsNewChat(false);
        setShowParticipantSearch(false);
        chatInitializedRef.current = true;
        setIsChatCreated(true); // Set to true when existing chat is loaded
        console.log("ChatApp: Existing chat loaded", { participants: chatData.participants, messageCount: messageArray.length });
      } else {
        setError('Chat not found');
      }
    } catch (error) {
      console.error('Error loading existing chat:', error);
      setError('Failed to load chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create Notification Function
  const createNotification = useCallback(async (
    participantEmail,
    chatId,
    messagePreview
  ) => {
    const db = getDatabase();
    const notificationRef = ref(
      db,
      `students/${sanitizeEmail(participantEmail).toLowerCase()}/notifications`
    );
    await push(notificationRef, {
      type: 'new_chat',
      message: `New message from ${user.displayName || user.email}: "${messagePreview}"`,
      chatId: chatId,
      timestamp: serverTimestamp(),
      read: false,
    });
  }, [user.displayName, user.email]);

  // Handle Chat Selection
  const handleChatSelect = useCallback(({ isNew, chatId, participants: selectedParticipants }) => {
    console.log("ChatApp: Chat selected", { isNew, chatId, selectedParticipants });
    setShowChatListModal(false);
    if (isNew) {
      const currentUserEmail = sanitizeEmail(user.email).toLowerCase();
      const allParticipants = [
        ...new Set([...selectedParticipants.map(p => sanitizeEmail(p.email).toLowerCase()), currentUserEmail])
      ].filter(email => email);
      const participantObjects = allParticipants.map(email => ({
        email,
        displayName: selectedParticipants.find(p => p.email === email)?.displayName || email,
      }));
      console.log("ChatApp: Initializing new chat with participants", participantObjects);
      initializeChat(participantObjects, null, true);
    } else {
      loadExistingChat(chatId, selectedParticipants);
    }
  }, [user.email, initializeChat, loadExistingChat]);

  // Handle Participants Selection
  const handleParticipantsSelect = useCallback((selectedParticipants) => {
    console.log("ChatApp: Participants selected", selectedParticipants);
    const participantObjects = selectedParticipants.map(p => ({
      email: p.email,
      displayName: p.displayName || '',
    }));
    setParticipants(participantObjects);
    setShowChatListModal(true);
    setShowParticipantInfo(false);
    setShowParticipantSearch(false);
    setIsNewChat(true);
    console.log("ChatApp: Participants set", participantObjects);
  }, []);

  // Toggle Participant Info Visibility
  const toggleParticipantInfo = useCallback(() => {
    setShowParticipantInfo(prev => !prev);
  }, []);

  // Handle Send Message Function
  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() !== '' && participants.length > 0 && user) {
      setIsLoading(true);
      setError(null);
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

      try {
        if (!chatId) {
          chatRef = push(ref(db, 'chats'));
          chatId = chatRef.key;

          let allParticipants = participants.map(p => p.email);
          if (!allParticipants.includes(currentUserEmail)) {
            allParticipants.push(currentUserEmail);
          }

          const newChatData = {
            participants: allParticipants,
            createdAt: serverTimestamp(),
            lastMessage: inputMessage,
            lastMessageTimestamp: serverTimestamp(),
            firstMessage: inputMessage,
          };

          await set(chatRef, newChatData);
          console.log('New chat created with ID:', chatId, 'Participants:', allParticipants);

          // Add chat to all participants' profiles in userChats
          for (const participantEmail of allParticipants) {
            const userChatRef = ref(db, `userChats/${participantEmail}/${chatId}`);
            await set(userChatRef, {
              timestamp: serverTimestamp(),
              lastMessage: inputMessage,
              firstMessage: inputMessage,
            });

            if (participantEmail !== currentUserEmail) {
              await createNotification(
                participantEmail,
                chatId,
                inputMessage.substring(0, 50)
              );
            }
          }

          setCurrentChatId(chatId);
          setIsChatCreated(true); // Set this to true when a new chat is created
        } else {
          // Update userChats for all participants with the new last message
          for (const participantEmail of participants.map(p => p.email)) {
            const userChatRef = ref(db, `userChats/${participantEmail}/${chatId}`);
            await update(userChatRef, {
              timestamp: serverTimestamp(),
              lastMessage: inputMessage,
            });
          }
        }

        // Send message
        await push(ref(db, `chats/${chatId}/messages`), newMessage);

        // Update chat last message
        await update(ref(db, `chats/${chatId}`), {
          lastMessage: inputMessage,
          lastMessageTimestamp: serverTimestamp(),
        });

        setInputMessage('');
        quillRef.current.getEditor().setText('');
        setIsNewChat(false);
        setIsChatCreated(true); // Ensure this is set to true after sending any message
      } catch (error) {
        console.error('Error handling message:', error);
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [inputMessage, participants, user, currentChatId, createNotification]);

  // Listen to Chat and Messages Updates
  useEffect(() => {
    if (participants.length > 0 && user && currentChatId) {
      const db = getDatabase();
      const chatRef = ref(db, `chats/${currentChatId}`);
      const messagesRef = ref(db, `chats/${currentChatId}/messages`);

      const chatUnsubscribe = onValue(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const chatData = snapshot.val();
          if (chatData && chatData.participants) {
            const chatParticipants = chatData.participants.map(email =>
              sanitizeEmail(email).toLowerCase()
            );

            const isUserInChat = chatParticipants.some((email) =>
              compareEmails(email, user.email)
            );

            if (!isUserInChat) {
              console.error('Current user is not a participant in this chat');
              setError('You are not a participant in this chat.');
              setIsChatCreated(false); // Update chat created status
              return;
            } else {
              setIsChatCreated(true); // Chat exists and user is a participant
            }
          } else {
            console.error('Chat data is missing or incomplete');
            setError('Chat data is missing or incomplete.');
            setIsChatCreated(false); // Update chat created status
            return;
          }
        } else {
          console.log('Chat does not exist yet');
          setIsChatCreated(false); // Set this to false when the chat doesn't exist
        }
      });

      const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesList = Object.entries(messagesData).map(([id, message]) => ({
            id,
            ...message,
            timestamp: message.timestamp || Date.now(),
          })).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messagesList);
        } else {
          setMessages([]);
        }
      });

      return () => {
        chatUnsubscribe();
        messagesUnsubscribe();
      };
    }
  }, [participants, user, currentChatId]);

  // Listen to Typing Status
  useEffect(() => {
    if (currentChatId && user) {
      const db = getDatabase();
      const typingStatusRef = ref(
        db,
        `chats/${currentChatId}/typingStatus`
      );

      const typingStatusListener = onValue(typingStatusRef, (snapshot) => {
        if (snapshot.exists()) {
          const status = snapshot.val();
          setTypingStatus(status);
        }
      });

      return () => {
        off(typingStatusRef, typingStatusListener);
      };
    }
  }, [currentChatId, user]);

  // Update Typing Status
  const updateTypingStatus = useCallback(
    (isTyping) => {
      if (currentChatId && user) {
        const db = getDatabase();
        const userTypingStatusRef = ref(
          db,
          `chats/${currentChatId}/typingStatus/${sanitizeEmail(user.email).toLowerCase()}`
        );
        set(userTypingStatusRef, isTyping);
      }
    },
    [currentChatId, user]
  );

  // Handle Input Change
  const handleInputChange = useCallback((value) => {
    setInputMessage(value);

    clearTimeout(typingTimerRef.current);
    updateTypingStatus(true);

    typingTimerRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  }, [updateTypingStatus]);

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

    return <TypingIndicator typingUsers={typingUsers} />;
  }, [typingStatus, user.email, participantNames]);

  // Handle Insert Math
  const handleInsertMath = useCallback((latex) => {
    const latexCode = `$$${latex}$$`;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    editor.insertText(range.index, latexCode);
  }, []);

  // Sanitize HTML
  const sanitizeHtml = useMemo(() => (html) => {
    if (DOMPurify) {
      return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
    }
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }, []);

  // Render Message Content
  const renderMessageContent = useMemo(() => (text) => {
    const cleanHtml = sanitizeHtml(text);
    const parts = cleanHtml.split(/(\$\$.*?\$\$)/g);
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
  }, [sanitizeHtml]);

  // Render Participant Names - Updated to show only display names
  const renderParticipantNames = useMemo(() => {
    return participants
      .filter((participant) => !compareEmails(participant.email, user.email))
      .map((participant) => {
        const name = participantNames[participant.email];
        if (name) {
          return `${name.firstName} ${name.lastName}`.trim();
        }
        return participant.displayName || participant.email.split('@')[0];
      })
      .join(', ');
  }, [participants, user.email, participantNames]);

  // ReactQuill Modules
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  }), []);

  // Handle Add Participant
  const handleAddParticipant = useCallback(async (newParticipant) => {
    if (currentChatId) {
      setIsLoading(true);
      setError(null);
      const db = getDatabase();
      const chatRef = ref(db, `chats/${currentChatId}`);
      
      try {
        const chatSnapshot = await get(chatRef);
        if (chatSnapshot.exists()) {
          const chatData = chatSnapshot.val();
          const updatedParticipants = [...chatData.participants, newParticipant.email];
          
          // Update the chat with the new participant
          await update(chatRef, { participants: updatedParticipants });
          
          // Add the chat to the new participant's userChats
          const userChatRef = ref(db, `userChats/${sanitizeEmail(newParticipant.email).toLowerCase()}/${currentChatId}`);
          await set(userChatRef, {
            timestamp: serverTimestamp(),
            lastMessage: chatData.lastMessage || '',
            firstMessage: chatData.firstMessage || '',
          });
          
          // Update local state
          setParticipants(prevParticipants => [...prevParticipants, newParticipant]);
          
          // Send a message from the current user about the new participant
          const newParticipantMessage = {
            text: `${newParticipant.firstName} ${newParticipant.lastName} has been added to the chat.`,
            sender: sanitizeEmail(user.email).toLowerCase(),
            timestamp: serverTimestamp(),
          };
          await push(ref(db, `chats/${currentChatId}/messages`), newParticipantMessage);

          console.log(`Participant ${newParticipant.email} added to chat ${currentChatId}`);
        }
      } catch (error) {
        console.error("Error adding participant:", error);
        setError("Failed to add participant. Please try again.");
      } finally {
        setIsLoading(false);
        setShowAddParticipantDialog(false);
      }
    }
  }, [currentChatId, user.email]);

  // Handle clearing the chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setParticipants([]);
    setCurrentChatId(null);
    setIsNewChat(true);
    setIsChatCreated(false);
    setShowParticipantSearch(true);
    setShowParticipantInfo(false);
    setInputMessage('');
    if (quillRef.current) {
      quillRef.current.getEditor().setText('');
    }
  }, []);

  // Handle removing the user from the chat using Firebase Cloud Function
  const removeUserFromChat = useCallback(async () => {
    if (!currentChatId || !user) return;

    try {
      const functions = getFunctions();
      const removeUserFromChatFunction = httpsCallable(functions, 'removeUserFromChat');
      await removeUserFromChatFunction({ chatId: currentChatId });

      // Clear the current chat and return to participant search
      handleClearChat();
    } catch (error) {
      console.error('Error removing user from chat:', error);
      setError('Failed to leave the chat. Please try again.');
    }
  }, [currentChatId, user, handleClearChat]);

  // Chat Interface Component
  const ChatInterface = useMemo(() => (
    <>
      {/* Header Section */}
      <div ref={headerRef} className="border-b border-gray-200 flex-shrink-0">
        {participants.length > 0 && (
          <div className="bg-blue-100 p-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={toggleParticipantInfo}
            >
              <div className="flex items-center">
                {/* Clear Chat Button - Moved to the left */}
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
                <span className="font-medium">
                  Chatting with: {renderParticipantNames}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChatListModal(true);
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
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Add Participant"
                    aria-label="Add Participant"
                  >
                    <UserPlus size={20} />
                  </button>
                )}
                {/* Leave Chat Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUserFromChat();
                  }}
                  className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                  title="Leave Chat"
                  aria-label="Leave Chat"
                >
                  <LogOut size={20} />
                </button>
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
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin" size={24} />
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
              <div className="text-sm">
                {renderMessageContent(message.text)}
              </div>
            </div>
          </div>
        ))}
        {renderTypingIndicator}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Section */}
      <div ref={footerRef} className="p-4 bg-gray-100 border-t border-gray-200">
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
            onClick={() => setShowMathModal(true)}
            className="flex-1 bg-teal-500 text-white rounded-md p-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            Insert Math
          </button>
          <button
            onClick={handleSendMessage}
            disabled={participants.length === 0 || isLoading}
            className="flex-1 bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="animate-spin" size={24} />
            ) : (
              <>
                <Send size={24} className="mr-2" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </>
  ), [
    participants,
    messages,
    isLoading,
    error,
    isNewChat,
    renderParticipantNames,
    renderTypingIndicator,
    renderMessageContent,
    handleSendMessage,
    handleInputChange,
    showParticipantInfo,
    toggleParticipantInfo,
    userIsStaff,
    isChatCreated, // Added dependency
    handleClearChat, // Added dependency
    removeUserFromChat, // Added dependency
  ]);

  // Handle Start New Chat
  const handleStartNewChat = useCallback((participants) => {
    console.log("Starting new chat with:", participants);
    initializeChat(participants, null, true);
    setShowParticipantSearch(false);
  }, [initializeChat]);

  // Handle Open Chat List
  const handleOpenChatList = useCallback((participants) => {
    setSelectedParticipants(participants);
    setShowChatListModal(true);
    setShowParticipantSearch(false);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">
      {showParticipantSearch ? (
        <div className="p-4 border-b border-gray-200">
          <ChatParticipantSearch
            onStartNewChat={(participants) => {
              handleStartNewChat(participants);
            }}
            onOpenChatList={(participants) => {
              handleOpenChatList(participants);
            }}
            courseInfo={courseInfo}
            courseTeachers={courseTeachersMemo}
            courseSupportStaff={courseSupportStaffMemo}
          />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {participants.length > 0 && ChatInterface}
        </div>
      )}

      {/* Math Modal */}
      <MathModal
        isOpen={showMathModal}
        onClose={() => setShowMathModal(false)}
        onInsert={handleInsertMath}
        initialLatex=""
      />

      {/* Chat List Modal */}
      {showChatListModal && (
        <ChatListModal
          participants={selectedParticipants}
          onChatSelect={handleChatSelect}
          onClose={() => setShowChatListModal(false)}
        />
      )}

      {/* Add Chat Participant Dialog */}
      <AddChatParticipantDialog
        isOpen={showAddParticipantDialog}
        onClose={() => setShowAddParticipantDialog(false)}
        onAddParticipant={handleAddParticipant}
        currentParticipants={participants.map(p => p.email)}
        courseInfo={courseInfo}
      />
    </div>
  );
});

export default ChatApp;
