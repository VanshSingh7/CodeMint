import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

const items = [
  { label: "My snippets", to: "/snippets" },
  { label: "Submissions", to: "/submissions" },
  { label: "Readability score", to: "/dashboard" },
  { label: "Settings", to: "/settings" },
];

export default function Sidebar({ isOpen, onClose }) {
  const itemClass = ({ isActive }) =>
    `block px-2 py-1.5 rounded-md text-sm mb-0.5 ${
      isActive
        ? "bg-accent-subtle text-accent-fg font-medium"
        : "text-fg-muted hover:bg-canvas-subtle hover:text-fg"
    }`;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-[62px] left-0 bottom-0 z-40 w-[220px] border-r border-border p-4 bg-canvas
          transform transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden mb-2">
          <p className="text-xs uppercase tracking-wide text-fg-muted px-2">
            Workspace
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-canvas-subtle"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Desktop heading */}
        <p className="hidden lg:block text-xs uppercase tracking-wide text-fg-muted px-2 pb-2">
          Workspace
        </p>

        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={itemClass}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>
    </>
  );
}