import React, { useContext } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NAV_ITEMS } from '../config/navItems';
import UserMenu from './UserMenu';
import { LogIn } from 'lucide-react';

const FloatingNav = () => {
  const { user, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // On the landing page, a logged-out visitor sees AppsGrid as their single
  // "where can I go" surface — showing the full internal nav here too is
  // premature chrome that duplicates it.
  const showNavLinks = !!user || location.pathname !== '/';

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || hasRole('admin'));

  return (
    <div className="floating-nav-wrapper">
      <div className="floating-nav">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
           <div className="nav-logo-icon">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Platform Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
           </div>
           <span className="nav-logo-text">HIS DATA HUB</span>
        </Link>

        {showNavLinks && (
          <div className="nav-links">
            {visibleItems.map(item => {
              const Icon = item.icon;
              if (item.soon) {
                return (
                  <span key={item.to} className="nav-item nav-item--disabled" aria-disabled="true" title={`${item.label} — coming soon`}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <span className="nav-soon-badge">Soon</span>
                  </span>
                );
              }
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)', margin: '0 0.5rem' }}></div>
            <a href="https://tixo.his-pui.org/" target="_blank" rel="noopener noreferrer" className="nav-item">
              <img src={`${import.meta.env.BASE_URL}favicon_TIXO.svg`} alt="TIXO" width="16" height="16" style={{ flexShrink: 0 }} />
              <span>TIXO Tickets</span>
            </a>
          </div>
        )}

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
