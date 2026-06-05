import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CalendarClock, Save, Check } from 'lucide-react';

const DAYS = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 0, name: 'Sunday' }
];

const ScheduleAvailabilityModal = ({ isOpen, onClose, token }) => {
    const [schedule, setSchedule] = useState(
        DAYS.map(d => ({
            dayOfWeek: d.id,
            name: d.name,
            isAvailable: d.id >= 1 && d.id <= 5, // Mon-Fri default true
            startTime: '09:00',
            endTime: '17:00'
        }))
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSchedule();
        }
    }, [isOpen]);

    const formatTime = (timeStr) => {
        if (!timeStr) return '09:00';
        try {
            // TIME columns often come back as UTC dates like 1970-01-01T09:00:00.000Z
            const d = new Date(timeStr);
            if (!isNaN(d.getTime())) {
                return d.toISOString().substring(11, 16); // Extract HH:mm
            }
            return timeStr.substring(0, 5); // Fallback if it's just a string "09:00:00"
        } catch (e) {
            return '09:00';
        }
    };

    const fetchSchedule = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/availability/schedule', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setSchedule(prev => prev.map(day => {
                        const saved = data.find(d => d.DayOfWeek === day.dayOfWeek);
                        if (saved) {
                            return {
                                ...day,
                                isAvailable: saved.IsAvailable,
                                startTime: formatTime(saved.StartTime),
                                endTime: formatTime(saved.EndTime)
                            };
                        }
                        return day;
                    }));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/availability/schedule', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ schedule })
            });
            if (res.ok) {
                window.dispatchEvent(new Event('availabilityUpdated'));
                onClose();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateDay = (dayOfWeek, field, value) => {
        setSchedule(prev => prev.map(d => 
            d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
        ));
    };

    if (!isOpen) return null;

    const modalContent = (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: '#fff', width: '100%', maxWidth: '540px', borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
                maxHeight: '90vh', overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <CalendarClock size={20} color="var(--teal-600)" />
                        Weekly Working Hours
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--slate-400)', padding: '0.25rem', borderRadius: '4px'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Set your standard weekly schedule. Outside of these hours, the dashboard will automatically show you as <strong>Offline</strong>.
                    </p>

                    <form id="schedule-form" onSubmit={handleSave}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {schedule.map(day => (
                                <div key={day.dayOfWeek} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.75rem', borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: day.isAvailable ? '#fff' : 'rgba(0,0,0,0.02)'
                                }}>
                                    {/* Toggle */}
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '110px', gap: '0.5rem' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={day.isAvailable}
                                            onChange={e => updateDay(day.dayOfWeek, 'isAvailable', e.target.checked)}
                                            style={{
                                                appearance: 'none', width: '36px', height: '20px', borderRadius: '100px',
                                                background: day.isAvailable ? 'var(--green-500)' : 'var(--slate-300)',
                                                position: 'relative', outline: 'none', transition: '0.3s', cursor: 'pointer'
                                            }}
                                            className="toggle-checkbox"
                                        />
                                        <span style={{ 
                                            fontSize: '0.875rem', fontWeight: '500', 
                                            color: day.isAvailable ? 'var(--slate-800)' : 'var(--slate-500)' 
                                        }}>
                                            {day.name}
                                        </span>
                                    </label>

                                    {/* Time Inputs */}
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: day.isAvailable ? 1 : 0.4, pointerEvents: day.isAvailable ? 'auto' : 'none' }}>
                                        <input 
                                            type="time" 
                                            value={day.startTime}
                                            onChange={e => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                                            style={{
                                                padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)',
                                                fontSize: '0.875rem', outline: 'none', color: 'var(--slate-700)', flex: 1
                                            }}
                                        />
                                        <span style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>to</span>
                                        <input 
                                            type="time" 
                                            value={day.endTime}
                                            onChange={e => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                                            style={{
                                                padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)',
                                                fontSize: '0.875rem', outline: 'none', color: 'var(--slate-700)', flex: 1
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
                
                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: 'var(--surface-color)' }}>
                    <button type="button" onClick={onClose} style={{
                        padding: '0.625rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)',
                        background: 'transparent', color: 'var(--slate-600)', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer'
                    }}>
                        Cancel
                    </button>
                    <button type="submit" form="schedule-form" disabled={loading} style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none',
                        background: 'var(--teal-600)', color: '#fff', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer'
                    }}>
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </div>

            {/* Injected CSS for toggle thumb */}
            <style dangerouslySetInnerHTML={{__html: `
                .toggle-checkbox::after {
                    content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
                    background: #fff; border-radius: 50%; transition: 0.3s;
                }
                .toggle-checkbox:checked::after {
                    transform: translateX(16px);
                }
            `}} />
        </div>
    );

    // Render into body to escape the backdrop-filter stacking context of the navbar
    return ReactDOM.createPortal(modalContent, document.body);
};

export default ScheduleAvailabilityModal;
