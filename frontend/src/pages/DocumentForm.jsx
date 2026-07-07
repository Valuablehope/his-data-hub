import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { ArrowLeft, Save } from 'lucide-react';

const DocumentForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        category: 'SOP',
        content: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/documentation');
            return;
        }

        if (isEdit) {
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
                        if (currentMeta) {
                            setFormData(prev => ({ ...prev, title: currentMeta.Title, category: currentMeta.Category }));
                        }
                    }

                    // Fetch content
                    const contentRes = await fetchApi(`${API_BASE_URL}/docs/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (contentRes.ok) {
                        const data = await contentRes.json();
                        setFormData(prev => ({ ...prev, content: data.content }));
                    } else {
                        throw new Error('Document not found');
                    }
                } catch (err) {
                    console.error("Error fetching document:", err);
                    setError('Failed to load document for editing.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDoc();
        }
    }, [id, isEdit, user, navigate, token, logout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const url = isEdit ? `${API_BASE_URL}/docs/${id}` : `${API_BASE_URL}/docs`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetchApi(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                navigate('/documentation');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save document');
            }
        } catch (err) {
            console.error("Save error:", err);
            setError("Network error. Failed to save document.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="page-content" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;
    }

    return (
        <div className="page-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/documentation')} className="btn btn-secondary" style={{ background: 'white' }} type="button">
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{isEdit ? 'Edit Document' : 'Add New Document'}</h2>
                <div style={{ width: '80px' }}></div> {/* Spacer for centering */}
            </div>

            <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                {error && <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red-600)', borderRadius: '8px' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Title</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.title} 
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Category</label>
                            <select 
                                className="form-control"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="SOP">SOP</option>
                                <option value="Manual">Manual</option>
                                <option value="Policy">Policy</option>
                                <option value="Strategy">Strategy</option>
                                <option value="Guide">Guide</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            Markdown Content
                        </label>
                        <textarea 
                            className="form-control"
                            style={{ minHeight: '400px', fontFamily: 'monospace', lineHeight: 1.5 }}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                            placeholder="# Heading 1&#10;## Heading 2&#10;Some text here..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate('/documentation')} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentForm;
