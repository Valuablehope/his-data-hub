import React from 'react';
import { Link } from 'react-router-dom';
import { Network, FileText } from 'lucide-react';

const TYPE_META = {
  flow: { icon: Network, color: '#DF0A20', label: 'FLOW' },
  document: { icon: FileText, color: '#A10717', label: 'SOP' },
};

const RecentActivity = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Reading activity log…
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Nothing published yet.
      </div>
    );
  }

  return (
    <div className="hub-panel">
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <span className="hub-status-dot" style={{ background: '#DF0A20', boxShadow: '0 0 8px #DF0A20' }} />
        <span className="hub-eyebrow">Activity Log</span>
      </div>

      {items.map((item, i) => {
        const meta = TYPE_META[item.Type] || TYPE_META.document;
        const Icon = meta.icon;
        const to = item.Type === 'flow' ? `/flow-manuals/view/${item.Id}` : `/sops/${item.Id}`;
        const date = new Date(item.ActivityDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        return (
          <Link key={`${item.Type}-${item.Id}`} to={to} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
                borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} />
              </div>
              <div className="hub-eyebrow" style={{ color: meta.color, flexShrink: 0, width: '42px' }}>
                {meta.label}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.Title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {item.Subtitle}
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
