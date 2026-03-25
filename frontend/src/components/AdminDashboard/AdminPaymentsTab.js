import React, { useMemo, useState } from 'react';
import { Icon, ICONS } from '../../utils/icons';

const AdminPaymentsTab = (props) => {
  const { activeTab, bookings, cardClass, setSelectedBooking, setSelectedBookingReadOnly } = props;
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const paymentBookings = bookings.filter((b) => b.status === 'Completed' || b.payment);

  const getCustomerId = (booking) => booking?.userId?._id || booking?.userId?.id || booking?.userId?.uid || '';

  const selectedCustomerPayments = useMemo(() => {
    if (!selectedCustomerId) return [];
    return paymentBookings
      .filter((b) => getCustomerId(b) === selectedCustomerId)
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
  }, [paymentBookings, selectedCustomerId]);

  const selectedCustomer = selectedCustomerPayments[0]?.userId || null;
  const selectedPaidCount = selectedCustomerPayments.filter((b) => b.payment?.status === 'Paid').length;
  const selectedPendingCount = selectedCustomerPayments.filter((b) => (b.payment?.status || 'Pending') !== 'Paid').length;
  const selectedTotalAmount = selectedCustomerPayments.reduce((sum, b) => sum + Number(b.payment?.totalAmount || 0), 0);

  if (activeTab !== 'payments') return null;

  return (
    <div className="page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#c4d4e4' }}>Payment Management</h2>
          <p className="text-sm" style={{ color: '#5a6a7a' }}>{paymentBookings.length} payment records</p>
        </div>
      </div>

      {paymentBookings.length === 0 ? (
        <div className={`${cardClass} p-16 text-center`}>
          <Icon path={ICONS.calendar} className="w-12 h-12 mx-auto mb-3" style={{ color: '#1a2432' }} />
          <p style={{ color: '#5a6a7a' }}>No payments found yet</p>
        </div>
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Invoice</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-xs" style={{ color: '#3d4a5c' }}>
                      #{b.id?.slice(-8)?.toUpperCase()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedCustomerId(getCustomerId(b))}
                        className="text-left rounded-lg px-2 py-1 transition-all"
                        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
                      >
                        <div className="text-sm font-semibold" style={{ color: '#c4d4e4' }}>{b.userId?.name || 'N/A'}</div>
                        <div className="text-xs" style={{ color: '#4a5668' }}>{b.userId?.email || ''}</div>
                      </button>
                    </td>
                    <td>
                      <span className="font-mono font-bold text-sm" style={{ color: '#93C5FD' }}>{b.vehicleNumber}</span>
                    </td>
                    <td className="text-xs" style={{ color: '#93C5FD' }}>{b.payment?.invoiceNo || '-'}</td>
                    <td>
                      <span className="text-sm font-bold" style={{ color: '#34D399' }}>
                        Rs {Number(b.payment?.totalAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{
                          background: b.payment?.status === 'Paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          color: b.payment?.status === 'Paid' ? '#6EE7B7' : '#FCD34D',
                          border: b.payment?.status === 'Paid' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                        }}>
                        {b.payment?.status || 'Pending'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => { if (setSelectedBookingReadOnly) setSelectedBookingReadOnly(false); setSelectedBooking(b); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={b.payment?.status === 'Paid'
                          ? { background: 'rgba(59,130,246,0.08)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)' }
                          : { background: 'rgba(34,197,94,0.08)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.15)' }}>
                        {b.payment?.status === 'Paid' ? 'View' : 'View / Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCustomerId && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 animate-fadeIn" onClick={() => setSelectedCustomerId(null)} />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden animate-fadeInUp"
            style={{ background: '#0F172A', border: '1px solid rgba(59,130,246,0.18)' }}>
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b" style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#E2E8F0' }}>User-wise Payment Details</h3>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>{selectedCustomer.name || 'User'} · {selectedCustomer.email || ''}</p>
                  </div>
                  <button onClick={() => setSelectedCustomerId(null)} className="text-slate-400 hover:text-white transition-colors">
                    <Icon path={ICONS.close} className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.16)' }}>
                    <div className="text-xs" style={{ color: '#93C5FD' }}>Total Payments</div>
                    <div className="text-lg font-bold" style={{ color: '#60A5FA' }}>{selectedCustomerPayments.length}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.16)' }}>
                    <div className="text-xs" style={{ color: '#86EFAC' }}>Paid</div>
                    <div className="text-lg font-bold" style={{ color: '#34D399' }}>{selectedPaidCount}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.16)' }}>
                    <div className="text-xs" style={{ color: '#FCD34D' }}>Pending</div>
                    <div className="text-lg font-bold" style={{ color: '#FBBF24' }}>{selectedPendingCount}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.16)' }}>
                    <div className="text-xs" style={{ color: '#F9A8D4' }}>Total Amount</div>
                    <div className="text-lg font-bold" style={{ color: '#F472B6' }}>Rs {selectedTotalAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {selectedCustomerPayments.length === 0 ? (
                  <div className="text-center py-10" style={{ color: '#64748B' }}>No payment records found.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomerPayments.map((b) => {
                      const issueTotal = Number(b.payment?.issueLines?.reduce((sum, line) => sum + Number(line.amount || 0), 0) || 0);
                      const partsTotal = Number(b.payment?.partLines?.reduce((sum, line) => sum + Number(line.amount || 0), 0) || 0);
                      return (
                        <div key={b.id} className="rounded-2xl p-4"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold" style={{ color: '#E2E8F0' }}>{b.vehicleNumber}</span>
                                <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                  style={{
                                    background: b.payment?.status === 'Paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                    color: b.payment?.status === 'Paid' ? '#6EE7B7' : '#FCD34D',
                                    border: b.payment?.status === 'Paid' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                                  }}>
                                  {b.payment?.status || 'Pending'}
                                </span>
                              </div>
                              <div className="text-xs" style={{ color: '#94A3B8' }}>Invoice: {b.payment?.invoiceNo || '-'}</div>
                              <div className="text-xs" style={{ color: '#94A3B8' }}>Service: {b.serviceDate || '-'} {b.serviceTime ? `· ${b.serviceTime}` : ''}</div>
                              <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>Booking: #{b.id?.slice(-8)?.toUpperCase()}</div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs min-w-[280px]">
                              <div className="rounded-lg p-2" style={{ background: 'rgba(59,130,246,0.08)' }}>
                                <div style={{ color: '#93C5FD' }}>Issue Total</div>
                                <div className="font-bold" style={{ color: '#BFDBFE' }}>Rs {issueTotal.toFixed(2)}</div>
                              </div>
                              <div className="rounded-lg p-2" style={{ background: 'rgba(16,185,129,0.08)' }}>
                                <div style={{ color: '#86EFAC' }}>Parts Total</div>
                                <div className="font-bold" style={{ color: '#6EE7B7' }}>Rs {partsTotal.toFixed(2)}</div>
                              </div>
                              <div className="rounded-lg p-2" style={{ background: 'rgba(236,72,153,0.08)' }}>
                                <div style={{ color: '#F9A8D4' }}>Grand Total</div>
                                <div className="font-bold" style={{ color: '#F472B6' }}>Rs {Number(b.payment?.totalAmount || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => {
                                if (setSelectedBookingReadOnly) setSelectedBookingReadOnly(false);
                                setSelectedBooking(b);
                                setSelectedCustomerId(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              style={b.payment?.status === 'Paid'
                                ? { background: 'rgba(59,130,246,0.08)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)' }
                                : { background: 'rgba(34,197,94,0.08)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.15)' }}>
                              {b.payment?.status === 'Paid' ? 'View Payment' : 'View / Edit This Payment'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsTab;
