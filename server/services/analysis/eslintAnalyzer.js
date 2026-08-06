const { ESLint } = require("eslint");

const ESLINT_CONFIG = {
  useEslintrc: false,
  baseConfig: {
    env: { es2021: true, node: true, browser: true },
    parserOptions: { ecmaVersion: 2021, sourceType: "module" },
    extends: ["eslint:recommended"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      complexity: ["warn", 10],
      "max-depth": ["warn", 4],
      "max-lines-per-function": ["warn", 50],
    },
  },
};

async function analyzeJavaScript(code) {
  const eslint = new ESLint(ESLINT_CONFIG);
  const results = await eslint.lintText(code, { filePath: "submission.js" });

  const findings = [];
  for (const result of results) {
    for (const msg of result.messages) {
      findings.push({
        line: msg.line,
        column: msg.column,
        severity: msg.severity === 2 ? "error" : "warning",
        rule: msg.ruleId || "syntax",
        message: msg.message,
      });
    }
  }
  return findings;
}

module.exports = { analyzeJavaScript };