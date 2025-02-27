

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

const confirmTransaction = async (req, res) => {
  try {
    // console.log("Authenticated User in confirmTransaction:", req.user);

    // Ensure req.user is available
    if (!req.user) {
      console.error("Error: req.user is undefined inside confirmTransaction.");
      return res
        .status(401)
        .json({ message: "Unauthorized. User not authenticated." });
    }

    if (!req.user.id) {
      console.error(
        "Error: req.user.id is undefined inside confirmTransaction."
      );
      return res
        .status(400)
        .json({ message: "User ID is missing from request." });
    }

    const { transactionId, entryId } = req.params;
    // console.log("Incoming Request Params:", { transactionId, entryId });

    const transaction = await Transaction.findById(transactionId)
      .populate("userId", "name email")
      .populate("clientUserId", "name email");

    if (!transaction) {
      console.error(`Error: Transaction with ID ${transactionId} not found.`);
      return res.status(404).json({ message: "Transaction not found." });
    }

    // console.log("Fetched Transaction:", transaction);

    const entryIndex = transaction.transactionHistory.findIndex(
      (entry) => entry._id.toString() === entryId
    );

    if (entryIndex === -1) {
      console.error(`Error: Transaction entry with ID ${entryId} not found.`);
      return res.status(404).json({ message: "Transaction entry not found." });
    }

    const pendingEntry = transaction.transactionHistory[entryIndex];

    if (pendingEntry.confirmationStatus !== "pending") {
      console.warn(
        "Warning: This transaction entry has already been confirmed."
      );
      return res.status(400).json({
        message: "This transaction entry has already been confirmed.",
      });
    }

    pendingEntry.confirmationStatus = "confirmed";

    let newOutstandingBalance = 0;

    transaction.transactionHistory.forEach((entry) => {
      if (entry.confirmationStatus === "confirmed") {
        if (entry.transactionType === "you will get") {
          newOutstandingBalance += entry.amount;
        } else if (entry.transactionType === "you will give") {
          newOutstandingBalance -= entry.amount;
        }
      }
    });

    transaction.outstandingBalance = newOutstandingBalance;
    await transaction.save();

    // Ensure userId and clientUserId exist
    if (!transaction.userId || !transaction.clientUserId) {
      console.error(
        "Error: Either transaction.userId or transaction.clientUserId is missing."
      );
      return res
        .status(500)
        .json({ message: "Transaction data is incomplete." });
    }

    // console.log("Transaction Users:", {
    //   userId: transaction.userId._id,
    //   clientUserId: transaction.clientUserId._id,
    // });

    // Determine sender
    const sender = await User.findById(req.user.id);
    if (!sender) {
      console.error(`Error: Sender User with ID ${req.user.id} not found.`);
      return res
        .status(404)
        .json({ message: "Sender not found in User model." });
    }
      const bookId = transaction.bookId;
 const book = await Book.findById(bookId);
const bookName = book ? book.bookname : "Unknown Book";
    // Determine recipient (opposite party)
    const recipient =
      sender._id.toString() === transaction.userId._id.toString()
        ? transaction.clientUserId
        : transaction.userId;

    if (!recipient || !recipient.email) {
      console.error(
        "Error: Recipient User not found or missing email:",
        recipient
      );
      return res
        .status(404)
        .json({ message: "Recipient not found in User model." });
    }

    // console.log("Final Sender:", sender._id, sender.email);
    // console.log("Final Recipient:", recipient._id, recipient.email);

    // Send Notification
    await notificationController.clientCreateNotification({
      recipient: recipient._id,
      sender: sender._id,
      type: "TRANSACTION",
      title: "Transaction Confirmed",
      message: `${sender.name} confirmed the transaction of ${pendingEntry.amount}`,
      relatedId: transaction._id,
      onModel: "Transaction",
      actionType: "updated",
    });

    // Send FCM WebPush notification
 let recipientUser = await User.findOne({ email: recipient.email });

    if (recipientUser) {
      let userToken = await Token.findOne({ userId: recipientUser._id });
      console.log("userToken", userToken);

      if (userToken && userToken.token) {
        const message = {
          token: userToken.token,
          notification: {
            title: "Transaction Entry Confirmed",
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

    res.status(200).json({
      message: "Transaction entry confirmed.",
      transaction,
    });
  } catch (error) {
    console.error("Error in confirmTransaction function:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { confirmTransaction };