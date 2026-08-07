import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Trash2, ArrowUpDown } from "lucide-react";
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

const SORTS = [
  { id: "updatedAt", label: "Last updated" },
  { id: "title", label: "Title" },
  { id: "language", label: "Language" },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function preview(code, lines = 3) {
  return code.split("\n").slice(0, lines).join("\n");
}

export default function Snippets() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/snippets/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load snippets");
        const data = await res.json();
        setSnippets(data.snippets || []);
      } catch (err) {
        console.error("Snippets load error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this snippet? This can't be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/snippets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete snippet error:", err.message);
    }
  };

  const filtered = useMemo(() => {
    let list = snippets;
    if (languageFilter !== "all") {
      list = list.filter((s) => s.language === languageFilter);
    }

    const sorted = [...list].sort((a, b) => {
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "language") return a.language.localeCompare(b.language);
      // default: updatedAt desc
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return sorted;
  }, [snippets, languageFilter, sortBy]);

  return (
    <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-10">
      <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-border bg-canvas-subtle text-fg-muted mb-3">
        Snippets
      </span>
      <h1 className="text-xl sm:text-2xl font-semibold text-fg mb-1">
        My saved code
      </h1>
      <p className="text-sm text-fg-muted mb-5">
        Everything you've saved from the editor, sorted and filterable by
        language.
      </p>

      {!token && (
        <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
          Sign in to see your saved snippets.
        </div>
      )}

      {token && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
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

            <div className="ml-auto flex items-center gap-1.5 text-xs text-fg-muted">
              <ArrowUpDown size={12} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-canvas border border-border rounded-md px-2 py-1 text-fg focus:outline-none focus:ring-1 focus:ring-accent-fg"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
              Loading your snippets…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
              Couldn't load your snippets ({error}).
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted font-mono max-w-2xl">
              {snippets.length === 0
                ? "No saved snippets yet — save code from the editor to build your library."
                : "No snippets match this filter."}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <button
                  key={s._id}
                  onClick={() => navigate(`/editor?snippet=${s._id}`)}
                  className="text-left rounded-lg border border-border bg-canvas-subtle p-3 hover:border-accent-fg transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-medium text-fg truncate">
                      {s.title || "Untitled snippet"}
                    </h3>
                    <span
                      onClick={(e) => handleDelete(e, s._id)}
                      className="opacity-0 group-hover:opacity-100 text-fg-muted hover:text-red-500 transition-opacity flex-shrink-0"
                      aria-label="Delete snippet"
                    >
                      <Trash2 size={14} />
                    </span>
                  </div>

                  <pre className="text-[11px] font-mono text-fg-muted bg-canvas rounded-md p-2 mb-2 overflow-hidden h-14 whitespace-pre-wrap">
                    {preview(s.code)}
                  </pre>

                  <div className="flex items-center justify-between text-xs text-fg-muted">
                    <span className="flex items-center gap-1">
                      <Code2 size={12} />
                      {getLanguage(s.language)?.label || s.language}
                    </span>
                    <span>{formatDate(s.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}