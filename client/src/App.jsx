import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function WorkspaceLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-62px)]">
      <Sidebar />
      <main className="flex-1">{children}</main>
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