const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient can be either a User or ClientUser
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: true,
  },
  recipientModel: {
    type: String,
    enum: ['User', 'ClientUser'],
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    index: true,
  },
  // Sender is always a user
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
  },

  // Notification content
  type: {
    type: String,
    enum: ["TRANSACTION", "SYSTEM", "REMINDER", "NEW_INVOICE", "INVOICE_SENT", "INVOICE", "MESSAGE"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },

  // Related content reference (simplified)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "relatedModel",
  },
  relatedModel: {
    type: String,
    enum: ["Transaction", "Book", "Invoice", "Message"],
  },
  relatedAction: {
    type: String,
    enum: ["created", "updated", "deleted"],
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Add compound index for email queries
notificationSchema.index({ recipientEmail: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 