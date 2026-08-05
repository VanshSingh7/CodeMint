export default function Dashboard() {
  return (
    <div className="px-4 sm:px-8 pt-4 sm:pt-6">
      <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-border bg-canvas-subtle text-fg-muted mb-3">
        Dashboard
      </span>
      <h1 className="text-xl sm:text-2xl font-semibold text-fg mb-1">Readability dashboard</h1>
      <p className="text-sm text-fg-muted mb-6">
        Your submission history and clean-code score trend will show up here.
      </p>

      <div className="rounded-lg border border-border bg-canvas-subtle p-4 font-mono text-sm text-fg-muted max-w-2xl">
        <p>{"// route: /dashboard"}</p>
        <p>{"score history + submissions table"}</p>
      </div>
    </div>
  );
}