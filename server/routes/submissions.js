const express = require("express");
const Submission = require("../models/Submission");
const { protect } = require("../middleware/auth");
const { analyzeCode } = require("../services/analysis");
const { generateReadabilityFeedback } = require("../services/aiFeedback");

const router = express.Router();

/**
 * @route   POST /api/submissions
 * @desc    Create a submission record (kind: "run" or "submit")
 * @note    Execution (Piston) happens client-side call to /api/execute first;
 *          this route persists the result. For kind "submit", it additionally
 *          runs static analysis + Gemini readability feedback server-side.
 */
router.post("/", protect, async (req, res) => {
  try {
    const {
      snippet,
      language,
      code,
      kind,
      execution,
      testResults,
    } = req.body;

    if (!language || code === undefined || !kind) {
      return res.status(400).json({ message: "language, code, and kind are required" });
    }

    let suggestions = [];
    let readabilityScore = null;

    if (kind === "submit") {
      try {
        const findings = await analyzeCode(language, code);
        const feedback = await generateReadabilityFeedback(language, code, findings);

        suggestions = feedback.suggestions.map((s) => ({
          type: s.type || "general",
          line: s.line ?? null,
          message: s.message,
        }));
        readabilityScore = feedback.readabilityScore;
      } catch (err) {
        // Don't fail the whole submission if analysis/AI feedback breaks —
        // the run/submit result itself is still worth saving.
        console.error("Readability feedback error:", err.message);
      }
    }

    const submission = await Submission.create({
      user: req.user._id,
      snippet: snippet || null,
      language,
      code,
      kind,
      execution,
      testResults,
      suggestions,
      readabilityScore,
    });

    res.status(201).json({ submission });
  } catch (error) {
    console.error("Create submission error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/submissions/mine
 * @desc    Get all submissions for the logged-in user (most recent first)
 * @query   ?kind=submit  — optional filter, e.g. exclude ad-hoc "run"s
 * @query   ?limit=20     — optional cap, default 50
 */
router.get("/mine", protect, async (req, res) => {
  try {
    const { kind, limit } = req.query;

    const filter = { user: req.user._id };
    if (kind) filter.kind = kind;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50);

    res.json({ submissions });
  } catch (error) {
    console.error("Fetch submissions error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/submissions/readability-trend
 * @desc    Lightweight endpoint for the dashboard chart — just timestamps + scores
 *          Uses the (user, createdAt) index for a fast query.
 */
router.get("/readability-trend", protect, async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
      readabilityScore: { $ne: null },
    })
      .sort({ createdAt: 1 })
      .select("createdAt readabilityScore language");

    res.json({ trend: submissions });
  } catch (error) {
    console.error("Fetch trend error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/submissions/:id
 * @desc    Get a single submission (must belong to logged-in user)
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, user: req.user._id });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ submission });
  } catch (error) {
    console.error("Fetch submission error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;