import React from 'react';
import { Icon, StatCard, DonutChart, MiniBarChart } from './Shared';

const DashboardTab = (props) => {
  const { dark, textPrimary, textSecondary, ICONS, cardClass, badgeFn, stats, bookings, userData, setActiveTab, activeTab } = props;

  // Donut data
  const acceptRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  // Weekly bar chart
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = dayLabels.map((label, i) => ({
    label,
    value: bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getDay() === (i + 1) % 7;
    }).length
  }));

  return (
    <>
      {activeTab === "dashboard" && (
        <div className="space-y-6 page-transition">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl p-6 glow-card"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.04) 50%, rgba(37,99,235,0.01) 100%)',
              border: '1px solid rgba(37,99,235,0.12)',
            }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white">
                Welcome back, <span className="text-gradient">{userData?.name || "User"}</span> 👋
              </h2>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Here's an overview of your vehicle services.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Bookings" value={stats.total} sub="All time"
              icon={ICONS.bookings} delay={0} dark={dark} accentColor="#3B82F6" />
            <StatCard label="Pending" value={stats.pending} sub="Needs action"
              icon={ICONS.clock} delay={80} dark={dark} accentColor="#FBBF24" />
            <StatCard label="Accepted" value={stats.accepted} sub="Confirmed slots"
              icon={ICONS.check} delay={160} dark={dark} accentColor="#22C55E" />
            <StatCard label="Rejected" value={stats.rejected} sub="Declined"
              icon={ICONS.x} delay={240} dark={dark} accentColor="#F87171" />
          </div>

          {/* Charts + Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Donut */}
            <div className={`${cardClass} p-6 flex flex-col items-center justify-center`}>
              <div className="flex items-center gap-2 mb-4 self-start w-full">
                <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Success Rate</span>
              </div>
              <DonutChart percentage={acceptRate} size={120} color="#3B82F6" strokeWidth={11} />
              <div className="flex gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>Confirmed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#FBBF24' }} />
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>Pending</span>
                </div>
              </div>
            </div>

            {/* Booking Activity */}
            <div className={`${cardClass} p-6 lg:col-span-2`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#60A5FA' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Booking Activity</span>
              </div>
              <div className="text-2xl font-black mb-5" style={{ color: '#3B82F6' }}>
                {stats.total} <span className="text-xs font-semibold" style={{ color: '#475569' }}>total</span>
              </div>
              <MiniBarChart data={weeklyData} height={80} barColor="#3B82F6" />
            </div>

            {/* Upcoming Service */}
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                  <Icon path={ICONS.calendar} className="w-4 h-4" style={{ color: '#60A5FA' }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Upcoming</h3>
              </div>
              {bookings.filter(b => b.status === "Accepted").length > 0 ? (() => {
                const next = bookings.filter(b => b.status === "Accepted")[0];
                return (
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                      <Icon path={ICONS.car} className="w-6 h-6" style={{ color: '#60A5FA' }} />
                    </div>
                    <div className="font-bold text-lg" style={{ color: '#E2E8F0' }}>{next.vehicleNumber}</div>
                    <div className="text-xs flex items-center gap-1 mt-1" style={{ color: '#94A3B8' }}>
                      <Icon path={ICONS.calendar} className="w-3 h-3" /> {next.serviceDate}
                    </div>
                    <div className="text-xs flex items-center gap-1 mt-0.5 mb-3" style={{ color: '#94A3B8' }}>
                      <Icon path={ICONS.clock} className="w-3 h-3" /> {next.serviceTime}
                    </div>
                    <span className="badge-accepted">Confirmed</span>
                  </div>
                );
              })() : (
                <div className="text-center py-4">
                  <Icon path={ICONS.calendar} className="w-10 h-10 mx-auto mb-2" style={{ color: '#1E293B' }} />
                  <p className="text-xs" style={{ color: '#94A3B8' }}>No upcoming services</p>
                  <button onClick={() => setActiveTab("book")}
                    className="mt-2 text-xs font-semibold" style={{ color: '#60A5FA' }}>
                    Book now →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                  <Icon path={ICONS.lightning} className="w-4 h-4" style={{ color: '#60A5FA' }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Book Service", icon: ICONS.book, tab: "book", color: "#3B82F6" },
                  { label: "My Bookings", icon: ICONS.bookings, tab: "bookings", color: "#2563EB" },
                  { label: "Track Status", icon: ICONS.status, tab: "status", color: "#60A5FA" },
                  { label: "Reminders", icon: ICONS.bell, tab: "reminders", color: "#FBBF24" },
                  { label: "Feedback", icon: ICONS.star, tab: "feedback", color: "#F472B6" },
                  { label: "Dashboard", icon: ICONS.dashboard, tab: "dashboard", color: "#22C55E" },
                ].map(item => (
                  <button key={item.tab + item.label} onClick={() => setActiveTab(item.tab)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{ border: '1px solid rgba(37,99,235,0.06)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,99,235,0.06)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.18)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.06)'; }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}10`, border: `1px solid ${item.color}18` }}>
                      <Icon path={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${cardClass} p-6`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <Icon path={ICONS.clock} className="w-4 h-4" style={{ color: '#60A5FA' }} />
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: '#E2E8F0' }}>Recent Activity</h3>
                </div>
                <button onClick={() => setActiveTab("bookings")}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                  style={{ color: '#60A5FA', background: 'rgba(37,99,235,0.08)' }}>
                  View all
                </button>
              </div>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Icon path={ICONS.info} className="w-10 h-10 mx-auto mb-2" style={{ color: '#1E293B' }} />
                  <p className="text-sm" style={{ color: '#94A3B8' }}>No activity yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(0, 6).map(b => {
                    const statusColor = b.status === "Pending" ? "#FBBF24" : b.status === "Accepted" ? "#22C55E" : "#F87171";
                    return (
                      <div key={b._id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                        style={{ border: '1px solid transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,99,235,0.04)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${statusColor}10`, border: `1px solid ${statusColor}18` }}>
                          <Icon path={ICONS.car} className="w-4 h-4" style={{ color: statusColor }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate" style={{ color: '#E2E8F0' }}>{b.vehicleNumber}</div>
                          <div className="text-[10px]" style={{ color: '#64748B' }}>{b.serviceDate}</div>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}60` }} />
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
