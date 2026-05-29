import React from 'react';
import { FileText, Network, AlertCircle, ArrowUpRight, ArrowRight, Server, Database } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>System Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back. Here is the latest data activity across the HIS network.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost">Export Report</button>
          <button className="btn btn-primary">New Activity Form</button>
        </div>
      </div>
      
      <div className="bento-grid">
        
        {/* Main Hero Card */}
        <div className="bento-item bento-col-2">
          <div className="card-header">
            <span className="card-title">Live PHENICS Connections</span>
            <Network className="card-icon" size={18} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <span className="metric-value">2,841</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>req/min</span>
          </div>
          <div className="metric-change">
            <ArrowUpRight size={16} /> <span>12.5% increase from last hour</span>
          </div>
          {/* Decorative glowing orb in the corner */}
          <div style={{ position: 'absolute', right: '-20%', bottom: '-50%', width: '200px', height: '200px', background: 'var(--primary-red-glow)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
        </div>

        {/* Small Metric 1 */}
        <div className="bento-item">
          <div className="card-header">
            <span className="card-title">Active SOPs</span>
            <FileText className="card-icon" size={18} />
          </div>
          <span className="metric-value">142</span>
          <div className="metric-change" style={{ color: 'var(--text-secondary)' }}>
            <span>Updated 2 hrs ago</span>
          </div>
        </div>

        {/* Small Metric 2 */}
        <div className="bento-item">
          <div className="card-header">
            <span className="card-title">Pending Forms</span>
            <AlertCircle className="card-icon" size={18} />
          </div>
          <span className="metric-value">08</span>
          <div className="metric-change" style={{ color: '#F59E0B' }}>
            <span>Action Required</span>
          </div>
        </div>

        {/* Database Health Card */}
        <div className="bento-item bento-row-2">
          <div className="card-header">
            <span className="card-title">Infrastructure</span>
            <Server className="card-icon" size={18} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remote PC SQL Server</span>
                <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>99.9% Uptime</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--primary-red)' }}></div>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>PHENICS API Sync</span>
                <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>Healthy</span>
              </div>
              <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#10B981' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bento-item bento-col-3 bento-row-2">
          <div className="card-header">
            <span className="card-title">Recent System Activity</span>
            <Database className="card-icon" size={18} />
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Description</th>
                <th>Target</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="primary-cell">Form Submission</td>
                <td>Data Activity Form #294 submitted by Admin</td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>/forms/294</span></td>
                <td><span className="status-badge status-pending">Pending Review</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>10:42 AM</span></td>
              </tr>
              <tr>
                <td className="primary-cell">SOP Update</td>
                <td>Module 3 Workflow Strategy finalized</td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>/docs/mod-3</span></td>
                <td><span className="status-badge status-active">Published</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>09:15 AM</span></td>
              </tr>
              <tr>
                <td className="primary-cell">Data Flow sync</td>
                <td>Automated synchronization with PHENICS database</td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>SQL_SERVER_01</span></td>
                <td><span className="status-badge status-active">Success</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>08:00 AM</span></td>
              </tr>
              <tr>
                <td className="primary-cell">User Access</td>
                <td>New role granted to Dr. Smith (Cardiology)</td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>/users/smith</span></td>
                <td><span className="status-badge status-active">Active</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)' }}>Yesterday</span></td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button className="btn btn-ghost" style={{ width: '100%' }}>
              View All Logs <ArrowRight size={16} />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
