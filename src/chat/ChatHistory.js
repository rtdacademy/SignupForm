import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { 
  MessageSquare, 
  Archive, 
  InboxIcon,
  UserCog,
  MessageSquarePlus
} from 'lucide-react';
import {
  getDatabase,
  ref,
  onValue,
  off,
  get,
  query,
  orderByChild,
  equalTo,
  limitToLast,
} from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import ChatList from './ChatList';
import debounce from 'lodash/debounce';

const ChatHistory = ({ 
  onChatSelect,
  courseId,
  courseTitle,
  courseTeachers = [],
  courseSupportStaff = [],
  allowStudentChats 
}) => {
  // State management
  const [activeChats, setActiveChats] = useState([]);
  const [leftChats, setLeftChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingUnread, setLoadingUnread] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [leftPage, setLeftPage] = useState(1);
  const [unreadPage, setUnreadPage] = useState(1);
  const [totalActiveChats, setTotalActiveChats] = useState(0);
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [totalLeftChats, setTotalLeftChats] = useState(0);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [staffDetails, setStaffDetails] = useState({});

  const { user_email_key, user } = useAuth();
  const db = getDatabase();
  const participantCache = useRef(new Map());
  const PAGE_SIZE = 20;

  // Fetch staff details
  useEffect(() => {
    const fetchStaffDetails = async () => {
      const details = {};
      const allStaff = [...courseTeachers, ...courseSupportStaff];
      
      for (const email of allStaff) {
        const sanitizedEmail = sanitizeEmail(email);
        const staffRef = ref(db, `staff/${sanitizedEmail}`);
        try {
          const snapshot = await get(staffRef);
          if (snapshot.exists()) {
            details[sanitizedEmail] = snapshot.val();
          }
        } catch (error) {
          console.error(`Error fetching staff details for ${email}:`, error);
        }
      }
      
      setStaffDetails(details);
    };

    if (courseTeachers.length > 0 || courseSupportStaff.length > 0) {
      fetchStaffDetails();
    }
  }, [courseTeachers, courseSupportStaff, db]);

  const handleStartNewChat = useCallback(async () => {
    if (selectedParticipants.length === 0) return;

    const formattedParticipants = selectedParticipants.map(participantEmail => {
      const sanitizedEmail = sanitizeEmail(participantEmail);
      const staffData = staffDetails[sanitizedEmail] || {};
      
      return {
        email: sanitizedEmail,
        displayName: staffData.displayName || participantEmail.split('@')[0],
        type: 'staff',
        isStaff: true
      };
    });

    onChatSelect({
      isNew: true,
      chatId: null,
      participants: formattedParticipants,
    });
  }, [selectedParticipants, staffDetails, onChatSelect]);

  const getDisplayName = useCallback((email) => {
    const sanitizedEmail = sanitizeEmail(email);
    const staffData = staffDetails[sanitizedEmail];
    return staffData ? 
      `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() || email.split('@')[0] : 
      email.split('@')[0];
  }, [staffDetails]);

  const fetchParticipantDetails = async (email) => {
    if (participantCache.current.has(email)) {
      return participantCache.current.get(email);
    }

    try {
      const studentRef = ref(db, `students/${email}/profile`);
      const studentSnapshot = await get(studentRef);

      let result;
      if (studentSnapshot.exists()) {
        const profile = studentSnapshot.val();
        result = {
          email,
          displayName: `${profile.firstName} ${profile.lastName}`.trim(),
          type: 'student',
        };
      } else {
        const staffRef = ref(db, `staff/${email}`);
        const staffSnapshot = await get(staffRef);

        if (staffSnapshot.exists()) {
          const profile = staffSnapshot.val();
          result = {
            email,
            displayName: profile.displayName || email,
            type: 'staff',
          };
        } else {
          result = {
            email,
            displayName: email,
            type: 'unknown',
          };
        }
      }

      participantCache.current.set(email, result);
      return result;
    } catch (error) {
      console.error('Error fetching participant details:', error);
      const fallback = {
        email,
        displayName: email,
        type: 'unknown',
      };
      participantCache.current.set(email, fallback);
      return fallback;
    }
  };

  const fetchTotalCounts = async () => {
    try {
      const userChatsRef = ref(db, `userChats/${user_email_key}`);
      const snapshot = await get(userChatsRef);
      const userChatsData = snapshot.val() || {};

      let activeCount = 0;
      let leftCount = 0;
      let unreadCount = 0;

      Object.values(userChatsData).forEach((chat) => {
        if (chat.active === false) {
          leftCount++;
        } else {
          activeCount++;
          if (chat.unreadMessages > 0) {
            unreadCount++;
          }
        }
      });

      setTotalActiveChats(activeCount);
      setTotalLeftChats(leftCount);
      setTotalUnreadChats(unreadCount);
    } catch (error) {
      console.error('Error fetching total counts:', error);
    }
  };

  const fetchChats = async (chatType, page, setChats, setLoading) => {
    setLoading(true);
    try {
      const userChatsRef = ref(db, `userChats/${user_email_key}`);
      let chatsQuery;

      if (chatType === 'active') {
        chatsQuery = query(
          userChatsRef,
          orderByChild('lastMessageTimestamp'),
          limitToLast(PAGE_SIZE * page)
        );
      } else if (chatType === 'left') {
        chatsQuery = query(
          userChatsRef,
          orderByChild('active'),
          equalTo(false),
          limitToLast(PAGE_SIZE * page)
        );
      } else if (chatType === 'unread') {
        chatsQuery = query(
          userChatsRef,
          orderByChild('lastMessageTimestamp'),
          limitToLast(PAGE_SIZE * page)
        );
      }

      const snapshot = await get(chatsQuery);
      const userChatsData = snapshot.val();
      if (!userChatsData) {
        setChats([]);
        setLoading(false);
        return;
      }

      let chatEntries = Object.entries(userChatsData);

      if (chatType === 'active') {
        chatEntries = chatEntries.filter(([_, chat]) => chat.active !== false);
      }

      if (chatType === 'unread') {
        chatEntries = chatEntries.filter(
          ([_, chat]) => chat.unreadMessages > 0 && chat.active !== false
        );
      }

      chatEntries.sort((a, b) => (b[1].lastMessageTimestamp || 0) - (a[1].lastMessageTimestamp || 0));

      const startIndex = 0;
      const paginatedChats = chatEntries.slice(startIndex, PAGE_SIZE * page);
      const chatIds = paginatedChats.map(([chatId]) => chatId);

      const chatsRef = ref(db, 'chats');
      const chatsSnapshot = await get(chatsRef);
      const allChatsData = chatsSnapshot.val() || {};

      const processedChats = await processChatsBatch(
        chatIds,
        allChatsData,
        userChatsData
      );

      setChats(processedChats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats');
      setLoading(false);
    }
  };

  const processChatsBatch = async (chatIds, allChatsData, userChatsData) => {
    const batchSize = 5;
    const processedChats = [];

    for (let i = 0; i < chatIds.length; i += batchSize) {
      const batch = chatIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async (chatId) => {
        const chatData = allChatsData[chatId];
        const userChatData = userChatsData[chatId];
        if (!chatData || !userChatData) return null;

        const participantDetails = await Promise.all(
          chatData.participants.map(fetchParticipantDetails)
        );

        const otherParticipants = participantDetails.filter(
          (p) => p.email !== user.email
        );

        return {
          chatId,
          ...userChatData, // Include the userChat data (firstMessage, lastMessage, etc.)
          ...chatData,
          active: userChatData.active !== false,
          unreadMessages: userChatData.unreadMessages || 0,
          participantDetails: otherParticipants,
          otherParticipants: otherParticipants.map((p) => p.displayName),
        };
      });

      const batchResults = await Promise.all(batchPromises);
      const validBatchResults = batchResults.filter(Boolean);
      processedChats.push(...validBatchResults);
    }

    return processedChats;
  };

  useEffect(() => {
    if (!user_email_key) return;

    fetchTotalCounts();
    fetchChats('active', activePage, setActiveChats, setLoadingActive);
    fetchChats('left', leftPage, setLeftChats, setLoadingLeft);
    fetchChats('unread', unreadPage, setUnreadChats, setLoadingUnread);

    const notificationsRef = ref(db, `notifications/${user_email_key}`);
    const notificationsListener = onValue(notificationsRef, (snapshot) => {
      const notificationsData = snapshot.val() || {};
      const notificationsByChatId = Object.values(notificationsData)
        .filter((n) => n.type === 'new_message')
        .reduce((acc, notification) => {
          acc[notification.chatId] = notification;
          return acc;
        }, {});

      setNotifications(notificationsByChatId);
    });

    return () => {
      off(notificationsRef, 'value', notificationsListener);
    };
  }, [db, user_email_key, user.email, activePage, leftPage, unreadPage]);

  const handleLoadMore = (tab) => {
    if (tab === 'active') {
      const nextPage = activePage + 1;
      setActivePage(nextPage);
      fetchChats('active', nextPage, setActiveChats, setLoadingActive);
    } else if (tab === 'left') {
      const nextPage = leftPage + 1;
      setLeftPage(nextPage);
      fetchChats('left', nextPage, setLeftChats, setLoadingLeft);
    } else if (tab === 'unread') {
      const nextPage = unreadPage + 1;
      setUnreadPage(nextPage);
      fetchChats('unread', nextPage, setUnreadChats, setLoadingUnread);
    }
  };

  const handleChatSelectInternal = (chat) => {
    console.log('Selecting chat:', chat);
    onChatSelect({
      isNew: false,
      chatId: chat.chatId,
      participants: chat.participantDetails,
      initialParticipants: chat.participantDetails,
      mode: 'full',
    });
  };

  const hasMoreActive = activeChats.length < totalActiveChats;
  const hasMoreLeft = leftChats.length < totalLeftChats;
  const hasMoreUnread = unreadChats.length < totalUnreadChats;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="space-y-3 px-3">
        {courseTeachers.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <UserCog className="h-4 w-4" />
              Course Teachers
            </h3>
            <ToggleGroup 
              type="multiple"
              value={selectedParticipants}
              onValueChange={setSelectedParticipants}
              className="bg-muted/30 p-1 gap-1"
            >
              {courseTeachers.map((teacher) => (
                <ToggleGroupItem
                  key={teacher}
                  value={teacher}
                  aria-label={`Select ${getDisplayName(teacher)}`}
                  className="text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:shadow-sm hover:bg-muted/50 hover:text-foreground transition-all duration-150"
                >
                  {getDisplayName(teacher)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {courseSupportStaff.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <UserCog className="h-4 w-4" />
              Support Staff
            </h3>
            <ToggleGroup 
              type="multiple"
              value={selectedParticipants}
              onValueChange={setSelectedParticipants}
              className="bg-muted/30 p-1 gap-1"
            >
              {courseSupportStaff.map((staff) => (
                <ToggleGroupItem
                  key={staff}
                  value={staff}
                  aria-label={`Select ${getDisplayName(staff)}`}
                  className="text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:shadow-sm hover:bg-muted/50hover:text-foreground transition-all duration-150"
                >
                  {getDisplayName(staff)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {selectedParticipants.length > 0 && (
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <MessageSquarePlus className="h-5 w-5" />
            Start New Chat with Selected Staff ({selectedParticipants.length})
          </button>
        )}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger 
            value="active" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            <InboxIcon className="w-4 h-4" />
            Active ({totalActiveChats})
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
          >
            <MessageSquare className="w-4 h-4" />
            Unread ({totalUnreadChats})
          </TabsTrigger>
          {totalLeftChats > 0 && (
            <TabsTrigger 
              value="left" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
            >
              <Archive className="w-4 h-4" />
              Left ({totalLeftChats})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="mt-3">
          <ScrollArea className="h-[500px] w-full rounded-md border p-3">
            {error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <ChatList
                chats={activeChats}
                loading={loadingActive}
                hasMore={hasMoreActive}
                onLoadMore={handleLoadMore}
                tab="active"
                onChatSelect={handleChatSelectInternal}
                notifications={notifications}
              />
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unread" className="mt-3">
          <ScrollArea className="h-[500px] w-full rounded-md border p-3">
            {error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <ChatList
                chats={unreadChats}
                loading={loadingUnread}
                hasMore={hasMoreUnread}
                onLoadMore={handleLoadMore}
                tab="unread"
                onChatSelect={handleChatSelectInternal}
                notifications={notifications}
              />
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="left" className="mt-3">
          <ScrollArea className="h-[500px] w-full rounded-md border p-3">
            {error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <ChatList
                chats={leftChats}
                loading={loadingLeft}
                hasMore={hasMoreLeft}
                onLoadMore={handleLoadMore}
                tab="left"
                onChatSelect={handleChatSelectInternal}
                notifications={notifications}
              />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatHistory;