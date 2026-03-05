import React, { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Shop Location (RMK Garage) ─── */
const SHOP_LOCATION = { lat: 13.0827, lng: 80.2707, name: "RMK Garage" };

/* ── Leaflet default icon fix ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Icon Helper ───────────────────────────────────────────── */
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
  </svg>
);

const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  bookings: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  chevronRight: "M9 5l7 7-7 7",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  lightning: "M13 10V3L4 14h7v7l9-11h-7z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 18L18 6M6 6l12 12",
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  car: "M17 16v2a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m8-11V4a2 2 0 00-2-2H9a2 2 0 00-2 2v1M7 9h10l1 7H6L7 9z",
  mapPin: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  wrench: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  truck: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1zm0 0l2-1 2 1 2-1 2 1V6a1 1 0 00-1-1h-4a1 1 0 00-1 1v10z",
};

const getStatusBadge = (status, dark) => {
  if (dark) {
    const map = { Pending: "badge-pending", Accepted: "badge-accepted", Rejected: "badge-rejected" };
    return map[status] || "badge-pending";
  }
  const map = { Pending: "badge-pending-light", Accepted: "badge-accepted-light", Rejected: "badge-rejected-light" };
  return map[status] || "badge-pending-light";
};

/* ── Admin Sidebar ─────────────────────────────────────────── */
const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, dark, sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { id: "bookings", label: "All Bookings", icon: ICONS.bookings },
    { id: "users", label: "Users", icon: ICONS.users },
  ];

  const sidebarBg = dark ? "sidebar-dark" : "sidebar-light";
  const logoText = dark ? "text-white" : "text-slate-900";
  const logoSub = dark ? "text-slate-500" : "text-slate-400";
  const logoutStyle = dark
    ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
    : "text-slate-400 hover:text-red-500 hover:bg-red-50";

  return (
    <>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-20 animate-fadeIn"
          onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        sidebar-transition
        ${sidebarBg}
        ${sidebarOpen ? "sidebar-mobile-visible" : "sidebar-mobile-hidden"}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6"
          style={{ borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
            <Icon path={ICONS.shield} className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`font-bold text-base tracking-tight ${logoText}`}>Admin Portal</div>
            <div className={`text-xs ${logoSub}`}>RMK Garage</div>
          </div>
          <button className={`ml-auto lg:hidden transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => setSidebarOpen(false)}>
            <Icon path={ICONS.close} className="w-5 h-5" />
          </button>
        </div>

        {/* Badge */}
        <div className="px-6 py-3">
          <div className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
            style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Administrator
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className={`text-xs font-700 uppercase tracking-widest mb-3 px-3 ${dark ? "text-slate-600" : "text-slate-400"}`}
            style={{ fontWeight: 700 }}>
            Management
          </div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200
                ${dark ? "nav-item-dark" : "nav-item-light"}
                ${activeTab === item.id ? "active" : ""}
              `}
            >
              <Icon path={item.icon} className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {activeTab === item.id && (
                <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }} />
              )}
            </button>
          ))}
        </nav>

        {/* Admin info + Logout */}
        <div className="px-3 pb-6 space-y-2"
          style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
          <div className="flex items-center gap-3 px-3 py-3" style={{ borderRadius: 12 }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>A</div>
            <div>
              <div className={`text-sm font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}>Admin User</div>
              <div className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>admin@rmk.com</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all ${logoutStyle}`}>
            <Icon path={ICONS.logout} className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

/* ── Stat Card ────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, gradient, icon, delay = 0 }) => (
  <div className="stat-card animate-fadeInUp" style={{ background: gradient, animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}>
        <Icon path={icon} className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
    <div className="text-sm font-semibold text-white/80 uppercase tracking-wide">{label}</div>
    <div className="text-xs text-white/50 mt-1">{sub}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
/*                     ADMIN DASHBOARD                       */
/* ══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ── Admin map refs for booking detail ── */
  const adminMapContainerRef = useRef(null);
  const adminMapInstanceRef = useRef(null);

  /* ── Initialize map when booking detail modal opens with location ── */
  useEffect(() => {
    // Cleanup previous map
    if (adminMapInstanceRef.current) {
      adminMapInstanceRef.current.remove();
      adminMapInstanceRef.current = null;
    }

    if (!selectedBooking?.pickupLocation?.lat || !adminMapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!adminMapContainerRef.current || adminMapInstanceRef.current) return;

      const userLat = selectedBooking.pickupLocation.lat;
      const userLng = selectedBooking.pickupLocation.lng;

      const map = L.map(adminMapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: true
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '\u00a9 OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Shop marker
      const shopIcon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#7C3AED,#4F46E5);width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>`,
        className: '', iconSize: [36, 36], iconAnchor: [18, 36]
      });
      L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], { icon: shopIcon }).addTo(map)
        .bindPopup('<b>RMK Garage</b><br/><small>Shop Location</small>');

      // User marker
      const userIcon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#2563EB,#38BDF8);width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
        </div>`,
        className: '', iconSize: [36, 36], iconAnchor: [18, 36]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
        .bindPopup(`<b>Customer Pickup</b><br/><small>${(selectedBooking.pickupLocation.address || '').substring(0, 60)}...</small>`)
        .openPopup();

      // Route line
      L.polyline(
        [[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [userLat, userLng]],
        { color: '#2563EB', weight: 3, opacity: 0.6, dashArray: '8, 8' }
      ).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [userLat, userLng]]);
      map.fitBounds(bounds, { padding: [50, 50] });

      adminMapInstanceRef.current = map;
    }, 300);

    return () => {
      clearTimeout(timer);
      if (adminMapInstanceRef.current) {
        adminMapInstanceRef.current.remove();
        adminMapInstanceRef.current = null;
      }
    };
  }, [selectedBooking]);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try { const res = await API.get("/admin/bookings"); setBookings(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, type) => {
    setActionLoading(id + type);
    try {
      await API.put(`/admin/booking/${type}/${id}`);
      const newStatus = type === "accept" ? "Accepted" : "Rejected";
      setBookings(prev => prev.map(b =>
        b._id === id ? { ...b, status: newStatus } : b
      ));
      // Update detail modal if open
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  const handleLogout = async () => {
    try { await API.post("/auth/logout"); } catch { }
    window.location.reload();
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    accepted: bookings.filter(b => b.status === "Accepted").length,
    rejected: bookings.filter(b => b.status === "Rejected").length,
  };

  const filteredBookings = bookings.filter(b =>
    filterStatus === "All" ? true : b.status === filterStatus
  );

  // Unique users
  const uniqueUsers = [...new Map(bookings.map(b => [b.userId?._id, b.userId]).filter(([k]) => k)).values()];

  /* Theme helpers */
  const textPrimary = dark ? "text-slate-100" : "text-slate-900";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const cardClass = dark ? "card-dark" : "card-light";
  const badgeFn = (s) => getStatusBadge(s, dark);

  /* Filter chip styles */
  const filterChip = (status) => {
    const isActive = filterStatus === status;
    if (!isActive) return dark
      ? "border border-white/8 text-slate-400 hover:border-violet-500/30 hover:text-violet-300"
      : "border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600";

    return `text-white border-transparent`;
  };

  return (
    <div className={`${dark ? "bg-app-dark" : "bg-app-light"} min-h-screen flex`}>
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        dark={dark}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 ${dark ? "border-b border-white/5" : "border-b border-black/5"
          }`} style={{
            background: dark ? "rgba(10,15,30,0.85)" : "rgba(240,244,255,0.85)",
            backdropFilter: "blur(20px)"
          }}>
          <div className="flex items-center gap-4">
            <button className={`lg:hidden transition-colors ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon path={ICONS.menu} className="w-6 h-6" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${textPrimary}`}>
                {activeTab === "dashboard" && "Admin Dashboard"}
                {activeTab === "bookings" && "Booking Management"}
                {activeTab === "users" && "User Management"}
              </h1>
              <p className={`text-xs ${textSecondary}`}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBookings}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${dark ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200"
                : "bg-black/5 hover:bg-black/10 text-slate-400 hover:text-slate-700"
                }`}>
              <Icon path={ICONS.refresh} className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setDark(!dark)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${dark ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-yellow-400"
                : "bg-black/5 hover:bg-black/10 text-slate-400 hover:text-blue-600"
                }`}>
              <Icon path={dark ? ICONS.sun : ICONS.moon} className="w-4 h-4" />
            </button>
            {/* Pending alert */}
            {stats.pending > 0 && (
              <button onClick={() => { setActiveTab("bookings"); setFilterStatus("Pending"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(234,179,8,0.15)", color: "#EAB308", border: "1px solid rgba(234,179,8,0.3)" }}>
                <Icon path={ICONS.clock} className="w-3.5 h-3.5" />
                {stats.pending} Pending
              </button>
            )}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 px-4 sm:px-6 py-6">

          {/* ══════ DASHBOARD ══════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 page-transition">
              <div>
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Overview</h2>
                <p className={`text-sm mt-1 ${textSecondary}`}>Complete booking system analytics</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Bookings" value={stats.total} sub="All time"
                  gradient="linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)"
                  icon={ICONS.bookings} delay={0} />
                <StatCard label="Pending" value={stats.pending} sub="Needs action"
                  gradient="linear-gradient(135deg, #92400E 0%, #B45309 50%, #D97706 100%)"
                  icon={ICONS.clock} delay={80} />
                <StatCard label="Accepted" value={stats.accepted} sub="Confirmed slots"
                  gradient="linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)"
                  icon={ICONS.check} delay={160} />
                <StatCard label="Rejected" value={stats.rejected} sub="Declined"
                  gradient="linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #EF4444 100%)"
                  icon={ICONS.x} delay={240} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Progress */}
                <div className={`${cardClass} p-6 lg:col-span-1`}>
                  <div className="flex items-center gap-2 mb-5">
                    <Icon path={ICONS.info} className={`w-5 h-5 ${dark ? "text-violet-400" : "text-violet-600"}`} />
                    <h3 className={`font-semibold text-sm ${textPrimary}`}>Status Overview</h3>
                  </div>
                  {stats.total === 0 ? (
                    <p className={`text-sm ${textSecondary}`}>No data yet</p>
                  ) : (
                    <div className="space-y-5">
                      {[
                        { label: "Pending", val: stats.pending, color: "#EAB308", bg: "rgba(234,179,8,0.15)" },
                        { label: "Accepted", val: stats.accepted, color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
                        { label: "Rejected", val: stats.rejected, color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-2">
                            <span className={textSecondary}>{item.label}</span>
                            <span className="font-bold" style={{ color: item.color }}>
                              {item.val} ({stats.total > 0 ? Math.round((item.val / stats.total) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{
                              width: `${stats.total > 0 ? (item.val / stats.total) * 100 : 0}%`,
                              background: `linear-gradient(90deg, ${item.color}, ${item.bg})`
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className={`${cardClass} p-6`}>
                  <div className="flex items-center gap-2 mb-5">
                    <Icon path={ICONS.lightning} className={`w-5 h-5 ${dark ? "text-violet-400" : "text-violet-600"}`} />
                    <h3 className={`font-semibold text-sm ${textPrimary}`}>Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Review All Bookings", sub: "Manage requests", icon: ICONS.bookings, tab: "bookings", filter: "All", color: "#7C3AED" },
                      { label: `Review Pending (${stats.pending})`, sub: "Action required", icon: ICONS.clock, tab: "bookings", filter: "Pending", color: "#EAB308" },
                      { label: "Manage Users", sub: `${uniqueUsers.length} registered users`, icon: ICONS.users, tab: "users", filter: null, color: "#10B981" },
                    ].map(item => (
                      <button key={item.label} onClick={() => { setActiveTab(item.tab); if (item.filter) setFilterStatus(item.filter); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${dark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}20` }}>
                          <Icon path={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-sm font-medium ${textPrimary}`}>{item.label}</div>
                          <div className={`text-xs ${textSecondary}`}>{item.sub}</div>
                        </div>
                        <Icon path={ICONS.chevronRight} className={`w-4 h-4 ml-auto flex-shrink-0 ${textSecondary}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className={`${cardClass} p-6`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Icon path={ICONS.clock} className={`w-5 h-5 ${dark ? "text-violet-400" : "text-violet-600"}`} />
                      <h3 className={`font-semibold text-sm ${textPrimary}`}>Recent Bookings</h3>
                    </div>
                    <button onClick={() => setActiveTab("bookings")}
                      className={`text-xs ${dark ? "text-violet-400" : "text-violet-600"} hover:underline`}>
                      View all
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <Icon path={ICONS.bookings} className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map(b => (
                        <div key={b._id} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${dark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(124,58,237,0.15)" }}>
                            <Icon path={ICONS.user} className="w-4 h-4" style={{ color: "#A78BFA" }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${textPrimary}`}>{b.userId?.name || "Customer"}</div>
                            <div className={`text-xs ${textSecondary}`}>{b.vehicleNumber} · {b.serviceDate}</div>
                          </div>
                          <span className={badgeFn(b.status)}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════ ALL BOOKINGS ══════ */}
          {activeTab === "bookings" && (
            <div className="page-transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary}`}>Booking Management</h2>
                  <p className={`text-sm ${textSecondary}`}>{filteredBookings.length} of {stats.total} bookings</p>
                </div>
                <button onClick={fetchBookings}
                  className="flex items-center gap-2 btn-primary py-2 px-4 text-sm"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
                  <Icon path={ICONS.refresh} className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "All", count: stats.total, grad: "linear-gradient(135deg,#7C3AED,#4F46E5)" },
                  { label: "Pending", count: stats.pending, grad: "linear-gradient(135deg,#B45309,#D97706)" },
                  { label: "Accepted", count: stats.accepted, grad: "linear-gradient(135deg,#065F46,#059669)" },
                  { label: "Rejected", count: stats.rejected, grad: "linear-gradient(135deg,#7F1D1D,#DC2626)" },
                ].map(f => (
                  <button key={f.label}
                    onClick={() => setFilterStatus(f.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterChip(f.label)}`}
                    style={filterStatus === f.label ? { background: f.grad } : dark ? { border: "1px solid rgba(255,255,255,0.08)" } : {}}
                  >
                    {f.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === f.label ? "bg-white/20 text-white" : dark ? "bg-white/8 text-slate-500" : "bg-slate-100 text-slate-500"
                      }`}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Table */}
              {filteredBookings.length === 0 ? (
                <div className={`${cardClass} p-16 text-center`}>
                  <Icon path={ICONS.bookings} className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-600" : "text-slate-300"}`} />
                  <p className={textSecondary}>No {filterStatus.toLowerCase()} bookings found</p>
                </div>
              ) : (
                <div className={`${cardClass} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className={`w-full ${dark ? "table-dark" : "table-light"}`}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Customer</th>
                          <th>Vehicle</th>
                          <th>Service Date</th>
                          <th>Issue</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b, idx) => (
                          <tr key={b._id} onClick={() => setSelectedBooking(b)}
                            className="cursor-pointer" style={{ transition: 'background 0.15s' }}>
                            <td className={`font-mono text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>
                              #{(idx + 1).toString().padStart(3, "0")}
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}>
                                  {(b.userId?.name || "?")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className={`font-medium text-sm ${textPrimary}`}>{b.userId?.name || "N/A"}</div>
                                  <div className={`text-xs ${textSecondary}`}>{b.userId?.email || ""}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="font-mono font-bold text-sm px-2 py-1 rounded-lg"
                                style={{ background: dark ? "rgba(99,102,241,0.15)" : "#EEF2FF", color: dark ? "#A5B4FC" : "#4338CA" }}>
                                {b.vehicleNumber}
                              </span>
                            </td>
                            <td>
                              <div className={`text-sm ${textPrimary}`}>{b.serviceDate}</div>
                              <div className={`text-xs ${textSecondary}`}>{b.serviceTime}</div>
                            </td>
                            <td>
                              {b.issueCategories?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {b.issueCategories.slice(0, 2).map((c, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ background: dark ? "rgba(124,58,237,0.15)" : "#F3E8FF", color: dark ? "#C4B5FD" : "#7C3AED" }}>
                                      {c}
                                    </span>
                                  ))}
                                  {b.issueCategories.length > 2 && (
                                    <span className={`text-xs ${textSecondary}`}>+{b.issueCategories.length - 2}</span>
                                  )}
                                </div>
                              ) : (
                                <span className={`text-xs italic ${textSecondary}`}>{b.issue?.slice(0, 30) || "—"}</span>
                              )}
                            </td>
                            <td><span className={badgeFn(b.status)}>{b.status}</span></td>
                            <td className="text-right">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto"
                                style={{
                                  background: dark ? 'rgba(124,58,237,0.15)' : '#F3E8FF',
                                  color: dark ? '#C4B5FD' : '#7C3AED',
                                  border: dark ? '1px solid rgba(124,58,237,0.3)' : '1px solid #E9D5FF'
                                }}>
                                <Icon path={ICONS.info} className="w-3.5 h-3.5" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ USERS ══════ */}
          {activeTab === "users" && (
            <div className="page-transition">
              <div className="mb-6">
                <h2 className={`text-xl font-bold ${textPrimary}`}>User Management</h2>
                <p className={`text-sm ${textSecondary}`}>{uniqueUsers.length} registered users</p>
              </div>

              {uniqueUsers.length === 0 ? (
                <div className={`${cardClass} p-16 text-center`}>
                  <Icon path={ICONS.users} className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-600" : "text-slate-300"}`} />
                  <p className={textSecondary}>No users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueUsers.map(u => {
                    if (!u) return null;
                    const userBookings = bookings.filter(b => b.userId?._id === u._id);
                    return (
                      <div key={u._id} className={`${cardClass} p-5 cursor-pointer transition-all hover:scale-[1.02]`}
                        onClick={() => setSelectedUser(u)}
                        style={{ transition: 'transform 0.15s, box-shadow 0.15s' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}>
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-semibold truncate ${textPrimary}`}>{u.name}</div>
                            <div className={`text-xs truncate ${textSecondary}`}>{u.email}</div>
                          </div>
                          <Icon path={ICONS.chevronRight} className={`w-4 h-4 ml-auto flex-shrink-0 ${textSecondary}`} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Total", val: userBookings.length, color: dark ? "#A78BFA" : "#7C3AED" },
                            { label: "Accepted", val: userBookings.filter(b => b.status === "Accepted").length, color: "#22C55E" },
                            { label: "Pending", val: userBookings.filter(b => b.status === "Pending").length, color: "#EAB308" },
                          ].map(item => (
                            <div key={item.label} className="py-2 rounded-xl"
                              style={{ background: dark ? "rgba(255,255,255,0.04)" : "#F8FAFF" }}>
                              <div className="font-bold text-xl" style={{ color: item.color }}>{item.val}</div>
                              <div className={`text-xs ${textSecondary}`}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Booking Detail Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 animate-fadeIn"
            onClick={() => setSelectedBooking(null)} />
          <div className={`relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeInUp`}
            style={{
              borderRadius: 24,
              border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
              background: dark ? 'rgba(17,24,39,0.97)' : '#FFFFFF',
              backdropFilter: 'blur(40px)'
            }}>
            {/* Header Gradient */}
            <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', borderRadius: '24px 24px 0 0' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                  <Icon path={ICONS.close} className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  {(selectedBooking.userId?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold text-base">{selectedBooking.userId?.name || 'N/A'}</div>
                  <div className="text-white/70 text-xs">{selectedBooking.userId?.email || ''}</div>
                </div>
                <span className={`ml-auto ${badgeFn(selectedBooking.status)}`}>{selectedBooking.status}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Booking ID + Timestamps */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: dark ? '#94A3B8' : '#64748B' }}>
                  ID: #{selectedBooking._id?.slice(-8).toUpperCase()}
                </span>
                <span className={`text-xs ${textSecondary}`}>
                  Booked: {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>Customer Information</div>
                <div className={`rounded-xl p-4 space-y-3`} style={{
                  background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)' }}>
                      <Icon path={ICONS.user} className="w-4 h-4" style={{ color: '#A78BFA' }} />
                    </div>
                    <div>
                      <div className={`text-xs ${textSecondary}`}>Name</div>
                      <div className={`text-sm font-semibold ${textPrimary}`}>{selectedBooking.userId?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                      <Icon path={ICONS.mail} className="w-4 h-4" style={{ color: '#60A5FA' }} />
                    </div>
                    <div>
                      <div className={`text-xs ${textSecondary}`}>Email</div>
                      <div className={`text-sm font-medium ${textPrimary}`}>{selectedBooking.userId?.email || 'N/A'}</div>
                    </div>
                  </div>
                  {/* Location Details */}
                  {selectedBooking.pickupLocation?.lat && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                          <Icon path={ICONS.mapPin} className="w-4 h-4" style={{ color: '#10B981' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs ${textSecondary}`}>Location</div>
                          <div className={`text-sm font-medium ${textPrimary} leading-relaxed`}>
                            {selectedBooking.pickupLocation.address || `${selectedBooking.pickupLocation.lat.toFixed(4)}, ${selectedBooking.pickupLocation.lng.toFixed(4)}`}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}&destination=${selectedBooking.pickupLocation.lat},${selectedBooking.pickupLocation.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                        <Icon path={ICONS.mapPin} className="w-4 h-4" /> Navigate to Customer
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Vehicle & Service Info */}
              <div>
                <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>Service Details</div>
                <div className={`rounded-xl p-4`} style={{
                  background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                }}>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Vehicle */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <Icon path={ICONS.car} className="w-4 h-4" style={{ color: '#818CF8' }} />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondary}`}>Vehicle</div>
                        <div className="font-mono font-bold text-sm" style={{ color: dark ? '#A5B4FC' : '#4338CA' }}>{selectedBooking.vehicleNumber}</div>
                      </div>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                        background: selectedBooking.status === 'Pending' ? 'rgba(234,179,8,0.15)' : selectedBooking.status === 'Accepted' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'
                      }}>
                        <Icon path={selectedBooking.status === 'Pending' ? ICONS.clock : selectedBooking.status === 'Accepted' ? ICONS.check : ICONS.x} className="w-4 h-4"
                          style={{ color: selectedBooking.status === 'Pending' ? '#EAB308' : selectedBooking.status === 'Accepted' ? '#22C55E' : '#EF4444' }} />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondary}`}>Status</div>
                        <div className={`text-sm font-semibold ${textPrimary}`}>{selectedBooking.status}</div>
                      </div>
                    </div>
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                        <Icon path={ICONS.calendar} className="w-4 h-4" style={{ color: '#22C55E' }} />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondary}`}>Service Date</div>
                        <div className={`text-sm font-semibold ${textPrimary}`}>{selectedBooking.serviceDate}</div>
                      </div>
                    </div>
                    {/* Time */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.15)' }}>
                        <Icon path={ICONS.clock} className="w-4 h-4" style={{ color: '#EAB308' }} />
                      </div>
                      <div>
                        <div className={`text-xs ${textSecondary}`}>Time Slot</div>
                        <div className={`text-sm font-semibold ${textPrimary}`}>{selectedBooking.serviceTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>Issue Details</div>
                <div className={`rounded-xl p-4`} style={{
                  background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                }}>
                  {selectedBooking.issueCategories?.length > 0 && (
                    <div className="mb-3">
                      <div className={`text-xs mb-2 ${textSecondary}`}>Service Categories</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBooking.issueCategories.map((c, i) => (
                          <span key={i} className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ background: dark ? 'rgba(124,58,237,0.15)' : '#F3E8FF', color: dark ? '#C4B5FD' : '#7C3AED', border: dark ? '1px solid rgba(124,58,237,0.3)' : '1px solid #E9D5FF' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedBooking.issue && selectedBooking.issue !== 'See issue categories' && (
                    <div>
                      <div className={`text-xs mb-1.5 ${textSecondary}`}>Description</div>
                      <p className={`text-sm leading-relaxed ${textPrimary}`}>{selectedBooking.issue}</p>
                    </div>
                  )}
                  {(!selectedBooking.issueCategories?.length && (!selectedBooking.issue || selectedBooking.issue === 'See issue categories')) && (
                    <p className={`text-sm italic ${textSecondary}`}>No issue details provided</p>
                  )}
                </div>
              </div>

              {/* Doorstep Pickup & Delivery */}
              {(selectedBooking.doorstepDelivery || selectedBooking.pickupLocation?.lat) && (
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>Doorstep Pickup & Delivery</div>
                  <div className="rounded-xl overflow-hidden" style={{
                    background: dark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)',
                    border: dark ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(37,99,235,0.15)'
                  }}>
                    <div className="p-4">
                      <div className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                        <Icon path={ICONS.truck} className="w-4 h-4" /> Doorstep Service Requested
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="rounded-lg p-3 text-center" style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#F0F4FF' }}>
                          <div className={`text-xl font-black ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {selectedBooking.distanceKm || '—'} <span className="text-xs font-semibold">km</span>
                          </div>
                          <div className={`text-xs ${textSecondary}`}>Distance</div>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#F0FDF4' }}>
                          <div className={`text-xl font-black ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            ₹{selectedBooking.doorstepCharge || 100}
                          </div>
                          <div className={`text-xs ${textSecondary}`}>Delivery Fee</div>
                        </div>
                      </div>
                      {selectedBooking.pickupLocation?.address && (
                        <div className="mb-3">
                          <div className={`text-xs font-semibold mb-1 ${textSecondary}`}>Pickup Address</div>
                          <p className={`text-xs leading-relaxed ${textPrimary}`}>{selectedBooking.pickupLocation.address}</p>
                        </div>
                      )}
                      {/* Embedded Map */}
                      {selectedBooking.pickupLocation?.lat && (
                        <div className="mb-3">
                          <div className={`text-xs font-semibold mb-2 ${textSecondary}`}>Location Map</div>
                          <div
                            ref={adminMapContainerRef}
                            style={{ width: '100%', height: 250, borderRadius: 12, overflow: 'hidden', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}
                          />
                        </div>
                      )}
                      {selectedBooking.pickupLocation?.lat && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}&destination=${selectedBooking.pickupLocation.lat},${selectedBooking.pickupLocation.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                          style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                          <Icon path={ICONS.mapPin} className="w-4 h-4" /> Open Navigation in Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}



              {/* Actions */}
              {selectedBooking.status === 'Pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={!!actionLoading}
                    onClick={() => updateStatus(selectedBooking._id, 'accept')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#065F46,#059669)', opacity: actionLoading ? 0.6 : 1 }}>
                    {actionLoading === selectedBooking._id + 'accept' ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg> Accepting...</>
                    ) : (
                      <><Icon path={ICONS.check} className="w-4 h-4" /> Accept Booking</>
                    )}
                  </button>
                  <button
                    disabled={!!actionLoading}
                    onClick={() => updateStatus(selectedBooking._id, 'reject')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#7F1D1D,#DC2626)', opacity: actionLoading ? 0.6 : 1 }}>
                    {actionLoading === selectedBooking._id + 'reject' ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg> Rejecting...</>
                    ) : (
                      <><Icon path={ICONS.x} className="w-4 h-4" /> Reject Booking</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── User Detail Modal ── */}
      {selectedUser && (() => {
        const uBookings = bookings.filter(b => b.userId?._id === selectedUser._id);
        const uLocations = uBookings.filter(b => b.pickupLocation?.lat);
        const uAccepted = uBookings.filter(b => b.status === 'Accepted').length;
        const uPending = uBookings.filter(b => b.status === 'Pending').length;
        const uRejected = uBookings.filter(b => b.status === 'Rejected').length;
        const uDoorstep = uBookings.filter(b => b.doorstepDelivery).length;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 animate-fadeIn"
              onClick={() => setSelectedUser(null)} />
            <div className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeInUp`}
              style={{
                borderRadius: 24,
                border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                background: dark ? 'rgba(17,24,39,0.97)' : '#FFFFFF',
                backdropFilter: 'blur(40px)'
              }}>

              {/* Header Gradient */}
              <div className="p-6 pb-5" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', borderRadius: '24px 24px 0 0' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Customer Profile</h3>
                  <button onClick={() => setSelectedUser(null)}
                    className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                    <Icon path={ICONS.close} className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xl">
                    {(selectedUser.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{selectedUser.name || 'N/A'}</div>
                    <div className="text-white/70 text-sm flex items-center gap-2">
                      <Icon path={ICONS.mail} className="w-3.5 h-3.5" /> {selectedUser.email || ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total', val: uBookings.length, color: dark ? '#A78BFA' : '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
                    { label: 'Accepted', val: uAccepted, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
                    { label: 'Pending', val: uPending, color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
                    { label: 'Rejected', val: uRejected, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                      <div className="font-black text-2xl" style={{ color: s.color }}>{s.val}</div>
                      <div className={`text-xs font-medium ${textSecondary}`}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* All Bookings */}
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>All Bookings ({uBookings.length})</div>
                  {uBookings.length === 0 ? (
                    <div className={`rounded-xl p-8 text-center`} style={{
                      background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <Icon path={ICONS.bookings} className={`w-10 h-10 mx-auto mb-2 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                      <p className={`text-sm ${textSecondary}`}>No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uBookings.map(b => (
                        <div key={b._id}
                          onClick={() => { setSelectedUser(null); setSelectedBooking(b); }}
                          className={`rounded-xl p-4 cursor-pointer transition-all`}
                          style={{
                            background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                          }}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-sm px-2 py-0.5 rounded-lg"
                              style={{ background: dark ? 'rgba(99,102,241,0.15)' : '#EEF2FF', color: dark ? '#A5B4FC' : '#4338CA' }}>
                              {b.vehicleNumber}
                            </span>
                            <span className={badgeFn(b.status)}>{b.status}</span>
                            <span className={`ml-auto text-xs ${textSecondary}`}>#{b._id?.slice(-6).toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                              <Icon path={ICONS.calendar} className="w-3.5 h-3.5" /> {b.serviceDate}
                            </span>
                            <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                              <Icon path={ICONS.clock} className="w-3.5 h-3.5" /> {b.serviceTime}
                            </span>
                            {b.doorstepDelivery && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: dark ? 'rgba(37,99,235,0.15)' : '#DBEAFE', color: dark ? '#93C5FD' : '#1D4ED8' }}>
                                <Icon path={ICONS.truck} className="w-3 h-3" /> Doorstep
                                {b.doorstepCharge ? ` ₹${b.doorstepCharge}` : ''}
                              </span>
                            )}
                          </div>
                          {b.issueCategories?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {b.issueCategories.map((c, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: dark ? 'rgba(124,58,237,0.15)' : '#F3E8FF', color: dark ? '#C4B5FD' : '#7C3AED' }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                          {b.pickupLocation?.address && (
                            <div className={`flex items-start gap-1.5 mt-2 text-xs ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                              <Icon path={ICONS.mapPin} className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{b.pickupLocation.address}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Locations */}
                {uLocations.length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>Customer Locations ({uLocations.length})</div>
                    <div className="space-y-2">
                      {uLocations.map(b => (
                        <div key={b._id + '-loc'} className="rounded-xl overflow-hidden" style={{
                          background: dark ? 'rgba(37,99,235,0.06)' : 'rgba(37,99,235,0.03)',
                          border: dark ? '1px solid rgba(37,99,235,0.15)' : '1px solid rgba(37,99,235,0.12)'
                        }}>
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
                                style={{ background: dark ? 'rgba(99,102,241,0.15)' : '#EEF2FF', color: dark ? '#A5B4FC' : '#4338CA' }}>
                                {b.vehicleNumber}
                              </span>
                              <span className={`text-xs ${textSecondary}`}>{b.serviceDate}</span>
                              {b.doorstepDelivery && b.distanceKm && (
                                <span className={`ml-auto text-xs font-semibold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {b.distanceKm} km · ₹{b.doorstepCharge || 100}
                                </span>
                              )}
                            </div>
                            {b.pickupLocation?.address && (
                              <p className={`text-xs mb-2 ${textPrimary}`}>
                                <Icon path={ICONS.mapPin} className="w-3 h-3 inline mr-1" style={{ verticalAlign: 'middle' }} />
                                {b.pickupLocation.address}
                              </p>
                            )}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${b.pickupLocation.lat},${b.pickupLocation.lng}`}
                              target="_blank" rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                              <Icon path={ICONS.mapPin} className="w-3.5 h-3.5" /> Navigate in Google Maps
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default AdminDashboard;
