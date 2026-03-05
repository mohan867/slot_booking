import React, { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Shop Location (RMK Garage) ─── */
const SHOP_LOCATION = { lat: 13.0827, lng: 80.2707, name: "RMK Garage" };

/* ── Haversine Distance (km) ─── */
const calcDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ── Doorstep Charge Calculator ─── */
const calcDoorstepCharge = (distKm) => {
  if (distKm <= 10) return 100;
  return 100 + Math.ceil(distKm - 10) * 10;
};

/* ── Leaflet default icon fix ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Icon helpers ─────────────────────────────────────────── */
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
  </svg>
);

const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  book: "M12 4v16m8-8H4",
  bookings: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  status: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  car: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zm-7-13l3 3m0 0l3 3m-3-3h-3M5 9l7-7 7 7v11a2 2 0 01-2 2H7a2 2 0 01-2-2V9z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  wrench: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  chevronRight: "M9 5l7 7-7 7",
  plus: "M12 4v16m8-8H4",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  truck: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1zm0 0l2-1 2 1 2-1 2 1V6a1 1 0 00-1-1h-4a1 1 0 00-1 1v10z",
  mapPin: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 18L18 6M6 6l12 12",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  lightning: "M13 10V3L4 14h7v7l9-11h-7z",
};

const ISSUE_CATEGORIES = ["Oil Change", "Brake Service", "Engine Problem", "Tire Replacement", "Battery Issue", "General Checkup"];

const getStatusBadge = (status, dark = true) => {
  if (dark) {
    const map = { Pending: "badge-pending", Accepted: "badge-accepted", Rejected: "badge-rejected" };
    return map[status] || "badge-pending";
  }
  const map = { Pending: "badge-pending-light", Accepted: "badge-accepted-light", Rejected: "badge-rejected-light" };
  return map[status] || "badge-pending-light";
};

/* ── Sidebar ──────────────────────────────────────────────── */
const Sidebar = ({ activeTab, setActiveTab, handleLogout, dark, userData, sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { id: "book", label: "Book Service", icon: ICONS.book },
    { id: "bookings", label: "My Bookings", icon: ICONS.bookings },
    { id: "status", label: "Service Status", icon: ICONS.status },
  ];

  const sidebarBg = dark ? "sidebar-dark" : "sidebar-light";
  const logoText = dark ? "text-white" : "text-slate-900";
  const logoSub = dark ? "text-slate-500" : "text-slate-400";
  const userSubText = dark ? "text-slate-500" : "text-slate-400";
  const userText = dark ? "text-slate-200" : "text-slate-700";
  const logoutStyle = dark
    ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
    : "text-slate-400 hover:text-red-500 hover:bg-red-50";

  return (
    <>
      {/* Mobile overlay */}
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
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
            <Icon path={ICONS.lightning} className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className={`font-bold text-base tracking-tight ${logoText}`}>RMK Garage</div>
            <div className={`text-xs ${logoSub}`}>Service Portal</div>
          </div>
          <button className={`ml-auto lg:hidden transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
            onClick={() => setSidebarOpen(false)}>
            <Icon path={ICONS.close} className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className={`text-xs font-700 uppercase tracking-widest mb-3 px-3 ${dark ? "text-slate-600" : "text-slate-400"}`}
            style={{ fontWeight: 700 }}>
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
                <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }} />
              )}
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-3 pb-6 space-y-2" style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" }}>
          {/* User info */}
          <div className={`flex items-center gap-3 px-3 py-3 rounded-12`}
            style={{ borderRadius: 12 }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
              {(userData?.name || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold truncate ${userText}`}>{userData?.name || "User"}</div>
              <div className={`text-xs truncate ${userSubText}`}>{userData?.email || ""}</div>
            </div>
          </div>
          {/* Logout */}
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

/* ── Stat Card ────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, gradient, icon, delay = 0, dark }) => (
  <div className="stat-card animate-fadeInUp" style={{ background: gradient, animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}>
        <Icon path={icon} className="w-6 h-6 text-white" />
      </div>
      <div className="text-right">
        <div className="text-3xl font-black text-white">{value}</div>
      </div>
    </div>
    <div className="text-sm font-semibold text-white/80 uppercase tracking-wide">{label}</div>
    <div className="text-xs text-white/50 mt-1">{sub}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
/*                     MAIN COMPONENT                        */
/* ══════════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNumber: "", serviceDate: "", serviceTime: "", issue: "", issueCategories: [], doorstepDelivery: false,
    pickupLocation: null, doorstepCharge: 0, distanceKm: 0
  });

  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, booking: null, newDate: "", newTime: "" });

  /* ── Map state ── */
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const routeLineRef = useRef(null);
  const shopMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  /* ── Reverse geocode ── */
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
  }, []);

  /* ── Set pickup location on map ── */
  const setPickupOnMap = useCallback(async (lat, lng) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const addr = await reverseGeocode(lat, lng);
    const dist = calcDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, lat, lng);
    const charge = calcDoorstepCharge(dist);

    // User marker
    if (markerRef.current) map.removeLayer(markerRef.current);
    const userIcon = L.divIcon({
      html: `<div style="background:linear-gradient(135deg,#2563EB,#38BDF8);width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
      </div>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 32]
    });
    markerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map)
      .bindPopup(`<b>Pickup Location</b><br/><small>${addr.substring(0, 80)}...</small>`);

    // Route line
    if (routeLineRef.current) map.removeLayer(routeLineRef.current);
    routeLineRef.current = L.polyline(
      [[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [lat, lng]],
      { color: '#2563EB', weight: 3, opacity: 0.6, dashArray: '8, 8' }
    ).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds([[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [lat, lng]]);
    map.fitBounds(bounds, { padding: [40, 40] });

    setFormData(p => ({
      ...p,
      pickupLocation: { lat, lng, address: addr },
      distanceKm: Math.round(dist * 10) / 10,
      doorstepCharge: charge
    }));
  }, [reverseGeocode]);

  /* ── Initialize / destroy map ── */
  useEffect(() => {
    if (formData.doorstepDelivery && mapContainerRef.current && !mapInstanceRef.current) {
      // Short delay to let DOM render
      const timer = setTimeout(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        const map = L.map(mapContainerRef.current, {
          center: [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
          zoom: 12,
          zoomControl: false
        });
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19
        }).addTo(map);

        // Shop marker
        const shopIcon = L.divIcon({
          html: `<div style="background:linear-gradient(135deg,#059669,#10B981);width:36px;height:36px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>`,
          className: '', iconSize: [36, 36], iconAnchor: [18, 36]
        });
        shopMarkerRef.current = L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], { icon: shopIcon })
          .addTo(map).bindPopup(`<b>${SHOP_LOCATION.name}</b><br/><small>Service Center</small>`);

        // Click to set pickup
        map.on('click', (e) => {
          setPickupOnMap(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        setMapReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }

    if (!formData.doorstepDelivery && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      routeLineRef.current = null;
      shopMarkerRef.current = null;
      setMapReady(false);
    }
  }, [formData.doorstepDelivery, setPickupOnMap]);

  /* ── Get user's current location ── */
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showMessage('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupOnMap(pos.coords.latitude, pos.coords.longitude);
        setLocatingUser(false);
      },
      (err) => {
        showMessage('Unable to get your location. Please allow location access or pick on the map.', 'error');
        setLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { fetchUserData(); fetchBookings(); }, []);
  useEffect(() => { if (formData.serviceDate) fetchAvailableSlots(formData.serviceDate); }, [formData.serviceDate]);

  const fetchUserData = async () => {
    try { const res = await API.get("/auth/me"); setUserData(res.data); } catch { }
  };

  const fetchBookings = async () => {
    try { const res = await API.get("/bookings/user"); setBookings(res.data); } catch { }
  };

  const fetchAvailableSlots = async (date) => {
    try { const res = await API.get(`/bookings/available-slots?date=${date}`); setAvailableSlots(res.data.slots); }
    catch { setAvailableSlots([]); }
  };

  const handleInputChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleCheckboxChange = (cat) => {
    setFormData(p => {
      const cats = p.issueCategories.includes(cat)
        ? p.issueCategories.filter(c => c !== cat)
        : [...p.issueCategories, cat];
      return { ...p, issueCategories: cats };
    });
  };

  const handleSlotSelect = (slot) => {
    if (slot.isAvailable || slot.available > 0) {
      setFormData(p => ({ ...p, serviceTime: slot.time }));
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    if (!formData.vehicleNumber || !formData.serviceDate || !formData.serviceTime) {
      showMessage("Please fill in all required fields", "error"); setLoading(false); return;
    }
    if (!formData.issue && formData.issueCategories.length === 0) {
      showMessage("Please describe the issue or select issue categories", "error"); setLoading(false); return;
    }
    if (formData.doorstepDelivery && !formData.pickupLocation) {
      showMessage("Please select your pickup location on the map", "error"); setLoading(false); return;
    }
    try {
      const payload = {
        vehicleNumber: formData.vehicleNumber,
        issue: formData.issue || 'See issue categories',
        issueCategories: formData.issueCategories,
        serviceDate: formData.serviceDate,
        serviceTime: formData.serviceTime,
        doorstepDelivery: Boolean(formData.doorstepDelivery),
      };
      if (formData.doorstepDelivery && formData.pickupLocation) {
        payload.pickupLocation = formData.pickupLocation;
        payload.doorstepCharge = formData.doorstepCharge;
        payload.distanceKm = formData.distanceKm;
      }
      console.log('Booking payload:', JSON.stringify(payload));
      await API.post("/bookings/create", payload);
      showMessage("Booking created successfully! 🎉", "success");
      setFormData({ vehicleNumber: "", serviceDate: "", serviceTime: "", issue: "", issueCategories: [], doorstepDelivery: false, pickupLocation: null, doorstepCharge: 0, distanceKm: 0 });
      setAvailableSlots([]);
      fetchBookings();
      setTimeout(() => setActiveTab("bookings"), 1500);
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to create booking", "error");
    } finally { setLoading(false); }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setLoading(true);
    try {
      await API.delete(`/bookings/cancel/${id}`);
      showMessage("Booking cancelled successfully!", "success");
      fetchBookings();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to cancel", "error");
    } finally { setLoading(false); }
  };

  const handleReschedule = async () => {
    setLoading(true);
    try {
      await API.put(`/bookings/update/${rescheduleModal.booking._id}`, {
        serviceDate: rescheduleModal.newDate, serviceTime: rescheduleModal.newTime
      });
      showMessage("Booking rescheduled successfully!", "success");
      setRescheduleModal({ isOpen: false, booking: null, newDate: "", newTime: "" });
      fetchBookings();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to reschedule", "error");
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await API.post("/auth/logout"); } catch { }
    window.location.reload();
  };

  const getMinDate = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    accepted: bookings.filter(b => b.status === "Accepted").length,
    rejected: bookings.filter(b => b.status === "Rejected").length,
  };

  /* ── Styles ── */
  const appBg = dark ? "bg-app-dark" : "bg-app-light";
  const textPrimary = dark ? "text-slate-100" : "text-slate-900";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const cardClass = dark ? "card-dark" : "card-light";
  const inputClass = dark ? "input-dark" : "input-light";
  const labelClass = dark ? "floating-label-dark" : "floating-label-light";
  const badgeFn = (s) => getStatusBadge(s, dark);

  return (
    <div className={`${appBg} min-h-screen flex`}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        dark={dark}
        userData={userData}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 ${dark ? "border-b border-white/5" : "border-b border-black/5"
          }`} style={{
            background: dark ? "rgba(10,15,30,0.85)" : "rgba(240,244,255,0.85)",
            backdropFilter: "blur(20px)"
          }}>
          <div className="flex items-center gap-4">
            {/* Hamburger */}
            <button className={`lg:hidden transition-colors ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon path={ICONS.menu} className="w-6 h-6" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${textPrimary}`}>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "book" && "Book Service"}
                {activeTab === "bookings" && "My Bookings"}
                {activeTab === "status" && "Service Status"}
              </h1>
              <p className={`text-xs ${textSecondary}`}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${dark ? "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-yellow-400"
                : "bg-black/5 hover:bg-black/10 text-slate-400 hover:text-blue-600"
                }`}
            >
              <Icon path={dark ? ICONS.sun : ICONS.moon} className="w-4 h-4" />
            </button>
            {/* Book quick-action */}
            <button
              onClick={() => setActiveTab("book")}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Icon path={ICONS.plus} className="w-4 h-4" />
              <span className="hidden sm:inline">New Booking</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          {/* Message */}
          {message.text && (
            <div className={`mb-5 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-fadeIn ${message.type === "error"
              ? dark ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-red-50 border border-red-200 text-red-600"
              : dark ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-green-50 border border-green-200 text-green-600"
              }`}>
              <Icon path={message.type === "error" ? ICONS.x : ICONS.check} className="w-5 h-5 flex-shrink-0" />
              {message.text}
            </div>
          )}

          {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 page-transition">
              {/* Welcome */}
              <div>
                <h2 className={`text-2xl font-bold ${textPrimary}`}>
                  Good morning, <span className="text-gradient">{userData?.name || "User"}</span> 👋
                </h2>
                <p className={`text-sm mt-1 ${textSecondary}`}>Here's an overview of your vehicle services.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Bookings" value={stats.total} sub="All time"
                  gradient="linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)"
                  icon={ICONS.bookings} delay={0} dark={dark} />
                <StatCard label="Pending" value={stats.pending} sub="Awaiting approval"
                  gradient="linear-gradient(135deg, #92400E 0%, #B45309 50%, #D97706 100%)"
                  icon={ICONS.clock} delay={80} dark={dark} />
                <StatCard label="Confirmed" value={stats.accepted} sub="Ready to serve"
                  gradient="linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)"
                  icon={ICONS.check} delay={160} dark={dark} />
                <StatCard label="Rejected" value={stats.rejected} sub="Declined"
                  gradient="linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #EF4444 100%)"
                  icon={ICONS.x} delay={240} dark={dark} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Service */}
                <div className={`${cardClass} p-6 lg:col-span-1`}>
                  <div className={`flex items-center gap-2 mb-5`}>
                    <Icon path={ICONS.calendar} className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`} />
                    <h3 className={`font-semibold text-sm ${textPrimary}`}>Upcoming Service</h3>
                  </div>
                  {bookings.filter(b => b.status === "Accepted").length > 0 ? (() => {
                    const next = bookings.filter(b => b.status === "Accepted")[0];
                    return (
                      <div>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}>
                          <Icon path={ICONS.car} className="w-7 h-7 text-white" />
                        </div>
                        <div className={`font-bold text-lg ${textPrimary} mb-1`}>{next.vehicleNumber}</div>
                        <div className={`text-xs ${textSecondary} flex items-center gap-1 mb-1`}>
                          <Icon path={ICONS.calendar} className="w-3 h-3" /> {next.serviceDate}
                        </div>
                        <div className={`text-xs ${textSecondary} flex items-center gap-1 mb-3`}>
                          <Icon path={ICONS.clock} className="w-3 h-3" /> {next.serviceTime}
                        </div>
                        <span className="badge-accepted">Confirmed</span>
                      </div>
                    );
                  })() : (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <Icon path={ICONS.calendar} className={`w-12 h-12 mx-auto mb-3 opacity-30`} />
                      <p className="text-sm">No upcoming services</p>
                      <button onClick={() => setActiveTab("book")}
                        className={`mt-3 text-xs font-medium ${dark ? "text-blue-400" : "text-blue-600"} hover:underline`}>
                        Book one now →
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className={`${cardClass} p-6`}>
                  <div className={`flex items-center gap-2 mb-5`}>
                    <Icon path={ICONS.lightning} className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`} />
                    <h3 className={`font-semibold text-sm ${textPrimary}`}>Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Book New Service", sub: "Schedule an appointment", icon: ICONS.book, tab: "book", color: "#2563EB" },
                      { label: "View My Bookings", sub: "Manage existing ones", icon: ICONS.bookings, tab: "bookings", color: "#10B981" },
                      { label: "Check Status", sub: "Track your services", icon: ICONS.status, tab: "status", color: "#F59E0B" },
                    ].map(item => (
                      <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${dark ? "hover:bg-white/5" : "hover:bg-blue-50"
                          }`}>
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

                {/* Recent Activity */}
                <div className={`${cardClass} p-6`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Icon path={ICONS.clock} className={`w-5 h-5 ${dark ? "text-blue-400" : "text-blue-600"}`} />
                      <h3 className={`font-semibold text-sm ${textPrimary}`}>Recent Activity</h3>
                    </div>
                    <button onClick={() => setActiveTab("bookings")}
                      className={`text-xs ${dark ? "text-blue-400" : "text-blue-600"} hover:underline`}>
                      View all
                    </button>
                  </div>
                  {bookings.length === 0 ? (
                    <div className={`text-center py-8 ${textSecondary}`}>
                      <Icon path={ICONS.info} className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 4).map(b => (
                        <div key={b._id} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${dark ? "hover:bg-white/5" : "hover:bg-slate-50"
                          }`}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: b.status === "Pending" ? "rgba(234,179,8,0.15)"
                                : b.status === "Accepted" ? "rgba(34,197,94,0.15)"
                                  : "rgba(239,68,68,0.15)"
                            }}>
                            <Icon path={ICONS.car} className="w-4 h-4"
                              style={{ color: b.status === "Pending" ? "#EAB308" : b.status === "Accepted" ? "#22C55E" : "#EF4444" }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${textPrimary}`}>{b.vehicleNumber}</div>
                            <div className={`text-xs ${textSecondary}`}>{b.serviceDate}</div>
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

          {/* ═══════════════ BOOK SERVICE TAB ═══════════════ */}
          {activeTab === "book" && (
            <div className="max-w-2xl mx-auto page-transition">
              <div className={`${cardClass}`} style={{ overflow: "hidden" }}>
                {/* Card Header */}
                <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
                  <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    <Icon path={ICONS.book} className="w-5 h-5 text-blue-200" />
                    Book a Service Slot
                  </h2>
                  <p className="text-blue-200 text-xs mt-1">Fill in details to schedule your vehicle service</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Vehicle Number */}
                  <div className="floating-group">
                    <input
                      type="text" name="vehicleNumber" id="vehicleNumber"
                      placeholder=" "
                      className={`${inputClass} w-full px-4 text-sm`}
                      value={formData.vehicleNumber}
                      onChange={handleInputChange}
                      required disabled={loading}
                    />
                    <label htmlFor="vehicleNumber" className={`floating-label ${labelClass}`}>
                      Vehicle Number (e.g. TN01AB1234)
                    </label>
                  </div>

                  {/* Service Issue */}
                  <div className="floating-group">
                    <textarea
                      name="issue" id="issue"
                      rows={3}
                      placeholder=" "
                      className={`${inputClass} w-full px-4 resize-none text-sm`}
                      value={formData.issue}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <label htmlFor="issue" className={`floating-label ${labelClass}`}>
                      Describe the Issue / Service Needed
                    </label>
                  </div>

                  {/* Service Categories */}
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSecondary}`}>
                      Service Type (Optional)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ISSUE_CATEGORIES.map(cat => {
                        const checked = formData.issueCategories.includes(cat);
                        return (
                          <label key={cat}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${checked
                              ? dark ? "bg-blue-600/20 border border-blue-500/50 text-blue-300" : "bg-blue-50 border border-blue-300 text-blue-700"
                              : dark ? "border border-white/8 text-slate-400 hover:border-blue-500/30" : "border border-slate-200 text-slate-500 hover:border-blue-300"
                              }`}
                            style={{ border: checked ? undefined : dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0" }}>
                            <input type="checkbox" className="hidden"
                              checked={checked}
                              onChange={() => handleCheckboxChange(cat)}
                              disabled={loading}
                            />
                            <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${checked
                              ? "bg-blue-500"
                              : dark ? "bg-white/10" : "bg-slate-100"
                              }`}>
                              {checked && <Icon path={ICONS.check} className="w-2.5 h-2.5 text-white" />}
                            </span>
                            {cat}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="floating-group">
                      <input
                        type="date" name="serviceDate" id="serviceDate"
                        placeholder=" "
                        className={`${inputClass} w-full px-4 text-sm`}
                        value={formData.serviceDate}
                        onChange={handleInputChange}
                        min={getMinDate()}
                        required disabled={loading}
                      />
                      <label htmlFor="serviceDate" className={`floating-label ${labelClass}`}>Service Date</label>
                    </div>

                    {/* Time Slot selector */}
                    {!formData.serviceDate ? (
                      <div className={`flex items-center justify-center rounded-xl text-xs ${textSecondary} border ${dark ? "border-white/8" : "border-slate-200"}`}
                        style={{ minHeight: 60, borderStyle: "dashed" }}>
                        Select a date first
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${textSecondary}`}>Time Slot</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {availableSlots.map((slot, i) => {
                            const full = slot.available === 0;
                            const selected = formData.serviceTime === slot.time;
                            return (
                              <button key={i} type="button"
                                onClick={() => !full && handleSlotSelect(slot)}
                                className={`py-2 rounded-lg text-xs font-semibold transition-all ${full ? "opacity-40 cursor-not-allowed"
                                  : selected ? "text-white shadow-lg scale-105"
                                    : dark ? "border border-white/10 text-slate-300 hover:border-blue-500/50 hover:text-blue-300"
                                      : "border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                                  }`}
                                style={selected ? { background: "linear-gradient(135deg, #2563EB, #38BDF8)" } : {}}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="floating-group">
                        <input
                          type="time" name="serviceTime" id="serviceTime"
                          placeholder=" "
                          className={`${inputClass} w-full px-4 text-sm`}
                          value={formData.serviceTime}
                          onChange={handleInputChange}
                          required disabled={loading}
                        />
                        <label htmlFor="serviceTime" className={`floating-label ${labelClass}`}>Service Time</label>
                      </div>
                    )}
                  </div>

                  {/* ── Doorstep Pickup & Delivery Toggle ── */}
                  {formData.serviceDate && (
                    <div className={`rounded-2xl transition-all duration-300 animate-fadeIn overflow-hidden`}
                      style={{
                        background: formData.doorstepDelivery
                          ? dark ? 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(56,189,248,0.1))' : 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(56,189,248,0.05))'
                          : dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: formData.doorstepDelivery
                          ? dark ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(37,99,235,0.3)'
                          : dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      {/* Toggle Header */}
                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: formData.doorstepDelivery
                                ? 'linear-gradient(135deg, #2563EB, #38BDF8)'
                                : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
                            }}>
                            <Icon path={ICONS.mapPin}
                              className={`w-5 h-5 transition-colors ${formData.doorstepDelivery ? 'text-white' : dark ? 'text-slate-500' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${textPrimary}`}>
                              Doorstep Pickup & Delivery
                            </div>
                            <div className={`text-xs mt-0.5 ${textSecondary}`}>
                              We'll pick up your bike & deliver it back after service
                            </div>
                          </div>
                        </div>
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({
                            ...p,
                            doorstepDelivery: !p.doorstepDelivery,
                            ...(!p.doorstepDelivery ? {} : { pickupLocation: null, doorstepCharge: 0, distanceKm: 0 })
                          }))}
                          disabled={loading}
                          className="relative flex-shrink-0 ml-3 transition-all duration-300 focus:outline-none"
                          style={{
                            width: 48, height: 26, borderRadius: 13,
                            background: formData.doorstepDelivery
                              ? 'linear-gradient(135deg, #2563EB, #38BDF8)'
                              : dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
                            cursor: loading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span
                            className="block rounded-full shadow-lg transition-all duration-300"
                            style={{
                              width: 20, height: 20,
                              marginTop: 3,
                              marginLeft: formData.doorstepDelivery ? 25 : 3,
                              background: '#FFFFFF',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}
                          />
                        </button>
                      </div>

                      {/* ── Map & Pricing Panel ── */}
                      {formData.doorstepDelivery && (
                        <div className="animate-fadeIn">
                          {/* Action Buttons */}
                          <div className="px-5 pb-3 flex flex-wrap gap-2">
                            <button type="button" onClick={handleUseMyLocation} disabled={locatingUser}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                              style={{
                                background: 'linear-gradient(135deg, #2563EB, #38BDF8)',
                                color: '#fff', opacity: locatingUser ? 0.7 : 1,
                                cursor: locatingUser ? 'wait' : 'pointer'
                              }}>
                              {locatingUser ? (
                                <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg> Locating...</>
                              ) : (
                                <><Icon path={ICONS.mapPin} className="w-3.5 h-3.5" /> Use My Location</>
                              )}
                            </button>
                            <div className={`flex items-center gap-1 text-xs ${textSecondary}`}>
                              <Icon path={ICONS.info} className="w-3 h-3" />
                              or click on the map to set pickup point
                            </div>
                          </div>

                          {/* Map Container */}
                          <div className="px-5 pb-4">
                            <div style={{
                              borderRadius: 16, overflow: 'hidden', height: 280,
                              border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
                            }}>
                              <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                            </div>
                          </div>

                          {/* Location & Pricing Info */}
                          {formData.pickupLocation && (
                            <div className="px-5 pb-5 space-y-3 animate-fadeIn">
                              {/* Selected Address */}
                              <div className={`rounded-xl p-3`} style={{
                                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                              }}>
                                <div className={`text-xs font-semibold uppercase tracking-widest mb-1.5 ${textSecondary}`}>Pickup Address</div>
                                <p className={`text-xs leading-relaxed ${textPrimary}`}>
                                  {formData.pickupLocation.address?.substring(0, 120)}{formData.pickupLocation.address?.length > 120 ? '...' : ''}
                                </p>
                              </div>

                              {/* Distance & Pricing Card */}
                              <div className="rounded-xl overflow-hidden" style={{
                                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                              }}>
                                <div className="p-3 grid grid-cols-3 gap-3">
                                  {/* Distance */}
                                  <div className="text-center">
                                    <div className={`text-lg font-black ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {formData.distanceKm} <span className="text-xs font-semibold">km</span>
                                    </div>
                                    <div className={`text-xs ${textSecondary}`}>Distance</div>
                                  </div>
                                  {/* Charge */}
                                  <div className="text-center" style={{ borderLeft: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', borderRight: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                                    <div className={`text-lg font-black ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                      ₹{formData.doorstepCharge}
                                    </div>
                                    <div className={`text-xs ${textSecondary}`}>Delivery Fee</div>
                                  </div>
                                  {/* Navigate */}
                                  <div className="text-center flex flex-col items-center justify-center">
                                    <a
                                      href={`https://www.google.com/maps/dir/${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}/${formData.pickupLocation.lat},${formData.pickupLocation.lng}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
                                      style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                                      <Icon path={ICONS.mapPin} className="w-3 h-3" /> Navigate
                                    </a>
                                  </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="px-3 pb-3">
                                  <div className={`rounded-lg p-2.5 text-xs leading-relaxed ${dark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    {formData.distanceKm <= 10 ? (
                                      <div className="flex items-center gap-2">
                                        <Icon path={ICONS.check} className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                        <span>Within 10 km — Flat rate <strong className={dark ? 'text-emerald-400' : 'text-emerald-600'}>₹100</strong></span>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Icon path={ICONS.info} className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-blue-400' : 'text-blue-500'}`} />
                                          <span>Base charge (first 10 km): <strong>₹100</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Icon path={ICONS.plus} className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-blue-400' : 'text-blue-500'}`} />
                                          <span>Extra {Math.ceil(formData.distanceKm - 10)} km × ₹10 = <strong>₹{Math.ceil(formData.distanceKm - 10) * 10}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1" style={{ borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                          <Icon path={ICONS.check} className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                          <span>Total delivery fee: <strong className={dark ? 'text-emerald-400' : 'text-emerald-600'}>₹{formData.doorstepCharge}</strong></span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>Processing...</>
                    ) : (
                      <><Icon path={ICONS.check} className="w-4 h-4" />Submit Booking</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════ MY BOOKINGS TAB ═══════════════ */}
          {activeTab === "bookings" && (
            <div className="page-transition">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${textPrimary}`}>My Bookings</h2>
                  <p className={`text-sm ${textSecondary}`}>{bookings.length} total bookings</p>
                </div>
                <button onClick={() => setActiveTab("book")} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
                  <Icon path={ICONS.plus} className="w-4 h-4" /> New Booking
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className={`${cardClass} p-16 text-center`}>
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(37,99,235,0.1)" }}>
                    <Icon path={ICONS.bookings} className={`w-8 h-8 ${dark ? "text-blue-400" : "text-blue-500"}`} />
                  </div>
                  <h3 className={`font-semibold mb-2 ${textPrimary}`}>No bookings yet</h3>
                  <p className={`text-sm ${textSecondary} mb-4`}>Book your first service slot</p>
                  <button onClick={() => setActiveTab("book")} className="btn-primary py-2 px-6 text-sm">Book Now</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map(b => (
                    <div key={b._id} className={`${cardClass} overflow-hidden`}>
                      {/* Status bar */}
                      <div className="h-1" style={{
                        background: b.status === "Pending" ? "linear-gradient(90deg, #EAB308, #FCD34D)"
                          : b.status === "Accepted" ? "linear-gradient(90deg, #22C55E, #86EFAC)"
                            : "linear-gradient(90deg, #EF4444, #FCA5A5)"
                      }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="font-mono font-bold text-base" style={{
                            background: dark ? "rgba(255,255,255,0.05)" : "#F0F4FF",
                            border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #BFDBFE",
                            padding: "4px 10px", borderRadius: 8, color: dark ? "#93C5FD" : "#1D4ED8"
                          }}>{b.vehicleNumber}</div>
                          <span className={badgeFn(b.status)}>{b.status}</span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                            <Icon path={ICONS.calendar} className="w-3.5 h-3.5" /> {b.serviceDate}
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                            <Icon path={ICONS.clock} className="w-3.5 h-3.5" /> {b.serviceTime}
                          </div>
                        </div>
                        {(b.doorstepDelivery || b.pickupLocation?.lat) && (
                          <div className={`rounded-lg p-2.5 mb-3`} style={{
                            background: dark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.05)',
                            border: dark ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(37,99,235,0.15)'
                          }}>
                            <div className={`flex items-center gap-2 text-xs font-semibold mb-1.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
                              <Icon path={ICONS.mapPin} className="w-3.5 h-3.5" /> Doorstep Pickup & Delivery
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className={textSecondary}>
                                {b.distanceKm ? `${b.distanceKm} km` : '—'}
                              </span>
                              <span className={`font-bold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {b.doorstepCharge ? `₹${b.doorstepCharge}` : '₹100'}
                              </span>
                              {b.pickupLocation?.lat && (
                                <a
                                  href={`https://www.google.com/maps/dir/${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}/${b.pickupLocation.lat},${b.pickupLocation.lng}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white"
                                  style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                                  <Icon path={ICONS.mapPin} className="w-3 h-3" /> Navigate
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        {b.issueCategories?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {b.issueCategories.map((c, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  background: dark ? "rgba(37,99,235,0.15)" : "#DBEAFE",
                                  color: dark ? "#93C5FD" : "#1D4ED8",
                                  border: dark ? "1px solid rgba(37,99,235,0.3)" : "1px solid #BFDBFE"
                                }}>{c}</span>
                            ))}
                          </div>
                        )}
                        {b.status === "Pending" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setRescheduleModal({ isOpen: true, booking: b, newDate: b.serviceDate, newTime: b.serviceTime })}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${dark ? "border border-blue-500/40 text-blue-400 hover:bg-blue-500/10" : "border border-blue-300 text-blue-600 hover:bg-blue-50"
                                }`}>
                              Reschedule
                            </button>
                            <button onClick={() => handleCancelBooking(b._id)}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${dark ? "border border-red-500/40 text-red-400 hover:bg-red-500/10" : "border border-red-300 text-red-600 hover:bg-red-50"
                                }`}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ STATUS TAB ═══════════════ */}
          {activeTab === "status" && (
            <div className="page-transition">
              <div className="mb-6">
                <h2 className={`text-xl font-bold ${textPrimary}`}>Service Status</h2>
                <p className={`text-sm ${textSecondary}`}>Track your booking statuses</p>
              </div>

              <div className={`${cardClass} overflow-hidden`}>
                {bookings.length === 0 ? (
                  <div className="p-16 text-center">
                    <Icon path={ICONS.status} className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-600" : "text-slate-300"}`} />
                    <p className={textSecondary}>No bookings to show</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={`w-full ${dark ? "table-dark" : "table-light"}`}>
                      <thead>
                        <tr>
                          <th className="text-left">Booking ID</th>
                          <th className="text-left">Vehicle Number</th>
                          <th className="text-left">Service Date</th>
                          <th className="text-left">Time</th>
                          <th className="text-left">Doorstep</th>
                          <th className="text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b._id}>
                            <td className={`font-mono text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
                              #{b._id?.slice(-6).toUpperCase()}
                            </td>
                            <td>
                              <span className="font-semibold" style={{ color: dark ? "#93C5FD" : "#2563EB" }}>{b.vehicleNumber}</span>
                            </td>
                            <td>{b.serviceDate}</td>
                            <td>{b.serviceTime}</td>
                            <td>
                              {(b.doorstepDelivery || b.pickupLocation?.lat) ? (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit"
                                    style={{
                                      background: dark ? 'rgba(37,99,235,0.15)' : '#DBEAFE',
                                      color: dark ? '#93C5FD' : '#1D4ED8',
                                      border: dark ? '1px solid rgba(37,99,235,0.3)' : '1px solid #BFDBFE'
                                    }}>
                                    <Icon path={ICONS.mapPin} className="w-3 h-3" /> {b.distanceKm ? `${b.distanceKm} km` : 'Yes'}
                                  </span>
                                  <span className={`text-xs font-bold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    {b.doorstepCharge ? `₹${b.doorstepCharge}` : '₹100'}
                                  </span>
                                </div>
                              ) : (
                                <span className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>No</span>
                              )}
                            </td>
                            <td><span className={badgeFn(b.status)}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Reschedule Modal ── */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 animate-fadeIn" onClick={() => setRescheduleModal({ isOpen: false, booking: null, newDate: "", newTime: "" })} />
          <div className={`relative z-10 w-full max-w-sm rounded-2xl animate-fadeInUp ${dark ? "glass-dark" : "bg-white shadow-2xl"}`}
            style={{ border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0" }}>
            <div className="p-6">
              <h3 className={`font-bold text-lg mb-4 ${textPrimary}`}>Reschedule Booking</h3>
              <div className="space-y-4">
                <div className="floating-group">
                  <input type="date" id="rDate" placeholder=" "
                    className={`${inputClass} w-full px-4 text-sm`}
                    value={rescheduleModal.newDate}
                    onChange={e => setRescheduleModal(p => ({ ...p, newDate: e.target.value }))}
                    min={getMinDate()}
                  />
                  <label htmlFor="rDate" className={`floating-label ${labelClass}`}>New Date</label>
                </div>
                <div className="floating-group">
                  <input type="time" id="rTime" placeholder=" "
                    className={`${inputClass} w-full px-4 text-sm`}
                    value={rescheduleModal.newTime}
                    onChange={e => setRescheduleModal(p => ({ ...p, newTime: e.target.value }))}
                  />
                  <label htmlFor="rTime" className={`floating-label ${labelClass}`}>New Time</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${dark ? "border border-white/10 text-slate-400 hover:bg-white/5" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`} onClick={() => setRescheduleModal({ isOpen: false, booking: null, newDate: "", newTime: "" })}>
                  Cancel
                </button>
                <button className="flex-1 btn-primary py-2.5 text-sm" onClick={handleReschedule} disabled={loading}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
