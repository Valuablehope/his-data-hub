import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Compact page header for the standalone public pages (SOPs, Flows) — these
// pages render with no floating nav (see AppShell's isStandalonePage), so
// this carries back-navigation. Deliberately restrained: a slim bordered
// header in the same language as Dashboard's page header (thin accent
// underline, eyebrow + title), not a full-bleed hero section.
const PublicPageHero = ({ icon: Icon, eyebrow, title, subtitle, accent = '#DF0A20', stats, actions }) => {
  const navigate = useNavigate();

  return (
    <div className="public-header animate-fade-in-up" style={{ '--hub-accent': accent }}>
      <button className="public-back-btn" onClick={() => navigate(-1)} title="Back" aria-label="Back">
        <ArrowLeft size={17} />
      </button>

      <div className="public-header-body">
        <div style={{ minWidth: 0 }}>
          <div className="public-header-eyebrow" style={{ color: accent }}>
            {Icon && <Icon size={13} strokeWidth={2.5} />}
            {eyebrow}
          </div>
          <h1 className="text-gradient public-header-title">{title}</h1>
          {subtitle && <p className="public-header-subtitle">{subtitle}</p>}
        </div>

        {(stats?.length > 0 || actions) && (
          <div className="public-header-side">
            {stats?.map(s => (
              <div key={s.label} className="public-header-stat">
                <span className="public-header-stat-value">{s.value}</span>
                <span className="public-header-stat-label">{s.label}</span>
              </div>
            ))}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPageHero;
