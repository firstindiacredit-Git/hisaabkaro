const Notification = require('../models/notificationModel');
const User = require('../models/userModel/userModel');
const ClientUser = require('../models/clientUserModel/clientUserModel');
const socketService = require('../services/socketService');
const Transaction = require('../models/transactionModel/transactionModel');
const mongoose = require('mongoose');

const getNotifications = async (req, res) => {
  try {
    // Get notifications where recipientEmail matches user's email
    const notifications = await Notification.find({ 
      recipientEmail: req.user.email 
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email')
    .populate('recipient', 'name email businessName')
    .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add helper function to swap transaction type
const swapTransactionMessage = (message) => {
  if (message.toLowerCase().includes('will get')) {
    return message.replace(/will get/i, 'will give');
  } else if (message.toLowerCase().includes('will give')) {
    return message.replace(/will give/i, 'will get');
  }
  return message;
};


const createNotification = async (notificationData) => {
  try {
    // Get sender (user) details
    const sender = await User.findById(notificationData.sender);
    if (!sender) {
      throw new Error('Sender not found');
    }

    // Get recipient (client) details
    const recipient = await ClientUser.findById(notificationData.recipient);
    if (!recipient) {
      throw new Error('Recipient not found');
    }



    


    const swappedMessage = swapTransactionMessage(notificationData.message);
    console.log('Original message:', notificationData.message);
    console.log('Swapped message:', swappedMessage);

    const notification = await Notification.create({
      recipient: recipient._id,
      recipientEmail: recipient.email,
      sender: sender._id,
      senderEmail: sender.email,
      type: notificationData.type,
      title: notificationData.title,
      message: swappedMessage, // Use the swapped message
      relatedId: notificationData.relatedId,
      relatedModel: notificationData.onModel,
      relatedAction: notificationData.actionType || 'created'
    });

    // Populate the notification for socket emission
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email businessName');

    console.log('Created notification:', {
      id: notification._id,
      recipientEmail: notification.recipientEmail,
      senderEmail: notification.senderEmail,
      message: notification.message // Log the final message
    });

    // Emit socket event using recipient's email
    const io = socketService.getIO();
    io.to(`client_${notification.recipientEmail}`).emit('newNotification', populatedNotification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if the user's email matches the recipient email
    if (notification.recipientEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    // Mark all notifications as read where recipientEmail matches user's email
    await Notification.updateMany(
      { recipientEmail: req.user.email },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type = 'SYSTEM' } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID, title, and message are required'
      });
    }

    const notificationData = {
      recipient: recipientId,
      sender: req.user.id,
      type,
      title,
      message,
      createdAt: new Date(),
      isRead: false
    };

    const notification = await Notification.create(notificationData);
    
    // Get socket instance and emit notification
    const io = socketService.getIO();
    io.to(`client_${recipientId}`).emit('newNotification', notification);

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipientEmail: req.user.email });
    
    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ 
      recipientEmail: req.user.email,
      isRead: true 
    });
    
    res.status(200).json({
      success: true,
      message: 'Read notifications cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const clientCreateNotification = async (notificationData) => {
  try {
    // Get sender details (who initiated the transaction)
    const sender = await User.findById(notificationData.sender);
    if (!sender) {
      throw new Error('Sender not found');
    }

    // Retrieve transaction details to determine the correct recipient
    const transaction = await Transaction.findById(notificationData.relatedId)
      .populate('userId', 'name email') // Main user (original creator of the book)
      .populate('clientUserId', 'name email'); // Client user (secondary party)

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    let recipient;

    if (String(sender._id) === String(transaction.userId._id)) {
      // If sender is the original user (Hardeep Singh), notify clientUser (Pranjal Tiwari)
      recipient = transaction.clientUserId;
    } else {
      // If sender is the client user (Pranjal Tiwari), notify the original user (Hardeep Singh)
      recipient = transaction.userId;
    }

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Prevent self-notifications
    if (String(sender._id) === String(recipient._id)) {
      console.log('Skipping notification: Sender and recipient are the same.');
      return;
    }

  

    // Create notification
    const notification = await Notification.create({
      recipient: recipient._id,
      recipientEmail: recipient.email,
      sender: sender._id,
      senderEmail: sender.email,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedId: notificationData.relatedId,
      relatedModel: notificationData.onModel,
      relatedAction: notificationData.actionType || 'created',
    });

    // Populate the notification for socket emission
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email businessName');

    console.log('Created notification:', {
      id: notification._id,
      recipientEmail: notification.recipientEmail,
      senderEmail: notification.senderEmail,
      message: notification.message,
    });

    // Emit socket event using recipient's email
    const io = socketService.getIO();
    io.to(`client_${notification.recipientEmail}`).emit('newNotification', populatedNotification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Export all functions
module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  clientCreateNotification,
  sendNotification,
  clearAllNotifications,
  clearReadNotifications
};

// Add console.log to verify exports
// console.log('Exporting notification controller:', module.exports);
