import React from 'react';
import { HeartPulse, Syringe, Activity } from 'lucide-react';

const PROGRAMME_META = {
  'Hospitalization': {
    icon: HeartPulse,
    color: '#dc2626',
    description: 'Emergency care, deliveries, surgeries, and in-patient services — including NICU.',
  },
  'Immunization / EPI': {
    icon: Syringe,
    color: '#0d9488',
    description: 'Vaccination record-keeping and tracking for the Expanded Programme on Immunization.',
  },
};

const ProgrammeAreas = ({ programmes, loading }) => {
  if (loading) {
    return (
      <div className="landing-section-grid">
        {[0, 1].map(i => (
          <div key={i} className="glass-panel" style={{ padding: '1.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Loading…
          </div>
        ))}
      </div>
    );
  }

  if (!programmes?.length) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No programme areas published yet.
      </div>
    );
  }

  return (
    <div className="landing-section-grid">
      {programmes.map(p => {
        const meta = PROGRAMME_META[p.Program] || { icon: Activity, color: '#64748b', description: '' };
        const Icon = meta.icon;
        return (
          <div key={p.Program} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${meta.color}30`,
            }}>
              <Icon size={20} strokeWidth={2.25} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                {p.Program}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {meta.description}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {p.cnt === 1 ? '1 flow manual' : `${p.cnt} flow manuals`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgrammeAreas;
