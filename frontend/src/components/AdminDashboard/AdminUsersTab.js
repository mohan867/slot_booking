import React from 'react';
import { Icon, ICONS } from '../../utils/icons';
import { StatCard } from '../UserDashboard/Shared';

const AdminUsersTab = (props) => {
  const { dark, textPrimary, textSecondary, badgeFn, stats, bookings, setActiveTab, setFilterStatus, filteredBookings, uniqueUsers, cardClass, setSelectedBooking, setSelectedUser, filterChip, filterStatus, loading, fetchBookings } = props;

  return (
    <>

            <div className="page-transition">
              <div className="mb-6">
                <h2 className={`text-xl font-bold ${textPrimary}`}>User Management</h2>
                <p className={`text-sm ${textSecondary}`}>{uniqueUsers.length} registered users</p>
              </div>

              {uniqueUsers.length === 0 ? (
                <div className={`${cardClass} p-16 text-center`}>
                  <Icon path={ICONS.users} className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-600" : "text-slate-300"}`} />
                  <p className={textSecondary}>No users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueUsers.map(u => {
                    if (!u) return null;
                    const userBookings = bookings.filter(b => b.userId?._id === u._id);
                    return (
                      <div key={u._id} className={`${cardClass} p-5 cursor-pointer transition-all hover:scale-[1.02]`}
                        onClick={() => setSelectedUser(u)}
                        style={{ transition: 'transform 0.15s, box-shadow 0.15s' }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}>
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-semibold truncate ${textPrimary}`}>{u.name}</div>
                            <div className={`text-xs truncate ${textSecondary}`}>{u.email}</div>
                          </div>
                          <Icon path={ICONS.chevronRight} className={`w-4 h-4 ml-auto flex-shrink-0 ${textSecondary}`} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Total", val: userBookings.length, color: dark ? "#A78BFA" : "#7C3AED" },
                            { label: "Accepted", val: userBookings.filter(b => b.status === "Accepted").length, color: "#22C55E" },
                            { label: "Pending", val: userBookings.filter(b => b.status === "Pending").length, color: "#EAB308" },
                          ].map(item => (
                            <div key={item.label} className="py-2 rounded-xl"
                              style={{ background: dark ? "rgba(255,255,255,0.04)" : "#F8FAFF" }}>
                              <div className="font-bold text-xl" style={{ color: item.color }}>{item.val}</div>
                              <div className={`text-xs ${textSecondary}`}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          
    </>
  );
};
export default AdminUsersTab;
