import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, RefreshCw, BookOpen, FileText, Building2, Users, Link2,
  UploadCloud, AlertTriangle, Plus, FolderPlus, Clock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AvailabilityBoard from '../components/AvailabilityBoard';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import '../dashboard.css';

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

/* ─── Icon badge (used by hero stats + quick actions) ───────── */
function IconBadge({ icon: Icon, color, size = 38 }) {
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: size <= 32 ? '9px' : '11px',
      background: `${color}18`, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid ${color}30`, flexShrink: 0,
      boxShadow: `0 0 16px ${color}22`,
    }}>
      <Icon size={size <= 32 ? 15 : 18} strokeWidth={2.25} />
    </div>
  );
}

/* ─── Hero stat tile ─────────────────────────────────────────── */
function HeroStat({ icon, color, value, label, sub, to, loading }) {
  const navigate = useNavigate();
  return (
    <div
      className="glass-panel"
      onClick={() => to && navigate(to)}
      role={to ? 'button' : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={e => { if (to && (e.key === 'Enter' || e.key === ' ')) navigate(to); }}
      style={{
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem',
        cursor: to ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconBadge icon={icon} color={loading ? '#94a3b8' : color} />
        {to && <ChevronRight size={16} color="var(--text-muted)" />}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 700,
          letterSpacing: '-0.03em', lineHeight: 1,
          color: loading ? 'var(--border-color)' : 'var(--text-primary)',
          marginBottom: '0.4rem',
        }}>
          {loading ? '—' : value}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
        {sub && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {loading ? ' ' : sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Mini donut (used inside Status Overview) ──────────────── */
function MiniDonut({ title, data, totalLabel, totalValue, loading }) {
  const hasData = data.some(d => d.value > 0);
  return (
    <div style={{ flex: '1 1 220px', minWidth: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {title}
      </div>
      <div style={{ width: '100%', height: '160px', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Loading…
          </div>
        ) : !hasData ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No data
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={3} stroke="none">
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalValue}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{totalLabel}</div>
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginTop: '0.75rem' }}>
        {data.filter(d => d.value > 0).map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            {d.name} · {d.value}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Quick action row ──────────────────────────────────────── */
function QuickActionRow({ icon, label, to, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.6rem', borderRadius: 'var(--radius-md)', transition: 'background 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <IconBadge icon={icon} color={color} size={32} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <ChevronRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
      </div>
    </Link>
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

        <div style={{ flex: 1, marginTop: '0.25rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.35rem' }}>
            {flow.Title}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {flow.Program}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {flow.DocumentDate}
        </div>
      </div>
    </Link>
  );
}

const STATUS_COLORS = {
  Online: '#16a34a',
  'In Field': '#2563eb',
  'On Leave': '#d97706',
  Busy: '#dc2626',
  Offline: '#94a3b8',
};
const FALLBACK_STATUS_HUES = [160, 260, 30, 340, 200];
// Any status string outside the known set (e.g. legacy data) still gets a distinct,
// stable color instead of collapsing into the same gray as "Offline".
const colorForStatus = (name) => {
  if (STATUS_COLORS[name]) return STATUS_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = FALLBACK_STATUS_HUES[Math.abs(hash) % FALLBACK_STATUS_HUES.length];
  return `hsl(${hue}, 70%, 45%)`;
};

const greetingForHour = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [dashRes, availRes] = await Promise.all([
        fetchApi(`${API_BASE_URL}/dashboard`),
        fetchApi(`${API_BASE_URL}/availability`),
      ]);
      if (!dashRes.ok) throw new Error('Failed to load dashboard stats');
      const dashJson = await dashRes.json();
      const teamJson = availRes.ok ? await availRes.json() : [];
      setData(dashJson);
      setTeam(teamJson);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const s = data?.stats || {};
  const flows = data?.latestFlows || [];

  const displayName = user?.username
    ? user.username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : null;

  const facilitiesData = [
    { name: 'Active', value: s.activeFacilities ?? 0, color: '#3b82f6' },
    { name: 'Inactive', value: Math.max((s.totalFacilities ?? 0) - (s.activeFacilities ?? 0), 0), color: '#cbd5e1' },
  ];

  const teamCounts = team.reduce((acc, m) => {
    const status = m.Status || 'Offline';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const teamData = Object.entries(teamCounts).map(([name, value]) => ({
    name, value, color: colorForStatus(name),
  }));

  return (
    <div className="page-content" style={{ padding: '2rem 2.5rem', maxWidth: '1480px', margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: -1, left: 0, width: '150px', height: '1px',
          background: 'linear-gradient(90deg, var(--primary-red), transparent)'
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
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
              {greetingForHour(new Date().getHours())}{displayName ? `, ${displayName}` : ''}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 400 }}>
              Live snapshot of mission status and data infrastructure
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
            {lastUpdated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <Clock size={13} />
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            <button
              className="icon-btn"
              onClick={loadDashboard}
              disabled={loading}
              title="Refresh"
              style={{ border: '1px solid var(--border-color)', background: 'var(--surface-color)', opacity: loading ? 0.6 : 1 }}
            >
              <RefreshCw size={16} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────── */}
      {error && (
        <div className="glass-panel animate-fade-in-up" style={{
          marginBottom: '2rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', border: '1px solid rgba(239,68,68,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--red-600)' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Couldn't load dashboard data. Please check your connection and try again.
            </span>
          </div>
          <button className="btn btn-ghost" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      {/* ── Hero stats ───────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-100 dashboard-hero-grid" style={{ marginBottom: '2.5rem' }}>
        <HeroStat
          icon={BookOpen} color="#14b8a6"
          value={s.activeFlows}
          label="Flow Manuals"
          sub={s.activeFlows === 1 ? '1 document' : `${s.activeFlows ?? '—'} documents`}
          to="/flows" loading={loading}
        />
        <HeroStat
          icon={FileText} color="#6366f1"
          value={s.activeDocs}
          label="Published SOPs"
          sub="documentation library"
          to="/documentation" loading={loading}
        />
        <HeroStat
          icon={Building2} color="#3b82f6"
          value={s.activeFacilities}
          label="Active Facilities"
          sub={`out of ${s.totalFacilities ?? '—'} tracked`}
          to="/facilities" loading={loading}
        />
        <HeroStat
          icon={Users} color="#22c55e"
          value={`${s.teamOnline ?? '—'} / ${s.teamTotal ?? '—'}`}
          label="Team Online"
          sub="currently available"
          loading={loading}
        />
        <HeroStat
          icon={Link2} color="#f59e0b"
          value={s.projectLinks}
          label="Project Links"
          sub="tools & resources"
          to="/project-links" loading={loading}
        />
        <HeroStat
          icon={UploadCloud} color="#64748b"
          value={s.uploadedFiles}
          label="Uploaded Files"
          sub="shared documents"
          to="/files" loading={loading}
        />
      </div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-200 dashboard-grid">

        {/* Main column */}
        <div>
          {/* Status overview */}
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel label="Status Overview" />
            <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              <MiniDonut
                title="Facilities" data={facilitiesData}
                totalLabel="tracked" totalValue={s.totalFacilities ?? '—'}
                loading={loading}
              />
              <MiniDonut
                title="Team" data={teamData}
                totalLabel="members" totalValue={team.length || (s.teamTotal ?? '—')}
                loading={loading}
              />
            </div>
          </div>

          {/* Flow manuals */}
          <div>
            <SectionLabel label="Recent Flow Manuals" to="/flows" linkText="Browse all" />
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {flows.map((f, i) => (
                  <div key={f.Id} className={`animate-fade-in-up delay-${Math.min((i + 4) * 100, 400)}`} style={{ height: '100%' }}>
                    <FlowCard flow={f} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar column */}
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel label="Team Status" />
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <AvailabilityBoard />
            </div>
          </div>

          <div>
            <SectionLabel label="Quick Actions" />
            <div className="glass-panel" style={{ padding: '0.6rem' }}>
              <QuickActionRow icon={BookOpen} label="New Flow Manual" to="/flows/add" color="#14b8a6" />
              <QuickActionRow icon={FolderPlus} label="New Document" to="/documentation/add" color="#6366f1" />
              <QuickActionRow icon={Plus} label="Add Facility" to="/facilities/add" color="#3b82f6" />
              <QuickActionRow icon={UploadCloud} label="Browse Files" to="/files" color="#64748b" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
