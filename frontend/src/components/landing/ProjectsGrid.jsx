import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../../config';

function ProjectLogo({ project, size = 30 }) {
  const [errored, setErrored] = useState(false);
  if (project.hasLogo && !errored) {
    return (
      <img
        src={`${API_BASE_URL}/projects/${project.id}/logo`}
        alt={project.name}
        onError={() => setErrored(true)}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      />
    );
  }
  return <Briefcase size={size} color="var(--primary-red)" strokeWidth={2} />;
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="hub-panel"
        style={{
          padding: '1.75rem', display: 'flex', flexDirection: 'column',
          gap: '1rem', height: '100%', boxSizing: 'border-box',
        }}
      >
        <div style={{
          width: '52px', height: '52px', borderRadius: 'var(--radius-md)', flexShrink: 0,
          background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ProjectLogo project={project} />
        </div>

        <div style={{ flex: 1 }}>
          {project.partner && (
            <div className="hub-eyebrow" style={{ color: 'var(--primary-red)', marginBottom: '0.4rem' }}>
              {project.partner}
            </div>
          )}
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {project.name}
          </h3>
          {project.description && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.55 }}>
              {project.description}
            </p>
          )}
        </div>

        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-red)',
            marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)',
          }}
        >
          View Details <ArrowUpRight size={13} />
        </span>
      </div>
    </Link>
  );
}

const ProjectsGrid = ({ projects, loading }) => {
  if (loading) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Loading projects…
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="hub-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No projects published yet.
      </div>
    );
  }

  return (
    <div className="landing-section-grid">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectsGrid;
