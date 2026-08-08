import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, BookOpen, FileText, Users } from 'lucide-react';

function StatusReadout({ icon: Icon, color, value, label, sub, to, loading, isLast }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      role={to ? 'button' : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={e => { if (to && (e.key === 'Enter' || e.key === ' ')) navigate(to); }}
      style={{
        flex: '1 1 200px',
        minWidth: '180px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        cursor: to ? 'pointer' : 'default',
        borderRight: isLast ? 'none' : '1px solid var(--border-color)',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { if (to) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}30`,
      }}>
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em',
          lineHeight: 1, color: loading ? 'var(--border-color)' : 'var(--text-primary)',
        }}>
          {loading ? '—' : value}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontFamily: 'var(--font-mono)' }}>{loading ? ' ' : sub}</div>}
      </div>
    </div>
  );
}

const LiveIndicators = ({ data, loading }) => {
  const facilities = data?.facilities || {};
  const team = data?.team || {};

  return (
    <div className="hub-panel" style={{ display: 'flex', flexWrap: 'wrap' }}>
      <StatusReadout
        icon={Building2} color="#3b82f6"
        value={facilities.active} label="Active Facilities"
        sub={`/ ${facilities.total ?? '—'} tracked`}
        to="/facilities" loading={loading}
      />
      <StatusReadout
        icon={BookOpen} color="#DF0A20"
        value={data?.flowManuals} label="Flow Manuals"
        sub="published"
        to="/flow-manuals" loading={loading}
      />
      <StatusReadout
        icon={FileText} color="#A10717"
        value={data?.publishedDocs} label="Published SOPs"
        sub="in library"
        to="/sops" loading={loading}
      />
      <StatusReadout
        icon={Users} color="#22c55e"
        value={`${team.online ?? '—'} / ${team.total ?? '—'}`} label="Team Online"
        sub="right now"
        loading={loading}
        isLast
      />
    </div>
  );
};

export default LiveIndicators;
