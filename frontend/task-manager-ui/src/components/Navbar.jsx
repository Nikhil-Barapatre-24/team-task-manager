import { NavLink, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Folder, LogOut, CheckSquare, User, Settings } from "lucide-react";
import useAuthStore from "../store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl tracking-tight">
          <CheckSquare size={24} className="stroke-[2.5]" />
          TaskFlow
        </div>

        {/* Links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <LayoutDashboard size={16} /> <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Folder size={16} /> <span className="hidden sm:inline">Projects</span>
          </NavLink>
        </div>

        {/* User Dropdown */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-10 w-10 rounded-full p-0 border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer outline-none flex items-center justify-center overflow-hidden">
              <Avatar className="h-9 w-9 pointer-events-none">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs pointer-events-none">
                  {user?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl shadow-2xl shadow-indigo-100/50 border-gray-100 animate-in fade-in zoom-in-95 duration-200" align="end">
              <div className="px-3 py-2.5 mb-1.5 bg-gray-50/50 rounded-xl">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-black text-gray-900 leading-none">{user?.name ?? "User"}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mt-0.5">
                    {user?.email ?? "p@example.com"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-100 mb-1" />

              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600 rounded-lg p-2.5 transition-colors">
                  <User className="mr-2.5 h-4 w-4 stroke-[2.5]" />
                  <span>Public Profile</span>
                </DropdownMenuItem>
              </Link>


              {/* <DropdownMenuSeparator className="bg-gray-100 my-2" /> */}

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer font-black text-red-600 focus:bg-red-50 focus:text-red-600 rounded-lg p-2.5 transition-colors uppercase text-[10px] tracking-widest"
              >
                <LogOut className="mr-2.5 h-4 w-4 stroke-[3]" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
