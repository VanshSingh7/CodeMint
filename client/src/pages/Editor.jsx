import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Play, Send } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { LANGUAGES, getLanguage } from "../data/languages";

const TABS = [
  { id: "output", label: "Output" },
  { id: "tests", label: "Test Cases" },
  { id: "suggestions", label: "Suggestions" },
];

export default function Editor() {
  const { theme } = useTheme();
  const [languageId, setLanguageId] = useState("java");
  const [code, setCode] = useState(getLanguage("java").starter);
  const [activeTab, setActiveTab] = useState("output");
  const [output, setOutput] = useState(
    "// Run your code to see output here.\n// (Execution isn't wired up yet — Piston integration comes next.)"
  );

  const handleLanguageChange = (e) => {
    const next = e.target.value;
    setLanguageId(next);
    setCode(getLanguage(next).starter);
  };

  const handleRun = () => {
    setActiveTab("output");
    setOutput(
      `// Running ${getLanguage(languageId).label} code...\n// This is a placeholder — Piston execution isn't connected yet.`
    );
  };

  const handleSubmit = () => {
    setActiveTab("suggestions");
    setOutput(
      "// Submit will eventually run execution + test cases + clean-code\n// analysis (ESLint/Pylint + LLM). Not wired up yet."
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-62px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-canvas-subtle">
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-0.5 rounded-md border border-border bg-canvas text-fg-muted">
            Editor
          </span>
          <select
            value={languageId}
            onChange={handleLanguageChange}
            className="text-sm bg-canvas border border-border rounded-md px-2 py-1 text-fg focus:outline-none focus:ring-1 focus:ring-accent-fg"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-border text-fg hover:bg-canvas transition-colors"
          >
            <Play size={14} />
            Run
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-accent-emphasis text-white hover:opacity-90 transition-opacity"
          >
            <Send size={14} />
            Submit
          </button>
        </div>
      </div>

      {/* Editor + output split */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
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

        <div className="w-[380px] border-l border-border flex flex-col min-h-0">
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