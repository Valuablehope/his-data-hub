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
    color: '#A10717',
    description: 'Vaccination record-keeping and tracking for the Expanded Programme on Immunization.',
  },
};

const ProgrammeAreas = ({ programmes, loading }) => {
  if (loading) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Loading programme areas…
      </div>
    );
  }

  if (!programmes?.length) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No programme areas published yet.
      </div>
    );
  }

  return (
    <div className="hub-panel">
      {programmes.map((p, i) => {
        const meta = PROGRAMME_META[p.Program] || { icon: Activity, color: '#64748b', description: '' };
        const Icon = meta.icon;
        return (
          <div
            key={p.Program}
            style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem',
              borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
              background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${meta.color}30`,
            }}>
              <Icon size={20} strokeWidth={2.25} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                {p.Program}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {meta.description}
              </div>
            </div>
            <div className="hub-eyebrow" style={{ flexShrink: 0, textAlign: 'right' }}>
              {p.cnt === 1 ? '1 FLOW' : `${p.cnt} FLOWS`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgrammeAreas;
