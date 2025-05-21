# Student Dashboard Notifications System

This document outlines the architecture and workflow of the student dashboard notification system. The system enables staff to create, configure, and deliver targeted notifications and surveys to specific student segments.

## Overview

The notification system allows administrative staff to:
- Create one-time or recurring notifications
- Create one-time, weekly, or custom-scheduled surveys
- Target notifications to specific student segments using various criteria
- Track student interactions with notifications
- Monitor survey responses

## Components

The notification system is built with the following components:

1. **StudentDashboardNotifications.js** - Admin interface for creating and managing notifications
2. **NotificationCenter.js** - Student-facing component that displays notifications and surveys
3. **useStudentData.js** - Hook that fetches and processes student data including notifications
4. **notificationFilterUtils.js** - Utility functions for filtering notifications and evaluating conditions

## Data Structure

### Firebase Database Collections

#### 1. `studentDashboardNotifications`

This is the primary storage for notification definitions. Each notification is stored with a unique ID and contains:

```json
{
  "-NotificationId": {
    "active": true,
    "conditions": {
      "activeFutureArchivedValues": ["Active"],
      "categories": [{"teacherEmail": ["categoryId"]}],
      "courses": [12345],
      "diplomaMonths": ["January"],
      "logic": "and",
      "schoolYears": ["2024-2025"],
      "studentTypes": ["Adult"]
    },
    "content": "<p>HTML content of the notification</p>",
    "createdAt": 1747780251620,
    "displayConfig": {
      "frequency": "one-time|weekly|custom",
      "dayOfWeek": "monday",
      "dates": [1747807200000, 1748584800000]
    },
    "important": true,
    "lastMatchCount": 3,
    "surveyQuestions": [
      {
        "id": "questionId",
        "options": [
          {
            "category": "categoryId",
            "id": "optionId",
            "staffKey": "teacherEmail",
            "text": "Option text"
          }
        ],
        "question": "Question text",
        "questionType": "multiple-choice|text-input"
      }
    ],
    "title": "Notification Title",
    "type": "notification|survey",
    "updatedAt": 1747782838325
  }
}
```

#### 2. `studentDashboardNotificationsResults`

This collection stores student interactions with notifications. The structure is:

```json
{
  "-NotificationId": {
    "studentEmail": {
      "hasSeen": true,
      "hasSeenTimeStamp": "2025-05-20T23:29:19.526Z",
      "acknowledged": true,
      "acknowledgedAt": "2025-05-20T23:29:19.526Z",
      "completed": true,
      "completedAt": "2025-05-20T23:29:19.526Z",
      "answers": {
        "questionId": "answer text or optionId"
      },
      "nextRenewalDate": "2025-05-27T23:29:19.526Z",
      "submissions": {
        "timestamp": {
          "seen": true,
          "seenAt": "2025-05-20T23:29:19.526Z",
          "answers": {
            "questionId": "answer text or optionId"
          }
        }
      },
      "userEmail": "student@example.com"
    }
  }
}
```

#### 3. Course-specific notification results

For each student-course pair, notification results are also stored in the student's course data:

```json
{
  "students/studentEmail/courses/courseId/studentDashboardNotificationsResults": {
    "-NotificationId": {
      "hasSeen": true,
      "hasSeenTimeStamp": "2025-05-20T23:29:19.526Z",
      "hasAcknowledged": true,
      "acknowledgedAt": "2025-05-20T23:29:19.526Z",
      "completed": true,
      "completedAt": "2025-05-20T23:29:19.526Z",
      "answers": {
        "questionId": "answer text or optionId"
      }
    }
  }
}
```

## Workflow

### Creating Notifications

1. Staff uses the `StudentDashboardNotifications.js` component to create a notification
2. Notification is configured with:
   - Title and content
   - Type (notification or survey)
   - Display frequency (one-time, weekly, or custom dates)
   - Target conditions (student types, courses, diploma months, etc.)
   - Survey questions (if applicable)
3. Notification is saved to `studentDashboardNotifications` in Firebase

### Filtering and Displaying Notifications

1. `useStudentData.js` hook fetches all active notifications from `studentDashboardNotifications`
2. The hook evaluates each notification against the student's profile using functions from `notificationFilterUtils.js`
3. Matching notifications are added to the student's processed course data
4. `NotificationCenter.js` displays these notifications to the student

### Student Interactions

When a student interacts with a notification:

1. If it's a survey, their responses are saved to `studentDashboardNotificationsResults/-NotificationId/studentEmail`
2. The interaction data (acknowledgment, completion) is stored in both:
   - The central `studentDashboardNotificationsResults` collection
   - The course-specific path: `students/studentEmail/courses/courseId/studentDashboardNotificationsResults`
3. For recurring notifications, the next renewal date is calculated and stored

## Renewal System

The notification system supports three frequency types:

1. **One-time** - Shows once and disappears after interaction
2. **Weekly** - Reappears on a specific day of each week
3. **Custom** - Appears on specific dates defined by administrators

When a notification is due to reappear:
- The system uses the `nextRenewalDate` field to determine when to show it again
- For weekly notifications, renewal is set to the next occurrence of the configured day of week
- For custom notifications, the system checks for upcoming dates in the defined schedule

## Data Flow Diagram

```
┌─────────────────────┐     ┌────────────────────────┐
│                     │     │                        │
│  StudentDashboard   │     │   NotificationCenter   │
│  Notifications.js   │────▶│                        │
│  (Admin Interface)  │     │   (Student Interface)  │
│                     │     │                        │
└─────────────────────┘     └────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌─────────────────────┐     ┌────────────────────────┐
│                     │     │                        │
│ studentDashboard    │     │    useStudentData.js   │
│ Notifications       │◀───▶│    (Data Processing)   │
│ (Firebase)          │     │                        │
│                     │     └────────────────────────┘
└─────────────────────┘                │
         ▲                             │
         │                             │
         │                             ▼
┌─────────────────────┐     ┌────────────────────────┐
│                     │     │                        │
│ studentDashboard    │     │ notificationFilterUtils│
│ NotificationsResults│◀───▶│    (Utility Functions) │
│ (Firebase)          │     │                        │
│                     │     └────────────────────────┘
└─────────────────────┘
```

## Filtering Conditions

Notifications can be targeted using these condition types:

- **Student Types** - Adult, Primary, International, etc.
- **Diploma Months** - January, June, August
- **Courses** - Specific course IDs
- **School Years** - Academic year (e.g., 2024-2025)
- **Age Range** - Min and max age
- **Schedule End Date Range** - Date range for course completion
- **Categories** - Custom categories assigned to students

Conditions can be combined using either:
- **AND logic** - Student must match all conditions
- **OR logic** - Student must match at least one condition

## Best Practices

1. Limit important notifications to prevent notification fatigue
2. Use weekly surveys for regular feedback collection
3. Target notifications precisely to relevant student segments
4. Use clear, concise titles and content
5. For surveys, limit to 2-3 questions for better completion rates