import React, { useState } from "react";
import API from "../services/api";

function Login({ setUser, onSwitchToAdmin, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (msg) { setMsg(""); setMsgType(""); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const res = await API.post("/auth/login", { email: formData.email, password: formData.password });
      setMsgType("success"); setMsg("Login successful! Redirecting...");
      setTimeout(() => setUser(res.data.user), 800);
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    if (!formData.name || !formData.email || !formData.password) {
      setMsgType("error"); setMsg("All fields are required"); setLoading(false); return;
    }
    if (formData.password.length < 6) {
      setMsgType("error"); setMsg("Password must be at least 6 characters"); setLoading(false); return;
    }
    try {
      await API.post("/auth/register", formData);
      setMsgType("success"); setMsg("Registration successful! Please login.");
      setTimeout(() => { setFormData({ name: "", email: "", password: "" }); setIsLogin(true); setMsg(""); setMsgType(""); }, 1500);
    } catch (err) {
      setMsgType("error");
      setMsg(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode); setMsg(""); setMsgType("");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full animate-blob"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)" }} />
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full animate-blob animation-delay-2000"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full animate-blob animation-delay-4000"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-fadeInUp">
        {/* Logo Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #22C55E, #4ADE80)" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">RMK Garage</div>
              <div className="text-xs" style={{ color: "#4ADE80" }}>Vehicle Service Portal</div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card p-8">
          {/* Tab switcher */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-600 transition-all duration-300 ${isLogin
                ? "text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
                }`}
              style={isLogin ? {
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.35)"
              } : {}}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm transition-all duration-300 ${!isLogin
                ? "text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
                }`}
              style={!isLogin ? {
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.35)"
              } : {}}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              {isLogin ? "Welcome back" : "Join us today"}
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {isLogin ? "Sign in to manage your bookings" : "Create your account in seconds"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div className="floating-group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder=" "
                  className="input-dark w-full px-4 pt-6 pb-2 text-sm"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
                <label htmlFor="name" className="floating-label floating-label-dark">Full Name</label>
              </div>
            )}

            <div className="floating-group">
              <input
                type="email"
                name="email"
                id="email"
                placeholder=" "
                className="input-dark w-full px-4 pt-6 pb-2 text-sm"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
              <label htmlFor="email" className="floating-label floating-label-dark">Email Address</label>
            </div>

            <div className="floating-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder=" "
                className="input-dark w-full px-4 pt-6 pb-2 pr-12 text-sm"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <label htmlFor="password" className="floating-label floating-label-dark">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: showPassword ? "#22C55E" : "#475569" }}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot password */}
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs transition-colors"
                  style={{ color: "#4ADE80" }}
                  onMouseEnter={e => e.target.style.color = "#0EA5E9"}
                  onMouseLeave={e => e.target.style.color = "#4ADE80"}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {msg && (
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-sm animate-fadeIn ${msgType === "error"
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-green-500/10 border border-green-500/20 text-green-400"
              }`}>
              {msgType === "error" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {msg}
            </div>
          )}

          {/* Divider & Features */}
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-center gap-6 text-xs" style={{ color: "#475569" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                <span>Secure Auth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#22C55E" }} />
                <span>Fast Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#4ADE80" }} />
                <span>24/7 Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "#334155" }}
              onMouseEnter={e => e.currentTarget.style.color = "#4ADE80"}
              onMouseLeave={e => e.currentTarget.style.color = "#334155"}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors ml-auto"
              style={{ color: "#475569" }}
              onMouseEnter={e => e.currentTarget.style.color = "#A78BFA"}
              onMouseLeave={e => e.currentTarget.style.color = "#475569"}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
