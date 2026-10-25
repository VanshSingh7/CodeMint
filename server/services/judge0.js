const axios = require("axios");

// Use direct open Judge0 CE endpoint by default (no RapidAPI key or credit/debit card needed),
// but allows overriding via JUDGE0_URL or RAPIDAPI_KEY if desired.
const JUDGE0_URL =
  process.env.JUDGE0_URL ||
  (process.env.RAPIDAPI_KEY
    ? "https://judge0-ce.p.rapidapi.com/submissions"
    : "https://ce.judge0.com/submissions");

// CodeMint supported languages mapped to Judge0 CE language_ids
const LANGUAGE_ID_MAP = {
  javascript: 63, // JavaScript (Node.js)
  python: 71,     // Python 3
  cpp: 54,        // C++ (GCC)
  java: 62,       // Java (OpenJDK)
};

function encodeBase64(str) {
  return Buffer.from(str || "", "utf8").toString("base64");
}

function decodeBase64(str) {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return str;
  }
}

/**
 * Runs code through Judge0 CE and normalizes the response into:
 * { stdout, stderr, compileOutput, exitCode, stage, statusDescription }
 */
async function runCode({ language, code, stdin }) {
  const languageId = LANGUAGE_ID_MAP[language?.toLowerCase()];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.RAPIDAPI_KEY) {
    headers["X-RapidAPI-Key"] = process.env.RAPIDAPI_KEY;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }

  // base64_encoded=true prevents encoding errors on complex outputs or compiler errors
  const response = await axios.post(
    `${JUDGE0_URL}?base64_encoded=true&wait=true`,
    {
      source_code: encodeBase64(code),
      language_id: languageId,
      stdin: encodeBase64(stdin || ""),
    },
    { headers }
  );

  const { stdout, stderr, compile_output, status, message } = response.data;

  const decodedStdout = decodeBase64(stdout);
  const decodedStderr = decodeBase64(stderr || message);
  const decodedCompileOutput = decodeBase64(compile_output);

  // Judge0 status ids: 3 = Accepted, 6 = Compilation Error, others = runtime errors
  const isCompileError = status?.id === 6;

  return {
    stdout: decodedStdout,
    stderr: decodedStderr,
    compileOutput: decodedCompileOutput,
    exitCode: status?.id === 3 ? 0 : 1,
    stage: isCompileError ? "compile" : "run",
    statusDescription: status?.description || "",
  };
}

module.exports = { runCode, LANGUAGE_ID_MAP };
