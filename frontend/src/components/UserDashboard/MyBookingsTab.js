import React, { useMemo, useState } from 'react';
import { Icon } from './Shared';

const MyBookingsTab = (props) => {
  const {
    dark,
    textPrimary,
    textSecondary,
    ICONS,
    cardClass,
    badgeFn,
    bookings,
    setActiveTab,
    handleCancelBooking,
    setRescheduleModal,
    activeTab,
    SHOP_LOCATION,
    paymentLoadingId,
    handleGeneratePayment,
    handleMakePayment,
    openReminderModal,
    bookingFilterStatus,
    setBookingFilterStatus,
  } = props;
  const [timeSortMode, setTimeSortMode] = useState("upcoming");

  const parseBookingDateTime = (booking) => {
    const date = booking.serviceDate || booking.createdAt;
    if (!date) return 0;

    const startTime = (booking.serviceTime || "").split("-")[0]?.trim() || "00:00";
    const parsed = new Date(`${date} ${startTime}`);
    const ts = parsed.getTime();

    if (!Number.isNaN(ts)) return ts;
    const createdTs = new Date(booking.createdAt || date).getTime();
    return Number.isNaN(createdTs) ? 0 : createdTs;
  };

  const getTimeVariant = (timestamp) => {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return "Scheduled";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((bookingDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays === -1) return "Yesterday";
    return `${Math.abs(diffDays)} days ago`;
  };

  const visibleBookings = bookingFilterStatus && bookingFilterStatus !== "All"
    ? bookings.filter((b) => b.status === bookingFilterStatus)
    : bookings;

  const sortedBookings = useMemo(() => {
    const list = [...visibleBookings];
    list.sort((a, b) => {
      const aTime = parseBookingDateTime(a);
      const bTime = parseBookingDateTime(b);

      if (timeSortMode === "recent") return bTime - aTime;
      return aTime - bTime;
    });
    return list;
  }, [visibleBookings, timeSortMode]);

  return (
    <>
      {activeTab === "bookings" && (
        <div className="page-transition">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">My Bookings</h2>
              <p className="text-sm" style={{ color: '#6B7A90' }}>
                {sortedBookings.length} {bookingFilterStatus && bookingFilterStatus !== "All" ? `${bookingFilterStatus.toLowerCase()} bookings` : 'total bookings'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg overflow-hidden"
                style={{ border: '1px solid rgba(37,99,235,0.2)' }}>
                <button
                  onClick={() => setTimeSortMode("upcoming")}
                  className="px-3 py-2 text-xs font-semibold"
                  style={timeSortMode === "upcoming"
                    ? { background: 'rgba(37,99,235,0.2)', color: '#93C5FD' }
                    : { background: 'rgba(15,21,32,0.9)', color: '#6B7A90' }}
                >
                  Upcoming First
                </button>
                <button
                  onClick={() => setTimeSortMode("recent")}
                  className="px-3 py-2 text-xs font-semibold"
                  style={timeSortMode === "recent"
                    ? { background: 'rgba(37,99,235,0.2)', color: '#93C5FD' }
                    : { background: 'rgba(15,21,32,0.9)', color: '#6B7A90' }}
                >
                  Recent First
                </button>
              </div>
              {bookingFilterStatus && bookingFilterStatus !== "All" && (
                <button
                  onClick={() => setBookingFilterStatus && setBookingFilterStatus("All")}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#60A5FA' }}
                >
                  Clear Filter
                </button>
              )}
              <button onClick={() => setActiveTab("book")} className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm">
                <Icon path={ICONS.plus} className="w-4 h-4" /> New Booking
              </button>
            </div>
          </div>

          {sortedBookings.length === 0 ? (
            <div className="p-16 text-center rounded-2xl"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Icon path={ICONS.bookings} className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">No bookings found</h3>
              <p className="text-sm mb-4" style={{ color: '#6B7A90' }}>
                {bookingFilterStatus && bookingFilterStatus !== "All"
                  ? `No ${bookingFilterStatus.toLowerCase()} bookings at the moment`
                  : 'Book your first service slot'}
              </p>
              {bookingFilterStatus && bookingFilterStatus !== "All" ? (
                <button onClick={() => setBookingFilterStatus && setBookingFilterStatus("All")} className="btn-primary py-2.5 px-6 text-sm">Show All</button>
              ) : (
                <button onClick={() => setActiveTab("book")} className="btn-primary py-2.5 px-6 text-sm">Book Now</button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBookings.map((b, idx) => {
                const statusColorMap = {
                  Pending: "#FBBF24", Accepted: "#22C55E", Rejected: "#F87171",
                  Assigned: "#3B82F6", "In Progress": "#A78BFA", Completed: "#34D399"
                };
                const statusColor = statusColorMap[b.status] || "#FBBF24";
                const bookingTs = parseBookingDateTime(b);
                const timeVariant = getTimeVariant(bookingTs);
                return (
                  <div key={b.id} className="rounded-2xl overflow-hidden"
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
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-bold px-2 py-1 rounded-md"
                            style={{
                              background: 'rgba(37,99,235,0.12)',
                              border: '1px solid rgba(37,99,235,0.2)',
                              color: '#93C5FD',
                            }}>
                            #{idx + 1}
                          </div>
                          <div className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg"
                            style={{
                              background: '#0F1520',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: '#60A5FA',
                            }}>{b.vehicleNumber}</div>
                        </div>
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
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md"
                          style={{ background: 'rgba(34,197,94,0.08)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.18)' }}>
                          <Icon path={ICONS.lightning} className="w-3 h-3" /> {timeVariant}
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

                      {b.status === "Completed" && (
                        <div className="rounded-xl p-3 mb-3"
                          style={{ background: '#0F1520', border: '1px solid rgba(59,130,246,0.18)' }}>
                          <div className="text-xs font-semibold mb-2" style={{ color: '#93C5FD' }}>Payment Details</div>
                          {!b.payment ? (
                            <button
                              onClick={() => handleGeneratePayment(b.id)}
                              disabled={paymentLoadingId === b.id}
                              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
                              style={{
                                background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                                color: '#fff',
                                opacity: paymentLoadingId === b.id ? 0.6 : 1,
                              }}
                            >
                              {paymentLoadingId === b.id ? 'Generating...' : 'Generate Payment'}
                            </button>
                          ) : (
                            <>
                              <div className="space-y-1 text-xs mb-3" style={{ color: '#AFC7E5' }}>
                                <div>Invoice: <span className="font-semibold text-white">{b.payment.invoiceNo || '-'}</span></div>
                                <div>Total: <span className="font-semibold text-emerald-400">Rs {Number(b.payment.totalAmount || 0).toFixed(2)}</span></div>
                                <div>Status: <span className={`font-semibold ${b.payment.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{b.payment.status || 'Pending'}</span></div>
                              </div>
                              {b.payment.status !== 'Paid' ? (
                                <button
                                  onClick={() => handleMakePayment(b.id)}
                                  disabled={paymentLoadingId === b.id}
                                  className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
                                  style={{
                                    background: 'linear-gradient(135deg, #047857, #10B981)',
                                    color: '#fff',
                                    opacity: paymentLoadingId === b.id ? 0.6 : 1,
                                  }}
                                >
                                  {paymentLoadingId === b.id ? 'Processing...' : 'Make Payment'}
                                </button>
                              ) : (
                                <div className="w-full py-2.5 rounded-xl text-center text-xs font-semibold"
                                  style={{ background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.2)' }}>
                                  Payment Completed
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Set Reminder Button */}
                      {b.status === "Completed" && (
                        <button
                          onClick={() => openReminderModal(b.id, b.vehicleNumber)}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 mt-3"
                          style={{
                            background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.2)',
                            color: '#FBBF24',
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(251,191,36,0.15)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(251,191,36,0.08)'}
                        >
                          <Icon path={ICONS.bell} className="w-4 h-4" />
                          Set Service Reminder
                        </button>
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
