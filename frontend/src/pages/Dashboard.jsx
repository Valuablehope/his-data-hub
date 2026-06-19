import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AvailabilityBoard from '../components/AvailabilityBoard';
import { API_BASE_URL, fetchApi } from '../config';

/* ─── Section label ──────────────────────────────────────────── */
function SectionLabel({ label, to, linkText = 'View all' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ width: '3px', height: '14px', background: 'var(--primary-red)', borderRadius: '2px', flexShrink: 0 }} />
        <span style={{
          fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
        }}>
          {label}
        </span>
      </div>
      {to && (
        <Link to={to} style={{
          fontSize: '12px', fontWeight: 600, color: 'var(--teal-600)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          {linkText} <ChevronRight size={11} />
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
      onClick={() => to && navigate(to)}
      role={to ? 'button' : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={e => { if (to && (e.key === 'Enter' || e.key === ' ')) navigate(to); }}
      style={{
        padding: '1.375rem 1.75rem',
        borderLeft: isFirst ? 'none' : '1px solid var(--border-color)',
        cursor: to ? 'pointer' : 'default',
        transition: 'background 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
      onMouseEnter={e => { if (to) e.currentTarget.style.background = 'rgba(0,0,0,0.018)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: loading ? 'var(--border-color)' : dotColor,
        marginBottom: '0.875rem', flexShrink: 0,
      }} />
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '1.8rem',
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: loading ? 'var(--border-color)' : 'var(--text-primary)',
        marginBottom: '0.375rem',
      }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.175rem' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {loading ? ' ' : sub}
        </div>
      )}
    </div>
  );
}

/* ─── Flow card ──────────────────────────────────────────────── */
function FlowCard({ flow }) {
  const accentMap = {
    'HIS Team': { border: '#0d9488', badge: 'rgba(13,148,136,0.08)', text: '#0d9488' },
    'PHENICS':  { border: '#3b82f6', badge: 'rgba(59,130,246,0.08)', text: '#3b82f6' },
  };
  const accent = accentMap[flow.SystemName] || { border: '#64748b', badge: 'rgba(100,116,139,0.08)', text: '#64748b' };

  return (
    <Link to={`/flows/view/${flow.Id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderLeft: `3px solid ${accent.border}`,
          borderRadius: '10px',
          padding: '1rem 1.125rem',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* System badge + version */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{
            fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            color: accent.text, background: accent.badge, borderRadius: '4px', padding: '2px 6px',
            fontFamily: 'var(--font-mono)',
          }}>
            {flow.SystemName}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            v{flow.Version}
          </span>
        </div>

        {/* Title + program */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '0.25rem' }}>
            {flow.Title}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {flow.Program}
          </div>
        </div>

        {/* Date */}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.375rem', borderTop: '1px solid var(--border-color)' }}>
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
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--primary-red)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem',
        }}>
          Lebanon Mission · HIS Data Hub
        </div>
        <h1 style={{
          fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.03em',
          color: 'var(--text-primary)', margin: 0, lineHeight: 1.15,
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Live snapshot of mission status and data infrastructure
        </p>
      </div>

      {/* ── Team status ──────────────────────────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionLabel label="Team Status" />
        <AvailabilityBoard />
      </div>

      {/* ── Overview strip ───────────────────────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionLabel label="Overview" />
        <div style={{
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          overflow: 'hidden',
        }}>
          <StatCell
            dotColor="#0d9488"
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
            dotColor="#16a34a"
            value={`${s.teamOnline ?? '—'} / ${s.teamTotal ?? '—'}`}
            label="Team Online"
            sub="currently available"
            loading={loading}
          />
          <StatCell
            dotColor="#b45309"
            value={s.projectLinks}
            label="Project Links"
            sub="tools &amp; resources"
            to="/project-links"
            loading={loading}
          />
        </div>
      </div>

      {/* ── Flow manuals ─────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <SectionLabel label="Flow Manuals" to="/flows" linkText="Browse all" />
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem 0' }}>
            Loading…
          </div>
        ) : flows.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px',
            padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem',
          }}>
            No flow manuals yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {flows.map(f => <FlowCard key={f.Id} flow={f} />)}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
