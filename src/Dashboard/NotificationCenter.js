import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
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
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../lib/utils';
import { getDatabase, ref, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { COURSE_OPTIONS } from '../config/DropdownOptions';

const NotificationIcon = ({ type, size = "h-5 w-5" }) => {
  switch (type) {
    case 'survey':
      return <ClipboardList className={`${size} text-purple-600`} />;
    case 'recurring':
      return <RefreshCw className={`${size} text-blue-600`} />;
    case 'once':
      return <BellDot className={`${size} text-amber-600`} />;
    default:
      return <Bell className={`${size} text-gray-600`} />;
  }
};

const getNotificationStyle = (type) => {
  switch (type) {
    case 'survey':
      return {
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50',
        hoverBgColor: 'hover:bg-purple-100',
        textColor: 'text-purple-900',
        badgeColor: 'bg-purple-100 text-purple-700',
        iconBgColor: 'bg-purple-100'
      };
    case 'recurring':
      return {
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50',
        hoverBgColor: 'hover:bg-blue-100',
        textColor: 'text-blue-900',
        badgeColor: 'bg-blue-100 text-blue-700',
        iconBgColor: 'bg-blue-100'
      };
    case 'once':
      return {
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50',
        hoverBgColor: 'hover:bg-amber-100',
        textColor: 'text-amber-900',
        badgeColor: 'bg-amber-100 text-amber-700',
        iconBgColor: 'bg-amber-100'
      };
    default:
      return {
        borderColor: 'border-gray-200',
        bgColor: 'bg-gray-50',
        hoverBgColor: 'hover:bg-gray-100',
        textColor: 'text-gray-900',
        badgeColor: 'bg-gray-100 text-gray-700',
        iconBgColor: 'bg-gray-100'
      };
  }
};

// Helper function to get course info from COURSE_OPTIONS
const getCourseInfo = (courseId) => {
  // Convert courseId to number if it's a string
  const numericId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
  return COURSE_OPTIONS.find(option => option.courseId === numericId);
};

// Helper function to check if a notification is important
const isImportantNotification = (notification) => {
  return (notification.important === true) || 
         (notification.Important === true) ||
         (typeof notification.important === 'string' && notification.important.toLowerCase() === 'true') ||
         (typeof notification.Important === 'string' && notification.Important.toLowerCase() === 'true');
};

const NotificationPreview = ({ notification, onClick, onDismiss, isRead }) => {
  const [isHovered, setIsHovered] = useState(false);
  const style = getNotificationStyle(notification.type);
  
  // Check if notification is important
  const isImportant = isImportantNotification(notification);
  
  // Check if this is a completed survey
  const isSurveyCompleted = notification.type === 'survey' && notification.surveyCompleted;
  
  return (
    <div
      className={cn(
        "relative p-3 rounded-lg transition-all duration-200 cursor-pointer h-full",
        "border hover:shadow-md",
        isRead ? "bg-white border-gray-200" : isImportant ? "bg-red-50 border-red-300" : `${style.bgColor} ${style.borderColor}`,
        isSurveyCompleted && "bg-gray-50 border-gray-200", // Subdued style for completed surveys
        isHovered && "scale-[1.02]",
        isImportant ? "hover:bg-red-100" : style.hoverBgColor
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(notification)}
    >
      {/* Only show dismiss button for one-time notifications that aren't surveys */}
      {notification.type === 'once' && notification.type !== 'survey' && (
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
              <NotificationIcon type={notification.type} size="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col">
            <h4 className={cn(
              "font-semibold text-sm line-clamp-1 pr-6",
              isSurveyCompleted ? "text-gray-700" : 
              isRead ? "text-gray-700" : style.textColor
            )}>
              {notification.title}
            </h4>
            {(notification.important === true || 
              notification.Important === true || 
              (typeof notification.important === 'string' && notification.important.toLowerCase() === 'true') || 
              (typeof notification.Important === 'string' && notification.Important.toLowerCase() === 'true')) && (
              <span className="text-xs text-red-600 font-medium">Important</span>
            )}
          </div>
        </div>
        
        <div 
          className="text-xs text-gray-600 line-clamp-2 mb-2 flex-grow"
          dangerouslySetInnerHTML={{ 
            __html: notification.content?.replace(/<[^>]*>/g, '').substring(0, 60) + '...' 
          }}
        />
        
        {notification.type === 'survey' && !notification.surveyCompleted && (
          <div className="text-xs text-purple-600 font-medium flex items-center gap-1 mb-2">
            <FileQuestion className="h-3 w-3" />
            Survey pending
          </div>
        )}
        
        {notification.type === 'survey' && notification.surveyCompleted && (
          <div className="text-xs text-green-600 font-medium flex items-center gap-1 mb-2">
            <CheckCircle2 className="h-3 w-3" />
            Survey completed {notification.surveyCompletedAt ? 
              `on ${new Date(notification.surveyCompletedAt).toLocaleDateString()}` : ''}
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
  const [selectedCourses, setSelectedCourses] = useState(() => 
    // Initially select all courses
    notification.courses?.map(course => course.id) || []
  );
  
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
      await onSubmit(answers, selectedCourses);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course selection section */}
      {notification.courses && notification.courses.length > 1 && (
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Which courses should this response apply to?
          </Label>
          <div className="space-y-2 border p-3 rounded-md bg-gray-50">
            {notification.courses?.map(course => {
              const courseInfo = getCourseInfo(course.id);
              const CourseIcon = courseInfo?.icon || BookOpen;
              
              return (
                <div key={course.id} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id={`course-${course.id}`}
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleCourseToggle(course.id)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor={`course-${course.id}`} className="font-normal flex items-center gap-2">
                    <CourseIcon className="h-4 w-4" style={{ color: courseInfo?.color || '#374151' }} />
                    {courseInfo?.label || course.title}
                  </Label>
                </div>
              );
            })}
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
          disabled={isSubmitting || selectedCourses.length === 0}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Survey'}
        </Button>
      </div>
    </form>
  );
};

// Dialog for all notifications
const NotificationDialog = ({ notification, isOpen, onClose, onSurveySubmit }) => {
  if (!notification) return null;

  const style = getNotificationStyle(notification.type);
  
  // Check if notification is important
  const isImportant = isImportantNotification(notification);
  
  // Check if this is a completed survey
  const isSurveyCompleted = notification.type === 'survey' && notification.surveyCompleted;

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
                {isSurveyCompleted ? "Completed Survey: " : ""}
                {notification.title}
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
          
          {notification.type === 'survey' && !notification.surveyCompleted ? (
            <div className="space-y-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Complete Survey</h3>
                <SurveyForm
                  notification={notification}
                  onSubmit={onSurveySubmit}
                  onCancel={onClose}
                />
              </div>
            </div>
          ) : notification.type === 'survey' && notification.surveyCompleted ? (
            <div className="space-y-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />
              
              {/* Display completed survey responses */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Your Survey Responses</h3>
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
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: notification.content }}
            />
          )}
        </div>
        
        {/* Only show Acknowledge button for important notifications that are not surveys */}
        {isImportant && notification.type !== 'survey' && (
          <DialogFooter className="mt-6">
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white">
              Acknowledge
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Regular notification dialog now handles all notifications

const NotificationCenter = ({ courses, profile, markNotificationAsSeen }) => {
  // Track if user has manually toggled the accordion
  const [userToggled, setUserToggled] = useState(false);
  // Start collapsed unless there are important notifications
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [readNotifications, setReadNotifications] = useState(() => {
    const stored = localStorage.getItem(`read_notifications_${profile?.StudentEmail}`);
    return stored ? JSON.parse(stored) : {};
  });
  const { current_user_email_key } = useAuth();

  // Collect and deduplicate notifications
  const allNotifications = React.useMemo(() => {
    const notificationMap = new Map();
    
    // Debug each course's notifications
    if (process.env.NODE_ENV === 'development') {
      console.log('Courses with notifications:', courses?.map(course => ({
        id: course.id,
        hasNotifications: !!course.notificationIds,
        notificationCount: course.notificationIds ? Object.keys(course.notificationIds).length : 0,
        notifications: course.notificationIds || {}
      })));
    }
    
    courses?.forEach(course => {
      if (course.notificationIds) {
        Object.values(course.notificationIds).forEach(notification => {
          // Debug each notification to see if important flag exists
          if (process.env.NODE_ENV === 'development') {
            console.log('Processing notification:', {
              id: notification.id,
              title: notification.title,
              type: notification.type,
              important: notification.important,
              Important: notification.Important,
              shouldDisplay: notification.shouldDisplay
            });
          }
          
          if (notification.shouldDisplay) {
            if (!notificationMap.has(notification.id)) {
              // First time seeing this notification, create it with courses array
              notificationMap.set(notification.id, {
                ...notification,
                courses: [{
                  id: course.id,
                  title: course.courseDetails?.Title || course.title || `Course ${course.id}`
                }]
              });
            } else {
              // We've seen this notification before, add this course to its courses array
              const existingNotification = notificationMap.get(notification.id);
              existingNotification.courses.push({
                id: course.id,
                title: course.courseDetails?.Title || course.title || `Course ${course.id}`
              });
            }
          }
        });
      }
    });
    
    const result = Array.from(notificationMap.values());
    
    // Log all notifications after processing
    if (process.env.NODE_ENV === 'development') {
      console.log('Final processed notifications:', result.map(n => ({
        id: n.id,
        title: n.title,
        type: n.type,
        important: n.important,
        Important: n.Important
      })));
    }
    
    return result;
  }, [courses]);

  // Filter out dismissed one-time notifications
  let activeNotifications = allNotifications.filter(notification => {
    if (notification.type === 'once' && readNotifications[notification.id]?.dismissed) {
      return false;
    }
    return true;
  });
  
  // FOR TESTING: Force one notification to be important if we have any
  if (process.env.NODE_ENV === 'development' && activeNotifications.length > 0 && !activeNotifications.some(n => n.important === true)) {
    console.log('TESTING: Forcibly setting first notification as important');
    activeNotifications = activeNotifications.map((notification, index) => {
      if (index === 0) {
        return {
          ...notification,
          important: true,
          title: notification.title + ' (IMPORTANT TEST)'
        };
      }
      return notification;
    });
  }
  
  // Check for important notifications and auto-expand the panel if found
  useEffect(() => {
    if (activeNotifications.length > 0) {
      // Check if any notification is important
      const hasImportantNotifications = activeNotifications.some(notif => isImportantNotification(notif));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Has important notifications:', hasImportantNotifications);
        console.log('User has manually toggled:', userToggled);
      }
      
      // Only auto-expand if user hasn't manually toggled the panel
      if (hasImportantNotifications && !userToggled) {
        setIsExpanded(true);
      }
    }
  }, [activeNotifications, userToggled]);

  // Mark notification as read and store in localStorage
  const markAsRead = (notificationId) => {
    setReadNotifications(prev => {
      const updated = {
        ...prev,
        [notificationId]: { ...prev[notificationId], read: true }
      };
      localStorage.setItem(`read_notifications_${profile?.StudentEmail}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Dismiss one-time notification
  const dismissNotification = (notification) => {
    markNotificationAsSeen(notification.id);
    setReadNotifications(prev => {
      const updated = {
        ...prev,
        [notification.id]: { ...prev[notification.id], dismissed: true }
      };
      localStorage.setItem(`read_notifications_${profile?.StudentEmail}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Handle survey submission
  const handleSurveySubmit = async (answers, selectedCourseIds) => {
    if (!selectedNotification || !current_user_email_key || !selectedCourseIds || selectedCourseIds.length === 0) return;

    const db = getDatabase();
    
    try {
      // Only include selected courses
      const selectedCourses = selectedNotification.courses.filter(course => 
        selectedCourseIds.includes(course.id)
      );
      
      // Store results in both old and new locations for backward compatibility
      const surveyRef = ref(db, `surveyResponses/${current_user_email_key}/notifications/${selectedNotification.id}`);
      
      // Create data object with student info and selected course IDs
      const surveyData = {
        notificationId: selectedNotification.id,
        courses: selectedCourses,
        answers,
        submittedAt: new Date().toISOString(),
        studentEmail: profile?.StudentEmail,
        studentName: `${profile?.firstName} ${profile?.lastName}`
      };
      
      // Save to original location
      await set(surveyRef, surveyData);
      
      // Save to new studentDashboardNotificationsResults location
      const resultsRef = ref(db, `studentDashboardNotificationsResults/${selectedNotification.id}/${current_user_email_key}`);
      await set(resultsRef, {
        ...surveyData,
        // Include additional data for easier querying
        courseIds: selectedCourseIds,
        email: profile?.StudentEmail
      });
      
      // Also store the result in each selected course record for real-time updates
      const updatePromises = selectedCourseIds.map(async (courseId) => {
        const courseResultsRef = ref(db, `students/${current_user_email_key}/courses/${courseId}/studentDashboardNotificationsResults/${selectedNotification.id}`);
        return set(courseResultsRef, {
          completed: true,
          completedAt: new Date().toISOString(),
          answers // Store answers directly in the format provided
        });
      });
      await Promise.all(updatePromises);

      // Close dialog and refresh notifications
      setSelectedNotification(null);
      markAsRead(selectedNotification.id);
      
      // Show success message
      toast?.success?.('Survey submitted successfully') || alert('Survey submitted successfully');
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
  
  if (activeNotifications.length === 0) return null;

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
            {activeNotifications.some(n => !readNotifications[n.id]?.read) && (
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
      
      {isExpanded && (
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeNotifications.map((notification, index) => (
              <NotificationPreview
                key={`${notification.id}-${index}`}
                notification={notification}
                onClick={(notification) => {
                  setSelectedNotification(notification);
                  markAsRead(notification.id);
                }}
                onDismiss={dismissNotification}
                isRead={readNotifications[notification.id]?.read}
              />
            ))}
          </div>
        </CardContent>
      )}

      {/* Notification dialog */}
      <NotificationDialog
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onSurveySubmit={handleSurveySubmit}
      />
    </Card>
  );
};

export default NotificationCenter;