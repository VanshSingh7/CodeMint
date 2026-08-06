import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-canvas-inset px-3 py-2 text-xs shadow-sm">
      <p className="text-fg-muted mb-1">{formatDate(label)}</p>
      <p className="text-fg font-medium">Score: {payload[0].value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();

  const [trend, setTrend] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trendRes, subsRes] = await Promise.all([
          fetch(`${API_BASE}/submissions/readability-trend`, { headers }),
          fetch(`${API_BASE}/submissions/mine?kind=submit&limit=10`, { headers }),
        ]);

        if (!trendRes.ok) throw new Error("Failed to load trend");
        if (!subsRes.ok) throw new Error("Failed to load submissions");

        const trendData = await trendRes.json();
        const subsData = await subsRes.json();

        setTrend(trendData.trend || []);
        setSubmissions(subsData.submissions || []);
      } catch (err) {
        console.error("Dashboard load error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const hasTrend = trend.length > 0;
  const hasSubmissions = submissions.length > 0;

  return (
    <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-10">
      <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-border bg-canvas-subtle text-fg-muted mb-3">
        Dashboard
      </span>
      <h1 className="text-xl sm:text-2xl font-semibold text-fg mb-1">
        Readability dashboard
      </h1>
      <p className="text-sm text-fg-muted mb-6">
        Your submission history and clean-code score trend.
      </p>

      {!token && (
        <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
          Sign in to see your readability score history.
        </div>
      )}

      {token && loading && (
        <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
          Loading your dashboard…
        </div>
      )}

      {token && !loading && error && (
        <div className="rounded-lg border border-border bg-canvas-subtle p-4 text-sm text-fg-muted max-w-2xl">
          Couldn't load your dashboard ({error}). Try refreshing.
        </div>
      )}

      {token && !loading && !error && (
        <>
          {/* Score trend chart */}
          <div className="rounded-lg border border-border bg-canvas-subtle p-4 mb-6">
            <h2 className="text-sm font-semibold text-fg mb-3">
              Readability score over time
            </h2>
            {hasTrend ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-muted)"
                    />
                    <XAxis
                      dataKey="createdAt"
                      tickFormatter={formatDate}
                      tick={{ fill: "var(--fg-muted)", fontSize: 12 }}
                      stroke="var(--border-default)"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--fg-muted)", fontSize: 12 }}
                      stroke="var(--border-default)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="readabilityScore"
                      stroke="var(--accent-emphasis)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "var(--accent-emphasis)" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-fg-muted font-mono">
                No submissions yet — submit some code to start tracking your score.
              </p>
            )}
          </div>

          {/* Recent submissions table */}
          <div className="rounded-lg border border-border bg-canvas-subtle p-4 max-w-3xl">
            <h2 className="text-sm font-semibold text-fg mb-3">
              Recent submissions
            </h2>
            {hasSubmissions ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-fg-muted border-b border-border">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Language</th>
                      <th className="py-2 pr-4 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s._id} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4 text-fg-muted">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="py-2 pr-4 text-fg capitalize">{s.language}</td>
                        <td className="py-2 pr-4 text-fg">
                          {s.readabilityScore ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-fg-muted font-mono">
                No submissions yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}