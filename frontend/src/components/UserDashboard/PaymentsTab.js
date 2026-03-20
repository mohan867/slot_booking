import React from 'react';
import { Icon } from './Shared';

const PaymentsTab = (props) => {
  const {
    activeTab,
    bookings,
    ICONS,
    handleGeneratePayment,
    handleMakePayment,
    paymentLoadingId,
  } = props;

  if (activeTab !== 'payments') return null;

  const paymentBookings = bookings.filter((b) => b.status === 'Completed');

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Payments</h2>
          <p className="text-sm" style={{ color: '#6B7A90' }}>
            {paymentBookings.length} completed services
          </p>
        </div>
      </div>

      {paymentBookings.length === 0 ? (
        <div className="p-16 text-center rounded-2xl"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
          <Icon path={ICONS.receipt} className="w-10 h-10 mx-auto mb-3 text-blue-400" />
          <p className="text-sm" style={{ color: '#6B7A90' }}>No completed services available for payment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentBookings.map((b) => (
            <div key={b.id} className="rounded-2xl p-5"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono font-bold text-sm" style={{ color: '#93C5FD' }}>{b.vehicleNumber}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{
                    background: b.payment?.status === 'Paid' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    color: b.payment?.status === 'Paid' ? '#6EE7B7' : '#FCD34D',
                    border: b.payment?.status === 'Paid' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                  }}>
                  {b.payment?.status || 'Payment Pending'}
                </div>
              </div>

              <div className="space-y-1 text-xs mb-4" style={{ color: '#9CA3AF' }}>
                <div>Date: <span className="text-white">{b.serviceDate}</span></div>
                <div>Invoice: <span className="text-white">{b.payment?.invoiceNo || '-'}</span></div>
                <div>Total: <span className="text-emerald-400 font-semibold">Rs {Number(b.payment?.totalAmount || 0).toFixed(2)}</span></div>
              </div>

              {!b.payment ? (
                <button
                  onClick={() => handleGeneratePayment(b.id)}
                  disabled={paymentLoadingId === b.id}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', opacity: paymentLoadingId === b.id ? 0.6 : 1 }}>
                  {paymentLoadingId === b.id ? 'Generating...' : 'Generate Payment'}
                </button>
              ) : b.payment.status !== 'Paid' ? (
                <button
                  onClick={() => handleMakePayment(b.id)}
                  disabled={paymentLoadingId === b.id}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #047857, #10B981)', opacity: paymentLoadingId === b.id ? 0.6 : 1 }}>
                  {paymentLoadingId === b.id ? 'Processing...' : 'Make Payment'}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl text-center text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.2)' }}>
                  Payment Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
