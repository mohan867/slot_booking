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
                  Service Type
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
                    <div className="grid grid-cols-2 gap-1.5">
                      {availableSlots.map((slot, i) => {
                        if (i >= availableSlots.length - 1) return null;

                        const nextSlot = availableSlots[i + 1];
                        const timeRange = `${slot.time} - ${nextSlot.time}`;
                        
                        // A slot is unavailable if the START time of the range is booked.
                        const isFull = !slot.isAvailable;
                        const isSelected = formData.serviceTime === timeRange;

                        return (
                          <button key={i} type="button"
                            onClick={() => !isFull && handleSlotSelect({ time: timeRange, isAvailable: true })}
                            className="py-2 rounded-lg text-xs font-semibold transition-all"
                            style={{
                              opacity: isFull ? 0.4 : 1,
                              cursor: isFull ? 'not-allowed' : 'pointer',
                              background: isSelected ? 'linear-gradient(135deg, #1E40AF, #3B82F6)' : '#0F1520',
                              border: isSelected ? '1px solid rgba(37,99,235,0.5)' : '1px solid rgba(255,255,255,0.06)',
                              color: isSelected ? '#fff' : '#6B7A90',
                              boxShadow: isSelected ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            {timeRange}
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
                      className={`w-12 h-6 rounded-full flex items-center transition-colors p-1 ${formData.doorstepDelivery ? 'bg-blue-600 justify-end' : 'bg-gray-700 justify-start'}`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>

                  {/* Location Input (conditional) */}
                  {formData.doorstepDelivery && (
                    <div className="p-5 pt-0 animate-fadeIn">
                      <div className="floating-group">
                        <input
                          type="text" name="pickupAddress" id="pickupAddress"
                          placeholder=" "
                          className={`${inputClass} w-full px-4 text-sm`}
                          value={formData.pickupAddress || ''}
                          onChange={handleInputChange}
                          required={formData.doorstepDelivery}
                          disabled={loading}
                        />
                        <label htmlFor="pickupAddress" className={`floating-label ${labelClass}`}>
                          Pickup Address
                        </label>
                      </div>
                      <button type="button" onClick={handleUseMyLocation} disabled={locatingUser}
                        className="mt-2 flex items-center gap-2 text-xs font-semibold"
                        style={{ color: '#60A5FA' }}>
                        {locatingUser ? (
                          <>
                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            Locating...
                          </>
                        ) : (
                          <>
                            <Icon path={ICONS.locate} className="w-3.5 h-3.5" />
                            Use My Current Location
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Map container */}
              <div ref={mapContainerRef} style={{ height: formData.doorstepDelivery ? 200 : 0, transition: 'height 0.4s' }} className="rounded-xl overflow-hidden" />

              {/* Submit Button */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                }}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Icon path={ICONS.check} className="w-4 h-4" />
                    Confirm Booking
                  </>
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
