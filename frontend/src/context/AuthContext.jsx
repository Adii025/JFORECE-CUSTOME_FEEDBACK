import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fb_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fb_auth_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const res = await api.login(usernameOrEmail, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('fb_current_user', JSON.stringify(res.user));
      localStorage.setItem('fb_auth_token', res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, fullName, role) => {
    setLoading(true);
    try {
      const res = await api.register(username, email, password, fullName, role);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('fb_current_user', JSON.stringify(res.user));
      localStorage.setItem('fb_auth_token', res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fb_current_user');
    localStorage.removeItem('fb_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
