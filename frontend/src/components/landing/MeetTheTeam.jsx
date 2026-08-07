import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';

function PersonPhoto({ member }) {
  const [errored, setErrored] = useState(false);
  const initial = (member.displayName || '?').charAt(0).toUpperCase();

  if (member.hasPhoto && !errored) {
    return (
      <img
        src={`${API_BASE_URL}/users/${member.id}/photo`}
        alt={member.displayName}
        onError={() => setErrored(true)}
        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
      color: '#fff', fontWeight: 700, fontSize: '1.5rem',
    }}>
      {initial}
    </div>
  );
}

const MeetTheTeam = ({ members, loading }) => {
  if (loading) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Loading team…
      </div>
    );
  }

  if (!members?.length) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No team members published yet.
      </div>
    );
  }

  return (
    <div className="landing-team-people-grid">
      {members.map(m => (
        <div key={m.id} className="hub-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.125rem' }}>
          <PersonPhoto member={m} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.displayName}
            </div>
            {m.title && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {m.title}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetTheTeam;
