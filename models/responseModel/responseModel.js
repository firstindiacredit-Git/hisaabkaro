const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    transactionEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Reference to a specific entry inside transactionHistory
    },
    
    responseMessage: {
      type: String,
      required: true, // Message is required
    },
    responseDate: {
      type: Date,
      default: Date.now,
    },
    file:{
      type:String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
