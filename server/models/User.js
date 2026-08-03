const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // null if the user signed up via Google OAuth only
    passwordHash: {
      type: String,
      default: null,
    },
    // null if the user signed up via email/password only
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // allows multiple docs with googleId: null
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);