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

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      const chatsRef = ref(db, 'chats');
      const snapshot = await get(chatsRef);

      if (snapshot.exists()) {
        const allChats = snapshot.val();
        const sanitizedUserEmail = sanitizeEmail(user.email);
        const participantEmails = participants; // Participants are already sanitized strings

        const relevantChats = Object.entries(allChats)
          .filter(([_, chatData]) => {
            if (!chatData || !Array.isArray(chatData.participants)) {
              return false;
            }
            // Check if all selected participants (including the current user) are in the chat
            const allParticipantsPresent = [sanitizedUserEmail, ...participantEmails].every(email =>
              chatData.participants.includes(email)
            );
            // Check if the chat has exactly the same number of participants as selected (plus the current user)
            const correctParticipantCount = chatData.participants.length === participantEmails.length + 1;
            return allParticipantsPresent && correctParticipantCount;
          })
          .map(([chatId, chatData]) => ({
            id: chatId,
            participants: chatData.participants,
            lastMessage: chatData.lastMessage || '',
            timestamp: chatData.lastMessageTimestamp || Date.now(),
          }));

        // Fetch participant details for each chat
        const chatsWithDetails = await Promise.all(relevantChats.map(async (chat) => {
          const participantDetails = await Promise.all(chat.participants.map(async (email) => {
            const studentRef = ref(db, `students/${email}`);
            const studentSnapshot = await get(studentRef);
            if (studentSnapshot.exists()) {
              const userData = studentSnapshot.val();
              return {
                email: email.replace(',', '.'), // Desanitize email for display
                displayName: `${userData.profile?.firstName || ''} ${userData.profile?.lastName || ''}`.trim(),
                course: Object.values(userData.courses || {})[0]?.Course?.Value || '',
                isStaff: false
              };
            }

            // If not a student, check staff
            const staffRef = ref(db, `staff/${email}`);
            const staffSnapshot = await get(staffRef);
            if (staffSnapshot.exists()) {
              const staffData = staffSnapshot.val();
              return {
                email: staffData.email || email.replace(',', '.'), // Desanitize email for display
                displayName: staffData.displayName || `${email.replace(',', '.')}`,
                isStaff: true
              };
            }

            // Fallback if not found
            return { email: email.replace(',', '.'), displayName: email.replace(',', '.'), isStaff: false };
          }));
          return { ...chat, participantDetails };
        }));

        setChats(chatsWithDetails);
      }

      setLoading(false);
    };

    fetchChats();
  }, [db, user.email, participants]);

  const handleNewChat = () => {
    onChatSelect({ isNew: true, participants });
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
      .filter(p => p.email !== user.email)
      .map((p, index) => (
        <div key={index} className="text-xs text-gray-600">
          {p.displayName}
          {!p.isStaff && p.course && ` (${p.course})`}
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
                    onClick={() => onChatSelect({ isNew: false, chatId: chat.id, participants: chat.participants })}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {renderParticipants(chat.participantDetails)}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {renderMessageContent(chat.lastMessage)}
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