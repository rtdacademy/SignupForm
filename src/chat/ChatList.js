import React, { useMemo } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { BlockMath } from 'react-katex';
import { Users, User, Loader } from 'lucide-react';
import 'katex/dist/katex.min.css';

// Optionally import DOMPurify if available
let DOMPurify;
try {
  DOMPurify = require('dompurify');
} catch (e) {
  console.warn('DOMPurify not available. HTML sanitization will be limited.');
}

const ChatList = ({ 
  chats, 
  loading, 
  hasMore, 
  onLoadMore, 
  tab,
  onChatSelect,
  notifications = {} 
}) => {
  // Sanitize HTML content
  const sanitizeHtml = (html) => {
    if (DOMPurify) {
      return DOMPurify.sanitize(html, { ALLOW_UNKNOWN_PROTOCOLS: true });
    }
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Render message content with math support and truncation
  const renderMessageContent = (text, maxLength = 50) => {
    if (!text) return '';
    
    const cleanHtml = sanitizeHtml(text);
    // Strip HTML tags for length calculation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    // Truncate if necessary
    const shouldTruncate = textContent.length > maxLength;
    const truncatedText = shouldTruncate 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;

    // Split for LaTeX rendering
    const parts = truncatedText.split(/(\$\$.*?\$\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const latex = part.substring(2, part.length - 2);
        return <BlockMath key={index}>{latex}</BlockMath>;
      } else {
        return (
          <span
            key={index}
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      }
    });
  };

  // Chat preview component
  const ChatPreview = ({ chat }) => {
    const isGroupChat = useMemo(() => 
      chat.participants && chat.participants.length > 2, 
      [chat.participants]
    );

    const notification = notifications[chat.chatId];
    const unreadCount = notification?.unreadCount || chat.unreadMessages || 0;
    const isUnread = notification?.read === false || unreadCount > 0;

    return (
      <Card 
        className="mb-2 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => onChatSelect(chat)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div className="flex-1">
              {/* Chat Title Area */}
              <div className="flex items-center gap-2 mb-2">
                {isGroupChat ? (
                  <Users className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="font-medium text-foreground">
                  {renderMessageContent(chat.firstMessage)}
                </div>
              </div>

              {/* First Message Info */}
              <div className="text-sm text-muted-foreground mb-2">
                Started by {chat.firstMessageSenderName} on {formatTimestamp(chat.createdAt)}
              </div>

              {/* Latest Message */}
              <div className="text-sm text-foreground">
                {renderMessageContent(chat.lastMessage)}
              </div>

              {/* Latest Message Info */}
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-muted-foreground">
                  {chat.lastMessageSenderName} • {formatTimestamp(chat.lastMessageTimestamp)}
                </div>
                {isUnread && (
                  <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>

            {/* Participant Count */}
            <div className="ml-4 text-xs text-muted-foreground">
              {chat.participants?.length || 0} participants
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No chats to display
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <ChatPreview key={chat.chatId} chat={chat} />
      ))}
      
      {hasMore && (
        <button
          onClick={() => onLoadMore(tab)}
          className="w-full py-2 text-primary hover:text-primary/80 transition-colors"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default ChatList;