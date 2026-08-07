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
              className="hub-panel"
              style={{
                '--hub-accent': app.color,
                padding: '1.5rem', height: '100%', boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
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
