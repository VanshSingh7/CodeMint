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
    testCases: [
      {
        input: { type: String, default: "" },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // null = hidden cases never generated yet; set whenever they're
    // (re)generated so the UI can show "Generated 3 days ago · Regenerate"
    hiddenTestCasesGeneratedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Snippet", snippetSchema);