const mongoose = require("mongoose");
const { Schema } = mongoose;

const TokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Token", TokenSchema);
