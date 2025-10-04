// src/Website/components/StudentTypeMessage.js
import React from 'react';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

/**
 * StudentTypeMessage Component
 * Displays student-type-specific messages for calendar events
 * Shows different content based on whether the event applies to the student type
 * and whether the deadline has passed
 */
const StudentTypeMessage = ({ type, label, message, eventDate }) => {
  const navigate = useNavigate();

  if (!message) return null;

  const { applies, message: mainMessage, afterDeadline, whatThisMeans, learnMoreLink, learnMoreText, importance } = message;

  // Check if event date has passed
  const today = new Date();
  const hasPassed = eventDate < today;

  // Show afterDeadline content only if the deadline has passed and it exists
  const showAfterDeadline = hasPassed && afterDeadline;

  // Determine icon and styling based on applies and importance
  const getIcon = () => {
    if (applies) {
      if (importance === 'critical') {
        return <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />;
      }
      return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
    }
    return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
  };

  const getBgColor = () => {
    if (applies) {
      if (importance === 'critical') return 'bg-orange-50 border-orange-200';
      return 'bg-green-50 border-green-200';
    }
    return 'bg-blue-50 border-blue-200';
  };

  const getHeaderColor = () => {
    if (applies) {
      if (importance === 'critical') return 'text-orange-700';
      return 'text-green-700';
    }
    return 'text-blue-700';
  };

  const handleLearnMore = () => {
    if (learnMoreLink) {
      navigate(learnMoreLink);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-2">
          {/* Student Type Label */}
          <div className="flex items-center justify-between">
            <h5 className={`font-semibold text-sm ${getHeaderColor()}`}>
              {label}
            </h5>
            {applies ? (
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                Applies to you
              </span>
            ) : (
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                For your info
              </span>
            )}
          </div>

          {/* Main Message */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {mainMessage}
          </p>

          {/* What This Means (context) */}
          {whatThisMeans && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium">What this means: </span>
                {whatThisMeans}
              </p>
            </div>
          )}

          {/* After Deadline - What You Can Do */}
          {showAfterDeadline && (
            <div className="pt-2 border-t border-gray-200">
              <div className="bg-white rounded-md p-3 border border-teal-200">
                <p className="text-sm font-medium text-teal-700 mb-1">
                  What You Can Do:
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {afterDeadline.canDo}
                </p>
                {afterDeadline.learnMoreLink && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate(afterDeadline.learnMoreLink)}
                    className="px-0 h-auto mt-2 text-teal-600 hover:text-teal-700"
                  >
                    {afterDeadline.learnMoreText || 'Learn more'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Learn More Link */}
          {learnMoreLink && !showAfterDeadline && (
            <div className="pt-1">
              <Button
                variant="link"
                size="sm"
                onClick={handleLearnMore}
                className="px-0 h-auto text-sm"
              >
                {learnMoreText || 'Learn more →'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTypeMessage;
