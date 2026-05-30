import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, FileText } from 'lucide-react';

const Flows = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/flows')
      .then(res => res.json())
      .then(data => {
        setFlows(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load flows:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={28} color="var(--primary-red)" />
            Flow Manuals
          </h1>
          <p className="page-subtitle">Comprehensive operational documentation for system workflows.</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/flows/add')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> New Flow Manual
        </button>
      </div>

      <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {loading ? (
          <div className="bento-item" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading flow manuals...
          </div>
        ) : flows.length === 0 ? (
          <div className="bento-item" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FileText size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Manuals Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px' }}>
              There are currently no flow manuals documented in the system. Create your first manual to establish operational guidelines.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/flows/add')}>
              Create Flow Manual
            </button>
          </div>
        ) : (
          flows.map(flow => (
            <div key={flow.Id} className="bento-item" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-red)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                {flow.SystemName || 'System'} · {flow.Program || 'Program'}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {flow.Title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                {flow.Subtitle || 'No description provided.'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>v{flow.Version || '1.0'}</span>
                  <span>{flow.DocumentDate || new Date(flow.CreatedAt).toLocaleDateString()}</span>
                </div>
                <Link 
                  to={`/flows/view/${flow.Id}`}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                >
                  View Manual
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Flows;
