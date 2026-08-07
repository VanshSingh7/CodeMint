import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getLanguage } from "../data/languages";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const LANGUAGE_FILTERS = [
  { id: "all", label: "All" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
];

const KIND_FILTERS = [
  { id: "all", label: "All" },
  { id: "submit", label: "Submit" },
  { id: "run", label: "Run" },
];

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function scoreColor(score) {
  if (score === null || score === undefined) return "text-fg-muted";
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

export default function Submissions() {
  const { token } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [sortDir, setSortDir] = useState("desc"); // desc = newest first
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/submissions/mine?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load submissions");
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Submissions load error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const filtered = useMemo(() => {
    let list = submissions;
    if (languageFilter !== "all") list = list.filter((s) => s.language === languageFilter);
    if (kindFilter !== "all") list = list.filter((s) => s.kind === kindFilter);

    return [...list].sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [submissions, languageFilter, kindFilter, sortDir]);

  return (
    <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-10">
      <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-border bg-canvas-subtle text-fg-muted mb-3">
        Submissions
      </span>
      <h1 className="text-xl sm:text-2xl font-semibold text-fg mb-1">
        Submission history
      </h1>
      <p className="text-sm text-fg-muted mb-5">
        Every run and submit, with output, test results, and readability
        feedback.
      </p>

      {!token && (
        <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
          Sign in to see your submission history.
        </div>
      )}

      {token && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLanguageFilter(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    languageFilter === f.id
                      ? "bg-accent-subtle text-accent-fg border-accent-fg"
                      : "border-border text-fg-muted hover:text-fg hover:bg-canvas"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {KIND_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKindFilter(f.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    kindFilter === f.id
                      ? "bg-accent-subtle text-accent-fg border-accent-fg"
                      : "border-border text-fg-muted hover:text-fg hover:bg-canvas"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
              className="ml-auto text-xs px-2.5 py-1 rounded-md border border-border text-fg-muted hover:text-fg hover:bg-canvas transition-colors"
            >
              {sortDir === "desc" ? "Newest first" : "Oldest first"}
            </button>
          </div>

          {loading && (
            <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
              Loading your submissions…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
              Couldn't load your submissions ({error}).
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted font-mono max-w-2xl">
              {submissions.length === 0
                ? "No submissions yet — run or submit code in the editor."
                : "No submissions match this filter."}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden max-w-4xl">
              {filtered.map((s) => {
                const isOpen = expandedId === s._id;
                return (
                  <div key={s._id} className="border-b border-border last:border-0">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : s._id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-canvas-subtle transition-colors"
                    >
                      <span className="text-xs text-fg-muted w-32 flex-shrink-0">
                        {formatDateTime(s.createdAt)}
                      </span>
                      <span className="text-xs text-fg w-20 flex-shrink-0 capitalize">
                        {getLanguage(s.language)?.label || s.language}
                      </span>
                      <span
                        className={`text-xs w-16 flex-shrink-0 uppercase font-medium ${
                          s.kind === "submit" ? "text-accent-fg" : "text-fg-muted"
                        }`}
                      >
                        {s.kind}
                      </span>
                      <span className={`text-xs w-16 flex-shrink-0 font-semibold ${scoreColor(s.readabilityScore)}`}>
                        {s.readabilityScore ?? "—"}
                      </span>
                      <span className="ml-auto text-fg-muted">
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-fg-muted mb-1">Code</p>
                          <pre className="text-[11px] font-mono bg-canvas-subtle rounded-md p-2 overflow-x-auto max-h-48 whitespace-pre-wrap">
                            {s.code}
                          </pre>
                        </div>

                        {(s.execution?.stdout || s.execution?.stderr) && (
                          <div>
                            <p className="text-xs font-medium text-fg-muted mb-1">Output</p>
                            <pre className="text-[11px] font-mono bg-canvas-subtle rounded-md p-2 overflow-x-auto whitespace-pre-wrap">
                              {s.execution.stdout || s.execution.stderr}
                            </pre>
                          </div>
                        )}

                        {s.testResults?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-fg-muted mb-1">Test cases</p>
                            <div className="space-y-1">
                              {s.testResults.map((t, i) => (
                                <div
                                  key={i}
                                  className={`text-[11px] font-mono rounded-md p-1.5 ${
                                    t.passed ? "bg-green-500/10" : "bg-red-500/10"
                                  }`}
                                >
                                  {t.passed ? "✓ passed" : "✗ failed"} — input: {t.input}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {s.suggestions?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-fg-muted mb-1">Suggestions</p>
                            <ul className="space-y-1.5">
                              {s.suggestions.map((sug, i) => (
                                <li
                                  key={i}
                                  className="text-xs border border-border rounded-md p-2 bg-canvas-subtle"
                                >
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase mr-1.5 bg-accent-subtle text-accent-fg">
                                    {sug.type}
                                  </span>
                                  {sug.line && (
                                    <span className="text-fg-muted mr-1">Line {sug.line}:</span>
                                  )}
                                  <span className="text-fg">{sug.message}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}