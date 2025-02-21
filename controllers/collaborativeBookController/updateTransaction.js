const Transaction = require("../../models/transactionModel/transactionModel");
const Client = require("../../models/clientUserModel/clientUserModel");
const User = require("../../models/userModel/userModel");
const notificationapi = require("notificationapi-node-server-sdk").default;
const upload = require("../../middleware/uploadMiddleware"); // Multer middleware for file uploads
const notificationController = require("../notificationController");
const Book = require("../../models/bookModel/bookModel");
const Token = require("../../models/tokenModel/Token");
const admin = require("../../firebase-admin");


require("dotenv").config();
notificationapi.init(
  process.env.NotificationclientId,
  process.env.NotificationclientSecret
);

const updateTransaction = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    const { amount, description, transactionType } = req.body;
    const userId = req.user.id;

    if (!transactionId || !entryId) {
      return res
        .status(400)
        .json({ message: "Missing required transaction IDs." });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number." });
    }

    if (
      transactionType &&
      !["you will get", "you will give"].includes(transactionType)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid transaction type provided." });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate("userId", "name email")
      .populate("clientUserId", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    const entry = transaction.transactionHistory.id(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Transaction entry not found." });
    }

    if (entry.initiaterId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this transaction.",
      });
    }

    let mediaFile = entry.file;
    if (req.file) {
      mediaFile = req.file.path;
    }

    if (entry.confirmationStatus === "confirmed") {
      if (entry.transactionType === "you will get") {
        transaction.outstandingBalance -= entry.amount;
      } else if (entry.transactionType === "you will give") {
        transaction.outstandingBalance += entry.amount;
      }
      entry.confirmationStatus = "pending";
    }

    if (amount !== undefined) entry.amount = amount;
    if (description !== undefined) entry.description = description;
    if (transactionType !== undefined) entry.transactionType = transactionType;

    entry.transactionDate = new Date();
    entry.file = mediaFile;

    let updatedBalance = 0;
    transaction.transactionHistory.forEach((txn) => {
      if (txn.confirmationStatus === "confirmed") {
        updatedBalance +=
          txn.transactionType === "you will get" ? -txn.amount : txn.amount;
      }
    });
    transaction.outstandingBalance = updatedBalance;

    await transaction.save();
     const bookId = transaction.bookId;
     
const book = await Book.findById(bookId);
const bookName = book ? book.bookname : "Unknown Book";
    // Find the correct sender
    let sender = await User.findOne({ email: req.user.email });
    if (!sender) {
      console.error("Sender User not found for email:", req.user.email);
      return res
        .status(404)
        .json({ message: "Sender not found in User model." });
    }

    // Find the recipient (opposite party)
    let recipientEmail =
      req.user.email === transaction.userId?.email
        ? transaction.clientUserId?.email
        : transaction.userId?.email;

    let recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      console.warn("Recipient User not found for email:", recipientEmail);
      recipient = null; // Allow the operation to continue even if the recipient is not found
    }

    await notificationController.clientCreateNotification({
      recipient: recipient ? recipient._id : null, // Handle the case where recipient is null
      sender: sender._id,
      type: "TRANSACTION",
      title: "Transaction Updated",
      message: `${req.user.name} updated a transaction of ${amount}`,
      relatedId: transaction._id,
      onModel: "Transaction",
      actionType: "updated",
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
            title: "Transaction Entry Updated",
            body: `${req.user.name} updated a transaction entry in your transaction book named ${bookName}`,
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
              click_action: "https://www.hisaabkaro.com",
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
      message: "Transaction updated successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { updateTransaction };
