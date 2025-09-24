import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  MessageCircle,
  Bell,
  User,
  UserCheck,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Inbox,
  Send,
  Archive,
  Star,
  Award,
  AlertCircle,
  Loader2,
  MessageSquare,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useCommunication } from '../hooks/useCommunication';
import NotificationBadge from './NotificationBadge';

/**
 * CommunicationDashboard - Overview of all portfolio communications
 *
 * @param {string} familyId - Family ID
 * @param {string} studentId - Student ID
 * @param {array} portfolioEntries - Array of all portfolio entries
 * @param {function} onNavigateToEntry - Callback to navigate to specific entry
 * @param {boolean} isStaff - Whether current user is staff/facilitator
 */
const CommunicationDashboard = ({
  familyId,
  studentId,
  portfolioEntries = [],
  onNavigateToEntry,
  isStaff = false
}) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesWithCommunication, setEntriesWithCommunication] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const {
    getUnreadEntries,
    getEntryCommunicationSummary,
    notifications
  } = useCommunication(familyId, studentId);

  // Load communication summaries for all entries
  useEffect(() => {
    const loadCommunicationData = async () => {
      if (!portfolioEntries.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get unread entries
        const unreadEntries = await getUnreadEntries();
        const unreadMap = {};
        unreadEntries.forEach(item => {
          unreadMap[item.entryId] = item.unreadCount;
        });

        // Load communication summaries for all entries
        const entriesWithData = await Promise.all(
          portfolioEntries.map(async (entry) => {
            const summary = await getEntryCommunicationSummary(entry.id);
            return {
              ...entry,
              communicationSummary: summary,
              unreadCount: unreadMap[entry.id] || 0
            };
          })
        );

        // Filter entries that have communication activity
        const activeEntries = entriesWithData.filter(
          entry => entry.communicationSummary?.hasActivity
        );

        setEntriesWithCommunication(activeEntries);
      } catch (error) {
        console.error('Error loading communication data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunicationData();
  }, [portfolioEntries, getUnreadEntries, getEntryCommunicationSummary]);

  // Filter entries based on tab and search
  const getFilteredEntries = () => {
    let filtered = entriesWithCommunication;

    // Tab filtering
    switch (selectedTab) {
      case 'unread':
        filtered = filtered.filter(e => e.unreadCount > 0);
        break;
      case 'scored':
        filtered = filtered.filter(e =>
          e.communicationSummary?.parentScore ||
          e.communicationSummary?.facilitatorScore
        );
        break;
      case 'parent':
        filtered = filtered.filter(e =>
          e.communicationSummary?.parentScore && !e.communicationSummary?.facilitatorScore
        );
        break;
      case 'facilitator':
        filtered = filtered.filter(e =>
          e.communicationSummary?.facilitatorScore
        );
        break;
    }

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.structureTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by most recent activity
    filtered.sort((a, b) => {
      const aTime = a.communicationSummary?.lastMessageAt?.toMillis?.() || 0;
      const bTime = b.communicationSummary?.lastMessageAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return filtered;
  };

  // Render entry card
  const renderEntryCard = (entry) => {
    const { communicationSummary, unreadCount } = entry;
    const hasParentScore = !!communicationSummary?.parentScore;
    const hasFacilitatorScore = !!communicationSummary?.facilitatorScore;

    return (
      <Card
        key={entry.id}
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
          unreadCount > 0 ? 'border-blue-300 bg-blue-50/50' : ''
        }`}
        onClick={() => onNavigateToEntry(entry)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Entry Title */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900">
                {entry.title || 'Untitled Entry'}
              </h3>
              {unreadCount > 0 && (
                <NotificationBadge
                  count={unreadCount}
                  size="sm"
                  pulse={true}
                />
              )}
            </div>

            {/* Collection/Structure */}
            {entry.structureTitle && (
              <p className="text-sm text-gray-500 mb-2">
                in {entry.structureTitle}
              </p>
            )}

            {/* Communication Stats */}
            <div className="flex items-center gap-4 text-sm">
              {/* Message Count */}
              <div className="flex items-center gap-1 text-gray-600">
                <MessageSquare className="w-3 h-3" />
                <span>{communicationSummary?.messageCount || 0} messages</span>
              </div>

              {/* Scores */}
              {(hasParentScore || hasFacilitatorScore) && (
                <div className="flex items-center gap-2">
                  {hasParentScore && (
                    <Badge variant="outline" className="text-xs">
                      P: {communicationSummary.parentScore.value}/{communicationSummary.parentScore.maxValue}
                    </Badge>
                  )}
                  {hasFacilitatorScore && (
                    <Badge variant="success" className="text-xs">
                      F: {communicationSummary.facilitatorScore.value}/{communicationSummary.facilitatorScore.maxValue}
                    </Badge>
                  )}
                </div>
              )}

              {/* Last Activity */}
              {communicationSummary?.lastMessageAt && (
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(
                    communicationSummary.lastMessageAt.toDate?.() ||
                    new Date(communicationSummary.lastMessageAt),
                    { addSuffix: true }
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Navigate Arrow */}
          <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
        </div>
      </Card>
    );
  };

  // Calculate stats
  const totalUnread = notifications?.unreadCount || 0;
  const totalWithScores = entriesWithCommunication.filter(e =>
    e.communicationSummary?.parentScore || e.communicationSummary?.facilitatorScore
  ).length;
  const needsFacilitatorReview = entriesWithCommunication.filter(e =>
    e.communicationSummary?.parentScore && !e.communicationSummary?.facilitatorScore
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Communication Dashboard</h2>
          {totalUnread > 0 && (
            <NotificationBadge
              count={totalUnread}
              size="md"
              showIcon={false}
              pulse={true}
            />
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-sm border rounded-md w-48"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Unread Messages</p>
              <p className="text-lg font-semibold">{totalUnread}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Entries with Scores</p>
              <p className="text-lg font-semibold">{totalWithScores}</p>
            </div>
          </div>
        </Card>

        {isStaff && (
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Needs Review</p>
                <p className="text-lg font-semibold">{needsFacilitatorReview}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="text-xs">
            All ({entriesWithCommunication.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="text-xs">
            Unread ({entriesWithCommunication.filter(e => e.unreadCount > 0).length})
          </TabsTrigger>
          <TabsTrigger value="scored" className="text-xs">
            Scored ({totalWithScores})
          </TabsTrigger>
          <TabsTrigger value="parent" className="text-xs">
            Parent ({entriesWithCommunication.filter(e =>
              e.communicationSummary?.parentScore
            ).length})
          </TabsTrigger>
          <TabsTrigger value="facilitator" className="text-xs">
            Facilitator ({entriesWithCommunication.filter(e =>
              e.communicationSummary?.facilitatorScore
            ).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : getFilteredEntries().length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {getFilteredEntries().map(renderEntryCard)}
              </div>
            </ScrollArea>
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No entries found</p>
              <p className="text-xs mt-1">
                {selectedTab === 'unread'
                  ? 'All messages have been read'
                  : 'No entries match the current filter'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationDashboard;