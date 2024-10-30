import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { sanitizeEmail, compareEmails } from '../utils/sanitizeEmail';
import { format } from 'date-fns';

let DOMPurify;
try {
  DOMPurify = require('dompurify');
} catch (e) {
  console.warn('DOMPurify not available. HTML sanitization will be limited.');
}

const ChatListModal = ({ participants, onChatSelect, onClose }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const db = getDatabase();
  const [userSanitizedEmail, setUserSanitizedEmail] = useState('');

  // Helper function to extract email from studentCourseSummaries key
  const extractEmail = (key) => {
    const lastUnderscoreIndex = key.lastIndexOf('_');
    return key.substring(0, lastUnderscoreIndex);
  };

  useEffect(() => {
    const fetchChats = async () => {
      console.log("ChatListModal: Fetching chats with participants:", participants);
      setLoading(true);
  
      try {
        // Fetch current user's sanitized email
        const userRef = ref(db, `users/${user.uid}/sanitizedEmail`);
        const userSnapshot = await get(userRef);
        const fetchedUserSanitizedEmail = userSnapshot.val();
  
        if (!fetchedUserSanitizedEmail) {
          console.error("User's sanitized email not found");
          setLoading(false);
          return;
        }
  
        setUserSanitizedEmail(fetchedUserSanitizedEmail);
  
        // Process and sanitize participant emails
        const participantSanitizedEmails = participants.map((participant) => {
          console.log("Processing participant:", participant);
          if (typeof participant === 'string') {
            return sanitizeEmail(participant);
          } else if (participant?.email) {
            return sanitizeEmail(participant.email);
          } else if (participant?.id) {
            return sanitizeEmail(participant.id.includes('_') ? extractEmail(participant.id) : participant.id);
          }
          console.warn('Unexpected participant format:', participant);
          return null;
        }).filter(Boolean);
  
        console.log("Processed sanitized participant emails:", participantSanitizedEmails);
  
        if (participantSanitizedEmails.length === 0) {
          console.warn("No valid participant emails to filter chats");
          setLoading(false);
          return;
        }
  
        // Include the current user's sanitized email
        const allParticipantEmails = [...new Set([...participantSanitizedEmails, fetchedUserSanitizedEmail])];
        console.log("All participant emails (including current user):", allParticipantEmails);
  
        // Fetch chats for the current user
        const userChatsRef = ref(db, `userChats/${fetchedUserSanitizedEmail}`);
        const userChatsSnapshot = await get(userChatsRef);
        const userChatsData = userChatsSnapshot.val() || {};
  
        // Get active chats
        const activeChats = Object.entries(userChatsData)
          .filter(([_, chatData]) => chatData.active !== false)
          .map(([chatId, chatData]) => ({ chatId, ...chatData }));
  
        console.log("Active chats found:", activeChats.length);
  
        // Fetch and filter chat details
        const chatDetailsPromises = activeChats.map(async ({ chatId }) => {
          const chatRef = ref(db, `chats/${chatId}`);
          const chatSnapshot = await get(chatRef);
          const chatData = chatSnapshot.val();
  
          if (!chatData) {
            console.log(`Chat ${chatId} not found`);
            return null;
          }
  
          // Check if chat includes all required participants
          const chatParticipants = chatData.participants.map(sanitizeEmail);
          const hasAllParticipants = participantSanitizedEmails.every(email => {
            const included = chatParticipants.includes(email);
            console.log(`Checking participant ${email} in chat ${chatId}: ${included}`);
            return included;
          });
  
          if (!hasAllParticipants) {
            console.log(`Chat ${chatId} filtered out - missing some participants`);
            return null;
          }
  
          // Fetch participant details
          const participantDetails = await Promise.all(
            chatData.participants.map(async (email) => {
              const sanitizedEmail = sanitizeEmail(email);
              let userRef = ref(db, `staff/${sanitizedEmail}`);
              let userSnapshot = await get(userRef);
  
              if (!userSnapshot.exists()) {
                userRef = ref(db, `students/${sanitizedEmail}/profile`);
                userSnapshot = await get(userRef);
              }
  
              if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                const isStaff = email.includes('@rtdacademy.com');
                return {
                  email: sanitizedEmail,
                  displayName: isStaff
                    ? userData.displayName
                    : `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                  type: isStaff ? 'staff' : 'student',
                  isStaff,
                  course: userData.course || '',
                };
              }
  
              return {
                email: sanitizedEmail,
                displayName: email,
                type: 'unknown',
                isStaff: false,
              };
            })
          );
  
          // Get the first message from userChats data
          const firstMessage = userChatsData[chatId]?.firstMessage || '';
          const timestamp = chatData.lastMessageTimestamp || Date.now();
  
          return {
            id: chatId,
            participants: chatData.participants,
            participantDetails,
            firstMessage,
            timestamp,
          };
        });
  
        const chatsWithDetails = (await Promise.all(chatDetailsPromises))
          .filter(Boolean)
          .sort((a, b) => b.timestamp - a.timestamp);
  
        console.log("Final filtered chats:", chatsWithDetails);
        setChats(chatsWithDetails);
  
      } catch (error) {
        console.error("Error fetching chats:", error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
  
    // Only run the effect if we have participants
    if (participants && participants.length > 0) {
      fetchChats();
    } else {
      console.log("ChatListModal: No participants provided");
      setChats([]);
      setLoading(false);
    }
  }, [db, user.uid, participants]);

  // Function to truncate message
  const truncateMessage = (message, maxLength) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substr(0, maxLength) + '...';
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'EEE, MMM d, yy, h:mm a');
  };

  // Updated handleNewChat function to pass full participant objects
  const handleNewChat = () => {
    console.log("ChatListModal: Starting new chat", participants);
    // Participants are already processed, so we don't need to process them again
    onChatSelect({ isNew: true, participants: participants });
  };

  const sanitizeHtml = (html) => {
    if (DOMPurify) {
      return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
    }
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    const cleanHtml = sanitizeHtml(text);
    const parts = cleanHtml.split(/(\$\$.*?\$\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const latex = part.substring(2, part.length - 2);
        return <BlockMath key={index}>{latex}</BlockMath>;
      } else {
        return (
          <span
            key={index}
            className="prose prose-sm max-w-none inline"
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      }
    });
  };

  const renderParticipants = (participantDetails) => {
    return participantDetails
      .filter(p => p.email !== userSanitizedEmail)
      .map((p, index) => (
        <div key={index} className="text-xs text-gray-600">
          {p.displayName}
          {p.type === 'student' && p.course && ` (${p.course})`}
        </div>
      ));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Chats
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading chats...</p>
        ) : (
          <>
            {chats.length > 0 ? (
              <ul className="mb-4 max-h-60 overflow-y-auto">
                {chats.map((chat) => (
                  <li
                    key={chat.id}
                    className="cursor-pointer p-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                    onClick={() => {
                      console.log("ChatListModal: Existing chat selected", chat);
                      // Updated to pass participantDetails instead of just emails
                      onChatSelect({ 
                        isNew: false, 
                        chatId: chat.id, 
                        participants: chat.participantDetails 
                      });
                    }}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {renderParticipants(chat.participantDetails)}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {renderMessageContent(truncateMessage(chat.firstMessage, 50))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(chat.timestamp)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-gray-500">
                No existing chats.
              </p>
            )}
            <div className="flex justify-between">
              <button
                onClick={handleNewChat}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
              >
                Start New Chat
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatListModal;
