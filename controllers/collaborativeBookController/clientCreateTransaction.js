const Transaction = require("../../models/transactionModel/transactionModel");
const Client = require("../../models/clientUserModel/clientUserModel");
const User = require("../../models/userModel/userModel");
const notificationapi = require("notificationapi-node-server-sdk").default;
const upload = require("../../middleware/uploadMiddleware"); // Multer middleware for file uploads
const notificationController = require("../notificationController/notificationController");
const axios = require("axios");
const admin = require("../../firebase-admin");
const Token = require("../../models/tokenModel/Token");
const Book = require("../../models/bookModel/bookModel");



require("dotenv").config();
notificationapi.init(
  process.env.NotificationclientId,
  process.env.NotificationclientSecret
);

const addExistingTransaction = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    // console.log("Transaction ID is here:", transactionId);

    const {
      transactionType,
      amount,
      description,
      confirmationStatus = "pending", // Default to pending if not provided
    } = req.body;

    const userId = req.user.id; // Get the user ID from the authenticated user
    const initiatedBy = req.user.name; // Get the user name from the authenticated user
    const initiaterId = req.user.id; // Get the user ID from the authenticated user

    // Validate required fields
    if (!transactionId || !transactionType || !amount) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID, type, and amount are required",
      });
    }

    // Find the transaction document by ID
    const transaction = await Transaction.findById(transactionId)
      .populate("userId", "name email") // Populate user with name and email
      .populate("clientUserId", "name email")
      .populate("bookId"); // Populate clientUser with name, email, and phone

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    // console.log("Transaction Found:", transaction);
    // console.log("Logged-in User ID:", userId);
    // console.log("Transaction User Email:", transaction.userId?.email);
    // console.log("Transaction ClientUser Email:", transaction.clientUserId?.email);

    const lastOutstandingBalance = transaction.outstandingBalance;

    // Handle file upload
    let mediaFile = null;
    if (req.file) {
      mediaFile = req.file.path; // Save the file path from the uploaded file
    }
    // Find the correct sender using email
    let sender = await User.findOne({ email: req.user.email });
    if (!sender) {
      console.error("Sender User not found for email:", req.user.email);
      return res.status(404).json({
        success: false,
        message: "Sender not found in User model",
      });
    }

    // Find the correct recipient (opposite party)
    let recipientEmail =
      req.user.email === transaction.userId?.email
        ? transaction.clientUserId?.email
        : transaction.userId?.email;

    let recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      console.error("Recipient User not found for email:", recipientEmail);
      return res.status(404).json({
        success: false,
        message: "Recipient not found in User model",
      });
    }

    // Debugging logs
    // console.log("Final Sender:", sender._id, sender.email);
    // console.log("Final Recipient:", recipient._id, recipient.email);
    // Prepare the new transaction entry
    const newTransaction = {
      transactionType,
      amount,
      description,
      confirmationStatus,
      initiatedBy,
      initiaterId,
      outstandingBalance: lastOutstandingBalance, // Set the current outstanding balance
      transactionDate: new Date(),
      file: mediaFile, // Include the uploaded file path, if any
    };

    // Append the new transaction to the transaction history
    transaction.transactionHistory.push(newTransaction);

    // Update outstanding balance only if the transaction is confirmed
    if (confirmationStatus === "confirmed") {
      if (transactionType === "you will get") {
        transaction.outstandingBalance += amount;
      } else if (transactionType === "you will give") {
        transaction.outstandingBalance -= amount;
      }
    }

    // Save the updated transaction document
    const updatedTransaction = await transaction.save();

    // After successfully adding to transaction history
    await notificationController.clientCreateNotification({
      recipient: recipient._id,
      sender: sender._id,
      type: "TRANSACTION",
      title: "Transaction Entry Added",
      message: `${initiatedBy} added a new entry of ${amount} (${transactionType})`,
      relatedId: transaction._id,
      onModel: "Transaction",
      actionType: "created",
    });

    // Fetch client details for email/SMS notification
    const client = await Client.findOne({ email: recipientEmail });
    // console.log("Client ID:", client);
    if (client) {
      // Prepare the email/SMS notification payload

      const notificationData = {
        notificationId: process.env.NOTIFICATION_API_KEY,
        user: {
          id: client._id,
          email: recipientEmail,
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

      // Send the email/SMS notification
      try {
        await notificationapi.send(notificationData);
        console.log("Email/SMS notification sent successfully");
      } catch (notifyError) {
        console.error("Error sending email/SMS notification:", notifyError);
      }
    }

    console.log("Adding transaction entry:", {
      recipientEmail,
      initiatedBy,
      amount,
      transactionId: transaction._id,
    });

  const bookId = transaction.bookId;
    const book = await Book.findById(bookId);
    const bookName = book ? book.bookname : "Unknown Book";



  let recipientUser = await User.findOne({ email: recipient.email });

  if (recipientUser) {
    let userToken = await Token.findOne({ userId: recipientUser._id });
    console.log("userToken", userToken);

    if (userToken && userToken.token) {
      const message = {
        token: userToken.token,
        notification: {
          title: "Transaction Entry Added",
          body: `${req.user.name} confirmed a transaction entry in your transaction book named ${bookName}`,
        },
        data: {
          transactionId: transaction._id.toString(),
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
        console.log("message", message);
      }
    } else {
      console.log("⚠️ FCM Token not found for recipient user.");
    }
  } else {
    console.log("⚠️ Recipient user not found in User model.");
  }
    // Send the updated transaction back in the response
    res.status(200).json({
      success: true,
      message: "Transaction added successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("❌ Error adding transaction:", {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      transactionId: req.params.transactionId,
    });

    // Handle any unexpected errors
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the transaction",
      error: error.message,
    });
  }
};


module.exports = {
  addExistingTransaction,
};