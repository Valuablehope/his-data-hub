import React from 'react';
import { Activity } from 'lucide-react';
import AvailabilityBoard from '../components/AvailabilityBoard';

const Dashboard = () => {
  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Existing Empty State / Intro */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem 1rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Activity size={22} color="#B45309" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Welcome to HIS Data Hub
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
          Your central portal for managing flows, facilities, and documentation. Full dashboard metrics coming soon.
        </p>
      </div>

      {/* New Availability Board */}
      <AvailabilityBoard />
      
    </div>
  );
};

export default Dashboard;
