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
            <img src={`${import.meta.env.BASE_URL}favicon_TIXO.svg`} alt="TIXO" width="16" height="16" style={{ flexShrink: 0 }} />
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
