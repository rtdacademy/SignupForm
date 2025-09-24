import React from 'react';
import { Badge } from '../../components/ui/badge';
import {
  MessageCircle,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const CommunicationBanner = ({
  parentMessages = { count: 0, unread: 0 },
  staffMessages = { count: 0, unread: 0 },
  lastMessage = null,
  onClick,
  isExpanded = false,
  className
}) => {
  const totalMessages = parentMessages.count + staffMessages.count;
  const totalUnread = parentMessages.unread + staffMessages.unread;
  const hasMessages = totalMessages > 0;
  const hasUnread = totalUnread > 0;
  const hasParentMessages = parentMessages.count > 0;
  const hasStaffMessages = staffMessages.count > 0;
  const hasBothRoles = hasParentMessages && hasStaffMessages;

  if (!hasMessages) {
    // Show subtle invitation to communicate
    return (
      <div
        onClick={onClick}
        className={cn(
          'w-full px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100',
          'border-b border-gray-200 cursor-pointer transition-all duration-300',
          'hover:from-blue-50 hover:to-green-50 hover:border-blue-200',
          'flex items-center justify-between group',
          className
        )}
      >
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MessageCircle className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
          <span className="group-hover:text-gray-700 transition-colors">
            Start a conversation with your facilitator
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    );
  }

  // Determine gradient and colors based on activity
  const getBannerGradient = () => {
    if (hasBothRoles) {
      if (hasUnread) {
        return 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500';
      }
      return 'bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400';
    } else if (hasParentMessages) {
      return hasUnread
        ? 'bg-gradient-to-r from-blue-500 to-sky-400'
        : 'bg-gradient-to-r from-blue-400 to-sky-300';
    } else if (hasStaffMessages) {
      return hasUnread
        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
        : 'bg-gradient-to-r from-emerald-400 to-teal-300';
    }
    return 'bg-gradient-to-r from-gray-400 to-gray-300';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full overflow-hidden cursor-pointer transition-all duration-500',
        'hover:shadow-md',
        isExpanded && 'shadow-lg',
        className
      )}
    >
      {/* Animated gradient background */}
      <div className={cn(
        'absolute inset-0',
        getBannerGradient(),
        hasUnread && 'animate-gradient-shift'
      )} />

      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative px-4 py-2.5 flex items-center justify-between">
        {/* Left side - Message counts and status */}
        <div className="flex items-center gap-4">
          {/* Icon with pulse effect */}
          <div className="relative">
            <div className={cn(
              'p-1.5 rounded-lg bg-white shadow-sm',
              hasUnread && 'ring-2 ring-offset-1',
              hasBothRoles ? 'ring-purple-400' : hasParentMessages ? 'ring-blue-400' : 'ring-green-400'
            )}>
              <MessageCircle className={cn(
                'w-5 h-5',
                hasBothRoles ? 'text-purple-600' : hasParentMessages ? 'text-blue-600' : 'text-green-600'
              )} />
            </div>
            {hasUnread && (
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 animate-spin-slow" />
            )}
          </div>

          {/* Message counts with role indicators */}
          <div className="flex items-center gap-3">
            {/* Parent messages */}
            {hasParentMessages && (
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                'bg-blue-100 border border-blue-200',
                parentMessages.unread > 0 && 'ring-2 ring-blue-300 ring-offset-1 animate-pulse-subtle'
              )}>
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {parentMessages.count}
                </span>
                {parentMessages.unread > 0 && (
                  <Badge className="bg-blue-600 text-white border-0 text-xs px-1 ml-1 animate-bounce">
                    {parentMessages.unread}
                  </Badge>
                )}
              </div>
            )}

            {/* Separator */}
            {hasBothRoles && (
              <div className="w-px h-6 bg-gray-300" />
            )}

            {/* Staff messages */}
            {hasStaffMessages && (
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                'bg-green-100 border border-green-200',
                staffMessages.unread > 0 && 'ring-2 ring-green-300 ring-offset-1 animate-pulse-subtle'
              )}>
                <GraduationCap className="w-3.5 h-3.5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {staffMessages.count}
                </span>
                {staffMessages.unread > 0 && (
                  <Badge className="bg-green-600 text-white border-0 text-xs px-1 ml-1 animate-bounce">
                    {staffMessages.unread}
                  </Badge>
                )}
              </div>
            )}

            {/* Status text */}
            <div className="flex items-center gap-2 text-sm">
              {hasUnread ? (
                <span className="font-medium text-gray-900">
                  {totalUnread} new {totalUnread === 1 ? 'message' : 'messages'}
                </span>
              ) : (
                <div className="flex items-center gap-1 text-gray-600">
                  <CheckCheck className="w-4 h-4 text-green-500" />
                  <span>All read</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Last message preview and action */}
        <div className="flex items-center gap-3">
          {/* Last message preview */}
          {lastMessage && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/80 rounded-lg border border-gray-200">
              <div className="flex items-center gap-1.5">
                {lastMessage.authorRole === 'facilitator' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Staff</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Parent</span>
                  </>
                )}
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <p className="text-xs text-gray-600 truncate max-w-[200px]">
                "{lastMessage.preview}"
              </p>
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(lastMessage.timestamp, { addSuffix: false })}
              </span>
            </div>
          )}

          {/* Open button */}
          <div className={cn(
            'px-3 py-1.5 rounded-lg font-medium text-sm',
            'bg-white shadow-sm border transition-all duration-300',
            'hover:shadow-md hover:scale-105',
            hasUnread
              ? 'border-purple-300 text-purple-700 hover:bg-purple-50'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          )}>
            <div className="flex items-center gap-1.5">
              <span>{hasUnread ? 'View Messages' : 'Open'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom highlight bar for unread messages */}
      {hasUnread && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0 h-1',
          getBannerGradient(),
          'animate-pulse'
        )} />
      )}
    </div>
  );
};

export default CommunicationBanner;