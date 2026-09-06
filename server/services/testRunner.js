const { runCode } = require("./judge0");

// Judge0's free RapidAPI tier has a much tighter rate limit than the old
// public Piston API did, so we keep concurrency low by default to avoid
// 429s when judging many test cases at once. Override via env if you
// move to a paid plan or self-hosted instance.
const MAX_CONCURRENT = Number(process.env.TEST_RUNNER_MAX_CONCURRENT) || 2;

/**
 * Runs a single test case's input through Judge0 and compares actual vs
 * expected output. Trims trailing whitespace before comparing — exact
 * byte-for-byte stdout comparison is too strict for student code.
 */
async function runSingleCase(testCase, { language, code }) {
  const start = Date.now();
  try {
    const result = await runCode({ language, code, stdin: testCase.input || "" });
    const executionTimeMs = Date.now() - start;

    if (result.stage === "compile") {
      return {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        passed: false,
        isHidden: !!testCase.isHidden,
        error: result.compileOutput || result.stderr || "Compile error",
        executionTimeMs,
      };
    }

    const actualOutput = result.stdout || "";
    const passed =
      actualOutput.trim() === (testCase.expectedOutput || "").trim() && result.exitCode === 0;

    return {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      passed,
      isHidden: !!testCase.isHidden,
      error: result.exitCode !== 0 ? result.stderr || null : null,
      executionTimeMs,
    };
  } catch (err) {
    return {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: "",
      passed: false,
      isHidden: !!testCase.isHidden,
      error: err.response?.data?.message || err.message || "Execution failed",
      executionTimeMs: Date.now() - start,
    };
  }
}

/**
 * Runs an array of test cases with bounded concurrency (MAX_CONCURRENT
 * in-flight Judge0 requests at a time).
 *
 * @param {Array} testCases - [{ input, expectedOutput, isHidden }]
 * @param {Object} runConfig - { language, code }
 * @returns {Promise<{ results: Array, summary: Object }>}
 */
async function runTestCases(testCases, runConfig) {
  const results = new Array(testCases.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < testCases.length) {
      const i = nextIndex++;
      results[i] = await runSingleCase(testCases[i], runConfig);
    }
  }

  const workerCount = Math.min(MAX_CONCURRENT, testCases.length) || 1;
  await Promise.all(Array.from({ length: workerCount }, worker));

  const summary = results.reduce(
    (acc, r) => {
      acc.totalCases += 1;
      if (r.passed) acc.passedCases += 1;
      if (r.isHidden) {
        acc.hiddenTotal += 1;
        if (r.passed) acc.hiddenPassed += 1;
      }
      return acc;
    },
    { totalCases: 0, passedCases: 0, hiddenTotal: 0, hiddenPassed: 0 }
  );

  return { results, summary };
}

module.exports = { runTestCases };