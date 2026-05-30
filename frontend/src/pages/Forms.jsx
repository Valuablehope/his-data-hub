import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const Forms = () => {
  return (
    <div className="page-content" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <ClipboardCheck size={22} color="#B45309" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Forms coming soon
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          This section is currently inactive. In the meantime, use the navigation above to access Flows and Files.
        </p>
      </div>
    </div>
  );
};

export default Forms;
