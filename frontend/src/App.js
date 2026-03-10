import React, { useState, useEffect } from "react";
import Login from "./pages/login";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/* ════════════════════════════════════════════════════════
   LANDING — Role Selection Screen
   A cinematic portal-chooser with animated cards
   ════════════════════════════════════════════════════════ */
function PortalSelect({ onSelect }) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(37,99,235,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(124,58,237,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.05) 0%, transparent 70%),
          linear-gradient(135deg, #030712 0%, #0A0F1E 50%, #080314 100%)
        `,
      }}
    >
      {/* Animated grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-10 left-10 w-80 h-80 rounded-full animate-blob"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full animate-blob animation-delay-2000"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-blob animation-delay-4000"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)" }}
        />
      </div>

      {/* Content */}
      <div
        className="relative flex flex-col items-center w-full max-w-3xl"
        style={{
          zIndex: 2,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #22C55E, #4ADE80)",
              boxShadow: "0 8px 32px rgba(37,99,235,0.4)",
            }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white text-center mb-2 tracking-tight">
          RMK Garage
        </h1>
        <p
          className="text-sm text-center mb-2"
          style={{ color: "#64748B" }}
        >
          Vehicle Service Slot Booking System
        </p>

        {/* Status pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-12"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            color: "#4ADE80",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          All systems operational
        </div>

        {/* Choose portal heading */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: "#475569" }}
        >
          Select your portal
        </p>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* User Portal */}
          <button
            onClick={() => onSelect("user")}
            onMouseEnter={() => setHovered("user")}
            onMouseLeave={() => setHovered(null)}
            className="group relative text-left p-8 rounded-3xl transition-all duration-400 overflow-hidden"
            style={{
              background: hovered === "user"
                ? "rgba(37,99,235,0.12)"
                : "rgba(255,255,255,0.03)",
              border: hovered === "user"
                ? "1px solid rgba(37,99,235,0.5)"
                : "1px solid rgba(255,255,255,0.07)",
              boxShadow: hovered === "user"
                ? "0 20px 60px rgba(37,99,235,0.2), 0 0 0 1px rgba(37,99,235,0.3)"
                : "none",
              transform: hovered === "user" ? "translateY(-4px) scale(1.01)" : "none",
              transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Glow top border on hover */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl transition-opacity duration-300"
              style={{
                background: "linear-gradient(90deg, transparent, #22C55E, #4ADE80, transparent)",
                opacity: hovered === "user" ? 1 : 0,
              }}
            />

            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
              style={{
                background: hovered === "user"
                  ? "linear-gradient(135deg, #22C55E, #4ADE80)"
                  : "rgba(37,99,235,0.15)",
                boxShadow: hovered === "user" ? "0 8px 24px rgba(37,99,235,0.4)" : "none",
              }}
            >
              <svg className="w-7 h-7" fill="none" stroke={hovered === "user" ? "white" : "#60A5FA"} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h3
              className="text-xl font-bold mb-2 transition-colors duration-300"
              style={{ color: hovered === "user" ? "#FFFFFF" : "#E2E8F0" }}
            >
              User Portal
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#64748B" }}>
              Book and manage your vehicle service appointments with real-time tracking.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Book Service", "Track Status", "My Bookings"].map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full transition-all duration-300"
                  style={{
                    background: hovered === "user" ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)",
                    color: hovered === "user" ? "#93C5FD" : "#475569",
                    border: hovered === "user" ? "1px solid rgba(37,99,235,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="flex items-center gap-2 mt-6 text-sm font-semibold transition-all duration-300"
              style={{ color: hovered === "user" ? "#60A5FA" : "#334155" }}
            >
              Enter Portal
              <svg className="w-4 h-4 transition-transform duration-300"
                style={{ transform: hovered === "user" ? "translateX(4px)" : "none" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>

          {/* Admin Portal */}
          <button
            onClick={() => onSelect("admin")}
            onMouseEnter={() => setHovered("admin")}
            onMouseLeave={() => setHovered(null)}
            className="group relative text-left p-8 rounded-3xl transition-all duration-400 overflow-hidden"
            style={{
              background: hovered === "admin"
                ? "rgba(124,58,237,0.12)"
                : "rgba(255,255,255,0.03)",
              border: hovered === "admin"
                ? "1px solid rgba(124,58,237,0.5)"
                : "1px solid rgba(255,255,255,0.07)",
              boxShadow: hovered === "admin"
                ? "0 20px 60px rgba(124,58,237,0.2), 0 0 0 1px rgba(124,58,237,0.3)"
                : "none",
              transform: hovered === "admin" ? "translateY(-4px) scale(1.01)" : "none",
              transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Top glow border */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl transition-opacity duration-300"
              style={{
                background: "linear-gradient(90deg, transparent, #7C3AED, #A78BFA, transparent)",
                opacity: hovered === "admin" ? 1 : 0,
              }}
            />

            {/* Admin badge */}
            <div
              className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                background: "rgba(124,58,237,0.15)",
                color: "#A78BFA",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              Restricted
            </div>

            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
              style={{
                background: hovered === "admin"
                  ? "linear-gradient(135deg, #7C3AED, #4F46E5)"
                  : "rgba(124,58,237,0.15)",
                boxShadow: hovered === "admin" ? "0 8px 24px rgba(124,58,237,0.4)" : "none",
              }}
            >
              <svg className="w-7 h-7" fill="none" stroke={hovered === "admin" ? "white" : "#A78BFA"} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <h3
              className="text-xl font-bold mb-2 transition-colors duration-300"
              style={{ color: hovered === "admin" ? "#FFFFFF" : "#E2E8F0" }}
            >
              Admin Portal
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#64748B" }}>
              Full system control — manage bookings, users, and service operations.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Manage Bookings", "User Control", "Analytics"].map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full transition-all duration-300"
                  style={{
                    background: hovered === "admin" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)",
                    color: hovered === "admin" ? "#C4B5FD" : "#475569",
                    border: hovered === "admin" ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="flex items-center gap-2 mt-6 text-sm font-semibold transition-all duration-300"
              style={{ color: hovered === "admin" ? "#A78BFA" : "#334155" }}
            >
              Enter Portal
              <svg className="w-4 h-4 transition-transform duration-300"
                style={{ transform: hovered === "admin" ? "translateX(4px)" : "none" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs" style={{ color: "#1E293B" }}>
          © 2026 RMK Garage · All rights reserved
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ROOT APP
   ════════════════════════════════════════════════════════ */
function App() {
  const [user, setUser] = useState(null);
  // "select" → landing, "user" → user login, "admin" → admin login
  const [portal, setPortal] = useState("select");

  // Once logged in, route to dashboard by role
  if (user) {
    return user.role === "admin"
      ? <AdminDashboard />
      : <UserDashboard />;
  }

  // Portal selection landing
  if (portal === "select") {
    return <PortalSelect onSelect={setPortal} />;
  }

  // Admin login
  if (portal === "admin") {
    return (
      <AdminLogin
        setUser={setUser}
        onSwitchToUser={() => setPortal("user")}
      />
    );
  }

  // User login
  return (
    <Login
      setUser={setUser}
      onSwitchToAdmin={() => setPortal("admin")}
      onBack={() => setPortal("select")}
    />
  );
}

export default App;
