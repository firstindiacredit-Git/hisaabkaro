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
    transactionHistory: [
      {
        transactionType: {
          type: String,
          enum: ["you will get", "you will give"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        file: {
          type: String,
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
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to update the outstanding balance
transactionSchema.pre("save", async function (next) {
  const transaction = this;

  // Aggregate outstanding balance from transaction history
  let newOutstandingBalance = 0;

  transaction.transactionHistory.forEach((entry) => {
    if (entry.transactionType === "you will get") {
      newOutstandingBalance += entry.amount;
    } else if (entry.transactionType === "you will give") {
      newOutstandingBalance -= entry.amount;
    }
    entry.outstandingBalance = newOutstandingBalance; // Update entry balance
  });

  // Update the root outstanding balance
  transaction.outstandingBalance = newOutstandingBalance;

  next();
});

// Transaction model
const Transaction = mongoose.model("SelfRecord", transactionSchema);

module.exports = Transaction;
