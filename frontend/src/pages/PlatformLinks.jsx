import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { Image, Plus, Edit2, Trash2, Camera, ExternalLink } from 'lucide-react';

function LogoThumb({ link, size = 32, nonce }) {
    if (link.LogoFileName) {
        return (
            <img
                src={`${API_BASE_URL}/platform-links/${link.Id}/logo?v=${nonce}`}
                alt={link.Name}
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
            <Image size={size * 0.5} />
        </div>
    );
}

const PlatformLinks = () => {
    const { token } = useContext(AuthContext);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [logoNonce, setLogoNonce] = useState(0);
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);

    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const fetchLinks = async () => {
        try {
            const res = await fetchApi(`${API_BASE_URL}/platform-links`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch platform links');
            setLinks(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [token]);

    const openAddModal = () => {
        setEditingLink(null);
        setName('');
        setUrl('');
        setSortOrder(links.length);
        setIsActive(true);
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (l) => {
        setEditingLink(l);
        setName(l.Name);
        setUrl(l.Url);
        setSortOrder(l.SortOrder);
        setIsActive(l.IsActive);
        setError('');
        setIsModalOpen(true);
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !editingLink) return;

        setLogoUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await fetchApi(`${API_BASE_URL}/platform-links/${editingLink.Id}/logo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to upload logo');
            }
            const data = await res.json();
            setEditingLink(prev => ({ ...prev, LogoFileName: data.fileName }));
            setLogoNonce(Date.now());
            fetchLinks();
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
            const isEdit = !!editingLink;
            const reqUrl = isEdit
                ? `${API_BASE_URL}/platform-links/${editingLink.Id}`
                : `${API_BASE_URL}/platform-links`;
            const res = await fetchApi(reqUrl, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, url, sortOrder: Number(sortOrder), isActive }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to save platform link');
            }
            setIsModalOpen(false);
            fetchLinks();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this platform link? It will disappear from the public footer immediately.')) return;
        try {
            const res = await fetchApi(`${API_BASE_URL}/platform-links/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete platform link');
            fetchLinks();
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
                        background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <Image size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, letterSpacing: '-0.02em' }}>Platform Links</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Manage the platform logos shown in the public site footer</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="btn btn-primary" style={{ background: 'var(--teal-600)' }}>
                    <Plus size={16} /> Add Link
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '1.5rem' }}>Logo</th>
                            <th>Name</th>
                            <th>URL</th>
                            <th>Sort Order</th>
                            <th>Status</th>
                            <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading platform links…</td></tr>
                        ) : error ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-red)', fontSize: '0.875rem' }}>{error}</td></tr>
                        ) : links.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No platform links yet.</td></tr>
                        ) : links.map(l => (
                            <tr key={l.Id}>
                                <td style={{ paddingLeft: '1.5rem' }}><LogoThumb link={l} nonce={logoNonce} /></td>
                                <td className="primary-cell">{l.Name}</td>
                                <td style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <a href={l.Url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-600)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        {l.Url} <ExternalLink size={12} />
                                    </a>
                                </td>
                                <td>{l.SortOrder}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600',
                                        background: l.IsActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                        color: l.IsActive ? 'var(--green-600)' : 'var(--slate-500)'
                                    }}>
                                        {l.IsActive ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => openEditModal(l)} className="icon-btn" title="Edit" style={{ color: 'var(--blue-500)' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(l.Id)} className="icon-btn" title="Delete" style={{ color: 'var(--red-500)' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem 1rem' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '420px', maxHeight: '100%', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingLink ? 'Edit Platform Link' : 'Add Platform Link'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {error && <div style={{ color: 'var(--red-500)', fontSize: '0.875rem' }}>{error}</div>}

                            {editingLink && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <LogoThumb link={editingLink} size={56} nonce={logoNonce} />
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
                            {!editingLink && (
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    Save the link first, then upload its logo from the edit screen.
                                </div>
                            )}

                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" className="form-control" required placeholder="e.g. TIXO Tickets" value={name} onChange={e => setName(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>URL</label>
                                <input type="text" className="form-control" required placeholder="https://... or /login for an internal page" value={url} onChange={e => setUrl(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Sort Order</label>
                                <input type="number" className="form-control" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
                            </div>

                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <label htmlFor="isActive" style={{ margin: 0 }}>Show in public footer</label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--teal-600)' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformLinks;
