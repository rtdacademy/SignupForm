# Notification System Data Flow

This document details the data flow within the student dashboard notification system, from creation to display and interaction tracking.

## Creation Flow

1. **Admin creates notification**
   - In `StudentDashboardNotifications.js`, admin fills out notification form
   - Specifies notification type, frequency, and target conditions
   - For surveys, defines questions and response options
   - Admin saves notification to Firebase

2. **Notification storage**
   - Notification saved to `studentDashboardNotifications/{notificationId}`
   - System calculates and stores `lastMatchCount` - the number of students matching conditions
   - `active` flag determines if notification is visible in student dashboard

## Processing Flow

1. **Data retrieval**
   - `useStudentData.js` hook fetches:
     - Student profile from `students/{studentEmail}/profile`
     - Student courses from `students/{studentEmail}/courses`
     - All active notifications from `studentDashboardNotifications`
     - Interaction history from `studentDashboardNotificationsResults`

2. **Notification filtering**
   - For each notification, the system:
     - Evaluates notification conditions against student data
     - Checks if notification should display based on frequency and previous interactions
     - Adds matching notifications to the student's processed data

3. **Targeting logic**
   - Function `evaluateNotificationMatch()` in `notificationFilterUtils.js`:
     - Checks if student matches notification conditions
     - Evaluates survey completion status
     - Determines if enough time has passed since last interaction (for recurring notifications)
     - Returns match result with `shouldDisplay` flag

## Display Flow

1. **Notification rendering**
   - `NotificationCenter.js` displays notifications with `shouldDisplay: true`
   - Notifications are grouped by type and importance
   - Important notifications are highlighted
   - Tabs organize notifications by category (all, important, surveys)

2. **Survey presentation**
   - For survey-type notifications, the system:
     - Displays questions and response options
     - Shows completion status for previously answered surveys
     - For recurring surveys, indicates when the next response is due

## Interaction Flow

1. **Viewing notifications**
   - When student opens notification:
     - `markAsRead()` function is called
     - `hasSeen: true` and timestamp stored in Firebase
     - For recurring notifications, `nextRenewalDate` is calculated

2. **Acknowledging notifications**
   - When student acknowledges notification:
     - `dismissNotification()` function is called
     - `hasAcknowledged: true` and timestamp stored
     - For one-time notifications, removed from display

3. **Submitting surveys**
   - When student completes survey:
     - `handleSurveySubmit()` processes responses
     - Answers stored in multiple locations:
       - Main results: `studentDashboardNotificationsResults/{notificationId}/{studentEmail}`
       - Course-specific: `students/{studentEmail}/courses/{courseId}/studentDashboardNotificationsResults/{notificationId}`
       - Historical record: `surveyResponses/{notificationId}/{timestamp}/{studentEmail}`
     - System sets `completed: true` and stores completion timestamp

## Renewal Process

1. **Renewal determination**
   - System uses `displayConfig.frequency` to determine renewal behavior:
     - `one-time`: No renewal
     - `weekly`: Renews on specified day of week
     - `custom`: Renews on specific dates

2. **Date calculation**
   - For weekly notifications:
     - System calculates next occurrence of specified day
     - Stores in `nextRenewalDate` field
   - For custom notifications:
     - System finds next date in the custom schedule
     - Compares with current date to determine visibility

3. **Visibility after renewal**
   - When current date reaches or passes `nextRenewalDate`:
     - Notification becomes visible again
     - Previous acknowledgment status is reset
     - For surveys, new response is requested

## Data Storage Pattern

Data is strategically stored in multiple locations to support different access patterns:

1. **Centralized notification definitions**
   - `studentDashboardNotifications/{notificationId}`
   - Contains all notification configuration and content
   - Accessible by admin interfaces

2. **Centralized result tracking**
   - `studentDashboardNotificationsResults/{notificationId}/{studentEmail}`
   - Stores all student interactions across all courses
   - Enables aggregate reporting and analytics

3. **Course-specific result tracking**
   - `students/{studentEmail}/courses/{courseId}/studentDashboardNotificationsResults/{notificationId}`
   - Enables efficient loading of notification status when viewing course details
   - Supports course-specific notification filtering

4. **Historical submissions**
   - `surveyResponses/{notificationId}/{timestamp}/{studentEmail}`
   - Maintains chronological record of all survey submissions
   - Enables time-series analysis of student responses

## Error Handling

The system includes several error handling mechanisms:

1. **Read failures**
   - If reading notification data fails, the system creates fallback objects with minimal data
   - Ensures UI doesn't break when database connections fail

2. **Write failures**
   - Primary and fallback paths for writing interaction data
   - Console error logging with detailed context information

3. **Data validation**
   - Client-side validation of notification configuration before saving
   - Server-side security rules enforce data structure and access control