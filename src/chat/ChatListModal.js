// ChatListModal.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { sanitizeEmail } from '../utils/sanitizeEmail';

// Optionally import DOMPurify if available
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
      console.log("ChatListModal: Fetching chats", { participants });
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

       // Process participant keys
const participantKeys = participants.map(p => {
  if (typeof p === 'string') {
    // If p is already a string (email), use it directly
    return sanitizeEmail(p).toLowerCase();
  } else if (p.id && typeof p.id === 'string') {
    // If p has an id property that's a string, process it
    return p.id.includes('_') ? extractEmail(p.id) : sanitizeEmail(p.id).toLowerCase();
  } else if (p.email && typeof p.email === 'string') {
    // If p has an email property, use that
    return sanitizeEmail(p.email).toLowerCase();
  } else {
    console.warn('Unexpected participant format:', p);
    return null; // or some default value
  }
}).filter(Boolean); // Remove any null values

console.log("Processed participant keys:", participantKeys);

        // Include the current user's sanitized email
        const allParticipantKeys = [...new Set([...participantKeys, fetchedUserSanitizedEmail])];

        console.log("Fetching chats for participants:", allParticipantKeys);

        // Fetch chats for all participants
        const chatPromises = allParticipantKeys.map(async (participantKey) => {
          const userChatsRef = ref(db, `userChats/${participantKey}`);
          const userChatsSnapshot = await get(userChatsRef);
          return userChatsSnapshot.val() || {};
        });

        const participantChats = await Promise.all(chatPromises);

        if (participantChats.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        // Find common chat IDs
        const commonChatIds = Object.keys(participantChats[0]).filter(chatId =>
          participantChats.every(userChats => userChats.hasOwnProperty(chatId))
        );

        if (commonChatIds.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        // Fetch chat details for common chats
        const chatDetailsPromises = commonChatIds.map(async (chatId) => {
          const chatRef = ref(db, `chats/${chatId}`);
          const chatSnapshot = await get(chatRef);
          const chatData = chatSnapshot.val();

          if (chatData) {
            const participantDetails = await Promise.all(chatData.participants.map(async (email) => {
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
                  isStaff
                };
              }
              return { 
                email: email, 
                displayName: email, 
                type: 'unknown', 
                isStaff: false 
              };
            }));

            // Fetch the userChat data for the current user to get firstMessage
            const userChatRef = ref(db, `userChats/${fetchedUserSanitizedEmail}/${chatId}`);
            const userChatSnapshot = await get(userChatRef);
            const userChatData = userChatSnapshot.val();

            return {
              id: chatId,
              participants: chatData.participants,
              participantDetails,
              lastMessage: chatData.lastMessage || '',
              firstMessage: userChatData?.firstMessage || '', // Add firstMessage
              timestamp: chatData.lastMessageTimestamp || Date.now(),
            };
          }
          return null;
        });

        const chatsWithDetails = (await Promise.all(chatDetailsPromises)).filter(Boolean);
        setChats(chatsWithDetails);
        console.log("ChatListModal: Chats fetched", chatsWithDetails);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }

      setLoading(false);
    };

    fetchChats();
  }, [db, user.uid, participants]);

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
                      {renderMessageContent(chat.firstMessage)} {/* Use firstMessage here */}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.timestamp).toLocaleString()}
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
