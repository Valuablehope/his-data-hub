import React from 'react';
import { Network, Database, ArrowRight, ArrowLeftRight, CheckCircle2, Server } from 'lucide-react';

const mockFlows = [
  { id: 1, name: 'Patient Admissions Sync', source: 'HIS Local DB', dest: 'PHENICS Master', status: 'Healthy', lastSync: '2 mins ago', type: 'Bidirectional' },
  { id: 2, name: 'Lab Results Export', source: 'LIS Module', dest: 'PHENICS Lab Endpoint', status: 'Healthy', lastSync: '5 mins ago', type: 'Unidirectional' },
  { id: 3, name: 'Billing Data Rollup', source: 'Finance Module', dest: 'PHENICS Finance', status: 'Warning', lastSync: '4 hrs ago', type: 'Unidirectional' },
  { id: 4, name: 'Pharmacy Inventory', source: 'Pharmacy DB', dest: 'PHENICS Logistics', status: 'Healthy', lastSync: '10 mins ago', type: 'Unidirectional' },
];

const Flows = () => {
  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>PHENICS Data Flows</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor and manage data synchronization pipelines to the PHENICS master system.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">Create New Flow</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {mockFlows.map(flow => (
          <div key={flow.id} className="bento-item" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{flow.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{flow.type} Pipeline</span>
              </div>
              <div className={`status-badge ${flow.status === 'Healthy' ? 'status-active' : 'status-pending'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={12} /> {flow.status}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={24} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{flow.source}</span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
                <div style={{ width: '100%', height: '2px', background: 'var(--border-color)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {flow.type === 'Bidirectional' ? (
                    <ArrowLeftRight size={16} color="var(--primary-red)" style={{ background: 'var(--surface-color)', padding: '0 4px' }} />
                  ) : (
                    <ArrowRight size={16} color="var(--primary-red)" style={{ background: 'var(--surface-color)', padding: '0 4px' }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={24} color="var(--primary-red)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--primary-red)' }}>{flow.dest}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last Sync: <span style={{ fontFamily: 'var(--font-mono)' }}>{flow.lastSync}</span></span>
              <button className="btn btn-ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>View Logs</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Flows;
