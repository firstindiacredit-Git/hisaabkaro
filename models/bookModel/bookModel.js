const mongoose = require("mongoose");

const transactionBookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookname: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound unique index on userId and bookname
transactionBookSchema.index({ userId: 1, bookname: 1 }, { unique: true });

const TransactionBook = mongoose.model(
  "TransactionBook",
  transactionBookSchema
);

module.exports = TransactionBook;
