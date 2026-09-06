const express = require("express");
const { protect } = require("../middleware/auth");
const { runCode } = require("../services/judge0");

const router = express.Router();

/**
 * @route   POST /api/execute
 * @desc    Run code through Judge0 CE, return raw execution result.
 *          Does NOT persist anything — that happens separately via
 *          POST /api/submissions once the frontend has the result
 *          (keeps this route fast and single-purpose).
 * @body    { language, code, stdin?, version? }
 *          `version` is accepted but ignored — Judge0 pins one fixed
 *          version per language_id, unlike Piston which let us choose.
 */
router.post("/", protect, async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || code === undefined) {
      return res.status(400).json({ message: "language and code are required" });
    }

    const result = await runCode({ language, code, stdin });

    if (result.stage === "compile") {
      return res.json({
        stdout: "",
        stderr: result.compileOutput || result.stderr,
        exitCode: result.exitCode,
        stage: "compile",
      });
    }

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      stage: "run",
    });
  } catch (error) {
    console.error("Execute error:", error.response?.data || error.message);
    res.status(500).json({ message: "Execution failed" });
  }
});

module.exports = router;