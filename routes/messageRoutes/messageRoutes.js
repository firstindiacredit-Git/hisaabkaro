const express = require('express');
const messageController = require('../../controllers/messageController/messageController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Message routes
router.post('/send', messageController.sendMessage);
router.get("/messages/:transactionId/:entryId", messageController.getMessages);
router.patch("/messages/:transactionId/read", messageController.markMessagesAsRead);
router.get("/messages/unread/count", messageController.getUnreadCount);
// router.get("", authenticateUser, getMessages);

module.exports = router;
