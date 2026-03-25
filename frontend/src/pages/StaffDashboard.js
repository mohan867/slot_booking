import React, { useEffect, useRef, useState } from "react";
import { 
  logoutUser, 
  getCurrentUserProfile, 
  listenStaffBookings, 
  updateBookingProgress,
  staffGenerateBookingPayment 
} from "../services/firebaseService";

const Icon = ({ path, className = "w-5 h-5", style }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
  </svg>
);

const ICONS = {
  wrench: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M5 13l4 4L19 7",
  car: "M17 16v2a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m8-11V4a2 2 0 00-2-2H9a2 2 0 00-2 2v1M7 9h10l1 7H6L7 9z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  mapPin: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  lightning: "M13 10V3L4 14h7v7l9-11h-7z",
  truck: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1zm0 0l2-1 2 1 2-1 2 1V6a1 1 0 00-1-1h-4a1 1 0 00-1 1v10z",
  x: "M6 18L18 6M6 6l12 12",
  chevronRight: "M9 5l7 7-7 7",
};

const SHOP_LOCATION = { lat: 11.2432461, lng: 77.5062681 };

const createIssueLine = (name = "", amount = 0) => ({
  name,
  amount,
});

const createPartLine = (name = "", qty = 1, unitPrice = 0) => ({
  name,
  qty,
  unitPrice,
});

const getStatusColor = (status) => {
  const map = {
    Assigned: { bg: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "rgba(59,130,246,0.25)" },
    Accepted: { bg: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "rgba(34,197,94,0.25)" },
    "In Progress": { bg: "rgba(168,85,247,0.12)", color: "#C084FC", border: "rgba(168,85,247,0.25)" },
    Completed: { bg: "rgba(16,185,129,0.12)", color: "#6EE7B7", border: "rgba(16,185,129,0.25)" },
  };
  return map[status] || { bg: "rgba(100,116,139,0.12)", color: "#94A3B8", border: "rgba(100,116,139,0.25)" };
};

const getNextAction = (status) => {
  const map = {
    Assigned: { label: "Accept Task", nextStatus: "Accepted", action: "update", color: "#3B82F6", gradient: "linear-gradient(135deg, #1E40AF, #3B82F6)" },
    Accepted: { label: "Start Service", nextStatus: "In Progress", action: "update", color: "#8B5CF6", gradient: "linear-gradient(135deg, #6D28D9, #8B5CF6)" },
    "In Progress": { label: "Mark Completed", nextStatus: "Completed", action: "update", color: "#10B981", gradient: "linear-gradient(135deg, #047857, #10B981)" },
  };
  return map[status] || null;
};

const StaffDashboard = () => {
  const [staffInfo, setStaffInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [openPaymentSection, setOpenPaymentSection] = useState(false);
  const paymentSectionRef = useRef(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({
    invoiceNo: "",
    laborCharge: 0,
    partsCharge: 0,
    doorstepCharge: 0,
    serviceCost: 0,
    tipAmount: 0,
    discount: 0,
    tax: 0,
    notes: "",
    issueLines: [],
    partLines: [],
  });

  useEffect(() => {
    fetchProfile();
    const unsub = listenStaffBookings(setTasks);
    return () => unsub();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setStaffInfo(profile);
    } catch { }
  };

  const updateTaskStatus = async (bookingId, status) => {
    setActionLoading(bookingId);
    try {
      await updateBookingProgress(bookingId, status);
      if (selectedTask && selectedTask.id === bookingId) {
        setSelectedTask(prev => ({ ...prev, status }));
      }
      if (status === "In Progress") {
        window.alert("Service started successfully. User and admin have been notified.");
      }
      if (status === "Completed") {
        // After completing a task, check and update staff availability
        updateStaffAvailability(staffInfo.uid, tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const updateStaffAvailability = async (staffId, allTasks) => {
    const activeTasks = allTasks.filter(task => 
      task.staffId === staffId && 
      task.status !== "Completed" && 
      task.status !== "Cancelled"
    );
    
    const newStatus = activeTasks.length > 0 ? "Busy" : "Available";
    
    try {
      // Assuming you have a function to update the staff's status in Firebase
      // This function would need to be created in firebaseService.js
      // await updateStaffStatus(staffId, newStatus);
      console.log(`Staff ${staffId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating staff status:", error);
    }
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch { }
    window.location.reload();
  };

  const stats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.status === "Assigned").length,
    accepted: tasks.filter(t => t.status === "Accepted").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length,
  };

  const filteredTasks = tasks.filter(t =>
    filterStatus === "All" ? true : t.status === filterStatus
  );

  useEffect(() => {
    if (!selectedTask) return;
    const p = selectedTask.payment || {};
    const fallbackIssueLines = (selectedTask.issueCategories || []).map((cat) => createIssueLine(cat, 0));
    setPaymentDraft({
      invoiceNo: p.invoiceNo || "",
      laborCharge: Number(p.laborCharge || 0),
      partsCharge: Number(p.partsCharge || 0),
      doorstepCharge: Number(selectedTask.doorstepCharge || 0),
      serviceCost: Number(p.serviceCost || 0),
      tipAmount: Number(p.tipAmount || 0),
      discount: Number(p.discount || 0),
      tax: Number(p.tax || 0),
      notes: p.notes || "",
      issueLines: Array.isArray(p.issueLines) && p.issueLines.length > 0
        ? p.issueLines.map((line) => createIssueLine(line.name || "", Number(line.amount || 0)))
        : fallbackIssueLines,
      partLines: Array.isArray(p.partLines) && p.partLines.length > 0
        ? p.partLines.map((line) => createPartLine(line.name || "", Number(line.qty || 1), Number(line.unitPrice || 0)))
        : [createPartLine("", 1, 0)],
    });
  }, [selectedTask]);

  useEffect(() => {
    if (!selectedTask || !openPaymentSection || selectedTask.status !== "Completed") return;
    const timer = setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpenPaymentSection(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedTask, openPaymentSection]);

  const updateIssueLine = (idx, key, value) => {
    setPaymentDraft((prev) => ({
      ...prev,
      issueLines: prev.issueLines.map((line, lineIdx) => (lineIdx === idx ? { ...line, [key]: value } : line)),
    }));
  };

  const updatePartLine = (idx, key, value) => {
    setPaymentDraft((prev) => ({
      ...prev,
      partLines: prev.partLines.map((line, lineIdx) => (lineIdx === idx ? { ...line, [key]: value } : line)),
    }));
  };

  const addIssueLine = () => {
    setPaymentDraft((prev) => ({ ...prev, issueLines: [...prev.issueLines, createIssueLine("", 0)] }));
  };

  const addPartLine = () => {
    setPaymentDraft((prev) => ({ ...prev, partLines: [...prev.partLines, createPartLine("", 1, 0)] }));
  };

  const removeIssueLine = (idx) => {
    setPaymentDraft((prev) => ({ ...prev, issueLines: prev.issueLines.filter((_, lineIdx) => lineIdx !== idx) }));
  };

  const removePartLine = (idx) => {
    setPaymentDraft((prev) => ({ ...prev, partLines: prev.partLines.filter((_, lineIdx) => lineIdx !== idx) }));
  };

  const issueTotal = paymentDraft.issueLines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const partsTotal = paymentDraft.partLines.reduce(
    (sum, line) => sum + Number(line.qty || 0) * Number(line.unitPrice || 0),
    0
  );
  const grandTotal = Math.max(
    0,
    issueTotal + Number(paymentDraft.serviceCost || 0) + partsTotal + Number(paymentDraft.doorstepCharge || 0) + Number(paymentDraft.tipAmount || 0) + Number(paymentDraft.tax || 0) - Number(paymentDraft.discount || 0)
  );

  const handleGeneratePayment = async () => {
    if (!selectedTask?.id) return;
    setPaymentLoading(true);
    try {
      const saved = await staffGenerateBookingPayment(selectedTask.id, {
        invoiceNo: paymentDraft.invoiceNo,
        laborCharge: issueTotal + Number(paymentDraft.serviceCost || 0),
        partsCharge: partsTotal,
        doorstepCharge: Number(paymentDraft.doorstepCharge || 0),
        serviceCost: Number(paymentDraft.serviceCost || 0),
        tipAmount: Number(paymentDraft.tipAmount || 0),
        discount: Number(paymentDraft.discount || 0),
        tax: Number(paymentDraft.tax || 0),
        notes: paymentDraft.notes || "",
        issueLines: paymentDraft.issueLines,
        partLines: paymentDraft.partLines,
      });

      setSelectedTask(prev => ({ ...prev, payment: saved }));
      setTasks(prev => prev.map(t => (t.id === selectedTask.id ? { ...t, payment: saved } : t)));
      window.alert("Payment generated successfully. User can now make payment.");
    } catch (err) {
      window.alert(err.message || "Failed to generate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #030712 0%, #0A1028 50%, #0C1230 100%)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(59,130,246,0.1)", background: "rgba(10,16,40,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)" }}>
            <Icon path={ICONS.wrench} className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base">Staff Dashboard</div>
            <div className="text-xs" style={{ color: "#60A5FA" }}>
              {staffInfo ? `Welcome, ${staffInfo.name}` : "RMK Garage"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {staffInfo && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
              <Icon path={ICONS.wrench} className="w-3.5 h-3.5" />
              {staffInfo.specialization}
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Icon path={ICONS.logout} className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Assigned", val: stats.assigned, color: "#3B82F6", icon: ICONS.clock, filter: "Assigned" },
            { label: "Accepted", val: stats.accepted, color: "#4ADE80", icon: ICONS.check, filter: "Accepted" },
            { label: "In Progress", val: stats.inProgress, color: "#C084FC", icon: ICONS.lightning, filter: "In Progress" },
            { label: "Completed", val: stats.completed, color: "#6EE7B7", icon: ICONS.check, filter: "Completed" },
          ].map(s => (
            <button key={s.label}
              type="button"
              onClick={() => setFilterStatus(s.filter)}
              className="p-5 rounded-2xl text-left transition-all cursor-pointer"
              style={filterStatus === s.filter
                ? {
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.28)",
                    boxShadow: "0 6px 16px rgba(59,130,246,0.18)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(59,130,246,0.08)",
                  }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon path={s.icon} className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "All", count: stats.total, grad: "linear-gradient(135deg, #1E40AF, #3B82F6)" },
            { label: "Assigned", count: stats.assigned, grad: "linear-gradient(135deg, #1E40AF, #3B82F6)" },
            { label: "Accepted", count: stats.accepted, grad: "linear-gradient(135deg, #065F46, #10B981)" },
            { label: "In Progress", count: stats.inProgress, grad: "linear-gradient(135deg, #6D28D9, #8B5CF6)" },
            { label: "Completed", count: stats.completed, grad: "linear-gradient(135deg, #047857, #34D399)" },
          ].map(f => (
            <button key={f.label}
              onClick={() => setFilterStatus(f.label)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={filterStatus === f.label
                ? { background: f.grad, color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }
                : { background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", color: "#6B7280" }
              }>
              {f.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={filterStatus === f.label
                  ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                  : { background: "rgba(59,130,246,0.06)", color: "#4a5668" }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="p-16 rounded-2xl text-center" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(59,130,246,0.08)"
          }}>
            <Icon path={ICONS.wrench} className="w-12 h-12 mx-auto mb-3" style={{ color: "#1E3A5F" }} />
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {filterStatus === "All" ? "No tasks assigned yet" : `No ${filterStatus.toLowerCase()} tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => {
              const sc = getStatusColor(task.status);
              const nextAction = getNextAction(task.status);
              return (
                <div key={task.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(59,130,246,0.1)"
                  }}>
                  <div className="p-5">
                    {/* Top row: Status + ID */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {task.status}
                      </span>
                      <span className="font-mono text-xs" style={{ color: "#4a5668" }}>
                        #{task.id?.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)" }}>
                        {(task.userId?.name || task.customerName || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{task.userId?.name || task.customerName || "Customer"}</div>
                        <div className="text-xs" style={{ color: "#6B7280" }}>{task.userId?.email || ""}</div>
                      </div>
                      <button onClick={() => setSelectedTask(task)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: "rgba(59,130,246,0.08)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.15)" }}>
                        Details
                        <Icon path={ICONS.chevronRight} className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Service Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Icon path={ICONS.car} className="w-4 h-4" style={{ color: "#60A5FA" }} />
                        <span className="text-xs font-mono font-bold" style={{ color: "#93C5FD" }}>{task.vehicleNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon path={ICONS.calendar} className="w-4 h-4" style={{ color: "#4ADE80" }} />
                        <span className="text-xs" style={{ color: "#94A3B8" }}>{task.serviceDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon path={ICONS.clock} className="w-4 h-4" style={{ color: "#FBBF24" }} />
                        <span className="text-xs" style={{ color: "#94A3B8" }}>{task.serviceTime}</span>
                      </div>
                      {task.doorstepDelivery && (
                        <div className="flex items-center gap-2">
                          <Icon path={ICONS.truck} className="w-4 h-4" style={{ color: "#C084FC" }} />
                          <span className="text-xs" style={{ color: "#C084FC" }}>Doorstep</span>
                        </div>
                      )}
                    </div>

                    {/* Brief Issue Summary */}
                    <div className="mb-4">
                      {task.issueCategories?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.issueCategories.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-sm text-slate-400 italic line-clamp-2">"{task.issue}"</p>
                    </div>

                    {/* Location + Navigate */}
                    {task.pickupLocation?.lat && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}&destination=${task.pickupLocation.lat},${task.pickupLocation.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] mb-4"
                        style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>
                        <Icon path={ICONS.mapPin} className="w-4 h-4" /> Navigate to Customer
                      </a>
                    )}

                    {/* Action Button */}
                    {nextAction && (
                      <button
                        disabled={actionLoading === task.id}
                        onClick={() => updateTaskStatus(task.id, nextAction.nextStatus)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: nextAction.gradient }}>
                        {actionLoading === task.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Icon path={ICONS.lightning} className="w-4 h-4" /> {nextAction.label}</>
                        )}
                      </button>
                    )}

                    {task.status === "Completed" && (
                      <div className="flex items-center gap-2 py-3 rounded-xl justify-center text-sm font-semibold"
                        style={{ background: "rgba(16,185,129,0.08)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.15)" }}>
                        <Icon path={ICONS.check} className="w-4 h-4" /> Service Completed
                      </div>
                    )}

                    {task.status === "Completed" && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setOpenPaymentSection(true);
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01]"
                        style={{ background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" }}
                      >
                        <Icon path={ICONS.receipt} className="w-4 h-4" />
                        {task.payment ? "View Payment" : "Generate Payment"}
                      </button>
                    )}

                    {task.status === "Completed" && task.payment && (
                      <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
                        style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
                        <span className="text-xs font-semibold" style={{ color: "#93C5FD" }}>Payment: {task.payment.status || "Pending"}</span>
                        <span className="text-xs font-bold" style={{ color: "#6EE7B7" }}>Rs {Number(task.payment.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedTask(null)} />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{
              borderRadius: 24,
              border: "1px solid rgba(59,130,246,0.15)",
              background: "rgba(17,24,39,0.97)",
              backdropFilter: "blur(40px)"
            }}>
            <div className="p-6 pb-4" style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)", borderRadius: "24px 24px 0 0" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Task Details</h3>
                <button onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                  <Icon path={ICONS.x} className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  {(selectedTask.userId?.name || selectedTask.customerName || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{selectedTask.userId?.name || selectedTask.customerName || "N/A"}</div>
                  <div className="text-white/70 text-xs">{selectedTask.userId?.email || ""}</div>
                </div>
                <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                  {selectedTask.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
                  ID: #{selectedTask.id?.slice(-8).toUpperCase()}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>Service Details</div>
                <div className="rounded-xl p-4 space-y-3" style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)" }}>
                        <Icon path={ICONS.car} className="w-4 h-4" style={{ color: "#60A5FA" }} />
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "#6B7280" }}>Vehicle</div>
                        <div className="font-mono font-bold text-sm" style={{ color: "#60A5FA" }}>{selectedTask.vehicleNumber}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.12)" }}>
                        <Icon path={ICONS.calendar} className="w-4 h-4" style={{ color: "#4ADE80" }} />
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "#6B7280" }}>Date</div>
                        <div className="text-sm font-semibold text-white">{selectedTask.serviceDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>Issue</div>
                <div className="rounded-xl p-4" style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  {selectedTask.issueCategories && selectedTask.issueCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTask.issueCategories.map((c, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-slate-300 italic">"{selectedTask.issue}"</p>
                </div>
              </div>

              {selectedTask.pickupLocation?.lat && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}&destination=${selectedTask.pickupLocation.lat},${selectedTask.pickupLocation.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}>
                  <Icon path={ICONS.mapPin} className="w-4 h-4" /> Open Navigation
                </a>
              )}

              {selectedTask.status === "Completed" && (
                <div ref={paymentSectionRef}>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>Payment Calculator</div>
                  <div className="rounded-xl p-4 space-y-3" style={{
                    background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)"
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#93C5FD" }}>Invoice No</div>
                        <input
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                          placeholder="Invoice No"
                          value={paymentDraft.invoiceNo}
                          onChange={(e) => setPaymentDraft(prev => ({ ...prev, invoiceNo: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#93C5FD" }}>Doorstep Amount</div>
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-slate-300 cursor-not-allowed"
                          placeholder="Doorstep Amount"
                          value={paymentDraft.doorstepCharge}
                          readOnly
                          disabled
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#93C5FD" }}>Discount</div>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                          placeholder="Discount"
                          value={paymentDraft.discount}
                          onChange={(e) => setPaymentDraft(prev => ({ ...prev, discount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#93C5FD" }}>Tax</div>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                          placeholder="Tax"
                          value={paymentDraft.tax}
                          onChange={(e) => setPaymentDraft(prev => ({ ...prev, tax: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#93C5FD" }}>Issue Charges</div>
                        <button
                          onClick={addIssueLine}
                          className="px-2 py-1 rounded text-[11px] font-semibold text-white"
                          style={{ background: "rgba(59,130,246,0.35)" }}>
                          + Add Issue
                        </button>
                      </div>
                      <div className="space-y-2">
                        {paymentDraft.issueLines.map((line, idx) => (
                          <div key={`issue-${idx}`} className="grid grid-cols-[1fr_120px_34px] gap-2">
                            <input
                              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                              placeholder="Issue name"
                              value={line.name}
                              onChange={(e) => updateIssueLine(idx, "name", e.target.value)}
                            />
                            <input
                              type="number"
                              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                              placeholder="Amount"
                              value={line.amount}
                              onChange={(e) => updateIssueLine(idx, "amount", e.target.value)}
                            />
                            <button
                              onClick={() => removeIssueLine(idx)}
                              className="rounded-lg text-xs font-bold text-red-300 border border-red-400/30 bg-red-500/10">
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#93C5FD" }}>Parts Added</div>
                        <button
                          onClick={addPartLine}
                          className="px-2 py-1 rounded text-[11px] font-semibold text-white"
                          style={{ background: "rgba(16,185,129,0.35)" }}>
                          + Add Part
                        </button>
                      </div>
                      <div className="space-y-2">
                        {paymentDraft.partLines.map((line, idx) => (
                          <div key={`part-${idx}`} className="grid grid-cols-[1fr_70px_100px_34px] gap-2">
                            <input
                              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                              placeholder="Part name"
                              value={line.name}
                              onChange={(e) => updatePartLine(idx, "name", e.target.value)}
                            />
                            <input
                              type="number"
                              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                              placeholder="Qty"
                              value={line.qty}
                              onChange={(e) => updatePartLine(idx, "qty", e.target.value)}
                            />
                            <input
                              type="number"
                              className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                              placeholder="Unit price"
                              value={line.unitPrice}
                              onChange={(e) => updatePartLine(idx, "unitPrice", e.target.value)}
                            />
                            <button
                              onClick={() => removePartLine(idx)}
                              className="rounded-lg text-xs font-bold text-red-300 border border-red-400/30 bg-red-500/10">
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#93C5FD" }}>Service Cost</div>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                          placeholder="Service Cost"
                          value={paymentDraft.serviceCost}
                          onChange={(e) => setPaymentDraft(prev => ({ ...prev, serviceCost: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#93C5FD" }}>Tip (Optional)</div>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
                          placeholder="Tip Amount"
                          value={paymentDraft.tipAmount}
                          onChange={(e) => setPaymentDraft(prev => ({ ...prev, tipAmount: e.target.value }))}
                        />
                      </div>
                    </div>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white min-h-[64px]"
                      placeholder="Service notes for invoice"
                      value={paymentDraft.notes}
                      onChange={(e) => setPaymentDraft(prev => ({ ...prev, notes: e.target.value }))}
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold" style={{ color: "#93C5FD" }}>
                        <div>Issue Total: Rs {issueTotal.toFixed(2)}</div>
                        <div>Service Cost: Rs {Number(paymentDraft.serviceCost || 0).toFixed(2)}</div>
                        <div>Parts Total: Rs {partsTotal.toFixed(2)}</div>
                        <div>Doorstep Amount: Rs {Number(paymentDraft.doorstepCharge || 0).toFixed(2)}</div>
                        <div>Tip: Rs {Number(paymentDraft.tipAmount || 0).toFixed(2)}</div>
                        <div>Tax: Rs {Number(paymentDraft.tax || 0).toFixed(2)}</div>
                        <div>Discount: Rs {Number(paymentDraft.discount || 0).toFixed(2)}</div>
                        <div>Total: Rs {grandTotal.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={handleGeneratePayment}
                        disabled={paymentLoading}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}>
                        {paymentLoading ? "Generating..." : "Generate Payment"}
                      </button>
                    </div>
                    {selectedTask.payment?.status === "Paid" && (
                      <div className="text-xs font-semibold" style={{ color: "#6EE7B7" }}>
                        Payment already paid by user.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
