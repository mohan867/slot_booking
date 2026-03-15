import React from 'react';
import { Icon, ICONS } from '../../utils/icons';
import { StatCard, DonutChart, MiniBarChart, ActivityGrid } from '../UserDashboard/Shared';

const AdminDashboardTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, setFilterStatus, filteredBookings, users, cardClass, setSelectedBooking, setSelectedUser, filterChip, filterStatus, loading, activeTab } = props;

  if (activeTab !== "dashboard") return null;

  // Generate bar chart data from bookings (last 7 days)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const barData = dayLabels.map((label, i) => ({
    label,
    value: bookings.filter(b => {
      const d = b.createdAt ? new Date(b.createdAt) : new Date();
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

  // Monthly data for bar chart
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthData = monthLabels.map((label, i) => ({
    label,
    value: bookings.filter(b => {
      const d = b.createdAt ? new Date(b.createdAt) : new Date();
      return d.getMonth() === i;
    }).length
  }));

  return (
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
          <div className="flex items-center gap-4 mt-4 w-full justify-center">
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#5a6a7a' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} /> Accepted
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#5a6a7a' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#FBBF24' }} /> Pending
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
              <div className="text-2xl font-black mt-1" style={{ color: '#4ADE80' }}>
                {stats.total} <span className="text-xs font-semibold" style={{ color: '#3d4a5c' }}>bookings</span>
              </div>
            </div>
          </div>
          <MiniBarChart data={barData} height={100} barColor="#4ADE80" />
        </div>

        {/* Monthly Revenue / Bookings */}
        <div className={`${cardClass} p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6a7a' }}>System Users</span>
              </div>
              <div className="text-2xl font-black mt-1" style={{ color: '#10B981' }}>
                {users.length} <span className="text-xs font-semibold" style={{ color: '#3d4a5c' }}>registered</span>
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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-500 bg-blue-500/10 border border-blue-500/20">
              <Icon path={ICONS.info} className="w-4 h-4" />
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
        </div>

        {/* Quick Actions */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-yellow-500 bg-yellow-500/10 border border-yellow-500/20">
              <Icon path={ICONS.lightning} className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Review All Bookings", sub: "Manage requests", icon: ICONS.bookings, tab: "bookings", filter: "All", color: "#22C55E" },
              { label: `Review Pending (${stats.pending})`, sub: "Action required", icon: ICONS.clock, tab: "bookings", filter: "Pending", color: "#FBBF24" },
              { label: "Manage Users", sub: `${users.length} registered users`, icon: ICONS.users, tab: "users", filter: null, color: "#10B981" },
            ].map(item => (
              <button key={item.label} onClick={() => { setActiveTab(item.tab); if (item.filter) setFilterStatus(item.filter); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5 border border-transparent hover:border-white/5">
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

          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] uppercase font-black tracking-widest text-[#5a6a7a]">User Base Overview</span>
               <div className="flex -space-x-2">
                 {users.slice(0, 4).map((u, i) => (
                   <div key={u.id || i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black border-2 border-[#0c1117] relative"
                     style={{ background: i % 2 === 0 ? '#3B82F6' : '#22C55E', zIndex: 10 - i }}>
                     {(u.name || "?")[0].toUpperCase()}
                   </div>
                 ))}
                 {users.length > 4 && (
                   <div className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[8px] font-black border-2 border-[#0c1117] z-0">
                     +{users.length - 4}
                   </div>
                 )}
               </div>
             </div>
             <button onClick={() => setActiveTab('users')} className="w-full py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all border border-blue-500/20">
               Access User Directory
             </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-green-500 bg-green-500/10 border border-green-500/20">
                <Icon path={ICONS.clock} className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: '#c4d4e4' }}>Recent Bookings</h3>
            </div>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Icon path={ICONS.bookings} className="w-10 h-10 mx-auto mb-2 text-slate-800" />
              <p className="text-sm text-slate-500">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.slice(0, 7).map((b) => {
                const statusColor = b.status === "Pending" ? "#FBBF24" : b.status === "Accepted" ? "#22C55E" : "#F87171";
                return (
                  <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer hover:bg-white/5"
                    onClick={() => setSelectedBooking(b)}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${statusColor}, ${statusColor}99)` }}>
                      {(b.customerName || b.userId?.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate text-[#c4d4e4]">{b.customerName || b.userId?.name || "Customer"}</div>
                      <div className="text-[10px] text-[#4a5668]">{b.vehicleNumber} · {b.serviceDate}</div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={() => setActiveTab('bookings')} className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition-all border border-white/5">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardTab;
