import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ChevronDown } from 'lucide-react';
import NetworkDiagram from './NetworkDiagram';

const Hero = ({ onExploreClick }) => {
  return (
    <section
      className="landing-hero"
      style={{
        padding: '9rem 2rem 4rem', color: '#fff', position: 'relative', overflow: 'hidden',
        marginTop: 'calc(var(--nav-clearance) * -1)',
      }}
    >
      <span className="landing-hero-reticle landing-hero-reticle--tl" />
      <span className="landing-hero-reticle landing-hero-reticle--tr" />

      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="hub-status-pill" style={{ marginBottom: '1.5rem' }}>
          <span className="hub-status-dot" />
          System Operational
        </div>

        <div style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#DF0A20', fontFamily: 'var(--font-mono)', marginBottom: '1.25rem',
        }}>
          Health Information System · Lebanon Mission
        </div>

        <h1 className="landing-hero-headline" style={{
          fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0,
        }}>
          HIS Data Hub<span className="landing-hero-cursor" />
        </h1>

        {/* DRAFT / PLACEHOLDER COPY — no public mission statement exists yet; replace with
            reviewed copy before this page is shared outside the team. */}
        <p style={{
          fontSize: '1.125rem', color: '#cbd5e1', maxWidth: '640px', margin: '1.5rem auto 0',
          lineHeight: 1.6, fontWeight: 400,
        }}>
          One data layer connecting the Coordination Office with the Saida and Tripoli field bases —
          SOPs, data flows, facilities, and files, kept in sync and routed to the people who need them.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.25rem' }}>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{
              padding: '0.8rem 1.5rem', fontSize: '0.9375rem', textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(223,10,32,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <LogIn size={16} />
            HIS Login
          </Link>
          <button
            onClick={onExploreClick}
            className="btn"
            style={{
              padding: '0.8rem 1.5rem', fontSize: '0.9375rem', color: '#fff',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
              cursor: 'pointer', transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Explore the Hub
            <ChevronDown size={16} className="landing-hero-chevron" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '820px', margin: '3.5rem auto 0', position: 'relative', zIndex: 1 }}>
        <div className="landing-hero-visual">
          <span className="landing-hero-visual-caption">Fig. 01 — Data Topology</span>
          <NetworkDiagram />
        </div>
      </div>
    </section>
  );
};

export default Hero;
