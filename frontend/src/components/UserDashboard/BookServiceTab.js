import React from 'react';
import { Icon } from './Shared';

const BookServiceTab = (props) => {
  const { dark, textPrimary, textSecondary, ICONS, cardClass, formData, handleInputChange, handleCheckboxChange, availableSlots, handleSlotSelect, handleSubmit, loading, setFormData, handleUseMyLocation, locatingUser, mapContainerRef, SHOP_LOCATION, ISSUE_CATEGORIES, getMinDate, inputClass, labelClass, activeTab } = props;

  return (
    <>
      {activeTab === "book" && (
        <div className="max-w-2xl mx-auto page-transition">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>

            {/* Card Header */}
            <div className="px-6 py-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="relative z-10">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Icon path={ICONS.book} className="w-5 h-5 text-blue-200" />
                  Book a Service Slot
                </h2>
                <p className="text-blue-200/70 text-xs mt-1">Fill in details to schedule your vehicle service</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Vehicle Number */}
              <div className="floating-group">
                <input
                  type="text" name="vehicleNumber" id="vehicleNumber"
                  placeholder=" "
                  className={`${inputClass} w-full px-4 text-sm`}
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  required disabled={loading}
                />
                <label htmlFor="vehicleNumber" className={`floating-label ${labelClass}`}>
                  Vehicle Number (e.g. TN01AB1234)
                </label>
              </div>

              {/* Service Categories */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7A90' }}>
                  Service Type (Optional)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ISSUE_CATEGORIES.map(cat => {
                    const checked = formData.issueCategories.includes(cat);
                    return (
                      <label key={cat}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all"
                        style={{
                          background: checked ? 'rgba(37,99,235,0.08)' : '#0F1520',
                          border: checked ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          color: checked ? '#60A5FA' : '#6B7A90',
                        }}>
                        <input type="checkbox" className="hidden"
                          checked={checked}
                          onChange={() => handleCheckboxChange(cat)}
                          disabled={loading}
                        />
                        <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: checked ? '#3B82F6' : 'rgba(255,255,255,0.06)',
                            border: checked ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          }}>
                          {checked && <Icon path={ICONS.check} className="w-2.5 h-2.5 text-white" />}
                        </span>
                        {cat}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Service Issue */}
              <div className="floating-group">
                <textarea
                  name="issue" id="issue"
                  rows={3}
                  placeholder=" "
                  className={`${inputClass} w-full px-4 resize-none text-sm`}
                  value={formData.issue}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <label htmlFor="issue" className={`floating-label ${labelClass}`}>
                  Describe the Issue / Service Needed
                </label>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="floating-group">
                  <input
                    type="date" name="serviceDate" id="serviceDate"
                    lang="en-GB"
                    placeholder=" "
                    className={`${inputClass} w-full px-4 text-sm`}
                    value={formData.serviceDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    required disabled={loading}
                  />
                  <label htmlFor="serviceDate" className={`floating-label ${labelClass}`}>Service Date</label>
                </div>

                {/* Time Slot selector */}
                {!formData.serviceDate ? (
                  <div className="flex items-center justify-center rounded-xl text-xs"
                    style={{
                      minHeight: 60,
                      borderStyle: 'dashed',
                      border: '1px dashed rgba(255,255,255,0.08)',
                      color: '#3D4A5C',
                    }}>
                    Select a date first
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#6B7A90' }}>Time Slot</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {availableSlots.map((slot, i) => {
                        const full = slot.available === 0;
                        const selected = formData.serviceTime === slot.time;
                        return (
                          <button key={i} type="button"
                            onClick={() => !full && handleSlotSelect(slot)}
                            className="py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              opacity: full ? 0.3 : 1,
                              cursor: full ? 'not-allowed' : 'pointer',
                              background: selected ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : '#0F1520',
                              border: selected ? '1px solid rgba(37,99,235,0.5)' : '1px solid rgba(255,255,255,0.06)',
                              color: selected ? '#fff' : '#6B7A90',
                              boxShadow: selected ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                              transform: selected ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="floating-group">
                    <input
                      type="time" name="serviceTime" id="serviceTime"
                      placeholder=" "
                      className={`${inputClass} w-full px-4 text-sm`}
                      value={formData.serviceTime}
                      onChange={handleInputChange}
                      required disabled={loading}
                    />
                    <label htmlFor="serviceTime" className={`floating-label ${labelClass}`}>Service Time</label>
                  </div>
                )}
              </div>

              {/* Doorstep Pickup & Delivery Toggle */}
              {formData.serviceDate && (
                <div className="rounded-2xl transition-all duration-300 animate-fadeIn overflow-hidden"
                  style={{
                    background: formData.doorstepDelivery
                      ? 'rgba(37,99,235,0.04)' : '#0F1520',
                    border: formData.doorstepDelivery
                      ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Toggle Header */}
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: formData.doorstepDelivery ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : 'rgba(255,255,255,0.04)',
                          border: formData.doorstepDelivery ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        <Icon path={ICONS.mapPin}
                          className={`w-5 h-5 transition-colors ${formData.doorstepDelivery ? 'text-white' : ''}`}
                          style={{ color: formData.doorstepDelivery ? undefined : '#3D4A5C' }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Doorstep Pickup & Delivery</div>
                        <div className="text-xs mt-0.5" style={{ color: '#6B7A90' }}>
                          We'll pick up your bike & deliver it back after service
                        </div>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({
                        ...p,
                        doorstepDelivery: !p.doorstepDelivery,
                        ...(!p.doorstepDelivery ? {} : { pickupLocation: null, doorstepCharge: 0, distanceKm: 0 })
                      }))}
                      disabled={loading}
                      className="relative flex-shrink-0 ml-3 transition-all duration-300 focus:outline-none"
                      style={{
                        width: 48, height: 26, borderRadius: 13,
                        background: formData.doorstepDelivery
                          ? 'linear-gradient(135deg, #3B82F6, #60A5FA)' : 'rgba(255,255,255,0.08)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: formData.doorstepDelivery ? '0 0 12px rgba(37,99,235,0.3)' : 'none',
                      }}
                    >
                      <span
                        className="block rounded-full shadow-lg transition-all duration-300"
                        style={{
                          width: 20, height: 20,
                          marginTop: 3,
                          marginLeft: formData.doorstepDelivery ? 25 : 3,
                          background: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Map & Pricing Panel */}
                  {formData.doorstepDelivery && (
                    <div className="animate-fadeIn">
                      {/* Action Buttons */}
                      <div className="px-5 pb-3 flex flex-wrap gap-2">
                        <button type="button" onClick={handleUseMyLocation} disabled={locatingUser}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-white"
                          style={{
                            background: 'linear-gradient(135deg, #166534, #22C55E)',
                            opacity: locatingUser ? 0.7 : 1,
                            cursor: locatingUser ? 'wait' : 'pointer',
                          }}>
                          {locatingUser ? (
                            <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg> Locating...</>
                          ) : (
                            <><Icon path={ICONS.mapPin} className="w-3.5 h-3.5" /> Use My Location</>
                          )}
                        </button>
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#3D4A5C' }}>
                          <Icon path={ICONS.info} className="w-3 h-3" />
                          or click on the map to set pickup point
                        </div>
                      </div>

                      {/* Map Container */}
                      <div className="px-5 pb-4">
                        <div style={{
                          borderRadius: 16, overflow: 'hidden', height: 280,
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                        </div>
                      </div>

                      {/* Location & Pricing Info */}
                      {formData.pickupLocation && (
                        <div className="px-5 pb-5 space-y-3 animate-fadeIn">
                          {/* Selected Address */}
                          <div className="rounded-xl p-3"
                            style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#6B7A90' }}>Pickup Address</div>
                            <p className="text-xs leading-relaxed text-white">
                              {formData.pickupLocation.address?.substring(0, 120)}{formData.pickupLocation.address?.length > 120 ? '...' : ''}
                            </p>
                          </div>

                          {/* Distance & Pricing Card */}
                          <div className="rounded-xl overflow-hidden"
                            style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="p-3 grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <div className="text-lg font-black text-green-400">
                                  {formData.distanceKm} <span className="text-xs font-semibold">km</span>
                                </div>
                                <div className="text-xs" style={{ color: '#6B7A90' }}>Distance</div>
                              </div>
                              <div className="text-center"
                                style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="text-lg font-black text-emerald-400">₹{formData.doorstepCharge}</div>
                                <div className="text-xs" style={{ color: '#6B7A90' }}>Delivery Fee</div>
                              </div>
                              <div className="text-center flex flex-col items-center justify-center">
                                <a
                                  href={`https://www.google.com/maps/dir/${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}/${formData.pickupLocation.lat},${formData.pickupLocation.lng}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
                                  style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}>
                                  <Icon path={ICONS.mapPin} className="w-3 h-3" /> Navigate
                                </a>
                              </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="px-3 pb-3">
                              <div className="rounded-lg p-2.5 text-xs leading-relaxed"
                                style={{ background: 'rgba(255,255,255,0.02)', color: '#6B7A90' }}>
                                {formData.distanceKm <= 10 ? (
                                  <div className="flex items-center gap-2">
                                    <Icon path={ICONS.check} className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                                    <span>Within 10 km — Flat rate <strong className="text-emerald-400">₹100</strong></span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Icon path={ICONS.info} className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                                      <span>Base charge (first 10 km): <strong>₹100</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Icon path={ICONS.plus} className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                                      <span>Extra {Math.ceil(formData.distanceKm - 10)} km × ₹10 = <strong>₹{Math.ceil(formData.distanceKm - 10) * 10}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                      <Icon path={ICONS.check} className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                                      <span>Total delivery fee: <strong className="text-emerald-400">₹{formData.doorstepCharge}</strong></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>Processing...</>
                ) : (
                  <><Icon path={ICONS.check} className="w-4 h-4" />Submit Booking</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default BookServiceTab;
