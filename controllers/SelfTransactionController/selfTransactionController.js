const Transaction = require("../../models/transactionModel/selfRecordModel");

exports.createTransaction = async (req, res) => {
  try {
    const { bookId, clientUserId, transactionType, amount, description } =
      req.body;
    const userId = req.user.id;
    // Check if a transaction already exists for the same user and client
    let transaction = await Transaction.findOne({
      userId,
      clientUserId,
      bookId,
    });

    if (transaction) {
      // Calculate the new outstanding balance based on the transaction type
      let newOutstandingBalance = transaction.outstandingBalance;

      if (transactionType === "you will get") {
        newOutstandingBalance += amount;
      } else if (transactionType === "you will give") {
        newOutstandingBalance -= amount;
      }

      // Add a new transaction history entry
      transaction.transactionHistory.push({
        transactionType,
        amount,
        description,
        transactionDate: new Date(),
        outstandingBalance: newOutstandingBalance,
      });

      // Update the transaction's outstanding balance and finalAmount
      transaction.outstandingBalance = newOutstandingBalance;
      transaction.finalAmount = newOutstandingBalance;

      // Save the updated transaction
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: "Transaction updated successfully!",
        data: transaction,
      });
    }

    // If no existing transaction, create a new one
    const newTransaction = new Transaction({
      bookId,
      userId,
      clientUserId,
      transactionType,
      amount,
      description,
      outstandingBalance: transactionType === "you will get" ? amount : -amount,
      finalAmount: transactionType === "you will get" ? amount : -amount,
      transactionHistory: [
        {
          transactionType,
          amount,
          description,
          transactionDate: new Date(),
          outstandingBalance:
            transactionType === "you will get" ? amount : -amount,
        },
      ],
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

    if (!transactions.length) {
      return res.status(404).json({
        success: false,
        message: "No transactions found for this user",
      });
    }

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
    const { id } = req.params;
    const { transactionType, amount, description } = req.body;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction history and outstanding balance
    let newOutstandingBalance = transaction.outstandingBalance;

    if (transactionType === "you will get") {
      newOutstandingBalance += amount;
    } else if (transactionType === "you will give") {
      newOutstandingBalance -= amount;
    }

    transaction.transactionHistory.push({
      transactionType,
      amount,
      description,
      transactionDate: new Date(),
      outstandingBalance: newOutstandingBalance,
    });

    transaction.outstandingBalance = newOutstandingBalance;
    transaction.finalAmount = newOutstandingBalance;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully!",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the transaction.",
      error: error.message,
    });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the transaction.",
      error: error.message,
    });
  }
};
 
const mongoose = require("mongoose");
 

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
