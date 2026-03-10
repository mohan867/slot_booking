import React from 'react';
import { Icon, ICONS } from '../../utils/icons';
import { StatCard } from '../UserDashboard/Shared';

const AdminBookingsTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, setFilterStatus, filteredBookings, uniqueUsers, cardClass, setSelectedBooking, setSelectedUser, filterChip, filterStatus, loading, fetchBookings } = props;

  return (
    <>

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
          
    </>
  );
};
export default AdminBookingsTab;
