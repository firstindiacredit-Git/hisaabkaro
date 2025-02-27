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
        confirmationStatus: {
          type: String,
          enum: ["pending", "confirmed"],
          default: "pending", // Default status for a new transaction
        },
        initiatedBy: {
          type: String,
        },
        initiaterId: {
          type: String,
        },
        file: {
          type: String,
         }
      
      },
    ],
    outstandingBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual field to flip the transaction type for the opposite party
transactionSchema.virtual("visibleTransactionType").get(function () {
  if (this.transactionType === "you will give") {
    return "you will get";
  } else if (this.transactionType === "you will get") {
    return "you will give";
  }
  return this.transactionType; // Default fallback
});

// Pre-save hook to handle transaction history and outstanding balance
transactionSchema.pre("save", async function (next) {
  const transaction = this;

  // Calculate finalAmount (this part looks fine)
  if (transaction.transactionType === "you will get") {
    transaction.finalAmount = transaction.amount;
  } else if (transaction.transactionType === "you will give") {
    transaction.finalAmount = -transaction.amount;
  }

  // Handle outstanding balance calculation only if the transaction is confirmed
  let newOutstandingBalance = transaction.outstandingBalance;

  // Check for the most recent transaction in the history
  const lastHistory =
    transaction.transactionHistory[transaction.transactionHistory.length - 1];

  if (lastHistory && lastHistory.confirmationStatus === "confirmed") {
    // If confirmed, update the outstanding balance
    if (transaction.transactionType === "you will get") {
      newOutstandingBalance += transaction.amount;
    } else if (transaction.transactionType === "you will give") {
      newOutstandingBalance -= transaction.amount;
    }
  }
  // Update the outstanding balance for the transaction document
  transaction.outstandingBalance = newOutstandingBalance;
 
  next();
});


// Transaction model
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
