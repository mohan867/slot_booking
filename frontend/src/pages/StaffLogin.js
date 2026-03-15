import React, { useState, useEffect } from "react";
import { loginStaff } from "../services/firebaseService";

/* ── Wrench icon for staff ──────────────────────────────── */
const WrenchIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

/* ── Particle canvas ─────────────────────────────────────── */
const ParticleCanvas = () => {
  useEffect(() => {
    const canvas = document.getElementById("staff-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas id="staff-particles" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

/* ══════════════════════════════════════════════════════════ */
/*                    STAFF LOGIN PAGE                        */
/* ══════════════════════════════════════════════════════════ */
function StaffLogin({ setUser, onBack }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({ email: false, password: false });
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (msg) { setMsg(""); setMsgType(""); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const loggedUser = await loginStaff({
        email: formData.email,
        password: formData.password,
      });

      setMsgType("success");
      setMsg("Authentication successful. Redirecting to staff panel...");

      setTimeout(() => {
        setUser(loggedUser);
      }, 1000);
    } catch (err) {
      setMsgType("error");
      setMsg(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const padZero = (n) => String(n).padStart(2, "0");
  const timeStr = `${padZero(currentTime.getHours())}:${padZero(currentTime.getMinutes())}:${padZero(currentTime.getSeconds())}`;
  const dateStr = currentTime.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.12) 0%, transparent 50%), linear-gradient(135deg, #030712 0%, #0A1028 40%, #0C1230 100%)",
      }}
    >
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
        backgroundSize: "50px 50px", zIndex: 1,
      }} />

      {/* Glow orbs */}
      <div className="absolute pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-blob"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full animate-blob animation-delay-2000"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full animate-blob animation-delay-4000"
          style={{ background: "radial-gradient(circle, rgba(147,197,253,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* Left Panel — Branding */}
      <div className={`hidden lg:flex flex-col justify-between w-2/5 p-12 relative transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        style={{ zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)", boxShadow: "0 8px 32px rgba(59,130,246,0.4)" }}>
            <WrenchIcon size={24} />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight">RMK Garage</div>
            <div className="text-xs" style={{ color: "#60A5FA" }}>Staff Portal</div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#60A5FA' }} />
              Service Staff Zone
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Staff
              <span className="block" style={{
                background: "linear-gradient(135deg, #60A5FA, #3B82F6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Service Panel
              </span>
            </h1>
            <p style={{ color: "#6B7280" }} className="text-sm leading-relaxed max-w-xs">
              View assigned bookings, update service progress, and manage your daily service tasks efficiently.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Assigned Jobs", sub: "View your service assignments", icon: "🔧" },
              { label: "Service Updates", sub: "Update job progress in real-time", icon: "📋" },
              { label: "Specialization", sub: "Work on your expertise area", icon: "⚡" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-white text-sm font-semibold">{item.label}</div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.12)" }}>
          <div className="text-3xl font-black tracking-widest mb-1" style={{ color: "#60A5FA", fontVariantNumeric: "tabular-nums" }}>
            {timeStr}
          </div>
          <div className="text-xs" style={{ color: "#4B5563" }}>{dateStr}</div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 relative transition-all duration-1000 delay-150 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        style={{ zIndex: 2 }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)" }}>
              <WrenchIcon size={20} />
            </div>
            <div>
              <div className="text-white font-bold">RMK Staff Portal</div>
              <div className="text-xs" style={{ color: "#60A5FA" }}>Service Access</div>
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 28,
            backdropFilter: "blur(40px)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
          }} className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Staff Authentication
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>Sign in to your staff account</p>
            </div>

            {/* Message */}
            {msg && (
              <div className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fadeInUp`}
                style={{
                  background: msgType === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                  border: `1px solid ${msgType === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                  color: msgType === "error" ? "#FCA5A5" : "#86EFAC",
                }}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={msgType === "error" ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
                {msg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: focused.email ? "#60A5FA" : "#475569" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused(f => ({ ...f, email: true }))}
                    onBlur={() => setFocused(f => ({ ...f, email: false }))}
                    placeholder="staff@rmkgarage.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: focused.email ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: focused.email ? "0 0 0 4px rgba(59,130,246,0.1)" : "none",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: focused.password ? "#60A5FA" : "#475569" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused(f => ({ ...f, password: true }))}
                    onBlur={() => setFocused(f => ({ ...f, password: false }))}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: focused.password ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: focused.password ? "0 0 0 4px rgba(59,130,246,0.1)" : "none",
                    }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#475569" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  background: loading ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #1E40AF, #3B82F6)",
                  boxShadow: loading ? "none" : "0 8px 32px rgba(59,130,246,0.4)",
                  transform: loading ? "none" : "translateY(0)",
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Back link */}
            <div className="mt-6 text-center">
              <button onClick={onBack}
                className="text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                style={{ color: "#64748B" }}
                onMouseEnter={(e) => e.target.style.color = "#60A5FA"}
                onMouseLeave={(e) => e.target.style.color = "#64748B"}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Portal Selection
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#1E293B" }}>
            Contact admin if you don't have credentials
          </p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
