import React from 'react';
import { Icon } from './Shared';

const RemindersTab = (props) => {
    const { dark, textPrimary, textSecondary, ICONS, cardClass, activeTab, bookings } = props;

    // Generate reminders from bookings
    const generateReminders = () => {
        const reminders = [];

        // Add reminders from actual bookings
        bookings.forEach((b, index) => {
            if (b.status === "Accepted" || b.status === "Completed") {
                const serviceDate = new Date(b.serviceDate);
                const nextDue = new Date(serviceDate);
                nextDue.setMonth(nextDue.getMonth() + 6); // 6 months service interval
                const today = new Date();
                const daysLeft = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));

                reminders.push({
                    id: b._id,
                    vehicleNumber: b.vehicleNumber,
                    lastServiceDate: b.serviceDate,
                    nextServiceDate: nextDue.toISOString().split('T')[0],
                    daysLeft,
                    message: daysLeft <= 0
                        ? `Service overdue by ${Math.abs(daysLeft)} days. Book immediately!`
                        : daysLeft <= 7
                            ? `Service due in ${daysLeft} days. Don't forget!`
                            : `Next service due in ${daysLeft} days.`,
                });
            }
        });

        // Add sample reminders if none exist
        if (reminders.length === 0) {
            reminders.push(
                {
                    id: 'sample-1',
                    vehicleNumber: "TN-01-AB-1234",
                    lastServiceDate: "2025-09-10",
                    nextServiceDate: "2026-03-10",
                    daysLeft: 0,
                    message: "Your vehicle service is due today!",
                },
                {
                    id: 'sample-2',
                    vehicleNumber: "KA-05-XY-9876",
                    lastServiceDate: "2025-10-15",
                    nextServiceDate: "2026-04-15",
                    daysLeft: 36,
                    message: "Your vehicle service is due in 36 days.",
                },
                {
                    id: 'sample-3',
                    vehicleNumber: "MH-12-CD-4567",
                    lastServiceDate: "2025-08-01",
                    nextServiceDate: "2026-02-01",
                    daysLeft: -37,
                    message: "Service overdue by 37 days. Book immediately!",
                }
            );
        }

        return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
    };

    const reminders = generateReminders();
    const urgentCount = reminders.filter(r => r.daysLeft <= 7).length;

    return (
        <>
            {activeTab === "reminders" && (
                <div className="space-y-6 page-transition">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Service Reminders</h2>
                            <p className="text-sm" style={{ color: '#6B7A90' }}>Never miss your next vehicle service</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {urgentCount > 0 && (
                                <span className="text-xs font-bold px-3 py-1 rounded-full"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    {urgentCount} urgent
                                </span>
                            )}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                <Icon path={ICONS.bell} className="w-5 h-5" style={{ color: '#FBBF24' }} />
                                {urgentCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                                        {urgentCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Vehicles", value: reminders.length, color: "#22C55E", icon: ICONS.car },
                            { label: "Due Soon", value: reminders.filter(r => r.daysLeft >= 0 && r.daysLeft <= 7).length, color: "#FBBF24", icon: ICONS.clock },
                            { label: "Overdue", value: reminders.filter(r => r.daysLeft < 0).length, color: "#F87171", icon: ICONS.info },
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-4"
                                style={{
                                    background: '#111827',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                                }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}>
                                        <Icon path={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: '#6B7A90' }}>{item.label}</span>
                                </div>
                                <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Reminder Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reminders.map((reminder) => {
                            const overdue = reminder.daysLeft < 0;
                            const dueSoon = reminder.daysLeft >= 0 && reminder.daysLeft <= 7;

                            let statusColor = "#22C55E";
                            let statusLabel = "On Track";
                            if (overdue) {
                                statusColor = "#F87171";
                                statusLabel = "Overdue";
                            } else if (dueSoon) {
                                statusColor = "#FBBF24";
                                statusLabel = "Due Soon";
                            }

                            return (
                                <div key={reminder.id} className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        background: '#111827',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                                    }}>
                                    {/* Top Accent */}
                                    <div className="h-[2px]"
                                        style={{ background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)` }} />

                                    <div className="p-5">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ background: `${statusColor}12`, border: `1px solid ${statusColor}20` }}>
                                                    <Icon path={ICONS.car} className="w-5 h-5" style={{ color: statusColor }} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-white">{reminder.vehicleNumber}</h3>
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                        style={{ background: `${statusColor}12`, color: statusColor, border: `1px solid ${statusColor}25` }}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7A90' }}>
                                                    <Icon path={ICONS.calendar} className="w-3.5 h-3.5" />
                                                    Last Service
                                                </div>
                                                <span className="text-xs font-semibold text-white">{reminder.lastServiceDate}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7A90' }}>
                                                    <Icon path={ICONS.clock} className="w-3.5 h-3.5" />
                                                    Next Due
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: statusColor }}>{reminder.nextServiceDate}</span>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />

                                        {/* Message */}
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5 flex-shrink-0">
                                                <Icon path={ICONS.info} className="w-4 h-4" style={{ color: statusColor }} />
                                            </div>
                                            <p className="text-xs font-medium leading-relaxed" style={{ color: '#9CA3B4' }}>
                                                {reminder.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default RemindersTab;
