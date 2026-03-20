import React from 'react';
import { Icon, ICONS } from '../../utils/icons';

const UserDetailModal = (props) => {
  const { 
    selectedUser, 
    onClose, 
    bookings, 
    dark, 
    badgeFn, 
    textPrimary, 
    textSecondary,
    cardClass,
    setActiveTab,
    setSelectedBooking,
  } = props;

  if (!selectedUser) return null;

  // Filter bookings for this user
  const selectedUid = selectedUser.id || selectedUser.uid || selectedUser._id;
  const userBookings = bookings.filter((b) => {
    const bookingUid = b?.userId?._id || b?.userId?.id || b?.userId?.uid || b?.userId;
    return bookingUid === selectedUid;
  });
  
  // Calculate statistics
  const totalBookings = userBookings.length;
  const completedBookings = userBookings.filter(b => b.status === "Completed").length;
  const pendingBookings = userBookings.filter(b => b.status === "Pending").length;
  const acceptedBookings = userBookings.filter(b => b.status === "Accepted").length;
  const rejectedBookings = userBookings.filter(b => b.status === "Rejected").length;

  // Calculate total spent
  const totalSpent = userBookings
    .filter(b => b.payment)
    .reduce((sum, b) => sum + (Number(b.payment.totalAmount) || 0), 0);

  // Sort bookings by date (newest first)
  const sortedBookings = [...userBookings].sort((a, b) => 
    new Date(b.serviceDate || b.createdAt) - new Date(a.serviceDate || a.createdAt)
  );

  const createdDate = selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 animate-fadeIn" onClick={onClose} />
      
      <div className={`relative z-10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden animate-fadeInUp ${dark ? "glass-dark" : "bg-white shadow-2xl"}`}>
        <div className="max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
              >
                {(selectedUser.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                <p className="text-sm" style={{ color: '#6B7A90' }}>{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                    {selectedUser.role || 'User'}
                  </span>
                  <span className="text-xs" style={{ color: '#6B7A90' }}>Member since {createdDate}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Icon path={ICONS.close} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8 border-b border-white/5 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Bookings", value: totalBookings, color: "#3B82F6", icon: ICONS.bookings },
            { label: "Completed", value: completedBookings, color: "#22C55E", icon: ICONS.check },
            { label: "Pending", value: pendingBookings, color: "#FBBF24", icon: ICONS.clock },
            { label: "Accepted", value: acceptedBookings, color: "#10B981", icon: ICONS.status },
            { label: "Total Spent", value: `₹${totalSpent.toFixed(2)}`, color: "#EC4899", icon: ICONS.truck },
          ].map((stat, i) => (
            <div key={i} className={`${cardClass} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon path={stat.icon} className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs font-semibold" style={{ color: '#6B7A90' }}>{stat.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="p-8 border-b border-white/5">
          <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)' }}>
                <Icon path={ICONS.mail} className="w-4 h-4" style={{ color: '#60A5FA', flexShrink: 0 }} />
                <span className="text-sm text-white">{selectedUser.email}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Member Since</label>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)' }}>
                <Icon path={ICONS.calendar} className="w-4 h-4" style={{ color: '#60A5FA', flexShrink: 0 }} />
                <span className="text-sm text-white">{createdDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Booking History</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full" 
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
              {totalBookings} bookings
            </span>
          </div>

          {userBookings.length === 0 ? (
            <div className="text-center py-8" style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.05)' }}>
              <Icon path={ICONS.info} className="w-10 h-10 mx-auto mb-2" style={{ color: '#475569' }} />
              <p className="text-sm" style={{ color: '#6B7A90' }}>No bookings found for this customer</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {sortedBookings.map((booking, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl border transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white">{booking.vehicleNumber}</span>
                        <span className={badgeFn(booking.status)}>{booking.status}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span style={{ color: '#6B7A90' }} className="block mb-0.5">Date</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <Icon path={ICONS.calendar} className="w-3 h-3" />
                            {booking.serviceDate}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#6B7A90' }} className="block mb-0.5">Time</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <Icon path={ICONS.clock} className="w-3 h-3" />
                            {booking.serviceTime}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#6B7A90' }} className="block mb-0.5">Issues</span>
                          <span className="text-white font-semibold">
                            {booking.issueCategories?.length || 0} items
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#6B7A90' }} className="block mb-0.5">Payment</span>
                          {booking.payment ? (
                            <span className="text-emerald-400 font-semibold">
                              ₹{(booking.payment.totalAmount || 0).toFixed(2)}
                            </span>
                          ) : (
                            <span style={{ color: '#6B7A90' }}>—</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            if (setSelectedBooking) setSelectedBooking(booking);
                            if (setActiveTab) setActiveTab('bookings');
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={{
                            background: 'rgba(59,130,246,0.12)',
                            color: '#60A5FA',
                            border: '1px solid rgba(59,130,246,0.25)',
                          }}
                        >
                          Open In Booking Management
                        </button>
                      </div>
                    </div>
                    {booking.staffId && (
                      <div className="text-right">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned</div>
                        <div className="text-sm font-semibold text-white">{booking.staffId.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: '#1F2937',
              color: '#E5E7EB',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Close
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
