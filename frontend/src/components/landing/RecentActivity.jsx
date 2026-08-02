import React from 'react';
import { Link } from 'react-router-dom';
import { Network, FileText } from 'lucide-react';

const TYPE_META = {
  flow: { icon: Network, color: '#14b8a6', label: 'Flow Manual' },
  document: { icon: FileText, color: '#6366f1', label: 'SOP' },
};

const RecentActivity = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Loading recent activity…
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Nothing published yet.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '0.5rem' }}>
      {items.map((item, i) => {
        const meta = TYPE_META[item.Type] || TYPE_META.document;
        const Icon = meta.icon;
        const to = item.Type === 'flow' ? `/flows/view/${item.Id}` : `/documentation/${item.Id}`;
        const date = new Date(item.ActivityDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        return (
          <Link key={`${item.Type}-${item.Id}`} to={to} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                borderRadius: 'var(--radius-md)', transition: 'background 0.2s',
                borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.Title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {meta.label} · {item.Subtitle}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {date}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default RecentActivity;
