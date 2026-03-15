import React, { useState } from 'react';
import { Icon } from './Shared';

const STAGES = ["Pending", "Accepted", "Assigned", "In Progress", "Completed"];

const StatusTab = (props) => {
  const { dark, textPrimary, textSecondary, ICONS, cardClass, activeTab, bookings } = props;
  const [selectedBooking, setSelectedBooking] = useState(null);

  const getStageIndex = (status) => {
    if (status === "Rejected") return -1;
    if (status === "Completed") return 4;
    if (status === "In Progress") return 3;
    if (status === "Assigned") return 2;
    if (status === "Accepted") return 1;
    return 0;
  };

  const getStatusBadge = (status) => {
    const map = {
      "Pending": { bg: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "rgba(251,191,36,0.2)" },
      "Accepted": { bg: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "rgba(34,197,94,0.2)" },
      "Assigned": { bg: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "rgba(59,130,246,0.2)" },
      "In Progress": { bg: "rgba(249,115,22,0.1)", color: "#FB923C", border: "rgba(249,115,22,0.2)" },
      "Completed": { bg: "rgba(34,197,94,0.1)", color: "#22C55E", border: "rgba(34,197,94,0.2)" },
      "Rejected": { bg: "rgba(239,68,68,0.1)", color: "#F87171", border: "rgba(239,68,68,0.2)" },
    };
    const s = map[status] || map["Pending"];
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
        {status}
      </span>
    );
  };

  return (
    <>
      {activeTab === "status" && (
        <div className="space-y-6 page-transition">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Live Service Status</h2>
              <p className="text-sm" style={{ color: '#6B7A90' }}>Track the real-time progress of your vehicle service</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Icon path={ICONS.status} className="w-5 h-5 text-green-400" />
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className={`${cardClass} p-16 text-center`}>
              <Icon path={ICONS.status} className="w-12 h-12 mx-auto mb-3" style={{ color: '#1E293B' }} />
              <p style={{ color: '#6B7A90' }}>No bookings available to track</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: List of Bookings */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">Your Bookings</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}>
                    {bookings.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {bookings.map((b) => {
                    const isSelected = selectedBooking?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="p-4 rounded-xl cursor-pointer transition-all duration-300"
                        style={{
                          background: isSelected ? 'rgba(34,197,94,0.06)' : '#111827',
                          border: isSelected ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isSelected ? '0 0 20px rgba(34,197,94,0.08)' : '0 2px 8px rgba(0,0,0,0.2)',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-mono mb-1" style={{ color: '#3D4A5C' }}>#{b.id.slice(-6).toUpperCase()}</p>
                            <h4 className="font-bold text-sm text-white">{b.vehicleNumber}</h4>
                          </div>
                          {getStatusBadge(b.status)}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#6B7A90' }}>
                          <Icon path={ICONS.calendar} className="w-3.5 h-3.5" />
                          <span>{b.serviceDate}</span>
                          <span style={{ color: '#1E293B' }}>•</span>
                          <Icon path={ICONS.clock} className="w-3.5 h-3.5" />
                          <span>{b.serviceTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Tracking */}
              <div className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden flex flex-col"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  minHeight: 500,
                }}>
                {!selectedBooking ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                      <Icon path={ICONS.car} className="w-10 h-10" style={{ color: '#1E40AF' }} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-white">Select a booking</h3>
                    <p className="text-sm" style={{ color: '#6B7A90', maxWidth: 300 }}>
                      Click on any booking from the list to view its live service progress and status timeline.
                    </p>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Service Tracking</h3>
                        <p className="text-sm" style={{ color: '#6B7A90' }}>
                          Booking #{selectedBooking.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                      {getStatusBadge(selectedBooking.status)}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                      {[
                        { label: "Vehicle", value: selectedBooking.vehicleNumber, icon: ICONS.car },
                        { label: "Date", value: selectedBooking.serviceDate, icon: ICONS.calendar },
                        { label: "Time", value: selectedBooking.serviceTime, icon: ICONS.clock },
                        { label: "Issue", value: selectedBooking.issue || "General", icon: ICONS.wrench },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl"
                          style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon path={item.icon} className="w-3.5 h-3.5" style={{ color: '#3D4A5C' }} />
                            <p className="text-xs font-medium" style={{ color: '#6B7A90' }}>{item.label}</p>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {selectedBooking.status === "Rejected" ? (
                      <div className="flex flex-col items-center justify-center p-10 rounded-2xl"
                        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <Icon path={ICONS.x} className="w-12 h-12 mb-3" style={{ color: '#F87171' }} />
                        <h4 className="font-bold text-lg mb-2" style={{ color: '#F87171' }}>Booking Rejected</h4>
                        <p className="text-sm text-center" style={{ color: '#6B7A90', maxWidth: 350 }}>
                          Your booking request could not be accommodated. Please try booking a different slot.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Progress Bar */}
                        <div className="mb-8">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-sm font-bold text-white">Service Progress</span>
                            <span className="text-xs font-bold" style={{ color: '#22C55E' }}>
                              {Math.max(10, (getStageIndex(selectedBooking.status) + 1) * 20)}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out relative"
                              style={{
                                width: `${Math.max(10, (getStageIndex(selectedBooking.status) + 1) * 20)}%`,
                                background: "linear-gradient(90deg, #166534, #22C55E, #4ADE80)",
                                boxShadow: "0 0 12px rgba(34,197,94,0.4)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="relative ml-4 space-y-0">
                          {STAGES.map((stage, index) => {
                            const currentIndex = getStageIndex(selectedBooking.status);
                            const isCompleted = index <= currentIndex;
                            const isActive = index === currentIndex;
                            const isLast = index === STAGES.length - 1;

                            const stageColors = {
                              "Pending": "#FBBF24",
                              "Accepted": "#3B82F6",
                              "Assigned": "#60A5FA",
                              "In Progress": "#F97316",
                              "Completed": "#22C55E",
                            };
                            const color = stageColors[stage];

                            const messageMap = {
                              "Pending": "Your booking request is pending confirmation from the garage.",
                              "Accepted": "Booking accepted. The team is ready for your scheduled visit.",
                              "Assigned": "A technician has been assigned to your service.",
                              "In Progress": "Our mechanic is working on your vehicle right now.",
                              "Completed": "Service complete! Your vehicle is ready for pickup.",
                            };

                            return (
                              <div key={stage} className="relative flex gap-4" style={{ paddingBottom: isLast ? 0 : 28 }}>
                                {/* Vertical line */}
                                {!isLast && (
                                  <div className="absolute left-[15px] top-8 w-[2px]"
                                    style={{
                                      bottom: 0,
                                      background: isCompleted ? `linear-gradient(180deg, ${color}, ${stageColors[STAGES[index + 1]] || color})` : 'rgba(255,255,255,0.05)',
                                      opacity: isCompleted ? 0.5 : 1,
                                    }}
                                  />
                                )}

                                {/* Dot */}
                                <div className="relative flex-shrink-0 z-10">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                                    style={{
                                      background: isCompleted ? `${color}15` : '#0F1520',
                                      border: isCompleted ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.08)',
                                      boxShadow: isActive ? `0 0 16px ${color}30` : 'none',
                                    }}
                                  >
                                    {isCompleted ? (
                                      <Icon path={ICONS.check} className="w-3.5 h-3.5" style={{ color }} />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                                    )}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className={`flex-1 transition-all duration-300 ${isCompleted ? 'opacity-100' : 'opacity-35'}`}>
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-bold" style={{ color: isActive ? color : '#E8ECF4' }}>
                                      {stage}
                                    </h4>
                                    {isActive && (
                                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs leading-relaxed" style={{ color: '#6B7A90' }}>
                                    {isCompleted ? messageMap[stage] : "Waiting for previous stages to complete."}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StatusTab;
