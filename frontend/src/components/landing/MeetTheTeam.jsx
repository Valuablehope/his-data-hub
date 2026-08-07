import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';

// Matches the color mapping already used internally on the Dashboard / Availability Board.
const STATUS_COLORS = {
  Online: '#16a34a',
  'In Field': '#2563eb',
  'On Leave': '#d97706',
  Busy: '#dc2626',
  Offline: '#94a3b8',
};

// Fixed size at every tier — this is a functional presence indicator, not a
// hierarchy cue, so it should look the same everywhere rather than scaling
// with photo size (which reads as inconsistent rather than intentional).
const STATUS_DOT_SIZE = 15;

function StatusDot({ status }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.Offline;
  return (
    <span
      title={status || 'Offline'}
      style={{
        position: 'absolute', bottom: 0, right: 0,
        width: STATUS_DOT_SIZE, height: STATUS_DOT_SIZE, borderRadius: '50%',
        background: color, border: '2.5px solid #fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}
    />
  );
}

function PersonPhoto({ member, size, accent }) {
  const [errored, setErrored] = useState(false);
  const initial = (member.displayName || '?').charAt(0).toUpperCase();
  const ringStyle = {
    width: size, height: size, borderRadius: '50%',
    boxShadow: `0 0 0 3px #fff, 0 0 0 5px ${accent}4d, 0 8px 20px rgba(0,0,0,0.08)`,
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {member.hasPhoto && !errored ? (
        <img
          src={`${API_BASE_URL}/users/${member.id}/photo`}
          alt={member.displayName}
          onError={() => setErrored(true)}
          style={{ ...ringStyle, objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          ...ringStyle,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
          color: '#fff', fontWeight: 700, fontSize: size * 0.38,
        }}>
          {initial}
        </div>
      )}
      <StatusDot status={member.status} />
    </div>
  );
}

function TitleBadge({ title, accent }) {
  if (!title) return null;
  return (
    <span style={{
      display: 'inline-block', padding: '0.25rem 0.75rem',
      borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
      background: `${accent}15`, color: accent, border: `1px solid ${accent}30`,
      whiteSpace: 'nowrap',
    }}>
      {title}
    </span>
  );
}

// Lower number = more senior. Same person-item shape at every tier — only the
// scale (photo size, name size) steps down — rendered inside ONE shared panel
// (not one floating card per tier) so the whole roster reads as a single team.
const TIER_CONFIG = {
  1: { label: 'Leadership', accent: '#E3000F', photoSize: 96, nameSize: '1.05rem' },
  2: { label: 'Coordinators', accent: '#0d9488', photoSize: 76, nameSize: '0.95rem' },
  3: { label: 'Team Members', accent: '#64748b', photoSize: 60, nameSize: '0.875rem' },
};
const TIER_ORDER = [1, 2, 3];

function PersonItem({ member, config }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: '0.65rem', width: '150px',
    }}>
      <PersonPhoto member={member} size={config.photoSize} accent={config.accent} />
      <div style={{ fontSize: config.nameSize, fontWeight: 700, color: 'var(--text-primary)' }}>
        {member.displayName}
      </div>
      <TitleBadge title={member.title} accent={config.accent} />
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

  const tiers = TIER_ORDER
    .map(tier => ({ tier, config: TIER_CONFIG[tier], people: members.filter(m => (m.tier || 3) === tier) }))
    .filter(t => t.people.length > 0);

  return (
    <div className="hub-panel" style={{ padding: '2.5rem' }}>
      {tiers.map(({ tier, config, people }, i) => (
        <div
          key={tier}
          style={{
            paddingTop: i > 0 ? '2rem' : 0,
            marginTop: i > 0 ? '2rem' : 0,
            borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.accent, flexShrink: 0 }} />
            <span className="hub-eyebrow" style={{ color: 'var(--text-secondary)' }}>{config.label}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            {people.map(m => <PersonItem key={m.id} member={m} config={config} />)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetTheTeam;
