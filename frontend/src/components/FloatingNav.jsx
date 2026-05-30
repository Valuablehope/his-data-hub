import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  Network, 
  ClipboardCheck,
  FolderOpen,
  Search,
  UserCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FloatingNav = () => {
  const { logout } = useAuth();

  return (
    <div className="floating-nav-wrapper">
      <div className="floating-nav">
        <div className="nav-logo">
           <div className="nav-logo-icon">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Platform Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
           </div>
           <span className="nav-logo-text">HIS DATA HUB</span>
        </div>
        
        <div className="nav-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Activity size={16} />
            <span>Dashboard</span>
            <span className="nav-soon-badge">Soon</span>
          </NavLink>
          <NavLink to="/documentation" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FileText size={16} />
            <span>SOPs</span>
            <span className="nav-soon-badge">Soon</span>
          </NavLink>
          <NavLink to="/flows" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Network size={16} />
            <span>Flows</span>
          </NavLink>
          <NavLink to="/forms" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ClipboardCheck size={16} />
            <span>Forms</span>
            <span className="nav-soon-badge">Soon</span>
          </NavLink>
          <NavLink to="/files" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FolderOpen size={16} />
            <span>Files</span>
          </NavLink>
          <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)', margin: '0 0.5rem' }}></div>
          <a href="https://tixo.cubiq-solutions.com/" target="_blank" rel="noopener noreferrer" className="nav-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
            <span>TIXO Tickets</span>
          </a>
        </div>

        <div className="nav-actions">
          <button className="icon-btn" title="Search (Ctrl+K)">
            <Search size={18} />
          </button>
          <button className="icon-btn" title="Profile">
            <UserCircle size={20} />
          </button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)', margin: '0 0.5rem' }}></div>
          <button className="icon-btn" onClick={logout} title="Logout" style={{ color: 'var(--primary-red)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;
