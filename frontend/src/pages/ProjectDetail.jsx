import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL, fetchApi } from '../config';
import PublicPageHero from '../components/PublicPageHero';
import '../landing.css';
import '../public-page.css';
import '../markdown.css';

const ACCENT = '#DF0A20';

function MilestoneTimeline({ milestones }) {
    if (!milestones?.length) return null;

    return (
        <div>
            <div className="hub-eyebrow" style={{ color: ACCENT, marginBottom: '1.25rem' }}>Milestones</div>
            <div className="project-timeline">
                {milestones.map((m, i) => (
                    <div key={m.id} className="project-timeline-item">
                        <div className="project-timeline-rail">
                            <div className="project-timeline-dot" />
                            {i < milestones.length - 1 && <div className="project-timeline-line" />}
                        </div>
                        <div className="project-timeline-content">
                            {m.dateLabel && <div className="project-timeline-date">{m.dateLabel}</div>}
                            <div className="project-timeline-title">{m.title}</div>
                            {m.description && <p className="project-timeline-desc">{m.description}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetchApi(`${API_BASE_URL}/projects/${id}`);
                if (!res.ok) throw new Error('Project not found');
                setProject(await res.json());
            } catch (err) {
                console.error('Error fetching project:', err);
                setError('Failed to load this project.');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading project...</div>;
    }

    if (error || !project) {
        return (
            <div className="public-page-wrap" style={{ textAlign: 'center', padding: '4rem 2.5rem' }}>
                <Briefcase size={40} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--primary-red)', marginBottom: '1.5rem' }}>{error || 'Project not found.'}</p>
                <button onClick={() => navigate(-1)} className="btn btn-ghost">Back</button>
            </div>
        );
    }

    return (
        <div className="public-page-wrap">
            <PublicPageHero
                icon={Briefcase}
                eyebrow={project.partner || 'PROJECT'}
                title={project.name}
                subtitle={project.description}
                accent={ACCENT}
                actions={project.url && (
                    <a
                        href={project.url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary" style={{ textDecoration: 'none' }}
                    >
                        Visit Link <ArrowUpRight size={15} />
                    </a>
                )}
            />

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '820px', margin: '0 auto' }}>
                {project.hasLogo && (
                    <img
                        src={`${API_BASE_URL}/projects/${project.id}/logo`}
                        alt={project.name}
                        style={{ maxHeight: '64px', maxWidth: '220px', objectFit: 'contain', marginBottom: '2rem' }}
                    />
                )}
                {project.content ? (
                    <div className="markdown-body" style={{ lineHeight: 1.7, color: 'var(--text-primary)' }}>
                        <ReactMarkdown>{project.content}</ReactMarkdown>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                )}
            </div>

            {project.milestones?.length > 0 && (
                <div className="glass-panel" style={{ padding: '2.5rem 3rem', maxWidth: '820px', margin: '2rem auto 0' }}>
                    <MilestoneTimeline milestones={project.milestones} />
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
