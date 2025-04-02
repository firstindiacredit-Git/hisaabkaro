const Message = require('../../models/messageModel/messageModel');
const Transaction = require('../../models/transactionModel/transactionModel');
const mongoose = require("mongoose"); // Ensure mongoose is required
const User = require('../../models/userModel/userModel');
const notificationController = require('../notificationController/notificationController');
const Book = require('../../models/bookModel/bookModel');

exports.sendMessage = async (req, res) => {
  try {
    const { transactionId, message, entryId } = req.body;
    const senderEmail = req.user.email;
    const senderId = new mongoose.Types.ObjectId(req.user.id);

    if (!transactionId || !message || !entryId) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid Transaction ID format" });
    }

    // Fetch transaction details and populate user information
    const transaction = await Transaction.findById(transactionId).populate([
      { path: "userId", select: "name email" },
      { path: "clientUserId", select: "name email" },
      { path: "bookId", select: "bookname" }
    ]);

    if (!transaction) {
      return res
        .status(404)
        .json({ status: "error", message: "Transaction not found" });
    }

    // ✅ Determine Sender and Recipient
    let recipientId = null,
      recipientName = null,
      recipientEmail = null;

    if (transaction.userId.email === senderEmail) {
      // **User A** is sending -> Recipient should be **Client User B**
      if (transaction.clientUserId) {
        recipientId = transaction.clientUserId._id;
        recipientName = transaction.clientUserId.name;
        recipientEmail = transaction.clientUserId.email;
      }
    } else if (
      transaction.clientUserId &&
      transaction.clientUserId.email === senderEmail
    ) {
      // **Client User B** is sending -> Recipient should be **User A**
      recipientId = transaction.userId._id;
      recipientName = transaction.userId.name;
      recipientEmail = transaction.userId.email;
    } else {
      return res
        .status(403)
        .json({
          status: "error",
          message:
            "Unauthorized: You cannot send messages for this transaction",
        });
    }

    if (!recipientId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Recipient details could not be determined",
        });
    }

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid Entry ID format" });
    }

    const entryExists = transaction.transactionHistory.some(
      (entry) => entry._id.toString() === entryId
    );

    if (!entryExists) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Entry ID not found in transaction history",
        });
    }

    // ✅ Create the message
    let newMessage = await Message.create({
      transactionId,
      entryId,
      sender: {
        _id: senderId,
        name: req.user.name,
        email: senderEmail,
      },
      recipient: {
        _id: recipientId,
        name: recipientName,
        email: recipientEmail,
      },
      message,
    });

    // Send notification for the new message
    try {
      // Determine recipient model
      const recipientModel = transaction.userId.email === senderEmail ? "ClientUser" : "User";
      
      await notificationController.createNotification({
        recipient: recipientId,
        recipientModel: recipientModel,
        sender: senderId,
        type: "MESSAGE",
        title: "New Message",
        message: `${req.user.name} sent you a message about a transaction of ${transaction.transactionHistory.find(entry => entry._id.toString() === entryId)?.amount || 'unknown amount'} in the book "${transaction.bookId?.bookname || 'Unknown Book'}"`,
        relatedId: transactionId,
        onModel: "Transaction",
        actionType: "created",
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't throw error as this is a secondary operation
    }

    // ✅ Manually populate response with sender and recipient data
    res.status(201).json({
      status: "success",
      data: {
        message: {
          _id: newMessage._id,
          transactionId: newMessage.transactionId,
          entryId: newMessage.entryId,
          sender: {
            _id: senderId,
            name: req.user.name,
            email: senderEmail,
          },
          recipient: {
            _id: recipientId,
            name: recipientName,
            email: recipientEmail,
          },
          message: newMessage.message,
          isRead: newMessage.isRead,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt,
          __v: newMessage.__v,
        },
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    const userEmail = req.user.email;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!transactionId || !entryId) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Transaction ID and Entry ID are required",
        });
    }

    if (
      !mongoose.Types.ObjectId.isValid(transactionId) ||
      !mongoose.Types.ObjectId.isValid(entryId)
    ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Invalid Transaction ID or Entry ID format",
        });
    }

    // Fetch transaction details and validate user access
    const transaction = await Transaction.findById(transactionId).populate([
      { path: "userId", select: "name email" },
      { path: "clientUserId", select: "name email" },
    ]);

    if (!transaction) {
      return res
        .status(404)
        .json({ status: "error", message: "Transaction not found" });
    }

    // ✅ Check if the user is part of this transaction
    if (
      transaction.userId.email !== userEmail &&
      (!transaction.clientUserId ||
        transaction.clientUserId.email !== userEmail)
    ) {
      return res
        .status(403)
        .json({ status: "error", message: "Unauthorized to view messages" });
    }

    // ✅ Fetch messages related to this transaction and entry ID
    const messages = await Message.find({ transactionId, entryId })
      .sort({ createdAt: 1 }) // Sorting messages in ascending order
      .populate("sender", "name email") // Populate sender's name and email
      .lean();

    // ✅ Ensure recipient details are properly assigned
    const formattedMessages = messages.map((msg) => {
      let recipient = null;

      if (transaction.userId.email === msg.sender.email) {
        recipient = {
          _id: transaction.clientUserId?._id || null,
          name: transaction.clientUserId?.name || null,
          email: transaction.clientUserId?.email || null,
        };
      } else {
        recipient = {
          _id: transaction.userId._id,
          name: transaction.userId.name,
          email: transaction.userId.email,
        };
      }

      return {
        _id: msg._id,
        transactionId: msg.transactionId,
        entryId: msg.entryId,
        sender: msg.sender,
        recipient,
        message: msg.message,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        __v: msg.__v,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        messages: formattedMessages,
        pagination: {
          currentPage: 1, // You can add pagination logic if needed
          totalPages: 1,
          totalMessages: messages.length,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 50,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch messages",
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction ID is required'
      });
    }

    // Verify user has access to this transaction
    const transaction = await Transaction.findOne({
      _id: transactionId,
      $or: [
        { userId: userId },
        { clientUserId: userId }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found or access denied'
      });
    }

    await Message.updateMany(
      {
        transactionId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark messages as read'
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get unread message count'
    });
  }
};
