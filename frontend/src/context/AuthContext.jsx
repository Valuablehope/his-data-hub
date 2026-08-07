import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL, fetchApi } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('his_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                // Decode token to get user info (in a real app, you might validate it with the backend)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    // Stale token from a previous session
                    logout();
                } else {
                    setUser(payload);
                }
            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        const res = await fetchApi(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!res.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await res.json();
        localStorage.setItem('his_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('his_token');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!user && !!token;
    const role = user?.role ?? null;
    const hasRole = (...roles) => {
        if (!role) return false;
        const normalized = roles.map(r => r.toLowerCase());
        return normalized.includes(String(role).toLowerCase());
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated, role, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};
