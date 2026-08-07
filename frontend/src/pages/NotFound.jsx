import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="page-content" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Compass size={22} color="var(--slate-500)" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Page not found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
