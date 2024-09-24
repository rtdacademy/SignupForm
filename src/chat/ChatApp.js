// ChatApp.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  UserPlus,
  Loader,
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import MathModal from './MathModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ChatParticipantSearch from './ChatParticipantSearch';
import ChatListModal from './ChatListModal';
import { useAuth } from '../context/AuthContext';
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  get,
  serverTimestamp,
  update,
  onValue,
  off,
} from 'firebase/database';
import { sanitizeEmail, compareEmails } from '../utils/sanitizeEmail';
import TypingIndicator from './TypingIndicator';

// Optionally import DOMPurify if available
let DOMPurify;
try {
  DOMPurify = require('dompurify');
} catch (e) {
  console.warn('DOMPurify not available. HTML sanitization will be limited.');
}

const ParticipantInfo = ({ email, isStaff }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      const db = getDatabase();
      const sanitizedEmail = sanitizeEmail(email);
      const studentRef = ref(db, `students/${sanitizedEmail}/profile`);
      const studentSnapshot = await get(studentRef);

      if (studentSnapshot.exists()) {
        const profile = studentSnapshot.val();
        setDetails({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
        });
      } else {
        const staffRef = ref(db, `staff/${sanitizedEmail}`);
        const staffSnapshot = await get(staffRef);

        if (staffSnapshot.exists()) {
          const profile = staffSnapshot.val();
          setDetails({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          });
        } else {
          setDetails({
            firstName: email.split('@')[0], // Use the part before @ as the name
            lastName: '',
          });
        }
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
      {isStaff && (
        <p>
          <strong>Email:</strong> {email}
        </p>
      )}
    </div>
  );
};



const ChatApp = ({ courseInfo, courseTeachers, courseSupportStaff }) => {
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
  const messagesEndRef = useRef(null);
  const quillRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const { user, isStaff } = useAuth();
  const userIsStaff = isStaff(user);  // Determine if the current user is staff

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchParticipantNames = async () => {
      const db = getDatabase();
      const names = {};

      for (const email of participants) {
        const sanitizedEmail = sanitizeEmail(email);
        const studentRef = ref(db, `students/${sanitizedEmail}/profile`);
        const studentSnapshot = await get(studentRef);

        if (studentSnapshot.exists()) {
          const profile = studentSnapshot.val();
          names[email] = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          };
        } else {
          const staffRef = ref(db, `staff/${sanitizedEmail}`);
          const staffSnapshot = await get(staffRef);

          if (staffSnapshot.exists()) {
            const profile = staffSnapshot.val();
            names[email] = {
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
            };
          } else {
            names[email] = {
              firstName: email.replace(',', '.'),
              lastName: '',
            };
          }
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

  const initializeChat = useCallback(
    async (chatParticipants, chatId, newChat = false) => {
      setIsLoading(true);
      setError(null);
      try {
        setCurrentChatId(chatId);
        setMessages([]);
        setShowSearch(false);
        setShowParticipantInfo(false);
        setIsNewChat(newChat);

        let participantEmails = [];
        if (chatId) {
          const db = getDatabase();
          const chatRef = ref(db, `chats/${chatId}`);
          const chatSnapshot = await get(chatRef);

          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            participantEmails = chatData.participants;
          }
        } else {
          participantEmails = chatParticipants;
        }
        setParticipants(participantEmails);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleParticipantsSelect = (selectedParticipants) => {
    const sanitizedEmails = selectedParticipants.map(
      (participant) => participant.email
    );
    setParticipants(sanitizedEmails);
    setShowChatListModal(true);
    setShowParticipantInfo(false);
    setShowSearch(false);
  };

  const toggleParticipantInfo = () => {
    setShowParticipantInfo(!showParticipantInfo);
  };

  const handleChatSelect = ({ isNew, chatId, participants }) => {
    setShowChatListModal(false);
    if (isNew) {
      initializeChat(participants, null, true);
    } else {
      initializeChat(participants, chatId, false);
      loadChat(chatId);
    }
  };

  const loadChat = async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      const db = getDatabase();
      const messagesRef = ref(db, `chats/${chatId}/messages`);
      const snapshot = await get(messagesRef);
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList = Object.values(messagesData);
        setMessages(messagesList);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Failed to load chat messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNotification = async (
    participantEmail,
    chatId,
    firstMessagePreview
  ) => {
    const db = getDatabase();
    const notificationRef = ref(
      db,
      `students/${participantEmail}/notifications`
    );
    await push(notificationRef, {
      type: 'new_chat',
      message: `New chat from ${
        user.displayName || user.email
      }: "${firstMessagePreview}"`,
      chatId: chatId,
      timestamp: serverTimestamp(),
      read: false,
    });
  };

  const handleSendMessage = async () => {
    if (
      inputMessage.trim() !== '' &&
      participants.length > 0 &&
      user
    ) {
      setIsLoading(true);
      setError(null);
      const db = getDatabase();
      let chatId = currentChatId;
      let chatRef;

      const currentUserEmail = sanitizeEmail(user.email);

      const newMessage = {
        text: inputMessage,
        sender: currentUserEmail,
        senderName: participantNames[currentUserEmail]
          ? `${participantNames[currentUserEmail].firstName} ${participantNames[currentUserEmail].lastName}`
          : user.displayName || user.email,
        timestamp: serverTimestamp(),
      };

      try {
        if (!chatId) {
          chatRef = push(ref(db, 'chats'));
          chatId = chatRef.key;

          let allParticipants = [...participants];
          if (!allParticipants.includes(currentUserEmail)) {
            allParticipants.push(currentUserEmail);
          }

          const newChatData = {
            participants: allParticipants,
            createdAt: serverTimestamp(),
            lastMessage: inputMessage,
            lastMessageTimestamp: serverTimestamp(),
          };

          await set(chatRef, newChatData);
          console.log('New chat created with ID:', chatId);

          for (const participantEmail of allParticipants) {
            if (!compareEmails(participantEmail, user.email)) {
              await createNotification(
                participantEmail,
                chatId,
                inputMessage.substring(0, 50)
              );
            }
          }

          setCurrentChatId(chatId);
        }

        await push(ref(db, `chats/${chatId}/messages`), newMessage);

        await update(ref(db, `chats/${chatId}`), {
          lastMessage: inputMessage,
          lastMessageTimestamp: serverTimestamp(),
        });

        setInputMessage('');
        quillRef.current.getEditor().setText('');
        setIsNewChat(false);
      } catch (error) {
        console.error('Error handling message:', error);
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (participants.length > 0 && user && currentChatId) {
      const db = getDatabase();
      const chatRef = ref(db, `chats/${currentChatId}`);
      const messagesRef = ref(db, `chats/${currentChatId}/messages`);

      const chatUnsubscribe = onValue(chatRef, (snapshot) => {
        if (snapshot.exists()) {
          const chatData = snapshot.val();
          if (chatData && chatData.participants) {
            const chatParticipants = chatData.participants;
            const sanitizedUserEmail = sanitizeEmail(user.email);

            const isUserInChat = chatParticipants.some((email) =>
              compareEmails(email, user.email)
            );

            if (!isUserInChat) {
              console.error('Current user is not a participant in this chat');
              setError('You are not a participant in this chat.');
              return;
            }
          } else {
            console.error('Chat data is missing or incomplete');
            setError('Chat data is missing or incomplete.');
            return;
          }
        } else {
          console.log('Chat does not exist yet');
        }
      });

      const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesList = Object.values(messagesData);
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

  const updateTypingStatus = useCallback(
    (isTyping) => {
      if (currentChatId && user) {
        const db = getDatabase();
        const userTypingStatusRef = ref(
          db,
          `chats/${currentChatId}/typingStatus/${sanitizeEmail(user.email)}`
        );
        set(userTypingStatusRef, isTyping);
      }
    },
    [currentChatId, user]
  );

  const handleInputChange = (value) => {
    setInputMessage(value);

    clearTimeout(typingTimerRef.current);
    updateTypingStatus(true);

    typingTimerRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  };

  const renderTypingIndicator = () => {
    const typingUsers = Object.entries(typingStatus)
      .filter(
        ([email, status]) =>
          status && email !== sanitizeEmail(user.email)
      )
      .map(
        ([email]) =>
          participantNames[email]
            ? `${participantNames[email].firstName} ${participantNames[email].lastName}`
            : email.replace(',', '.')
      );

    return <TypingIndicator typingUsers={typingUsers} />;
  };

  const handleInsertMath = (latex) => {
    const latexCode = `$$${latex}$$`;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    editor.insertText(range.index, latexCode);
  };

  const sanitizeHtml = (html) => {
    if (DOMPurify) {
      return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
    }
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
  };

  const renderMessageContent = (text) => {
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
  };

  const renderParticipantNames = () => {
    return participants
      .filter((email) => !compareEmails(email, user.email))
      .map((email) => {
        const name = participantNames[email];
        if (name) {
          const { firstName, lastName } = name;
          return `${firstName} ${
            lastName ? lastName.charAt(0) + '.' : ''
          }`.trim();
        }
        return email.replace(',', '.');
      })
      .join(', ');
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">
      {/* Header Section */}
      <div ref={headerRef} className="border-b border-gray-200 flex-shrink-0">
        {showSearch ? (
          <div className="p-4">
            <ChatParticipantSearch
              onParticipantsSelect={handleParticipantsSelect}
              courseInfo={courseInfo}
              courseTeachers={courseTeachers}
              courseSupportStaff={courseSupportStaff}
            />
          </div>
        ) : (
          participants.length > 0 && (
            <div>
              <div
                className="flex justify-between items-center bg-blue-100 p-2 cursor-pointer"
                onClick={toggleParticipantInfo}
              >
                <span className="font-medium">
                  Chatting with: {renderParticipantNames()}
                </span>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentChatId(null);
                      setMessages([]);
                      setShowSearch(true);
                      setIsNewChat(false);
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    title="Change Participants"
                    aria-label="Change Participants"
                  >
                    <UserPlus size={20} />
                  </button>
                  {showParticipantInfo ? (
                    <ChevronUp size={20} className="ml-2" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={20} className="ml-2" aria-hidden="true" />
                  )}
                </div>
              </div>
              {showParticipantInfo && (
                <div className="bg-blue-50 p-2 text-sm">
                  {participants
                    .filter((email) => !compareEmails(email, user.email))
                    .map((email, index) => (
                      <ParticipantInfo
                        key={index}
                        email={email}
                        isStaff={userIsStaff} 
                      />
                    ))}
                </div>
              )}
              <button
                className="w-full text-left p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setCurrentChatId(null);
                  setMessages([]);
                  setShowSearch(true);
                  setIsNewChat(false);
                }}
              >
                Change Participants
              </button>
            </div>
          )
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
              You are starting a new chat with {renderParticipantNames()} and they
              will receive a notification.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
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
        {renderTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Section */}
      <div
        ref={footerRef}
        className="p-4 bg-gray-100 border-t border-gray-200 flex-shrink-0"
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
          participants={participants}
          onChatSelect={handleChatSelect}
          onClose={() => setShowChatListModal(false)}
        />
      )}
    </div>
  );
};

export default ChatApp;