import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AvailabilityBoard from '../components/AvailabilityBoard';
import { API_BASE_URL, fetchApi } from '../config';

/* ─── Section label ──────────────────────────────────────────── */
function SectionLabel({ label, to, linkText = 'View all' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '4px', height: '16px', background: 'var(--primary-red)', borderRadius: '4px', flexShrink: 0, boxShadow: '0 0 10px var(--primary-red-glow)' }} />
        <span style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
        }}>
          {label}
        </span>
      </div>
      {to && (
        <Link to={to} style={{
          fontSize: '13px', fontWeight: 600, color: 'var(--teal-500)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          transition: 'color 0.2s, text-shadow 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal-400)'; e.currentTarget.style.textShadow = '0 0 8px rgba(20, 184, 166, 0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--teal-500)'; e.currentTarget.style.textShadow = 'none'; }}
        >
          {linkText} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* ─── Stat cell (inside the overview strip) ─────────────────── */
function StatCell({ dotColor, value, label, sub, to, loading, isFirst }) {
  const navigate = useNavigate();
  return (
    <div
      className="glass-panel"
      onClick={() => to && navigate(to)}
      role={to ? 'button' : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={e => { if (to && (e.key === 'Enter' || e.key === ' ')) navigate(to); }}
      style={{
        padding: '1.75rem 2rem',
        border: '1px solid var(--border-color)',
        borderLeft: isFirst ? '1px solid var(--border-color)' : 'none',
        borderRadius: 0, // We will wrap these in a container that handles border radius
        cursor: to ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => { 
        if (to) {
          e.currentTarget.style.background = 'rgba(0,0,0,0.015)';
          e.currentTarget.style.boxShadow = `inset 0 0 20px -10px ${dotColor}`;
        }
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.background = 'var(--surface-color)'; 
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: loading ? 'var(--border-color)' : dotColor,
        boxShadow: loading ? 'none' : `0 0 12px ${dotColor}`,
        marginBottom: '1.25rem', flexShrink: 0,
      }} />
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: loading ? 'var(--border-color)' : 'var(--text-primary)',
        marginBottom: '0.5rem',
      }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {loading ? ' ' : sub}
        </div>
      )}
    </div>
  );
}

/* ─── Flow card ──────────────────────────────────────────────── */
function FlowCard({ flow }) {
  const getAccent = (str) => {
    if (!str) return { border: '#64748b', badge: 'rgba(100,116,139,0.15)', text: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)' };
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hues = [175, 215, 265, 330, 15, 45, 120];
    const hue = hues[Math.abs(hash) % hues.length];
    return {
      border: `hsl(${hue}, 85%, 45%)`,
      badge: `hsla(${hue}, 85%, 45%, 0.15)`,
      text: `hsl(${hue}, 85%, 50%)`,
      glow: `hsla(${hue}, 85%, 50%, 0.4)`
    };
  };
  const accent = getAccent(flow.SystemName);

  return (
    <Link to={`/flows/view/${flow.Id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="glass-panel"
        style={{
          borderLeft: `4px solid ${accent.border}`,
          padding: '1.25rem 1.5rem',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 30px -10px ${accent.glow}, 0 12px 32px rgba(0,0,0,0.08)`;
          e.currentTarget.style.borderColor = accent.text;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.borderLeftColor = accent.border;
        }}
      >
        {/* System badge + version */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: accent.text, background: accent.badge, borderRadius: '6px', padding: '3px 8px',
            fontFamily: 'var(--font-mono)', border: `1px solid ${accent.badge}`
          }}>
            {flow.SystemName}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            v{flow.Version}
          </span>
        </div>

        {/* Title + program */}
        <div style={{ flex: 1, marginTop: '0.25rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.35rem' }}>
            {flow.Title}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {flow.Program}
          </div>
        </div>

        {/* Date */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {flow.DocumentDate}
        </div>
      </div>
    </Link>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`${API_BASE_URL}/dashboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const s     = data?.stats || {};
  const flows = data?.latestFlows || [];

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ marginBottom: '3.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: -1, left: 0, width: '150px', height: '1px',
          background: 'linear-gradient(90deg, var(--primary-red), transparent)'
        }} />
        <div style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--primary-red)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem',
          textShadow: '0 0 10px var(--primary-red-glow)'
        }}>
          HIS Data Hub
        </div>
        <h1 className="text-gradient" style={{
          fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em',
          margin: 0, lineHeight: 1.15,
        }}>
          Mission Dashboard
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 400 }}>
          Live snapshot of mission status and data infrastructure
        </p>
      </div>

      {/* ── Team status ──────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '3.5rem' }}>
        <SectionLabel label="Team Status" />
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
           <AvailabilityBoard />
        </div>
      </div>

      {/* ── Overview strip ───────────────────────────────────── */}
      <div className="animate-fade-in-up delay-200" style={{ marginBottom: '3.5rem' }}>
        <SectionLabel label="Overview" />
        <div className="glass-panel" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          overflow: 'hidden',
          padding: 0
        }}>
          <StatCell
            dotColor="#14b8a6"
            value={s.activeFlows}
            label="Flow Manuals"
            sub={s.activeFlows === 1 ? '1 document' : `${s.activeFlows ?? '—'} documents`}
            to="/flows"
            loading={loading}
            isFirst
          />
          <StatCell
            dotColor="#3b82f6"
            value={s.activeFacilities}
            label="Active Facilities"
            sub={`out of ${s.totalFacilities ?? '—'} tracked`}
            to="/facilities"
            loading={loading}
          />
          <StatCell
            dotColor="#22c55e"
            value={`${s.teamOnline ?? '—'} / ${s.teamTotal ?? '—'}`}
            label="Team Online"
            sub="currently available"
            loading={loading}
          />
          <StatCell
            dotColor="#f59e0b"
            value={s.projectLinks}
            label="Project Links"
            sub="tools &amp; resources"
            to="/project-links"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Flow manuals ─────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-300" style={{ marginBottom: '3rem' }}>
        <SectionLabel label="Flow Manuals" to="/flows" linkText="Browse all" />
        {loading ? (
          <div className="glass-panel" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
            Loading mission protocols…
          </div>
        ) : flows.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem',
          }}>
            No flow manuals yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {flows.map((f, i) => (
               <div key={f.Id} className={`animate-fade-in-up delay-${Math.min((i+4)*100, 400)}`} style={{ height: '100%' }}>
                  <FlowCard flow={f} />
               </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
