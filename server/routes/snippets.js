const express = require("express");
const Snippet = require("../models/Snippet");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/snippets
 * @desc    Create a new snippet for the logged-in user
 */
router.post("/", protect, async (req, res) => {
  try {
    const { title, language, code, tags } = req.body;

    if (!language || code === undefined) {
      return res.status(400).json({ message: "language and code are required" });
    }

    const snippet = await Snippet.create({
      user: req.user._id,
      title,
      language,
      code,
      tags,
    });

    res.status(201).json({ snippet });
  } catch (error) {
    console.error("Create snippet error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/snippets/mine
 * @desc    Get all snippets belonging to the logged-in user
 */
router.get("/mine", protect, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ snippets });
  } catch (error) {
    console.error("Fetch snippets error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/snippets/:id
 * @desc    Get a single snippet (must belong to logged-in user)
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user._id });

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.json({ snippet });
  } catch (error) {
    console.error("Fetch snippet error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/snippets/:id
 * @desc    Update a snippet (must belong to logged-in user)
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, code, tags } = req.body;

    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user._id });

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    if (title !== undefined) snippet.title = title;
    if (code !== undefined) snippet.code = code;
    if (tags !== undefined) snippet.tags = tags;

    await snippet.save();

    res.json({ snippet });
  } catch (error) {
    console.error("Update snippet error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/snippets/:id
 * @desc    Delete a snippet (must belong to logged-in user)
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.json({ message: "Snippet deleted" });
  } catch (error) {
    console.error("Delete snippet error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;