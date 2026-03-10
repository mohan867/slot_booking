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

export const StatCard = ({ label, value, sub, gradient, icon, delay = 0, dark, accentColor }) => {
    const color = accentColor || '#22C55E';
    return (
        <div
            className="stat-card animate-fadeInUp"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Top accent line */}
            <div
                className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
                style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.5 }}
            />
            <div className="flex items-center justify-between mb-4">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                    <Icon path={icon} className="w-5 h-5" style={{ color }} />
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black" style={{ color }}>{value}</div>
                </div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7A90' }}>{label}</div>
            <div className="text-xs mt-1" style={{ color: '#3D4A5C' }}>{sub}</div>
        </div>
    );
};
