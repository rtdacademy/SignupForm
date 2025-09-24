import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import ReactionPopover from './ReactionPopover';
import AnimatedStickerMessage from './AnimatedStickerMessage';
import {
  MessageSquare,
  Send,
  User,
  UserCheck,
  Clock,
  AlertCircle,
  Award,
  Loader2,
  Reply,
  Check,
  CheckCheck,
  Star,
  MessageCircle,
  SmilePlus
} from 'lucide-react';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import '../styles/sticker-animations.css';

// Score History Item Component
const ScoreHistoryItem = ({ message, cn, formatDistanceToNow }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              message.authorRole === 'facilitator' ? 'bg-green-100' : 'bg-blue-100'
            )}>
              {message.authorRole === 'facilitator' ? (
                <span className="text-xs font-bold text-green-700">F</span>
              ) : (
                <span className="text-xs font-bold text-blue-700">P</span>
              )}
            </div>
            <div className="text-left">
              <span className="font-semibold text-sm">
                {message.score.value}/{message.score.maxValue}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({Math.round((message.score.value / message.score.maxValue) * 100)}%)
              </span>
              {message.score.comment && (
                <span className="text-xs text-blue-600 ml-2">
                  {expanded ? '▼' : '▶'} Comment
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(
              message.createdAt?.toDate ? message.createdAt.toDate() : new Date(message.createdAt),
              { addSuffix: true }
            )}
          </span>
        </div>
      </button>
      {expanded && message.score.comment && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">
            "{message.score.comment}"
          </p>
        </div>
      )}
    </div>
  );
};

const EntryCommunication = ({
  entryId,
  messages = [],
  loadingMessages,
  onSendMessage,
  onUpdateMessage,
  onDeleteMessage,
  onAddScore,
  onMarkAsRead,
  unreadCount = 0,
  collapsed = false,
  onToggle,
  entryTitle,
  isEditMode = false
}) => {
  const { user } = useAuth();
  const [showEditor, setShowEditor] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [scoreValue, setScoreValue] = useState('');
  const [scoreMax, setScoreMax] = useState('10');
  const [scoreComment, setScoreComment] = useState('');
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const actionsRef = useRef(null);
  const [chatAreaHeight, setChatAreaHeight] = useState('400px');

  // Determine user role
  const getUserRole = () => {
    if (user?.email?.includes('@rtdacademy.com') ||
        user?.customClaims?.role === 'staff' ||
        user?.role === 'staff') {
      return 'facilitator';
    }
    return 'parent';
  };

  const userRole = getUserRole();

  // Calculate dynamic height for messages tab only
  useEffect(() => {
    const calculateHeight = () => {
      // Only calculate for messages tab
      if (activeTab !== 'messages') return;
      if (!containerRef.current) return;

      // Get actual container height
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRect.height;

      if (containerHeight === 0) {
        // Container not ready yet, try again
        setTimeout(calculateHeight, 100);
        return;
      }

      // Fixed heights for various elements
      const tabsHeight = 40; // Height of tabs
      const actionsHeight = 55; // Height of action buttons section
      const paddingHeight = 24; // Total padding (p-3 = 12px top + 12px bottom)
      const marginHeight = 12; // Various margins
      const editorHeight = showEditor ? 360 : 0; // Editor height when open

      // Calculate available height for messages (no score form here)
      let availableHeight = containerHeight - tabsHeight - actionsHeight - paddingHeight - marginHeight - editorHeight;

      // Set minimum and maximum heights
      availableHeight = Math.max(250, Math.min(availableHeight, 800));

      setChatAreaHeight(`${availableHeight}px`);
    };

    // Delay initial calculation to ensure DOM is ready
    const timer = setTimeout(calculateHeight, 50);

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateHeight);
    };
  }, [showEditor, activeTab]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (unreadCount > 0 && onMarkAsRead) {
      const unreadMessages = messages.filter(
        msg => !msg.readBy || !msg.readBy[user.uid]
      );
      unreadMessages.forEach(msg => {
        onMarkAsRead(msg.id);
      });
    }
  }, [messages, unreadCount, user.uid, onMarkAsRead]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setSaving(true);
    try {
      await onSendMessage({
        entryId,
        content: messageContent,
        type: 'message',
        replyTo: replyingTo?.id || null,
        authorRole: userRole
      });

      // Reset form
      setMessageContent('');
      setShowEditor(false);
      setReplyingTo(null);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle sending sticker
  const handleSendSticker = async (stickerData) => {
    try {
      await onSendMessage({
        entryId,
        type: 'sticker',
        sticker: stickerData,
        authorRole: userRole
      });
    } catch (err) {
      console.error('Error sending sticker:', err);
    }
  };

  // Handle adding score
  const handleAddScore = async () => {
    if (!scoreValue) return;

    setSaving(true);
    try {
      await onAddScore({
        entryId,
        type: 'score',
        score: {
          value: parseFloat(scoreValue),
          maxValue: parseFloat(scoreMax),
          comment: scoreComment.trim() || null
        },
        authorRole: userRole
      });

      // Reset form
      setScoreValue('');
      setScoreMax('10');
      setScoreComment('');
      setShowScoreForm(false);
    } catch (err) {
      console.error('Error adding score:', err);
    } finally {
      setSaving(false);
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'facilitator':
        return 'success';
      case 'parent':
        return 'default';
      case 'student':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get message accent color class
  const getMessageAccentClass = (role) => {
    switch (role) {
      case 'facilitator':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'parent':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'student':
        return 'border-l-4 border-purple-500 bg-purple-50';
      default:
        return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  // Render individual message
  const renderMessage = (message) => {
    const isAuthor = message.authorId === user.uid;
    const isRead = message.readBy && Object.keys(message.readBy).length > 1;
    const isScore = message.type === 'score';
    const isSticker = message.type === 'sticker';

    // Render sticker messages with animation
    if (isSticker) {
      return (
        <div key={message.id} className="mb-4">
          <AnimatedStickerMessage message={message} isAuthor={isAuthor} />
        </div>
      );
    }

    return (
      <div key={message.id} className={`group ${getMessageAccentClass(message.authorRole)} rounded-md p-2 mb-2 transition-all hover:shadow-sm`}>
        {/* Message Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-1.5">
            {/* User Avatar */}
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200">
              {message.authorRole === 'facilitator' ? (
                <UserCheck className="w-3 h-3 text-green-600" />
              ) : (
                <User className="w-3 h-3 text-blue-600" />
              )}
            </div>

            {/* Author Info */}
            <div className="flex items-baseline gap-1">
              <span className="font-medium text-xs text-gray-900">
                {message.authorName}
              </span>
              <Badge
                variant={getRoleBadgeVariant(message.authorRole)}
                className="text-[10px] px-1 py-0 h-3.5"
              >
                {message.authorRole === 'facilitator' ? 'F' : 'P'}
              </Badge>
              <span className="text-[10px] text-gray-500">
                {formatDistanceToNow(
                  message.createdAt?.toDate ? message.createdAt.toDate() : new Date(message.createdAt),
                  { addSuffix: true }
                )}
              </span>
            </div>
          </div>

          {/* Read Indicator */}
          <div className="flex items-center">
            {isAuthor && (
              isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3 text-gray-400" />
              )
            )}
          </div>
        </div>

        {/* Score Display */}
        {isScore && message.score && (
          <div className="mb-3 p-3 bg-white rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-lg">
                  Score: {message.score.value}/{message.score.maxValue}
                </span>
                <span className="text-sm text-gray-500">
                  ({Math.round((message.score.value / message.score.maxValue) * 100)}%)
                </span>
              </div>
            </div>
            {/* Score Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(message.score.value / message.score.maxValue) * 100}%` }}
              />
            </div>
            {message.score.comment && (
              <p className="text-sm text-gray-600 italic">
                "{message.score.comment}"
              </p>
            )}
          </div>
        )}

        {/* Message Content */}
        {message.content && !isScore && (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        )}

        {/* Reply Button */}
        {!isAuthor && (
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyingTo(message);
                setShowEditor(true);
              }}
              className="h-5 px-1.5 text-[10px]"
            >
              <Reply className="w-2.5 h-2.5 mr-0.5" />
              Reply
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Get latest scores (most recent)
  const getLatestScores = () => {
    const scores = messages.filter(m => m.type === 'score');
    // Sort by createdAt descending to get most recent first
    const sortedScores = scores.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return timeB - timeA; // Most recent first
    });
    const parentScore = sortedScores.find(s => s.authorRole === 'parent');
    const facilitatorScore = sortedScores.find(s => s.authorRole === 'facilitator');
    return { parentScore, facilitatorScore };
  };

  const { parentScore, facilitatorScore } = getLatestScores();

  // Separate messages and scores
  const regularMessages = messages.filter(m => m.type !== 'score');
  const scoreMessages = messages.filter(m => m.type === 'score');

  return (
    <div className="w-full h-full flex flex-col" ref={containerRef}>
      {/* Chat area with gradient background */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-lg p-3 shadow-sm border border-purple-100/50 flex-1 flex flex-col">
        {/* Custom Switcher for Messages and Scoring */}
        <div className="w-full h-full flex flex-col">
          {/* Switcher Buttons */}
          <div className="grid w-full grid-cols-2 mb-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                className={cn(
                  "flex items-center justify-center gap-1 text-xs h-8 rounded-md transition-all duration-200",
                  activeTab === 'messages'
                    ? "bg-white text-gray-900 shadow-sm border border-purple-200"
                    : "bg-white/50 text-gray-600 hover:bg-white/70 border border-transparent"
                )}
              >
                <MessageCircle className="w-3 h-3" />
                <span>Messages</span>
                {regularMessages.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 h-4 min-w-[16px] flex items-center justify-center text-xs">
                    {regularMessages.length}
                  </Badge>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scoring')}
                className={cn(
                  "flex items-center justify-center gap-1 text-xs h-8 rounded-md transition-all duration-200",
                  activeTab === 'scoring'
                    ? "bg-white text-gray-900 shadow-sm border border-purple-200"
                    : "bg-white/50 text-gray-600 hover:bg-white/70 border border-transparent"
                )}
              >
                <Star className="w-3 h-3" />
                <span>Scoring</span>
                {scoreMessages.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 h-4 min-w-[16px] flex items-center justify-center text-xs">
                    {scoreMessages.length}
                  </Badge>
                )}
              </button>
          </div>

          {/* Content Area */}
          {activeTab === 'messages' ? (
            <div className="mt-2 flex-1 flex flex-col">
              {/* Messages container with calculated height */}
              <div style={{ height: activeTab === 'messages' ? chatAreaHeight : 'auto' }} className="transition-all duration-300">
                {/* Messages List */}
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center bg-white/50 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  </div>
                ) : regularMessages.length > 0 ? (
                  <div className="h-full bg-white/60 rounded-lg p-2 backdrop-blur-sm">
                    <ScrollArea className="h-full pr-1">
                      <div className="space-y-2">
                        {regularMessages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-white/50 rounded-lg">
                    <div className="text-center">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                      <p className="text-sm font-medium text-gray-600">No messages yet</p>
                      <p className="text-xs mt-1 text-gray-500">Start the conversation with a message or reaction</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Actions - Always at bottom */}
              <div ref={actionsRef} className="mt-auto relative z-10">
                <Separator className="mt-3 mb-2 bg-gradient-to-r from-purple-200 via-blue-200 to-indigo-200 h-[1px]" />
                <div className="flex gap-2 relative">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Message button clicked, current showEditor:', showEditor);
                    setShowEditor(!showEditor);
                  }}
                  className={cn(
                    "flex-1 h-9 text-xs text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-md flex items-center justify-center cursor-pointer",
                    showEditor
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 scale-95"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 pointer-events-none" />
                  <span className="pointer-events-none">{showEditor ? 'Hide Editor' : 'Message'}</span>
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex-1 h-9 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-200 rounded-md flex items-center justify-center cursor-pointer"
                    >
                      <SmilePlus className="w-3.5 h-3.5 mr-1.5 pointer-events-none" />
                      <span className="pointer-events-none">Reaction</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" align="center">
                    <ReactionPopover onSelectSticker={handleSendSticker} />
                  </PopoverContent>
                </Popover>
                </div>

                {/* Message Editor - Inside actions container */}
                {showEditor && (
                  <div className="mt-3 p-3 animate-in slide-in-from-bottom-2 duration-200" style={{ minHeight: '280px' }}>
                    {replyingTo && (
                      <Alert className="mb-3">
                        <Reply className="h-4 w-4" />
                        <AlertDescription>
                          Replying to {replyingTo.authorName}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                            className="ml-2 h-6 px-2"
                          >
                            Cancel
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="rounded-lg bg-white/90 backdrop-blur-sm shadow-inner" style={{ minHeight: '150px' }}>
                      <QuillEditor
                        ref={editorRef}
                        initialContent={messageContent}
                        onContentChange={setMessageContent}
                        hideSaveButton={true}
                        fixedHeight="150px"
                        placeholder="Write your message..."
                      />
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditor(false);
                          setReplyingTo(null);
                          setMessageContent('');
                        }}
                        disabled={saving}
                        className="px-4 h-9 text-xs bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-md hover:from-gray-500 hover:to-gray-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={saving || !messageContent.trim()}
                        className="px-4 h-9 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 mr-1" />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'scoring' ? (
            <div className="mt-4 flex-1 flex flex-col">
              {/* Assessment Scores */}
              <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm overflow-y-auto">
                {/* Title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-lg">Assessment Scores</h3>
                    {scoreMessages.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {scoreMessages.length} {scoreMessages.length === 1 ? 'score' : 'scores'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Latest Scores Summary */}
                {(parentScore || facilitatorScore) && (
                  <div className="space-y-3">
                    {parentScore && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-sm">Parent Assessment</span>
                            <Badge variant="default" className="text-xs">Parent</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              parentScore.createdAt?.toDate ? parentScore.createdAt.toDate() : new Date(parentScore.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {parentScore.score.value}/{parentScore.score.maxValue}
                          </div>
                          <div className="text-lg text-gray-600">
                            {Math.round((parentScore.score.value / parentScore.score.maxValue) * 100)}%
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-3">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(parentScore.score.value / parentScore.score.maxValue) * 100}%` }}
                          />
                        </div>
                        {parentScore.score.comment && (
                          <p className="text-sm text-gray-600 italic mt-2">
                            "{parentScore.score.comment}"
                          </p>
                        )}
                      </div>
                    )}

                    {facilitatorScore && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">Facilitator Assessment</span>
                            <Badge variant="success" className="text-xs">Facilitator</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              facilitatorScore.createdAt?.toDate ? facilitatorScore.createdAt.toDate() : new Date(facilitatorScore.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">
                            {facilitatorScore.score.value}/{facilitatorScore.score.maxValue}
                          </div>
                          <div className="text-lg text-gray-600">
                            {Math.round((facilitatorScore.score.value / facilitatorScore.score.maxValue) * 100)}%
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-3">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${(facilitatorScore.score.value / facilitatorScore.score.maxValue) * 100}%` }}
                          />
                        </div>
                        {facilitatorScore.score.comment && (
                          <p className="text-sm text-gray-600 italic mt-2">
                            "{facilitatorScore.score.comment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Score History */}
                {scoreMessages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Score History
                    </h4>
                    <ScrollArea className="h-[200px] pr-2">
                      <div className="space-y-2">
                        {[...scoreMessages].reverse().map(message => (
                          <ScoreHistoryItem
                            key={message.id}
                            message={message}
                            cn={cn}
                            formatDistanceToNow={formatDistanceToNow}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {scoreMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No scores yet</p>
                    <p className="text-xs mt-1 text-gray-400">Add a score assessment below</p>
                  </div>
                )}
              </div>

              {/* Score Actions - Always at bottom */}
              <div className="mt-auto relative z-10">
                <Separator className="mt-3 mb-2 bg-gradient-to-r from-yellow-200 via-orange-200 to-amber-200 h-[1px]" />
                <button
                  type="button"
                  onClick={() => {
                    console.log('Score button clicked, current showScoreForm:', showScoreForm);
                    setShowScoreForm(!showScoreForm);
                  }}
                  className={cn(
                    "w-full h-9 text-xs text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-md flex items-center justify-center cursor-pointer",
                    showScoreForm
                      ? "bg-gradient-to-r from-yellow-600 to-orange-600 scale-95"
                      : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  )}
                >
                  <Star className="w-4 h-4 mr-2 pointer-events-none" />
                  <span className="pointer-events-none">{showScoreForm ? 'Hide Form' : 'Add Score'}</span>
                </button>

                {/* Score Form - Inside actions container */}
                {showScoreForm && (
                  <div className="mt-3 p-3 animate-in slide-in-from-bottom-2 duration-200" style={{ minHeight: '320px' }}>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Add Score Assessment
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Score</label>
                      <input
                        type="number"
                        value={scoreValue}
                        onChange={(e) => setScoreValue(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Points earned"
                        min="0"
                        max={scoreMax}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Out of</label>
                      <input
                        type="number"
                        value={scoreMax}
                        onChange={(e) => setScoreMax(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Maximum points"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-xs text-gray-600 mb-1 block">
                      Context/Comment (optional)
                    </label>
                    <textarea
                      value={scoreComment}
                      onChange={(e) => setScoreComment(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      rows="3"
                      placeholder="Explain the score and provide feedback..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowScoreForm(false);
                        setScoreValue('');
                        setScoreMax('10');
                        setScoreComment('');
                      }}
                      disabled={saving}
                      className="px-4 h-9 text-xs bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-md hover:from-gray-500 hover:to-gray-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddScore}
                      disabled={saving || !scoreValue}
                      className="px-4 h-9 text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-md hover:from-amber-600 hover:to-yellow-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-3 h-3 mr-1" />
                          <span>Add Score</span>
                        </>
                      )}
                    </button>
                  </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EntryCommunication;