import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import ReactMarkdown from 'react-markdown';
import { Download, Edit, Trash2, FileText } from 'lucide-react';
import PublicPageHero from '../components/PublicPageHero';
import '../landing.css';
import '../public-page.css';
import '../markdown.css';

const ACCENT = '#DF0A20';

const DocumentViewer = () => {
    const { id } = useParams();
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [doc, setDoc] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                // Fetch metadata
                const metaRes = await fetchApi(`${API_BASE_URL}/docs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (metaRes.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                if (metaRes.ok) {
                    const allDocs = await metaRes.json();
                    const currentMeta = allDocs.find(d => d.Id.toString() === id);
                    if (currentMeta) setMetadata(currentMeta);
                }

                // Fetch content
                const contentRes = await fetchApi(`${API_BASE_URL}/docs/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!contentRes.ok) throw new Error('Document not found');

                const data = await contentRes.json();
                setDoc(data);
            } catch (err) {
                console.error("Error fetching document:", err);
                setError('Failed to load document content.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [id, token, navigate, logout]);

    const handleDownload = () => {
        if (!doc) return;
        const blob = new Blob([doc.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metadata?.Title || `Document_${id}`}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) return;

        try {
            const res = await fetchApi(`${API_BASE_URL}/docs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                navigate('/sops');
            } else {
                const data = await res.json();
                alert(`Error deleting: ${data.error}`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete document.");
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading document...</div>;
    }

    if (error || !doc) {
        return (
            <div className="public-page-wrap" style={{ textAlign: 'center', padding: '4rem 2.5rem' }}>
                <FileText size={40} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--primary-red)', marginBottom: '1.5rem' }}>{error || 'Document not found.'}</p>
                <button onClick={() => navigate(-1)} className="btn btn-ghost">Back</button>
            </div>
        );
    }

    return (
        <div className="public-page-wrap">
            <PublicPageHero
                icon={FileText}
                eyebrow={metadata?.Category || 'DOCUMENT'}
                title={metadata?.Title || doc.title || 'Untitled Document'}
                subtitle={metadata ? `Last updated ${new Date(metadata.UpdatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}` : undefined}
                accent={ACCENT}
                actions={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {user?.role === 'admin' && (
                            <>
                                <button onClick={() => navigate(`/sops/edit/${id}`)} className="btn btn-ghost">
                                    <Edit size={15} /> Edit
                                </button>
                                <button onClick={handleDelete} className="btn btn-ghost" style={{ color: 'var(--red-600)' }}>
                                    <Trash2 size={15} /> Delete
                                </button>
                            </>
                        )}
                        <button onClick={handleDownload} className="btn btn-primary">
                            <Download size={15} /> Download
                        </button>
                    </div>
                }
            />

            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '820px', margin: '0 auto' }}>
                <div className="markdown-body" style={{ lineHeight: 1.7, color: 'var(--text-primary)' }}>
                    <ReactMarkdown>{doc.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
