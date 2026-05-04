import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Folder, LogOut, CheckSquare } from "lucide-react";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl tracking-tight">
          <CheckSquare size={22} />
          TaskFlow
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`
            }
          >
            <LayoutDashboard size={15} /> Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`
            }
          >
            <Folder size={15} /> Projects
          </NavLink>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name ?? "User"}</span>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
