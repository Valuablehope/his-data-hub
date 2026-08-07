import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PlatformLogo from './PlatformLogo';

function PlatformCard({ link }) {
  const isInternal = link.url?.startsWith('/');
  const content = (
    <div
      className="hub-panel"
      style={{
        padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', gap: '0.875rem', height: '100%', boxSizing: 'border-box',
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PlatformLogo link={link} size={30} radius={8} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {link.name}
        </span>
        {!isInternal && <ArrowUpRight size={13} color="var(--text-muted)" />}
      </div>
    </div>
  );

  return isInternal ? (
    <Link to={link.url} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{content}</Link>
  ) : (
    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{content}</a>
  );
}

const PlatformLinksGrid = ({ links, loading }) => {
  if (loading) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Loading connected systems…
      </div>
    );
  }

  if (!links?.length) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No connected platforms published yet.
      </div>
    );
  }

  return (
    <div className="landing-platforms-grid">
      {links.map(link => (
        <PlatformCard key={link.id} link={link} />
      ))}
    </div>
  );
};

export default PlatformLinksGrid;
