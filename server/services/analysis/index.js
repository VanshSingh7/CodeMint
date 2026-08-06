const { analyzeJavaScript } = require("./eslintAnalyzer");
const { analyzePython } = require("./pylintAnalyzer");

// language keys must match whatever your Piston config in languages.js uses
async function analyzeCode(language, code) {
  try {
    switch (language) {
      case "javascript":
        return await analyzeJavaScript(code);
      case "python":
        return await analyzePython(code);
      case "cpp":
      case "c++":
      case "java":
        // not wired yet — cppcheck/checkstyle would go here later
        return [];
      default:
        return [];
    }
  } catch (err) {
    console.error(`Static analysis failed for ${language}:`, err.message);
    return [];
  }
}

module.exports = { analyzeCode };