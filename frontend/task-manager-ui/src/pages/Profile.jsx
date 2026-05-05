import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowLeft, UserCircle, Key, Loader2, CheckCircle2, LogOut } from "lucide-react";
import useAuthStore from "../store/authStore";
import { updateProfile, updatePassword } from "../api/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Profile State
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Security State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log("Profile update triggered", profileForm);
    if (!profileForm.name || !profileForm.email) {
      toast.error("Name and Email are required");
      return;
    }
    setUpdatingProfile(true);
    try {
      const data = await updateProfile(profileForm);
      console.log("Profile update success", data);
      updateUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    console.log("Password update triggered");
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in current and new passwords");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdatingPassword(true);
    try {
      const resp = await updatePassword({ 
        currentPassword: passwordForm.currentPassword, 
        newPassword: passwordForm.newPassword 
      });
      console.log("Password update success", resp);
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error", err);
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-600 mb-4 transition">
          <ArrowLeft size={12} /> BACK TO DASHBOARD
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100 ring-4 ring-white shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium">Manage your tactical profile and security preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          <div className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center gap-3">
            <User size={18} /> Public Profile
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-8">
          {/* Profile Card */}
          <Card className="border-none shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden ring-1 ring-gray-100">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <UserCircle className="text-indigo-500" /> Public Profile
              </CardTitle>
              <CardDescription className="font-medium">Personal identity as seen across projects</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {updatingProfile ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card className="border-none shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden ring-1 ring-gray-100">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Key className="text-purple-500" /> Account Security
              </CardTitle>
              <CardDescription className="font-medium">Update your password to keep your account safe</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="currentPass" className="text-xs font-black uppercase tracking-widest text-gray-400">Current Password</Label>
                  <Input 
                    id="currentPass" 
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium" 
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="newPass" className="text-xs font-black uppercase tracking-widest text-gray-400">New Password</Label>
                    <Input 
                      id="newPass" 
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium" 
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPass" className="text-xs font-black uppercase tracking-widest text-gray-400">Confirm Password</Label>
                    <Input 
                      id="confirmPass" 
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium" 
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-xl font-bold shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
