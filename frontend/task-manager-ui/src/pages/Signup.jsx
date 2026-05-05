import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { signup } from "../api/auth";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signup(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 p-10 w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Account Created!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Your account has been successfully created. Please sign in to continue.
          </p>
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            Sign in now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 p-10 w-full max-w-md">
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-2xl mb-8 tracking-tight">
          <CheckSquare size={26} /> TaskFlow
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
        <p className="text-gray-500 text-sm mt-1 mb-7">Start managing your team&apos;s tasks today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              disabled={loading}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-3 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              disabled={loading}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-4 py-3 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                disabled={loading}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-10 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition disabled:opacity-50"
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
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 mt-1 active:translate-y-0 cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
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
