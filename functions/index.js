const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to send push notifications when a bingo number is called
 * This function is triggered when a new document is added to the notificationQueue collection
 */
exports.sendBingoNotifications = onDocumentCreated(
  'games/{gameId}/notificationQueue/{notificationId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log('No data associated with the event');
      return null;
    }
    const data = snap.data();
    
    // Skip if already sent
    if (data.sent) {
      return null;
    }

    const { type, number, fcmTokens } = data;
    
    if (type !== 'numberCalled' || !fcmTokens || fcmTokens.length === 0) {
      console.log('Invalid notification data');
      return null;
    }

    const message = {
      notification: {
        title: 'New Bingo Number Called!',
        body: `Number ${number} has been called`,
      },
      data: {
        type: 'numberCalled',
        number: number,
        gameId: event.params.gameId,
      },
      tokens: fcmTokens,
    };

    try {
      // Send notifications to all tokens
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`Successfully sent ${response.successCount} notifications`);
      console.log(`Failed to send ${response.failureCount} notifications`);

      // Mark as sent
      await snap.ref.update({ sent: true, sentAt: admin.firestore.FieldValue.serverTimestamp() });

      return null;
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  });

