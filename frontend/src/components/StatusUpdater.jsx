import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { Edit3, Check, X } from 'lucide-react';

const StatusUpdater = () => {
    const { user, token, logout } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState('Online');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchMyStatus = async () => {
            try {
                const res = await fetchApi(`${API_BASE_URL}/availability`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const me = data.find(m => m.Username === user.username);
                    if (me) {
                        setStatus(me.Status);
                        setNotes(me.Notes);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch initial status', err);
            }
        };

        if (user) {
            fetchMyStatus();
        }

        const handleUpdate = () => fetchMyStatus();
        window.addEventListener('availabilityUpdated', handleUpdate);
        return () => window.removeEventListener('availabilityUpdated', handleUpdate);
    }, [user, token]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetchApi(`${API_BASE_URL}/availability`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, notes })
            });
            if (res.ok) {
                setIsEditing(false);
                window.dispatchEvent(new Event('availabilityUpdated'));
            } else if (res.status === 401 || res.status === 403) {
                logout();
            }
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    if (isEditing) {
        return (
            <div style={{
                position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem',
                background: '#fff', borderRadius: '12px', padding: '1rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid var(--border)',
                width: '260px', zIndex: 100
            }}>
                <div style={{ fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Update Status</div>
                
                <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    style={{
                        width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)',
                        marginBottom: '0.75rem', fontSize: '0.875rem', outline: 'none'
                    }}
                >
                    <option value="Online">Online</option>
                    <option value="In Field">In Field</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Busy">Busy</option>
                </select>

                <input 
                    type="text" 
                    placeholder="Location / Notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{
                        width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)',
                        marginBottom: '1rem', fontSize: '0.875rem', outline: 'none'
                    }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={() => setIsEditing(false)}
                        style={{
                            padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)',
                            background: '#fff', cursor: 'pointer', fontSize: '0.8125rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}
                    >
                        <X size={14} /> Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '0.375rem 0.75rem', borderRadius: '6px', border: 'none',
                            background: 'var(--primary-red)', color: '#fff', cursor: 'pointer', fontSize: '0.8125rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}
                    >
                        <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (s) => {
        switch (s) {
            case 'Online': return 'var(--green-500)';
            case 'In Field': return 'var(--blue-500)';
            case 'On Leave': return 'var(--amber-500)';
            case 'Busy': return 'var(--red-500)';
            default: return 'var(--slate-400)';
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsEditing(true)}
                title="Update Availability"
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.375rem 0.75rem', borderRadius: '100px',
                    border: `1px solid ${getStatusColor(status)}`,
                    background: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                    color: 'var(--slate-700)', fontSize: '0.8125rem', fontWeight: '500'
                }}
            >
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: getStatusColor(status),
                    boxShadow: status === 'Online' ? 'none' : `0 0 4px ${getStatusColor(status)}`,
                    animation: status === 'Online' ? 'pulse-online 2s infinite' : 'none'
                }} />
                {status}
            </button>
        </div>
    );
};

export default StatusUpdater;
