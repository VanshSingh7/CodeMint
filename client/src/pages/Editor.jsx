export default function Editor() {
  return (
    <div className="px-8 pt-6">
      <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-border bg-canvas-subtle text-fg-muted mb-3">
        Editor
      </span>
      <h1 className="text-2xl font-semibold text-fg mb-1">Code editor</h1>
      <p className="text-sm text-fg-muted mb-6">
        This is where the Monaco editor + run/submit panel will sit.
      </p>

      <div className="rounded-lg border border-border bg-canvas-subtle p-4 font-mono text-sm text-fg-muted max-w-2xl">
        <p>{"// route: /editor"}</p>
        <p>{'<Editor language="javascript" />'}</p>
      </div>
    </div>
  );
}