import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Code2 } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium ${
      isActive
        ? "bg-canvas-inset border border-border text-fg"
        : "text-fg-muted hover:bg-canvas-subtle hover:text-fg"
    }`;

  return (
    <nav className="flex items-center justify-between h-[62px] px-4 bg-canvas-subtle border-b border-border">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 font-semibold text-fg">
          <Code2 size={20} className="text-accent-fg" />
          CodeMint
        </div>
        <div className="flex gap-1">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/editor" className={linkClass}>Editor</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-canvas hover:bg-canvas-subtle text-fg"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="px-3.5 py-1 rounded-md bg-accent-emphasis text-white text-sm font-medium">
          Sign in
        </button>
      </div>
    </nav>
  );
}