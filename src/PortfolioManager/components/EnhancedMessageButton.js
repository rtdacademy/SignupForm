import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  MessageCircle,
  MessageSquare,
  Users,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Clock,
  UserCircle,
  School
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const EnhancedMessageButton = ({
  parentMessages = { count: 0, unread: 0, lastAuthor: null },
  staffMessages = { count: 0, unread: 0, lastAuthor: null },
  lastMessage = null,
  onClick,
  variant = 'default',
  size = 'large',
  showPreview = true,
  className,
  orientation = 'horizontal' // 'horizontal' or 'vertical'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const totalMessages = parentMessages.count + staffMessages.count;
  const totalUnread = parentMessages.unread + staffMessages.unread;
  const hasMessages = totalMessages > 0;
  const hasUnread = totalUnread > 0;
  const hasParentMessages = parentMessages.count > 0;
  const hasStaffMessages = staffMessages.count > 0;
  const hasBothRoles = hasParentMessages && hasStaffMessages;

  // Determine the gradient based on who has messaged
  const getGradientClass = () => {
    if (hasBothRoles) {
      // Beautiful mixed gradient
      return 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500';
    } else if (hasParentMessages) {
      // Parent gradient
      return 'bg-gradient-to-r from-blue-500 to-sky-400';
    } else if (hasStaffMessages) {
      // Staff gradient
      return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    }
    // Default gradient
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  // Get background color based on activity
  const getBackgroundClass = () => {
    if (!hasMessages) return 'bg-gray-50 border-gray-200';
    if (hasBothRoles) return 'bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-purple-200';
    if (hasParentMessages) return 'bg-blue-50 border-blue-200';
    if (hasStaffMessages) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      badge: 'text-xs px-1.5 py-0.5'
    },
    default: {
      container: 'px-4 py-2.5',
      icon: 'w-5 h-5',
      badge: 'text-sm px-2 py-0.5'
    },
    large: {
      container: 'px-5 py-3',
      icon: 'w-6 h-6',
      badge: 'text-sm px-2 py-1'
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  if (orientation === 'vertical') {
    // Vertical layout for compact spaces
    return (
      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          'relative flex flex-col items-center gap-1 transition-all duration-300',
          hasUnread && 'animate-pulse-subtle',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className={cn(
            'p-2 rounded-full transition-all duration-300',
            getBackgroundClass(),
            isHovered && 'scale-110'
          )}>
            <MessageCircle className={cn(config.icon, hasMessages ? 'text-gray-700' : 'text-gray-400')} />
          </div>

          {hasUnread && (
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-3 w-3">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  hasBothRoles ? "bg-purple-400" : hasParentMessages ? "bg-blue-400" : "bg-green-400"
                )}></span>
                <span className={cn(
                  "relative inline-flex rounded-full h-3 w-3",
                  hasBothRoles ? "bg-purple-500" : hasParentMessages ? "bg-blue-500" : "bg-green-500"
                )}></span>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {hasParentMessages && (
            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
              {parentMessages.count}
            </Badge>
          )}
          {hasStaffMessages && (
            <Badge className="bg-green-100 text-green-700 border-0 text-xs">
              {staffMessages.count}
            </Badge>
          )}
        </div>
      </Button>
    );
  }

  // Horizontal layout (default)
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border-2 transition-all duration-300',
        getBackgroundClass(),
        hasUnread && 'shadow-lg shadow-blue-200/50',
        isHovered && 'transform scale-[1.01] shadow-lg',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      {hasMessages && (
        <div className={cn(
          'absolute inset-0 opacity-10 transition-opacity duration-300',
          getGradientClass(),
          isHovered && 'opacity-20'
        )} />
      )}

      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          'relative w-full h-full',
          config.container,
          'hover:bg-transparent'
        )}
      >
        <div className="flex items-center justify-between w-full gap-4">
          {/* Left side - Icon and Title */}
          <div className="flex items-center gap-3">
            {/* Animated icon container */}
            <div className={cn(
              'relative p-2 rounded-lg transition-all duration-300',
              hasMessages ? 'bg-white/80 backdrop-blur-sm' : 'bg-gray-100'
            )}>
              <MessageSquare className={cn(
                config.icon,
                hasMessages ? 'text-gray-700' : 'text-gray-400',
                isHovered && 'rotate-3'
              )} />
              {hasUnread && (
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 animate-pulse" />
              )}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-semibold',
                  hasMessages ? 'text-gray-900' : 'text-gray-500'
                )}>
                  Communication Hub
                </span>
                {hasUnread && (
                  <Badge className="bg-red-500 text-white border-0 text-xs px-1.5 animate-bounce">
                    {totalUnread} NEW
                  </Badge>
                )}
              </div>

              {/* Last message preview */}
              {showPreview && lastMessage && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {lastMessage.authorRole === 'facilitator' ? (
                    <School className="w-3 h-3 text-green-500" />
                  ) : (
                    <UserCircle className="w-3 h-3 text-blue-500" />
                  )}
                  <p className="text-xs text-gray-600 truncate max-w-[200px]">
                    {lastMessage.preview}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Message counts */}
          <div className="flex items-center gap-3">
            {/* Parent messages badge */}
            {hasParentMessages && (
              <div className={cn(
                'flex flex-col items-center px-3 py-1 rounded-lg transition-all duration-300',
                'bg-blue-100 border border-blue-200',
                parentMessages.unread > 0 && 'ring-2 ring-blue-400 ring-offset-1'
              )}>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Parent</span>
                </div>
                <span className={cn(
                  'text-lg font-bold',
                  parentMessages.unread > 0 ? 'text-blue-700' : 'text-blue-600'
                )}>
                  {parentMessages.count}
                  {parentMessages.unread > 0 && (
                    <span className="text-xs ml-1 text-blue-500">
                      (+{parentMessages.unread})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Staff messages badge */}
            {hasStaffMessages && (
              <div className={cn(
                'flex flex-col items-center px-3 py-1 rounded-lg transition-all duration-300',
                'bg-green-100 border border-green-200',
                staffMessages.unread > 0 && 'ring-2 ring-green-400 ring-offset-1'
              )}>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Staff</span>
                </div>
                <span className={cn(
                  'text-lg font-bold',
                  staffMessages.unread > 0 ? 'text-green-700' : 'text-green-600'
                )}>
                  {staffMessages.count}
                  {staffMessages.unread > 0 && (
                    <span className="text-xs ml-1 text-green-500">
                      (+{staffMessages.unread})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Open arrow */}
            <ChevronRight className={cn(
              'w-5 h-5 text-gray-400 transition-transform duration-300',
              isHovered && 'translate-x-1'
            )} />
          </div>
        </div>
      </Button>

      {/* Hover tooltip with more details */}
      {isHovered && lastMessage && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>{lastMessage.authorRole === 'facilitator' ? 'Staff' : 'Parent'}:</span>
              <span className="font-medium">{lastMessage.authorName}</span>
              <span className="text-gray-300">
                • {formatDistanceToNow(lastMessage.timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageButton;