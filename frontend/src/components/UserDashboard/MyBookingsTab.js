import React from 'react';
import { Icon } from './Shared';

const MyBookingsTab = (props) => {
  const { dark, textPrimary, textSecondary, ICONS, cardClass, badgeFn, bookings, setActiveTab, handleCancelBooking, setRescheduleModal, activeTab, SHOP_LOCATION } = props;

  return (
    <>
      {activeTab === "bookings" && (
        <div className="page-transition">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">My Bookings</h2>
              <p className="text-sm" style={{ color: '#6B7A90' }}>{bookings.length} total bookings</p>
            </div>
            <button onClick={() => setActiveTab("book")} className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm">
              <Icon path={ICONS.plus} className="w-4 h-4" /> New Booking
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="p-16 text-center rounded-2xl"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Icon path={ICONS.bookings} className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">No bookings yet</h3>
              <p className="text-sm mb-4" style={{ color: '#6B7A90' }}>Book your first service slot</p>
              <button onClick={() => setActiveTab("book")} className="btn-primary py-2.5 px-6 text-sm">Book Now</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map(b => {
                const statusColorMap = {
                  Pending: "#FBBF24", Accepted: "#22C55E", Rejected: "#F87171",
                  Assigned: "#3B82F6", "In Progress": "#A78BFA", Completed: "#34D399"
                };
                const statusColor = statusColorMap[b.status] || "#FBBF24";
                return (
                  <div key={b.id} className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }}>
                    {/* Status accent line */}
                    <div className="h-[2px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)` }} />

                    <div className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg"
                          style={{
                            background: '#0F1520',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#60A5FA',
                          }}>{b.vehicleNumber}</div>
                        <span className={badgeFn(b.status)}>{b.status}</span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7A90' }}>
                          <Icon path={ICONS.calendar} className="w-3.5 h-3.5" /> {b.serviceDate}
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7A90' }}>
                          <Icon path={ICONS.clock} className="w-3.5 h-3.5" /> {b.serviceTime}
                        </div>
                      </div>

                      {/* Doorstep */}
                      {(b.doorstepDelivery || b.pickupLocation?.lat) && (
                        <div className="rounded-xl p-3 mb-3"
                          style={{ background: '#0F1520', border: '1px solid rgba(37,99,235,0.15)' }}>
                          <div className="flex items-center gap-2 text-xs font-semibold mb-1.5 text-blue-400">
                            <Icon path={ICONS.mapPin} className="w-3.5 h-3.5" /> Doorstep Pickup & Delivery
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span style={{ color: '#6B7A90' }}>
                              {b.distanceKm ? `${b.distanceKm} km` : '—'}
                            </span>
                            <span className="font-bold text-emerald-400">
                              {b.doorstepCharge ? `₹${b.doorstepCharge}` : '₹100'}
                            </span>
                            {b.pickupLocation?.lat && (
                              <a
                                href={`https://www.google.com/maps/dir/${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}/${b.pickupLocation.lat},${b.pickupLocation.lng}`}
                                target="_blank" rel="noopener noreferrer"
                                className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}>
                                <Icon path={ICONS.mapPin} className="w-3 h-3" /> Navigate
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Issue Categories */}
                      {b.issueCategories?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {b.issueCategories.map((c, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: 'rgba(37,99,235,0.08)',
                                color: '#60A5FA',
                                border: '1px solid rgba(37,99,235,0.2)',
                              }}>{c}</span>
                          ))}
                        </div>
                      )}

                      {/* Assigned Staff Info */}
                      {b.staffId && (
                        <div className="rounded-xl p-3 mb-3"
                          style={{ background: '#0F1520', border: '1px solid rgba(59,130,246,0.15)' }}>
                          <div className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#60A5FA' }}>
                            <Icon path={ICONS.user} className="w-3.5 h-3.5" /> Assigned Technician
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{b.staffId.name}</span>
                            {b.staffId.phone && (
                              <span className="text-xs" style={{ color: '#6B7A90' }}>· {b.staffId.phone}</span>
                            )}
                          </div>
                          {b.staffId.specialization && (
                            <div className="text-xs mt-1" style={{ color: '#4ADE80' }}>{b.staffId.specialization}</div>
                          )}
                        </div>
                      )}

                      {/* Completed badge */}
                      {b.status === "Completed" && (
                        <div className="flex items-center gap-2 py-2.5 rounded-xl justify-center text-xs font-semibold mb-3"
                          style={{ background: 'rgba(16,185,129,0.08)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <Icon path={ICONS.check} className="w-3.5 h-3.5" /> Service Completed
                        </div>
                      )}

                      {/* Actions */}
                      {b.status === "Pending" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setRescheduleModal({ isOpen: true, booking: b, newDate: b.serviceDate, newTime: b.serviceTime })}
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                            style={{
                              background: 'rgba(37,99,235,0.06)',
                              border: '1px solid rgba(37,99,235,0.2)',
                              color: '#60A5FA',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(37,99,235,0.12)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(37,99,235,0.06)'}
                          >
                            Reschedule
                          </button>
                          <button onClick={() => handleCancelBooking(b.id)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                            style={{
                              background: 'rgba(239,68,68,0.06)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              color: '#F87171',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.12)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.06)'}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default MyBookingsTab;
