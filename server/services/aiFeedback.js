const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a code readability reviewer for a student learning platform.
You will receive: the programming language, the submitted code, and a list of
static-analysis findings (from ESLint or Pylint).

Return ONLY valid JSON, no markdown fences, no preamble, matching this exact shape:
{
  "readabilityScore": <integer 0-100>,
  "suggestions": [
    {
      "type": "<one of: naming, complexity, formatting, unused-code, structure, comments, general>",
      "line": <integer or null>,
      "message": "<short, specific, encouraging suggestion>"
    }
  ]
}

Scoring guidance:
- 90-100: clean, idiomatic, well-named, appropriately commented
- 70-89: readable but with minor naming/structure issues
- 40-69: works but hard to follow, poor naming, or overly complex
- 0-39: very hard to read or maintain

Keep suggestions to at most 5, prioritized by impact. Be constructive, not harsh.
This is a beginner/student audience — explain briefly why a change helps.`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(model, userMessage, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(userMessage);
      return result.response.text();
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const isRetryable = status === 503 || status === 429;

      if (isRetryable && attempt < maxRetries - 1) {
        const backoff = Math.min(8000, 1000 * 2 ** attempt);
        const jitter = Math.random() * 500;
        console.warn(
          `Gemini ${status} error, retrying in ${Math.round((backoff + jitter) / 1000)}s (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(backoff + jitter);
        continue;
      }
      throw err;
    }
  }
}

async function generateReadabilityFeedback(language, code, findings) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const userMessage = `Language: ${language}

Static analysis findings (${findings.length} total):
${findings.length ? JSON.stringify(findings, null, 2) : "None"}

Code:
\`\`\`${language}
${code}
\`\`\``;

  const rawText = await callGeminiWithRetry(model, userMessage);
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response as JSON: ${err.message}`);
  }

  if (
    typeof parsed.readabilityScore !== "number" ||
    !Array.isArray(parsed.suggestions)
  ) {
    throw new Error("Gemini response missing expected fields");
  }

  return parsed;
}

module.exports = { generateReadabilityFeedback };