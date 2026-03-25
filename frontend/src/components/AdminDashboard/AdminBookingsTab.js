import React from 'react';
import { Icon, ICONS } from '../../utils/icons';
import { StatCard } from '../UserDashboard/Shared';

const AdminBookingsTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, setFilterStatus, filteredBookings, uniqueUsers, cardClass, setSelectedBooking, setSelectedBookingReadOnly, setSelectedUser, filterChip, filterStatus, loading, fetchBookings } = props;

  return (
    <>
            <div className="page-transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#c4d4e4' }}>Booking Management</h2>
                  <p className="text-sm" style={{ color: '#5a6a7a' }}>{filteredBookings.length} of {stats.total} bookings</p>
                </div>
                <button onClick={fetchBookings}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #166534, #22C55E)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
                  <Icon path={ICONS.refresh} className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "All", count: stats.total, grad: "linear-gradient(135deg,#166534,#22C55E)" },
                  { label: "Pending", count: stats.pending, grad: "linear-gradient(135deg,#92400E,#FBBF24)" },
                  { label: "Accepted", count: stats.accepted, grad: "linear-gradient(135deg,#065F46,#10B981)" },
                  { label: "Assigned", count: stats.assigned, grad: "linear-gradient(135deg,#1E40AF,#3B82F6)" },
                  { label: "In Progress", count: stats.inProgress, grad: "linear-gradient(135deg,#7C3AED,#A78BFA)" },
                  { label: "Completed", count: stats.completed, grad: "linear-gradient(135deg,#047857,#34D399)" },
                  { label: "On Hold", count: stats.onHold, grad: "linear-gradient(135deg,#B45309,#F59E0B)" },
                  { label: "Rejected", count: stats.rejected, grad: "linear-gradient(135deg,#7F1D1D,#F87171)" },
                ].map(f => (
                  <button key={f.label}
                    onClick={() => setFilterStatus(f.label)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={filterStatus === f.label
                      ? { background: f.grad, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }
                      : { background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)', color: '#5a6a7a' }}
                  >
                    {f.label}
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={filterStatus === f.label
                        ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                        : { background: 'rgba(34,197,94,0.06)', color: '#4a5668' }}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table */}
              {filteredBookings.length === 0 ? (
                <div className={`${cardClass} p-16 text-center`}>
                  <Icon path={ICONS.bookings} className="w-12 h-12 mx-auto mb-3" style={{ color: '#1a2432' }} />
                  <p style={{ color: '#5a6a7a' }}>No {filterStatus.toLowerCase()} bookings found</p>
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
                          <th>Assigned Staff</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b, idx) => (
                          <tr key={b.id} onClick={() => { setActiveTab('bookings'); if (setSelectedBookingReadOnly) setSelectedBookingReadOnly(false); setSelectedBooking(b); }}
                            className="cursor-pointer" style={{ transition: 'background 0.15s' }}>
                            <td className="font-mono text-xs" style={{ color: '#3d4a5c' }}>
                              #{(idx + 1).toString().padStart(3, "0")}
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}>
                                  {(b.userId?.name || "?")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-sm" style={{ color: '#c4d4e4' }}>{b.userId?.name || "N/A"}</div>
                                  <div className="text-xs" style={{ color: '#4a5668' }}>{b.userId?.email || ""}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="font-mono font-bold text-sm px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(34,197,94,0.08)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.12)' }}>
                                {b.vehicleNumber}
                              </span>
                            </td>
                            <td>
                              <div className="text-sm" style={{ color: '#c4d4e4' }}>{b.serviceDate}</div>
                              <div className="text-xs" style={{ color: '#4a5668' }}>{b.serviceTime}</div>
                            </td>
                            <td>
                              {b.issueCategories?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {b.issueCategories.slice(0, 2).map((c, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ background: 'rgba(34,197,94,0.08)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.12)' }}>
                                      {c}
                                    </span>
                                  ))}
                                  {b.issueCategories.length > 2 && (
                                    <span className="text-xs" style={{ color: '#4a5668' }}>+{b.issueCategories.length - 2}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs italic" style={{ color: '#4a5668' }}>{b.issue?.slice(0, 30) || "—"}</span>
                              )}
                            </td>
                            <td><span className={badgeFn(b.status)}>{b.status}</span></td>
                            <td>
                              {b.staffId ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)' }}>
                                    {(b.staffId.name || '?')[0].toUpperCase()}
                                  </div>
                                  <span className="text-xs font-medium" style={{ color: '#93C5FD' }}>{b.staffId.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs italic" style={{ color: '#4a5668' }}>—</span>
                              )}
                            </td>
                            <td className="text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab('bookings');
                                  if (setSelectedBookingReadOnly) setSelectedBookingReadOnly(false);
                                  setSelectedBooking(b);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto"
                                style={{
                                  background: 'rgba(34,197,94,0.08)',
                                  color: '#4ADE80',
                                  border: '1px solid rgba(34,197,94,0.15)'
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
    </>
  );
};
export default AdminBookingsTab;
