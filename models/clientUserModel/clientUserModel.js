const mongoose = require("mongoose");
const { Schema } = mongoose;

const clientUserSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique clients per userId by adding a compound index
clientUserSchema.index(
  { userId: 1, name: 1, email: 1, mobile: 1 },
  { unique:true }
);

const ClientUser = mongoose.model("ClientUser", clientUserSchema);
module.exports = ClientUser;
