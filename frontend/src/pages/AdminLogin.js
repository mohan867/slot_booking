import React, { useState, useEffect } from "react";
import { loginAdmin } from "../services/firebaseService";

/* ── Particle animation canvas ─────────────────────────────── */
const ParticleCanvas = () => {
    useEffect(() => {
        const canvas = document.getElementById("admin-particles");
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
                ctx.fillStyle = `rgba(34, 197, 94, ${p.alpha})`;
                ctx.fill();
            });

            // Draw connecting lines
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(34, 197, 94, ${0.08 * (1 - dist / 100)})`;
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

    return (
        <canvas
            id="admin-particles"
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};

/* ── Animated shield icon ──────────────────────────────────── */
const ShieldIcon = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
    </svg>
);

/* ══════════════════════════════════════════════════════════ */
/*                    ADMIN LOGIN PAGE                        */
/* ══════════════════════════════════════════════════════════ */
function AdminLogin({ setUser, onSwitchToUser }) {
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
            const loggedUser = await loginAdmin({
                email: formData.email,
                password: formData.password,
            });

            setMsgType("success");
            setMsg("Authentication successful. Redirecting to admin panel...");

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
                background: "radial-gradient(ellipse at 30% 20%, rgba(34,197,94,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.12) 0%, transparent 50%), linear-gradient(135deg, #030712 0%, #041410 40%, #051A12 100%)",
            }}
        >
            {/* Animated particle background */}
            <ParticleCanvas />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)`,
                    backgroundSize: "50px 50px",
                    zIndex: 1,
                }}
            />

            {/* Glow orbs */}
            <div className="absolute pointer-events-none" style={{ zIndex: 1 }}>
                <div
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-blob"
                    style={{ background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-0 right-0 w-96 h-96 rounded-full animate-blob animation-delay-2000"
                    style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full animate-blob animation-delay-4000"
                    style={{ background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)" }}
                />
            </div>

            {/* Left Panel — Branding */}
            <div
                className={`hidden lg:flex flex-col justify-between w-2/5 p-12 relative transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                style={{ zIndex: 2 }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #166534, #22C55E)", boxShadow: "0 8px 32px rgba(34,197,94,0.4)" }}
                    >
                        <ShieldIcon size={24} />
                    </div>
                    <div>
                        <div className="text-white font-bold text-lg tracking-tight">RMK Garage</div>
                        <div className="text-xs" style={{ color: "#4ADE80" }}>Admin Control Panel</div>
                    </div>
                </div>

                {/* Center content */}
                <div className="space-y-8">
                    <div>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                            style={{ background: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.2)" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#4ADE80' }} />
                            Secure Administrator Zone
                        </div>
                        <h1 className="text-4xl font-black text-white leading-tight mb-4">
                            Admin
                            <span
                                className="block"
                                style={{
                                    background: "linear-gradient(135deg, #4ADE80, #22C55E)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Control Panel
                            </span>
                        </h1>
                        <p style={{ color: "#6B7280" }} className="text-sm leading-relaxed max-w-xs">
                            Manage bookings, review service requests, and oversee the complete vehicle service ecosystem from one powerful dashboard.
                        </p>
                    </div>

                    {/* Feature Pills */}
                    <div className="space-y-3">
                        {[
                            { label: "Booking Management", sub: "Accept or reject service requests", icon: "📋" },
                            { label: "User Analytics", sub: "Monitor customer activity", icon: "📊" },
                            { label: "Real-time Updates", sub: "Live booking status tracking", icon: "⚡" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(34,197,94,0.12)",
                                    animationDelay: `${i * 100}ms`,
                                }}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <div className="text-white text-sm font-semibold">{item.label}</div>
                                    <div className="text-xs" style={{ color: "#6B7280" }}>{item.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live clock */}
                <div
                    className="p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(34,197,94,0.12)" }}
                >
                    <div className="text-3xl font-black tracking-widest mb-1" style={{ color: "#4ADE80", fontVariantNumeric: "tabular-nums" }}>
                        {timeStr}
                    </div>
                    <div className="text-xs" style={{ color: "#4B5563" }}>{dateStr}</div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div
                className={`flex-1 flex items-center justify-center p-6 lg:p-12 relative transition-all duration-1000 delay-150 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ zIndex: 2 }}
            >
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #166534, #22C55E)" }}
                        >
                            <ShieldIcon size={20} />
                        </div>
                        <div>
                            <div className="text-white font-bold">RMK Admin Portal</div>
                            <div className="text-xs" style={{ color: "#4ADE80" }}>Secure Access</div>
                        </div>
                    </div>

                    {/* Card */}
                    <div
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(40px)",
                            WebkitBackdropFilter: "blur(40px)",
                            border: "1px solid rgba(34,197,94,0.15)",
                            borderRadius: 28,
                            boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.1) inset",
                        }}
                    >
                        {/* Card header */}
                        <div
                            className="px-8 pt-8 pb-6"
                            style={{ borderBottom: "1px solid rgba(34,197,94,0.12)" }}
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
                                    style={{
                                        background: "linear-gradient(135deg, #166534, #22C55E)",
                                        boxShadow: "0 8px 30px rgba(34,197,94,0.4)",
                                    }}
                                >
                                    <ShieldIcon size={28} />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-xl">Administrator Login</h2>
                                    <p className="text-sm" style={{ color: "#6B7280" }}>Restricted access portal</p>
                                </div>
                            </div>

                            {/* Security badge */}
                            <div
                                className="flex items-center gap-2 p-3 rounded-xl"
                                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}
                            >
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#4ADE80" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-xs" style={{ color: "#4ADE80" }}>
                                    🔒 End-to-end encrypted · Session protected · Access logged
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="px-8 py-6">
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                                        style={{ color: focused.email ? "#4ADE80" : "#4B5563" }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Admin email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocused(f => ({ ...f, email: true }))}
                                        onBlur={() => setFocused(f => ({ ...f, email: false }))}
                                        required
                                        disabled={loading}
                                        autoComplete="email"
                                        className="w-full pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 rounded-xl transition-all duration-200 outline-none"
                                        style={{
                                            background: focused.email ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                                            border: focused.email ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: focused.email ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
                                        }}
                                    />
                                    {focused.email && (
                                        <div
                                            className="absolute -top-2.5 left-3 text-xs font-bold px-1"
                                            style={{ color: "#4ADE80", background: "#041410" }}
                                        >
                                            ADMIN EMAIL
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                                        style={{ color: focused.password ? "#4ADE80" : "#4B5563" }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Admin password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocused(f => ({ ...f, password: true }))}
                                        onBlur={() => setFocused(f => ({ ...f, password: false }))}
                                        required
                                        disabled={loading}
                                        autoComplete="current-password"
                                        className="w-full pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-600 rounded-xl transition-all duration-200 outline-none"
                                        style={{
                                            background: focused.password ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                                            border: focused.password ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: focused.password ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
                                        }}
                                    />
                                    {focused.password && (
                                        <div
                                            className="absolute -top-2.5 left-3 text-xs font-bold px-1"
                                            style={{ color: "#4ADE80", background: "#041410" }}
                                        >
                                            PASSWORD
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: showPassword ? "#4ADE80" : "#4B5563" }}
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

                                {/* Message */}
                                {msg && (
                                    <div
                                        className="p-3 rounded-xl flex items-center gap-2 text-sm animate-fadeIn"
                                        style={{
                                            background: msgType === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                                            border: msgType === "error" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(34,197,94,0.2)",
                                            color: msgType === "error" ? "#F87171" : "#4ADE80",
                                        }}
                                    >
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

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white transition-all duration-300"
                                    style={{
                                        background: loading
                                            ? "rgba(34,197,94,0.4)"
                                            : "linear-gradient(135deg, #166534 0%, #15803D 50%, #22C55E 100%)",
                                        boxShadow: loading ? "none" : "0 8px 32px rgba(34,197,94,0.4)",
                                        border: "1px solid rgba(74,222,128,0.25)",
                                    }}
                                >
                                    {/* Shimmer */}
                                    {!loading && (
                                        <div
                                            className="absolute inset-0 animate-gradient"
                                            style={{
                                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                                                backgroundSize: "200% 100%",
                                            }}
                                        />
                                    )}

                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldIcon size={18} />
                                            <span>Access Admin Panel</span>
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Loading progress bar */}
                            {loading && (
                                <div className="mt-4">
                                    <div
                                        className="h-0.5 rounded-full overflow-hidden"
                                        style={{ background: "rgba(34,197,94,0.15)" }}
                                    >
                                        <div
                                            className="h-full rounded-full animate-gradient"
                                            style={{
                                                background: "linear-gradient(90deg, #22C55E, #4ADE80, #22C55E)",
                                                backgroundSize: "200% 100%",
                                                width: "60%",
                                                animation: "shimmer 1s infinite",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Card footer */}
                        <div
                            className="px-8 pb-8"
                            style={{ borderTop: "1px solid rgba(34,197,94,0.08)" }}
                        >
                            <div className="pt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs" style={{ color: "#4B5563" }}>
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                                    System Online
                                </div>
                                <button
                                    type="button"
                                    onClick={onSwitchToUser}
                                    className="text-xs font-medium transition-colors flex items-center gap-1.5"
                                    style={{ color: "#6B7280" }}
                                    onMouseEnter={e => { e.currentTarget.style.color = "#4ADE80"; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; }}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    User login instead
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom warning */}
                    <div
                        className="mt-4 flex items-center gap-2 text-xs justify-center"
                        style={{ color: "#374151" }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Unauthorized access attempts are monitored and logged
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
