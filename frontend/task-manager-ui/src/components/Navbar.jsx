import { NavLink, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-gray-100 hover:border-indigo-200 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                    {user?.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{user?.name ?? "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? "p@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer font-medium focus:bg-indigo-50 focus:text-indigo-600">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-medium focus:bg-indigo-50 focus:text-indigo-600">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer font-bold text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
