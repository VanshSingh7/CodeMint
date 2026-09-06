const axios = require("axios");

const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";
const JUDGE0_URL = `https://${RAPIDAPI_HOST}/submissions`;

// CodeMint only supports these four languages — map them to Judge0 CE's
// language_id. Full list: GET https://ce.judge0.com/languages/
const LANGUAGE_ID_MAP = {
  javascript: 63, // JavaScript (Node.js 12.14.0)
  python: 71, // Python (3.8.1)
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
};

/**
 * Runs a single piece of code through Judge0 CE (via RapidAPI) and
 * normalizes the response into the same { stdout, stderr, exitCode, stage }
 * shape the app used to get from Piston, so callers don't need to change.
 */
async function runCode({ language, code, stdin }) {
  const languageId = LANGUAGE_ID_MAP[language];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }
  if (!process.env.RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not set");
  }

  const response = await axios.post(
    `${JUDGE0_URL}?base64_encoded=false&wait=true`,
    {
      source_code: code,
      language_id: languageId,
      stdin: stdin || "",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    }
  );

  const { stdout, stderr, compile_output, status, message } = response.data;

  // Judge0 status ids: 3 = Accepted, 6 = Compilation Error, everything
  // else (4,5,7-14) is some kind of runtime failure. See /statuses.
  const isCompileError = status.id === 6;

  return {
    stdout: stdout || "",
    stderr: stderr || message || "",
    compileOutput: compile_output || "",
    exitCode: status.id === 3 ? 0 : 1,
    stage: isCompileError ? "compile" : "run",
    statusDescription: status.description,
  };
}

module.exports = { runCode, LANGUAGE_ID_MAP };