import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, Shield, ChevronDown, Check, Calendar } from 'lucide-react';
import ScheduleAvailabilityModal from './ScheduleAvailabilityModal';

const UserMenu = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [status, setStatus] = useState('Online');
    const [notes, setNotes] = useState('');
    const [tempNotes, setTempNotes] = useState('');
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch initial status
    useEffect(() => {
        const fetchMyStatus = async () => {
            try {
                const res = await fetchApi(`${API_BASE_URL}/availability`);
                if (res.ok) {
                    const data = await res.json();
                    const me = data.find(m => m.Username === user.username);
                    if (me) {
                        setStatus(me.Status);
                        setNotes(me.Notes);
                        setTempNotes(me.Notes || '');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch initial status', err);
            }
        };
        if (user) fetchMyStatus();
        
        const handleUpdate = () => fetchMyStatus();
        window.addEventListener('availabilityUpdated', handleUpdate);
        return () => window.removeEventListener('availabilityUpdated', handleUpdate);
    }, [user]);

    const handleSaveStatus = async (newStatus, newNotes = tempNotes) => {
        setStatus(newStatus);
        setNotes(newNotes);
        try {
            const res = await fetchApi(`${API_BASE_URL}/availability`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, notes: newNotes })
            });
            if (res.ok) {
                window.dispatchEvent(new Event('availabilityUpdated'));
            } else if (res.status === 401 || res.status === 403) {
                logout();
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'Online': return 'var(--green-500)';
            case 'In Field': return 'var(--blue-500)';
            case 'On Leave': return 'var(--amber-500)';
            case 'Busy': return 'var(--red-500)';
            default: return 'var(--slate-400)';
        }
    };

    if (!user) return null;

    const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '0.25rem 0.5rem', borderRadius: '100px', transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', fontWeight: 'bold', border: '2px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {initial}
                    </div>
                    {/* Status Dot on Avatar */}
                    <div style={{
                        position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px',
                        borderRadius: '50%', background: getStatusColor(status), border: '2px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {status === 'Online' && <Check size={8} color="#fff" strokeWidth={4} />}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingRight: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-800)' }}>
                        {user.username}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', lineHeight: '1' }}>
                        {status}
                    </span>
                </div>
                <ChevronDown size={14} color="var(--slate-500)" style={{ marginLeft: '0.125rem' }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem',
                    background: '#fff', borderRadius: '12px', padding: '0.5rem 0',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid var(--border-color)',
                    width: '240px', zIndex: 100
                }}>
                    {/* User Info Header */}
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9375rem', color: 'var(--slate-800)' }}>{user.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Shield size={12} /> {user.role}
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div style={{ padding: '0.5rem 1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--slate-400)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Set Status</div>
                        {['Online', 'In Field', 'On Leave', 'Busy'].map(s => (
                            <button
                                key={s}
                                onClick={() => handleSaveStatus(s)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                                    padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer',
                                    borderRadius: '6px', textAlign: 'left',
                                    backgroundColor: status === s ? 'rgba(0,0,0,0.03)' : 'transparent'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = status === s ? 'rgba(0,0,0,0.03)' : 'transparent'}
                            >
                                <div style={{ 
                                    width: '12px', height: '12px', borderRadius: '50%', 
                                    background: getStatusColor(s),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {s === 'Online' && <Check size={8} color="#fff" strokeWidth={4} />}
                                </div>
                                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--slate-700)', fontWeight: status === s ? '600' : '400' }}>{s}</span>
                                {status === s && <Check size={14} color="var(--slate-700)" />}
                            </button>
                        ))}
                    </div>

                    {/* Status Message */}
                    <div style={{ padding: '0 1rem 0.5rem' }}>
                        <input 
                            type="text" 
                            placeholder="What's your status?"
                            value={tempNotes}
                            onChange={e => setTempNotes(e.target.value)}
                            onBlur={() => handleSaveStatus(status, tempNotes)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveStatus(status, tempNotes); } }}
                            style={{
                                width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)',
                                fontSize: '0.8125rem', outline: 'none', color: 'var(--slate-700)',
                                backgroundColor: 'rgba(0,0,0,0.02)', transition: 'all 0.2s'
                            }}
                            onFocus={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = 'var(--teal-500)'; }}
                        />
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

                    {/* Schedule Availability */}
                    <button 
                        onClick={() => { setIsOpen(false); setIsScheduleModalOpen(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', width: '100%',
                            color: 'var(--slate-700)', background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <Calendar size={16} /> Schedule Availability
                    </button>

                    {/* Admin Panel */}
                    {user.role === 'admin' && (
                        <NavLink 
                            to="/users" 
                            onClick={() => setIsOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                                color: 'var(--slate-700)', textDecoration: 'none', fontSize: '0.875rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <UserCircle size={16} /> Admin Panel
                        </NavLink>
                    )}

                    {/* Logout */}
                    <button 
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', width: '100%',
                            color: 'var(--red-600)', background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            )}

            <ScheduleAvailabilityModal 
                isOpen={isScheduleModalOpen} 
                onClose={() => setIsScheduleModalOpen(false)} 
                token={token} 
            />
        </div>
    );
};

export default UserMenu;
