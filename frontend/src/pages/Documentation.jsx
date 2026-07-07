import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { FileText, Search, BookOpen, ShieldCheck, Activity, Map } from 'lucide-react';

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

    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'sop': return <Activity size={18} color="var(--teal-600)" />;
            case 'policy': return <ShieldCheck size={18} color="var(--red-600)" />;
            case 'manual': return <BookOpen size={18} color="var(--blue-600)" />;
            case 'strategy': return <Map size={18} color="var(--amber-600)" />;
            default: return <FileText size={18} color="var(--slate-500)" />;
        }
    };

    return (
        <div className="page-content">
            <div className="card-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--amber-500), var(--orange-600))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, letterSpacing: '-0.02em' }}>Documentation & SOPs</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Browse standard operating procedures, manuals, and policies.</p>
                    </div>
                </div>
                {user?.role === 'admin' && (
                    <button onClick={() => navigate('/documentation/add')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} /> Add New SOP
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search documentation..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '2.75rem', width: '100%', height: '42px' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '100px',
                                border: '1px solid',
                                borderColor: selectedCategory === cat ? 'var(--amber-500)' : 'var(--border-color)',
                                background: selectedCategory === cat ? 'var(--amber-500)' : 'transparent',
                                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                                fontWeight: '500',
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
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {filteredDocs.map(doc => (
                        <div 
                            key={doc.Id} 
                            onClick={() => navigate(`/documentation/${doc.Id}`)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)';
                                e.currentTarget.style.borderColor = 'var(--amber-300)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                    padding: '0.25rem 0.75rem', borderRadius: '100px', 
                                    background: 'var(--background)', border: '1px solid var(--border-color)',
                                    fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)'
                                }}>
                                    {getCategoryIcon(doc.Category)}
                                    {doc.Category}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(doc.UpdatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {doc.Title}
                            </h3>
                            
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--amber-600)', fontSize: '0.875rem', fontWeight: '500' }}>
                                Read Document &rarr;
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Documentation;
