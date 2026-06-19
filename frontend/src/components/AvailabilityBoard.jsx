import React, { useState, useEffect } from 'react';
import { API_BASE_URL, fetchApi } from '../config';

/* Status → hex color (used for top border, dot, avatar ring) */
const STATUS_HEX = {
    'Online':   '#16a34a',
    'In Field': '#2563eb',
    'On Leave': '#d97706',
    'Busy':     '#dc2626',
};
const getStatusHex = s => STATUS_HEX[s] || '#94a3b8';

/* Consistent avatar color derived from the person's name initial */
const AVATAR_PALETTE = [
    { bg: '#dbeafe', color: '#1e40af' }, // blue
    { bg: '#d1fae5', color: '#065f46' }, // emerald
    { bg: '#fef3c7', color: '#92400e' }, // amber
    { bg: '#ffe4e6', color: '#9f1239' }, // rose
    { bg: '#ede9fe', color: '#5b21b6' }, // violet
    { bg: '#ffedd5', color: '#9a3412' }, // orange
    { bg: '#e0f2fe', color: '#0c4a6e' }, // sky
    { bg: '#f1f5f9', color: '#334155' }, // slate
];
const getAvatarStyle = name =>
    AVATAR_PALETTE[(name || 'U').toUpperCase().charCodeAt(0) % AVATAR_PALETTE.length];

const AvailabilityBoard = () => {
    const [team, setTeam]       = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAvailability = async () => {
        try {
            const res = await fetchApi(`${API_BASE_URL}/availability`);
            if (res.ok) setTeam(await res.json());
        } catch (err) {
            console.error('Error fetching availability:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
        const interval = setInterval(fetchAvailability, 30000);
        const handleUpdate = () => fetchAvailability();
        window.addEventListener('availabilityUpdated', handleUpdate);
        return () => {
            clearInterval(interval);
            window.removeEventListener('availabilityUpdated', handleUpdate);
        };
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Loading…
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '0.75rem',
            }}>
                {team.map(member => {
                    const displayName = member.DisplayName
                        || member.Username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const initial    = displayName.charAt(0).toUpperCase();
                    const statusHex  = getStatusHex(member.Status);
                    const avatar     = getAvatarStyle(displayName);
                    const time       = new Date(member.UpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div
                            key={member.Id}
                            style={{
                                background: '#fff',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                borderTop: `3px solid ${statusHex}`,
                                padding: '1rem 1.125rem 0.875rem',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                transition: 'box-shadow 0.18s, transform 0.18s',
                                cursor: 'default',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.09)`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                            }}
                        >
                            {/* Avatar + name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                                    background: avatar.bg, color: avatar.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.0625rem', fontWeight: 700,
                                    boxShadow: `0 0 0 3px ${statusHex}28`,
                                }}>
                                    {initial}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: 700, fontSize: '0.875rem',
                                        color: 'var(--text-primary)', letterSpacing: '-0.01em',
                                        lineHeight: 1.25, whiteSpace: 'nowrap',
                                    }}>
                                        {displayName}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                                        <div style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            background: statusHex, flexShrink: 0,
                                        }} />
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 600,
                                            color: statusHex, letterSpacing: '0.01em',
                                        }}>
                                            {member.Status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {member.Notes ? (
                                <div style={{
                                    marginTop: '0.75rem',
                                    paddingTop: '0.65rem',
                                    borderTop: '1px solid var(--border-color)',
                                    fontSize: '0.775rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.45,
                                }}>
                                    {member.Notes}
                                </div>
                            ) : null}

                            {/* Updated time */}
                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '0.625rem',
                                fontSize: '0.68rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                            }}>
                                {time}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AvailabilityBoard;
