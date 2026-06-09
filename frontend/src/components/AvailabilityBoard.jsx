import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Briefcase, Coffee, PhoneCall, Check } from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';

const AvailabilityBoard = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAvailability = async () => {
        try {
            const res = await fetchApi(`${API_BASE_URL}/availability`);
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } catch (err) {
            console.error('Error fetching availability:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
        const interval = setInterval(fetchAvailability, 30000); // Poll every 30s
        
        const handleUpdate = () => fetchAvailability();
        window.addEventListener('availabilityUpdated', handleUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('availabilityUpdated', handleUpdate);
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Online': return 'var(--green-500)';
            case 'In Field': return 'var(--blue-500)';
            case 'On Leave': return 'var(--amber-500)';
            case 'Busy': return 'var(--red-500)';
            default: return 'var(--slate-400)';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'Online': return 'rgba(34, 197, 94, 0.1)';
            case 'In Field': return 'rgba(59, 130, 246, 0.1)';
            case 'On Leave': return 'rgba(245, 158, 11, 0.1)';
            case 'Busy': return 'rgba(239, 68, 68, 0.1)';
            default: return 'rgba(148, 163, 184, 0.1)';
        }
    };

    const renderStatusIndicator = (status) => {
        if (status === 'Online') {
            return (
                <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: 'var(--green-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Check size={8} color="#fff" strokeWidth={4} />
                </div>
            );
        } else if (status === 'In Field') {
            return <Briefcase size={12} color="var(--blue-500)" />;
        } else if (status === 'On Leave') {
            return <Coffee size={12} color="var(--amber-500)" />;
        } else if (status === 'Busy') {
            return <PhoneCall size={12} color="var(--red-500)" />;
        }
        return <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'var(--slate-400)'}}/>;
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>Loading team availability...</div>;
    }

    return (
        <div style={{ marginTop: '2rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
                }}>
                    <Users size={18} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--slate-800)', letterSpacing: '-0.01em', margin: 0 }}>
                    Team Availability
                </h3>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.25rem'
            }}>
                {team.map((member) => (
                    <div key={member.Id} style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        border: '1px solid rgba(0,0,0,0.04)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        gap: '1.25rem',
                        alignItems: 'flex-start',
                        cursor: 'default'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
                    }}
                    >
                        {/* Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--slate-100), var(--slate-200))',
                                color: 'var(--slate-700)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', fontWeight: 'bold', border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                {(member.DisplayName || member.Username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px',
                                borderRadius: '50%', background: getStatusColor(member.Status), border: '2px solid #fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {member.Status === 'Online' && <Check size={10} color="#fff" strokeWidth={4} />}
                            </div>
                        </div>
                    
                        {/* Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ 
                                    fontWeight: '600', fontSize: '1rem', color: 'var(--slate-800)', 
                                    letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                                }}>
                                    {member.DisplayName || member.Username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.25rem 0.625rem', borderRadius: '100px',
                                    background: getStatusBg(member.Status),
                                    color: getStatusColor(member.Status),
                                    fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                                    flexShrink: 0
                                }}>
                                    {renderStatusIndicator(member.Status)}
                                    {member.Status}
                                </div>
                            </div>
                    
                            {member.Notes ? (
                                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'flex-start', color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: '1.4' }}>
                                    <MapPin size={14} style={{ marginTop: '0.125rem', flexShrink: 0, color: 'var(--slate-400)' }} />
                                    <span style={{ wordBreak: 'break-word' }}>{member.Notes}</span>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', fontStyle: 'italic', marginTop: '0.75rem' }}>
                                    No active notes
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1rem', color: 'var(--slate-400)', fontSize: '0.75rem', fontWeight: '500' }}>
                                <Clock size={12} />
                                <span>Updated: {new Date(member.UpdatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailabilityBoard;
