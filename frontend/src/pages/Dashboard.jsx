import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, RefreshCw, Award, MapPin,
  Plus, FolderPlus, UploadCloud, BookOpen,
  AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
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

/* ─── Icon badge (used by KPI tiles + quick actions) ─────────── */
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

/* ─── KPI tile ────────────────────────────────────────────────── */
function KpiTile({ icon, color, value, label, sub, to, loading }) {
  const content = (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem',
        cursor: to ? 'pointer' : 'default', height: '100%', boxSizing: 'border-box',
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
  return to ? <Link to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{content}</Link> : content;
}

/* ─── Coverage meter — a ratio against a limit, not a 2-slice donut ──── */
function CoverageMeter({ covered, total, loading }) {
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
  const severity = pct >= 80
    ? { fill: '#16a34a', track: '#dcfce7', label: 'On track' }
    : pct >= 50
    ? { fill: '#d97706', track: '#fef3c7', label: 'Needs attention' }
    : { fill: '#dc2626', track: '#fee2e2', label: 'Critical' };
  const needsUpdate = Math.max(total - covered, 0);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {loading ? '—' : `${pct}%`}
        </span>
        {!loading && (
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: severity.fill }}>{severity.label}</span>
        )}
      </div>
      <div style={{ height: '10px', borderRadius: '999px', background: loading ? 'var(--border-color)' : severity.track, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${loading ? 0 : pct}%`, background: severity.fill,
          borderRadius: '999px', transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {loading
          ? 'Loading…'
          : `${covered} of ${total} active facilities have logged grant coverage this month — ${needsUpdate} need updating.`}
      </div>
    </div>
  );
}

/* ─── Facilities by area — magnitude comparison, single hue ──────────── */
function FacilitiesByAreaChart({ data, loading }) {
  if (loading) {
    return <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</div>;
  }
  if (!data?.length) {
    return <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No facility data yet.</div>;
  }

  const chartHeight = Math.max(200, data.length * 30);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem 1.75rem 1rem' }}>
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 0 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} stroke="var(--border-color)" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="area" width={92} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.75rem' }}
              formatter={(value) => [`${value} facilities`, '']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={18}>
              <LabelList dataKey="count" position="right" style={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Needs-attention worklist ───────────────────────────────────────── */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthsSince(month, year) {
  const now = new Date();
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
}

// The actionable hint per facility: never-covered is the most urgent case
// (no history at all); otherwise how long it's been stale and under which
// grant, so the reader knows exactly what to check without opening the record.
function attentionHint(item) {
  if (item.lastYear == null) {
    return { text: 'No coverage ever logged for this facility', color: '#dc2626' };
  }
  const months = monthsSince(item.lastMonth, item.lastYear);
  const color = months >= 12 ? '#dc2626' : months >= 3 ? '#d97706' : '#64748b';
  const monthLabel = MONTH_NAMES[item.lastMonth - 1] || '?';
  const grantSuffix = item.lastGrantCode ? ` · ${item.lastGrantCode}` : '';
  const agoLabel = months <= 0 ? 'last month' : months === 1 ? '1 month ago' : `${months} months ago`;
  return { text: `Last covered ${monthLabel} ${item.lastYear}${grantSuffix} — ${agoLabel}`, color };
}

function NeedsAttentionList({ items, loading }) {
  if (loading) {
    return <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</div>;
  }
  if (!items?.length) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <CheckCircle2 size={26} color="#16a34a" style={{ marginBottom: '0.5rem' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          All active facilities have coverage logged for this month.
        </div>
      </div>
    );
  }
  return (
    <div className="glass-panel" style={{ padding: '0.4rem' }}>
      {items.map((f, i) => {
        const hint = attentionHint(f);
        return (
          <Link key={f.id} to={`/facilities/${f.id}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.85rem 1rem',
                borderTop: i > 0 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hint.color, flexShrink: 0, marginTop: '0.4rem' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.area} · {f.base}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: hint.color, marginTop: '0.25rem', fontWeight: 500 }}>
                  {hint.text}
                </div>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Active grants — active means today falls inside a facility's coverage
   period; CoveragePeriod is per-facility, so the range/duration shown here is
   the span of only the currently-active coverage rows (min start → max end),
   not an all-time aggregate over the grant's full history. ──── */
function coverageRange(g) {
  if (!g.coverageStart || !g.coverageEnd) return null;
  const start = new Date(g.coverageStart);
  const end = new Date(g.coverageEnd);
  const startLabel = `${MONTH_NAMES[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
  const endLabel = `${MONTH_NAMES[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  return {
    label: startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`,
    durationLabel: g.durationMonths ? `${g.durationMonths}${g.durationMonths === 1 ? ' mo' : ' mos'}` : null,
  };
}

function ActiveGrantsList({ grants, loading }) {
  if (loading) {
    return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</div>;
  }
  if (!grants?.length) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No grants are currently within an active coverage period.
      </div>
    );
  }
  return (
    <div className="glass-panel" style={{ padding: '0.4rem' }}>
      {grants.map((g, i) => {
        const range = coverageRange(g);
        return (
          <div
            key={g.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
              borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{g.code}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.donor}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {g.facilityCount} {g.facilityCount === 1 ? 'facility' : 'facilities'} covered today
              </div>
              {range && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{range.label}</span>
                  {range.durationLabel && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.66rem', fontWeight: 700,
                        padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)',
                        background: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6', flexShrink: 0,
                      }}
                    >
                      {range.durationLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700,
                padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
                background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', flexShrink: 0,
              }}
            >
              {g.facilityCount}
            </span>
          </div>
        );
      })}
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

const greetingForHour = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchApi(`${API_BASE_URL}/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load dashboard stats');
      setData(await res.json());
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const displayName = user?.username
    ? user.username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : null;

  const coverage = data?.coverage || {};

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
              HIS Team Dashboard
            </div>
            <h1 className="text-gradient" style={{
              fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em',
              margin: 0, lineHeight: 1.15,
            }}>
              {greetingForHour(new Date().getHours())}{displayName ? `, ${displayName}` : ''}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 400 }}>
              Operational KPIs and what needs your attention today
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

      {/* ── KPI row ──────────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-100 dashboard-hero-grid" style={{ marginBottom: '2.5rem' }}>
        <KpiTile
          icon={Award} color="#8b5cf6"
          value={data?.grantsTracked}
          label="Grants Tracked"
          sub="active funding sources"
          loading={loading}
        />
        <KpiTile
          icon={MapPin} color="#3b82f6"
          value={data?.areasCovered}
          label="Areas Covered"
          sub="geographic districts"
          to="/facilities" loading={loading}
        />
        <KpiTile
          icon={CheckCircle2} color="#14b8a6"
          value={data?.activeGrantsCount}
          label="Active Grants"
          sub="in coverage right now"
          loading={loading}
        />
      </div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-200 dashboard-grid">

        {/* Main column */}
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel label="Facility Coverage — This Month" to="/facilities" linkText="View facilities" />
            <CoverageMeter covered={coverage.covered} total={coverage.total} loading={loading} />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel label="Facilities by Area" />
            <FacilitiesByAreaChart data={data?.facilitiesByArea} loading={loading} />
          </div>

          <div>
            <SectionLabel label="Needs Attention" />
            <NeedsAttentionList items={data?.needsAttention} loading={loading} />
          </div>
        </div>

        {/* Sidebar column */}
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <SectionLabel label="Active Grants" to="/facilities" linkText="View facilities" />
            <ActiveGrantsList grants={data?.activeGrants} loading={loading} />
          </div>

          <div>
            <SectionLabel label="Quick Actions" />
            <div className="glass-panel" style={{ padding: '0.6rem' }}>
              <QuickActionRow icon={BookOpen} label="New Flow Manual" to="/flow-manuals/add" color="#14b8a6" />
              <QuickActionRow icon={FolderPlus} label="New Document" to="/sops/add" color="#6366f1" />
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
