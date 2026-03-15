import React from 'react';
import { Icon, ICONS } from '../../utils/icons';

const AdminUsersTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, users, cardClass, setSelectedUser, activeTab } = props;

  if (activeTab !== "users") return null;

  return (
    <div className="page-transition">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#c4d4e4' }}>User Management</h2>
        <p className="text-sm" style={{ color: '#5a6a7a' }}>{users.length} registered users</p>
      </div>

      {users.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <Icon path={ICONS.users} className="w-12 h-12 mx-auto mb-3" style={{ color: '#1a2432' }} />
          <p style={{ color: '#5a6a7a' }}>No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            if (!u) return null;
            const userBookings = bookings.filter(b => b.userId === u.id || b.userId?._id === u.id);
            return (
              <div key={u.id} className={`${cardClass} p-5 cursor-pointer glow-card-green`}
                onClick={() => setSelectedUser(u)}
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.06)'; }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}>
                    {(u.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate" style={{ color: '#c4d4e4' }}>{u.name}</div>
                    <div className="text-xs truncate" style={{ color: '#4a5668' }}>{u.email}</div>
                  </div>
                  <Icon path={ICONS.chevronRight} className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: '#2e3a48' }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Total", val: userBookings.length, color: "#22C55E" },
                    { label: "Accepted", val: userBookings.filter(b => b.status === "Accepted").length, color: "#10B981" },
                    { label: "Pending", val: userBookings.filter(b => b.status === "Pending").length, color: "#FBBF24" },
                  ].map(item => (
                    <div key={item.label} className="py-2 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.06)' }}>
                      <div className="font-bold text-xl" style={{ color: item.color }}>{item.val}</div>
                      <div className="text-xs" style={{ color: '#4a5668' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#3d4a5c' }}>Role:</span>
                   <span className="text-[10px] font-bold uppercase text-blue-400">{u.role || 'User'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AdminUsersTab;
