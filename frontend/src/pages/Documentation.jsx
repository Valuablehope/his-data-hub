import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { FileText, Search, BookOpen, ShieldCheck, Activity, Map, ArrowUpRight, Plus } from 'lucide-react';
import PublicPageHero from '../components/PublicPageHero';
import '../landing.css';
import '../public-page.css';

const ACCENT = '#6366f1';

const CATEGORY_META = {
    sop: { icon: Activity, color: '#14b8a6' },
    policy: { icon: ShieldCheck, color: '#E3000F' },
    manual: { icon: BookOpen, color: '#3b82f6' },
    strategy: { icon: Map, color: '#f59e0b' },
};

function getCategoryMeta(category) {
    return CATEGORY_META[category?.toLowerCase()] || { icon: FileText, color: '#64748b' };
}

const Documentation = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await fetchApi(`${API_BASE_URL}/docs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                if (!res.ok) throw new Error('Failed to fetch documents');

                const data = await res.json();
                setDocs(data);
            } catch (err) {
                console.error("Error fetching docs:", err);
                setError('Failed to load documentation.');
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [token, navigate, logout]);

    const categories = ['All', ...new Set(docs.map(d => d.Category).filter(Boolean))];

    const filteredDocs = docs.filter(doc => {
        const matchesSearch = doc.Title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || doc.Category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="public-page-wrap">
            <PublicPageHero
                icon={FileText}
                eyebrow="SOP LIBRARY"
                title="Standard Operating Procedures"
                subtitle="Policies, manuals, and field guidance for the HIS Team — open to browse, no login required."
                accent={ACCENT}
                stats={[
                    { value: docs.length, label: 'Documents' },
                    { value: Math.max(categories.length - 1, 0), label: 'Categories' },
                ]}
                actions={user?.role === 'admin' && (
                    <button
                        onClick={() => navigate('/sops/add')}
                        className="btn btn-primary"
                    >
                        <Plus size={16} /> Add New SOP
                    </button>
                )}
            />

            <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                            style={{ paddingLeft: '2.75rem', width: '100%', height: '46px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '0.55rem 1.1rem',
                                    borderRadius: '100px',
                                    border: '1px solid',
                                    borderColor: selectedCategory === cat ? ACCENT : 'var(--border-color)',
                                    background: selectedCategory === cat ? ACCENT : 'transparent',
                                    color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading documents...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary-red)' }}>{error}</div>
                ) : filteredDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p>No documents found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="public-card-grid">
                        {filteredDocs.map(doc => {
                            const meta = getCategoryMeta(doc.Category);
                            const Icon = meta.icon;
                            return (
                                <div
                                    key={doc.Id}
                                    className="hub-panel public-card"
                                    style={{ '--hub-accent': meta.color }}
                                    onClick={() => navigate(`/sops/${doc.Id}`)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '10px',
                                            background: `${meta.color}18`, color: meta.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: `1px solid ${meta.color}30`, flexShrink: 0,
                                        }}>
                                            <Icon size={18} strokeWidth={2.25} />
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                            {new Date(doc.UpdatedAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="hub-eyebrow" style={{ color: meta.color, marginBottom: '0.4rem' }}>{doc.Category}</div>
                                        <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                            {doc.Title}
                                        </h3>
                                    </div>

                                    <div className="public-card-footer">
                                        <span className="public-card-cta">
                                            Read Document <ArrowUpRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Documentation;
