import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar user={user} />
      <main className="main-content">{children}</main>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute user={user}><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute user={user}><ProjectDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
