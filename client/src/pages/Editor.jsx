import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Play, Send, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { LANGUAGES, getLanguage } from "../data/languages";

const TABS = [
  { id: "output", label: "Output" },
  { id: "tests", label: "Test Cases" },
  { id: "suggestions", label: "Suggestions" },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Editor() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [languageId, setLanguageId] = useState("java");
  const [code, setCode] = useState(getLanguage("java").starter);
  const [activeTab, setActiveTab] = useState("output");
  const [output, setOutput] = useState(
    "// Run your code to see output here."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = (e) => {
    const next = e.target.value;
    setLanguageId(next);
    setCode(getLanguage(next).starter);
  };

  const runOnPiston = async () => {
    const { piston } = getLanguage(languageId);

    const res = await fetch(`${API_BASE}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        language: piston.language,
        version: piston.version,
        code,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Execution failed");
    return data;
  };

  const handleRun = async () => {
    if (!token) {
      setActiveTab("output");
      setOutput("// Please sign in to run code.");
      return;
    }

    setActiveTab("output");
    setIsRunning(true);
    setOutput(`// Running ${getLanguage(languageId).label} code...`);

    try {
      const result = await runOnPiston();

      if (result.stage === "compile") {
        setOutput(`// Compile error:\n${result.stderr}`);
      } else {
        const parts = [];
        if (result.stdout) parts.push(result.stdout);
        if (result.stderr) parts.push(`// stderr:\n${result.stderr}`);
        if (!result.stdout && !result.stderr) parts.push("// (no output)");
        parts.push(`\n// exit code: ${result.exitCode}`);
        setOutput(parts.join("\n"));
      }
    } catch (err) {
      setOutput(`// Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      setActiveTab("output");
      setOutput("// Please sign in to submit code.");
      return;
    }

    setActiveTab("output");
    setIsSubmitting(true);
    setOutput(`// Running ${getLanguage(languageId).label} code...`);

    try {
      const result = await runOnPiston();

      const parts = [];
      if (result.stdout) parts.push(result.stdout);
      if (result.stderr) parts.push(`// stderr:\n${result.stderr}`);
      parts.push(`\n// exit code: ${result.exitCode}`);
      setOutput(parts.join("\n"));

      // Persist as a submission (test cases + suggestions come later —
      // for now this just records the run with kind: "submit")
      await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language: languageId,
          code,
          kind: "submit",
          execution: {
            stdout: result.stdout || "",
            stderr: result.stderr || "",
            exitCode: result.exitCode,
          },
        }),
      });

      setActiveTab("suggestions");
    } catch (err) {
      setOutput(`// Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-62px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border bg-canvas-subtle gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-md border border-border bg-canvas text-fg-muted whitespace-nowrap">
            Editor
          </span>
          <select
            value={languageId}
            onChange={handleLanguageChange}
            className="text-sm bg-canvas border border-border rounded-md px-2 py-1 text-fg focus:outline-none focus:ring-1 focus:ring-accent-fg min-w-0"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1 sm:gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-md border border-border text-fg hover:bg-canvas transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            <span className="hidden xs:inline">Run</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1 sm:gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-md bg-accent-emphasis text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="hidden xs:inline">Submit</span>
          </button>
        </div>
      </div>

      {/* Editor + output split — vertical on mobile, horizontal on md+ */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Code editor */}
        <div className="flex-1 min-w-0 min-h-[200px] md:min-h-0">
          <MonacoEditor
            height="100%"
            language={getLanguage(languageId).monaco}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12 },
            }}
          />
        </div>

        {/* Output panel — full width below on mobile, side panel on md+ */}
        <div className="h-[40vh] md:h-auto md:w-[380px] border-t md:border-t-0 md:border-l border-border flex flex-col min-h-0">
          <div className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-xs py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-accent-emphasis text-fg font-medium"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-3">
            {activeTab === "output" && (
              <pre className="text-xs font-mono text-fg-muted whitespace-pre-wrap">
                {output}
              </pre>
            )}

            {activeTab === "tests" && (
              <p className="text-xs text-fg-muted">
                Custom test case results will show here after a run — pass/fail
                per case, expected vs. actual output.
              </p>
            )}

            {activeTab === "suggestions" && (
              <p className="text-xs text-fg-muted">
                Clean-code suggestions (naming, comments, structure) from
                ESLint/Pylint + LLM analysis will show here after Submit.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}