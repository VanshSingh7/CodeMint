const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/auth");

const router = express.Router();

const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000/api/v2/execute";

/**
 * @route   POST /api/execute
 * @desc    Run code through Piston, return raw execution result.
 *          Does NOT persist anything — that happens separately via
 *          POST /api/submissions once the frontend has the result
 *          (keeps this route fast and single-purpose).
 * @body    { language, version, code, stdin? }
 */
router.post("/", protect, async (req, res) => {
  try {
    const { language, version, code, stdin } = req.body;

    if (!language || !version || code === undefined) {
      return res.status(400).json({ message: "language, version, and code are required" });
    }

    const pistonResponse = await axios.post(PISTON_URL, {
      language,
      version,
      files: [{ content: code }],
      stdin: stdin || "",
    });

    const { run, compile } = pistonResponse.data;

    // compile step exists for cpp/java; surface compile errors distinctly
    if (compile && compile.code !== 0) {
      return res.json({
        stdout: "",
        stderr: compile.stderr || compile.output,
        exitCode: compile.code,
        stage: "compile",
      });
    }

    res.json({
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code,
      stage: "run",
    });
  } catch (error) {
    console.error("Execute error:", error.response?.data || error.message);
    res.status(500).json({ message: "Execution failed" });
  }
});

module.exports = router;