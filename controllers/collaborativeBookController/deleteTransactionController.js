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

const deleteTransactionEntry = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    const userId = req.user.id; // Authenticated user ID

    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId)
      .populate("userId", "name email")
      .populate("clientUserId", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Find the transaction entry index
    const entryIndex = transaction.transactionHistory.findIndex(
      (entry) => entry._id.toString() === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({ message: "Transaction entry not found." });
    }

    // Check if the user is the initiator of the entry
    const entry = transaction.transactionHistory[entryIndex];
    if (entry.initiaterId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this transaction entry.",
      });
    }

    // Remove the entry from the transaction history
    const [removedEntry] = transaction.transactionHistory.splice(entryIndex, 1);

    // Update the outstanding balance
    if (removedEntry.confirmationStatus === "confirmed") {
      const adjustment =
        removedEntry.transactionType === "you will get"
          ? -removedEntry.amount // Decrease balance if it was "you will get"
          : removedEntry.amount; // Increase balance if it was "you will give"

      transaction.outstandingBalance += adjustment;
    }

    // Save the updated transaction
    await transaction.save();
    // Find the book name

    const bookId = transaction.bookId;
const book = await Book.findById(bookId);
const bookName = book ? book.bookname : "Unknown Book";

    // Find the correct sender (logged-in user)
    let sender = await User.findOne({ email: req.user.email });
    if (!sender) {
      console.error("Sender User not found for email:", req.user.email);
      return res
        .status(404)
        .json({ message: "Sender not found in User model." });
    }

    // Find the correct recipient (opposite party)
    let recipientEmail =
      req.user.email === transaction.userId?.email
        ? transaction.clientUserId?.email
        : transaction.userId?.email;

    let recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      console.error("Recipient User not found for email:", recipientEmail);
      return res
        .status(404)
        .json({ message: "Recipient not found in User model." });
    }

    // console.log("Final Sender:", sender._id, sender.email);
    // console.log("Final Recipient:", recipient._id, recipient.email);

    // Send notification to the opposite party
    await notificationController.clientCreateNotification({
      recipient: recipient._id,
      sender: sender._id,
      type: "TRANSACTION",
      title: "Transaction Entry Deleted",
      message: `${req.user.name} deleted a transaction entry in the book named ${bookName}`,
      relatedId: transaction._id,
      onModel: "Transaction",
      actionType: "deleted",
    });

    // Send FCM notification
    // Send FCM WebPush notification
    let recipientUser = await User.findOne({ email: recipientEmail });
    if (recipientUser) {
      let userToken = await Token.findOne({ userId: recipientUser._id });
console.log("userToken", userToken);

      if (userToken && userToken.token) {
        const message = {
          token: userToken.token,
          notification: {
            title: "Transaction Entry Deleted",
            body: `${req.user.name} deleted a transaction entry in your transaction book named ${bookName}`,
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
      message: "Transaction entry deleted successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error deleting transaction entry:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteTransactionEntry };
