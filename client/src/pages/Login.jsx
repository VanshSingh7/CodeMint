export default function Login() {
  return (
    <div className="px-8 py-16 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold text-fg mb-1">Sign in</h1>
      <p className="text-sm text-fg-muted mb-6">
        Sign in to save snippets and track your readability score.
      </p>
      <button className="w-full px-4 py-2 rounded-md border border-border bg-canvas-subtle text-fg text-sm font-medium hover:bg-canvas-inset">
        Continue with Google
      </button>
    </div>
  );
}