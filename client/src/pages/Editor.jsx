import { NavLink } from "react-router-dom";

const sidebarLinks = [
  { label: "My snippets", to: "/editor" },
  { label: "Submissions", to: "/editor/submissions" },
  { label: "Readability score", to: "/editor/readability" },
  { label: "Settings", to: "/editor/settings" },
];

export default function Editor() {
  return (
    <div className="flex min-h-[calc(100vh-62px)]">
      {/* Sidebar */}
      <aside className="w-[270px] shrink-0 border-r border-border px-4 pt-6">
        <p className="text-xs font-semibold tracking-widest text-fg-muted uppercase mb-3 px-2">
          Workspace
        </p>
        <nav className="flex flex-col gap-0.5">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/editor"}
              className={({ isActive }) =>
                `px-2 py-1.5 rounded-md text-sm ${
                  isActive
                    ? "bg-accent-subtle text-accent-fg font-medium"
                    : "text-fg-muted hover:text-fg hover:bg-canvas-subtle"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-8 pt-6">
        <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-border bg-canvas-subtle text-fg-muted mb-3">
          Editor
        </span>
        <h1 className="text-2xl font-semibold text-fg mb-1">Code editor</h1>
        <p className="text-sm text-fg-muted mb-6">
          This is where the Monaco editor + run/submit panel will sit.
        </p>

        {/* Code placeholder block */}
        <div className="rounded-lg border border-border bg-canvas-subtle p-4 font-mono text-sm text-fg-muted max-w-2xl">
          <p>{"// route: /editor"}</p>
          <p>{'<Editor language="javascript" />'}</p>
        </div>
      </main>
    </div>
  );
}