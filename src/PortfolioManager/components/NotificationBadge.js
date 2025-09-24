import React from 'react';
import { Badge } from '../../components/ui/badge';
import { MessageCircle, Bell } from 'lucide-react';

/**
 * NotificationBadge - Reusable component for showing unread message counts
 *
 * @param {number} count - Number of unread items
 * @param {string} variant - Visual style variant (default, destructive, success)
 * @param {boolean} pulse - Whether to show pulse animation
 * @param {string} size - Size of the badge (sm, md, lg)
 * @param {boolean} showIcon - Whether to show the message icon
 * @param {string} position - Position for absolute positioning (top-right, top-left, etc.)
 * @param {function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const NotificationBadge = ({
  count = 0,
  variant = 'destructive',
  pulse = true,
  size = 'sm',
  showIcon = false,
  position = null,
  onClick,
  className = '',
  type = 'message' // 'message' or 'bell'
}) => {
  // Don't render if count is 0
  if (count <= 0) return null;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0 min-w-[18px] h-[18px]',
    md: 'text-sm px-2 py-0.5 min-w-[22px] h-[22px]',
    lg: 'text-base px-2.5 py-1 min-w-[26px] h-[26px]'
  };

  // Position classes for absolute positioning
  const positionClasses = {
    'top-right': 'absolute -top-1 -right-1',
    'top-left': 'absolute -top-1 -left-1',
    'bottom-right': 'absolute -bottom-1 -right-1',
    'bottom-left': 'absolute -bottom-1 -left-1',
    'inline': 'inline-flex ml-2'
  };

  // Icon component
  const Icon = type === 'bell' ? Bell : MessageCircle;

  // Format count display (99+ for large numbers)
  const displayCount = count > 99 ? '99+' : count;

  const badgeContent = (
    <>
      {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />}
      <span className="font-semibold">{displayCount}</span>
    </>
  );

  return (
    <div
      className={`
        ${position ? positionClasses[position] : 'inline-flex'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <Badge
        variant={variant}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          ${pulse && count > 0 ? 'animate-pulse' : ''}
          transition-all duration-200
          ${onClick ? 'hover:scale-110' : ''}
        `}
      >
        {badgeContent}
      </Badge>

      {/* Optional ripple effect for new messages */}
      {pulse && count > 0 && (
        <span className="absolute flex h-full w-full">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        </span>
      )}
    </div>
  );
};

/**
 * NotificationDot - Simple dot indicator for unread items
 *
 * @param {boolean} show - Whether to show the dot
 * @param {string} color - Color of the dot
 * @param {string} size - Size of the dot
 * @param {boolean} pulse - Whether to show pulse animation
 * @param {string} position - Position for absolute positioning
 */
export const NotificationDot = ({
  show = false,
  color = 'red',
  size = 'sm',
  pulse = true,
  position = 'top-right'
}) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  const positionClasses = {
    'top-right': 'absolute -top-0.5 -right-0.5',
    'top-left': 'absolute -top-0.5 -left-0.5',
    'bottom-right': 'absolute -bottom-0.5 -right-0.5',
    'bottom-left': 'absolute -bottom-0.5 -left-0.5'
  };

  return (
    <div className={`${positionClasses[position]} ${pulse ? 'animate-pulse' : ''}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`} />
    </div>
  );
};

/**
 * NotificationIndicator - Inline text indicator for unread counts
 *
 * @param {number} count - Number of unread items
 * @param {string} label - Label text (e.g., "new messages")
 * @param {string} className - Additional CSS classes
 */
export const NotificationIndicator = ({
  count = 0,
  label = 'new',
  className = ''
}) => {
  if (count <= 0) return null;

  return (
    <span className={`text-xs text-gray-500 ${className}`}>
      {count} {label} {count === 1 ? '' : 's'}
    </span>
  );
};

export default NotificationBadge;