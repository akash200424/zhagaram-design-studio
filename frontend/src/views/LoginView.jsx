import React, { useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginView = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background architectural grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-800 p-8 relative z-10 space-y-6">
        {/* Studio Branding */}
        <div className="text-center space-y-2">
          <img
            src="/zhagaram-icon.jpg"
            alt="Zhagaram Logo"
            className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-xl border border-slate-200"
          />

          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              ZHAGARAM DESIGN STUDIO
            </h1>

            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-0.5">
              Architectural Business Platform
            </p>
          </div>

          <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-600">
            Founder & Architect Portal
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-xs"
          autoComplete="on"
        >
          {/* Email */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              User Email
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="email"
                name="username"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>

            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">Authorized access only</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
