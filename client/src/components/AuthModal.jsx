import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { X } from "lucide-react";

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      await googleLogin(credentialResponse.credential);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-canvas rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 relative border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fg-muted hover:text-fg"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-fg">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>

        <div className="mb-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-fg-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-canvas-inset text-fg placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-accent-emphasis"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-border bg-canvas-inset text-fg placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-accent-emphasis"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-md border border-border bg-canvas-inset text-fg placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-accent-emphasis"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-md bg-accent-emphasis text-white text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-fg-muted">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-accent-fg font-medium"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;