import { NavLink } from "react-router-dom";

const items = [
  { label: "My snippets", to: "/snippets" },
  { label: "Submissions", to: "/submissions" },
  { label: "Readability score", to: "/dashboard" },
  { label: "Settings", to: "/settings" },
];

export default function Sidebar() {
  const itemClass = ({ isActive }) =>
    `block px-2 py-1.5 rounded-md text-sm mb-0.5 ${
      isActive
        ? "bg-accent-subtle text-accent-fg font-medium"
        : "text-fg-muted hover:bg-canvas-subtle hover:text-fg"
    }`;

  return (
    <aside className="w-[220px] border-r border-border p-4">
      <p className="text-xs uppercase tracking-wide text-fg-muted px-2 pb-2">
        Workspace
      </p>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={itemClass}>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}