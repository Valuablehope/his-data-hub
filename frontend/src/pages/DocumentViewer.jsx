import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, FileText, Download, Edit, Trash2 } from 'lucide-react';

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
                navigate('/documentation');
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
        return <div className="page-content" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading document...</div>;
    }

    if (error || !doc) {
        return (
            <div className="page-content">
                <button onClick={() => navigate('/documentation')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
                    <ArrowLeft size={16} /> Back to Documentation
                </button>
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary-red)' }}>{error || 'Document not found.'}</div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/documentation')} className="btn btn-secondary" style={{ background: 'white' }}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {user?.role === 'admin' && (
                        <>
                            <button onClick={() => navigate(`/documentation/edit/${id}`)} className="btn btn-secondary" style={{ background: 'white', color: 'var(--blue-600)' }}>
                                <Edit size={16} /> Edit
                            </button>
                            <button onClick={handleDelete} className="btn btn-secondary" style={{ background: 'white', color: 'var(--red-600)' }}>
                                <Trash2 size={16} /> Delete
                            </button>
                        </>
                    )}
                    <button onClick={handleDownload} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                        <Download size={16} /> Download
                    </button>
                </div>
            </div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '3rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                {metadata && (
                    <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ 
                                padding: '0.25rem 0.75rem', borderRadius: '100px', 
                                background: 'rgba(217, 119, 6, 0.1)', color: 'var(--amber-700)',
                                fontSize: '0.75rem', fontWeight: '600'
                            }}>
                                {metadata.Category}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Last updated: {new Date(metadata.UpdatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}
                
                <div className="markdown-body" style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    <ReactMarkdown>{doc.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
