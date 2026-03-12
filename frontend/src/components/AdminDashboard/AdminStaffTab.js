import React, { useState, useEffect } from 'react';
import API from '../../services/api';

/* ── Icon helper ─── */
const Icon = ({ path, className = "w-5 h-5", style }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
  </svg>
);

const ICONS = {
  plus: "M12 4v16m8-8H4",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  x: "M6 18L18 6M6 6l12 12",
  check: "M5 13l4 4L19 7",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  wrench: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
};

const statusColors = {
  "Available": { bg: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "rgba(34,197,94,0.3)" },
  "Busy": { bg: "rgba(234,179,8,0.1)", color: "#FBBF24", border: "rgba(234,179,8,0.3)" },
  "On Leave": { bg: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
};

const AdminStaffTab = ({ dark, cardClass }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    staffId: "", name: "", phone: "", email: "", password: "", specialization: "", availabilityStatus: "Available"
  });

  useEffect(() => { fetchStaff(); }, []);

  // Auto-refresh staff list every 15 seconds to show live availability
  useEffect(() => {
    const interval = setInterval(() => {
      API.get("/staff/all").then(res => setStaffList(res.data)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await API.get("/staff/all");
      setStaffList(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ staffId: "", name: "", phone: "", email: "", password: "", specialization: "", availabilityStatus: "Available" });
    setEditingStaff(null);
    setShowForm(false);
    setMsg({ text: "", type: "" });
  };

  const openEditForm = (staff) => {
    setEditingStaff(staff);
    setFormData({
      staffId: staff.staffId,
      name: staff.name,
      phone: staff.phone,
      email: staff.email,
      password: "",
      specialization: staff.specialization,
      availabilityStatus: staff.availabilityStatus
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    try {
      if (editingStaff) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await API.put(`/staff/update/${editingStaff._id}`, updateData);
        setMsg({ text: "Staff updated successfully!", type: "success" });
      } else {
        await API.post("/staff/add", formData);
        setMsg({ text: "Staff member added successfully!", type: "success" });
      }
      fetchStaff();
      setTimeout(resetForm, 1200);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Operation failed", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/staff/delete/${id}`);
      setStaffList(prev => prev.filter(s => s._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const specializations = ["Engine Specialist", "Brake Specialist", "Tire Specialist", "Oil Change", "General Mechanic", "Electrical", "Battery Specialist"];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#c4d4e4' }}>Staff Management</h2>
          <p className="text-sm" style={{ color: '#5a6a7a' }}>{staffList.length} staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStaff}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm transition-all"
            style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
            <Icon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #166534, #22C55E)", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}>
            <Icon path={ICONS.plus} className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Staff", val: staffList.length, color: "#22C55E" },
          { label: "Available", val: staffList.filter(s => s.availabilityStatus === "Available").length, color: "#4ADE80" },
          { label: "Busy", val: staffList.filter(s => s.availabilityStatus === "Busy").length, color: "#FBBF24" },
          { label: "On Leave", val: staffList.filter(s => s.availabilityStatus === "On Leave").length, color: "#FCA5A5" },
        ].map(s => (
          <div key={s.label} className={`${cardClass} p-4 text-center`}>
            <div className="font-bold text-2xl" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs mt-1" style={{ color: '#5a6a7a' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Icon path={ICONS.search} className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a5668' }} />
        <input
          type="text"
          placeholder="Search staff by name, email, specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#c4d4e4",
          }}
        />
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className={`${cardClass} p-16 text-center`}>
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p style={{ color: '#5a6a7a' }}>Loading staff...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <Icon path={ICONS.wrench} className="w-12 h-12 mx-auto mb-3" style={{ color: '#1a2432' }} />
          <p style={{ color: '#5a6a7a' }}>{searchTerm ? "No matching staff found" : "No staff members yet"}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <div className={`${cardClass} overflow-hidden`} style={{ borderRadius: 20 }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Staff ID", "Name", "Phone", "Specialization", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-4"
                        style={{ color: '#5a6a7a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((staff, i) => {
                    const sc = statusColors[staff.availabilityStatus] || statusColors["Available"];
                    return (
                      <tr key={staff._id}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                        className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-4 text-sm font-mono" style={{ color: '#7a8a9a' }}>{staff.staffId}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
                              {staff.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>{staff.name}</div>
                              <div className="text-xs" style={{ color: '#4a5668' }}>{staff.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: '#8a9aaa' }}>{staff.phone}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                            {staff.specialization}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {staff.availabilityStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditForm(staff)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA" }}
                              title="Edit">
                              <Icon path={ICONS.edit} className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(staff._id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5" }}
                              title="Delete">
                              <Icon path={ICONS.trash} className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid gap-4">
            {filtered.map(staff => {
              const sc = statusColors[staff.availabilityStatus] || statusColors["Available"];
              return (
                <div key={staff._id} className={`${cardClass} p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
                      {staff.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate" style={{ color: '#c4d4e4' }}>{staff.name}</div>
                      <div className="text-xs" style={{ color: '#4a5668' }}>{staff.staffId}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {staff.availabilityStatus}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#7a8a9a' }}>
                      <Icon path={ICONS.mail} className="w-3.5 h-3.5" /> {staff.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#7a8a9a' }}>
                      <Icon path={ICONS.phone} className="w-3.5 h-3.5" /> {staff.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Icon path={ICONS.wrench} className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
                      <span style={{ color: '#60A5FA' }}>{staff.specialization}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(staff)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                      <Icon path={ICONS.edit} className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(staff._id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <Icon path={ICONS.trash} className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Add/Edit Staff Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 animate-fadeIn" onClick={resetForm} />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeInUp"
            style={{
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(17,24,39,0.97)',
              backdropFilter: 'blur(40px)'
            }}>
            {/* Header */}
            <div className="p-6 pb-4" style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', borderRadius: '24px 24px 0 0' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h3>
                <button onClick={resetForm}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                  <Icon path={ICONS.x} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {msg.text && (
                <div className="p-3 rounded-xl text-sm font-medium"
                  style={{
                    background: msg.type === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                    border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                    color: msg.type === "error" ? "#FCA5A5" : "#86EFAC",
                  }}>
                  {msg.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Staff ID</label>
                  <input type="text" value={formData.staffId} disabled={!!editingStaff}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="e.g. STF001"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4", opacity: editingStaff ? 0.6 : 1 }}
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Name</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4" }}
                    required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Phone</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4" }}
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Email</label>
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@rmk.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4" }}
                    required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>
                  {editingStaff ? "New Password (leave blank to keep current)" : "Password"}
                </label>
                <input type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStaff ? "Leave blank to keep current" : "Min 6 characters"}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4" }}
                  {...(!editingStaff ? { required: true, minLength: 6 } : {})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Specialization</label>
                  <select value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4" }}
                    required>
                    <option value="" style={{ background: "#111827" }}>Select...</option>
                    {specializations.map(s => (
                      <option key={s} value={s} style={{ background: "#111827" }}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Status</label>
                  <select value={formData.availabilityStatus}
                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#c4d4e4" }}>
                    {["Available", "Busy", "On Leave"].map(s => (
                      <option key={s} value={s} style={{ background: "#111827" }}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#8a9aaa", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #166534, #22C55E)", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}>
                  <Icon path={ICONS.check} className="w-4 h-4" />
                  {editingStaff ? "Update Staff" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 animate-fadeIn" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm animate-fadeInUp"
            style={{
              borderRadius: 24,
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(17,24,39,0.97)',
              backdropFilter: 'blur(40px)'
            }}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <Icon path={ICONS.trash} className="w-7 h-7" style={{ color: "#FCA5A5" }} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Staff Member?</h3>
              <p className="text-sm mb-6" style={{ color: "#6B7280" }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#8a9aaa", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #991B1B, #EF4444)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffTab;
