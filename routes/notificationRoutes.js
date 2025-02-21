const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendNotification,
  clearAllNotifications,
  clearReadNotifications,
  saveToken,
  sendNotificationToAll
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/notificationModel');
const { emitNotification } = require('../index');

// Debug route to check all notifications without any filters
router.get('/debug/all', protect, async (req, res) => {
  try {
    // Raw MongoDB query to check all documents
    const allDocs = await Notification.collection.find({}).toArray();
    console.log('Raw MongoDB documents:', allDocs);

    // Check with Mongoose
    const allNotifications = await Notification.find({});
    console.log('Mongoose documents:', allNotifications);

    // Check specific user's notifications
    const userNotifications = await Notification.find({ 
      recipient: req.user.id 
    });
    console.log('User specific notifications:', userNotifications);

    // Check collection stats
    const stats = await Notification.collection.stats();
    console.log('Collection stats:', stats);

    res.json({
      success: true,
      stats: stats,
      rawCount: allDocs.length,
      mongooseCount: allNotifications.length,
      userCount: userNotifications.length,
      rawDocs: allDocs,
      mongooseDocs: allNotifications,
      userDocs: userNotifications
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

// Add this new debug route
router.get('/debug/match/:userId', protect, async (req, res) => {
  try {
    const testId = req.params.userId;
    const notifications = await Notification.find({});
    
    const matches = notifications.map(notif => ({
      notificationId: notif._id,
      recipientId: notif.recipient,
      recipientIdString: notif.recipient.toString(),
      doesMatch: notif.recipient.toString() === testId,
      testId: testId
    }));

    res.json({
      success: true,
      matches,
      currentUserId: req.user.id,
      notificationCount: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove the /notifications prefix as it's already added in index.js
router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markAsRead);
router.patch('/mark-all-read', protect, markAllAsRead);
router.post('/send', protect, async (req, res) => {
  try {
    const notification = new Notification({
      // ... notification data
    });
    await notification.save();

    // Emit the notification immediately after creation
    emitNotification(notification, recipientEmail);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    // ... error handling
  }
});

// Add these new routes
router.delete('/clear-all', protect, clearAllNotifications);
router.delete('/clear-read', protect, clearReadNotifications);

// Save FCM token
// router.post("/api/save-token", saveToken);

// Send notification to specific token
// router.post("/send", sendNotification);

// Send notification to all tokens
// router.post("/send-all", sendNotificationToAll);

module.exports = router;