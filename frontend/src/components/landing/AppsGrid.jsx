import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { NAV_ITEMS } from '../../config/navItems';

const APPS = NAV_ITEMS.filter(item => !item.adminOnly && !item.soon);

const AppsGrid = () => {
  return (
    <div className="landing-apps-grid">
      {APPS.map(app => {
        const Icon = app.icon;
        return (
          <Link key={app.to} to={app.to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem', height: '100%', boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 30px -10px ${app.color}66, 0 12px 32px rgba(0,0,0,0.08)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '11px',
                  background: `${app.color}18`, color: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${app.color}30`,
                }}>
                  <Icon size={18} strokeWidth={2.25} />
                </div>
                <ArrowUpRight size={16} color="var(--text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {app.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {app.description}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default AppsGrid;
