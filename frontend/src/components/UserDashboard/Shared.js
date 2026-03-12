import React from 'react';

export const Icon = ({ path, className = "w-5 h-5", style }) => (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} />
    </svg>
);

export const FilledIcon = ({ path, className = "w-5 h-5", style }) => (
    <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
        <path d={path} />
    </svg>
);

/* ── Donut / Ring Chart ── */
export const DonutChart = ({ percentage = 0, size = 120, strokeWidth = 10, color = '#3B82F6', label, sublabel }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = (percentage / 100) * circumference;
    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="donut-chart">
                    <circle cx={size/2} cy={size/2} r={radius} fill="none"
                        stroke="rgba(37,99,235,0.06)" strokeWidth={strokeWidth} />
                    <circle cx={size/2} cy={size/2} r={radius} fill="none"
                        stroke={color} strokeWidth={strokeWidth}
                        strokeDasharray={`${filled} ${circumference}`}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'none' }}>
                    <span className="text-2xl font-black" style={{ color }}>{percentage}%</span>
                </div>
            </div>
            {label && <div className="text-xs font-semibold mt-2" style={{ color: '#94A3B8' }}>{label}</div>}
            {sublabel && <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{sublabel}</div>}
        </div>
    );
};

/* ── Mini Bar Chart ── */
export const MiniBarChart = ({ data = [], height = 80, barColor = '#3B82F6' }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-1.5" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-1" style={{ height: '100%' }}>
                    <div className="flex-1 w-full flex items-end">
                        <div
                            className="mini-bar w-full"
                            style={{
                                height: `${Math.max((d.value / max) * 100, 4)}%`,
                                background: `linear-gradient(to top, ${barColor}30, ${barColor})`,
                                animationDelay: `${i * 80}ms`,
                            }}
                        />
                    </div>
                    {d.label && <span className="text-[9px] font-medium" style={{ color: '#64748B' }}>{d.label}</span>}
                </div>
            ))}
        </div>
    );
};

/* ── Activity Heatmap Grid ── */
export const ActivityGrid = ({ data = [], cols = 7 }) => {
    return (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {data.map((val, i) => (
                <div key={i} className="data-grid-cell aspect-square"
                    style={{
                        background: val === 0 ? 'rgba(34,197,94,0.04)' :
                            `rgba(34,197,94,${Math.min(0.15 + (val / Math.max(...data)) * 0.7, 0.85)})`,
                        minWidth: 8,
                    }}
                    title={`${val} bookings`}
                />
            ))}
        </div>
    );
};

/* ── Stat Card ── */
export const StatCard = ({ label, value, sub, gradient, icon, delay = 0, dark, accentColor, theme }) => {
    const color = accentColor || '#3B82F6';
    const glowClass = theme === 'green' ? 'glow-card-green' : 'glow-card';
    return (
        <div
            className={`stat-card ${glowClass} animate-fadeInUp`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}12`, border: `1px solid ${color}18` }}
                >
                    <Icon path={icon} className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black" style={{ color, textShadow: `0 0 20px ${color}20` }}>{value}</div>
                </div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>{label}</div>
            <div className="text-xs mt-1" style={{ color: '#475569' }}>{sub}</div>
            {/* Bottom accent */}
            <div className="absolute bottom-0 left-8 right-8 h-[1px]"
                style={{ background: `linear-gradient(90deg, transparent, ${color}20, transparent)` }} />
        </div>
    );
};
