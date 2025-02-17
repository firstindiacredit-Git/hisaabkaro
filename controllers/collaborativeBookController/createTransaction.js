const Transaction = require("../../models/transactionModel/transactionModel");
const Client = require("../../models/clientUserModel/clientUserModel");
const User = require("../../models/userModel/userModel");
const notificationapi = require("notificationapi-node-server-sdk").default;
const upload = require("../../middleware/uploadMiddleware"); // Multer middleware for file uploads
const notificationController = require("../notificationController");
const axios = require("axios");
const admin = require("../../firebase-admin");
const Token = require("../../models/tokenModel/Token");

require("dotenv").config();

notificationapi.init(
  process.env.NotificationclientId,
  process.env.NotificationclientSecret
);


const createTransaction = async (req, res) => {
  try {
    const { bookId, clientUserId, transactionType, amount, description } =
      req.body;

    const userId = req.user.id; // Get the user ID from the authenticated user
    const initiatedBy = req.user.name; // Get the user name from the authenticated user
    const initiaterId = req.user.id;

    // Validate input
    if (!bookId) {
      return res.status(400).json({ message: "Book ID is not provided." });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is not provided." });
    }
    if (!clientUserId) {
      return res
        .status(400)
        .json({ message: "Client User ID is not provided." });
    }
    if (!transactionType) {
      return res
        .status(400)
        .json({ message: "Transaction type is not provided." });
    }
    if (!amount) {
      return res.status(400).json({ message: "Amount is not provided." });
    }
    if (!initiatedBy) {
      return res.status(400).json({ message: "Initiated By is not provided." });
    }
    if (!initiaterId) {
      return res.status(400).json({ message: "Initiater ID is not provided." });
    }

    // Parse amount to a number if it's a string
    let parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Validate the amount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number.",
      });
    }

    // Update the `amount` variable to use the parsed value
    req.body.amount = parsedAmount;

    if (!["you will get", "you will give"].includes(transactionType)) {
      return res
        .status(400)
        .json({ message: "Invalid transaction type provided." });
    }

    // Handle file uploads
    let mediaFile = null;
    if (req.file) {
      mediaFile = req.file.path; // Save the path of the uploaded file
    }

    // Check if a transaction already exists for the same client, book, and user
    let existingTransaction = await Transaction.findOne({
      bookId,
      userId,
      clientUserId,
    });

    let transaction;
    if (existingTransaction) {
      // Update transaction history
      existingTransaction.transactionHistory.push({
        transactionType,
        amount,
        description,
        initiatedBy,
        initiaterId,
        transactionDate: new Date(),
        outstandingBalance: existingTransaction.outstandingBalance,
        confirmationStatus: "pending",
        file: mediaFile,
      });

      // Save the updated transaction
      transaction = await existingTransaction.save();

      // Send notification for existing transaction update
      await notificationController.createNotification({
        recipient: clientUserId,
        sender: userId,
        type: "TRANSACTION",
        title: "Transaction Entry Added",
        message: `${initiatedBy} added a new transaction entry of ${amount} (${transactionType})`,
        relatedId: transaction._id,
        onModel: "Transaction",
        actionType: "updated",
      });

      res.status(200).json({
        message: "Transaction Added successfully.",
        transaction,
      });
    } else {
      // Create a new transaction
      transaction = await Transaction.create({
        bookId,
        userId,
        clientUserId,
        transactionHistory: [
          {
            transactionType,
            amount,
            description,
            initiatedBy,
            initiaterId,
            transactionDate: new Date(),
            outstandingBalance: 0,
            confirmationStatus: "pending",
            file: mediaFile,
          },
        ],
        outstandingBalance: 0,
      });

      // Add debug logs before creating notification
      // console.log('Creating notification for new transaction:', {
      //   recipient: clientUserId,
      //   sender: userId,
      //   type: 'TRANSACTION',
      //   title: 'New Transaction Created',
      //   message: `${initiatedBy} created a new transaction of ${amount} (${transactionType})`,
      //   relatedId: transaction._id,
      //   onModel: 'Transaction',
      //   actionType: 'created'
      // });

      try {
        await notificationController.createNotification({
          recipient: clientUserId,
          sender: userId,
          type: "TRANSACTION",
          title: "New Transaction Created",
          message: `${initiatedBy} created a new transaction of ${amount} (${transactionType})`,
          relatedId: transaction._id,
          onModel: "Transaction",
          actionType: "created",
        });
        console.log("Notification created successfully");
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't throw error as this is a secondary operation
      }

      res.status(201).json({
        message: "Transaction created successfully.",
        transaction,
      });
    }

    // Fetch client details for email/SMS notification if needed
    const client = await Client.findById(clientUserId);
    if (client) {
      // Send email/SMS notification using notificationapi
      const notificationData = {
        notificationId: process.env.NOTIFICATION_API_KEY,
        user: {
          id: clientUserId,
          email: client.email,
          number: client.mobile,
        },
        mergeTags: {
          transactionType,
          amount: amount,
          description,
          initiatedBy,
          date: new Date().toLocaleDateString(),
        },
      };

      try {
        await notificationapi.send(notificationData);
      } catch (notifyError) {
        console.error("Error sending email/SMS notification:", notifyError);
        // Don't throw error as this is a secondary notification
      }
    }

    console.log("Creating transaction:", {
      clientEmail: client.email,
      initiatedBy,
      amount,
      transactionId: transaction._id,
    });

    // Send FCM notification

    // Send FCM WebPush notification
    let recipientUser = await User.findOne({ email: client.email });

    if (recipientUser) {
      let userToken = await Token.findOne({ userId: recipientUser._id });

      if (userToken && userToken.token) {
        const message = {
          token: userToken.token,
          notification: {
            title: "New Transaction Notification",
            body: `${initiatedBy} added a transaction of ${amount} (${transactionType})`,
          },
          data: {
            transactionId: transaction._id.toString(),
            bookId: bookId.toString(),
          },
          android: {
            priority: "high",
          },
          webpush: {
            headers: {
              Urgency: "high",
            },
            notification: {
              icon: "/logo192.png",
              badge: "/badge.png",
              click_action: "https://www.hisaabkaro.com/transactions",
            },
          },
        };

        try {
          await admin.messaging().send(message);
          console.log("✅ FCM Notification sent successfully");
        } catch (fcmError) {
          console.error("❌ Error sending FCM notification:", fcmError);
        }
      } else {
        console.log("⚠️ FCM Token not found for recipient user.");
      }
    } else {
      console.log("⚠️ Recipient user not found in User model.");
    }
  } catch (error) {
    console.error("❌ Error in createTransaction:", {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Error creating transaction.",
      error: error.message,
    });
  }
};

module.exports = {
   
  createTransaction
   
};