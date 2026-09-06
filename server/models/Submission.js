const mongoose = require("mongoose");

const testCaseResultSchema = new mongoose.Schema(
  {
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    isHidden: { type: Boolean, default: false },
    error: { type: String, default: null },
    executionTimeMs: { type: Number, default: null },
  },
  { _id: false }
);

const suggestionSchema = new mongoose.Schema(
  {
    // "naming" | "comments" | "structure" | etc — matches your
    // ESLint/Pylint + LLM analysis categories
    type: { type: String, required: true },
    message: { type: String, required: true },
    line: { type: Number, default: null },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // optional — null if this was an ad-hoc Run, not tied to a saved snippet
    snippet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      default: null,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "cpp", "java"],
    },
    code: {
      type: String,
      required: true,
    },
    // "run" = just executed, no test cases/suggestions expected
    // "submit" = full flow: execution + test cases + suggestions
    kind: {
      type: String,
      enum: ["run", "submit"],
      required: true,
    },
    execution: {
      stdout: { type: String, default: "" },
      stderr: { type: String, default: "" },
      exitCode: { type: Number, default: null },
    },
    testResults: [testCaseResultSchema],
    testsSummary: {
      totalCases: { type: Number, default: 0 },
      passedCases: { type: Number, default: 0 },
      hiddenTotal: { type: Number, default: 0 },
      hiddenPassed: { type: Number, default: 0 },
    },
    suggestions: [suggestionSchema],
    readabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null, // null until suggestions have been generated
    },
  },
  { timestamps: true }
);

// speeds up the dashboard's "readability trend over time" query
submissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);