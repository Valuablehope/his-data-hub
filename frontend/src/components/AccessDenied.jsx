import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => {
  return (
    <div className="page-content" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'var(--primary-red-glow)', border: '1px solid rgba(227, 0, 15, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <ShieldAlert size={22} color="var(--primary-red)" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Access denied
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          You don't have permission to view this page. Contact an administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
