import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { Briefcase, Plus, Edit2, Trash2, Camera, Milestone, X } from 'lucide-react';

function LogoThumb({ project, size = 32, nonce }) {
    if (project.LogoFileName) {
        return (
            <img
                src={`${API_BASE_URL}/projects/${project.Id}/logo?v=${nonce}`}
                alt={project.Name}
                style={{ width: size, height: size, borderRadius: '8px', objectFit: 'contain', flexShrink: 0, background: 'rgba(0,0,0,0.03)', padding: '4px' }}
            />
        );
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)',
        }}>
            <Briefcase size={size * 0.5} />
        </div>
    );
}

const emptyMilestoneForm = { title: '', description: '', dateLabel: '' };

const Projects = () => {
    const { token } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [logoNonce, setLogoNonce] = useState(0);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [partner, setPartner] = useState('');
    const [url, setUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Milestones — only relevant once a project exists (same "save first"
    // pattern as the logo upload below).
    const [milestones, setMilestones] = useState([]);
    const [milestonesLoading, setMilestonesLoading] = useState(false);
    const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm);
    const [editingMilestoneId, setEditingMilestoneId] = useState(null);
    const [milestoneError, setMilestoneError] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await fetchApi(`${API_BASE_URL}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch projects');
            setProjects(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [token]);

    const fetchMilestones = async (projectId) => {
        setMilestonesLoading(true);
        try {
            const res = await fetchApi(`${API_BASE_URL}/projects/${projectId}/milestones`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch milestones');
            setMilestones(await res.json());
        } catch (err) {
            setMilestoneError(err.message);
        } finally {
            setMilestonesLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingProject(null);
        setName('');
        setDescription('');
        setContent('');
        setPartner('');
        setUrl('');
        setSortOrder(projects.length);
        setIsActive(true);
        setError('');
        setMilestones([]);
        setMilestoneForm(emptyMilestoneForm);
        setEditingMilestoneId(null);
        setMilestoneError('');
        setIsModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditingProject(p);
        setName(p.Name);
        setDescription(p.Description || '');
        setContent(p.Content || '');
        setPartner(p.Partner || '');
        setUrl(p.Url || '');
        setSortOrder(p.SortOrder);
        setIsActive(p.IsActive);
        setError('');
        setMilestoneForm(emptyMilestoneForm);
        setEditingMilestoneId(null);
        setMilestoneError('');
        setIsModalOpen(true);
        fetchMilestones(p.Id);
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !editingProject) return;

        setLogoUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await fetchApi(`${API_BASE_URL}/projects/${editingProject.Id}/logo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to upload logo');
            }
            const data = await res.json();
            setEditingProject(prev => ({ ...prev, LogoFileName: data.fileName }));
            setLogoNonce(Date.now());
            fetchProjects();
        } catch (err) {
            alert(err.message);
        } finally {
            setLogoUploading(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const isEdit = !!editingProject;
            const reqUrl = isEdit
                ? `${API_BASE_URL}/projects/${editingProject.Id}`
                : `${API_BASE_URL}/projects`;
            const res = await fetchApi(reqUrl, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, description, content, partner, url, sortOrder: Number(sortOrder), isActive }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to save project');
            }
            setIsModalOpen(false);
            fetchProjects();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project? It will disappear from the public landing page immediately.')) return;
        try {
            const res = await fetchApi(`${API_BASE_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete project');
            fetchProjects();
        } catch (err) {
            alert(err.message);
        }
    };

    const startAddMilestone = () => {
        setEditingMilestoneId(null);
        setMilestoneForm(emptyMilestoneForm);
        setMilestoneError('');
    };

    const startEditMilestone = (m) => {
        setEditingMilestoneId(m.Id);
        setMilestoneForm({ title: m.Title, description: m.Description || '', dateLabel: m.DateLabel || '' });
        setMilestoneError('');
    };

    const handleMilestoneSave = async (e) => {
        e.preventDefault();
        setMilestoneError('');
        try {
            const isEdit = !!editingMilestoneId;
            const reqUrl = isEdit
                ? `${API_BASE_URL}/projects/${editingProject.Id}/milestones/${editingMilestoneId}`
                : `${API_BASE_URL}/projects/${editingProject.Id}/milestones`;
            const res = await fetchApi(reqUrl, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: milestoneForm.title,
                    description: milestoneForm.description,
                    dateLabel: milestoneForm.dateLabel,
                    sortOrder: isEdit ? undefined : milestones.length,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to save milestone');
            }
            setMilestoneForm(emptyMilestoneForm);
            setEditingMilestoneId(null);
            fetchMilestones(editingProject.Id);
        } catch (err) {
            setMilestoneError(err.message);
        }
    };

    const handleMilestoneDelete = async (milestoneId) => {
        if (!window.confirm('Delete this milestone?')) return;
        try {
            const res = await fetchApi(`${API_BASE_URL}/projects/${editingProject.Id}/milestones/${milestoneId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete milestone');
            fetchMilestones(editingProject.Id);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="page-content">
            <div className="card-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary-red), var(--primary-red-darker))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, letterSpacing: '-0.02em' }}>Projects</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Manage the projects & national health system contributions shown on the public landing page</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="btn btn-primary" style={{ background: 'var(--primary-red)' }}>
                    <Plus size={16} /> Add Project
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '1.5rem' }}>Logo</th>
                            <th>Name</th>
                            <th>Partner</th>
                            <th>Sort Order</th>
                            <th>Status</th>
                            <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading projects…</td></tr>
                        ) : error ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-red)', fontSize: '0.875rem' }}>{error}</td></tr>
                        ) : projects.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No projects yet.</td></tr>
                        ) : projects.map(p => (
                            <tr key={p.Id}>
                                <td style={{ paddingLeft: '1.5rem' }}><LogoThumb project={p} nonce={logoNonce} /></td>
                                <td className="primary-cell">{p.Name}</td>
                                <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                    {p.Partner || '—'}
                                </td>
                                <td>{p.SortOrder}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600',
                                        background: p.IsActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                        color: p.IsActive ? 'var(--green-600)' : 'var(--slate-500)'
                                    }}>
                                        {p.IsActive ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => openEditModal(p)} className="icon-btn" title="Edit" style={{ color: 'var(--blue-500)' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(p.Id)} className="icon-btn" title="Delete" style={{ color: 'var(--red-500)' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem 1rem' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingProject ? 'Edit Project' : 'Add Project'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {error && <div style={{ color: 'var(--red-500)', fontSize: '0.875rem' }}>{error}</div>}

                            {editingProject && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <LogoThumb project={editingProject} size={56} nonce={logoNonce} />
                                    <div>
                                        <input
                                            type="file"
                                            ref={logoInputRef}
                                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                            style={{ display: 'none' }}
                                            onChange={handleLogoChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => logoInputRef.current?.click()}
                                            disabled={logoUploading}
                                            style={{ fontSize: '0.8125rem' }}
                                        >
                                            <Camera size={14} /> {logoUploading ? 'Uploading…' : 'Change Logo'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!editingProject && (
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    Save the project first, then upload its logo and add milestones from the edit screen.
                                </div>
                            )}

                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" className="form-control" required placeholder="e.g. National EPI Data Integration" value={name} onChange={e => setName(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Short Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(shown on the landing page card)</span></label>
                                <textarea className="form-control" rows={2} placeholder="One or two sentences about the contribution" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Full Details <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(shown on the project's detail page, supports Markdown)</span></label>
                                <textarea className="form-control" rows={6} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} placeholder="## Background&#10;Full write-up of the project..." value={content} onChange={e => setContent(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Partner <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                                <input type="text" className="form-control" placeholder="e.g. Ministry of Public Health" value={partner} onChange={e => setPartner(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Link <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional, shown on the detail page)</span></label>
                                <input type="text" className="form-control" placeholder="https://... (external reference)" value={url} onChange={e => setUrl(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Sort Order</label>
                                <input type="number" className="form-control" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
                            </div>

                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <label htmlFor="isActive" style={{ margin: 0 }}>Show on public landing page</label>
                            </div>

                            {editingProject && (
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                        <Milestone size={15} /> Milestones
                                    </label>

                                    {milestoneError && <div style={{ color: 'var(--red-500)', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{milestoneError}</div>}

                                    {milestonesLoading ? (
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading milestones…</div>
                                    ) : milestones.length === 0 ? (
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>No milestones yet.</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            {milestones.map(m => (
                                                <div key={m.Id} style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                                    padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.02)',
                                                }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            {m.DateLabel && (
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-red)' }}>{m.DateLabel}</span>
                                                            )}
                                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{m.Title}</span>
                                                        </div>
                                                        {m.Description && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{m.Description}</div>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => startEditMilestone(m)} className="icon-btn" title="Edit" style={{ color: 'var(--blue-500)', width: '28px', height: '28px' }}><Edit2 size={13} /></button>
                                                    <button type="button" onClick={() => handleMilestoneDelete(m.Id)} className="icon-btn" title="Delete" style={{ color: 'var(--red-500)', width: '28px', height: '28px' }}><Trash2 size={13} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text" className="form-control" placeholder="Date/Phase (e.g. March 2026)"
                                                style={{ flex: '0 0 45%', fontSize: '0.8125rem' }}
                                                value={milestoneForm.dateLabel}
                                                onChange={e => setMilestoneForm(f => ({ ...f, dateLabel: e.target.value }))}
                                            />
                                            <input
                                                type="text" className="form-control" placeholder="Milestone title"
                                                style={{ flex: 1, fontSize: '0.8125rem' }}
                                                value={milestoneForm.title}
                                                onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
                                            />
                                        </div>
                                        <textarea
                                            className="form-control" rows={2} placeholder="Description (optional)"
                                            style={{ fontSize: '0.8125rem' }}
                                            value={milestoneForm.description}
                                            onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            {editingMilestoneId && (
                                                <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={startAddMilestone}>
                                                    <X size={13} /> Cancel
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                style={{ fontSize: '0.8125rem' }}
                                                disabled={!milestoneForm.title}
                                                onClick={handleMilestoneSave}
                                            >
                                                <Plus size={13} /> {editingMilestoneId ? 'Update Milestone' : 'Add Milestone'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--primary-red)' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
