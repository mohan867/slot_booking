import React, { useState } from 'react';
import { Icon } from './Shared';

const STAR_PATH = "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.973 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.973-2.888a1 1 0 00-1.175 0l-3.973 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.973-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.674z";

const StarRating = ({ rating, onRate, hoverRating, onHover, onLeave, size = "w-7 h-7", interactive = false }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating);
                return (
                    <button
                        type="button"
                        key={star}
                        className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                        onMouseEnter={() => interactive && onHover && onHover(star)}
                        onMouseLeave={() => interactive && onLeave && onLeave()}
                        onClick={() => interactive && onRate && onRate(star)}
                        disabled={!interactive}
                    >
                        <svg className={size} viewBox="0 0 24 24"
                            style={{
                                fill: filled ? '#FBBF24' : 'none',
                                stroke: filled ? '#FBBF24' : '#3D4A5C',
                                strokeWidth: 1.5,
                                filter: filled ? 'drop-shadow(0 0 4px rgba(251,191,36,0.35))' : 'none',
                            }}>
                            <path d={STAR_PATH} />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

const FeedbackTab = (props) => {
    const { dark, textPrimary, textSecondary, ICONS, cardClass, activeTab, userData } = props;
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const [feedbacks, setFeedbacks] = useState([
        {
            id: 1,
            customerName: "Alex Morgan",
            rating: 5,
            comment: "Exceptional service quality! The mechanics were thorough, professional, and finished ahead of schedule. Highly recommend RMK Garage.",
            serviceDate: "2025-12-15",
            avatar: "A",
        },
        {
            id: 2,
            customerName: "Priya Sharma",
            rating: 4,
            comment: "Great experience overall. The doorstep pickup was convenient. Minor delay in delivery but the communication was transparent throughout.",
            serviceDate: "2025-11-28",
            avatar: "P",
        },
        {
            id: 3,
            customerName: "Raj Patel",
            rating: 5,
            comment: "Best garage in town. Fair pricing, quality work, and the booking system is super convenient. Will definitely return!",
            serviceDate: "2025-10-10",
            avatar: "R",
        }
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;

        const newFeedback = {
            id: feedbacks.length + 1,
            customerName: userData?.name || "User",
            rating: rating,
            comment: comment || "No comments provided.",
            serviceDate: new Date().toISOString().split("T")[0],
            avatar: (userData?.name || "U")[0].toUpperCase(),
        };

        setFeedbacks([newFeedback, ...feedbacks]);
        setRating(0);
        setComment('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    return (
        <>
            {activeTab === "feedback" && (
                <div className="space-y-6 page-transition">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Feedback & Reviews</h2>
                            <p className="text-sm" style={{ color: '#6B7A90' }}>Share your experience with RMK Garage</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            <Icon path={ICONS.star} className="w-5 h-5" style={{ color: '#FBBF24' }} />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl p-4"
                            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                            <div className="text-xs font-medium mb-2" style={{ color: '#6B7A90' }}>Average Rating</div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black" style={{ color: '#FBBF24' }}>{avgRating}</span>
                                <StarRating rating={Math.round(avgRating)} size="w-4 h-4" />
                            </div>
                        </div>
                        <div className="rounded-xl p-4"
                            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                            <div className="text-xs font-medium mb-2" style={{ color: '#6B7A90' }}>Total Reviews</div>
                            <div className="text-2xl font-black" style={{ color: '#22C55E' }}>{feedbacks.length}</div>
                        </div>
                        <div className="rounded-xl p-4"
                            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                            <div className="text-xs font-medium mb-2" style={{ color: '#6B7A90' }}>5-Star Reviews</div>
                            <div className="text-2xl font-black" style={{ color: '#4ADE80' }}>
                                {feedbacks.filter(f => f.rating === 5).length}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Feedback Form - left panel */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl overflow-hidden"
                                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                                {/* Form Header */}
                                <div className="p-5 pb-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                            <Icon path={ICONS.book} className="w-4 h-4 text-green-400" />
                                        </div>
                                        <h3 className="font-semibold text-sm text-white">Write a Review</h3>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                                    {/* Star Rating */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7A90' }}>
                                            Your Rating
                                        </label>
                                        <div className="p-4 rounded-xl text-center"
                                            style={{ background: '#0F1520', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <StarRating
                                                rating={rating}
                                                hoverRating={hoverRating}
                                                onRate={setRating}
                                                onHover={setHoverRating}
                                                onLeave={() => setHoverRating(0)}
                                                size="w-9 h-9"
                                                interactive={true}
                                            />
                                            <p className="text-xs mt-2" style={{ color: '#6B7A90' }}>
                                                {rating === 0 ? "Click to rate" :
                                                    rating === 1 ? "Poor" :
                                                        rating === 2 ? "Fair" :
                                                            rating === 3 ? "Good" :
                                                                rating === 4 ? "Very Good" : "Excellent!"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7A90' }}>
                                            Your Feedback
                                        </label>
                                        <textarea
                                            className="w-full rounded-xl p-3.5 text-sm transition-all focus:outline-none resize-none"
                                            style={{
                                                background: '#0F1520',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                color: '#E8ECF4',
                                                minHeight: '100px',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                                            placeholder="Share your experience with us..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>

                                    {/* Success Message */}
                                    {submitted && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl animate-fadeIn"
                                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                            <Icon path={ICONS.check} className="w-4 h-4 text-green-400" />
                                            <span className="text-xs font-semibold text-green-400">Thank you! Your review has been submitted.</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2"
                                        disabled={rating === 0}
                                        style={{ opacity: rating === 0 ? 0.4 : 1 }}
                                    >
                                        <Icon path={ICONS.check} className="w-4 h-4" />
                                        Submit Review
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Reviews List - right panel */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm text-white">Recent Reviews</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    {feedbacks.length} reviews
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                {feedbacks.map((fb) => (
                                    <div key={fb.id} className="rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                                        style={{
                                            background: '#111827',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                                        }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                                    style={{ background: 'linear-gradient(135deg, #166534, #22C55E)' }}>
                                                    {fb.avatar}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-white">{fb.customerName}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs" style={{ color: '#3D4A5C' }}>{fb.serviceDate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <StarRating rating={fb.rating} size="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: '#9CA3B4' }}>
                                            "{fb.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackTab;
