const Transaction = require("../../models/transactionModel/transactionModel");
const Client = require("../../models/clientUserModel/clientUserModel");
const User = require("../../models/userModel/userModel");
const notificationapi = require("notificationapi-node-server-sdk").default;
const upload = require("../../middleware/uploadMiddleware"); // Multer middleware for file uploads
const notificationController = require('../notificationController');
const axios = require('axios');

require("dotenv").config();

notificationapi.init(process.env.NotificationclientId, process.env.NotificationclientSecret);

// Fetch transactions for a user or client
const getTransactions = async (req, res) => {
  try {
    // Assuming the client/user is logged in and their ID is available via the session or token
    const loggedInUserId = req.user.id; // Get from req.user if authenticated via JWT or session

    const transactions = await Transaction.find({
      userId: loggedInUserId,
    })
      .populate({
        path: "userId",
        select: "-password", // Exclude the password field
      })
      .populate("clientUserId bookId") // Populate related user, client, and book details
      .lean({ virtuals: true }); // Include virtual fields like `visibleTransactionType`

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found." });
    }

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch transactions for a client
const getTransactionstoclient = async (req, res) => {
  try {
    // Step 1: Find all clients with the same email as the logged-in user
    const clients = await Client.find({ email: req.user.email });
    if (!clients || clients.length === 0) {
     return res.status(200).json({ transactions: [] }); 
    }

    // Collect all client IDs to use in the query
    const clientIds = clients.map((client) => client._id);

    // Step 2: Query the Transaction model to get all transactions related to any of these client IDs
    const transactions = await Transaction.find({
      clientUserId: { $in: clientIds }, // Match transactions where the client is involved
    })
      .populate({
        path: "userId",
        select: "-password", // Exclude the password field
      })
      .populate("clientUserId bookId") // Populate related user, client, and book details
      .lean(); // Returns plain JavaScript objects

      if (!transactions || transactions.length === 0) {
        return res.status(200).json({ transactions: [] });
      }

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new transaction
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
      return res
        .status(400)
        .json({ message: "Initiated By is not provided." });
    }
    if (!initiaterId) {
      return res
        .status(400)
        .json({ message: "Initiater ID is not provided." });
    }

    // Parse amount to a number if it's a string
    let parsedAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

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
        type: 'TRANSACTION',
        title: 'Transaction Entry Added',
        message: `${initiatedBy} added a new transaction entry of ${amount} (${transactionType})`,
        relatedId: transaction._id,
        onModel: 'Transaction',
        actionType: 'updated'
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
          type: 'TRANSACTION',
          title: 'New Transaction Created',
          message: `${initiatedBy} created a new transaction of ${amount} (${transactionType})`,
          relatedId: transaction._id,
          onModel: 'Transaction',
          actionType: 'created'
        });
        console.log('Notification created successfully');
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
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

  } catch (error) {
    console.error("Error in createTransaction:", error);
    res.status(500).json({ 
      success: false,
      message: "Error creating transaction.",
      error: error.message 
    });
  }
};

const confirmTransaction = async (req, res) => {
  try {
    // console.log("Authenticated User in confirmTransaction:", req.user);
    
    // Ensure req.user is available
    if (!req.user) {
      console.error("Error: req.user is undefined inside confirmTransaction.");
      return res.status(401).json({ message: "Unauthorized. User not authenticated." });
    }

    if (!req.user.id) {
      console.error("Error: req.user.id is undefined inside confirmTransaction.");
      return res.status(400).json({ message: "User ID is missing from request." });
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
      console.warn("Warning: This transaction entry has already been confirmed.");
      return res.status(400).json({ message: "This transaction entry has already been confirmed." });
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
      console.error("Error: Either transaction.userId or transaction.clientUserId is missing.");
      return res.status(500).json({ message: "Transaction data is incomplete." });
    }

    // console.log("Transaction Users:", {
    //   userId: transaction.userId._id,
    //   clientUserId: transaction.clientUserId._id,
    // });

    // Determine sender
    const sender = await User.findById(req.user.id);
    if (!sender) {
      console.error(`Error: Sender User with ID ${req.user.id} not found.`);
      return res.status(404).json({ message: "Sender not found in User model." });
    }

    // Determine recipient (opposite party)
    const recipient =
      sender._id.toString() === transaction.userId._id.toString()
        ? transaction.clientUserId
        : transaction.userId;

    if (!recipient || !recipient.email) {
      console.error("Error: Recipient User not found or missing email:", recipient);
      return res.status(404).json({ message: "Recipient not found in User model." });
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

    res.status(200).json({
      message: "Transaction entry confirmed.",
      transaction,
    });
  } catch (error) {
    console.error("Error in confirmTransaction function:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get a single transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate({
        path: "userId", // Field to populate
        select: "-password", // Exclude the password field
      })
      .populate("clientUserId bookId"); 

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the transaction.",
      error: error.message,
    });
  }
};

// Add an existing transaction to the transaction history
 
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
    .populate('userId', 'name email') // Populate user with name and email
    .populate('clientUserId', 'name email')
    .populate('bookId');  // Populate clientUser with name, email, and phone
 

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
let recipientEmail = (req.user.email === transaction.userId?.email)
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
      type: 'TRANSACTION',
      title: 'Transaction Entry Added',
      message: `${initiatedBy} added a new entry of ${amount} (${transactionType})`,
      relatedId: transaction._id,
      onModel: 'Transaction',
      actionType: 'created'
      });
      

          // Fetch client details for email/SMS notification
    const client = await Client.findOne({email: recipientEmail});
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

    // Send the updated transaction back in the response
    res.status(200).json({
      success: true,
      message: "Transaction added successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);

    // Handle any unexpected errors
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the transaction",
      error: error.message,
    });
  }
};
 

const updateTransaction = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    const { amount, description, transactionType } = req.body;
    const userId = req.user.id;

    if (!transactionId || !entryId) {
      return res.status(400).json({ message: "Missing required transaction IDs." });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    if (
      transactionType &&
      !["you will get", "you will give"].includes(transactionType)
    ) {
      return res.status(400).json({ message: "Invalid transaction type provided." });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate('userId', 'name email')
      .populate('clientUserId', 'name email');

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
        updatedBalance += txn.transactionType === "you will get" ? -txn.amount : txn.amount;
      }
    });
    transaction.outstandingBalance = updatedBalance;

    await transaction.save();

    // Find the correct sender
    let sender = await User.findOne({ email: req.user.email });
    if (!sender) {
      console.error("Sender User not found for email:", req.user.email);
      return res.status(404).json({ message: "Sender not found in User model." });
    }

    // Find the recipient (opposite party)
    let recipientEmail = (req.user.email === transaction.userId?.email)
      ? transaction.clientUserId?.email
      : transaction.userId?.email;

    let recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      console.error("Recipient User not found for email:", recipientEmail);
      return res.status(404).json({ message: "Recipient not found in User model." });
    }

    // console.log("Final Sender:", sender._id, sender.email);
    // console.log("Final Recipient:", recipient._id, recipient.email);

    await notificationController.clientCreateNotification({
      recipient: recipient._id,
      sender: sender._id,
      type: 'TRANSACTION',
      title: 'Transaction Updated',
      message: `${req.user.name} updated a transaction of ${amount}`,
      relatedId: transaction._id,
      onModel: 'Transaction',
      actionType: 'updated'
    });

    res.status(200).json({
      message: "Transaction updated successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteTransactionEntry = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    const userId = req.user.id; // Authenticated user ID

    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId)
      .populate('userId', 'name email')
      .populate('clientUserId', 'name email');

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

    // Find the correct sender (logged-in user)
    let sender = await User.findOne({ email: req.user.email });
    if (!sender) {
      console.error("Sender User not found for email:", req.user.email);
      return res.status(404).json({ message: "Sender not found in User model." });
    }

    // Find the correct recipient (opposite party)
    let recipientEmail = (req.user.email === transaction.userId?.email)
      ? transaction.clientUserId?.email
      : transaction.userId?.email;

    let recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      console.error("Recipient User not found for email:", recipientEmail);
      return res.status(404).json({ message: "Recipient not found in User model." });
    }

    // console.log("Final Sender:", sender._id, sender.email);
    // console.log("Final Recipient:", recipient._id, recipient.email);

    // Send notification to the opposite party
    await notificationController.clientCreateNotification({
      recipient: recipient._id,
      sender: sender._id,
      type: 'TRANSACTION',
      title: 'Transaction Entry Deleted',
      message: `${req.user.name} deleted a transaction entry`,
      relatedId: transaction._id,
      onModel: 'Transaction',
      actionType: 'deleted'
    });

    res.status(200).json({
      message: "Transaction entry deleted successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error deleting transaction entry:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getTransactions,
  createTransaction,
  confirmTransaction,
  getTransactionstoclient,
  getTransactionById,
  addExistingTransaction,
  updateTransaction,
  deleteTransactionEntry,
};
