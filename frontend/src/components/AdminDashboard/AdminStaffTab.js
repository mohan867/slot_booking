import React, { useState } from 'react';
import { 
  createStaff, 
  updateStaff, 
  deleteStaff 
} from '../../services/firebaseService';
import { Icon, ICONS } from '../../utils/icons';

const statusColors = {
  "Available": { bg: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "rgba(34,197,94,0.3)" },
  "Busy": { bg: "rgba(234,179,8,0.1)", color: "#FBBF24", border: "rgba(234,179,8,0.3)" },
  "On Leave": { bg: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "rgba(239,68,68,0.3)" },
};

const AdminStaffTab = ({ dark, cardClass, staff, activeTab, inputClass }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    staffId: "", name: "", phone: "", email: "", password: "", specialization: "", status: "Available"
  });

  if (activeTab !== "staff") return null;

  const resetForm = () => {
    setFormData({ staffId: "", name: "", phone: "", email: "", password: "", specialization: "", status: "Available" });
    setEditingStaff(null);
    setShowForm(false);
    setMsg({ text: "", type: "" });
  };

  const openEditForm = (s) => {
    setEditingStaff(s);
    setFormData({
      staffId: s.staffId || "",
      name: s.name || "",
      phone: s.phone || "",
      email: s.email || "",
      password: "",
      specialization: s.specialization || "General Mechanic",
      status: s.status || "Available"
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    setLoading(true);

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        setMsg({ text: "Staff updated successfully!", type: "success" });
      } else {
        await createStaff(formData);
        setMsg({ text: "Staff member created successfully!", type: "success" });
      }
      setTimeout(resetForm, 1500);
    } catch (err) {
      setMsg({ text: err.message || "Operation failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteStaff(id);
      setDeleteConfirm(null);
    } catch (err) {
      setMsg({ text: err.message || "Delete failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = staff.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.staffId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const specializations = ["Engine Specialist", "Brake Specialist", "Tire Specialist", "Oil Change", "General Mechanic", "Electrical", "Battery Specialist"];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#c4d4e4' }}>Staff Management</h2>
          <p className="text-sm" style={{ color: '#5a6a7a' }}>{staff.length} staff members</p>
        </div>
        <div className="flex items-center gap-3">
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
          { label: "Total Staff", val: staff.length, color: "#22C55E" },
          { label: "Available", val: staff.filter(s => s.status === "Available").length, color: "#4ADE80" },
          { label: "Busy", val: staff.filter(s => s.status === "Busy").length, color: "#FBBF24" },
          { label: "On Leave", val: staff.filter(s => s.status === "On Leave").length, color: "#FCA5A5" },
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
      {filtered.length === 0 ? (
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
                  {filtered.map((s, i) => {
                    const sc = statusColors[s.status] || statusColors["Available"];
                    return (
                      <tr key={s.id}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                        className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-4 text-sm font-mono" style={{ color: '#7a8a9a' }}>{s.staffId}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
                              {(s.name || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>{s.name}</div>
                              <div className="text-xs" style={{ color: '#4a5668' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: '#8a9aaa' }}>{s.phone}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                            {s.specialization}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditForm(s)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA" }}
                              title="Edit">
                              <Icon path={ICONS.edit} className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(s.id)}
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
            {filtered.map(s => {
              const sc = statusColors[s.status] || statusColors["Available"];
              return (
                <div key={s.id} className={`${cardClass} p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
                      {(s.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate" style={{ color: '#c4d4e4' }}>{s.name}</div>
                      <div className="text-xs" style={{ color: '#4a5668' }}>{s.staffId}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {s.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#7a8a9a' }}>
                      <Icon path={ICONS.mail} className="w-3.5 h-3.5" /> {s.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#7a8a9a' }}>
                      <Icon path={ICONS.phone} className="w-3.5 h-3.5" /> {s.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Icon path={ICONS.wrench} className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
                      <span style={{ color: '#60A5FA' }}>{s.specialization}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(s)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
                      <Icon path={ICONS.edit} className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(s.id)}
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
                    className={`w-full ${inputClass} text-sm px-4 py-3`}
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Name</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className={`w-full ${inputClass} text-sm px-4 py-3`}
                    required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Phone</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                    className={`w-full ${inputClass} text-sm px-4 py-3`}
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Email</label>
                  <input type="email" value={formData.email} disabled={!!editingStaff}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@rmk.com"
                    className={`w-full ${inputClass} text-sm px-4 py-3`}
                    required />
                </div>
              </div>

              {!editingStaff && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Password</label>
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className={`w-full ${inputClass} text-sm px-4 py-3`}
                    required minLength={6} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Specialization</label>
                  <select value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className={`w-full ${inputClass} text-sm px-4 py-3`}
                    required>
                    <option value="">Select...</option>
                    {specializations.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Status</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full ${inputClass} text-sm px-4 py-3`}>
                    {["Available", "Busy", "On Leave"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all border border-white/5 bg-white/5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #166534, #22C55E)", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Icon path={ICONS.check} className="w-4 h-4" />
                      {editingStaff ? "Update Staff" : "Add Staff"}
                    </>
                  )}
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
          <div className="relative z-10 w-full max-w-sm animate-fadeInUp glass-dark rounded-[32px] border border-red-500/20">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <Icon path={ICONS.trash} className="w-10 h-10" style={{ color: "#FCA5A5" }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Staff Member?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">This action cannot be undone. All assigned tasks will need reassignment.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white/5 text-slate-400 hover:bg-white/10 transition-all border border-white/5">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                   disabled={loading}
                   className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold transition-all"
                   style={{ background: "linear-gradient(135deg, #991B1B, #EF4444)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
                  {loading ? "Deleting..." : "Confirm Delete"}
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
