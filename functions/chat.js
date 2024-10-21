// functions/chat.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Cloud Function: removeUserFromChat
 *
 * Allows a user to leave a chat.
 */
const removeUserFromChat = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to remove from chat.');
  }

  const { chatId } = data;
  const userEmail = context.auth.token.email.toLowerCase();
  const userDisplayName = context.auth.token.name || userEmail;

  const db = admin.database();

  try {
    // Add a system message about the user leaving
    await db.ref(`chats/${chatId}/messages`).push({
      text: `${userDisplayName} has left the chat.`,
      sender: 'system',
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    // Update the chat's participants list
    const chatSnapshot = await db.ref(`chats/${chatId}`).once('value');
    if (chatSnapshot.exists()) {
      const chatData = chatSnapshot.val();
      const updatedParticipants = chatData.participants.filter(
        (email) => email.toLowerCase() !== userEmail
      );
      await db.ref(`chats/${chatId}`).update({ participants: updatedParticipants });
    }

    // Mark the chat as inactive in the user's userChats entry
    await db.ref(`userChats/${userEmail.replace('.', ',')}/${chatId}`).update({
      active: false, // Set the active status to false instead of removing
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing user from chat:', error);
    throw new functions.https.HttpsError('internal', 'Failed to remove user from chat.');
  }
});

/**
 * Cloud Function: sendChatNotification
 *
 * Sends notifications when a new chat message is created.
 */
const sendChatNotification = functions.database.ref('/chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val();
    const { chatId } = context.params;

    if (!message || message.sender === 'system') {
      return null; // Ignore system messages
    }

    try {
      // Get chat participants
      const chatSnapshot = await admin.database().ref(`/chats/${chatId}`).once('value');
      const chatData = chatSnapshot.val();

      if (!chatData || !chatData.participants) {
        console.error('Chat data or participants not found.');
        return null;
      }

      const participants = chatData.participants;

      // Determine if the sender is a staff member
      const isStaff = message.sender.includes('@rtdacademy,com');
      let senderCourses = [];

      if (!isStaff) {
        // Get sender's course IDs if the sender is a student
        const senderKey = message.sender.replace(/\./g, ',');
        const senderCoursesSnapshot = await admin.database().ref(`/students/${senderKey}/courses`).once('value');
        senderCourses = senderCoursesSnapshot.exists() ? Object.keys(senderCoursesSnapshot.val()) : [];
      }

      // Process notifications for each participant except the sender
      const notificationsPromises = participants
        .filter(participantEmail => participantEmail !== message.sender)
        .map(async participantEmail => {
          const sanitizedEmail = participantEmail.replace(/\./g, ',');
          const notificationRef = admin.database().ref(`/notifications/${sanitizedEmail}/${chatId}`);
          const notificationSnapshot = await notificationRef.once('value');

          if (notificationSnapshot.exists()) {
            // Update existing notification if it's marked as read
            const notificationData = notificationSnapshot.val();
            await notificationRef.update({
              unreadCount: notificationData.read ? 1 : (notificationData.unreadCount || 0) + 1,
              read: false, // Mark notification as unread if a new message arrives
              timestamp: admin.database.ServerValue.TIMESTAMP,
              preview: message.text.substring(0, 50), // Update preview with latest message
              senderCourses, // Add sender's courses
              isStaff, // Indicate if the sender is a staff member
            });
          } else {
            // Create a new notification if one doesn't exist
            await notificationRef.set({
              type: 'new_message',
              chatId,
              sender: message.sender,
              senderName: message.senderName,
              preview: message.text.substring(0, 50),
              timestamp: admin.database.ServerValue.TIMESTAMP,
              unreadCount: 1,
              read: false,
              senderCourses, // Add sender's courses
              isStaff, // Indicate if the sender is a staff member
            });
          }
        });

      await Promise.all(notificationsPromises);
      console.log('Notifications processed successfully.');
    } catch (error) {
      console.error('Error processing notifications:', error);
    }

    return null;
  });

module.exports = {
  removeUserFromChat,
  sendChatNotification,
};
