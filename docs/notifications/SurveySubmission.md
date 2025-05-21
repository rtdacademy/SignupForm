# Notification Survey Submission Process

This document explains the updated survey submission process for the student dashboard notification system, which uses a cloud function to handle survey submissions securely.

## Problem

The original implementation had a permission issue where students were attempting to write data to Firebase paths they didn't have access to, resulting in errors when submitting surveys.

The specific issues were:
1. Students needed to write to `studentDashboardNotificationsResults/{notificationId}/{timestamp}/{userEmail}` which may be restricted
2. Multiple duplicate data was being stored in different locations 
3. The client-side code was handling complex database operations that would be better managed server-side

## Solution

We've implemented a cloud function called `submitNotificationSurvey` that:

1. Runs with admin privileges to write to any necessary database location
2. Simplifies the data structure
3. Centralizes all survey submission logic in one place
4. Handles errors gracefully

## Implementation

### Cloud Function

The cloud function is implemented in `functions/surveySubmissions.js` and exposed as `submitNotificationSurvey`. It:

1. Receives survey data from the client
2. Validates input parameters
3. Fetches notification and course details to enhance the submission
4. Calculates renewal dates for recurring surveys
5. Saves data to all necessary locations in Firebase
6. Returns a success response or detailed error

### Database Structure

The function uses a simplified data structure:

1. **Main Results Record**:
   ```
   studentDashboardNotificationsResults/{notificationId}/{sanitizedUserEmail}
   ```
   This contains the most recent submission and a submissions history.

2. **Course-Specific Record**:
   ```
   students/{sanitizedUserEmail}/courses/{courseId}/studentDashboardNotificationsResults/{notificationId}
   ```
   This contains course-specific submission data.

3. **Historical Archive**:
   ```
   surveyResponses/{notificationId}/{timestamp}/{sanitizedUserEmail}
   ```
   This provides a time-based record of all submissions.

### Client Implementation

To use this cloud function from the client side, update the `handleSurveySubmit` function in `NotificationCenter.js`:

```javascript
// Handle survey submission
const handleSurveySubmit = async (answers, selectedCourseIds) => {
  if (!selectedNotification || !profile?.StudentEmail || !selectedCourseIds || selectedCourseIds.length === 0) return;

  try {
    setIsSubmitting(true);
    
    // Import sanitizeEmail to ensure consistent email format
    const { sanitizeEmail } = await import('../utils/sanitizeEmail');
    
    // Get the original notification ID
    const notificationId = selectedNotification.originalNotificationId || selectedNotification.id;
    
    // Get the course ID (in our new model, each survey notification has exactly one course)
    const courseId = selectedCourseIds[0];
    
    // Prepare data for the cloud function
    const submissionData = {
      notificationId,
      courseId,
      answers,
      userEmail: profile.StudentEmail,
      studentName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      sanitizedUserEmail: sanitizeEmail(current_user_email_key)
    };
    
    // Call the cloud function
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const submitSurvey = httpsCallable(functions, 'submitNotificationSurvey');
    
    const result = await submitSurvey(submissionData);
    console.log('Survey submitted successfully:', result.data);
    
    // Update local state to reflect successful submission
    setSelectedNotification(prev => ({
      ...prev,
      surveyCompleted: true,
      surveyAnswers: answers,
      surveyCompletedAt: new Date().toISOString()
    }));
    
    // Show success message
    toast.success('Survey submitted successfully!');
    
    // Close the dialog after a brief delay
    setTimeout(() => {
      setDialogOpen(false);
    }, 1000);
    
    // Trigger a refresh of the notification center
    forceRefresh();
    
  } catch (error) {
    console.error('Error submitting survey:', error);
    toast.error(`Failed to submit survey: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};
```

## Benefits

1. **Improved Security**: All database operations now happen with admin privileges
2. **Better Error Handling**: Centralized error handling with detailed logging
3. **Simplified Structure**: More consistent database structure
4. **Reduced Redundancy**: Optimized data storage pattern
5. **Better Maintenance**: Easier to update submission logic in one place

## Testing

To test the implementation:
1. Deploy the cloud function
2. Test survey submission as a student
3. Verify data is saved in all locations
4. Test error cases (missing parameters, invalid notification ID)
5. Test with different survey types (one-time, weekly, custom)