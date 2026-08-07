import React from 'react';
import { Link } from 'react-router-dom';
import PlatformLogo from './PlatformLogo';

function PlatformBadge({ link }) {
  const isInternal = link.url?.startsWith('/');
  const content = (
    <div
      className="hub-panel"
      title={link.name}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem',
        borderRadius: 'var(--radius-full)', textDecoration: 'none',
      }}
    >
      <PlatformLogo link={link} />
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {link.name}
      </span>
    </div>
  );

  return isInternal ? (
    <Link to={link.url} style={{ textDecoration: 'none' }}>{content}</Link>
  ) : (
    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{content}</a>
  );
}

const Footer = ({ platformLinks, loading }) => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)', padding: '2.5rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            HIS DATA HUB
          </span>
          <span className="hub-eyebrow" style={{ marginLeft: '0.25rem' }}>System Operational</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Health Information System · Health Department · Lebanon Mission
        </div>
      </div>

      {!loading && platformLinks?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {platformLinks.map(link => (
            <PlatformBadge key={link.id} link={link} />
          ))}
        </div>
      )}
    </footer>
  );
};

export default Footer;
