import React, { useState, useEffect } from 'react';
import { Icon } from './Shared';

const ReminderModal = (props) => {
  const {
    isOpen,
    onClose,
    onSave,
    ICONS,
    bookingId,
    vehicleNumber,
  } = props;

  const [reminderData, setReminderData] = useState({
    title: '',
    date: '',
    note: '',
    enabled: true, // Toggle switch state
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setReminderData({
        title: `Service reminder for ${vehicleNumber}`,
        date: tomorrow.toISOString().split('T')[0],
        note: '',
        enabled: true,
      });
      setError('');
    }
  }, [isOpen, vehicleNumber]);

  const handleChange = (field, value) => {
    setReminderData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleToggle = () => {
    setReminderData(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleSave = async () => {
    // If switch is OFF, just close without saving
    if (!reminderData.enabled) {
      onClose();
      return;
    }

    // Validate only if enabled
    if (!reminderData.title.trim()) {
      setError('Please enter a reminder title');
      return;
    }
    if (!reminderData.date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: reminderData.title,
        date: reminderData.date,
        note: reminderData.note,
        bookingId,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <Icon path={ICONS.bell} className="w-5 h-5" style={{ color: '#FBBF24' }} />
            </div>
            <h2 className="text-lg font-bold text-white">Set Reminder</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icon path={ICONS.x} className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <div>
              <h3 className="text-sm font-semibold text-white">Enable Reminder</h3>
              <p className="text-xs mt-1" style={{ color: '#6B7A90' }}>
                {reminderData.enabled ? 'Reminder will be saved' : 'Reminder will NOT be saved'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              className="relative w-12 h-6 rounded-full transition-colors focus:outline-none"
              style={{
                background: reminderData.enabled ? '#22C55E' : '#4B5563',
              }}
            >
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{
                  transform: reminderData.enabled ? 'translateX(24px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {/* Disabled State Message */}
          {!reminderData.enabled && (
            <div className="p-3 rounded-xl flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <Icon path={ICONS.info} className="w-4 h-4 mt-0.5" style={{ color: '#F87171', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: '#F87171' }}>
                The switch is OFF. Click Save to close without creating a reminder.
              </p>
            </div>
          )}

          {/* Form Fields (Hidden when disabled) */}
          {reminderData.enabled && (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-2">Reminder Title</label>
                <input
                  type="text"
                  value={reminderData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Service for vehicle"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-gray-800 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-2">Reminder Date</label>
                <input
                  type="date"
                  value={reminderData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-gray-800 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-2">Additional Note (Optional)</label>
                <textarea
                  value={reminderData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  placeholder="Add any notes about this reminder..."
                  rows="3"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-gray-800 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <Icon path={ICONS.info} className="w-4 h-4 mt-0.5" style={{ color: '#F87171', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: '#1F2937',
              color: '#E5E7EB',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: reminderData.enabled && !error ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'rgba(251,191,36,0.5)',
              color: '#111827',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <Icon path={ICONS.clock} className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : reminderData.enabled ? 'Save Reminder' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
