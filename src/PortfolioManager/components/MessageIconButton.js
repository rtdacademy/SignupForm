import React from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

const MessageIconButton = ({
  unreadCount = 0,
  onClick,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  labelText = 'Messages',
  pulse = true,
  className,
  iconSize = 'default' // 'small', 'default', 'large'
}) => {
  const hasUnread = unreadCount > 0;

  // Icon size mappings
  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const iconClass = iconSizes[iconSize] || iconSizes.default;

  // Format count display (99+ for large numbers)
  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        'relative group transition-all duration-200',
        hasUnread && 'hover:bg-blue-50',
        className
      )}
    >
      <div className="relative">
        <MessageCircle
          className={cn(
            iconClass,
            hasUnread ? 'text-blue-600' : 'text-gray-600',
            'group-hover:scale-110 transition-transform duration-200'
          )}
        />

        {/* Notification badge */}
        {hasUnread && (
          <>
            {/* Pulse animation layer */}
            {pulse && (
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>
            )}

            {/* Count badge */}
            <div className="absolute -top-2 -right-2 pointer-events-none">
              <Badge
                className="h-5 min-w-[20px] px-1 bg-blue-600 text-white border-0 text-xs font-bold animate-in zoom-in-50 duration-200"
              >
                {displayCount}
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Optional label */}
      {showLabel && (
        <span className={cn(
          'ml-2',
          hasUnread ? 'text-blue-600 font-medium' : 'text-gray-600'
        )}>
          {labelText}
          {hasUnread && ` (${displayCount})`}
        </span>
      )}
    </Button>
  );
};

export default MessageIconButton;