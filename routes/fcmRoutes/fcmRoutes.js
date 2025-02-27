const express = require('express');
const router = express.Router();
const fcmController = require('../../controllers/fcmController/fcmController');
const { protect } = require('../../middleware/authMiddleware');

// FCM token management
router.post('/token', protect,fcmController.saveToken);
router.delete('/token',protect, fcmController.deleteToken);

// FCM notification sending (protected routes)
router.post('/send/token', protect, fcmController.sendToToken);
router.post('/send/multiple', protect, fcmController.sendToMultiple);
router.post('/send/all', protect, fcmController.sendToAll);

module.exports = router; 