const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "Untitled",
    },
    content: {
      type: String,
      default: "",
    },
    tabId: {
      type: Number,
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a compound index for userId and tabId to ensure uniqueness
noteSchema.index({ userId: 1, tabId: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema); 