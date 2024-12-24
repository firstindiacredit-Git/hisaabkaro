const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransactionBook",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientUser",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["you will get", "you will give"],
      required: true,
    },
    file: {
      type: String,
    },
    transactionHistory: [
      {
        transactionType: {
          type: String,
          enum: ["you will get", "you will give"],
          required: true,
        },
        amount: {
          type: Number,
        },
        description: {
          type: String,
        },
        transactionDate: {
          type: Date,
          default: Date.now,
        },
        outstandingBalance: {
          type: Number,
          default: 0,
        },
        
      },
    ],
    outstandingBalance: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Pre-save hook to update the transaction history and calculate the outstanding balance
transactionSchema.pre("save", async function (next) {
  const transaction = this;

  // Calculate finalAmount
  if (transaction.transactionType === "you will get") {
    transaction.finalAmount = transaction.amount;
  } else if (transaction.transactionType === "you will give") {
    transaction.finalAmount = -transaction.amount;
  }

  // Handle outstanding balance calculation only if the transaction is confirmed
  let newOutstandingBalance = transaction.outstandingBalance;
    // If confirmed, update the outstanding balance
    if (transaction.transactionType === "you will get") {
      newOutstandingBalance += transaction.amount;
    } else if (transaction.transactionType === "you will give") {
      newOutstandingBalance -= transaction.amount;
    }
  // Update the outstanding balance for the transaction document
  transaction.outstandingBalance = newOutstandingBalance;
  next();
});

// Transaction model
const Transaction = mongoose.model("SelfRecord", transactionSchema);

module.exports = Transaction;
