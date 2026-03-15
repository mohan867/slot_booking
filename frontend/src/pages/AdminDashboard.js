import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  logoutUser, 
  getCurrentUserProfile, 
  listenAllBookings, 
  listenAllUsers, 
  listenAllStaff,
  updateBookingStatus,
  assignStaffToBooking,
  deleteBooking
} from "../services/firebaseService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AdminDashboardTab from '../components/AdminDashboard/AdminDashboardTab';
import AdminBookingsTab from '../components/AdminDashboard/AdminBookingsTab';
import AdminUsersTab from '../components/AdminDashboard/AdminUsersTab';
import AdminStaffTab from '../components/AdminDashboard/AdminStaffTab';


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
const Icon = ({ path, className = "w-5 h-5", style }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    const map = {
      Pending: "badge-pending",
      Accepted: "badge-accepted",
      Rejected: "badge-rejected",
      Assigned: "badge-assigned",
      "In Progress": "badge-inprogress",
      Completed: "badge-completed"
    };
    return map[status] || "badge-pending";
  }
  const map = {
    Pending: "badge-pending-light",
    Accepted: "badge-accepted-light",
    Rejected: "badge-rejected-light",
    Assigned: "badge-assigned-light",
    "In Progress": "badge-inprogress-light",
    Completed: "badge-completed-light"
  };
  return map[status] || "badge-pending-light";
};


/* ── Sidebar ──────────────────────────────────────────────── */
const Sidebar = ({ activeTab, setActiveTab, handleLogout, dark, sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { id: "bookings", label: "Manage Bookings", icon: ICONS.bookings },
    { id: "users", label: "System Users", icon: ICONS.users },
    { id: "staff", label: "Staff Directory", icon: ICONS.shield },
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
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: dark ? "1px solid rgba(37,99,235,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
            style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)", boxShadow: "0 4px 16px rgba(37,99,235,0.35)" }}>
            <Icon path={ICONS.lightning} className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`font-bold text-base tracking-tight ${logoText}`}>Garage Admin</div>
            <div className={`text-xs ${logoSub}`}>Control Center</div>
          </div>
          <button className={`ml-auto lg:hidden transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => setSidebarOpen(false)}>
            <Icon path={ICONS.close} className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className={`text-xs font-bold uppercase tracking-widest mb-3 px-3 ${dark ? "text-slate-600" : "text-slate-400"}`}>
            Navigation
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
                <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "#3B82F6", boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${logoutStyle}`}
          >
            <Icon path={ICONS.logout} className="w-5 h-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};


/* ── Main Component ────────────────────────────────────────── */
const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Booking Tracking & Filtering ── */
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ── Map Modal State ── */
  const [mapModal, setMapModal] = useState({ isOpen: false, location: null, vehicle: "", address: "" });
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const routeLineRef = useRef(null);
  const shopMarkerRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    
    // ✅ Real-time listeners
    const unsubBookings = listenAllBookings(setBookings);
    const unsubUsers = listenAllUsers(setUsers);
    const unsubStaff = listenAllStaff(setStaff);

    return () => {
      unsubBookings();
      unsubUsers();
      unsubStaff();
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUserData(profile);
    } catch { }
  };

  const filteredBookings = useMemo(() => {
    if (filterStatus === "All") return bookings;
    return bookings.filter(b => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    setLoading(true);
    try {
      await updateBookingStatus(id, status);
      showMessage(`Booking ${status.toLowerCase()}!`, "success");
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showMessage(err.message || "Update failed", "error");
    } finally { setLoading(false); }
  };

  const handleAssignStaff = async (bookingId, staffId) => {
    setLoading(true);
    try {
      await assignStaffToBooking(bookingId, staffId);
      showMessage("Staff assigned successfully!", "success");
    } catch (err) {
      showMessage(err.message || "Assignment failed", "error");
    } finally { setLoading(false); }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Permanently delete this booking?")) return;
    setLoading(true);
    try {
      await deleteBooking(id);
      showMessage("Booking deleted successfully", "success");
      if (selectedBooking?.id === id) setSelectedBooking(null);
    } catch (err) {
      showMessage(err.message || "Delete failed", "error");
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch { }
    window.location.reload();
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  /* ── Map Logic ────────────────────────────────────────── */
  useEffect(() => {
    if (mapModal.isOpen && mapContainerRef.current && !mapInstanceRef.current && mapModal.location) {
      const timer = setTimeout(() => {
        const { lat, lng } = mapModal.location;
        const map = L.map(mapContainerRef.current, { center: [lat, lng], zoom: 13, zoomControl: false });
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

        const shopIcon = L.divIcon({
          html: `<div style="background:linear-gradient(135deg,#059669,#10B981);width:36px;height:36px;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>`,
          className: '', iconSize: [36, 36], iconAnchor: [18, 36]
        });
        shopMarkerRef.current = L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], { icon: shopIcon }).addTo(map).bindPopup(SHOP_LOCATION.name);

        const userIcon = L.divIcon({
          html: `<div style="background:linear-gradient(135deg,#F43F5E,#FB7185);width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
          </div>`,
          className: '', iconSize: [32, 32], iconAnchor: [16, 32]
        });
        markerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup(`<b>Pickup: ${mapModal.vehicle}</b><br/>${mapModal.address?.substring(0,60)}...`);

        routeLineRef.current = L.polyline([[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [lat, lng]], { color: '#3B82F6', weight: 3, opacity: 0.6, dashArray: '10, 10' }).addTo(map);
        map.fitBounds(L.latLngBounds([[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [lat, lng]]), { padding: [50, 50] });

        mapInstanceRef.current = map;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mapModal.isOpen, mapModal.location]);

  const closeMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    setMapModal({ isOpen: false, location: null, vehicle: "", address: "" });
  };

  /* ── UI Config ───────────────────────────────────────────── */
  const appBg = dark ? "bg-app-dark" : "bg-app-light";
  const textPrimary = dark ? "text-slate-100" : "text-slate-900";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const cardClass = dark ? "card-dark" : "card-light";
  const inputClass = dark ? "input-dark" : "input-light";
  const badgeFn = (s) => getStatusBadge(s, dark);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    accepted: bookings.filter(b => b.status === "Accepted").length,
    rejected: bookings.filter(b => b.status === "Rejected").length,
    assigned: bookings.filter(b => b.status === "Assigned").length,
    inProgress: bookings.filter(b => b.status === "In Progress").length,
    completed: bookings.filter(b => b.status === "Completed").length,
    totalUsers: users.length,
    totalStaff: staff.length,
    activeStaff: staff.filter(s => s.status === "Available").length,
  };

  const commonProps = {
    dark, textPrimary, textSecondary, ICONS, cardClass, badgeFn, inputClass,
    stats, bookings, users, staff, loading, setActiveTab,
    handleUpdateStatus, handleAssignStaff, handleDeleteBooking,
    setMapModal, ICONS, Icon, activeTab,
    filterStatus, setFilterStatus, filteredBookings,
    selectedBooking, setSelectedBooking, selectedUser, setSelectedUser
  };

  return (
    <div className={`${appBg} min-h-screen flex`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        dark={dark} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 ${dark ? "border-b border-white/5" : "border-b border-black/5"}`}
          style={{ background: dark ? "rgba(15,23,42,0.92)" : "rgba(240,244,255,0.85)", backdropFilter: "blur(24px)" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon path={ICONS.menu} className="w-6 h-6" />
            </button>
            <h1 className={`text-lg font-bold ${textPrimary}`}>Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 border border-white/10 text-slate-400 hover:text-white">
              <Icon path={dark ? ICONS.sun : ICONS.moon} className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className={`text-sm font-bold ${textPrimary}`}>{userData?.name || "Admin"}</div>
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Super Control</div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
                {(userData?.name || "A")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 overflow-y-auto">
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-fadeIn ${
              message.type === "error" 
                ? "bg-red-500/10 border border-red-500/20 text-red-400" 
                : "bg-green-500/10 border border-green-500/20 text-green-400"
            }`}>
              <Icon path={message.type === "error" ? ICONS.x : ICONS.check} className="w-5 h-5 flex-shrink-0" />
              {message.text}
            </div>
          )}

          <AdminDashboardTab {...commonProps} />
          <AdminBookingsTab {...commonProps} />
          <AdminUsersTab {...commonProps} />
          <AdminStaffTab {...commonProps} />
        </main>
      </div>

      {/* ── Map Modal ── */}
      {mapModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 animate-fadeIn" onClick={closeMap} />
          <div className="relative z-10 w-full max-w-4xl glass-dark rounded-3xl overflow-hidden animate-fadeInUp flex flex-col md:flex-row" style={{ minHeight: 450 }}>
            <div className="relative flex-1 bg-slate-900">
              <div ref={mapContainerRef} className="w-full h-[400px] md:h-full" />
              <div className="absolute top-4 left-4 z-[1000] px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Pickup Route Analysis</span>
              </div>
            </div>
            <div className="w-full md:w-80 p-8 flex flex-col justify-between border-l border-white/5">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Location Insight</h3>
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Vehicle</div>
                    <div className="flex items-center gap-3 text-white font-semibold">
                      <Icon path={ICONS.car} className="w-4 h-4 text-blue-500" />
                      {mapModal.vehicle}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Pickup Address</div>
                    <div className="text-sm text-slate-400 leading-relaxed font-medium">
                      {mapModal.address}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={closeMap} 
                className="mt-8 py-3 w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Details Modal ── */}
      {selectedBooking && activeTab === "bookings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 animate-fadeIn" onClick={() => setSelectedBooking(null)} />
          <div className={`relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden animate-fadeInUp ${dark ? "glass-dark" : "bg-white shadow-2xl"}`}>
             <div className="p-8">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-1">Booking Details</h3>
                   <p className="text-sm text-slate-500">ID: {selectedBooking.id}</p>
                 </div>
                 <button onClick={() => setSelectedBooking(null)} className="text-slate-500 hover:text-white transition-colors">
                   <Icon path={ICONS.close} className="w-6 h-6" />
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Vehicle</label>
                     <div className="text-lg font-bold text-white">{selectedBooking.vehicleNumber}</div>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Service Schedule</label>
                     <div className="text-white">{selectedBooking.serviceDate} at {selectedBooking.serviceTime}</div>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Issue</label>
                     <div className="text-white bg-white/5 p-3 rounded-xl border border-white/5 italic">"{selectedBooking.issue}"</div>
                   </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Status</label>
                      <span className={badgeFn(selectedBooking.status)}>{selectedBooking.status}</span>
                    </div>
                    {selectedBooking.doorstepDelivery && (
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                         <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-2">
                           <Icon path={ICONS.mapPin} className="w-4 h-4" /> Doorstep Service
                         </div>
                         <div className="text-xs text-slate-400 mb-3">{selectedBooking.pickupLocation?.address}</div>
                         <button onClick={() => setMapModal({ isOpen: true, location: selectedBooking.pickupLocation, vehicle: selectedBooking.vehicleNumber, address: selectedBooking.pickupLocation?.address })}
                           className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all">
                           View on Map
                         </button>
                      </div>
                    )}
                 </div>
               </div>

               {/* Admin Actions */}
               <div className="border-t border-white/10 pt-6">
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Update Management</div>
                 <div className="flex flex-wrap gap-2">
                    {["Pending", "Accepted", "Rejected", "Completed"].map(st => (
                      <button key={st} onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedBooking.status === st ? "bg-white text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}>
                        {st}
                      </button>
                    ))}
                    <button onClick={() => handleDeleteBooking(selectedBooking.id)}
                      className="ml-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all border border-red-500/20">
                      Delete Booking
                    </button>
                 </div>

                 {/* Assignment */}
                 <div className="mt-6">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Assign Technician</label>
                    <select 
                      className={`w-full ${inputClass} text-sm px-4 py-3`}
                      onChange={(e) => handleAssignStaff(selectedBooking.id, e.target.value)}
                      value={selectedBooking.staffId?._id || ""}
                    >
                      <option value="">Choose technician...</option>
                      {staff.filter(s => s.status === "Available").map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.specialization})</option>
                      ))}
                    </select>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
