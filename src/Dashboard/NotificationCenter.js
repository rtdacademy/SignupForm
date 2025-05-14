import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { isImportantNotification, getCurrentDate, setMockDate, resetNotificationAcknowledgment } from '../utils/notificationFilterUtils';
import { 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  X, 
  FileQuestion, 
  RefreshCw, 
  BellDot,
  ClipboardList,
  CheckCircle2,
  Calendar,
  BookOpen,
  AlertCircle,
  History
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../lib/utils';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { COURSE_OPTIONS } from '../config/DropdownOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const NotificationIcon = ({ type, size = "h-5 w-5", repeatInterval = null }) => {
  // New consolidated notification system:
  // 1. 'notification' - Regular notification (can be one-time or recurring based on interval)
  // 2. 'survey' - Survey notification (can be one-time or recurring based on interval)
  
  // Handle legacy types for backward compatibility
  if (type === 'once' || type === 'recurring') {
    return type === 'once' 
      ? <BellDot className={`${size} text-amber-600`} />
      : <RefreshCw className={`${size} text-blue-600`} />;
  }
  
  if (type === 'weekly-survey') {
    return <Calendar className={`${size} text-green-600`} />;
  }
  
  // New consolidated types
  if (type === 'notification') {
    return repeatInterval 
      ? <RefreshCw className={`${size} text-blue-600`} /> 
      : <BellDot className={`${size} text-amber-600`} />;
  }
  
  if (type === 'survey') {
    return repeatInterval 
      ? <Calendar className={`${size} text-green-600`} /> 
      : <ClipboardList className={`${size} text-purple-600`} />;
  }
  
  // Default fallback
  return <Bell className={`${size} text-gray-600`} />;
};

const getNotificationStyle = (type, repeatInterval = null, notification = null) => {
  // Define style themes
  const oneTimeStyle = {
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    hoverBgColor: 'hover:bg-amber-100',
    textColor: 'text-amber-900',
    badgeColor: 'bg-amber-100 text-amber-700',
    iconBgColor: 'bg-amber-100'
  };
  
  const weeklyStyle = {
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    hoverBgColor: 'hover:bg-blue-100',
    textColor: 'text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-700',
    iconBgColor: 'bg-blue-100'
  };
  
  const customStyle = {
    borderColor: 'border-indigo-200',
    bgColor: 'bg-indigo-50',
    hoverBgColor: 'hover:bg-indigo-100',
    textColor: 'text-indigo-900',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    iconBgColor: 'bg-indigo-100'
  };
  
  const surveyStyle = {
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    hoverBgColor: 'hover:bg-purple-100',
    textColor: 'text-purple-900',
    badgeColor: 'bg-purple-100 text-purple-700',
    iconBgColor: 'bg-purple-100'
  };
  
  const weeklySurveyStyle = {
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    hoverBgColor: 'hover:bg-green-100',
    textColor: 'text-green-900',
    badgeColor: 'bg-green-100 text-green-700',
    iconBgColor: 'bg-green-100'
  };
  
  const customSurveyStyle = {
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50',
    hoverBgColor: 'hover:bg-teal-100',
    textColor: 'text-teal-900',
    badgeColor: 'bg-teal-100 text-teal-700',
    iconBgColor: 'bg-teal-100'
  };
  
  const defaultStyle = {
    borderColor: 'border-gray-200',
    bgColor: 'bg-gray-50',
    hoverBgColor: 'hover:bg-gray-100',
    textColor: 'text-gray-900',
    badgeColor: 'bg-gray-100 text-gray-700',
    iconBgColor: 'bg-gray-100'
  };

  // Check for displayConfig first if notification is provided
  if (notification) {
    const displayFrequency = notification.displayConfig?.frequency || 
      (notification.type === 'weekly-survey' ? 'weekly' : 
      (notification.renewalConfig?.method === 'day' ? 'weekly' : 
        notification.renewalConfig?.method === 'custom' ? 'custom' : 'one-time'));
    
    if (displayFrequency === 'one-time') {
      return notification.type === 'survey' ? surveyStyle : oneTimeStyle;
    } else if (displayFrequency === 'weekly') {
      return notification.type === 'survey' ? weeklySurveyStyle : weeklyStyle;
    } else if (displayFrequency === 'custom') {
      return notification.type === 'survey' ? customSurveyStyle : customStyle;
    }
  }

  // Legacy types for backward compatibility
  if (type === 'once') return oneTimeStyle;
  if (type === 'recurring') return weeklyStyle;
  if (type === 'survey' && !repeatInterval) return surveyStyle;
  if (type === 'weekly-survey' || (type === 'survey' && repeatInterval)) return weeklySurveyStyle;
  
  // New consolidated types
  if (type === 'notification') {
    return repeatInterval ? weeklyStyle : oneTimeStyle;
  }
  
  if (type === 'survey') {
    return repeatInterval ? weeklySurveyStyle : surveyStyle;
  }
  
  return defaultStyle;
};

// Helper function to get course info from COURSE_OPTIONS
const getCourseInfo = (courseId) => {
  // Convert courseId to number if it's a string
  const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
  return COURSE_OPTIONS.find(option => option.courseId === numericId);
};

// Using imported isImportantNotification function from notificationFilterUtils

const NotificationPreview = ({ notification, onClick, onDismiss, isRead }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Extract repeatInterval information - make sure we're properly detecting it
  // Determine if this notification repeats using comprehensive checks across all formats
  // Use strict boolean check (double bang) to ensure proper true/false conversion
  const hasRepeatInterval = !!notification.repeatInterval || 
                           !!notification.renewalConfig ||
                           notification.type === 'weekly-survey' || 
                           notification.type === 'recurring' ||
                           (notification.displayConfig && 
                            (notification.displayConfig.frequency === 'weekly' || 
                             notification.displayConfig.frequency === 'monthly' || 
                             notification.displayConfig.frequency === 'custom'));
  
  // For legacy weekly-survey type, use a default interval if not specified
  const repeatInterval = notification.repeatInterval || 
                        (notification.type === 'weekly-survey' ? { value: 1, unit: 'week' } : null);
  
  // Determine if this is a survey type (either new or legacy format)
  // Important: only consider it a survey if it's explicitly a survey type, not a regular notification
  const isSurveyType = notification.type === 'survey' || 
                       notification.type === 'weekly-survey';
                       
  // Define the getTypeDescription function before using it in debug logging
  // Generate a description of the notification type for display
  const getTypeDescription = () => {
    // Debugging in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('getTypeDescription for:', {
        id: notification.id,
        title: notification.title,
        type: notification.type,
        hasDisplayConfig: !!notification.displayConfig,
        displayFrequency: notification.displayConfig?.frequency,
        displayDayOfWeek: notification.displayConfig?.dayOfWeek,
        displayDates: notification.displayConfig?.dates,
        hasRenewalConfig: !!notification.renewalConfig,
        renewalMethod: notification.renewalConfig?.method,
        renewalDayOfWeek: notification.renewalConfig?.dayOfWeek,
        renewalDates: notification.renewalConfig?.dates,
        hasRepeatInterval: !!notification.repeatInterval
      });
    }

    // Get display frequency from notification properties, with strong prioritization
    // 1. Use displayConfig.frequency if available (new format)
    // 2. Use explicit type-based identification (weekly-survey)
    // 3. Use renewalConfig if available (transitional format)
    // 4. Check for repeatInterval (legacy format)
    // 5. Fall back to one-time as default
    const displayFrequency = 
      // New primary structure
      notification.displayConfig?.frequency || 
      // Type-based detection
      (notification.type === 'weekly-survey' ? 'weekly' : 
      // Legacy renewalConfig structure
      (notification.renewalConfig?.method === 'day' ? 'weekly' : 
       notification.renewalConfig?.method === 'custom' ? 'custom' : 
      // Legacy repeatInterval structure
      (notification.repeatInterval ? 
        (notification.repeatInterval.unit === 'day' ? 'weekly' : 
         notification.repeatInterval.unit === 'week' ? 'weekly' : 
         notification.repeatInterval.unit === 'month' ? 'monthly' : 'custom') :
      // Default fallback
      'one-time')));
    
    // Handle each display frequency type
    if (displayFrequency === 'one-time') {
      return notification.type === 'survey' ? 'One-time survey' : 'One-time notification';
    } 
    
    if (displayFrequency === 'weekly') {
      const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                      notification.renewalConfig?.dayOfWeek || 'monday';
      const dayCapitalized = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
      return notification.type === 'survey' ? 
        `Weekly survey (resets on ${dayCapitalized})` : 
        `Weekly notification (resets on ${dayCapitalized})`;
    }
    
    if (displayFrequency === 'custom') {
      // Count how many custom dates and show the next one
      const customDates = notification.displayConfig?.dates || notification.renewalConfig?.dates || [];
      const now = Date.now();
      const futureDates = customDates.filter(date => new Date(date).getTime() > now);
      const dateCount = customDates.length;
      
      if (futureDates.length > 0) {
        const nextDate = new Date(Math.min(...futureDates));
        const formattedDate = nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return notification.type === 'survey' ? 
          `Custom survey (${dateCount} dates, next: ${formattedDate})` : 
          `Custom notification (${dateCount} dates, next: ${formattedDate})`;
      } else {
        return notification.type === 'survey' ? 
          `Custom survey (${dateCount} dates)` : 
          `Custom notification (${dateCount} dates)`;
      }
    }
    
    // Simple labels based on the primary type and frequency
    // For clarity and consistency, use simpler labels based directly on the notification type
    
    if (notification.type === 'weekly-survey') {
      return 'Weekly Survey';
    }
    
    if (notification.type === 'survey') {
      // First check displayConfig (newer format)
      if (notification.displayConfig?.frequency === 'weekly') {
        return 'Weekly Survey';
      } else if (notification.displayConfig?.frequency === 'monthly') {
        return 'Monthly Survey';
      } else if (notification.displayConfig?.frequency === 'custom') {
        return 'Custom Survey';
      } 
      // Then check renewalConfig (transitional format)
      else if (notification.renewalConfig?.method === 'day') {
        return 'Weekly Survey';
      } else if (notification.renewalConfig?.method === 'custom') {
        return 'Custom Survey';
      } 
      // Default to one-time if no repeating configuration found
      else {
        return 'One-time Survey';
      }
    }
    
    if (notification.type === 'recurring') return 'Recurring Notification';
    if (notification.type === 'once') return 'One-time Notification';
    
    if (notification.type === 'notification') {
      // First check displayConfig (newer format)
      if (notification.displayConfig?.frequency === 'weekly') {
        return 'Weekly Notification';
      } else if (notification.displayConfig?.frequency === 'monthly') {
        return 'Monthly Notification';
      } else if (notification.displayConfig?.frequency === 'custom') {
        return 'Custom Notification';
      } 
      // Then check renewalConfig (transitional format)
      else if (notification.renewalConfig?.method === 'day') {
        return 'Weekly Notification';
      } else if (notification.renewalConfig?.method === 'custom') {
        return 'Custom Notification';
      } 
      // Default to one-time if no repeating configuration found
      else {
        return 'One-time Notification';
      }
    }
    
    return 'Notification';
  };

  // For debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Notification Preview Props:', {
      id: notification.id,
      title: notification.title,
      type: notification.type,
      hasRepeatInterval,
      repeatInterval,
      isSurveyType,
      typeDescription: getTypeDescription(),
      repeatIntervalValue: notification.repeatInterval ? notification.repeatInterval.value : 'not set',
      repeatIntervalUnit: notification.repeatInterval ? notification.repeatInterval.unit : 'not set',
      // Show exactly what the notification object contains for detailed debugging
      fullNotification: JSON.parse(JSON.stringify(notification))
    });

    // Specifically check for repeatInterval property
    console.log('RepeatInterval debugging:', {
      hasOwnProperty: notification.hasOwnProperty('repeatInterval'),
      directValue: notification.repeatInterval,
      typeofValue: typeof notification.repeatInterval,
      stringifiedValue: JSON.stringify(notification.repeatInterval)
    });
  }
  
  // Get style with interval info and full notification
  const style = getNotificationStyle(notification.type, repeatInterval, notification);
  
  // Check if notification is important
  const isImportant = isImportantNotification(notification);
  
  // Check if this is a completed survey
  const isSurveyCompleted = isSurveyType && notification.surveyCompleted;
  
  // Comprehensive check if this is a dismissible notification
  // Notifications should be dismissible if they're one-time notifications (not repeating)
  const isDismissible = notification.type === 'once' || 
                      (notification.type === 'notification' && !hasRepeatInterval) ||
                      (notification.displayConfig && notification.displayConfig.frequency === 'one-time');
  
  return (
    <div
      className={cn(
        "relative p-3 rounded-lg transition-all duration-200 cursor-pointer h-full",
        "border hover:shadow-md",
        isRead ? "bg-white border-gray-200" : 
          isImportant ? "bg-red-50 border-red-300 border-2 shadow-sm" : 
          `${style.bgColor} ${style.borderColor}`,
        isSurveyCompleted && "bg-gray-50 border-gray-200", // Subdued style for completed surveys
        isHovered && "scale-[1.02]",
        isImportant ? "hover:bg-red-100" : style.hoverBgColor
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(notification)}
    >
      {/* Only show dismiss button for one-time notifications that aren't surveys */}
      {isDismissible && !isSurveyType && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification);
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-2 mb-2">
          <div className={cn("p-1.5 rounded-lg flex-shrink-0", 
            isSurveyCompleted ? "bg-green-100" : style.iconBgColor)}>
            {isSurveyCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <NotificationIcon type={notification.type} size="h-4 w-4" repeatInterval={repeatInterval} />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h4 className={cn(
                "font-semibold text-sm line-clamp-1 pr-6",
                isSurveyCompleted ? "text-gray-700" : 
                isRead ? "text-gray-700" : style.textColor
              )}>
                {notification.title}
              </h4>
              {isImportant && (
                <span className="text-xs bg-red-100 text-red-700 font-medium px-1 py-0.5 rounded-full flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Important
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div 
          className="text-xs text-gray-600 line-clamp-2 mb-2 flex-grow"
          dangerouslySetInnerHTML={{ 
            __html: notification.content?.replace(/<[^>]*>/g, '').substring(0, 60) + '...' 
          }}
        />
        
        {/* Show notification type information */}
        <div className="text-xs text-gray-500 mb-2">
          {getTypeDescription()}
        </div>
        
        {/* Survey status indicators */}
        {isSurveyType && !isSurveyCompleted && (
          <div className="text-xs text-purple-600 font-medium flex items-center gap-1 mb-2">
            <FileQuestion className="h-3 w-3" />
            Survey pending
          </div>
        )}
        
        {isSurveyType && isSurveyCompleted && (
          <div className="text-xs text-green-600 font-medium flex items-center gap-1 mb-2">
            <CheckCircle2 className="h-3 w-3" />
            Survey completed {notification.surveyCompletedAt ? 
              `on ${new Date(notification.surveyCompletedAt).toLocaleDateString()}` : ''}
          </div>
        )}
        
        {/* Acknowledgment indicator for regular notifications */}
        {!isSurveyType && notification.hasAcknowledged && (
          <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mb-2">
            <CheckCircle2 className="h-3 w-3" />
            Acknowledged {notification.acknowledgedAt ? 
              `on ${new Date(notification.acknowledgedAt).toLocaleDateString()}` : ''}
          </div>
        )}
        
        {/* Course badges */}
        {notification.courses && notification.courses.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {notification.courses.map((course, index) => {
              const courseInfo = getCourseInfo(course.id);
              const CourseIcon = courseInfo?.icon || BookOpen;
              
              return (
                <span 
                  key={`${course.id}-${index}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: courseInfo?.color ? `${courseInfo.color}20` : '#E5E7EB',
                    color: courseInfo?.color || '#374151'
                  }}
                >
                  <CourseIcon className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">
                    {courseInfo?.label || course.title}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SurveyForm = ({ notification, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Since each survey is now specific to a single course, we just need that course's ID
  const courseId = notification.courses[0]?.id;
  
  // Initialize with default questions if none provided in notification
  const [surveyQuestions, setSurveyQuestions] = useState(() => {
    if (notification.surveyQuestions && notification.surveyQuestions.length > 0) {
      return notification.surveyQuestions;
    }
    
    // Use default questions if none provided
    return [
      {
        "id": "1746273438863",
        "options": [
          {
            "id": "1746273438863-1",
            "text": "fdsfds"
          },
          {
            "id": "1746273438863-2",
            "text": "fdsdfggfdfgd"
          }
        ],
        "question": "test question",
        "questionType": "multiple-choice"
      },
      {
        "id": "1746273454917",
        "question": "test question 2",
        "questionType": "text-input"
      }
    ];
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Pass the course ID directly since we now only have one course per survey notification
      await onSubmit(answers, [courseId]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display the relevant course information at the top of the form
  const courseInfo = notification.courses[0] ? 
    getCourseInfo(notification.courses[0].id) : null;
  const CourseIcon = courseInfo?.icon || BookOpen;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course information section */}
      {courseInfo && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CourseIcon className="h-5 w-5" style={{ color: courseInfo?.color || '#374151' }} />
            <span>Completing survey for: {courseInfo?.label || notification.courses[0].title}</span>
          </div>
        </div>
      )}
      
      {surveyQuestions.map((question, index) => (
        <div key={question.id} className="space-y-3">
          <Label className="text-base font-medium">
            {index + 1}. {question.question}
          </Label>
          
          {question.questionType === 'multiple-choice' ? (
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => setAnswers(prev => ({
                ...prev,
                [question.id]: value
              }))}
              className="space-y-2"
            >
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="font-normal">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [question.id]: e.target.value
              }))}
              placeholder="Type your answer here..."
              className="resize-none"
              rows={3}
            />
          )}
        </div>
      ))}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !courseId}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Survey'}
        </Button>
      </div>
    </form>
  );
};

// Dialog for all notifications
const NotificationDialog = ({ notification, isOpen, onClose, onSurveySubmit, onDismiss }) => {
  if (!notification) return null;
  
  // Debug notification in development
  if (process.env.NODE_ENV === 'development') {
    console.log('NotificationDialog Props:', {
      id: notification.id,
      title: notification.title,
      type: notification.type,
      repeatInterval: notification.repeatInterval, 
      hasRepeatIntervalDirectly: !!notification.repeatInterval,
      // Show exactly what the notification object contains for detailed debugging
      fullNotification: JSON.parse(JSON.stringify(notification)),
      hasOwnProperty: notification.hasOwnProperty('repeatInterval'),
      directValue: notification.repeatInterval,
      typeofValue: typeof notification.repeatInterval,
      stringifiedValue: JSON.stringify(notification.repeatInterval)
    });
  }
  
  // Extract repeatInterval information
  // Determine if this notification repeats using comprehensive checks across all formats
  // Use strict boolean check (double bang) to ensure proper true/false conversion
  const hasRepeatInterval = !!notification.repeatInterval || 
                           !!notification.renewalConfig ||
                           notification.type === 'weekly-survey' || 
                           notification.type === 'recurring' ||
                           (notification.displayConfig && 
                            (notification.displayConfig.frequency === 'weekly' || 
                             notification.displayConfig.frequency === 'monthly' || 
                             notification.displayConfig.frequency === 'custom'));
  
  // For legacy weekly-survey type, use a default interval if not specified
  const repeatInterval = notification.repeatInterval || 
                        (notification.type === 'weekly-survey' ? { value: 1, unit: 'week' } : null);
  
  // Determine if this is a survey type (either new or legacy format)
  // Important: only consider it a survey if it's explicitly a survey type, not a regular notification
  const isSurveyType = notification.type === 'survey' || 
                       notification.type === 'weekly-survey';

  const style = getNotificationStyle(notification.type, repeatInterval, notification);
  
  // Check if notification is important
  const isImportant = isImportantNotification(notification);
  
  // Check if this is a completed survey
  const isSurveyCompleted = isSurveyType && notification.surveyCompleted;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", 
        isImportant && "border-2 border-red-400",
        isSurveyCompleted && "border-2 border-green-200")}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", 
              isImportant ? "bg-red-100" : 
              isSurveyCompleted ? "bg-green-100" : style.iconBgColor)}>
              {isImportant ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : isSurveyCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <NotificationIcon type={notification.type} />
              )}
            </div>
            <div>
              <DialogTitle>
                {isImportant ? "Important: " : ""}
                {isSurveyCompleted ? 
                  notification.type === 'weekly-survey' ? "Completed Weekly Survey: " : "Completed Survey: " 
                  : ""}
                {notification.type === 'survey' || notification.type === 'weekly-survey' ? 
                  notification.title.split(' - ')[0] : // Remove course name for cleaner display
                  notification.title
                }
              </DialogTitle>
              {isImportant && (
                <p className="text-xs text-red-600 mt-1">This is an important notification from your instructor</p>
              )}
              {isSurveyCompleted && (
                <p className="text-xs text-green-600 mt-1">
                  Completed on {notification.surveyCompletedAt ? 
                    new Date(notification.surveyCompletedAt).toLocaleString() : 'an earlier date'}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Show course badges in dialog too */}
          {notification.courses && notification.courses.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {notification.courses.map((course, index) => {
                const courseInfo = getCourseInfo(course.id);
                const CourseIcon = courseInfo?.icon || BookOpen;
                
                return (
                  <span 
                    key={`${course.id}-${index}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: courseInfo?.color ? `${courseInfo.color}20` : '#E5E7EB',
                      color: courseInfo?.color || '#374151'
                    }}
                  >
                    <CourseIcon className="h-4 w-4" />
                    {courseInfo?.label || course.title}
                  </span>
                );
              })}
            </div>
          )}
          
          {(notification.type === 'survey' || notification.type === 'weekly-survey') && !notification.surveyCompleted ? (
            <div className="space-y-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Complete {notification.type === 'weekly-survey' ? 'Weekly Survey' : 'Survey'}</h3>
                {notification.type === 'weekly-survey' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">This is a weekly survey</p>
                        <p className="text-xs text-green-700">You will be asked to complete this survey regularly. Your feedback is valuable!</p>
                      </div>
                    </div>
                  </div>
                )}
                <SurveyForm
                  notification={notification}
                  onSubmit={onSurveySubmit}
                  onCancel={onClose}
                />
              </div>
            </div>
          ) : (notification.type === 'survey' || notification.type === 'weekly-survey') && notification.surveyCompleted ? (
            <div className="space-y-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />
              
              {/* Display completed survey responses */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Your {notification.type === 'weekly-survey' ? 'Weekly Survey' : 'Survey'} Responses</h3>
                {notification.type === 'weekly-survey' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">Weekly survey completed</p>
                        <p className="text-xs text-green-700">You'll be asked to complete this survey again in the future.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {(notification.surveyAnswers || 
                   (notification.courses?.[0]?.studentDashboardNotificationsResults && 
                    notification.notificationId && 
                    notification.courses[0].studentDashboardNotificationsResults[notification.notificationId]?.answers)) ? (
                    // Use direct answers or try to get them from the first course's results
                    Object.entries(
                      notification.surveyAnswers || 
                      notification.courses[0].studentDashboardNotificationsResults[notification.notificationId]?.answers
                    ).map(([questionId, answer]) => {
                      // Find the corresponding question
                      const question = notification.surveyQuestions?.find(q => q.id === questionId);
                      if (!question) return null;
                      
                      return (
                        <div key={questionId} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <p className="font-medium text-sm mb-1">{question.question}</p>
                          {question.questionType === 'multiple-choice' ? (
                            <div className="text-sm bg-white p-2 rounded border">
                              {question.options?.find(opt => opt.id === answer)?.text || answer}
                            </div>
                          ) : (
                            <div className="text-sm bg-white p-2 rounded border whitespace-pre-wrap">
                              {answer}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">Response details not available</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />
              
              {/* For acknowledged regular notifications, show acknowledgment status */}
              {notification.type === 'notification' && notification.hasAcknowledged && (
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Notification Acknowledged</p>
                        <p className="text-xs text-blue-700">
                          {notification.acknowledgedAt ? 
                            `Acknowledged on ${new Date(notification.acknowledgedAt).toLocaleString()}` : 
                            'This notification has been acknowledged'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* For recurring notifications, show repeat frequency */}
              {!!notification.repeatInterval && notification.type === 'notification' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Recurring Notification</p>
                        <p className="text-xs text-blue-700">
                          This notification repeats every {notification.repeatInterval.value} {notification.repeatInterval.unit}
                          {notification.repeatInterval.value !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* We never show the Acknowledge button for surveys or already acknowledged notifications */}
        {notification.type === 'notification' && 
          // Check global acknowledgment status
          !notification.hasAcknowledged && 
          // Check if this notification has been acknowledged in any associated course
          !(notification.courses && notification.courses.some(course => 
            course.studentDashboardNotificationsResults && 
            course.studentDashboardNotificationsResults[notification.originalNotificationId || notification.id]?.hasAcknowledged
          )) && (
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => {
                // Call onDismiss function that was passed as prop to properly mark as dismissed
                onDismiss(notification);
                onClose();
              }} 
              className={isImportant ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              Acknowledge
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Regular notification dialog now handles all notifications

const NotificationCenter = ({ courses, profile, markNotificationAsSeen, forceRefresh }) => {
  // Track if user has manually toggled the accordion
  const [userToggled, setUserToggled] = useState(false);
  // Start collapsed unless there are important notifications
  const [isExpanded, setIsExpanded] = useState(false);
  // State to control compact view
  const [isCompactView, setIsCompactView] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readNotifications, setReadNotifications] = useState(() => {
    const stored = localStorage.getItem(`read_notifications_${profile?.StudentEmail}`);
    return stored ? JSON.parse(stored) : {};
  });
  const { current_user_email_key } = useAuth();

  // State to track which tab is selected
  const [activeTab, setActiveTab] = useState("all");

  // Process notifications - create separate notifications for surveys per course
  const allNotifications = React.useMemo(() => {
    const result = [];
    
    // Debug each course's notifications
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 NOTIFICATION CENTER SETUP:', {
        courses: courses?.map(course => ({
          id: course.id,
          hasNotifications: !!course.notificationIds,
          visibleCount: course.notificationIds ? 
            Object.values(course.notificationIds).filter(n => n.shouldDisplay).length : 0,
          hasResults: !!course.studentDashboardNotificationsResults,
          acknowledgedCount: course.studentDashboardNotificationsResults ? 
            Object.keys(course.studentDashboardNotificationsResults).length : 0
        }))
      });
      
      // Debug the structure of notifications from all courses
      if (courses) {
        courses.forEach(course => {
          if (course.notificationIds) {
            Object.values(course.notificationIds).forEach(notification => {
              console.log('Raw notification object:', {
                id: notification.id,
                title: notification.title,
                type: notification.type,
                hasRepeatInterval: !!notification.repeatInterval,
                repeatInterval: notification.repeatInterval,
                directRepeatIntervalCheck: notification.repeatInterval ? true : false,
                objectKeys: Object.keys(notification)
              });
            });
          }
        });
      }
    }
    
    courses?.forEach(course => {
      if (course.notificationIds) {
        Object.values(course.notificationIds).forEach(notification => {
          // Debug each notification to see if important flag exists and repeatInterval property
          if (process.env.NODE_ENV === 'development') {
            console.log('Processing notification:', {
              id: notification.id,
              title: notification.title,
              type: notification.type,
              important: notification.important,
              Important: notification.Important,
              shouldDisplay: notification.shouldDisplay,
              // Add detailed debugging for repeatInterval
              hasRepeatInterval: !!notification.repeatInterval,
              repeatInterval: notification.repeatInterval,
              hasOwnRepeatIntervalProperty: notification.hasOwnProperty('repeatInterval'),
              objectKeys: Object.keys(notification)
            });
          }
          
          if (notification.shouldDisplay) {
            if (notification.type === 'survey') {
              // For surveys, create a unique notification for each course
              const courseTitle = course.courseDetails?.Title || course.title || `Course ${course.id}`;
              
              // Debug the notification object properties BEFORE copying
              if (process.env.NODE_ENV === 'development') {
                console.log(`Survey notification (PRE-COPY) ${notification.id}:`, {
                  hasDisplayConfig: !!notification.displayConfig,
                  displayConfig: notification.displayConfig,
                  displayConfigFrequency: notification.displayConfig?.frequency,
                  hasRenewalConfig: !!notification.renewalConfig,
                  renewalConfig: notification.renewalConfig,
                  renewalConfigMethod: notification.renewalConfig?.method,
                  keys: Object.keys(notification)
                });
              }
              
              // Create base notification object
              const newNotification = {
                // Make explicit property copies instead of using spread to ensure all properties are correctly preserved
                id: notification.id,
                title: `${notification.title} - ${courseTitle}`,
                content: notification.content,
                type: notification.type,
                active: notification.active,
                important: notification.important,
                Important: notification.Important,
                shouldDisplay: notification.shouldDisplay,
                surveyQuestions: notification.surveyQuestions,
                surveyCompleted: notification.surveyCompleted,
                
                // CRITICAL: Copy display configuration properties
                displayConfig: notification.displayConfig,
                renewalConfig: notification.renewalConfig,
                
                // Create a unique ID for this course-specific notification
                uniqueId: `${notification.id}_${course.id}`,
                // Original ID is still needed for backend operations
                originalNotificationId: notification.id,
                
                // Add single course to the courses array with notification results
                courses: [{
                  id: course.id,
                  title: courseTitle,
                  studentDashboardNotificationsResults: course.studentDashboardNotificationsResults
                }]
              };
              
              // Debug the new notification object to confirm properties were copied
              if (process.env.NODE_ENV === 'development') {
                console.log(`Survey notification (AFTER-COPY) ${newNotification.id}:`, {
                  hasDisplayConfig: !!newNotification.displayConfig,
                  displayConfig: newNotification.displayConfig,
                  displayConfigFrequency: newNotification.displayConfig?.frequency,
                  hasRenewalConfig: !!newNotification.renewalConfig,
                  renewalConfig: newNotification.renewalConfig,
                  renewalConfigMethod: newNotification.renewalConfig?.method,
                  keys: Object.keys(newNotification)
                });
              }
              
              // IMPORTANT: Explicitly copy the repeatInterval property if it exists
              // Preserve important properties
              if (notification.hasOwnProperty('repeatInterval')) {
                newNotification.repeatInterval = notification.repeatInterval;
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Preserved repeatInterval for survey ${notification.id}:`, notification.repeatInterval);
                }
              }
              
              // Preserve acknowledgment status if available
              if (notification.hasOwnProperty('hasAcknowledged')) {
                newNotification.hasAcknowledged = notification.hasAcknowledged;
              }
              
              if (notification.hasOwnProperty('acknowledgedAt')) {
                newNotification.acknowledgedAt = notification.acknowledgedAt;
              }
              
              result.push(newNotification);
            } else {
              // For non-survey notifications, find if we already have this notification
              const existingIndex = result.findIndex(n => n.id === notification.id);
              if (existingIndex === -1) {
                // First time seeing this notification, create it with courses array
                // Debug the notification object properties BEFORE copying
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Regular notification (PRE-COPY) ${notification.id}:`, {
                    hasDisplayConfig: !!notification.displayConfig,
                    displayConfig: notification.displayConfig,
                    displayConfigFrequency: notification.displayConfig?.frequency,
                    hasRenewalConfig: !!notification.renewalConfig,
                    renewalConfig: notification.renewalConfig,
                    renewalConfigMethod: notification.renewalConfig?.method,
                    keys: Object.keys(notification)
                  });
                }
                
                // Create base notification object with explicit property copies
                const newNotification = {
                  // Make explicit property copies instead of using spread to ensure all properties are correctly preserved
                  id: notification.id,
                  title: notification.title,
                  content: notification.content,
                  type: notification.type,
                  active: notification.active,
                  important: notification.important,
                  Important: notification.Important,
                  shouldDisplay: notification.shouldDisplay,
                  surveyQuestions: notification.surveyQuestions,
                  surveyCompleted: notification.surveyCompleted,
                  
                  // CRITICAL: Copy display configuration properties
                  displayConfig: notification.displayConfig,
                  renewalConfig: notification.renewalConfig,
                  
                  // Add consistency properties
                  uniqueId: notification.id,
                  originalNotificationId: notification.id,
                  
                  // Add course info with notification results
                  courses: [{
                    id: course.id,
                    title: course.courseDetails?.Title || course.title || `Course ${course.id}`,
                    studentDashboardNotificationsResults: course.studentDashboardNotificationsResults
                  }]
                };
                
                // Debug the new notification object to confirm properties were copied
                if (process.env.NODE_ENV === 'development') {
                  console.log(`Regular notification (AFTER-COPY) ${newNotification.id}:`, {
                    hasDisplayConfig: !!newNotification.displayConfig,
                    displayConfig: newNotification.displayConfig,
                    displayConfigFrequency: newNotification.displayConfig?.frequency,
                    hasRenewalConfig: !!newNotification.renewalConfig,
                    renewalConfig: newNotification.renewalConfig,
                    renewalConfigMethod: newNotification.renewalConfig?.method,
                    keys: Object.keys(newNotification)
                  });
                }
                
                // IMPORTANT: Explicitly copy the repeatInterval property if it exists
                // Preserve important properties
                if (notification.hasOwnProperty('repeatInterval')) {
                  newNotification.repeatInterval = notification.repeatInterval;
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Preserved repeatInterval for notification ${notification.id}:`, notification.repeatInterval);
                  }
                }
                
                // Preserve acknowledgment status if available
                if (notification.hasOwnProperty('hasAcknowledged')) {
                  newNotification.hasAcknowledged = notification.hasAcknowledged;
                }
                
                if (notification.hasOwnProperty('acknowledgedAt')) {
                  newNotification.acknowledgedAt = notification.acknowledgedAt;
                }
                
                result.push(newNotification);
              } else {
                // We've seen this notification before, add this course to its courses array
                const existingNotification = result[existingIndex];
                existingNotification.courses.push({
                  id: course.id,
                  title: course.courseDetails?.Title || course.title || `Course ${course.id}`,
                  studentDashboardNotificationsResults: course.studentDashboardNotificationsResults
                });
              }
            }
          }
        });
      }
    });
    
    // Log all notifications after processing
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 FINAL NOTIFICATIONS TO DISPLAY:', result.map(n => ({
        id: n.id,
        uniqueId: n.uniqueId,
        title: n.title,
        type: n.type,
        important: n.important,
        Important: n.Important,
        courses: n.courses.map(c => c.id),
        // Add detailed debugging for repeatInterval
        hasRepeatInterval: !!n.repeatInterval,
        repeatInterval: n.repeatInterval,
        hasOwnRepeatIntervalProperty: n.hasOwnProperty('repeatInterval'),
        typeDescription: n.type === 'survey' ? 
          (n.repeatInterval ? 'Repeating Survey' : 'One-time Survey') : 
          n.type === 'notification' ? 
            (n.repeatInterval ? 'Repeating Notification' : 'One-time Notification') : 
            n.type
      })));
    }
    
    return result;
  }, [courses]);

  // Build a helper to check if a notification should be renewed
  const shouldRenewNotification = (notification) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Checking renewal for notification ${notification.id}:`, {
        title: notification.title,
        type: notification.type,
        displayConfig: notification.displayConfig,
        renewalConfig: notification.renewalConfig
      });
    }
    
    // Get display frequency from notification properties
    const displayFrequency = 
      notification.displayConfig?.frequency || 
      (notification.type === 'weekly-survey' ? 'weekly' : 
      (notification.renewalConfig?.method === 'day' ? 'weekly' : 
       notification.renewalConfig?.method === 'custom' ? 'custom' : 'one-time'));
    
    // One-time notifications never renew
    if (displayFrequency === 'one-time') return false;
    
    // Weekly/recurring notifications should renew
    return true;
  };

  // Filter out dismissed one-time notifications and completed surveys that don't renew
  let activeNotifications = allNotifications.filter(notification => {
    // Filter out one-time notifications that have been dismissed
    if (notification.type === 'once' && readNotifications[notification.uniqueId]?.dismissed) {
      return false;
    }
    
    // For completed surveys, check if they should be renewed
    if ((notification.type === 'survey' || notification.type === 'weekly-survey') && notification.surveyCompleted) {
      return shouldRenewNotification(notification);
    }
    
    return true;
  });
  
  // Determine if there are any unread or important notifications that need attention
  const hasUnreadNotifications = activeNotifications.some(n => !readNotifications[n.uniqueId]?.read);
  
  // Check for important notifications
  const hasImportantNotifications = activeNotifications.some(n => isImportantNotification(n));
  
  // Check for incomplete surveys
  const hasIncompleteRequiredNotifications = activeNotifications.some(n => 
    ((n.type === 'survey' || n.type === 'weekly-survey') && !n.surveyCompleted)
  );
  
  // FOR TESTING: Force one notification to be important if we have any
  if (process.env.NODE_ENV === 'development' && activeNotifications.length > 0 && !activeNotifications.some(n => n.important === true)) {
    console.log('TESTING: Forcibly setting first notification as important');
    activeNotifications = activeNotifications.map((notification, index) => {
      if (index === 0) {
        return {
          ...notification,
          important: true,
          title: notification.title 
        };
      }
      return notification;
    });
  }
  
  // Add global test functions if not already added
  useEffect(() => {
    // Expose testing functions to window object
    if (!window.testNotifications) {
      window.testNotifications = {
        mockDate: (dateString) => {
          const newDate = dateString ? new Date(dateString) : null;
          const result = setMockDate(newDate);
          
          // After changing the date, force a refresh of the system
          setTimeout(() => {
            console.log("Date change triggered automatic refresh");
            
            // Use window.refreshStudentData first if available (direct database refresh)
            if (window.refreshStudentData) {
              console.log("Calling window.refreshStudentData...");
              window.refreshStudentData().then(() => {
                console.log("Database refresh completed");
              });
            }
            
            // Also call our local refresh
            if (window.testNotifications.refreshNotifications) {
              console.log("Calling window.testNotifications.refreshNotifications...");
              window.testNotifications.refreshNotifications();
            }
          }, 100);
          
          return result;
        },
        resetNotification: async (notificationId, email) => {
          if (!email && profile?.StudentEmail) {
            email = profile.StudentEmail;
          }
          if (!notificationId || !email) {
            console.error('Need both notificationId and email to reset notification');
            return false;
          }
          
          console.log(`Resetting notification ${notificationId} for email ${email}`);
          
          try {
            const result = await resetNotificationAcknowledgment(notificationId, email);
            console.log('Reset result:', result);
            return result;
          } catch (error) {
            console.error('Error in resetNotification:', error);
            return false;
          }
        },
        refreshNotifications: () => {
          // Create a browser event to signal a data refresh
          const refreshEvent = new CustomEvent('notification-refresh-needed');
          window.dispatchEvent(refreshEvent);
          
          // Also force a UI re-render by toggling state
          setIsCompactView(prevState => !prevState);
          setTimeout(() => setIsCompactView(prevState => !prevState), 100);
          console.log('Notifications refresh requested - dispatched refresh event');
        }
      };
      console.log('Notification testing functions added. Use window.testNotifications.mockDate() and window.testNotifications.resetNotification()');
    }
  }, [profile]);

  // Check for notifications status and update view accordingly
  useEffect(() => {
    // Only show compact view when there's nothing requiring attention
    const needsAttention = hasUnreadNotifications || hasImportantNotifications || hasIncompleteRequiredNotifications;
    
    // Set compact view state
    setIsCompactView(!needsAttention && !isExpanded);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 NOTIFICATION DISPLAY STATUS 🔔', {
        attention: {
          hasUnread: hasUnreadNotifications,
          hasImportant: hasImportantNotifications,
          hasIncompleteSurveys: hasIncompleteRequiredNotifications,
          needsAttention: needsAttention
        },
        display: {
          userToggled,
          isExpanded,
          isCompactView: !needsAttention && !isExpanded,
          visible: activeNotifications.length
        }
      });
    }
    
    // Always auto-expand if there are unacknowledged notifications, unless user manually collapsed it
    if (hasUnreadNotifications && !userToggled) {
      setIsExpanded(true);
      
      // If we have important notifications or incomplete surveys, highlight the appropriate tab
      if (hasImportantNotifications) {
        setActiveTab("important");
      } else if (hasIncompleteRequiredNotifications) {
        setActiveTab("surveys");
      }
    }
  }, [
    activeNotifications, 
    userToggled, 
    hasUnreadNotifications, 
    hasImportantNotifications, 
    hasIncompleteRequiredNotifications, 
    isExpanded
  ]);

  // Mark notification as read and store in localStorage
  const markAsRead = async (notification) => {
    const uniqueId = typeof notification === 'object' ? notification.uniqueId : notification;
    const notificationId = typeof notification === 'object' ? 
      (notification.originalNotificationId || notification.id) : notification;
    
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../utils/sanitizeEmail');
    
    setReadNotifications(prev => {
      const updated = {
        ...prev,
        [uniqueId]: { ...prev[uniqueId], read: true }
      };
      localStorage.setItem(`read_notifications_${profile?.StudentEmail}`, JSON.stringify(updated));
      return updated;
    });
    
    // Also update hasSeen status in Firebase
    if (profile?.StudentEmail && notificationId) {
      const db = getDatabase();
      // Use the proper sanitized email format with comma
      const sanitizedUserEmail = sanitizeEmail(current_user_email_key);
      const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
      
      // Get current timestamp
      const currentTimestamp = Date.now();
      const currentDate = new Date().toISOString();
      
      // If this is a notification object, get its properties
      let hasRepeatInterval = false;
      let isSurveyType = false;
      
      if (typeof notification === 'object') {
        // Extract repeatInterval information - check all possible ways to identify a repeating notification
        hasRepeatInterval = !!notification.repeatInterval || 
                           notification.type === 'weekly-survey' || 
                           notification.type === 'recurring' ||
                           notification.displayConfig?.frequency === 'weekly' ||
                           notification.displayConfig?.frequency === 'monthly' ||
                           notification.displayConfig?.frequency === 'custom' ||
                           notification.renewalConfig?.method === 'day' ||
                           notification.renewalConfig?.method === 'custom';
        
        // Determine if this is a survey type - only true for explicit survey types
        isSurveyType = notification.type === 'survey' || 
                       notification.type === 'weekly-survey';
      }
      
      // First try to get existing data so we don't overwrite survey results
      get(resultsRef).then(snapshot => {
        const existingData = snapshot.exists() ? snapshot.val() : {};
        
        // Base update data for any notification type
        let updateData = {
          ...existingData,
          hasSeen: true,
          hasSeenTimeStamp: currentDate,
          userEmail: profile?.StudentEmail
        };
        
        // For repeating notifications, handle differently to track interaction history
        if (hasRepeatInterval) {
          // Store with timestamp to keep historical record
          if (!updateData.submissions) {
            updateData.submissions = {};
          }
          
          // Record this view
          updateData.submissions[currentTimestamp] = {
            seen: true,
            seenAt: currentDate
          };
          
          // Update the lastSeen timestamp
          updateData.lastSeen = currentDate;
          
          // Also calculate next renewal date for weekly notifications (important for weekly renewal)
          if (typeof notification === 'object' && 
              (notification.displayConfig?.frequency === 'weekly' || 
               notification.renewalConfig?.method === 'day' || 
               notification.type === 'weekly-survey')) {
               
            // Get the target day of week (default to Monday if not specified)
            const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                            notification.renewalConfig?.dayOfWeek || 'monday';
              
            // Convert day name to day number (0-6, where 0 is Sunday)
            const dayMap = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1;
              
            // Start with today's date
            let nextRenewalDate = new Date();
              
            // Add days until we reach the target day of the week
            while (nextRenewalDate.getDay() !== targetDayNum) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
            }
              
            // If today is already the target day, add 7 days to get to next week
            if (nextRenewalDate.getDay() === new Date().getDay()) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
            }
              
            // Store the next renewal date
            updateData.nextRenewalDate = nextRenewalDate.toISOString();
            console.log(`Set next renewal date to ${updateData.nextRenewalDate} for ${dayOfWeek} in markAsRead`);
          }
        }
        
        // Update the record
        set(resultsRef, updateData).then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Notification marked as seen:', {
              notificationId,
              hasRepeatInterval,
              isSurveyType
            });
          }
        });
      }).catch(error => {
        console.error('Error updating notification seen status in Firebase:', error);
        
        // Fallback: create a new entry if get() fails
        let updateData = {
          hasSeen: true,
          hasSeenTimeStamp: currentDate,
          userEmail: profile?.StudentEmail
        };
        
        // For repeating notifications, initialize interaction history
        if (hasRepeatInterval) {
          updateData.submissions = {
            [currentTimestamp]: {
              seen: true,
              seenAt: currentDate
            }
          };
          updateData.lastSeen = currentDate;
          
          // Also calculate next renewal date for weekly notifications (important for weekly renewal)
          if (typeof notification === 'object' && 
              (notification.displayConfig?.frequency === 'weekly' || 
               notification.renewalConfig?.method === 'day' || 
               notification.type === 'weekly-survey')) {
               
            // Get the target day of week (default to Monday if not specified)
            const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                            notification.renewalConfig?.dayOfWeek || 'monday';
              
            // Convert day name to day number (0-6, where 0 is Sunday)
            const dayMap = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1;
              
            // Start with today's date
            let nextRenewalDate = new Date();
              
            // Add days until we reach the target day of the week
            while (nextRenewalDate.getDay() !== targetDayNum) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
            }
              
            // If today is already the target day, add 7 days to get to next week
            if (nextRenewalDate.getDay() === new Date().getDay()) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
            }
              
            // Store the next renewal date
            updateData.nextRenewalDate = nextRenewalDate.toISOString();
            console.log(`Set next renewal date to ${updateData.nextRenewalDate} for ${dayOfWeek} in markAsRead fallback`);
          }
        }
        
        set(resultsRef, updateData).catch(error => {
          console.error('Error updating notification seen status in Firebase (fallback):', error);
        });
      });
    }
    
    // Check if all notifications will be read after this one
    const allRead = activeNotifications.every(n => 
      n.uniqueId === uniqueId || readNotifications[n.uniqueId]?.read
    );
    
    // Check if all surveys will be completed
    const allSurveysCompleted = activeNotifications.every(n =>
      (n.type !== 'survey' && n.type !== 'weekly-survey') || 
      n.surveyCompleted ||
      n.uniqueId === uniqueId // Current notification being opened counts as addressed
    );
    
    // Check if all important notifications will be addressed
    const allImportantAddressed = activeNotifications.every(n =>
      !isImportantNotification(n) || 
      readNotifications[n.uniqueId]?.read ||
      n.uniqueId === uniqueId // Current notification being opened counts as addressed
    );
    
    // If everything is addressed, automatically switch to compact mode after a delay
    if (allRead && allSurveysCompleted && allImportantAddressed) {
      // Give user time to view the notification before switching to compact mode
      setTimeout(() => {
        if (!isExpanded) {
          setIsCompactView(true);
        }
      }, 1000);
    }
  };

  // Dismiss/acknowledge notification (for both one-time and repeating notifications)
  // This function has been simplified to apply acknowledgment to all courses at once
  const dismissNotification = async (notification) => {
    // Use the original ID for backend notification dismissal
    await markNotificationAsSeen(notification.originalNotificationId || notification.id);
    
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../utils/sanitizeEmail');
    
    // Update local storage to mark as dismissed
    setReadNotifications(prev => {
      const updated = {
        ...prev,
        [notification.uniqueId]: { ...prev[notification.uniqueId], dismissed: true }
      };
      localStorage.setItem(`read_notifications_${profile?.StudentEmail}`, JSON.stringify(updated));
      return updated;
    });
    
    // For all notification types, update the database with acknowledgment status
    if (profile?.StudentEmail) {
      const db = getDatabase();
      const notificationId = notification.originalNotificationId || notification.id;
      // Use the proper sanitized email format with comma
      const sanitizedUserEmail = sanitizeEmail(current_user_email_key);
      const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
      
      // Get current timestamp
      const currentTimestamp = Date.now();
      const currentDate = new Date().toISOString();
      
      // Extract repeatInterval information - check all possible ways to identify a repeating notification
      const hasRepeatInterval = !!notification.repeatInterval || 
                               notification.type === 'weekly-survey' || 
                               notification.type === 'recurring' ||
                               notification.displayConfig?.frequency === 'weekly' ||
                               notification.displayConfig?.frequency === 'monthly' ||
                               notification.displayConfig?.frequency === 'custom' ||
                               notification.renewalConfig?.method === 'day' ||
                               notification.renewalConfig?.method === 'custom';
      
      // Determine if this is a survey type - only true for explicit survey types
      const isSurveyType = notification.type === 'survey' || 
                          notification.type === 'weekly-survey';
      
      // First try to get existing data so we don't overwrite survey results
      get(resultsRef).then(snapshot => {
        const existingData = snapshot.exists() ? snapshot.val() : {};
        
        // Base update data for any notification type
        let updateData = {
          ...existingData,
          hasSeen: true,
          hasSeenTimeStamp: currentDate,
          hasAcknowledged: true,
          acknowledgedAt: currentDate,
          userEmail: profile?.StudentEmail
        };
        
        // For repeating notifications, handle differently to track interaction history
        if (hasRepeatInterval) {
          // Store with timestamp to keep historical record
          if (!updateData.submissions) {
            updateData.submissions = {};
          }
          
          // Record this acknowledgment
          updateData.submissions[currentTimestamp] = {
            seen: true,
            seenAt: currentDate,
            hasAcknowledged: true,
            acknowledgedAt: currentDate
          };
          
          // Update the lastSeen and lastAcknowledged timestamps
          updateData.lastSeen = currentDate;
          updateData.lastAcknowledged = currentDate;
          
          // Calculate and store the next renewal date for weekly notifications
          // This is CRITICAL for proper renewal
          if (notification.displayConfig?.frequency === 'weekly' || 
              notification.renewalConfig?.method === 'day' || 
              (notification.type === 'weekly-survey')) {
              
            // Get the target day of week (default to Monday if not specified)
            const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                            notification.renewalConfig?.dayOfWeek || 'monday';
              
            // Convert day name to day number (0-6, where 0 is Sunday)
            const dayMap = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1;
              
            // Start with today's date
            let nextRenewalDate = new Date();
              
            // Add days until we reach the target day of the week
            while (nextRenewalDate.getDay() !== targetDayNum) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
            }
              
            // If today is already the target day, add 7 days to get to next week
            if (nextRenewalDate.getDay() === new Date().getDay()) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
            }
              
            // Store the next renewal date
            updateData.nextRenewalDate = nextRenewalDate.toISOString();
            console.log(`📅 RENEWAL DATE: ${updateData.nextRenewalDate} (${dayOfWeek})`);
          }
        }
        
        // Update the record in central notification results
        set(resultsRef, updateData).then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔔 NOTIFICATION ACKNOWLEDGED ✅', {
              notificationId,
              type: notification.type,
              hasRepeatInterval,
              isSurveyType,
              nextRenewalDate: updateData.nextRenewalDate,
              storedInBothPlaces: true
            });
          }
          
          // Also store acknowledgment in each course-specific path
          if (notification.courses && Array.isArray(notification.courses)) {
            // Process each course to update its notification results
            notification.courses.forEach(course => {
              if (course.id) {
                // Create path to course-specific notification results
                const courseNotificationRef = ref(db, 
                  `students/${sanitizedUserEmail}/courses/${course.id}/studentDashboardNotificationsResults/${notificationId}`);
                
                // Get any existing course notification data
                get(courseNotificationRef).then(courseSnapshot => {
                  const courseData = courseSnapshot.exists() ? courseSnapshot.val() : {};
                  
                  // Create update data for the course-specific path
                  const courseUpdateData = {
                    ...courseData,
                    hasSeen: true,
                    hasSeenTimeStamp: currentDate,
                    hasAcknowledged: true,
                    acknowledgedAt: currentDate
                  };
                  
                  // Copy important fields from the main notification results
                  if (updateData.submissions) {
                    courseUpdateData.submissions = updateData.submissions;
                  }
                  if (updateData.nextRenewalDate) {
                    courseUpdateData.nextRenewalDate = updateData.nextRenewalDate;
                  }
                  if (updateData.lastSeen) {
                    courseUpdateData.lastSeen = updateData.lastSeen;
                  }
                  if (updateData.lastAcknowledged) {
                    courseUpdateData.lastAcknowledged = updateData.lastAcknowledged;
                  }
                  
                  // Update the course-specific notification record
                  set(courseNotificationRef, courseUpdateData).then(() => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`🔔 Course ${course.id}: Updated notification status for ${notificationId} ✅`);
                    }
                  }).catch(error => {
                    console.error(`Error updating course ${course.id} notification:`, error);
                  });
                }).catch(error => {
                  console.error(`Error getting course ${course.id} notification data:`, error);
                });
              }
            });
          }
        }).catch(error => {
          console.error('Error acknowledging notification:', error);
        });
      }).catch(error => {
        console.error('Error getting existing notification data:', error);
        
        // Fallback: create a new entry if get() fails
        let updateData = {
          hasSeen: true,
          hasSeenTimeStamp: currentDate,
          hasAcknowledged: true,
          acknowledgedAt: currentDate,
          userEmail: profile?.StudentEmail
        };
        
        // For repeating notifications, initialize interaction history
        if (hasRepeatInterval) {
          updateData.submissions = {
            [currentTimestamp]: {
              seen: true,
              seenAt: currentDate,
              hasAcknowledged: true,
              acknowledgedAt: currentDate
            }
          };
          updateData.lastSeen = currentDate;
          updateData.lastAcknowledged = currentDate;
          
          // Calculate and store the next renewal date for weekly notifications
          // This is CRITICAL for proper renewal
          if (notification.displayConfig?.frequency === 'weekly' || 
              notification.renewalConfig?.method === 'day' || 
              (notification.type === 'weekly-survey')) {
              
            // Get the target day of week (default to Monday if not specified)
            const dayOfWeek = notification.displayConfig?.dayOfWeek || 
                            notification.renewalConfig?.dayOfWeek || 'monday';
              
            // Convert day name to day number (0-6, where 0 is Sunday)
            const dayMap = {
              'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
              'thursday': 4, 'friday': 5, 'saturday': 6
            };
            const targetDayNum = dayMap[dayOfWeek.toLowerCase()] || 1;
              
            // Start with today's date
            let nextRenewalDate = new Date();
              
            // Add days until we reach the target day of the week
            while (nextRenewalDate.getDay() !== targetDayNum) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 1);
            }
              
            // If today is already the target day, add 7 days to get to next week
            if (nextRenewalDate.getDay() === new Date().getDay()) {
              nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
            }
              
            // Store the next renewal date
            updateData.nextRenewalDate = nextRenewalDate.toISOString();
            console.log(`Set next renewal date to ${updateData.nextRenewalDate} for ${dayOfWeek} (fallback path)`);
          }
        }
        
        set(resultsRef, updateData).then(() => {
          // Also store acknowledgment in each course-specific path (fallback path)
          if (notification.courses && Array.isArray(notification.courses)) {
            // Process each course to update its notification results
            notification.courses.forEach(course => {
              if (course.id) {
                // Create path to course-specific notification results
                const courseNotificationRef = ref(db, 
                  `students/${sanitizedUserEmail}/courses/${course.id}/studentDashboardNotificationsResults/${notificationId}`);
                
                // Create update data for the course-specific path
                const courseUpdateData = {
                  hasSeen: true,
                  hasSeenTimeStamp: currentDate,
                  hasAcknowledged: true,
                  acknowledgedAt: currentDate
                };
                
                // Copy important fields from the main notification results
                if (updateData.submissions) {
                  courseUpdateData.submissions = updateData.submissions;
                }
                if (updateData.nextRenewalDate) {
                  courseUpdateData.nextRenewalDate = updateData.nextRenewalDate;
                }
                if (updateData.lastSeen) {
                  courseUpdateData.lastSeen = updateData.lastSeen;
                }
                if (updateData.lastAcknowledged) {
                  courseUpdateData.lastAcknowledged = updateData.lastAcknowledged;
                }
                
                // Update the course-specific notification record
                set(courseNotificationRef, courseUpdateData).catch(error => {
                  console.error(`Error updating course ${course.id} notification (fallback):`, error);
                });
              }
            });
          }
        }).catch(error => {
          console.error('Error acknowledging notification (fallback):', error);
        });
      });
    }
  };

  // Handle survey submission
  const handleSurveySubmit = async (answers, selectedCourseIds) => {
    if (!selectedNotification || !current_user_email_key || !selectedCourseIds || selectedCourseIds.length === 0) return;

    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../utils/sanitizeEmail');
    
    const db = getDatabase();
    
    try {
      // Get the original notification ID for database storage
      const notificationId = selectedNotification.originalNotificationId || selectedNotification.id;
      
      // In our new model, each survey notification already has exactly one course
      const selectedCourse = selectedNotification.courses[0];
      
      // Create data object with student info and selected course ID
      const surveyData = {
        notificationId: notificationId,
        courses: [selectedCourse],
        answers,
        submittedAt: new Date().toISOString(),
        studentEmail: profile?.StudentEmail,
        studentName: `${profile?.firstName} ${profile?.lastName}`,
        hasSeen: true,
        hasSeenTimeStamp: new Date().toISOString(),
        // Add acknowledgment fields automatically when completing the survey
        hasAcknowledged: true,
        acknowledgedAt: new Date().toISOString()
      };
      
      // Generate a timestamp for this submission
      const timestamp = Date.now();
      
      // Store results in a hierarchical structure that maintains security permissions
      // Format: /surveyResponses/{notificationId}/{timestamp}/{userEmailKey}/
      const sanitizedUserEmail = sanitizeEmail(current_user_email_key); 
      const newSurveyRef = ref(db, `surveyResponses/${notificationId}/${timestamp}/${sanitizedUserEmail}`);
      
      await set(newSurveyRef, {
        answers,
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        hasSeen: true,
        hasSeenTimeStamp: new Date().toISOString(),
        hasAcknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        notificationId,
        studentEmail: profile?.StudentEmail,
        studentName: `${profile?.firstName} ${profile?.lastName}`,
        submittedAt: new Date().toISOString(),
        timestamp
      });
      
      // Legacy location for backward compatibility 
      const legacySurveyRef = ref(db, `surveyResponses/${sanitizedUserEmail}/notifications/${notificationId}`);
      await set(legacySurveyRef, surveyData);
      
      // Create a hierarchical structure for studentDashboardNotificationsResults
      // Format: /studentDashboardNotificationsResults/{notificationId}/{timestamp}/{userEmailKey}/
      const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${timestamp}/${sanitizedUserEmail}`);
      
      // Store in hierarchical structure for better filtering while maintaining security
      await set(resultsRef, {
        answers,
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        completed: true,
        completedAt: new Date().toISOString(),
        email: profile?.StudentEmail,
        hasSeen: true,
        hasSeenTimeStamp: new Date().toISOString(),
        hasAcknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        latestSubmission: true, // Flag to identify most recent submission
        notificationId,
        studentEmail: profile?.StudentEmail,
        studentName: `${profile?.firstName} ${profile?.lastName}`,
        submittedAt: new Date().toISOString(),
        timestamp,
        displayFrequency: selectedNotification.displayConfig?.frequency || 'one-time'
      });
      
      // Also maintain backward compatibility structure
      const legacyResultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
      
      // First fetch existing data to preserve submission history
      const legacySnapshot = await get(legacyResultsRef);
      const existingData = legacySnapshot.exists() ? legacySnapshot.val() : {};
      
      // Prepare the update
      await set(legacyResultsRef, {
        ...existingData,
        ...surveyData,
        courseIds: [selectedCourse.id],
        email: profile?.StudentEmail,
        completed: true,
        completedAt: new Date().toISOString(),
        hasAcknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        // Store a reference to the hierarchical structure entry 
        latestSubmissionPath: `${notificationId}/${timestamp}/${sanitizedUserEmail}`,
        // Ensure we have a submissions object with the timestamp entry
        submissions: {
          ...(existingData.submissions || {}),
          [timestamp]: {
            answers,
            submittedAt: new Date().toISOString(),
            courseIds: [selectedCourse.id],
            courses: [selectedCourse],
            hasAcknowledged: true,
            acknowledgedAt: new Date().toISOString()
          }
        },
        // Update lastSubmitted and lastAcknowledged timestamps
        lastSubmitted: new Date().toISOString(),
        lastAcknowledged: new Date().toISOString()
      });
      
      // Also store the result in the course record for real-time updates
      const courseResultsRef = ref(db, `students/${sanitizedUserEmail}/courses/${selectedCourse.id}/studentDashboardNotificationsResults/${notificationId}`);
      await set(courseResultsRef, {
        completed: true,
        completedAt: new Date().toISOString(),
        answers, // Store answers directly in the format provided
        hasSeen: true,
        hasSeenTimeStamp: new Date().toISOString(),
        hasAcknowledged: true,
        acknowledgedAt: new Date().toISOString(),
        // Reference to the hierarchical structure path
        latestSubmissionPath: `${notificationId}/${timestamp}/${sanitizedUserEmail}`
      });

      // Process categories from answers
      // For each multiple-choice answer, check if the selected option has a category assigned
      if (selectedNotification.surveyQuestions && selectedNotification.surveyQuestions.length > 0) {
        const categoryUpdates = [];
        
        // Loop through each answer to check for categories
        for (const [questionId, answerId] of Object.entries(answers)) {
          // Find the corresponding question
          const question = selectedNotification.surveyQuestions.find(q => q.id === questionId);
          
          // Skip if question not found or not a multiple-choice question
          if (!question || question.questionType !== 'multiple-choice') continue;
          
          // Find the selected option
          const selectedOption = question.options.find(opt => opt.id === answerId);
          
          // Check if the option has a category
          if (selectedOption && selectedOption.category && selectedOption.category !== 'none') {
            // Get the category details
            const categoryId = selectedOption.category;
            
            // Extract teacher email key from the option's category path - this is more complex
            // We need to find which teacher owns this category by examining the 
            // notification's conditions which has the teacher email key in the format:
            // { "kyle@rtdacademy,com": ["1746563182275"] }
            let teacherEmailKey = null;
            
            // Check each condition for categories
            if (selectedNotification.conditions && selectedNotification.conditions.categories) {
              for (const teacherCat of selectedNotification.conditions.categories) {
                // Get the teacher email
                const key = Object.keys(teacherCat)[0];
                // Get the categories for this teacher
                const categories = teacherCat[key] || [];
                
                // If this teacher has the category, use this teacher
                if (categories.includes(categoryId)) {
                  teacherEmailKey = key;
                  break;
                }
              }
            }
            
            // If we couldn't find the teacher, try to use the first teacher or the default
            if (!teacherEmailKey && selectedNotification.conditions && selectedNotification.conditions.categories && 
                selectedNotification.conditions.categories.length > 0) {
              teacherEmailKey = Object.keys(selectedNotification.conditions.categories[0])[0];
            }
            
            // Now check if there's a staffKey directly on the selectedOption
            let staffKey = selectedOption.staffKey || teacherEmailKey;
            
            // If we have a staff key and category, add to updates
            if (staffKey && staffKey !== 'none') {
              const categoryPath = `students/${sanitizedUserEmail}/courses/${selectedCourse.id}/categories/${staffKey}/${categoryId}`;
              categoryUpdates.push({ path: categoryPath, value: true });
            }
          }
        }
        
        // Apply all category updates if we have any
        if (categoryUpdates.length > 0) {
          // Convert the updates array to an object for update() function
          const updateObj = {};
          for (const updateItem of categoryUpdates) {
            updateObj[updateItem.path] = updateItem.value;
          }
          
          // Use update instead of set to avoid overwriting other categories
          await update(ref(db), updateObj);
          console.log(`Added ${categoryUpdates.length} categories to student using update()`);
        }
      }

      // Close dialog and refresh notifications
      setSelectedNotification(null);
      markAsRead(selectedNotification);
      
      // Also mark as dismissed/acknowledged since we've added the acknowledgment fields
      dismissNotification(selectedNotification);
      
      // Show success message
      toast?.success?.('Survey submitted successfully') || alert('Survey submitted successfully');
      
      // Check if all notifications are now addressed after this survey submission
      const allSurveysCompleted = activeNotifications.every(n =>
        (n.type !== 'survey' && n.type !== 'weekly-survey') || 
        n.surveyCompleted ||
        (n.uniqueId === selectedNotification.uniqueId) // Count current notification as completed
      );
      
      const allNotificationsRead = activeNotifications.every(n => 
        readNotifications[n.uniqueId]?.read || (n.uniqueId === selectedNotification.uniqueId)
      );
      
      const allImportantAddressed = activeNotifications.every(n =>
        !isImportantNotification(n) || 
        readNotifications[n.uniqueId]?.read ||
        (n.uniqueId === selectedNotification.uniqueId)
      );
      
      // If there are no more items requiring attention, switch to compact view
      if (allSurveysCompleted && allNotificationsRead && allImportantAddressed) {
        setTimeout(() => {
          setIsCompactView(true);
        }, 1500); // Slightly longer delay to ensure notification state has updated
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast?.error?.('Failed to submit survey. Please try again.') || alert('Failed to submit survey. Please try again.');
    }
  };

  // Debug only in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Rendering NotificationCenter with:', {
      totalNotifications: allNotifications.length,
      activeNotifications: activeNotifications.length
    });
  }
  
  // Always show the notification center, even when there are no active notifications
  // This allows students to see their notification history

  // Compact view for when all notifications are read and acknowledged
  if (isCompactView) {
    return (
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50"
          onClick={() => {
            setUserToggled(true);
            setIsExpanded(true);
            setIsCompactView(false);
          }}
        >
          <div className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {activeNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-gray-400 rounded-full" />
            )}
          </div>
          <span className="text-sm font-medium">Notifications ({activeNotifications.length})</span>
        </Button>
      </div>
    );
  }

  // Full expanded view
  return (
    <Card className="mb-6 shadow-lg border-t-4 border-t-blue-500">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => {
          setUserToggled(true); // Mark that user has manually toggled
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-blue-600" />
            {(hasUnreadNotifications || hasImportantNotifications || hasIncompleteRequiredNotifications) && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Notifications
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({activeNotifications.length})
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsCompactView(true);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation(); // Stop propagation to prevent double toggle
              setUserToggled(true); // Mark that user has manually toggled
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>All ({activeNotifications.length})</span>
              </TabsTrigger>
              <TabsTrigger value="important" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Important ({activeNotifications.filter(n => isImportantNotification(n)).length})</span>
              </TabsTrigger>
              <TabsTrigger value="surveys" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>Surveys ({activeNotifications.filter(n => n.type === 'survey' || n.type === 'weekly-survey').length})</span>
              </TabsTrigger>
              <TabsTrigger value="acknowledged" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeNotifications.map((notification, index) => (
                  <NotificationPreview
                    key={`${notification.id}-${index}`}
                    notification={notification}
                    onClick={(notification) => {
                      setSelectedNotification(notification);
                      markAsRead(notification);
                    }}
                    onDismiss={dismissNotification}
                    isRead={readNotifications[notification.uniqueId]?.read}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="important" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeNotifications
                  .filter(n => isImportantNotification(n))
                  .map((notification, index) => (
                    <NotificationPreview
                      key={`important-${notification.id}-${index}`}
                      notification={notification}
                      onClick={(notification) => {
                        setSelectedNotification(notification);
                        markAsRead(notification);
                      }}
                      onDismiss={dismissNotification}
                      isRead={readNotifications[notification.uniqueId]?.read}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="surveys" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeNotifications
                  .filter(n => n.type === 'survey' || n.type === 'weekly-survey')
                  .map((notification, index) => (
                    <NotificationPreview
                      key={`survey-${notification.id}-${index}`}
                      notification={notification}
                      onClick={(notification) => {
                        setSelectedNotification(notification);
                        markAsRead(notification);
                      }}
                      onDismiss={dismissNotification}
                      isRead={readNotifications[notification.uniqueId]?.read}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="acknowledged" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allNotifications
                  .filter(n => 
                    (n.hasAcknowledged || readNotifications[n.uniqueId]?.read) &&
                    !activeNotifications.some(a => a.uniqueId === n.uniqueId)
                  )
                  .map((notification, index) => (
                    <NotificationPreview
                      key={`read-${notification.id}-${index}`}
                      notification={notification}
                      onClick={(notification) => {
                        setSelectedNotification(notification);
                      }}
                      onDismiss={() => {}} // No dismiss for already acknowledged
                      isRead={true}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}

      {/* Notification dialog */}
      <NotificationDialog
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onSurveySubmit={handleSurveySubmit}
        onDismiss={dismissNotification}
      />
    </Card>
  );
};

export default NotificationCenter;