import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Plus, FileText, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import { AuthContext } from '../context/AuthContext';
import PublicPageHero from '../components/PublicPageHero';
import '../landing.css';
import '../public-page.css';

const ACCENT = '#14b8a6';

const Flows = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token, hasRole } = useContext(AuthContext);
  const canManage = hasRole('admin', 'HIS_TEAM');

  useEffect(() => {
    fetchApi(`${API_BASE_URL}/flows`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFlows(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load flows:", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="public-page-wrap">
      <PublicPageHero
        icon={Network}
        eyebrow="FLOW MANUALS"
        title="Data Flow Manuals"
        subtitle="Step-by-step operational documentation for how data moves across HIS systems — open to browse, no login required."
        accent={ACCENT}
        stats={[{ value: flows.length, label: 'Manuals' }]}
        actions={canManage && (
          <button
            onClick={() => navigate('/flow-manuals/add')}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Flow Manual
          </button>
        )}
      />

      <div>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading flow manuals...
          </div>
        ) : flows.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FileText size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Manuals Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px' }}>
              There are currently no flow manuals documented in the system.{canManage && ' Create your first manual to establish operational guidelines.'}
            </p>
            {canManage && (
              <button className="btn btn-primary" onClick={() => navigate('/flow-manuals/add')}>
                Create Flow Manual
              </button>
            )}
          </div>
        ) : (
          <div className="public-card-grid">
            {flows.map(flow => (
              <div
                key={flow.Id}
                className="hub-panel public-card"
                style={{ '--hub-accent': ACCENT }}
                onClick={() => navigate(`/flow-manuals/view/${flow.Id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `${ACCENT}18`, color: ACCENT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${ACCENT}30`, flexShrink: 0,
                  }}>
                    <Network size={18} strokeWidth={2.25} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    v{flow.Version || '1.0'}
                  </span>
                </div>

                <div>
                  <div className="hub-eyebrow" style={{ color: ACCENT, marginBottom: '0.4rem' }}>
                    {flow.SystemName || 'System'} · {flow.Program || 'Program'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {flow.Title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                    {flow.Subtitle || 'No description provided.'}
                  </p>
                </div>

                <div className="public-card-footer">
                  <span>{flow.DocumentDate || new Date(flow.CreatedAt).toLocaleDateString()}</span>
                  <span className="public-card-cta">
                    View Manual <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flows;
