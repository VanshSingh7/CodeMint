const { spawn } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

async function analyzePython(code) {
  const tmpFile = path.join(
    os.tmpdir(),
    `submission_${Date.now()}_${Math.random().toString(36).slice(2)}.py`
  );
  await fs.writeFile(tmpFile, code, "utf8");

  try {
    const output = await new Promise((resolve, reject) => {
      const proc = spawn("py", [
        "-m", "pylint",
        "--output-format=json",
        "--disable=missing-module-docstring,missing-function-docstring,missing-class-docstring",
        tmpFile,
      ]);

      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (d) => (stdout += d));
      proc.stderr.on("data", (d) => (stderr += d));

      // pylint exits non-zero when it finds issues — that's expected, not a failure
      proc.on("close", () => resolve(stdout || stderr));
      proc.on("error", reject);
    });

    let parsed = [];
    try {
      parsed = JSON.parse(output);
    } catch {
      return [];
    }

    return parsed.map((msg) => ({
      line: msg.line,
      column: msg.column,
      severity: msg.type === "error" || msg.type === "fatal" ? "error" : "warning",
      rule: msg["message-id"] || msg.symbol,
      message: msg.message,
    }));
  } finally {
    await fs.unlink(tmpFile).catch(() => {});
  }
}

module.exports = { analyzePython };