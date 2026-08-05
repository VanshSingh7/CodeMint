import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useState } from "react";
import { PanelLeft } from "lucide-react";

function WorkspaceLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-62px)]">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 left-4 z-20 lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-accent-emphasis text-white shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Open sidebar"
      >
        <PanelLeft size={18} />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-canvas text-fg">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/editor"
              element={<WorkspaceLayout><Editor /></WorkspaceLayout>}
            />
            <Route
              path="/dashboard"
              element={<WorkspaceLayout><Dashboard /></WorkspaceLayout>}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}