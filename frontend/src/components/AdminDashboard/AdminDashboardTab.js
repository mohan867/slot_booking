import React from 'react';
import { Icon, ICONS } from '../../utils/icons';
import { StatCard } from '../UserDashboard/Shared';

const AdminDashboardTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, setFilterStatus, filteredBookings, uniqueUsers, cardClass, setSelectedBooking, setSelectedUser, filterChip, filterStatus, loading, fetchBookings } = props;

  return (
    <>
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
          
    </>
  );
};
export default AdminDashboardTab;
