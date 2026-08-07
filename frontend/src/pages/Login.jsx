import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

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

    return (
        <div className="login-container" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 160px)',
            background: 'radial-gradient(circle at 50% -20%, rgba(13, 148, 136, 0.1), transparent 50%)'
        }}>
            <div style={{
                background: '#fff',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', color: 'white', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                    }}>
                        <Lock size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--slate-800)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        HIS Team Access
                    </h2>
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                        Sign in to manage your availability
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--red-600)', fontSize: '0.875rem', textAlign: 'center',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '8px', border: '1px solid var(--border)',
                                fontSize: '0.9375rem', color: 'var(--text-primary)',
                                outline: 'none', transition: 'all 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--teal-500)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}>
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '8px', border: '1px solid var(--border)',
                                fontSize: '0.9375rem', color: 'var(--text-primary)',
                                outline: 'none', transition: 'all 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--teal-500)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '0.875rem',
                            background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
                            color: 'white', borderRadius: '8px', border: 'none',
                            fontWeight: '600', fontSize: '0.9375rem', cursor: isLoading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)', transition: 'all 0.2s',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        {!isLoading && <ArrowRight size={16} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
