import React from 'react';
import { Building2, MapPin } from 'lucide-react';

const BRANCHES = [
  {
    name: 'Coordination Office',
    tag: 'Central',
    icon: Building2,
    color: '#DF0A20',
    description: 'Mission-wide oversight of health information strategy, programmatic reporting, and system development across all health programme areas.',
  },
  {
    name: 'Saida Base',
    tag: 'Field Base',
    icon: MapPin,
    color: '#3b82f6',
    description: 'Field-level technical support to health facilities across the Saida catchment — data-entry support, facility follow-up, and reporting.',
  },
  {
    name: 'Tripoli Base',
    tag: 'Field Base',
    icon: MapPin,
    color: '#A10717',
    description: 'Field-level technical support to health facilities across the Tripoli catchment — data-entry support, facility follow-up, and reporting.',
  },
];

const TeamStructure = () => {
  return (
    <div>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '760px', marginBottom: '2rem' }}>
        The Health Information System (HIS) Team operates under the Health Department Management of
        the Lebanon Mission. The team is responsible for health information strategy, data
        management, programmatic reporting, and field-level technical support across all health
        programme areas — organised into a Coordination (Central) Office and two field bases, each
        covering a defined geographic catchment of health facilities and programme areas.
      </p>

      <div className="landing-team-grid">
        {BRANCHES.map(b => {
          const Icon = b.icon;
          return (
            <div key={b.name} className="hub-panel" style={{ '--hub-accent': b.color, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: `${b.color}18`, color: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${b.color}30`,
                }}>
                  <Icon size={20} strokeWidth={2.25} />
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: b.color, background: `${b.color}18`, borderRadius: '6px', padding: '3px 8px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {b.tag}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {b.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {b.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamStructure;
