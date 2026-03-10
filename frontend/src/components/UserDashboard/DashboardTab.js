import React from 'react';
import { Icon, StatCard } from './Shared';

const DashboardTab = (props) => {
  const { dark, textPrimary, textSecondary, ICONS, cardClass, badgeFn, stats, bookings, userData, setActiveTab, activeTab } = props;

  return (
    <>
      {activeTab === "dashboard" && (
        <div className="space-y-6 page-transition">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.04) 50%, rgba(34,197,94,0.02) 100%)',
              border: '1px solid rgba(34,197,94,0.12)',
            }}>
            {/* Glow orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white">
                Welcome back, <span className="text-gradient">{userData?.name || "User"}</span> 👋
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6B7A90' }}>Here's an overview of your vehicle services.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Bookings" value={stats.total} sub="All time"
              icon={ICONS.bookings} delay={0} dark={dark} accentColor="#22C55E" />
            <StatCard label="Pending" value={stats.pending} sub="Awaiting approval"
              icon={ICONS.clock} delay={80} dark={dark} accentColor="#FBBF24" />
            <StatCard label="Confirmed" value={stats.accepted} sub="Ready to serve"
              icon={ICONS.check} delay={160} dark={dark} accentColor="#10B981" />
            <StatCard label="Rejected" value={stats.rejected} sub="Declined"
              icon={ICONS.x} delay={240} dark={dark} accentColor="#F87171" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Service */}
            <div className={`${cardClass} p-6 lg:col-span-1`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Icon path={ICONS.calendar} className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="font-semibold text-sm text-white">Upcoming Service</h3>
              </div>
              {bookings.filter(b => b.status === "Accepted").length > 0 ? (() => {
                const next = bookings.filter(b => b.status === "Accepted")[0];
                return (
                  <div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <Icon path={ICONS.car} className="w-7 h-7 text-green-400" />
                    </div>
                    <div className="font-bold text-lg text-white mb-1">{next.vehicleNumber}</div>
                    <div className="text-xs flex items-center gap-1 mb-1" style={{ color: '#6B7A90' }}>
                      <Icon path={ICONS.calendar} className="w-3 h-3" /> {next.serviceDate}
                    </div>
                    <div className="text-xs flex items-center gap-1 mb-3" style={{ color: '#6B7A90' }}>
                      <Icon path={ICONS.clock} className="w-3 h-3" /> {next.serviceTime}
                    </div>
                    <span className="badge-accepted">Confirmed</span>
                  </div>
                );
              })() : (
                <div className="text-center py-8">
                  <Icon path={ICONS.calendar} className="w-12 h-12 mx-auto mb-3" style={{ color: '#1E293B' }} />
                  <p className="text-sm" style={{ color: '#6B7A90' }}>No upcoming services</p>
                  <button onClick={() => setActiveTab("book")}
                    className="mt-3 text-xs font-medium text-green-400 hover:underline">
                    Book one now →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Icon path={ICONS.lightning} className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="font-semibold text-sm text-white">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Book New Service", sub: "Schedule an appointment", icon: ICONS.book, tab: "book", color: "#22C55E" },
                  { label: "View My Bookings", sub: "Manage existing ones", icon: ICONS.bookings, tab: "bookings", color: "#10B981" },
                  { label: "Check Status", sub: "Track your services", icon: ICONS.status, tab: "status", color: "#4ADE80" },
                  { label: "Reminders", sub: "Upcoming service alerts", icon: ICONS.bell, tab: "reminders", color: "#FBBF24" },
                  { label: "Feedback", sub: "Rate your experience", icon: ICONS.star, tab: "feedback", color: "#F472B6" },
                ].map(item => (
                  <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                      <Icon path={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <div className="text-xs" style={{ color: '#6B7A90' }}>{item.sub}</div>
                    </div>
                    <Icon path={ICONS.chevronRight} className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: '#3D4A5C' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <Icon path={ICONS.clock} className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">Recent Activity</h3>
                </div>
                <button onClick={() => setActiveTab("bookings")}
                  className="text-xs text-green-400 hover:underline">
                  View all
                </button>
              </div>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Icon path={ICONS.info} className="w-10 h-10 mx-auto mb-2" style={{ color: '#1E293B' }} />
                  <p className="text-sm" style={{ color: '#6B7A90' }}>No activity yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(0, 5).map(b => {
                    const statusColor = b.status === "Pending" ? "#FBBF24" : b.status === "Accepted" ? "#22C55E" : "#F87171";
                    return (
                      <div key={b._id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/[0.03]">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${statusColor}12`, border: `1px solid ${statusColor}20` }}>
                          <Icon path={ICONS.car} className="w-4 h-4" style={{ color: statusColor }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate text-white">{b.vehicleNumber}</div>
                          <div className="text-xs" style={{ color: '#6B7A90' }}>{b.serviceDate}</div>
                        </div>
                        <span className={badgeFn(b.status)}>{b.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default DashboardTab;
