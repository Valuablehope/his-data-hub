import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import '../landing.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!loading && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const fieldLabelStyle = {
        fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
    };
    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
        borderRadius: '8px', border: '1px solid var(--border-color)',
        fontSize: '0.9375rem', color: 'var(--text-primary)',
        outline: 'none', transition: 'all 0.2s',
    };

    return (
        <div className="hub-grid-bg" style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', overflow: 'hidden',
        }}>
            {/* Brand header */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '2.25rem' }}>
                <div className="hub-status-pill" style={{ marginBottom: '1.5rem' }}>
                    <span className="hub-status-dot" />
                    System Operational
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                        HIS Data Hub
                    </span>
                </div>
                <div style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: '#DF0A20', fontFamily: 'var(--font-mono)',
                }}>
                    Health Information System · Lebanon Mission
                </div>
            </div>

            {/* Auth card */}
            <div style={{
                position: 'relative', zIndex: 1,
                background: '#fff',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary-red), #C1091C)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', color: 'white', boxShadow: '0 4px 16px var(--primary-red-glow)'
                    }}>
                        <Lock size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--slate-800)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        Team Sign In
                    </h2>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                        Enter your credentials to access the Hub
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem', borderRadius: '8px', background: 'rgba(223, 10, 32, 0.06)',
                            color: 'var(--primary-red)', fontSize: '0.875rem', textAlign: 'center',
                            border: '1px solid rgba(223, 10, 32, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={fieldLabelStyle}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. jane_doe"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-red)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={fieldLabelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-red)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{
                            width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 600,
                            boxShadow: '0 4px 14px var(--primary-red-glow)',
                            cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? 'Signing in…' : 'Sign In'}
                        {!isLoading && <ArrowRight size={16} />}
                    </button>
                </form>
            </div>

            <Link
                to="/"
                style={{
                    position: 'relative', zIndex: 1, marginTop: '2rem',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            >
                <ArrowLeft size={13} />
                Back to HIS Data Hub
            </Link>
        </div>
    );
};

export default Login;
