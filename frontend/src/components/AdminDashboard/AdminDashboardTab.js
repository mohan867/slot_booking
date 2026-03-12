import React from 'react';
import { Icon, ICONS } from '../../utils/icons';
import { StatCard, DonutChart, MiniBarChart, ActivityGrid } from '../UserDashboard/Shared';

const AdminDashboardTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, setFilterStatus, filteredBookings, uniqueUsers, cardClass, setSelectedBooking, setSelectedUser, filterChip, filterStatus, loading, fetchBookings } = props;

  // Generate bar chart data from bookings (last 7 days)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const barData = dayLabels.map((label, i) => ({
    label,
    value: bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getDay() === (i + 1) % 7;
    }).length
  }));

  // Activity grid data (last 28 days)
  const activityData = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.createdAt && b.createdAt.startsWith(dateStr)).length;
  });

  // Donut percentages
  const acceptRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  // Monthly data for bar chart
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthData = monthLabels.map((label, i) => ({
    label,
    value: bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === i;
    }).length
  }));

  return (
    <>
      <div className="space-y-6 page-transition">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cursor-pointer" onClick={() => { setActiveTab('bookings'); setFilterStatus('All'); }}>
            <StatCard label="Total Bookings" value={stats.total} sub="All time"
              icon={ICONS.bookings} delay={0} dark={dark} accentColor="#22C55E" theme="green" />
          </div>
          <div className="cursor-pointer" onClick={() => { setActiveTab('bookings'); setFilterStatus('Pending'); }}>
            <StatCard label="Pending" value={stats.pending} sub="Needs action"
              icon={ICONS.clock} delay={80} dark={dark} accentColor="#FBBF24" theme="green" />
          </div>
          <div className="cursor-pointer" onClick={() => { setActiveTab('bookings'); setFilterStatus('Assigned'); }}>
            <StatCard label="Assigned" value={stats.assigned || 0} sub="Staff assigned"
              icon={ICONS.users} delay={160} dark={dark} accentColor="#3B82F6" theme="green" />
          </div>
          <div className="cursor-pointer" onClick={() => { setActiveTab('bookings'); setFilterStatus('Completed'); }}>
            <StatCard label="Completed" value={stats.completed || 0} sub="Done"
              icon={ICONS.check} delay={240} dark={dark} accentColor="#10B981" theme="green" />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Acceptance Rate Donut */}
          <div className={`${cardClass} p-6 lg:col-span-1 flex flex-col items-center justify-center`}>
            <div className="flex items-center gap-2 mb-4 self-start w-full">
              <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6a7a' }}>Acceptance Rate</span>
            </div>
            <DonutChart percentage={acceptRate} size={130} color="#22C55E" strokeWidth={12} />
            <div className="flex items-center gap-4 mt-4 w-full">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                <span className="text-[10px]" style={{ color: '#5a6a7a' }}>Accepted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#FBBF24' }} />
                <span className="text-[10px]" style={{ color: '#5a6a7a' }}>Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#F87171' }} />
                <span className="text-[10px]" style={{ color: '#5a6a7a' }}>Rejected</span>
              </div>
            </div>
          </div>

          {/* Weekly Bookings Bar Chart */}
          <div className={`${cardClass} p-6 lg:col-span-2`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6a7a' }}>Weekly Overview</span>
                </div>
                <div className="text-2xl font-black mt-1" style={{ color: '#22C55E' }}>
                  {stats.total} <span className="text-xs font-semibold" style={{ color: '#3d4a5c' }}>total bookings</span>
                </div>
              </div>
              <div className="flex gap-1">
                {['24h', '1d', '1w', '1m'].map((t, i) => (
                  <button key={t} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                    style={{
                      background: i === 2 ? 'rgba(34,197,94,0.12)' : 'transparent',
                      color: i === 2 ? '#4ADE80' : '#3d4a5c',
                      border: i === 2 ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent'
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <MiniBarChart data={barData} height={100} barColor="#22C55E" />
          </div>

          {/* Monthly Revenue / Bookings */}
          <div className={`${cardClass} p-6 lg:col-span-2`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6a7a' }}>Monthly Trend</span>
                </div>
                <div className="text-2xl font-black mt-1" style={{ color: '#10B981' }}>
                  {uniqueUsers.length} <span className="text-xs font-semibold" style={{ color: '#3d4a5c' }}>users</span>
                </div>
              </div>
            </div>
            <MiniBarChart data={monthData} height={100} barColor="#10B981" />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status Breakdown */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <Icon path={ICONS.info} className="w-4 h-4" style={{ color: '#4ADE80' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>Status Breakdown</h3>
            </div>
            {stats.total === 0 ? (
              <p className="text-sm" style={{ color: '#5a6a7a' }}>No data yet</p>
            ) : (
              <div className="space-y-5">
                {[
                  { label: "Pending", val: stats.pending, color: "#FBBF24" },
                  { label: "Accepted", val: stats.accepted, color: "#22C55E" },
                  { label: "Assigned", val: stats.assigned || 0, color: "#3B82F6" },
                  { label: "In Progress", val: stats.inProgress || 0, color: "#A78BFA" },
                  { label: "Completed", val: stats.completed || 0, color: "#34D399" },
                  { label: "Rejected", val: stats.rejected, color: "#F87171" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color: '#5a6a7a' }}>{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>
                        {item.val} ({stats.total > 0 ? Math.round((item.val / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${stats.total > 0 ? (item.val / stats.total) * 100 : 0}%`,
                        background: item.color
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Activity Grid */}
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
              <div className="text-xs font-semibold mb-3" style={{ color: '#5a6a7a' }}>Activity (28 days)</div>
              <ActivityGrid data={activityData} cols={7} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <Icon path={ICONS.lightning} className="w-4 h-4" style={{ color: '#4ADE80' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: "Review All Bookings", sub: "Manage requests", icon: ICONS.bookings, tab: "bookings", filter: "All", color: "#22C55E" },
                { label: `Review Pending (${stats.pending})`, sub: "Action required", icon: ICONS.clock, tab: "bookings", filter: "Pending", color: "#FBBF24" },
                { label: "Manage Users", sub: `${uniqueUsers.length} registered users`, icon: ICONS.users, tab: "users", filter: null, color: "#10B981" },
              ].map(item => (
                <button key={item.label} onClick={() => { setActiveTab(item.tab); if (item.filter) setFilterStatus(item.filter); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.04)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}10`, border: `1px solid ${item.color}18` }}>
                    <Icon path={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium" style={{ color: '#c4d4e4' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: '#4a5668' }}>{item.sub}</div>
                  </div>
                  <Icon path={ICONS.chevronRight} className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: '#2e3a48' }} />
                </button>
              ))}
            </div>

            {/* Users Summary */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: '#5a6a7a' }}>Top Users</span>
                <button onClick={() => setActiveTab("users")}
                  className="text-[10px] font-semibold" style={{ color: '#4ADE80' }}>View all</button>
              </div>
              <div className="flex -space-x-2">
                {uniqueUsers.slice(0, 6).map((u, i) => (
                  <div key={u?._id || i} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
                    style={{
                      background: `hsl(${150 + i * 30}, 60%, ${35 + i * 5}%)`,
                      borderColor: '#0c1117',
                      zIndex: 6 - i,
                    }}>
                    {(u?.name || '?')[0].toUpperCase()}
                  </div>
                ))}
                {uniqueUsers.length > 6 && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{ background: 'rgba(34,197,94,0.15)', borderColor: '#0c1117', color: '#4ADE80' }}>
                    +{uniqueUsers.length - 6}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <Icon path={ICONS.clock} className="w-4 h-4" style={{ color: '#4ADE80' }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>Recent Bookings</h3>
              </div>
              <button onClick={() => setActiveTab("bookings")}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ color: '#4ADE80', background: 'rgba(34,197,94,0.08)' }}>
                View all
              </button>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Icon path={ICONS.bookings} className="w-10 h-10 mx-auto mb-2" style={{ color: '#1a2432' }} />
                <p className="text-sm" style={{ color: '#5a6a7a' }}>No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.slice(0, 6).map((b, i) => {
                  const statusColor = b.status === "Pending" ? "#FBBF24" : b.status === "Accepted" ? "#22C55E" : "#F87171";
                  return (
                    <div key={b._id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer"
                      onClick={() => setSelectedBooking(b)}
                      style={{ border: '1px solid transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.03)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${statusColor}40, ${statusColor}80)` }}>
                        {(b.userId?.name || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate" style={{ color: '#c4d4e4' }}>{b.userId?.name || "Customer"}</div>
                        <div className="text-[10px]" style={{ color: '#4a5668' }}>{b.vehicleNumber} · {b.serviceDate}</div>
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
    </>
  );
};
export default AdminDashboardTab;
