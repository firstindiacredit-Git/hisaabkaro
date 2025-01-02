// userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    profilePicture: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    hasCompletedProfile: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Remove all indexes except _id
userSchema.pre("save", async function (next) {
  try {
    if (!this.collection.conn) {
      return next();
    }

    const indexes = await this.collection.getIndexes();
    for (let indexName in indexes) {
      if (indexName !== "_id_" && indexName.includes("phone")) {
        await this.collection.dropIndex(indexName);
      }
    }
    next();
  } catch (error) {
    console.log("Index operation error (can safely ignore):", error);
    next();
  }
});

// Create compound index for phone and countryCode
userSchema.index(
  { phone: 1, countryCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      phone: { $type: "string" },
      countryCode: { $type: "string" },
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
