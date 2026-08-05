import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Code2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `block px-3 py-1.5 rounded-md text-sm font-medium ${
      isActive
        ? "bg-canvas-inset border border-border text-fg"
        : "text-fg-muted hover:bg-canvas-subtle hover:text-fg"
    }`;

  return (
    <nav className="relative bg-canvas-subtle border-b border-border">
      <div className="flex items-center justify-between h-[62px] px-4">
        {/* Brand + desktop links */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 font-semibold text-fg">
            <Code2 size={20} className="text-accent-fg" />
            CodeMint
          </div>
          <div className="hidden md:flex gap-1">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/editor" className={linkClass}>Editor</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          </div>
        </div>

        {/* Right side: theme + auth + hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-canvas hover:bg-canvas-subtle text-fg"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-7 h-7 rounded-full border border-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-emphasis text-white text-xs font-medium flex items-center justify-center">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-fg-muted hidden lg:inline">
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-md text-sm font-medium text-fg-muted hover:bg-canvas-subtle hover:text-fg"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="hidden sm:inline-block px-3.5 py-1 rounded-md bg-accent-emphasis text-white text-sm font-medium"
            >
              Sign in
            </button>
          )}

          {/* Hamburger – visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md border border-border bg-canvas hover:bg-canvas-subtle text-fg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-canvas-subtle px-4 pb-4 pt-2 space-y-1">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/editor" className={linkClass}>Editor</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>

          <div className="border-t border-border my-2" />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 px-1">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-7 h-7 rounded-full border border-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-emphasis text-white text-xs font-medium flex items-center justify-center">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm text-fg-muted flex-1">
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-md text-sm font-medium text-fg-muted hover:bg-canvas-subtle hover:text-fg"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowAuthModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-center px-3.5 py-1.5 rounded-md bg-accent-emphasis text-white text-sm font-medium"
            >
              Sign in
            </button>
          )}
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
}