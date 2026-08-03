const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled snippet",
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "cpp", "java"],
    },
    code: {
      type: String,
      required: true,
      default: "",
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Snippet", snippetSchema);