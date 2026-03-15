import React, { useEffect, useState } from "react";
import { 
  logoutUser, 
  getCurrentUserProfile, 
  listenStaffBookings, 
  updateBookingProgress 
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

const SHOP_LOCATION = { lat: 13.0827, lng: 80.2707 };

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
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
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
            { label: "Assigned", val: stats.assigned, color: "#3B82F6", icon: ICONS.clock },
            { label: "Accepted", val: stats.accepted, color: "#4ADE80", icon: ICONS.check },
            { label: "In Progress", val: stats.inProgress, color: "#C084FC", icon: ICONS.lightning },
            { label: "Completed", val: stats.completed, color: "#6EE7B7", icon: ICONS.check },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-2xl" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(59,130,246,0.08)"
            }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon path={s.icon} className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>{s.label}</div>
            </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
