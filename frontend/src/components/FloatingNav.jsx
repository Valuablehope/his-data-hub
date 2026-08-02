import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserMenu from './UserMenu';
import {
  Activity,
  FileText,
  Network,
  ClipboardCheck,
  FolderOpen,
  Building2,
  BookMarked,
  Search,
  UserCircle,
  LogOut,
  LogIn
} from 'lucide-react';

const FloatingNav = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
          </NavLink>
          <NavLink to="/documentation" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FileText size={16} />
            <span>SOPs</span>
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
          <NavLink to="/facilities" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Building2 size={16} />
            <span>Facilities</span>
          </NavLink>
          <NavLink to="/project-links" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <BookMarked size={16} />
            <span>Project Links</span>
          </NavLink>

          <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)', margin: '0 0.5rem' }}></div>
          <a href="https://tixo.his-pui.org/" target="_blank" rel="noopener noreferrer" className="nav-item">
            <img src={`${import.meta.env.BASE_URL}favicon_TIXO.svg`} alt="TIXO" width="16" height="16" style={{ flexShrink: 0 }} />
            <span>TIXO Tickets</span>
          </a>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="icon-btn" title="Search (Ctrl+K)">
            <Search size={18} />
          </button>
          
          <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)', margin: '0 0.25rem' }}></div>
          
          {user ? (
            <UserMenu />
          ) : (
            <button onClick={() => navigate('/login')} className="icon-btn" title="HIS Login" style={{ color: 'var(--teal-600)' }}>
              <LogIn size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;
