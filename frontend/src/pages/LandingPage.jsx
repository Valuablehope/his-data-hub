import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL, fetchApi } from '../config';
import '../landing.css';
import Hero from '../components/landing/Hero';
import LiveIndicators from '../components/landing/LiveIndicators';
import ProgrammeAreas from '../components/landing/ProgrammeAreas';
import RecentActivity from '../components/landing/RecentActivity';
import TeamStructure from '../components/landing/TeamStructure';
import MeetTheTeam from '../components/landing/MeetTheTeam';
import AppsGrid from '../components/landing/AppsGrid';
import Footer from '../components/landing/Footer';

function SectionHeading({ index, label, title }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="hub-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--primary-red)' }}>[{index}]</span>
        {label}
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

const LandingPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const exploreRef = useRef(null);

  const loadLanding = useCallback(async () => {
    try {
      const res = await fetchApi(`${API_BASE_URL}/landing`);
      if (!res.ok) throw new Error('Failed to load landing data');
      setData(await res.json());
    } catch (err) {
      console.error('Error loading landing page data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLanding(); }, [loadLanding]);

  const scrollToExplore = () => exploreRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div>
      <Hero onExploreClick={scrollToExplore} />

      <div ref={exploreRef} style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem 0' }}>
        <div className="hub-eyebrow" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--primary-red)' }}>[00]</span> Live System Status
        </div>
        <LiveIndicators data={data} loading={loading} />
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem 0' }}>
        <SectionHeading index="01" label="Programme Areas" title="What We Support" />
        <ProgrammeAreas programmes={data?.programmes} loading={loading} />

        <div style={{ marginTop: '3rem' }}>
          <div className="hub-eyebrow" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Recent Activity
          </div>
          <RecentActivity items={data?.recentActivity} loading={loading} />
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem 0' }}>
        <SectionHeading index="02" label="Team Structure" title="Who We Are" />
        <TeamStructure />

        <div style={{ marginTop: '3rem' }}>
          <div className="hub-eyebrow" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Meet the Team
          </div>
          <MeetTheTeam members={data?.team?.members} loading={loading} />
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem 0' }}>
        <SectionHeading index="03" label="Explore the Hub" title="Applications" />
        <AppsGrid />
      </div>

      <div style={{ marginTop: '6rem' }}>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
