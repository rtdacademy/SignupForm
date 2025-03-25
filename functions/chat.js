// functions/chat.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

/**
 * Cloud Function: sendChatMessage
 * 
 * Handles sending a new message and updating all related nodes
 */
const sendChatMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send messages.'
    );
  }

  const { chatId, text, participants, senderEmailKey, senderName, isNewChat } = data;
  const timestamp = admin.database.ServerValue.TIMESTAMP;

  const db = admin.database();
  const chatRef = db.ref(`chats/${chatId}`);

  try {
    console.log('Processing message:', {
      chatId,
      isNewChat,
      participantCount: participants.length,
    });

    // First, check if chat exists and get any existing data we need
    const chatSnapshot = await chatRef.once('value');
    const chatExists = chatSnapshot.exists();

    if (chatExists && isNewChat) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Chat already exists but was marked as new'
      );
    }

    // Get existing chat data if it exists
    let existingChatData = null;
    let firstMessageSender = senderEmailKey;
    let firstMessageSenderName = senderName;

    if (chatExists) {
      existingChatData = chatSnapshot.val();
      // Get first message sender from existing data
      const firstMessageKey = Object.keys(existingChatData.messages)[0];
      if (firstMessageKey) {
        firstMessageSender = existingChatData.messages[firstMessageKey].sender;
        firstMessageSenderName = existingChatData.messages[firstMessageKey].senderName;
      }
    }

    // Generate new message key
    const newMessageKey = db.ref(`chats/${chatId}/messages`).push().key;

    // Prepare all updates in a single object
    const updates = {};

    if (!chatExists) {
      // New chat updates
      updates[`chats/${chatId}`] = {
        participants,
        createdAt: timestamp,
        lastMessageTimestamp: timestamp,
        firstMessage: text,
        lastMessage: text,
        messages: {
          [newMessageKey]: {
            text,
            sender: senderEmailKey,
            senderName,
            timestamp,
          },
        },
      };
    } else {
      // Existing chat updates
      updates[`chats/${chatId}/messages/${newMessageKey}`] = {
        text,
        sender: senderEmailKey,
        senderName,
        timestamp,
      };
      updates[`chats/${chatId}/lastMessage`] = text;
      updates[`chats/${chatId}/lastMessageTimestamp`] = timestamp;
    }

    // Add userChats updates - participants are already sanitized
    participants.forEach((participantEmailKey) => {
      const userChatPath = `userChats/${participantEmailKey}/${chatId}`;

      if (!chatExists) {
        // New chat - set all initial fields
        updates[userChatPath] = {
          lastMessage: text,
          lastMessageTimestamp: timestamp,
          active: true,
          timestamp,
          firstMessage: text,
          participants, // Add participants array
          firstMessageSender,
          firstMessageSenderName,
          lastMessageSender: senderEmailKey,
          lastMessageSenderName: senderName,
          createdAt: timestamp,
        };
      } else {
        // Existing chat - update necessary fields
        updates[userChatPath] = {
          ...(!updates[userChatPath] ? {} : updates[userChatPath]), // Preserve existing fields if any
          lastMessage: text,
          lastMessageTimestamp: timestamp,
          timestamp,
          active: true,
          lastMessageSender: senderEmailKey,
          lastMessageSenderName: senderName,
          // Preserve these fields if they don't exist
          firstMessage: existingChatData?.firstMessage || text,
          firstMessageSender: firstMessageSender,
          firstMessageSenderName: firstMessageSenderName,
          participants: existingChatData?.participants || participants,
          createdAt: existingChatData?.createdAt || timestamp,
        };
      }
    });

    // Update mustRespond to false for the sender in notifications
    updates[`notifications/${senderEmailKey}/${chatId}/mustRespond`] = false;

    // Perform all updates atomically
    await db.ref().update(updates);

    console.log('Message sent successfully:', { chatId, messageId: newMessageKey });

    return {
      success: true,
      timestamp,
      messageId: newMessageKey,
      chatId,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    // Provide more specific error messages
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send message: ' + error.message
    );
  }
});


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
  const userEmail = context.auth.token.email;
  const userEmailKey = sanitizeEmail(userEmail); // Use the standardized utility function
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
      // Filter using the standardized sanitized email format
      const updatedParticipants = chatData.participants.filter(
        (participantEmail) => participantEmail !== userEmailKey
      );
      await db.ref(`chats/${chatId}`).update({ participants: updatedParticipants });
    }

    // Mark the chat as inactive in the user's userChats entry
    await db.ref(`userChats/${userEmailKey}/${chatId}`).update({
      active: false
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
 * Also handles mustRespond status updates.
 */
const sendChatNotification = functions.database.ref('/chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val();
    const { chatId } = context.params;

    if (!message || message.sender === 'system') return null;

    try {
      const db = admin.database();
      
      // Get chat data including active viewers
      const chatSnapshot = await db.ref(`/chats/${chatId}`).once('value');
      const chatData = chatSnapshot.val();

      if (!chatData?.participants) {
        console.error('Chat data or participants not found.');
        return null;
      }

      const now = Date.now();
      const activeThreshold = 45000; // 45 seconds threshold (30 second heartbeat + 15 second buffer)

      // Filter out participants who are active viewers
      const notificationRecipients = chatData.participants.filter(participantEmail => {
        // Don't notify the sender
        if (participantEmail === message.sender) return false;
        
        // Check if participant is an active viewer
        const userKey = sanitizeEmail(participantEmail);
        const activeData = chatData.activeViewers?.[userKey];
        
        // If no active data or timestamp is old, user should receive notification
        return !activeData?.timestamp || 
               (now - activeData.timestamp > activeThreshold);
      });

      // Send notifications only to non-active participants
      const notificationPromises = notificationRecipients.map(async recipientEmail => {
        const recipientKey = sanitizeEmail(recipientEmail);
        const notificationRef = db.ref(`/notifications/${recipientKey}/${chatId}`);
        
        const notificationData = {
          type: 'new_message',
          chatId,
          sender: message.sender,
          senderName: message.senderName,
          preview: message.text.substring(0, 50),
          timestamp: admin.database.ServerValue.TIMESTAMP,
          unreadCount: 1,
          read: false,
          isStaff: message.sender.includes('@rtdacademy.com')
        };

        const existingSnapshot = await notificationRef.once('value');
        if (existingSnapshot.exists()) {
          // Update existing notification
          await notificationRef.update({
            ...notificationData,
            unreadCount: (existingSnapshot.val().unreadCount || 0) + 1
          });
        } else {
          // Create new notification
          await notificationRef.set(notificationData);
        }
      });

      await Promise.all(notificationPromises);
      console.log(`Notifications sent to ${notificationRecipients.length} recipients`);

    } catch (error) {
      console.error('Error processing notifications:', error);
    }

    return null;
  });

module.exports = {
  sendChatMessage,
  removeUserFromChat,
  sendChatNotification,
};