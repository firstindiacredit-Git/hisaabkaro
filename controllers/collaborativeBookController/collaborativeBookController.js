const Transaction = require("../../models/transactionModel/transactionModel");
const Client = require("../../models/clientUserModel/clientUserModel");
const User = require("../../models/userModel/userModel");
const notificationapi = require("notificationapi-node-server-sdk").default;
const upload = require("../../middleware/uploadMiddleware"); // Multer middleware for file uploads

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
      return res
        .status(404)
        .json({ message: "No clients found with this email." });
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

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this email." });
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
         outstandingBalance: existingTransaction.outstandingBalance, // Keep outstanding balance unchanged until confirmation
         confirmationStatus: "pending",
         file: mediaFile, // Add media file to history if uploaded
       });

       // Save the updated transaction
       transaction = await existingTransaction.save();

       res.status(200).json({
         message: "Transaction  Added successfully.",
         transaction,
       });
     } else {
       // Create a new transaction
       const newTransaction = new Transaction({
         bookId,
         userId,
         clientUserId,
         transactionType,
         initiatedBy,
         initiaterId,
         transactionHistory: [
           {
             transactionType,
             amount,
             description,
             initiatedBy: req.user.name,
             initiaterId: req.user.id,
             transactionDate: new Date(),
             outstandingBalance: 0, // Initially 0 until confirmation
             confirmationStatus: "pending",
             file: mediaFile, // Add media file to the first transaction
           },
         ],
         outstandingBalance: 0, // Initialize to 0 until confirmation
       });

       // Save the new transaction
       transaction = await newTransaction.save();

       res.status(201).json({
         message: "Transaction created successfully.",
         transaction,
       });
     }

     // Fetch the client's email and phone number from the Client model
     const client = await Client.findById(clientUserId); // Assuming clientUserId is the client's unique ID

     if (!client) {
       return res.status(404).json({
         message: "Client not found",
       });
     }

     // Trigger notification
     const notificationData = {
       notificationId: "apnakhata_63_07",
       user: {
         id: clientUserId, // User ID or unique identifier
         email: client.email, // Provide the client's email from the client model
         number: client.mobile, // Provide the client's phone number from the client model
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
      //  console.log("Notification sent successfully!");
     } catch (notifyError) {
    console.error("Error sending notification:", notifyError);
     }
   } catch (error) {
    console.error(error); // Log the error for debugging
     res.status(500).json({ error: error.message });
   }
 };

 

//  Confirm a pending transaction
const confirmTransaction = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    console.log(req.params);
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Find the specific entry in the transactionHistory by entryId
    const entryIndex = transaction.transactionHistory.findIndex(
      (entry) => entry._id.toString() === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({ message: "Transaction entry not found." });
    }

    // Get the specific pending entry
    const pendingEntry = transaction.transactionHistory[entryIndex];

    // Check if the entry is pending
    if (pendingEntry.confirmationStatus !== "pending") {
      return res.status(400).json({
        message: "This transaction entry has already been confirmed.",
      });
    }

    // Mark this entry as confirmed
    pendingEntry.confirmationStatus = "confirmed";

    // Recalculate the outstanding balance based on all confirmed entries
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

    // Update the overall outstanding balance
    transaction.outstandingBalance = newOutstandingBalance;

    // Save the updated transaction
    await transaction.save();

    res
      .status(200)
      .json({ message: "Transaction entry confirmed.", transaction });
  } catch (error) {
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
    console.log("Transaction ID is here:", transactionId);

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
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const lastOutstandingBalance = transaction.outstandingBalance;

    // Handle file upload
    let mediaFile = null;
    if (req.file) {
      mediaFile = req.file.path; // Save the file path from the uploaded file
    }

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
    const { transactionId, entryId } = req.params; // Transaction and entry IDs from URL params
    const { amount, description, transactionType } = req.body; // Fields to update

    const userId = req.user.id; // Get the user ID from the authenticated user

    // Validate input
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

    // Fetch the existing transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Find the specific transaction entry to update
    const entry = transaction.transactionHistory.id(entryId);

    if (!entry) {
      return res.status(404).json({ message: "Transaction entry not found." });
    }

    // Prevent updates by users who did not initiate the entry
    if (entry.initiaterId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this transaction.",
      });
    }

    // Handle file upload
    let mediaFile = entry.file; // Retain the existing file if no new file is uploaded
    if (req.file) {
      mediaFile = req.file.path; // Update the file path with the newly uploaded file
    }

    // Update the fields
    if (amount !== undefined) entry.amount = amount;
    if (description !== undefined) entry.description = description;
    if (transactionType !== undefined) entry.transactionType = transactionType;

    entry.transactionDate = new Date(); // Update transaction date to reflect changes
    entry.confirmationStatus = "pending"; // Reset confirmation status to "pending" after updates
    entry.file = mediaFile; // Update the file path in the entry

    // Save the updated transaction
    await transaction.save();

    res.status(200).json({
      message: "Transaction updatted successfully.",
      transaction,
    });

    // Send notification to the client about the update
    const client = await Client.findById(transaction.clientUserId); // Assuming clientUserId is the client's unique ID

    if (!client) {
      return res.status(404).json({
        message: "Client not found.",
      });
    }

    const notificationData = {
      notificationId: "apnakhata_63_07", // Update notification ID if necessary
      user: {
        id: transaction.clientUserId, // User ID or unique identifier
        email: client.email, // Provide the client's email from the client model
        number: client.mobile, // Provide the client's phone number from the client model
      },
      mergeTags: {
        transactionType: entry.transactionType,
        amount: entry.amount.toFixed(2),
        description: entry.description,
        initiatedBy: entry.initiatedBy,
        date: new Date().toLocaleDateString(),
      },
    };

    try {
      await notificationapi.send(notificationData);
      console.log("Update notification sent successfully!");
    } catch (notifyError) {
      console.error("Error sending update notification:", notifyError);
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: error.message });
  }
};




const deleteTransactionEntry = async (req, res) => {
  try {
    const { transactionId, entryId } = req.params;
    const userId = req.user.id; // Get the authenticated user ID

    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Check if the entry exists in the transaction history
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
      // If the removed entry was confirmed, adjust the outstanding balance
      const adjustment =
        removedEntry.transactionType === "you will get"
          ? -removedEntry.amount // Decrease balance if it was "you will get"
          : removedEntry.amount; // Increase balance if it was "you will give"

      transaction.outstandingBalance += adjustment;
    }

    // Save the updated transaction
    await transaction.save();

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
