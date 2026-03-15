import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  logoutUser, 
  getCurrentUserProfile, 
  listenUserBookings,
  getAvailableSlots,
  createBooking,
  cancelBooking,
  rescheduleBooking
} from "../services/firebaseService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DashboardTab from '../components/UserDashboard/DashboardTab';
import BookServiceTab from '../components/UserDashboard/BookServiceTab';
import MyBookingsTab from '../components/UserDashboard/MyBookingsTab';
import StatusTab from '../components/UserDashboard/StatusTab';
import RemindersTab from '../components/UserDashboard/RemindersTab';
import FeedbackTab from '../components/UserDashboard/FeedbackTab';


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
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.973 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.973-2.888a1 1 0 00-1.175 0l-3.973 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.973-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.674z",
};

const ISSUE_CATEGORIES = ["Oil Change", "Brake Service", "Engine Problem", "Tire Replacement", "Battery Issue", "General Checkup"];

const getStatusBadge = (status, dark = true) => {
  if (dark) {
    const map = {
      Pending: "badge-pending", Accepted: "badge-accepted", Rejected: "badge-rejected",
      Assigned: "badge-assigned", "In Progress": "badge-inprogress", Completed: "badge-completed"
    };
    return map[status] || "badge-pending";
  }
  const map = {
    Pending: "badge-pending-light", Accepted: "badge-accepted-light", Rejected: "badge-rejected-light",
    Assigned: "badge-assigned-light", "In Progress": "badge-inprogress-light", Completed: "badge-completed-light"
  };
  return map[status] || "badge-pending-light";
};

/* ── Sidebar ──────────────────────────────────────────────── */
const Sidebar = ({ activeTab, setActiveTab, handleLogout, dark, userData, sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { id: "book", label: "Book Service", icon: ICONS.book },
    { id: "bookings", label: "My Bookings", icon: ICONS.bookings },
    { id: "status", label: "Service Status", icon: ICONS.status },
    { id: "reminders", label: "Reminders", icon: ICONS.bell },
    { id: "feedback", label: "Feedback", icon: ICONS.star },
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
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: dark ? "1px solid rgba(37,99,235,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)", boxShadow: "0 4px 16px rgba(37,99,235,0.35)" }}>
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
                <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "#3B82F6", boxShadow: "0 0 8px rgba(59,130,246,0.5)" }} />
              )}
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="px-3 pb-6 space-y-2" style={{ borderTop: dark ? "1px solid rgba(37,99,235,0.08)" : "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" }}>
          {/* User info */}
          <div className={`flex items-center gap-3 px-3 py-3 rounded-12`}
            style={{ borderRadius: 12 }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
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
      html: `<div style="background:linear-gradient(135deg,#22C55E,#4ADE80);width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
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
      { color: '#22C55E', weight: 3, opacity: 0.6, dashArray: '8, 8' }
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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

  useEffect(() => { 
    fetchUserData(); 

    // ✅ Real-time data listener replaces fetchBookings
    const unsubscribe = listenUserBookings((data) => {
      setBookings(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => { 
    if (formData.serviceDate) fetchAvailableSlots(formData.serviceDate); 
  }, [formData.serviceDate]);

  const fetchUserData = async () => {
    try { 
      const profile = await getCurrentUserProfile(); 
      setUserData(profile); 
    } catch { }
  };

  const fetchAvailableSlots = async (date) => {
    try { 
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots); 
    }
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
      
      await createBooking(payload);
      showMessage("Booking created successfully! 🎉", "success");
      setFormData({ vehicleNumber: "", serviceDate: "", serviceTime: "", issue: "", issueCategories: [], doorstepDelivery: false, pickupLocation: null, doorstepCharge: 0, distanceKm: 0 });
      setAvailableSlots([]);
      setTimeout(() => setActiveTab("bookings"), 1500);
    } catch (err) {
      showMessage(err.message || "Failed to create booking", "error");
    } finally { setLoading(false); }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setLoading(true);
    try {
      await cancelBooking(id);
      showMessage("Booking cancelled successfully!", "success");
    } catch (err) {
      showMessage(err.message || "Failed to cancel", "error");
    } finally { setLoading(false); }
  };

  const handleReschedule = async () => {
    setLoading(true);
    try {
      await rescheduleBooking(rescheduleModal.booking._id, {
        serviceDate: rescheduleModal.newDate, 
        serviceTime: rescheduleModal.newTime
      });
      showMessage("Booking rescheduled successfully!", "success");
      setRescheduleModal({ isOpen: false, booking: null, newDate: "", newTime: "" });
    } catch (err) {
      showMessage(err.message || "Failed to reschedule", "error");
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch { }
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
    assigned: bookings.filter(b => b.status === "Assigned").length,
    inProgress: bookings.filter(b => b.status === "In Progress").length,
    completed: bookings.filter(b => b.status === "Completed").length,
  };

  /* ── Styles ── */
  const appBg = dark ? "bg-app-dark" : "bg-app-light";
  const textPrimary = dark ? "text-slate-100" : "text-slate-900";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const cardClass = dark ? "card-dark" : "card-light";
  const inputClass = dark ? "input-dark" : "input-light";
  const labelClass = dark ? "floating-label-dark" : "floating-label-light";
  const badgeFn = (s) => getStatusBadge(s, dark);

  const commonProps = {
    dark, textPrimary, textSecondary, ICONS, cardClass, badgeFn,
    stats, bookings, userData, setActiveTab,
    formData, handleInputChange, handleCheckboxChange, availableSlots, handleSlotSelect,
    handleSubmit, loading, setFormData, handleUseMyLocation, locatingUser,
    mapContainerRef, SHOP_LOCATION, ISSUE_CATEGORIES, getMinDate, inputClass, labelClass,
    handleCancelBooking, setRescheduleModal, activeTab
  };

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
            background: dark ? "rgba(15,23,42,0.92)" : "rgba(240,244,255,0.85)",
            backdropFilter: "blur(24px)",
            borderBottom: dark ? '1px solid rgba(37,99,235,0.06)' : undefined,
          }}>
          <div className="flex items-center gap-4">
            {/* Hamburger */}
            <button className={`lg:hidden transition-colors ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon path={ICONS.menu} className="w-6 h-6" />
            </button>
            <div>
              <h1 className={`text-lg font-bold ${textPrimary}`}>
                {(() => {
                  const hour = new Date().getHours();
                  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
                  return `${greeting}, ${userData?.name || "User"} 👋`;
                })()}
              </h1>
              <p className={`text-xs ${textSecondary}`}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="notification-bell">
              <Icon path={ICONS.bell} className="w-5 h-5" />
              {bookings.filter(b => b.status === "Pending").length > 0 && <span className="notification-dot" />}
            </button>
            {/* Theme Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: dark ? 'rgba(37,99,235,0.06)' : 'rgba(0,0,0,0.05)',
                border: dark ? '1px solid rgba(37,99,235,0.1)' : '1px solid rgba(0,0,0,0.08)',
                color: dark ? '#94A3B8' : '#94A3B8',
              }}
            >
              <Icon path={dark ? ICONS.sun : ICONS.moon} className="w-4 h-4" />
            </button>
            {/* Book quick-action */}
            <button
              onClick={() => setActiveTab("book")}
              className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
            >
              <Icon path={ICONS.plus} className="w-4 h-4" />
              <span className="hidden sm:inline">+ New Booking</span>
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

          <DashboardTab {...commonProps} />


          {/* ═══════════════ BOOK SERVICE TAB ═══════════════ */}

          <BookServiceTab {...commonProps} />


          {/* ═══════════════ MY BOOKINGS TAB ═══════════════ */}

          <MyBookingsTab {...commonProps} />


          {/* ═══════════════ STATUS TAB ═══════════════ */}

          <StatusTab {...commonProps} />

          {/* ═══════════════ REMINDERS TAB ═══════════════ */}

          <RemindersTab {...commonProps} />

          {/* ═══════════════ FEEDBACK TAB ═══════════════ */}

          <FeedbackTab {...commonProps} />

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
                  <input type="date" id="rDate" lang="en-GB" placeholder=" "
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
