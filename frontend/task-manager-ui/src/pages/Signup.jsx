import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { signup } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      setSuccess(true);
      toast.success("Account created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 p-10 w-full max-w-md text-center border">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Account Created!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Your account has been successfully created. Please sign in to continue.
          </p>
          <Button asChild className="w-full h-12 text-base">
            <Link to="/login">
              Sign in now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 p-10 w-full max-w-md border">
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-2xl mb-8 tracking-tight">
          <CheckSquare size={26} /> TaskFlow
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
        <p className="text-gray-500 text-sm mt-1 mb-7">Start managing your team&apos;s tasks today</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              disabled={loading}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              disabled={loading}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                disabled={loading}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-12 pr-10"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition disabled:opacity-50"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-base mt-2">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
