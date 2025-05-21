# Notification System Implementation Guide

This document provides guidance on implementing the updated notification survey submission process, including the cloud function and required client-side changes.

## 1. Cloud Function Implementation

The `submitNotificationSurvey` cloud function is implemented in `functions/surveySubmissions.js`. This function handles the saving of survey responses with admin privileges, solving permission issues where students may not have sufficient database access.

### Deployment Steps

1. Deploy the cloud function:
   ```bash
   firebase deploy --only functions:submitNotificationSurvey
   ```

2. Test the function using the Firebase Functions shell:
   ```bash
   firebase functions:shell
   ```
   ```javascript
   submitNotificationSurvey({
     notificationId: '-OQjoY2E87d4goYanajF',
     courseId: '12345',
     answers: { '1747778753497': '1747778753497-1' },
     userEmail: 'test@example.com',
     studentName: 'Test Student'
   })
   ```

## 2. Client Implementation

The client-side implementation has been updated in `src/Dashboard/NotificationCenter.js`. The key changes are:

1. Removed direct database writes from the client
2. Added cloud function call using `httpsCallable`
3. Separated category processing into its own function
4. Added proper error handling and refresh logic

### Key Client Code

```javascript
// Handle survey submission using cloud function
const handleSurveySubmit = async (answers, selectedCourseIds) => {
  if (!selectedNotification || !current_user_email_key || !selectedCourseIds || selectedCourseIds.length === 0) return;

  try {
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../utils/sanitizeEmail');
    
    // Get the original notification ID
    const notificationId = selectedNotification.originalNotificationId || selectedNotification.id;
    
    // In our new model, each survey notification has exactly one course
    const selectedCourse = selectedNotification.courses[0];
    const courseId = selectedCourse.id;
    
    // Prepare data for the cloud function
    const submissionData = {
      notificationId,
      courseId,
      answers,
      userEmail: profile?.StudentEmail,
      studentName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
      sanitizedUserEmail: sanitizeEmail(current_user_email_key)
    };
    
    // Call the cloud function
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const submitSurvey = httpsCallable(functions, 'submitNotificationSurvey');
    
    // Wait for the cloud function to complete
    const result = await submitSurvey(submissionData);
    
    // Process categories from answers - still done client-side
    if (selectedNotification.surveyQuestions && selectedNotification.surveyQuestions.length > 0) {
      await processCategoryUpdates(answers, selectedNotification, courseId, sanitizeEmail(current_user_email_key));
    }
    
    // Update UI state and refresh
    // [rest of the function...]
  } catch (error) {
    console.error('Error submitting survey:', error);
    toast?.error?.(`Failed to submit survey: ${error.message}`);
  }
};
```

## 3. Database Structure

The cloud function uses a simplified database structure:

```
studentDashboardNotificationsResults/
  ├── {notificationId}/
  │   └── {sanitizedUserEmail}/
  │       ├── answers: {...}
  │       ├── completed: true
  │       ├── completedAt: "2025-05-21T12:34:56.789Z"
  │       ├── submissions: {
  │       │   {timestamp}: {
  │       │     answers: {...},
  │       │     submittedAt: "2025-05-21T12:34:56.789Z"
  │       │   }
  │       └── ...other fields
  │
  students/
    └── {sanitizedUserEmail}/
        └── courses/
            └── {courseId}/
                └── studentDashboardNotificationsResults/
                    └── {notificationId}/
                        ├── answers: {...}
                        ├── completed: true
                        └── ...other fields
```

## 4. Testing

To test the implementation:

1. Check Firebase security rules - ensure the student has read access to needed paths
2. Test with various notification types (one-time, weekly, custom)
3. Verify data is properly stored in all locations
4. Test error conditions (network issues, invalid data)
5. Monitor Cloud Function logs for any errors

## 5. Troubleshooting

### Common Issues and Solutions

1. **Cloud Function Not Found**
   - Ensure the function is deployed and named correctly
   - Check region settings match between client and server

2. **Permission Denied**
   - Verify Firebase security rules
   - Check that the function has admin privileges
   - Ensure user is authenticated when making the call

3. **Invalid Data Formats**
   - Verify all required fields are included
   - Check that date fields are properly formatted

4. **Categories Not Applied**
   - Verify the client-side category processing is working
   - Check that category IDs match those in the database

## 6. Performance Considerations

- The cloud function has a timeout of 60 seconds, which should be sufficient
- Memory allocation is set to 256MiB, which should be adequate for this operation
- For very large surveys, consider chunking the data if needed

## 7. Security Considerations

- The function validates authentication by default
- Do not log actual survey answers in production for privacy reasons
- Consider adding additional validation for the notification ID and user email
- Consider adding rate limiting to prevent abuse