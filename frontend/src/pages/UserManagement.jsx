import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, fetchApi } from '../config';
import { Users, Plus, Edit2, Trash2, Key, X, Check } from 'lucide-react';

const UserManagement = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null means adding new user
    
    // Form fields
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('viewer');
    const [isActive, setIsActive] = useState(true);

    // Password reset modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordUserId, setPasswordUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await fetchApi(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            if (!res.ok) {
                let errorMsg = 'Failed to fetch users';
                try {
                    const text = await res.text();
                    const errorData = JSON.parse(text);
                    if (errorData.error) errorMsg = errorData.error;
                    else if (text) errorMsg = text;
                } catch (e) {}
                throw new Error(errorMsg);
            }
            const data = await res.json();
            setUsersList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [token, user]);

    const openAddModal = () => {
        setEditingUser(null);
        setUsername('');
        setDisplayName('');
        setPassword('');
        setRole('viewer');
        setIsActive(true);
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setUsername(u.Username);
        setDisplayName(u.DisplayName || '');
        setPassword(''); // Not editing password here
        setRole(u.Role);
        setIsActive(u.IsActive);
        setError('');
        setIsModalOpen(true);
    };

    const openPasswordModal = (u) => {
        setPasswordUserId(u.Id);
        setNewPassword('');
        setError('');
        setIsPasswordModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const url = editingUser 
                ? `${API_BASE_URL}/users/${editingUser.Id}`
                : `${API_BASE_URL}/users`;
            const method = editingUser ? 'PUT' : 'POST';
            const body = editingUser 
                ? { username, displayName, role, isActive }
                : { username, displayName, password, role };

            const res = await fetchApi(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                let errorMsg = 'Failed to save user';
                try {
                    const text = await res.text();
                    const errorData = JSON.parse(text);
                    if (errorData.error) errorMsg = errorData.error;
                    else if (text) errorMsg = text;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetchApi(`${API_BASE_URL}/users/${passwordUserId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });

            if (!res.ok) {
                let errorMsg = 'Failed to reset password';
                try {
                    const text = await res.text();
                    const errorData = JSON.parse(text);
                    if (errorData.error) errorMsg = errorData.error;
                    else if (text) errorMsg = text;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            setIsPasswordModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This will also remove their availability records.')) return;
        try {
            const res = await fetchApi(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete user');
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    if (user?.role !== 'admin') {
        return <div className="page-content">Access Denied. Admin only.</div>;
    }

    return (
        <div className="page-content">
            <div className="card-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, letterSpacing: '-0.02em' }}>User Management</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>Manage portal access and roles</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="btn btn-primary" style={{ background: 'var(--teal-600)' }}>
                    <Plus size={16} /> Add User
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '1.5rem' }}>Username</th>
                            <th>Display Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading users…</td></tr>
                        ) : error ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-red)', fontSize: '0.875rem' }}>{error}</td></tr>
                        ) : usersList.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No users found.</td></tr>
                        ) : usersList.map(u => (
                            <tr key={u.Id}>
                                <td className="primary-cell" style={{ paddingLeft: '1.5rem' }}>{u.Username}</td>
                                <td>{u.DisplayName || u.Username}</td>
                                <td>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600',
                                        background: u.Role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                                        color: u.Role === 'admin' ? 'var(--red-600)' : 'var(--teal-700)'
                                    }}>
                                        {u.Role}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600',
                                        background: u.IsActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                        color: u.IsActive ? 'var(--green-600)' : 'var(--slate-500)'
                                    }}>
                                        {u.IsActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(u.CreatedAt).toLocaleDateString()}</td>
                                <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => openPasswordModal(u)} className="icon-btn" title="Reset Password" style={{ color: 'var(--amber-500)' }}><Key size={16} /></button>
                                        <button onClick={() => openEditModal(u)} className="icon-btn" title="Edit User" style={{ color: 'var(--blue-500)' }}><Edit2 size={16} /></button>
                                        {u.Id !== user.id && (
                                            <button onClick={() => handleDeleteUser(u.Id)} className="icon-btn" title="Delete User" style={{ color: 'var(--red-500)' }}><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Edit/Add Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {error && <div style={{ color: 'var(--red-500)', fontSize: '0.875rem' }}>{error}</div>}
                            
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="form-control" required value={username} onChange={e => setUsername(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Display Name</label>
                                <input type="text" className="form-control" placeholder="Leave blank to use username" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                            </div>

                            {!editingUser && (
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" className="form-control" required value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Role</label>
                                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="admin">Admin</option>
                                    <option value="HIS_TEAM">HIS Team</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>

                            {editingUser && (
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                    <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                    <label htmlFor="isActive" style={{ margin: 0 }}>Active User</label>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--teal-600)' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {isPasswordModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Reset Password</h3>
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {error && <div style={{ color: 'var(--red-500)', fontSize: '0.875rem' }}>{error}</div>}
                            
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" className="form-control" required minLength="6" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--amber-500)', color: '#fff' }}>Reset Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
