const Transaction = require("../../models/transactionModel/selfRecordModel");
const fs = require("fs");
const path = require("path");
const {upload}=require("../../middleware/uploadSelfTransactionfile")
const mongoose = require("mongoose");

exports.createTransaction = async (req, res) => {
  try {
    const { bookId, clientUserId, transactionType, amount, description } =
      req.body;
    const userId = req.userId;

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number.",
      });
    }

    // Check if a transaction already exists
    let transaction = await Transaction.findOne({
      userId,
      clientUserId,
      bookId,
    });

    const file = req.file ? req.file.path : null; // Uploaded file path

    if (transaction) {
      // Update outstanding balance
      let newOutstandingBalance = transaction.outstandingBalance;
      newOutstandingBalance +=
        transactionType === "you will get" ? parsedAmount : -parsedAmount;

      // Add to transaction history
      transaction.transactionHistory.push({
        transactionType,
        amount: parsedAmount,
        description,
        file,
        transactionDate: new Date(),
        outstandingBalance: newOutstandingBalance,
      });

      // Update root outstanding balance
      transaction.outstandingBalance = newOutstandingBalance;

      // Save transaction
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: "Transaction updated successfully!",
        data: transaction,
      });
    }

    // Create a new transaction if it doesn't exist
    const newTransaction = new Transaction({
      bookId,
      userId,
      clientUserId,
      transactionHistory: [
        {
          transactionType,
          amount: parsedAmount,
          description,
          file,
          transactionDate: new Date(),
          outstandingBalance:
            transactionType === "you will get" ? parsedAmount : -parsedAmount,
        },
      ],
      outstandingBalance:
        transactionType === "you will get" ? parsedAmount : -parsedAmount,
    });

    // Save the new transaction
    await newTransaction.save();

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully!",
      data: newTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the transaction.",
      error: error.message,
    });
  }
};
// Get a transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

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

// Get all transactions for a specific user
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId });

    // if (!transactions.length) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No transactions found for this user",
    //   });
    // }

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching transactions.",
      error: error.message,
    });
  }
};

// Update an existing transaction (for example, adjusting the amount or description)
exports.updateTransaction = async (req, res) => {
  try {
    const { id, entryId } = req.params;
    let { transactionType, amount, description } = req.body;
    
    // Convert amount from string to number
    amount = Number(amount);  // Convert amount to a number

    // Validate the transaction type
    if (!transactionType || !["you will get", "you will give"].includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type provided.",
      });
    }

    // Validate the amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount provided. Please provide a positive number.",
      });
    }

    // Find the transaction by ID
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Find the specific entry by entryId
    const entryIndex = transaction.transactionHistory.findIndex(
      (entry) => entry.id === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Transaction history entry not found",
      });
    }

    // Update the specific entry
    const entryToUpdate = transaction.transactionHistory[entryIndex];
    entryToUpdate.transactionType = transactionType;
    entryToUpdate.amount = amount;
    entryToUpdate.description = description || entryToUpdate.description;
    entryToUpdate.transactionDate = new Date();

    // If a new file is uploaded, handle it
    if (req.file) {
      // Check if the file already exists in the entry, and delete it if necessary
      if (entryToUpdate.file) {
        const oldFilePath = path.join(__dirname, "..", "uploads", "self-transaction", entryToUpdate.file);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);  // Delete the old file
        }
      }

      // Update the entry with the new file path
      entryToUpdate.file = req.file.filename;
    }

    // Recalculate outstanding balance
    let newOutstandingBalance = 0;

    transaction.transactionHistory.forEach((entry, index) => {
      if (index <= entryIndex) {
        if (entry.transactionType === "you will get") {
          newOutstandingBalance += entry.amount;
        } else if (entry.transactionType === "you will give") {
          newOutstandingBalance -= entry.amount;
        }
      }
      entry.outstandingBalance = newOutstandingBalance; // Update outstanding balance for each entry
    });

    // Ensure updated outstanding balance is reflected
    transaction.outstandingBalance = newOutstandingBalance;

    // Save the updated transaction
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction entry updated successfully!",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the transaction entry.",
      error: error.message,
    });
  }
};


// Delete a transaction
exports.deleteTransactionEntry = async (req, res) => {
  try {
    const   id       = req.params.id;
    const   entryId  = req.params.entryId;
     // Find the transaction by ID
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Find the index of the entry to be deleted
    const entryIndex = transaction.transactionHistory.findIndex(
      (entry) => entry.id === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Transaction history entry not found",
      });
    }

    // Remove the file associated with the entry, if it exists
    const entryToDelete = transaction.transactionHistory[entryIndex];
    if (entryToDelete.file) {
      const uploadDir = path.join(__dirname, "..", "uploads", "self-transaction");
      const filePath = path.join(uploadDir, entryToDelete.file);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove the entry from the transaction history
    transaction.transactionHistory.splice(entryIndex, 1);

    // Recalculate the outstanding balance
    let newOutstandingBalance = 0;
    transaction.transactionHistory.forEach((entry) => {
      if (entry.transactionType === "you will get") {
        newOutstandingBalance += entry.amount;
      } else if (entry.transactionType === "you will give") {
        newOutstandingBalance -= entry.amount;
      }
      entry.outstandingBalance = newOutstandingBalance; // Update outstanding balance for each entry
    });

    // Update the transaction's outstanding balance
    transaction.outstandingBalance = newOutstandingBalance;

    // Save the updated transaction
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction history entry deleted successfully!",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the transaction history entry.",
      error: error.message,
    });
  }
};
 

 

exports.getTransactionsByBookId = async (req, res) => {
  const { bookId } = req.params;

  try {
    // Validate bookId
    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required." });
    }

    // Validate bookId format
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid Book ID format." });
    }

    // Find transactions with the given bookId
    const transactions = await Transaction.find({ bookId })
    .populate("bookId", "bookname")
      .populate("userId", "name email") // Populate user details
      .populate("clientUserId", "name email mobile") // Populate client user details
      .sort({ createdAt: -1 }); // Sort by creation date (most recent first)

    // If no transactions are found, return an empty array
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        transactions: [],
      });
    }

    // Return transactions
    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "An error occurred while fetching transactions.",
      error: error.message,
    });
  }
};
