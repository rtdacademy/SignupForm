# Firebase Database Paths for Notifications

## Base Notification Storage

1. `studentDashboardNotifications` - Main collection of all notification templates
   - Contains all notification objects with their configurations
   - Notifications filtered by `active: true` are shown to users

## Notification Acknowledgment Paths

1. `studentDashboardNotificationsResults/{notificationId}/{userEmailKey}` - Main acknowledgment storage
   - Tracks when a user has seen or acknowledged a notification
   - Contains fields:
     - `hasSeen`: Boolean indicating if notification was seen
     - `hasSeenTimeStamp`: ISO date when notification was seen
     - `hasAcknowledged`: Boolean indicating user acknowledgment
     - `acknowledgedAt`: ISO date when notification was acknowledged
     - `completed`: Boolean for survey completion status
     - `completedAt`: ISO date when survey was completed
     - `answers`: Object containing survey responses (for survey notifications)
     - `userEmail`: Email of the user
     - `lastSeen`: ISO date of most recent view
     - `lastAcknowledged`: ISO date of most recent acknowledgment
     - `lastSubmitted`: ISO date of most recent survey submission
     - `nextRenewalDate`: ISO date when notification should reappear (for recurring notifications)

2. `studentDashboardNotificationsResults/{notificationId}/{timestamp}/{userEmailKey}` - Hierarchical acknowledgment storage
   - Timestamp-based storage for tracking all interactions with a notification
   - Enables tracking history of interactions for recurring notifications
   - Contains similar fields to the main acknowledgment path

3. `students/{userEmailKey}/courses/{courseId}/studentDashboardNotificationsResults/{notificationId}` - Course-specific acknowledgment
   - Stores notification results for a specific course
   - Contains:
     - `completed`: Boolean for survey completion
     - `completedAt`: ISO date when completed
     - `answers`: Survey responses
     - `hasSeen`: Boolean if seen
     - `hasAcknowledged`: Boolean if acknowledged
     - `latestSubmissionPath`: Reference to the hierarchical structure path

## Survey Response Storage

1. `surveyResponses/{notificationId}/{timestamp}/{userEmailKey}` - Hierarchical survey response storage
   - Primary storage for survey responses
   - Contains:
     - `answers`: Survey response data
     - `courseId`: ID of the course
     - `courseName`: Name of the course
     - `submittedAt`: ISO date of submission
     - `studentEmail`: Email of student
     - `studentName`: Name of student
     - `timestamp`: Numeric timestamp

2. `surveyResponses/{userEmailKey}/notifications/{notificationId}` - Legacy survey response storage
   - Backward compatibility storage for survey responses
   - Contains similar fields to hierarchical storage

## Submission History Storage

Submission history is stored within the notification results objects as a nested structure:

1. `studentDashboardNotificationsResults/{notificationId}/{userEmailKey}/submissions/{timestamp}` - Submission history
   - Timeline of all submissions for recurring notifications
   - Each timestamp entry contains:
     - `seen`: Boolean if seen
     - `seenAt`: ISO date when seen
     - `hasAcknowledged`: Boolean if acknowledged
     - `acknowledgedAt`: ISO date when acknowledged
     - `answers`: Survey responses (for survey notifications)
     - `submittedAt`: ISO date when submitted

## Chat Notification Storage

1. `students/{userId}/notifications` - Chat notifications path
   - Stores notifications related to chat functionality
   - Contains:
     - `type`: Type of notification (e.g., "new_chat")
     - `chatId`: ID of relevant chat
     - `message`: Notification message
     - `read`: Boolean if notification was read
     - `timestamp`: When notification was created

## Renewal Date Storage

Renewal dates for recurring notifications are stored in:

1. `studentDashboardNotificationsResults/{notificationId}/{userEmailKey}/nextRenewalDate` - Next renewal date
   - ISO date string when the notification should reappear
   - Calculated based on notification configuration:
     - Weekly notifications: Next occurrence of configured day of week
     - Custom date notifications: Next date from configured list
     - Legacy interval notifications: Current date + interval

## Category Links from Surveys

When surveys contain category assignments:

1. `students/{userEmailKey}/courses/{courseId}/categories/{staffKey}/{categoryId}` - Category assignments
   - Boolean value (true) to mark category as assigned
   - Set when a survey response triggers a category assignment

## Notes on Email Key Formats

The system uses several formats for email keys:
- Sanitized format with commas: `kyle,e,brown13@gmail,com`
- Legacy underscore format: `kyle_e_brown13@gmail_com`
- Zero-prefixed format: `000kyle,e,brown13@gmail,com`

The sanitized format with commas is the current standard but code handles multiple formats for backward compatibility.