import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)', padding: '2.5rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          HIS DATA HUB
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Health Information System · Health Department · Lebanon Mission
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <a href="https://tixo.his-pui.org/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          TIXO Tickets
        </a>
        <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <LogIn size={13} />
          HIS Login
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
