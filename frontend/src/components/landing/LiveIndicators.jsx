import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, BookOpen, FileText, Users } from 'lucide-react';

function IndicatorTile({ icon: Icon, color, value, label, sub, to, loading }) {
  const navigate = useNavigate();
  return (
    <div
      className="glass-panel"
      onClick={() => to && navigate(to)}
      role={to ? 'button' : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={e => { if (to && (e.key === 'Enter' || e.key === ' ')) navigate(to); }}
      style={{
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        cursor: to ? 'pointer' : 'default', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={e => {
        if (to) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 12px 28px -12px ${color}66, 0 8px 32px rgba(0,0,0,0.04)`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '11px',
        background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}30`,
      }}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.03em',
          lineHeight: 1, color: loading ? 'var(--border-color)' : 'var(--text-primary)', marginBottom: '0.4rem',
        }}>
          {loading ? '—' : value}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{loading ? ' ' : sub}</div>}
      </div>
    </div>
  );
}

const LiveIndicators = ({ data, loading }) => {
  const facilities = data?.facilities || {};
  const team = data?.team || {};

  return (
    <div className="landing-section-grid">
      <IndicatorTile
        icon={Building2} color="#3b82f6"
        value={facilities.active} label="Active Facilities"
        sub={`out of ${facilities.total ?? '—'} tracked`}
        to="/facilities" loading={loading}
      />
      <IndicatorTile
        icon={BookOpen} color="#14b8a6"
        value={data?.flowManuals} label="Flow Manuals"
        sub="published data flows"
        to="/flows" loading={loading}
      />
      <IndicatorTile
        icon={FileText} color="#6366f1"
        value={data?.publishedDocs} label="Published SOPs"
        sub="documentation library"
        to="/documentation" loading={loading}
      />
      <IndicatorTile
        icon={Users} color="#22c55e"
        value={`${team.online ?? '—'} / ${team.total ?? '—'}`} label="Team Online"
        sub="currently available"
        loading={loading}
      />
    </div>
  );
};

export default LiveIndicators;
