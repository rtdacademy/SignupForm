# Notification Display and Tracking

This document details how notifications are displayed to students and how the system tracks student interactions with notifications.

## Notification Display Components

### NotificationCenter.js

The `NotificationCenter.js` component is the main interface for displaying notifications to students. It:

1. Receives processed notifications from `useStudentData.js`
2. Organizes notifications into categories (all, important, surveys)
3. Renders notifications with appropriate styling based on their type and importance
4. Handles student interactions (viewing, acknowledging, survey completion)

### Key Features

- **Collapsible Interface**: Expands automatically when important notifications exist
- **Tabbed Organization**: Notifications are categorized by type
- **Priority Highlighting**: Important notifications receive visual emphasis
- **Status Indicators**: Shows completion status for surveys
- **Course Association**: Displays which course(s) each notification belongs to

## Notification Styling and Types

Notifications are styled differently based on their type and frequency:

```javascript
// Different style themes based on notification type
const oneTimeStyle = {
  borderColor: 'border-amber-200',
  bgColor: 'bg-amber-50',
  // other styling properties...
};

const weeklyStyle = {
  borderColor: 'border-blue-200',
  bgColor: 'bg-blue-50',
  // other styling properties...
};

// Additional styles for surveys, weekly surveys, etc.
```

### Notification Icons

Each notification type has a distinct icon to help students identify the type at a glance:

```javascript
const NotificationIcon = ({ type, size = "h-5 w-5", repeatInterval = null }) => {
  // Logic to determine which icon to show based on notification type
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
```

## Display Logic

### Visibility Rules

A notification is displayed to a student if:

1. The notification is active (`active: true` in database)
2. The student matches the notification's conditions
3. For one-time notifications:
   - The student hasn't acknowledged it yet
4. For recurring notifications:
   - Enough time has passed since last interaction (based on frequency)
   - The current date has reached or passed the `nextRenewalDate`

### Notification State Tracking

The system tracks several states for each notification:

```javascript
// Part of NotificationPreview component
const [isRead, setIsRead] = useState(false);
const [isHovered, setIsHovered] = useState(false);
const hasRepeatInterval = !!notification.repeatInterval || /* other checks */;
const isSurveyType = notification.type === 'survey' || notification.type === 'weekly-survey';
const isSurveyCompleted = isSurveyType && notification.surveyCompleted;
```

## Interaction Handling

### Viewing Notifications

When a student views a notification:

```javascript
// Mark notification as read and store in localStorage
const markAsRead = async (notification) => {
  // Update local storage
  setReadNotifications(prev => {
    const updated = {
      ...prev,
      [uniqueId]: { ...prev[uniqueId], read: true }
    };
    localStorage.setItem(`read_notifications_${profile?.StudentEmail}`, JSON.stringify(updated));
    return updated;
  });
  
  // Update Firebase with seen status
  const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
  // Get existing data and update with seen status
  // ...
};
```

### Acknowledging Notifications

For regular notifications (non-surveys), students can acknowledge to dismiss them:

```javascript
// Dismiss/acknowledge notification
const dismissNotification = async (notification) => {
  // Use the original ID for backend notification dismissal
  await markNotificationAsSeen(notification.originalNotificationId || notification.id);
  
  // Update local storage
  setReadNotifications(prev => {
    const updated = {
      ...prev,
      [notification.uniqueId]: { ...prev[notification.uniqueId], dismissed: true }
    };
    localStorage.setItem(`read_notifications_${profile?.StudentEmail}`, JSON.stringify(updated));
    return updated;
  });
  
  // Update Firebase with acknowledgment status
  // ...
};
```

### Survey Responses

For surveys, the system captures and stores student responses:

```javascript
// Handle survey submission
const handleSurveySubmit = async (answers, selectedCourseIds) => {
  // Store results in multiple locations
  // 1. Hierarchical structure for survey responses
  const resultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${timestamp}/${sanitizedUserEmail}`);
  
  // 2. Legacy format for backward compatibility
  const legacyResultsRef = ref(db, `studentDashboardNotificationsResults/${notificationId}/${sanitizedUserEmail}`);
  
  // 3. Course-specific results
  const courseResultsRef = ref(db, `students/${sanitizedUserEmail}/courses/${selectedCourse.id}/studentDashboardNotificationsResults/${notificationId}`);
  
  // Update all locations with survey answers and completion status
  // ...
};
```

## Notification Dialogs

When a student clicks on a notification, a dialog appears with the full content:

### Regular Notification Dialog

```jsx
<DialogContent>
  <DialogHeader>
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", style.iconBgColor)}>
        <NotificationIcon type={notification.type} />
      </div>
      <DialogTitle>{notification.title}</DialogTitle>
    </div>
  </DialogHeader>
  
  <div className="mt-4">
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: notification.content }}
    />
    
    {/* Acknowledgment buttons and status indicators */}
  </div>
</DialogContent>
```

### Survey Dialog

For surveys, the dialog includes the survey questions and response form:

```jsx
<SurveyForm
  notification={notification}
  onSubmit={onSurveySubmit}
  onCancel={onClose}
/>
```

The `SurveyForm` component renders different inputs based on question type:

```jsx
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
        <Label htmlFor={option.id}>{option.text}</Label>
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
    rows={3}
  />
)}
```

## Testing and Debugging Features

The system includes built-in testing functions that are attached to the window object:

```javascript
window.testNotifications = {
  // Mock the current date for testing renewal logic
  mockDate: (dateString) => {
    const newDate = dateString ? new Date(dateString) : null;
    const result = setMockDate(newDate);
    // Force refresh the notifications after changing date
    // ...
    return result;
  },
  
  // Reset a notification's status for testing
  resetNotification: async (notificationId, email) => {
    // Reset acknowledgment status in Firebase
    // ...
  },
  
  // Force a refresh of the notifications display
  refreshNotifications: () => {
    // Dispatch a custom event to trigger refresh
    const refreshEvent = new CustomEvent('notification-refresh-needed');
    window.dispatchEvent(refreshEvent);
    // ...
  }
};
```

## Performance Considerations

The notification display system incorporates several optimizations:

1. **Conditional Rendering**: Only renders expanded notification list when needed
2. **Memoization**: Uses React.useMemo to prevent unnecessary re-processing of notifications
3. **Batched Updates**: Groups state updates to minimize re-renders
4. **Lazy Loading**: Dialogs and sheet components only mount when needed

## Accessibility Features

The notification system includes several accessibility features:

1. **Keyboard Navigation**: All interactive elements are properly tabbable
2. **ARIA Attributes**: Dialog and notification components use appropriate ARIA roles
3. **Focus Management**: Dialog properly manages focus when opened and closed
4. **Color Contrast**: Important notifications use accessible color combinations