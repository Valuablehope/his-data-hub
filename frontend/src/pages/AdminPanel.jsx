import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Image, ShieldCheck, Briefcase } from 'lucide-react';

const AdminPanel = () => {
  return (
    <div>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 2.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary-red), #C1091C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Admin Panel</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Manage portal access, roles, and public-facing content</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-tab${isActive ? ' active' : ''}`}>
            <Users size={15} /> Users
          </NavLink>
          <NavLink to="/admin/platform-links" className={({ isActive }) => `admin-tab${isActive ? ' active' : ''}`}>
            <Image size={15} /> Platform Links
          </NavLink>
          <NavLink to="/admin/projects" className={({ isActive }) => `admin-tab${isActive ? ' active' : ''}`}>
            <Briefcase size={15} /> Projects
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default AdminPanel;
